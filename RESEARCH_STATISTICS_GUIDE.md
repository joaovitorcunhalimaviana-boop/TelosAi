# Research Statistics & Reporting Dashboard Guide

## Overview

The Research Statistics and Reporting page provides comprehensive analytics and visualizations for your clinical research studies. This powerful dashboard helps you track, analyze, and compare data across different research groups with professional-grade statistical analysis.

## Features Implemented

### 1. Overview Section

**Location:** `/dashboard/pesquisas/[id]`

The overview section provides at-a-glance metrics for your entire research study:

- **Total Participants**: Count of all enrolled patients across all groups
- **Average Age**: Mean age of all participants
- **Data Completeness**: Percentage of required data fields completed
- **Start Date**: When the research began
- **Duration**: Days elapsed since research started
- **Status**: Active or Completed

### 2. Group Statistics Cards

Each research group displays:

- **Patient Count**: Number of participants in this group
- **Average Age**: Mean age of group participants
- **Age Range**: Minimum and maximum ages
- **Sex Distribution**: Gender breakdown with visual progress bars
- **Surgery Type Distribution**: Types of surgeries performed
- **Data Completeness**: Percentage of complete data per group
- **Follow-up Response Rate**: Percentage of follow-ups completed

### 3. Demographics Charts

#### Sex Distribution (Pie Chart)
- Visual representation of gender distribution
- Percentages and counts for each category
- Color-coded for easy interpretation

#### Age Distribution (Bar Chart)
- Compares age ranges across groups
- Shows minimum, average, and maximum ages
- Side-by-side comparison for multiple groups

#### Group Comparison (Bar Chart)
- Patient count per group
- Average age comparison
- Response rate comparison

### 4. Clinical Data Comparison

#### Comorbidities Analysis
- Top 5 comorbidities per group
- Visual progress bars showing prevalence
- Count and percentage of affected patients

#### Medications Analysis
- Most common medications per group
- Usage frequency visualization
- Easy identification of treatment patterns

#### Surgery Techniques
- Distribution of surgical approaches
- Technique comparison across groups

### 5. Outcomes Analysis

#### Pain Scores Over Time (Line Chart)
- Tracks pain levels throughout follow-up period
- Separate lines for each research group
- Visual trend analysis
- Days post-op on X-axis (D+1, D+3, D+7, etc.)
- Pain level (0-10) on Y-axis

#### Complication Rates (Bar Chart)
- Percentage of complications per group
- Easy comparison to identify safer approaches
- Color-coded severity levels

#### Response Rates (Bar Chart)
- Follow-up completion rates
- Identifies engagement levels per group
- Helps assess data quality

### 6. Statistical Tests

When comparing 2 groups, automatic statistical analysis includes:

#### T-Test for Age
- **t-statistic**: Statistical significance measure
- **Mean Group 1**: Average age in first group
- **Mean Group 2**: Average age in second group
- **Difference**: Calculated age difference
- **Interpretation**: Helps determine if age distributions differ significantly

#### Chi-Square Tests (Future Enhancement)
- For categorical variables (sex, comorbidities)
- Determines if distributions differ between groups
- P-values for statistical significance

### 7. Export Options

Three export formats available:

#### Export as PDF
- Professional research report format
- All charts and tables included
- Ready for presentations or publications

#### Export Raw Data
- Excel/CSV format
- All patient data with privacy protection
- Ready for statistical software (SPSS, R, Python)

#### Email Report
- Send report directly to collaborators
- Automated scheduling options (daily, weekly, monthly)
- Customizable recipient list

### 8. Interactive Tabs

Navigation organized into 5 main sections:

#### Overview Tab
- Summary statistics
- Key visualizations
- Quick insights

#### Demographics Tab
- Detailed demographic breakdown per group
- Age and sex distributions
- Participant profiles

#### Groups Tab
- In-depth analysis of each research group
- Metrics, surgery types, follow-up stats
- Individual group performance

#### Outcomes Tab
- Pain progression charts
- Complication analysis
- Response rate tracking
- Clinical outcome measures

#### Clinical Data Tab
- Comorbidities comparison
- Medications analysis
- Statistical tests results
- Treatment patterns

## How to Use

### Accessing Statistics

1. Navigate to **Dashboard > Pesquisas**
2. Find your research study in the list
3. Click the **"Estatísticas"** button (blue button with bar chart icon)
4. You'll be taken to the comprehensive statistics dashboard

### Interpreting Charts

#### Pain Scores Chart
- **Lower lines = Better outcomes**: Groups with lower pain scores show better pain management
- **Steeper decline = Faster recovery**: Groups where pain drops quickly indicate faster healing
- **Compare trajectories**: Look for differences in pain patterns between groups

#### Complication Rates
- **Lower bars = Safer approach**: Groups with fewer complications indicate better techniques
- **Watch for outliers**: Significant differences may indicate protocol issues

#### Response Rates
- **Higher rates = Better data quality**: More responses mean more reliable conclusions
- **Low rates = Follow-up needed**: Consider improving engagement strategies

### Exporting Data

#### For Publications
1. Use **Export PDF** for manuscripts
2. Charts are publication-ready
3. Includes all statistical tests
4. Professional formatting

#### For Statistical Analysis
1. Use **Export Raw Data**
2. Import into SPSS, R, or Python
3. Perform advanced statistical tests
4. Create custom visualizations

