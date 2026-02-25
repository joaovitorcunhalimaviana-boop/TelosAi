/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  FlaskConical,
  Users,
  Calendar,
  Activity,
  TrendingUp,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  PieChart as PieChartIcon,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Color palette for charts
const COLORS = ['#14BDAE', '#0D7377', '#C9A84C', '#D4AF37', '#5AB2FF', '#7AC5FF', '#9DD4FF', '#C0E6FF'];
const RISK_COLORS = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
};

interface GroupStats {
  groupCode: string;
  groupName: string;
  patientCount: number;
  avgAge: number;
  ageRange: [number, number];
  sexDistribution: Record<string, number>;
  surgeryTypes: Record<string, number>;
  avgCompleteness: number;
  comorbidities: Record<string, number>;
  medications: Record<string, number>;
  responseRate: number;
  painScores: Array<{ day: number; painLevel: number }>;
  complicationRate: number;
  totalFollowUps: number;
  respondedFollowUps: number;
}

interface Research {
  id: string;
  title: string;
  description: string;
  surgeryType: string | null;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
}

interface StatsData {
  research: Research;
  overview: {
    totalPatients: number;
    avgAge: number;
    sexDistribution: Record<string, number>;
    dataCompleteness: number;
    totalGroups: number;
  };
  groups: GroupStats[];
  statisticalTests: any;
}

