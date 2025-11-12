// Word Document Export with APA 7th Edition Formatting
import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableCell,
  TableRow,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ImageRun,
  PageBreak,
  SectionType,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  convertInchesToTwip,
} from 'docx';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ResearchMetadata {
  title: string;
  authors: string[];
  institution: string;
  date: Date;
  keywords: string[];
  abstract?: string;
}

export interface APATableData {
  title: string;
  tableNumber: number;
  headers: string[];
  rows: (string | number)[][];
  note?: string;
  significanceNotes?: boolean;
}

export interface StatisticalResult {
  testType: 'ttest' | 'anova' | 'chisquare' | 'cox';
  statistic: number;
  pValue: number;
  degreesOfFreedom?: number | [number, number];
  effectSize?: number;
  confidenceInterval?: [number, number];
  sampleSize?: number;
  additionalStats?: Record<string, number>;
}

export interface ChartImage {
  data: Buffer;
  width: number;
  height: number;
  caption: string;
  figureNumber: number;
}

export interface MethodsSection {
  studyDesign: string;
  participants: {
    sampleSize: number;
    inclusionCriteria: string[];
    exclusionCriteria: string[];
    demographics: string;
  };
  procedure: string;
  statisticalAnalysis: string[];
}

export interface ResultsSection {
  demographics: APATableData;
  primaryOutcomes: APATableData;
  secondaryOutcomes?: APATableData;
  statisticalTests: StatisticalResult[];
  figures: ChartImage[];
}

// ============================================
// APA FORMATTING UTILITIES
// ============================================

/**
 * Format p-value according to APA standards
 */
export function formatPValue(p: number): string {
  if (p < 0.001) return '< .001';
  if (p < 0.01) return `= .${Math.round(p * 1000).toString().padStart(3, '0')}`;
  return `= .${Math.round(p * 100).toString().padStart(2, '0')}`;
}

/**
 * Format statistical result as APA text
 */
export function formatStatisticalText(result: StatisticalResult): string {
  const { testType, statistic, pValue, degreesOfFreedom, effectSize, sampleSize } = result;

  let text = '';

  switch (testType) {
    case 'ttest':
      const df = degreesOfFreedom as number;
      text = `t(${df}) = ${statistic.toFixed(2)}, p ${formatPValue(pValue)}`;
      if (effectSize !== undefined) {
        text += `, d = ${effectSize.toFixed(2)}`;
      }
      break;

    case 'anova':
      const [dfBetween, dfWithin] = degreesOfFreedom as [number, number];
      text = `F(${dfBetween}, ${dfWithin}) = ${statistic.toFixed(2)}, p ${formatPValue(pValue)}`;
      if (effectSize !== undefined) {
        text += `, η² = ${effectSize.toFixed(3)}`;
      }
      break;

    case 'chisquare':
      const dfChi = degreesOfFreedom as number;
      text = `χ²(${dfChi}`;
      if (sampleSize) {
        text += `, N = ${sampleSize}`;
      }
      text += `) = ${statistic.toFixed(2)}, p ${formatPValue(pValue)}`;
      if (effectSize !== undefined) {
        text += `, V = ${effectSize.toFixed(3)}`;
      }
      break;

    case 'cox':
      text = `HR = ${statistic.toFixed(2)}`;
      if (result.confidenceInterval) {
        const [lower, upper] = result.confidenceInterval;
        text += `, 95% CI [${lower.toFixed(2)}, ${upper.toFixed(2)}]`;
      }
      text += `, p ${formatPValue(pValue)}`;
      break;
  }

  return text;
}

/**
 * Add significance stars based on p-value
 */
export function getSignificanceStars(p: number): string {
  if (p < 0.001) return '***';
  if (p < 0.01) return '**';
  if (p < 0.05) return '*';
  return '';
}

// ============================================
// DOCUMENT SECTIONS
// ============================================

/**
 * Create APA-style title page
 */
