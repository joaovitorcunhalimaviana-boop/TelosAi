# Dashboard Médico - Sistema de Acompanhamento Pós-Operatório

## Visão Geral

O Dashboard Médico é a interface principal do sistema de acompanhamento pós-operatório do Dr. João Vitor Viana. Ele fornece uma visão completa e em tempo real de todos os pacientes em acompanhamento após cirurgias colorretais.

## Arquivos

### `page.tsx`
Componente React principal do dashboard com interface completa e interativa.

### `actions.ts`
Server Actions do Next.js para buscar dados do banco de dados PostgreSQL via Prisma.

## Funcionalidades Implementadas

### 1. Estatísticas do Topo (Cards de Resumo)

Quatro cards principais exibindo métricas em tempo real:

- **Cirurgias Hoje**: Total de cirurgias realizadas no dia atual
- **Pacientes Ativos**: Número de pacientes em acompanhamento ativo
- **Follow-ups Hoje**: Quantidade de follow-ups pendentes ou enviados para hoje
- **Alertas Críticos**: Número de alertas de alto risco não visualizados (últimos 7 dias)

Cada card possui:
- Ícone colorido representativo
- Valor numérico grande e destacado
- Animação de hover com shadow

### 2. Seção "Pacientes em Acompanhamento"

Lista responsiva de cards de pacientes com layout em grade (1, 2 ou 3 colunas dependendo da tela).

**Cada card de paciente mostra:**

- **Nome do paciente** (título do card)
- **Tipo de cirurgia** (badge outline): Hemorroidectomia, Fístula, Fissura ou Pilonidal
- **Dia do acompanhamento** (badge secundário): D+0, D+1, D+3, D+7, etc
- **Status de acompanhamento** (badge):
  - Verde: "Ativo"
  - Cinza: "Inativo" (completed ou cancelled)
- **Data da cirurgia** formatada em português
- **Completude de dados**:
  - Porcentagem exibida em badge colorido
  - Barra de progresso visual
  - Cores: Vermelho (<40%), Amarelo (40-80%), Verde (>80%)
- **Botões de ação**:
  - "Ver Detalhes": Link para `/paciente/{id}`
  - "Completar Cadastro": Link para `/paciente/{id}/editar` (só aparece se completude < 100%)
- **Red Flags** (se existirem):
  - Card destacado com borda vermelha
  - Fundo vermelho claro
  - Badge "ALERTA" em vermelho
  - Lista das red flags detectadas (máximo 2 visíveis + contador)
  - Ícone de alerta

### 3. Filtros

Sistema completo de filtros com 4 opções:

**Por tipo de cirurgia:**
- Todos
- Hemorroidectomia
- Fístula
- Fissura
- Pilonidal

**Por status de dados:**
- Todos os status
- Incompleto (<100%)
- Completo (100%)

**Por período:**
- Todos os períodos
- Hoje
- Últimos 7 dias
- Últimos 30 dias

**Busca:**
- Campo de texto com ícone de lupa
- Busca por nome ou telefone do paciente
- Debounce de 500ms para otimização

### 4. Botão de Ação Principal

Botão grande e destacado no header:
- Texto: "+ Novo Paciente Express"
- Cor: Azul (#2563eb)
- Ícone: Plus do Lucide
- Link: `/cadastro`
- Efeito de hover

### 5. Estado Vazio

Quando não há pacientes (ou nenhum corresponde aos filtros):
- Card com borda tracejada
- Ícone grande de usuários (opacidade 50%)
- Mensagem descritiva
- Sugestão para ajustar filtros ou cadastrar novo paciente
- Botão para cadastro rápido

## Tecnologias Utilizadas

- **Next.js 16** (App Router)
- **React 19** (Server Components e Client Components)
- **TypeScript** para type safety
- **Prisma** como ORM para PostgreSQL
- **Tailwind CSS** para estilização
- **Lucide React** para ícones
- **date-fns** para formatação de datas
- **Server Actions** para buscar dados do servidor

## Componentes UI Utilizados

- `Card`, `CardHeader`, `CardTitle`, `CardContent` (componentes de card)
- `Button` (botões com variantes)
- `Input` (campo de busca)
- `Select` (dropdowns de filtro)
- `Badge` (badges coloridos)

Todos os componentes seguem o padrão shadcn/ui adaptado para o projeto.

## Fluxo de Dados

```
Dashboard Page (Client Component)
    ↓
Server Actions (actions.ts)
    ↓
Prisma Client
    ↓
PostgreSQL Database
```

### Queries Principais

1. **getDashboardStats()**: Busca estatísticas agregadas
2. **getDashboardPatients(filters)**: Busca lista de pacientes com filtros aplicados

### Performance

- Uso de `Promise.all()` para carregar stats e pacientes em paralelo
- Debounce na busca para evitar queries excessivas
- Índices no banco de dados para otimização
- Loading state enquanto carrega dados

## Estilização e Design

### Cores Principais

- **Azul** (#2563eb): Ações principais, cirurgias
- **Verde** (#16a34a): Status ativo, dados completos
- **Amarelo** (#eab308): Atenção, dados parciais
- **Vermelho** (#dc2626): Alertas, red flags, dados incompletos
- **Laranja** (#ea580c): Follow-ups pendentes

### Layout Responsivo

- **Mobile**: 1 coluna
- **Tablet (lg)**: 2 colunas
- **Desktop (xl)**: 3 colunas

### Tema

- Suporte a dark mode via Tailwind
- Gradientes sutis no background
- Bordas e shadows para profundidade

## Próximos Passos Sugeridos

1. Criar páginas de detalhes do paciente (`/paciente/[id]`)
2. Criar página de edição/completar cadastro (`/paciente/[id]/editar`)
3. Implementar sistema de notificações para alertas críticos
4. Adicionar gráficos e visualizações de dados
5. Implementar paginação para grandes volumes de pacientes
6. Adicionar exportação de relatórios
7. Implementar filtros salvos/favoritos

## Como Usar

1. Acesse `/dashboard` após autenticação
2. Visualize as estatísticas gerais no topo
3. Use os filtros para encontrar pacientes específicos
4. Clique em "Ver Detalhes" para ver informações completas
5. Clique em "Completar Cadastro" para adicionar mais dados
6. Clique em "+ Novo Paciente Express" para cadastro rápido

## Observações Importantes

- O dashboard carrega automaticamente ao montar
- Filtros aplicam-se imediatamente ao mudar
- Busca tem delay de 500ms (debounce)
- Red flags são destacadas visualmente
- Cards de pacientes com alertas têm borda vermelha
- Dados de completude abaixo de 40% são considerados críticos
