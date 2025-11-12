# Automated Export System - Complete Guide

## Overview

The Telos.AI Research Platform now includes a comprehensive automated export system that generates publication-ready Word documents and PDFs with APA 7th edition formatting.

## Features

### Export Formats Supported

1. **Word Documents (.docx)**
   - Fully editable APA 7th edition formatting
   - Publication-ready manuscripts
   - Tables with proper APA styling
   - Automatic page numbering and headers
   - Perfect for journal submissions

2. **PDF Documents**
   - Professional A4 layout with 1-inch margins
   - Headers with research title
   - Footer with page numbers
   - High-resolution chart embedding
   - Optimized file sizes

### Template Types

#### 1. Publication Template (Full Manuscript)
**Purpose:** Complete APA-style manuscript for journal submission

**Sections Included:**
- Title Page (with running head)
- Abstract (with keywords)
- Introduction
- Methods (study design, participants, procedure, statistical analysis)
- Results (with tables and figures)
- Discussion
- References
- Tables (separate section)
- Figures (separate section)

**Best For:** Submitting to peer-reviewed journals

#### 2. Conference Abstract Template
**Purpose:** One-page summary for conference submission

**Sections Included:**
- Header
- Background
- Methods (brief)
- Results (key findings)
- Conclusions

**Best For:** Conference presentations, poster sessions

#### 3. Progress Report Template
**Purpose:** Monthly research progress updates

**Sections Included:**
- Executive Summary
- Recruitment Status
- Data Collection Progress
- Preliminary Findings
- Challenges and Solutions
- Next Steps

**Best For:** Stakeholder updates, grant reporting

#### 4. Patient Summary Template
**Purpose:** Comprehensive individual patient report

**Sections Included:**
- Patient Information
- Surgical Details
- Recovery Timeline
- Outcomes
- Follow-up Schedule

**Best For:** Clinical documentation, patient records

#### 5. Grant Report Template
**Purpose:** Report for funding agencies

**Sections Included:**
- Cover Page
- Project Summary
- Objectives and Milestones
- Methods
- Results and Findings
- Budget Utilization
- Publications and Presentations
- Future Directions

**Best For:** Grant reporting, funding renewals

## APA 7th Edition Formatting

### Statistical Notation Examples

The system automatically formats statistical results according to APA guidelines:

#### t-test
```
t(87) = 3.45, p = .001, d = 0.67
```
- Degrees of freedom in parentheses
- Test statistic to 2 decimal places
- p-value with leading zero removed for values < 1
- Cohen's d effect size

#### ANOVA
```
F(2, 87) = 5.23, p = .008, η² = .105
```
- Between and within degrees of freedom
- F-statistic to 2 decimal places
- Eta-squared (η²) for effect size

#### Chi-Square
```
χ²(2, N = 90) = 4.82, p = .028, V = .234
```
- Degrees of freedom and sample size
- Chi-square statistic
- Cramér's V for effect size

#### Cox Regression (Hazard Ratio)
```
HR = 0.65, 95% CI [0.42, 0.98], p = .041
```
- Hazard ratio
- 95% confidence interval in square brackets
- p-value

### p-value Formatting

Following APA guidelines:
- **p < .001** for very small p-values
- **p = .045** for p ≥ .001 (leading zero removed)
- Never report as "p = .000"

### Table Formatting

APA-style tables include:
- Table number and title (italicized)
- Horizontal lines only (top and bottom of header, bottom of table)
- No vertical lines
- Centered headers (bold)
- Left-aligned text columns
- Note section below table
- Significance indicators (* p < .05, ** p < .01, *** p < .001)

## Using the Export System

### From Comparison Page

1. Navigate to your research project
2. Go to the "Análise Comparativa" (Comparison Analysis) page
3. Click the "Exportar Relatório" button in the top right
4. The Export Modal will open

### Export Modal Configuration

#### Tab 1: Format
**Export Format:**
- Choose between Word (.docx) or PDF
- See recommendations for each format

**Template Selection:**
- Select from 5 pre-defined templates
- View template description and included sections

