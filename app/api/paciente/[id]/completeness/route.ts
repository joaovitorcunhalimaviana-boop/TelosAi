import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  buildErrorResponse,
  isValidCuid,
  calculateCompleteness,
} from '@/lib/api-utils';

// ============================================
// GET - CALCULATE COMPLETENESS FOR PATIENT
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID format
    if (!isValidCuid(id)) {
      return NextResponse.json(
        buildErrorResponse('Invalid patient ID format', 'ID must be a valid CUID'),
        { status: 400 }
      );
    }

    // Fetch patient with all relations needed for completeness calculation
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        comorbidities: true,
        medications: true,
        surgeries: {
          include: {
            details: true,
            anesthesia: true,
            preOp: true,
            postOp: true,
          },
          orderBy: {
            date: 'desc',
          },
          take: 1, // Only get latest surgery
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        buildErrorResponse('Patient not found', `No patient found with ID: ${id}`),
        { status: 404 }
      );
    }

    if (patient.surgeries.length === 0) {
      return NextResponse.json(
        buildErrorResponse(
          'No surgery found',
          'Patient must have at least one surgery to calculate completeness'
        ),
        { status: 404 }
      );
    }

    const latestSurgery = patient.surgeries[0];

    // Calculate completeness
    const completeness = calculateCompleteness({
      comorbidities: patient.comorbidities,
      medications: patient.medications,
      surgery: latestSurgery,
    });

    // Build breakdown
    const breakdown = {
      base: 20, // Express form
      comorbidities: patient.comorbidities.length > 0 ? 10 : 0,
      medications: patient.medications.length > 0 ? 10 : 0,
      surgeryDetails: latestSurgery.details ? 20 : 0,
      anesthesia: latestSurgery.anesthesia ? 15 : 0,
      preOp: latestSurgery.preOp ? 10 : 0,
      postOp: latestSurgery.postOp ? 10 : 0,
      fullDescription: latestSurgery.details?.fullDescription ? 5 : 0,
    };

    // Update surgery with new completeness value
    await prisma.surgery.update({
      where: { id: latestSurgery.id },
      data: { dataCompleteness: completeness },
    });

    return NextResponse.json({
      success: true,
      data: {
        patientId: id,
        surgeryId: latestSurgery.id,
        completeness,
        breakdown,
        missingFields: buildMissingFieldsList(breakdown),
      },
    });
  } catch (error) {
    console.error('Error calculating completeness:', error);
    return NextResponse.json(
      buildErrorResponse(
        'Failed to calculate completeness',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function buildMissingFieldsList(breakdown: any): string[] {
  const missing: string[] = [];

  if (breakdown.comorbidities === 0) {
    missing.push('Comorbidades (10%)');
  }
  if (breakdown.medications === 0) {
    missing.push('Medicações (10%)');
  }
  if (breakdown.surgeryDetails === 0) {
    missing.push('Detalhes da cirurgia (20%)');
  }
  if (breakdown.anesthesia === 0) {
    missing.push('Dados de anestesia (15%)');
  }
  if (breakdown.preOp === 0) {
    missing.push('Preparo pré-operatório (10%)');
  }
  if (breakdown.postOp === 0) {
    missing.push('Prescrição pós-operatória (10%)');
  }
  if (breakdown.fullDescription === 0) {
    missing.push('Descrição completa da cirurgia (5%)');
  }

  return missing;
}

// ============================================
// POST - RECALCULATE AND UPDATE ALL PATIENTS
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Special route: if id is "all", recalculate for all patients
    if (id === 'all') {
      const patients = await prisma.patient.findMany({
        include: {
          comorbidities: true,
          medications: true,
          surgeries: {
            include: {
              details: true,
              anesthesia: true,
              preOp: true,
              postOp: true,
            },
          },
        },
      });

      const updatePromises = patients.flatMap((patient) =>
        patient.surgeries.map((surgery) => {
          const completeness = calculateCompleteness({
            comorbidities: patient.comorbidities,
            medications: patient.medications,
            surgery,
          });

          return prisma.surgery.update({
            where: { id: surgery.id },
            data: { dataCompleteness: completeness },
          });
        })
      );

      await Promise.all(updatePromises);

      return NextResponse.json({
        success: true,
        message: `Recalculated completeness for ${updatePromises.length} surgeries`,
      });
    }

    // For single patient, call GET logic
    return GET(request, { params });
  } catch (error) {
    console.error('Error recalculating completeness:', error);
    return NextResponse.json(
      buildErrorResponse(
        'Failed to recalculate completeness',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}
