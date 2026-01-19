import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Lista todos os pacientes no banco de dados
 * GET /api/debug/list-patients
 */
export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        surgeries: {
          include: {
            followUps: {
              include: {
                responses: true
              }
            }
          }
        },
        conversations: true
      }
    });

    return NextResponse.json({
      total: patients.length,
      patients: patients.map(p => ({
        id: p.id,
        name: p.name,
        phone: p.phone,
        email: p.email,
        surgeries: p.surgeries.length,
        conversations: p.conversations.length,
        followUps: p.surgeries.reduce((acc, s) => acc + s.followUps.length, 0),
        responses: p.surgeries.reduce((acc, s) =>
          acc + s.followUps.reduce((a, f) => a + f.responses.length, 0), 0
        )
      }))
    });
  } catch (error) {
    console.error('Error listing patients:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
