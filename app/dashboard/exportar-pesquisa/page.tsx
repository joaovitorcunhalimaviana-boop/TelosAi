'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Download,
  FileSpreadsheet,
  FileText,
  File,
  Database,
  FlaskConical,
  Users,
  BarChart3,
  Calendar,
  Mail,
  Eye,
  Loader2
} from 'lucide-react';

interface ResearchGroup {
  id: string;
  groupCode: string;
  groupName: string;
  description: string;
  patientCount: number;
}

interface Research {
  id: string;
  title: string;
  description: string;
  surgeryType: string | null;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  totalPatients: number;
  groups: ResearchGroup[];
}

export default function ExportarPesquisaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Research data
  const [researches, setResearches] = useState<Research[]>([]);
  const [loadingResearches, setLoadingResearches] = useState(true);

  // Selection states
  const [selectedResearch, setSelectedResearch] = useState<string>('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx' | 'pdf'>('xlsx');

  // Field selection
  const [selectedFields, setSelectedFields] = useState({
    dadosBasicos: true,
    dadosCirurgicos: true,
    comorbidades: true,
    medicacoes: true,
    followUps: true,
    respostasQuestionarios: true,
    analiseIA: false,
  });

  // Export type
  const [exportType, setExportType] = useState<'individual' | 'comparative' | 'statistical' | 'timeline'>('individual');

  // Date range filter
  const [useDateFilter, setUseDateFilter] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Email option
  const [sendEmail, setSendEmail] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  // Export states
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadResearches();
      if (session?.user?.email) {
        setEmailAddress(session.user.email);
      }
    }
  }, [status, session]);

  const loadResearches = async () => {
    try {
      const response = await fetch('/api/pesquisas');
      const data = await response.json();

      if (data.success) {
        setResearches(data.data);
      } else {
        toast.error('Erro ao carregar pesquisas');
      }
    } catch (error) {
      console.error('Error loading researches:', error);
      toast.error('Erro ao carregar pesquisas');
    } finally {
      setLoadingResearches(false);
    }
  };

  const selectedResearchData = researches.find(r => r.id === selectedResearch);

  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(g => g !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleAllGroups = () => {
    if (!selectedResearchData) return;

    if (selectedGroups.length === selectedResearchData.groups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(selectedResearchData.groups.map(g => g.id));
    }
  };

  const toggleField = (field: keyof typeof selectedFields) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handlePreview = async () => {
    if (!validateExport()) return;

    setShowPreview(true);
    setIsExporting(true);

    try {
      const response = await fetch('/api/export-research/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          researchId: selectedResearch,
          groupIds: selectedGroups,
          fields: selectedFields,
          exportType,
          dateRange: useDateFilter ? { startDate, endDate } : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao gerar preview');
      }

      const data = await response.json();
      setPreviewData(data);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar preview');
      setShowPreview(false);
    } finally {
      setIsExporting(false);
    }
  };

  const validateExport = () => {
    if (!selectedResearch) {
      toast.error('Selecione uma pesquisa');
      return false;
    }

    if (selectedGroups.length === 0) {
      toast.error('Selecione pelo menos um grupo');
      return false;
    }

    if (!Object.values(selectedFields).some(v => v)) {
      toast.error('Selecione pelo menos um campo para exportar');
      return false;
    }

    if (useDateFilter && startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error('Data de início deve ser anterior à data de fim');
      return false;
    }

    if (sendEmail && !emailAddress) {
      toast.error('Informe um endereço de e-mail válido');
      return false;
    }

    return true;
  };

  const handleExport = async () => {
    if (!validateExport()) return;

    setIsExporting(true);

    try {
      const exportData = {
        researchId: selectedResearch,
        groupIds: selectedGroups,
        fields: selectedFields,
        exportType,
        format: exportFormat,
        dateRange: useDateFilter ? { startDate, endDate } : null,
        sendEmail,
        emailAddress: sendEmail ? emailAddress : null,
      };

      const response = await fetch('/api/export-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao exportar dados');
      }

      if (sendEmail) {
        toast.success('Exportação enviada para seu e-mail!');
      } else {
        // Download file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const contentDisposition = response.headers.get('Content-Disposition');
        const fileName = contentDisposition
          ? contentDisposition.split('filename=')[1].replace(/"/g, '')
          : `pesquisa_${selectedResearchData?.title.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.${exportFormat}`;

        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success('Dados exportados com sucesso!');
      }
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao exportar dados');
    } finally {
      setIsExporting(false);
    }
  };

  if (status === 'loading' || loadingResearches) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3" style={{ color: '#0A2647' }}>
          <FlaskConical className="h-10 w-10" />
          Exportação de Dados de Pesquisa
        </h1>
        <p className="text-gray-600">
          Configure e exporte dados de suas pesquisas científicas em diversos formatos
        </p>
      </div>

      {/* No Research Warning */}
      {researches.length === 0 && (
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FlaskConical className="h-16 w-16 text-yellow-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhuma pesquisa encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              Você precisa criar uma pesquisa antes de exportar dados
            </p>
            <Button
              onClick={() => router.push('/dashboard/pesquisas')}
              style={{ backgroundColor: '#0A2647', color: 'white' }}
            >
              Ir para Pesquisas
            </Button>
          </CardContent>
        </Card>
      )}

      {researches.length > 0 && (
        <div className="grid gap-6">
          {/* Research Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Seleção de Pesquisa
              </CardTitle>
              <CardDescription>
                Escolha a pesquisa que deseja exportar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="research-select">Pesquisa</Label>
                  <Select value={selectedResearch} onValueChange={setSelectedResearch}>
                    <SelectTrigger id="research-select">
                      <SelectValue placeholder="Selecione uma pesquisa" />
                    </SelectTrigger>
                    <SelectContent>
                      {researches.map((research) => (
                        <SelectItem key={research.id} value={research.id}>
                          <div className="flex items-center gap-2">
                            <span>{research.title}</span>
                            <Badge variant={research.isActive ? 'default' : 'secondary'} className="ml-2">
                              {research.isActive ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedResearchData && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold mb-2 text-blue-900">Detalhes da Pesquisa</h4>
                    <p className="text-sm text-blue-800 mb-2">{selectedResearchData.description}</p>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                        <p className="text-lg font-bold text-blue-700">{selectedResearchData.totalPatients}</p>
                        <p className="text-xs text-blue-600">Pacientes</p>
                      </div>
                      <div className="text-center">
                        <BarChart3 className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                        <p className="text-lg font-bold text-blue-700">{selectedResearchData.groups.length}</p>
                        <p className="text-xs text-blue-600">Grupos</p>
                      </div>
                      <div className="text-center">
                        <Calendar className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                        <p className="text-lg font-bold text-blue-700">
                          {new Date(selectedResearchData.startDate).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-blue-600">Início</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Group Selection */}
          {selectedResearchData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Seleção de Grupos
                    </CardTitle>
                    <CardDescription>
                      Escolha os grupos que deseja incluir na exportação
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAllGroups}
                  >
                    {selectedGroups.length === selectedResearchData.groups.length ? 'Desmarcar todos' : 'Selecionar todos'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedResearchData.groups.map((group) => (
                    <div
                      key={group.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedGroups.includes(group.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleGroup(group.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedGroups.includes(group.id)}
                          onCheckedChange={() => toggleGroup(group.id)}
                        />
                        <div className="flex-1">
                          <div className="font-semibold mb-1">
                            Grupo {group.groupCode}: {group.groupName}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                          <Badge variant="outline" className="text-xs">
                            {group.patientCount} pacientes
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Opções de Exportação</CardTitle>
              <CardDescription>
                Configure o formato e tipo de exportação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Format Selection */}
              <div className="space-y-2">
                <Label htmlFor="format">Formato de Exportação</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={exportFormat === 'xlsx' ? 'default' : 'outline'}
                    onClick={() => setExportFormat('xlsx')}
                    className="w-full"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel (.xlsx)
                  </Button>
                  <Button
                    variant={exportFormat === 'csv' ? 'default' : 'outline'}
                    onClick={() => setExportFormat('csv')}
                    className="w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                    onClick={() => setExportFormat('pdf')}
                    className="w-full"
                  >
                    <File className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Export Type */}
              <div className="space-y-2">
                <Label>Tipo de Exportação</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={exportType === 'individual' ? 'default' : 'outline'}
                    onClick={() => setExportType('individual')}
                    className="w-full justify-start"
                  >
                    <div className="text-left">
                      <div className="font-semibold">Dados Individuais</div>
                      <div className="text-xs opacity-75">Uma linha por paciente</div>
                    </div>
                  </Button>
                  <Button
                    variant={exportType === 'comparative' ? 'default' : 'outline'}
                    onClick={() => setExportType('comparative')}
                    className="w-full justify-start"
                  >
                    <div className="text-left">
                      <div className="font-semibold">Comparativo</div>
                      <div className="text-xs opacity-75">Grupos lado a lado</div>
                    </div>
                  </Button>
                  <Button
                    variant={exportType === 'statistical' ? 'default' : 'outline'}
                    onClick={() => setExportType('statistical')}
                    className="w-full justify-start"
                  >
                    <div className="text-left">
                      <div className="font-semibold">Resumo Estatístico</div>
                      <div className="text-xs opacity-75">Médias e análises</div>
                    </div>
                  </Button>
                  <Button
                    variant={exportType === 'timeline' ? 'default' : 'outline'}
                    onClick={() => setExportType('timeline')}
                    className="w-full justify-start"
                  >
                    <div className="text-left">
                      <div className="font-semibold">Linha do Tempo</div>
                      <div className="text-xs opacity-75">Progressão follow-up</div>
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fields Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Campos a Exportar</CardTitle>
              <CardDescription>
                Selecione quais categorias de dados deseja incluir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="field-basicos"
                    checked={selectedFields.dadosBasicos}
                    onCheckedChange={() => toggleField('dadosBasicos')}
                  />
                  <Label htmlFor="field-basicos" className="cursor-pointer font-normal">
                    <div className="font-semibold">Dados Básicos</div>
                    <div className="text-xs text-gray-500">Idade, sexo, identificação</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="field-cirurgicos"
                    checked={selectedFields.dadosCirurgicos}
                    onCheckedChange={() => toggleField('dadosCirurgicos')}
                  />
                  <Label htmlFor="field-cirurgicos" className="cursor-pointer font-normal">
                    <div className="font-semibold">Dados Cirúrgicos</div>
                    <div className="text-xs text-gray-500">Tipo, técnica, anestesia</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="field-comorbidades"
                    checked={selectedFields.comorbidades}
                    onCheckedChange={() => toggleField('comorbidades')}
                  />
                  <Label htmlFor="field-comorbidades" className="cursor-pointer font-normal">
                    <div className="font-semibold">Comorbidades</div>
                    <div className="text-xs text-gray-500">Condições pré-existentes</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="field-medicacoes"
                    checked={selectedFields.medicacoes}
                    onCheckedChange={() => toggleField('medicacoes')}
                  />
                  <Label htmlFor="field-medicacoes" className="cursor-pointer font-normal">
                    <div className="font-semibold">Medicações</div>
                    <div className="text-xs text-gray-500">Medicamentos em uso</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="field-followups"
                    checked={selectedFields.followUps}
                    onCheckedChange={() => toggleField('followUps')}
                  />
                  <Label htmlFor="field-followups" className="cursor-pointer font-normal">
                    <div className="font-semibold">Follow-ups</div>
                    <div className="text-xs text-gray-500">Status de acompanhamento</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="field-questionarios"
                    checked={selectedFields.respostasQuestionarios}
                    onCheckedChange={() => toggleField('respostasQuestionarios')}
                  />
                  <Label htmlFor="field-questionarios" className="cursor-pointer font-normal">
                    <div className="font-semibold">Respostas dos Questionários</div>
                    <div className="text-xs text-gray-500">Dor, sintomas, NPS</div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 md:col-span-2">
                  <Checkbox
                    id="field-ia"
                    checked={selectedFields.analiseIA}
                    onCheckedChange={() => toggleField('analiseIA')}
                  />
                  <Label htmlFor="field-ia" className="cursor-pointer font-normal">
                    <div className="font-semibold">Análises de IA</div>
                    <div className="text-xs text-gray-500">Alertas e análises do Claude AI</div>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Range Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Filtro de Período (Opcional)</CardTitle>
              <CardDescription>
                Filtrar cirurgias por intervalo de datas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-date-filter"
                  checked={useDateFilter}
                  onCheckedChange={(checked) => setUseDateFilter(checked as boolean)}
                />
                <Label htmlFor="use-date-filter" className="cursor-pointer">
                  Aplicar filtro de datas
                </Label>
              </div>

              {useDateFilter && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Data Início</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">Data Fim</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Option */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Opções de Envio
              </CardTitle>
              <CardDescription>
                Escolha como deseja receber a exportação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send-email"
                  checked={sendEmail}
                  onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                />
                <Label htmlFor="send-email" className="cursor-pointer">
                  Enviar por e-mail (recomendado para arquivos grandes)
                </Label>
              </div>

              {sendEmail && (
                <div className="space-y-2">
                  <Label htmlFor="email">Endereço de E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export Format Info */}
          {exportFormat === 'xlsx' && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Estrutura do Arquivo Excel</CardTitle>
              </CardHeader>
              <CardContent className="text-blue-800 space-y-2">
                <p className="font-medium">O arquivo Excel conterá as seguintes abas:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {exportType === 'individual' && (
                    <li><strong>Dados Brutos:</strong> Uma linha por paciente com todos os campos selecionados</li>
                  )}
                  {exportType === 'comparative' && (
                    <li><strong>Comparação de Grupos:</strong> Dados organizados por grupo para análise comparativa</li>
                  )}
                  {exportType === 'statistical' && (
                    <li><strong>Estatísticas:</strong> Médias, desvios-padrão e testes estatísticos por grupo</li>
                  )}
                  {exportType === 'timeline' && (
                    <li><strong>Timeline:</strong> Progressão dos pacientes ao longo do follow-up</li>
                  )}
                  <li><strong>Resumo da Pesquisa:</strong> Informações gerais e metadados</li>
                  <li><strong>Glossário:</strong> Descrição dos campos e códigos utilizados</li>
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePreview}
              disabled={isExporting || !selectedResearch || selectedGroups.length === 0}
            >
              <Eye className="h-5 w-5 mr-2" />
              Visualizar Preview
            </Button>
            <Button
              size="lg"
              onClick={handleExport}
              disabled={isExporting || !selectedResearch || selectedGroups.length === 0}
              className="min-w-48"
              style={{ backgroundColor: '#0A2647', color: 'white' }}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Exportar Dados
                </>
              )}
            </Button>
          </div>

          {/* Preview Modal */}
          {showPreview && previewData && (
            <Card className="border-2 border-green-500 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900">Preview da Exportação</CardTitle>
                <CardDescription>
                  Resumo dos dados que serão exportados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white rounded border">
                      <p className="text-2xl font-bold text-green-700">{previewData.totalPatients}</p>
                      <p className="text-sm text-gray-600">Pacientes</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded border">
                      <p className="text-2xl font-bold text-green-700">{previewData.totalSurgeries}</p>
                      <p className="text-sm text-gray-600">Cirurgias</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded border">
                      <p className="text-2xl font-bold text-green-700">{previewData.totalFollowUps}</p>
                      <p className="text-sm text-gray-600">Follow-ups</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(false)}
                    className="w-full"
                  >
                    Fechar Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
