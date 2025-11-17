import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AuditLogger } from '@/lib/audit/logger'
import { getClientIP } from '@/lib/utils/ip'

// GET - Lista todos os protocolos do médico
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const protocols = await prisma.protocol.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        research: {
          select: {
            title: true
          }
        }
      },
      orderBy: [
        { surgeryType: 'asc' },
        { category: 'asc' },
        { dayRangeStart: 'asc' },
        { priority: 'desc' },
      ]
    })

    return NextResponse.json({ protocols })
  } catch (error) {
    console.error('Error fetching protocols:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Cria novo protocolo
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      surgeryType,
      category,
      title,
      dayRangeStart,
      dayRangeEnd,
      content,
      priority,
      isActive,
      researchId,
    } = body

    // Validações
    if (!surgeryType || !category || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const protocol = await prisma.protocol.create({
      data: {
        userId: session.user.id,
        surgeryType,
        category,
        title,
        dayRangeStart: parseInt(dayRangeStart),
        dayRangeEnd: dayRangeEnd ? parseInt(dayRangeEnd) : null,
        content,
        priority: parseInt(priority) || 0,
        isActive: isActive !== false,
        researchId: researchId || null,
        researchGroupCode: body.researchGroupCode || null,
      }
    })

    // Audit log: protocolo criado
    await AuditLogger.protocolCreated({
      userId: session.user.id,
      protocolId: protocol.id,
      title: protocol.title,
      surgeryType: protocol.surgeryType,
      category: protocol.category,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ protocol }, { status: 201 })
  } catch (error) {
    console.error('Error creating protocol:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
