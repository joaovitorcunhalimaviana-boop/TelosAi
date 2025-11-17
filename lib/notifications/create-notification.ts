/**
 * Helper para criar e enviar notificações
 *
 * Cria a notificação no banco de dados e envia em tempo real via SSE
 */

import { prisma } from '@/lib/prisma';
import { notificationService } from '@/lib/notifications/notification-service';
import {
  CreateNotificationInput,
  NotificationEvent,
} from '@/types/notifications';

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  try {
    // Criar notificação no banco de dados
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        priority: input.priority,
        data: input.data ?? undefined,
        actionUrl: input.actionUrl || null,
      },
    });

    console.log(`[Notification] Created: ${notification.title} for user ${input.userId}`);

    // Enviar em tempo real via SSE
    const notificationEvent: NotificationEvent = {
      id: notification.id,
      type: notification.type as any,
      title: notification.title,
      message: notification.message,
      priority: notification.priority as any,
      timestamp: notification.createdAt,
      read: notification.read,
      actionUrl: notification.actionUrl || undefined,
      data: notification.data as any,
    };

    notificationService.sendToUser(input.userId, notificationEvent);
  } catch (error) {
    console.error('[Notification] Error creating notification:', error);
    throw error;
  }
}
