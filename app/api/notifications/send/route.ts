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
    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: 'VAPID keys não configuradas' },
        { status: 500 }
      );
    }

    const body: SendPushNotificationRequest = await request.json();
    const { userId, title, body: notificationBody, ...options } = body;

    if (!userId || !title || !notificationBody) {
      return NextResponse.json(
        { error: 'userId, title e body são obrigatórios' },
        { status: 400 }
      );
    }

    const result = await sendPushNotification(userId, {
      title,
      body: notificationBody,
      icon: options.icon,
      badge: options.badge,
      url: options.url,
      tag: options.tag,
      requireInteraction: options.requireInteraction,
      vibrate: options.vibrate,
      actions: options.actions,
    });

    return NextResponse.json({
      success: result.success,
      message: `Notificação enviada para ${result.sent} de ${result.sent + result.failed} subscriptions`,
      sent: result.sent,
      failed: result.failed,
      total: result.sent + result.failed,
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
 * Função centralizada para enviar push notification.
 * Pode ser importada de outros módulos do servidor.
 */
export async function sendPushNotification(
  userId: string,
  notification: {
    title: string;
    body: string;
    url?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    requireInteraction?: boolean;
    vibrate?: number[];
    actions?: Array<{ action: string; title: string; url?: string }>;
  }
): Promise<{ success: boolean; sent: number; failed: number }> {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys não configuradas');
      return { success: false, sent: 0, failed: 0 };
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    if (subscriptions.length === 0) {
      return { success: true, sent: 0, failed: 0 };
    }

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/icons/icon-192.png',
      badge: notification.badge || '/icons/icon-192.png',
      data: {
        url: notification.url || '/dashboard',
        actions: notification.actions || [],
      },
      tag: notification.tag || `notification-${Date.now()}`,
      requireInteraction: notification.requireInteraction || false,
      vibrate: notification.vibrate || [200, 100, 200],
      timestamp: Date.now(),
    });

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
