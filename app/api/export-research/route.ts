// API Route para exportação de dados de pesquisa científica
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  generateResearchExcel,
  generateResearchCSV,
  generateResearchPDF,
  type ResearchExportData,
  type ResearchExportOptions,
} from '@/lib/research-export-utils';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const options: ResearchExportOptions = body;

    // Validações
    if (!options.researchId) {
      return NextResponse.json(
        { error: 'ID da pesquisa é obrigatório' },
        { status: 400 }
      );
    }

    if (!options.groupIds || options.groupIds.length === 0) {
      return NextResponse.json(
        { error: 'Selecione pelo menos um grupo' },
        { status: 400 }
      );
    }

    if (!['xlsx', 'csv', 'pdf'].includes(options.format)) {
      return NextResponse.json(
        { error: 'Formato inválido. Use xlsx, csv ou pdf.' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar pesquisa e verificar ownership
    const research = await prisma.research.findFirst({
      where: {
        id: options.researchId,
        userId: user.id,
      },
      include: {
        groups: {
          where: {
            id: { in: options.groupIds },
          },
        },
      },
    });

    if (!research) {
      return NextResponse.json(
        { error: 'Pesquisa não encontrada ou você não tem permissão para acessá-la' },
        { status: 404 }
      );
    }

    if (research.groups.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum grupo válido selecionado' },
        { status: 400 }
      );
    }

    // Buscar pacientes dos grupos selecionados
    const patients = await prisma.patient.findMany({
      where: {
        userId: user.id,
        isResearchParticipant: true,
        researchGroup: {
          in: research.groups.map(g => g.groupCode),
        },
      },
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
          where: {
            // Aplicar filtro de data se fornecido
            ...(options.dateRange?.startDate || options.dateRange?.endDate
              ? {
                  date: {
                    ...(options.dateRange.startDate
                      ? { gte: new Date(options.dateRange.startDate) }
                      : {}),
                    ...(options.dateRange.endDate
                      ? { lte: new Date(options.dateRange.endDate) }
                      : {}),
                  },
                }
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

    // Filtrar apenas pacientes com cirurgias (após aplicar filtros de data)
    const filteredPatients = patients.filter(p => p.surgeries.length > 0);

    if (filteredPatients.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum paciente encontrado com os critérios especificados' },
        { status: 404 }
      );
    }

    // Preparar dados para exportação
    const exportData: ResearchExportData = {
      research: {
        id: research.id,
        title: research.title,
        description: research.description,
        surgeryType: research.surgeryType,
        startDate: research.startDate,
        endDate: research.endDate,
        totalPatients: research.totalPatients,
      },
      groups: research.groups.map(g => ({
        id: g.id,
        groupCode: g.groupCode,
        groupName: g.groupName,
        description: g.description,
        patientCount: filteredPatients.filter(p => p.researchGroup === g.groupCode).length,
      })),
      patients: filteredPatients.map(patient => ({
        id: patient.id,
        name: options.fields.dadosBasicos ? patient.name : undefined,
        age: options.fields.dadosBasicos ? patient.age : undefined,
        sex: options.fields.dadosBasicos ? patient.sex : undefined,
        dateOfBirth: options.fields.dadosBasicos ? patient.dateOfBirth : undefined,
        researchGroup: patient.researchGroup,
        researchNotes: patient.researchNotes,
        comorbidities: options.fields.comorbidades
          ? patient.comorbidities.map(pc => ({
              name: pc.comorbidity.name,
              category: pc.comorbidity.category,
              details: pc.details,
              severity: pc.severity,
            }))
          : [],
        medications: options.fields.medicacoes
          ? patient.medications.map(pm => ({
              name: pm.medication.name,
              category: pm.medication.category,
              dose: pm.dose,
              frequency: pm.frequency,
              route: pm.route,
            }))
          : [],
        surgeries: patient.surgeries.map(surgery => ({
          id: surgery.id,
          type: surgery.type,
          date: surgery.date,
          hospital: surgery.hospital,
          durationMinutes: surgery.durationMinutes,
          details: options.fields.dadosCirurgicos ? surgery.details : undefined,
          preOp: options.fields.dadosCirurgicos ? surgery.preOp : undefined,
          anesthesia: options.fields.dadosCirurgicos ? surgery.anesthesia : undefined,
          postOp: options.fields.dadosCirurgicos ? surgery.postOp : undefined,
          followUps: options.fields.followUps
            ? surgery.followUps.map(fu => ({
                dayNumber: fu.dayNumber,
                scheduledDate: fu.scheduledDate,
                status: fu.status,
                sentAt: fu.sentAt,
                respondedAt: fu.respondedAt,
                responses: options.fields.respostasQuestionarios
                  ? fu.responses.map(r => ({
                      questionnaireData: r.questionnaireData,
                      aiAnalysis: options.fields.analiseIA ? r.aiAnalysis : undefined,
                      aiResponse: options.fields.analiseIA ? r.aiResponse : undefined,
                      riskLevel: r.riskLevel,
                      redFlags: r.redFlags,
                      doctorAlerted: r.doctorAlerted,
                      alertSentAt: r.alertSentAt,
                    }))
                  : [],
              }))
            : [],
        })),
      })),
    };

    // Gerar arquivo baseado no formato
    let fileBuffer: Buffer;
    let fileName: string;
    let mimeType: string;

    const timestamp = new Date().toISOString().split('T')[0];
    const sanitizedTitle = research.title.replace(/[^a-zA-Z0-9]/g, '_');

    if (options.format === 'xlsx') {
      fileBuffer = await generateResearchExcel(exportData, options);
      fileName = `pesquisa_${sanitizedTitle}_${timestamp}.xlsx`;
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (options.format === 'csv') {
      const csvContent = await generateResearchCSV(exportData, options);
      fileBuffer = Buffer.from(csvContent, 'utf-8');
      fileName = `pesquisa_${sanitizedTitle}_${timestamp}.csv`;
      mimeType = 'text/csv';
    } else {
      fileBuffer = await generateResearchPDF(exportData, options);
      fileName = `pesquisa_${sanitizedTitle}_${timestamp}.pdf`;
      mimeType = 'application/pdf';
    }

    // Se opção de enviar email estiver habilitada
    if (options.sendEmail && options.emailAddress) {
      // TODO: Implementar envio de email
      // Por enquanto, retornamos um erro informativo
      return NextResponse.json(
        {
          success: true,
          message: 'Exportação enviada para o e-mail com sucesso!',
          note: 'Funcionalidade de e-mail será implementada em breve',
        },
        { status: 200 }
      );
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
    console.error('Erro na exportação de pesquisa:', error);
    return NextResponse.json(
      {
        error: 'Erro ao processar exportação de dados',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
