'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTutorial } from './TutorialProvider';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: () => void;
  actionLabel?: string;
}

export function OnboardingChecklist() {
  const { isTutorialCompleted, startTutorial, getCompletionRate } = useTutorial();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);

  const checklistItems: ChecklistItem[] = [
    {
      id: 'complete-dashboard-tour',
      title: 'Complete o tour do dashboard',
      description: 'Conheça as funcionalidades principais',
      completed: isTutorialCompleted('dashboard-tour'),
      action: () => startTutorial('dashboard-tour'),
      actionLabel: 'Iniciar Tour',
    },
    {
      id: 'register-first-patient',
      title: 'Cadastre seu primeiro paciente',
      description: 'Use o Cadastro Express em 30 segundos',
      completed: isTutorialCompleted('patient-registration'),
      action: () => (window.location.href = '/cadastro'),
      actionLabel: 'Cadastrar Paciente',
    },
    {
      id: 'learn-patient-management',
      title: 'Aprenda a gerenciar pacientes',
      description: 'Filtros, busca e acompanhamento',
      completed: isTutorialCompleted('patient-management'),
      action: () => startTutorial('patient-management'),
      actionLabel: 'Ver Tutorial',
    },
    {
      id: 'create-first-research',
      title: 'Crie sua primeira pesquisa',
      description: 'Configure um estudo clínico',
      completed: isTutorialCompleted('research-creation'),
      action: () => (window.location.href = '/dashboard/pesquisas'),
      actionLabel: 'Criar Pesquisa',
    },
    {
      id: 'learn-statistics',
      title: 'Explore análise estatística',
      description: 'ANOVA, regressão e testes estatísticos',
      completed: isTutorialCompleted('statistical-analysis'),
      action: () => startTutorial('statistical-analysis'),
      actionLabel: 'Ver Tutorial',
    },
  ];

  const completedCount = checklistItems.filter((item) => item.completed).length;
  const totalCount = checklistItems.length;
  const progressPercentage = (completedCount / totalCount) * 100;
  const isAllComplete = completedCount === totalCount;

  // Show confetti when all completed
  useEffect(() => {
    if (isAllComplete && !hasShownConfetti) {
      setHasShownConfetti(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0D7377', '#14BDAE', '#F0EAD6', '#10B981'],
      });
    }
  }, [isAllComplete, hasShownConfetti]);

  if (isAllComplete) {
    return (
      <Card className="border-0" style={{ backgroundColor: '#111520', boxShadow: '0 0 0 2px #0D7377' }}>
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold" style={{ color: '#F0EAD6' }}>
              Parabéns! Você completou o onboarding!
            </h3>
            <p className="text-sm" style={{ color: '#7A8299' }}>
              Agora você domina todas as funcionalidades principais do VigIA
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHasShownConfetti(false)}
              className="mt-2"
              style={{ backgroundColor: '#1E2535', borderColor: '#2A3147', color: '#14BDAE' }}
            >
              Celebrar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0" style={{ backgroundColor: '#111520', boxShadow: '0 0 0 2px #0D7377' }}>
      <CardHeader className="pb-3" style={{ borderBottom: '1px solid #1E2535' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0D7377] to-[#0A5A5E] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg" style={{ color: '#F0EAD6' }}>Checklist de Onboarding</CardTitle>
              <CardDescription className="text-xs" style={{ color: '#7A8299' }}>
                Complete estas etapas para dominar o sistema
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="font-semibold"
              style={{ backgroundColor: 'rgba(13, 115, 119, 0.2)', color: '#14BDAE' }}
            >
              {completedCount}/{totalCount}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 hover:bg-[#1E2535]"
              style={{ color: '#D8DEEB' }}
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-4 pt-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium" style={{ color: '#D8DEEB' }}>Progresso</span>
              <span className="font-bold" style={{ color: '#14BDAE' }}>
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {/* Checklist Items */}
          <div className="space-y-2">
            {checklistItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg transition-all"
                style={{
                  backgroundColor: item.completed ? 'rgba(16, 185, 129, 0.08)' : '#161B27',
                  border: item.completed ? '2px solid rgba(16, 185, 129, 0.3)' : '2px solid #1E2535',
                }}
              >
                <div className="mt-0.5">
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Circle className="h-5 w-5" style={{ color: '#7A8299' }} />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <h4
                    className={`font-semibold text-sm ${
                      item.completed ? 'line-through' : ''
                    }`}
                    style={{ color: item.completed ? '#7A8299' : '#F0EAD6' }}
                  >
                    {item.title}
                  </h4>
                  <p className="text-xs" style={{ color: '#7A8299' }}>{item.description}</p>
                </div>
                {!item.completed && item.action && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={item.action}
                    className="shrink-0 text-xs h-8 px-3"
                    style={{ backgroundColor: '#1E2535', borderColor: '#2A3147', color: '#14BDAE' }}
                  >
                    {item.actionLabel}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Encouragement Message */}
          <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(13, 115, 119, 0.1)', border: '1px solid rgba(13, 115, 119, 0.2)' }}>
            <p className="text-sm text-center font-medium" style={{ color: '#14BDAE' }}>
              {completedCount === 0 && 'Comece sua jornada no VigIA!'}
              {completedCount > 0 && completedCount < 3 && 'Continue! Você está indo muito bem!'}
              {completedCount >= 3 && completedCount < totalCount && 'Quase lá! Falta pouco!'}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
