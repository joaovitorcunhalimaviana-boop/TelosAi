/**
 * Serviço de Notificações em Tempo Real usando Server-Sent Events (SSE)
 *
 * Este serviço gerencia conexões SSE de múltiplos usuários e permite
 * enviar notificações em tempo real para usuários específicos.
 */

import { NotificationEvent } from '@/types/notifications';

// Tipo para a função de callback do encoder
type EnqueueFunction = (chunk: string) => void;

interface Connection {
  userId: string;
  enqueue: EnqueueFunction;
  controller: ReadableStreamDefaultController;
}

class NotificationService {
  private connections: Map<string, Connection[]>;

  constructor() {
    this.connections = new Map();
  }

  /**
   * Registra uma nova conexão SSE para um usuário
   */
  subscribe(userId: string, enqueue: EnqueueFunction, controller: ReadableStreamDefaultController): void {
    const userConnections = this.connections.get(userId) || [];

    userConnections.push({
      userId,
      enqueue,
      controller,
    });

    this.connections.set(userId, userConnections);

    console.log(`[NotificationService] User ${userId} subscribed. Total connections: ${userConnections.length}`);
  }

  /**
   * Remove uma conexão SSE de um usuário
   */
  unsubscribe(userId: string, controller: ReadableStreamDefaultController): void {
    const userConnections = this.connections.get(userId) || [];

    const filteredConnections = userConnections.filter(
      (conn) => conn.controller !== controller
    );

    if (filteredConnections.length === 0) {
      this.connections.delete(userId);
    } else {
      this.connections.set(userId, filteredConnections);
    }

    console.log(`[NotificationService] User ${userId} unsubscribed. Remaining connections: ${filteredConnections.length}`);
  }

  /**
   * Envia uma notificação para um usuário específico
   * A notificação é enviada para todas as conexões ativas daquele usuário
   */
  sendToUser(userId: string, notification: NotificationEvent): void {
    const userConnections = this.connections.get(userId);

    if (!userConnections || userConnections.length === 0) {
      console.log(`[NotificationService] No active connections for user ${userId}`);
      return;
    }

    const message = this.formatSSEMessage(notification);

    // Envia para todas as conexões do usuário (múltiplas abas/dispositivos)
    userConnections.forEach((connection) => {
      try {
        connection.enqueue(message);
        console.log(`[NotificationService] Notification sent to user ${userId}: ${notification.title}`);
      } catch (error) {
        console.error(`[NotificationService] Error sending notification to user ${userId}:`, error);
        // Remove conexão quebrada
        this.unsubscribe(userId, connection.controller);
      }
    });
  }

  /**
   * Envia notificação para múltiplos usuários
   */
  sendToMultipleUsers(userIds: string[], notification: NotificationEvent): void {
    userIds.forEach((userId) => {
      this.sendToUser(userId, notification);
    });
  }

  /**
   * Envia broadcast para todos os usuários conectados
   */
  broadcast(notification: NotificationEvent): void {
    const allUserIds = Array.from(this.connections.keys());
    this.sendToMultipleUsers(allUserIds, notification);
  }

  /**
   * Formata uma notificação para o formato SSE
   * Formato: data: {JSON}\n\n
   */
  private formatSSEMessage(notification: NotificationEvent): string {
    return `data: ${JSON.stringify(notification)}\n\n`;
  }

  /**
   * Envia um heartbeat (ping) para uma conexão específica
   */
  sendHeartbeat(userId: string, controller: ReadableStreamDefaultController): void {
    const userConnections = this.connections.get(userId);

    if (!userConnections) {
      return;
    }

    const connection = userConnections.find((conn) => conn.controller === controller);

    if (connection) {
      try {
        connection.enqueue(': heartbeat\n\n');
      } catch (error) {
        console.error(`[NotificationService] Error sending heartbeat to user ${userId}:`, error);
        this.unsubscribe(userId, controller);
      }
    }
  }

  /**
   * Retorna estatísticas do serviço
   */
  getStats() {
    const totalUsers = this.connections.size;
    let totalConnections = 0;

    this.connections.forEach((connections) => {
      totalConnections += connections.length;
    });

    return {
      totalUsers,
      totalConnections,
      averageConnectionsPerUser: totalUsers > 0 ? totalConnections / totalUsers : 0,
    };
  }

  /**
   * Lista todos os usuários conectados
   */
  getConnectedUsers(): string[] {
    return Array.from(this.connections.keys());
  }

  /**
   * Verifica se um usuário tem conexões ativas
   */
  isUserConnected(userId: string): boolean {
    const connections = this.connections.get(userId);
    return !!connections && connections.length > 0;
  }

  /**
   * Limpa todas as conexões (útil para testes/shutdown)
   */
  clearAll(): void {
    this.connections.clear();
    console.log('[NotificationService] All connections cleared');
  }
}

// Singleton - apenas uma instância do serviço para toda a aplicação
export const notificationService = new NotificationService();
