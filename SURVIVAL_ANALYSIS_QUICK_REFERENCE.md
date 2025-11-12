# Survival Analysis - Quick Reference Guide

## Quick Start

### 1. Access Survival Analysis

Navigate to research comparison page:
```
/dashboard/pesquisas/[researchId]/comparacao
```

Scroll to "Análise de Sobrevivência (Kaplan-Meier)" section

### 2. Select Outcome

Choose from dropdown:
- **Tempo até Primeira Complicação** - Time to high-risk event
- **Tempo até Resolução da Dor** - Time until pain < 3/10
- **Tempo até Retorno às Atividades** - Time to functional recovery

### 3. View Results

- **Summary Cards** - Quick statistics at a glance
- **K-M Curves** - Visual comparison of survival
- **At-Risk Table** - Number at risk over time
- **Statistical Tests** - Median times, log-rank, Cox regression

### 4. Export Data

Click "Exportar Dados" button for CSV with all survival data

---

## API Quick Reference

### Get Survival Analysis

```http
GET /api/pesquisas/{researchId}/survival?outcome={outcomeType}
```

**Parameters:**
- `outcome`: `complication` | `pain_resolution` | `return_to_activities`

**Response:**
```json
{
  "success": true,
  "data": {
    "outcome": { ... },
    "summary": { ... },
    "kaplanMeier": { ... },
    "logRankTests": [ ... ],
    "coxRegression": { ... },
    "interpretation": [ ... ]
  }
}
```

---

## Function Quick Reference

### Calculate Kaplan-Meier

```typescript
import { calculateKaplanMeier } from '@/lib/survival-analysis';

const data: SurvivalDataPoint[] = [
  { time: 7, event: true, group: 'A' },
  { time: 14, event: false, group: 'A' },
];

const result = calculateKaplanMeier(data);
// Returns: { timePoints, medianSurvival, survivalAt }
```

### Log-Rank Test

```typescript
import { calculateLogRankTest } from '@/lib/survival-analysis';

const group1 = [
  { time: 7, event: true },
  { time: 14, event: false },
];

const group2 = [
  { time: 5, event: true },
  { time: 12, event: true },
];

const test = calculateLogRankTest(group1, group2);
// Returns: { chiSquare, df, pValue, significant }
```

### Cox Regression

```typescript
import { calculateCoxRegression } from '@/lib/survival-analysis';

const data: SurvivalDataPoint[] = [
  { time: 7, event: true, covariates: [1, 0] },  // Group B, age < 60
  { time: 14, event: false, covariates: [0, 1] }, // Group A, age >= 60
];

const cox = calculateCoxRegression(data, ['Group B vs A', 'Age >=60']);
// Returns: { coefficients, concordanceIndex }
```

---

## Interpretation Guide

### P-value Interpretation
- **p < 0.001** → Highly significant (strong evidence)
- **p < 0.01** → Very significant
- **p < 0.05** → Significant (standard threshold)
- **p >= 0.05** → Not significant

### Hazard Ratio Interpretation
- **HR = 2.0** → 2x higher risk (100% increase)
- **HR = 1.5** → 1.5x higher risk (50% increase)
- **HR = 1.0** → No effect
- **HR = 0.5** → Half the risk (50% decrease)
- **HR = 0.25** → Quarter of the risk (75% decrease)

### Concordance Index (C-index)
- **C = 0.5** → No discrimination (random)
- **C = 0.7** → Acceptable discrimination
- **C = 0.8** → Excellent discrimination
- **C = 0.9** → Outstanding discrimination

---

## Common Use Cases

### Use Case 1: Compare Two Treatment Groups

**Goal:** Determine if treatment reduces complications

```typescript
// Get survival data for both groups
const controlData = patients
  .filter(p => p.researchGroup === 'A')
  .map(extractTimeToComplication);

const treatmentData = patients
  .filter(p => p.researchGroup === 'B')
  .map(extractTimeToComplication);

// Compare with log-rank test
const logRank = calculateLogRankTest(controlData, treatmentData);

if (logRank.significant) {
  console.log('Treatments differ significantly!');
  console.log(`p-value: ${logRank.pValue}`);
}
```

### Use Case 2: Find Median Survival Time

**Goal:** Determine median time to event for a group

```typescript
const groupData = extractTimeToPainResolution(patientsInGroupA);
const km = calculateKaplanMeier(groupData);

console.log(`Median time to pain resolution: ${km.medianSurvival.time} days`);
console.log(`95% CI: [${km.medianSurvival.ciLower}, ${km.medianSurvival.ciUpper}]`);
```

### Use Case 3: Multiple Group Comparison

**Goal:** Compare 3+ groups for pain resolution

