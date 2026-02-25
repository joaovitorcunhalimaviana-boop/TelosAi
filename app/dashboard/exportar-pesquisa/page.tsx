/* eslint-disable @typescript-eslint/no-explicit-any */
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
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0B0E14' }}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: '#14BDAE' }} />
          <p style={{ color: '#7A8299' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl" style={{ backgroundColor: '#0B0E14' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3" style={{ color: '#F0EAD6' }}>
          <FlaskConical className="h-10 w-10" style={{ color: '#14BDAE' }} />
          Exportação de Dados de Pesquisa
        </h1>
        <p style={{ color: '#7A8299' }}>
          Configure e exporte dados de suas pesquisas científicas em diversos formatos
        </p>
      </div>

      {/* No Research Warning */}
      {researches.length === 0 && (
        <Card style={{ backgroundColor: '#1A1A0E', borderColor: '#3A3A1E', borderWidth: '2px' }}>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FlaskConical className="h-16 w-16 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#D8DEEB' }}>
              Nenhuma pesquisa encontrada
            </h3>
            <p className="mb-6" style={{ color: '#7A8299' }}>
              Você precisa criar uma pesquisa antes de exportar dados
            </p>
            <Button
              onClick={() => router.push('/dashboard/pesquisas')}
              style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}
            >
              Ir para Pesquisas
            </Button>
          </CardContent>
        </Card>
      )}

      {researches.length > 0 && (
        <div className="grid gap-6">
          {/* Research Selection */}
          <Card style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: '#F0EAD6' }}>
                <Database className="h-5 w-5" style={{ color: '#14BDAE' }} />
                Seleção de Pesquisa
              </CardTitle>
              <CardDescription style={{ color: '#7A8299' }}>
                Escolha a pesquisa que deseja exportar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="research-select" style={{ color: '#D8DEEB' }}>Pesquisa</Label>
                  <Select value={selectedResearch} onValueChange={setSelectedResearch}>
                    <SelectTrigger id="research-select" style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}>
                      <SelectValue placeholder="Selecione uma pesquisa" />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
                      {researches.map((research) => (
                        <SelectItem key={research.id} value={research.id} style={{ color: '#D8DEEB' }}>
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
                  <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#161B27', border: '1px solid #0D7377' }}>
                    <h4 className="font-semibold mb-2" style={{ color: '#14BDAE' }}>Detalhes da Pesquisa</h4>
                    <p className="text-sm mb-2" style={{ color: '#D8DEEB' }}>{selectedResearchData.description}</p>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <Users className="h-5 w-5 mx-auto mb-1" style={{ color: '#14BDAE' }} />
                        <p className="text-lg font-bold" style={{ color: '#F0EAD6' }}>{selectedResearchData.totalPatients}</p>
                        <p className="text-xs" style={{ color: '#7A8299' }}>Pacientes</p>
                      </div>
                      <div className="text-center">
                        <BarChart3 className="h-5 w-5 mx-auto mb-1" style={{ color: '#14BDAE' }} />
                        <p className="text-lg font-bold" style={{ color: '#F0EAD6' }}>{selectedResearchData.groups.length}</p>
                        <p className="text-xs" style={{ color: '#7A8299' }}>Grupos</p>
                      </div>
                      <div className="text-center">
                        <Calendar className="h-5 w-5 mx-auto mb-1" style={{ color: '#14BDAE' }} />
                        <p className="text-lg font-bold" style={{ color: '#F0EAD6' }}>
                          {new Date(selectedResearchData.startDate).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs" style={{ color: '#7A8299' }}>Início</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Group Selection */}
          {selectedResearchData && (
            <Card style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2" style={{ color: '#F0EAD6' }}>
                      <Users className="h-5 w-5" style={{ color: '#14BDAE' }} />
                      Seleção de Grupos
                    </CardTitle>
                    <CardDescription style={{ color: '#7A8299' }}>
                      Escolha os grupos que deseja incluir na exportação
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAllGroups}
                    style={{ borderColor: '#1E2535', color: '#D8DEEB' }}
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
                      className="p-4 border-2 rounded-lg cursor-pointer transition-all"
                      style={{
                        borderColor: selectedGroups.includes(group.id) ? '#0D7377' : '#1E2535',
                        backgroundColor: selectedGroups.includes(group.id) ? '#0D73771A' : '#161B27'
                      }}
                      onClick={() => toggleGroup(group.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedGroups.includes(group.id)}
                          onCheckedChange={() => toggleGroup(group.id)}
                        />
                        <div className="flex-1">
                          <div className="font-semibold mb-1" style={{ color: '#F0EAD6' }}>
                            Grupo {group.groupCode}: {group.groupName}
                          </div>
                          <p className="text-sm mb-2" style={{ color: '#7A8299' }}>{group.description}</p>
                          <Badge variant="outline" className="text-xs" style={{ borderColor: '#1E2535', color: '#D8DEEB' }}>
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
          <Card style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
            <CardHeader>
              <CardTitle style={{ color: '#F0EAD6' }}>Opções de Exportação</CardTitle>
              <CardDescription style={{ color: '#7A8299' }}>
                Configure o formato e tipo de exportação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Format Selection */}
              <div className="space-y-2">
                <Label htmlFor="format" style={{ color: '#D8DEEB' }}>Formato de Exportação</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={exportFormat === 'xlsx' ? 'default' : 'outline'}
                    onClick={() => setExportFormat('xlsx')}
                    className="w-full"
                    style={exportFormat === 'xlsx' ? { backgroundColor: '#0D7377', color: '#F0EAD6' } : { borderColor: '#1E2535', color: '#D8DEEB' }}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel (.xlsx)
                  </Button>
                  <Button
                    variant={exportFormat === 'csv' ? 'default' : 'outline'}
                    onClick={() => setExportFormat('csv')}
                    className="w-full"
                    style={exportFormat === 'csv' ? { backgroundColor: '#0D7377', color: '#F0EAD6' } : { borderColor: '#1E2535', color: '#D8DEEB' }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                    onClick={() => setExportFormat('pdf')}
                    className="w-full"
                    style={exportFormat === 'pdf' ? { backgroundColor: '#0D7377', color: '#F0EAD6' } : { borderColor: '#1E2535', color: '#D8DEEB' }}
                  >
                    <File className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>

              <Separator style={{ backgroundColor: '#1E2535' }} />

              {/* Export Type */}
              <div className="space-y-2">
                <Label style={{ color: '#D8DEEB' }}>Tipo de Exportação</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(['individual', 'comparative', 'statistical', 'timeline'] as const).map((type) => {
                    const labels: Record<string, { title: string; desc: string }> = {
                      individual: { title: 'Dados Individuais', desc: 'Uma linha por paciente' },
                      comparative: { title: 'Comparativo', desc: 'Grupos lado a lado' },
                      statistical: { title: 'Resumo Estatístico', desc: 'Médias e análises' },
                      timeline: { title: 'Linha do Tempo', desc: 'Progressão follow-up' },
                    };
                    return (
                      <Button
                        key={type}
                        variant={exportType === type ? 'default' : 'outline'}
                        onClick={() => setExportType(type)}
                        className="w-full justify-start"
                        style={exportType === type ? { backgroundColor: '#0D7377', color: '#F0EAD6' } : { borderColor: '#1E2535', color: '#D8DEEB' }}
                      >
                        <div className="text-left">
                          <div className="font-semibold">{labels[type].title}</div>
                          <div className="text-xs opacity-75">{labels[type].desc}</div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fields Selection */}
          <Card style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
            <CardHeader>
              <CardTitle style={{ color: '#F0EAD6' }}>Campos a Exportar</CardTitle>
              <CardDescription style={{ color: '#7A8299' }}>
                Selecione quais categorias de dados deseja incluir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'dadosBasicos', label: 'Dados Básicos', desc: 'Idade, sexo, identificação' },
                  { key: 'dadosCirurgicos', label: 'Dados Cirúrgicos', desc: 'Tipo, técnica, anestesia' },
                  { key: 'comorbidades', label: 'Comorbidades', desc: 'Condições pré-existentes' },
                  { key: 'medicacoes', label: 'Medicações', desc: 'Medicamentos em uso' },
                  { key: 'followUps', label: 'Follow-ups', desc: 'Status de acompanhamento' },
                  { key: 'respostasQuestionarios', label: 'Respostas dos Questionários', desc: 'Dor, sintomas, NPS' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`field-${key}`}
                      checked={selectedFields[key as keyof typeof selectedFields]}
                      onCheckedChange={() => toggleField(key as keyof typeof selectedFields)}
                    />
                    <Label htmlFor={`field-${key}`} className="cursor-pointer font-normal">
                      <div className="font-semibold" style={{ color: '#D8DEEB' }}>{label}</div>
                      <div className="text-xs" style={{ color: '#7A8299' }}>{desc}</div>
                    </Label>
                  </div>
                ))}

                <div className="flex items-center space-x-2 md:col-span-2">
                  <Checkbox
                    id="field-ia"
                    checked={selectedFields.analiseIA}
                    onCheckedChange={() => toggleField('analiseIA')}
                  />
                  <Label htmlFor="field-ia" className="cursor-pointer font-normal">
                    <div className="font-semibold" style={{ color: '#D8DEEB' }}>Análises de IA</div>
                    <div className="text-xs" style={{ color: '#7A8299' }}>Alertas e análises do Claude AI</div>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Range Filter */}
          <Card style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
            <CardHeader>
              <CardTitle style={{ color: '#F0EAD6' }}>Filtro de Período (Opcional)</CardTitle>
              <CardDescription style={{ color: '#7A8299' }}>Filtrar cirurgias por intervalo de datas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-date-filter"
                  checked={useDateFilter}
                  onCheckedChange={(checked) => setUseDateFilter(checked as boolean)}
                />
                <Label htmlFor="use-date-filter" className="cursor-pointer" style={{ color: '#D8DEEB' }}>
                  Aplicar filtro de datas
                </Label>
              </div>

              {useDateFilter && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="start-date" style={{ color: '#D8DEEB' }}>Data Início</Label>
                    <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date" style={{ color: '#D8DEEB' }}>Data Fim</Label>
                    <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Option */}
          <Card style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: '#F0EAD6' }}>
                <Mail className="h-5 w-5" style={{ color: '#14BDAE' }} />
                Opções de Envio
              </CardTitle>
              <CardDescription style={{ color: '#7A8299' }}>Escolha como deseja receber a exportação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="send-email" checked={sendEmail} onCheckedChange={(checked) => setSendEmail(checked as boolean)} />
                <Label htmlFor="send-email" className="cursor-pointer" style={{ color: '#D8DEEB' }}>
                  Enviar por e-mail (recomendado para arquivos grandes)
                </Label>
              </div>

              {sendEmail && (
                <div className="space-y-2">
                  <Label htmlFor="email" style={{ color: '#D8DEEB' }}>Endereço de E-mail</Label>
                  <Input id="email" type="email" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} placeholder="seu@email.com" style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export Format Info */}
          {exportFormat === 'xlsx' && (
            <Card style={{ backgroundColor: '#0D73771A', borderColor: '#0D7377' }}>
              <CardHeader>
                <CardTitle style={{ color: '#14BDAE' }}>Estrutura do Arquivo Excel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2" style={{ color: '#D8DEEB' }}>
                <p className="font-medium">O arquivo Excel conterá as seguintes abas:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {exportType === 'individual' && <li><strong>Dados Brutos:</strong> Uma linha por paciente com todos os campos selecionados</li>}
                  {exportType === 'comparative' && <li><strong>Comparação de Grupos:</strong> Dados organizados por grupo para análise comparativa</li>}
                  {exportType === 'statistical' && <li><strong>Estatísticas:</strong> Médias, desvios-padrão e testes estatísticos por grupo</li>}
                  {exportType === 'timeline' && <li><strong>Timeline:</strong> Progressão dos pacientes ao longo do follow-up</li>}
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
              style={{ borderColor: '#1E2535', color: '#D8DEEB' }}
            >
              <Eye className="h-5 w-5 mr-2" />
              Visualizar Preview
            </Button>
            <Button
              size="lg"
              onClick={handleExport}
              disabled={isExporting || !selectedResearch || selectedGroups.length === 0}
              className="min-w-48"
              style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}
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
            <Card style={{ backgroundColor: '#111520', borderColor: '#0D7377', borderWidth: '2px' }}>
              <CardHeader>
                <CardTitle style={{ color: '#14BDAE' }}>Preview da Exportação</CardTitle>
                <CardDescription style={{ color: '#7A8299' }}>Resumo dos dados que serão exportados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Pacientes', value: previewData.totalPatients },
                      { label: 'Cirurgias', value: previewData.totalSurgeries },
                      { label: 'Follow-ups', value: previewData.totalFollowUps },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center p-3 rounded" style={{ backgroundColor: '#161B27', border: '1px solid #1E2535' }}>
                        <p className="text-2xl font-bold" style={{ color: '#14BDAE' }}>{value}</p>
                        <p className="text-sm" style={{ color: '#7A8299' }}>{label}</p>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(false)}
                    className="w-full"
                    style={{ borderColor: '#1E2535', color: '#D8DEEB' }}
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
