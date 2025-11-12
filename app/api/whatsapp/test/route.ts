/**
 * WhatsApp Test Endpoint
 * For testing WhatsApp API connection and message sending
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  testWhatsAppConnection,
  isWhatsAppConfigured,
  sendMessage,
  formatPhoneNumber,
  isValidWhatsAppNumber,
} from '@/lib/whatsapp';

/**
 * GET - Test WhatsApp API connection
 */
export async function GET(request: NextRequest) {
  try {
    // Check if configured
    const configured = isWhatsAppConfigured();

    if (!configured) {
      return NextResponse.json({
        status: 'error',
        message: 'WhatsApp not configured',
        configured: false,
        missingVars: {
          WHATSAPP_PHONE_NUMBER_ID: !process.env.WHATSAPP_PHONE_NUMBER_ID,
          WHATSAPP_ACCESS_TOKEN: !process.env.WHATSAPP_ACCESS_TOKEN,
        },
      });
    }

    // Test connection
    const connectionOk = await testWhatsAppConnection();

    return NextResponse.json({
      status: connectionOk ? 'ok' : 'error',
      message: connectionOk
        ? 'WhatsApp API connection successful'
        : 'WhatsApp API connection failed',
      configured: true,
      connectionOk,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Send test message
 * Body: { phone: string, message?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, message } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone
    if (!isValidWhatsAppNumber(phone)) {
      return NextResponse.json(
        {
          error: 'Invalid WhatsApp number',
          formatted: formatPhoneNumber(phone),
          hint: 'Use format: 5511999999999 (country code + area code + number)',
        },
        { status: 400 }
      );
    }

    // Send test message
    const testMessage =
      message ||
      'Esta é uma mensagem de teste do Sistema de Acompanhamento Pós-Operatório. Se você recebeu esta mensagem, a integração está funcionando corretamente!';

    const response = await sendMessage(phone, testMessage);

    return NextResponse.json({
      success: true,
      message: 'Test message sent successfully',
      phone: formatPhoneNumber(phone),
      whatsappResponse: response,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
