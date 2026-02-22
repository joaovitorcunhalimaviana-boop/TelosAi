/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { conductConversation } from '@/lib/conversational-ai';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { configured: false, error: 'GOOGLE_GENERATIVE_AI_API_KEY não configurada' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent('Responda apenas "OK" se você está funcionando.');
    const responseText = result.response.text();

    return NextResponse.json({
      configured: true,
      connected: true,
      model: 'gemini-2.5-flash',
      response: responseText,
    });
  } catch (error: any) {
    return NextResponse.json(
      { configured: true, connected: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/test/anthropic?msg=dor+baixa
 * Testa conductConversation() com um paciente real
 */
export async function GET(request: NextRequest) {
  try {
    const msg = request.nextUrl.searchParams.get('msg') || 'dor média';
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // Step 1: Check env var
    const step1 = {
      apiKeyPresent: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyPrefix: apiKey?.substring(0, 10) || 'MISSING',
    };

    // Step 2: Test basic Gemini call with chat + systemInstruction + JSON mode
    let step2: any = {};
    try {
      const genAI = new GoogleGenerativeAI(apiKey || '');
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
        systemInstruction: 'Responda em JSON: {"response":"teste","extractedInfo":{},"isComplete":false,"urgency":"low","needsDoctorAlert":false}',
      });
      const chat = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 256,
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      });
      const result = await chat.sendMessage('oi');
      const text = result.response.text();
      step2 = { success: true, response: text };
    } catch (e: any) {
      step2 = { success: false, error: e.message, stack: e.stack?.substring(0, 500) };
    }

    // Step 3: Test conductConversation with real patient
    let step3: any = {};
    try {
      const patient = await prisma.patient.findFirst({
        include: { user: { select: { nomeCompleto: true } } }
      });
      if (!patient) {
        step3 = { success: false, error: 'No patient found' };
      } else {
        const surgery = await prisma.surgery.findFirst({
          where: { patientId: patient.id },
          orderBy: { date: 'desc' }
        });
        if (!surgery) {
          step3 = { success: false, error: 'No surgery found' };
        } else {
          const result = await conductConversation(
            msg,
            patient,
            surgery,
            [],
            {}
          );
          step3 = {
            success: true,
            aiResponse: result.aiResponse,
            updatedData: result.updatedData,
            isComplete: result.isComplete,
            urgencyLevel: result.urgencyLevel,
          };
        }
      }
    } catch (e: any) {
      step3 = { success: false, error: e.message, stack: e.stack?.substring(0, 500) };
    }

    return NextResponse.json({
      testMessage: msg,
      step1_envCheck: step1,
      step2_basicGemini: step2,
      step3_conductConversation: step3,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
