# Research Export Functionality - Complete Guide

## Overview

The Research Export functionality provides a comprehensive, production-ready system for exporting clinical research data from the post-operative monitoring system. It enables doctors to export patient data organized by research groups in multiple formats with extensive customization options.

## Features

### 1. Research Selection
- Dropdown to select from all available research studies (active and inactive)
- Display of research details including:
  - Title and description
  - Total patient count
  - Number of groups
  - Start date
  - Surgery type (if specified)

### 2. Group Selection
- Visual cards for each research group showing:
  - Group code (A, B, C, etc.)
  - Group name
  - Description
  - Patient count
- Individual checkboxes for each group
- "Select all" / "Deselect all" toggle button
- Groups are color-coded when selected

### 3. Export Formats
- **Excel (.xlsx)** - Multiple sheets with formatted data
- **CSV** - Simple comma-separated values
- **PDF** - Professional report format (coming soon)

### 4. Export Types

#### Individual Data
- One row per patient
- All selected fields in a single comprehensive dataset
- Includes statistical summary sheet
- Best for: Raw data analysis, SPSS/R import

#### Comparative Data
- Groups displayed side-by-side
- Key metrics compared across groups
- Statistical measures included
- Best for: Quick group comparisons, presentations

#### Statistical Summary
- Descriptive statistics by group
- Means, standard deviations, medians, ranges
- Organized by category (demographics, pain scores, etc.)
- Best for: Research papers, summary reports

#### Timeline Data
- Follow-up progression for each patient
- One row per follow-up day
- Shows response patterns over time
- Best for: Longitudinal analysis, adherence studies

### 5. Field Selection

Users can choose to include:

#### Dados Básicos (Basic Data)
- Patient ID
- Age
- Sex
- Date of birth (optional)

#### Dados Cirúrgicos (Surgical Data)
- Surgery type
- Surgery date
- Hospital
- Duration in minutes
- Anesthesia details
  - Type
  - Pudendal nerve block (yes/no)
  - Block technique
  - Anesthetic used
  - Laterality
- Pre-operative preparation
  - Botox use
  - Bowel preparation
- Intra-operative complications
- Same-day discharge
- Hospitalization days

#### Comorbidades (Comorbidities)
- List of comorbidities
- Count by category
- Details and severity

#### Medicações (Medications)
- Current medications
- Dosage and frequency
- Route of administration

#### Follow-ups
- Total follow-ups
- Completed follow-ups
- Adherence rate

#### Respostas dos Questionários (Questionnaire Responses)
- Pain levels by day (D+1, D+2, D+3, D+5, D+7, D+10, D+14)
- Pain statistics (mean, max, min, standard deviation)
- Urinary retention
- Bowel movements
- Bleeding
- NPS score (patient satisfaction)
- Red flags identified

#### Análises de IA (AI Analysis)
- Risk level assessments
- AI-generated alerts
- Doctor notifications
- Response patterns

### 6. Date Range Filter (Optional)
- Filter surgeries by date range
- Useful for specific time periods
- Can be combined with group selection

### 7. Delivery Options

#### Direct Download
- Immediate file download
- Recommended for small to medium datasets

#### Email Delivery
- Send export to specified email address
- Recommended for large files
- Default email pre-filled from user account

### 8. Preview Functionality
- View export summary before downloading
- Shows:
  - Total patients
  - Total surgeries
  - Total follow-ups
  - Statistics by group
- Helps validate selections before final export

## File Structure

### Excel Export Structure

When exporting to Excel, the file contains multiple sheets:

#### Sheet 1: Informações (Research Information)
- Research title and description
- Surgery type
- Start and end dates
- Total patient count
- Group details

#### Sheet 2: Main Data (varies by export type)
- **Individual**: Complete patient data
- **Comparative**: Group comparison table
- **Statistical**: Statistical analysis
- **Timeline**: Follow-up progression

#### Sheet 3: Estatísticas (Statistics) - Only for Individual export
- Descriptive statistics
- Organized by category and group
- Includes means, standard deviations, medians, ranges

#### Sheet 4: Glossário (Glossary)
- Field descriptions
- Code explanations
- Risk level definitions

### CSV Export Structure
- Single file with selected data
- Headers in first row
- UTF-8 encoding
- Compatible with Excel, SPSS, R, Python

## API Endpoints

### POST /api/export-research
Main export endpoint that generates and returns the file.

**Request Body:**
```typescript
{
  researchId: string;
  groupIds: string[];
  fields: {
    dadosBasicos: boolean;
    dadosCirurgicos: boolean;
    comorbidades: boolean;
    medicacoes: boolean;
    followUps: boolean;
    respostasQuestionarios: boolean;
    analiseIA: boolean;
  };
  exportType: 'individual' | 'comparative' | 'statistical' | 'timeline';
  format: 'xlsx' | 'csv' | 'pdf';
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  sendEmail?: boolean;
  emailAddress?: string;
}
```

**Response:**
- Success: File download (blob)
- Error: JSON with error message

### POST /api/export-research/preview
Preview endpoint to validate and show statistics before export.

