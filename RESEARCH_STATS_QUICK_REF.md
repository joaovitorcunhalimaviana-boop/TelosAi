# Research Statistics - Quick Reference

## Access
```
Dashboard → Pesquisas → Click "Estatísticas" on any research
```

## Page Sections

### 1. Overview Cards (Top)
- **Total Patients**: All enrolled participants
- **Average Age**: Mean age across all groups
- **Data Completeness**: % of fields filled
- **Start Date**: Research began date
- **Status**: Active or Completed

### 2. Main Tabs

#### Overview Tab
- Sex distribution pie chart
- Age distribution bar chart
- Group comparison metrics

#### Demographics Tab
- Per-group breakdown
- Sex distribution bars
- Age ranges and averages

#### Groups Tab
- Detailed metrics per group
- Surgery types
- Follow-up statistics

#### Outcomes Tab
- Pain scores over time (line chart)
- Complication rates (bar chart)
- Response rates (bar chart)

#### Clinical Data Tab
- Top 5 comorbidities per group
- Common medications
- Statistical tests (t-test)

## Key Metrics

| Metric | Formula | Good Target |
|--------|---------|-------------|
| Data Completeness | (Filled fields / Total fields) × 100 | >90% |
| Response Rate | (Responded / Total followups) × 100 | >80% |
| Complication Rate | (With complications / Total followups) × 100 | <10% |

## Export Options

| Button | Output | Use Case |
|--------|--------|----------|
| Export PDF | Professional report | Publications, presentations |
| Export Data | Excel/CSV | Statistical analysis |
| Email Report | Scheduled delivery | Team updates |

## Chart Interpretations

### Pain Scores (Line Chart)
- **Lower = Better**: Less pain indicates better outcomes
- **Steeper decline = Faster recovery**: Quick drop is positive
- **Compare groups**: Look for significant differences

### Complication Rates (Bar Chart)
- **Lower = Safer**: Fewer complications preferred
- **Watch outliers**: Investigate high rates

### Response Rates (Bar Chart)
- **Higher = Better**: More data = more reliable results
- **Target**: Keep above 80%

## Statistical Tests (2 groups only)

### T-Test for Age
```
t-statistic: Significance measure
p < 0.05: Statistically significant difference
Difference: Actual age gap between groups
```

## Common Actions

### Export for Publication
1. Click "Export PDF"
2. Select date range (if needed)
3. Download and review
4. Ready to attach to manuscript

### Export for Analysis
1. Click "Export Data"
2. Choose format (Excel/CSV)
3. Import to SPSS/R/Python
4. Perform advanced statistics

### Schedule Reports
1. Click "Email Report"
2. Set frequency (daily/weekly)
3. Add recipients
4. Save schedule

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No data showing | Check patients marked as research participants |
| Empty charts | Verify follow-ups completed |
| No statistical tests | Need exactly 2 groups with data |
| Export fails | Check browser console, try smaller range |

## Color Legend

- **Blue (#0A2647)**: Primary elements, headers
- **Green (#22c55e)**: Success, positive outcomes
- **Yellow (#eab308)**: Warnings, moderate alerts
- **Red (#ef4444)**: Complications, critical issues
- **Light Blues**: Chart elements, visual variety

## API Endpoint

```
GET /api/pesquisas/{researchId}/stats
```

Returns: Complete statistics object with all metrics and charts data

## Files Created

1. **Page Component**: `app/dashboard/pesquisas/[id]/page.tsx`
2. **API Route**: `app/api/pesquisas/[id]/stats/route.ts`
3. **Documentation**: `RESEARCH_STATISTICS_GUIDE.md`
4. **Quick Reference**: This file

## Tech Stack

- **Charts**: Recharts library
- **UI**: Shadcn/ui components
- **Styling**: Tailwind CSS
- **Data**: Prisma ORM
- **Statistics**: Custom calculations + future advanced methods

## Best Practices

1. ✅ Keep data completeness above 90%
2. ✅ Aim for 80%+ follow-up response rates
3. ✅ Review statistics weekly
4. ✅ Export data regularly (backup)
5. ✅ Document unusual findings
6. ✅ Balance group sizes when possible
7. ✅ Use clear, descriptive group names

## Quick Tips

💡 **Tip 1**: Hover over chart elements for detailed tooltips
💡 **Tip 2**: Click legend items to toggle group visibility
💡 **Tip 3**: Use tabs to focus on specific analysis areas
💡 **Tip 4**: Export early, export often (data safety)
💡 **Tip 5**: Review complication alerts promptly

---

**Need Help?** See full guide in `RESEARCH_STATISTICS_GUIDE.md`