```typescript
const groups = ['A', 'B', 'C'];
const results = {};

// Calculate K-M for each group
groups.forEach(groupCode => {
  const groupPatients = patients.filter(p => p.researchGroup === groupCode);
  const data = extractTimeToPainResolution(groupPatients);
  results[groupCode] = calculateKaplanMeier(data);
});

// Pairwise log-rank tests
for (let i = 0; i < groups.length; i++) {
  for (let j = i + 1; j < groups.length; j++) {
    const test = calculateLogRankTest(
      resultsData[groups[i]],
      resultsData[groups[j]]
    );
    console.log(`${groups[i]} vs ${groups[j]}: p = ${test.pValue}`);
  }
}
```

---

## Troubleshooting

### Issue: "Median not reached"

**Cause:** < 50% of patients had event
**Solution:** This is normal for low event rates. Report as ">X days" where X is max follow-up

### Issue: Wide confidence intervals

**Cause:** Small sample size or many censored observations
**Solution:** Recruit more patients or extend follow-up period

### Issue: Crossing survival curves

**Cause:** Violates proportional hazards assumption
**Solution:** Use log-rank test cautiously. Consider time-stratified analysis

### Issue: P-value = 0.5 for different-looking curves

**Cause:** Large variance, overlapping CIs, or small sample
**Solution:** Check sample sizes, event counts, and CIs

---

## Data Requirements

### Minimum Requirements:
- ✅ At least 2 groups to compare
- ✅ At least 10 patients per group (preferably 30+)
- ✅ At least 5 events per group
- ✅ Follow-up data with timestamps
- ✅ Clear event definition

### Optimal Conditions:
- ✅ 50+ patients per group
- ✅ 20+ events per group
- ✅ 80%+ follow-up completion rate
- ✅ Minimal loss to follow-up (<20%)
- ✅ Regular follow-up intervals

---

## File Locations

```
lib/
  survival-analysis.ts          # Core statistical functions

app/api/pesquisas/[id]/
  survival/route.ts              # API endpoint

components/research/
  SurvivalAnalysisSection.tsx    # UI component

app/dashboard/pesquisas/[id]/comparacao/
  page.tsx                       # Integration point
```

---

## Example Research Questions

1. **Does pudendal block reduce time to pain resolution?**
   - Outcome: `pain_resolution`
   - Expected: Lower median time in treatment group
   - Test: Log-rank test, Cox HR

2. **Which technique has fewer early complications?**
   - Outcome: `complication`
   - Expected: Different survival curves
   - Test: Log-rank test for K-M curves

3. **Does age affect return to activities?**
   - Outcome: `return_to_activities`
   - Covariate: Age (binary: <60 vs >=60)
   - Test: Cox regression with age covariate

4. **Is there a dose-response for botox?**
   - Outcome: Time to functional recovery
   - Covariate: Botox dose (0, 100, 200, 300 units)
   - Test: Cox regression with dose as continuous variable

---

## Best Practices

### Statistical:
1. ✅ Report both median and mean survival when possible
2. ✅ Always show confidence intervals
3. ✅ Use log-rank for comparing curves
4. ✅ Use Cox regression for multivariable analysis
5. ✅ Check proportional hazards assumption (if possible)

### Clinical:
1. ✅ Define events clearly beforehand
2. ✅ Use clinically meaningful time points
3. ✅ Report follow-up completeness
4. ✅ Describe censoring reasons
5. ✅ Interpret in clinical context

### Presentation:
1. ✅ Show at-risk table below K-M curves
2. ✅ Use different colors for groups
3. ✅ Label axes clearly
4. ✅ Include p-values and CIs
5. ✅ Add clinical interpretation

---

## Limitations to Remember

1. **Small Samples:** Unreliable estimates with n < 30
2. **Proportional Hazards:** Cox model assumes constant HR over time
3. **Censoring:** Assumes non-informative (patients don't drop out due to outcome)
4. **Events:** Only counts events during follow-up period
5. **Simplified Implementation:** Univariate Cox only (not full multivariate)

---

## Export Formats

### CSV Export Includes:
- Time (days)
- Group name
- Survival probability
- CI lower bound
- CI upper bound
- Number at risk
- Number of events

**Use exported data for:**
- Publication figures in R/Python
- Secondary analysis
- Meta-analysis
- Presentation slides

---

## Quick Checks Before Analysis

- [ ] All patients have research group assigned?
- [ ] Surgery dates are recorded?
- [ ] Follow-up responses exist?
- [ ] Events are well-defined?
- [ ] At least 10 patients per group?
- [ ] At least 5 events total?
- [ ] Follow-up completion > 70%?

---

## Support and Resources

### Documentation:
- Full implementation: `SURVIVAL_ANALYSIS_IMPLEMENTATION.md`
- API docs: `/docs/API_DOCUMENTATION.md`

### Code Examples:
- See `lib/survival-analysis.ts` for function documentation
- See `components/research/SurvivalAnalysisSection.tsx` for UI examples

### Statistical References:
- Kaplan-Meier: Kaplan & Meier (1958)
- Log-Rank: Mantel (1966)
- Cox Regression: Cox (1972)
- Concordance: Harrell et al. (1982)

---

**Last Updated:** 2025-11-11
**Version:** 1.0