#### For Team Collaboration
1. Use **Email Report**
2. Schedule weekly updates
3. Keep team informed
4. Track progress over time

## Technical Details

### Data Sources

The statistics are calculated from:
- **Patient Demographics**: Age, sex, location from Patient table
- **Surgery Data**: Type, date, completeness from Surgery table
- **Follow-up Responses**: Pain scores, complications from FollowUpResponse table
- **Clinical Data**: Comorbidities, medications from related tables

### Calculations

#### Average Age
```
avgAge = sum(all_ages) / count(patients_with_age)
```

#### Data Completeness
```
completeness = (dataCompleteness_sum) / count(surgeries)
```

#### Response Rate
```
responseRate = (responded_followups / total_followups) × 100
```

#### Complication Rate
```
complicationRate = (followups_with_complications / total_followups) × 100
```

#### T-Test Formula (Simplified)
```
t = (mean1 - mean2) / sqrt(pooled_variance × (1/n1 + 1/n2))
```

### Performance Optimization

- **Efficient Queries**: Single database call fetches all needed data
- **Client-Side Calculations**: Statistical tests run in browser
- **Lazy Loading**: Charts render only when tab is active
- **Caching**: API responses cached for 15 minutes

## Chart Library

**Recharts** is used for all visualizations:
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions
- Responsive and mobile-friendly
- Professional appearance

## Color Scheme

The dashboard uses a consistent, professional color palette:

- **Primary Blue**: `#0A2647` - Headers, main elements
- **Light Blues**: `#5AB2FF`, `#7AC5FF`, `#9DD4FF` - Charts, accents
- **Success Green**: `#22c55e` - Positive outcomes, completions
- **Warning Yellow**: `#eab308` - Moderate alerts
- **Danger Red**: `#ef4444` - Complications, critical alerts

## API Endpoints

### Get Research Statistics
```
GET /api/pesquisas/[id]/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "research": { /* Research metadata */ },
    "overview": { /* Overall statistics */ },
    "groups": [ /* Group-specific stats */ ],
    "statisticalTests": { /* T-tests, chi-square */ }
  }
}
```

## Database Schema

### Key Tables Used

#### Research
- `id`, `title`, `description`
- `surgeryType`, `isActive`
- `startDate`, `endDate`
- `totalPatients`

#### ResearchGroup
- `id`, `researchId`
- `groupCode` (A, B, C, etc.)
- `groupName`, `description`
- `patientCount`

#### Patient
- `isResearchParticipant` (boolean)
- `researchGroup` (A, B, C, etc.)
- Demographics and clinical data

## Best Practices

### Research Design

1. **Clearly Define Groups**: Give descriptive names (not just A, B, C)
2. **Balance Groups**: Try to keep similar patient counts
3. **Document Protocols**: Use description fields extensively
4. **Regular Monitoring**: Check statistics weekly

### Data Quality

1. **High Completeness**: Aim for >90% data completeness
2. **Follow-up Compliance**: Target >80% response rates
3. **Consistent Collection**: Use templates for standardization
4. **Validation**: Review outliers and unusual patterns

### Statistical Interpretation

1. **Sample Size**: Ensure adequate power (typically n>30 per group)
2. **P-Values**: Consider p<0.05 as statistically significant
3. **Clinical Significance**: Numbers matter, but so does real-world impact
4. **Multiple Comparisons**: Be cautious with multiple statistical tests

## Troubleshooting

### No Data Showing

**Problem**: Charts are empty or show zero values

**Solutions:**
- Ensure patients are marked as research participants
- Verify research group codes match exactly
- Check that follow-ups have been completed
- Confirm data completeness >0%

### Statistical Tests Missing

**Problem**: T-tests not displaying

**Solutions:**
- Need exactly 2 groups for comparison
- Both groups need at least 2 patients
- Ensure age data is available for patients

### Export Not Working

**Problem**: PDF/Excel export fails

**Solutions:**
- Check browser console for errors
- Verify you have necessary permissions
- Try exporting smaller date ranges
- Ensure stable internet connection

## Future Enhancements

Planned features for upcoming releases:

1. **Advanced Statistics**
   - ANOVA for 3+ group comparisons
   - Multivariate analysis
   - Survival curves (Kaplan-Meier)
   - Logistic regression for binary outcomes

2. **Custom Reports**
   - Report builder with drag-and-drop
   - Custom date ranges and filters
   - Bookmark favorite views
   - Share reports via link

3. **Real-Time Updates**
   - Live data refresh
   - Notification on new responses
   - Collaborative viewing

4. **AI Insights**
   - Automated pattern detection
   - Predictive analytics
   - Recommendation engine
   - Natural language summaries

## Support

For questions or issues:
- Email: suporte@sistema-pos-operatorio.com
- Documentation: `/docs/research-statistics`
- Video Tutorials: Available in dashboard

## Compliance

- **LGPD**: All data anonymized in exports
- **Research Ethics**: Follows CNS Resolution 466/2012
- **Data Security**: Encrypted storage and transmission
- **Audit Trail**: All accesses logged

---

**Version**: 1.0
**Last Updated**: 2025-11-11
**Author**: Dr. João Vitor Viana - Sistema de Acompanhamento Pós-Operatório
