import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import {
  buildErrorResponse,
  isValidCuid,
  calculateCompleteness,
} from '@/lib/api-utils';
import { fromBrasiliaTime } from '@/lib/date-utils';
import { AuditLogger } from '@/lib/audit/logger';
import { getClientIP } from '@/lib/utils/ip';

// ============================================
// VALIDATION SCHEMAS
// ============================================

const updatePatientSchema = z.object({
  // Patient basic data
  name: z.string().min(1).optional(),
  cpf: z.string().optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  age: z.number().int().min(0).max(120).optional().nullable(),
  sex: z.string().optional().nullable(),
  phone: z.string().optional(),
  email: z.string().email().optional().nullable(),

  // Surgery data
  surgery: z
    .object({
      id: z.string().optional(),
      type: z.string().optional(),
      date: z.string().datetime().optional(),
      hospital: z.string().optional().nullable(),
      durationMinutes: z.number().int().optional().nullable(),
      status: z.string().optional(),
    })
    .optional(),

  // Surgery details
  details: z
    .object({
      // Hemorrhoid fields
      hemorrhoidTechnique: z.string().optional().nullable(),
      hemorrhoidEnergyType: z.string().optional().nullable(),
      hemorrhoidNumMamillae: z.number().int().optional().nullable(),
      hemorrhoidPositions: z.string().optional().nullable(),
      hemorrhoidType: z.string().optional().nullable(),
      hemorrhoidInternalGrade: z.string().optional().nullable(),
      hemorrhoidExternalDetails: z.string().optional().nullable(),

      // Fistula fields
      fistulaType: z.string().optional().nullable(),
      fistulaTechnique: z.string().optional().nullable(),
      fistulaNumTracts: z.number().int().optional().nullable(),
      fistulaSeton: z.boolean().optional().nullable(),
      fistulaSetonMaterial: z.string().optional().nullable(),

      // Fissure fields
      fissureType: z.string().optional().nullable(),
      fissureLocation: z.string().optional().nullable(),
      fissureTechnique: z.string().optional().nullable(),

      // Pilonidal fields
      pilonidalTechnique: z.string().optional().nullable(),

      // Common fields
      fullDescription: z.string().optional().nullable(),
      complications: z.string().optional().nullable(),
      recoveryRoomMinutes: z.number().int().optional().nullable(),
      sameDayDischarge: z.boolean().optional(),
      hospitalizationDays: z.number().int().optional().nullable(),
    })
    .optional(),

  // Anesthesia
  anesthesia: z
    .object({
      type: z.string().optional(),
      anesthesiologist: z.string().optional().nullable(),
      observations: z.string().optional().nullable(),
      pudendoBlock: z.boolean().optional(),
      pudendoTechnique: z.string().optional().nullable(),
      pudendoAccess: z.string().optional().nullable(),
      pudendoAnesthetic: z.string().optional().nullable(),
      pudendoConcentration: z.string().optional().nullable(),
      pudendoVolumeML: z.number().optional().nullable(),
      pudendoLaterality: z.string().optional().nullable(),
      pudendoAdjuvants: z.string().optional().nullable(),
      pudendoDetails: z.string().optional().nullable(),
    })
    .optional(),

  // Pre-op preparation
  preOp: z
    .object({
      botoxUsed: z.boolean().optional(),
      botoxDate: z.string().datetime().optional().nullable(),
      botoxDoseUnits: z.number().int().optional().nullable(),
      botoxLocation: z.string().optional().nullable(),
      botoxObservations: z.string().optional().nullable(),
      intestinalPrep: z.boolean().optional(),
      intestinalPrepType: z.string().optional().nullable(),
      otherPreparations: z.string().optional().nullable(),
    })
    .optional(),

  // Post-op prescription
  postOp: z
    .object({
      ointments: z.string().optional().nullable(),
      medications: z.string().optional().nullable(),
    })
    .optional(),

  // Comorbidities (array of IDs or objects)
  comorbidities: z
    .array(
      z.object({
        comorbidityId: z.string(),
        details: z.string().optional().nullable(),
        severity: z.string().optional().nullable(),
      })
    )
    .optional(),

  // Medications (array of IDs or objects)
  medications: z
    .array(
      z.object({
        medicationId: z.string(),
        dose: z.string().optional().nullable(),
        frequency: z.string().optional().nullable(),
        route: z.string().optional().nullable(),
      })
    )
    .optional(),
});

