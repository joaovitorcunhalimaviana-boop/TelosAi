/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint de TESTE para WhatsApp API
 *
 * GET - Testa conexão e exibe informações
 * POST - Envia mensagem de teste
 */

// GET - Testar conexão
export async function GET() {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json(
        {
          configured: false,
          error: 'Variáveis WHATSAPP_PHONE_NUMBER_ID e WHATSAPP_ACCESS_TOKEN não configuradas',
        },
        { status: 400 }
      );
    }

    const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';
    const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          configured: true,
          connected: false,
          error: errorData.error?.message || 'Erro ao conectar com a API do WhatsApp',
          details: errorData,
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      configured: true,
      connected: true,
      phoneNumberId,
      phoneNumber: data.display_phone_number,
      verifiedName: data.verified_name,
      quality: data.quality_rating,
      usage: {
        sendMessage: {
          method: 'POST',
          body: {
            phone: '5583991664904',
            message: 'Sua mensagem aqui'
          }
        }
      }
    });
  } catch (error: any) {
    console.error('Erro ao testar WhatsApp API:', error);
    return NextResponse.json(
      {
        configured: true,
        connected: false,
        error: error.message || 'Erro ao conectar com a API do WhatsApp',
      },
      { status: 500 }
    );
  }
}

// POST - Enviar mensagem de teste
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, message } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone and message are required' },
        { status: 400 }
      );
    }

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json(
        { error: 'WhatsApp credentials not configured' },
        { status: 500 }
      );
    }

    console.log('📱 Sending WhatsApp test message:', {
      to: phone,
      message: message.substring(0, 50) + '...',
    });

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: {
            body: message,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ WhatsApp API error:', data);
      return NextResponse.json(
        {
          error: 'Failed to send message',
          details: data,
        },
        { status: response.status }
      );
    }

    console.log('✅ Message sent successfully:', data);

    return NextResponse.json({
      success: true,
      messageId: data.messages?.[0]?.id,
      data,
    });

  } catch (error: any) {
    console.error('❌ Error sending WhatsApp message:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
