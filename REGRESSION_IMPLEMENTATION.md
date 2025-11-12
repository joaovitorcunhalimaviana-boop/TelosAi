# Linear Regression Implementation - Medical Research System

## Overview

This implementation provides comprehensive linear regression analysis for medical research, enabling researchers to model relationships between patient characteristics and clinical outcomes, make predictions, and generate publication-ready statistical reports.

## Files Created/Modified

### 1. Core Regression Library
**File:** `C:\Users\joaov\sistema-pos-operatorio\lib\linear-regression.ts`

**Features:**
- Simple linear regression (one predictor, one outcome)
- Multiple linear regression (multiple predictors, one outcome)
- Full statistical diagnostics
- Matrix operations for coefficient estimation
- Prediction functions

**Key Functions:**

```typescript
// Simple regression: Y = β₀ + β₁X + ε
calculateSimpleRegression(x: number[], y: number[]): SimpleRegressionResult

// Multiple regression: Y = β₀ + β₁X₁ + β₂X₂ + ... + βₚXₚ + ε
calculateMultipleRegression(
  X: number[][],
  y: number[],
  predictorNames?: string[]
): MultipleRegressionResult

// Make predictions with fitted models
predictSimple(model: SimpleRegressionResult, newX: number | number[])
predictMultiple(model: MultipleRegressionResult, newX: number[] | number[][])

// Interpretation helpers
interpretCoefficient(coefficient, pValue, predictorName, outcomeName): string
interpretModelFit(rSquared, adjustedRSquared, fPValue): string
```

**Statistical Outputs:**

1. **Coefficients:**
   - β values (intercept and slopes)
   - Standard errors (SE)
   - 95% confidence intervals
   - t-statistics
   - p-values

