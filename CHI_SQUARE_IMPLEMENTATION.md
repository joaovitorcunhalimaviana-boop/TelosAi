# Chi-Square Tests Implementation for Categorical Data

## Overview
This implementation adds comprehensive Chi-square statistical tests for comparing categorical variables between research groups in the medical post-operative research system.

## Files Modified/Created

### 1. **lib/research-export-utils.ts**
Added Chi-square statistical functions with full implementation:

#### Functions Added:
- `calculateChiSquare(observed, expected)` - Main Chi-square test function
- `calculateExpectedFrequencies(observed)` - Calculate expected frequencies from observed data
- `calculateFisherExact(observed)` - Fisher's Exact Test for 2x2 tables
- `buildContingencyTable(group1Data, group2Data, categories)` - Build contingency tables
- `interpretCramerV(cramerV, df)` - Interpret effect size

#### Features:
- **Chi-square Statistic Calculation**: Full χ² calculation with proper degrees of freedom
- **P-value Approximation**: Uses chi-square distribution critical values lookup table
- **Cramér's V Effect Size**: Measures strength of association between categorical variables
- **Standardized Residuals**: Identifies cells contributing significantly to χ²
- **Small Sample Detection**: Flags cells with expected count < 5
- **Fisher's Exact Test**: Recommended automatically for small sample sizes

#### Return Types:
```typescript
interface ChiSquareResult {
  chiSquare: number;
  degreesOfFreedom: number;
  pValue: number;
  cramerV: number;
  significant: boolean;
  contingencyTable: {
    observed: number[][];
    expected: number[][];
    standardizedResiduals: number[][];
  };
  cellsWithLowCount: number;
  useFisherExact: boolean;
}

interface FisherExactResult {
  pValue: number;
  oddsRatio: number;
  significant: boolean;
}
```

---

### 2. **app/api/pesquisas/[id]/stats/route.ts**
Enhanced API endpoint with categorical analysis:

#### New Endpoint Section: Categorical Data Analysis
Added comprehensive categorical comparisons for:

1. **Sex Distribution** (Masculino/Feminino/Outro)
   - Contingency table with observed and expected frequencies
   - Chi-square test with p-value and Cramér's V
   - Clinical interpretation

2. **Complications** (Present/Absent)
   - Complication rates comparison between groups
   - Fisher's exact test for small samples
   - Warning for significant differences

3. **Comorbidities** (Present/Absent for each)
   - Dynamic analysis for all unique comorbidities
   - Individual Chi-square tests per comorbidity
   - Prevalence comparison

4. **Anesthesia Type**
   - Distribution of anesthesia techniques
   - Multiple category comparison
   - Clinical relevance assessment

5. **Pudendal Nerve Block** (Yes/No)
   - Specific for colorectal surgery research
   - Binary comparison with Fisher's exact test option

#### API Response Structure:
```typescript
{
  success: true,
  data: {
    research: { ... },
    overview: { ... },
    groups: [ ... ],
    statisticalTests: { ... },
    categoricalAnalysis: [
      {
        variable: "sex",
        label: "Distribuição de Sexo",
        categories: ["Masculino", "Feminino", "Outro"],
        groupLabels: ["Grupo A", "Grupo B"],
        contingencyTable: {
          observed: [[...], [...]],
          expected: [[...], [...]],
          rowTotals: [...],
          colTotals: [...],
          total: number
        },
        chiSquareTest: {
          chiSquare: number,
          pValue: number,
          cramerV: number,
          significant: boolean,
          ...
        },
        fisherExactTest: {...} | null,
        interpretation: "Clinical interpretation..."
      },
      // ... more categorical analyses
    ]
  }
}
```

---

### 3. **components/categorical-analysis.tsx**
New React component for visualizing categorical data:

#### Features:
- **Contingency Tables**: Clear presentation of observed frequencies with percentages
- **Stacked Bar Charts**: Visual comparison of category distributions
- **Chi-square Results Display**: Shows χ², p-value, and Cramér's V with badges
- **Clinical Interpretation**: Contextual explanations in Portuguese
- **Warning Alerts**: Highlights significant differences requiring attention
- **Statistical Notes**: Educational footer explaining test assumptions

#### Visualizations:
1. **Sex Distribution**
   - Stacked bars showing male/female proportions
   - Color-coded by group
   - Hover tooltips with exact percentages

