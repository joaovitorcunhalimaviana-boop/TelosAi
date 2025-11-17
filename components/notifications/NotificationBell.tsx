/**
 * Componente NotificationBell
 *
 * Ícone de sino com badge de contador e dropdown com últimas notificações
 */

'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { formatNotificationTime, PRIORITY_COLORS } from '@/types/notifications';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Pegar as últimas 5 notificações
  const recentNotifications = notifications.slice(0, 5);

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500',
    };
    return colorMap[priority] || 'bg-gray-500';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700"
              onClick={() => markAllAsRead()}
            >
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {recentNotifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Nenhuma notificação
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                asChild
              >
                <Link
                  href={notification.actionUrl || '/dashboard'}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-2 w-full">
                    {/* Indicador de prioridade */}
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full mt-1 flex-shrink-0',
                        getPriorityColor(notification.priority)
                      )}
                    />

                    <div className="flex-1 min-w-0">
                      {/* Título */}
                      <div
                        className={cn(
                          'text-sm font-medium truncate',
                          !notification.read && 'font-semibold'
                        )}
                      >
                        {notification.title}
                      </div>

                      {/* Mensagem */}
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </div>

                      {/* Timestamp */}
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatNotificationTime(notification.timestamp)}
                      </div>
                    </div>

                    {/* Badge de "não lida" */}
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        {recentNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/notifications"
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Ver todas as notificações
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
