# Exemplos de Uso - Análise Comparativa de Grupos

## Exemplos Práticos Completos

Este documento contém exemplos reais de uso do sistema de análise comparativa para diferentes cenários clínicos.

## Exemplo 1: Bloqueio do Nervo Pudendo em Hemorroidectomia

### Configuração da Pesquisa

```typescript
Título: "Eficácia do Bloqueio do Nervo Pudendo no Controle da Dor Pós-Operatória em Hemorroidectomia"

Grupos:
- Grupo A (Controle): Sem bloqueio (n=45)
- Grupo B (Intervenção): Com bloqueio bilateral (n=42)

Tipo de Cirurgia: Hemorroidectomia
Desfecho Primário: Dor no 7º dia pós-operatório
```

### Resultados Simulados

#### Matriz de Comparação

| Característica | Grupo A (n=45) | Grupo B (n=42) | p-valor |
|----------------|----------------|----------------|---------|
| **Demografia** |
| Idade (anos), M ± DP | 52.3 ± 8.4 | 54.1 ± 9.2 | 0.312 |
| Sexo Masculino, n (%) | 27 (60.0%) | 23 (54.8%) | 0.608 |
| IMC, M ± DP | 26.8 ± 3.2 | 27.2 ± 3.5 | 0.543 |
| **Dados Cirúrgicos** |
| Duração (min), M ± DP | 68.2 ± 12.3 | 82.5 ± 14.8* | 0.032 |
| Complicações, n (%) | 5 (11.1%) | 2 (4.8%) | 0.245 |
| **Desfechos** |
| Dor Dia 1, M ± DP | 7.8 ± 1.5 | 3.2 ± 1.1*** | <0.001 |
| Dor Dia 7, M ± DP | 4.5 ± 1.3 | 1.8 ± 0.9*** | <0.001 |
| Dor Dia 30, M ± DP | 1.2 ± 0.8 | 0.4 ± 0.5* | 0.021 |
| Recuperação (dias) | 21.3 ± 4.2 | 14.6 ± 3.1*** | <0.001 |
| Satisfação (0-10) | 7.2 ± 1.4 | 9.1 ± 0.8*** | <0.001 |

**Nota**: * p < 0.05, ** p < 0.01, *** p < 0.001

#### Análise Estatística

**Tamanho de Efeito (Dor Dia 7)**:
- Cohen's d = 2.35 (Grande efeito)
- Diferença: 2.7 pontos (IC 95%: 2.1-3.3)
- Significância clínica: SIM (MCID = 2.0)

**Poder Estatístico**:
- Poder atual: 0.92
- Status: Adequado (> 0.80)
- Tamanho amostral: Suficiente

#### Insights da IA

1. ✅ **Diferença clinicamente significativa detectada**: O Grupo B apresenta dor 2.7 pontos menor no Dia 7 (p < 0.001), superando o MCID de 2.0 pontos.

2. ⚠️ **Duração cirúrgica prolongada**: O bloqueio aumentou o tempo cirúrgico em 14.3 minutos (p = 0.032). Considerar treinamento adicional da equipe.

3. ✅ **Excelente tamanho amostral**: Com 87 pacientes, o estudo tem poder de 0.92, adequado para detecção de diferenças clinicamente relevantes.

4. 📊 **Satisfação elevada**: Grupo B mostra satisfação significativamente maior (9.1 vs 7.2, p < 0.001).

#### Interpretação para Publicação

```
O bloqueio bilateral do nervo pudendo resultou em redução significativa
da dor pós-operatória em todos os pontos temporais avaliados. No 7º dia,
desfecho primário do estudo, o grupo intervenção apresentou dor média de
1.8 ± 0.9 comparado a 4.5 ± 1.3 no grupo controle (p < 0.001, d = 2.35).

Esta diferença de 2.7 pontos excede o limiar de diferença mínima
clinicamente importante (MCID = 2.0), indicando não apenas significância
estatística, mas também relevância clínica substancial.

Adicionalmente, o grupo intervenção demonstrou recuperação mais rápida
(14.6 vs 21.3 dias, p < 0.001) e maior satisfação (9.1 vs 7.2, p < 0.001).

Embora o tempo cirúrgico tenha sido levemente prolongado no grupo
intervenção (14.3 min adicionais, p = 0.032), este aumento foi
clinicamente aceitável considerando os benefícios observados.
```

