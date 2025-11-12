/**
 * API Route: /api/follow-up/analyze
 * Analisa respostas de follow-up usando Claude AI
 *
 * POST /api/follow-up/analyze
 * Body: {
 *   followUpId: string,
 *   surgeryType: string,
 *   dayNumber: number,
 *   answers: Record<string, any>,
 *   patientName: string,
 *   patientAge?: number,
 *   hasComorbidities?: boolean
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  analyzeFollowUpResponse,
  type FollowUpAnalysisParams,
} from '@/lib/follow-up-analyzer';
import { isSupportedSurgeryType, type SurgeryType } from '@/lib/surgery-templates';
import { prisma } from '@/lib/prisma';

// ============================================
// POST - Analisar Follow-up
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar campos obrigatórios
    const { followUpId, surgeryType, dayNumber, answers, patientName } = body;

    if (!followUpId || !surgeryType || !dayNumber || !answers || !patientName) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Validar tipo de cirurgia
    if (!isSupportedSurgeryType(surgeryType)) {
      return NextResponse.json(
        { error: 'Tipo de cirurgia não suportado' },
        { status: 400 }
      );
    }

    // Verificar se follow-up existe
    const followUp = await prisma.followUp.findUnique({
      where: { id: followUpId },
      include: {
        patient: true,
        surgery: true,
      },
    });

    if (!followUp) {
      return NextResponse.json(
        { error: 'Follow-up não encontrado' },
        { status: 404 }
      );
    }

    // Preparar parâmetros de análise
    const analysisParams: FollowUpAnalysisParams = {
      surgeryType: surgeryType as SurgeryType,
      dayNumber: parseInt(dayNumber),
      answers,
      patientName,
      patientAge: body.patientAge,
      hasComorbidities: body.hasComorbidities,
    };

    // Executar análise com Claude AI
    const analysis = await analyzeFollowUpResponse(analysisParams);

    // Salvar análise no banco de dados
    const followUpResponse = await prisma.followUpResponse.create({
      data: {
        followUpId,
        userId: followUp.userId,
        questionnaireData: JSON.stringify(answers),
        aiAnalysis: JSON.stringify(analysis),
        aiResponse: analysis.respostaEmpática,
        riskLevel: analysis.riskLevel,
        redFlags: JSON.stringify(analysis.redFlags),
        doctorAlerted: analysis.alertarMedico,
        alertSentAt: analysis.alertarMedico ? new Date() : null,
      },
    });

    // Atualizar status do follow-up
    await prisma.followUp.update({
      where: { id: followUpId },
      data: {
        status: 'responded',
        respondedAt: new Date(),
      },
    });

    // Se necessário alertar médico, enviar notificação
    if (analysis.alertarMedico) {
      // TODO: Implementar envio de alerta ao médico via WhatsApp
      // await sendDoctorAlert(...)
      console.log('ALERTA MÉDICO:', {
        patient: patientName,
        day: dayNumber,
        status: analysis.status,
        urgencia: analysis.urgencia,
      });
    }

    // Retornar resultado
    return NextResponse.json({
      success: true,
      analysis,
      responseId: followUpResponse.id,
    });

  } catch (error) {
    console.error('Erro na análise de follow-up:', error);

    return NextResponse.json(
      {
        error: 'Erro ao analisar follow-up',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

// ============================================
// GET - Buscar Análise Existente
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const followUpId = searchParams.get('followUpId');

    if (!followUpId) {
      return NextResponse.json(
        { error: 'followUpId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar respostas do follow-up
    const responses = await prisma.followUpResponse.findMany({
      where: { followUpId },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    if (responses.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma análise encontrada para este follow-up' },
        { status: 404 }
      );
    }

    const response = responses[0];

    // Parse análise da IA
    const analysis = response.aiAnalysis ? JSON.parse(response.aiAnalysis) : null;
    const answers = response.questionnaireData ? JSON.parse(response.questionnaireData) : {};
    const redFlags = response.redFlags ? JSON.parse(response.redFlags) : [];

    return NextResponse.json({
      success: true,
      response: {
        id: response.id,
        createdAt: response.createdAt,
        answers,
        analysis,
        riskLevel: response.riskLevel,
        redFlags,
        doctorAlerted: response.doctorAlerted,
        alertSentAt: response.alertSentAt,
      },
    });

  } catch (error) {
    console.error('Erro ao buscar análise:', error);

    return NextResponse.json(
      {
        error: 'Erro ao buscar análise',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
