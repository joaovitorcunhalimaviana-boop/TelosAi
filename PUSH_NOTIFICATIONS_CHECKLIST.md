# Checklist de Implementação - Push Notifications

Guia rápido para ativar as notificações push no sistema.

---

## Passo 1: Variáveis de Ambiente (2 minutos)

Abra o arquivo `.env` e adicione estas 3 linhas no final:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BGy37iEIm1cnbP24-ct9ywtcFEGG99FM0Ls4C38NqQ8OTRUxwaLAo8peco9-Y4AYdaMOglUAQVhVpXHIpgAMZFA
VAPID_PRIVATE_KEY=LlJFMzTk-PVnaB8QHEDmyaBUya5DgGF_ysJxIQ9oWs0
VAPID_SUBJECT=mailto:joao@seudominio.com
```

**Altere**: `VAPID_SUBJECT` para seu email ou domínio.

- [ ] VAPID keys adicionadas ao `.env`
- [ ] VAPID_SUBJECT alterado para seu email

---

## Passo 2: Migration do Banco (1 minuto)

Execute no terminal:

```bash
cd /c/Users/joaov/sistema-pos-operatorio
npx prisma migrate dev --name add_push_subscriptions
```

**Ou**, se der erro de permissão no Windows:

```bash
npx prisma db push
```

Verificar se funcionou:
```bash
npx prisma studio
# Deve aparecer tabela "PushSubscription"
```

- [ ] Migration executada
- [ ] Tabela PushSubscription criada

---

## Passo 3: Adicionar Componente (3 minutos)

### Opção A: Layout do Dashboard

Edite: `app/dashboard/layout.tsx`

```typescript
import { EnableNotificationsPrompt } from '@/components/enable-notifications-prompt';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <EnableNotificationsPrompt />
      {children}
    </>
  );
}
```

### Opção B: Layout Principal (se não houver dashboard layout)

Edite: `app/layout.tsx` (dentro da área autenticada)

```typescript
import { EnableNotificationsPrompt } from '@/components/enable-notifications-prompt';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <EnableNotificationsPrompt />
        {children}
      </body>
    </html>
  );
}
```

- [ ] Componente adicionado ao layout

---

## Passo 4: Verificar Imports (1 minuto)

Certifique-se de que o arquivo de autenticação exporta `authOptions`:

Arquivo: `app/api/auth/[...nextauth]/route.ts`

```typescript
// Deve ter:
export const authOptions: NextAuthOptions = { ... };

// E no final:
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

Se não tiver, adicione `export` antes de `const authOptions`.

- [ ] authOptions está exportado

---

## Passo 5: Reiniciar Servidor (1 minuto)

```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

Aguarde até ver: `Ready in XXXms`

- [ ] Servidor reiniciado

---

## Passo 6: Testar (5 minutos)

### 1. Acessar Dashboard

```
http://localhost:3000/dashboard
```

### 2. Aguardar Modal (5 segundos)

Deve aparecer modal: "Ativar Notificações Push"

**Se não aparecer:**
- Abrir console (F12)
- Executar: `localStorage.clear()`
- Recarregar página

### 3. Ativar Notificações

- Clicar em "Ativar Notificações"
- Permitir quando browser pedir
- Deve aparecer notificação de teste: "Teste de Notificação"
- Toast verde: "Notificações ativadas com sucesso!"

### 4. Verificar Banco

```bash
npx prisma studio
# Tabela PushSubscription deve ter 1 registro
```

- [ ] Modal apareceu
- [ ] Permissão concedida
- [ ] Notificação de teste recebida
- [ ] Subscription no banco

---

## Passo 7: Testar Red Flag (5 minutos)

### Simular Resposta de Paciente

**Opção A: Via curl**

```bash
curl -X POST http://localhost:3000/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "field": "messages",
        "value": {
          "messages": [{
            "from": "5511999999999",
            "type": "text",
            "text": {
              "body": "Febre de 39 graus, dor muito forte, sangramento intenso"
            }
          }]
        }
      }]
    }]
  }'
```

**Opção B: Via Postman**
- POST para `http://localhost:3000/api/whatsapp/webhook`
- Body: JSON acima

### Verificar Notificação

Deve receber 2 notificações:

1. **"Paciente Respondeu"**
   - Body: "[Nome] respondeu ao questionário D+X"
   - Some automaticamente

2. **"Red Flag: [Nome]"**
   - Body: "Nível de risco HIGH detectado..."
   - **NÃO some automaticamente** (requireInteraction)

### Clicar na Notificação

- Deve abrir o app
- Deve navegar para `/paciente/[id]`

- [ ] Notificação "Paciente Respondeu" recebida
- [ ] Notificação "Red Flag" recebida
- [ ] Red Flag não some sozinha
- [ ] Clique abre app no paciente correto

---

## Problemas Comuns

### Modal não aparece

**Solução:**
```javascript
// Console do browser (F12)
localStorage.clear();
// Recarregar página
```

### Erro "VAPID keys não configuradas"

**Solução:**
1. Verificar se `.env` tem as 3 linhas
2. Reiniciar servidor: `npm run dev`

### Erro "authOptions is not defined"

**Solução:**
1. Editar `app/api/auth/[...nextauth]/route.ts`
2. Adicionar `export` antes de `const authOptions`

### Erro de Migration

**Solução:**
```bash
# Usar db push ao invés de migrate
npx prisma db push
```

### Notificação não chega

**Solução:**
1. Verificar permissão: `console.log(Notification.permission)` → deve ser "granted"
2. Verificar Service Worker: DevTools → Application → Service Workers → deve estar "activated"
3. Verificar logs do servidor

---

## Checklist Completo

### Configuração
- [ ] VAPID keys no .env
- [ ] Migration aplicada
- [ ] Componente adicionado ao layout
- [ ] authOptions exportado
- [ ] Servidor reiniciado

### Testes Básicos
- [ ] Modal aparece
- [ ] Permissão concedida
- [ ] Notificação de teste recebida
- [ ] Subscription salva no banco

### Testes Avançados
- [ ] Notificação "Paciente Respondeu" funciona
- [ ] Notificação "Red Flag" funciona
- [ ] Red Flag não some sozinha (requireInteraction)
- [ ] Clique abre app no paciente correto
- [ ] Funciona com app fechado

### Deploy (Produção)
- [ ] VAPID keys no ambiente de produção
- [ ] VAPID_SUBJECT com domínio de produção
- [ ] Migration rodada em produção
- [ ] Testado em dispositivo real (Android/iOS)

---

## Tempo Estimado

| Etapa | Tempo |
|-------|-------|
| Configuração (passos 1-5) | 8 minutos |
| Teste básico (passo 6) | 5 minutos |
| Teste avançado (passo 7) | 5 minutos |
| **Total** | **18 minutos** |

---

## Próximo Passo

Após concluir este checklist, consulte:

- **Guia completo**: `PUSH_NOTIFICATIONS_SETUP.md`
- **Guia de testes**: `PUSH_NOTIFICATIONS_TEST.md`
- **Resumo técnico**: `PUSH_NOTIFICATIONS_SUMMARY.md`

---

**Status**: Sistema pronto para uso! 🚀

Qualquer dúvida, consulte os arquivos de documentação ou os logs do servidor.
