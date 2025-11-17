/**
 * API CRUD de Notificações
 *
 * GET  /api/notifications - Lista notificações do usuário
 * POST /api/notifications - Cria uma notificação (manual/admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notificationService } from '@/lib/notifications/notification-service';
import { NotificationEvent } from '@/types/notifications';

// GET - Listar notificações do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);

    // Parâmetros de query
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');

    // Construir filtros
    const where: any = { userId };

    if (unreadOnly) {
      where.read = false;
    }

    if (type) {
      where.type = type;
    }

    if (priority) {
      where.priority = priority;
    }

    // Buscar notificações
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      total,
      unreadCount,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST - Criar notificação (manual/admin)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, type, title, message, priority, data, actionUrl } = body;

    // Validação
    if (!userId || !type || !title || !message || !priority) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Criar notificação no banco
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        priority,
        data: data || null,
        actionUrl: actionUrl || null,
      },
    });

    // Enviar notificação em tempo real via SSE
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

    notificationService.sendToUser(userId, notificationEvent);

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
