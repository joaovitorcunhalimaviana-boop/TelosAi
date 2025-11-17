import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!

export async function GET(request: NextRequest) {
  try {
    // Buscar follow-up pendente mais recente
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const pendingFollowUp = await prisma.followUp.findFirst({
      where: {
        status: 'pending',
        scheduledDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        patient: true,
        surgery: true,
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    })

    if (!pendingFollowUp) {
      return NextResponse.json({
        success: false,
        message: 'Nenhum follow-up pendente para hoje'
      })
    }

    // Enviar mensagem de TEXTO LIVRE (sem template)
    const patientFirstName = pendingFollowUp.patient.name.split(' ')[0]
    const message = pendingFollowUp.dayNumber === 1
      ? `Olá, ${patientFirstName}! Eu sou seu assistente de recuperação pós-operatório, planejado e criado com carinho para lhe acompanhar durante sua jornada! Lembre-se que suas respostas aqui são fundamentais para ajudar na sua recuperação, então responda com cuidado e seriedade! Lembre-se também que sou uma inteligência artificial, criado para auxiliar, e não substituir, seu médico. Vamos começar? Digite "sim" e daremos início à nossa caminhada juntos!`
      : `Olá, ${patientFirstName}! Chegou a hora de conversarmos um pouco mais e continuar seu acompanhamento! Digite "sim" para prosseguirmos com nossa jornada!`

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: pendingFollowUp.patient.phone,
          type: 'text',
          text: {
            body: message,
          },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: data,
        message: 'Erro ao enviar mensagem',
      }, { status: 500 })
    }

    // Atualizar status do follow-up
    await prisma.followUp.update({
      where: { id: pendingFollowUp.id },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso!',
      whatsappResponse: data,
      followUp: {
        id: pendingFollowUp.id,
        patient: pendingFollowUp.patient.name,
        day: pendingFollowUp.dayNumber,
        phone: pendingFollowUp.patient.phone,
      },
    })
  } catch (error) {
    console.error('Erro no teste de WhatsApp:', error)
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 })
  }
}
