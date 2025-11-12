'use client';

import React from 'react';
import {
  getFieldRequirement,
  type ValidationContext,
  type RequirementLevel
} from '@/lib/registration-validation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertCircle, Info, CheckCircle } from 'lucide-react';

interface FieldRequirementBadgeProps {
  fieldName: string;
  context: ValidationContext;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const badgeStyles: Record<RequirementLevel, {
  bg: string;
  text: string;
  border: string;
  icon: React.ReactNode;
  label: string;
}> = {
  required: {
    bg: 'bg-red-100 dark:bg-red-950',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
    icon: <AlertCircle className="w-3 h-3" />,
    label: 'Obrigatório'
  },
  recommended: {
    bg: 'bg-amber-100 dark:bg-amber-950',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    icon: <Info className="w-3 h-3" />,
    label: 'Recomendado'
  },
  optional: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
    icon: <CheckCircle className="w-3 h-3" />,
    label: 'Opcional'
  }
};

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-base px-3 py-1.5 gap-2'
};

export function FieldRequirementBadge({
  fieldName,
  context,
  showTooltip = true,
  size = 'sm'
}: FieldRequirementBadgeProps) {
  const requirement = getFieldRequirement(fieldName, context);
  const style = badgeStyles[requirement.level];
  const sizeStyle = sizeStyles[size];

  const badge = (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        ${style.bg} ${style.text} ${style.border} ${sizeStyle}
        transition-colors duration-200
      `}
      role="status"
      aria-label={`${style.label}: ${requirement.reason}`}
    >
      {style.icon}
      <span>{style.label}</span>
    </span>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{style.label}</p>
            <p className="text-sm text-muted-foreground">{requirement.reason}</p>
            {requirement.section && (
              <p className="text-xs text-muted-foreground border-t pt-1 mt-1">
                Seção: {requirement.section}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ValidationSummaryProps {
  errors?: string[];
  warnings?: string[];
  missingRequired?: string[];
  missingRecommended?: string[];
  className?: string;
}

export function ValidationSummary({
  errors = [],
  warnings = [],
  missingRequired = [],
  missingRecommended = [],
  className = ''
}: ValidationSummaryProps) {
  const hasErrors = errors.length > 0 || missingRequired.length > 0;
  const hasWarnings = warnings.length > 0 || missingRecommended.length > 0;

  if (!hasErrors && !hasWarnings) {
    return (
      <div className={`rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-green-900 dark:text-green-100">
              Todos os campos estão válidos
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Você pode prosseguir com o cadastro.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {hasErrors && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 dark:text-red-100">
                Campos obrigatórios pendentes ({missingRequired.length})
              </h4>
              {missingRequired.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-300">
                  {missingRequired.map((field) => (
                    <li key={field} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400" />
                      {field}
                    </li>
                  ))}
                </ul>
              )}
              {errors.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-300">
                  {errors.map((error, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400" />
                      {error}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {hasWarnings && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                Campos recomendados ({missingRecommended.length})
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Preencher estes campos melhora a qualidade do acompanhamento.
              </p>
              {missingRecommended.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
                  {missingRecommended.map((field) => (
                    <li key={field} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
                      {field}
                    </li>
                  ))}
                </ul>
              )}
              {warnings.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
                  {warnings.map((warning, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
                      {warning}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SectionValidationSummaryProps {
  sectionName: string;
  errors: number;
  warnings: number;
  missingRequired: string[];
}

export function SectionValidationSummary({
  sectionName,
  errors,
  warnings,
  missingRequired
}: SectionValidationSummaryProps) {
  if (errors === 0 && warnings === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <CheckCircle className="w-4 h-4" />
        <span>Seção completa</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {errors > 0 && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span>
            {errors} {errors === 1 ? 'campo obrigatório' : 'campos obrigatórios'}
          </span>
        </div>
      )}
      {warnings > 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
          <Info className="w-4 h-4" />
          <span>
            {warnings} {warnings === 1 ? 'campo recomendado' : 'campos recomendados'}
          </span>
        </div>
      )}
      {missingRequired.length > 0 && (
        <div className="ml-6 space-y-1">
          {missingRequired.map((field) => (
            <div key={field} className="text-xs text-muted-foreground">
              • {field}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface FieldValidationMessageProps {
  error?: string;
  warning?: string;
  success?: string;
  className?: string;
}

export function FieldValidationMessage({
  error,
  warning,
  success,
  className = ''
}: FieldValidationMessageProps) {
  if (error) {
    return (
      <p className={`text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 mt-1 ${className}`}>
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{error}</span>
      </p>
    );
  }

  if (warning) {
    return (
      <p className={`text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mt-1 ${className}`}>
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>{warning}</span>
      </p>
    );
  }

  if (success) {
    return (
      <p className={`text-sm text-green-600 dark:text-green-400 flex items-center gap-1.5 mt-1 ${className}`}>
        <CheckCircle className="w-4 h-4 flex-shrink-0" />
        <span>{success}</span>
      </p>
    );
  }

  return null;
}

interface ResearchCriteriaCheckerProps {
  meets: boolean;
  reasons: string[];
  className?: string;
}

export function ResearchCriteriaChecker({
  meets,
  reasons,
  className = ''
}: ResearchCriteriaCheckerProps) {
  if (meets) {
    return (
      <div className={`rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-green-900 dark:text-green-100">
              Elegível para Pesquisa
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Este paciente atende todos os critérios de inclusão para a pesquisa.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-red-900 dark:text-red-100">
            Não elegível para Pesquisa
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            Este paciente não atende os seguintes critérios:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-300">
            {reasons.map((reason, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 mt-1.5 flex-shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
