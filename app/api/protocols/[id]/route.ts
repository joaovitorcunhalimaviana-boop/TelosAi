import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT - Atualiza protocolo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

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
    } = body

    // Verifica se o protocolo pertence ao médico
    const existing = await prisma.protocol.findUnique({
      where: { id }
    })

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const protocol = await prisma.protocol.update({
      where: { id },
      data: {
        surgeryType,
        category,
        title,
        dayRangeStart: parseInt(dayRangeStart),
        dayRangeEnd: dayRangeEnd ? parseInt(dayRangeEnd) : null,
        content,
        priority: parseInt(priority) || 0,
        isActive: isActive !== false,
      }
    })

    return NextResponse.json({ protocol })
  } catch (error) {
    console.error('Error updating protocol:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Exclui protocolo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verifica se o protocolo pertence ao médico
    const existing = await prisma.protocol.findUnique({
      where: { id }
    })

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.protocol.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting protocol:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