---

## Exemplo 2: Três Protocolos de Analgesia

### Configuração da Pesquisa

```typescript
Título: "Comparação de Três Protocolos de Analgesia Multimodal em Colectomia"

Grupos:
- Grupo A: Protocolo Padrão (n=38)
- Grupo B: Protocolo Enhanced (n=41)
- Grupo C: Protocolo ERAS (n=39)

Tipo de Cirurgia: Colectomia Laparoscópica
Desfecho Primário: Consumo de opioides em 48h
```

### Resultados Simulados

#### Comparação de Desfechos Principais

| Desfecho | Grupo A | Grupo B | Grupo C | p-valor | Post-hoc |
|----------|---------|---------|---------|---------|----------|
| Consumo de morfina (mg) | 42.5 ± 12.3 | 28.3 ± 9.8* | 15.2 ± 7.1*** | <0.001 | A>B>C |
| Dor Dia 1 (0-10) | 6.8 ± 1.5 | 4.9 ± 1.2* | 3.2 ± 1.0*** | <0.001 | A>B>C |
| Náusea (%) | 42.1% | 29.3% | 12.8%* | 0.008 | A=B>C |
| Alta hospitalar (dias) | 5.2 ± 1.3 | 4.1 ± 1.0* | 3.1 ± 0.8*** | <0.001 | A>B>C |
| Complicações (%) | 18.4% | 14.6% | 7.7% | 0.287 | NS |

#### Análise de Subgrupos (Por Idade)

**< 50 anos**:
- Grupo A: Dor Dia 7 = 5.2 ± 1.3
- Grupo B: Dor Dia 7 = 4.1 ± 1.1
- Grupo C: Dor Dia 7 = 2.8 ± 0.9

**50-70 anos**:
- Grupo A: Dor Dia 7 = 5.8 ± 1.5
- Grupo B: Dor Dia 7 = 4.8 ± 1.3
- Grupo C: Dor Dia 7 = 3.5 ± 1.1

**> 70 anos**:
- Grupo A: Dor Dia 7 = 6.2 ± 1.6
- Grupo B: Dor Dia 7 = 5.2 ± 1.4
- Grupo C: Dor Dia 7 = 4.1 ± 1.2

**Observação**: Benefício do Protocolo C é consistente em todas as faixas etárias.

#### Insights da IA

1. 📊 **Gradiente de eficácia**: Detectado padrão consistente A < B < C em todos os desfechos principais.

2. ✅ **ERAS superior**: Protocolo C (ERAS) demonstra superioridade em redução de opioides (64% vs Padrão), dor e tempo de internação.

3. ⚠️ **Náusea reduzida**: Protocolo C reduz náusea em 69% comparado ao Padrão (p = 0.008).

4. 📈 **Sem diferença em segurança**: Taxas de complicação similares entre grupos (p = 0.287), indicando que protocolos mais agressivos são seguros.

5. 🎯 **Benefício universal**: Análise de subgrupos mostra que o Protocolo C é superior em todas as faixas etárias.

#### Tabela APA para Publicação

```
Table 2
Comparison of Analgesic Outcomes Across Three Multimodal Protocols

                           Standard    Enhanced    ERAS        p
                           (n = 38)    (n = 41)    (n = 39)
─────────────────────────────────────────────────────────────────
Morphine consumption      42.5 (12.3) 28.3 (9.8)  15.2 (7.1)  <.001***
  (mg, 48h)

Pain Day 1 (0-10)         6.8 (1.5)   4.9 (1.2)   3.2 (1.0)   <.001***

Nausea, %                 42.1        29.3        12.8        .008**

Hospital stay (days)      5.2 (1.3)   4.1 (1.0)   3.1 (0.8)   <.001***

Complications, %          18.4        14.6        7.7         .287

Note. Values are M (SD) unless otherwise indicated.
* p < .05. ** p < .01. *** p < .001
```

---

## Exemplo 3: Análise com Perda de Seguimento

### Configuração da Pesquisa

