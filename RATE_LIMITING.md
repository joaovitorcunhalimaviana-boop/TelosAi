# Rate Limiting - Sistema Pós-Operatório

## Visão Geral

Sistema de rate limiting implementado usando **Vercel KV (Redis)** com algoritmo de **Sliding Window** para controlar a taxa de requisições em endpoints públicos.

## Implementação

### Biblioteca Principal
- **Arquivo**: `lib/rate-limit.ts`
- **Dependência**: `@vercel/kv`
- **Algoritmo**: Sliding Window com contador de requisições

### Funcionalidades

#### `rateLimit(identifier, limit, window)`
Implementa controle de taxa de requisições.

**Parâmetros:**
- `identifier` (string): Identificador único (geralmente IP do cliente)
- `limit` (number): Número máximo de requisições permitidas
- `window` (number): Janela de tempo em segundos

**Retorno:**
```typescript
{
  success: boolean;      // true se dentro do limite, false se excedido
  remaining: number;     // Número de requisições restantes
  reset?: number;        // Timestamp de quando o limite será resetado
}
```

#### `getClientIP(request)`
Helper para extrair IP real do cliente, considerando proxies e CDNs.

Verifica headers na seguinte ordem:
1. `x-forwarded-for` (proxies/load balancers)
2. `x-real-ip` (nginx)
3. `cf-connecting-ip` (Cloudflare)
4. Fallback: 'unknown'

## Endpoints Protegidos

### 1. Webhooks WhatsApp (100 req/min)

**Arquivos:**
- `/app/api/webhooks/whatsapp/route.ts` (GET e POST)
- `/app/api/whatsapp/webhook/route.ts` (GET e POST)
- `/app/api/postop/webhook/route.ts` (GET e POST)

**Configuração:** 100 requisições por 60 segundos (1 minuto)

**Motivo:** Webhooks do WhatsApp Business API podem receber rajadas de mensagens, mas precisam ser protegidos contra abuse.

### 2. Registro de Usuários (5 req/hora)

**Arquivo:** `/app/api/auth/register/route.ts` (POST)

**Configuração:** 5 requisições por 3600 segundos (1 hora)

**Motivo:** Prevenir spam de registros e abuse de criação de contas.

### 3. Recuperação de Senha (3 req/hora)

**Arquivo:** `/app/api/auth/forgot-password/route.ts` (POST)

**Configuração:** 3 requisições por 3600 segundos (1 hora)

**Motivo:** Prevenir abuse do sistema de reset de senha e ataques de enumeração.

## Resposta em Caso de Limite Excedido

Quando o limite é excedido, a API retorna:

```json
{
  "error": "Too many requests"
}
```

**Status HTTP:** `429 Too Many Requests`

**Headers:**
- `X-RateLimit-Remaining: 0`
- `X-RateLimit-Reset: <timestamp>` - Quando o limite será resetado

## Estratégia Fail-Open

Em caso de erro na conexão com o Redis/KV, o sistema **permite a requisição** (fail-open) para evitar que problemas de infraestrutura bloqueiem o sistema inteiro.

Isso é implementado no try-catch da função `rateLimit()`.

## Configuração do Vercel KV

Para usar o rate limiting, você precisa:

1. Criar um database KV na Vercel
2. Vincular ao projeto
3. As variáveis de ambiente serão configuradas automaticamente:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

## Monitoramento

Logs de rate limiting aparecem no console com:
- IP bloqueado
- Timestamp
- Endpoint afetado

## Personalização

Para ajustar os limites, edite os parâmetros da função `rateLimit()` em cada endpoint:

```typescript
// Exemplo: 50 requisições por 30 segundos
const rateLimitResult = await rateLimit(ip, 50, 30);
```

## Considerações de Segurança

1. **Identificação por IP**: Pode ser contornado com proxies/VPNs, mas é adequado para a maioria dos casos
2. **Fail-Open**: Garante disponibilidade, mas pode permitir abuse em caso de falha do Redis
3. **Headers informativos**: Permitem que clientes legítimos saibam quando podem tentar novamente

## Melhorias Futuras

- [ ] Rate limiting por usuário autenticado (além de IP)
- [ ] Rate limiting adaptativo baseado em comportamento
- [ ] Whitelist de IPs confiáveis
- [ ] Métricas e dashboards de rate limiting
- [ ] Notificações quando limites são frequentemente excedidos
