// Linear Regression Analysis for Medical Research
// Implements simple and multiple linear regression with diagnostics

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface SimpleRegressionResult {
  coefficients: {
    intercept: number;
    slope: number;
    interceptSE: number;
    slopeSE: number;
    interceptCI: [number, number];
    slopeCI: [number, number];
    interceptP: number;
    slopeP: number;
  };
  modelFit: {
    rSquared: number;
    adjustedRSquared: number;
    fStatistic: number;
    fPValue: number;
    rmse: number;
    residualSE: number;
  };
  predictions: {
    fitted: number[];
    residuals: number[];
  };
  diagnostics: {
    cooksDistance: number[];
    standardizedResiduals: number[];
    qqPlotData: { theoretical: number[]; sample: number[] };
  };
  data: {
    x: number[];
    y: number[];
    n: number;
  };
}

export interface MultipleRegressionResult {
  coefficients: {
    names: string[];
    values: number[];
    standardErrors: number[];
    tStatistics: number[];
    pValues: number[];
    confidenceIntervals: [number, number][];
  };
  modelFit: {
    rSquared: number;
    adjustedRSquared: number;
    fStatistic: number;
    fPValue: number;
    rmse: number;
    residualSE: number;
    aic: number;
    bic: number;
  };
  predictions: {
    fitted: number[];
    residuals: number[];
  };
  diagnostics: {
    cooksDistance: number[];
    standardizedResiduals: number[];
    qqPlotData: { theoretical: number[]; sample: number[] };
    vif: number[]; // Variance Inflation Factor for multicollinearity
  };
  data: {
    X: number[][];
    y: number[];
    n: number;
    p: number; // number of predictors
  };
}

// ============================================
// MATRIX OPERATIONS
// ============================================

function matrixMultiply(A: number[][], B: number[][]): number[][] {
  const rowsA = A.length;
  const colsA = A[0].length;
  const colsB = B[0].length;

  const result: number[][] = Array(rowsA).fill(0).map(() => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }

  return result;
}

function matrixTranspose(A: number[][]): number[][] {
  const rows = A.length;
  const cols = A[0].length;
  const result: number[][] = Array(cols).fill(0).map(() => Array(rows).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = A[i][j];
    }
  }

  return result;
}

function matrixInverse(A: number[][]): number[][] {
  const n = A.length;

  // Create augmented matrix [A|I]
  const augmented: number[][] = A.map((row, i) =>
    [...row, ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)]
  );

  // Gaussian elimination with partial pivoting
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }

    // Swap rows
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

    // Check for singular matrix
    if (Math.abs(augmented[i][i]) < 1e-10) {
      throw new Error('Matrix is singular and cannot be inverted');
    }

    // Scale pivot row
    const pivot = augmented[i][i];
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= pivot;
    }

    // Eliminate column
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i];
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
  }

  // Extract inverse matrix
  return augmented.map(row => row.slice(n));
}

// ============================================
// STATISTICAL UTILITIES
// ============================================

