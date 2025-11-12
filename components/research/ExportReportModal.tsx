'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  FileText,
  File,
  Download,
  Settings,
  CheckCircle2,
  Loader2,
  Eye,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import { getAllTemplates, ExportTemplate, TemplateType } from '@/lib/export-templates';
import { Packer } from 'docx';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ExportReportModalProps {
  researchId: string;
  researchTitle: string;
  trigger?: React.ReactNode;
  onExportComplete?: (filename: string) => void;
}

export interface ExportConfiguration {
  format: 'docx' | 'pdf';
  template: string;
  sections: {
    anova: boolean;
    chiSquare: boolean;
    regression: boolean;
    survival: boolean;
    rawData: boolean;
    demographics: boolean;
  };
  style: 'apa' | 'vancouver' | 'custom';
  includeCharts: boolean;
  chartResolution: 'standard' | 'high' | 'print';
  anonymize: boolean;
  language: 'pt' | 'en';
}

// ============================================
// COMPONENT
// ============================================

export default function ExportReportModal({
  researchId,
  researchTitle,
  trigger,
  onExportComplete,
}: ExportReportModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'format' | 'content' | 'style'>('format');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // Configuration state
  const [config, setConfig] = useState<ExportConfiguration>({
    format: 'docx',
    template: 'publication-full',
    sections: {
      anova: true,
      chiSquare: true,
      regression: true,
      survival: true,
      rawData: false,
      demographics: true,
    },
    style: 'apa',
    includeCharts: true,
    chartResolution: 'print',
    anonymize: true,
    language: 'pt',
  });

  const templates = getAllTemplates();
  const selectedTemplate = templates.find((t) => t.id === config.template);

  // Update template when format changes
  useEffect(() => {
    if (config.format === 'pdf' && config.template === 'publication-full') {
      setConfig((prev) => ({ ...prev, template: 'progress-report' }));
    }
  }, [config.format]);

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Call export API
      const response = await fetch('/api/export-research/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          researchId,
          config,
        }),
      });

      clearInterval(progressInterval);
      setExportProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao gerar relatório');
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const extension = config.format === 'docx' ? 'docx' : 'pdf';
      const templateName = selectedTemplate?.name.replace(/\s/g, '_') || 'report';
      const filename = `${researchTitle.replace(/\s/g, '_')}_${templateName}_${new Date().toISOString().split('T')[0]}.${extension}`;

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`Relatório exportado com sucesso: ${filename}`);

      if (onExportComplete) {
        onExportComplete(filename);
      }

      setTimeout(() => {
        setOpen(false);
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao exportar relatório');
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
    toast.info('Gerando preview...', { duration: 1000 });
  };

  const updateSection = (section: keyof ExportConfiguration['sections'], value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: value,
      },
    }));
  };

  const selectAllSections = () => {
    setConfig((prev) => ({
      ...prev,
      sections: {
        anova: true,
        chiSquare: true,
        regression: true,
        survival: true,
        rawData: true,
        demographics: true,
      },
    }));
  };

  const deselectAllSections = () => {
    setConfig((prev) => ({
      ...prev,
      sections: {
        anova: false,
        chiSquare: false,
        regression: false,
        survival: false,
        rawData: false,
        demographics: false,
      },
    }));
  };

  const getSelectedSectionsCount = () => {
    return Object.values(config.sections).filter(Boolean).length;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="lg">
            <Download className="mr-2 h-5 w-5" />
            Exportar Relatório
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Exportar Relatório de Pesquisa
          </DialogTitle>
          <DialogDescription>
            Configure o formato e conteúdo do relatório para exportação profissional
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="format" className="flex items-center gap-2">
              <File className="h-4 w-4" />
              Formato
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Conteúdo
            </TabsTrigger>
            <TabsTrigger value="style" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Estilo
            </TabsTrigger>
          </TabsList>

          {/* FORMAT TAB */}
          <TabsContent value="format" className="space-y-6">
            {/* Export Format */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Formato de Exportação</Label>
              <RadioGroup
                value={config.format}
                onValueChange={(value) => setConfig({ ...config, format: value as 'docx' | 'pdf' })}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                      config.format === 'docx'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setConfig({ ...config, format: 'docx' })}
                  >
                    <RadioGroupItem value="docx" id="format-docx" />
                    <div className="flex-1">
                      <Label
                        htmlFor="format-docx"
                        className="cursor-pointer font-semibold flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Word (.docx)
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Documento editável com formatação APA. Ideal para manuscritos científicos.
                      </p>
                      <Badge variant="outline" className="mt-2">
                        Recomendado para publicações
                      </Badge>
                    </div>
                  </div>

                  <div
                    className={`flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                      config.format === 'pdf'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setConfig({ ...config, format: 'pdf' })}
                  >
                    <RadioGroupItem value="pdf" id="format-pdf" />
                    <div className="flex-1">
                      <Label
                        htmlFor="format-pdf"
                        className="cursor-pointer font-semibold flex items-center gap-2"
                      >
                        <File className="h-4 w-4" />
                        PDF
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Documento fixo com layout profissional. Ideal para compartilhamento.
                      </p>
                      <Badge variant="outline" className="mt-2">
                        Pronto para impressão
                      </Badge>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* Template Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Tipo de Relatório</Label>
              <Select value={config.template} onValueChange={(value) => setConfig({ ...config, template: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{template.name}</span>
                        <span className="text-xs text-gray-500">{template.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedTemplate && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">{selectedTemplate.name}</h4>
                  <p className="text-sm text-blue-800 mb-3">{selectedTemplate.description}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-blue-900">Seções incluídas:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.sections.slice(0, 5).map((section) => (
                        <Badge key={section.id} variant="secondary" className="text-xs">
                          {section.title}
                        </Badge>
                      ))}
                      {selectedTemplate.sections.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{selectedTemplate.sections.length - 5} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* CONTENT TAB */}
          <TabsContent value="content" className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Selecionar Seções</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllSections}>
                  Selecionar Todas
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllSections}>
                  Limpar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* ANOVA Results */}
              <div
                className={`flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  config.sections.anova ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => updateSection('anova', !config.sections.anova)}
              >
                <Checkbox
                  id="section-anova"
                  checked={config.sections.anova}
                  onCheckedChange={(checked) => updateSection('anova', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="section-anova" className="cursor-pointer font-semibold">
                    Resultados ANOVA
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Análise de variância entre grupos, testes post-hoc e tamanhos de efeito
                  </p>
                </div>
              </div>

              {/* Chi-Square Analysis */}
              <div
                className={`flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  config.sections.chiSquare ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => updateSection('chiSquare', !config.sections.chiSquare)}
              >
                <Checkbox
                  id="section-chisquare"
                  checked={config.sections.chiSquare}
                  onCheckedChange={(checked) => updateSection('chiSquare', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="section-chisquare" className="cursor-pointer font-semibold">
                    Análise Qui-Quadrado
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Testes de associação para variáveis categóricas
                  </p>
                </div>
              </div>

              {/* Regression Models */}
              <div
                className={`flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  config.sections.regression ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => updateSection('regression', !config.sections.regression)}
              >
                <Checkbox
                  id="section-regression"
                  checked={config.sections.regression}
                  onCheckedChange={(checked) => updateSection('regression', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="section-regression" className="cursor-pointer font-semibold">
                    Modelos de Regressão
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Análises preditivas e relações entre variáveis
                  </p>
                </div>
              </div>

              {/* Survival Analysis */}
              <div
                className={`flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  config.sections.survival ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => updateSection('survival', !config.sections.survival)}
              >
                <Checkbox
                  id="section-survival"
                  checked={config.sections.survival}
                  onCheckedChange={(checked) => updateSection('survival', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="section-survival" className="cursor-pointer font-semibold">
                    Análise de Sobrevivência
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Curvas Kaplan-Meier e modelos de Cox
                  </p>
                </div>
              </div>

              {/* Demographics */}
              <div
                className={`flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  config.sections.demographics ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => updateSection('demographics', !config.sections.demographics)}
              >
                <Checkbox
                  id="section-demographics"
                  checked={config.sections.demographics}
                  onCheckedChange={(checked) => updateSection('demographics', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="section-demographics" className="cursor-pointer font-semibold">
                    Demografia dos Pacientes
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Características basais e distribuição por grupo
                  </p>
                </div>
              </div>

              {/* Raw Data Tables */}
              <div
                className={`flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  config.sections.rawData ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => updateSection('rawData', !config.sections.rawData)}
              >
                <Checkbox
                  id="section-rawdata"
                  checked={config.sections.rawData}
                  onCheckedChange={(checked) => updateSection('rawData', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="section-rawdata" className="cursor-pointer font-semibold">
                    Tabelas de Dados Brutos
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Dados individuais para apêndices (pode aumentar tamanho do arquivo)
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>{getSelectedSectionsCount()}</strong> de 6 seções selecionadas
              </p>
            </div>
          </TabsContent>

          {/* STYLE TAB */}
          <TabsContent value="style" className="space-y-6">
            {/* Citation Style */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Estilo de Citação</Label>
              <RadioGroup value={config.style} onValueChange={(value) => setConfig({ ...config, style: value as any })}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="apa" id="style-apa" />
                    <Label htmlFor="style-apa" className="cursor-pointer">
                      APA 7ª Edição (American Psychological Association)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vancouver" id="style-vancouver" />
                    <Label htmlFor="style-vancouver" className="cursor-pointer">
                      Vancouver (International Committee of Medical Journal Editors)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="style-custom" />
                    <Label htmlFor="style-custom" className="cursor-pointer">
                      Personalizado
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* Charts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Gráficos e Figuras</Label>
                <Checkbox
                  id="include-charts"
                  checked={config.includeCharts}
                  onCheckedChange={(checked) => setConfig({ ...config, includeCharts: checked as boolean })}
                />
              </div>

              {config.includeCharts && (
                <div className="space-y-2 pl-4 border-l-2 border-blue-500">
                  <Label className="text-sm">Resolução dos Gráficos</Label>
                  <RadioGroup
                    value={config.chartResolution}
                    onValueChange={(value) => setConfig({ ...config, chartResolution: value as any })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standard" id="res-standard" />
                      <Label htmlFor="res-standard" className="cursor-pointer text-sm">
                        Padrão (72 DPI) - Arquivos menores
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="res-high" />
                      <Label htmlFor="res-high" className="cursor-pointer text-sm">
                        Alta (150 DPI) - Melhor qualidade
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="print" id="res-print" />
                      <Label htmlFor="res-print" className="cursor-pointer text-sm">
                        Impressão (300 DPI) - Qualidade máxima
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>

            <Separator />

            {/* Privacy */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Anonimização de Dados</Label>
                  <p className="text-sm text-gray-600">
                    Remover nomes e informações identificáveis dos pacientes
                  </p>
                </div>
                <Checkbox
                  id="anonymize"
                  checked={config.anonymize}
                  onCheckedChange={(checked) => setConfig({ ...config, anonymize: checked as boolean })}
                />
              </div>
            </div>

            <Separator />

            {/* Language */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Idioma</Label>
              <RadioGroup value={config.language} onValueChange={(value) => setConfig({ ...config, language: value as any })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pt" id="lang-pt" />
                  <Label htmlFor="lang-pt" className="cursor-pointer">
                    Português (Brasil)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="en" id="lang-en" />
                  <Label htmlFor="lang-en" className="cursor-pointer">
                    English (US)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>
        </Tabs>

        {/* Export Progress */}
        {isExporting && (
          <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Gerando relatório...</span>
              <span className="text-sm font-semibold text-blue-700">{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} className="h-2" />
            <p className="text-xs text-blue-700">
              {exportProgress < 30 && 'Coletando dados da pesquisa...'}
              {exportProgress >= 30 && exportProgress < 60 && 'Gerando tabelas estatísticas...'}
              {exportProgress >= 60 && exportProgress < 90 && 'Renderizando gráficos...'}
              {exportProgress >= 90 && 'Finalizando documento...'}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={handlePreview} disabled={isExporting}>
            <Eye className="mr-2 h-4 w-4" />
            Visualizar Preview
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isExporting}>
              Cancelar
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || getSelectedSectionsCount() === 0}
              style={{ backgroundColor: '#0A2647', color: 'white' }}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Relatório
                </>
              )}
            </Button>
          </div>
        </div>

        {/* File Size Estimate */}
        <div className="text-xs text-gray-500 text-center">
          Tamanho estimado do arquivo:{' '}
          {config.includeCharts && config.chartResolution === 'print'
            ? '5-15 MB'
            : config.includeCharts
            ? '2-5 MB'
            : '< 1 MB'}
        </div>
      </DialogContent>
    </Dialog>
  );
}