```typescript
Título: "Fisioterapia Domiciliar vs. Hospitalar em Artroplastia de Joelho"

Grupos:
- Grupo A: Fisioterapia Hospitalar (n=65, completou=52)
- Grupo B: Fisioterapia Domiciliar (n=63, completou=58)

Tipo de Cirurgia: Artroplastia Total de Joelho
Período de Follow-up: 6 meses
```

### Dados de Seguimento

#### CONSORT Diagram

```
CONSORT Flow Diagram
Study: Fisioterapia Domiciliar vs. Hospitalar em Artroplastia de Joelho

Enrollment
├─ Assessed for eligibility (n = 152)
├─ Excluded (n = 24)
│  ├─ Not meeting inclusion criteria (n = 15)
│  ├─ Declined to participate (n = 6)
│  └─ Other reasons (n = 3)

Randomized (n = 128)

├─ Fisioterapia Hospitalar (n = 65)
│  ├─ Received allocated intervention (n = 65)
│  ├─ Lost to follow-up (n = 13)
│  │  ├─ Death (n = 1)
│  │  ├─ Withdrew consent (n = 4)
│  │  ├─ Lost contact (n = 8)
│  └─ Analyzed (n = 52)
│
├─ Fisioterapia Domiciliar (n = 63)
   ├─ Received allocated intervention (n = 63)
   ├─ Lost to follow-up (n = 5)
   │  ├─ Death (n = 0)
   │  ├─ Withdrew consent (n = 2)
   │  ├─ Lost contact (n = 3)
   └─ Analyzed (n = 58)
```

#### Análise de Perda de Seguimento

| Grupo | Randomizados | Completaram | Perda | Taxa |
|-------|--------------|-------------|-------|------|
| Hospitalar | 65 | 52 | 13 | 20.0% |
| Domiciliar | 63 | 58 | 5 | 7.9% |
| **Total** | **128** | **110** | **18** | **14.1%** |

**p-valor**: 0.042 (qui-quadrado)

#### Insights da IA sobre Perda de Seguimento

1. ⚠️ **Perda diferencial detectada**: Grupo Hospitalar tem perda significativamente maior (20.0% vs 7.9%, p = 0.042). Isto pode introduzir viés.

2. 📊 **Taxa geral aceitável**: Perda total de 14.1% está dentro do aceitável para estudos de 6 meses, mas análise por intenção de tratar é recomendada.

3. 🔍 **Investigar causas**: Maior perda no Grupo Hospitalar sugere possíveis barreiras (deslocamento, custos). Considerar análise de sensibilidade.

4. ✅ **Morte balanceada**: Apenas 1 óbito (Grupo Hospitalar), não relacionado à intervenção.

#### Análise de Sensibilidade

**Cenário Pessimista (Worst Case)**:
- Assumir que todos os perdidos tiveram pior desfecho
- Grupo A: Dor média = 5.8 (vs 4.2 no completers)
- Grupo B: Dor média = 3.9 (vs 3.1 no completers)
- Diferença mantém significância: p = 0.008

**Cenário Otimista (Best Case)**:
- Assumir que todos os perdidos tiveram melhor desfecho
- Grupo A: Dor média = 3.5
- Grupo B: Dor média = 2.8
- Diferença mantém significância: p = 0.012

**Conclusão**: Resultados robustos mesmo em análise de sensibilidade.

---

## Exemplo 4: Uso Completo das Ferramentas de Exportação

### Preparando Manuscrito para Submission

#### Passo 1: Exportar Tabela de Características Basais

**Ação**: Clicar em "Exportar Tabela APA"

**Arquivo gerado**: `apa-table-2025-11-11.txt`

```
Table 1
Baseline Characteristics and Outcomes by Study Group

Characteristic                  Group A         Group B         p-value
────────────────────────────────────────────────────────────────────────
Age (years), M (SD)            52.3 (8.4)      54.1 (9.2)      0.156
Male, n (%)                    27 (60.0)       23 (54.8)       0.423
BMI, M (SD)                    26.8 (3.2)      27.2 (3.5)      0.289
Surgery duration (min), M (SD) 68.2 (12.3)     82.5 (14.8)     0.072
Complications, n (%)           5 (11.1)        2 (4.8)         0.031*
Pain Day 7, M (SD)             4.5 (1.3)       1.8 (0.9)       <0.001***

Note. M = Mean; SD = Standard Deviation.
* p < .05, ** p < .01, *** p < .001
```

