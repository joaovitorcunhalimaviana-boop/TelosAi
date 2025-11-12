'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Activity, TrendingDown, Clock, AlertCircle, Download } from 'lucide-react';
import { StatisticalTooltipIcon } from '@/components/tooltips/StatisticalTooltip';

interface GroupData {
  id: string;
  groupCode: string;
  groupName: string;
}

interface SurvivalAnalysisSectionProps {
  researchId: string;
  groups: GroupData[];
}

interface KaplanMeierPoint {
  time: number;
  survival: number;
  ciLower: number;
  ciUpper: number;
  atRisk: number;
  events: number;
}

interface SurvivalData {
  outcome: {
    type: string;
    label: string;
    description: string;
  };
  summary: {
    totalPatients: number;
    totalEvents: number;
    totalCensored: number;
    eventRate: number;
    medianFollowUp: number;
    groupSummary: Array<{
      groupCode: string;
      groupName: string;
      n: number;
      events: number;
      censored: number;
      eventRate: number;
      medianTime: number | null;
    }>;
  };
  kaplanMeier: {
    overall: {
      timePoints: KaplanMeierPoint[];
      medianSurvival: {
        time: number | null;
        ciLower: number | null;
        ciUpper: number | null;
      };
    };
    byGroup: Record<string, {
      timePoints: KaplanMeierPoint[];
      medianSurvival: {
        time: number | null;
        ciLower: number | null;
        ciUpper: number | null;
      };
    }>;
    groupLabels: Record<string, string>;
  };
  logRankTests: Array<{
    group1: string;
    group2: string;
    chiSquare: number;
    pValue: number;
    significant: boolean;
  }>;
  coxRegression: {
    coefficients: Array<{
      name: string;
      hazardRatio: number;
      ciLower: number;
      ciUpper: number;
      pValue: number;
      significant: boolean;
    }>;
    concordanceIndex: number;
  } | null;
  interpretation: string[];
}

