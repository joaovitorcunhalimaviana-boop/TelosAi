/**
 * Endpoint de correção: Destravar follow-ups travados em "in_progress"
 *
 * Problema: O campo 'fever' estava na lista de campos obrigatórios do webhook,
 * mas a IA nunca pergunta sobre febre diretamente. Resultado: questionários
 * que foram respondidos completamente ficavam travados em "in_progress".
 *
 * Este endpoint verifica follow-ups in_progress que já têm dados suficientes
 * e os marca como "responded".
 *
 * Uso: GET /api/admin/fix-stuck-followups?dryRun=true (para ver sem alterar)
 *      GET /api/admin/fix-stuck-followups (para corrigir)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get('dryRun') === 'true';

  try {
    // Buscar todos os follow-ups travados em in_progress
    const stuckFollowUps = await prisma.followUp.findMany({
      where: {
        status: 'in_progress',
        userId: session.user.id,
      },
      include: {
        patient: { select: { name: true } },
        surgery: { select: { type: true } },
        responses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const results: Array<{
      followUpId: string;
      patientName: string;
      dayNumber: number;
      action: string;
      missingFields: string[];
      collectedFields: string[];
    }> = [];

    // Campos que o novo código considera obrigatórios (SEM fever)
    const baseRequiredFields = [
      'pain',
      'bowelMovementSinceLastContact',
      'bleeding',
      'medications',
      'usedExtraMedication',
      'additionalSymptoms',
      'localCareAdherence',
    ];
    const nullableFields = ['additionalSymptoms', 'concerns'];

    for (const followUp of stuckFollowUps) {
      const response = followUp.responses[0];
      if (!response) {
        results.push({
          followUpId: followUp.id,
          patientName: followUp.patient.name,
          dayNumber: followUp.dayNumber,
          action: 'SKIP - sem resposta',
          missingFields: [],
          collectedFields: [],
        });
        continue;
      }

      let extractedData: Record<string, any> = {};
      try {
        const qData = JSON.parse(response.questionnaireData || '{}');
        extractedData = qData.extractedData || {};
      } catch {
        results.push({
          followUpId: followUp.id,
          patientName: followUp.patient.name,
          dayNumber: followUp.dayNumber,
          action: 'SKIP - JSON inválido',
          missingFields: [],
          collectedFields: [],
        });
        continue;
      }

      // Montar lista de campos obrigatórios para este dia
      const requiredFields = [...baseRequiredFields];
      if (followUp.dayNumber === 1) requiredFields.push('urination');
      if (followUp.dayNumber >= 14) {
        requiredFields.push('satisfactionRating', 'wouldRecommend', 'improvementSuggestions');
      }
      if (extractedData.bowelMovementSinceLastContact === true) {
        requiredFields.push('painDuringBowelMovement');
      }

      // Verificar campos faltantes
      const missingFields = requiredFields.filter(f => {
        if (nullableFields.includes(f)) {
          return extractedData[f] === undefined;
        }
        return extractedData[f] === undefined || extractedData[f] === null;
      });

      const collectedFields = requiredFields.filter(f => !missingFields.includes(f));

      if (missingFields.length === 0) {
        // COMPLETAMENTE RESPONDIDO! Destravar!
        if (!dryRun) {
          await prisma.followUp.update({
            where: { id: followUp.id },
            data: {
              status: 'responded',
              respondedAt: new Date(),
            },
          });

          // Atualizar questionnaireData para marcar completed
          try {
            const qData = JSON.parse(response.questionnaireData || '{}');
            qData.completed = true;
            qData.conversationPhase = 'completed';
            await prisma.followUpResponse.update({
              where: { id: response.id },
              data: { questionnaireData: JSON.stringify(qData) },
            });
          } catch { /* ignore */ }
        }

        results.push({
          followUpId: followUp.id,
          patientName: followUp.patient.name,
          dayNumber: followUp.dayNumber,
          action: dryRun ? 'SERIA CORRIGIDO' : '✅ CORRIGIDO',
          missingFields: [],
          collectedFields,
        });
      } else {
        results.push({
          followUpId: followUp.id,
          patientName: followUp.patient.name,
          dayNumber: followUp.dayNumber,
          action: `SKIP - faltam ${missingFields.length} campo(s)`,
          missingFields,
          collectedFields,
        });
      }
    }

    const fixed = results.filter(r => r.action.includes('CORRIGIDO'));

    return NextResponse.json({
      dryRun,
      totalStuck: stuckFollowUps.length,
      fixed: fixed.length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
