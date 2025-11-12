// Export Template System for Different Publication Types
import { ResearchMetadata, MethodsSection } from './word-export';

// ============================================
// TEMPLATE TYPES
// ============================================

export type TemplateType =
  | 'publication'
  | 'conference-abstract'
  | 'progress-report'
  | 'patient-summary'
  | 'grant-report';

export interface ExportTemplate {
  id: string;
  name: string;
  type: TemplateType;
  description: string;
  sections: TemplateSectionConfig[];
  formatting: TemplateFormatting;
}

export interface TemplateSectionConfig {
  id: string;
  title: string;
  required: boolean;
  order: number;
  content: SectionContentType[];
}

export type SectionContentType =
  | 'demographics'
  | 'anova-results'
  | 'chi-square-analysis'
  | 'regression-models'
  | 'survival-analysis'
  | 'raw-data'
  | 'patient-timeline'
  | 'adverse-events'
  | 'medications'
  | 'comorbidities';

export interface TemplateFormatting {
  style: 'apa' | 'vancouver' | 'custom';
  includeCharts: boolean;
  chartResolution: 'standard' | 'high' | 'print';
  anonymizePatients: boolean;
  language: 'pt' | 'en';
}

// ============================================
// PRE-DEFINED TEMPLATES
// ============================================

/**
 * Full APA-style manuscript template
 */
export const PUBLICATION_TEMPLATE: ExportTemplate = {
  id: 'publication-full',
  name: 'Publication Manuscript',
  type: 'publication',
  description: 'Complete APA 7th edition manuscript for journal submission',
  sections: [
    {
      id: 'title-page',
      title: 'Title Page',
      required: true,
      order: 1,
      content: [],
    },
    {
      id: 'abstract',
      title: 'Abstract',
      required: true,
      order: 2,
      content: [],
    },
    {
      id: 'introduction',
      title: 'Introduction',
      required: true,
      order: 3,
      content: [],
    },
    {
      id: 'methods',
      title: 'Methods',
      required: true,
      order: 4,
      content: ['demographics'],
    },
    {
      id: 'results',
      title: 'Results',
      required: true,
      order: 5,
      content: [
        'demographics',
        'anova-results',
        'chi-square-analysis',
        'survival-analysis',
      ],
    },
    {
      id: 'discussion',
      title: 'Discussion',
      required: true,
      order: 6,
      content: [],
    },
    {
      id: 'references',
      title: 'References',
      required: true,
      order: 7,
      content: [],
    },
    {
      id: 'tables',
      title: 'Tables',
      required: false,
      order: 8,
      content: ['demographics', 'anova-results'],
    },
    {
      id: 'figures',
      title: 'Figures',
      required: false,
      order: 9,
      content: [],
    },
  ],
  formatting: {
    style: 'apa',
    includeCharts: true,
    chartResolution: 'print',
    anonymizePatients: true,
    language: 'en',
  },
};

/**
 * Conference abstract template (1-page)
 */
export const CONFERENCE_ABSTRACT_TEMPLATE: ExportTemplate = {
  id: 'conference-abstract',
  name: 'Conference Abstract',
  type: 'conference-abstract',
  description: 'One-page summary for conference submission',
  sections: [
    {
      id: 'header',
      title: 'Header',
      required: true,
      order: 1,
      content: [],
    },
    {
      id: 'background',
      title: 'Background',
      required: true,
      order: 2,
      content: [],
    },
    {
      id: 'methods-brief',
      title: 'Methods',
      required: true,
      order: 3,
      content: ['demographics'],
    },
    {
      id: 'results-brief',
      title: 'Results',
      required: true,
      order: 4,
      content: ['anova-results'],
    },
    {
      id: 'conclusions',
      title: 'Conclusions',
      required: true,
      order: 5,
      content: [],
    },
  ],
  formatting: {
    style: 'custom',
    includeCharts: false,
    chartResolution: 'standard',
    anonymizePatients: true,
    language: 'en',
  },
};

/**
 * Monthly progress report template
 */
export const PROGRESS_REPORT_TEMPLATE: ExportTemplate = {
  id: 'progress-report',
  name: 'Progress Report',
  type: 'progress-report',
  description: 'Monthly research progress update',
  sections: [
    {
      id: 'executive-summary',
      title: 'Executive Summary',
      required: true,
      order: 1,
      content: [],
    },
    {
      id: 'recruitment',
      title: 'Recruitment Status',
      required: true,
      order: 2,
      content: ['demographics'],
    },
    {
      id: 'data-collection',
      title: 'Data Collection Progress',
      required: true,
      order: 3,
      content: ['patient-timeline', 'adverse-events'],
    },
    {
      id: 'preliminary-findings',
      title: 'Preliminary Findings',
      required: false,
      order: 4,
      content: ['anova-results', 'chi-square-analysis'],
    },
    {
      id: 'challenges',
      title: 'Challenges and Solutions',
      required: true,
      order: 5,
      content: [],
    },
    {
      id: 'next-steps',
      title: 'Next Steps',
      required: true,
      order: 6,
      content: [],
    },
  ],
  formatting: {
    style: 'custom',
    includeCharts: true,
    chartResolution: 'standard',
    anonymizePatients: true,
    language: 'pt',
  },
};

