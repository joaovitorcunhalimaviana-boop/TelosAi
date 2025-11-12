# ✅ Checklist de Deploy - Sistema Pós-Operatório

Use este checklist para garantir que tudo está configurado antes do deploy.

---

## 📋 Pré-Deploy

### 1. Configurações Locais

- [ ] Arquivo `.env` criado e configurado
- [ ] Todas as variáveis de ambiente preenchidas
- [ ] Servidor de desenvolvimento rodando sem erros
- [ ] Build local funciona: `npm run build`
- [ ] Type check passa: `npm run type-check`

### 2. Banco de Dados (Neon PostgreSQL)

- [ ] Conta criada em https://neon.tech
- [ ] Projeto criado
- [ ] Database URL copiada
- [ ] Connection pooling habilitado
- [ ] Migrations executadas: `npx prisma migrate deploy`
- [ ] Prisma Client gerado: `npx prisma generate`

### 3. APIs Externas

#### Anthropic (Claude AI)
- [ ] Conta criada em https://console.anthropic.com
- [ ] API Key gerada
- [ ] Créditos disponíveis na conta
- [ ] Teste local funcionando

#### WhatsApp Business API
- [ ] App criado no Meta for Developers
- [ ] WhatsApp Business API adicionado ao app
- [ ] Número de telefone configurado (teste ou produção)
- [ ] Phone Number ID copiado
- [ ] Access Token gerado e copiado
- [ ] Business Account ID copiado
- [ ] Verify Token criado (string aleatória)
- [ ] Teste local funcionando (opcional)

### 4. Git & GitHub

- [ ] Repositório Git inicializado: `git init`
- [ ] Commit inicial criado
- [ ] Repositório criado no GitHub
- [ ] Remote adicionado: `git remote add origin ...`
- [ ] Push inicial: `git push -u origin main`
- [ ] Arquivo `.env` no `.gitignore` (IMPORTANTE!)
- [ ] Arquivo `.env.example` commitado

---

## 🚀 Deploy na Vercel

### 1. Conta e Projeto

- [ ] Conta criada em https://vercel.com
- [ ] Projeto importado do GitHub
- [ ] Build settings corretos (auto-detectado para Next.js)

### 2. Variáveis de Ambiente

Configure TODAS essas variáveis na Vercel:

- [ ] `DATABASE_URL`
- [ ] `NEXTAUTH_SECRET`
- [ ] `NEXTAUTH_URL` (será atualizado após primeiro deploy)
- [ ] `ANTHROPIC_API_KEY`
- [ ] `WHATSAPP_PHONE_NUMBER_ID`
- [ ] `WHATSAPP_ACCESS_TOKEN`
- [ ] `WHATSAPP_BUSINESS_ACCOUNT_ID`
- [ ] `WHATSAPP_VERIFY_TOKEN`
- [ ] `DOCTOR_PHONE_NUMBER`

**Importante:** Marcar "Production", "Preview" e "Development" para todas

### 3. Primeiro Deploy

- [ ] Deploy iniciado
- [ ] Build concluído sem erros
- [ ] URL do deploy anotada (ex: `https://seu-app.vercel.app`)
- [ ] Site acessível na URL

### 4. Atualizar NEXTAUTH_URL

- [ ] Editar variável `NEXTAUTH_URL` na Vercel
- [ ] Atualizar com URL real: `https://seu-app.vercel.app`
- [ ] Redeploy realizado

---

## 🔧 Pós-Deploy

### 1. Configurar Webhook do WhatsApp

- [ ] Acessar Meta for Developers
- [ ] Ir em WhatsApp → Configuration
- [ ] Configurar Callback URL: `https://seu-app.vercel.app/api/webhook/whatsapp`
- [ ] Configurar Verify Token (mesmo do .env)
- [ ] Webhook verificado com sucesso ✅
- [ ] Inscrever em eventos: `messages`
- [ ] Salvar configuração

### 2. Testar o Sistema

#### Login e Dashboard
- [ ] Página inicial carrega
- [ ] Login funciona
- [ ] Dashboard exibe corretamente
- [ ] Navegação funciona

