/**
 * API SSE (Server-Sent Events) para Notificações em Tempo Real
 *
 * Este endpoint mantém uma conexão aberta com o cliente e envia
 * notificações em tempo real quando eventos ocorrem.
 *
 * Endpoint: GET /api/notifications/stream
 */

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { notificationService } from '@/lib/notifications/notification-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();

    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;

    console.log(`[SSE] New connection request from user ${userId}`);

    // Criar um TransformStream para streaming
    const encoder = new TextEncoder();
    let controller: ReadableStreamDefaultController | null = null;

    const stream = new ReadableStream({
      start(ctrl) {
        controller = ctrl;

        // Função para enfileirar mensagens
        const enqueue = (data: string) => {
          if (controller) {
            controller.enqueue(encoder.encode(data));
          }
        };

        // Registrar a conexão no serviço de notificações
        if (controller) {
          notificationService.subscribe(userId, enqueue, controller);
        }

        // Enviar mensagem de conexão bem-sucedida
        enqueue(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);

        // Configurar heartbeat para manter a conexão viva
        const heartbeatInterval = setInterval(() => {
          if (controller) {
            notificationService.sendHeartbeat(userId, controller);
          }
        }, 30000); // Heartbeat a cada 30 segundos

        // Cleanup quando a conexão é fechada
        const cleanup = () => {
          clearInterval(heartbeatInterval);
          if (controller) {
            notificationService.unsubscribe(userId, controller);
            console.log(`[SSE] Connection closed for user ${userId}`);
          }
        };

        // Listener para quando o cliente desconecta
        request.signal.addEventListener('abort', cleanup);
      },

      cancel() {
        // Chamado quando o stream é cancelado
        if (controller) {
          notificationService.unsubscribe(userId, controller);
        }
        console.log(`[SSE] Stream cancelled for user ${userId}`);
      },
    });

    // Retornar a resposta com headers corretos para SSE
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error('[SSE] Error creating stream:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