export default function SurvivalAnalysisSection({
  researchId,
  groups,
}: SurvivalAnalysisSectionProps) {
  const [loading, setLoading] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState('complication');
  const [survivalData, setSurvivalData] = useState<SurvivalData | null>(null);

  useEffect(() => {
    loadSurvivalData();
  }, [researchId, selectedOutcome]);

  const loadSurvivalData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/pesquisas/${researchId}/survival?outcome=${selectedOutcome}`
      );
      const data = await response.json();

      if (data.success) {
        setSurvivalData(data.data);
      } else {
        toast.error('Erro ao carregar análise de sobrevivência');
      }
    } catch (error) {
      console.error('Error loading survival analysis:', error);
      toast.error('Erro ao carregar análise de sobrevivência');
    } finally {
      setLoading(false);
    }
  };

  const exportSurvivalData = () => {
    if (!survivalData) return;

    // Create CSV with survival data
    let csv = 'Time,Group,Survival,CI_Lower,CI_Upper,At_Risk,Events\n';

    Object.entries(survivalData.kaplanMeier.byGroup).forEach(([groupCode, kmData]) => {
      const groupName = survivalData.kaplanMeier.groupLabels[groupCode];

      kmData.timePoints.forEach(point => {
        csv += `${point.time},${groupName},${point.survival.toFixed(4)},${point.ciLower.toFixed(4)},${point.ciUpper.toFixed(4)},${point.atRisk},${point.events}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.download = `survival-analysis-${selectedOutcome}-${new Date().toISOString().split('T')[0]}.csv`;
    link.href = URL.createObjectURL(blob);
    link.click();

    toast.success('Dados exportados com sucesso!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Calculando análise de sobrevivência...</p>
        </div>
      </div>
    );
  }

  if (!survivalData) {
    return (
      <div className="text-center py-8 text-gray-500">
        Carregue os dados de sobrevivência selecionando um desfecho acima
      </div>
    );
  }

  const colors = ['#0A2647', '#144272', '#205295', '#2C74B3'];

  return (
    <div className="space-y-6">
      {/* Outcome Selector */}
      <div className="flex items-center justify-between">
        <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
          <SelectTrigger className="w-80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="complication">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Tempo até Primeira Complicação
              </div>
            </SelectItem>
            <SelectItem value="pain_resolution">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Tempo até Resolução da Dor
              </div>
            </SelectItem>
            <SelectItem value="return_to_activities">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Tempo até Retorno às Atividades
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={exportSurvivalData}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Dados
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg bg-blue-50">
          <div className="text-sm text-gray-600">Total de Pacientes</div>
          <div className="text-3xl font-bold text-blue-900">
            {survivalData.summary.totalPatients}
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-green-50">
          <div className="text-sm text-gray-600">Eventos Observados</div>
          <div className="text-3xl font-bold text-green-900">
            {survivalData.summary.totalEvents}
          </div>
          <div className="text-xs text-gray-500">
            {survivalData.summary.eventRate.toFixed(1)}% taxa de evento
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-purple-50">
          <div className="text-sm text-gray-600">
            Censurados <StatisticalTooltipIcon termId="dados-censurados" />
          </div>
          <div className="text-3xl font-bold text-purple-900">
            {survivalData.summary.totalCensored}
          </div>
          <div className="text-xs text-gray-500">
            {((survivalData.summary.totalCensored / survivalData.summary.totalPatients) * 100).toFixed(1)}% sem evento
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-orange-50">
          <div className="text-sm text-gray-600">Follow-up Mediano</div>
          <div className="text-3xl font-bold text-orange-900">
            {survivalData.summary.medianFollowUp.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500">dias</div>
        </div>
      </div>

      {/* Kaplan-Meier Curves */}
      <div className="border rounded-lg p-6 bg-white">
        <h3 className="text-lg font-semibold mb-4">
          Curvas de Kaplan-Meier <StatisticalTooltipIcon termId="kaplan-meier" />
        </h3>

        {/* KM Plot */}
        <div className="relative h-96 bg-gray-50 rounded-lg p-6">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-6 pr-2">
            {[1.0, 0.8, 0.6, 0.4, 0.2, 0.0].map(val => (
              <div key={val} className="text-xs text-gray-500 text-right">
                {(val * 100).toFixed(0)}%
              </div>
            ))}
          </div>

          {/* Grid and curves */}
          <div className="ml-12 h-full relative">
            {/* Horizontal grid lines */}
            {[0.8, 0.6, 0.4, 0.2].map(val => (
              <div
                key={val}
                className="absolute w-full border-t border-gray-200"
                style={{ bottom: `${val * 100}%` }}
              />
            ))}

            {/* Survival curves for each group */}
            <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
              {Object.entries(survivalData.kaplanMeier.byGroup).map(([groupCode, kmData], groupIndex) => {
                if (kmData.timePoints.length === 0) return null;

                const maxTime = Math.max(
                  ...Object.values(survivalData.kaplanMeier.byGroup).flatMap(g =>
                    g.timePoints.map(p => p.time)
                  )
                );

                const color = colors[groupIndex % colors.length];

                // Create step function path for KM curve
                let path = '';
                const height = 100; // percentage

                kmData.timePoints.forEach((point, i) => {
                  const x = (point.time / maxTime) * 100;
                  const y = height - point.survival * height;

                  if (i === 0) {
                    path += `M 0 0 L ${x} 0 L ${x} ${y}`;
                  } else {
                    const prevPoint = kmData.timePoints[i - 1];
                    const prevX = (prevPoint.time / maxTime) * 100;
                    path += ` L ${x} ${y}`;
                  }
                });

                // Confidence interval area
                let ciPath = '';
                kmData.timePoints.forEach((point, i) => {
                  const x = (point.time / maxTime) * 100;
                  const yUpper = height - point.ciUpper * height;

                  if (i === 0) {
                    ciPath += `M 0 0 L ${x} 0 L ${x} ${yUpper}`;
                  } else {
                    ciPath += ` L ${x} ${yUpper}`;
                  }
                });

                // Add lower bound in reverse
                for (let i = kmData.timePoints.length - 1; i >= 0; i--) {
                  const point = kmData.timePoints[i];
                  const x = (point.time / maxTime) * 100;
                  const yLower = height - point.ciLower * height;
                  ciPath += ` L ${x} ${yLower}`;
                }

                ciPath += ' Z';

                return (
                  <g key={groupCode}>
                    {/* Confidence interval */}
                    <path
                      d={ciPath}
                      fill={color}
                      opacity="0.2"
                      vectorEffect="non-scaling-stroke"
                    />

                    {/* Main curve */}
                    <path
                      d={path}
                      stroke={color}
                      strokeWidth="2"
                      fill="none"
                      vectorEffect="non-scaling-stroke"
                    />

                    {/* Event markers */}
                    {kmData.timePoints
                      .filter(p => p.events > 0)
                      .map((point, i) => (
                        <circle
                          key={i}
                          cx={`${(point.time / maxTime) * 100}%`}
                          cy={`${height - point.survival * height}%`}
                          r="3"
                          fill={color}
                        />
                      ))}
                  </g>
                );
              })}
            </svg>

            {/* X-axis labels */}
            <div className="absolute -bottom-8 w-full flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>
                {Math.max(
                  ...Object.values(survivalData.kaplanMeier.byGroup).flatMap(g =>
                    g.timePoints.map(p => p.time)
                  )
                ).toFixed(0)}{' '}
                dias
              </span>
            </div>
          </div>

          {/* Y-axis label */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-semibold text-gray-700">
            Probabilidade de Sobrevivência Livre de Evento
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-6">
          {Object.entries(survivalData.kaplanMeier.byGroup).map(([groupCode, _], index) => (
            <div key={groupCode} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm font-medium">
                Grupo {groupCode}: {survivalData.kaplanMeier.groupLabels[groupCode]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* At Risk Table */}
      <div className="border rounded-lg p-4 bg-white">
        <h4 className="font-semibold mb-3">
          Número em Risco ao Longo do Tempo <StatisticalTooltipIcon termId="numero-em-risco" />
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Grupo</th>
                {[0, 7, 14, 30, 60, 90].map(day => (
                  <th key={day} className="text-center p-2">
                    Dia {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {survivalData.summary.groupSummary.map((group, index) => {
                const kmData = survivalData.kaplanMeier.byGroup[group.groupCode];

                return (
                  <tr key={group.groupCode} className="border-b">
                    <td className="p-2 font-medium">
                      Grupo {group.groupCode}
                    </td>
                    {[0, 7, 14, 30, 60, 90].map(day => {
                      const point = kmData.timePoints.find(p => p.time >= day);
                      return (
                        <td key={day} className="text-center p-2">
                          {point ? point.atRisk : 0}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistical Tests */}
      <Tabs defaultValue="median" className="w-full">
        <TabsList>
          <TabsTrigger value="median">Tempos Medianos</TabsTrigger>
          <TabsTrigger value="logrank">Teste Log-Rank</TabsTrigger>
          {survivalData.coxRegression && (
            <TabsTrigger value="cox">Regressão de Cox</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="median" className="mt-4">
          <div className="border rounded-lg p-4 bg-white">
            <h4 className="font-semibold mb-3">Tempo Mediano até Evento</h4>
            <div className="space-y-3">
              {survivalData.summary.groupSummary.map(group => {
                const kmData = survivalData.kaplanMeier.byGroup[group.groupCode];
                const median = kmData.medianSurvival;

                return (
                  <div key={group.groupCode} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">
                        Grupo {group.groupCode}: {group.groupName}
                      </div>
                      <div className="text-sm text-gray-600">
                        n = {group.n}, eventos = {group.events} ({group.eventRate.toFixed(1)}%)
                      </div>
                    </div>
                    <div className="text-right">
                      {median.time !== null ? (
                        <>
                          <div className="text-2xl font-bold" style={{ color: '#0A2647' }}>
                            {median.time.toFixed(1)} dias
                          </div>
                          {median.ciLower && median.ciUpper && (
                            <div className="text-xs text-gray-500">
                              IC 95%: [{median.ciLower.toFixed(1)}, {median.ciUpper.toFixed(1)}]
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Não alcançado
                          <br />
                          ({'>'} 50% sem evento)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logrank" className="mt-4">
          <div className="border rounded-lg p-4 bg-white">
            <h4 className="font-semibold mb-3">
              Comparações Pareadas (Teste Log-Rank) <StatisticalTooltipIcon termId="log-rank-test" />
            </h4>
            <div className="space-y-2">
              {survivalData.logRankTests.map((test, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded ${
                    test.significant ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">
                        Grupo {test.group1} vs Grupo {test.group2}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-gray-600">χ² = {test.chiSquare.toFixed(3)}</div>
                        <div className="text-sm font-semibold">
                          p = {test.pValue.toFixed(4)}
                        </div>
                      </div>
                      <Badge variant={test.significant ? 'default' : 'outline'}>
                        {test.significant ? 'Significativo' : 'Não significativo'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {survivalData.coxRegression && (
          <TabsContent value="cox" className="mt-4">
            <div className="border rounded-lg p-4 bg-white">
              <h4 className="font-semibold mb-3">
                Modelo de Cox - Hazard Ratios <StatisticalTooltipIcon termId="cox-regression" />
              </h4>

              {/* Forest Plot */}
              <div className="mb-6">
                <div className="space-y-3">
                  {survivalData.coxRegression.coefficients.map((coef, index) => (
                    <div key={index} className="space-y-1">
                      <div className="text-sm font-medium">{coef.name}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 text-xs text-gray-600">
                          HR <StatisticalTooltipIcon termId="hazard-ratio" />: {coef.hazardRatio.toFixed(2)}
                        </div>
                        <div className="flex-1 relative h-8 bg-gray-100 rounded">
                          {/* Reference line at HR = 1 */}
                          <div className="absolute left-1/2 h-full w-0.5 bg-gray-400" />

                          {/* CI line */}
                          <div
                            className="absolute h-2 top-3 bg-blue-500"
                            style={{
                              left: `${Math.min(95, Math.max(5, (Math.log(coef.ciLower) / Math.log(3) + 1) * 50))}%`,
                              width: `${Math.abs((Math.log(coef.ciUpper) - Math.log(coef.ciLower)) / Math.log(3) * 50)}%`,
                            }}
                          />

                          {/* Point estimate */}
                          <div
                            className="absolute w-3 h-3 rounded-full bg-blue-700 top-2.5"
                            style={{
                              left: `${Math.min(95, Math.max(5, (Math.log(coef.hazardRatio) / Math.log(3) + 1) * 50))}%`,
                              transform: 'translateX(-50%)',
                            }}
                          />
                        </div>
                        <div className="w-40 text-xs text-gray-600">
                          IC 95%: [{coef.ciLower.toFixed(2)}, {coef.ciUpper.toFixed(2)}]
                        </div>
                        <div className="w-24">
                          <Badge variant={coef.significant ? 'default' : 'outline'}>
                            p = {coef.pValue.toFixed(3)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* C-index */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      Índice de Concordância (C-index) <StatisticalTooltipIcon termId="c-index" />
                    </div>
                    <div className="text-sm text-gray-600">
                      Mede a capacidade discriminatória do modelo
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-blue-900">
                    {(survivalData.coxRegression.concordanceIndex * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Clinical Interpretation */}
      <div className="border rounded-lg p-4 bg-purple-50 border-purple-200">
        <div className="flex items-start gap-3">
          <Activity className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-purple-900 mb-2">Interpretação Clínica</h4>
            <ul className="space-y-2">
              {survivalData.interpretation.map((text, index) => (
                <li key={index} className="text-sm text-purple-800">
                  • {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
