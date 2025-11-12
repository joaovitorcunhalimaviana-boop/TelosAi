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
import { Download, FileSpreadsheet, FileText, Database, ShieldCheck } from 'lucide-react';

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
    { value: 'hemorroidectomia', label: 'Hemorroidectomia' },
    { value: 'fistula', label: 'Fístula Anal' },
    { value: 'fissura', label: 'Fissura Anal' },
    { value: 'pilonidal', label: 'Doença Pilonidal' },
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
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Database className="h-8 w-8" />
          Exportação de Dados para Pesquisa
        </h1>
        <p className="text-muted-foreground">
          Configure os filtros e campos desejados para exportar dados em formato Excel ou CSV
        </p>
      </div>

      <div className="grid gap-6">
        {/* Filtros de Período */}
        <Card>
          <CardHeader>
            <CardTitle>Período</CardTitle>
            <CardDescription>
              Filtrar cirurgias por intervalo de datas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data Início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Data Fim</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tipo de Cirurgia */}
        <Card>
          <CardHeader>
            <CardTitle>Tipo de Cirurgia</CardTitle>
            <CardDescription>
              Selecione os tipos de cirurgia a incluir (deixe vazio para incluir todos)
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Opções de Exportação */}
        <Card>
          <CardHeader>
            <CardTitle>Opções de Exportação</CardTitle>
            <CardDescription>
              Configure as opções de privacidade e formato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="onlyComplete"
                checked={onlyComplete}
                onCheckedChange={(checked) => setOnlyComplete(checked as boolean)}
              />
              <Label
                htmlFor="onlyComplete"
                className="text-sm font-normal cursor-pointer"
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
              >
                <ShieldCheck className="h-4 w-4" />
                Anonimizar dados (recomendado para pesquisa)
              </Label>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="format">Formato de Exportação</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={format}
                  onValueChange={(value) => setFormat(value as 'xlsx' | 'csv')}
                >
                  <SelectTrigger id="format" className="w-full md:w-64">
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                  </SelectContent>
                </Select>
                {format === 'xlsx' ? (
                  <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <FileText className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campos a Exportar */}
        <Card>
          <CardHeader>
            <CardTitle>Campos a Exportar</CardTitle>
            <CardDescription>
              Selecione quais categorias de dados deseja incluir na exportação
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  className={`text-sm font-normal cursor-pointer ${
                    anonymize ? 'opacity-50' : ''
                  }`}
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
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-blue-100">
                Estrutura do Arquivo Excel
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800 dark:text-blue-200 space-y-2">
              <p className="font-medium">O arquivo Excel terá as seguintes abas:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>Dados Brutos:</strong> Uma linha por paciente/cirurgia com todos os campos selecionados
                </li>
                <li>
                  <strong>Estatísticas:</strong> Estatísticas descritivas (médias, desvios-padrão, frequências)
                </li>
                {fields.painTrajectory && (
                  <li>
                    <strong>Trajetória de Dor:</strong> Matriz paciente x dia (D+1 a D+14)
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Botão de Exportação */}
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleExport}
            disabled={isExporting}
            className="min-w-48"
          >
            <Download className="h-5 w-5 mr-2" />
            {isExporting ? 'Exportando...' : 'Exportar Dados'}
          </Button>
        </div>
      </div>
    </div>
  );
}
