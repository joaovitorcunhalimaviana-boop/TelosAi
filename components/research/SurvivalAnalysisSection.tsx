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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#14BDAE' }}></div>
          <p className="mt-4" style={{ color: '#7A8299' }}>Calculando análise de sobrevivência...</p>
        </div>
      </div>
    );
  }

  if (!survivalData) {
    return (
      <div className="text-center py-8" style={{ color: '#7A8299' }}>
        Carregue os dados de sobrevivência selecionando um desfecho acima
      </div>
    );
  }

  const colors = ['#14BDAE', '#0D7377', '#0A5A5E', '#2A8A8A'];

  return (
    <div className="space-y-6">
      {/* Outcome Selector */}
      <div className="flex items-center justify-between">
        <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
          <SelectTrigger className="w-80" style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
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

        <Button
          variant="outline"
          onClick={exportSurvivalData}
          style={{ backgroundColor: '#1E2535', borderColor: '#2A3147', color: '#D8DEEB' }}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar Dados
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#111520', border: '1px solid #1E2535' }}>
          <div className="text-sm" style={{ color: '#7A8299' }}>Total de Pacientes</div>
          <div className="text-3xl font-bold" style={{ color: '#14BDAE' }}>
            {survivalData.summary.totalPatients}
          </div>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#111520', border: '1px solid #1E2535' }}>
          <div className="text-sm" style={{ color: '#7A8299' }}>Eventos Observados</div>
          <div className="text-3xl font-bold text-emerald-400">
            {survivalData.summary.totalEvents}
          </div>
          <div className="text-xs" style={{ color: '#7A8299' }}>
            {survivalData.summary.eventRate.toFixed(1)}% taxa de evento
          </div>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#111520', border: '1px solid #1E2535' }}>
          <div className="text-sm" style={{ color: '#7A8299' }}>
            Censurados <StatisticalTooltipIcon termId="dados-censurados" />
          </div>
          <div className="text-3xl font-bold text-purple-400">
            {survivalData.summary.totalCensored}
          </div>
          <div className="text-xs" style={{ color: '#7A8299' }}>
            {((survivalData.summary.totalCensored / survivalData.summary.totalPatients) * 100).toFixed(1)}% sem evento
          </div>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#111520', border: '1px solid #1E2535' }}>
          <div className="text-sm" style={{ color: '#7A8299' }}>Follow-up Mediano</div>
          <div className="text-3xl font-bold text-orange-400">
            {survivalData.summary.medianFollowUp.toFixed(0)}
          </div>
          <div className="text-xs" style={{ color: '#7A8299' }}>dias</div>
        </div>
      </div>

      {/* Kaplan-Meier Curves */}
      <div className="rounded-lg p-6" style={{ backgroundColor: '#111520', border: '1px solid #1E2535' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#F0EAD6' }}>
          Curvas de Kaplan-Meier <StatisticalTooltipIcon termId="kaplan-meier" />
        </h3>

        {/* KM Plot */}
        <div className="relative h-96 rounded-lg p-6" style={{ backgroundColor: '#161B27' }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-6 pr-2">
            {[1.0, 0.8, 0.6, 0.4, 0.2, 0.0].map(val => (
              <div key={val} className="text-xs text-right" style={{ color: '#7A8299' }}>
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
                className="absolute w-full"
                style={{ bottom: `${val * 100}%`, borderTop: '1px solid #1E2535' }}
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
            <div className="absolute -bottom-8 w-full flex justify-between text-xs" style={{ color: '#7A8299' }}>
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
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-semibold" style={{ color: '#D8DEEB' }}>
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
              <span className="text-sm font-medium" style={{ color: '#D8DEEB' }}>
                Grupo {groupCode}: {survivalData.kaplanMeier.groupLabels[groupCode]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* At Risk Table */}
      <div className="rounded-lg p-4" style={{ backgroundColor: '#111520', border: '1px solid #1E2535' }}>
        <h4 className="font-semibold mb-3" style={{ color: '#F0EAD6' }}>
          Número em Risco ao Longo do Tempo <StatisticalTooltipIcon termId="numero-em-risco" />
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #1E2535' }}>
                <th className="text-left p-2" style={{ color: '#7A8299' }}>Grupo</th>
                {[0, 7, 14, 30, 60, 90].map(day => (
                  <th key={day} className="text-center p-2" style={{ color: '#7A8299' }}>
                    Dia {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {survivalData.summary.groupSummary.map((group, index) => {
                const kmData = survivalData.kaplanMeier.byGroup[group.groupCode];

                return (
                  <tr key={group.groupCode} style={{ borderBottom: '1px solid #1E2535' }}>
                    <td className="p-2 font-medium" style={{ color: '#D8DEEB' }}>
                      Grupo {group.groupCode}
                    </td>
                    {[0, 7, 14, 30, 60, 90].map(day => {
                      const point = kmData.timePoints.find(p => p.time >= day);
                      return (
                        <td key={day} className="text-center p-2" style={{ color: '#D8DEEB' }}>
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
        <TabsList style={{ backgroundColor: '#161B27' }}>
          <TabsTrigger value="median" className="data-[state=active]:bg-[#0D7377] data-[state=active]:text-white" style={{ color: '#D8DEEB' }}>Tempos Medianos</TabsTrigger>
          <TabsTrigger value="logrank" className="data-[state=active]:bg-[#0D7377] data-[state=active]:text-white" style={{ color: '#D8DEEB' }}>Teste Log-Rank</TabsTrigger>
          {survivalData.coxRegression && (
            <TabsTrigger value="cox" className="data-[state=active]:bg-[#0D7377] data-[state=active]:text-white" style={{ color: '#D8DEEB' }}>Regressão de Cox</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="median" className="mt-4">
          <div className="rounded-lg p-4" style={{ backgroundColor: '#111520', border: '1px solid #1E2535' }}>
            <h4 className="font-semibold mb-3" style={{ color: '#F0EAD6' }}>Tempo Mediano até Evento</h4>
            <div className="space-y-3">
              {survivalData.summary.groupSummary.map(group => {
                const kmData = survivalData.kaplanMeier.byGroup[group.groupCode];
                const median = kmData.medianSurvival;

                return (
                  <div key={group.groupCode} className="flex items-center justify-between p-3 rounded" style={{ border: '1px solid #1E2535', backgroundColor: '#161B27' }}>
                    <div>
                      <div className="font-medium" style={{ color: '#F0EAD6' }}>
                        Grupo {group.groupCode}: {group.groupName}
                      </div>
                      <div className="text-sm" style={{ color: '#7A8299' }}>
                        n = {group.n}, eventos = {group.events} ({group.eventRate.toFixed(1)}%)
                      </div>
                    </div>
                    <div className="text-right">
                      {median.time !== null ? (
                        <>
                          <div className="text-2xl font-bold" style={{ color: '#14BDAE' }}>
                            {median.time.toFixed(1)} dias
                          </div>
                          {median.ciLower && median.ciUpper && (
                            <div className="text-xs" style={{ color: '#7A8299' }}>
                              IC 95%: [{median.ciLower.toFixed(1)}, {median.ciUpper.toFixed(1)}]
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm" style={{ color: '#7A8299' }}>
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
          <div className="rounded-lg p-4" style={{ backgroundColor: '#111520', border: '1px solid #1E2535' }}>
            <h4 className="font-semibold mb-3" style={{ color: '#F0EAD6' }}>
              Comparações Pareadas (Teste Log-Rank) <StatisticalTooltipIcon termId="log-rank-test" />
            </h4>
            <div className="space-y-2">
              {survivalData.logRankTests.map((test, index) => (
                <div
                  key={index}
                  className="p-3 rounded"
                  style={{
                    backgroundColor: test.significant ? 'rgba(16, 185, 129, 0.08)' : '#161B27',
                    border: test.significant ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #1E2535',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium" style={{ color: '#F0EAD6' }}>
                        Grupo {test.group1} vs Grupo {test.group2}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs" style={{ color: '#7A8299' }}>chi2 = {test.chiSquare.toFixed(3)}</div>
                        <div className="text-sm font-semibold" style={{ color: '#D8DEEB' }}>
                          p = {test.pValue.toFixed(4)}
                        </div>
                      </div>
                      <Badge
                        variant={test.significant ? 'default' : 'outline'}
                        style={test.significant
                          ? { backgroundColor: '#0D7377', color: '#F0EAD6' }
                          : { borderColor: '#2A3147', color: '#7A8299' }
                        }
                      >
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
            <div className="rounded-lg p-4" style={{ backgroundColor: '#111520', border: '1px solid #1E2535' }}>
              <h4 className="font-semibold mb-3" style={{ color: '#F0EAD6' }}>
                Modelo de Cox - Hazard Ratios <StatisticalTooltipIcon termId="cox-regression" />
              </h4>

              {/* Forest Plot */}
              <div className="mb-6">
                <div className="space-y-3">
                  {survivalData.coxRegression.coefficients.map((coef, index) => (
                    <div key={index} className="space-y-1">
                      <div className="text-sm font-medium" style={{ color: '#D8DEEB' }}>{coef.name}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 text-xs" style={{ color: '#7A8299' }}>
                          HR <StatisticalTooltipIcon termId="hazard-ratio" />: {coef.hazardRatio.toFixed(2)}
                        </div>
                        <div className="flex-1 relative h-8 rounded" style={{ backgroundColor: '#1E2535' }}>
                          {/* Reference line at HR = 1 */}
                          <div className="absolute left-1/2 h-full w-0.5" style={{ backgroundColor: '#7A8299' }} />

                          {/* CI line */}
                          <div
                            className="absolute h-2 top-3"
                            style={{
                              backgroundColor: '#14BDAE',
                              left: `${Math.min(95, Math.max(5, (Math.log(coef.ciLower) / Math.log(3) + 1) * 50))}%`,
                              width: `${Math.abs((Math.log(coef.ciUpper) - Math.log(coef.ciLower)) / Math.log(3) * 50)}%`,
                            }}
                          />

                          {/* Point estimate */}
                          <div
                            className="absolute w-3 h-3 rounded-full top-2.5"
                            style={{
                              backgroundColor: '#0D7377',
                              left: `${Math.min(95, Math.max(5, (Math.log(coef.hazardRatio) / Math.log(3) + 1) * 50))}%`,
                              transform: 'translateX(-50%)',
                            }}
                          />
                        </div>
                        <div className="w-40 text-xs" style={{ color: '#7A8299' }}>
                          IC 95%: [{coef.ciLower.toFixed(2)}, {coef.ciUpper.toFixed(2)}]
                        </div>
                        <div className="w-24">
                          <Badge
                            variant={coef.significant ? 'default' : 'outline'}
                            style={coef.significant
                              ? { backgroundColor: '#0D7377', color: '#F0EAD6' }
                              : { borderColor: '#2A3147', color: '#7A8299' }
                            }
                          >
                            p = {coef.pValue.toFixed(3)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* C-index */}
              <div className="p-3 rounded" style={{ backgroundColor: 'rgba(13, 115, 119, 0.1)', border: '1px solid rgba(13, 115, 119, 0.2)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium" style={{ color: '#F0EAD6' }}>
                      Índice de Concordância (C-index) <StatisticalTooltipIcon termId="c-index" />
                    </div>
                    <div className="text-sm" style={{ color: '#7A8299' }}>
                      Mede a capacidade discriminatória do modelo
                    </div>
                  </div>
                  <div className="text-3xl font-bold" style={{ color: '#14BDAE' }}>
                    {(survivalData.coxRegression.concordanceIndex * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Clinical Interpretation */}
      <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(147, 51, 234, 0.08)', border: '1px solid rgba(147, 51, 234, 0.2)' }}>
        <div className="flex items-start gap-3">
          <Activity className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-purple-300 mb-2">Interpretação Clínica</h4>
            <ul className="space-y-2">
              {survivalData.interpretation.map((text, index) => (
                <li key={index} className="text-sm text-purple-300">
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
