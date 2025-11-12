/**
 * Chart Integration Examples
 *
 * Copy these examples into comparison page components to enable
 * advanced interactive features.
 */

// ============================================================================
// EXAMPLE 1: Kaplan-Meier Curves with Confidence Intervals
// ============================================================================
// File: components/research/SurvivalAnalysisSection.tsx
// Replace existing SVG implementation with:

import { InteractiveLineChart } from '@/components/charts/InteractiveLineChart';

function SurvivalAnalysisSection({ researchId, groups }: { researchId: string; groups: any }) {
  // ... existing state and data loading ...

  // Prepare data for each group
  const kmSeries = Object.entries(survivalData.kaplanMeier.byGroup).map(
    ([groupCode, kmData], index) => ({
      dataKey: 'survival',
      name: survivalData.kaplanMeier.groupLabels[groupCode],
      color: colors[index % colors.length],
      showCI: true,
      ciLower: 'ciLower',
      ciUpper: 'ciUpper',
    })
  );

  // Combine all group data into single array
  const combinedData = [];
  Object.entries(survivalData.kaplanMeier.byGroup).forEach(([code, kmData]) => {
    kmData.timePoints.forEach(point => {
      combinedData.push({
        time: point.time,
        survival: point.survival,
        ciLower: point.ciLower,
        ciUpper: point.ciUpper,
        atRisk: point.atRisk,
        events: point.events,
        group: code,
      });
    });
  });

  return (
    <div className="border rounded-lg p-6 bg-white">
      <InteractiveLineChart
        data={combinedData}
        series={kmSeries}
        xAxisKey="time"
        xAxisLabel="Tempo (dias)"
        yAxisLabel="Probabilidade de Sobrevivência"
        title="Curvas de Kaplan-Meier por Grupo"
        tooltipType="km-curve"
        referenceLines={[
          { y: 0.5, label: 'Sobrevida 50%', color: '#ef4444', strokeDasharray: '5 5' },
          { y: 0.75, label: 'Sobrevida 75%', color: '#f59e0b', strokeDasharray: '3 3' },
        ]}
        enableZoom={true}
        enableBrush={true}
        height={500}
      />

      {/* Export Menu */}
      <div className="mt-4 flex justify-end">
        <ChartExportMenu
          chartRef={chartRef}
          chartName="kaplan-meier-curves"
          data={combinedData}
        />
      </div>
    </div>
  );
}


// ============================================================================
// EXAMPLE 2: Pain Trajectory Line Chart (Comparison Page)
// ============================================================================
// File: app/dashboard/pesquisas/[id]/comparacao/page.tsx
// In the "Trajetória da Dor ao Longo do Tempo" section

function PainTrajectoryChart({ groups, visibleGroups }) {
  const chartRef = useRef<HTMLDivElement>(null);

  // Transform data for line chart
  const timePoints = [
    { time: 0, label: 'Baseline' },
    { time: 1, label: 'Dia 1' },
    { time: 7, label: 'Dia 7' },
    { time: 30, label: 'Dia 30' },
  ];

  const painData = timePoints.map(tp => {
    const dataPoint: any = { time: tp.time, label: tp.label };

    getVisibleGroups().forEach(group => {
      const painKey = `group_${group.groupCode}`;
      if (tp.time === 0) dataPoint[painKey] = 0; // Baseline
      else if (tp.time === 1) dataPoint[painKey] = group.outcomes.avgPainDay1;
      else if (tp.time === 7) dataPoint[painKey] = group.outcomes.avgPainDay7;
      else if (tp.time === 30) dataPoint[painKey] = group.outcomes.avgPainDay30;
    });

    return dataPoint;
  });

  const series = getVisibleGroups().map((group, index) => ({
    dataKey: `group_${group.groupCode}`,
    name: `Grupo ${group.groupCode}: ${group.groupName}`,
    color: colors[index % colors.length],
  }));

  return (
    <div ref={chartRef}>
      <InteractiveLineChart
        data={painData}
        series={series}
        xAxisKey="time"
        xAxisLabel="Tempo (dias)"
        yAxisLabel="Dor (escala 0-10)"
        title="Trajetória da Dor ao Longo do Tempo"
        tooltipType="comparison"
        referenceLines={[
          { y: 5, label: 'Dor Moderada', color: '#f59e0b' },
          { y: 7, label: 'Dor Severa', color: '#ef4444' },
        ]}
        enableZoom={true}
        height={400}
      />
    </div>
  );
}


