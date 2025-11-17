# Guia de Testes - Sistema de Notificações em Tempo Real

## Sistema Implementado

O sistema de notificações em tempo real foi totalmente implementado usando Server-Sent Events (SSE). Abaixo estão os detalhes da implementação e os passos para testar.

## Arquivos Criados/Modificados

### 1. Schema e Migration
- ✅ `prisma/schema.prisma` - Modelo `Notification` criado
- ✅ Migration executada: `20251117003659_add_notifications`

### 2. Tipos TypeScript
- ✅ `types/notifications.ts` - Tipos completos (NotificationType, Priority, etc)

### 3. Serviço SSE
- ✅ `lib/notifications/notification-service.ts` - Singleton com Map de conexões
- ✅ `lib/notifications/create-notification.ts` - Helper para criar notificações

### 4. APIs
- ✅ `app/api/notifications/stream/route.ts` - Endpoint SSE (GET)
- ✅ `app/api/notifications/route.ts` - CRUD (GET, POST)
- ✅ `app/api/notifications/[id]/read/route.ts` - Marcar como lida (POST)
- ✅ `app/api/notifications/mark-all-read/route.ts` - Marcar todas (POST)

### 5. Frontend
- ✅ `hooks/useNotifications.ts` - Hook para SSE e estado
- ✅ `components/notifications/NotificationBell.tsx` - Sino com badge
- ✅ `components/notifications/NotificationPanel.tsx` - Painel completo
- ✅ `app/dashboard/notifications/page.tsx` - Página de notificações
- ✅ `components/dashboard/DashboardNav.tsx` - Integrado no header

### 6. Triggers Implementados
- ✅ Red flags críticos/altos (`app/api/follow-up/analyze/route.ts`)
- ✅ Novo paciente (`app/api/pacientes/route.ts`)
- ✅ Follow-ups atrasados (`app/api/cron/check-overdue-followups/route.ts`)

## Como Testar

### 1. Verificar Conexão SSE

1. Faça login no sistema
2. Abra o DevTools (F12) → Console
3. Você deve ver: `[useNotifications] Connecting to SSE...`
4. E logo depois: `[useNotifications] SSE connection established`
5. A cada 30 segundos, verá heartbeats no console do servidor

### 2. Testar Notificação de Novo Paciente

1. Vá para a tela de cadastro de pacientes
2. Cadastre um novo paciente
3. Após salvar, você deve:
   - Ver um toast aparecendo com "Novo Paciente Cadastrado"
   - Ver o badge do sino atualizar (+1)
   - Clicar no sino e ver a notificação na lista
   - Clicar em "Ver detalhes" para ir ao perfil do paciente

### 3. Testar Red Flag Critical/High

1. Crie um follow-up para um paciente
2. Responda o questionário simulando uma situação crítica:
   - Dor nível 9-10
   - Febre alta (> 38.5°C)
   - Sangramento intenso
3. Ao analisar, o sistema deve:
   - Criar notificação com prioridade "critical"
   - Tocar um som de alerta
   - Mostrar toast vermelho (destructive)
   - Badge atualizar
   - Notificação aparecer no sino com indicador vermelho

### 4. Testar Follow-up Atrasado

1. Configure o cron job ou execute manualmente:
   ```bash
   curl -X GET http://localhost:3000/api/cron/check-overdue-followups \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```
2. Follow-ups enviados há mais de 24h sem resposta devem gerar notificações

### 5. Testar Marcar como Lida

1. Clique em uma notificação não lida
2. O indicador azul deve sumir
3. O contador no badge deve diminuir
4. Ao recarregar a página, deve continuar marcada como lida

### 6. Testar Marcar Todas como Lidas

1. Com várias notificações não lidas
2. Clique em "Marcar todas como lidas"
3. Todas devem perder o indicador azul
4. Badge deve zerar

### 7. Testar Filtros no Painel

