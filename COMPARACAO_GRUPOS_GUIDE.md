# Guia de Análise Comparativa de Grupos - Sistema de Pesquisa Pós-Operatória

## Visão Geral

A funcionalidade de **Análise Comparativa de Grupos** é uma ferramenta avançada para análise estatística e visualização de dados de pesquisas clínicas. Desenvolvida com rigor científico, esta página oferece recursos prontos para publicação acadêmica.

## Localização

**URL**: `/dashboard/pesquisas/[id]/comparacao`

**Arquivo**: `C:\Users\joaov\sistema-pos-operatorio\app\dashboard\pesquisas\[id]\comparacao\page.tsx`

## Recursos Principais

### 1. Matriz de Comparação de Grupos

Tabela completa comparando todos os grupos lado a lado:

- **Demografia**
  - Idade (média ± desvio padrão)
  - Distribuição por sexo
  - IMC médio
  - Faixa etária

- **Dados Cirúrgicos**
  - Duração da cirurgia
  - Taxa de complicações
  - Tipo de procedimento

- **Desfechos Clínicos**
  - Dor em múltiplos pontos temporais (Dia 1, 7, 30)
  - Tempo de recuperação
  - Satisfação do paciente
  - Retorno às atividades normais

- **Follow-up**
  - Taxa de completude
  - Perda de seguimento

### 2. Análise Estatística Avançada

#### Tamanho de Efeito (Effect Size)
- **Cohen's d**: Medida padronizada da diferença entre grupos
  - d > 0.8: Efeito grande
  - d > 0.5: Efeito médio
  - d < 0.5: Efeito pequeno
- **Diferença absoluta** em pontos na escala de dor
- **Significância clínica**: Comparação com MCID (Minimal Clinically Important Difference)

#### Intervalos de Confiança
- **IC 95%** para todas as métricas principais
- Visualização gráfica dos intervalos
- Precisão das estimativas por grupo

#### Análise de Poder Estatístico
- **Poder atual (1-β)**: Capacidade de detectar efeitos verdadeiros
- **Tamanho amostral recomendado**: Para atingir poder de 0.90
- **Parâmetros do teste**:
  - Nível de significância (α = 0.05)
  - Tipo de teste (bicaudal)
  - Tamanho de efeito esperado

### 3. Visualizações Interativas

#### Trajetória da Dor
- Gráfico de barras comparando evolução da dor ao longo do tempo
- Três pontos temporais: Dia 1, Dia 7, Dia 30
- Cores distintas por grupo
- Valores médios exibidos

#### Taxa de Complicações
- Barras horizontais com percentuais
- Intervalos de confiança visíveis
- Número absoluto de eventos
- Interpretação automática

#### Tempo de Recuperação (Box Plot)
- Distribuição completa dos dados
- Mediana, quartis e whiskers
- Identificação de outliers
- Comparação visual entre grupos

#### Satisfação do Paciente (Violin Plot)
- Distribuição da densidade de dados
- Mediana e média marcadas
- Escala de 0-10
- Visualização da variabilidade

### 4. Análise de Subgrupos

Estratificação por:
- **Faixa Etária**: < 40, 40-60, > 60 anos
- **Sexo**: Masculino vs Feminino
- **Comorbidades**: Presentes vs Ausentes
- **Tipo de Cirurgia**: Conforme especificado na pesquisa

### 5. Insights Automatizados de IA

O sistema detecta automaticamente:
- Diferenças significativas na idade entre grupos
- Desbalanço na distribuição de sexo
- Diferenças clinicamente relevantes na dor
- Variações nas taxas de complicação
- Alertas de tamanho amostral inadequado
- Problemas com perda de seguimento

### 6. Ferramentas para Publicação

#### Tabela Formatada APA
- Formato APA 7ª edição
- Estatísticas descritivas completas
- P-valores com notação apropriada
- Notas de rodapé automáticas
- Exportação em .txt

#### Diagrama CONSORT
- Fluxograma de participantes
- Randomização por grupo
- Perda de seguimento
- Números analisados
- Formato padrão CONSORT

