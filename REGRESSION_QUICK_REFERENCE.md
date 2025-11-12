# Linear Regression - Quick Reference Guide

## API Endpoints

### Get Available Models
```bash
GET /api/pesquisas/[id]/regression
```

### Run Regression Analysis
```bash
POST /api/pesquisas/[id]/regression
Content-Type: application/json

{
  "modelType": "multiple",
  "outcome": "pain_day7",
  "predictors": ["age", "sex", "group"],
  "groupCodes": ["A", "B"]  // optional
}
```

## Available Outcomes

| Value | Label | Description |
|-------|-------|-------------|
| `pain_day1` | Pain Day 1 | Pain score on first post-op day |
| `pain_day7` | Pain Day 7 | Pain score at one week post-op |
| `pain_day30` | Pain Day 30 | Pain score at one month post-op |
| `recovery_time` | Recovery Time | Days to full recovery |
| `complications` | Complications | Binary outcome (yes/no) |
| `satisfaction` | Patient Satisfaction | NPS score |

## Available Predictors

| Value | Label | Type | Description |
|-------|-------|------|-------------|
| `age` | Age | Continuous | Patient age in years |
| `sex` | Sex | Binary | 0=female, 1=male |
| `surgery_duration` | Surgery Duration | Continuous | Duration in minutes |
| `group` | Treatment Group | Categorical | Research group assignment |
| `comorbidities` | Comorbidity Count | Count | Number of comorbidities |
| `bmi` | BMI | Continuous | Body Mass Index |

## Pre-configured Models

### 1. Pain by Age and Group
```json
{
  "modelType": "multiple",
  "outcome": "pain_day7",
  "predictors": ["age", "group"]
}
```
**Use:** Assess if treatment effectiveness varies with age

### 2. Comprehensive Pain Model
```json
{
  "modelType": "multiple",
  "outcome": "pain_day7",
  "predictors": ["age", "sex", "surgery_duration", "group"]
}
```
**Use:** Full analysis of factors affecting pain

### 3. Recovery Time Model
```json
{
  "modelType": "multiple",
  "outcome": "recovery_time",
  "predictors": ["age", "comorbidities", "group"]
}
```
**Use:** Identify patients needing extended monitoring

### 4. Complication Risk Model
```json
{
  "modelType": "multiple",
  "outcome": "complications",
  "predictors": ["age", "comorbidities", "bmi", "surgery_duration"]
}
```
**Use:** Risk stratification for interventions

## Interpreting Results

### Coefficient (β)
- **Meaning:** Change in outcome for 1-unit increase in predictor
- **Example:** β = 0.042 for age → Each year increases pain by 0.042 points

### p-value
- **< 0.001:** Highly significant (***)
- **< 0.01:** Very significant (**)
- **< 0.05:** Significant (*)
- **≥ 0.05:** Not significant (ns)

### R-squared (R²)
- **< 0.30:** Weak model
- **0.30-0.50:** Moderate model
- **0.50-0.70:** Good model
- **> 0.70:** Strong model

### Confidence Interval (CI)
- **95% CI [2.1, 3.5]:** True effect is between 2.1 and 3.5 (95% confidence)
- **Doesn't include 0:** Effect is significant

### Cook's Distance
- **< 0.5:** Not influential
- **0.5-1.0:** Potentially influential
- **> 1.0:** Highly influential

### VIF (Multicollinearity)
- **< 5:** Acceptable
- **5-10:** Moderate collinearity
- **≥ 10:** High collinearity (problematic)

## Making Predictions

### Formula
```
Predicted Outcome = β₀ + β₁X₁ + β₂X₂ + ... + βₚXₚ
```

### Example
**Model:** Pain = 7.23 + 0.042(Age) - 0.18(Sex) - 2.34(Group_B)

**Patient:** Age=45, Male (1), Group B (1)

**Calculation:**
```
Pain = 7.23 + 0.042(45) - 0.18(1) - 2.34(1)
     = 7.23 + 1.89 - 0.18 - 2.34
     = 6.6 points
```

## Clinical Significance

