'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, Play } from 'lucide-react';
import { useTutorial } from './TutorialProvider';
import { TutorialId } from '@/lib/tutorial-steps';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TutorialTriggerProps {
  tutorialId: TutorialId;
  variant?: 'icon' | 'button' | 'inline';
  label?: string;
  className?: string;
}

export function TutorialTrigger({
  tutorialId,
  variant = 'icon',
  label = 'Iniciar Tutorial',
  className = '',
}: TutorialTriggerProps) {
  const { startTutorial, isTutorialCompleted } = useTutorial();

  const handleClick = () => {
    startTutorial(tutorialId);
  };

  const isCompleted = isTutorialCompleted(tutorialId);

  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClick}
              className={`relative ${className}`}
              aria-label={label}
            >
              <HelpCircle className="h-5 w-5 text-blue-600" />
              {isCompleted && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{label}</p>
            {isCompleted && <p className="text-xs text-green-600">✓ Concluído</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className={`gap-2 ${className}`}
      >
        <Play className="h-4 w-4" />
        {label}
        {isCompleted && <span className="text-green-600 text-xs ml-1">✓</span>}
      </Button>
    );
  }

  // inline variant
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium underline underline-offset-2 ${className}`}
    >
      <HelpCircle className="h-4 w-4" />
      {label}
      {isCompleted && <span className="text-green-600">✓</span>}
    </button>
  );
}
