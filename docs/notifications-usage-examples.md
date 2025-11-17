# Exemplos de Uso - Sistema de Notificações

Este documento fornece exemplos práticos de como usar o sistema de notificações em diferentes cenários.

---

## 1. Criar Notificação Manualmente

### Uso Direto da Função Helper

```typescript
import { createNotification } from '@/lib/notifications/create-notification';

// Exemplo: Notificar médico sobre um evento customizado
await createNotification({
  userId: 'user-id-here',
  type: 'system_alert',
  title: 'Atenção Necessária',
  message: 'Um evento importante requer sua atenção',
  priority: 'high',
  actionUrl: '/dashboard/eventos',
  data: {
    eventId: 'event-123',
    eventType: 'custom',
  },
});
```

### Via API Endpoint

```typescript
// Cliente (React)
const response = await fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-id-here',
    type: 'info',
    title: 'Informação Importante',
    message: 'Seu relatório está pronto',
    priority: 'low',
    actionUrl: '/dashboard/relatorios',
  }),
});

const result = await response.json();
console.log(result); // { success: true, notification: {...} }
```

---

## 2. Usar o Hook no Frontend

### Básico

```typescript
'use client';

import { useNotifications } from '@/hooks/useNotifications';

export function MeuComponente() {
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  return (
    <div>
      <h1>Você tem {unreadCount} notificações não lidas</h1>
      {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}

      {notifications.map(notif => (
        <div key={notif.id}>
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
          {!notif.read && (
            <button onClick={() => markAsRead(notif.id)}>
              Marcar como lida
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Com Filtros Customizados

```typescript
'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { useMemo } from 'react';

