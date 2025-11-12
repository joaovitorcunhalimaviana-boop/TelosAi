# Guia do Dashboard Administrativo - Telos.AI

## Visão Geral

O sistema administrativo foi desenvolvido para permitir que administradores gerenciem todos os médicos e pacientes da plataforma, além de visualizar métricas financeiras e de uso.

## Acesso Administrativo

### Credenciais Admin
- **Email**: telos.ia@gmail.com
- **Role**: admin

### URLs de Acesso
- Dashboard Principal: `/admin`
- Gerenciar Médicos: `/admin/medicos`
- Gerenciar Pacientes: `/admin/pacientes`

## Funcionalidades

### 1. Dashboard Principal (`/admin`)

Exibe métricas consolidadas do sistema:

#### Métricas Principais
- **Médicos Cadastrados**: Total de médicos na plataforma
- **Pacientes Total**: Soma de todos os pacientes de todos os médicos
- **MRR (Monthly Recurring Revenue)**: Receita mensal recorrente total
- **WhatsApp Conectado**: Quantidade de médicos com WhatsApp integrado

#### Detalhamento por Plano

**Founding Members**
- Plano base: R$ 400/mês
- Paciente adicional: R$ 150
- Preço vitalício garantido

**Professional**
- Plano base: R$ 500/mês
- Paciente adicional: R$ 180

#### Ações Rápidas
- Link para gerenciar médicos
- Link para gerenciar pacientes

### 2. Gerenciar Médicos (`/admin/medicos`)

Visualização completa de todos os médicos cadastrados.

#### Funcionalidades
- **Busca**: Por nome, email ou WhatsApp
- **Filtros**: Por plano (Founding/Professional)
- **Ordenação**: Clique nas colunas para ordenar
- **Exportação**: CSV ou Excel

#### Colunas Exibidas
- Nome e email
- WhatsApp (com indicador de conexão)
- CRM e estado
- Plano (com badge colorido)
- Pacientes (atual/máximo + adicionais)
- Billing mensal (base + adicional)
- Data de cadastro

#### Estatísticas Rápidas
- Total de médicos
- Total de pacientes
- MRR total
- Pacientes adicionais totais

#### Exportação de Dados

**CSV**
- Codificação UTF-8 com BOM (compatível com Excel)
- Todas as colunas formatadas
- Billing detalhado por médico

**Excel**
- Formato .xlsx nativo
- Formatação preservada
- Pronto para análise

**Dados Exportados**:
- Nome Completo
- WhatsApp
- Email
- CRM / Estado
- Plano
- Preço Base (R$)
- Preço Adicional (R$)
- Pacientes Inclusos
- Pacientes Atuais
- Pacientes Adicionais
- Custo Adicional (R$)
- Total Mensal (R$)
- Preço Vitalício (Sim/Não)
- WhatsApp Conectado (Sim/Não)
- Total de Pacientes Cadastrados
- Total de Cirurgias
- Data de Cadastro

### 3. Gerenciar Pacientes (`/admin/pacientes`)

Visualização de todos os pacientes de todos os médicos.

#### Funcionalidades
- **Busca**: Por nome, telefone ou email
- **Filtros**: Por tipo de cirurgia
- **Ordenação**: Clique nas colunas para ordenar
- **Exportação**: CSV ou Excel

#### Colunas Exibidas
- Nome e telefone
- Idade e sexo
- Tipo de cirurgia e data
- Médico responsável (nome e email)
- Status da cirurgia (Ativo/Completo/Cancelado)
- Completude de dados (barra de progresso + porcentagem)
- Data de cadastro

#### Estatísticas Rápidas
- Total de pacientes
- Pacientes ativos
- Pacientes com cirurgia
- Completude média de dados

#### Exportação de Dados

**Dados Exportados**:
- Nome
- WhatsApp
- Email
- Idade
- Sexo
- Status (Ativo/Inativo)
- Médico Responsável
- Email do Médico
- Tipo de Cirurgia
- Data da Cirurgia
- Status da Cirurgia
- Completude de Dados (%)
- Data de Cadastro

## Sistema de Billing

### Para Médicos (`/dashboard/billing`)

Cada médico pode visualizar seu próprio billing:

#### Informações Exibidas

**Card Principal do Plano**
- Nome do plano (Founding Member ou Professional)
- Indicador de preço vitalício (se aplicável)
- Total mensal destacado

**Detalhamento de Custos**
- Plano base (com número de pacientes inclusos)
- Pacientes adicionais (se houver)
- Total calculado automaticamente

**Uso de Pacientes**
- Pacientes cadastrados vs limite do plano
- Barra de progresso visual
- Indicador de pacientes disponíveis ou excedentes

**Detalhes do Plano**
- Tipo de plano com badge
- Valor base mensal
- Pacientes inclusos
- Preço por paciente adicional
- Indicador de preço vitalício

#### Cálculo de Billing

```typescript
const incluidos = user.maxPatients;
const adicionais = Math.max(0, pacientes - incluidos);
const custoBase = Number(user.basePrice);
const custoAdicional = adicionais * Number(user.additionalPatientPrice);
const total = custoBase + custoAdicional;
```

**Exemplo 1: Founding Member sem adicionais**
- Base: R$ 400 (3 pacientes)
- Pacientes cadastrados: 2
- Adicionais: 0
- **Total: R$ 400**

**Exemplo 2: Founding Member com adicionais**
- Base: R$ 400 (3 pacientes)
- Pacientes cadastrados: 5
- Adicionais: 2 × R$ 150 = R$ 300
- **Total: R$ 700**

