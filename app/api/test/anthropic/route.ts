/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST() {
  try {
    // Verificar se a API key está configurada
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          configured: false,
          error: 'GOOGLE_GENERATIVE_AI_API_KEY não configurada no arquivo .env',
        },
        { status: 400 }
      );
    }

    // Testar conexão com a API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });

    const result = await model.generateContent('Responda apenas "OK" se você está funcionando.');
    const responseText = result.response.text();

    return NextResponse.json({
      configured: true,
      connected: true,
      model: 'gemini-2.5-flash-preview-05-20',
      response: responseText,
    });
  } catch (error: any) {
    console.error('Erro ao testar Gemini API:', error);

    return NextResponse.json(
      {
        configured: true,
        connected: false,
        error: error.message || 'Erro ao conectar com a API Gemini',
      },
      { status: 500 }
    );
  }
}
