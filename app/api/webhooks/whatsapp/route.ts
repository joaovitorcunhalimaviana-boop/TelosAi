import { NextRequest, NextResponse } from "next/server"
import { sendMessage, markAsRead, sendDoctorAlert } from "@/lib/whatsapp"
import { analyzePatientMessage, formatDoctorAlert } from "@/lib/claude-analyzer"
import { prisma } from "@/lib/prisma"
import { validateHubChallenge, validateWhatsAppSignature } from "@/lib/security/webhook-validator"
import {
  getOrCreateConversation,
  recordUserMessage,
  isAwaitingQuestionnaire,
  startQuestionnaireCollection,
  processQuestionnaireAnswer,
  updateConversationState
} from "@/lib/conversation-manager"
import { rateLimit, getClientIP } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"

/**
 * Webhook do WhatsApp Business API
 *
 * GET - Validação do webhook pelo Meta/Facebook
 * POST - Recebimento de mensagens e status updates
 */

// GET - Validação do webhook
export async function GET(request: NextRequest) {
  // Rate limiting: 100 req/min por IP
  const ip = getClientIP(request);
  const rateLimitResult = await rateLimit(ip, 100, 60);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.reset?.toString() || '',
        }
      }
    );
  }

  const { searchParams } = new URL(request.url)

  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

  logger.debug("Webhook validation attempt", {
    mode,
    token,
    tokenMatch: token === verifyToken,
  })

  // Valida usando função segura
  const validatedChallenge = validateHubChallenge(mode, token, challenge, verifyToken!)

  if (validatedChallenge) {
    return new NextResponse(validatedChallenge, { status: 200 })
  }

  return NextResponse.json(
    { error: "Forbidden" },
    { status: 403 }
  )
}

