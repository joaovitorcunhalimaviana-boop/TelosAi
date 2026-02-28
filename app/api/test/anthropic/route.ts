/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * DIAGNÓSTICO COMPLETO DA API ANTHROPIC
 * GET /api/test/anthropic → diagnóstico + último erro
 * POST /api/test/anthropic → testa chamada simples + multi-message
 */
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

export const maxDuration = 60;

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
  };

  // 1. Último erro salvo no banco
  try {
    const lastError = await prisma.systemConfig.findUnique({
      where: { key: 'LAST_AI_ERROR' }
    });
    results.lastSavedError = lastError ? JSON.parse(lastError.value) : 'Nenhum erro salvo ainda';
  } catch (e: any) {
    results.lastSavedError = { error: e.message };
  }

  // 2. Estado da conversa atual
  try {
    const resp = await prisma.followUpResponse.findFirst({
      where: { followUpId: 'cmlvrxzvo0008jm0488jqxfvs' },
      orderBy: { createdAt: 'desc' },
    });
    if (resp?.questionnaireData) {
      const data = JSON.parse(resp.questionnaireData);
      results.currentConversation = {
        messageCount: data.conversation?.length || 0,
        roles: data.conversation?.map((m: any) => m.role),
        extractedData: data.extractedData,
        completed: data.completed,
      };
    }
  } catch (e: any) {
    results.currentConversation = { error: e.message };
  }

  return NextResponse.json(results);
}

export async function POST() {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {},
  };

  const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim();
  results.apiKeyInfo = {
    present: !!apiKey,
    length: apiKey.length,
    prefix: apiKey.substring(0, 12) + '...',
    hasNewline: apiKey.includes('\n'),
    hasReturn: apiKey.includes('\r'),
  };

  // Teste 1: Chamada simples
  try {
    const anthropic = new Anthropic({ apiKey });
    const start = Date.now();
    const resp = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 50,
      system: 'Responda brevemente.',
      messages: [{ role: 'user', content: 'Teste: 2+2?' }],
    }, { timeout: 30000 });

    results.tests.simple = {
      success: true,
      duration: `${Date.now() - start}ms`,
      response: resp.content[0]?.type === 'text' ? resp.content[0].text : 'non-text',
      model: resp.model,
      usage: resp.usage,
    };
  } catch (e: any) {
    results.tests.simple = {
      success: false,
      errorType: e?.constructor?.name,
      message: e.message,
      status: e.status,
      code: e.error?.type || e.code,
    };
  }

  // Teste 2: Multi-message (simula 2ª chamada do questionário)
  try {
    const anthropic = new Anthropic({ apiKey });
    const start = Date.now();
    const resp = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: 'Você é assistente médica. Colete: evacuação, sangramento, febre. Dados: {"pain":1}. Responda em JSON: {"aiResponse":"...", "updatedData":{...}, "isComplete":false}',
      messages: [
        { role: 'user', content: 'Oi' },
        { role: 'assistant', content: 'Olá! Como está a dor, 0 a 10?' },
        { role: 'user', content: 'Dor nota 1' },
        { role: 'assistant', content: 'Dor 1, ótimo! Você evacuou?' },
        { role: 'user', content: 'Sim, evacuei' },
      ],
    }, { timeout: 45000 });

    results.tests.multiMessage = {
      success: true,
      duration: `${Date.now() - start}ms`,
      response: resp.content[0]?.type === 'text' ? resp.content[0].text.substring(0, 300) : 'non-text',
      usage: resp.usage,
    };
  } catch (e: any) {
    results.tests.multiMessage = {
      success: false,
      errorType: e?.constructor?.name,
      message: e.message,
      status: e.status,
      code: e.error?.type || e.code,
    };
  }

  // Teste 3: Replay da conversa REAL do banco (a que falha!)
  try {
    const followUpResp = await prisma.followUpResponse.findFirst({
      where: { followUpId: 'cmlvrxzvo0008jm0488jqxfvs' },
      orderBy: { createdAt: 'desc' },
    });

    if (followUpResp?.questionnaireData) {
      const data = JSON.parse(followUpResp.questionnaireData);
      const conversation = data.conversation || [];

      // Sanitizar roles consecutivos (mesma lógica do conductConversation)
      const sanitizedMessages: any[] = [];
      conversation.forEach((msg: any) => {
        const lastMsg = sanitizedMessages[sanitizedMessages.length - 1];
        if (lastMsg && lastMsg.role === msg.role) {
          lastMsg.content = lastMsg.content + '\n\n' + msg.content;
        } else {
          sanitizedMessages.push({ role: msg.role, content: msg.content });
        }
      });

      // Adicionar mensagem de teste
      const lastMsg = sanitizedMessages[sanitizedMessages.length - 1];
      if (lastMsg && lastMsg.role === 'user') {
        lastMsg.content = lastMsg.content + '\n\nSim, evacuei';
      } else {
        sanitizedMessages.push({ role: 'user', content: 'Sim, evacuei' });
      }

      const anthropic = new Anthropic({ apiKey });
      const start = Date.now();
      const resp = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: 'Você é assistente médica pós-operatória. Responda em JSON.',
        messages: sanitizedMessages,
      }, { timeout: 45000 });

      results.tests.replayReal = {
        success: true,
        duration: `${Date.now() - start}ms`,
        inputMessages: sanitizedMessages.length,
        inputRoles: sanitizedMessages.map((m: any) => m.role),
        response: resp.content[0]?.type === 'text' ? resp.content[0].text.substring(0, 300) : 'non-text',
        usage: resp.usage,
      };
    } else {
      results.tests.replayReal = { skipped: 'No conversation data found' };
    }
  } catch (e: any) {
    results.tests.replayReal = {
      success: false,
      errorType: e?.constructor?.name,
      message: e.message,
      status: e.status,
      code: e.error?.type || e.code,
    };
  }

  return NextResponse.json(results);
}
