'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Settings2,
  Grid3x3,
  Palette,
  Tag,
  Maximize2,
  RefreshCw,
} from 'lucide-react';

export interface ChartSettings {
  showConfidenceIntervals: boolean;
  showGridLines: boolean;
  showDataLabels: boolean;
  showLegend: boolean;
  colorScheme: 'vigia' | 'viridis' | 'categorical' | 'monochrome';
  axisScaleX: 'linear' | 'log';
  axisScaleY: 'linear' | 'log';
  opacity: number;
  fontSize: number;
}

interface ChartControlsProps {
  settings: ChartSettings;
  onSettingsChange: (settings: ChartSettings) => void;
  onReset?: () => void;
  showScaleControls?: boolean;
  showColorControls?: boolean;
}

const STORAGE_KEY = 'chart-settings';

export function ChartControls({
  settings,
  onSettingsChange,
  onReset,
  showScaleControls = true,
  showColorControls = true,
}: ChartControlsProps) {
  const [localSettings, setLocalSettings] = useState<ChartSettings>(settings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => setLocalSettings({ ...settings, ...parsed }), 0);
        onSettingsChange({ ...settings, ...parsed });
      } catch (e) {
        console.error('Failed to parse saved chart settings', e);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localSettings));
  }, [localSettings]);

  const updateSetting = <K extends keyof ChartSettings>(key: K, value: ChartSettings[K]) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleReset = () => {
    const defaultSettings: ChartSettings = {
      showConfidenceIntervals: true,
      showGridLines: true,
      showDataLabels: false,
      showLegend: true,
      colorScheme: 'vigia',
      axisScaleX: 'linear',
      axisScaleY: 'linear',
      opacity: 100,
      fontSize: 12,
    };
    setLocalSettings(defaultSettings);
    onSettingsChange(defaultSettings);
    localStorage.removeItem(STORAGE_KEY);
    if (onReset) onReset();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Controles do Gráfico
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Configurações do Gráfico
            </h4>
          </div>

          {/* Display Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="ci-toggle" className="text-sm flex items-center gap-2">
                <Grid3x3 className="h-3.5 w-3.5" />
                Intervalos de Confiança
              </Label>
              <Switch
                id="ci-toggle"
                checked={localSettings.showConfidenceIntervals}
                onCheckedChange={(checked: boolean) => updateSetting('showConfidenceIntervals', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="grid-toggle" className="text-sm flex items-center gap-2">
                <Grid3x3 className="h-3.5 w-3.5" />
                Linhas de Grade
              </Label>
              <Switch
                id="grid-toggle"
                checked={localSettings.showGridLines}
                onCheckedChange={(checked: boolean) => updateSetting('showGridLines', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="labels-toggle" className="text-sm flex items-center gap-2">
                <Tag className="h-3.5 w-3.5" />
                Rótulos de Dados
              </Label>
              <Switch
                id="labels-toggle"
                checked={localSettings.showDataLabels}
                onCheckedChange={(checked: boolean) => updateSetting('showDataLabels', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="legend-toggle" className="text-sm">
                Mostrar Legenda
              </Label>
              <Switch
                id="legend-toggle"
                checked={localSettings.showLegend}
                onCheckedChange={(checked: boolean) => updateSetting('showLegend', checked)}
              />
            </div>
          </div>

          {/* Color Scheme */}
          {showColorControls && (
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Palette className="h-3.5 w-3.5" />
                Esquema de Cores
              </Label>
              <Select
                value={localSettings.colorScheme}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onValueChange={(value: any) => updateSetting('colorScheme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vigia">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0D7377' }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#14BDAE' }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#C9A84C' }} />
                      </div>
                      VigIA (Teal)
                    </div>
                  </SelectItem>
                  <SelectItem value="viridis">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#440154' }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#31688e' }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#35b779' }} />
                      </div>
                      Viridis (Científico)
                    </div>
                  </SelectItem>
                  <SelectItem value="categorical">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      Categórico (Distinto)
                    </div>
                  </SelectItem>
                  <SelectItem value="monochrome">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        <div className="w-3 h-3 rounded-full bg-gray-700" />
                        <div className="w-3 h-3 rounded-full bg-gray-500" />
                        <div className="w-3 h-3 rounded-full bg-gray-300" />
                      </div>
                      Monocromático (P&B)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Axis Scales */}
          {showScaleControls && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <Maximize2 className="h-3.5 w-3.5" />
                  Escala do Eixo X
                </Label>
                <Select
                  value={localSettings.axisScaleX}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onValueChange={(value: any) => updateSetting('axisScaleX', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="log">Logarítmica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <Maximize2 className="h-3.5 w-3.5 rotate-90" />
                  Escala do Eixo Y
                </Label>
                <Select
                  value={localSettings.axisScaleY}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onValueChange={(value: any) => updateSetting('axisScaleY', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="log">Logarítmica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Opacity Slider */}
          <div className="space-y-2">
            <Label className="text-sm">
              Opacidade: {localSettings.opacity}%
            </Label>
            <Slider
              value={[localSettings.opacity]}
              onValueChange={([value]) => updateSetting('opacity', value)}
              min={20}
              max={100}
              step={10}
              className="w-full"
            />
          </div>

          {/* Font Size Slider */}
          <div className="space-y-2">
            <Label className="text-sm">
              Tamanho da Fonte: {localSettings.fontSize}px
            </Label>
            <Slider
              value={[localSettings.fontSize]}
              onValueChange={([value]) => updateSetting('fontSize', value)}
              min={8}
              max={16}
              step={1}
              className="w-full"
            />
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="w-full"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-2" />
            Restaurar Padrões
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function getColorPalette(scheme: ChartSettings['colorScheme']): string[] {
  switch (scheme) {
    case 'vigia':
      return ['#0D7377', '#14BDAE', '#C9A84C', '#E8C97A', '#1A2544'];
    case 'viridis':
      return ['#440154', '#31688e', '#35b779', '#fde724'];
    case 'categorical':
      return ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];
    case 'monochrome':
      return ['#1f2937', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'];
    default:
      return ['#0D7377', '#14BDAE', '#C9A84C', '#1A2544'];
  }
}
