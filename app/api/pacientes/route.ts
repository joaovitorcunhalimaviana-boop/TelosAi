import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  buildErrorResponse,
  paginate,
  buildPaginationMeta,
  buildSearchQuery,
  buildPatientFilters,
  buildCompletenessFilter,
  sanitizeSearchTerm,
} from '@/lib/api-utils';
import { AuditLogger } from '@/lib/audit/logger';
import { getClientIP } from '@/lib/utils/ip';
import { createNotification } from '@/lib/notifications/create-notification';
import { auth } from '@/lib/auth';
import { invalidateAllDashboardData } from '@/lib/cache-helpers';

// ============================================
// GET - LIST PATIENTS WITH PAGINATION & FILTERS
// ============================================

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        buildErrorResponse('Unauthorized', 'You must be logged in'),
        { status: 401 }
      );
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const surgeryType = searchParams.get('surgeryType') || '';
    const status = searchParams.get('status') || '';
    const completeness = searchParams.get('completeness') || ''; // low, medium, high
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    // Build where clause - SEMPRE filtrar por userId (multi-tenant)
    const where: any = {
      userId,
    };

    // Add search filter
    if (search) {
      const sanitizedSearch = sanitizeSearchTerm(search);
      const searchQuery = buildSearchQuery(sanitizedSearch);
      Object.assign(where, searchQuery);
    }

    // Add patient filters
    const filters = buildPatientFilters({
      surgeryType,
      status,
      dateFrom,
      dateTo,
    });
    Object.assign(where, filters);

    // Apply completeness filter (requires a subquery approach)
    let patientsQuery = prisma.patient.findMany({
      where,
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
          take: 1, // Only get the latest surgery
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...paginate(page, limit),
    });

    // Get total count
    const totalCount = await prisma.patient.count({ where });

    // Execute query
    let patients = await patientsQuery;

    // Filter by completeness if specified
    if (completeness) {
      const completenessFilter = buildCompletenessFilter(completeness);
      if (completenessFilter) {
        patients = patients.filter((patient) => {
          const surgery = patient.surgeries[0];
          const dataCompleteness = surgery?.dataCompleteness || 20;

          if (completenessFilter.lt && completenessFilter.gte === undefined) {
            return dataCompleteness < completenessFilter.lt;
          }
          if (completenessFilter.gte && completenessFilter.lt) {
            return (
              dataCompleteness >= completenessFilter.gte &&
              dataCompleteness < completenessFilter.lt
            );
          }
          if (completenessFilter.gte && completenessFilter.lt === undefined) {
            return dataCompleteness >= completenessFilter.gte;
          }
          return true;
        });
      }
    }

    // Format response data
    const formattedPatients = patients.map((patient) => {
      const latestSurgery = patient.surgeries[0];

      return {
        id: patient.id,
        name: patient.name,
        cpf: patient.cpf,
        phone: patient.phone,
        email: patient.email,
        age: patient.age,
        sex: patient.sex,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
        surgery: latestSurgery
          ? {
              id: latestSurgery.id,
              type: latestSurgery.type,
              date: latestSurgery.date,
              hospital: latestSurgery.hospital,
              status: latestSurgery.status,
              dataCompleteness: latestSurgery.dataCompleteness,
            }
          : null,
        comorbidityCount: patient.comorbidities.length,
        medicationCount: patient.medications.length,
      };
    });

    // Build pagination metadata
    const pagination = buildPaginationMeta(totalCount, page, limit);

    return NextResponse.json({
      success: true,
      data: formattedPatients,
      pagination,
    });
  } catch (error) {
    console.error('Error listing patients:', error);
    return NextResponse.json(
      buildErrorResponse(
        'Failed to list patients',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}

// ============================================
// POST - CREATE NEW PATIENT (Optional - for future use)
// ============================================

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        buildErrorResponse('Unauthorized', 'You must be logged in'),
        { status: 401 }
      );
    }
    const userId = session.user.id;

    const body = await request.json();

    // Basic validation
    if (!body.name || !body.phone) {
      return NextResponse.json(
        buildErrorResponse(
          'Validation error',
          'Name and phone are required fields'
        ),
        { status: 400 }
      );
    }

    // Create patient with userId (multi-tenant)
    const newPatient = await prisma.patient.create({
      data: {
        userId,
        name: body.name,
        phone: body.phone,
        cpf: body.cpf,
        email: body.email,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        age: body.age,
        sex: body.sex,
      },
      include: {
        surgeries: true,
        comorbidities: true,
        medications: true,
      },
    });

    // Audit log: paciente criado
    await AuditLogger.patientCreated({
      userId,
      patientId: newPatient.id,
      patientName: newPatient.name,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // Criar notificação informativa
    await createNotification({
      userId,
      type: 'patient_created',
      title: 'Novo Paciente Cadastrado',
      message: `O paciente ${newPatient.name} foi adicionado ao sistema`,
      priority: 'low',
      actionUrl: `/paciente/${newPatient.id}`,
      data: {
        patientId: newPatient.id,
        patientName: newPatient.name,
      },
    });

    // Invalidate dashboard cache (novo paciente)
    invalidateAllDashboardData();

    return NextResponse.json(
      {
        success: true,
        message: 'Patient created successfully',
        data: newPatient,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating patient:', error);

    // Handle unique constraint violation (duplicate CPF)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        buildErrorResponse(
          'Patient already exists',
          'A patient with this CPF already exists'
        ),
        { status: 409 }
      );
    }

    return NextResponse.json(
      buildErrorResponse(
        'Failed to create patient',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}