function createTitlePage(metadata: ResearchMetadata): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Running head (removed in APA 7th for student papers, but kept for professional)
  paragraphs.push(
    new Paragraph({
      text: 'Running head: ' + metadata.title.toUpperCase().substring(0, 50),
      alignment: AlignmentType.LEFT,
      spacing: { after: 200 },
    })
  );

  // Title (centered, bold, title case)
  paragraphs.push(
    new Paragraph({
      text: metadata.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 200 },
    })
  );

  // Authors
  metadata.authors.forEach((author) => {
    paragraphs.push(
      new Paragraph({
        text: author,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );
  });

  // Institution
  paragraphs.push(
    new Paragraph({
      text: metadata.institution,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Date
  paragraphs.push(
    new Paragraph({
      text: metadata.date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      alignment: AlignmentType.CENTER,
    })
  );

  return paragraphs;
}

/**
 * Create abstract section
 */
function createAbstract(abstractText: string, keywords: string[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  paragraphs.push(
    new Paragraph({
      text: 'Abstract',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 200 },
    })
  );

  paragraphs.push(
    new Paragraph({
      text: abstractText,
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 480 }, // Double spacing (240 = single)
    })
  );

  // Keywords
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Keywords: ',
          italics: true,
        }),
        new TextRun({
          text: keywords.join(', '),
        }),
      ],
      spacing: { before: 200 },
    })
  );

  return paragraphs;
}

/**
 * Create APA-formatted table
 */
function createAPATable(data: APATableData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  // Table title (italicized)
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Table ${data.tableNumber}`,
          italics: true,
          bold: true,
        }),
      ],
      spacing: { before: 400, after: 100 },
    })
  );

  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.title,
          italics: true,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // Create table
  const tableRows: TableRow[] = [];

  // Header row
  tableRows.push(
    new TableRow({
      children: data.headers.map(
        (header) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: header,
                    bold: true,
                  }),
                ],
              }),
            ],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.NONE, size: 0 },
              right: { style: BorderStyle.NONE, size: 0 },
            },
          })
      ),
    })
  );

  // Data rows
  data.rows.forEach((row) => {
    tableRows.push(
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              children: [
                new Paragraph({
                  text: String(cell),
                }),
              ],
              borders: {
                top: { style: BorderStyle.NONE, size: 0 },
                bottom: { style: BorderStyle.NONE, size: 0 },
                left: { style: BorderStyle.NONE, size: 0 },
                right: { style: BorderStyle.NONE, size: 0 },
              },
            })
        ),
      })
    );
  });

  const table = new Table({
    rows: tableRows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.NONE, size: 0 },
      right: { style: BorderStyle.NONE, size: 0 },
      insideHorizontal: { style: BorderStyle.NONE, size: 0 },
      insideVertical: { style: BorderStyle.NONE, size: 0 },
    },
  });

  elements.push(table);

  // Table note
  if (data.note) {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Note. ',
            italics: true,
          }),
          new TextRun({
            text: data.note,
          }),
        ],
        spacing: { before: 100, after: 200 },
      })
    );
  }

  // Significance notes
  if (data.significanceNotes) {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '* ',
            italics: true,
          }),
          new TextRun({
            text: 'p',
            italics: true,
          }),
          new TextRun({
            text: ' < .05. ** ',
          }),
          new TextRun({
            text: 'p',
            italics: true,
          }),
          new TextRun({
            text: ' < .01. *** ',
          }),
          new TextRun({
            text: 'p',
            italics: true,
          }),
          new TextRun({
            text: ' < .001.',
          }),
        ],
        spacing: { after: 400 },
      })
    );
  }

  return elements;
}

/**
 * Create figure with caption
 */
function createFigure(chart: ChartImage): (Paragraph | ImageRun)[] {
  const elements: any[] = [];

  // Image
  elements.push(
    new Paragraph({
      children: [
        new ImageRun({
          data: chart.data,
          transformation: {
            width: chart.width,
            height: chart.height,
          },
        } as any),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 200 },
    })
  );

  // Caption
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Figure ${chart.figureNumber}. `,
          italics: true,
          bold: true,
        }),
        new TextRun({
          text: chart.caption,
          italics: true,
        }),
      ],
      alignment: AlignmentType.LEFT,
      spacing: { after: 400 },
    })
  );

  return elements;
}

