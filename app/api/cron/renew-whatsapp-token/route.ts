/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Vercel Cron Job - Renew WhatsApp Token
 * Runs every 50 days to renew the WhatsApp access token before it expires
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const CRON_SECRET = (process.env.CRON_SECRET || '').trim();
const APP_ID = (process.env.WHATSAPP_APP_ID || '').trim();
const APP_SECRET = (process.env.WHATSAPP_APP_SECRET || '').trim();
const DOCTOR_PHONE = (process.env.DOCTOR_PHONE_NUMBER || '').trim();

/**
 * Busca o token mais recente do banco de dados, com fallback para env var
 */
async function getLatestToken(): Promise<string> {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'WHATSAPP_ACCESS_TOKEN' }
    });
    if (config?.value) {
      console.log('📌 Using token from database (most recent)');
      return config.value.trim();
    }
  } catch (e) {
    console.warn('⚠️ Failed to read token from DB, using env var');
  }
  return (process.env.WHATSAPP_ACCESS_TOKEN || '').trim();
}

/**
 * GET - Trigger Cron Job
 * Renova automaticamente o token e notifica o administrador
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação - aceita via header OU query string
    const authHeader = request.headers.get('authorization');
    const secretFromHeader = authHeader?.replace('Bearer ', '');
    const secretFromQuery = request.nextUrl.searchParams.get('secret');
    const providedSecret = secretFromHeader || secretFromQuery;

    if (providedSecret !== CRON_SECRET) {
      console.error('Unauthorized cron job access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Starting automatic WhatsApp token renewal cron job...');

    // Buscar token mais recente do banco de dados (não do env var!)
    const currentToken = await getLatestToken();

    // Verificar credenciais
    if (!APP_ID || !APP_SECRET || !currentToken) {
      throw new Error('Missing WhatsApp credentials');
    }

    // Renovar token
    const renewalUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${currentToken}`;

    const response = await fetch(renewalUrl, { method: 'GET' });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Token renewal failed:', error);

      // Notificar erro ao administrador
      await notifyAdminError(error);

      throw new Error(`Token renewal failed: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const expiresInDays = Math.floor(data.expires_in / 86400);

    console.log(`✅ Token renewed successfully - Expires in ${expiresInDays} days`);

    // SALVAR NO BANCO DE DADOS
    await prisma.systemConfig.upsert({
      where: { key: 'WHATSAPP_ACCESS_TOKEN' },
      update: { value: data.access_token },
      create: { key: 'WHATSAPP_ACCESS_TOKEN', value: data.access_token }
    });

    console.log('✅ Token saved to database');

    // Notificar sucesso ao administrador
    await notifyAdminSuccess(data.access_token, expiresInDays);

    return NextResponse.json({
      success: true,
      message: 'Token renewed and saved to DB',
      expiresInDays,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
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
 * POST - Alternative trigger
 */
export async function POST(request: NextRequest) {
  return GET(request);
}

/**
 * Notifica o administrador sobre o sucesso da renovação
 */
async function notifyAdminSuccess(newToken: string, expiresInDays: number) {
  try {
    if (!DOCTOR_PHONE) {
      console.warn('Doctor phone not configured, skipping notification');
      return;
    }

    const message =
      `🔄 TOKEN WHATSAPP RENOVADO\n\n` +
      `✅ Renovação automática concluída com sucesso!\n\n` +
      `💾 Token salvo no banco de dados automaticamente.\n` +
      `📅 Válido por: ${expiresInDays} dias\n` +
      `📆 Próxima renovação: ~${expiresInDays - 10} dias\n\n` +
      `🔐 Novo Token (início):\n${newToken.substring(0, 10)}...`;

    // Usar o token NOVO para enviar a notificação (o antigo pode ter sido invalidado)
    const PHONE_NUMBER_ID = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();

    await fetch(
      `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: DOCTOR_PHONE,
          type: 'text',
          text: { body: message },
        }),
      }
    );

    console.log('✅ Admin notification sent successfully');
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
  }
}

/**
 * Notifica o administrador sobre erro na renovação
 */
async function notifyAdminError(error: any) {
  try {
    if (!DOCTOR_PHONE) {
      return;
    }

    const message =
      `🚨 ERRO NA RENOVAÇÃO DO TOKEN WHATSAPP\n\n` +
      `❌ A renovação automática falhou!\n\n` +
      `Erro: ${JSON.stringify(error)}\n\n` +
      `⚠️ AÇÃO URGENTE NECESSÁRIA:\n` +
      `1. Acesse Meta for Developers\n` +
      `2. Gere um novo token manualmente\n` +
      `3. Atualize nas variáveis de ambiente`;

    // Tentar usar token do banco (pode ainda funcionar mesmo se a renovação falhou)
    const latestToken = await getLatestToken();
    const PHONE_NUMBER_ID = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();

    await fetch(
      `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${latestToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: DOCTOR_PHONE,
          type: 'text',
          text: { body: message },
        }),
      }
    );

    console.log('✅ Error notification sent to admin');
  } catch (notifError) {
    console.error('❌ Failed to send error notification:', notifError);
  }
}
