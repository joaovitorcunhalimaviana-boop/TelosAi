# 🔄 CONFIGURAR RENOVAÇÃO AUTOMÁTICA DO TOKEN - CRON-JOB.ORG

**Você já tem conta no cron-job.org!** Vamos adicionar o job de renovação do token WhatsApp.

---

## 📋 PASSO A PASSO

### 1. Acessar Dashboard
✅ Você já está em: https://console.cron-job.org/dashboard

### 2. Criar Novo Cron Job

1. Clique em **"Create cronjob"** (botão azul)

2. **Preencha os dados:**

#### 📝 CONFIGURAÇÃO BÁSICA

**Title (Título):**
```
Renovar Token WhatsApp - Sistema Pós-Operatório
```

**Address (URL):**
```
https://sistema-pos-operatorio-2f4k5vz0b-joao-vitor-vianas-projects.vercel.app/api/cron/renew-whatsapp-token
```

#### ⏰ SCHEDULE (AGENDAMENTO)

**Pattern:** Selecione **"Every 1st day of month"** (Todo dia 1 do mês)

Ou configure manualmente:
- **Minute:** `0`
- **Hour:** `0` (meia-noite)
- **Day:** `1` (dia 1)
- **Month:** `*` (todos os meses)

#### 🔐 HEADERS (AUTENTICAÇÃO)

**IMPORTANTE:** Adicionar header de autenticação

Clique em **"Headers"** e adicione:

**Name (Nome):**
```
Authorization
```

**Value (Valor):**
```
Bearer eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA=
```

#### 📧 NOTIFICATIONS (NOTIFICAÇÕES)

**Recomendado:** Habilitar notificações

- ✅ **When execution fails** (Quando falhar)
- ✅ **When job is disabled** (Quando for desabilitado)
- ⚠️ **Send notification to:** [seu email]

#### ⚙️ SETTINGS (CONFIGURAÇÕES)

**Request method:** `GET`

**Request timeout:** `30` segundos

**Enabled:** ✅ (Ativado)

---

## 3. Salvar

Clique em **"Create cronjob"**

---

## ✅ VALIDAÇÃO

### Testar Imediatamente

Após criar, você verá o cron job na lista. Para testar:

1. Clique no cron job criado
2. Clique em **"Run now"** (Executar agora)
3. Aguarde a execução
4. Verifique os logs

### Resposta Esperada

**Status:** `200 OK`

**Resposta:**
```json
{
  "success": true,
  "message": "Token renewed and admin notified",
  "expiresInDays": 60,
  "timestamp": "2025-11-19T..."
}
```

### Você Receberá WhatsApp

O sistema enviará uma mensagem para **+55 83 99166-4904** com:

```
🔄 TOKEN WHATSAPP RENOVADO

✅ Renovação automática concluída com sucesso!

📅 Válido por: 60 dias
📆 Próxima renovação: ~50 dias

🔐 Novo Token (primeiros 20 caracteres):
EAATN9ORQfVcBPxMLiv...

⚠️ AÇÃO NECESSÁRIA:
1. Acesse a Vercel
2. Atualize WHATSAPP_ACCESS_TOKEN
3. Faça redeploy

🔗 Link: https://vercel.com/[seu-projeto]/settings/environment-variables
```

---

## 🔄 AUTOMAÇÃO COMPLETA

### O que acontece automaticamente:

1. **Todo dia 1 do mês às 00:00:**
   - cron-job.org executa a URL
   - Sistema renova o token no Meta
   - Novo token é gerado (válido por 60 dias)

2. **WhatsApp é enviado para você:**
   - Com o novo token
   - Instruções para atualizar na Vercel

3. **Email de notificação:**
   - Se habilitou notificações
   - Confirma execução bem-sucedida

### O que você precisa fazer manualmente:

