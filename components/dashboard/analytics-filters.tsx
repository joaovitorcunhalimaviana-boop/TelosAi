"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Filter, RefreshCw } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { SURGERY_TYPE_LABELS } from '@/lib/constants/surgery-types';

export interface AnalyticsFilters {
  dateRange: string; // "7", "30", "90", "365", "custom"
  surgeryType: string; // "all", "hemorroidectomia", "fistula", "fissura", "pilonidal"
}

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  onApply: () => void;
  isLoading?: boolean;
}

const DATE_RANGE_OPTIONS = [
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
  { value: '365', label: 'Último ano' },
];

const SURGERY_TYPE_OPTIONS = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'hemorroidectomia', label: SURGERY_TYPE_LABELS['hemorroidectomia'] || 'Hemorroidectomia' },
  { value: 'fistula', label: SURGERY_TYPE_LABELS['fistula'] || 'Fístula Anal' },
  { value: 'fissura', label: SURGERY_TYPE_LABELS['fissurectomia'] || 'Fissurectomia' },
  { value: 'pilonidal', label: SURGERY_TYPE_LABELS['pilonidal'] || 'Doença Pilonidal' },
];

export function AnalyticsFilters({
  filters,
  onFiltersChange,
  onApply,
  isLoading = false,
}: AnalyticsFiltersProps) {
  const [localFilters, setLocalFilters] = useState<AnalyticsFilters>(filters);

  const handleDateRangeChange = (value: string) => {
    const newFilters = { ...localFilters, dateRange: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSurgeryTypeChange = (value: string) => {
    const newFilters = { ...localFilters, surgeryType: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const defaultFilters: AnalyticsFilters = {
      dateRange: '30',
      surgeryType: 'all',
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const isFiltered = localFilters.dateRange !== '30' || localFilters.surgeryType !== 'all';

  return (
    <Card className="border-2 shadow-sm mb-6" style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
      <CardHeader style={{ background: 'linear-gradient(to right, rgba(13, 115, 119, 0.1), rgba(13, 115, 119, 0.05))' }}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2" style={{ color: '#14BDAE' }}>
              <Filter className="h-5 w-5" />
              Filtros de Analytics
            </CardTitle>
            <CardDescription className="mt-1" style={{ color: '#7A8299' }}>
              Personalize o período e tipo de cirurgia para análise dos dados
            </CardDescription>
          </div>
          {isFiltered && (
            <Badge variant="secondary" className="text-sm" style={{ backgroundColor: '#2A3147', color: '#14BDAE' }}>
              Filtros ativos
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
          {/* Período */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#D8DEEB' }}>
              <Calendar className="h-4 w-4" />
              Período de Análise
            </Label>
            <Select
              value={localFilters.dateRange}
              onValueChange={handleDateRangeChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full h-11 border-2" style={{ backgroundColor: '#0B0E14', borderColor: '#2A3147', color: '#F0EAD6' }}>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
                {DATE_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs" style={{ color: '#7A8299' }}>
              Dados dos últimos {localFilters.dateRange} dias
            </p>
          </div>

          {/* Tipo de Cirurgia */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#D8DEEB' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M12 18v-6" />
                <path d="M9 15h6" />
              </svg>
              Tipo de Cirurgia
            </Label>
            <Select
              value={localFilters.surgeryType}
              onValueChange={handleSurgeryTypeChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full h-11 border-2" style={{ backgroundColor: '#0B0E14', borderColor: '#2A3147', color: '#F0EAD6' }}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
                {SURGERY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs" style={{ color: '#7A8299' }}>
              {localFilters.surgeryType === 'all' ? 'Todos os procedimentos' : SURGERY_TYPE_OPTIONS.find(o => o.value === localFilters.surgeryType)?.label}
            </p>
          </div>

          {/* Ações */}
          <div className="flex gap-3">
            <Button
              onClick={onApply}
              disabled={isLoading}
              className="flex-1 h-11 font-semibold"
              style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <Filter className="mr-2 h-4 w-4" />
                  Aplicar Filtros
                </>
              )}
            </Button>
            {isFiltered && (
              <Button
                onClick={handleReset}
                variant="outline"
                disabled={isLoading}
                className="h-11"
                style={{ borderColor: '#2A3147', color: '#D8DEEB' }}
                title="Resetar para padrão (30 dias, todos os tipos)"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Resumo dos filtros aplicados */}
        {isFiltered && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid #1E2535' }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm" style={{ color: '#7A8299' }}>Filtros aplicados:</span>
              {localFilters.dateRange !== '30' && (
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {DATE_RANGE_OPTIONS.find(o => o.value === localFilters.dateRange)?.label}
                </Badge>
              )}
              {localFilters.surgeryType !== 'all' && (
                <Badge variant="outline" className="gap-1">
                  {SURGERY_TYPE_OPTIONS.find(o => o.value === localFilters.surgeryType)?.label}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
