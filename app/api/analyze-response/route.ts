import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { detectRedFlags, getRiskLevel } from '@/lib/red-flags';
import { analyzeFollowUpResponse, type QuestionnaireData, type PatientData } from '@/lib/anthropic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AnalyzeRequestBody {
  followUpId: string;
  questionnaireData: QuestionnaireData;
}

/**
 * POST /api/analyze-response
 * Analisa resposta do paciente ao questionário de follow-up
 *
 * Fluxo:
 * 1. Valida dados recebidos
 * 2. Busca informações do follow-up, cirurgia e paciente
 * 3. Aplica red flags determinísticos
 * 4. Envia para Claude AI para análise contextual
 * 5. Salva análise no banco (FollowUpResponse)
 * 6. Retorna nível de risco + resposta empática
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: AnalyzeRequestBody = await request.json();
    const { followUpId, questionnaireData } = body;

    // Validação básica
    if (!followUpId || !questionnaireData) {
      return NextResponse.json(
        { error: 'followUpId e questionnaireData são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar follow-up com dados relacionados
    const followUp = await prisma.followUp.findUnique({
      where: { id: followUpId },
      include: {
        surgery: {
          include: {
            patient: {
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
              },
            },
          },
        },
      },
    });

    if (!followUp) {
      return NextResponse.json(
        { error: 'Follow-up não encontrado' },
        { status: 404 }
      );
    }

    const { surgery } = followUp;
    const { patient } = surgery;

    // Preparar dados do paciente para análise
    const patientData: PatientData = {
      name: patient.name,
      age: patient.age ?? undefined,
      sex: patient.sex ?? undefined,
      comorbidities: patient.comorbidities.map(pc => pc.comorbidity.name),
      medications: patient.medications.map(pm => pm.medication.name),
    };

    // PASSO 1: Aplicar red flags determinísticos
    const redFlagInput = {
      surgeryType: surgery.type as 'hemorroidectomia' | 'fistula' | 'fissura' | 'pilonidal',
      dayNumber: followUp.dayNumber,
      painLevel: questionnaireData.painLevel,
      urinaryRetention: questionnaireData.urinaryRetention,
      urinaryRetentionHours: questionnaireData.urinaryRetentionHours,
      bowelMovement: questionnaireData.bowelMovement,
      bleeding: questionnaireData.bleeding as 'none' | 'light' | 'moderate' | 'severe' | undefined,
      fever: questionnaireData.fever,
      temperature: questionnaireData.temperature,
      additionalSymptoms: questionnaireData.additionalSymptoms,
    };

    const detectedRedFlags = detectRedFlags(redFlagInput);
    let deterministicRiskLevel = getRiskLevel(detectedRedFlags);

    // Escalar risco se paciente usou opioides/medicação extra junto com dor alta
    if (
      questionnaireData.usedExtraMedication &&
      questionnaireData.painLevel != null &&
      questionnaireData.painLevel >= 7
    ) {
      // Dor alta + necessidade de medicação extra = sinal preocupante
      const riskLevels = ['low', 'medium', 'high', 'critical'];
      const currentIndex = riskLevels.indexOf(deterministicRiskLevel);
      if (currentIndex < riskLevels.length - 1 && currentIndex < 2) {
        // Escalar no máximo até 'high' por este critério sozinho
        deterministicRiskLevel = riskLevels[Math.min(currentIndex + 1, 2)] as
          | 'low' | 'medium' | 'high' | 'critical';
      }
    }

    // PASSO 2: Enviar para Claude AI para análise contextual
    const aiAnalysis = await analyzeFollowUpResponse({
      surgeryType: surgery.type,
      dayNumber: followUp.dayNumber,
      patientData,
      questionnaireData,
      detectedRedFlags: detectedRedFlags.map(rf => rf.message),
    });

    // PASSO 3: Determinar nível de risco final (usar o mais grave entre determinístico e IA)
    const riskLevels = ['low', 'medium', 'high', 'critical'];
    const deterministicIndex = riskLevels.indexOf(deterministicRiskLevel);
    const aiIndex = riskLevels.indexOf(aiAnalysis.riskLevel);
    const finalRiskLevel = riskLevels[Math.max(deterministicIndex, aiIndex)] as
      | 'low'
      | 'medium'
      | 'high'
      | 'critical';

    // PASSO 4: Combinar red flags (determinísticos + detectados pela IA)
    const allRedFlags = [
      ...detectedRedFlags.map(rf => rf.message),
      ...aiAnalysis.additionalRedFlags,
    ];

    // PASSO 5: Salvar análise no banco
    const followUpResponse = await prisma.followUpResponse.create({
      data: {
        followUpId: followUp.id,
        userId: patient.userId,
        questionnaireData: JSON.stringify(questionnaireData),
        aiAnalysis: JSON.stringify({
          deterministicRedFlags: detectedRedFlags,
          deterministicRiskLevel,
          aiRiskLevel: aiAnalysis.riskLevel,
          finalRiskLevel,
          reasoning: aiAnalysis.reasoning,
          seekCareAdvice: aiAnalysis.seekCareAdvice,
        }),
        aiResponse: aiAnalysis.empatheticResponse,
        riskLevel: finalRiskLevel,
        redFlags: JSON.stringify(allRedFlags),
        doctorAlerted: finalRiskLevel === 'critical' || finalRiskLevel === 'high',
        alertSentAt: finalRiskLevel === 'critical' || finalRiskLevel === 'high'
          ? new Date()
          : null,
      },
    });

    // PASSO 6: Atualizar status do follow-up
    await prisma.followUp.update({
      where: { id: followUp.id },
      data: {
        status: 'responded',
        respondedAt: new Date(),
      },
    });

    // PASSO 7: Retornar resposta
    return NextResponse.json({
      success: true,
      data: {
        responseId: followUpResponse.id,
        riskLevel: finalRiskLevel,
        empatheticResponse: aiAnalysis.empatheticResponse,
        seekCareAdvice: aiAnalysis.seekCareAdvice,
        redFlags: allRedFlags,
        doctorAlerted: followUpResponse.doctorAlerted,
      },
    });

  } catch (error) {
    console.error('Erro ao analisar resposta:', error);

    // Retornar erro detalhado
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

    return NextResponse.json(
      {
        error: 'Erro ao processar análise',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analyze-response?responseId={id}
 * Busca uma análise existente
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const responseId = searchParams.get('responseId');

    if (!responseId) {
      return NextResponse.json(
        { error: 'responseId é obrigatório' },
        { status: 400 }
      );
    }

    const response = await prisma.followUpResponse.findUnique({
      where: { id: responseId },
      include: {
        followUp: {
          include: {
            surgery: {
              include: {
                patient: true,
              },
            },
          },
        },
      },
    });

    if (!response) {
      return NextResponse.json(
        { error: 'Resposta não encontrada' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const questionnaireData = JSON.parse(response.questionnaireData);
    const aiAnalysis = response.aiAnalysis ? JSON.parse(response.aiAnalysis) : null;
    const redFlags = response.redFlags ? JSON.parse(response.redFlags) : [];

    return NextResponse.json({
      success: true,
      data: {
        id: response.id,
        createdAt: response.createdAt,
        questionnaireData,
        aiAnalysis,
        aiResponse: response.aiResponse,
        riskLevel: response.riskLevel,
        redFlags,
        doctorAlerted: response.doctorAlerted,
        alertSentAt: response.alertSentAt,
        followUp: {
          dayNumber: response.followUp.dayNumber,
          scheduledDate: response.followUp.scheduledDate,
        },
        surgery: {
          type: response.followUp.surgery.type,
          date: response.followUp.surgery.date,
        },
        patient: {
          name: response.followUp.surgery.patient.name,
          phone: response.followUp.surgery.patient.phone,
        },
      },
    });

  } catch (error) {
    console.error('Erro ao buscar análise:', error);

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

    return NextResponse.json(
      {
        error: 'Erro ao buscar análise',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
