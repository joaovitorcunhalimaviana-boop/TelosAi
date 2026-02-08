import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildErrorResponse } from '@/lib/api-utils';
import { auth } from '@/lib/auth';

// ============================================
// POST - ASSIGN PATIENT TO RESEARCH GROUP
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        buildErrorResponse('Unauthorized', 'You must be logged in'),
        { status: 401 }
      );
    }
    const userId = session.user.id;
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

    // Use transaction to ensure atomicity
    const updatedPatient = await prisma.$transaction(async (tx) => {
      // Update patient with research association
      const patient = await tx.patient.update({
        where: {
          id: patientId,
        },
        data: {
          isResearchParticipant: true,
          researchId: research.id,
          researchGroup: body.groupCode,
          researchNotes: body.notes || null,
        },
      });

      // Update group patient count
      await tx.researchGroup.update({
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
      await tx.research.update({
        where: {
          id: research.id,
        },
        data: {
          totalPatients: {
            increment: 1,
          },
        },
      });

      return patient;
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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        buildErrorResponse('Unauthorized', 'You must be logged in'),
        { status: 401 }
      );
    }
    const userId = session.user.id;
    const { id: patientId } = await params;

    // Verify patient belongs to user and get research info
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        userId,
      },
      include: {
        research: {
          include: {
            groups: true,
          },
        },
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

    // Find the research group by the groupCode stored in researchGroup
    let researchGroupId: string | null = null;
    if (patient.research && patient.researchGroup) {
      const group = patient.research.groups.find(g => g.groupCode === patient.researchGroup);
      if (group) {
        researchGroupId = group.id;
      }
    }

    // Use transaction to ensure atomicity
    const updatedPatient = await prisma.$transaction(async (tx) => {
      // Update patient to remove research association
      const updated = await tx.patient.update({
        where: {
          id: patientId,
        },
        data: {
          isResearchParticipant: false,
          researchId: null,
          researchGroup: null,
          researchNotes: null,
        },
      });

      // Decrement group patient count
      if (researchGroupId) {
        await tx.researchGroup.update({
          where: { id: researchGroupId },
          data: { patientCount: { decrement: 1 } },
        });
      }

      // Decrement research total patients
      if (patient.researchId) {
        await tx.research.update({
          where: { id: patient.researchId },
          data: { totalPatients: { decrement: 1 } },
        });
      }

      return updated;
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