**Como usar**:
1. Copiar conteúdo
2. Colar no Word
3. Converter em tabela (Inserir > Tabela > Converter Texto em Tabela)
4. Separador: Tab
5. Formatar conforme journal

#### Passo 2: Exportar Figura 1 (Matriz de Comparação)

**Ação**: Clicar em "Exportar" na seção de Matriz de Comparação

**Arquivo gerado**: `comparison-matrix-2025-11-11.png`

**Especificações**:
- Resolução: 300 DPI (equivalente)
- Formato: PNG
- Fundo: Branco
- Tamanho: ~1200x800 pixels

**Uso no manuscrito**:
```
Figure 1. Comparison matrix of baseline characteristics and outcomes
between study groups. Data presented as mean ± standard deviation or
n (%). * p < 0.05, ** p < 0.01, *** p < 0.001.
```

#### Passo 3: Exportar Figura 2 (Trajetória da Dor)

**Ação**:
1. Selecionar "Trajetória da Dor" no dropdown
2. Clicar em "Exportar" na seção de Gráficos

**Arquivo gerado**: `outcomes-comparison-2025-11-11.png`

**Legenda sugerida**:
```
Figure 2. Pain trajectory over time by treatment group.
Bars represent mean pain scores (0-10 scale) at Days 1, 7, and 30
post-operatively. Error bars represent standard deviation.
Group B (pudendal nerve block) showed significantly lower pain
at all time points (p < 0.001).
```

#### Passo 4: Gerar Diagrama CONSORT

**Ação**: Clicar em "Gerar Diagrama CONSORT"

**Arquivo gerado**: `consort-diagram-2025-11-11.txt`

**Uso**: Usar como base para criar diagrama visual no PowerPoint ou Illustrator

#### Passo 5: Copiar Citação

**Ação**: Clicar em "Copiar Citação"

**Texto copiado**:
```
Author, A. (2025). Efficacy of Pudendal Nerve Block in Postoperative
Pain Control in Hemorrhoidectomy. Journal Name, Volume(Issue), Pages.
https://doi.org/xxxxx
```

**Uso**: Incluir em CV, apresentações, relatórios

---

## Exemplo 5: Workflow Completo de Análise

### Cenário Real: Da Coleta à Publicação

#### Etapa 1: Planejamento (Pré-coleta)

```typescript
// Definir parâmetros
const powerAnalysis = {
  expectedEffectSize: 0.8,  // Cohen's d
  alpha: 0.05,
  power: 0.80,
  groups: 2
};

// Cálculo de tamanho amostral
const nPerGroup = calculateSampleSize(powerAnalysis);
// Resultado: 26 pacientes por grupo

// Adicionar 20% para perda de seguimento
const nRecrutar = Math.ceil(nPerGroup * 1.2);
// Resultado: 32 pacientes por grupo = 64 total
```

#### Etapa 2: Coleta de Dados (6 meses)

```
✅ Randomizados: 70 pacientes (35 por grupo)
✅ Completaram follow-up: 65 pacientes
✅ Perda: 5 pacientes (7.1%)
✅ Poder estatístico alcançado: 0.85
```

#### Etapa 3: Análise Preliminar

1. **Acessar**: `/dashboard/pesquisas/[id]/comparacao`
2. **Revisar**: Características basais
   - Verificar se grupos são balanceados
   - Identificar possíveis confundidores
3. **Analisar**: Desfechos primários
   - p-valor < 0.05? ✅
   - Effect size > 0.5? ✅
   - Clinicamente relevante? ✅

#### Etapa 4: Análises Adicionais

1. **Subgrupos**: Verificar se efeito é consistente
   - Por idade: ✅ Sim
   - Por sexo: ✅ Sim
   - Por comorbidades: ✅ Sim

2. **Sensibilidade**: Análise de perda
   - Worst case: Resultado mantém
   - Best case: Resultado mantém
   - Conclusão: Robusto ✅

3. **IA Insights**: Verificar alertas
   - Sem problemas de qualidade ✅
   - Tamanho amostral adequado ✅
   - Poder estatístico suficiente ✅

#### Etapa 5: Preparação do Manuscrito

1. **Exportações**:
   ```
   ✅ Tabela 1: Características basais
   ✅ Figura 1: Matriz de comparação
   ✅ Figura 2: Trajetória de dor
   ✅ Figura 3: CONSORT diagram
   ```

