'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Download, FileSpreadsheet, FileText, Database, ShieldCheck, BookOpen } from 'lucide-react';
import { SURGERY_TYPE_LABELS } from '@/lib/constants/surgery-types';

export default function ExportarPage() {
  // Estados dos filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [surgeryTypes, setSurgeryTypes] = useState<string[]>([]);
  const [onlyComplete, setOnlyComplete] = useState(false);
  const [anonymize, setAnonymize] = useState(true);
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');

  // Estados dos campos a exportar
  const [fields, setFields] = useState({
    demographic: true,
    comorbidities: true,
    surgeryDetails: true,
    painTrajectory: true,
    complications: true,
    nps: true,
    identifiable: false,
  });

  // Estado de loading
  const [isExporting, setIsExporting] = useState(false);

  // Tipos de cirurgia disponíveis
  const surgeryTypeOptions = [
    { value: 'hemorroidectomia', label: SURGERY_TYPE_LABELS['hemorroidectomia'] || 'Hemorroidectomia' },
    { value: 'fistula', label: SURGERY_TYPE_LABELS['fistula'] || 'Fístula Anal' },
    { value: 'fissura', label: SURGERY_TYPE_LABELS['fissurectomia'] || 'Fissurectomia' },
    { value: 'pilonidal', label: SURGERY_TYPE_LABELS['pilonidal'] || 'Doença Pilonidal' },
  ];

  // Toggle tipo de cirurgia
  const toggleSurgeryType = (type: string) => {
    setSurgeryTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Toggle campo de exportação
  const toggleField = (field: keyof typeof fields) => {
    setFields(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Função de exportação
  const handleExport = async () => {
    // Validações
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error('Data de início deve ser anterior à data de fim');
      return;
    }

    if (!Object.values(fields).some(v => v)) {
      toast.error('Selecione pelo menos um campo para exportar');
      return;
    }

    setIsExporting(true);

    try {
      const exportFilters = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        surgeryTypes: surgeryTypes.length > 0 ? surgeryTypes : undefined,
        onlyComplete,
        anonymize,
        format,
        fields,
      };

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportFilters),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao exportar dados');
      }

      // Criar blob e fazer download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Obter nome do arquivo do header
      const contentDisposition = response.headers.get('Content-Disposition');
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `exportacao_${format === 'xlsx' ? 'excel' : 'csv'}_${new Date().toISOString().split('T')[0]}.${format}`;

      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Dados exportados com sucesso!');
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao exportar dados');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div id="export-page" className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2" style={{ color: '#F0EAD6' }}>
          <Database className="h-8 w-8" style={{ color: '#14BDAE' }} />
          Exportação de Dados para Pesquisa
        </h1>
        <p style={{ color: '#7A8299' }}>
          Configure os filtros e campos desejados para exportar dados em formato Excel ou CSV
        </p>
      </div>

      <div className="grid gap-6">
        {/* Filtros de Período */}
        <Card className="border-0" style={{ backgroundColor: '#111520', boxShadow: '0 0 0 1px #1E2535' }}>
          <CardHeader style={{ borderBottom: '1px solid #1E2535' }}>
            <CardTitle style={{ color: '#F0EAD6' }}>Período</CardTitle>
            <CardDescription style={{ color: '#7A8299' }}>
              Filtrar cirurgias por intervalo de datas
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" style={{ color: '#D8DEEB' }}>Data Início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" style={{ color: '#D8DEEB' }}>Data Fim</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tipo de Cirurgia */}
        <Card className="border-0" style={{ backgroundColor: '#111520', boxShadow: '0 0 0 1px #1E2535' }}>
          <CardHeader style={{ borderBottom: '1px solid #1E2535' }}>
            <CardTitle style={{ color: '#F0EAD6' }}>Tipo de Cirurgia</CardTitle>
            <CardDescription style={{ color: '#7A8299' }}>
              Selecione os tipos de cirurgia a incluir (deixe vazio para incluir todos)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {surgeryTypeOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`surgery-${option.value}`}
                    checked={surgeryTypes.includes(option.value)}
                    onCheckedChange={() => toggleSurgeryType(option.value)}
                  />
                  <Label
                    htmlFor={`surgery-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                    style={{ color: '#D8DEEB' }}
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Opções de Exportação */}
        <Card className="border-0" data-tutorial="export-options" style={{ backgroundColor: '#111520', boxShadow: '0 0 0 1px #1E2535' }}>
          <CardHeader style={{ borderBottom: '1px solid #1E2535' }}>
            <CardTitle style={{ color: '#F0EAD6' }}>Opções de Exportação</CardTitle>
            <CardDescription style={{ color: '#7A8299' }}>
              Configure as opções de privacidade e formato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="onlyComplete"
                checked={onlyComplete}
                onCheckedChange={(checked) => setOnlyComplete(checked as boolean)}
              />
              <Label
                htmlFor="onlyComplete"
                className="text-sm font-normal cursor-pointer"
                style={{ color: '#D8DEEB' }}
              >
                Apenas dados completos (80% ou mais de preenchimento)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymize"
                checked={anonymize}
                onCheckedChange={(checked) => {
                  const isAnonymized = checked as boolean;
                  setAnonymize(isAnonymized);
                  // Se anonimizar, desabilitar dados identificáveis
                  if (isAnonymized) {
                    setFields(prev => ({ ...prev, identifiable: false }));
                  }
                }}
              />
              <Label
                htmlFor="anonymize"
                className="text-sm font-normal cursor-pointer flex items-center gap-2"
                style={{ color: '#D8DEEB' }}
              >
                <ShieldCheck className="h-4 w-4" style={{ color: '#14BDAE' }} />
                Anonimizar dados (recomendado para pesquisa)
              </Label>
            </div>

            <Separator style={{ backgroundColor: '#1E2535' }} />

            <div className="space-y-2" data-tutorial="export-format">
              <Label htmlFor="format" style={{ color: '#D8DEEB' }}>Formato de Exportação</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={format}
                  onValueChange={(value) => setFormat(value as 'xlsx' | 'csv')}
                >
                  <SelectTrigger id="format" className="w-full md:w-64" style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}>
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
                    <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                  </SelectContent>
                </Select>
                {format === 'xlsx' ? (
                  <FileSpreadsheet className="h-5 w-5" style={{ color: '#7A8299' }} />
                ) : (
                  <FileText className="h-5 w-5" style={{ color: '#7A8299' }} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campos a Exportar */}
        <Card className="border-0" style={{ backgroundColor: '#111520', boxShadow: '0 0 0 1px #1E2535' }}>
          <CardHeader style={{ borderBottom: '1px solid #1E2535' }}>
            <CardTitle style={{ color: '#F0EAD6' }}>Campos a Exportar</CardTitle>
            <CardDescription style={{ color: '#7A8299' }}>
              Selecione quais categorias de dados deseja incluir na exportação
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-demographic"
                  checked={fields.demographic}
                  onCheckedChange={() => toggleField('demographic')}
                />
                <Label
                  htmlFor="field-demographic"
                  className="text-sm font-normal cursor-pointer"
                  style={{ color: '#D8DEEB' }}
                >
                  Dados demográficos (idade, sexo)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-comorbidities"
                  checked={fields.comorbidities}
                  onCheckedChange={() => toggleField('comorbidities')}
                />
                <Label
                  htmlFor="field-comorbidities"
                  className="text-sm font-normal cursor-pointer"
                  style={{ color: '#D8DEEB' }}
                >
                  Comorbidades
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-surgeryDetails"
                  checked={fields.surgeryDetails}
                  onCheckedChange={() => toggleField('surgeryDetails')}
                />
                <Label
                  htmlFor="field-surgeryDetails"
                  className="text-sm font-normal cursor-pointer"
                  style={{ color: '#D8DEEB' }}
                >
                  Detalhes cirúrgicos
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-painTrajectory"
                  checked={fields.painTrajectory}
                  onCheckedChange={() => toggleField('painTrajectory')}
                />
                <Label
                  htmlFor="field-painTrajectory"
                  className="text-sm font-normal cursor-pointer"
                  style={{ color: '#D8DEEB' }}
                >
                  Trajetória de dor (D+1 a D+14)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-complications"
                  checked={fields.complications}
                  onCheckedChange={() => toggleField('complications')}
                />
                <Label
                  htmlFor="field-complications"
                  className="text-sm font-normal cursor-pointer"
                  style={{ color: '#D8DEEB' }}
                >
                  Complicações
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-nps"
                  checked={fields.nps}
                  onCheckedChange={() => toggleField('nps')}
                />
                <Label
                  htmlFor="field-nps"
                  className="text-sm font-normal cursor-pointer"
                  style={{ color: '#D8DEEB' }}
                >
                  Net Promoter Score (NPS)
                </Label>
              </div>

              <div className="flex items-center space-x-2 md:col-span-2">
                <Checkbox
                  id="field-identifiable"
                  checked={fields.identifiable}
                  disabled={anonymize}
                  onCheckedChange={() => toggleField('identifiable')}
                />
                <Label
                  htmlFor="field-identifiable"
                  className={`text-sm font-normal cursor-pointer ${anonymize ? 'opacity-50' : ''
                    }`}
                  style={{ color: '#D8DEEB' }}
                >
                  Dados identificáveis (nome, CPF, telefone)
                  {anonymize && ' - Desabilitado quando anonimizado'}
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações sobre o formato Excel */}
        {format === 'xlsx' && (
          <Card className="border-0" style={{ backgroundColor: 'rgba(13, 115, 119, 0.08)', boxShadow: '0 0 0 1px rgba(13, 115, 119, 0.2)' }}>
            <CardHeader>
              <CardTitle style={{ color: '#14BDAE' }}>
                Estrutura do Arquivo Excel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2" style={{ color: '#D8DEEB' }}>
              <p className="font-medium">O arquivo Excel terá as seguintes abas:</p>
              <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: '#7A8299' }}>
                <li>
                  <strong style={{ color: '#D8DEEB' }}>Dados Brutos:</strong> Uma linha por paciente/cirurgia com todos os campos selecionados
                </li>
                <li>
                  <strong style={{ color: '#D8DEEB' }}>Estatísticas:</strong> Estatísticas descritivas (médias, desvios-padrão, frequências)
                </li>
                {fields.painTrajectory && (
                  <li>
                    <strong style={{ color: '#D8DEEB' }}>Trajetória de Dor:</strong> Matriz paciente x dia (D+1 a D+14)
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Citação Sugerida */}
        <Card className="border-0" data-tutorial="apa-citation" style={{ backgroundColor: '#161B27', boxShadow: '0 0 0 1px #1E2535' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2" style={{ color: '#D8DEEB' }}>
              <BookOpen className="h-4 w-4" style={{ color: '#14BDAE' }} />
              Citação Sugerida (APA 7th)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-sm p-2 rounded border block" style={{ color: '#D8DEEB', backgroundColor: '#111520', borderColor: '#1E2535' }}>
              Viana, J. V. (2025). <em>Dados Clínicos de Acompanhamento Pós-Operatório</em> [Base de dados]. VigIA.
            </code>
          </CardContent>
        </Card>

        {/* Botão de Exportação */}
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleExport}
            disabled={isExporting}
            className="min-w-48"
            data-tutorial="download-btn"
            style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}
          >
            <Download className="h-5 w-5 mr-2" />
            {isExporting ? 'Exportando...' : 'Exportar Dados'}
          </Button>
        </div>
      </div>
    </div>
  );
}