// ============================================
// GET - LOAD COMPLETE PATIENT DATA
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`[GET Patient] Fetching patient with ID: ${id}`);

    // Validate ID format
    if (!isValidCuid(id)) {
      console.log(`[GET Patient] Invalid CUID: ${id}`);
      return NextResponse.json(
        buildErrorResponse('Invalid patient ID format', 'ID must be a valid CUID'),
        { status: 400 }
      );
    }

    // Fetch patient with all relations
    console.log(`[GET Patient] Executing Prisma query...`);
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        comorbidities: {
          include: {
            comorbidity: true,
          },
        },
        medications: {
          include: {
            medication: true,
          },
        },
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
        },
        followUps: {
          include: {
            responses: true,
          },
          orderBy: {
            scheduledDate: 'desc',
          },
        },
        consentTerms: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!patient) {
      console.log(`[GET Patient] Patient not found in DB.`);
      return NextResponse.json(
        buildErrorResponse('Patient not found', `No patient found with ID: ${id}`),
        { status: 404 }
      );
    }
    console.log(`[GET Patient] Patient found: ${patient.name}`);

    // Calculate completeness for the latest surgery
    let dataCompleteness = 20;
    if (patient.surgeries.length > 0) {
      const latestSurgery = patient.surgeries[0];
      dataCompleteness = calculateCompleteness({
        comorbidities: patient.comorbidities,
        medications: patient.medications,
        surgery: latestSurgery,
      });
    }

    // Audit log: visualização de dados do paciente
    try {
      await AuditLogger.patientViewed({
        userId: patient.userId,
        patientId: patient.id,
        patientName: patient.name,
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
      });
    } catch (auditError) {
      console.error('[GET Patient] Audit log failed (non-fatal):', auditError);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...patient,
        dataCompleteness,
      },
    });
  } catch (error) {
    console.error('[GET Patient] Critical error fetching patient:', error);
    return NextResponse.json(
      buildErrorResponse(
        'Failed to fetch patient',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}

// ============================================
// PATCH - UPDATE PATIENT DATA
// ============================================

export async function PATCH(
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updatePatientSchema.parse(body);

    // Check if patient exists
    const existingPatient = await prisma.patient.findUnique({
      where: { id },
      include: {
        surgeries: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    if (!existingPatient) {
      return NextResponse.json(
        buildErrorResponse('Patient not found', `No patient found with ID: ${id}`),
        { status: 404 }
      );
    }

    // Update patient basic data
    const patientUpdateData: any = {};
    if (validatedData.name) patientUpdateData.name = validatedData.name;
    if (validatedData.cpf !== undefined) patientUpdateData.cpf = validatedData.cpf;
    if (validatedData.dateOfBirth !== undefined)
      patientUpdateData.dateOfBirth = validatedData.dateOfBirth
        ? new Date(validatedData.dateOfBirth)
        : null;
    if (validatedData.age !== undefined) patientUpdateData.age = validatedData.age;
    if (validatedData.sex !== undefined) patientUpdateData.sex = validatedData.sex;
    if (validatedData.phone) patientUpdateData.phone = validatedData.phone;
    if (validatedData.email !== undefined)
      patientUpdateData.email = validatedData.email;

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update patient
      const updatedPatient = await tx.patient.update({
        where: { id },
        data: patientUpdateData,
      });

      let surgeryId = existingPatient.surgeries[0]?.id;

      // Update or create surgery
      if (validatedData.surgery) {
        const surgeryData: any = {};
        if (validatedData.surgery.type) surgeryData.type = validatedData.surgery.type;
        if (validatedData.surgery.date)
          surgeryData.date = fromBrasiliaTime(new Date(validatedData.surgery.date));
        if (validatedData.surgery.hospital !== undefined)
          surgeryData.hospital = validatedData.surgery.hospital;
        if (validatedData.surgery.durationMinutes !== undefined)
          surgeryData.durationMinutes = validatedData.surgery.durationMinutes;
        if (validatedData.surgery.status)
          surgeryData.status = validatedData.surgery.status;

        if (surgeryId) {
          // Update existing surgery
          await tx.surgery.update({
            where: { id: surgeryId },
            data: surgeryData,
          });
        } else {
          // Create new surgery
          const newSurgery = await tx.surgery.create({
            data: {
              ...surgeryData,
              patientId: id,
              type: validatedData.surgery.type || 'hemorroidectomia',
              date: validatedData.surgery.date
                ? fromBrasiliaTime(new Date(validatedData.surgery.date))
                : fromBrasiliaTime(new Date()),
            },
          });
          surgeryId = newSurgery.id;
        }
      }

      // Update surgery details
      if (validatedData.details && surgeryId) {
        await tx.surgeryDetails.upsert({
          where: { surgeryId },
          create: {
            surgeryId,
            userId: existingPatient.userId,
            ...validatedData.details,
          },
          update: validatedData.details,
        });
      }

      // Update anesthesia
      if (validatedData.anesthesia && surgeryId) {
        await tx.anesthesia.upsert({
          where: { surgeryId },
          create: {
            surgeryId,
            type: validatedData.anesthesia.type || 'geral_IOT',
            ...validatedData.anesthesia,
          },
          update: validatedData.anesthesia,
        });
      }

      // Update pre-op
      if (validatedData.preOp && surgeryId) {
        const preOpData: any = { ...validatedData.preOp };
        if (preOpData.botoxDate) {
          preOpData.botoxDate = new Date(preOpData.botoxDate);
        }

        await tx.preOpPreparation.upsert({
          where: { surgeryId },
          create: {
            surgeryId,
            ...preOpData,
          },
          update: preOpData,
        });
      }

      // Update post-op prescription
      if (validatedData.postOp && surgeryId) {
        await tx.postOpPrescription.upsert({
          where: { surgeryId },
          create: {
            surgeryId,
            ...validatedData.postOp,
          },
          update: validatedData.postOp,
        });
      }

      // Update comorbidities
      if (validatedData.comorbidities) {
        // Delete existing comorbidities
        await tx.patientComorbidity.deleteMany({
          where: { patientId: id },
        });

        // Create new comorbidities
        if (validatedData.comorbidities.length > 0) {
          await tx.patientComorbidity.createMany({
            data: validatedData.comorbidities.map((c) => ({
              patientId: id,
              comorbidityId: c.comorbidityId,
              details: c.details,
              severity: c.severity,
            })),
          });
        }
      }

      // Update medications
      if (validatedData.medications) {
        // Delete existing medications
        await tx.patientMedication.deleteMany({
          where: { patientId: id },
        });

        // Create new medications
        if (validatedData.medications.length > 0) {
          await tx.patientMedication.createMany({
            data: validatedData.medications.map((m) => ({
              patientId: id,
              medicationId: m.medicationId,
              dose: m.dose,
              frequency: m.frequency,
              route: m.route,
            })),
          });
        }
      }

      // Recalculate completeness
      const patientWithRelations = await tx.patient.findUnique({
        where: { id },
        include: {
          comorbidities: true,
          medications: true,
          surgeries: {
            where: { id: surgeryId },
            include: {
              details: true,
              anesthesia: true,
              preOp: true,
              postOp: true,
            },
          },
        },
      });

      if (patientWithRelations && surgeryId) {
        const newCompleteness = calculateCompleteness({
          comorbidities: patientWithRelations.comorbidities,
          medications: patientWithRelations.medications,
          surgery: patientWithRelations.surgeries[0],
        });

        await tx.surgery.update({
          where: { id: surgeryId },
          data: { dataCompleteness: newCompleteness },
        });
      }

      return updatedPatient;
    });

    // Fetch updated patient with all relations
    const updatedPatient = await prisma.patient.findUnique({
      where: { id },
      include: {
        comorbidities: {
          include: {
            comorbidity: true,
          },
        },
        medications: {
          include: {
            medication: true,
          },
        },
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
        },
      },
    });

    // Audit log: paciente atualizado
    const fieldsUpdated = Object.keys(validatedData);
    await AuditLogger.patientUpdated({
      userId: existingPatient.userId,
      patientId: id,
      patientName: updatedPatient?.name || existingPatient.name,
      fieldsUpdated,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      message: 'Patient updated successfully',
      data: updatedPatient,
    });
  } catch (error) {
    console.error('Error updating patient:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        buildErrorResponse(
          'Validation error',
          error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
        ),
        { status: 400 }
      );
    }

    return NextResponse.json(
      buildErrorResponse(
        'Failed to update patient',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - DELETE PATIENT
// ============================================

export async function DELETE(
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

    // Check if patient exists
    const existingPatient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!existingPatient) {
      return NextResponse.json(
        buildErrorResponse('Patient not found', `No patient found with ID: ${id}`),
        { status: 404 }
      );
    }

    // Delete patient (cascade will handle related records)
    await prisma.patient.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Patient deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      buildErrorResponse(
        'Failed to delete patient',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}
