import { NextRequest, NextResponse } from "next/server"

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
    challenge,
    expectedToken: verifyToken,
  })

  // Valida o token
  if (mode === "subscribe" && token === verifyToken) {
    console.log("✅ Webhook validated successfully!")
    return new NextResponse(challenge, { status: 200 })
  }

  console.log("❌ Webhook validation failed")
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

          // TODO: Processar mensagem do paciente
          // - Identificar o paciente pelo número
          // - Salvar a resposta no banco
          // - Analisar com IA se necessário
          // - Atualizar status do follow-up
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

    // Sempre retorna 200 para o Meta não retentar
    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    console.error("❌ Error processing webhook:", error)

    // Mesmo com erro, retorna 200 para evitar reenvios
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 200 }
    )
  }
}
