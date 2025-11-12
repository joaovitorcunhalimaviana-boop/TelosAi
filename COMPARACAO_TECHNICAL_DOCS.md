# Documentação Técnica - Análise Comparativa de Grupos

## Arquitetura do Sistema

### Estrutura de Arquivos

```
app/
├── dashboard/
│   └── pesquisas/
│       └── [id]/
│           └── comparacao/
│               └── page.tsx          # Página principal
│
api/
├── pesquisas/
│   └── [id]/
│       ├── route.ts                  # GET pesquisa individual
│       └── comparacao/
│           └── route.ts              # GET dados comparativos
```

## Tipos e Interfaces

### GroupData
```typescript
interface GroupData {
  id: string;
  groupCode: string;                   // "A", "B", "C", etc.
  groupName: string;                   // Nome descritivo
  description: string;
  patientCount: number;

  demographics: {
    avgAge: number;
    ageSD: number;
    ageRange: [number, number];
    maleCount: number;
    femaleCount: number;
    malePercentage: number;
  };

  baseline: {
    avgBMI: number;
    comorbidityCount: number;
    commonComorbidities: string[];
  };

  surgical: {
    avgDuration: number;               // minutos
    durationSD: number;
    complications: number;             // count
    complicationRate: number;          // 0-1
  };

  outcomes: {
    painScores: number[];              // array de scores
    avgPainDay1: number;               // 0-10
    avgPainDay7: number;
    avgPainDay30: number;
    avgRecoveryDays: number;
    satisfactionScore: number;         // 0-10
    returnToNormalActivities: number;  // dias
  };

  followUp: {
    completionRate: number;            // 0-1
    lostToFollowUp: number;            // count
  };
}
```

### Research
```typescript
interface Research {
  id: string;
  title: string;
  description: string;
  surgeryType: string | null;
  isActive: boolean;
  startDate: string;                   // ISO 8601
  totalPatients: number;
}
```

### ComparisonAnalysis
```typescript
interface ComparisonAnalysis {
  metric: string;                      // Nome da métrica
  groups: {
    [groupCode: string]: {
      value: number;
      ci?: {
        lower: number;
        upper: number;
      };
    };
  };
  pValue: number;
  significant: boolean;
  effectSize?: number;                 // Cohen's d
}
```

## Funções Estatísticas

### Estatísticas Descritivas

#### calculateMean
```typescript
const calculateMean = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};
```

**Entrada**: Array de números
**Saída**: Média aritmética
**Complexidade**: O(n)

#### calculateSD
```typescript
const calculateSD = (values: number[]): number => {
  if (values.length === 0) return 0;
  const mean = calculateMean(values);
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
};
```

**Entrada**: Array de números
**Saída**: Desvio padrão
**Complexidade**: O(n)
**Nota**: Usa divisão por n (população), não n-1 (amostra)

#### calculateMedian
```typescript
const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};
```

**Entrada**: Array de números
**Saída**: Mediana
**Complexidade**: O(n log n) devido ao sort

#### calculatePercentile
```typescript
const calculatePercentile = (values: number[], percentile: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};
```

**Entrada**: Array de números, percentil (0-100)
**Saída**: Valor no percentil especificado
**Método**: Interpolação linear
**Complexidade**: O(n log n)

### Testes de Hipótese

#### calculateTTest
```typescript
const calculateTTest = (
  group1: number[],
  group2: number[]
): { t: number; p: number; df: number } => {
  const mean1 = calculateMean(group1);
  const mean2 = calculateMean(group2);
  const sd1 = calculateSD(group1);
  const sd2 = calculateSD(group2);
  const n1 = group1.length;
  const n2 = group2.length;

  // Pooled standard deviation
  const pooledSD = Math.sqrt(
    ((n1 - 1) * sd1 * sd1 + (n2 - 1) * sd2 * sd2) / (n1 + n2 - 2)
  );

  // T statistic
  const t = (mean1 - mean2) / (pooledSD * Math.sqrt(1/n1 + 1/n2));

  // Degrees of freedom
  const df = n1 + n2 - 2;

  // P-value (simplified approximation)
  const p = Math.abs(t) > 2 ? 0.05 : Math.abs(t) > 1.96 ? 0.1 : 0.5;

  return { t, p, df };
};
```

