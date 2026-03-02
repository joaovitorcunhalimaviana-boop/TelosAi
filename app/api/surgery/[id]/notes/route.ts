/**
 * Update surgery doctor notes (observations)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: surgeryId } = await params;

    if (!surgeryId) {
      return NextResponse.json({ error: 'Surgery ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { doctorNotes } = body;

    if (typeof doctorNotes !== 'string') {
      return NextResponse.json({ error: 'doctorNotes must be a string' }, { status: 400 });
    }

    // Verificar se a cirurgia existe e pertence ao médico
    const surgery = await prisma.surgery.findUnique({
      where: { id: surgeryId },
      include: { patient: { select: { userId: true } } },
    });

    if (!surgery) {
      return NextResponse.json({ error: 'Surgery not found' }, { status: 404 });
    }

    if (surgery.patient.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Atualizar observações
    const updated = await prisma.surgery.update({
      where: { id: surgeryId },
      data: { doctorNotes: doctorNotes.trim() || null },
    });

    return NextResponse.json({
      success: true,
      surgeryId: updated.id,
      doctorNotes: updated.doctorNotes,
    });

  } catch (error) {
    console.error('Error updating surgery notes:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: surgeryId } = await params;

    const surgery = await prisma.surgery.findUnique({
      where: { id: surgeryId },
      select: {
        id: true,
        doctorNotes: true,
        patient: { select: { userId: true } },
      },
    });

    if (!surgery) {
      return NextResponse.json({ error: 'Surgery not found' }, { status: 404 });
    }

    if (surgery.patient.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({
      surgeryId: surgery.id,
      doctorNotes: surgery.doctorNotes,
    });

  } catch (error) {
    console.error('Error fetching surgery notes:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
