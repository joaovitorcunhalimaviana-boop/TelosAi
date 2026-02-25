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
      critical: 'bg-red-900/40 text-red-400 border-red-700',
      high: 'bg-orange-900/40 text-orange-400 border-orange-700',
      medium: 'bg-yellow-900/40 text-yellow-400 border-yellow-700',
      low: 'bg-teal-900/40 text-teal-400 border-teal-700',
    };
    return colorMap[priority] || 'bg-[#1E2535] text-[#7A8299] border-[#2A3147]';
  };

  const getTypeColor = (type: string) => {
    if (type.startsWith('red_flag')) {
      return 'bg-red-900/40 text-red-400';
    }
    if (type.startsWith('followup')) {
      return 'bg-teal-900/40 text-teal-400';
    }
    if (type.includes('created')) {
      return 'bg-emerald-900/40 text-emerald-400';
    }
    return 'bg-[#1E2535] text-[#7A8299]';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="border-0" style={{ backgroundColor: '#111520', boxShadow: '0 0 0 1px #1E2535' }}>
        <CardHeader style={{ borderBottom: '1px solid #1E2535' }}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2" style={{ color: '#F0EAD6' }}>
                <Bell className="h-6 w-6" style={{ color: '#14BDAE' }} />
                Notificações
              </CardTitle>
              <CardDescription style={{ color: '#7A8299' }}>
                {unreadCount > 0
                  ? `${unreadCount} ${unreadCount === 1 ? 'notificação não lida' : 'notificações não lidas'}`
                  : 'Todas as notificações foram lidas'}
              </CardDescription>
            </div>

            {unreadCount > 0 && (
              <Button
                onClick={() => markAllAsRead()}
                variant="outline"
                size="sm"
                style={{ backgroundColor: '#1E2535', borderColor: '#2A3147', color: '#D8DEEB' }}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Filtros */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" style={{ color: '#7A8299' }} />
              <span className="text-sm font-medium" style={{ color: '#D8DEEB' }}>Filtros:</span>
            </div>

            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as NotificationType | 'all')}>
              <SelectTrigger className="w-[180px]" style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
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
              <SelectTrigger className="w-[180px]" style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
                <SelectItem value="all">Todas as prioridades</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={readFilter} onValueChange={(value) => setReadFilter(value as 'all' | 'read' | 'unread')}>
              <SelectTrigger className="w-[180px]" style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="unread">Não lidas</SelectItem>
                <SelectItem value="read">Lidas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de notificações */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12" style={{ color: '#7A8299' }}>
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma notificação encontrada</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={cn(
                    'transition-colors border-0 hover:bg-[#1E2535]',
                    !notification.read && 'border-l-4 border-l-[#14BDAE]'
                  )}
                  style={{
                    backgroundColor: !notification.read ? 'rgba(13, 115, 119, 0.08)' : '#161B27',
                    boxShadow: '0 0 0 1px #1E2535',
                  }}
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

                          <span className="text-xs" style={{ color: '#7A8299' }}>
                            {formatNotificationTime(notification.timestamp)}
                          </span>
                        </div>

                        {/* Título */}
                        <h3
                          className={cn(
                            'text-sm font-medium mb-1',
                            !notification.read && 'font-semibold'
                          )}
                          style={{ color: '#F0EAD6' }}
                        >
                          {notification.title}
                        </h3>

                        {/* Mensagem */}
                        <p className="text-sm" style={{ color: '#7A8299' }}>{notification.message}</p>

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
                              style={{ backgroundColor: '#1E2535', borderColor: '#2A3147', color: '#14BDAE' }}
                            >
                              <Link href={notification.actionUrl}>Ver detalhes</Link>
                            </Button>
                          )}

                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              style={{ color: '#D8DEEB' }}
                              className="hover:bg-[#1E2535]"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Marcar como lida
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Indicador de não lida */}
                      {!notification.read && (
                        <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: '#14BDAE' }} />
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
