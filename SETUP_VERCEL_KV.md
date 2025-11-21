# Configuração do Vercel KV para Rate Limiting

## Por Que Precisamos?

O sistema de rate limiting implementado requer um **Vercel KV (Redis)** para armazenar contadores de requisições. Sem isso, o rate limiting **não funcionará em produção**.

---

## Passo a Passo - Configuração via Dashboard

### 1. Acessar o Dashboard da Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto: **sistema-pos-operatorio**

### 2. Criar KV Database

1. No menu lateral, clique em **"Storage"**
2. Clique em **"Create Database"**
3. Selecione **"KV (Redis)"**
4. Configure:
   - **Database Name:** `rate-limit-store` (ou qualquer nome)
   - **Region:** Escolha a mais próxima do Brasil (ex: `iad1` - Washington DC)
   - **Plan:** Free (suficiente para começar)
5. Clique em **"Create"**

### 3. Conectar ao Projeto

1. Após criar, clique em **"Connect to Project"**
2. Selecione o projeto: **sistema-pos-operatorio**
3. Escolha os ambientes:
   - ✅ **Production**
   - ✅ **Preview** (opcional)
   - ❌ **Development** (não necessário)
4. Clique em **"Connect"**

**As variáveis de ambiente serão adicionadas automaticamente:**
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`
- `KV_URL`

### 4. Verificar Variáveis

Execute no terminal:
```bash
cd sistema-pos-operatorio
vercel env ls
```

Deve aparecer:
```
KV_REST_API_URL        Encrypted    Production
KV_REST_API_TOKEN      Encrypted    Production
KV_URL                 Encrypted    Production
```

### 5. Redeploy

Para ativar as variáveis:
```bash
vercel --prod
```

Ou faça um novo commit e push (Vercel fará deploy automático).

---

## Alternativa: Configuração via CLI (Upstash)

Se preferir usar CLI ou ter mais controle:

### 1. Criar conta no Upstash

1. Acesse: https://upstash.com
2. Crie uma conta gratuita
3. Crie um novo Redis database:
   - **Name:** `rate-limit-store`
   - **Region:** US East (mais próximo do Brasil em tier free)
   - **Type:** Regional

### 2. Copiar Credenciais

No dashboard do Upstash, copie:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### 3. Adicionar ao Vercel

```bash
cd sistema-pos-operatorio

# Adicionar URL
echo "UPSTASH_REDIS_REST_URL" | vercel env add KV_REST_API_URL production

# Adicionar Token
echo "UPSTASH_REDIS_REST_TOKEN" | vercel env add KV_REST_API_TOKEN production
```

### 4. Redeploy

```bash
vercel --prod
```

---

## Verificar se Está Funcionando

### 1. Após Deploy, Teste o Rate Limiting

Execute este comando para fazer 10 requisições rápidas:

```bash
for i in {1..10}; do
  curl -I https://seu-dominio.vercel.app/api/auth/register
  sleep 0.1
done
```

**Resultado esperado:**
- Primeiras 5 requisições: `200 OK` ou `400 Bad Request` (normal)
- Após 5 requisições: `429 Too Many Requests`

### 2. Verificar Headers

Em uma requisição bloqueada, deve aparecer:
```
HTTP/2 429
X-RateLimit-Remaining: 0
```

### 3. Verificar Logs

No Vercel Dashboard → Deployments → Logs, procure por:
```
Rate limit exceeded for IP: xxx.xxx.xxx.xxx
```

---

## Troubleshooting

### Problema: Rate limiting não funciona

**Causa:** Variáveis KV não configuradas

**Solução:**
1. Verifique `vercel env ls`
2. Certifique-se que `KV_REST_API_URL` e `KV_REST_API_TOKEN` existem
3. Faça redeploy: `vercel --prod`

### Problema: Error ao conectar ao Redis

**Causa:** URL ou Token inválidos

**Solução:**
1. Verifique as credenciais no Upstash ou Vercel KV
2. Reenvie as variáveis:
   ```bash
   vercel env rm KV_REST_API_URL production
   vercel env rm KV_REST_API_TOKEN production
   # Adicione novamente com valores corretos
   ```

### Problema: "kv is not defined"

**Causa:** Variáveis não carregadas no código

**Solução:**
- O código já está preparado para usar `@vercel/kv`
- Certifique-se que fez redeploy após adicionar variáveis

---

## Custos

### Vercel KV (Free Tier)
- **Requests:** 30.000/mês
- **Bandwidth:** 100MB/mês
- **Storage:** 256MB

**Estimativa de uso:** Com 1000 requisições/dia, você usará ~30k/mês = **gratuito**.

### Upstash Redis (Free Tier)
- **Requests:** 10.000/dia (300k/mês)
- **Bandwidth:** 100MB/mês
- **Storage:** 256MB

**Mais generoso que Vercel KV para tier free.**

---

## Próximos Passos

Após configurar o KV:

1. ✅ Rate limiting estará ativo em produção
2. ✅ Webhooks protegidos contra spam
3. ✅ Endpoints de autenticação protegidos
4. ✅ Sistema mais seguro

---

## Configuração Recomendada

Para este projeto, recomendo:

**Opção 1 (Mais Fácil):** Vercel KV via Dashboard
- Integração nativa
- Zero configuração
- Um clique para conectar

**Opção 2 (Mais Controle):** Upstash + Vercel
- Tier free mais generoso
- Mais flexibilidade
- Dashboard avançado com métricas

---

## Links Úteis

- Vercel KV Docs: https://vercel.com/docs/storage/vercel-kv
- Upstash: https://upstash.com
- @vercel/kv NPM: https://www.npmjs.com/package/@vercel/kv

---

**Status Atual:** ⚠️ Rate limiting implementado mas **INATIVO** (aguardando configuração KV)

**Após configurar:** ✅ Rate limiting **ATIVO** e protegendo 5 endpoints