**Tipo**: Student's t-test independente
**Pressupostos**:
- Variâncias iguais (pooled)
- Distribuição normal
- Amostras independentes

**Entrada**: Dois grupos de valores
**Saída**:
- `t`: Estatística t
- `p`: P-valor (aproximado)
- `df`: Graus de liberdade

**Limitações**:
- P-valor é aproximação simplificada
- Não usa distribuição t real
- Para produção, usar biblioteca estatística

### Tamanho de Efeito

#### calculateCohenD
```typescript
const calculateCohenD = (group1: number[], group2: number[]): number => {
  const mean1 = calculateMean(group1);
  const mean2 = calculateMean(group2);
  const sd1 = calculateSD(group1);
  const sd2 = calculateSD(group2);
  const n1 = group1.length;
  const n2 = group2.length;

  const pooledSD = Math.sqrt(
    ((n1 - 1) * sd1 * sd1 + (n2 - 1) * sd2 * sd2) / (n1 + n2 - 2)
  );

  return (mean1 - mean2) / pooledSD;
};
```

**Fórmula**: d = (M₁ - M₂) / SDₚₒₒₗₑ𝒹

**Interpretação**:
- |d| < 0.2: Trivial
- |d| = 0.2-0.5: Pequeno
- |d| = 0.5-0.8: Médio
- |d| > 0.8: Grande

**Uso**: Quantificar magnitude da diferença independente do tamanho amostral

### Intervalos de Confiança

#### calculateCI
```typescript
const calculateCI = (values: number[]): { lower: number; upper: number } => {
  const mean = calculateMean(values);
  const sd = calculateSD(values);
  const n = values.length;
  const se = sd / Math.sqrt(n);
  const margin = 1.96 * se; // Z-score for 95% CI

  return {
    lower: mean - margin,
    upper: mean + margin,
  };
};
```

**Nível**: 95%
**Método**: Aproximação normal (z = 1.96)
**Fórmula**: CI = M ± (1.96 × SE)

**Onde**:
- M = Média
- SE = SD / √n
- 1.96 = Z-score para 95%

**Limitação**: Assume distribuição normal

## API Endpoints

### GET `/api/pesquisas/[id]`

**Descrição**: Retorna informações detalhadas de uma pesquisa específica

**Headers**:
```
Authorization: Bearer {session-token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "surgeryType": "string | null",
    "isActive": boolean,
    "startDate": "ISO 8601",
    "endDate": "ISO 8601 | null",
    "totalPatients": number,
    "groups": [
      {
        "id": "uuid",
        "groupCode": "string",
        "groupName": "string",
        "description": "string",
        "patientCount": number
      }
    ]
  }
}
```

**Códigos de Status**:
- `200`: Sucesso
- `401`: Não autenticado
- `403`: Sem permissão
- `404`: Pesquisa não encontrada
- `500`: Erro interno

### GET `/api/pesquisas/[id]/comparacao`

**Descrição**: Retorna dados comparativos detalhados dos grupos

**Headers**:
```
Authorization: Bearer {session-token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "research": {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "totalPatients": number
    },
    "groups": [
      {
        "id": "uuid",
        "groupCode": "string",
        "groupName": "string",
        "description": "string",
        "patientCount": number,
        "demographics": {
          "avgAge": number,
          "ageSD": number,
          "ageRange": [number, number],
          "maleCount": number,
          "femaleCount": number,
          "malePercentage": number
        },
        "baseline": {
          "avgBMI": number,
          "comorbidityCount": number,
          "commonComorbidities": ["string"]
        },
        "surgical": {
          "avgDuration": number,
          "durationSD": number,
          "complications": number,
          "complicationRate": number
        },
        "outcomes": {
          "painScores": [number],
          "avgPainDay1": number,
          "avgPainDay7": number,
          "avgPainDay30": number,
          "avgRecoveryDays": number,
          "satisfactionScore": number,
          "returnToNormalActivities": number
        },
        "followUp": {
          "completionRate": number,
          "lostToFollowUp": number
        }
      }
    ]
  }
}
```

