# 🧪 Teste Rápido do WhatsApp - Primeiro Paciente

## 📱 Informações de Teste do WhatsApp

### **Número de Teste da Meta:**
```
+1 555 642 9102
```

**IMPORTANTE:** Este é um número de teste fornecido pela Meta. Use-o para testar o envio de mensagens antes de usar números reais.

### **Credenciais Atualizadas:**
- ✅ **Token de Acesso**: Atualizado no Railway
- ✅ **Phone Number ID**: `857908160740631`
- ✅ **Business Account ID**: `1699737104331443`

---

## 🎯 Teste Passo a Passo

### **1. Configurar Webhook (SE AINDA NÃO FEZ)**

```
URL: https://proactive-rejoicing-production.up.railway.app/api/whatsapp/webhook
Verify Token: meu-token-super-secreto-2024
```

Veja: `WEBHOOK-SETUP-RAPIDO.md`

---

### **2. Cadastrar Paciente de Teste**

**Acesse:** https://proactive-rejoicing-production.up.railway.app/auth/login

**Dados do paciente teste:**
- **Nome**: João Silva Teste
- **Data de Nascimento**: 01/01/1980
- **WhatsApp**: Use seu próprio número: `(83) 99122-1599`
  - **OU** número de teste Meta: `+15556429102`
- **Email**: teste@teste.com
- **Tipo de Cirurgia**: Hemorroidectomia
- **Data da Cirurgia**: **HOJE** (importante!)
- **Observações**: Paciente teste - primeiro cadastro

**⚠️ IMPORTANTE sobre o agendamento:**
- Se a cirurgia foi **HOJE**, o D+1 será **AMANHÃ**
- Se a cirurgia foi **ONTEM**, o D+1 será **HOJE** (e pode ser enviado imediatamente)
- O sistema agenda: D+1, D+2, D+3, D+5, D+7, D+10, D+14 **APÓS** a data da cirurgia

---

### **3. Testar Envio de Mensagem (Método Manual)**

#### **Opção A: Via API de Teste**

```bash
curl -X POST https://proactive-rejoicing-production.up.railway.app/api/test/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "15556429102",
    "message": "Olá! Este é um teste do sistema Telos.AI"
  }'
```

#### **Opção B: Executar Cron Manualmente**

Acesse esta URL no navegador:
```
https://proactive-rejoicing-production.up.railway.app/api/cron/send-followups
```

Isso vai:
1. Buscar follow-ups agendados para hoje
2. Enviar questionários via WhatsApp
3. Retornar resultado em JSON

---

### **4. Verificar Logs em Tempo Real**

```bash
railway logs --follow
```

**O que você deve ver:**
```
✓ Sending follow-up to patient...
✓ WhatsApp message sent successfully
✓ Follow-up marked as sent
```

---

### **5. Simular Resposta do Paciente**

Como o webhook está configurado, você pode simular uma resposta:

#### **Via curl (simulando webhook do WhatsApp):**

```bash
curl -X POST https://proactive-rejoicing-production.up.railway.app/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "1699737104331443",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "15556429102",
            "phone_number_id": "857908160740631"
          },
          "contacts": [{
            "profile": { "name": "João Silva Teste" },
            "wa_id": "15556429102"
          }],
          "messages": [{
            "from": "15556429102",
            "id": "wamid.test123",
            "timestamp": "1699999999",
            "text": {
              "body": "Dor 3, sem febre, evacuei normalmente. Tudo bem!"
            },
            "type": "text"
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

**O sistema deve:**
1. ✅ Receber a resposta
2. ✅ Analisar com IA (Claude)
3. ✅ Detectar red flags
4. ✅ Enviar resposta empática ao paciente
5. ✅ Alertar médico se necessário

---

## 📊 Checklist de Teste Completo

### **Antes de Testar:**
- [ ] Webhook configurado no Meta Console
- [ ] Token de acesso atualizado no Railway
- [ ] Railway redeploy concluído
- [ ] Login no sistema funcionando

### **Teste de Envio:**
- [ ] Paciente cadastrado com sucesso
- [ ] Follow-ups agendados (verificar no dashboard)
- [ ] Cron executado manualmente
- [ ] Mensagem enviada (verificar logs)
- [ ] Paciente recebeu mensagem (ou número de teste)

### **Teste de Recepção:**
- [ ] Webhook recebeu mensagem simulada
- [ ] IA analisou resposta
- [ ] Sistema detectou nível de risco
- [ ] Resposta empática enviada
- [ ] Médico alertado (se risco alto)

---

## 🔍 Verificação de Sucesso

### **1. No Dashboard:**
- Vá em `/dashboard`
- Veja o card do paciente "João Silva Teste"
- Clique para ver detalhes
- Verifique:
  - ✅ Follow-ups agendados (D+1 até D+14)
  - ✅ Status de envio (pending → sent)
  - ✅ Respostas recebidas (se testou)

### **2. Nos Logs:**
```bash
railway logs | grep -i "whatsapp\|follow"
```

Procure por:
- `✓ WhatsApp message sent`
- `✓ Follow-up marked as sent`
- `✓ Processing text message`
- `✓ Follow-up response processed`

### **3. No Banco de Dados (Opcional):**
```bash
railway run npx prisma studio
```

Verifique tabelas:
- `Patient` → Paciente cadastrado
- `Surgery` → Cirurgia associada
- `FollowUp` → Follow-ups agendados
- `FollowUpResponse` → Respostas recebidas (se testou)

---

## ⚠️ Troubleshooting

### **Problema: Mensagem não enviada**

**Checklist:**
1. Token de acesso está correto? → Ver `railway variables`
2. Phone Number ID está correto? → `857908160740631`
3. Número de telefone formatado? → Remover caracteres especiais
4. Railway está online? → https://proactive-rejoicing-production.up.railway.app
5. Ver logs: `railway logs`

**Erro comum:**
```json
{
  "error": {
    "message": "Invalid OAuth access token",
    "code": 190
  }
}
```
**Solução:** Token expirado ou inválido. Gere um novo no Meta Console.

### **Problema: Webhook não recebe mensagens**

**Checklist:**
1. Webhook configurado? → Meta Console
2. URL correta? → `https://proactive-rejoicing-production.up.railway.app/api/whatsapp/webhook`
3. Verify token correto? → `meu-token-super-secreto-2024`
4. Subscribed to "messages"? → Verificar no Meta Console
5. Railway está rodando? → Ver logs

### **Problema: IA não analisa respostas**

**Checklist:**
1. ANTHROPIC_API_KEY configurada? → Ver `railway variables`
2. Paciente existe no banco? → Verificar dashboard
3. Follow-up foi enviado? → Status = "sent"
4. Ver logs para erros da API Claude

---

## 🎯 Próximos Passos Após Teste Bem-Sucedido

1. ✅ **Teste com seu próprio número WhatsApp**
   - Cadastre paciente com SEU número
   - Receba questionário de verdade
   - Responda como paciente
   - Veja a mágica acontecer!

2. ✅ **Configurar cron para produção**
   - Sistema já envia automaticamente às 9h AM
   - Não precisa executar manualmente

3. ✅ **Cadastrar pacientes reais**
   - Use o fluxo normal de cadastro
   - Sistema cuida do resto automaticamente

4. 🎉 **Sistema em produção!**

---

## 📞 Números de Contato

**Seu WhatsApp (Médico):** `5583991221599`
**Número de Teste Meta:** `+1 555 642 9102`
**Sistema:** https://proactive-rejoicing-production.up.railway.app

---

**Última atualização:** 2025-11-13
**Status:** ✅ Token atualizado | ⚠️ Webhook pendente de configuração
