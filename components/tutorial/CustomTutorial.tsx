'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export interface TutorialStep {
  element?: string;
  title: string;
  description: string;
}

interface CustomTutorialProps {
  steps: TutorialStep[];
  onClose: () => void;
  onComplete?: () => void;
  tutorialId?: string;
}

export function CustomTutorial({ steps, onClose, onComplete, tutorialId }: CustomTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 100, left: 100 });
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Calcula posição do popover e highlight
  useEffect(() => {
    if (!mounted || !step) return;

    const updatePosition = () => {
      if (step.element) {
        const element = document.querySelector(step.element);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });

          setTimeout(() => {
            const rect = element.getBoundingClientRect();
            setHighlightRect(rect);

            const popoverWidth = 400;
            const popoverHeight = 200;

            let top = rect.bottom + 15;
            let left = rect.left + (rect.width / 2) - (popoverWidth / 2);

            // Ajustes de posição
            if (left + popoverWidth > window.innerWidth - 20) {
              left = window.innerWidth - popoverWidth - 20;
            }
            if (top + popoverHeight > window.innerHeight - 20) {
              top = rect.top - popoverHeight - 15;
            }
            if (left < 20) left = 20;
            if (top < 20) top = 20;

            setPosition({ top, left });
          }, 300);
        } else {
          // Elemento não encontrado - centralizar
          setHighlightRect(null);
          setPosition({
            top: window.innerHeight / 2 - 100,
            left: window.innerWidth / 2 - 200,
          });
        }
      } else {
        // Sem elemento - centralizar
        setHighlightRect(null);
        setPosition({
          top: window.innerHeight / 2 - 100,
          left: window.innerWidth / 2 - 200,
        });
      }
    };

    const timer = setTimeout(updatePosition, 100);
    window.addEventListener('resize', updatePosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
    };
  }, [step, currentStep, mounted]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete?.();
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  }, [isLastStep, onComplete, onClose]);

  const handlePrev = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  }, [isFirstStep]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2147483640,
      }}
    >
      {/* Overlay escuro com recorte para highlight */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <defs>
          <mask id="tutorial-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {highlightRect && (
              <rect
                x={highlightRect.left - 8}
                y={highlightRect.top - 8}
                width={highlightRect.width + 16}
                height={highlightRect.height + 16}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#tutorial-mask)"
        />
      </svg>

      {/* Borda do highlight */}
      {highlightRect && (
        <div
          style={{
            position: 'absolute',
            top: highlightRect.top - 8,
            left: highlightRect.left - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
            border: '3px solid #D4AF37',
            borderRadius: '12px',
            boxShadow: '0 0 0 4px rgba(212, 175, 55, 0.3), 0 0 30px rgba(212, 175, 55, 0.4)',
            pointerEvents: 'none',
            zIndex: 2147483641,
          }}
        />
      )}

      {/* Popover */}
      <div
        style={{
          position: 'absolute',
          top: position.top,
          left: position.left,
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          width: '400px',
          maxWidth: 'calc(100vw - 40px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 3px rgba(212, 175, 55, 0.4)',
          border: '2px solid #D4AF37',
          zIndex: 2147483647,
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#0A2647',
            backgroundColor: '#F0F4F8',
            padding: '4px 12px',
            borderRadius: '20px'
          }}>
            Passo {currentStep + 1} de {steps.length}
          </div>

          {/* Botão fechar */}
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: '#F3F4F6',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              color: '#6B7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FEE2E2';
              e.currentTarget.style.color = '#DC2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F3F4F6';
              e.currentTarget.style.color = '#6B7280';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo */}
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          marginBottom: '12px',
          color: '#0A2647',
          lineHeight: '1.3'
        }}>
          {step.title}
        </h3>
        <p style={{
          fontSize: '15px',
          lineHeight: '1.7',
          color: '#4B5563',
          marginBottom: '24px'
        }}>
          {step.description}
        </p>

        {/* Barra de progresso */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '20px'
        }}>
          {steps.map((_, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                backgroundColor: idx <= currentStep ? '#0A2647' : '#E5E7EB',
                transition: 'background-color 0.3s'
              }}
            />
          ))}
        </div>

        {/* Botões de navegação */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          {!isFirstStep && (
            <button
              type="button"
              onClick={handlePrev}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                backgroundColor: '#F3F4F6',
                color: '#374151',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E5E7EB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F6';
              }}
            >
              <ChevronLeft size={16} />
              Anterior
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 24px',
              backgroundColor: '#0A2647',
              color: 'white',
              border: '2px solid #D4AF37',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(10, 38, 71, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0D3156';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0A2647';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isLastStep ? (
              <>
                <Check size={16} />
                Concluir
              </>
            ) : (
              <>
                Próximo
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
