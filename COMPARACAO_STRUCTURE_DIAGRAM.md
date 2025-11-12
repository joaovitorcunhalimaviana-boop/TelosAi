# Diagrama de Estrutura - Análise Comparativa de Grupos

## Arquitetura Visual

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ANÁLISE COMPARATIVA DE GRUPOS                   │
│                   /dashboard/pesquisas/[id]/comparacao              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
            ┌───────▼────────┐              ┌───────▼────────┐
            │   FRONTEND     │              │   BACKEND      │
            │   (React)      │◄────────────►│   (Next.js)    │
            └────────────────┘              └────────────────┘
                    │                               │
        ┌───────────┼───────────┐          ┌────────┴────────┐
        │           │           │          │                 │
   ┌────▼───┐  ┌───▼────┐ ┌───▼────┐ ┌───▼────┐      ┌────▼────┐
   │ Matrix │  │ Stats  │ │ Charts │ │  API   │      │ Database│
   │  View  │  │ Analysis│ │  View  │ │ Routes │      │ (Prisma)│
   └────────┘  └────────┘ └────────┘ └────────┘      └─────────┘
```

## Fluxo de Dados

```
┌─────────┐
│  USER   │
└────┬────┘
     │
     │ 1. Navigate to /comparacao
     ▼
┌──────────────────┐
│  Page Component  │
└────┬─────────────┘
     │
     │ 2. useEffect -> loadData()
     ▼
┌──────────────────┐
│  API Fetch       │
├──────────────────┤
│ GET /api/        │
│ pesquisas/[id]   │
└────┬─────────────┘
     │
     │ 3. Fetch comparison data
     ▼
┌──────────────────┐
│  API Fetch       │
├──────────────────┤
│ GET /api/        │
│ pesquisas/[id]/  │
│ comparacao       │
└────┬─────────────┘
     │
     │ 4. Return GroupData[]
     ▼
┌──────────────────┐
│  setState()      │
├──────────────────┤
│ - research       │
│ - groups         │
│ - loading: false │
└────┬─────────────┘
     │
     │ 5. Generate AI insights
     ▼
┌──────────────────┐
│ generateAI       │
│ Insights()       │
└────┬─────────────┘
     │
     │ 6. Render UI
     ▼
┌──────────────────────────────────┐
│  UI Components                    │
├──────────────────────────────────┤
│ ┌──────────────────────────────┐ │
│ │  Header + Controls           │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │  AI Insights Panel           │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │  Group Toggle                │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │  Comparison Matrix (Table)   │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │  Statistical Analysis (Tabs) │ │
│ │  ├─ Effect Size              │ │
│ │  ├─ Confidence Intervals     │ │
│ │  └─ Power Analysis           │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │  Outcome Comparisons         │ │
│ │  ├─ Pain Trajectory          │ │
│ │  ├─ Complications            │ │
│ │  ├─ Recovery Time            │ │
│ │  └─ Satisfaction             │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │  Subgroup Analysis           │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │  Publication Tools           │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
     │
     │ 7. User interaction
     ▼
┌──────────────────┐
│  Export Actions  │
├──────────────────┤
│ - PNG images     │
│ - APA table      │
│ - CONSORT        │
│ - Citation       │
└──────────────────┘
```

## Componentes Hierárquicos

```
ComparacaoPage
│
├── Header
│   ├── Title
│   ├── Description
│   └── Actions
│       ├── Toggle AI Insights Button
│       └── Copy Citation Button
│
├── AI Insights Panel (conditional)
│   └── Insight Cards[]
│
├── Group Controls Card
│   └── Group Toggle Buttons[]
│
├── Comparison Matrix Card (ref)
│   ├── Export Button
│   └── Table
│       ├── Header Row
│       ├── Demographics Section
│       ├── Surgical Data Section
│       ├── Outcomes Section
│       └── Follow-up Section
│
├── Statistical Analysis Card (ref)
│   ├── Export Button
│   └── Tabs
│       ├── Effect Size Tab
│       │   └── Comparison Cards[]
│       ├── Confidence Intervals Tab
│       │   └── Group CI Cards[]
│       └── Power Analysis Tab
│           ├── Power Display
│           ├── Parameters
│           └── Recommendation
│
├── Outcome Comparisons Card (ref)
│   ├── Outcome Selector
│   ├── Export Button
│   └── Chart (dynamic based on selection)
│       ├── Pain Trajectory Chart
│       ├── Complications Chart
│       ├── Recovery Chart
│       └── Satisfaction Chart
│
├── Subgroup Analysis Card
│   ├── Subgroup Selector
│   └── Stratified Results (dynamic)
│       ├── Age Groups
│       ├── Sex Groups
│       └── Comorbidity Groups
│
└── Publication Tools Card
    ├── Export APA Table Button
    ├── Generate CONSORT Button
    ├── Export Figure 1 Button
    ├── Export Figure 2 Button
    └── Citation Display
