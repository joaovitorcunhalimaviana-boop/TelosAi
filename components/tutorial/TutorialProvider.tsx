'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { TutorialId, getTutorialSteps, tutorialMetadata } from '@/lib/tutorial-steps';
import { getTutorialAnalytics, TutorialAnalyticsManager } from '@/lib/tutorial-analytics';
import { CustomTutorial, TutorialStep } from './CustomTutorial';

interface TutorialContextType {
  startTutorial: (tutorialId: TutorialId) => void;
  stopTutorial: () => void;
  skipTutorial: (tutorialId: TutorialId) => void;
  resetTutorials: () => void;
  resetTutorial: (tutorialId: TutorialId) => void;
  isTutorialCompleted: (tutorialId: TutorialId) => boolean;
  isOnboardingComplete: () => boolean;
  getSuggestedTutorial: () => TutorialId | null;
  getCompletionRate: () => number;
  isFirstTimeUser: () => boolean;
  currentTutorial: TutorialId | null;
  driverInstance: null; // Mantido para compatibilidade
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
}

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [analyticsManager] = useState<TutorialAnalyticsManager>(() => getTutorialAnalytics());
  const [currentTutorial, setCurrentTutorial] = useState<TutorialId | null>(null);
  const [currentSteps, setCurrentSteps] = useState<TutorialStep[]>([]);
  const [tutorialStartTime, setTutorialStartTime] = useState<number>(0);
  const router = useRouter();
  const pathname = usePathname();

  const startTutorial = useCallback(
    (tutorialId: TutorialId) => {
      // Check if we need to navigate to a different route
      const metadata = tutorialMetadata[tutorialId];
      if (metadata?.route && pathname !== metadata.route) {
        console.log(`Redirecting to ${metadata.route} for tutorial ${tutorialId}`);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('pending_tutorial', tutorialId);
        }
        router.push(metadata.route);
        return;
      }

      const steps = getTutorialSteps(tutorialId);
      if (steps.length === 0) {
        console.warn(`No steps found for tutorial: ${tutorialId}`);
        return;
      }

      // Converte para o formato do CustomTutorial
      const customSteps: TutorialStep[] = steps.map(step => ({
        element: step.element as string | undefined,
        title: step.popover?.title || '',
        description: step.popover?.description || '',
      }));

      setCurrentTutorial(tutorialId);
      setCurrentSteps(customSteps);
      setTutorialStartTime(Date.now());
      analyticsManager.startTutorial(tutorialId, steps.length);
    },
    [analyticsManager, pathname, router]
  );

  // Check for pending tutorials after navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pendingTutorial = sessionStorage.getItem('pending_tutorial') as TutorialId | null;
      if (pendingTutorial && pathname === tutorialMetadata[pendingTutorial]?.route) {
        sessionStorage.removeItem('pending_tutorial');
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          startTutorial(pendingTutorial);
        }, 1000);
      }
    }
  }, [pathname, startTutorial]);

  const stopTutorial = useCallback(() => {
    setCurrentTutorial(null);
    setCurrentSteps([]);
  }, []);

  const handleTutorialClose = useCallback(() => {
    if (currentTutorial) {
      const timeSpent = Math.floor((Date.now() - tutorialStartTime) / 1000);
      analyticsManager.skipTutorial(currentTutorial);
    }
    stopTutorial();
  }, [currentTutorial, tutorialStartTime, analyticsManager, stopTutorial]);

  const handleTutorialComplete = useCallback(() => {
    if (currentTutorial) {
      const timeSpent = Math.floor((Date.now() - tutorialStartTime) / 1000);
      analyticsManager.completeTutorial(currentTutorial, timeSpent);
    }
  }, [currentTutorial, tutorialStartTime, analyticsManager]);

  const skipTutorial = useCallback(
    (tutorialId: TutorialId) => {
      analyticsManager.skipTutorial(tutorialId);
      stopTutorial();
    },
    [analyticsManager, stopTutorial]
  );

  const resetTutorials = useCallback(() => {
    analyticsManager.resetAllTutorials();
    stopTutorial();
  }, [analyticsManager, stopTutorial]);

  const resetTutorial = useCallback(
    (tutorialId: TutorialId) => {
      analyticsManager.resetTutorial(tutorialId);
    },
    [analyticsManager]
  );

  const isTutorialCompleted = useCallback(
    (tutorialId: TutorialId) => {
      return analyticsManager.isTutorialCompleted(tutorialId);
    },
    [analyticsManager]
  );

  const isOnboardingComplete = useCallback(() => {
    return analyticsManager.isOnboardingComplete();
  }, [analyticsManager]);

  const getSuggestedTutorial = useCallback(() => {
    return analyticsManager.getSuggestedTutorial();
  }, [analyticsManager]);

  const getCompletionRate = useCallback(() => {
    return analyticsManager.getCompletionRate();
  }, [analyticsManager]);

  const isFirstTimeUser = useCallback(() => {
    return analyticsManager.isFirstTimeUser();
  }, [analyticsManager]);

  // Auto-trigger dashboard tour for first-time users
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if on dashboard page and first time user
    const isDashboard = window.location.pathname === '/dashboard';
    if (isDashboard && isFirstTimeUser()) {
      // Delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (analyticsManager.shouldShowTutorial('dashboard-tour')) {
          startTutorial('dashboard-tour');
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isFirstTimeUser, analyticsManager, startTutorial]);

  const value: TutorialContextType = {
    startTutorial,
    stopTutorial,
    skipTutorial,
    resetTutorials,
    resetTutorial,
    isTutorialCompleted,
    isOnboardingComplete,
    getSuggestedTutorial,
    getCompletionRate,
    isFirstTimeUser,
    currentTutorial,
    driverInstance: null,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
      {currentTutorial && currentSteps.length > 0 && (
        <CustomTutorial
          steps={currentSteps}
          onClose={handleTutorialClose}
          onComplete={handleTutorialComplete}
          tutorialId={currentTutorial}
        />
      )}
    </TutorialContext.Provider>
  );
}
