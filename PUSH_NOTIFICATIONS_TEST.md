# Guia de Teste - Push Notifications

Instruções passo a passo para testar as notificações push.

---

## Pré-requisitos

1. Servidor rodando: `npm run dev`
2. VAPID keys configuradas no `.env`
3. Migration aplicada: `npx prisma migrate dev --name add_push_subscriptions`
4. Componente adicionado ao layout do dashboard

---

## Teste 1: Inscrição de Notificações

### Objetivo
Verificar se o usuário consegue se inscrever para receber notificações.

### Passos

1. **Limpar localStorage** (para forçar modal aparecer):
   ```javascript
   // No console do browser (F12)
   localStorage.removeItem('notifications-prompt-dismissed');
   localStorage.removeItem('notifications-enabled');
   ```

2. **Recarregar página**:
   - Acesse `/dashboard`
   - Aguarde 5 segundos
   - Modal deve aparecer: "Ativar Notificações Push"

3. **Ativar notificações**:
   - Clique em "Ativar Notificações"
   - Browser deve pedir permissão nativa
   - Clique em "Permitir"

4. **Verificar notificação de teste**:
   - Deve aparecer notificação: "Teste de Notificação"
   - Toast de sucesso: "Notificações ativadas com sucesso!"

5. **Verificar subscription no banco**:
   ```bash
   npx prisma studio
   # Abrir tabela PushSubscription
   # Deve haver 1 registro com seu userId
   ```

### Resultado Esperado
✅ Modal aparece
✅ Permissão concedida
✅ Notificação de teste recebida
✅ Subscription salva no banco
✅ Modal não aparece novamente

---

## Teste 2: Notificação de Resposta de Paciente

### Objetivo
Verificar se notificação é enviada quando paciente responde ao questionário.

### Passos

1. **Criar paciente de teste** (se não tiver):
   - Dashboard → Cadastrar Paciente
   - Preencher dados básicos
   - Criar cirurgia (qualquer tipo)

2. **Simular resposta via WhatsApp**:

   **Opção A: Via Postman/curl**
   ```bash
   curl -X POST http://localhost:3000/api/whatsapp/webhook \
     -H "Content-Type: application/json" \
     -d '{
       "object": "whatsapp_business_account",
       "entry": [{
         "changes": [{
           "field": "messages",
           "value": {
             "messages": [{
               "from": "5511999999999",
               "type": "text",
               "text": {
                 "body": "Estou bem, dor leve"
               }
             }]
           }
         }]
       }]
     }'
   ```

   **Opção B: Via WhatsApp real**
   - Envie mensagem do número do paciente
   - Texto: "Estou bem, dor leve"

3. **Verificar notificação**:
   - Deve receber push: "Paciente Respondeu"
   - Body: "[Nome] respondeu ao questionário D+[dia]"

4. **Clicar na notificação**:
   - Deve abrir o app
   - Deve navegar para `/paciente/[id]`

### Resultado Esperado
✅ Notificação recebida
✅ Título e body corretos
✅ Clique abre app no paciente correto
✅ Funciona mesmo com app fechado

---

## Teste 3: Red Flag - Risco Alto

### Objetivo
Verificar notificação de alerta quando red flag é detectado.

### Passos

1. **Simular resposta com red flag**:

   ```bash
   curl -X POST http://localhost:3000/api/whatsapp/webhook \
     -H "Content-Type: application/json" \
     -d '{
       "object": "whatsapp_business_account",
       "entry": [{
         "changes": [{
           "field": "messages",
           "value": {
             "messages": [{
               "from": "5511999999999",
               "type": "text",
               "text": {
                 "body": "Febre de 39°C, dor intensa (9/10), sangramento muito forte"
               }
             }]
           }
         }]
       }]
     }'
   ```

2. **Verificar notificação de red flag**:
   - Deve receber push: "Red Flag: [Nome Paciente]"
   - Body: "Nível de risco HIGH/CRITICAL detectado em D+[dia]. [n] alerta(s)."
   - **requireInteraction: true** (não some sozinha)

3. **Clicar na notificação**:
   - Deve abrir app na página do paciente
   - Deve mostrar alertas de red flag

### Resultado Esperado
✅ Notificação recebida com título vermelho/urgente
✅ Notificação não some sozinha (requireInteraction)
✅ Body indica nível de risco
✅ Clique abre app no paciente correto
✅ Dashboard mostra red flag

---

## Teste 4: Múltiplos Dispositivos

### Objetivo
Verificar se notificação chega em todos os dispositivos inscritos.

### Passos

1. **Inscrever 2 dispositivos**:
   - Desktop: Chrome (localhost:3000)
   - Mobile: Chrome Android (via ngrok ou deploy)

2. **Enviar notificação**:
   - Simular resposta de paciente

3. **Verificar chegada**:
   - Desktop deve receber
   - Mobile deve receber

### Resultado Esperado
✅ Notificação chega em ambos dispositivos
✅ Clique em qualquer um abre o app