export default function ResearchStatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const researchId = params.id as string;

  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && researchId) {
      loadStats();
    }
  }, [status, researchId]);

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/pesquisas/${researchId}/stats`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        toast.error('Erro ao carregar estatísticas');
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0B0E14' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#14BDAE' }}></div>
          <p className="mt-4" style={{ color: '#7A8299' }}>Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6 max-w-7xl" style={{ backgroundColor: '#0B0E14' }}>
        <Card className="border-2" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#F0EAD6' }}>
              Pesquisa não encontrada
            </h3>
            <p className="mb-6" style={{ color: '#7A8299' }}>
              Não foi possível carregar os dados da pesquisa.
            </p>
            <Button onClick={() => router.push('/dashboard/pesquisas')}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar para Pesquisas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { research, overview, groups } = stats;

  // Prepare data for charts
  const sexData = Object.entries(overview.sexDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const groupComparisonData = groups.map((group) => ({
    name: group.groupName,
    'Pacientes': group.patientCount,
    'Idade Média': group.avgAge,
    'Taxa de Resposta': group.responseRate,
    'Taxa de Complicação': group.complicationRate,
  }));

  const ageDistributionData = groups.map((group) => ({
    name: group.groupName,
    'Idade Mínima': group.ageRange[0],
    'Idade Média': group.avgAge,
    'Idade Máxima': group.ageRange[1],
  }));

  // Calculate duration
  const startDate = new Date(research.startDate);
  const endDate = research.endDate ? new Date(research.endDate) : new Date();
  const durationDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl" style={{ backgroundColor: '#0B0E14', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/pesquisas')}
          className="mb-4"
          style={{ color: '#7A8299' }}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar para Pesquisas
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold" style={{ color: '#F0EAD6' }}>
                <FlaskConical className="inline-block mr-3 h-10 w-10" style={{ color: '#14BDAE' }} />
                {research.title}
              </h1>
              <Badge
                variant={research.isActive ? 'default' : 'secondary'}
                className={
                  research.isActive
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-400'
                }
              >
                {research.isActive ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
            <p className="text-lg" style={{ color: '#7A8299' }}>{research.description}</p>
            {research.surgeryType && (
              <p className="text-sm mt-2" style={{ color: '#7A8299' }}>
                Tipo de cirurgia: <strong style={{ color: '#D8DEEB' }}>{research.surgeryType}</strong>
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <Card className="border-2 hover:shadow-lg transition-shadow" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium" style={{ color: '#7A8299' }}>
              Total de Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8" style={{ color: '#14BDAE' }} />
              <div>
                <p className="text-3xl font-bold" style={{ color: '#14BDAE' }}>
                  {overview.totalPatients}
                </p>
                <p className="text-xs" style={{ color: '#7A8299' }}>
                  {overview.totalGroups} grupos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium" style={{ color: '#7A8299' }}>
              Idade Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8" style={{ color: '#C9A84C' }} />
              <div>
                <p className="text-3xl font-bold" style={{ color: '#C9A84C' }}>
                  {overview.avgAge}
                </p>
                <p className="text-xs" style={{ color: '#7A8299' }}>anos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium" style={{ color: '#7A8299' }}>
              Completude de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {overview.dataCompleteness}%
                </p>
                <Progress value={overview.dataCompleteness} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium" style={{ color: '#7A8299' }}>
              Data de Início
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8" style={{ color: '#D4AF37' }} />
              <div>
                <p className="text-lg font-bold" style={{ color: '#D4AF37' }}>
                  {format(startDate, 'dd/MM/yyyy', { locale: ptBR })}
                </p>
                <p className="text-xs" style={{ color: '#7A8299' }}>{durationDays} dias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium" style={{ color: '#7A8299' }}>
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8" style={{ color: '#14BDAE' }} />
              <div>
                <p className="text-lg font-bold" style={{ color: '#14BDAE' }}>
                  {research.isActive ? 'Em Andamento' : 'Finalizada'}
                </p>
                {research.endDate && (
                  <p className="text-xs" style={{ color: '#7A8299' }}>
                    {format(new Date(research.endDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="demographics">Demografia</TabsTrigger>
          <TabsTrigger value="groups">Grupos</TabsTrigger>
          <TabsTrigger value="outcomes">Desfechos</TabsTrigger>
          <TabsTrigger value="clinical">Dados Clínicos</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Sex Distribution */}
            <Card className="border-2" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Distribuição por Sexo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sexData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${percent ? (percent * 100).toFixed(0) : '0'}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sexData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#161B27', border: '1px solid #1E2535', borderRadius: '8px', color: '#D8DEEB' }} />
                    <Legend wrapperStyle={{ color: '#D8DEEB' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Age Distribution */}
            <Card className="border-2" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Distribuição de Idade por Grupo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ageDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" />
                    <XAxis dataKey="name" tick={{ fill: '#7A8299' }} axisLine={{ stroke: '#1E2535' }} />
                    <YAxis tick={{ fill: '#7A8299' }} axisLine={{ stroke: '#1E2535' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#161B27', border: '1px solid #1E2535', borderRadius: '8px', color: '#D8DEEB' }} />
                    <Legend wrapperStyle={{ color: '#D8DEEB' }} />
                    <Bar dataKey="Idade Mínima" fill="#0D7377" />
                    <Bar dataKey="Idade Média" fill="#14BDAE" />
                    <Bar dataKey="Idade Máxima" fill="#C9A84C" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Group Comparison */}
          <Card className="border-2" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Comparação entre Grupos
              </CardTitle>
              <CardDescription>
                Principais métricas comparativas entre os grupos de estudo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={groupComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: '#7A8299' }} axisLine={{ stroke: '#1E2535' }} />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: '#161B27', border: '1px solid #1E2535', borderRadius: '8px', color: '#D8DEEB' }} />
                  <Legend />
                  <Bar dataKey="Pacientes" fill="#14BDAE" />
                  <Bar dataKey="Idade Média" fill="#0D7377" />
                  <Bar dataKey="Taxa de Resposta" fill="#C9A84C" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {groups.map((group, idx) => (
              <Card key={group.groupCode} className="border-2">
                <CardHeader>
                  <CardTitle>
                    Grupo {group.groupCode}: {group.groupName}
                  </CardTitle>
                  <CardDescription>Perfil demográfico do grupo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#161B27', border: '1px solid #1E2535' }}>
                      <p className="text-sm" style={{ color: '#7A8299' }}>Pacientes</p>
                      <p className="text-2xl font-bold" style={{ color: '#14BDAE' }}>
                        {group.patientCount}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#161B27', border: '1px solid #1E2535' }}>
                      <p className="text-sm" style={{ color: '#7A8299' }}>Idade Média</p>
                      <p className="text-2xl font-bold" style={{ color: '#C9A84C' }}>
                        {group.avgAge} anos
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Distribuição por Sexo</h4>
                    {Object.entries(group.sexDistribution).map(([sex, count]) => (
                      <div key={sex} className="flex items-center justify-between mb-2">
                        <span className="text-sm" style={{ color: '#7A8299' }}>{sex}</span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(count / group.patientCount) * 100}
                            className="w-32"
                          />
                          <span className="text-sm font-semibold">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Faixa Etária</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: '#7A8299' }}>
                        {group.ageRange[0]} - {group.ageRange[1]} anos
                      </span>
                      <Badge variant="outline">Amplitude: {group.ageRange[1] - group.ageRange[0]}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-6">
          {groups.map((group, idx) => (
            <Card key={group.groupCode} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      Grupo {group.groupCode}: {group.groupName}
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      Análise detalhada do grupo
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold" style={{ color: COLORS[idx] }}>
                      {group.patientCount}
                    </p>
                    <p className="text-sm" style={{ color: '#7A8299' }}>pacientes</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#161B27', border: '1px solid #1E2535' }}>
                    <p className="text-sm" style={{ color: '#7A8299' }}>Idade Média</p>
                    <p className="text-2xl font-bold">{group.avgAge}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#161B27', border: '1px solid #1E2535' }}>
                    <p className="text-sm" style={{ color: '#7A8299' }}>Completude</p>
                    <p className="text-2xl font-bold">{group.avgCompleteness}%</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#161B27', border: '1px solid #1E2535' }}>
                    <p className="text-sm" style={{ color: '#7A8299' }}>Taxa de Resposta</p>
                    <p className="text-2xl font-bold">{group.responseRate}%</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#161B27', border: '1px solid #1E2535' }}>
                    <p className="text-sm" style={{ color: '#7A8299' }}>Complicações</p>
                    <p className="text-2xl font-bold">{group.complicationRate}%</p>
                  </div>
                </div>

                <Separator />

                {/* Surgery Types */}
                {Object.keys(group.surgeryTypes).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Tipos de Cirurgia</h4>
                    <div className="space-y-2">
                      {Object.entries(group.surgeryTypes).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{type}</span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={(count / group.patientCount) * 100}
                              className="w-48"
                            />
                            <span className="text-sm font-semibold w-12 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Follow-up Stats */}
                <div>
                  <h4 className="font-semibold mb-3">Follow-up</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#161B27', border: '1px solid #1E2535' }}>
                      <p className="text-sm" style={{ color: '#7A8299' }}>Total de Follow-ups</p>
                      <p className="text-2xl font-bold" style={{ color: '#14BDAE' }}>
                        {group.totalFollowUps}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#161B27', border: '1px solid #1E2535' }}>
                      <p className="text-sm" style={{ color: '#7A8299' }}>Respondidos</p>
                      <p className="text-2xl font-bold text-green-600">
                        {group.respondedFollowUps}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Outcomes Tab */}
        <TabsContent value="outcomes" className="space-y-6">
          {/* Pain Scores Over Time */}
          <Card className="border-2" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Evolução da Dor ao Longo do Tempo
              </CardTitle>
              <CardDescription>
                Comparação dos níveis de dor entre grupos durante o follow-up
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" />
                  <XAxis
                    dataKey="day"
                    type="number"
                    tick={{ fill: '#7A8299' }}
                    axisLine={{ stroke: '#1E2535' }}
                    label={{ value: 'Dia de Follow-up', position: 'insideBottom', offset: -5, fill: '#7A8299' }}
                  />
                  <YAxis
                    tick={{ fill: '#7A8299' }}
                    axisLine={{ stroke: '#1E2535' }}
                    label={{ value: 'Nível de Dor', angle: -90, position: 'insideLeft', fill: '#7A8299' }}
                    domain={[0, 10]}
                  />
                  <Tooltip contentStyle={{ backgroundColor: '#161B27', border: '1px solid #1E2535', borderRadius: '8px', color: '#D8DEEB' }} />
                  <Legend wrapperStyle={{ color: '#D8DEEB' }} />
                  {groups.map((group, idx) => (
                    <Line
                      key={group.groupCode}
                      data={group.painScores}
                      type="monotone"
                      dataKey="painLevel"
                      name={group.groupName}
                      stroke={COLORS[idx]}
                      strokeWidth={3}
                      dot={{ fill: COLORS[idx], r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Complication Rates */}
          <Card className="border-2" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Taxa de Complicações por Grupo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={groupComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: '#7A8299' }} axisLine={{ stroke: '#1E2535' }} />
                  <YAxis tick={{ fill: '#7A8299' }} axisLine={{ stroke: '#1E2535' }} label={{ value: 'Taxa (%)', angle: -90, position: 'insideLeft', fill: '#7A8299' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#161B27', border: '1px solid #1E2535', borderRadius: '8px', color: '#D8DEEB' }} />
                  <Bar dataKey="Taxa de Complicação" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Response Rates */}
          <Card className="border-2" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Taxa de Resposta ao Follow-up
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={groupComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: '#7A8299' }} axisLine={{ stroke: '#1E2535' }} />
                  <YAxis tick={{ fill: '#7A8299' }} axisLine={{ stroke: '#1E2535' }} label={{ value: 'Taxa (%)', angle: -90, position: 'insideLeft', fill: '#7A8299' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#161B27', border: '1px solid #1E2535', borderRadius: '8px', color: '#D8DEEB' }} />
                  <Bar dataKey="Taxa de Resposta" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinical Data Tab */}
        <TabsContent value="clinical" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {groups.map((group, idx) => (
              <Card key={group.groupCode} className="border-2">
                <CardHeader>
                  <CardTitle>
                    Grupo {group.groupCode}: {group.groupName}
                  </CardTitle>
                  <CardDescription>Dados clínicos e comorbidades</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Comorbidities */}
                  {Object.keys(group.comorbidities).length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Comorbidades
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(group.comorbidities)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 5)
                          .map(([name, count]) => (
                            <div key={name} className="flex items-center justify-between">
                              <span className="text-sm">{name}</span>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={(count / group.patientCount) * 100}
                                  className="w-32"
                                />
                                <span className="text-sm font-semibold w-8 text-right">
                                  {count}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Medications */}
                  {Object.keys(group.medications).length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Medicações Mais Comuns
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(group.medications)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 5)
                          .map(([name, count]) => (
                            <div key={name} className="flex items-center justify-between">
                              <span className="text-sm">{name}</span>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={(count / group.patientCount) * 100}
                                  className="w-32"
                                />
                                <span className="text-sm font-semibold w-8 text-right">
                                  {count}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Statistical Tests */}
          {stats.statisticalTests && (
            <Card className="border-2" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#F0EAD6' }}>
                  <BarChart3 className="h-5 w-5" style={{ color: '#14BDAE' }} />
                  Testes Estatísticos
                </CardTitle>
                <CardDescription style={{ color: '#7A8299' }}>
                  Comparações estatísticas entre grupos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.statisticalTests.ageTTest && (
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#161B27', border: '1px solid #1E2535' }}>
                    <h4 className="font-semibold mb-2" style={{ color: '#F0EAD6' }}>Teste t para Idade</h4>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p style={{ color: '#7A8299' }}>Estatística t</p>
                        <p className="text-lg font-bold">
                          {stats.statisticalTests.ageTTest.tStatistic}
                        </p>
                      </div>
                      <div>
                        <p style={{ color: '#7A8299' }}>Média Grupo 1</p>
                        <p className="text-lg font-bold">
                          {stats.statisticalTests.ageTTest.mean1}
                        </p>
                      </div>
                      <div>
                        <p style={{ color: '#7A8299' }}>Média Grupo 2</p>
                        <p className="text-lg font-bold">
                          {stats.statisticalTests.ageTTest.mean2}
                        </p>
                      </div>
                      <div>
                        <p style={{ color: '#7A8299' }}>Diferença</p>
                        <p className="text-lg font-bold">
                          {stats.statisticalTests.ageTTest.difference}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