```

## Estado do Componente

```
State Management
│
├── research: Research | null
│   └── Dados básicos da pesquisa
│
├── groups: GroupData[]
│   └── Array de todos os grupos com dados
│
├── loading: boolean
│   └── Estado de carregamento
│
├── selectedOutcome: string
│   └── 'pain' | 'complications' | 'recovery' | 'satisfaction'
│
├── selectedSubgroup: string
│   └── 'all' | 'age' | 'sex' | 'comorbidity'
│
├── visibleGroups: Set<string>
│   └── IDs dos grupos visíveis
│
├── aiInsights: string[]
│   └── Array de insights gerados
│
└── showAiInsights: boolean
    └── Controle de visibilidade do painel
```

## Refs para Exportação

```
Refs
│
├── comparisonMatrixRef
│   └── <div> da matriz de comparação
│
├── statisticalAnalysisRef
│   └── <div> da análise estatística
│
└── outcomesChartRef
    └── <div> dos gráficos de desfechos
```

## Funções Principais

```
Functions
│
├── Data Loading
│   ├── loadData()
│   └── generateAiInsights()
│
├── Statistical Calculations
│   ├── calculateMean()
│   ├── calculateSD()
│   ├── calculateMedian()
│   ├── calculatePercentile()
│   ├── calculateTTest()
│   ├── calculateCohenD()
│   └── calculateCI()
│
├── UI Controls
│   ├── toggleGroupVisibility()
│   ├── getVisibleGroups()
│   └── Event handlers
│
└── Export Functions
    ├── exportAsImage()
    ├── exportAPATable()
    ├── generateCONSORT()
    └── copyCitation()
```

## API Endpoints

```
API Routes
│
├── /api/pesquisas/[id]
│   ├── Method: GET
│   ├── Auth: Required
│   ├── Returns: Research data
│   └── Handler: route.ts
│
└── /api/pesquisas/[id]/comparacao
    ├── Method: GET
    ├── Auth: Required
    ├── Returns: Comparison data
    └── Handler: comparacao/route.ts
```

## Fluxo de Exportação

```
Export Flow
│
├── Export as Image (PNG)
│   ├── 1. Get ref element
│   ├── 2. html2canvas(element)
│   ├── 3. Convert to PNG
│   ├── 4. Create download link
│   └── 5. Trigger download
│
├── Export APA Table (TXT)
│   ├── 1. Build text string
│   ├── 2. Format APA style
│   ├── 3. Create Blob
│   ├── 4. Create download link
│   └── 5. Trigger download
│
├── Generate CONSORT (TXT)
│   ├── 1. Build flow diagram
│   ├── 2. ASCII art format
│   ├── 3. Create Blob
│   ├── 4. Create download link
│   └── 5. Trigger download
│
└── Copy Citation
    ├── 1. Format APA citation
    ├── 2. Copy to clipboard
    └── 3. Show toast
