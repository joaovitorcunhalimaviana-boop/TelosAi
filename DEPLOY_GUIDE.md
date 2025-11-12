# Guia de Deploy - Telos.AI Pós-Operatório

## ✅ BUILD CONCLUÍDO COM SUCESSO!

O build do Next.js foi compilado com sucesso. Todas as 49 páginas foram geradas.

## 📋 Variáveis de Ambiente para Vercel

### Obrigatórias

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://neondb_owner:npg_F9Kb4mPoVtcB@ep-royal-voice-ae6ov58i-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"

# NextAuth - ATUALIZAR ESTAS!
NEXTAUTH_URL="https://seu-dominio.vercel.app"  # Substituir com URL da Vercel
NEXTAUTH_SECRET="<gerar-nova-chave-segura>"    # Gerar nova chave para produção
```

**Como gerar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Opcionais (adicionar conforme necessário)

```bash
# Claude AI (para análise de respostas de pacientes)
ANTHROPIC_API_KEY="sk-ant-..."

# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID="seu-phone-number-id"
WHATSAPP_ACCESS_TOKEN="seu-access-token"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="seu-verify-token"
WHATSAPP_APP_SECRET="seu-app-secret"

# Configurações do médico (opcional)
DOCTOR_PHONE="+5511999999999"
DOCTOR_EMAIL="seu@email.com"
```

## 🚀 Passos para Deploy na Vercel

### 1. Preparar o Repositório Git

```bash
git add .
git commit -m "Preparar para deploy: build corrigido e pronto para produção"
git push origin master
```

### 2. Deploy na Vercel

**Opção A: Via CLI**
```bash
npm install -g vercel
vercel login
vercel
```

**Opção B: Via Dashboard**
1. Acesse https://vercel.com
2. Clique em "Import Project"
3. Conecte seu repositório GitHub
4. Configure as variáveis de ambiente
5. Deploy!

### 3. Configurar Variáveis de Ambiente na Vercel

No dashboard da Vercel:
1. Vá em Settings → Environment Variables
2. Adicione cada variável (Name e Value)
3. Selecione os ambientes: Production, Preview, Development

### 4. Após o Deploy

1. **Atualizar NEXTAUTH_URL** para a URL final do Vercel
2. **Executar migrations do Prisma** (automático no Vercel)
3. **Criar usuário admin**:
   ```bash
   # Localmente ou via Vercel Functions
   npx ts-node scripts/create-admin-user.ts
   ```

## 📊 Status do Sistema

### ✅ Concluído
- Build do Next.js (49 páginas geradas)
- TypeScript compilado sem erros
- Correções de Suspense boundaries
- Correções de window access
- Correções de client/server components
- Database conectado (Neon PostgreSQL)

### ⏳ Pendente
- Gerar NEXTAUTH_SECRET para produção
- Adicionar ANTHROPIC_API_KEY (opcional, para Claude AI)
- Configurar WhatsApp (opcional)
- Deploy na Vercel
- Criar usuário admin em produção

## 🔧 Troubleshooting

### Erro de Database Connection
- Verificar se DATABASE_URL está correta
- Confirmar se o IP da Vercel tem acesso ao Neon

### Erro de NextAuth
- Verificar se NEXTAUTH_URL corresponde à URL real
- Verificar se NEXTAUTH_SECRET está configurado

### Funções do Claude AI não funcionam
- Adicionar ANTHROPIC_API_KEY nas variáveis de ambiente
- Verificar se a API key está ativa

## 📝 Checklist Final

- [ ] Gerar nova NEXTAUTH_SECRET
- [ ] Fazer commit e push do código
- [ ] Criar projeto na Vercel
- [ ] Configurar todas as variáveis de ambiente
- [ ] Fazer deploy
- [ ] Testar login
- [ ] Criar usuário admin
- [ ] Testar funcionalidades principais

## 🎯 Próximos Passos

1. **Gerar NEXTAUTH_SECRET seguro**
2. **Push para repositório Git**
3. **Deploy na Vercel**
4. **Testar em produção**

---

Build realizado com sucesso em: 2025-11-12
Sistema: Telos.AI Pós-Operatório
