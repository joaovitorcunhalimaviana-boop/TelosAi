/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * API Endpoint: Send Push Notification
 * Envia notificações push para usuários específicos
 */

import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

// Configurar VAPID keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contato@sistemaposaoperatorio.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey
  );
}

export interface SendPushNotificationRequest {
  userId: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  vibrate?: number[];
  actions?: Array<{
    action: string;
    title: string;
    url?: string;
  }>;
}

/**
 * POST - Enviar notificação push
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar se VAPID keys estão configuradas
    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: 'VAPID keys não configuradas' },
        { status: 500 }
      );
    }

    const body: SendPushNotificationRequest = await request.json();
    const { userId, title, body: notificationBody, ...options } = body;

    // Validar dados
    if (!userId || !title || !notificationBody) {
      return NextResponse.json(
        { error: 'userId, title e body são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar todas as subscriptions ativas do usuário
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'Nenhuma subscription ativa encontrada',
          sent: 0,
        },
        { status: 200 }
      );
    }

    // Preparar payload da notificação
    const payload = JSON.stringify({
      title,
      body: notificationBody,
      icon: options.icon || '/icons/icon-192.png',
      badge: options.badge || '/icons/icon-192.png',
      data: {
        url: options.url || '/dashboard',
        actions: options.actions || [],
      },
      tag: options.tag || `notification-${Date.now()}`,
      requireInteraction: options.requireInteraction || false,
      vibrate: options.vibrate || [200, 100, 200],
      timestamp: Date.now(),
    });

    // Enviar para todas as subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            payload,
            {
              TTL: 60 * 60 * 24, // 24 horas
            }
          );
          return { success: true, subscriptionId: subscription.id };
        } catch (error: any) {
          console.error(`Error sending push to subscription ${subscription.id}:`, error);

          // Se a subscription expirou ou não é mais válida, desativar
          if (
            error.statusCode === 410 || // Gone
            error.statusCode === 404 || // Not Found
            error.statusCode === 403    // Forbidden
          ) {
            await prisma.pushSubscription.update({
              where: { id: subscription.id },
              data: { isActive: false },
            });
          }

          return { success: false, subscriptionId: subscription.id, error: error.message };
        }
      })
    );

    // Contar sucessos e falhas
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    return NextResponse.json({
      success: true,
      message: `Notificação enviada para ${successful} de ${results.length} subscriptions`,
      sent: successful,
      failed,
      total: results.length,
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar notificação' },
      { status: 500 }
    );
  }
}

/**
 * Helper function para enviar notificação (pode ser importada de outros lugares)
 */
export async function sendPushNotification(
  userId: string,
  notification: {
    title: string;
    body: string;
    url?: string;
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
  }
): Promise<{ success: boolean; sent: number; failed: number }> {
  try {
    // Verificar se VAPID keys estão configuradas
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys não configuradas');
      return { success: false, sent: 0, failed: 0 };
    }

    // Buscar subscriptions ativas
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    if (subscriptions.length === 0) {
      return { success: true, sent: 0, failed: 0 };
    }

    // Preparar payload
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: {
        url: notification.url || '/dashboard',
      },
      tag: notification.tag || `notification-${Date.now()}`,
      requireInteraction: notification.requireInteraction || false,
      vibrate: [200, 100, 200],
      timestamp: Date.now(),
    });

    // Enviar para todas as subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            payload,
            { TTL: 60 * 60 * 24 }
          );
          return { success: true };
        } catch (error: any) {
          // Desativar subscriptions inválidas
          if (error.statusCode === 410 || error.statusCode === 404 || error.statusCode === 403) {
            await prisma.pushSubscription.update({
              where: { id: subscription.id },
              data: { isActive: false },
            });
          }
          return { success: false };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    return { success: true, sent: successful, failed };
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
    return { success: false, sent: 0, failed: 0 };
  }
}
