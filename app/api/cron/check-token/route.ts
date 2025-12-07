/**
 * CRON Job: Verificar Expiração do WhatsApp Token
 *
 * Propósito:
 * - Monitorar a expiração do token do WhatsApp Cloud API
 * - Alertar quando o token estiver próximo de expirar (< 7 dias)
 * - Enviar notificação para o administrador
 *
 * Configuração no Vercel Cron (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-token",
 *     "schedule": "0 9 * * *"  // Diariamente às 9h
 *   }]
 * }
 *
 * Configuração no Railway:
 * railway cron:add "0 9 * * *" "curl -X POST https://telos.ai/api/cron/check-token -H 'Authorization: Bearer $CRON_SECRET'"
 */

import { NextRequest, NextResponse } from 'next/server'

const CRON_SECRET = process.env.CRON_SECRET!
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
const WHATSAPP_TOKEN_CREATED_AT = process.env.WHATSAPP_TOKEN_CREATED_AT // ISO date string

// WhatsApp tokens expiram em 60 dias (segundo a Meta)
const TOKEN_EXPIRY_DAYS = 60
const WARNING_THRESHOLD_DAYS = 7 // Alertar quando faltam 7 dias

export async function POST(request: NextRequest) {
  try {
    // 🔒 Verificar autenticação CRON
    const authHeader = request.headers.get('authorization')
    const providedSecret = authHeader?.replace('Bearer ', '')

    if (providedSecret !== CRON_SECRET) {
      console.error('❌ [check-token] Unauthorized cron job access attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ [check-token] CRON job autenticado com sucesso')

    // Verificar se variáveis necessárias existem
    if (!WHATSAPP_TOKEN || !WHATSAPP_TOKEN_CREATED_AT) {
      console.warn('⚠️ [check-token] WHATSAPP_TOKEN ou WHATSAPP_TOKEN_CREATED_AT não configurado')
      return NextResponse.json(
        {
          error: 'Configuration missing',
          message: 'Configure WHATSAPP_TOKEN_CREATED_AT no .env para monitorar expiração'
        },
        { status: 400 }
      )
    }

    // Calcular dias restantes
    const tokenCreatedAt = new Date(WHATSAPP_TOKEN_CREATED_AT)
    const now = new Date()
    const tokenAge = Math.floor((now.getTime() - tokenCreatedAt.getTime()) / (1000 * 60 * 60 * 24))
    const daysRemaining = TOKEN_EXPIRY_DAYS - tokenAge

    console.log(`📊 [check-token] Status do token:`)
    console.log(`   - Criado em: ${tokenCreatedAt.toISOString()}`)
    console.log(`   - Idade: ${tokenAge} dias`)
    console.log(`   - Dias restantes: ${daysRemaining} dias`)

    // Se o token já expirou
    if (daysRemaining <= 0) {
      console.error(`🚨 [check-token] TOKEN EXPIRADO há ${Math.abs(daysRemaining)} dias!`)

      // TODO: Enviar email urgente para administrador
      // await sendEmailAlert({
      //   to: ADMIN_EMAIL,
      //   subject: '🚨 URGENTE: WhatsApp Token EXPIRADO',
      //   body: `O token do WhatsApp expirou há ${Math.abs(daysRemaining)} dias. O sistema de follow-up não está funcionando.`
      // })

      return NextResponse.json({
        status: 'EXPIRED',
        message: `Token expirado há ${Math.abs(daysRemaining)} dias`,
        tokenAge,
        daysRemaining,
        action: 'URGENT: Gerar novo token imediatamente'
      })
    }

    // Se o token está próximo de expirar (< 7 dias)
    if (daysRemaining <= WARNING_THRESHOLD_DAYS) {
      console.warn(`⚠️ [check-token] Token próximo de expirar em ${daysRemaining} dias!`)

      // TODO: Enviar email de alerta
      // await sendEmailAlert({
      //   to: ADMIN_EMAIL,
      //   subject: `⚠️ ALERTA: WhatsApp Token expira em ${daysRemaining} dias`,
      //   body: `O token do WhatsApp vai expirar em ${daysRemaining} dias. Gere um novo token antes de ${new Date(tokenCreatedAt.getTime() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}.`
      // })

      return NextResponse.json({
        status: 'WARNING',
        message: `Token expira em ${daysRemaining} dias`,
        tokenAge,
        daysRemaining,
        expiresAt: new Date(tokenCreatedAt.getTime() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString(),
        action: 'Gerar novo token nos próximos dias'
      })
    }

    // Token está saudável
    console.log(`✅ [check-token] Token saudável - ${daysRemaining} dias restantes`)

    return NextResponse.json({
      status: 'OK',
      message: `Token válido por mais ${daysRemaining} dias`,
      tokenAge,
      daysRemaining,
      expiresAt: new Date(tokenCreatedAt.getTime() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()
    })

  } catch (error) {
    console.error('❌ [check-token] Erro ao verificar token:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * INSTRUÇÕES PARA ADICIONAR WHATSAPP_TOKEN_CREATED_AT:
 *
 * 1. No Railway, adicione a variável de ambiente:
 *    railway variables --set WHATSAPP_TOKEN_CREATED_AT="2025-01-15T00:00:00.000Z"
 *
 * 2. Substitua a data acima pela data em que você gerou o token atual
 *
 * 3. Toda vez que você gerar um NOVO token, atualize essa variável com a data atual
 *
 * 4. Para testar o endpoint localmente:
 *    curl -X POST http://localhost:3000/api/cron/check-token \
 *      -H "Authorization: Bearer $CRON_SECRET"
 *
 * 5. Para testar em produção:
 *    curl -X POST https://telos.ai/api/cron/check-token \
 *      -H "Authorization: Bearer seu_cron_secret_aqui"
 */