### Pain Scores (0-10 scale)
- **MCID:** 2.0 points
- **Mild:** 1-3
- **Moderate:** 4-6
- **Severe:** 7-10

### Effect Size (Cohen's d)
- **Small:** 0.2
- **Medium:** 0.5
- **Large:** 0.8

## APA Reporting Template

```
Multiple linear regression was conducted to evaluate [predictors] as
predictors of [outcome]. The overall regression was statistically
significant (R² = .XX, F(p, n-p-1) = XX.X, p < .XXX), with the model
explaining XX.X% of the variance in [outcome].

[Predictor 1] was a significant [positive/negative] predictor
(β = X.XX, p = .XXX), indicating that [interpretation]. [Predictor 2]
did not significantly predict [outcome] (β = X.XX, p = .XXX).
```

## Diagnostic Checklist

- [ ] Residuals randomly scattered (no patterns)
- [ ] Q-Q plot points follow diagonal line
- [ ] Cook's distance < 0.5 for all observations
- [ ] VIF < 5 for all predictors
- [ ] Sample size adequate (n ≥ 20 per predictor)
- [ ] No extreme outliers
- [ ] Model R² > 0.30

## Common Issues and Solutions

| Issue | Diagnostic | Solution |
|-------|-----------|----------|
| **Non-linearity** | Curved residual plot | Add polynomial terms or transform |
| **Heteroscedasticity** | Funnel-shaped residuals | Transform outcome or use robust SE |
| **Non-normality** | Q-Q plot deviates | Bootstrap CIs or robust regression |
| **Influential points** | Cook's D > 1.0 | Investigate outliers, sensitivity analysis |
| **Multicollinearity** | VIF > 5 | Remove or combine correlated predictors |
| **Low R²** | Model explains < 30% | Add relevant predictors or different model |

## Example Code Usage

### TypeScript/JavaScript
```typescript
import {
  calculateMultipleRegression,
  interpretCoefficient,
  predictMultiple
} from '@/lib/linear-regression';

// Prepare data
const X = [
  [45, 1, 0],  // age=45, male=1, group_A=0
  [52, 0, 1],  // age=52, female=0, group_B=1
  // ... more patients
];
const y = [6.5, 4.2, ...];  // pain scores

// Run regression
const result = calculateMultipleRegression(
  X,
  y,
  ['age', 'sex', 'group']
);

// Make prediction for new patient
const newPatient = [48, 1, 1];  // age=48, male, group_B
const predicted = predictMultiple(result, newPatient);

console.log(`Predicted pain: ${predicted}`);
console.log(`R²: ${result.modelFit.rSquared}`);
```

### React Component
```tsx
import RegressionAnalysis from '@/components/RegressionAnalysis';

function ResearchPage() {
  return (
    <RegressionAnalysis
      researchId="research-id-123"
      groups={[
        { id: '1', groupCode: 'A', groupName: 'Control' },
        { id: '2', groupCode: 'B', groupName: 'Intervention' }
      ]}
    />
  );
}
```

## Files Location

| File | Purpose |
|------|---------|
| `lib/linear-regression.ts` | Core regression functions |
| `app/api/pesquisas/[id]/regression/route.ts` | API endpoint |
| `components/RegressionAnalysis.tsx` | UI component |
| `REGRESSION_IMPLEMENTATION.md` | Full documentation |

## Quick Tips

1. **Always check diagnostics** before interpreting results
2. **Use adjusted R²** when comparing models with different predictors
3. **Clinical significance ≠ statistical significance**
4. **Report effect sizes** alongside p-values
5. **Check for influential observations** that might distort results
6. **Consider sample size** - need ≥20 observations per predictor
7. **Use 95% CI** to assess practical significance
8. **Transform skewed variables** if necessary
9. **Center continuous predictors** to improve interpretation
10. **Always provide clinical context** with statistical results

## Support

For detailed explanations, see `REGRESSION_IMPLEMENTATION.md`

For API details, visit: `/api/pesquisas/[id]/regression`

---
**Quick Reference v1.0** | Medical Research System | January 2025
