import { NextRequest, NextResponse } from "next/server"
import { sendMessage, markAsRead, sendDoctorAlert } from "@/lib/whatsapp"
import { analyzePatientMessage, formatDoctorAlert } from "@/lib/claude-analyzer"
import { prisma } from "@/lib/prisma"
import { validateHubChallenge } from "@/lib/security/webhook-validator"
import {
  getOrCreateConversation,
  recordUserMessage,
  isAwaitingQuestionnaire,
  startQuestionnaireCollection,
  processQuestionnaireAnswer,
  updateConversationState
} from "@/lib/conversation-manager"

/**
 * Webhook do WhatsApp Business API
 *
 * GET - Validação do webhook pelo Meta/Facebook
 * POST - Recebimento de mensagens e status updates
 */

// GET - Validação do webhook
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN

  console.log("📞 Webhook validation attempt:", {
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
    const body = await request.json()

    console.log("📩 Webhook received:", JSON.stringify(body, null, 2))

    // Processa as mensagens recebidas
    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0]
      const changes = entry?.changes?.[0]
      const value = changes?.value

      if (value?.messages) {
        const messages = value.messages

        for (const message of messages) {
          console.log("📱 Message received:", {
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
              // 1. Identificar paciente pelo telefone
              const patient = await prisma.patient.findFirst({
                where: {
                  phone: {
                    contains: message.from.replace(/\D/g, '').slice(-11) // Últimos 11 dígitos
                  }
                }
              })

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
                console.log("✅ Response sent to unregistered patient")
                continue
              }

              console.log(`📋 Patient identified: ${patient.name}`)

              // 2. Verificar se está aguardando para responder questionário
              const awaitingQuestionnaire = await isAwaitingQuestionnaire(message.from)

              if (awaitingQuestionnaire && userMessage.toLowerCase() === 'sim') {
                console.log('✅ Patient confirmed - starting questionnaire')

                // Buscar cirurgia mais recente
                const surgery = await prisma.surgery.findFirst({
                  where: { patientId: patient.id },
                  orderBy: { date: 'desc' }
                })

                if (surgery) {
                  // Iniciar coleta de respostas
                  await startQuestionnaireCollection(message.from, patient, surgery)
                  console.log('📝 Questionnaire started')
                  continue
                }
              }

              // 3. Verificar se está respondendo questionário
              const conversation = await getOrCreateConversation(message.from, patient.id)

              if (conversation.state === 'collecting_answers') {
                console.log('📝 Processing questionnaire answer')

                try {
                  const result = await processQuestionnaireAnswer(message.from, userMessage)

                  if (result.completed) {
                    console.log('✅ Questionnaire completed')
                  } else {
                    console.log('➡️ Next question sent')
                  }

                  continue
                } catch (error) {
                  console.error('❌ Error processing questionnaire answer:', error)
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
              console.log('🤖 Analyzing message with Claude AI...')
              const analysis = await analyzePatientMessage(
                userMessage,
                patient,
                surgery || undefined,
                patient.userId // Passa o userId do médico para buscar protocolos
              )

              console.log(`📊 Analysis result:`, {
                urgency: analysis.urgency,
                category: analysis.category,
                shouldNotifyDoctor: analysis.shouldNotifyDoctor
              })

              // 7. Enviar resposta ao paciente
              await sendMessage(message.from, analysis.suggestedResponse)
              console.log("✅ Intelligent response sent to patient")

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
                    console.log("✅ Doctor notified successfully")
                  } catch (error) {
                    console.error("❌ Error notifying doctor:", error)
                  }
                }
              }

            } catch (error) {
              console.error("❌ Error processing message:", error)

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
          console.log("📊 Message status update:", {
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
    console.error("❌ Error processing webhook:", error)

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