/**
 * Create methods section
 */
function createMethodsSection(methods: MethodsSection): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  paragraphs.push(
    new Paragraph({
      text: 'Methods',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  // Study Design
  paragraphs.push(
    new Paragraph({
      text: 'Study Design',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    })
  );

  paragraphs.push(
    new Paragraph({
      text: methods.studyDesign,
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 480, after: 200 },
    })
  );

  // Participants
  paragraphs.push(
    new Paragraph({
      text: 'Participants',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    })
  );

  paragraphs.push(
    new Paragraph({
      text: `A total of ${methods.participants.sampleSize} participants were enrolled in this study. ${methods.participants.demographics}`,
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 480, after: 100 },
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Inclusion criteria: ',
          italics: true,
        }),
        new TextRun({
          text: methods.participants.inclusionCriteria.join('; ') + '.',
        }),
      ],
      spacing: { line: 480, after: 100 },
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Exclusion criteria: ',
          italics: true,
        }),
        new TextRun({
          text: methods.participants.exclusionCriteria.join('; ') + '.',
        }),
      ],
      spacing: { line: 480, after: 200 },
    })
  );

  // Procedure
  paragraphs.push(
    new Paragraph({
      text: 'Procedure',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    })
  );

  paragraphs.push(
    new Paragraph({
      text: methods.procedure,
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 480, after: 200 },
    })
  );

  // Statistical Analysis
  paragraphs.push(
    new Paragraph({
      text: 'Statistical Analysis',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    })
  );

  methods.statisticalAnalysis.forEach((analysis) => {
    paragraphs.push(
      new Paragraph({
        text: analysis,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 480, after: 100 },
      })
    );
  });

  return paragraphs;
}

/**
 * Create results section
 */
function createResultsSection(results: ResultsSection): any[] {
  const elements: any[] = [];

  elements.push(
    new Paragraph({
      text: 'Results',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  // Demographics table
  elements.push(
    new Paragraph({
      text: 'Participant Characteristics',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    })
  );

  elements.push(...createAPATable(results.demographics));

  // Primary outcomes
  elements.push(
    new Paragraph({
      text: 'Primary Outcomes',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 100 },
    })
  );

  elements.push(...createAPATable(results.primaryOutcomes));

  // Statistical results narrative
  elements.push(
    new Paragraph({
      text: 'Statistical Findings',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 100 },
    })
  );

  results.statisticalTests.forEach((test) => {
    const text = formatStatisticalText(test);
    elements.push(
      new Paragraph({
        text: `Statistical analysis revealed ${text}.`,
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 480, after: 100 },
      })
    );
  });

  // Secondary outcomes
  if (results.secondaryOutcomes) {
    elements.push(
      new Paragraph({
        text: 'Secondary Outcomes',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 100 },
      })
    );

    elements.push(...createAPATable(results.secondaryOutcomes));
  }

  // Figures
  results.figures.forEach((figure) => {
    elements.push(...createFigure(figure));
  });

  return elements;
}

/**
 * Create references section
 */