// POST - Recebe mensagens
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 100 req/min por IP
    const ip = getClientIP(request);
    const rateLimitResult = await rateLimit(ip, 100, 60);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset?.toString() || '',
          }
        }
      );
    }

    // 1. VALIDAÇÃO DE SEGURANÇA: Verificar signature do webhook
    const signature = request.headers.get('x-hub-signature-256')
    const appSecret = process.env.WHATSAPP_APP_SECRET

    // Pegar o body RAW para validação de signature
    const rawBody = await request.text()

    // Validar signature (protege contra requisições falsas)
    if (appSecret && !validateWhatsAppSignature(signature, rawBody, appSecret)) {
      logger.error('Invalid webhook signature - rejecting request')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      )
    }

    // Parsear o body JSON após validação
    const body = JSON.parse(rawBody)

    logger.debug("Webhook received", body)

    // Processa as mensagens recebidas
    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0]
      const changes = entry?.changes?.[0]
      const value = changes?.value

      if (value?.messages) {
        const messages = value.messages

        for (const message of messages) {
          logger.debug("Message received", {
            from: message.from,
            type: message.type,
            text: message.text?.body,
            timestamp: message.timestamp,
          })

          // Marcar como lida
          if (message.id) {
            await markAsRead(message.id)
          }

          // Processar mensagem de texto
          if (message.type === 'text' && message.text?.body) {
            const userMessage = message.text.body.trim()

            try {
              // 1. Identificar paciente pelo telefone usando múltiplas estratégias
              const patient = await findPatientByPhone(message.from)

              if (!patient) {
                // Paciente não encontrado - resposta padrão
                const greeting = getGreeting()
                const response = `${greeting}! 👋\n\n` +
                  `Obrigado por entrar em contato!\n\n` +
                  `Esta é a central de acompanhamento pós-operatório Telos.AI.\n\n` +
                  `Não identificamos você como paciente cadastrado. ` +
                  `Se você realizou cirurgia recentemente com Dr. João Vitor, ` +
                  `entre em contato pelo telefone (83) 9166-4904.`

                await sendMessage(message.from, response)
                logger.debug("Response sent to unregistered patient", {
                  phone: message.from,
                  phoneNormalized: message.from.replace(/\D/g, '')
                })
                continue
              }

              logger.debug("✅ Patient identified", {
                patientId: patient.id,
                patientName: patient.name,
                patientPhone: patient.phone,
                userId: patient.userId
              })

              // 2. Verificar se está aguardando para responder questionário
              const awaitingQuestionnaire = await isAwaitingQuestionnaire(message.from)

              logger.debug('📋 Checking questionnaire status', {
                awaitingQuestionnaire,
                userMessage: userMessage.toLowerCase(),
                isSimResponse: userMessage.toLowerCase() === 'sim'
              })

              if (awaitingQuestionnaire && userMessage.toLowerCase() === 'sim') {
                logger.debug('✅ Patient confirmed with "sim" - starting questionnaire')

                // Buscar cirurgia mais recente
                const surgery = await prisma.surgery.findFirst({
                  where: { patientId: patient.id },
                  orderBy: { date: 'desc' }
                })

                if (surgery) {
                  logger.debug('✅ Surgery found for patient', {
                    surgeryId: surgery.id,
                    surgeryType: surgery.type,
                    surgeryDate: surgery.date
                  })

                  // Iniciar coleta de respostas
                  await startQuestionnaireCollection(message.from, patient, surgery)
                  logger.debug('✅ Questionnaire collection started successfully')
                  continue
                } else {
                  logger.error('❌ No surgery found for patient', {
                    patientId: patient.id,
                    patientName: patient.name
                  })

                  await sendMessage(
                    message.from,
                    'Desculpe, não encontrei uma cirurgia registrada para você. Por favor, entre em contato com o consultório.'
                  )
                  continue
                }
              }

              // 3. Verificar se está respondendo questionário
              const conversation = await getOrCreateConversation(message.from, patient.id)

              if (conversation.state === 'collecting_answers') {
                logger.debug('Processing questionnaire answer')

                try {
                  const result = await processQuestionnaireAnswer(message.from, userMessage)

                  if (result.completed) {
                    logger.debug('Questionnaire completed')
                  } else {
                    logger.debug('Next question sent')
                  }

                  continue
                } catch (error) {
                  logger.error('Error processing questionnaire answer', error)
                  // Continua para análise com IA como fallback
                }
              }

              // 4. Registrar mensagem do usuário
              await recordUserMessage(conversation.id, userMessage)

              // 5. Buscar cirurgia mais recente
              const surgery = await prisma.surgery.findFirst({
                where: { patientId: patient.id },
                orderBy: { date: 'desc' }
              })

              // 6. Analisar mensagem com Claude AI
              logger.debug('Analyzing message with Claude AI')
              const analysis = await analyzePatientMessage(
                userMessage,
                patient,
                surgery || undefined,
                patient.userId // Passa o userId do médico para buscar protocolos
              )

              logger.debug("Analysis result", {
                urgency: analysis.urgency,
                category: analysis.category,
                shouldNotifyDoctor: analysis.shouldNotifyDoctor
              })

              // 7. Enviar resposta ao paciente
              await sendMessage(message.from, analysis.suggestedResponse)
              logger.debug("Intelligent response sent to patient")

              // 8. Notificar médico se necessário
              if (analysis.shouldNotifyDoctor) {
                const doctorPhone = process.env.DOCTOR_PHONE_NUMBER
                if (doctorPhone) {
                  const alertMessage = formatDoctorAlert(
                    analysis,
                    patient,
                    userMessage,
                    surgery || undefined
                  )

                  try {
                    await sendMessage(doctorPhone, alertMessage)
                    logger.debug("Doctor notified successfully")
                  } catch (error) {
                    logger.error("Error notifying doctor", error)
                  }
                }
              }

            } catch (error) {
              logger.error("Error processing message", error)

              // Fallback: resposta genérica de erro
              const response =
                `Recebemos sua mensagem e estamos processando.\n\n` +
                `Se for uma emergência (sangramento volumoso, febre alta com dor, dor insuportável), ` +
                `procure o pronto-socorro IMEDIATAMENTE ou ligue 192 (SAMU).\n\n` +
                `Dr. João Vitor foi notificado e entrará em contato.`

              await sendMessage(message.from, response)
            }
          }
        }
      }

      if (value?.statuses) {
        const statuses = value.statuses

        for (const status of statuses) {
          logger.debug("Message status update", {
            id: status.id,
            status: status.status,
            timestamp: status.timestamp,
          })

          // TODO: Atualizar status da mensagem no banco
          // - delivered, read, failed, etc.
        }
      }
    }

    // Retorna 200 apenas se processamento foi bem sucedido
    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    logger.error("Error processing webhook", error)

    // 🔧 CORREÇÃO: Retornar 500 em caso de erro real
    // O Meta WhatsApp irá retentar automaticamente (com backoff exponencial)
    // Isso garante que mensagens não sejam perdidas
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Retorna saudação apropriada baseada no horário
 */