// ============================================================================
// EXAMPLE 3: Group Comparison Bar Chart with Drill-Down
// ============================================================================
// File: app/dashboard/pesquisas/[id]/comparacao/page.tsx
// Replace basic bar visualization

function GroupComparisonBarChart({ groups, outcome }) {
  const chartRef = useRef<HTMLDivElement>(null);

  // Prepare bar chart data with patient-level details
  const barData = groups.map(group => {
    let value: number;
    let label: string;

    switch (outcome) {
      case 'pain':
        value = group.outcomes.avgPainDay7;
        label = 'Dor Dia 7';
        break;
      case 'recovery':
        value = group.outcomes.avgRecoveryDays;
        label = 'Dias até Recuperação';
        break;
      case 'satisfaction':
        value = group.outcomes.satisfactionScore;
        label = 'Satisfação';
        break;
      default:
        value = 0;
        label = '';
    }

    // Mock patient data for drill-down (replace with actual API call)
    const patients = Array.from({ length: group.patientCount }, (_, i) => ({
      id: `${group.groupCode}-${String(i + 1).padStart(3, '0')}`,
      name: `Paciente ${i + 1}`,
      value: value + (Math.random() - 0.5) * 2, // Add variance
    }));

    return {
      name: `Grupo ${group.groupCode}`,
      value,
      sd: 1.5, // Replace with actual SD calculation
      ci: {
        lower: value - 0.8,
        upper: value + 0.8,
      },
      n: group.patientCount,
      pValue: Math.random() < 0.5 ? 0.032 : 0.156, // Replace with actual p-value
      color: colors[groups.indexOf(group) % colors.length],
      patients,
    };
  });

  // Calculate significance brackets
  const significanceBrackets = [];
  for (let i = 0; i < barData.length - 1; i++) {
    if (barData[i].pValue < 0.05) {
      significanceBrackets.push({
        group1Index: i,
        group2Index: i + 1,
        pValue: barData[i].pValue,
        y: Math.max(barData[i].value, barData[i + 1].value) + 1,
      });
    }
  }

  return (
    <div ref={chartRef}>
      <InteractiveBarChart
        data={barData}
        title={`Comparação de ${label} por Grupo`}
        xAxisLabel="Grupos de Tratamento"
        yAxisLabel={label}
        enableDrillDown={true}
        significanceBrackets={significanceBrackets}
        referenceValue={outcome === 'pain' ? 5 : undefined}
        height={450}
      />

      <div className="mt-4 flex justify-end">
        <ChartExportMenu
          chartRef={chartRef}
          chartName={`group-comparison-${outcome}`}
          data={barData}
        />
      </div>
    </div>
  );
}


// ============================================================================
// EXAMPLE 4: Age vs. Pain Regression Scatter Plot
// ============================================================================
// File: components/RegressionAnalysis.tsx
// Add to "Results" tab