export function NotificacoesCriticas() {
  const { notifications } = useNotifications();

  // Filtrar apenas notificações críticas
  const criticalNotifications = useMemo(() => {
    return notifications.filter(n => n.priority === 'critical');
  }, [notifications]);

  return (
    <div>
      <h2>Alertas Críticos ({criticalNotifications.length})</h2>
      {criticalNotifications.map(notif => (
        <div key={notif.id} className="bg-red-100 p-4">
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 3. Adicionar Triggers Personalizados

### Exemplo: Notificar quando cirurgia é agendada

```typescript
// app/api/surgeries/route.ts
import { createNotification } from '@/lib/notifications/create-notification';

export async function POST(request: NextRequest) {
  // ... criar cirurgia no banco

  const surgery = await prisma.surgery.create({
    data: {
      // ...
    },
    include: {
      patient: true,
    },
  });

  // Criar notificação
  await createNotification({
    userId: surgery.userId,
    type: 'surgery_created',
    title: 'Nova Cirurgia Agendada',
    message: `Cirurgia de ${surgery.type} agendada para ${surgery.patient.name}`,
    priority: 'medium',
    actionUrl: `/paciente/${surgery.patientId}`,
    data: {
      surgeryId: surgery.id,
      patientId: surgery.patientId,
      patientName: surgery.patient.name,
      surgeryType: surgery.type,
      surgeryDate: surgery.date,
    },
  });

  return NextResponse.json({ success: true, surgery });
}
```

### Exemplo: Notificar quando prazo se aproxima

```typescript
// app/api/cron/check-upcoming-surgeries/route.ts
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications/create-notification';

export async function GET(request: NextRequest) {
  // Buscar cirurgias nas próximas 24h
  const tomorrow = new Date();
  tomorrow.setHours(tomorrow.getHours() + 24);

  const upcomingSurgeries = await prisma.surgery.findMany({
    where: {
      date: {
        gte: new Date(),
        lte: tomorrow,
      },
      status: 'active',
    },
    include: {
      patient: true,
    },
  });

  // Notificar médico sobre cada cirurgia
  for (const surgery of upcomingSurgeries) {
    await createNotification({
      userId: surgery.userId,
      type: 'system_alert',
      title: '⏰ Cirurgia Amanhã',
      message: `Lembrete: Cirurgia de ${surgery.type} com ${surgery.patient.name} amanhã`,
      priority: 'medium',
      actionUrl: `/paciente/${surgery.patientId}`,
      data: {
        surgeryId: surgery.id,
        patientId: surgery.patientId,
        patientName: surgery.patient.name,
      },
    });
  }

  return NextResponse.json({ success: true, count: upcomingSurgeries.length });
}
```

---

## 4. Enviar para Múltiplos Usuários

### Broadcast para todos os médicos de um hospital

```typescript
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications/create-notification';

async function notifyAllDoctors(message: string) {
  // Buscar todos os médicos
  const doctors = await prisma.user.findMany({
    where: { role: 'medico' },
  });

  // Criar notificação para cada um
  await Promise.all(
    doctors.map(doctor =>
      createNotification({
        userId: doctor.id,
        type: 'system_alert',
        title: 'Comunicado Importante',
        message,
        priority: 'medium',
      })
    )
  );
}

// Uso
await notifyAllDoctors('O sistema será atualizado em 1 hora');
```

---

## 5. Notificações Condicionais

### Baseado em Preferências do Usuário

```typescript
import { createNotification } from '@/lib/notifications/create-notification';
import { prisma } from '@/lib/prisma';

async function notifyIfEnabled(
  userId: string,
  notificationType: string,
  notification: any
) {
  // Verificar preferências do usuário
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      // Supondo que você adicione campos de preferência
      notificationPreferences: true,
    },
  });

  // Se o usuário habilitou esse tipo de notificação
  if (user?.notificationPreferences?.[notificationType]) {
    await createNotification(notification);
  }
}

// Uso
await notifyIfEnabled(
  'user-123',
  'followup_overdue',
  {
    userId: 'user-123',
    type: 'followup_overdue',
    title: 'Follow-up Atrasado',
    message: 'Um paciente não respondeu ao follow-up',
    priority: 'medium',
  }
);
```

---

## 6. Notificações Agrupadas

### Consolidar múltiplas notificações similares

```typescript
import { createNotification } from '@/lib/notifications/create-notification';

async function notifyMultipleRedFlags(
  userId: string,
  redFlags: Array<{ patientName: string; flag: string }>
) {
  // Se houver muitos red flags, agrupar em uma notificação
  if (redFlags.length > 3) {
    await createNotification({
      userId,
      type: 'red_flag_high',
      title: `⚠️ ${redFlags.length} Alertas Detectados`,
      message: `Múltiplos pacientes requerem atenção urgente`,
      priority: 'high',
      actionUrl: '/dashboard/alertas',
      data: {
        redFlags,
        count: redFlags.length,
      },
    });
  } else {
    // Criar notificação individual para cada um
    for (const { patientName, flag } of redFlags) {
      await createNotification({
        userId,
        type: 'red_flag_high',
        title: `⚠️ Alerta - ${patientName}`,
        message: flag,
        priority: 'high',
        actionUrl: '/dashboard/alertas',
      });
    }
  }
}
```

---

## 7. Testar Notificações em Desenvolvimento

### Script de Teste

```typescript
// scripts/test-notifications.ts
import { createNotification } from '@/lib/notifications/create-notification';

async function testNotifications(userId: string) {
  console.log('Enviando notificações de teste...');

  // Teste 1: Critical
  await createNotification({
    userId,
    type: 'red_flag_critical',
    title: '🚨 TESTE - Alerta Crítico',
    message: 'Esta é uma notificação crítica de teste',
    priority: 'critical',
  });

  // Aguardar 2 segundos
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Teste 2: High
  await createNotification({
    userId,
    type: 'red_flag_high',
    title: '⚠️ TESTE - Alerta Alto',
    message: 'Esta é uma notificação de alta prioridade',
    priority: 'high',
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Teste 3: Info
  await createNotification({
    userId,
    type: 'info',
    title: 'ℹ️ TESTE - Informação',
    message: 'Esta é uma notificação informativa',
    priority: 'low',
  });

  console.log('✅ Testes concluídos!');
}

// Executar
// testNotifications('your-user-id');
```

### Via API Route (para facilitar testes)

```typescript
// app/api/test/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createNotification } from '@/lib/notifications/create-notification';

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Criar notificação de teste
  await createNotification({
    userId: session.user.id,
    type: 'system_alert',
    title: '🧪 Notificação de Teste',
    message: 'Esta é uma notificação de teste enviada em ' + new Date().toLocaleString(),
    priority: 'medium',
  });

  return NextResponse.json({ success: true, message: 'Notificação enviada!' });
}
```

Acesse: `POST /api/test/notifications` para enviar uma notificação de teste.

---

## 8. Monitorar Estatísticas

### Ver quantas conexões ativas

```typescript
import { notificationService } from '@/lib/notifications/notification-service';

// Em um endpoint admin
export async function GET() {
  const stats = notificationService.getStats();

  return NextResponse.json({
    totalUsers: stats.totalUsers,
    totalConnections: stats.totalConnections,
    avgConnectionsPerUser: stats.averageConnectionsPerUser,
    connectedUsers: notificationService.getConnectedUsers(),
  });
}
```

---

## 9. Limpar Notificações Antigas

### Cron job para deletar notificações lidas antigas

```typescript
// app/api/cron/cleanup-notifications/route.ts
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Deletar notificações lidas com mais de 30 dias
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await prisma.notification.deleteMany({
    where: {
      read: true,
      readAt: {
        lt: thirtyDaysAgo,
      },
    },
  });

  return NextResponse.json({
    success: true,
    deletedCount: result.count,
  });
}
```

---

## 10. Debug de Conexões SSE

### Ver conexões no DevTools

```typescript
// No hook useNotifications.ts, adicione logs detalhados:

useEffect(() => {
  const eventSource = new EventSource('/api/notifications/stream');

  eventSource.onopen = () => {
    console.log('[SSE] Conexão aberta:', {
      readyState: eventSource.readyState,
      url: eventSource.url,
    });
  };

  eventSource.onmessage = (event) => {
    console.log('[SSE] Mensagem recebida:', {
      data: event.data,
      lastEventId: event.lastEventId,
      timestamp: new Date().toISOString(),
    });
  };

  eventSource.onerror = (error) => {
    console.error('[SSE] Erro:', {
      readyState: eventSource.readyState,
      error,
      timestamp: new Date().toISOString(),
    });
  };

  return () => {
    console.log('[SSE] Fechando conexão');
    eventSource.close();
  };
}, []);
```

---

## Conclusão

Esses exemplos cobrem os casos de uso mais comuns. O sistema é flexível e pode ser adaptado para qualquer cenário de notificação em tempo real.

Para mais informações, consulte:
- `NOTIFICATIONS_TEST_GUIDE.md` - Guia de testes completo
- `IMPLEMENTATION_SUMMARY.md` - Resumo da implementação
- `types/notifications.ts` - Tipos TypeScript disponíveis
