// API Route para exportação de dados científicos
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  anonymizePatient,
  generateExcelFile,
  generateCSVFile,
  type PatientExportData,
  type SurgeryExportData,
  type FollowUpExportData,
  type ExportFilters,
  calculateAge,
} from '@/lib/export-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const filters: ExportFilters = body;

    // Validar formato
    if (!['xlsx', 'csv'].includes(filters.format)) {
      return NextResponse.json(
        { error: 'Formato inválido. Use xlsx ou csv.' },
        { status: 400 }
      );
    }

    // Construir filtros de busca no Prisma
    const where: any = {
      surgeries: {
        some: {
          // Filtro de data
          ...(filters.startDate || filters.endDate
            ? {
                date: {
                  ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
                  ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
                },
              }
            : {}),

          // Filtro de tipo de cirurgia
          ...(filters.surgeryTypes && filters.surgeryTypes.length > 0
            ? { type: { in: filters.surgeryTypes } }
            : {}),
        },
      },
    };

    // Buscar pacientes com todas as relações necessárias
    const patients = await prisma.patient.findMany({
      where,
      include: {
        comorbidities: {
          include: {
            comorbidity: true,
          },
        },
        surgeries: {
          where: {
            // Filtros de cirurgia
            ...(filters.startDate || filters.endDate
              ? {
                  date: {
                    ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
                    ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
                  },
                }
              : {}),

            ...(filters.surgeryTypes && filters.surgeryTypes.length > 0
              ? { type: { in: filters.surgeryTypes } }
              : {}),

            // Filtro de completude de dados
            ...(filters.onlyComplete
              ? { dataCompleteness: { gte: 80 } }
              : {}),
          },
          include: {
            details: true,
            preOp: true,
            anesthesia: true,
            postOp: true,
            followUps: {
              include: {
                responses: true,
              },
              orderBy: {
                dayNumber: 'asc',
              },
            },
          },
        },
      },
    });

    // Filtrar apenas pacientes que têm cirurgias (após aplicar os filtros)
    const filteredPatients = patients.filter(p => p.surgeries.length > 0);

    if (filteredPatients.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum paciente encontrado com os filtros especificados.' },
        { status: 404 }
      );
    }

    // Transformar dados do Prisma para o formato de exportação
    let exportData: PatientExportData[] = filteredPatients.map((patient) => {
      // Calcular idade se tiver data de nascimento
      const age = patient.age ?? (patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : undefined);

      // Mapear comorbidades
      const patientComorbidities = patient.comorbidities.map(pc => pc.comorbidity.name);

      return {
        id: patient.id,
        name: patient.name,
        cpf: patient.cpf ?? undefined,
        phone: patient.phone,
        age,
        sex: patient.sex ?? undefined,
        dateOfBirth: patient.dateOfBirth ?? undefined,
        surgeries: patient.surgeries.map((surgery): SurgeryExportData => {
          // Processar follow-ups
          const followUps: FollowUpExportData[] = surgery.followUps.map((followUp) => {
            // Extrair dados do questionário
            let painLevel: number | undefined;
            let redFlags: string[] = [];
            let riskLevel: string | undefined;

            if (followUp.responses.length > 0) {
              const lastResponse = followUp.responses[followUp.responses.length - 1];

              // Parse dos dados JSON
              try {
                const questionnaireData = JSON.parse(lastResponse.questionnaireData);
                painLevel = questionnaireData.painLevel;

                if (lastResponse.redFlags) {
                  redFlags = JSON.parse(lastResponse.redFlags);
                }

                riskLevel = lastResponse.riskLevel;
              } catch (e) {
                console.error('Erro ao parsear dados do follow-up:', e);
              }
            }

            return {
              dayNumber: followUp.dayNumber,
              scheduledDate: followUp.scheduledDate,
              status: followUp.status,
              painLevel,
              redFlags,
              riskLevel,
              respondedAt: followUp.respondedAt ?? undefined,
            };
          });

          // Calcular NPS (se tiver follow-up D+14 respondido)
          const d14FollowUp = followUps.find(f => f.dayNumber === 14 && f.status === 'responded');
          let nps: number | undefined;

          if (d14FollowUp) {
            // NPS seria armazenado no questionário D+14
            // Aqui seria necessário buscar do questionnaireData
            // Por enquanto, deixamos undefined
          }

          return {
            id: surgery.id,
            type: surgery.type,
            date: surgery.date,
            hospital: surgery.hospital ?? undefined,
            durationMinutes: surgery.durationMinutes ?? undefined,
            comorbidities: patientComorbidities,
            details: surgery.details,
            preOp: surgery.preOp,
            anesthesia: surgery.anesthesia,
            followUps,
            nps,
            complications: surgery.details?.complications ?? undefined,
          };
        }),
      };
    });

    // Anonimizar dados se solicitado
    if (filters.anonymize) {
      exportData = exportData.map((patient, index) => anonymizePatient(patient, index));
    }

    // Gerar arquivo
    let fileBuffer: Buffer;
    let fileName: string;
    let mimeType: string;

    const timestamp = new Date().toISOString().split('T')[0];

    if (filters.format === 'xlsx') {
      fileBuffer = generateExcelFile(exportData, filters);
      fileName = `exportacao_dados_${filters.anonymize ? 'anonimizado_' : ''}${timestamp}.xlsx`;
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else {
      const csvContent = generateCSVFile(exportData, filters);
      fileBuffer = Buffer.from(csvContent, 'utf-8');
      fileName = `exportacao_dados_${filters.anonymize ? 'anonimizado_' : ''}${timestamp}.csv`;
      mimeType = 'text/csv';
    }

    // Retornar arquivo para download
    return new NextResponse(fileBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Erro na exportação:', error);
    return NextResponse.json(
      { error: 'Erro ao processar exportação de dados.' },
      { status: 500 }
    );
  }
}