---

## Teste 5: Subscription Expirada

### Objetivo
Verificar tratamento de subscriptions inválidas/expiradas.

### Passos

1. **Desinstalar PWA** (ou limpar dados do site):
   - Chrome → Settings → Site Settings → [seu site] → Clear Data

2. **Enviar notificação**:
   - Simular resposta de paciente

3. **Verificar logs do servidor**:
   - Deve logar erro 410/404/403
   - Deve desativar subscription (isActive = false)

4. **Verificar banco**:
   ```bash
   npx prisma studio
   # PushSubscription deve ter isActive = false
   ```

### Resultado Esperado
✅ Erro capturado gracefully
✅ Subscription desativada automaticamente
✅ Não trava o fluxo de resposta do paciente

---

## Teste 6: Android vs iOS

### Android (Chrome/Edge)
1. Instalar PWA: "Add to Home Screen"
2. Conceder permissão de notificações
3. Fechar app completamente
4. Enviar notificação
5. ✅ Deve receber mesmo com app fechado

### iOS 16.4+ (Safari)
1. **Instalar PWA**: Safari → Share → "Add to Home Screen"
2. Abrir PWA instalado (não Safari normal!)
3. Conceder permissão de notificações
4. Fechar app
5. Enviar notificação
6. ✅ Deve receber (mas apenas se instalado via "Add to Home Screen")

**Nota**: No Safari normal (sem instalação), push não funciona no iOS.

---

## Teste 7: Envio Manual via API

### Objetivo
Testar endpoint de envio direto.

### Passos

1. **Obter session/token de autenticação**

2. **Enviar POST para /api/notifications/send**:
   ```bash
   curl -X POST http://localhost:3000/api/notifications/send \
     -H "Content-Type: application/json" \
     -H "Cookie: [session-cookie]" \
     -d '{
       "userId": "user-id-aqui",
       "title": "Teste Manual",
       "body": "Esta é uma notificação de teste manual",
       "url": "/dashboard",
       "requireInteraction": false
     }'
   ```

3. **Verificar resposta**:
   ```json
   {
     "success": true,
     "message": "Notificação enviada para X de Y subscriptions",
     "sent": 1,
     "failed": 0,
     "total": 1
   }
   ```

4. **Verificar notificação**:
   - Deve receber "Teste Manual"

### Resultado Esperado
✅ API retorna 200
✅ Response indica sucesso
✅ Notificação é recebida

---

## Troubleshooting

### Notificação não chega

1. **Verificar permissão**:
   ```javascript
   console.log(Notification.permission); // deve ser "granted"
   ```

2. **Verificar subscription**:
   ```javascript
   navigator.serviceWorker.ready.then(reg => {
     reg.pushManager.getSubscription().then(sub => {
       console.log('Subscription:', sub);
     });
   });
   ```

3. **Verificar Service Worker**:
   - DevTools → Application → Service Workers
   - Deve estar "activated and running"

4. **Verificar logs do servidor**:
   ```bash
   # Deve mostrar:
   [SW] Push notification sent successfully
   ```

### Modal não aparece

1. **Limpar localStorage**:
   ```javascript
   localStorage.clear();
   ```

2. **Verificar 5 segundos de delay** (timeout hardcoded)

3. **Verificar se já está inscrito**:
   ```javascript
   isSubscribedToPush().then(console.log);
   ```

### Push chega mas clique não funciona

1. **Verificar URL no payload** (deve ser relativa ou absoluta válida)
2. **Verificar Service Worker** (atualizar se necessário)
3. **Testar manualmente**:
   ```javascript
   // No Service Worker
   clients.openWindow('/paciente/123');
   ```

---

## Checklist Completo

- [ ] Inscrição funciona
- [ ] Modal aparece no primeiro acesso
- [ ] Notificação de teste é recebida
- [ ] Subscription salva no banco
- [ ] Notificação de "Paciente Respondeu" chega
- [ ] Notificação de "Red Flag" chega com requireInteraction
- [ ] Clique abre app na página correta
- [ ] Funciona com app fechado (Android)
- [ ] Funciona em múltiplos dispositivos
- [ ] Subscriptions inválidas são desativadas
- [ ] Logs do servidor estão corretos
- [ ] iOS funciona (se instalado via Add to Home Screen)
- [ ] API manual de envio funciona

---

## Próximos Passos Após Testes

1. **Deploy para produção**:
   - Adicionar VAPID keys no ambiente de produção
   - Rodar migration: `npx prisma migrate deploy`
   - Configurar VAPID_SUBJECT com domínio real

2. **Monitoramento**:
   - Adicionar analytics de notificações
   - Monitorar taxa de delivery
   - Monitorar subscriptions expiradas

3. **Melhorias opcionais**:
   - Badge count
   - Action buttons
   - Rich notifications com imagens
   - Filtros de notificação (configurações)

---

**Status**: Sistema 100% testável e pronto para validação! 🚀