/**
 * Individual patient summary template
 */
export const PATIENT_SUMMARY_TEMPLATE: ExportTemplate = {
  id: 'patient-summary',
  name: 'Patient Summary',
  type: 'patient-summary',
  description: 'Comprehensive individual patient report',
  sections: [
    {
      id: 'patient-info',
      title: 'Patient Information',
      required: true,
      order: 1,
      content: ['demographics', 'comorbidities', 'medications'],
    },
    {
      id: 'surgical-details',
      title: 'Surgical Details',
      required: true,
      order: 2,
      content: [],
    },
    {
      id: 'recovery-timeline',
      title: 'Recovery Timeline',
      required: true,
      order: 3,
      content: ['patient-timeline'],
    },
    {
      id: 'outcomes',
      title: 'Outcomes',
      required: true,
      order: 4,
      content: ['adverse-events'],
    },
    {
      id: 'follow-up-schedule',
      title: 'Follow-up Schedule',
      required: true,
      order: 5,
      content: [],
    },
  ],
  formatting: {
    style: 'custom',
    includeCharts: true,
    chartResolution: 'standard',
    anonymizePatients: false,
    language: 'pt',
  },
};

/**
 * Grant/funding report template
 */
export const GRANT_REPORT_TEMPLATE: ExportTemplate = {
  id: 'grant-report',
  name: 'Grant Report',
  type: 'grant-report',
  description: 'Report for funding agencies',
  sections: [
    {
      id: 'cover-page',
      title: 'Cover Page',
      required: true,
      order: 1,
      content: [],
    },
    {
      id: 'project-summary',
      title: 'Project Summary',
      required: true,
      order: 2,
      content: [],
    },
    {
      id: 'objectives',
      title: 'Objectives and Milestones',
      required: true,
      order: 3,
      content: [],
    },
    {
      id: 'methods-detailed',
      title: 'Methods',
      required: true,
      order: 4,
      content: ['demographics'],
    },
    {
      id: 'results-comprehensive',
      title: 'Results and Findings',
      required: true,
      order: 5,
      content: [
        'demographics',
        'anova-results',
        'chi-square-analysis',
        'survival-analysis',
      ],
    },
    {
      id: 'budget-utilization',
      title: 'Budget Utilization',
      required: true,
      order: 6,
      content: [],
    },
    {
      id: 'publications',
      title: 'Publications and Presentations',
      required: false,
      order: 7,
      content: [],
    },
    {
      id: 'future-directions',
      title: 'Future Directions',
      required: true,
      order: 8,
      content: [],
    },
  ],
  formatting: {
    style: 'custom',
    includeCharts: true,
    chartResolution: 'high',
    anonymizePatients: true,
    language: 'en',
  },
};

// ============================================
// TEMPLATE MANAGEMENT
// ============================================

/**
 * Get all available templates
 */