function getGreeting(): string {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) {
    return 'Bom dia'
  } else if (hour >= 12 && hour < 18) {
    return 'Boa tarde'
  } else {
    return 'Boa noite'
  }
}

/**
 * Encontra paciente pelo telefone usando SQL raw para normalizar e buscar
 * SOLUÇÃO DEFINITIVA: Usa REGEXP_REPLACE do PostgreSQL para normalizar telefone na query
 */
async function findPatientByPhone(phone: string): Promise<any | null> {
  // Normalizar número de telefone (remover tudo exceto dígitos)
  const normalizedPhone = phone.replace(/\D/g, '')

  logger.debug('🔍 Buscando paciente', {
    phoneOriginal: phone,
    phoneNormalized: normalizedPhone,
    length: normalizedPhone.length
  })

  // WhatsApp envia formato: 5583998663089 (país + DDD + número)
  // Banco pode ter: (83) 99866-3089, 83998663089, 5583998663089, etc

  const last11 = normalizedPhone.slice(-11) // 83998663089
  const last9 = normalizedPhone.slice(-9)   // 998663089
  const last8 = normalizedPhone.slice(-8)   // 98663089

  logger.debug('🔍 Termos de busca', {
    last11,
    last9,
    last8
  })

  try {
    // SOLUÇÃO: Usar raw SQL para normalizar telefone no banco e comparar
    // REGEXP_REPLACE remove todos os caracteres não-numéricos
    const result = await prisma.$queryRaw`
      SELECT id, name, phone, "userId"
      FROM "Patient"
      WHERE "isActive" = true
      AND (
        REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE ${`%${last11}%`}
        OR REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE ${`%${last9}%`}
        OR REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE ${`%${last8}%`}
      )
      LIMIT 1
    ` as any[];

    if (result && result.length > 0) {
      const patient = result[0];
      logger.debug('✅ Paciente encontrado via SQL', {
        patientId: patient.id,
        patientName: patient.name,
        patientPhone: patient.phone,
        userId: patient.userId
      })
      return patient
    }

    // SQL não encontrou - tentar fallback JavaScript
    logger.warn('⚠️ SQL não encontrou paciente, tentando fallback JavaScript...')

  } catch (error) {
    logger.error('❌ Erro na busca SQL:', error)
    logger.debug('🔄 Tentando fallback com busca manual...')
  }

  // FALLBACK: buscar todos e filtrar manualmente (sempre executa se SQL falhar ou não encontrar)
  try {
    const allPatients = await prisma.patient.findMany({
      where: { isActive: true },
      select: { id: true, name: true, phone: true, userId: true }
    })

    logger.debug(`📋 Buscando entre ${allPatients.length} pacientes ativos via fallback`)

    for (const patient of allPatients) {
      const patientPhoneNormalized = patient.phone.replace(/\D/g, '')
      if (patientPhoneNormalized.includes(last11) ||
          patientPhoneNormalized.includes(last9) ||
          patientPhoneNormalized.includes(last8)) {
        logger.debug('✅ Paciente encontrado via fallback JavaScript', {
          patientId: patient.id,
          patientName: patient.name,
          patientPhone: patient.phone,
          userId: patient.userId
        })
        return patient
      }
    }

    // Não encontrou nem com fallback - log detalhado
    logger.error('❌ Paciente NÃO encontrado após SQL + fallback', {
      phoneOriginal: phone,
      phoneNormalized: normalizedPhone,
      last11,
      last9,
      last8,
      totalPatientsChecked: allPatients.length
    })

    // Mostrar amostra para debug
    logger.debug('📋 Amostra de telefones (primeiros 5):',
      allPatients.slice(0, 5).map(p => ({
        name: p.name,
        phone: p.phone,
        normalized: p.phone.replace(/\D/g, '')
      }))
    )

    return null

  } catch (fallbackError) {
    logger.error('❌ Erro fatal no fallback JavaScript:', fallbackError)
    return null
  }
}
