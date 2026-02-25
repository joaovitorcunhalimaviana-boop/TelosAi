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
          <Button variant="outline" size="lg" style={{ backgroundColor: '#1E2535', borderColor: '#2A3147', color: '#D8DEEB' }}>
            <Download className="mr-2 h-5 w-5" />
            Exportar Relatório
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2" style={{ color: '#F0EAD6' }}>
            <FileText className="h-6 w-6" style={{ color: '#14BDAE' }} />
            Exportar Relatório de Pesquisa
          </DialogTitle>
          <DialogDescription style={{ color: '#7A8299' }}>
            Configure o formato e conteúdo do relatório para exportação profissional
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-4">
          <TabsList className="grid w-full grid-cols-3" style={{ backgroundColor: '#161B27' }}>
            <TabsTrigger value="format" className="flex items-center gap-2 data-[state=active]:bg-[#0D7377] data-[state=active]:text-white" style={{ color: '#D8DEEB' }}>
              <File className="h-4 w-4" />
              Formato
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2 data-[state=active]:bg-[#0D7377] data-[state=active]:text-white" style={{ color: '#D8DEEB' }}>
              <Settings className="h-4 w-4" />
              Conteúdo
            </TabsTrigger>
            <TabsTrigger value="style" className="flex items-center gap-2 data-[state=active]:bg-[#0D7377] data-[state=active]:text-white" style={{ color: '#D8DEEB' }}>
              <FileSpreadsheet className="h-4 w-4" />
              Estilo
            </TabsTrigger>
          </TabsList>

          {/* FORMAT TAB */}
          <TabsContent value="format" className="space-y-6">
            {/* Export Format */}
            <div className="space-y-3">
              <Label className="text-base font-semibold" style={{ color: '#F0EAD6' }}>Formato de Exportação</Label>
              <RadioGroup
                value={config.format}
                onValueChange={(value) => setConfig({ ...config, format: value as 'docx' | 'pdf' })}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all"
                    style={{
                      borderColor: config.format === 'docx' ? '#0D7377' : '#1E2535',
                      backgroundColor: config.format === 'docx' ? 'rgba(13, 115, 119, 0.08)' : '#161B27',
                    }}
                    onClick={() => setConfig({ ...config, format: 'docx' })}
                  >
                    <RadioGroupItem value="docx" id="format-docx" />
                    <div className="flex-1">
                      <Label
                        htmlFor="format-docx"
                        className="cursor-pointer font-semibold flex items-center gap-2"
                        style={{ color: '#F0EAD6' }}
                      >
                        <FileText className="h-4 w-4" />
                        Word (.docx)
                      </Label>
                      <p className="text-sm mt-1" style={{ color: '#7A8299' }}>
                        Documento editável com formatação APA. Ideal para manuscritos científicos.
                      </p>
                      <Badge variant="outline" className="mt-2" style={{ borderColor: '#2A3147', color: '#14BDAE' }}>
                        Recomendado para publicações
                      </Badge>
                    </div>
                  </div>

                  <div
                    className="flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all"
                    style={{
                      borderColor: config.format === 'pdf' ? '#0D7377' : '#1E2535',
                      backgroundColor: config.format === 'pdf' ? 'rgba(13, 115, 119, 0.08)' : '#161B27',
                    }}
                    onClick={() => setConfig({ ...config, format: 'pdf' })}
                  >
                    <RadioGroupItem value="pdf" id="format-pdf" />
                    <div className="flex-1">
                      <Label
                        htmlFor="format-pdf"
                        className="cursor-pointer font-semibold flex items-center gap-2"
                        style={{ color: '#F0EAD6' }}
                      >
                        <File className="h-4 w-4" />
                        PDF
                      </Label>
                      <p className="text-sm mt-1" style={{ color: '#7A8299' }}>
                        Documento fixo com layout profissional. Ideal para compartilhamento.
                      </p>
                      <Badge variant="outline" className="mt-2" style={{ borderColor: '#2A3147', color: '#14BDAE' }}>
                        Pronto para impressão
                      </Badge>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <Separator style={{ backgroundColor: '#1E2535' }} />

            {/* Template Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold" style={{ color: '#F0EAD6' }}>Tipo de Relatório</Label>
              <Select value={config.template} onValueChange={(value) => setConfig({ ...config, template: value })}>
                <SelectTrigger style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{template.name}</span>
                        <span className="text-xs" style={{ color: '#7A8299' }}>{template.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedTemplate && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(13, 115, 119, 0.08)', border: '1px solid rgba(13, 115, 119, 0.2)' }}>
                  <h4 className="font-semibold mb-2" style={{ color: '#14BDAE' }}>{selectedTemplate.name}</h4>
                  <p className="text-sm mb-3" style={{ color: '#D8DEEB' }}>{selectedTemplate.description}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold" style={{ color: '#14BDAE' }}>Seções incluídas:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.sections.slice(0, 5).map((section) => (
                        <Badge key={section.id} variant="secondary" className="text-xs" style={{ backgroundColor: '#1E2535', color: '#D8DEEB' }}>
                          {section.title}
                        </Badge>
                      ))}
                      {selectedTemplate.sections.length > 5 && (
                        <Badge variant="secondary" className="text-xs" style={{ backgroundColor: '#1E2535', color: '#D8DEEB' }}>
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
              <Label className="text-base font-semibold" style={{ color: '#F0EAD6' }}>Selecionar Seções</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllSections} style={{ backgroundColor: '#1E2535', borderColor: '#2A3147', color: '#D8DEEB' }}>
                  Selecionar Todas
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllSections} style={{ backgroundColor: '#1E2535', borderColor: '#2A3147', color: '#D8DEEB' }}>
                  Limpar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* ANOVA Results */}
              <div
                className="flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all"
                style={{
                  borderColor: config.sections.anova ? '#0D7377' : '#1E2535',
                  backgroundColor: config.sections.anova ? 'rgba(13, 115, 119, 0.08)' : '#161B27',
                }}
                onClick={() => updateSection('anova', !config.sections.anova)}
              >
                <Checkbox
                  id="section-anova"
                  checked={config.sections.anova}
                  onCheckedChange={(checked) => updateSection('anova', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="section-anova" className="cursor-pointer font-semibold" style={{ color: '#F0EAD6' }}>
                    Resultados ANOVA
                  </Label>
                  <p className="text-sm mt-1" style={{ color: '#7A8299' }}>
                    Análise de variância entre grupos, testes post-hoc e tamanhos de efeito
                  </p>
                </div>
              </div>

              {/* Chi-Square Analysis */}
              <div
                className="flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all"
                style={{
                  borderColor: config.sections.chiSquare ? '#0D7377' : '#1E2535',
                  backgroundColor: config.sections.chiSquare ? 'rgba(13, 115, 119, 0.08)' : '#161B27',
                }}
                onClick={() => updateSection('chiSquare', !config.sections.chiSquare)}
              >
                <Checkbox
                  id="section-chisquare"
                  checked={config.sections.chiSquare}
                  onCheckedChange={(checked) => updateSection('chiSquare', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="section-chisquare" className="cursor-pointer font-semibold" style={{ color: '#F0EAD6' }}>
                    Análise Qui-Quadrado
                  </Label>
                  <p className="text-sm mt-1" style={{ color: '#7A8299' }}>
                    Testes de associação para variáveis categóricas
                  </p>
                </div>
              </div>

              {/* Regression Models */}
              <div
                className="flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all"
                style={{
                  borderColor: config.sections.regression ? '#0D7377' : '#1E2535',
                  backgroundColor: config.sections.regression ? 'rgba(13, 115, 119, 0.08)' : '#161B27',
                }}
                onClick={() => updateSection('regression', !config.sections.regression)}
              >
                <Checkbox
                  id="section-regression"
                  checked={config.sections.regression}
                  onCheckedChange={(checked) => updateSection('regression', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="section-regression" className="cursor-pointer font-semibold" style={{ color: '#F0EAD6' }}>
                    Modelos de Regressão
                  </Label>
                  <p className="text-sm mt-1" style={{ color: '#7A8299' }}>
                    Análises preditivas e relações entre variáveis
                  </p>
                </div>
              </div>

              {/* Survival Analysis */}
              <div
                className="flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all"
                style={{
                  borderColor: config.sections.survival ? '#0D7377' : '#1E2535',
                  backgroundColor: config.sections.survival ? 'rgba(13, 115, 119, 0.08)' : '#161B27',
                }}
                onClick={() => updateSection('survival', !config.sections.survival)}
              >
                <Checkbox
                  id="section-survival"
                  checked={config.sections.survival}
                  onCheckedChange={(checked) => updateSection('survival', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="section-survival" className="cursor-pointer font-semibold" style={{ color: '#F0EAD6' }}>
                    Análise de Sobrevivência
                  </Label>
                  <p className="text-sm mt-1" style={{ color: '#7A8299' }}>
                    Curvas Kaplan-Meier e modelos de Cox
                  </p>
                </div>
              </div>

              {/* Demographics */}
              <div
                className="flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all"
                style={{
                  borderColor: config.sections.demographics ? '#0D7377' : '#1E2535',
                  backgroundColor: config.sections.demographics ? 'rgba(13, 115, 119, 0.08)' : '#161B27',
                }}
                onClick={() => updateSection('demographics', !config.sections.demographics)}
              >
                <Checkbox
                  id="section-demographics"
                  checked={config.sections.demographics}
                  onCheckedChange={(checked) => updateSection('demographics', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="section-demographics" className="cursor-pointer font-semibold" style={{ color: '#F0EAD6' }}>
                    Demografia dos Pacientes
                  </Label>
                  <p className="text-sm mt-1" style={{ color: '#7A8299' }}>
                    Características basais e distribuição por grupo
                  </p>
                </div>
              </div>

              {/* Raw Data Tables */}
              <div
                className="flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all"
                style={{
                  borderColor: config.sections.rawData ? '#0D7377' : '#1E2535',
                  backgroundColor: config.sections.rawData ? 'rgba(13, 115, 119, 0.08)' : '#161B27',
                }}
                onClick={() => updateSection('rawData', !config.sections.rawData)}
              >
                <Checkbox
                  id="section-rawdata"
                  checked={config.sections.rawData}
                  onCheckedChange={(checked) => updateSection('rawData', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="section-rawdata" className="cursor-pointer font-semibold" style={{ color: '#F0EAD6' }}>
                    Tabelas de Dados Brutos
                  </Label>
                  <p className="text-sm mt-1" style={{ color: '#7A8299' }}>
                    Dados individuais para apêndices (pode aumentar tamanho do arquivo)
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg" style={{ backgroundColor: '#161B27', border: '1px solid #1E2535' }}>
              <p className="text-sm" style={{ color: '#D8DEEB' }}>
                <strong>{getSelectedSectionsCount()}</strong> de 6 seções selecionadas
              </p>
            </div>
          </TabsContent>

          {/* STYLE TAB */}
          <TabsContent value="style" className="space-y-6">
            {/* Citation Style */}
            <div className="space-y-3">
              <Label className="text-base font-semibold" style={{ color: '#F0EAD6' }}>Estilo de Citação</Label>
              <RadioGroup value={config.style} onValueChange={(value) => setConfig({ ...config, style: value as any })}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="apa" id="style-apa" />
                    <Label htmlFor="style-apa" className="cursor-pointer" style={{ color: '#D8DEEB' }}>
                      APA 7a Edição (American Psychological Association)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vancouver" id="style-vancouver" />
                    <Label htmlFor="style-vancouver" className="cursor-pointer" style={{ color: '#D8DEEB' }}>
                      Vancouver (International Committee of Medical Journal Editors)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="style-custom" />
                    <Label htmlFor="style-custom" className="cursor-pointer" style={{ color: '#D8DEEB' }}>
                      Personalizado
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <Separator style={{ backgroundColor: '#1E2535' }} />

            {/* Charts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold" style={{ color: '#F0EAD6' }}>Gráficos e Figuras</Label>
                <Checkbox
                  id="include-charts"
                  checked={config.includeCharts}
                  onCheckedChange={(checked) => setConfig({ ...config, includeCharts: checked as boolean })}
                />
              </div>

              {config.includeCharts && (
                <div className="space-y-2 pl-4" style={{ borderLeft: '2px solid #0D7377' }}>
                  <Label className="text-sm" style={{ color: '#D8DEEB' }}>Resolução dos Gráficos</Label>
                  <RadioGroup
                    value={config.chartResolution}
                    onValueChange={(value) => setConfig({ ...config, chartResolution: value as any })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standard" id="res-standard" />
                      <Label htmlFor="res-standard" className="cursor-pointer text-sm" style={{ color: '#D8DEEB' }}>
                        Padrão (72 DPI) - Arquivos menores
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="res-high" />
                      <Label htmlFor="res-high" className="cursor-pointer text-sm" style={{ color: '#D8DEEB' }}>
                        Alta (150 DPI) - Melhor qualidade
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="print" id="res-print" />
                      <Label htmlFor="res-print" className="cursor-pointer text-sm" style={{ color: '#D8DEEB' }}>
                        Impressão (300 DPI) - Qualidade máxima
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>

            <Separator style={{ backgroundColor: '#1E2535' }} />

            {/* Privacy */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold" style={{ color: '#F0EAD6' }}>Anonimização de Dados</Label>
                  <p className="text-sm" style={{ color: '#7A8299' }}>
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

            <Separator style={{ backgroundColor: '#1E2535' }} />

            {/* Language */}
            <div className="space-y-3">
              <Label className="text-base font-semibold" style={{ color: '#F0EAD6' }}>Idioma</Label>
              <RadioGroup value={config.language} onValueChange={(value) => setConfig({ ...config, language: value as any })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pt" id="lang-pt" />
                  <Label htmlFor="lang-pt" className="cursor-pointer" style={{ color: '#D8DEEB' }}>
                    Português (Brasil)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="en" id="lang-en" />
                  <Label htmlFor="lang-en" className="cursor-pointer" style={{ color: '#D8DEEB' }}>
                    English (US)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>
        </Tabs>

        {/* Export Progress */}
        {isExporting && (
          <div className="space-y-3 p-4 rounded-lg" style={{ backgroundColor: 'rgba(13, 115, 119, 0.08)', border: '1px solid rgba(13, 115, 119, 0.2)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: '#14BDAE' }}>Gerando relatório...</span>
              <span className="text-sm font-semibold" style={{ color: '#14BDAE' }}>{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} className="h-2" />
            <p className="text-xs" style={{ color: '#7A8299' }}>
              {exportProgress < 30 && 'Coletando dados da pesquisa...'}
              {exportProgress >= 30 && exportProgress < 60 && 'Gerando tabelas estatísticas...'}
              {exportProgress >= 60 && exportProgress < 90 && 'Renderizando gráficos...'}
              {exportProgress >= 90 && 'Finalizando documento...'}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4" style={{ borderTop: '1px solid #1E2535' }}>
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={isExporting}
            style={{ backgroundColor: '#1E2535', borderColor: '#2A3147', color: '#D8DEEB' }}
          >
            <Eye className="mr-2 h-4 w-4" />
            Visualizar Preview
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isExporting}
              style={{ backgroundColor: '#1E2535', borderColor: '#2A3147', color: '#D8DEEB' }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || getSelectedSectionsCount() === 0}
              style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}
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
        <div className="text-xs text-center" style={{ color: '#7A8299' }}>
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