function createReferencesSection(citations: string[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  paragraphs.push(
    new Paragraph({
      text: 'References',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  citations.forEach((citation) => {
    paragraphs.push(
      new Paragraph({
        text: citation,
        spacing: { line: 480, after: 100 },
        indent: {
          left: convertInchesToTwip(0.5),
          hanging: convertInchesToTwip(0.5),
        },
      })
    );
  });

  return paragraphs;
}

// ============================================
// MAIN EXPORT FUNCTION
// ============================================

export interface PublicationDocument {
  metadata: ResearchMetadata;
  abstract: string;
  methods: MethodsSection;
  results: ResultsSection;
  discussion?: string;
  references: string[];
}

/**
 * Generate complete APA-style Word document
 */
export async function generatePublicationDocument(
  data: PublicationDocument
): Promise<Document> {
  const sections: any[] = [];

  // Title page section
  sections.push({
    properties: {
      type: SectionType.NEXT_PAGE,
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            text: 'Running head: ' + data.metadata.title.toUpperCase().substring(0, 50),
            alignment: AlignmentType.LEFT,
          }),
        ],
      }),
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                children: [PageNumber.CURRENT],
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
      }),
    },
    children: createTitlePage(data.metadata),
  });

  // Abstract section
  sections.push({
    properties: {
      type: SectionType.NEXT_PAGE,
    },
    children: createAbstract(data.abstract, data.metadata.keywords),
  });

  // Methods section
  sections.push({
    properties: {
      type: SectionType.CONTINUOUS,
    },
    children: createMethodsSection(data.methods),
  });

  // Results section
  sections.push({
    properties: {
      type: SectionType.CONTINUOUS,
    },
    children: createResultsSection(data.results),
  });

  // Discussion section (if provided)
  if (data.discussion) {
    sections.push({
      properties: {
        type: SectionType.CONTINUOUS,
      },
      children: [
        new Paragraph({
          text: 'Discussion',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          text: data.discussion,
          alignment: AlignmentType.JUSTIFIED,
          spacing: { line: 480 },
        }),
      ],
    });
  }

  // References section
  sections.push({
    properties: {
      type: SectionType.NEXT_PAGE,
    },
    children: createReferencesSection(data.references),
  });

  const doc = new Document({
    sections,
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
            size: 24, // 12pt (half-points)
          },
          paragraph: {
            spacing: {
              line: 480, // Double spacing
              before: 0,
              after: 0,
            },
          },
        },
        heading1: {
          run: {
            font: 'Times New Roman',
            size: 24,
            bold: true,
          },
          paragraph: {
            spacing: {
              before: 400,
              after: 200,
            },
          },
        },
        heading2: {
          run: {
            font: 'Times New Roman',
            size: 24,
            bold: true,
          },
          paragraph: {
            spacing: {
              before: 200,
              after: 100,
            },
          },
        },
      },
    },
  });

  return doc;
}

/**
 * Generate auto-generated abstract from research data
 */
export function generateAbstract(data: {
  title: string;
  groups: number;
  totalPatients: number;
  primaryOutcome: string;
  statisticalResults: StatisticalResult[];
  clinicalSignificance: string;
}): string {
  const { groups, totalPatients, primaryOutcome, statisticalResults, clinicalSignificance } = data;

  let abstract = `This study compared ${groups} treatment groups with a total of ${totalPatients} participants. `;

  abstract += `The primary outcome measure was ${primaryOutcome}. `;

  // Add key statistical findings
  statisticalResults.forEach((result) => {
    const statText = formatStatisticalText(result);
    abstract += `Statistical analysis revealed significant differences (${statText}). `;
  });

  abstract += `${clinicalSignificance} `;

  abstract += `These findings suggest important implications for clinical practice and warrant further investigation.`;

  return abstract;
}

/**
 * Generate methods description automatically
 */
export function generateMethodsText(data: {
  studyType: string;
  surgeryType: string;
  interventions: string[];
  followUpDays: number[];
}): string {
  const { studyType, surgeryType, interventions, followUpDays } = data;

  let text = `This ${studyType} study examined outcomes following ${surgeryType}. `;

  text += `Participants were randomly assigned to ${interventions.length} groups: ${interventions.join(', ')}. `;

  text += `Follow-up assessments were conducted at ${followUpDays.join(', ')} days post-operatively. `;

  text += `Outcome measures included pain scores (0-10 numeric rating scale), patient satisfaction, and adverse events.`;

  return text;
}