1. **Receber WhatsApp** (todo mês no dia 1)
2. **Copiar novo token** da mensagem
3. **Atualizar na Vercel:**
   - Acessar: https://vercel.com/joao-vitor-vianas-projects/sistema-pos-operatorio/settings/environment-variables
   - Editar `WHATSAPP_ACCESS_TOKEN`
   - Colar novo token
   - Salvar
4. **Redeploy:**
   ```bash
   vercel --prod
   ```

---

## 📊 MONITORAMENTO

### No Dashboard do cron-job.org

Você verá:
- ✅ **Last execution:** Data da última execução
- ✅ **Next execution:** Próxima execução (dia 1 do próximo mês)
- ✅ **Status:** Success/Failed
- ✅ **Execution history:** Histórico de execuções

### Logs

Clique no job e vá em **"Execution history"** para ver:
- Timestamp de cada execução
- Status code (200 = sucesso)
- Tempo de resposta
- Corpo da resposta

---

## ⚠️ IMPORTANTE

### Por que não é 100% automático?

O token renovado precisa ser **atualizado nas variáveis de ambiente da Vercel**.

Infelizmente, não é possível fazer isso automaticamente por segurança. Você precisa:

1. Receber o novo token via WhatsApp
2. Atualizar manualmente na Vercel
3. Fazer redeploy

**Tempo estimado:** 2-3 minutos por mês

### Alternativa 100% Automática

Para renovação **totalmente automática** (sem intervenção manual), seria necessário:

1. **Vercel Pro** (cron jobs ilimitados) + Script que atualiza variáveis via API
2. **Solução complexa** com GitHub Actions + Vercel API + Secrets

**Recomendação:** O método atual (cron-job.org + atualização manual mensal) é **simples, confiável e grátis**.

---

## 🎯 CHECKLIST FINAL

Após configurar o cron job:

- [ ] Cron job criado no cron-job.org
- [ ] URL configurada corretamente
- [ ] Header de autorização adicionado
- [ ] Schedule configurado (dia 1 do mês)
- [ ] Notificações habilitadas
- [ ] Teste realizado com "Run now"
- [ ] WhatsApp recebido com sucesso
- [ ] Cron job está ativo (enabled)

---

## 📞 SUPORTE

### Se o teste falhar:

#### Erro 401 (Unauthorized)
- Verifique o header `Authorization`
- Deve ser: `Bearer eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA=`

#### Erro 500 (Server Error)
- Verifique os logs da Vercel: `vercel logs`
- Pode ser problema com credenciais WhatsApp

#### Timeout
- Aumente o timeout para 60 segundos
- Meta pode demorar para responder

### Comandos Úteis

**Testar manualmente via cURL:**
```bash
curl -X GET \
  "https://sistema-pos-operatorio-2f4k5vz0b-joao-vitor-vianas-projects.vercel.app/api/cron/renew-whatsapp-token" \
  -H "Authorization: Bearer eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA=" \
  -v
```

**Ver logs da Vercel:**
```bash
vercel logs --follow
```

---

## 📅 CALENDÁRIO DE RENOVAÇÃO

O cron job executará automaticamente:

- ✅ 1º de Dezembro de 2025 às 00:00
- ✅ 1º de Janeiro de 2026 às 00:00
- ✅ 1º de Fevereiro de 2026 às 00:00
- ✅ E assim por diante...

**Você receberá WhatsApp em cada execução com o novo token!**

---

## ✅ RESUMO

**O que você tem agora:**

1. ✅ **Questionário interativo funcionando** (8 perguntas)
2. ✅ **Cron job diário** para enviar questionários (Vercel)
3. ✅ **Cron job mensal** para renovar token (cron-job.org)
4. ✅ **Sistema 100% funcional**

**O que você precisa fazer:**

- **Mensalmente:** Atualizar token na Vercel (2-3 minutos)
- **Diariamente:** Nada! Tudo automático

**Custo:** R$ 0,00 (100% GRÁTIS!)

---

**Pronto para configurar?** Acesse: https://console.cron-job.org/dashboard e siga o passo a passo acima!