```

## Interação do Usuário

```
User Interactions
│
├── Navigation
│   └── Click "Voltar" → router.back()
│
├── View Controls
│   ├── Toggle Group → toggleGroupVisibility()
│   ├── Select Outcome → setSelectedOutcome()
│   └── Select Subgroup → setSelectedSubgroup()
│
├── AI Insights
│   └── Toggle Panel → setShowAiInsights()
│
├── Tabs Navigation
│   └── Switch Tab → Tabs component
│
└── Export Actions
    ├── Export Matrix → exportAsImage(matrixRef)
    ├── Export Stats → exportAsImage(statsRef)
    ├── Export Charts → exportAsImage(chartsRef)
    ├── APA Table → exportAPATable()
    ├── CONSORT → generateCONSORT()
    └── Citation → copyCitation()
```

## Tipos de Dados

```
Data Types
│
├── GroupData
│   ├── id: string
│   ├── groupCode: string
│   ├── groupName: string
│   ├── description: string
│   ├── patientCount: number
│   ├── demographics: {...}
│   ├── baseline: {...}
│   ├── surgical: {...}
│   ├── outcomes: {...}
│   └── followUp: {...}
│
├── Research
│   ├── id: string
│   ├── title: string
│   ├── description: string
│   ├── surgeryType: string | null
│   ├── isActive: boolean
│   ├── startDate: string
│   └── totalPatients: number
│
└── ComparisonAnalysis
    ├── metric: string
    ├── groups: {...}
    ├── pValue: number
    ├── significant: boolean
    └── effectSize?: number
```

## Segurança e Autorização

```
Security Flow
│
├── 1. Request arrives at API
│
├── 2. getServerSession(authOptions)
│   └── Verify user is logged in
│
├── 3. Extract researchId from params
│
├── 4. Query database for research
│
├── 5. Verify research.userId === session.user.id
│   └── Ensure user owns the research
│
├── 6. If authorized → Return data
│
└── 7. If not → Return 401/403
```

## Performance Considerations

```
Performance
│
├── Data Loading
│   ├── Single fetch on mount
│   ├── No polling
│   └── Cache in state
│
├── Calculations
│   ├── On-demand (not pre-computed)
│   ├── Memoization potential
│   └── Light computational load
│
├── Rendering
│   ├── Conditional rendering
│   ├── Refs prevent re-renders on export
│   └── Tab lazy loading
│
└── Export
    ├── html2canvas async
    ├── Blob creation
    └── Local download (no upload)
```

## Responsividade

```
Responsive Design
│
├── Container
│   └── max-w-7xl + padding
│
├── Grid Layouts
│   ├── grid-cols-2/3/4
│   └── Flex on mobile
│
├── Tables
│   └── overflow-x-auto
│
├── Cards
│   └── Stack on mobile
│
└── Charts
    └── Height-based scaling
```

## Cores e Tema

```
Color Scheme
│
├── Primary: #0A2647 (Navy Blue)
├── Secondary: #144272
├── Accent: #205295
├── Light: #2C74B3
│
├── Success: Green-500/600
├── Warning: Yellow-500/600
├── Error: Red-500/600
│
├── Background: White/Gray-50
├── Text: Gray-700/900
└── Border: Gray-200/300
```

---

## Diagrama de Casos de Uso

```
┌─────────────┐
│ Pesquisador │
└──────┬──────┘
       │
       ├──► Visualizar comparação entre grupos
       │
       ├──► Analisar estatísticas
       │    ├─► Ver tamanho de efeito
       │    ├─► Ver intervalos de confiança
       │    └─► Avaliar poder estatístico
       │
       ├──► Comparar desfechos
       │    ├─► Trajetória de dor
       │    ├─► Taxa de complicações
       │    ├─► Tempo de recuperação
       │    └─► Satisfação
       │
       ├──► Realizar análise de subgrupos
       │    ├─► Por idade
       │    ├─► Por sexo
       │    └─► Por comorbidades
       │
       ├──► Ver insights de IA
       │
       └──► Exportar para publicação
            ├─► Tabela APA
            ├─► Diagrama CONSORT
            ├─► Figuras em alta resolução
            └─► Citação formatada
```

---

Este diagrama fornece uma visão completa da arquitetura, fluxo de dados e interações do sistema de análise comparativa de grupos.
