'use client';

import * as React from 'react';
import { Info, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getTooltipContent } from '@/lib/tooltip-content';
import Link from 'next/link';

interface StatisticalTooltipProps {
  termId: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

/**
 * StatisticalTooltip Component
 *
 * Pre-configured tooltip for statistical terms with educational content.
 * Displays definition, example, and interpretation in Portuguese.
 *
 * Usage:
 * <StatisticalTooltip termId="p-valor">
 *   <span>p-valor</span>
 * </StatisticalTooltip>
 */
export default function StatisticalTooltip({
  termId,
  children,
  showIcon = false,
  side = 'top',
  className = ''
}: StatisticalTooltipProps) {
  const content = getTooltipContent(termId);

  if (!content) {
    console.warn(`Tooltip content not found for term: ${termId}`);
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`inline-flex items-center gap-1 cursor-help border-b border-dotted border-blue-500 ${className}`}
          style={{ textDecoration: 'none' }}
        >
          {children}
          {showIcon && <Info className="h-3 w-3 text-blue-500" />}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className="max-w-[320px] p-4 text-left"
        style={{ backgroundColor: '#0A2647', color: 'white', zIndex: 9999 }}
        sideOffset={8}
      >
        <div className="space-y-2">
          {/* Term Title */}
          <div className="font-semibold text-sm border-b border-white/20 pb-2">
            {content.term}
          </div>

          {/* Definition */}
          <div className="text-xs leading-relaxed">
            {content.definition}
          </div>

          {/* Example */}
          {content.example && (
            <div className="text-xs bg-white/10 rounded p-2 mt-2">
              <div className="font-medium mb-1">Exemplo:</div>
              <div className="text-white/90">{content.example}</div>
            </div>
          )}

          {/* Interpretation */}
          {content.interpretation && (
            <div className="text-xs mt-2 text-white/80">
              <div className="font-medium mb-1">Interpretação:</div>
              <div>{content.interpretation}</div>
            </div>
          )}

          {/* Learn More Link */}
          {content.learnMoreUrl && (
            <Link
              href={content.learnMoreUrl}
              className="inline-flex items-center gap-1 text-xs text-blue-300 hover:text-blue-200 mt-2"
            >
              Saiba mais <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * StatisticalTooltipIcon Component
 *
 * Small (i) icon with tooltip for inline use next to statistical terms.
 *
 * Usage:
 * <span>p-valor <StatisticalTooltipIcon termId="p-valor" /></span>
 */
export function StatisticalTooltipIcon({
  termId,
  side = 'top',
  className = ''
}: Omit<StatisticalTooltipProps, 'children' | 'showIcon'>) {
  const content = getTooltipContent(termId);

  if (!content) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors ${className}`}
          style={{ verticalAlign: 'super', fontSize: '0.7em' }}
        >
          <Info className="h-3 w-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className="max-w-[320px] p-4 text-left"
        style={{ backgroundColor: '#0A2647', color: 'white', zIndex: 9999 }}
        sideOffset={8}
      >
        <div className="space-y-2">
          <div className="font-semibold text-sm border-b border-white/20 pb-2">
            {content.term}
          </div>
          <div className="text-xs leading-relaxed">
            {content.definition}
          </div>
          {content.example && (
            <div className="text-xs bg-white/10 rounded p-2 mt-2">
              <div className="font-medium mb-1">Exemplo:</div>
              <div className="text-white/90">{content.example}</div>
            </div>
          )}
          {content.interpretation && (
            <div className="text-xs mt-2 text-white/80">
              <div className="font-medium mb-1">Interpretação:</div>
              <div>{content.interpretation}</div>
            </div>
          )}
          {content.learnMoreUrl && (
            <Link
              href={content.learnMoreUrl}
              className="inline-flex items-center gap-1 text-xs text-blue-300 hover:text-blue-200 mt-2"
            >
              Saiba mais <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
