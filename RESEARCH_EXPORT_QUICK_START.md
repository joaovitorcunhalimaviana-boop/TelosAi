# Research Export - Quick Start Guide

## Quick Access
Navigate to: `/dashboard/exportar-pesquisa`

## 5-Minute Setup

### 1. Select Research (Required)
Click the dropdown and choose your research study.

### 2. Select Groups (Required)
- Click on group cards to select
- Or use "Selecionar todos" button

### 3. Choose Format
- **Excel** - Best for analysis (recommended)
- **CSV** - Simple data files
- **PDF** - Reports (coming soon)

### 4. Select Export Type
- **Individual** - Raw patient data (one row per patient)
- **Comparative** - Compare groups side-by-side
- **Statistical** - Means, SD, medians
- **Timeline** - Follow-up progression

### 5. Export!
Click "Exportar Dados" button.

## Common Use Cases

### Quick Export (30 seconds)
1. Select research
2. Click "Selecionar todos"
3. Keep default settings
4. Click "Exportar Dados"

### Compare Two Groups
1. Select research
2. Check only groups A and B
3. Select "Comparativo" type
4. Export

### Statistical Analysis
1. Select research
2. Select groups
3. Choose "Resumo Estatístico"
4. Export

## Export Includes

### By Default (All Checked)
- Basic demographics (age, sex)
- Surgical details (type, date, anesthesia)
- Comorbidities
- Medications
- Follow-up status
- Questionnaire responses (pain, NPS)

### Optional
- AI analysis and alerts

## Excel File Contents

### Individual Export
1. **Informações** - Research details
2. **Dados Individuais** - Patient data
3. **Estatísticas** - Statistical summary
4. **Glossário** - Field descriptions

### Other Export Types
1. **Informações** - Research details
2. **Main Sheet** - Formatted data by type
3. **Glossário** - Field descriptions

## Field Guide

### Key Fields Explained

| Field | Description | Example |
|-------|-------------|---------|
| ID_Paciente | Unique patient ID | P0001 |
| Grupo_Pesquisa | Research group code | A, B, C |
| Dor_D+1 | Pain level day 1 | 7 (scale 0-10) |
| NPS | Patient satisfaction | 9 (0-10) |
| Taxa_Adesao | Follow-up adherence | 85.7% |
| Bloqueio_Pudendo | Pudendal block used | Sim/Não |

## Tips

### Before Exporting
1. Use **Preview** to verify data
2. Check patient counts make sense
3. Verify date filters if used

### For Best Results
- Use Excel for comprehensive analysis
- Use CSV for importing to SPSS/R
- Select only needed fields for cleaner data
- Use date filters to narrow scope

### For Publications
1. Export "Individual" type first
2. Then export "Statistical" for tables
3. Keep both for reference
4. Document export date and parameters

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No patients found | Check group assignments |
| Zero in preview | Adjust/remove date filter |
| Can't download | Try different browser |
| Missing data | Verify field checkboxes |

## Data Privacy

All exports are:
- ✓ Anonymized (Patient IDs, not names)
- ✓ Secure (only your data)
- ✓ Logged (audit trail)

## Advanced Features

### Date Filter
- Optional: Filter surgeries by date range
- Useful for interim analysis
- Located in "Filtro de Período" section

### Email Delivery
- For large datasets
- Check "Enviar por e-mail"
- Enter email address
- Receive file by email

### Preview First
- Click "Visualizar Preview"
- See counts before exporting
- Verify selections
- Then export

## Support

Need help?
1. Check full guide: `RESEARCH_EXPORT_GUIDE.md`
2. Review field glossary in exported Excel
3. Contact system admin

## Quick Reference - Export Types

### Individual
```
Best for: Raw data analysis, importing to stats software
Contains: One row per patient with all fields
Use when: Need complete dataset for analysis
```

### Comparative
```
Best for: Comparing groups, presentations
Contains: Groups side-by-side with key metrics
Use when: Need quick group comparison
```

### Statistical
```
Best for: Research papers, summary reports
Contains: Descriptive stats by group (mean ± SD)
Use when: Need publication-ready statistics
```

### Timeline
```
Best for: Longitudinal analysis, adherence studies
Contains: One row per follow-up day
Use when: Analyzing progression over time
```

## File Naming

Files are automatically named:
```
pesquisa_[research_title]_[date].xlsx
Example: pesquisa_Bloqueio_Pudendo_2025-11-11.xlsx
```

## Next Steps

After exporting:
1. Open file in Excel/LibreOffice
2. Review "Informações" sheet
3. Check "Glossário" for field meanings
4. Analyze main data sheet
5. Archive file securely

---

**Quick Start Version 1.0**
Last Updated: November 2025