#### Tab 2: Content
**Select Sections:**
- ✓ ANOVA Results (variance analysis, post-hoc tests, effect sizes)
- ✓ Chi-Square Analysis (categorical variable associations)
- ✓ Regression Models (predictive analyses)
- ✓ Survival Analysis (Kaplan-Meier curves, Cox models)
- ✓ Demographics (baseline characteristics)
- ✓ Raw Data Tables (individual data for appendices)

**Quick Actions:**
- "Selecionar Todas" - Select all sections
- "Limpar" - Deselect all sections

#### Tab 3: Style
**Citation Style:**
- APA 7th Edition (default, recommended)
- Vancouver (medical journals)
- Custom

**Charts and Figures:**
- Toggle charts inclusion
- Choose resolution:
  - Standard (72 DPI) - Smaller files
  - High (150 DPI) - Better quality
  - Print (300 DPI) - Maximum quality for publication

**Anonymization:**
- Enable to remove patient names and identifiable information
- Required for sharing and publication

**Language:**
- Português (Brasil)
- English (US)

### Exporting

1. Configure your preferences in all three tabs
2. Click "Visualizar Preview" to see a preview (optional)
3. Click "Exportar Relatório"
4. Progress bar shows generation status
5. File automatically downloads when complete

## Example APA-Formatted Output

### Demographics Table

```
Table 1

Baseline Characteristics by Study Group

─────────────────────────────────────────────────────────────────
Characteristic           Group A        Group B        p-value
                        (n = 45)       (n = 45)
─────────────────────────────────────────────────────────────────
Age (years), M (SD)     52.3 (8.1)    54.7 (7.9)      .156
Male sex, n (%)         28 (62.2)     25 (55.6)       .423
BMI, M (SD)             26.4 (3.2)    27.1 (3.5)      .289
─────────────────────────────────────────────────────────────────

Note. M = Mean; SD = Standard Deviation.
```

### Outcomes Table

```
Table 2

Primary and Secondary Outcomes by Study Group

─────────────────────────────────────────────────────────────────
Outcome                  Group A        Group B        p-value
                        (n = 45)       (n = 45)
─────────────────────────────────────────────────────────────────
Pain Day 7, M (SD)      4.2 (1.5)     6.8 (1.3)       < .001***
Recovery time (days)    12             18              .002**
Satisfaction (0-10)     8.3            7.1             .015*
─────────────────────────────────────────────────────────────────

Note. M = Mean; SD = Standard Deviation.
* p < .05. ** p < .01. *** p < .001.
```

### Results Narrative

```
Results

Participant Characteristics

A total of 2 groups were compared. Groups were well-matched for age
(p = .156). Gender distribution was similar across groups (p = .423).

Primary Outcome: Postoperative Pain Day 7

ANOVA revealed significant differences in postoperative pain day 7
between groups (F = 5.23, p = .008, η² = .105). Mean scores were:
Group A (M = 4.20, SD = 1.50), Group B (M = 6.80, SD = 1.30). The
effect size was medium, indicating moderate practical significance.

Secondary Outcomes

Significant differences were also observed in: recovery time
(p = .002), satisfaction scores (p = .015). No significant
differences were found in: hospital stay duration.
```

## Technical Implementation

### Files Created

1. **C:\Users\joaov\sistema-pos-operatorio\lib\word-export.ts** (901 lines)
   - Word document generation with APA formatting
   - Statistical text formatting functions
   - Table generation utilities
   - Document section builders

2. **C:\Users\joaov\sistema-pos-operatorio\lib\pdf-export.ts** (578 lines)
   - PDF generation with professional layout
   - Chart capture and embedding
   - Page headers and footers
   - Table formatting with jspdf-autotable

3. **C:\Users\joaov\sistema-pos-operatorio\lib\export-templates.ts** (690 lines)
   - 5 pre-defined export templates
   - Template management functions
   - Auto-generated content functions
   - CONSORT diagram generator

