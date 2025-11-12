import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildErrorResponse } from '@/lib/api-utils';
import {
  calculateSimpleRegression,
  calculateMultipleRegression,
  interpretCoefficient,
  interpretModelFit,
  type SimpleRegressionResult,
  type MultipleRegressionResult,
} from '@/lib/linear-regression';

// ============================================
// POST - CALCULATE LINEAR REGRESSION
// ============================================

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface RegressionRequest {
  modelType: 'simple' | 'multiple';
  outcome: 'pain_day1' | 'pain_day7' | 'pain_day30' | 'recovery_time' | 'complications' | 'satisfaction';
  predictors: string[]; // e.g., ['age', 'sex', 'surgery_duration', 'group', 'comorbidities']
  groupCodes?: string[]; // Optional: filter by specific groups
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params;
    const researchId = resolvedParams.id;
    const body: RegressionRequest = await request.json();

    const { modelType, outcome, predictors, groupCodes } = body;

    // TODO: Get userId from session
    const userId = 'temp-user-id';

    // Validate research
    const research = await prisma.research.findFirst({
      where: {
        id: researchId,
        userId,
      },
      include: {
        groups: true,
      },
    });

    if (!research) {
      return NextResponse.json(
        buildErrorResponse('Not found', 'Research not found'),
        { status: 404 }
      );
    }

    // Get patients with all necessary data
    const patients = await prisma.patient.findMany({
      where: {
        userId,
        isResearchParticipant: true,
        researchGroup: groupCodes
          ? { in: groupCodes }
          : { in: research.groups.map(g => g.groupCode) },
      },
      include: {
        surgeries: {
          include: {
            details: true,
            anesthesia: true,
            followUps: {
              include: {
                responses: true,
              },
            },
          },
        },
        comorbidities: {
          include: {
            comorbidity: true,
          },
        },
      },
    });

    // Extract data for regression
    const data: {
      y: number[];
      age: number[];
      sex: number[]; // 0 = female, 1 = male
      surgeryDuration: number[];
      group: number[]; // encoded as 0, 1, 2, etc.
      comorbidities: number[];
      bmi: number[];
    } = {
      y: [],
      age: [],
      sex: [],
      surgeryDuration: [],
      group: [],
      comorbidities: [],
      bmi: [],
    };

    // Group encoding map
    const groupMap = new Map<string, number>();
    research.groups.forEach((g, idx) => {
      groupMap.set(g.groupCode, idx);
    });

    // Extract data from patients
    for (const patient of patients) {
      for (const surgery of patient.surgeries) {
        // Get outcome variable
        let outcomeValue: number | null = null;

        switch (outcome) {
          case 'pain_day1':
          case 'pain_day7':
          case 'pain_day30': {
            const dayNumber = outcome === 'pain_day1' ? 1 : outcome === 'pain_day7' ? 7 : 30;
            const followUp = surgery.followUps.find(f => f.dayNumber === dayNumber && f.status === 'responded');

            if (followUp && followUp.responses.length > 0) {
              try {
                const questionnaireData = JSON.parse(followUp.responses[0].questionnaireData);
                outcomeValue = questionnaireData.painLevel;
              } catch {
                continue;
              }
            }
            break;
          }

          case 'recovery_time': {
            // Assume recovery time is calculated from follow-up data
            const d14 = surgery.followUps.find(f => f.dayNumber === 14 && f.status === 'responded');
            if (d14 && d14.responses.length > 0) {
              try {
                const questionnaireData = JSON.parse(d14.responses[0].questionnaireData);
                outcomeValue = questionnaireData.daysToRecovery || 14; // Default to 14 if not specified
              } catch {
                outcomeValue = 14;
              }
            }
            break;
          }

          case 'complications': {
            // Binary outcome: 1 if any red flags, 0 otherwise
            const hasComplications = surgery.followUps.some(f =>
              f.responses.some(r => {
                try {
                  const flags = JSON.parse(r.redFlags || '[]');
                  return flags.length > 0;
                } catch {
                  return false;
                }
              })
            );
            outcomeValue = hasComplications ? 1 : 0;
            break;
          }

          case 'satisfaction': {
            const d14 = surgery.followUps.find(f => f.dayNumber === 14 && f.status === 'responded');
            if (d14 && d14.responses.length > 0) {
              try {
                const questionnaireData = JSON.parse(d14.responses[0].questionnaireData);
                outcomeValue = questionnaireData.nps;
              } catch {
                continue;
              }
            }
            break;
          }
        }

        if (outcomeValue === null) continue;

        // Get predictor variables
        const age = patient.age;
        const sex = patient.sex?.toLowerCase() === 'masculino' ? 1 : 0;
        const surgeryDuration = surgery.durationMinutes || null;
        const group = groupMap.get(patient.researchGroup || '') ?? null;
        const comorbidityCount = patient.comorbidities.length;
        // TODO: Add weight and height fields to Patient model for BMI calculation
        const bmi = null;

        // Only include if all required predictors are available
        const hasAllPredictors = predictors.every(p => {
          switch (p) {
            case 'age': return age !== null;
            case 'sex': return true; // Always available (0 or 1)
            case 'surgery_duration': return surgeryDuration !== null;
            case 'group': return group !== null;
            case 'comorbidities': return true; // Always available (count)
            case 'bmi': return bmi !== null;
            default: return false;
          }
        });

        if (!hasAllPredictors) continue;

        // Add to dataset
        data.y.push(outcomeValue);
        data.age.push(age as number);
        data.sex.push(sex);
        data.surgeryDuration.push(surgeryDuration as number);
        data.group.push(group as number);
        data.comorbidities.push(comorbidityCount);
        data.bmi.push((bmi ?? 0) as number);
      }
    }

    // Check if we have enough data
    if (data.y.length < 10) {
      return NextResponse.json(
        buildErrorResponse(
          'Insufficient data',
          `Need at least 10 complete observations, found ${data.y.length}`
        ),
        { status: 400 }
      );
    }

    // Prepare predictor matrix
    const X: number[][] = data.y.map((_, i) => {
      const row: number[] = [];
      predictors.forEach(p => {
        switch (p) {
          case 'age': row.push(data.age[i]); break;
          case 'sex': row.push(data.sex[i]); break;
          case 'surgery_duration': row.push(data.surgeryDuration[i]); break;
          case 'group': row.push(data.group[i]); break;
          case 'comorbidities': row.push(data.comorbidities[i]); break;
          case 'bmi': row.push(data.bmi[i]); break;
        }
      });
      return row;
    });

    // Perform regression
    let result: SimpleRegressionResult | MultipleRegressionResult;
    let interpretations: string[] = [];
    let modelInterpretation: string = '';

    if (modelType === 'simple' && predictors.length === 1) {
      // Simple linear regression
      const x = X.map(row => row[0]);
      result = calculateSimpleRegression(x, data.y);

      const simpleResult = result as SimpleRegressionResult;

      // Interpretations
      modelInterpretation = interpretModelFit(
        simpleResult.modelFit.rSquared,
        simpleResult.modelFit.adjustedRSquared,
        simpleResult.modelFit.fPValue
      );

      interpretations.push(
        interpretCoefficient(
          simpleResult.coefficients.slope,
          simpleResult.coefficients.slopeP,
          predictors[0].replace('_', ' '),
          outcome.replace('_', ' ')
        )
      );
    } else {
      // Multiple linear regression
      result = calculateMultipleRegression(X, data.y, predictors);

      const multipleResult = result as MultipleRegressionResult;

      // Interpretations
      modelInterpretation = interpretModelFit(
        multipleResult.modelFit.rSquared,
        multipleResult.modelFit.adjustedRSquared,
        multipleResult.modelFit.fPValue
      );

      // Interpret each coefficient (skip intercept)
      for (let i = 1; i < multipleResult.coefficients.values.length; i++) {
        interpretations.push(
          interpretCoefficient(
            multipleResult.coefficients.values[i],
            multipleResult.coefficients.pValues[i],
            predictors[i - 1].replace('_', ' '),
            outcome.replace('_', ' ')
          )
        );
      }
    }

    // Generate clinical recommendations based on results
    const recommendations: string[] = [];

    if (modelType === 'multiple') {
      const multipleResult = result as MultipleRegressionResult;

      // Check for multicollinearity
      const highVIF = multipleResult.diagnostics.vif.some(v => v > 5);
      if (highVIF) {
        recommendations.push(
          'High multicollinearity detected (VIF > 5). Consider removing correlated predictors or using regularization techniques.'
        );
      }

      // Check for influential observations
      const influentialObs = multipleResult.diagnostics.cooksDistance.filter(d => d > 4 / data.y.length).length;
      if (influentialObs > 0) {
        recommendations.push(
          `${influentialObs} influential observation(s) detected (Cook's distance > 4/n). Review these cases for potential outliers.`
        );
      }

      // Model fit recommendation
      if (multipleResult.modelFit.rSquared < 0.3) {
        recommendations.push(
          'Model explains less than 30% of variance. Consider adding more relevant predictors or using a different modeling approach.'
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        modelType,
        outcome,
        predictors,
        sampleSize: data.y.length,
        result,
        interpretation: {
          model: modelInterpretation,
          coefficients: interpretations,
          recommendations,
        },
      },
    });
  } catch (error) {
    console.error('Error calculating regression:', error);
    return NextResponse.json(
      buildErrorResponse(
        'Failed to calculate regression',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}

// ============================================
// GET - GET AVAILABLE REGRESSION MODELS
// ============================================

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params;
    const researchId = resolvedParams.id;

    // TODO: Get userId from session
    const userId = 'temp-user-id';

    // Validate research
    const research = await prisma.research.findFirst({
      where: {
        id: researchId,
        userId,
      },
      include: {
        groups: true,
      },
    });

    if (!research) {
      return NextResponse.json(
        buildErrorResponse('Not found', 'Research not found'),
        { status: 404 }
      );
    }

    // Define available models
    const availableModels = [
      {
        id: 'pain_age_group',
        name: 'Pain Score by Age and Group',
        description: 'Predicts pain scores based on patient age and treatment group',
        modelType: 'multiple',
        outcome: 'pain_day7',
        predictors: ['age', 'group'],
        clinicalRelevance: 'Helps identify if treatment effectiveness varies with patient age',
      },
      {
        id: 'pain_comprehensive',
        name: 'Comprehensive Pain Model',
        description: 'Full model including age, sex, surgery duration, and group',
        modelType: 'multiple',
        outcome: 'pain_day7',
        predictors: ['age', 'sex', 'surgery_duration', 'group'],
        clinicalRelevance: 'Most comprehensive analysis of factors affecting post-operative pain',
      },
      {
        id: 'recovery_comorbidities',
        name: 'Recovery Time and Comorbidities',
        description: 'Analyzes how comorbidities and age affect recovery time',
        modelType: 'multiple',
        outcome: 'recovery_time',
        predictors: ['age', 'comorbidities', 'group'],
        clinicalRelevance: 'Identifies patients who may need extended monitoring',
      },
      {
        id: 'complications_risk',
        name: 'Complication Risk Model',
        description: 'Predicts complication risk based on patient characteristics',
        modelType: 'multiple',
        outcome: 'complications',
        predictors: ['age', 'comorbidities', 'bmi', 'surgery_duration'],
        clinicalRelevance: 'Helps stratify patients by risk level for targeted interventions',
      },
      {
        id: 'satisfaction_simple',
        name: 'Satisfaction vs Pain',
        description: 'Simple relationship between pain scores and patient satisfaction',
        modelType: 'simple',
        outcome: 'satisfaction',
        predictors: ['pain_day7'],
        clinicalRelevance: 'Quantifies how pain management impacts patient satisfaction',
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        researchId,
        researchTitle: research.title,
        availableModels,
        availableOutcomes: [
          { value: 'pain_day1', label: 'Pain Day 1', description: 'Pain score on first post-operative day' },
          { value: 'pain_day7', label: 'Pain Day 7', description: 'Pain score at one week post-op' },
          { value: 'pain_day30', label: 'Pain Day 30', description: 'Pain score at one month post-op' },
          { value: 'recovery_time', label: 'Recovery Time', description: 'Days to full recovery' },
          { value: 'complications', label: 'Complications', description: 'Binary outcome (yes/no)' },
          { value: 'satisfaction', label: 'Patient Satisfaction', description: 'NPS score' },
        ],
        availablePredictors: [
          { value: 'age', label: 'Age', description: 'Patient age in years', type: 'continuous' },
          { value: 'sex', label: 'Sex', description: 'Patient sex (0=female, 1=male)', type: 'binary' },
          { value: 'surgery_duration', label: 'Surgery Duration', description: 'Duration in minutes', type: 'continuous' },
          { value: 'group', label: 'Treatment Group', description: 'Research group assignment', type: 'categorical' },
          { value: 'comorbidities', label: 'Comorbidity Count', description: 'Number of comorbidities', type: 'count' },
          { value: 'bmi', label: 'BMI', description: 'Body Mass Index', type: 'continuous' },
        ],
        groups: research.groups.map(g => ({
          code: g.groupCode,
          name: g.groupName,
        })),
      },
    });
  } catch (error) {
    console.error('Error getting available models:', error);
    return NextResponse.json(
      buildErrorResponse(
        'Failed to get available models',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}
