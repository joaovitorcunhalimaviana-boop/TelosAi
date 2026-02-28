/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * DIAGNÓSTICO COMPLETO: Testa API Claude e mostra erros salvos
 * GET /api/debug/test-ai → diagnóstico completo
 * POST /api/debug/test-ai → replay da conversa atual que falha
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';
import { conductConversation } from '@/lib/conversational-ai';

export const maxDuration = 60;

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {},
  };

  // 1. Buscar último erro salvo no banco
  try {
    const lastError = await prisma.systemConfig.findUnique({
      where: { key: 'LAST_AI_ERROR' }
    });
    results.lastSavedError = lastError ? JSON.parse(lastError.value) : 'Nenhum erro salvo';
  } catch (e: any) {
    results.lastSavedError = { error: e.message };
  }

  // 2. Verificar API key
  const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim();
  results.tests.apiKeyPresent = !!apiKey;
  results.tests.apiKeyLength = apiKey.length;
  results.tests.apiKeyPrefix = apiKey.substring(0, 15) + '...';
  results.tests.apiKeyHasNewline = apiKey.includes('\n');
  results.tests.apiKeyHasCarriageReturn = apiKey.includes('\r');
  results.tests.apiKeyHasSpace = apiKey.includes(' ');
  results.tests.apiKeyHasTab = apiKey.includes('\t');

  // 3. Teste SIMPLES da API Claude
  try {
    const anthropic = new Anthropic({ apiKey });
    const startTime = Date.now();

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 50,
      temperature: 0.1,
      system: 'Responda em uma frase curta em português.',
      messages: [{ role: 'user', content: 'Teste: 2+2?' }],
    }, { timeout: 30000 });

    results.tests.simpleCall = {
      success: true,
      duration: `${Date.now() - startTime}ms`,
      response: response.content[0]?.type === 'text' ? response.content[0].text : 'non-text',
      model: response.model,
      usage: response.usage,
    };
  } catch (e: any) {
    results.tests.simpleCall = {
      success: false,
      errorType: e?.constructor?.name,
      error: e.message,
      status: e.status,
      code: e.error?.type || e.code,
    };
  }

  // 4. Teste com MÚLTIPLAS mensagens (simula 2ª chamada)
  try {
    const anthropic = new Anthropic({ apiKey });
    const startTime = Date.now();

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      temperature: 0.1,
      system: 'Você é assistente médica. Colete informações sobre evacuação, sangramento e febre. Dados coletados: {"pain": 1}',
      messages: [
        { role: 'user', content: 'Oi' },
        { role: 'assistant', content: 'Olá! Como está a dor de 0 a 10?' },
        { role: 'user', content: 'Dor 1' },
        { role: 'assistant', content: 'Ótimo! Dor 1. Você evacuou desde a cirurgia?' },
        { role: 'user', content: 'Sim, evacuei' },
      ],
    }, { timeout: 45000 });

    results.tests.multiMessageCall = {
      success: true,
      duration: `${Date.now() - startTime}ms`,
      response: response.content[0]?.type === 'text' ? response.content[0].text.substring(0, 200) : 'non-text',
      usage: response.usage,
    };
  } catch (e: any) {
    results.tests.multiMessageCall = {
      success: false,
      errorType: e?.constructor?.name,
      error: e.message,
      status: e.status,
      code: e.error?.type || e.code,
    };
  }

  // 5. Estado atual da conversa no banco
  try {
    const followUpResponse = await prisma.followUpResponse.findFirst({
      where: { followUpId: 'cmlvrxzvo0008jm0488jqxfvs' },
      orderBy: { createdAt: 'desc' },
    });

    if (followUpResponse?.questionnaireData) {
      const data = JSON.parse(followUpResponse.questionnaireData);
      results.currentConversation = {
        responseId: followUpResponse.id,
        messageCount: data.conversation?.length || 0,
        roles: data.conversation?.map((m: any) => m.role),
        messagesPreview: data.conversation?.map((m: any) => ({
          role: m.role,
          content: m.content?.substring(0, 80) + '...',
        })),
        extractedData: data.extractedData,
        completed: data.completed,
      };
    } else {
      results.currentConversation = 'No response found';
    }
  } catch (e: any) {
    results.currentConversation = { error: e.message };
  }

  return NextResponse.json(results, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const testMessage = body.message || 'Sim, evacuei';

    // Buscar conversa atual e replay com conductConversation
    const followUpResponse = await prisma.followUpResponse.findFirst({
      where: { followUpId: 'cmlvrxzvo0008jm0488jqxfvs' },
      orderBy: { createdAt: 'desc' },
    });

    if (!followUpResponse?.questionnaireData) {
      return NextResponse.json({ error: 'No follow-up response found' }, { status: 404 });
    }

    const data = JSON.parse(followUpResponse.questionnaireData);
    const conversation = data.conversation || [];
    const currentData = data.extractedData || {};

    // Buscar patient e surgery
    const followUp = await prisma.followUp.findUnique({
      where: { id: 'cmlvrxzvo0008jm0488jqxfvs' },
      include: { surgery: { include: { patient: true } } },
    });

    if (!followUp) {
      return NextResponse.json({ error: 'Follow-up not found' }, { status: 404 });
    }

    const claudeHistory = conversation.map((msg: any) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    const startTime = Date.now();

    const result = await conductConversation(
      testMessage,
      followUp.surgery.patient,
      followUp.surgery,
      claudeHistory,
      currentData,
      followUp.dayNumber,
    );

    return NextResponse.json({
      success: true,
      duration: `${Date.now() - startTime}ms`,
      testMessage,
      historyLength: claudeHistory.length,
      roles: claudeHistory.map((m: any) => m.role),
      currentData,
      result: {
        aiResponse: result.aiResponse?.substring(0, 300),
        updatedData: result.updatedData,
        isComplete: result.isComplete,
        needsDoctorAlert: result.needsDoctorAlert,
        urgencyLevel: result.urgencyLevel,
      },
    });
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      errorType: e?.constructor?.name,
      error: e.message,
      status: e.status,
      code: e.error?.type || e.code,
      stack: e.stack?.substring(0, 500),
    }, { status: 500 });
  }
}
