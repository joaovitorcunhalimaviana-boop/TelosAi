'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { driver, DriveStep, Driver, Config } from 'driver.js';
import 'driver.js/dist/driver.css';
import { TutorialId, getTutorialSteps, tutorialMetadata } from '@/lib/tutorial-steps';
import { getTutorialAnalytics, TutorialAnalyticsManager } from '@/lib/tutorial-analytics';

interface TutorialContextType {
  startTutorial: (tutorialId: TutorialId, options?: Partial<Config>) => void;
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
  driverInstance: Driver | null;
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
  const [driverInstance, setDriverInstance] = useState<Driver | null>(null);
  const [currentTutorial, setCurrentTutorial] = useState<TutorialId | null>(null);
  const [tutorialStartTime, setTutorialStartTime] = useState<number>(0);
  const router = useRouter();
  const pathname = usePathname();

  // Custom styling for driver.js to match Telos.AI brand
  const defaultDriverConfig: Partial<Config> = {
    animate: true,
    showProgress: true,
    showButtons: ['next', 'previous', 'close'],
    nextBtnText: 'Próximo →',
    prevBtnText: '← Anterior',
    doneBtnText: 'Concluir ✓',
    progressText: '{{current}} de {{total}}',
    overlayOpacity: 0.5,
    popoverClass: 'telos-tutorial-popover',
    allowClose: true,
    disableActiveInteraction: false,
    smoothScroll: true,
    stagePadding: 10,
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    onHighlightStarted: () => {
      // Force overlay to not block clicks
      const overlay = document.querySelector('.driver-overlay') as HTMLElement;
      if (overlay) {
        overlay.style.pointerEvents = 'none';
      }
    },
    onPopoverRender: (popover) => {
      // Add custom classes to popover
      const popoverElement = popover.wrapper;
      popoverElement.style.borderRadius = '12px';
      popoverElement.style.maxWidth = '420px';
      popoverElement.style.zIndex = '2147483647'; // Maximum z-index
      popoverElement.style.pointerEvents = 'all';

      // CRITICAL FIX: Force overlay to NEVER block any clicks
      const fixOverlay = () => {
        const overlays = document.querySelectorAll('.driver-overlay, .driver-overlay-clickable');
        overlays.forEach((overlay) => {
          (overlay as HTMLElement).style.pointerEvents = 'none';
          (overlay as HTMLElement).style.zIndex = '2147483646'; // Just below popover
        });
      };

      fixOverlay();
      // Keep fixing it in case driver.js recreates it
      setTimeout(fixOverlay, 10);
      setTimeout(fixOverlay, 50);
      setTimeout(fixOverlay, 100);

      // Force all buttons and interactive elements to be clickable
      const allInteractive = popoverElement.querySelectorAll('button, .driver-popover-close-btn, .driver-popover-footer, .driver-popover-navigation-btns');
      allInteractive.forEach((element) => {
        (element as HTMLElement).style.pointerEvents = 'all';
        (element as HTMLElement).style.zIndex = '2147483647';
        (element as HTMLElement).style.position = 'relative';
        (element as HTMLElement).style.cursor = 'pointer';
      });

      // Style header
      const title = popoverElement.querySelector('.driver-popover-title');
      if (title) {
        (title as HTMLElement).style.fontSize = '18px';
        (title as HTMLElement).style.fontWeight = '700';
        (title as HTMLElement).style.color = '#0A2647';
        (title as HTMLElement).style.marginBottom = '8px';
      }

      // Style description
      const description = popoverElement.querySelector('.driver-popover-description');
      if (description) {
        (description as HTMLElement).style.fontSize = '14px';
        (description as HTMLElement).style.lineHeight = '1.6';
        (description as HTMLElement).style.color = '#374151';
      }

      // Style buttons
      const nextBtn = popoverElement.querySelector('.driver-popover-next-btn');
      if (nextBtn) {
        (nextBtn as HTMLElement).style.backgroundColor = '#0A2647';
        (nextBtn as HTMLElement).style.color = 'white';
        (nextBtn as HTMLElement).style.border = 'none';
        (nextBtn as HTMLElement).style.padding = '8px 16px';
        (nextBtn as HTMLElement).style.borderRadius = '6px';
        (nextBtn as HTMLElement).style.fontWeight = '600';
        (nextBtn as HTMLElement).style.cursor = 'pointer';
        (nextBtn as HTMLElement).style.zIndex = '999999';
        (nextBtn as HTMLElement).style.position = 'relative';
        (nextBtn as HTMLElement).style.pointerEvents = 'auto';
      }

      const prevBtn = popoverElement.querySelector('.driver-popover-prev-btn');
      if (prevBtn) {
        (prevBtn as HTMLElement).style.backgroundColor = '#E5E7EB';
        (prevBtn as HTMLElement).style.color = '#374151';
        (prevBtn as HTMLElement).style.border = 'none';
        (prevBtn as HTMLElement).style.padding = '8px 16px';
        (prevBtn as HTMLElement).style.borderRadius = '6px';
        (prevBtn as HTMLElement).style.fontWeight = '600';
        (prevBtn as HTMLElement).style.cursor = 'pointer';
        (prevBtn as HTMLElement).style.zIndex = '999999';
        (prevBtn as HTMLElement).style.position = 'relative';
        (prevBtn as HTMLElement).style.pointerEvents = 'auto';
      }

      const closeBtn = popoverElement.querySelector('.driver-popover-close-btn');
      if (closeBtn) {
        (closeBtn as HTMLElement).style.color = '#9CA3AF';
        (closeBtn as HTMLElement).style.fontSize = '24px';
        (closeBtn as HTMLElement).style.fontWeight = '300';
        (closeBtn as HTMLElement).style.cursor = 'pointer';
        (closeBtn as HTMLElement).style.zIndex = '999999';
        (closeBtn as HTMLElement).style.position = 'relative';
        (closeBtn as HTMLElement).style.pointerEvents = 'auto';
      }

      // Style progress
      const progress = popoverElement.querySelector('.driver-popover-progress-text');
      if (progress) {
        (progress as HTMLElement).style.fontSize = '12px';
        (progress as HTMLElement).style.color = '#6B7280';
        (progress as HTMLElement).style.fontWeight = '500';
      }
    },
  };