export function getAllTemplates(): ExportTemplate[] {
  return [
    PUBLICATION_TEMPLATE,
    CONFERENCE_ABSTRACT_TEMPLATE,
    PROGRESS_REPORT_TEMPLATE,
    PATIENT_SUMMARY_TEMPLATE,
    GRANT_REPORT_TEMPLATE,
  ];
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ExportTemplate | undefined {
  return getAllTemplates().find((t) => t.id === id);
}

/**
 * Get templates by type
 */
export function getTemplatesByType(type: TemplateType): ExportTemplate[] {
  return getAllTemplates().filter((t) => t.type === type);
}

// ============================================
// AUTO-GENERATED CONTENT
// ============================================

/**
 * Generate abstract from research data
 */
export function generateAutoAbstract(data: {
  title: string;
  groups: string[];
  totalPatients: number;
  primaryOutcome: string;
  keyFindings: string[];
  pValue: number;
  effectSize: number;
}): string {
  const { title, groups, totalPatients, primaryOutcome, keyFindings, pValue, effectSize } = data;

  let abstract = '';

  // Background (1 sentence)
  abstract += `This study investigated ${primaryOutcome.toLowerCase()} following surgical intervention. `;

  // Methods (1-2 sentences)
  abstract += `A total of ${totalPatients} participants were randomly assigned to ${groups.length} groups: ${groups.join(', ')}. `;

  // Results (2-3 sentences)
  abstract += `${keyFindings[0]}. `;

  if (pValue < 0.05) {
    abstract += `Statistical analysis revealed significant differences between groups `;
    abstract += `(p ${pValue < 0.001 ? '< .001' : `= ${pValue.toFixed(3)}`}`;

    if (effectSize) {
      if (effectSize >= 0.14) {
        abstract += ', large effect size';
      } else if (effectSize >= 0.06) {
        abstract += ', medium effect size';
      } else {
        abstract += ', small effect size';
      }
    }
    abstract += `). `;
  } else {
    abstract += `No significant differences were found between groups (p = ${pValue.toFixed(3)}). `;
  }

  // Additional findings
  if (keyFindings.length > 1) {
    abstract += `${keyFindings.slice(1).join('. ')}. `;
  }

  // Conclusions (1 sentence)
  if (pValue < 0.05) {
    abstract += `These findings suggest that group allocation significantly influenced ${primaryOutcome.toLowerCase()}, `;
    abstract += `with important implications for clinical practice.`;
  } else {
    abstract += `Further research with larger sample sizes may be needed to detect potential differences.`;
  }

  return abstract;
}

/**
 * Generate methods section text
 */
export function generateMethodsText(data: {
  studyDesign: string;
  setting: string;
  participants: {
    n: number;
    meanAge: number;
    ageSD: number;
    malePercent: number;
  };
  interventions: string[];
  outcomes: string[];
  followUpDays: number[];
  statisticalTests: string[];
}): string {
  const { studyDesign, setting, participants, interventions, outcomes, followUpDays, statisticalTests } =
    data;

  let text = '';

  // Study Design
  text += `Study Design\n\n`;
  text += `This ${studyDesign} was conducted at ${setting}. `;
  text += `The study protocol was approved by the institutional review board, `;
  text += `and all participants provided written informed consent.\n\n`;

  // Participants
  text += `Participants\n\n`;
  text += `A total of ${participants.n} participants were enrolled. `;
  text += `The mean age was ${participants.meanAge.toFixed(1)} years (SD = ${participants.ageSD.toFixed(1)}), `;
  text += `and ${participants.malePercent.toFixed(1)}% were male. `;

  // Interventions
  text += `Participants were randomly assigned to one of ${interventions.length} groups: `;
  text += interventions.map((i, idx) => `(${idx + 1}) ${i}`).join(', ');
  text += `.\n\n`;

  // Outcomes
  text += `Outcome Measures\n\n`;
  text += `The following outcome measures were assessed: ${outcomes.join(', ')}. `;
  text += `Follow-up assessments were conducted at days ${followUpDays.join(', ')} post-operatively.\n\n`;

  // Statistical Analysis
  text += `Statistical Analysis\n\n`;
  text += `Data were analyzed using ${statisticalTests.join(', ')}. `;
  text += `Statistical significance was set at p < .05. `;
  text += `All analyses were performed using Telos.AI Research Platform (version 1.0). `;
  text += `Effect sizes are reported using Cohen's d for t-tests, eta-squared (η²) for ANOVA, `;
  text += `and Cramér's V for chi-square tests.\n\n`;

  return text;
}

/**
 * Generate results narrative from statistical data
 */
export function generateResultsNarrative(data: {
  demographics: {
    groups: string[];
    ageComparison: { pValue: number; significant: boolean };
    genderDistribution: { pValue: number; significant: boolean };
  };
  primaryOutcome: {
    variable: string;
    testType: string;
    statistic: number;
    pValue: number;
    effectSize: number;
    groups: { name: string; mean: number; sd: number }[];
  };
  secondaryOutcomes?: Array<{
    variable: string;
    pValue: number;
    significant: boolean;
  }>;
}): string {
  const { demographics, primaryOutcome, secondaryOutcomes } = data;

  let narrative = '';

  // Demographics
  narrative += `Participant Characteristics\n\n`;
  narrative += `A total of ${demographics.groups.length} groups were compared. `;

  if (!demographics.ageComparison.significant) {
    narrative += `Groups were well-matched for age (p = ${demographics.ageComparison.pValue.toFixed(3)}). `;
  } else {
    narrative += `Significant age differences were noted between groups (p ${demographics.ageComparison.pValue < 0.001 ? '< .001' : `= ${demographics.ageComparison.pValue.toFixed(3)}`}). `;
  }

  if (!demographics.genderDistribution.significant) {
    narrative += `Gender distribution was similar across groups (p = ${demographics.genderDistribution.pValue.toFixed(3)}).\n\n`;
  } else {
    narrative += `Gender distribution differed significantly between groups (p ${demographics.genderDistribution.pValue < 0.001 ? '< .001' : `= ${demographics.genderDistribution.pValue.toFixed(3)}`}).\n\n`;
  }

  // Primary Outcome
  narrative += `Primary Outcome: ${primaryOutcome.variable}\n\n`;

  if (primaryOutcome.testType === 'ANOVA') {
    narrative += `${primaryOutcome.testType} revealed `;
    if (primaryOutcome.pValue < 0.05) {
      narrative += `significant differences in ${primaryOutcome.variable.toLowerCase()} between groups `;
      narrative += `(F = ${primaryOutcome.statistic.toFixed(2)}, `;
      narrative += `p ${primaryOutcome.pValue < 0.001 ? '< .001' : `= ${primaryOutcome.pValue.toFixed(3)}`}, `;
      narrative += `η² = ${primaryOutcome.effectSize.toFixed(3)}). `;

      // Describe group means
      narrative += `Mean scores were: `;
      narrative += primaryOutcome.groups
        .map((g) => `${g.name} (M = ${g.mean.toFixed(2)}, SD = ${g.sd.toFixed(2)})`)
        .join(', ');
      narrative += `. `;

      // Effect size interpretation
      if (primaryOutcome.effectSize >= 0.14) {
        narrative += `The effect size was large, indicating substantial practical significance.`;
      } else if (primaryOutcome.effectSize >= 0.06) {
        narrative += `The effect size was medium, indicating moderate practical significance.`;
      } else {
        narrative += `The effect size was small, indicating limited practical significance.`;
      }
    } else {
      narrative += `no significant differences in ${primaryOutcome.variable.toLowerCase()} between groups `;
      narrative += `(F = ${primaryOutcome.statistic.toFixed(2)}, p = ${primaryOutcome.pValue.toFixed(3)}).`;
    }
  }

  narrative += `\n\n`;

  // Secondary Outcomes
  if (secondaryOutcomes && secondaryOutcomes.length > 0) {
    narrative += `Secondary Outcomes\n\n`;

    const significant = secondaryOutcomes.filter((o) => o.significant);
    const notSignificant = secondaryOutcomes.filter((o) => !o.significant);

    if (significant.length > 0) {
      narrative += `Significant differences were also observed in: `;
      narrative += significant
        .map((o) => `${o.variable} (p ${o.pValue < 0.001 ? '< .001' : `= ${o.pValue.toFixed(3)}`})`)
        .join(', ');
      narrative += `. `;
    }

    if (notSignificant.length > 0) {
      narrative += `No significant differences were found in: `;
      narrative += notSignificant.map((o) => o.variable).join(', ');
      narrative += `.\n\n`;
    }
  }

  return narrative;
}

/**
 * Generate reference citations for statistical methods
 */
export function generateStatisticalReferences(): string[] {
  return [
    'Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.',
    'Field, A. (2018). Discovering statistics using IBM SPSS statistics (5th ed.). SAGE Publications.',
    'Tabachnick, B. G., & Fidell, L. S. (2019). Using multivariate statistics (7th ed.). Pearson.',
    'American Psychological Association. (2020). Publication manual of the American Psychological Association (7th ed.).',
    'Telos.AI Research Platform. (2025). Version 1.0 [Software]. https://telos.ai',
  ];
}

/**
 * Generate CONSORT-style flow diagram text
 */
export function generateCONSORTDiagram(data: {
  assessed: number;
  excluded: number;
  randomized: number;
  groups: Array<{
    name: string;
    allocated: number;
    received: number;
    lostToFollowUp: number;
    analyzed: number;
  }>;
}): string {
  let diagram = 'CONSORT Flow Diagram\n\n';

  diagram += `Enrollment\n`;
  diagram += `├─ Assessed for eligibility (n = ${data.assessed})\n`;
  diagram += `├─ Excluded (n = ${data.excluded})\n`;
  diagram += `└─ Randomized (n = ${data.randomized})\n\n`;

  diagram += `Allocation\n`;
  data.groups.forEach((group, idx) => {
    const isLast = idx === data.groups.length - 1;
    diagram += `${isLast ? '└' : '├'}─ ${group.name} (n = ${group.allocated})\n`;
    diagram += `${isLast ? ' ' : '│'}  ├─ Received allocated intervention (n = ${group.received})\n`;
    diagram += `${isLast ? ' ' : '│'}  ├─ Lost to follow-up (n = ${group.lostToFollowUp})\n`;
    diagram += `${isLast ? ' ' : '│'}  └─ Analyzed (n = ${group.analyzed})\n`;
    if (!isLast) diagram += `│\n`;
  });

  return diagram;
}
