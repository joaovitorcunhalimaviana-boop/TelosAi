/**
 * Tutorial Analytics System
 * Tracks user progress and tutorial effectiveness
 */

import { TutorialId } from './tutorial-steps';

export interface TutorialProgress {
  tutorialId: TutorialId;
  completed: boolean;
  startedAt?: Date;
  completedAt?: Date;
  skippedAt?: Date;
  currentStep?: number;
  totalSteps?: number;
  timeSpent?: number; // in seconds
}

export interface TutorialAnalytics {
  userId?: string;
  tutorials: Record<TutorialId, TutorialProgress>;
  totalTutorialsCompleted: number;
  totalTimeSpent: number;
  lastTutorialDate?: Date;
  onboardingComplete: boolean;
}

const STORAGE_KEY = 'telos_tutorial_analytics';

export class TutorialAnalyticsManager {
  private analytics: TutorialAnalytics;

  constructor() {
    this.analytics = this.loadAnalytics();
  }

  private loadAnalytics(): TutorialAnalytics {
    if (typeof window === 'undefined') {
      return this.getDefaultAnalytics();
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        if (parsed.lastTutorialDate) {
          parsed.lastTutorialDate = new Date(parsed.lastTutorialDate);
        }
        Object.keys(parsed.tutorials || {}).forEach((key) => {
          const tutorial = parsed.tutorials[key];
          if (tutorial.startedAt) tutorial.startedAt = new Date(tutorial.startedAt);
          if (tutorial.completedAt) tutorial.completedAt = new Date(tutorial.completedAt);
          if (tutorial.skippedAt) tutorial.skippedAt = new Date(tutorial.skippedAt);
        });
        return parsed;
      }
    } catch (error) {
      console.error('Error loading tutorial analytics:', error);
    }

    return this.getDefaultAnalytics();
  }

  private getDefaultAnalytics(): TutorialAnalytics {
    return {
      tutorials: {} as Record<TutorialId, TutorialProgress>,
      totalTutorialsCompleted: 0,
      totalTimeSpent: 0,
      onboardingComplete: false,
    };
  }

  private saveAnalytics(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.analytics));
    } catch (error) {
      console.error('Error saving tutorial analytics:', error);
    }
  }

  public startTutorial(tutorialId: TutorialId, totalSteps: number): void {
    if (!this.analytics.tutorials[tutorialId]) {
      this.analytics.tutorials[tutorialId] = {
        tutorialId,
        completed: false,
        totalSteps,
      };
    }

    this.analytics.tutorials[tutorialId].startedAt = new Date();
    this.analytics.tutorials[tutorialId].currentStep = 0;
    this.analytics.tutorials[tutorialId].totalSteps = totalSteps;
    this.analytics.lastTutorialDate = new Date();

    this.saveAnalytics();
  }

  public updateTutorialStep(tutorialId: TutorialId, step: number): void {
    if (this.analytics.tutorials[tutorialId]) {
      this.analytics.tutorials[tutorialId].currentStep = step;
      this.saveAnalytics();
    }
  }

  public completeTutorial(tutorialId: TutorialId, timeSpent: number): void {
    if (!this.analytics.tutorials[tutorialId]) {
      this.analytics.tutorials[tutorialId] = {
        tutorialId,
        completed: true,
      };
    }

    this.analytics.tutorials[tutorialId].completed = true;
    this.analytics.tutorials[tutorialId].completedAt = new Date();
    this.analytics.tutorials[tutorialId].timeSpent = timeSpent;
    this.analytics.totalTutorialsCompleted += 1;
    this.analytics.totalTimeSpent += timeSpent;
    this.analytics.lastTutorialDate = new Date();

    // Check if onboarding is complete (basic tutorials done)
    const basicTutorials: TutorialId[] = ['dashboard-tour', 'patient-registration', 'patient-management'];
    const basicComplete = basicTutorials.every(
      (id) => this.analytics.tutorials[id]?.completed
    );
    if (basicComplete) {
      this.analytics.onboardingComplete = true;
    }

    this.saveAnalytics();
  }

  public skipTutorial(tutorialId: TutorialId): void {
    if (!this.analytics.tutorials[tutorialId]) {
      this.analytics.tutorials[tutorialId] = {
        tutorialId,
        completed: false,
      };
    }

    this.analytics.tutorials[tutorialId].skippedAt = new Date();
    this.saveAnalytics();
  }

  public resetTutorial(tutorialId: TutorialId): void {
    if (this.analytics.tutorials[tutorialId]) {
      delete this.analytics.tutorials[tutorialId];
      this.saveAnalytics();
    }
  }

  public resetAllTutorials(): void {
    this.analytics = this.getDefaultAnalytics();
    this.saveAnalytics();
  }

  public getTutorialProgress(tutorialId: TutorialId): TutorialProgress | null {
    return this.analytics.tutorials[tutorialId] || null;
  }

  public isTutorialCompleted(tutorialId: TutorialId): boolean {
    return this.analytics.tutorials[tutorialId]?.completed || false;
  }

  public isOnboardingComplete(): boolean {
    return this.analytics.onboardingComplete;
  }

  public getAllProgress(): TutorialAnalytics {
    return { ...this.analytics };
  }

  public getCompletionRate(): number {
    const totalTutorials = 7; // Total number of tutorials
    return (this.analytics.totalTutorialsCompleted / totalTutorials) * 100;
  }

  public getAverageTutorialTime(): number {
    if (this.analytics.totalTutorialsCompleted === 0) return 0;
    return this.analytics.totalTimeSpent / this.analytics.totalTutorialsCompleted;
  }

  public shouldShowTutorial(tutorialId: TutorialId): boolean {
    // Show tutorial if:
    // 1. Never completed
    // 2. Not skipped in last 7 days
    const progress = this.analytics.tutorials[tutorialId];

    if (!progress) return true;
    if (progress.completed) return false;

    if (progress.skippedAt) {
      const daysSinceSkip = (Date.now() - progress.skippedAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceSkip > 7;
    }

    return true;
  }

  // For first-time users
  public isFirstTimeUser(): boolean {
    return Object.keys(this.analytics.tutorials).length === 0;
  }

  // Get suggested next tutorial based on progress
  public getSuggestedTutorial(): TutorialId | null {
    const priorityOrder: TutorialId[] = [
      'dashboard-tour',
      'patient-registration',
      'patient-management',
      'research-creation',
      'research-assignment',
      'statistical-analysis',
      'data-export',
    ];

    for (const tutorialId of priorityOrder) {
      if (!this.isTutorialCompleted(tutorialId) && this.shouldShowTutorial(tutorialId)) {
        return tutorialId;
      }
    }

    return null;
  }
}

// Singleton instance
let analyticsManager: TutorialAnalyticsManager | null = null;

export function getTutorialAnalytics(): TutorialAnalyticsManager {
  if (!analyticsManager) {
    analyticsManager = new TutorialAnalyticsManager();
  }
  return analyticsManager;
}
