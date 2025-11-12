import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildErrorResponse } from '@/lib/api-utils';

// ============================================
// POST - ASSIGN PATIENT TO RESEARCH GROUP
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Pegar userId da session
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     buildErrorResponse('Unauthorized', 'You must be logged in'),
    //     { status: 401 }
    //   )
    // }
    // const userId = session.user.id
    const userId = 'temp-user-id'; // Temporário
    const { id: patientId } = await params;
    const body = await request.json();

    // Validation
    if (!body.researchId || !body.groupCode) {
      return NextResponse.json(
        buildErrorResponse(
          'Validation error',
          'Research ID and group code are required'
        ),
        { status: 400 }
      );
    }

    // Verify patient belongs to user
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        userId,
      },
    });

    if (!patient) {
      return NextResponse.json(
        buildErrorResponse('Not found', 'Patient not found'),
        { status: 404 }
      );
    }

    // Verify research belongs to user and is active
    const research = await prisma.research.findFirst({
      where: {
        id: body.researchId,
        userId,
      },
      include: {
        groups: true,
      },
    });

    if (!research) {
      return NextResponse.json(
        buildErrorResponse('Not found', 'Research not found'),
        { status: 404 }
      );
    }

    if (!research.isActive) {
      return NextResponse.json(
        buildErrorResponse('Invalid request', 'Research is not active'),
        { status: 400 }
      );
    }

    // Verify group exists in research
    const group = research.groups.find((g) => g.groupCode === body.groupCode);
    if (!group) {
      return NextResponse.json(
        buildErrorResponse('Not found', 'Research group not found'),
        { status: 404 }
      );
    }

    // Update patient
    const updatedPatient = await prisma.patient.update({
      where: {
        id: patientId,
      },
      data: {
        isResearchParticipant: true,
        researchGroup: `${research.title} - Grupo ${body.groupCode}`,
        researchNotes: body.notes || null,
      },
    });

    // Update group patient count
    await prisma.researchGroup.update({
      where: {
        id: group.id,
      },
      data: {
        patientCount: {
          increment: 1,
        },
      },
    });

    // Update research total patients
    await prisma.research.update({
      where: {
        id: research.id,
      },
      data: {
        totalPatients: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Patient successfully assigned to research group',
      data: updatedPatient,
    });
  } catch (error) {
    console.error('Error assigning patient to research:', error);
    return NextResponse.json(
      buildErrorResponse(
        'Failed to assign patient to research',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - REMOVE PATIENT FROM RESEARCH
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Pegar userId da session
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     buildErrorResponse('Unauthorized', 'You must be logged in'),
    //     { status: 401 }
    //   )
    // }
    // const userId = session.user.id
    const userId = 'temp-user-id'; // Temporário
    const { id: patientId } = await params;

    // Verify patient belongs to user
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        userId,
      },
    });

    if (!patient) {
      return NextResponse.json(
        buildErrorResponse('Not found', 'Patient not found'),
        { status: 404 }
      );
    }

    if (!patient.isResearchParticipant) {
      return NextResponse.json(
        buildErrorResponse('Invalid request', 'Patient is not in any research'),
        { status: 400 }
      );
    }

    // Update patient
    const updatedPatient = await prisma.patient.update({
      where: {
        id: patientId,
      },
      data: {
        isResearchParticipant: false,
        researchGroup: null,
        researchNotes: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Patient removed from research',
      data: updatedPatient,
    });
  } catch (error) {
    console.error('Error removing patient from research:', error);
    return NextResponse.json(
      buildErrorResponse(
        'Failed to remove patient from research',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}