**Nota**: Atualmente retorna dados simulados para demonstração

## Funções de Exportação

### exportAsImage
```typescript
const exportAsImage = async (
  ref: React.RefObject<HTMLDivElement>,
  filename: string
) => {
  if (!ref.current) return;

  try {
    const canvas = await html2canvas(ref.current, {
      scale: 2,                    // 2x para alta resolução
      backgroundColor: '#ffffff',  // Fundo branco
    });

    const link = document.createElement('a');
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    toast.success('Imagem exportada com sucesso!');
  } catch (error) {
    console.error('Error exporting image:', error);
    toast.error('Erro ao exportar imagem');
  }
};
```

**Dependência**: html2canvas
**Formato**: PNG
**Resolução**: 2x (aproximadamente 300 DPI em telas padrão)
**Uso**: Exportar gráficos e tabelas para publicação

### exportAPATable
```typescript
const exportAPATable = () => {
  let apaText = `Table 1\nBaseline Characteristics and Outcomes by Study Group\n\n`;
  apaText += `Characteristic\t${groups.map(g => g.groupName).join('\t')}\tp-value\n`;
  apaText += `${'─'.repeat(80)}\n`;

  // Add rows...

  apaText += `\nNote. M = Mean; SD = Standard Deviation.\n`;
  apaText += `* p < .05, ** p < .01, *** p < .001`;

  const blob = new Blob([apaText], { type: 'text/plain' });
  const link = document.createElement('a');
  link.download = `apa-table-${new Date().toISOString().split('T')[0]}.txt`;
  link.href = URL.createObjectURL(blob);
  link.click();
};
```

**Formato**: APA 7ª edição
**Separador**: Tab (\t)
**Extensão**: .txt
**Uso**: Importar em Word/LaTeX para manuscritos

### generateCONSORT
```typescript
const generateCONSORT = () => {
  let consort = `CONSORT Flow Diagram\n`;
  consort += `Study: ${research?.title}\n\n`;
  // ... construir diagrama

  const blob = new Blob([consort], { type: 'text/plain' });
  const link = document.createElement('a');
  link.download = `consort-diagram-${new Date().toISOString().split('T')[0]}.txt`;
  link.href = URL.createObjectURL(blob);
  link.click();
};
```

**Padrão**: CONSORT 2010
**Formato**: Texto ASCII art
**Uso**: Base para criar fluxograma gráfico

## Hooks e Estado

### useState
```typescript
const [research, setResearch] = useState<Research | null>(null);
const [groups, setGroups] = useState<GroupData[]>([]);
const [loading, setLoading] = useState(true);
const [selectedOutcome, setSelectedOutcome] = useState<string>('pain');
const [selectedSubgroup, setSelectedSubgroup] = useState<string>('all');
const [visibleGroups, setVisibleGroups] = useState<Set<string>>(new Set());
const [aiInsights, setAiInsights] = useState<string[]>([]);
const [showAiInsights, setShowAiInsights] = useState(false);
```

### useEffect
```typescript
// Load data on mount
useEffect(() => {
  loadData();
}, [researchId]);

// Initialize visible groups when data loads
useEffect(() => {
  if (groups.length > 0) {
    setVisibleGroups(new Set(groups.map(g => g.id)));
    generateAiInsights();
  }
}, [groups]);
```

### useRef
```typescript
// Refs for export
const comparisonMatrixRef = useRef<HTMLDivElement>(null);
const statisticalAnalysisRef = useRef<HTMLDivElement>(null);
const outcomesChartRef = useRef<HTMLDivElement>(null);
```

## Componentes UI

### Estrutura de Layout
```tsx
<div className="container mx-auto p-6 max-w-7xl">
  {/* Header */}
  <div className="mb-8">...</div>

  {/* AI Insights Panel */}
  {showAiInsights && <Card>...</Card>}

  {/* Group Toggle Controls */}
  <Card>...</Card>

  {/* Comparison Matrix */}
  <Card ref={comparisonMatrixRef}>...</Card>

  {/* Statistical Analysis */}
  <Card ref={statisticalAnalysisRef}>
    <Tabs>...</Tabs>
  </Card>

  {/* Outcome Comparisons */}
  <Card ref={outcomesChartRef}>...</Card>

  {/* Subgroup Analysis */}
  <Card>...</Card>

  {/* Publication Tools */}
  <Card>...</Card>
</div>
```