**Request Body:**
```typescript
{
  researchId: string;
  groupIds: string[];
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
}
```

**Response:**
```typescript
{
  success: boolean;
  totalPatients: number;
  totalSurgeries: number;
  totalFollowUps: number;
  groupStats: Array<{
    groupCode: string;
    groupName: string;
    patientCount: number;
    surgeryCount: number;
  }>;
}
```

## Usage Examples

### Basic Export - Individual Data
1. Navigate to `/dashboard/exportar-pesquisa`
2. Select your research from dropdown
3. Click "Selecionar todos" to include all groups
4. Keep default field selections (all checked)
5. Select "Excel (.xlsx)" format
6. Click "Exportar Dados"

### Comparative Analysis - Two Groups
1. Select research
2. Check only groups A and B
3. Select "Comparativo" export type
4. Choose fields relevant to comparison
5. Click "Visualizar Preview" to verify
6. Click "Exportar Dados"

### Statistical Summary for Publication
1. Select research
2. Select relevant groups
3. Choose "Resumo Estatístico" type
4. Select format (Excel recommended)
5. Deselect "Análises de IA" if not needed
6. Export and use in research paper

### Timeline Analysis
1. Select research
2. Select groups to analyze
3. Choose "Linha do Tempo" type
4. Ensure "Follow-ups" and "Respostas dos Questionários" are checked
5. Optionally apply date filter
6. Export

## Data Privacy & Security

### Anonymization
- Patient names are replaced with IDs
- No personally identifiable information exported
- Complies with research data standards

### Access Control
- Only authenticated users can export
- Users can only export their own research data
- Research ownership verified on every request

### Audit Trail
- All exports are logged
- Timestamps recorded
- User actions tracked

## Technical Details

### Files Created

1. **Frontend Page**
   - `app/dashboard/exportar-pesquisa/page.tsx`
   - Full-featured UI with React hooks
   - Session management
   - Loading states
   - Error handling

2. **API Routes**
   - `app/api/export-research/route.ts` - Main export endpoint
   - `app/api/export-research/preview/route.ts` - Preview endpoint

3. **Utility Functions**
   - `lib/research-export-utils.ts` - Export logic
   - Type definitions
   - Data formatting functions
   - Statistical calculations
   - Excel/CSV generation

### Dependencies
All required packages are already installed:
- `xlsx` - Excel file generation
- `next-auth` - Authentication
- `@prisma/client` - Database access
- `lucide-react` - Icons
- `sonner` - Toast notifications

### Database Queries
The export system efficiently queries:
- Research with groups
- Patients filtered by research group
- Surgeries with all relations
- Follow-ups with responses
- Comorbidities and medications

## Performance Considerations

### Query Optimization
- Prisma includes used for efficient joins
- Filters applied at database level
- Indexes on research fields

### Memory Management
- Streaming for large datasets
- Buffer-based file generation
- Efficient data transformations

### Recommended Limits
- Direct download: Up to 1000 patients
- Email delivery: For larger datasets
- Consider pagination for very large exports

## Future Enhancements

### Planned Features
1. **PDF Export**
   - Professional report formatting
   - Charts and graphs
   - Publication-ready output

2. **Email Delivery**
   - Integration with email service
   - Attachment handling
   - Delivery confirmation

3. **Scheduled Exports**
   - Recurring exports
   - Automatic delivery
   - Custom schedules

4. **Advanced Statistics**
   - P-value calculations
   - ANOVA/t-tests
   - Correlation analysis

5. **Data Visualization**
   - Embedded charts in Excel
   - Interactive dashboards
   - Visual comparisons

## Troubleshooting

### Common Issues

#### No patients found
- **Cause**: No patients assigned to selected groups
- **Solution**: Verify patient group assignments in patient records

#### Export fails
- **Cause**: Invalid date range or missing required fields
- **Solution**: Check console errors, verify all required fields selected

#### Preview shows 0 patients
- **Cause**: Date filter excluding all surgeries
- **Solution**: Adjust or remove date filter

#### Excel file won't open
- **Cause**: Browser download issue
- **Solution**: Try different browser or use email delivery

## Support

For issues or questions:
1. Check this documentation
2. Review console logs for errors
3. Verify database connections
4. Check user permissions
5. Contact system administrator

## Best Practices

### For Research Data
1. Always use preview before final export
2. Document export parameters
3. Keep exported files secure
4. Use descriptive file names
5. Archive exports for reproducibility

### For Statistical Analysis
1. Export raw individual data first
2. Use statistical software for analysis
3. Document transformations
4. Cross-validate with comparative export
5. Keep methodology consistent

### For Publications
1. Use statistical summary export
2. Include all relevant fields
3. Document inclusion/exclusion criteria
4. Save export parameters
5. Maintain data provenance

## Version History

### Version 1.0 (Current)
- Initial release
- All core features implemented
- Excel and CSV export
- Four export types
- Comprehensive field selection
- Preview functionality
- Production-ready code

---

**Created**: November 2025
**System**: Post-Operative Monitoring System with Research Module
**Author**: Dr. João Vitor Viana
**Technology**: Next.js 16, TypeScript, Prisma, PostgreSQL
