/**
 * API Route - Renew WhatsApp Access Token
 * Renova automaticamente o token de acesso do WhatsApp antes de expirar
 */

import { NextRequest, NextResponse } from 'next/server';

const APP_ID = process.env.WHATSAPP_APP_ID!;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET!;
const CURRENT_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const CRON_SECRET = process.env.CRON_SECRET!;

interface TokenRenewalResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * POST - Renova o token de acesso
 * Chamado manualmente ou via cron job
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '');

    if (providedSecret !== CRON_SECRET) {
      console.error('Unauthorized token renewal attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Starting WhatsApp token renewal...');

    // Verificar se as credenciais estão configuradas
    if (!APP_ID || !APP_SECRET || !CURRENT_TOKEN) {
      throw new Error('Missing WhatsApp credentials in environment variables');
    }

    // Chamar API do Facebook para renovar o token
    const renewalUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${CURRENT_TOKEN}`;

    const response = await fetch(renewalUrl, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Token renewal failed:', error);
      throw new Error(`Token renewal failed: ${JSON.stringify(error)}`);
    }

    const data: TokenRenewalResponse = await response.json();

    console.log('✅ Token renewed successfully');
    console.log(`📅 New token expires in: ${data.expires_in} seconds (${Math.floor(data.expires_in / 86400)} days)`);

    // Calcular data de expiração
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);

    // Retornar novo token e instruções
    return NextResponse.json({
      success: true,
      message: 'Token renewed successfully',
      newToken: data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
      expiresInDays: Math.floor(data.expires_in / 86400),
      expiresAt: expiresAt.toISOString(),
      instructions: [
        '1. Copie o novo token abaixo',
        '2. Atualize WHATSAPP_ACCESS_TOKEN no .env',
        '3. Atualize WHATSAPP_ACCESS_TOKEN nas variáveis de ambiente da Vercel',
        '4. Faça redeploy da aplicação se necessário'
      ],
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error renewing token:', error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Informações sobre o token atual
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '');

    if (providedSecret !== CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verificar informações do token atual via API do WhatsApp
    const response = await fetch(
      `https://graph.facebook.com/v21.0/debug_token?input_token=${CURRENT_TOKEN}&access_token=${APP_ID}|${APP_SECRET}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('Failed to get token info');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      tokenInfo: data.data,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error getting token info:', error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
