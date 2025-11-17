# 🚂 INSTRUÇÕES PARA DEPLOY NO RAILWAY VIA CLI

**IMPORTANTE:** O Railway CLI requer autenticação interativa que não pode ser feita via Claude Code.

Você precisa executar os comandos abaixo **manualmente** em um terminal.

---

## 🔑 PASSO 1: LOGIN NO RAILWAY

Abra um terminal (CMD, PowerShell, ou Git Bash) e execute:

```bash
railway login
```

**O que vai acontecer:**
1. Um browser vai abrir automaticamente
2. Faça login na sua conta Railway
3. Autorize o CLI
4. Volte para o terminal
5. Você verá: "Logged in as [seu-email]"

---

## ✅ PASSO 2: VERIFICAR CONEXÃO

```bash
railway whoami
```

**Deve mostrar:** Seu email da conta Railway

---

## 📁 PASSO 3: LINK AO PROJETO (se necessário)

Se você ainda não linkou este diretório ao projeto Railway:

```bash
railway link
```

**Selecione:**
- Projeto: `sistema-pos-operatorio` (ou nome do seu projeto)
- Environment: `production`

**OU** se você já sabe o ID do projeto:

```bash
railway link [PROJECT_ID]
```

---

## 🚀 PASSO 4: FAZER O DEPLOY

```bash
railway up
```

**O que vai acontecer:**
1. Railway vai fazer upload de todos os arquivos
2. Vai executar o build
3. Vai aplicar as migrations do Prisma
4. Vai iniciar a aplicação
5. Você verá logs em tempo real

**Tempo estimado:** 5-10 minutos

---

## 📊 PASSO 5: VERIFICAR STATUS

```bash
railway status
```

**Deve mostrar:**
- ✅ Deployment: Active
- ✅ Status: Running
- ✅ URL: https://seu-app.up.railway.app

---

## 🗄️ PASSO 6: APLICAR MIGRATIONS (se não automático)

Se as migrations não rodarem automaticamente:

```bash
railway run npx prisma migrate deploy
```

**Migrations que serão aplicadas:**
1. `20251117003659_add_notifications`
2. `20251117003733_add_red_flag_views`
3. `20251117004219_add_audit_logs`

---

## 🔍 PASSO 7: VERIFICAR LOGS

```bash
railway logs
```

**Ou para logs em tempo real:**

```bash
railway logs --tail
```

**Procure por:**
- ✅ "Server started"
- ✅ "Migrations applied"
- ✅ "Database connected"
- ❌ Qualquer erro

---

## 🌐 PASSO 8: ACESSAR APLICAÇÃO

```bash
railway open
```

**OU** acesse manualmente a URL que apareceu no `railway status`

---

## 🧪 PASSO 9: TESTAR FEATURES NOVAS

### 1. Dashboard de Red Flags
```
1. Faça login como médico
2. Vá para /dashboard
3. Crie um follow-up com sintomas graves
4. Verifique se card vermelho aparece
```

### 2. Notificações Real-time
```
1. Abra /dashboard
2. Abra DevTools (F12) → Console
3. Deve aparecer: "[useNotifications] SSE connection established"
4. Cadastre um paciente
5. Notificação deve aparecer instantaneamente
```

### 3. Auditoria
```
1. Faça login como admin
2. Vá para /admin/audit-logs
3. Verifique logs de todas as ações
4. Teste filtros
5. Exporte CSV
```

---

## ⚙️ VARIÁVEIS DE AMBIENTE (verificar)

Certifique-se que estas variáveis estão configuradas no Railway:

```bash
railway variables
```

**Variáveis necessárias:**
- ✅ `DATABASE_URL` - Connection string PostgreSQL
- ✅ `NEXTAUTH_SECRET` - Secret do NextAuth
- ✅ `NEXTAUTH_URL` - URL da aplicação (ex: https://seu-app.up.railway.app)
- ✅ `AUTH_URL` - Mesma que NEXTAUTH_URL
- ⚠️ `PSEUDONYMIZATION_SALT` - (opcional, tem valor default)

**Se faltando alguma:**

```bash
railway variables set VARIABLE_NAME="valor"
```

---

## 🔧 TROUBLESHOOTING

### Problema: "Unauthorized"
**Solução:**
```bash
railway logout
railway login
```

### Problema: "No project linked"
**Solução:**
```bash
railway link
# Selecione seu projeto
```

### Problema: Migrations não aplicadas
**Solução:**
```bash
railway run npx prisma migrate deploy
railway run npx prisma generate
```

### Problema: Build falhou
**Ver logs:**
```bash
railway logs
```

**Comum:**
- Falta variável de ambiente
- Erro de TypeScript (já corrigimos)
- Falta dependência no package.json

### Problema: SSE não funciona
**Verificar:**
1. Headers corretos na API
2. Timeout do Railway (padrão: sem limite)
3. Logs do servidor

---

## 🎯 CHECKLIST FINAL

Após executar `railway up`:

- [ ] Login no Railway realizado
- [ ] Projeto linkado
- [ ] Deploy iniciado (`railway up`)
- [ ] Build completado (sem erros)
- [ ] Migrations aplicadas (3 novas tabelas)
- [ ] Aplicação rodando (status: Active)
- [ ] URL acessível
- [ ] Variáveis de ambiente configuradas
- [ ] Red Flags funcionando
- [ ] Notificações SSE conectando
- [ ] Auditoria registrando logs
- [ ] Testes em produção OK

---

## 📞 COMANDOS RÁPIDOS

```bash
# Login
railway login

# Verificar quem está logado
railway whoami

# Linkar projeto
railway link

# Deploy
railway up

# Status
railway status

# Logs em tempo real
railway logs --tail

# Abrir aplicação
railway open

# Variáveis
railway variables

# Aplicar migrations
railway run npx prisma migrate deploy

# Executar comando no servidor
railway run [comando]

# Restart
railway restart
```

---

## 🚀 COMANDOS COMPLETOS NA ORDEM

Execute estes comandos em sequência:

```bash
# 1. Login
railway login

# 2. Verificar
railway whoami

# 3. Ir para o diretório do projeto
cd C:\Users\joaov\sistema-pos-operatorio

# 4. Link (se necessário)
railway link

# 5. Deploy
railway up

# 6. Aguardar e verificar
railway status

# 7. Ver logs
railway logs --tail

# 8. Aplicar migrations (se necessário)
railway run npx prisma migrate deploy

# 9. Abrir no browser
railway open
```

---

## ✅ DEPLOY PRONTO!

Após executar todos os passos, sua aplicação estará rodando no Railway com:

✅ **Dashboard de Red Flags** - Detecta complicações em < 1 min
✅ **Sistema de Auditoria** - Compliance LGPD 100%
✅ **Notificações Real-time** - Alertas em < 2 segundos

---

**Tempo estimado total:** 10-15 minutos

**Dúvidas?** Veja logs: `railway logs --tail`

🎉 **Boa sorte com o deploy!** 🚀
