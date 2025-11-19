# Guia de Autenticacao - Telos.AI

Sistema de autenticacao completo implementado com NextAuth.js v5.

## Visao Geral

O sistema agora possui autenticacao real multi-tenant, permitindo que multiplos medicos usem a plataforma de forma isolada e segura.

### Funcionalidades Implementadas

- Login com Google OAuth 2.0
- Login com email/senha (Credentials)
- Protecao de rotas com middleware
- Sessions persistentes (JWT)
- Multi-tenancy (isolamento de dados por usuario)
- Hash seguro de senhas (bcryptjs)
- Tipos TypeScript customizados
- Redirecionamento automatico para login

## Arquivos Modificados/Criados

### Novos Arquivos

1. **middleware.ts** - Middleware de protecao de rotas
2. **next-auth.d.ts** - Tipos customizados do NextAuth
3. **GOOGLE_OAUTH_SETUP.md** - Guia de configuracao do Google OAuth
4. **scripts/create-first-user.ts** - Script para criar usuario inicial

### Arquivos Atualizados

1. **lib/auth.ts** - Configuracao principal do NextAuth
2. **auth.config.ts** - Configuracao do middleware (Edge Runtime)
3. **.env** - Variaveis de ambiente atualizadas
4. **app/api/auth/[...nextauth]/route.ts** - Rota do NextAuth
5. **app/auth/login/page.tsx** - Pagina de login (ja existia)

### APIs Atualizadas (userId real)

Todos os arquivos abaixo foram atualizados para usar `session.user.id` ao inves de `"temp-user-id"`:

- app/api/pacientes/route.ts
- app/api/pesquisas/route.ts
- app/api/pesquisas/[id]/stats/route.ts
- app/api/pesquisas/[id]/regression/route.ts
- app/api/paciente/[id]/pesquisa/route.ts
- app/cadastro/actions-dual.ts

## Configuracao Inicial

### 1. Configurar Google OAuth (Opcional)

Se voce quiser habilitar login com Google, siga o guia:
```
GOOGLE_OAUTH_SETUP.md
```

Se nao quiser usar Google OAuth agora, deixe as variaveis com valores placeholder:
```env
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID_HERE"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET_HERE"
```

### 2. Verificar Variaveis de Ambiente

Certifique-se de que o arquivo `.env` contem:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..." # Ja configurado

# Google OAuth (opcional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### 3. Criar Primeiro Usuario

Existem duas formas de criar o primeiro usuario:

#### Opcao A: Via Script (Recomendado)

```bash
npx ts-node scripts/create-first-user.ts
```

Siga as instrucoes no terminal.

#### Opcao B: Via Cadastro Web

1. Inicie o servidor: `npm run dev`
2. Acesse: `http://localhost:3000/cadastro-medico`
3. Preencha o formulario
4. Clique em "Criar conta"

## Como Funciona

### Fluxo de Autenticacao

#### Login com Credenciais (Email/Senha)

1. Usuario acessa `/auth/login`
2. Preenche email e senha
3. NextAuth verifica credenciais no banco de dados
4. Compara senha com bcrypt
5. Se valido, cria session JWT
6. Redireciona para `/dashboard`

#### Login com Google

1. Usuario clica em "Continuar com Google"
2. Redirecionado para Google OAuth
3. Usuario autoriza o aplicativo
4. Google retorna para `/api/auth/callback/google`
5. NextAuth verifica se usuario existe no banco
6. Se nao existir, cria automaticamente
7. Cria session JWT
8. Redireciona para `/dashboard`

### Protecao de Rotas

O middleware (`middleware.ts`) protege todas as rotas EXCETO:

- `/` (pagina inicial)
- `/auth/*` (login, registro, etc)
- `/api/auth/*` (endpoints NextAuth)
- `/api/webhooks/*` (webhooks externos)
- `/api/postop/webhook`
- `/api/whatsapp/webhook`
- `/api/cron/*` (cron jobs)
- `/cadastro-medico`
- `/pricing`
- `/sobre`
- `/termos`