2. **Model Fit:**
   - R² (coefficient of determination)
   - Adjusted R² (penalized for # of predictors)
   - F-statistic and p-value
   - RMSE (root mean square error)
   - Residual standard error
   - AIC/BIC (for model comparison)

3. **Diagnostics:**
   - Residuals (observed - predicted)
   - Standardized residuals
   - Cook's distance (influential observations)
   - Q-Q plot data (normality assessment)
   - VIF (Variance Inflation Factor for multicollinearity)

### 2. API Endpoint
**File:** `C:\Users\joaov\sistema-pos-operatorio\app\api\pesquisas\[id]\regression\route.ts`

**Endpoints:**

#### GET `/api/pesquisas/[id]/regression`
Returns available regression models and metadata.

**Response:**
```json
{
  "success": true,
  "data": {
    "researchId": "...",
    "researchTitle": "...",
    "availableModels": [
      {
        "id": "pain_age_group",
        "name": "Pain Score by Age and Group",
        "modelType": "multiple",
        "outcome": "pain_day7",
        "predictors": ["age", "group"],
        "clinicalRelevance": "..."
      }
    ],
    "availableOutcomes": [...],
    "availablePredictors": [...],
    "groups": [...]
  }
}
```

#### POST `/api/pesquisas/[id]/regression`
Executes regression analysis on research data.

**Request Body:**
```json
{
  "modelType": "multiple",
  "outcome": "pain_day7",
  "predictors": ["age", "sex", "surgery_duration", "group"],
  "groupCodes": ["A", "B"]  // Optional: filter groups
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "modelType": "multiple",
    "outcome": "pain_day7",
    "predictors": ["age", "sex", "surgery_duration", "group"],
    "sampleSize": 127,
    "result": {
      "coefficients": {
        "names": ["Intercept", "age", "sex", "surgery_duration", "group"],
        "values": [7.23, 0.042, -0.18, 0.012, -2.34],
        "standardErrors": [0.52, 0.012, 0.28, 0.006, 0.35],
        "tStatistics": [13.9, 3.5, -0.64, 2.0, -6.7],
        "pValues": [0.0001, 0.001, 0.524, 0.048, 0.0001],
        "confidenceIntervals": [
          [6.21, 8.25],
          [0.018, 0.066],
          [-0.73, 0.37],
          [0.0003, 0.024],
          [-3.03, -1.65]
        ]
      },
      "modelFit": {
        "rSquared": 0.647,
        "adjustedRSquared": 0.628,
        "fStatistic": 34.2,
        "fPValue": 0.0001,
        "rmse": 1.42,
        "residualSE": 1.48,
        "aic": 342.5,
        "bic": 358.1
      },
      "predictions": {
        "fitted": [...],
        "residuals": [...]
      },
      "diagnostics": {
        "cooksDistance": [...],
        "standardizedResiduals": [...],
        "qqPlotData": {...},
        "vif": [1.2, 1.1, 1.8, 2.3]
      }
    },
    "interpretation": {
      "model": "The model shows moderate fit, explaining 64.7% of the variance...",
      "coefficients": [
        "A one-unit increase in age is associated with a 0.042 increase in pain day 7...",
        "sex shows no significant association...",
        "..."
      ],
      "recommendations": [
        "High multicollinearity detected...",
        "3 influential observations detected..."
      ]
    }
  }
}
```

### 3. UI Component
**File:** `C:\Users\joaov\sistema-pos-operatorio\components\RegressionAnalysis.tsx`

**Features:**
- Pre-configured regression models for common analyses
- Interactive coefficient tables (APA style)
- Model diagnostics visualization
- Prediction calculator
- Clinical interpretation

**Usage in Comparison Page:**
```typescript
import RegressionAnalysis from '@/components/RegressionAnalysis';

// Inside ComparacaoPage component
<RegressionAnalysis
  researchId={researchId}
  groups={groups}
/>
```

## Supported Regression Models

### 1. Pain Score by Age and Group
**Outcome:** Pain Day 7
**Predictors:** Age, Treatment Group
**Purpose:** Assess if treatment effectiveness varies with patient age

**Model Equation:**
```
Pain_D7 = β₀ + β₁(Age) + β₂(Group_B) + ε
```

### 2. Comprehensive Pain Model
**Outcome:** Pain Day 7
**Predictors:** Age, Sex, Surgery Duration, Treatment Group
**Purpose:** Full analysis of factors affecting post-operative pain

**Model Equation:**
```
Pain_D7 = β₀ + β₁(Age) + β₂(Sex) + β₃(Duration) + β₄(Group_B) + ε
```

### 3. Recovery Time Model
**Outcome:** Days to Recovery
**Predictors:** Age, Comorbidity Count, Treatment Group
**Purpose:** Identify patients who need extended monitoring

**Model Equation:**
```
Recovery = β₀ + β₁(Age) + β₂(Comorbidities) + β₃(Group_B) + ε
```

### 4. Complication Risk Model
**Outcome:** Complications (Binary: Yes/No)
**Predictors:** Age, Comorbidities, BMI, Surgery Duration
**Purpose:** Risk stratification for targeted interventions

**Model Equation:**
```
P(Complication) = β₀ + β₁(Age) + β₂(Comorbidities) + β₃(BMI) + β₄(Duration) + ε
```

**Note:** For binary outcomes, this is technically a linear probability model. For better results with binary outcomes, consider logistic regression in future updates.

## Clinical Interpretation Guide

### Coefficient Interpretation

**Continuous Predictors (e.g., Age):**
- β = 0.042 means: "Each additional year of age is associated with a 0.042-point increase in pain score"
- If p < 0.05: This effect is statistically significant
- 95% CI [0.018, 0.066]: We're 95% confident the true effect is between 0.018 and 0.066

**Binary Predictors (e.g., Sex: 0=Female, 1=Male):**
- β = -0.18 means: "Males have, on average, 0.18 points lower pain scores than females"
- If p > 0.05: This difference is not statistically significant

**Categorical Predictors (e.g., Treatment Group):**
- β = -2.34 for "Group B vs A" means: "Group B has 2.34 points lower pain than Group A"
- This is the treatment effect
- If p < 0.001: Highly significant difference between groups

### Model Fit Interpretation

**R² (R-squared):**
- 0.647 = 64.7% of variance in pain scores is explained by the model
- Ranges from 0 to 1
- Interpretation:
  - < 0.30: Weak model
  - 0.30-0.50: Moderate model
  - 0.50-0.70: Good model
  - > 0.70: Strong model

**Adjusted R²:**
- Penalized version of R² that accounts for number of predictors
- Use when comparing models with different numbers of predictors
- Should be close to R² (within 0.02-0.03)

**F-statistic:**
- Tests if the overall model is significant
- F = 34.2, p < 0.001 means: "The model as a whole is highly significant"
- If p > 0.05: Model doesn't explain outcomes better than the mean

**RMSE (Root Mean Square Error):**
- Average prediction error in outcome units
- RMSE = 1.42 points on pain scale
- Lower is better
- Compare to outcome range (0-10 for pain) to assess practical significance

### Clinical Significance

**Minimal Clinically Important Difference (MCID):**
- For pain scores: MCID typically 2.0 points on 0-10 scale
- A coefficient of -2.34 exceeds MCID → clinically meaningful effect
- Statistical significance (p < 0.001) confirms it's real, not chance

**Example Interpretation for Publication:**
```
"Multiple linear regression revealed that treatment group was a significant
predictor of pain scores at Day 7 post-operatively (β = -2.34, 95% CI
[-3.03, -1.65], p < .001). Patients in Group B (intervention) reported
pain scores 2.34 points lower than Group A (control), exceeding the minimal
clinically important difference of 2.0 points. Age also showed a small but
significant positive association with pain (β = 0.042, p = .001), suggesting
older patients experience slightly higher pain levels. Sex did not
significantly predict pain outcomes (p = .524). The overall model explained
64.7% of the variance in Day 7 pain scores (R² = .647, F(3,123) = 34.2,
p < .001), indicating good model fit."
```

## Diagnostic Checks

### 1. Residual Plots
**Residuals vs Fitted Values:**
- Check for: Random scatter around horizontal line at y=0
- Violations: Patterns (curved, funnel-shaped) indicate problems
- Action: If violated, consider transformations or different model

### 2. Q-Q Plot (Quantile-Quantile)
**Purpose:** Assess normality of residuals
- Check for: Points following diagonal line
- Violations: Heavy deviations at tails
- Impact: Affects confidence intervals and p-values
- Action: Robust regression or bootstrap if severely violated

### 3. Cook's Distance
**Purpose:** Identify influential observations
- Threshold: Cook's D > 4/n (where n = sample size)
- Interpretation:
  - < 0.5: Not influential
  - 0.5-1.0: Potentially influential, investigate
  - > 1.0: Highly influential, may distort results
- Action: Review data, consider sensitivity analysis

### 4. VIF (Variance Inflation Factor)
**Purpose:** Detect multicollinearity among predictors
- Interpretation:
  - VIF < 5: Acceptable
  - 5 ≤ VIF < 10: Moderate collinearity
  - VIF ≥ 10: High collinearity, problematic
- Action: Remove or combine correlated predictors

### 5. Model Assumptions Checklist

✓ **Linearity:** Relationship between X and Y is linear
✓ **Independence:** Residuals are independent (Durbin-Watson ≈ 2)
✓ **Homoscedasticity:** Constant variance of residuals
✓ **Normality:** Residuals are normally distributed
✓ **No Multicollinearity:** Predictors not highly correlated

## Prediction Calculator

### How It Works

1. **Input Patient Characteristics:**
   - Age: 45 years
   - Sex: Male (encoded as 1)
   - Group: B (encoded as 1 for Group B vs A)
   - Comorbidities: 2

2. **Apply Model Equation:**
   ```
   Predicted Pain = 7.23 + (0.042 × 45) + (-0.18 × 1) + (-2.34 × 1)
                  = 7.23 + 1.89 - 0.18 - 2.34
                  = 6.6 points
   ```

3. **Calculate Confidence Interval:**
   - Standard error of prediction accounts for:
     - Uncertainty in coefficient estimates
     - Residual variance
     - Distance from predictor means
   - 95% CI: [5.1, 8.1]

4. **Clinical Interpretation:**
   - Expected pain: 6.6 points (moderate)
   - Range: 5.1 to 8.1 points (95% confidence)
   - Conclusion: This patient is likely to experience moderate pain

### Use Cases

**Pre-operative Counseling:**
- "Based on your age and health status, you can expect pain levels around..."

**Treatment Selection:**
- "Group B treatment is predicted to reduce your pain by 2.3 points compared to standard treatment"

**Risk Stratification:**
- Identify high-risk patients (predicted pain > 7) for enhanced analgesia protocols

## APA-Style Reporting

### Table Format

**Table 1**
*Multiple Linear Regression Predicting Pain Scores at Day 7*

| Predictor | β | SE | t | p | 95% CI |
|-----------|---|----|---|---|--------|
| Intercept | 7.23 | 0.52 | 13.9 | <.001 | [6.21, 8.25] |
| Age | 0.042 | 0.012 | 3.5 | .001 | [0.018, 0.066] |
| Sex (Male) | -0.18 | 0.28 | -0.64 | .524 | [-0.73, 0.37] |
| Group (B vs A) | -2.34 | 0.35 | -6.7 | <.001 | [-3.03, -1.65] |

*Note.* N = 127. R² = .647, Adjusted R² = .628, F(3, 123) = 34.2, p < .001.
Significant predictors at α = .05 are shown in bold.

### Text Format

```
Multiple linear regression was conducted to evaluate the ability of age,
sex, and treatment group to predict pain scores on postoperative Day 7.
The overall regression was statistically significant (R² = .647,
F(3, 123) = 34.2, p < .001), with the model explaining 64.7% of the
variance in pain scores.

Age was a significant positive predictor (β = 0.042, p = .001), indicating
that each additional year of age was associated with a 0.042-point increase
in pain scores. Sex did not significantly predict pain outcomes (β = -0.18,
p = .524). Treatment group was the strongest predictor, with Group B patients
reporting significantly lower pain scores than Group A (β = -2.34, p < .001,
95% CI [-3.03, -1.65]). This difference exceeded the minimal clinically
important difference of 2.0 points, suggesting a meaningful treatment effect.
```

## Mathematical Background

### Simple Linear Regression

**Model:**
```
Y = β₀ + β₁X + ε
```

**Coefficient Estimation (Ordinary Least Squares):**
```
β₁ = Σ[(Xᵢ - X̄)(Yᵢ - Ȳ)] / Σ[(Xᵢ - X̄)²]
β₀ = Ȳ - β₁X̄
```

**Standard Errors:**
```
SE(β₁) = σ / √[Σ(Xᵢ - X̄)²]
SE(β₀) = σ √[1/n + X̄² / Σ(Xᵢ - X̄)²]

where σ = √[Σeᵢ² / (n-2)]  (residual standard error)
```

### Multiple Linear Regression

**Model (Matrix Notation):**
```
Y = Xβ + ε
```

**Coefficient Estimation:**
```
β̂ = (X'X)⁻¹X'Y
```

**Variance-Covariance Matrix:**
```
Var(β̂) = σ²(X'X)⁻¹
```

**Standard Errors:**
```
SE(β̂ⱼ) = √[σ² × (X'X)⁻¹ⱼⱼ]
```

**R-squared:**
```
R² = 1 - (SSR / SST)
   = 1 - [Σ(Yᵢ - Ŷᵢ)² / Σ(Yᵢ - Ȳ)²]
```

**Adjusted R-squared:**
```
R²ₐdⱼ = 1 - [(1 - R²)(n - 1) / (n - p - 1)]
```

**F-statistic:**
```
F = [R² / p] / [(1 - R²) / (n - p - 1)]
```

## Example Use Cases

### Research Scenario 1: Treatment Efficacy
**Question:** Does the new treatment reduce postoperative pain more than standard treatment?

**Analysis:**
```typescript
{
  modelType: 'multiple',
  outcome: 'pain_day7',
  predictors: ['age', 'sex', 'comorbidities', 'group']
}
```

**Expected Result:**
- Significant negative coefficient for treatment group
- Clinical interpretation: "Treatment reduces pain by X points"
- Effect size: Compare β to MCID

### Research Scenario 2: Risk Prediction
**Question:** Which patients are at highest risk for complications?

**Analysis:**
```typescript
{
  modelType: 'multiple',
  outcome: 'complications',
  predictors: ['age', 'bmi', 'comorbidities', 'surgery_duration']
}
```

**Expected Result:**
- Identify significant risk factors
- Create risk score: P(complication) = model prediction
- Stratify: Low risk (<0.1), Medium (0.1-0.3), High (>0.3)

### Research Scenario 3: Outcome Optimization
**Question:** What factors predict faster recovery?

**Analysis:**
```typescript
{
  modelType: 'multiple',
  outcome: 'recovery_time',
  predictors: ['age', 'comorbidities', 'group', 'surgery_duration']
}
```

**Expected Result:**
- Identify modifiable factors (treatment, duration)
- Target interventions to high-risk patients
- Set realistic expectations for patients

## Limitations and Considerations

### 1. Linear Probability Model for Binary Outcomes
- Used for complications (yes/no)
- Can produce predictions outside [0,1]
- **Future improvement:** Implement logistic regression

### 2. Sample Size Requirements
- Minimum: n ≥ 10 per predictor
- Recommended: n ≥ 20 per predictor
- Power: Depends on effect size and desired power (typically 80%)

### 3. Assumptions
- Violations can invalidate inference
- Always check diagnostics
- Consider robust methods if assumptions violated

### 4. Causation vs Correlation
- Regression shows associations, not causation
- Randomized controlled trials needed for causal claims
- Confounding possible in observational studies

### 5. Missing Data
- Current implementation uses complete case analysis
- **Future improvement:** Multiple imputation for missing data

## Future Enhancements

1. **Logistic Regression:** For binary outcomes (complications, mortality)
2. **Cox Proportional Hazards:** For time-to-event outcomes (survival analysis)
3. **Mixed Models:** For repeated measures (pain over time)
4. **Regularization:** LASSO/Ridge regression for high-dimensional data
5. **Non-linear Models:** Polynomial terms, splines
6. **Interactive Visualizations:** Recharts integration for scatter plots
7. **Model Comparison:** AIC/BIC tables, nested model tests
8. **Bootstrap:** For robust confidence intervals
9. **Cross-validation:** For prediction accuracy assessment
10. **Publication Export:** Generate Word/LaTeX tables automatically

## References

### Statistical Methods
1. Cohen, J., Cohen, P., West, S. G., & Aiken, L. S. (2003). *Applied Multiple Regression/Correlation Analysis for the Behavioral Sciences* (3rd ed.). Routledge.

2. Field, A. (2017). *Discovering Statistics Using IBM SPSS Statistics* (5th ed.). SAGE Publications.

3. Kutner, M. H., Nachtsheim, C. J., Neter, J., & Li, W. (2005). *Applied Linear Statistical Models* (5th ed.). McGraw-Hill.

### Clinical Applications
4. Katz, M. H. (2011). *Multivariable Analysis: A Practical Guide for Clinicians and Public Health Researchers* (3rd ed.). Cambridge University Press.

5. Vittinghoff, E., Glidden, D. V., Shiboski, S. C., & McCulloch, C. E. (2012). *Regression Methods in Biostatistics* (2nd ed.). Springer.

### APA Style
6. American Psychological Association. (2020). *Publication Manual of the American Psychological Association* (7th ed.). American Psychological Association.

## Support and Documentation

For questions or issues:
- Check the API documentation: `/api/pesquisas/[id]/regression`
- Review example models in the UI
- Consult the clinical interpretation guide above
- Review diagnostic outputs for model quality

## Version History

**v1.0.0 (2025-01-XX)**
- Initial implementation
- Simple and multiple linear regression
- Full diagnostics suite
- APA-style reporting
- Prediction calculator
- Clinical interpretation helpers

---

**Implementation Date:** January 2025
**Author:** Claude Code Assistant
**System:** Sistema Pós-Operatório - Medical Research Platform