1. Vá para `/dashboard/notifications`
2. Teste os filtros:
   - Tipo (Red Flag Critical, Novo Paciente, etc)
   - Prioridade (Crítica, Alta, Média, Baixa)
   - Status (Todas, Não lidas, Lidas)
3. Verifique se a filtragem funciona corretamente

### 8. Testar Som de Alerta

1. Crie uma notificação com prioridade "critical" ou "high"
2. Deve tocar um beep quando a notificação chegar
3. Notificações "medium" e "low" não devem tocar som

### 9. Testar Reconexão SSE

1. Pare o servidor
2. Aguarde alguns segundos
3. Reinicie o servidor
4. O cliente deve reconectar automaticamente em 5 segundos
5. Verifique no console: `[useNotifications] Reconnecting in 5 seconds...`

### 10. Testar Múltiplas Abas

1. Abra o sistema em 2 abas diferentes
2. Crie uma notificação
3. Ambas as abas devem receber a notificação simultaneamente
4. Marcar como lida em uma aba deve refletir na outra (após reload)

## Verificar Performance

### Métricas Esperadas
- Latência da notificação: **< 2 segundos**
- Heartbeat funcionando a cada 30s
- Sem memory leaks (verificar no DevTools → Performance)
- Conexões limpas quando desconectar

### Verificar Logs do Servidor
```bash
# Ver estatísticas do serviço
[NotificationService] User xyz subscribed. Total connections: 1
[NotificationService] Notification sent to user xyz: Alerta Crítico
[SSE] Connection closed for user xyz
```

## Troubleshooting

### SSE não conecta
- Verifique se está autenticado (session válida)
- Veja erros no console do browser
- Verifique logs do servidor

### Notificações não aparecem
- Verifique se a conexão SSE está ativa
- Veja console: `[useNotifications] Notification received`
- Verifique se o userId está correto

### Som não toca
- Navegador pode bloquear autoplay de áudio
- Interaja com a página primeiro (clique em qualquer lugar)
- Verifique permissões do navegador

### Badge não atualiza
- Verifique se `unreadCount` está sendo calculado corretamente
- Veja estado no React DevTools

## Critérios de Sucesso ✅

- [x] Migration executada sem erros
- [x] SSE conecta e mantém conexão
- [x] Notificações aparecem em < 2 segundos após evento
- [x] Badge de contador funciona
- [x] Sons para Critical/High
- [x] Persistência no banco de dados
- [x] 3 tipos de triggers implementados (red flags, novo paciente, overdue)
- [x] Reconexão automática
- [x] Heartbeat funcionando
- [x] Cleanup correto das conexões

## Próximos Passos (Opcional)

1. **Integração com WhatsApp**: Enviar notificações críticas via WhatsApp
2. **Push Notifications**: Implementar Web Push API para notificações nativas
3. **Email**: Notificações por email para alertas críticos
4. **Preferências**: Permitir usuário configurar quais notificações receber
5. **Snooze**: Adiar notificações para depois
6. **Histórico**: Manter histórico completo de notificações
7. **Analytics**: Dashboard de métricas de notificações

## Notas Técnicas

### Por que SSE e não WebSocket?
- SSE é unidirecional (servidor → cliente), ideal para notificações
- Mais simples de implementar e escalar
- Reconexão automática nativa
- Menor overhead que WebSocket para esse caso de uso

### Estrutura de Dados
```typescript
interface NotificationEvent {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  data?: Record<string, any>;
}
```

### Heartbeat
O heartbeat mantém a conexão viva e detecta desconexões:
- Enviado a cada 30s
- Formato: `: heartbeat\n\n` (comentário SSE)
- Navegador ignora automaticamente

## Suporte

Se encontrar problemas:
1. Verifique os logs do servidor
2. Verifique console do browser
3. Use React DevTools para ver estado do hook
4. Verifique se migration foi aplicada: `npx prisma studio`
