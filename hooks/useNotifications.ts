/**
 * Hook useNotifications - Gerencia conexão SSE e estado de notificações
 *
 * Este hook conecta ao endpoint SSE, recebe notificações em tempo real,
 * mostra toasts, toca sons para alertas críticos e gerencia o estado local.
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { NotificationEvent, shouldPlaySound } from '@/types/notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const { toast } = useToast();

  // Função para tocar som de alerta
  const playNotificationSound = useCallback(() => {
    try {
      // Criar um beep usando Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Frequência em Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, []);

  // Função para marcar notificação como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Atualizar estado local
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Função para marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      // Atualizar estado local
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  // Buscar notificações iniciais
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications?limit=50');

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  // Conectar ao SSE
  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout;
    let shouldReconnect = true;

    const connect = () => {
      // Não conectar se já existe uma conexão
      if (eventSourceRef.current) {
        return;
      }

      console.log('[useNotifications] Connecting to SSE...');

      const eventSource = new EventSource('/api/notifications/stream');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('[useNotifications] SSE connection established');
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Ignorar heartbeats e mensagens de conexão
          if (data.type === 'connected' || !data.id) {
            return;
          }

          const notification: NotificationEvent = {
            ...data,
            timestamp: new Date(data.timestamp),
          };

          console.log('[useNotifications] Notification received:', notification);

          // Adicionar ao estado
          setNotifications((prev) => [notification, ...prev]);

          if (!notification.read) {
            setUnreadCount((prev) => prev + 1);
          }

          // Mostrar toast
          toast({
            title: notification.title,
            description: notification.message,
            variant: notification.priority === 'critical' || notification.priority === 'high'
              ? 'destructive'
              : 'default',
          });

          // Tocar som para notificações críticas/altas
          if (shouldPlaySound(notification.priority)) {
            playNotificationSound();
          }
        } catch (error) {
          console.error('[useNotifications] Error parsing notification:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('[useNotifications] SSE error:', error);
        setIsConnected(false);

        // Fechar conexão atual
        eventSource.close();
        eventSourceRef.current = null;

        // Tentar reconectar após 5 segundos
        if (shouldReconnect) {
          console.log('[useNotifications] Reconnecting in 5 seconds...');
          reconnectTimer = setTimeout(() => {
            connect();
          }, 5000);
        }
      };
    };

    // Buscar notificações iniciais
    fetchNotifications();

    // Iniciar conexão SSE
    connect();

    // Cleanup
    return () => {
      shouldReconnect = false;
      clearTimeout(reconnectTimer);

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      setIsConnected(false);
    };
  }, [fetchNotifications, playNotificationSound, toast]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
