import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

// GET: Retorna red flags Critical ou High não visualizados ou visualizados há menos de 24h
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: { message: 'Não autorizado' } },
        { status: 401 }
      )
    }

    // Busca red flags com risco Critical ou High
    const followUpResponses = await prisma.followUpResponse.findMany({
      where: {
        userId: user.id,
        riskLevel: {
          in: ['critical', 'high']
        }
      },
      include: {
        followUp: {
          include: {
            patient: {
              select: {
                id: true,
                name: true
              }
            },
            surgery: {
              select: {
                id: true,
                type: true
              }
            }
          }
        },
        redFlagViews: {
          where: {
            userId: user.id
          },
          orderBy: {
            viewedAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: [
        { riskLevel: 'desc' }, // Critical primeiro
        { createdAt: 'desc' }  // Mais recentes primeiro
      ]
    })

    // Filtra red flags não visualizados ou visualizados há menos de 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const activeRedFlags = followUpResponses.filter(response => {
      // Se nunca foi visualizado, inclui
      if (response.redFlagViews.length === 0) {
        return true
      }

      // Se foi visualizado há menos de 24h, inclui
      const lastView = response.redFlagViews[0]
      return new Date(lastView.viewedAt) > twentyFourHoursAgo
    })

    // Formata resposta
    const redFlags = activeRedFlags.map(response => {
      const redFlagsArray = response.redFlags
        ? JSON.parse(response.redFlags)
        : []

      return {
        id: response.id,
        patient: {
          id: response.followUp.patient.id,
          name: response.followUp.patient.name
        },
        surgery: {
          id: response.followUp.surgery.id,
          type: response.followUp.surgery.type
        },
        followUp: {
          dayNumber: response.followUp.dayNumber
        },
        response: {
          riskLevel: response.riskLevel,
          redFlags: redFlagsArray,
          createdAt: response.createdAt
        },
        isViewed: response.redFlagViews.length > 0,
        lastViewedAt: response.redFlagViews.length > 0
          ? response.redFlagViews[0].viewedAt
          : null
      }
    })

    return NextResponse.json({
      success: true,
      data: redFlags,
      count: redFlags.length
    })

  } catch (error) {
    console.error('Erro ao buscar red flags:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Erro ao buscar alertas urgentes' }
      },
      { status: 500 }
    )
  }
}

// POST: Marca red flag como visualizado
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: { message: 'Não autorizado' } },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { followUpResponseId } = body

    if (!followUpResponseId) {
      return NextResponse.json(
        { error: { message: 'followUpResponseId é obrigatório' } },
        { status: 400 }
      )
    }

    // Verifica se o response pertence ao usuário
    const response = await prisma.followUpResponse.findFirst({
      where: {
        id: followUpResponseId,
        userId: user.id
      }
    })

    if (!response) {
      return NextResponse.json(
        { error: { message: 'Red flag não encontrado' } },
        { status: 404 }
      )
    }

    // Cria registro de visualização
    const view = await prisma.redFlagView.create({
      data: {
        userId: user.id,
        followUpResponseId: followUpResponseId
      }
    })

    return NextResponse.json({
      success: true,
      data: view
    })

  } catch (error) {
    console.error('Erro ao marcar red flag como visualizado:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Erro ao marcar alerta como visualizado' }
      },
      { status: 500 }
    )
  }
}