**Exemplo 3: Professional sem adicionais**
- Base: R$ 500 (3 pacientes)
- Pacientes cadastrados: 3
- Adicionais: 0
- **Total: R$ 500**

**Exemplo 4: Professional com adicionais**
- Base: R$ 500 (3 pacientes)
- Pacientes cadastrados: 6
- Adicionais: 3 × R$ 180 = R$ 540
- **Total: R$ 1.040**

## Navegação do Dashboard

### Para Médicos
O dashboard principal (`/dashboard`) agora inclui um botão "Meu Plano" que leva para `/dashboard/billing`.

### Para Administradores
O dashboard principal (`/dashboard`) inclui um botão "Admin Dashboard" destacado em azul que leva para `/admin`.

Administradores têm acesso a:
- Dashboard do médico (se tiverem role de médico também)
- Dashboard administrativo completo
- Todas as funcionalidades de exportação

## Segurança

### Proteção de Rotas
Todas as rotas admin são protegidas pela função `requireAdmin()` que:
1. Verifica se o usuário está autenticado
2. Verifica se o role do usuário é "admin"
3. Redireciona não-autorizados

```typescript
// Exemplo de proteção
await requireAdmin();
// Se chegar aqui, usuário é admin autenticado
```

### Middleware de Sessão
Utiliza NextAuth para gerenciamento de sessão e autenticação.

## APIs Disponíveis

### Admin APIs

#### GET `/api/admin/stats`
Retorna estatísticas gerais do sistema.

**Response**:
```json
{
  "totalMedicos": 10,
  "totalPacientes": 45,
  "foundingMembers": 3,
  "professionalMembers": 7,
  "mrr": 5500,
  "whatsappConnected": 8,
  "totalAdditionalPatients": 12,
  "avgPatientsPerDoctor": "4.5"
}
```

#### GET `/api/admin/medicos`
Lista todos os médicos com billing calculado.

**Query Parameters**:
- `search`: Busca por nome, email ou WhatsApp
- `plan`: Filtro por plano (founding, professional, all)
- `sortBy`: Campo para ordenação (default: createdAt)
- `order`: Ordem (asc, desc)

**Response**: Array de médicos com billing

#### GET `/api/admin/medicos/export`
Exporta médicos em CSV ou Excel.

**Query Parameters**:
- `format`: csv ou excel

#### GET `/api/admin/pacientes`
Lista todos os pacientes de todos os médicos.

**Query Parameters**:
- `search`: Busca por nome, telefone ou email
- `surgeryType`: Filtro por tipo de cirurgia
- `medicoId`: Filtro por médico específico

#### GET `/api/admin/pacientes/export`
Exporta pacientes em CSV ou Excel.

**Query Parameters**:
- `format`: csv ou excel

## Componentes Reutilizáveis

### MetricCard
Card para exibir métricas com ícone.

```tsx
<MetricCard
  title="Total de Médicos"
  value={10}
  icon={Users}
  description="Descrição opcional"
/>
```

### QuickLink
Card clicável para navegação rápida.

```tsx
<QuickLink
  href="/admin/medicos"
  title="Gerenciar Médicos"
  description="Ver e exportar todos os médicos"
  icon={<Users />}
/>
```

### DataTable
Tabela genérica com ordenação.

```tsx
<DataTable
  columns={columns}
  data={data}
  keyField="id"
  onRowClick={(row) => console.log(row)}
/>
```

## Dependências

### Pacotes Instalados
- `@tanstack/react-query`: Gerenciamento de estado assíncrono
- `csv-stringify`: Geração de arquivos CSV
- `xlsx`: Geração de arquivos Excel

### Instalação
```bash
npm install @tanstack/react-query csv-stringify xlsx
```

## Estrutura de Arquivos

```
app/
├── admin/
│   ├── page.tsx                          # Dashboard principal
│   ├── medicos/
│   │   └── page.tsx                      # Gerenciar médicos
│   └── pacientes/
│       └── page.tsx                      # Gerenciar pacientes
├── api/
│   └── admin/
│       ├── stats/route.ts                # API de estatísticas
│       ├── medicos/
│       │   ├── route.ts                  # API de médicos
│       │   └── export/route.ts           # Exportação médicos
│       └── pacientes/
│           ├── route.ts                  # API de pacientes
│           └── export/route.ts           # Exportação pacientes
└── dashboard/
    ├── page.tsx                          # Dashboard (wrapper)
    ├── DashboardClient.tsx               # Dashboard cliente
    └── billing/
        └── page.tsx                      # Billing do médico

components/
└── admin/
    ├── MetricCard.tsx                    # Card de métrica
    ├── QuickLink.tsx                     # Link rápido
    └── DataTable.tsx                     # Tabela genérica

lib/
└── session.ts                            # Inclui requireAdmin()
```

## Próximos Passos (Futuro)

### Funcionalidades Planejadas
1. Gráficos de evolução de MRR
2. Exportação de relatórios financeiros
3. Gestão de pagamentos integrada
4. Alertas de billing para médicos
5. Dashboard de métricas de uso por médico
6. Histórico de mudanças de plano
7. Sistema de cupons/descontos
8. Relatórios de retenção e churn

### Integrações Futuras
- Stripe/Pagar.me para pagamentos automatizados
- Notificações por email de billing
- Webhooks para eventos de pagamento
- Sistema de faturas automáticas

## Suporte

Para dúvidas ou problemas com o sistema administrativo, contate:
- Email: telos.ia@gmail.com
- Sistema: https://telos-ai.vercel.app

---

**Versão**: 1.0.0
**Última Atualização**: 2025-11-10
**Sprint**: 5 - Dashboard Admin & Sistema de Billing
