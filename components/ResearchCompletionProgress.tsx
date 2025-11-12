"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, FlaskConical } from 'lucide-react';
import { ValidationResult, CATEGORY_LABELS } from '@/lib/research-field-validator';

interface ResearchCompletionProgressProps {
  validation: ValidationResult;
  isResearchParticipant: boolean;
  className?: string;
  showDetails?: boolean;
  onFieldClick?: (fieldId: string) => void;
}

export function ResearchCompletionProgress({
  validation,
  isResearchParticipant,
  className = '',
  showDetails = true,
  onFieldClick,
}: ResearchCompletionProgressProps) {
  const [expanded, setExpanded] = React.useState(false);

  // Don't show for non-research patients
  if (!isResearchParticipant) {
    return null;
  }

  const getStatusColor = () => {
    if (validation.isComplete) return 'bg-green-500';
    if (validation.percentComplete >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadgeVariant = () => {
    if (validation.isComplete) return 'default';
    if (validation.percentComplete >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className={`border-2 ${validation.isComplete ? 'border-green-300' : 'border-red-300'} ${className}`}>
      <CardHeader className={validation.isComplete ? 'bg-green-50' : 'bg-red-50'}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <FlaskConical className={`h-6 w-6 mt-1 ${validation.isComplete ? 'text-green-600' : 'text-red-600'}`} />
            <div className="flex-1">
              <CardTitle className="text-lg mb-2 flex items-center gap-2">
                Campos Obrigatórios para Pesquisa
                {validation.isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={getStatusBadgeVariant()} className="text-sm font-semibold">
                  {validation.completedFields} / {validation.totalFields} completos
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {validation.percentComplete}%
                </Badge>
              </div>
              <Progress value={validation.percentComplete} className="h-3" />
            </div>
          </div>
        </div>
      </CardHeader>

      {showDetails && validation.missingFields.length > 0 && (
        <CardContent className="pt-4">
          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-900 mb-1">
                  Este paciente está em pesquisa científica
                </p>
                <p className="text-sm text-yellow-800">
                  Para completar o cadastro, todos os campos obrigatórios devem ser preenchidos.
                  Ainda faltam <strong>{validation.missingFields.length} campo{validation.missingFields.length > 1 ? 's' : ''}</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Toggle Details Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full mb-4"
          >
            {expanded ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Ocultar campos faltantes
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Ver campos faltantes ({validation.missingFields.length})
              </>
            )}
          </Button>

          {/* Missing Fields List */}
          {expanded && (
            <div className="space-y-4">
              {Object.entries(validation.missingByCategory).map(([category, fields]) => (
                <div key={category} className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    {CATEGORY_LABELS[category]}
                    <Badge variant="destructive" className="ml-auto">
                      {fields.length} campo{fields.length > 1 ? 's' : ''}
                    </Badge>
                  </h4>
                  <ul className="space-y-2">
                    {fields.map((field, idx) => (
                      <li key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{field.label}</span>
                        {onFieldClick && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onFieldClick(field.field.replace(/\./g, '-'))}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Preencher
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}

      {/* Success Message */}
      {validation.isComplete && showDetails && (
        <CardContent className="pt-4">
          <div className="bg-green-50 border border-green-300 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-900 mb-1">
                  Todos os campos obrigatórios foram preenchidos!
                </p>
                <p className="text-sm text-green-800">
                  Este paciente está pronto para inclusão na pesquisa.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
