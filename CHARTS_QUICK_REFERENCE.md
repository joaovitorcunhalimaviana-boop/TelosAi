# Recharts Interactive Charts - Quick Reference

## Component Overview

### 1. InteractiveLineChart
**Best for:** Time series, K-M curves, trends
```tsx
<InteractiveLineChart
  data={kmData}
  series={[{ dataKey: 'survival', name: 'Grupo A', showCI: true }]}
  xAxisKey="time"
  tooltipType="km-curve"
  enableZoom={true}
/>
```

### 2. InteractiveBarChart
**Best for:** Group comparisons, categorical data
```tsx
<InteractiveBarChart
  data={groupData}
  enableDrillDown={true}
  significanceBrackets={[{ group1Index: 0, group2Index: 1, pValue: 0.032 }]}
/>
```

### 3. InteractiveScatterChart (NEW)
**Best for:** Correlations, regression, outliers
```tsx
<InteractiveScatterChart
  series={[{ data: scatterData, name: 'Observations' }]}
  regressionLine={{ slope: 0.042, intercept: 7.23, rSquared: 0.647 }}
  showOutliers={true}
/>
```

---

## Key Features

### Tooltips
- **km-curve**: Survival %, CI, N at risk, events
- **comparison**: Mean ± SD, CI 95%, p-value
- **regression**: Observed vs. predicted, residuals, outliers
- **Animated**: Smooth fade-in (150ms), debounced hide (50ms)

### Export Formats
- PNG 150 DPI (web)
- PNG 300 DPI (publication)
- SVG (vector, scalable)
- CSV (raw data)
- Clipboard copy

### Interactivity
- Zoom in/out/reset
- Toggle series visibility
- Drill-down to patient data (bars)
- Hover for details
- Brush navigation (lines)

### Performance
- Memoized rendering
- Callback-based events
- Lazy series rendering
- Efficient data filtering

---

## Common Props

```typescript
// All charts support:
title?: string;              // Chart title
height?: number;             // Default: 400
xAxisLabel?: string;         // X-axis label
yAxisLabel?: string;         // Y-axis label
enableZoom?: boolean;        // Default: true

// Export
chartRef: React.RefObject<HTMLDivElement>;  // For ChartExportMenu
data?: any[];                                // For CSV export
```

---

## Keyboard Shortcuts
- **Tab**: Navigate controls
- **Enter/Space**: Toggle series
- **Ctrl+C**: Copy chart (when focused)

---

## Settings (Saved to localStorage)
- Confidence intervals: On/Off
- Grid lines: On/Off
- Data labels: On/Off
- Legend: On/Off
- Color scheme: Telos, Viridis, Categorical, Monochrome
- Axis scale: Linear or Log
- Opacity: 20-100%
- Font size: 8-16px

---

## Color Schemes

### Telos (Brand)
`#0A2647, #144272, #205295, #2C74B3, #3A8BC9, #4EA5D9`

### Viridis (Scientific)
`#440154, #31688e, #35b779, #fde724`

### Categorical (Distinct)
`Red, Blue, Green, Orange, Purple, Pink`

### Monochrome (Print)
`Gray shades from dark to light`

---

## Mobile Optimizations
- Touch-friendly buttons (44x44px min)
- Responsive heights (300px mobile, 400px desktop)
- No hover-only interactions
- Clear visual feedback

---

## Files
```
components/charts/
├── CustomTooltip.tsx           (318 lines)
├── InteractiveLineChart.tsx    (385 lines)
├── InteractiveBarChart.tsx     (416 lines)
├── InteractiveScatterChart.tsx (381 lines)
├── ChartExportMenu.tsx         (224 lines)
└── ChartControls.tsx           (333 lines)
```

---

## Demo
Visit: `/dashboard/pesquisas/[id]/comparacao`

1. Scroll to "Análise de Sobrevivência" → K-M curves
2. Try "Comparação de Desfechos" → Bar charts with drill-down
3. Open "Regressão Linear" tab → Scatter plots

---

## Support
- Documentation: `RECHARTS_ENHANCEMENTS.md`
- Issues: GitHub with `chart-enhancement` label
- Performance tips: See section 14 in docs