2. **Seções do Artigo**:
   - **Abstract**: Usar dados da matriz
   - **Methods**: Copiar parâmetros estatísticos
   - **Results**: Usar tabelas e figuras exportadas
   - **Discussion**: Interpretar effect sizes e p-valores

3. **Submission**:
   - Manuscrito: ✅ Completo
   - Figuras: ✅ Alta resolução
   - Tabelas: ✅ Formatadas APA
   - Supplementary: ✅ Análises adicionais

#### Etapa 6: Revisões

**Revisor 1**: "Adicionar análise de subgrupos por comorbidades"
- **Ação**: Voltar ao sistema, selecionar "Por Comorbidades"
- **Resultado**: Exportar nova figura
- **Status**: ✅ Respondido

**Revisor 2**: "Esclarecer método de cálculo de poder estatístico"
- **Ação**: Usar seção "Poder Estatístico" da análise
- **Resultado**: Copiar parâmetros e fórmulas
- **Status**: ✅ Respondido

---

## Exemplo 6: Troubleshooting Common Issues

### Problema 1: P-valores Inconsistentes

**Sintoma**: P-valor da tabela difere do texto

**Diagnóstico**:
```typescript
// Verificar se está usando mesmos dados
console.log('Grupos visíveis:', visibleGroups);
console.log('N por grupo:', groups.map(g => g.patientCount));
```

**Solução**:
1. Verificar se todos os grupos estão ativos
2. Confirmar que não há dados filtrados
3. Recalcular com dados completos

### Problema 2: Effect Size Muito Pequeno

**Sintoma**: Cohen's d < 0.2 apesar de p < 0.05

**Diagnóstico**:
```typescript
// Grande amostra + pequena diferença = significância estatística
// mas não relevância clínica

const n = 500;  // Amostra muito grande
const diff = 0.3;  // Diferença pequena
const p = 0.001;  // Significativo
const d = 0.15;  // Efeito trivial
```

**Interpretação**:
> "Embora a diferença seja estatisticamente significativa (p < 0.001),
> o tamanho de efeito é trivial (d = 0.15), sugerindo que a diferença
> pode não ter relevância clínica."

### Problema 3: Poder Estatístico Baixo

**Sintoma**: Poder < 0.80 com resultado não-significativo

**Diagnóstico**:
```typescript
const currentPower = 0.65;  // Inadequado
const currentN = 40;  // Total

// Calcular N necessário
const requiredN = 64;  // Para poder 0.80
```

**Soluções**:
1. **Recrutar mais**: Adicionar 24 pacientes
2. **Reportar limitação**: No Discussion
3. **Análise Bayesiana**: Considerar métodos alternativos

---

## Resumo de Melhores Práticas

### ✅ Fazer

1. **Sempre verificar premissas estatísticas**
   - Normalidade dos dados
   - Homogeneidade de variâncias
   - Independência das observações

2. **Reportar efeitos completos**
   - P-valor + Effect size + IC 95%
   - Não apenas "p < 0.05"

3. **Interpretar clinicamente**
   - P-valor não é tudo
   - Considerar MCID
   - Avaliar relevância prática

4. **Usar análise de sensibilidade**
   - Especialmente com perda > 10%
   - Testar pressupostos
   - Validar robustez

5. **Documentar tudo**
   - Exportar todas as análises
   - Manter registro de decisões
   - Versionar dados

### ❌ Evitar

1. **P-hacking**
   - Não testar múltiplas hipóteses sem correção
   - Não remover outliers arbitrariamente
   - Não selecionar análises a posteriori

2. **HARKing** (Hypothesizing After Results Known)
   - Não mudar hipótese após ver dados
   - Declarar desfechos primários a priori

3. **Ignorar tamanho de efeito**
   - P < 0.05 ≠ Relevância clínica
   - Sempre reportar magnitude

4. **Análise incompleta de perda**
   - Não ignorar perda de seguimento
   - Sempre fazer análise de sensibilidade

5. **Cherry-picking de resultados**
   - Reportar todos os desfechos
   - Incluir resultados não-significativos

---

**Este documento será atualizado com novos exemplos conforme casos de uso reais surgirem.**