#### Exportação de Imagens em Alta Resolução
- **Figura 1**: Matriz de comparação (300 DPI)
- **Figura 2**: Gráficos de desfechos (300 DPI)
- Formato PNG com fundo branco
- Prontas para submissão em periódicos

#### Citação Formatada
- Formato APA automático
- Cópia com um clique
- Informações da pesquisa incluídas

## Métodos Estatísticos Utilizados

### Estatísticas Descritivas
```typescript
// Média
mean = Σx / n

// Desvio Padrão
SD = √(Σ(x - mean)² / n)

// Mediana
median = valor central da distribuição ordenada

// Percentis
percentile = valor no percentil especificado
```

### Testes de Hipótese
```typescript
// T-test (comparação de médias)
t = (mean1 - mean2) / (pooled_SD * √(1/n1 + 1/n2))

// Graus de liberdade
df = n1 + n2 - 2
```

### Tamanho de Efeito
```typescript
// Cohen's d
d = (mean1 - mean2) / pooled_SD

// Pooled Standard Deviation
pooled_SD = √(((n1-1)*SD1² + (n2-1)*SD2²) / (n1+n2-2))
```

### Intervalos de Confiança
```typescript
// IC 95%
CI = mean ± (1.96 * SE)

// Erro Padrão
SE = SD / √n
```

## Controles Interativos

### Seleção de Grupos
- **Toggle de visibilidade**: Ative/desative grupos específicos
- **Badges com tamanho amostral**: Visualize n de cada grupo
- **Cores distintas**: Identificação visual imediata

### Seleção de Desfechos
Menu dropdown para alternar entre:
- Trajetória da dor
- Taxa de complicações
- Tempo de recuperação
- Satisfação do paciente

### Análise de Subgrupos
Seletor para estratificação por diferentes variáveis

## Fluxo de Uso

1. **Acesse a pesquisa**: Navegue até a pesquisa desejada
2. **Clique em "Comparação"**: No menu da pesquisa
3. **Visualize a matriz**: Revise características basais e desfechos
4. **Explore análises**: Navegue pelas tabs de análise estatística
5. **Ative insights de IA**: Veja padrões detectados automaticamente
6. **Ajuste visualizações**: Selecione grupos e desfechos de interesse
7. **Realize análises de subgrupo**: Estratifique por variáveis relevantes
8. **Exporte para publicação**: Use as ferramentas de exportação

## Interpretação dos Resultados

### P-valores
- **p < 0.05** (*): Estatisticamente significativo
- **p < 0.01** (**): Altamente significativo
- **p < 0.001** (***): Extremamente significativo
- **p ≥ 0.05**: Não significativo (ns)

### Intervalos de Confiança
- **IC não se sobrepõem**: Sugere diferença estatisticamente significativa
- **IC incluem zero**: Diferença pode não ser real
- **IC estreitos**: Estimativa precisa
- **IC amplos**: Maior incerteza

### Tamanho de Efeito
- **Cohen's d < 0.2**: Trivial
- **Cohen's d 0.2-0.5**: Pequeno
- **Cohen's d 0.5-0.8**: Médio
- **Cohen's d > 0.8**: Grande

### Poder Estatístico
- **Poder ≥ 0.80**: Adequado
- **Poder < 0.80**: Risco de falso negativo
- **Poder ≥ 0.90**: Excelente

## Boas Práticas para Publicação

### 1. Verificação Pré-Exportação
- [ ] Todos os grupos relevantes estão visíveis
- [ ] P-valores estão corretos
- [ ] Intervalos de confiança fazem sentido
- [ ] Gráficos estão legíveis
- [ ] Legendas estão completas

### 2. Exportação de Dados
- [ ] Exportar matriz de comparação
- [ ] Exportar análise estatística
- [ ] Exportar todos os gráficos de desfechos
- [ ] Gerar tabela APA
- [ ] Criar diagrama CONSORT