4. **C:\Users\joaov\sistema-pos-operatorio\components\research\ExportReportModal.tsx** (696 lines)
   - Modal UI with 3-tab configuration
   - Export progress tracking
   - Preview functionality
   - File size estimation

5. **C:\Users\joaov\sistema-pos-operatorio\app\api\export-research\report\route.ts** (380 lines)
   - API endpoint for report generation
   - Data fetching and processing
   - Format-specific document generation
   - File streaming and download

### Libraries Used

- **docx** (v9.5.1) - Word document generation
- **jspdf** (v3.0.3) - PDF generation
- **jspdf-autotable** (v5.0.2) - PDF table formatting
- **html2canvas** (v1.4.1) - Chart capture for embedding

## File Size Optimization

The system automatically optimizes file sizes:

| Configuration | Estimated Size |
|--------------|----------------|
| No charts | < 1 MB |
| Charts (Standard 72 DPI) | 2-5 MB |
| Charts (High 150 DPI) | 5-10 MB |
| Charts (Print 300 DPI) | 5-15 MB |

## Quality Assurance

The system includes:

✓ APA 7th edition formatting validation
✓ Statistical notation verification
✓ Table structure compliance
✓ p-value formatting checks
✓ File size optimization
✓ Edge case handling (missing data, long titles)

## Bilingual Support

All exports support both Portuguese (Brazilian) and English (US):

- Automatically translates section headings
- Formats dates according to locale
- Adjusts statistical terminology
- Maintains APA compliance in both languages

## Demo Instructions

To test the export system:

1. **Create a research project** with at least 2 groups
2. **Add patients** to each group (minimum 10 per group recommended)
3. **Enter surgical data** and pain records
4. **Navigate to Comparison page** (`/dashboard/pesquisas/[id]/comparacao`)
5. **Click "Exportar Relatório"** button
6. **Select format** (Word or PDF)
7. **Choose template** (e.g., "Publication Manuscript")
8. **Select sections** to include
9. **Configure style options**
10. **Click "Exportar Relatório"** to download

## Example File Names

Generated files follow this naming pattern:
```
Research_Title_Template_Name_YYYY-MM-DD.extension
```

Examples:
- `Pain_Management_Study_Publication_Manuscript_2025-01-15.docx`
- `Surgical_Outcomes_RCT_Progress_Report_2025-01-15.pdf`
- `Post_Op_Recovery_Conference_Abstract_2025-01-15.docx`

## Best Practices

### For Publication Submissions

1. Use **Publication Template**
2. Choose **Word (.docx)** format for editability
3. Select **APA style**
4. Include **all statistical sections**
5. Use **Print resolution (300 DPI)** for charts
6. **Enable anonymization**
7. Choose **English** language for international journals

### For Progress Reports

1. Use **Progress Report Template**
2. Choose **PDF** format for easy sharing
3. Select **Custom style**
4. Include **demographics and preliminary findings**
5. Use **High resolution (150 DPI)** for charts
6. Choose **Portuguese** for Brazilian stakeholders

### For Conference Submissions

1. Use **Conference Abstract Template**
2. Choose **Word (.docx)** for editing
3. Select **APA or Custom style**
4. Include **only key findings**
5. **Disable charts** to meet page limits
6. Check conference language requirements

## Troubleshooting

### File Won't Download
- Check browser pop-up blocker
- Try a different browser
- Ensure sufficient disk space

### Missing Data in Export
- Verify data exists in the research project
- Check that sections are selected in modal
- Confirm statistical analyses have been run

### Formatting Issues
- Report to development team with:
  - Template used
  - Format (Word/PDF)
  - Screenshot of issue

## Future Enhancements

Planned features:
- Custom template creation
- Citation manager integration
- Batch export for multiple studies
- Email delivery option
- Cloud storage integration
- Version control for documents

## Support

For questions or issues:
- Contact: support@telos.ai
- Documentation: https://docs.telos.ai/export
- Issues: https://github.com/telos-ai/issues

---

**System Version:** 1.0
**Last Updated:** January 2025
**APA Standard:** 7th Edition
**Supported Formats:** DOCX, PDF
