# 🚀 Deploy - Sistema Pós-Operatório

## Informações do Sistema

- **Domínio**: https://joaovitorviana.com.br
- **Webhook WhatsApp**: https://joaovitorviana.com.br/api/postop/webhook
- **Banco**: Neon PostgreSQL
- **Hosting**: Vercel/Railway

---

## ✅ Status Atual

- ✅ Webhook configurado em `/api/postop/webhook`
- ✅ APIs Anthropic e WhatsApp prontas
- ✅ Build de produção OK
- ✅ Variáveis de ambiente configuradas

---

## 🔧 Deploy via CLI

### 1. Commit e Push
```bash
git add .
git commit -m "feat: Sistema completo configurado"
git push origin main
```

### 2. Deploy Automático

O sistema já está configurado para deploy automático:
- Commits na branch `main` trigam deploy
- Vercel/Railway detecta mudanças automaticamente
- Build e deploy acontecem automaticamente

### 3. Verificar Deploy
```bash
# Testar webhook
curl "https://joaovitorviana.com.br/api/postop/webhook?hub.mode=subscribe&hub.verify_token=meu-token-super-secreto-2024&hub.challenge=test"

# Deve retornar: test
```

---

## 🔐 Variáveis de Ambiente (Produção)

Verifique se estão configuradas na plataforma:

```bash
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://joaovitorviana.com.br
NEXTAUTH_SECRET=...
ANTHROPIC_API_KEY=sk-ant-api03-...
WHATSAPP_PHONE_NUMBER_ID=857908160740631
WHATSAPP_ACCESS_TOKEN=EAARBS2LEDjQ...
WHATSAPP_BUSINESS_ACCOUNT_ID=1699737104331443
WHATSAPP_WEBHOOK_VERIFY_TOKEN=meu-token-super-secreto-2024
WHATSAPP_VERIFY_TOKEN=meu-token-super-secreto-2024
DOCTOR_PHONE_NUMBER=5583991221599
```

---

## 📊 Webhook do WhatsApp

### Configuração Atual no Meta

```
URL de callback: https://joaovitorviana.com.br/api/postop/webhook
Verify token: meu-token-super-secreto-2024
Eventos inscritos: messages
```

**IMPORTANTE**: O webhook já está configurado! Não precisa mudar nada no Meta.

### Testar Webhook Localmente

```bash
# Terminal 1 - Rodar servidor
npm run dev

# Terminal 2 - Testar GET (verificação)
curl "http://localhost:3000/api/postop/webhook?hub.mode=subscribe&hub.verify_token=meu-token-super-secreto-2024&hub.challenge=test123"

# Deve retornar: test123
```

---

## 🧪 Testes Pós-Deploy

### 1. Teste de APIs
```bash
# Anthropic
curl -X POST https://joaovitorviana.com.br/api/test/anthropic

# WhatsApp
curl -X POST https://joaovitorviana.com.br/api/test/whatsapp
```

### 2. Teste de Login
1. Acesse: https://joaovitorviana.com.br
2. Faça login
3. Verifique dashboard

### 3. Teste de Webhook (Real)
1. Cadastre um paciente de teste com seu número
2. Registre uma cirurgia
3. Force envio de questionário (ou aguarde agendamento)
4. Responda pelo WhatsApp
5. Verifique processamento no sistema

---

## 🔄 Workflow de Desenvolvimento

### Para Fazer Mudanças

```bash
# 1. Criar branch
git checkout -b feature/nova-funcionalidade

# 2. Fazer mudanças
# ... código ...

# 3. Testar localmente
npm run build
npm run type-check

# 4. Commit
git add .
git commit -m "feat: descrição da mudança"

# 5. Push
git push origin feature/nova-funcionalidade

# 6. Abrir PR no GitHub
# 7. Após aprovação, merge para main
# 8. Deploy automático acontece
```

---

## 📈 Monitoramento

### Logs em Tempo Real

**Vercel:**
```bash
vercel logs --follow
```

**Railway:**
```bash
railway logs
```

### Ver Status do Deploy

**Vercel:**
```bash
vercel ls
```

**Railway:**
```bash
railway status
```

---

## 🆘 Troubleshooting

### Webhook não funciona

```bash
# 1. Ver logs
vercel logs | grep webhook
# ou
railway logs | grep webhook

# 2. Testar verificação
curl "https://joaovitorviana.com.br/api/postop/webhook?hub.mode=subscribe&hub.verify_token=meu-token-super-secreto-2024&hub.challenge=test"

# 3. Verificar variável de ambiente
# Vercel: https://vercel.com/dashboard/settings
# Railway: railway variables
```

### Build falha

```bash
# 1. Testar localmente
npm run build

# 2. Ver erros de tipo
npm run type-check

# 3. Corrigir erros e tentar novamente
```

### Database erro

```bash
# 1. Testar conexão
npx prisma db push

# 2. Ver dados
npx prisma studio

# 3. Migrations
npx prisma migrate deploy
```

---

## 🎯 Checklist Rápido

Antes de cada deploy:

- [ ] Build passa localmente
- [ ] Type check sem erros
- [ ] Variáveis de ambiente atualizadas
- [ ] Mudanças testadas localmente
- [ ] Commit com mensagem descritiva
- [ ] Push para branch correta

Após cada deploy:

- [ ] Verificar logs (sem erros)
- [ ] Testar rota principal
- [ ] Testar APIs
- [ ] Testar webhook (se mudou)
- [ ] Monitorar por 10-15 minutos

---

## 📞 Comandos Úteis

```bash
# Ver status do Git
git status

# Ver branches
git branch -a

# Ver últimos commits
git log --oneline -10

# Ver diff
git diff

# Build local
npm run build

# Type check
npm run type-check

# Iniciar dev server
npm run dev

# Prisma Studio
npx prisma studio

# Ver logs (Vercel)
vercel logs

# Ver deployments (Vercel)
vercel ls

# Rollback (Vercel)
vercel rollback
```

---

## 🎉 Tudo Pronto!

O sistema está configurado e pronto para deploy contínuo.

**Workflow:**
1. Faça mudanças
2. Commit
3. Push
4. Deploy automático
5. Sistema atualizado em produção

Simples assim! 🚀