### 3. Documentação
- [ ] Registrar métodos estatísticos usados
- [ ] Documentar critérios de inclusão/exclusão
- [ ] Anotar qualquer ajuste pós-hoc
- [ ] Registrar software utilizado

### 4. Transparência
- [ ] Reportar todos os desfechos primários
- [ ] Incluir desfechos secundários
- [ ] Reportar efeitos adversos
- [ ] Documentar perda de seguimento

## Limitações Conhecidas

1. **Dados Simulados**: Atualmente usa dados de demonstração
2. **Testes Estatísticos**: Implementação simplificada para demonstração
3. **Análise de Subgrupos**: Requer dados reais para estratificação precisa
4. **Ajustes Múltiplos**: Não implementa correção de Bonferroni automaticamente

## Requisitos Técnicos

### Dependências
```json
{
  "html2canvas": "^1.4.1",
  "recharts": "^2.x" (planejado),
  "lucide-react": "latest",
  "next": "14.x"
}
```

### APIs Necessárias
- `/api/pesquisas/[id]`: Dados da pesquisa
- `/api/pesquisas/[id]/comparacao`: Dados de comparação
- Autenticação via NextAuth

### Permissões
- Usuário deve ser proprietário da pesquisa
- Sessão autenticada obrigatória

## Próximas Melhorias

### Fase 1 (Curto Prazo)
- [ ] Integração com dados reais do banco
- [ ] Cálculos estatísticos mais robustos (usar biblioteca científica)
- [ ] Mais tipos de gráficos (Kaplan-Meier, Forest plots)
- [ ] Exportação em formatos adicionais (PDF, Excel)

### Fase 2 (Médio Prazo)
- [ ] Meta-análise quando múltiplos estudos
- [ ] Análise de sensibilidade
- [ ] Correção para múltiplas comparações
- [ ] Testes não-paramétricos

### Fase 3 (Longo Prazo)
- [ ] Integração com R para análises avançadas
- [ ] Machine learning para previsões
- [ ] Análise de custo-efetividade
- [ ] Relatórios automatizados completos

## Suporte e Documentação

### Recursos Adicionais
- **CONSORT Guidelines**: http://www.consort-statement.org/
- **APA Style**: https://apastyle.apa.org/
- **Cohen's d Calculator**: https://www.psychometrica.de/effect_size.html
- **Power Analysis**: G*Power software

### Contato
Para dúvidas sobre a funcionalidade, consulte:
- Documentação do sistema
- Equipe de desenvolvimento
- Manual do usuário completo

## Exemplo de Uso Completo

```typescript
// 1. Navegar para comparação
router.push(`/dashboard/pesquisas/${researchId}/comparacao`);

// 2. Visualizar dados
// A página carrega automaticamente dados da API

// 3. Ajustar visualização
setVisibleGroups(new Set(['group1', 'group2']));
setSelectedOutcome('pain');

// 4. Exportar resultados
exportAsImage(comparisonMatrixRef, 'figura-1');
exportAPATable();
generateCONSORT();

// 5. Copiar citação
copyCitation();
```

## Checklist de Qualidade

Antes de usar os dados para publicação:

- [ ] Verificar se todos os p-valores fazem sentido clínico
- [ ] Confirmar que os tamanhos de efeito são plausíveis
- [ ] Revisar intervalos de confiança
- [ ] Validar médias e desvios padrão
- [ ] Conferir contagens de pacientes
- [ ] Verificar taxa de follow-up
- [ ] Revisar análises de subgrupo
- [ ] Confirmar significância clínica (não apenas estatística)
- [ ] Validar gráficos exportados
- [ ] Revisar tabela APA
- [ ] Confirmar diagrama CONSORT

---

## Citação do Sistema

Ao publicar usando este sistema, considere citar:

```
Sistema de Gestão Pós-Operatória e Análise de Pesquisa Clínica.
Versão 1.0. 2025. Desenvolvido com Next.js 14 e TypeScript.
```

---

**Última Atualização**: 2025-11-11
**Versão**: 1.0.0
**Status**: Produção (com dados simulados para demonstração)