function AgeVsPainScatterPlot({ patients, regressionModel }) {
  const chartRef = useRef<HTMLDivElement>(null);

  // Prepare scatter data
  const scatterData = patients.map(patient => ({
    x: patient.age,
    y: patient.painDay7,
    z: patient.bmi, // Optional: bubble size
    predicted: regressionModel.slope * patient.age + regressionModel.intercept,
    patientId: patient.id,
    group: patient.groupName,
    outlier: false, // Will be calculated
    cooksDistance: 0, // Will be calculated
  }));

  // Calculate Cook's distance for outlier detection
  scatterData.forEach(point => {
    const residual = point.y - point.predicted;
    const leverage = 1 / scatterData.length; // Simplified
    point.cooksDistance = (residual * residual * leverage) / (2 * 1.5 * 1.5);
    point.outlier = point.cooksDistance > 0.5;
  });

  // Group data by treatment group
  const groupedSeries = [];
  const groups = [...new Set(scatterData.map(d => d.group))];

  groups.forEach((group, index) => {
    groupedSeries.push({
      data: scatterData.filter(d => d.group === group),
      name: group,
      color: colors[index % colors.length],
      shape: 'circle',
    });
  });

  return (
    <div ref={chartRef}>
      <InteractiveScatterChart
        series={groupedSeries}
        xAxisLabel="Idade (anos)"
        yAxisLabel="Dor no Dia 7 (0-10)"
        title="Regressão: Idade vs. Dor Pós-Operatória"
        regressionLine={{
          slope: regressionModel.slope,
          intercept: regressionModel.intercept,
          rSquared: regressionModel.rSquared,
          color: '#3b82f6',
          label: `y = ${regressionModel.slope.toFixed(3)}x + ${regressionModel.intercept.toFixed(2)}`,
        }}
        referenceLines={[
          { y: 5, label: 'Dor Moderada', color: '#f59e0b' },
        ]}
        enableZoom={true}
        height={500}
        showOutliers={true}
      />

      <div className="mt-4 flex justify-end">
        <ChartExportMenu
          chartRef={chartRef}
          chartName="age-pain-regression"
          data={scatterData}
        />
      </div>

      {/* Statistical Summary */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold mb-2">Interpretação</h4>
        <p className="text-sm">
          O modelo de regressão explica <strong>{(regressionModel.rSquared * 100).toFixed(1)}%</strong>
          da variância na dor pós-operatória. Cada ano adicional de idade está associado a um
          aumento de <strong>{regressionModel.slope.toFixed(3)}</strong> pontos na escala de dor
          (p {regressionModel.pValue < 0.001 ? '< 0.001' : `= ${regressionModel.pValue.toFixed(3)}`}).
        </p>
      </div>
    </div>
  );
}


// ============================================================================
// EXAMPLE 5: Complication Rates Bar Chart
// ============================================================================
// File: app/dashboard/pesquisas/[id]/comparacao/page.tsx

function ComplicationRatesChart({ groups }) {
  const chartRef = useRef<HTMLDivElement>(null);

  const complicationData = groups.map(group => ({
    name: group.groupName,
    value: group.surgical.complicationRate * 100, // Convert to percentage
    n: group.surgical.complications,
    total: group.patientCount,
    ci: {
      lower: (group.surgical.complicationRate - 0.05) * 100,
      upper: (group.surgical.complicationRate + 0.05) * 100,
    },
    color: group.surgical.complicationRate > 0.15 ? '#ef4444' : '#22c55e',
  }));

  return (
    <div ref={chartRef}>
      <InteractiveBarChart
        data={complicationData}
        title="Taxa de Complicações por Grupo"
        xAxisLabel="Grupos"
        yAxisLabel="Taxa de Complicações (%)"
        enableDrillDown={false}
        referenceValue={15} // 15% reference line
        height={400}
      />

      <p className="text-sm text-gray-500 mt-2">
        Barras vermelhas indicam taxa acima de 15% (ponto de corte clínico).
      </p>
    </div>
  );
}


// ============================================================================
// EXAMPLE 6: Multiple Time Series (All Outcomes)
// ============================================================================
// File: app/dashboard/pesquisas/[id]/comparacao/page.tsx

function AllOutcomesChart({ group }) {
  const chartRef = useRef<HTMLDivElement>(null);

  // Multiple metrics over time for a single group
  const timeSeriesData = [
    { time: 0, pain: 0, satisfaction: 0, mobility: 0 },
    { time: 1, pain: group.outcomes.avgPainDay1, satisfaction: 3, mobility: 2 },
    { time: 7, pain: group.outcomes.avgPainDay7, satisfaction: 6, mobility: 6 },
    { time: 30, pain: group.outcomes.avgPainDay30, satisfaction: group.outcomes.satisfactionScore, mobility: 9 },
  ];

  const series = [
    { dataKey: 'pain', name: 'Dor (0-10)', color: '#ef4444' },
    { dataKey: 'satisfaction', name: 'Satisfação (0-10)', color: '#22c55e' },
    { dataKey: 'mobility', name: 'Mobilidade (0-10)', color: '#3b82f6' },
  ];

  return (
    <div ref={chartRef}>
      <InteractiveLineChart
        data={timeSeriesData}
        series={series}
        xAxisKey="time"
        xAxisLabel="Tempo (dias)"
        yAxisLabel="Score (0-10)"
        title={`Desfechos ao Longo do Tempo - ${group.groupName}`}
        tooltipType="default"
        enableZoom={true}
        height={400}
      />
    </div>
  );
}


// ============================================================================
// INTEGRATION CHECKLIST
// ============================================================================

/**
 * To integrate these examples:
 *
 * 1. Import components at top of file:
 *    import { InteractiveLineChart } from '@/components/charts/InteractiveLineChart';
 *    import { InteractiveBarChart } from '@/components/charts/InteractiveBarChart';
 *    import { InteractiveScatterChart } from '@/components/charts/InteractiveScatterChart';
 *    import { ChartExportMenu } from '@/components/charts/ChartExportMenu';
 *
 * 2. Add chartRef to component:
 *    const chartRef = useRef<HTMLDivElement>(null);
 *
 * 3. Replace existing chart implementations with examples above
 *
 * 4. Ensure data format matches component expectations:
 *    - LineChart: Array of objects with x-axis key and series keys
 *    - BarChart: Array with name, value, optional ci, n, patients
 *    - ScatterChart: Array with x, y, optional z, group, outlier
 *
 * 5. Test on mobile devices (minimum 320px width)
 *
 * 6. Verify export functionality works for all formats
 *
 * 7. Check accessibility (keyboard navigation, screen readers)
 */


// ============================================================================
// COMMON PATTERNS
// ============================================================================

// Pattern 1: Loading State
function ChartWithLoading({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  return <InteractiveLineChart data={data} {...props} />;
}

// Pattern 2: Error Boundary
function ChartWithErrorBoundary({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Nenhum dado disponível</p>
      </div>
    );
  }

  try {
    return <InteractiveLineChart data={data} {...props} />;
  } catch (error) {
    console.error('Chart render error:', error);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Erro ao renderizar gráfico</p>
      </div>
    );
  }
}