function mean(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function variance(values: number[]): number {
  const m = mean(values);
  return values.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / (values.length - 1);
}

function standardDeviation(values: number[]): number {
  return Math.sqrt(variance(values));
}

// T-distribution critical value (approximation for 95% CI)
function tCritical(df: number, alpha: number = 0.05): number {
  // Approximation for two-tailed t-critical value
  // For more accuracy, could use a t-distribution library
  if (df > 30) return 1.96; // Approximate with normal distribution

  const tValues: { [key: number]: number } = {
    1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
    6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
    15: 2.131, 20: 2.086, 25: 2.060, 30: 2.042
  };

  if (tValues[df]) return tValues[df];

  // Interpolate or use closest value
  const keys = Object.keys(tValues).map(Number).sort((a, b) => a - b);
  for (let i = 0; i < keys.length - 1; i++) {
    if (df >= keys[i] && df <= keys[i + 1]) {
      const ratio = (df - keys[i]) / (keys[i + 1] - keys[i]);
      return tValues[keys[i]] + ratio * (tValues[keys[i + 1]] - tValues[keys[i]]);
    }
  }

  return 2.0; // Default fallback
}

// Calculate p-value from t-statistic (approximation)
function tTestPValue(t: number, df: number): number {
  const absT = Math.abs(t);

  // Approximation using normal distribution for large df
  if (df > 30) {
    // Using standard normal approximation
    const z = absT;
    const p = 2 * (1 - normalCDF(z));
    return p;
  }

  // Simplified approximation for smaller samples
  if (absT > 3.0) return 0.001;
  if (absT > 2.5) return 0.01;
  if (absT > 2.0) return 0.05;
  if (absT > 1.5) return 0.1;
  return 0.5;
}

// Standard normal CDF approximation
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

// F-distribution p-value approximation
function fTestPValue(f: number, df1: number, df2: number): number {
  // Simplified approximation
  if (f > 10) return 0.001;
  if (f > 5) return 0.01;
  if (f > 3) return 0.05;
  if (f > 2) return 0.1;
  return 0.5;
}

// Normal quantile function (inverse CDF) for Q-Q plot
function qnorm(p: number): number {
  // Approximation of inverse standard normal
  if (p <= 0 || p >= 1) throw new Error('p must be between 0 and 1');

  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
             1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
             6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
             -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
             3.754408661907416e+00];

  const q = p < 0.5 ? p : 1 - p;

  if (q > 0.02425) {
    const r = q - 0.5;
    const num = ((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5];
    const den = ((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1;
    return (p < 0.5 ? -1 : 1) * num / den;
  } else {
    const r = Math.sqrt(-Math.log(q));
    const num = (((c[0] * r + c[1]) * r + c[2]) * r + c[3]) * r + c[4];
    const den = ((d[0] * r + d[1]) * r + d[2]) * r + d[3];
    return (p < 0.5 ? -1 : 1) * (r + num / den);
  }
}

// ============================================
// SIMPLE LINEAR REGRESSION
// ============================================

export function calculateSimpleRegression(
  x: number[],
  y: number[]
): SimpleRegressionResult {
  const n = x.length;

  if (n !== y.length) {
    throw new Error('x and y must have the same length');
  }

  if (n < 3) {
    throw new Error('Need at least 3 observations for regression');
  }

  // Calculate means
  const xMean = mean(x);
  const yMean = mean(y);

  // Calculate slope and intercept
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (x[i] - xMean) * (y[i] - yMean);
    denominator += Math.pow(x[i] - xMean, 2);
  }

  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;

  // Calculate fitted values and residuals
  const fitted = x.map(xi => intercept + slope * xi);
  const residuals = y.map((yi, i) => yi - fitted[i]);

  // Calculate sum of squares
  const SSR = residuals.reduce((sum, r) => sum + r * r, 0);
  const SST = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const SSE = SST - SSR;

  // Model fit statistics
  const rSquared = 1 - (SSR / SST);
  const adjustedRSquared = 1 - ((SSR / (n - 2)) / (SST / (n - 1)));
  const residualSE = Math.sqrt(SSR / (n - 2));
  const rmse = Math.sqrt(SSR / n);

  // F-statistic
  const fStatistic = (SSE / 1) / (SSR / (n - 2));
  const fPValue = fTestPValue(fStatistic, 1, n - 2);

  // Standard errors of coefficients
  const xVariance = x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0);
  const slopeSE = residualSE / Math.sqrt(xVariance);
  const interceptSE = residualSE * Math.sqrt(1/n + (xMean * xMean) / xVariance);

  // t-statistics and p-values
  const tCrit = tCritical(n - 2);
  const interceptT = intercept / interceptSE;
  const slopeT = slope / slopeSE;
  const interceptP = tTestPValue(interceptT, n - 2);
  const slopeP = tTestPValue(slopeT, n - 2);

  // Confidence intervals (95%)
  const interceptCI: [number, number] = [
    intercept - tCrit * interceptSE,
    intercept + tCrit * interceptSE
  ];
  const slopeCI: [number, number] = [
    slope - tCrit * slopeSE,
    slope + tCrit * slopeSE
  ];

  // Diagnostics
  const standardizedResiduals = residuals.map(r => r / residualSE);

  // Cook's distance
  const cooksDistance = residuals.map((r, i) => {
    const h_ii = 1/n + Math.pow(x[i] - xMean, 2) / xVariance;
    return Math.pow(r / residualSE, 2) * h_ii / (2 * (1 - h_ii));
  });

  // Q-Q plot data
  const sortedResiduals = [...standardizedResiduals].sort((a, b) => a - b);
  const theoretical = sortedResiduals.map((_, i) =>
    qnorm((i + 0.5) / n)
  );

  return {
    coefficients: {
      intercept,
      slope,
      interceptSE,
      slopeSE,
      interceptCI,
      slopeCI,
      interceptP,
      slopeP,
    },
    modelFit: {
      rSquared,
      adjustedRSquared,
      fStatistic,
      fPValue,
      rmse,
      residualSE,
    },
    predictions: {
      fitted,
      residuals,
    },
    diagnostics: {
      cooksDistance,
      standardizedResiduals,
      qqPlotData: {
        theoretical,
        sample: sortedResiduals,
      },
    },
    data: {
      x,
      y,
      n,
    },
  };
}

// ============================================
// MULTIPLE LINEAR REGRESSION
// ============================================

export function calculateMultipleRegression(
  X: number[][],
  y: number[],
  predictorNames?: string[]
): MultipleRegressionResult {
  const n = X.length;
  const p = X[0].length;

  if (n !== y.length) {
    throw new Error('X and y must have the same number of observations');
  }

  if (n < p + 2) {
    throw new Error(`Need at least ${p + 2} observations for ${p} predictors`);
  }

  // Add intercept column
  const XWithIntercept = X.map(row => [1, ...row]);

  // Calculate (X'X)^-1
  const XTranspose = matrixTranspose(XWithIntercept);
  const XTX = matrixMultiply(XTranspose, XWithIntercept);
  const XTXInv = matrixInverse(XTX);

  // Calculate coefficients: β = (X'X)^-1 X'y
  const XTy = XTranspose.map(row =>
    row.reduce((sum, val, i) => sum + val * y[i], 0)
  );

  const coefficients = XTXInv.map(row =>
    row.reduce((sum, val, i) => sum + val * XTy[i], 0)
  );

  // Calculate fitted values and residuals
  const fitted = XWithIntercept.map(row =>
    row.reduce((sum, val, i) => sum + val * coefficients[i], 0)
  );

  const residuals = y.map((yi, i) => yi - fitted[i]);

  // Calculate sum of squares
  const yMean = mean(y);
  const SSR = residuals.reduce((sum, r) => sum + r * r, 0);
  const SST = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const SSE = SST - SSR;

  // Model fit statistics
  const rSquared = 1 - (SSR / SST);
  const adjustedRSquared = 1 - ((SSR / (n - p - 1)) / (SST / (n - 1)));
  const residualSE = Math.sqrt(SSR / (n - p - 1));
  const rmse = Math.sqrt(SSR / n);

  // F-statistic
  const fStatistic = (SSE / p) / (SSR / (n - p - 1));
  const fPValue = fTestPValue(fStatistic, p, n - p - 1);

  // AIC and BIC
  const logLikelihood = -n/2 * (Math.log(2 * Math.PI) + Math.log(SSR/n) + 1);
  const aic = -2 * logLikelihood + 2 * (p + 1);
  const bic = -2 * logLikelihood + Math.log(n) * (p + 1);

  // Standard errors of coefficients
  const standardErrors = XTXInv.map((row, i) =>
    residualSE * Math.sqrt(row[i])
  );

  // t-statistics and p-values
  const tCrit = tCritical(n - p - 1);
  const tStatistics = coefficients.map((coef, i) => coef / standardErrors[i]);
  const pValues = tStatistics.map(t => tTestPValue(t, n - p - 1));

  // Confidence intervals (95%)
  const confidenceIntervals: [number, number][] = coefficients.map((coef, i) => [
    coef - tCrit * standardErrors[i],
    coef + tCrit * standardErrors[i],
  ]);

  // Diagnostics
  const standardizedResiduals = residuals.map(r => r / residualSE);

  // Calculate leverage (hat values)
  const H = matrixMultiply(
    matrixMultiply(XWithIntercept, XTXInv),
    XTranspose
  );
  const leverage = H.map((row, i) => row[i]);

  // Cook's distance
  const cooksDistance = residuals.map((r, i) => {
    const h_ii = leverage[i];
    return Math.pow(r / residualSE, 2) * h_ii / ((p + 1) * (1 - h_ii));
  });

  // Q-Q plot data
  const sortedResiduals = [...standardizedResiduals].sort((a, b) => a - b);
  const theoretical = sortedResiduals.map((_, i) =>
    qnorm((i + 0.5) / n)
  );

  // VIF (Variance Inflation Factor) for multicollinearity detection
  const vif: number[] = [];
  for (let j = 1; j <= p; j++) {
    // Regress X_j on other predictors
    const X_j = X.map(row => row[j - 1]);
    const X_other = X.map(row => row.filter((_, idx) => idx !== j - 1));

    try {
      if (X_other[0].length > 0) {
        const auxRegression = calculateMultipleRegression(X_other, X_j);
        vif.push(1 / (1 - auxRegression.modelFit.rSquared));
      } else {
        vif.push(1);
      }
    } catch {
      vif.push(1); // Default if auxiliary regression fails
    }
  }

  // Generate predictor names
  const names = ['Intercept', ...(predictorNames || X[0].map((_, i) => `X${i + 1}`))];

  return {
    coefficients: {
      names,
      values: coefficients,
      standardErrors,
      tStatistics,
      pValues,
      confidenceIntervals,
    },
    modelFit: {
      rSquared,
      adjustedRSquared,
      fStatistic,
      fPValue,
      rmse,
      residualSE,
      aic,
      bic,
    },
    predictions: {
      fitted,
      residuals,
    },
    diagnostics: {
      cooksDistance,
      standardizedResiduals,
      qqPlotData: {
        theoretical,
        sample: sortedResiduals,
      },
      vif,
    },
    data: {
      X,
      y,
      n,
      p,
    },
  };
}

// ============================================
// PREDICTION FUNCTIONS
// ============================================

export function predictSimple(
  model: SimpleRegressionResult,
  newX: number | number[]
): number | number[] {
  const { intercept, slope } = model.coefficients;

  if (Array.isArray(newX)) {
    return newX.map(x => intercept + slope * x);
  }

  return intercept + slope * newX;
}

export function predictMultiple(
  model: MultipleRegressionResult,
  newX: number[] | number[][]
): number | number[] {
  const { values: coefficients } = model.coefficients;

  // Single prediction
  if (!Array.isArray(newX[0])) {
    const x = newX as number[];
    return coefficients[0] + x.reduce((sum, val, i) => sum + val * coefficients[i + 1], 0);
  }

  // Multiple predictions
  const X = newX as number[][];
  return X.map(x =>
    coefficients[0] + x.reduce((sum, val, i) => sum + val * coefficients[i + 1], 0)
  );
}

// ============================================
// INTERPRETATION HELPERS
// ============================================

export function interpretCoefficient(
  coefficient: number,
  pValue: number,
  predictorName: string,
  outcomeName: string
): string {
  const direction = coefficient > 0 ? 'increase' : 'decrease';
  const magnitude = Math.abs(coefficient).toFixed(2);
  const significance = pValue < 0.001 ? 'highly significant' :
                      pValue < 0.01 ? 'very significant' :
                      pValue < 0.05 ? 'significant' :
                      'not significant';

  if (pValue < 0.05) {
    return `A one-unit increase in ${predictorName} is associated with a ${magnitude} ${direction} in ${outcomeName} (p < ${pValue.toFixed(3)}), which is ${significance}.`;
  }

  return `${predictorName} shows no significant association with ${outcomeName} (β = ${coefficient.toFixed(2)}, p = ${pValue.toFixed(3)}).`;
}

export function interpretModelFit(
  rSquared: number,
  adjustedRSquared: number,
  fPValue: number
): string {
  const fitQuality = rSquared > 0.7 ? 'strong' :
                    rSquared > 0.5 ? 'moderate' :
                    rSquared > 0.3 ? 'weak' :
                    'very weak';

  const percentage = (rSquared * 100).toFixed(1);

  if (fPValue < 0.05) {
    return `The model shows ${fitQuality} fit, explaining ${percentage}% of the variance in the outcome (R² = ${rSquared.toFixed(3)}, adjusted R² = ${adjustedRSquared.toFixed(3)}, p < ${fPValue.toFixed(3)}).`;
  }

  return `The model does not significantly explain the variance in the outcome (R² = ${rSquared.toFixed(3)}, p = ${fPValue.toFixed(3)}).`;
}