2. **Complications**
   - Red (with complications) vs Green (without)
   - Significant difference alert with clinical recommendations
   - Fisher's exact test note when applicable

3. **Comorbidities**
   - Horizontal bars showing prevalence
   - Multiple comorbidities in compact view
   - Chi-square statistics per comorbidity

#### Telos.AI Colors:
- Primary: #0A2647
- Secondary shades: #144272, #205295, #2C74B3
- Alert colors: Red (#DC2626) for complications, Green (#16A34A) for normal

---

## Supported Categorical Variables

### Demographics:
- **Sex**: Masculino, Feminino, Outro
- **Age Groups**: Can be categorized (e.g., <40, 40-60, >60)

### Clinical:
- **Comorbidities**: Present/Absent for each (Hipertensão, Diabetes, etc.)
- **Complications**: Yes/No
- **Surgery Type**: Different procedures
- **Anesthesia Type**: Various techniques (Raqui, Geral, Local, etc.)

### Treatment Specific:
- **Pudendal Nerve Block**: Realizado/Não Realizado
- **Pudendo Technique**: Anatomia, Ultrassom, Neuroestimulação
- **Pudendo Access**: Transperineal, Transvaginal, Transglútea
- **Botox Use**: Usado/Não Usado
- **Intestinal Prep**: Sim/Não

### Surgical Details:
- **Energy Type**: Bisturi elétrico, Bipolar, Ligasure, etc.
- **Hemorrhoid Type**: Interna, Externa, Mista
- **Fistula Type**: Various types
- **Same Day Discharge**: Sim/Não

---

## Example Chi-Square Output

### Sex Distribution Between Groups:
```
Contingency Table:
                  Masculino    Feminino    Outro    Total
Grupo A              15 (60%)     10 (40%)    0 (0%)     25
Grupo B              12 (48%)     13 (52%)    0 (0%)     25
Total                27           23          0          50

Chi-square Results:
- χ² = 2.145
- Degrees of Freedom = 2
- p-value = 0.143
- Cramér's V = 0.123 (Pequeno)
- Significant = Não

Interpretation:
Não há diferença estatisticamente significativa na distribuição
de sexo entre os grupos (p = 0.143). O tamanho do efeito é
pequeno (Cramér's V = 0.123).
```

### Complications Between Groups:
```
Contingency Table:
                  Com Complicações  Sem Complicações  Total
Grupo A              5 (20%)           20 (80%)         25
Grupo B              2 (8%)            23 (92%)         25
Total                7                 43               50

Chi-square Results:
- χ² = 4.823
- Degrees of Freedom = 1
- p-value = 0.028 *
- Cramér's V = 0.234 (Médio)
- Significant = Sim
- Use Fisher's Exact Test = Recomendado (células com n<5)

Fisher's Exact Test:
- p-value = 0.031
- Odds Ratio = 2.875

Interpretation:
Há diferença estatisticamente significativa na taxa de
complicações entre os grupos (p = 0.028). Recomenda-se
investigar os fatores que podem estar contribuindo para
essa diferença. Fisher's Exact Test recomendado para
confirmar devido ao tamanho amostral pequeno em algumas células.
```

---

## Statistical Notes

### When to Use Chi-Square:
- Comparing categorical variables between 2 or more groups
- Sample size requirements: Expected frequency ≥ 5 in most cells
- Independent observations

### When to Use Fisher's Exact Test:
- 2x2 contingency tables with small sample sizes
- Any cell with expected frequency < 5
- Exact p-values needed (no approximation)

### Effect Size Interpretation (Cramér's V):
For df = 1 (2x2 table):
- 0.10 = Small effect
- 0.30 = Medium effect
- 0.50 = Large effect

For df = 2 (2x3 or 3x2 table):
- 0.07 = Small effect
- 0.21 = Medium effect
- 0.35 = Large effect

For df ≥ 3:
- 0.06 = Small effect
- 0.17 = Medium effect
- 0.29 = Large effect

### Standardized Residuals:
- Values > 2 or < -2 indicate cells contributing significantly to χ²
- Highlight which specific categories differ between groups
- Useful for post-hoc analysis

---

## Clinical Applications

### 1. Randomized Clinical Trials (RCTs):
- **Baseline Characteristics**: Verify randomization worked (no significant differences)
- **Complication Rates**: Compare safety profiles between treatment groups
- **Adverse Events**: Identify treatments with higher risk

### 2. Observational Studies:
- **Demographic Comparisons**: Adjust for confounders
- **Risk Factor Analysis**: Identify factors associated with outcomes
- **Subgroup Analysis**: Test for effect modification

### 3. Quality Improvement:
- **Before/After Comparisons**: Test if intervention changed categorical outcomes
- **Provider Comparisons**: Identify variations in practice patterns

---

## Usage Example

### API Call:
```typescript
// Fetch categorical analysis
const response = await fetch(`/api/pesquisas/${researchId}/stats`);
const data = await response.json();

// Access categorical analysis
const sexAnalysis = data.data.categoricalAnalysis.find(
  a => a.variable === 'sex'
);

console.log('Chi-square:', sexAnalysis.chiSquareTest.chiSquare);
console.log('P-value:', sexAnalysis.chiSquareTest.pValue);
console.log('Significant:', sexAnalysis.chiSquareTest.significant);
console.log('Effect Size:', sexAnalysis.chiSquareTest.cramerV);
```

### Component Usage:
```tsx
import CategoricalAnalysis from '@/components/categorical-analysis';

export default function ResearchComparison() {
  return (
    <div>
      {/* Other sections */}

      <CategoricalAnalysis groups={groups} />

      {/* More sections */}
    </div>
  );
}
```

---

## Technical Details

### Statistical Formulas:

#### Chi-Square Statistic:
```
χ² = Σ [(Observed - Expected)² / Expected]
```

#### Expected Frequency:
```
Expected[i,j] = (RowTotal[i] × ColTotal[j]) / GrandTotal
```

#### Cramér's V:
```
V = √(χ² / (n × min(rows-1, cols-1)))
```

#### Standardized Residual:
```
SR[i,j] = (Observed[i,j] - Expected[i,j]) / √Expected[i,j]
```

### P-Value Approximation:
Uses chi-square distribution critical values:
- α = 0.05: Moderate evidence against H₀
- α = 0.01: Strong evidence against H₀
- α = 0.001: Very strong evidence against H₀

### Degrees of Freedom:
```
df = (number of rows - 1) × (number of columns - 1)
```

---

## Limitations and Considerations

### 1. Sample Size:
- Small samples may lack power to detect differences
- Fisher's exact test preferred when expected frequencies < 5
- Consider recruiting more participants if underpowered

### 2. Multiple Comparisons:
- Testing many variables increases false positive risk
- Consider Bonferroni correction for family-wise error rate
- Focus on pre-specified primary comparisons

### 3. Clinical vs Statistical Significance:
- Small p-value doesn't always mean clinically important difference
- Always consider effect size (Cramér's V)
- Interpret results in clinical context

### 4. Assumptions:
- **Independence**: Each observation is independent
- **Expected Frequencies**: Most cells should have expected count ≥ 5
- **Random Sampling**: Patients randomly selected or assigned

---

## Future Enhancements

### Planned Features:
1. **Multi-group Post-hoc Tests**: Pairwise comparisons with correction
2. **Trend Tests**: Ordered categorical variables (Cochran-Armitage)
3. **Stratified Analysis**: Mantel-Haenszel test for confounders
4. **Interactive Visualizations**: Mosaic plots, association plots
5. **Export to Statistical Software**: R/SPSS format for advanced analysis
6. **Report Generation**: Automated tables in APA format

### Integration Points:
- Export categorical results to Excel/CSV
- Include in publication-ready reports
- Connect to CONSORT diagram generation
- Link to meta-analysis aggregation

---

## References

### Statistical Methods:
- Agresti, A. (2018). An Introduction to Categorical Data Analysis (3rd ed.)
- Cohen, J. (1988). Statistical Power Analysis for the Behavioral Sciences
- Fisher, R. A. (1922). On the interpretation of χ² from contingency tables

### Clinical Research:
- CONSORT Guidelines for Reporting RCTs
- STROBE Guidelines for Observational Studies
- Cochrane Handbook for Systematic Reviews

---

## Support and Documentation

For questions or issues:
1. Check API documentation: `/api/pesquisas/[id]/stats`
2. Review component props in `categorical-analysis.tsx`
3. Consult statistical formulas in `research-export-utils.ts`
4. Contact development team for custom analyses

---

**Generated**: 2025-11-11
**Version**: 1.0.0
**Author**: Sistema Pós-Operatório - Telos.AI
