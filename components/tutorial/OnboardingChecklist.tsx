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
        colors: ['#0A2647', '#D4AF37', '#3B82F6', '#10B981'],
      });
    }
  }, [isAllComplete, hasShownConfetti]);

  if (isAllComplete) {
    return (
      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-green-900">
              Parabéns! Você completou o onboarding! 🎉
            </h3>
            <p className="text-sm text-green-700">
              Agora você domina todas as funcionalidades principais do Telos.AI
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHasShownConfetti(false)}
              className="mt-2"
            >
              🎊 Celebrar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Checklist de Onboarding</CardTitle>
              <CardDescription className="text-xs">
                Complete estas etapas para dominar o sistema
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-700 font-semibold"
            >
              {completedCount}/{totalCount}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8"
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
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Progresso</span>
              <span className="font-bold text-blue-600">
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
                className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                  item.completed
                    ? 'bg-green-50 border-green-300'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="mt-0.5">
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <h4
                    className={`font-semibold text-sm ${
                      item.completed ? 'text-green-900 line-through' : 'text-gray-900'
                    }`}
                  >
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </div>
                {!item.completed && item.action && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={item.action}
                    className="shrink-0 text-xs h-8 px-3"
                  >
                    {item.actionLabel}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Encouragement Message */}
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-3 border border-blue-200">
            <p className="text-sm text-blue-800 text-center font-medium">
              {completedCount === 0 && '🚀 Comece sua jornada no Telos.AI!'}
              {completedCount > 0 && completedCount < 3 && '💪 Continue! Você está indo muito bem!'}
              {completedCount >= 3 && completedCount < totalCount && '⭐ Quase lá! Falta pouco!'}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
