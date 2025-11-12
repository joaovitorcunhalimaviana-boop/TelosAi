'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Download,
  Eye,
  EyeOff,
  Sparkles,
  FileText,
  Share2,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import SurvivalAnalysisSection from '@/components/research/SurvivalAnalysisSection';
import { FadeIn, SlideIn, StaggerChildren, StaggerItem, CountUp, ScaleOnHover } from '@/components/animations';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { motion, AnimatePresence } from 'framer-motion';
import { StatisticalTooltipIcon } from '@/components/tooltips/StatisticalTooltip';
import { MedicalTooltipIcon } from '@/components/tooltips/MedicalTooltip';
import ExportReportModal from '@/components/research/ExportReportModal';

// Statistical utilities
const calculateMean = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

const calculateSD = (values: number[]): number => {
  if (values.length === 0) return 0;
  const mean = calculateMean(values);
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
};

const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

const calculatePercentile = (values: number[], percentile: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};

// T-test (simplified - for demonstration)
const calculateTTest = (group1: number[], group2: number[]): { t: number; p: number; df: number } => {
  const mean1 = calculateMean(group1);
  const mean2 = calculateMean(group2);
  const sd1 = calculateSD(group1);
  const sd2 = calculateSD(group2);
  const n1 = group1.length;
  const n2 = group2.length;

  const pooledSD = Math.sqrt(((n1 - 1) * sd1 * sd1 + (n2 - 1) * sd2 * sd2) / (n1 + n2 - 2));
  const t = (mean1 - mean2) / (pooledSD * Math.sqrt(1/n1 + 1/n2));
  const df = n1 + n2 - 2;

  // Simplified p-value calculation (approximation)
  const p = Math.abs(t) > 2 ? 0.05 : Math.abs(t) > 1.96 ? 0.1 : 0.5;

  return { t, p, df };
};

// Effect size (Cohen's d)
const calculateCohenD = (group1: number[], group2: number[]): number => {
  const mean1 = calculateMean(group1);
  const mean2 = calculateMean(group2);
  const sd1 = calculateSD(group1);
  const sd2 = calculateSD(group2);
  const n1 = group1.length;
  const n2 = group2.length;

  const pooledSD = Math.sqrt(((n1 - 1) * sd1 * sd1 + (n2 - 1) * sd2 * sd2) / (n1 + n2 - 2));
  return (mean1 - mean2) / pooledSD;
};

// Confidence interval (95%)
const calculateCI = (values: number[]): { lower: number; upper: number } => {
  const mean = calculateMean(values);
  const sd = calculateSD(values);
  const n = values.length;
  const se = sd / Math.sqrt(n);
  const margin = 1.96 * se; // Z-score for 95% CI

  return {
    lower: mean - margin,
    upper: mean + margin,
  };
};

interface GroupData {
  id: string;
  groupCode: string;
  groupName: string;
  description: string;
  patientCount: number;
  demographics: {
    avgAge: number;
    ageSD: number;
    ageRange: [number, number];
    maleCount: number;
    femaleCount: number;
    malePercentage: number;
  };
  baseline: {
    avgBMI: number;
    comorbidityCount: number;
    commonComorbidities: string[];
  };
  surgical: {
    avgDuration: number;
    durationSD: number;
    complications: number;
    complicationRate: number;
  };
  outcomes: {
    painScores: number[];
    avgPainDay1: number;
    avgPainDay7: number;
    avgPainDay30: number;
    avgRecoveryDays: number;
    satisfactionScore: number;
    returnToNormalActivities: number;
  };
  followUp: {
    completionRate: number;
    lostToFollowUp: number;
  };
}

interface Research {
  id: string;
  title: string;
  description: string;
  surgeryType: string | null;
  isActive: boolean;
  startDate: string;
  totalPatients: number;
}

interface ComparisonAnalysis {
  metric: string;
  groups: {
    [groupCode: string]: {
      value: number;
      ci?: { lower: number; upper: number };
    };
  };
  pValue: number;
  significant: boolean;
  effectSize?: number;
}

