"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FlaskConical } from 'lucide-react';

interface ResearchRequiredBadgeProps {
  isResearchParticipant: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Badge component to indicate required fields for research participants
 * Shows a red "Obrigatório para pesquisa" badge
 */
export function ResearchRequiredBadge({
  isResearchParticipant,
  className = '',
  size = 'sm',
}: ResearchRequiredBadgeProps) {
  // Don't show for non-research patients
  if (!isResearchParticipant) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <Badge
      variant="destructive"
      className={`font-semibold inline-flex items-center gap-1 ${sizeClasses[size]} ${className}`}
    >
      <FlaskConical className={iconSizes[size]} />
      Obrigatório para pesquisa
    </Badge>
  );
}

/**
 * Inline indicator for field labels
 */
export function ResearchRequiredIndicator({
  isResearchParticipant,
}: {
  isResearchParticipant: boolean;
}) {
  if (!isResearchParticipant) {
    return <span className="text-red-500">*</span>;
  }

  return (
    <span className="inline-flex items-center gap-1 ml-1">
      <span className="text-red-500">*</span>
      <Badge
        variant="destructive"
        className="text-xs px-1.5 py-0 font-semibold inline-flex items-center gap-0.5"
      >
        <FlaskConical className="h-2.5 w-2.5" />
        Pesquisa
      </Badge>
    </span>
  );
}