  const startTutorial = useCallback(
    (tutorialId: TutorialId, options: Partial<Config> = {}) => {
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

      // Stop any existing tutorial
      if (driverInstance) {
        driverInstance.destroy();
      }

      const steps = getTutorialSteps(tutorialId);
      if (steps.length === 0) {
        console.warn(`No steps found for tutorial: ${tutorialId}`);
        return;
      }

      // Check if first step element exists
      const firstStep = steps[0];
      if (firstStep.element) {
        const element = document.querySelector(firstStep.element as string);
        if (!element) {
          console.error(`Tutorial element not found: ${firstStep.element}`);
          console.error('Available elements:', {
            dashboardHeader: document.querySelector('#dashboard-header'),
            body: document.body,
          });
          return;
        }
      }

      setCurrentTutorial(tutorialId);
      setTutorialStartTime(Date.now());
      analyticsManager.startTutorial(tutorialId, steps.length);

      const config: Config = {
        ...defaultDriverConfig,
        ...options,
        steps,
        onDestroyed: (element, step, options_) => {
          setCurrentTutorial(null);
          if (options.onDestroyed) {
            options.onDestroyed(element, step, options_);
          }
        },
        onDestroyStarted: (element, step, options_) => {
          // Calculate time spent
          const timeSpent = Math.floor((Date.now() - tutorialStartTime) / 1000);

          // Check if tutorial was completed (reached last step)
          const currentStepIndex = newDriver.getActiveIndex() ?? 0;
          const isCompleted = currentStepIndex === steps.length - 1;

          if (isCompleted) {
            analyticsManager.completeTutorial(tutorialId, timeSpent);
          }

          if (options.onDestroyStarted) {
            options.onDestroyStarted(element, step, options_);
          }
        },
        onNextClick: (element, step, opts) => {
          const currentStepIndex = newDriver.getActiveIndex() ?? 0;
          analyticsManager.updateTutorialStep(tutorialId, currentStepIndex + 1);

          if (options.onNextClick) {
            options.onNextClick(element, step, opts);
          }
        },
        onPopoverRender: (popover, options_) => {
          // Call the default onPopoverRender first
          if (defaultDriverConfig.onPopoverRender) {
            defaultDriverConfig.onPopoverRender(popover, options_);
          }

          // CRITICAL FIX: Add manual click handlers to ensure buttons work
          setTimeout(() => {
            const nextBtn = document.querySelector('.driver-popover-next-btn') as HTMLButtonElement;
            const prevBtn = document.querySelector('.driver-popover-prev-btn') as HTMLButtonElement;
            const closeBtn = document.querySelector('.driver-popover-close-btn') as HTMLButtonElement;

            console.log('🔍 DEBUG: Tentando adicionar event listeners');
            console.log('nextBtn:', nextBtn);
            console.log('prevBtn:', prevBtn);
            console.log('closeBtn:', closeBtn);

            if (nextBtn) {
              console.log('✅ SUBSTITUINDO botão PRÓXIMO por um novo');

              // SOLUÇÃO RADICAL: Criar um botão completamente novo
              const newNextBtn = document.createElement('button');
              newNextBtn.type = 'button';
              newNextBtn.className = 'driver-popover-next-btn-custom';
              newNextBtn.textContent = 'Próximo →';
              newNextBtn.style.cssText = `
                display: block;
                background-color: #0A2647;
                color: white;
                border: 2px solid #D4AF37;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                z-index: 2147483647;
                position: relative;
                pointer-events: all;
              `;

              // Adiciona evento de clique NO NOVO BOTÃO
              newNextBtn.addEventListener('click', (e) => {
                console.log('🎯 NOVO BOTÃO CLICADO!');
                e.preventDefault();
                e.stopPropagation();
                newDriver.moveNext();
              });

              newNextBtn.addEventListener('mouseenter', () => {
                console.log('🖱️ Mouse no NOVO botão');
                newNextBtn.style.opacity = '0.9';
              });

              newNextBtn.addEventListener('mouseleave', () => {
                newNextBtn.style.opacity = '1';
              });

              // REMOVE completamente o botão antigo e adiciona o novo
              const parent = nextBtn.parentNode;
              if (parent) {
                parent.removeChild(nextBtn);
                parent.appendChild(newNextBtn);
                console.log('✅ Botão antigo removido, novo botão inserido!');
                console.log('🔍 Novo botão:', newNextBtn);
                console.log('🔍 Parent:', parent);

                // Verifica se o novo botão está visível
                setTimeout(() => {
                  const rect = newNextBtn.getBoundingClientRect();
                  console.log('📏 Posição do novo botão:', rect);
                  const elementAtPosition = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
                  console.log('🔍 Elemento na posição do novo botão:', elementAtPosition);
                  console.log('🔍 É o novo botão?', elementAtPosition === newNextBtn);

                  // Se NÃO for o novo botão, algo está cobrindo!
                  if (elementAtPosition !== newNextBtn) {
                    console.error('❌ ALGO ESTÁ COBRINDO O NOVO BOTÃO!');
                    console.error('❌ Elemento que está cobrindo:', elementAtPosition);

                    // Tenta remover o que está cobrindo
                    if (elementAtPosition && elementAtPosition !== newNextBtn) {
                      (elementAtPosition as HTMLElement).style.pointerEvents = 'none';
                      console.log('🔧 Desabilitei pointer-events do elemento que cobre');
                    }
                  }
                }, 200);
              } else {
                console.error('❌ Parent não encontrado!');
              }
            } else {
              console.error('❌ Botão PRÓXIMO não encontrado!');
            }

            if (prevBtn) {
              console.log('✅ Adicionando listener no botão ANTERIOR');
              prevBtn.style.border = '2px solid blue';

              const clickHandler = (e: MouseEvent) => {
                console.log('🎯 CLIQUE NO BOTÃO ANTERIOR DETECTADO!');
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                newDriver.movePrevious();
              };

              prevBtn.addEventListener('click', clickHandler, { capture: true });
              prevBtn.addEventListener('mousedown', clickHandler, { capture: true });
            }

            if (closeBtn) {
              console.log('✅ SUBSTITUINDO botão FECHAR por um novo');

              // SOLUÇÃO RADICAL: Criar um botão completamente novo para fechar
              const newCloseBtn = document.createElement('button');
              newCloseBtn.type = 'button';
              newCloseBtn.className = 'driver-popover-close-btn-custom';
              newCloseBtn.innerHTML = '×';
              newCloseBtn.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                background: transparent;
                border: none;
                color: #9CA3AF;
                font-size: 28px;
                font-weight: 300;
                cursor: pointer;
                z-index: 2147483647;
                pointer-events: all;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
              `;

              // Adiciona evento de clique NO NOVO BOTÃO
              newCloseBtn.addEventListener('click', (e) => {
                console.log('🎯 NOVO BOTÃO FECHAR CLICADO!');
                e.preventDefault();
                e.stopPropagation();
                newDriver.destroy();
              });

              newCloseBtn.addEventListener('mouseenter', () => {
                console.log('🖱️ Mouse no NOVO botão fechar');
                newCloseBtn.style.color = '#EF4444';
              });

              newCloseBtn.addEventListener('mouseleave', () => {
                newCloseBtn.style.color = '#9CA3AF';
              });

              // SUBSTITUI o botão antigo pelo novo
              closeBtn.parentNode?.insertBefore(newCloseBtn, closeBtn);
              closeBtn.style.display = 'none';

              console.log('✅ Novo botão fechar criado e inserido!');
            }

            // Log de todos os elementos clicáveis
            console.log('📋 Todos os botões no popover:', document.querySelectorAll('.driver-popover button'));
          }, 100);

          if (options.onPopoverRender) {
            options.onPopoverRender(popover, options_);
          }
        },
      };

      const newDriver = driver(config);
      setDriverInstance(newDriver);
      newDriver.drive();
    },
    [driverInstance, tutorialStartTime, analyticsManager, pathname, router]
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
    if (driverInstance) {
      driverInstance.destroy();
      setDriverInstance(null);
      setCurrentTutorial(null);
    }
  }, [driverInstance]);

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
    driverInstance,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}
