/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST() {
  try {
    // Verificar se a API key está configurada
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'sua-chave-anthropic-aqui') {
      return NextResponse.json(
        {
          configured: false,
          error: 'ANTHROPIC_API_KEY não configurada no arquivo .env',
        },
        { status: 400 }
      );
    }

    // Testar conexão com a API
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: 'Responda apenas "OK" se você está funcionando.',
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({
      configured: true,
      connected: true,
      model: message.model,
      response: responseText,
      usage: message.usage,
    });
  } catch (error: any) {
    console.error('Erro ao testar Anthropic API:', error);

    return NextResponse.json(
      {
        configured: true,
        connected: false,
        error: error.message || 'Erro ao conectar com a API Anthropic',
      },
      { status: 500 }
    );
  }
}