#### APIs
- [ ] Acessar `/dashboard/settings/api-config`
- [ ] Testar Anthropic API (botão verde ✅)
- [ ] Testar WhatsApp API (botão verde ✅)

#### Funcionalidades Principais
- [ ] Cadastrar paciente funciona
- [ ] Registrar cirurgia funciona
- [ ] Listar pacientes funciona
- [ ] Visualizar detalhes funciona

#### Integração WhatsApp (Teste Real)
- [ ] Cadastrar paciente com seu número de teste
- [ ] Registrar cirurgia
- [ ] Enviar questionário manualmente (ou agendar)
- [ ] Receber mensagem no WhatsApp
- [ ] Responder mensagem
- [ ] Sistema processa resposta
- [ ] Recebe resposta automática do sistema
- [ ] Verifica análise no dashboard

---

## 📊 Monitoramento Inicial

### Primeira Semana

- [ ] Verificar logs da Vercel diariamente
- [ ] Monitorar erros e warnings
- [ ] Verificar uso do banco Neon
- [ ] Verificar créditos Anthropic
- [ ] Verificar mensagens WhatsApp enviadas
- [ ] Coletar feedback dos usuários

### Ajustes Comuns

- [ ] Ajustar parsing de respostas dos pacientes
- [ ] Ajustar prompts da IA se necessário
- [ ] Ajustar detecção de red flags
- [ ] Melhorar respostas empáticas
- [ ] Otimizar performance

---

## 🔒 Segurança

### Variáveis de Ambiente

- [ ] `.env` está no `.gitignore`
- [ ] Nunca commitou `.env` no Git
- [ ] Tokens e secrets são fortes
- [ ] Access tokens têm expiração configurada

### Banco de Dados

- [ ] Connection pooling habilitado
- [ ] Queries otimizadas
- [ ] Índices criados onde necessário

### WhatsApp

- [ ] Verificar assinatura de requisições (opcional)
- [ ] Rate limiting configurado (opcional)
- [ ] Mensagens duplicadas tratadas (opcional)

---

## 📈 Melhorias Futuras (Opcional)

### Funcionalidades

- [ ] Dashboard de analytics
- [ ] Relatórios exportáveis
- [ ] Histórico de mensagens
- [ ] Múltiplos médicos/usuários
- [ ] Templates de questionários customizáveis
- [ ] Notificações por email
- [ ] App mobile

### Infraestrutura

- [ ] Monitoring (Sentry, LogRocket)
- [ ] Analytics (Google Analytics, Plausible)
- [ ] CDN para assets
- [ ] Cache de API responses
- [ ] Backup automático do banco

### Testes

- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes E2E
- [ ] CI/CD pipeline

---

## 🆘 Em Caso de Problemas

### Build Falha

1. Verificar logs da Vercel
2. Rodar `npm run build` localmente
3. Corrigir erros de TypeScript
4. Commit e push novamente

### Webhook Não Funciona

1. Ver `WEBHOOK-WHATSAPP.md`
2. Testar URL manualmente
3. Verificar logs da Vercel
4. Reconfigurar no Meta

### Banco de Dados Erro

1. Verificar DATABASE_URL
2. Testar conexão local
3. Verificar IP whitelist no Neon
4. Rodar migrations: `npx prisma migrate deploy`

### API Erro (Anthropic ou WhatsApp)

1. Verificar variáveis de ambiente
2. Verificar créditos/quota
3. Testar APIs individualmente
4. Ver documentação oficial

---

## ✅ Deploy Completo!

Se você marcou todos os itens acima, parabéns! 🎉

Seu sistema está:
- ✅ Deployado na Vercel
- ✅ Conectado ao banco de dados
- ✅ Integrado com Claude AI
- ✅ Integrado com WhatsApp
- ✅ Pronto para uso em produção

**Próximos passos:**
1. Compartilhar com a equipe
2. Cadastrar pacientes reais
3. Monitorar primeiros dias
4. Coletar feedback
5. Iterar e melhorar

---

## 📞 Suporte

- **Documentação do Projeto**: Ver arquivos `.md` na raiz
- **Vercel**: https://vercel.com/docs
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **Anthropic**: https://docs.anthropic.com
- **WhatsApp**: https://developers.facebook.com/docs/whatsapp

Boa sorte! 🚀
