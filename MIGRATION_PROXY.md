# Migração de middleware.ts para proxy.ts (Next.js 16)

## ⚠️ Aviso de Depreciação

O Next.js 16 introduziu uma mudança importante:

```
⚠ The "middleware" file convention is deprecated.
Please use "proxy" instead.
```

**Status atual:** Seu `middleware.ts` está **FUNCIONANDO CORRETAMENTE** ✅
- Build passou sem erros
- Todas as páginas compiladas
- Middleware executando normalmente

**Você tem duas opções:**

---

## Opção 1: Manter middleware.ts (Recomendado por enquanto)

**Vantagens:**
- ✅ Já está funcionando
- ✅ Compatível com NextAuth v5
- ✅ Documentação abundante online
- ✅ Sem risco de quebrar autenticação

**Desvantagens:**
- ⚠️ Será removido em versões futuras do Next.js
- ⚠️ Warnings no build

**Quando migrar:**
- Quando NextAuth v5 sair da versão beta e adicionar suporte oficial a `proxy.ts`
- Quando Next.js 17 ou 18 remover completamente o suporte a `middleware.ts`

---

## Opção 2: Migrar para proxy.ts (Futuro)

### Diferenças entre middleware.ts e proxy.ts

| Aspecto | middleware.ts | proxy.ts |
|---------|--------------|----------|
| **Runtime padrão** | Edge Runtime | **Node.js Runtime** |
| **APIs disponíveis** | Subset limitado | Node.js completo |
| **Prisma/bcrypt** | ❌ Não suporta | ✅ Suporta |
| **Performance** | Mais rápido (edge) | Mais lento (servidor) |
| **Suporte NextAuth** | ✅ v5 beta | ⚠️ Em desenvolvimento |
| **Deploy Vercel** | Nós edge globais | Servidor principal |

### Como Migrar (Quando for o momento)

**1. Renomear arquivo:**
```bash
mv middleware.ts proxy.ts
```

**2. Atualizar código (abordagem inicial):**

```typescript
// proxy.ts
import { auth } from "@/lib/auth";

export default auth((req) => {
  // Com Node.js runtime, agora você pode usar Prisma e bcrypt aqui!
  const isLoggedIn = !!req.auth;

  // Sua lógica de autorização
  if (!isLoggedIn && !isPublicPath(req.nextUrl.pathname)) {
    return Response.redirect(new URL('/auth/login', req.url));
  }
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.ico|sw.js|manifest.json|icons).*)",
  ],
};
```

**3. Considerações importantes:**

⚠️ **CUIDADO:** Com `proxy.ts`, você está no **Node.js runtime**, não Edge Runtime!

**Implicações:**
- ✅ Pode usar Prisma Client diretamente
- ✅ Pode usar bcrypt/bcryptjs
- ✅ Pode usar todas as Node.js APIs
- ⚠️ Performance pode ser afetada (não roda em edge nodes)
- ⚠️ Latência maior para usuários distantes do servidor

---

## Comparação Técnica

### Cenário 1: Edge Runtime (middleware.ts - Atual)

```
Usuário (Brasil) → Edge Node (São Paulo) → Valida JWT → Permite acesso
                                ↓
                    Sem acesso a banco de dados
                    Sem acesso a Prisma
                    Sem acesso a bcrypt
```

**Latência:** ~10-50ms
**Vantagem:** Muito rápido, global
**Limitação:** Apenas validação de JWT

### Cenário 2: Node.js Runtime (proxy.ts - Futuro)

```
Usuário (Brasil) → Servidor Principal (us-east-1) → Valida com banco → Permite acesso
                                    ↓
                        Acesso completo a Prisma
                        Acesso completo a bcrypt
                        Acesso a todas Node.js APIs
```

**Latência:** ~100-500ms (dependendo da distância)
**Vantagem:** Funcionalidades completas
**Limitação:** Mais lento, centralizado

---

## Recomendação Atual

### Para Produção (Agora):

**✅ MANTER `middleware.ts`**

**Motivos:**
1. NextAuth v5 ainda está em beta e não tem documentação clara sobre `proxy.ts`
2. Seu código atual está funcionando perfeitamente
3. Edge Runtime é mais rápido para validação de autenticação
4. Warnings não afetam o funcionamento

**O que fazer:**
- Continuar usando `middleware.ts`
- Monitorar atualizações do Next.js e NextAuth
- Migrar quando NextAuth v5 stable for lançado com suporte a `proxy.ts`

### Para Futuro (Quando NextAuth v5 stable):

**🔄 MIGRAR para `proxy.ts`**

**Quando:**
- NextAuth v5 sair da versão beta
- Documentação oficial sobre `proxy.ts` + NextAuth
- Next.js 17+ remover suporte a `middleware.ts`

---

## Alternativa Híbrida (Avançado)

Se você precisa de acesso a banco de dados no middleware no futuro, considere esta arquitetura:

### Opção A: API Route + Edge Middleware

```typescript
// middleware.ts (Edge - validação JWT)
export { auth as middleware } from "@/lib/auth";

// app/api/verify-permissions/route.ts (Node.js - verificação complexa)
export async function POST(req: Request) {
  const { userId } = await req.json();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return Response.json({ hasPermission: user?.role === 'ADMIN' });
}
```

**Vantagens:**
- Melhor dos dois mundos
- Edge para validação rápida de JWT
- Node.js para lógica complexa quando necessário

### Opção B: Edge Runtime com Prisma Accelerate (Pago)

Se precisar de Prisma no Edge Runtime:

```typescript
// Usar Prisma Accelerate (https://www.prisma.io/data-platform/accelerate)
import { PrismaClient } from '@prisma/client/edge'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_ACCELERATE,
    },
  },
})

// Agora funciona no Edge Runtime
```

**Custo:** Plano pago do Prisma ($29-$299/mês)

---

## Checklist de Migração (Para o Futuro)

Quando decidir migrar para `proxy.ts`:

- [ ] NextAuth v5 stable foi lançado
- [ ] Documentação oficial de NextAuth sobre `proxy.ts` disponível
- [ ] Testes locais com `proxy.ts` passaram
- [ ] Performance aceitável em produção (verificar latência)
- [ ] Backup do código atual feito
- [ ] `middleware.ts` renomeado para `proxy.ts`
- [ ] Build local passou sem erros
- [ ] Deploy em ambiente de staging testado
- [ ] Todas as rotas protegidas funcionando
- [ ] Login e logout funcionando
- [ ] Redirects funcionando corretamente

---

## Recursos Adicionais

- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [Next.js Proxy Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [NextAuth v5 Docs](https://authjs.dev/)
- [Prisma Edge](https://www.prisma.io/docs/accelerate/getting-started)

---

## Conclusão

**Decisão recomendada para AGORA:**

✅ **Manter middleware.ts** até que:
1. NextAuth v5 saia da versão beta
2. Haja documentação clara sobre proxy.ts + NextAuth
3. Você tenha tempo para testar a migração adequadamente

**Seu código atual está:**
- ✅ Funcionando corretamente
- ✅ Build passando
- ✅ Compatível com Vercel
- ✅ Pronto para produção

Os warnings são apenas avisos de depreciação futura, não erros críticos.

---

**Última atualização:** Dezembro 2024
**Next.js:** 16.0.1
**NextAuth:** 5.0.0-beta.30
