/* eslint-disable @typescript-eslint/no-explicit-any */
export const maxDuration = 60;
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const result = await model.generateContent('Responda apenas "OK" se você está funcionando.');
    const responseText = result.response.text();

    return NextResponse.json({
      configured: true,
      connected: true,
      model: 'gemini-2.5-flash-lite',
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
        model: 'gemini-2.5-flash-lite',
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

    // Step 3: Test conductConversation with empty history (basic test)
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
            fromFallback: (result as any)._fromFallback || false,
            geminiError: (result as any)._geminiError || null,
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

    // Step 4: EXACT webhook simulation - find patient by phone, load follow-up with history
    const phone = request.nextUrl.searchParams.get('phone') || '5583998663089';
    let step4: any = {};
    try {
      // Normalize phone (same as webhook does)
      const normalizedPhone = phone.replace(/\D/g, '');

      // Find patient by phone (same logic as webhook)
      const allPatients = await prisma.patient.findMany({
        where: { isActive: true },
        include: {
          user: { select: { nomeCompleto: true } },
          surgeries: { orderBy: { date: 'desc' }, take: 1 }
        }
      });

      const matchedPatient = allPatients.find((p: any) => {
        const pPhone = p.phone?.replace(/\D/g, '') || '';
        return pPhone === normalizedPhone || pPhone.endsWith(normalizedPhone.slice(-11)) || normalizedPhone.endsWith(pPhone.slice(-11));
      });

      if (!matchedPatient) {
        step4 = { success: false, error: `No patient found for phone ${normalizedPhone}`, totalPatients: allPatients.length };
      } else {
        // Find active follow-up (same as webhook)
        const followUp = await prisma.followUp.findFirst({
          where: {
            patientId: matchedPatient.id,
            status: 'in_progress',
          },
          include: { surgery: true },
          orderBy: { scheduledDate: 'desc' },
        });

        if (!followUp) {
          step4 = { success: false, error: 'No in_progress follow-up found', patientName: matchedPatient.name };
        } else {
          // Load conversation history (EXACTLY like webhook)
          const response = await prisma.followUpResponse.findFirst({
            where: { followUpId: followUp.id },
            orderBy: { createdAt: 'desc' },
          });

          let questionnaireData: any = { conversation: [], extractedData: {}, completed: false };
          try {
            if (response?.questionnaireData) {
              questionnaireData = typeof response.questionnaireData === 'string'
                ? JSON.parse(response.questionnaireData)
                : response.questionnaireData;
            }
          } catch { /* ignore parse errors */ }

          const conversationHistory = questionnaireData.conversation || [];
          const currentData = questionnaireData.extractedData || {};

          // Build claudeHistory (EXACTLY like webhook line 726)
          const claudeHistory = conversationHistory.map((m: any) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: m.timestamp || new Date().toISOString(),
          }));

          step4 = {
            patientName: matchedPatient.name,
            followUpId: followUp.id,
            followUpStatus: followUp.status,
            dayNumber: followUp.dayNumber,
            conversationHistoryLength: conversationHistory.length,
            conversationHistory: conversationHistory.map((m: any) => ({ role: m.role, content: m.content?.substring(0, 100) })),
            currentData,
            questionnaireCompleted: questionnaireData.completed,
          };

          // NOW call conductConversation with the EXACT same params as webhook
          try {
            const surgery = followUp.surgery || matchedPatient.surgeries?.[0];
            const aiResult = await conductConversation(
              msg,
              matchedPatient,
              surgery,
              claudeHistory,
              currentData
            );
            step4.aiCallSuccess = true;
            step4.aiResponse = aiResult.aiResponse;
            step4.aiUpdatedData = aiResult.updatedData;
            step4.aiIsComplete = aiResult.isComplete;
            step4.aiUrgencyLevel = aiResult.urgencyLevel;
          } catch (aiError: any) {
            step4.aiCallSuccess = false;
            step4.aiError = aiError.message;
            step4.aiErrorStack = aiError.stack?.substring(0, 800);
          }
        }
      }
    } catch (e: any) {
      step4 = { success: false, error: e.message, stack: e.stack?.substring(0, 500) };
    }

    return NextResponse.json({
      testMessage: msg,
      step1_envCheck: step1,
      step2_basicGemini: step2,
      step3_conductConversation: step3,
      step4_webhookSimulation: step4,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