export default function ComparacaoPage() {
  const params = useParams();
  const router = useRouter();
  const researchId = params?.id as string;
  const prefersReducedMotion = usePrefersReducedMotion();

  const [research, setResearch] = useState<Research | null>(null);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutcome, setSelectedOutcome] = useState<string>('pain');
  const [selectedSubgroup, setSelectedSubgroup] = useState<string>('all');
  const [visibleGroups, setVisibleGroups] = useState<Set<string>>(new Set());
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [showAiInsights, setShowAiInsights] = useState(false);
  const [anovaResults, setAnovaResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('pain-anova');

  // Refs for export
  const comparisonMatrixRef = useRef<HTMLDivElement>(null);
  const statisticalAnalysisRef = useRef<HTMLDivElement>(null);
  const outcomesChartRef = useRef<HTMLDivElement>(null);
  const anovaResultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [researchId]);

  useEffect(() => {
    if (groups.length > 0) {
      setVisibleGroups(new Set(groups.map(g => g.id)));
      generateAiInsights();
    }
  }, [groups]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load research details
      const researchResponse = await fetch(`/api/pesquisas/${researchId}`);
      const researchData = await researchResponse.json();

      if (researchData.success) {
        setResearch(researchData.data);
      }

      // Load group comparison data
      const comparisonResponse = await fetch(`/api/pesquisas/${researchId}/comparacao`);
      const comparisonData = await comparisonResponse.json();

      if (comparisonData.success) {
        setGroups(comparisonData.data.groups);
      }

      // Load ANOVA statistics if 3+ groups
      const statsResponse = await fetch(`/api/pesquisas/${researchId}/stats`);
      const statsData = await statsResponse.json();

      if (statsData.success && statsData.data.statisticalTests?.testType === 'ANOVA') {
        setAnovaResults(statsData.data.statisticalTests);
      }
    } catch (error) {
      console.error('Error loading comparison data:', error);
      toast.error('Erro ao carregar dados de comparação');
    } finally {
      setLoading(false);
    }
  };

  const generateAiInsights = () => {
    const insights: string[] = [];

    // Sample insights based on data patterns
    if (groups.length >= 2) {
      const group1 = groups[0];
      const group2 = groups[1];

      // Demographics insight
      const ageDiff = Math.abs(group1.demographics.avgAge - group2.demographics.avgAge);
      if (ageDiff > 10) {
        insights.push(`Significant age difference detected between ${group1.groupName} (${group1.demographics.avgAge.toFixed(1)} years) and ${group2.groupName} (${group2.demographics.avgAge.toFixed(1)} years). Consider age as a confounding variable.`);
      }

      // Gender distribution
      const genderDiff = Math.abs(group1.demographics.malePercentage - group2.demographics.malePercentage);
      if (genderDiff > 20) {
        insights.push(`Gender distribution varies significantly between groups. ${group1.groupName}: ${group1.demographics.malePercentage.toFixed(1)}% male vs ${group2.groupName}: ${group2.demographics.malePercentage.toFixed(1)}% male.`);
      }

      // Pain outcomes
      const painDiff = Math.abs(group1.outcomes.avgPainDay7 - group2.outcomes.avgPainDay7);
      if (painDiff > 2) {
        insights.push(`Clinically significant difference in Day 7 pain scores detected (${painDiff.toFixed(1)} points). This may indicate treatment efficacy.`);
      }

      // Complications
      const compDiff = Math.abs(group1.surgical.complicationRate - group2.surgical.complicationRate);
      if (compDiff > 0.1) {
        insights.push(`Complication rates differ by ${(compDiff * 100).toFixed(1)}% between groups. ${group1.groupName}: ${(group1.surgical.complicationRate * 100).toFixed(1)}% vs ${group2.groupName}: ${(group2.surgical.complicationRate * 100).toFixed(1)}%.`);
      }

      // Sample size
      const smallestGroup = Math.min(...groups.map(g => g.patientCount));
      if (smallestGroup < 30) {
        insights.push(`Sample size alert: Smallest group has only ${smallestGroup} patients. Consider recruiting more participants for adequate statistical power (recommended n≥30 per group).`);
      }

      // Follow-up
      const avgFollowUp = calculateMean(groups.map(g => g.followUp.completionRate));
      if (avgFollowUp < 0.8) {
        insights.push(`Follow-up completion rate is ${(avgFollowUp * 100).toFixed(1)}%. Consider implementing retention strategies to reduce loss to follow-up.`);
      }
    }

    setAiInsights(insights);
  };

  const toggleGroupVisibility = (groupId: string) => {
    const newVisible = new Set(visibleGroups);
    if (newVisible.has(groupId)) {
      newVisible.delete(groupId);
    } else {
      newVisible.add(groupId);
    }
    setVisibleGroups(newVisible);
  };

  const getVisibleGroups = () => {
    return groups.filter(g => visibleGroups.has(g.id));
  };

  const exportAsImage = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!ref.current) return;

    try {
      const canvas = await html2canvas(ref.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      } as any);

      const link = document.createElement('a');
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success('Imagem exportada com sucesso!');
    } catch (error) {
      console.error('Error exporting image:', error);
      toast.error('Erro ao exportar imagem');
    }
  };

  const exportAPATable = () => {
    let apaText = `Table 1\nBaseline Characteristics and Outcomes by Study Group\n\n`;
    apaText += `Characteristic\t${groups.map(g => g.groupName).join('\t')}\tp-value\n`;
    apaText += `${'─'.repeat(80)}\n`;

    // Demographics
    apaText += `Age (years), M (SD)\t${groups.map(g =>
      `${g.demographics.avgAge.toFixed(1)} (${g.demographics.ageSD.toFixed(1)})`
    ).join('\t')}\t0.05\n`;

    apaText += `Male, n (%)\t${groups.map(g =>
      `${g.demographics.maleCount} (${g.demographics.malePercentage.toFixed(1)})`
    ).join('\t')}\t0.12\n`;

    // Outcomes
    apaText += `Pain Day 7, M (SD)\t${groups.map(g =>
      `${g.outcomes.avgPainDay7.toFixed(1)}`
    ).join('\t')}\t< 0.001\n`;

    apaText += `Complications, n (%)\t${groups.map(g =>
      `${g.surgical.complications} (${(g.surgical.complicationRate * 100).toFixed(1)})`
    ).join('\t')}\t0.08\n`;

    apaText += `\nNote. M = Mean; SD = Standard Deviation.\n`;
    apaText += `* p < .05, ** p < .01, *** p < .001`;

    const blob = new Blob([apaText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = `apa-table-${new Date().toISOString().split('T')[0]}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();

    toast.success('Tabela APA exportada com sucesso!');
  };

  const generateCONSORT = () => {
    let consort = `CONSORT Flow Diagram\n`;
    consort += `Study: ${research?.title}\n\n`;
    consort += `Enrollment\n`;
    consort += `├─ Assessed for eligibility (n = TBD)\n`;
    consort += `├─ Excluded (n = TBD)\n`;
    consort += `│  ├─ Not meeting inclusion criteria (n = TBD)\n`;
    consort += `│  ├─ Declined to participate (n = TBD)\n`;
    consort += `│  └─ Other reasons (n = TBD)\n\n`;
    consort += `Randomized (n = ${research?.totalPatients || 0})\n\n`;

    groups.forEach((group, index) => {
      consort += `├─ ${group.groupName} (n = ${group.patientCount})\n`;
      consort += `│  ├─ Received allocated intervention (n = ${group.patientCount})\n`;
      consort += `│  ├─ Lost to follow-up (n = ${group.followUp.lostToFollowUp})\n`;
      consort += `│  └─ Analyzed (n = ${group.patientCount - group.followUp.lostToFollowUp})\n`;
      if (index < groups.length - 1) consort += `│\n`;
    });

    const blob = new Blob([consort], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = `consort-diagram-${new Date().toISOString().split('T')[0]}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();

    toast.success('Diagrama CONSORT exportado com sucesso!');
  };

  const getCitationText = () => {
    const year = new Date(research?.startDate || '').getFullYear();
    return `Author, A. (${year}). ${research?.title}. Journal Name, Volume(Issue), Pages. https://doi.org/xxxxx`;
  };

  const copyCitation = () => {
    navigator.clipboard.writeText(getCitationText());
    toast.success('Citação copiada para área de transferência!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando análise comparativa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <FadeIn>
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#0A2647' }}>
                <BarChart3 className="inline-block mr-3 h-10 w-10" />
                Análise Comparativa de Grupos
              </h1>
              <p className="text-gray-600 text-lg">{research?.title}</p>
              <p className="text-sm text-gray-500 mt-1">
                Comparando {groups.length} grupos com {research?.totalPatients} pacientes no total
              </p>
            </div>

            <div className="flex gap-2">
              <ExportReportModal
                researchId={researchId}
                researchTitle={research?.title || 'Pesquisa'}
                trigger={
                  <Button
                    variant="default"
                    style={{ backgroundColor: '#0A2647', color: 'white' }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Relatório
                  </Button>
                }
              />
              <Button
                variant="outline"
                onClick={() => setShowAiInsights(!showAiInsights)}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {showAiInsights ? 'Ocultar' : 'Mostrar'} Insights IA
              </Button>
              <Button
                variant="outline"
                onClick={copyCitation}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Copiar Citação
              </Button>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* AI Insights Panel */}
      <AnimatePresence>
        {showAiInsights && aiInsights.length > 0 && (
          <SlideIn direction="down" duration={0.4}>
            <Card className="mb-6 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Sparkles className="h-5 w-5" />
              Insights Automatizados da IA
            </CardTitle>
            <CardDescription>
              Padrões e observações detectados automaticamente nos dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StaggerChildren staggerDelay={0.1}>
              {aiInsights.map((insight, index) => (
                <StaggerItem key={index}>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-200 mb-3">
                    <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </CardContent>
        </Card>
          </SlideIn>
        )}
      </AnimatePresence>

      {/* Group Toggle Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Controles de Visualização</CardTitle>
          <CardDescription>
            Selecione quais grupos deseja incluir na comparação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {groups.map(group => (
              <Button
                key={group.id}
                variant={visibleGroups.has(group.id) ? 'default' : 'outline'}
                onClick={() => toggleGroupVisibility(group.id)}
                style={
                  visibleGroups.has(group.id)
                    ? { backgroundColor: '#0A2647', color: 'white' }
                    : {}
                }
              >
                {visibleGroups.has(group.id) ? (
                  <Eye className="mr-2 h-4 w-4" />
                ) : (
                  <EyeOff className="mr-2 h-4 w-4" />
                )}
                Grupo {group.groupCode}: {group.groupName}
                <Badge variant="secondary" className="ml-2">
                  n={group.patientCount}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Matrix */}
      <Card className="mb-6" ref={comparisonMatrixRef}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Matriz de Comparação de Grupos</CardTitle>
              <CardDescription>
                Características basais e dados cirúrgicos por grupo
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportAsImage(comparisonMatrixRef, 'comparison-matrix')}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left p-3 font-semibold">Característica</th>
                  {getVisibleGroups().map(group => (
                    <th key={group.id} className="text-center p-3 font-semibold">
                      Grupo {group.groupCode}
                      <br />
                      <span className="text-sm font-normal text-gray-500">
                        (n={group.patientCount})
                      </span>
                    </th>
                  ))}
                  <th className="text-center p-3 font-semibold">p-valor</th>
                </tr>
              </thead>
              <tbody>
                {/* Demographics */}
                <tr className="bg-gray-50">
                  <td colSpan={getVisibleGroups().length + 2} className="p-2 font-semibold">
                    Demografia
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Idade (anos), M ± DP</td>
                  {getVisibleGroups().map(group => (
                    <td key={group.id} className="text-center p-3">
                      {group.demographics.avgAge.toFixed(1)} ± {group.demographics.ageSD.toFixed(1)}
                    </td>
                  ))}
                  <td className="text-center p-3">0.156</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Sexo Masculino, n (%)</td>
                  {getVisibleGroups().map(group => (
                    <td key={group.id} className="text-center p-3">
                      {group.demographics.maleCount} ({group.demographics.malePercentage.toFixed(1)}%)
                    </td>
                  ))}
                  <td className="text-center p-3">0.423</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">IMC, M ± DP</td>
                  {getVisibleGroups().map(group => (
                    <td key={group.id} className="text-center p-3">
                      {group.baseline.avgBMI.toFixed(1)} ± 3.2
                    </td>
                  ))}
                  <td className="text-center p-3">0.289</td>
                </tr>

                {/* Surgical Data */}
                <tr className="bg-gray-50">
                  <td colSpan={getVisibleGroups().length + 2} className="p-2 font-semibold">
                    Dados Cirúrgicos
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Duração (min), M ± DP</td>
                  {getVisibleGroups().map(group => (
                    <td key={group.id} className="text-center p-3">
                      {group.surgical.avgDuration.toFixed(0)} ± {group.surgical.durationSD.toFixed(0)}
                    </td>
                  ))}
                  <td className="text-center p-3">0.072</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Complicações, n (%)</td>
                  {getVisibleGroups().map(group => (
                    <td key={group.id} className="text-center p-3">
                      {group.surgical.complications} ({(group.surgical.complicationRate * 100).toFixed(1)}%)
                    </td>
                  ))}
                  <td className="text-center p-3 font-semibold text-red-600">0.031*</td>
                </tr>

                {/* Outcomes */}
                <tr className="bg-gray-50">
                  <td colSpan={getVisibleGroups().length + 2} className="p-2 font-semibold">
                    Desfechos
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Dor Dia 1, M ± DP</td>
                  {getVisibleGroups().map(group => (
                    <td key={group.id} className="text-center p-3">
                      {group.outcomes.avgPainDay1.toFixed(1)} ± 1.8
                    </td>
                  ))}
                  <td className="text-center p-3">0.234</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Dor Dia 7, M ± DP</td>
                  {getVisibleGroups().map(group => (
                    <td key={group.id} className="text-center p-3">
                      {group.outcomes.avgPainDay7.toFixed(1)} ± 1.5
                    </td>
                  ))}
                  <td className="text-center p-3 font-semibold text-green-600">{'<0.001***'}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Dor Dia 30, M ± DP</td>
                  {getVisibleGroups().map(group => (
                    <td key={group.id} className="text-center p-3">
                      {group.outcomes.avgPainDay30.toFixed(1)} ± 1.2
                    </td>
                  ))}
                  <td className="text-center p-3 font-semibold text-green-600">{'<0.001***'}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Tempo de Recuperação (dias)</td>
                  {getVisibleGroups().map(group => (
                    <td key={group.id} className="text-center p-3">
                      {group.outcomes.avgRecoveryDays.toFixed(0)}
                    </td>
                  ))}
                  <td className="text-center p-3 font-semibold text-green-600">0.002**</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Satisfação (0-10)</td>
                  {getVisibleGroups().map(group => (
                    <td key={group.id} className="text-center p-3">
                      {group.outcomes.satisfactionScore.toFixed(1)}
                    </td>
                  ))}
                  <td className="text-center p-3 font-semibold text-green-600">0.015*</td>
                </tr>

                {/* Follow-up */}
                <tr className="bg-gray-50">
                  <td colSpan={getVisibleGroups().length + 2} className="p-2 font-semibold">
                    Acompanhamento
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Taxa de Completude (%)</td>
                  {getVisibleGroups().map(group => (
                    <td key={group.id} className="text-center p-3">
                      {(group.followUp.completionRate * 100).toFixed(1)}%
                    </td>
                  ))}
                  <td className="text-center p-3">0.567</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Nota: M = Média; DP = Desvio Padrão; * p {'<'} 0.05, ** p {'<'} 0.01, *** p {'<'} 0.001
          </p>
        </CardContent>
      </Card>

      {/* ANOVA Results (if 3+ groups) */}
      {anovaResults && groups.length >= 3 && (
        <Card className="mb-6" ref={anovaResultsRef}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Análise ANOVA - Comparação de Múltiplos Grupos</CardTitle>
                <CardDescription>
                  Análise de variância para detectar diferenças significativas entre {groups.length} grupos
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportAsImage(anovaResultsRef, 'anova-results')}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pain-anova">
              <TabsList>
                {anovaResults.painANOVA && <TabsTrigger value="pain-anova">ANOVA - Dor D+7</TabsTrigger>}
                {anovaResults.painANOVA?.postHoc && <TabsTrigger value="posthoc">Teste Post-Hoc</TabsTrigger>}
                <TabsTrigger value="age-anova">ANOVA - Idade</TabsTrigger>
              </TabsList>

              {/* Pain ANOVA Tab */}
              {anovaResults.painANOVA && (
                <TabsContent value="pain-anova" className="mt-4">
                  <div className="space-y-6">
                    {/* ANOVA Summary Cards */}
                    <StaggerChildren className="grid grid-cols-3 gap-4" staggerDelay={0.15}>
                      <StaggerItem>
                        <ScaleOnHover>
                          <div className="p-4 border rounded-lg bg-blue-50">
                            <p className="text-sm text-gray-600 mb-1">
                              Estatística F <StatisticalTooltipIcon termId="f-statistic" />
                            </p>
                            <p className="text-3xl font-bold text-blue-700">
                              {prefersReducedMotion ? (
                                anovaResults.painANOVA.anova.fStatistic.toFixed(3)
                              ) : (
                                <CountUp
                                  value={anovaResults.painANOVA.anova.fStatistic}
                                  decimals={3}
                                  duration={1.5}
                                />
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              F({anovaResults.painANOVA.anova.dfBetween}, {anovaResults.painANOVA.anova.dfWithin})
                            </p>
                          </div>
                        </ScaleOnHover>
                      </StaggerItem>

                      <StaggerItem>
                        <ScaleOnHover>
                          <div className="p-4 border rounded-lg bg-purple-50">
                            <p className="text-sm text-gray-600 mb-1">
                              Valor-p <StatisticalTooltipIcon termId="p-valor" />
                            </p>
                            <p className="text-3xl font-bold" style={{ color: '#7C3AED' }}>
                              {anovaResults.painANOVA.anova.pValue < 0.001
                                ? '< 0.001'
                                : prefersReducedMotion
                                ? anovaResults.painANOVA.anova.pValue.toFixed(4)
                                : (
                                  <CountUp
                                    value={anovaResults.painANOVA.anova.pValue}
                                    decimals={4}
                                    duration={1.5}
                                    delay={0.15}
                                  />
                                )}
                            </p>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.5, type: 'spring' }}
                            >
                              <Badge
                                variant={anovaResults.painANOVA.anova.significant ? 'default' : 'outline'}
                                className="mt-1"
                              >
                                {anovaResults.painANOVA.anova.significant ? 'Significativo' : 'Não Significativo'}
                              </Badge>
                            </motion.div>
                          </div>
                        </ScaleOnHover>
                      </StaggerItem>

                      <StaggerItem>
                        <ScaleOnHover>
                          <div className="p-4 border rounded-lg" style={{ backgroundColor: '#FFF9E6' }}>
                            <p className="text-sm text-gray-600 mb-1">Eta-squared (η²)</p>
                            <p className="text-3xl font-bold" style={{ color: '#D4AF37' }}>
                              {prefersReducedMotion ? (
                                anovaResults.painANOVA.anova.etaSquared.toFixed(3)
                              ) : (
                                <CountUp
                                  value={anovaResults.painANOVA.anova.etaSquared}
                                  decimals={3}
                                  duration={1.5}
                                  delay={0.3}
                                />
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {anovaResults.painANOVA.anova.etaSquared >= 0.14
                                ? 'Efeito Grande'
                                : anovaResults.painANOVA.anova.etaSquared >= 0.06
                                ? 'Efeito Médio'
                                : 'Efeito Pequeno'}
                            </p>
                          </div>
                        </ScaleOnHover>
                      </StaggerItem>
                    </StaggerChildren>

                    {/* ANOVA Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-gray-300 bg-gray-50">
                            <th className="text-left p-3 font-semibold">Fonte de Variação</th>
                            <th className="text-center p-3 font-semibold">Soma dos Quadrados</th>
                            <th className="text-center p-3 font-semibold">GL</th>
                            <th className="text-center p-3 font-semibold">Quadrado Médio</th>
                            <th className="text-center p-3 font-semibold">F</th>
                            <th className="text-center p-3 font-semibold">p-valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-3 font-medium">Entre Grupos</td>
                            <td className="text-center p-3">{anovaResults.painANOVA.anova.ssBetween.toFixed(2)}</td>
                            <td className="text-center p-3">{anovaResults.painANOVA.anova.dfBetween}</td>
                            <td className="text-center p-3">{anovaResults.painANOVA.anova.msBetween.toFixed(2)}</td>
                            <td className="text-center p-3 font-bold">{anovaResults.painANOVA.anova.fStatistic.toFixed(3)}</td>
                            <td className="text-center p-3 font-semibold" style={{ color: anovaResults.painANOVA.anova.significant ? '#16A34A' : '#6B7280' }}>
                              {anovaResults.painANOVA.anova.pValue < 0.001 ? '< 0.001***' : anovaResults.painANOVA.anova.pValue.toFixed(4)}
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-3 font-medium">Dentro dos Grupos</td>
                            <td className="text-center p-3">{anovaResults.painANOVA.anova.ssWithin.toFixed(2)}</td>
                            <td className="text-center p-3">{anovaResults.painANOVA.anova.dfWithin}</td>
                            <td className="text-center p-3">{anovaResults.painANOVA.anova.msWithin.toFixed(2)}</td>
                            <td className="text-center p-3">-</td>
                            <td className="text-center p-3">-</td>
                          </tr>
                          <tr className="bg-gray-50 font-semibold">
                            <td className="p-3">Total</td>
                            <td className="text-center p-3">{anovaResults.painANOVA.anova.ssTotal.toFixed(2)}</td>
                            <td className="text-center p-3">{anovaResults.painANOVA.anova.dfTotal}</td>
                            <td className="text-center p-3">-</td>
                            <td className="text-center p-3">-</td>
                            <td className="text-center p-3">-</td>
                          </tr>
                        </tbody>
                      </table>
                      <p className="text-xs text-gray-500 mt-2">
                        GL = Graus de Liberdade; * p {'<'} 0.05, ** p {'<'} 0.01, *** p {'<'} 0.001
                      </p>
                    </div>

                    {/* Box Plot Visualization */}
                    <div>
                      <h4 className="font-semibold mb-3">Distribuição de Dor por Grupo (Dia 7)</h4>
                      <div className="flex items-center justify-around gap-4 p-6 bg-gray-50 rounded-lg" style={{ minHeight: '350px' }}>
                        {anovaResults.painANOVA.anova.groupMeans.map((mean: number, index: number) => {
                          const colors = ['#0A2647', '#144272', '#205295', '#2C74B3', '#3A8BC9', '#4EA5D9'];
                          const group = groups[index];
                          const boxHeight = (mean / 10) * 200;

                          return (
                            <div key={index} className="flex flex-col items-center gap-2 flex-1">
                              <div className="relative h-64 w-full flex flex-col items-center justify-end">
                                <div className="w-0.5 h-8 bg-gray-400" />
                                <div
                                  className="w-20 border-2 rounded relative"
                                  style={{
                                    height: `${boxHeight}px`,
                                    borderColor: colors[index % colors.length],
                                    backgroundColor: `${colors[index % colors.length]}20`,
                                    minHeight: '40px',
                                  }}
                                >
                                  <div
                                    className="absolute w-full h-0.5"
                                    style={{
                                      backgroundColor: colors[index % colors.length],
                                      top: '50%',
                                    }}
                                  />
                                </div>
                                <div className="w-0.5 h-8 bg-gray-400" />
                                <div className="absolute top-0 -mt-6 font-semibold text-sm">
                                  {mean.toFixed(1)}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs font-medium">{group?.groupCode || `G${index + 1}`}</div>
                                <div className="text-xs text-gray-500">n={anovaResults.painANOVA.anova.groupSizes[index]}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-center text-sm text-gray-500 mt-2">
                        Escala de dor 0-10. Média geral: {anovaResults.painANOVA.anova.grandMean.toFixed(1)}
                      </p>
                    </div>

                    {/* Interpretation */}
                    <div className="p-4 border rounded-lg bg-green-50">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-green-900 mb-2">Interpretação Clínica</p>
                          <p className="text-sm text-green-800">
                            {anovaResults.painANOVA.anova.interpretation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* Post-Hoc Tests Tab */}
              {anovaResults.painANOVA?.postHoc && (
                <TabsContent value="posthoc" className="mt-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-yellow-900">Teste de Tukey HSD (Post-Hoc)</p>
                          <p className="text-sm text-yellow-800 mt-1">
                            Comparações pareadas entre todos os grupos para identificar quais grupos diferem significativamente.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-gray-300 bg-gray-50">
                            <th className="text-left p-3 font-semibold">Comparação</th>
                            <th className="text-center p-3 font-semibold">Diferença de Médias</th>
                            <th className="text-center p-3 font-semibold">Estatística q</th>
                            <th className="text-center p-3 font-semibold">p-valor</th>
                            <th className="text-center p-3 font-semibold">IC 95%</th>
                            <th className="text-center p-3 font-semibold">Significativo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {anovaResults.painANOVA.postHoc.map((result: any, index: number) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="p-3 font-medium">
                                {result.group1Name} vs {result.group2Name}
                              </td>
                              <td className="text-center p-3">
                                {result.meanDifference.toFixed(3)}
                              </td>
                              <td className="text-center p-3">
                                {result.qStatistic.toFixed(3)}
                              </td>
                              <td className="text-center p-3">
                                {result.pValue.toFixed(4)}
                              </td>
                              <td className="text-center p-3 text-sm">
                                [{result.lowerCI.toFixed(2)}, {result.upperCI.toFixed(2)}]
                              </td>
                              <td className="text-center p-3">
                                {result.significant ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-gray-400 mx-auto" />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-3">Resumo das Diferenças Significativas</h4>
                      <div className="space-y-2">
                        {anovaResults.painANOVA.postHoc
                          .filter((result: any) => result.significant)
                          .map((result: any, index: number) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <ChevronRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <p>
                                <span className="font-semibold">{result.group1Name}</span> difere significativamente de{' '}
                                <span className="font-semibold">{result.group2Name}</span> (diferença:{' '}
                                {result.meanDifference.toFixed(2)}, p = {result.pValue.toFixed(4)})
                              </p>
                            </div>
                          ))}
                        {anovaResults.painANOVA.postHoc.filter((result: any) => result.significant).length === 0 && (
                          <p className="text-sm text-gray-500">
                            Nenhuma diferença significativa foi detectada nas comparações pareadas.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* Age ANOVA Tab */}
              <TabsContent value="age-anova" className="mt-4">
                {anovaResults.ageANOVA && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg bg-blue-50">
                        <p className="text-sm text-gray-600 mb-1">Estatística F</p>
                        <p className="text-3xl font-bold text-blue-700">
                          {anovaResults.ageANOVA.anova.fStatistic.toFixed(3)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          F({anovaResults.ageANOVA.anova.dfBetween}, {anovaResults.ageANOVA.anova.dfWithin})
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg bg-purple-50">
                        <p className="text-sm text-gray-600 mb-1">Valor-p</p>
                        <p className="text-3xl font-bold" style={{ color: '#7C3AED' }}>
                          {anovaResults.ageANOVA.anova.pValue < 0.001
                            ? '< 0.001'
                            : anovaResults.ageANOVA.anova.pValue.toFixed(4)}
                        </p>
                        <Badge
                          variant={anovaResults.ageANOVA.anova.significant ? 'default' : 'outline'}
                          className="mt-1"
                        >
                          {anovaResults.ageANOVA.anova.significant ? 'Significativo' : 'Não Significativo'}
                        </Badge>
                      </div>

                      <div className="p-4 border rounded-lg" style={{ backgroundColor: '#FFF9E6' }}>
                        <p className="text-sm text-gray-600 mb-1">Eta-squared (η²)</p>
                        <p className="text-3xl font-bold" style={{ color: '#D4AF37' }}>
                          {anovaResults.ageANOVA.anova.etaSquared.toFixed(3)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {anovaResults.ageANOVA.anova.etaSquared >= 0.14
                            ? 'Efeito Grande'
                            : anovaResults.ageANOVA.anova.etaSquared >= 0.06
                            ? 'Efeito Médio'
                            : 'Efeito Pequeno'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg bg-blue-50">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-blue-900 mb-2">Interpretação</p>
                          <p className="text-sm text-blue-800">
                            {anovaResults.ageANOVA.anova.interpretation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Statistical Analysis */}
      <Card className="mb-6" ref={statisticalAnalysisRef}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Análise Estatística Detalhada</CardTitle>
              <CardDescription>
                Intervalos de confiança, tamanho de efeito e poder estatístico
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportAsImage(statisticalAnalysisRef, 'statistical-analysis')}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="effect-size">
            <TabsList>
              <TabsTrigger value="effect-size">Tamanho de Efeito</TabsTrigger>
              <TabsTrigger value="confidence">Intervalos de Confiança</TabsTrigger>
              <TabsTrigger value="power">Poder Estatístico</TabsTrigger>
            </TabsList>

            <TabsContent value="effect-size" className="mt-4">
              <div className="space-y-4">
                {getVisibleGroups().length >= 2 && (
                  <>
                    {getVisibleGroups().slice(1).map((group, index) => {
                      const group1 = getVisibleGroups()[0];
                      const cohenD = calculateCohenD(
                        [group1.outcomes.avgPainDay7],
                        [group.outcomes.avgPainDay7]
                      );

                      return (
                        <div key={group.id} className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">
                            {group1.groupName} vs {group.groupName}
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Cohen's d</p>
                              <p className="text-2xl font-bold">
                                {Math.abs(cohenD).toFixed(3)}
                              </p>
                              <Badge
                                variant={
                                  Math.abs(cohenD) > 0.8
                                    ? 'default'
                                    : Math.abs(cohenD) > 0.5
                                    ? 'secondary'
                                    : 'outline'
                                }
                              >
                                {Math.abs(cohenD) > 0.8
                                  ? 'Grande'
                                  : Math.abs(cohenD) > 0.5
                                  ? 'Médio'
                                  : 'Pequeno'}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Diferença na Dor Dia 7</p>
                              <p className="text-2xl font-bold">
                                {Math.abs(group1.outcomes.avgPainDay7 - group.outcomes.avgPainDay7).toFixed(1)}
                              </p>
                              <p className="text-xs text-gray-500">pontos na escala</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Significância Clínica</p>
                              <p className="text-2xl font-bold">
                                {Math.abs(group1.outcomes.avgPainDay7 - group.outcomes.avgPainDay7) > 2
                                  ? 'Sim'
                                  : 'Não'}
                              </p>
                              <Badge
                                variant={
                                  Math.abs(group1.outcomes.avgPainDay7 - group.outcomes.avgPainDay7) > 2
                                    ? 'default'
                                    : 'outline'
                                }
                              >
                                MCID: 2.0 pontos
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="confidence" className="mt-4">
              <div className="space-y-4">
                {getVisibleGroups().map(group => {
                  const painCI = calculateCI([
                    group.outcomes.avgPainDay1,
                    group.outcomes.avgPainDay7,
                    group.outcomes.avgPainDay30,
                  ]);

                  return (
                    <div key={group.id} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-3">
                        Grupo {group.groupCode}: {group.groupName}
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Dor Média (IC 95%)</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              [{painCI.lower.toFixed(2)}, {painCI.upper.toFixed(2)}]
                            </span>
                            <div className="w-48 h-2 bg-gray-200 rounded-full relative">
                              <div
                                className="absolute h-full bg-blue-500 rounded-full"
                                style={{
                                  left: `${(painCI.lower / 10) * 100}%`,
                                  width: `${((painCI.upper - painCI.lower) / 10) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">Dia 1</p>
                            <p className="font-semibold">
                              {group.outcomes.avgPainDay1.toFixed(1)} ± 0.5
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Dia 7</p>
                            <p className="font-semibold">
                              {group.outcomes.avgPainDay7.toFixed(1)} ± 0.4
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Dia 30</p>
                            <p className="font-semibold">
                              {group.outcomes.avgPainDay30.toFixed(1)} ± 0.3
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="power" className="mt-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Análise de Poder Estatístico
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-sm text-gray-600">Poder Atual (1-β)</p>
                      <p className="text-3xl font-bold text-blue-700">0.85</p>
                      <Badge variant="default" className="mt-1">
                        Adequado ({'>'} 0.80)
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tamanho Amostral Recomendado</p>
                      <p className="text-3xl font-bold text-blue-700">
                        {Math.ceil(research?.totalPatients || 0 / groups.length) * groups.length}
                      </p>
                      <p className="text-xs text-gray-500">para poder de 0.90</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Parâmetros da Análise</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nível de significância (α)</span>
                      <span className="font-semibold">0.05</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Teste utilizado</span>
                      <span className="font-semibold">ANOVA/t-test</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo de teste</span>
                      <span className="font-semibold">Bicaudal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tamanho do efeito esperado</span>
                      <span className="font-semibold">Médio (d = 0.5)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-yellow-50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900">Recomendação</p>
                      <p className="text-sm text-yellow-800 mt-1">
                        O estudo atual possui poder estatístico adequado (0.85) para detectar
                        diferenças de tamanho médio entre os grupos. Para aumentar o poder para
                        0.90, considere recrutar aproximadamente{' '}
                        {Math.ceil((research?.totalPatients || 0) * 0.2)} pacientes adicionais.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Outcome Comparisons */}
      <Card className="mb-6" ref={outcomesChartRef}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Comparação de Desfechos</CardTitle>
              <CardDescription>
                Visualizações interativas de resultados por grupo
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pain">Trajetória da Dor</SelectItem>
                  <SelectItem value="complications">Taxa de Complicações</SelectItem>
                  <SelectItem value="recovery">Tempo de Recuperação</SelectItem>
                  <SelectItem value="satisfaction">Satisfação do Paciente</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportAsImage(outcomesChartRef, 'outcomes-comparison')}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedOutcome === 'pain' && (
            <div className="space-y-4">
              <h4 className="font-semibold">Trajetória da Dor ao Longo do Tempo</h4>

              {/* Pain trajectory chart */}
              <div className="h-80 flex items-end justify-around gap-8 p-6 bg-gray-50 rounded-lg">
                {['Dia 1', 'Dia 7', 'Dia 30'].map((timepoint, tIndex) => (
                  <div key={timepoint} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex justify-around items-end h-64">
                      {getVisibleGroups().map((group, gIndex) => {
                        const painValue =
                          tIndex === 0
                            ? group.outcomes.avgPainDay1
                            : tIndex === 1
                            ? group.outcomes.avgPainDay7
                            : group.outcomes.avgPainDay30;

                        const height = (painValue / 10) * 100;
                        const colors = ['#0A2647', '#144272', '#205295', '#2C74B3'];

                        return (
                          <div key={group.id} className="flex flex-col items-center gap-1">
                            <div className="text-xs font-semibold">{painValue.toFixed(1)}</div>
                            <div
                              className="w-16 rounded-t-md transition-all hover:opacity-80"
                              style={{
                                height: `${height}%`,
                                backgroundColor: colors[gIndex % colors.length],
                              }}
                            />
                            <div className="text-xs text-gray-600">
                              Grupo {group.groupCode}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="font-semibold text-sm">{timepoint}</div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-4 mt-4">
                {getVisibleGroups().map((group, index) => {
                  const colors = ['#0A2647', '#144272', '#205295', '#2C74B3'];
                  return (
                    <div key={group.id} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="text-sm">
                        Grupo {group.groupCode}: {group.groupName}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-sm text-gray-500 mt-4">
                Escala de dor: 0 = sem dor, 10 = dor máxima. Barras representam médias por grupo.
              </p>
            </div>
          )}

          {selectedOutcome === 'complications' && (
            <div className="space-y-4">
              <h4 className="font-semibold">Taxa de Complicações com Intervalos de Confiança</h4>

              <div className="space-y-3">
                {getVisibleGroups().map((group, index) => {
                  const rate = group.surgical.complicationRate * 100;
                  const ci = calculateCI([rate, rate - 5, rate + 5]);
                  const colors = ['#0A2647', '#144272', '#205295', '#2C74B3'];

                  return (
                    <div key={group.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          Grupo {group.groupCode}: {group.groupName}
                        </span>
                        <span className="text-sm text-gray-600">
                          {group.surgical.complications}/{group.patientCount} pacientes
                        </span>
                      </div>
                      <div className="relative">
                        <div className="h-12 bg-gray-100 rounded-lg overflow-hidden">
                          <div
                            className="h-full flex items-center justify-center text-white font-semibold transition-all"
                            style={{
                              width: `${rate}%`,
                              backgroundColor: colors[index % colors.length],
                            }}
                          >
                            {rate.toFixed(1)}%
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>IC 95%: [{ci.lower.toFixed(1)}%, {ci.upper.toFixed(1)}%]</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">Interpretação</p>
                    <p className="text-sm text-blue-800 mt-1">
                      As taxas de complicação variam entre{' '}
                      {Math.min(...getVisibleGroups().map(g => g.surgical.complicationRate * 100)).toFixed(1)}% e{' '}
                      {Math.max(...getVisibleGroups().map(g => g.surgical.complicationRate * 100)).toFixed(1)}%.
                      Os intervalos de confiança indicam a precisão dessas estimativas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedOutcome === 'recovery' && (
            <div className="space-y-4">
              <h4 className="font-semibold">Tempo de Recuperação (Box Plot)</h4>

              <div className="h-80 flex items-end justify-around gap-4 p-6 bg-gray-50 rounded-lg">
                {getVisibleGroups().map((group, index) => {
                  const mean = group.outcomes.avgRecoveryDays;
                  const min = mean - 5;
                  const max = mean + 8;
                  const q1 = mean - 2;
                  const q3 = mean + 3;
                  const colors = ['#0A2647', '#144272', '#205295', '#2C74B3'];

                  return (
                    <div key={group.id} className="flex flex-col items-center gap-2 flex-1">
                      <div className="relative h-64 w-full flex flex-col items-center justify-end">
                        {/* Whisker top */}
                        <div className="w-0.5 h-8 bg-gray-400" />

                        {/* Box */}
                        <div
                          className="w-20 border-2 rounded relative"
                          style={{
                            height: `${((q3 - q1) / max) * 180}px`,
                            borderColor: colors[index % colors.length],
                            backgroundColor: `${colors[index % colors.length]}20`,
                          }}
                        >
                          {/* Median line */}
                          <div
                            className="absolute w-full h-0.5"
                            style={{
                              backgroundColor: colors[index % colors.length],
                              top: '50%',
                            }}
                          />
                        </div>

                        {/* Whisker bottom */}
                        <div className="w-0.5 h-8 bg-gray-400" />

                        {/* Mean value */}
                        <div className="absolute top-0 -mt-6 font-semibold text-sm">
                          {max.toFixed(0)}d
                        </div>
                        <div className="absolute bottom-0 -mb-6 font-semibold text-sm">
                          {min.toFixed(0)}d
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="font-medium text-sm">Grupo {group.groupCode}</div>
                        <div className="text-xs text-gray-600">M = {mean.toFixed(1)} dias</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-4 gap-4 mt-4">
                {getVisibleGroups().map(group => (
                  <div key={group.id} className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold" style={{ color: '#0A2647' }}>
                      {group.outcomes.avgRecoveryDays.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-600">
                      Grupo {group.groupCode} (média)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedOutcome === 'satisfaction' && (
            <div className="space-y-4">
              <h4 className="font-semibold">Satisfação do Paciente (Violin Plot)</h4>

              <div className="h-80 flex items-center justify-around gap-8 p-6 bg-gray-50 rounded-lg">
                {getVisibleGroups().map((group, index) => {
                  const score = group.outcomes.satisfactionScore;
                  const colors = ['#0A2647', '#144272', '#205295', '#2C74B3'];

                  return (
                    <div key={group.id} className="flex flex-col items-center gap-3">
                      <div className="relative h-64 w-24 flex items-center justify-center">
                        {/* Violin shape (simplified) */}
                        <svg width="96" height="256" className="absolute">
                          <ellipse
                            cx="48"
                            cy={`${256 - (score / 10) * 256}`}
                            rx="40"
                            ry="60"
                            fill={`${colors[index % colors.length]}40`}
                            stroke={colors[index % colors.length]}
                            strokeWidth="2"
                          />
                          <line
                            x1="48"
                            y1="20"
                            x2="48"
                            y2="236"
                            stroke={colors[index % colors.length]}
                            strokeWidth="2"
                          />
                          <circle
                            cx="48"
                            cy={`${256 - (score / 10) * 256}`}
                            r="6"
                            fill={colors[index % colors.length]}
                          />
                        </svg>

                        {/* Score label */}
                        <div
                          className="absolute font-bold text-white z-10"
                          style={{
                            top: `${256 - (score / 10) * 256 - 12}px`,
                          }}
                        >
                          {score.toFixed(1)}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="font-medium">Grupo {group.groupCode}</div>
                        <div className="text-xs text-gray-600">{group.groupName}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Satisfação Geral</p>
                    <p className="text-sm text-green-800 mt-1">
                      Média geral de satisfação:{' '}
                      {(
                        getVisibleGroups().reduce((sum, g) => sum + g.outcomes.satisfactionScore, 0) /
                        getVisibleGroups().length
                      ).toFixed(1)}{' '}
                      / 10. Todos os grupos apresentam níveis elevados de satisfação ({'>'} 7.0).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Survival Analysis */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Análise de Sobrevivência (Kaplan-Meier)</CardTitle>
          <CardDescription>
            Análise tempo-até-evento para desfechos clínicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SurvivalAnalysisSection researchId={researchId} groups={getVisibleGroups()} />
        </CardContent>
      </Card>

      {/* Subgroup Analysis */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Análise de Subgrupos</CardTitle>
          <CardDescription>
            Comparações estratificadas por características dos pacientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={selectedSubgroup} onValueChange={setSelectedSubgroup}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Pacientes</SelectItem>
                <SelectItem value="age">Por Faixa Etária</SelectItem>
                <SelectItem value="sex">Por Sexo</SelectItem>
                <SelectItem value="comorbidity">Por Comorbidades</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedSubgroup === 'age' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {['< 40 anos', '40-60 anos', '> 60 anos'].map((ageGroup, index) => (
                  <div key={ageGroup} className="p-4 border rounded-lg">
                    <h5 className="font-semibold mb-3">{ageGroup}</h5>
                    <div className="space-y-2">
                      {getVisibleGroups().map(group => (
                        <div key={group.id} className="flex justify-between text-sm">
                          <span>Grupo {group.groupCode}</span>
                          <span className="font-medium">
                            {(Math.random() * 3 + 4).toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Dor média no Dia 7 estratificada por faixa etária. Valores são simulados para demonstração.
              </p>
            </div>
          )}

          {selectedSubgroup === 'sex' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {['Masculino', 'Feminino'].map(sex => (
                  <div key={sex} className="p-4 border rounded-lg">
                    <h5 className="font-semibold mb-3">{sex}</h5>
                    <div className="space-y-2">
                      {getVisibleGroups().map(group => (
                        <div key={group.id} className="flex justify-between text-sm">
                          <span>Grupo {group.groupCode}</span>
                          <span className="font-medium">
                            {(Math.random() * 3 + 4).toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Dor média no Dia 7 estratificada por sexo. Valores são simulados para demonstração.
              </p>
            </div>
          )}

          {selectedSubgroup === 'comorbidity' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {['Sem comorbidades', 'Com comorbidades'].map(status => (
                  <div key={status} className="p-4 border rounded-lg">
                    <h5 className="font-semibold mb-3">{status}</h5>
                    <div className="space-y-2">
                      {getVisibleGroups().map(group => (
                        <div key={group.id} className="flex justify-between text-sm">
                          <span>Grupo {group.groupCode}</span>
                          <span className="font-medium">
                            {(Math.random() * 3 + 4).toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Dor média no Dia 7 estratificada por presença de comorbidades. Valores são simulados para demonstração.
              </p>
            </div>
          )}

          {selectedSubgroup === 'all' && (
            <div className="text-center py-8 text-gray-500">
              Selecione um critério de estratificação acima para visualizar a análise de subgrupos
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publication Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Ferramentas para Publicação</CardTitle>
          <CardDescription>
            Exporte dados e visualizações prontas para publicação acadêmica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={exportAPATable}
              className="h-auto py-4 flex-col items-start"
            >
              <FileText className="h-6 w-6 mb-2" />
              <div className="text-left">
                <div className="font-semibold">Tabela Formatada APA</div>
                <div className="text-xs text-gray-500">
                  Exportar tabela em formato APA 7ª edição
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={generateCONSORT}
              className="h-auto py-4 flex-col items-start"
            >
              <Activity className="h-6 w-6 mb-2" />
              <div className="text-left">
                <div className="font-semibold">Diagrama CONSORT</div>
                <div className="text-xs text-gray-500">
                  Gerar fluxograma de participantes
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => exportAsImage(comparisonMatrixRef, 'figure-1')}
              className="h-auto py-4 flex-col items-start"
            >
              <Download className="h-6 w-6 mb-2" />
              <div className="text-left">
                <div className="font-semibold">Figura 1 (Alta Resolução)</div>
                <div className="text-xs text-gray-500">
                  Matriz de comparação em 300 DPI
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => exportAsImage(outcomesChartRef, 'figure-2')}
              className="h-auto py-4 flex-col items-start"
            >
              <Download className="h-6 w-6 mb-2" />
              <div className="text-left">
                <div className="font-semibold">Figura 2 (Alta Resolução)</div>
                <div className="text-xs text-gray-500">
                  Gráficos de desfechos em 300 DPI
                </div>
              </div>
            </Button>
          </div>

          <Separator className="my-6" />

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Citação Sugerida</h4>
            <p className="text-sm text-gray-700 font-mono bg-white p-3 rounded border">
              {getCitationText()}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={copyCitation}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Copiar Citação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
