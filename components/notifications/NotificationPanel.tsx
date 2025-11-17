/**
 * Componente NotificationPanel
 *
 * Painel completo de notificações com filtros e paginação
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Check, CheckCheck, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNotifications } from '@/hooks/useNotifications';
import {
  formatNotificationTime,
  NOTIFICATION_TYPE_LABELS,
  PRIORITY_LABELS,
  NotificationType,
  NotificationPriority,
} from '@/types/notifications';
import { cn } from '@/lib/utils';

export function NotificationPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | 'all'>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');

  // Filtrar notificações
  const filteredNotifications = notifications.filter((notification) => {
    if (typeFilter !== 'all' && notification.type !== typeFilter) {
      return false;
    }
    if (priorityFilter !== 'all' && notification.priority !== priorityFilter) {
      return false;
    }
    if (readFilter === 'read' && !notification.read) {
      return false;
    }
    if (readFilter === 'unread' && notification.read) {
      return false;
    }
    return true;
  });

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colorMap[priority] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getTypeColor = (type: string) => {
    if (type.startsWith('red_flag')) {
      return 'bg-red-100 text-red-800';
    }
    if (type.startsWith('followup')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (type.includes('created')) {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Bell className="h-6 w-6" />
                Notificações
              </CardTitle>
              <CardDescription>
                {unreadCount > 0
                  ? `${unreadCount} ${unreadCount === 1 ? 'notificação não lida' : 'notificações não lidas'}`
                  : 'Todas as notificações foram lidas'}
              </CardDescription>
            </div>

            {unreadCount > 0 && (
              <Button onClick={() => markAllAsRead()} variant="outline" size="sm">
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Filtros */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>

            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as NotificationType | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="red_flag_critical">Alerta Crítico</SelectItem>
                <SelectItem value="red_flag_high">Alerta Alto</SelectItem>
                <SelectItem value="red_flag_medium">Alerta Médio</SelectItem>
                <SelectItem value="followup_completed">Follow-up Respondido</SelectItem>
                <SelectItem value="followup_overdue">Follow-up Atrasado</SelectItem>
                <SelectItem value="patient_created">Novo Paciente</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as NotificationPriority | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as prioridades</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={readFilter} onValueChange={(value) => setReadFilter(value as 'all' | 'read' | 'unread')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="unread">Não lidas</SelectItem>
                <SelectItem value="read">Lidas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de notificações */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma notificação encontrada</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={cn(
                    'transition-colors hover:bg-accent/50',
                    !notification.read && 'border-l-4 border-l-blue-600 bg-blue-50/30'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Header com badges */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={cn('text-xs', getPriorityColor(notification.priority))}
                          >
                            {PRIORITY_LABELS[notification.priority]}
                          </Badge>

                          <Badge variant="outline" className={cn('text-xs', getTypeColor(notification.type))}>
                            {NOTIFICATION_TYPE_LABELS[notification.type] || notification.type}
                          </Badge>

                          <span className="text-xs text-muted-foreground">
                            {formatNotificationTime(notification.timestamp)}
                          </span>
                        </div>

                        {/* Título */}
                        <h3
                          className={cn(
                            'text-sm font-medium mb-1',
                            !notification.read && 'font-semibold'
                          )}
                        >
                          {notification.title}
                        </h3>

                        {/* Mensagem */}
                        <p className="text-sm text-muted-foreground">{notification.message}</p>

                        {/* Ações */}
                        <div className="flex items-center gap-2 mt-3">
                          {notification.actionUrl && (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (!notification.read) {
                                  markAsRead(notification.id);
                                }
                              }}
                            >
                              <Link href={notification.actionUrl}>Ver detalhes</Link>
                            </Button>
                          )}

                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Marcar como lida
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Indicador de não lida */}
                      {!notification.read && (
                        <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