### Tabs de Análise Estatística
```tsx
<Tabs defaultValue="effect-size">
  <TabsList>
    <TabsTrigger value="effect-size">Tamanho de Efeito</TabsTrigger>
    <TabsTrigger value="confidence">Intervalos de Confiança</TabsTrigger>
    <TabsTrigger value="power">Poder Estatístico</TabsTrigger>
  </TabsList>

  <TabsContent value="effect-size">...</TabsContent>
  <TabsContent value="confidence">...</TabsContent>
  <TabsContent value="power">...</TabsContent>
</Tabs>
```

## Otimizações de Performance

### Memoização
```typescript
// Para cálculos pesados, considerar:
import { useMemo } from 'react';

const statisticalResults = useMemo(() => {
  return groups.map(group => ({
    mean: calculateMean(group.outcomes.painScores),
    sd: calculateSD(group.outcomes.painScores),
    ci: calculateCI(group.outcomes.painScores),
  }));
}, [groups]);
```

### Lazy Loading
```typescript
// Para componentes pesados:
const HeavyChart = lazy(() => import('./HeavyChart'));

<Suspense fallback={<Skeleton />}>
  <HeavyChart data={data} />
</Suspense>
```

## Segurança

### Autenticação
```typescript
const session = await getServerSession(authOptions);
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Autorização
```typescript
if (research.userId !== session.user.id) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Validação de Dados
```typescript
// No servidor
const researchId = params.id;
if (!researchId || typeof researchId !== 'string') {
  return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
}
```

## Testes

### Testes Unitários (Exemplo)
```typescript
describe('Statistical Functions', () => {
  test('calculateMean returns correct average', () => {
    expect(calculateMean([1, 2, 3, 4, 5])).toBe(3);
  });

  test('calculateSD returns correct standard deviation', () => {
    const result = calculateSD([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(result).toBeCloseTo(2.0, 1);
  });

  test('calculateCohenD returns correct effect size', () => {
    const group1 = [5, 6, 7, 8, 9];
    const group2 = [1, 2, 3, 4, 5];
    const d = calculateCohenD(group1, group2);
    expect(Math.abs(d)).toBeGreaterThan(1);
  });
});
```

### Testes de Integração (Exemplo)
```typescript
describe('Comparison API', () => {
  test('GET /api/pesquisas/[id]/comparacao returns data', async () => {
    const response = await fetch('/api/pesquisas/test-id/comparacao', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.groups).toBeInstanceOf(Array);
  });
});
```

## Melhorias Futuras

### Biblioteca Estatística Robusta
```typescript
// Substituir cálculos simples por:
import * as stats from 'simple-statistics';
import * as jstat from 'jstat';

const tTest = jstat.ttest(group1, group2, 2); // two-tailed
const pValue = jstat.ttest.pvalue(tTest, df);
```

### Visualizações Avançadas
```typescript
// Usar biblioteca de gráficos profissional:
import { LineChart, BarChart, ViolinPlot } from 'recharts';
import { KaplanMeier } from 'survival-analysis';
```

### Cache de Resultados
```typescript
// Implementar cache para análises pesadas:
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['comparison', researchId],
  queryFn: () => fetchComparison(researchId),
  staleTime: 5 * 60 * 1000, // 5 minutos
});
```

## Referências

- **APA 7ª Edição**: https://apastyle.apa.org/
- **CONSORT**: http://www.consort-statement.org/
- **Cohen's d**: Cohen, J. (1988). Statistical Power Analysis
- **html2canvas**: https://html2canvas.hertzen.com/
- **Next.js**: https://nextjs.org/docs

---

**Versão**: 1.0.0
**Última Atualização**: 2025-11-11
**Mantenedor**: Equipe de Desenvolvimento