// Pattern 3: Responsive Container
function ResponsiveChart({ data }) {
  const [height, setHeight] = useState(400);

  useEffect(() => {
    const updateHeight = () => {
      if (window.innerWidth < 640) setHeight(300);
      else if (window.innerWidth < 1024) setHeight(350);
      else setHeight(400);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return <InteractiveLineChart data={data} height={height} {...props} />;
}

// Pattern 4: Lazy Loading (for performance)
import { lazy, Suspense } from 'react';

const LazyScatterChart = lazy(() =>
  import('@/components/charts/InteractiveScatterChart').then(mod => ({
    default: mod.InteractiveScatterChart
  }))
);

function LazyChartWrapper({ data }) {
  return (
    <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
      <LazyScatterChart data={data} {...props} />
    </Suspense>
  );
}


// ============================================================================
// CUSTOM HOOKS
// ============================================================================

// Hook 1: Chart Data Formatter
function useChartData(rawData: any[], type: 'line' | 'bar' | 'scatter') {
  return useMemo(() => {
    switch (type) {
      case 'line':
        return rawData.map(d => ({
          time: d.timestamp,
          value: d.measurement,
          ciLower: d.lowerBound,
          ciUpper: d.upperBound,
        }));

      case 'bar':
        return rawData.map(d => ({
          name: d.groupName,
          value: d.mean,
          sd: d.standardDeviation,
          n: d.sampleSize,
        }));

      case 'scatter':
        return rawData.map(d => ({
          x: d.predictor,
          y: d.outcome,
          patientId: d.id,
          group: d.treatment,
        }));

      default:
        return rawData;
    }
  }, [rawData, type]);
}

// Hook 2: Export Handler
function useChartExport(chartRef: React.RefObject<HTMLDivElement>, data: any[]) {
  const handleExport = useCallback((format: 'png' | 'svg' | 'csv') => {
    switch (format) {
      case 'png':
        // Handled by ChartExportMenu
        break;
      case 'csv':
        // Custom CSV logic if needed
        const csv = convertToCSV(data);
        downloadCSV(csv, 'chart-data.csv');
        break;
      case 'svg':
        // Handled by ChartExportMenu
        break;
    }
  }, [data]);

  return handleExport;
}


// ============================================================================
// TESTING UTILITIES
// ============================================================================

// Generate mock data for testing
export function generateMockKMData(groups: number, timePoints: number) {
  const data = [];
  for (let g = 0; g < groups; g++) {
    for (let t = 0; t <= timePoints; t++) {
      data.push({
        time: t * 7, // Weekly
        survival: 1 - (t / timePoints) * 0.3 - Math.random() * 0.1,
        ciLower: 1 - (t / timePoints) * 0.35,
        ciUpper: 1 - (t / timePoints) * 0.25,
        atRisk: 100 - t * 5 - Math.floor(Math.random() * 10),
        events: Math.floor(Math.random() * 3),
        group: `Grupo ${String.fromCharCode(65 + g)}`,
      });
    }
  }
  return data;
}

export function generateMockBarData(groups: number) {
  return Array.from({ length: groups }, (_, i) => ({
    name: `Grupo ${String.fromCharCode(65 + i)}`,
    value: 3 + Math.random() * 5,
    sd: 1 + Math.random(),
    ci: { lower: 2, upper: 7 },
    n: 20 + Math.floor(Math.random() * 30),
    pValue: Math.random(),
    patients: [],
  }));
}

export function generateMockScatterData(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    x: 20 + Math.random() * 60,
    y: 2 + Math.random() * 8,
    patientId: `P${String(i + 1).padStart(3, '0')}`,
    group: i % 2 === 0 ? 'Grupo A' : 'Grupo B',
    outlier: Math.random() < 0.05,
  }));
}
