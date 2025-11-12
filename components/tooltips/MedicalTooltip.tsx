'use client';

import * as React from 'react';
import { Info, ExternalLink, Stethoscope } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getTooltipContent } from '@/lib/tooltip-content';
import Link from 'next/link';

interface MedicalTooltipProps {
  termId: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

/**
 * MedicalTooltip Component
 *
 * Pre-configured tooltip for medical terminology with clinical context.
 * Displays definition, example, and clinical interpretation in Portuguese.
 *
 * Usage:
 * <MedicalTooltip termId="hemorroidectomia">
 *   <span>Hemorroidectomia</span>
 * </MedicalTooltip>
 */
export default function MedicalTooltip({
  termId,
  children,
  showIcon = false,
  side = 'top',
  className = ''
}: MedicalTooltipProps) {
  const content = getTooltipContent(termId);

  if (!content) {
    console.warn(`Medical tooltip content not found for term: ${termId}`);
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`inline-flex items-center gap-1 cursor-help border-b border-dotted border-green-500 ${className}`}
          style={{ textDecoration: 'none' }}
        >
          {children}
          {showIcon && <Stethoscope className="h-3 w-3 text-green-600" />}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className="max-w-[320px] p-4 text-left"
        style={{ backgroundColor: '#0A2647', color: 'white', zIndex: 9999 }}
        sideOffset={8}
      >
        <div className="space-y-2">
          {/* Term Title with Icon */}
          <div className="flex items-center gap-2 font-semibold text-sm border-b border-white/20 pb-2">
            <Stethoscope className="h-4 w-4" />
            <span>{content.term}</span>
          </div>

          {/* Definition */}
          <div className="text-xs leading-relaxed">
            {content.definition}
          </div>

          {/* Clinical Example */}
          {content.example && (
            <div className="text-xs bg-green-900/20 border border-green-700/30 rounded p-2 mt-2">
              <div className="font-medium mb-1 text-green-300">Exemplo Clínico:</div>
              <div className="text-white/90">{content.example}</div>
            </div>
          )}

          {/* Clinical Interpretation */}
          {content.interpretation && (
            <div className="text-xs mt-2 text-white/80">
              <div className="font-medium mb-1 text-blue-300">Considerações:</div>
              <div>{content.interpretation}</div>
            </div>
          )}

          {/* Learn More Link */}
          {content.learnMoreUrl && (
            <Link
              href={content.learnMoreUrl}
              className="inline-flex items-center gap-1 text-xs text-green-300 hover:text-green-200 mt-2"
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
 * MedicalTooltipIcon Component
 *
 * Small medical icon with tooltip for inline use next to medical terms.
 *
 * Usage:
 * <span>Hemorroidectomia <MedicalTooltipIcon termId="hemorroidectomia" /></span>
 */
export function MedicalTooltipIcon({
  termId,
  side = 'top',
  className = ''
}: Omit<MedicalTooltipProps, 'children' | 'showIcon'>) {
  const content = getTooltipContent(termId);

  if (!content) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors ${className}`}
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
          <div className="flex items-center gap-2 font-semibold text-sm border-b border-white/20 pb-2">
            <Stethoscope className="h-4 w-4" />
            <span>{content.term}</span>
          </div>
          <div className="text-xs leading-relaxed">
            {content.definition}
          </div>
          {content.example && (
            <div className="text-xs bg-green-900/20 border border-green-700/30 rounded p-2 mt-2">
              <div className="font-medium mb-1 text-green-300">Exemplo Clínico:</div>
              <div className="text-white/90">{content.example}</div>
            </div>
          )}
          {content.interpretation && (
            <div className="text-xs mt-2 text-white/80">
              <div className="font-medium mb-1 text-blue-300">Considerações:</div>
              <div>{content.interpretation}</div>
            </div>
          )}
          {content.learnMoreUrl && (
            <Link
              href={content.learnMoreUrl}
              className="inline-flex items-center gap-1 text-xs text-green-300 hover:text-green-200 mt-2"
            >
              Saiba mais <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
