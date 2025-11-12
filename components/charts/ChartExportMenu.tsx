'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  Download,
  FileImage,
  FileCode,
  Copy,
  FileText,
  Check,
} from 'lucide-react';
import html2canvas from 'html2canvas';

interface ChartExportMenuProps {
  chartRef: React.RefObject<HTMLDivElement | null>;
  chartName?: string;
  data?: any[]; // Chart data for CSV export
  onExport?: (format: 'png' | 'svg' | 'csv') => void;
}

export function ChartExportMenu({ chartRef, chartName = 'chart', data, onExport }: ChartExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportAsPNG = async (resolution: 'standard' | 'high' = 'standard') => {
    if (!chartRef.current) {
      toast.error('Gráfico não encontrado');
      return;
    }

    setIsExporting(true);

    try {
      const scale = resolution === 'high' ? 3 : 2; // 300 DPI vs 150 DPI

      const canvas = await html2canvas(chartRef.current, {
        scale,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
      } as any);

      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `${chartName}-${resolution === 'high' ? '300dpi' : '150dpi'}-${timestamp}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success(`Gráfico exportado em ${resolution === 'high' ? 'alta' : 'padrão'} resolução!`);

      if (onExport) onExport('png');
    } catch (error) {
      console.error('Error exporting PNG:', error);
      toast.error('Erro ao exportar gráfico');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsSVG = async () => {
    if (!chartRef.current) {
      toast.error('Gráfico não encontrado');
      return;
    }

    setIsExporting(true);

    try {
      // Clone the chart element
      const svgElements = chartRef.current.querySelectorAll('svg');

      if (svgElements.length === 0) {
        toast.error('Nenhum gráfico SVG encontrado');
        return;
      }

      // Get the first (main) SVG
      const svgElement = svgElements[0];
      const svgData = new XMLSerializer().serializeToString(svgElement);

      // Add XML declaration and proper encoding
      const svgBlob = new Blob(
        ['<?xml version="1.0" encoding="UTF-8"?>\n' + svgData],
        { type: 'image/svg+xml;charset=utf-8' }
      );

      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `${chartName}-${timestamp}.svg`;
      link.href = URL.createObjectURL(svgBlob);
      link.click();

      toast.success('Gráfico exportado como SVG!');

      if (onExport) onExport('svg');
    } catch (error) {
      console.error('Error exporting SVG:', error);
      toast.error('Erro ao exportar gráfico como SVG');
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = async () => {
    if (!chartRef.current) {
      toast.error('Gráfico não encontrado');
      return;
    }

    setIsExporting(true);

    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      } as any);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error('Erro ao criar imagem');
          return;
        }

        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);

          toast.success('Gráfico copiado para área de transferência!');
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
          toast.error('Erro ao copiar para área de transferência');
        } finally {
          setIsExporting(false);
        }
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Erro ao copiar gráfico');
      setIsExporting(false);
    }
  };

  const exportData = () => {
    if (!data || data.length === 0) {
      toast.error('Nenhum dado disponível para exportação');
      return;
    }

    setIsExporting(true);

    try {
      // Convert data to CSV format
      const headers = Object.keys(data[0]);
      const csvRows = [headers.join(',')];

      for (const row of data) {
        const values = headers.map(header => {
          const value = row[header];
          // Handle nested objects and arrays
          if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value).replace(/,/g, ';');
          }
          // Escape commas and quotes in strings
          if (typeof value === 'string') {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        });
        csvRows.push(values.join(','));
      }

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `${chartName}-data-${timestamp}.csv`;
      link.href = URL.createObjectURL(blob);
      link.click();

      toast.success('Dados exportados com sucesso!');

      if (onExport) onExport('csv');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Erro ao exportar dados');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-gray-900 mr-2" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Formato de Exportação</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => exportAsPNG('standard')}>
          <FileImage className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span>PNG Padrão</span>
            <span className="text-xs text-gray-500">150 DPI (para web)</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => exportAsPNG('high')}>
          <FileImage className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span>PNG Alta Resolução</span>
            <span className="text-xs text-gray-500">300 DPI (para publicação)</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={exportAsSVG}>
          <FileCode className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span>SVG (Vetor)</span>
            <span className="text-xs text-gray-500">Redimensionável</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={copyToClipboard}>
          <Copy className="h-4 w-4 mr-2" />
          Copiar para Área de Transferência
        </DropdownMenuItem>

        <DropdownMenuItem onClick={exportData}>
          <FileText className="h-4 w-4 mr-2" />
          Exportar Dados (CSV)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
