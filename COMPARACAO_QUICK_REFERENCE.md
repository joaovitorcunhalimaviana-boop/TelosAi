# Referência Rápida - Análise Comparativa de Grupos

## Acesso Rápido

**URL**: `/dashboard/pesquisas/[id]/comparacao`

## Recursos em 60 Segundos

### 1. Matriz de Comparação
- ✅ Tabela completa lado a lado
- ✅ Demografia, cirurgia, desfechos
- ✅ P-valores automáticos
- ✅ Exportável em alta resolução

### 2. Análise Estatística
- ✅ **Tamanho de Efeito**: Cohen's d
- ✅ **Intervalos de Confiança**: IC 95%
- ✅ **Poder Estatístico**: Análise de adequação

### 3. Visualizações
- ✅ **Dor**: Gráfico de barras temporal
- ✅ **Complicações**: Barras com IC
- ✅ **Recuperação**: Box plots
- ✅ **Satisfação**: Violin plots

### 4. IA Insights
- ✅ Detecção automática de padrões
- ✅ Alertas de qualidade de dados
- ✅ Recomendações estatísticas

### 5. Ferramentas de Publicação
- ✅ Tabela APA formatada
- ✅ Diagrama CONSORT
- ✅ Figuras em 300 DPI
- ✅ Citação automática

## Atalhos de Teclado

| Ação | Descrição |
|------|-----------|
| Toggle grupos | Clique nos badges de grupo |
| Trocar desfecho | Use o dropdown "Outcome" |
| Exportar figura | Botão "Exportar" em cada seção |
| Ver insights IA | Botão "Mostrar Insights IA" |

## Interpretação Rápida

### P-valores
- `p < 0.05` ⭐ = Significativo
- `p < 0.01` ⭐⭐ = Muito significativo
- `p < 0.001` ⭐⭐⭐ = Extremamente significativo

### Cohen's d
- `d > 0.8` = Grande efeito
- `d > 0.5` = Médio efeito
- `d > 0.2` = Pequeno efeito

### Poder Estatístico
- `≥ 0.80` = ✅ Adequado
- `< 0.80` = ⚠️ Aumentar amostra

## Workflow de Publicação

```
1. Acessar comparação →
2. Revisar matriz →
3. Verificar p-valores →
4. Analisar effect size →
5. Exportar tabela APA →
6. Exportar figuras →
7. Gerar CONSORT →
8. Copiar citação
```

## Exportações Disponíveis

| Item | Formato | Qualidade | Uso |
|------|---------|-----------|-----|
| Matriz | PNG | 300 DPI | Figura 1 |
| Análise Estat. | PNG | 300 DPI | Suplementar |
| Desfechos | PNG | 300 DPI | Figura 2-5 |
| Tabela APA | TXT | - | Tabela 1 |
| CONSORT | TXT | - | Figura Flow |

## APIs

### GET `/api/pesquisas/[id]`
Retorna dados da pesquisa

### GET `/api/pesquisas/[id]/comparacao`
Retorna dados de comparação detalhados

## Componentes Principais

```typescript
// Funções estatísticas
calculateMean(values: number[]): number
calculateSD(values: number[]): number
calculateTTest(group1, group2): { t, p, df }
calculateCohenD(group1, group2): number
calculateCI(values): { lower, upper }

// Exportação
exportAsImage(ref, filename)
exportAPATable()
generateCONSORT()
copyCitation()

// Controles
toggleGroupVisibility(groupId)
setSelectedOutcome(outcome)
setSelectedSubgroup(subgroup)
```

## Requisitos Mínimos

- ✅ 2+ grupos na pesquisa
- ✅ 10+ pacientes por grupo (ideal 30+)
- ✅ Dados de desfechos coletados
- ✅ Autenticação ativa

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Sem dados | Verificar se pesquisa tem pacientes |
| Gráficos vazios | Ativar grupos no toggle |
| Exportação falha | Verificar permissões do navegador |
| P-valores estranhos | Conferir tamanho amostral |

## Checklist Pré-Publicação

- [ ] P-valores < 0.05 em desfechos primários
- [ ] IC não incluem zero para diferenças
- [ ] Cohen's d > 0.5 para relevância clínica
- [ ] Poder estatístico ≥ 0.80
- [ ] Todas as figuras exportadas
- [ ] Tabela APA revisada
- [ ] CONSORT completo
- [ ] Citação copiada

## Links Úteis

- 📊 CONSORT: http://www.consort-statement.org/
- 📝 APA Style: https://apastyle.apa.org/
- 📈 Effect Size: https://www.psychometrica.de/
- 🔬 Power Analysis: G*Power

---

**Dica**: Use o botão "Insights IA" para detecção automática de problemas nos dados!