Qualquer outra rota requer autenticacao.

### Session e JWT

```typescript
// Session estrutura
{
  user: {
    id: string              // ID do usuario no banco
    email: string           // Email
    name: string            // Nome completo
    role: string            // "medico" | "admin"
    plan: string            // "professional" | "founding"
    firstLogin: boolean     // Se e primeiro acesso
    crm?: string            // CRM (opcional)
    estado?: string         // Estado do CRM (opcional)
    maxPatients: number     // Limite de pacientes
    basePrice: number       // Preco base do plano
    additionalPatientPrice: number
    isLifetimePrice: boolean
  }
}
```

### Multi-Tenancy

Todos os endpoints de API agora verificam o `userId` da session:

```typescript
// Antes (ERRADO)
const userId = "temp-user-id"

// Depois (CORRETO)
const session = await auth()
if (!session?.user?.id) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  )
}
const userId = session.user.id
```

Isso garante que:
- Cada medico ve apenas seus proprios pacientes
- Dados sao isolados por usuario
- Nao ha vazamento de informacoes entre medicos

## Uso nas Paginas

### Server Components

```typescript
import { auth } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div>
      <h1>Bem-vindo, {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
      <p>CRM: {session.user.crm}</p>
    </div>
  )
}
```

### Client Components

```typescript
"use client"

import { useSession, signOut } from "next-auth/react"

export default function ProfileButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Carregando...</div>
  }

  if (!session) {
    return <div>Nao autenticado</div>
  }

  return (
    <div>
      <p>{session.user.name}</p>
      <button onClick={() => signOut()}>Sair</button>
    </div>
  )
}
```

### API Routes

```typescript
import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const userId = session.user.id

  // Buscar dados apenas deste usuario
  const patients = await prisma.patient.findMany({
    where: { userId }
  })

  return NextResponse.json({ patients })
}
```

### Server Actions

```typescript
"use server"

import { auth } from "@/lib/auth"

export async function createPatient(data: PatientData) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const userId = session.user.id

  const patient = await prisma.patient.create({
    data: {
      ...data,
      userId, // Multi-tenant
    }
  })

  return { success: true, patient }
}
```

## Seguranca

### Hash de Senhas

Todas as senhas sao hasheadas com `bcryptjs` (12 rounds):

```typescript
import bcrypt from "bcryptjs"

// Criar hash
const hashedPassword = await bcrypt.hash(password, 12)

// Verificar senha
const isValid = await bcrypt.compare(password, hashedPassword)
```

### JWT Secret

O `NEXTAUTH_SECRET` e usado para assinar os JWTs. **NUNCA** compartilhe este valor.

### Session Expiration

Sessions JWT expiram em 30 dias. Apos isso, o usuario precisa fazer login novamente.

## Troubleshooting

### "Unauthorized" em todas as rotas

- Verifique se `NEXTAUTH_URL` esta correto no `.env`
- Certifique-se de que o servidor foi reiniciado apos mudancas no `.env`
- Limpe cookies do navegador

### Login com Google nao funciona

- Verifique se `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estao corretos
- Confirme que o redirect URI esta configurado no Google Cloud Console
- Veja o guia completo em `GOOGLE_OAUTH_SETUP.md`

### Erro: "Cannot find module '@/lib/auth'"

- Execute `npm install` para garantir que todas as dependencias estao instaladas
- Reinicie o TypeScript server no VSCode

### Session nao persiste apos refresh

- Verifique se o `NEXTAUTH_SECRET` e o mesmo em todas as execucoes
- Certifique-se de que cookies estao habilitados no navegador

## Proximos Passos

Apos configurar a autenticacao:

1. Configure o Google OAuth (se desejar)
2. Crie o primeiro usuario
3. Faca login no sistema
4. Configure seu perfil medico
5. Comece a cadastrar pacientes!

## Recursos

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth.js v5 Beta](https://authjs.dev/getting-started/introduction)
- [Google OAuth Setup Guide](./GOOGLE_OAUTH_SETUP.md)
