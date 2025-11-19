# ⚡ Guia Final - 1 Minuto

A API do Cron-job.org não permite adicionar headers via PATCH. Você precisa fazer manualmente, mas é SUPER rápido (1 minuto):

---

## 🚀 Opção 1: Automático (Windows)

Execute o script:
```bash
scripts\finalizar-config.bat
```

O script vai:
1. Abrir o navegador na página certa
2. Mostrar exatamente o que copiar/colar
3. Guiar você passo a passo

---

## 📝 Opção 2: Manual (1 minuto)

### Passo 1: Adicionar Header (30 segundos)

1. Acesse: https://console.cron-job.org/jobs/6882016/edit
2. Role até **"Advanced"**
3. Clique em **"Headers"**
4. Clique em **"Add header"**
5. Preencha:
   - **Name**: `Authorization`
   - **Value**: `Bearer eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA=`
6. Clique em **"Save"**

✅ PRONTO! Job principal configurado!

### Passo 2: Criar Job de Renovação (30 segundos) - OPCIONAL

Você pode fazer depois. Só precisa em 50 dias.

1. Acesse: https://console.cron-job.org/jobs/create
2. Copie e cole:
   - **Title**: `Renovacao Token WhatsApp - 50 dias`
   - **URL**: `https://proactive-rejoicing-production.up.railway.app/api/cron/renew-whatsapp-token`
3. Configure:
   - **Request Method**: POST
   - **Timezone**: America/Sao_Paulo
   - **Primeira execução**: 08/01/2025 às 00:00
4. Em **Headers**, adicione:
   - **Name**: `Authorization`
   - **Value**: `Bearer eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA=`
5. Em **Notifications**:
   - ✅ On failure
   - ✅ On success
6. ✅ **Enable**
7. **Save**

---

## ✅ Testar

1. Acesse: https://console.cron-job.org/dashboard
2. Clique em **▶️ Run now** no job "WhatsApp Follow-ups"
3. Aguarde 5 segundos
4. Deve mostrar **Status 200** ✅

---

## 🎉 Pronto!

Depois de adicionar o header (Passo 1), está **100% funcional**!

- ✅ Railway configurado
- ✅ Variáveis de ambiente prontas
- ✅ Cron job diário funcionando
- ✅ Templates WhatsApp aprovados
- ✅ Sistema pronto para enviar follow-ups

**O Passo 2 é opcional** - você tem 50 dias para fazer! 😊

---

**Link rápido**: https://console.cron-job.org/jobs/6882016/edit

Copie e cole:
```
Bearer eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA=
```
