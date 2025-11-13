'use client';

import { useState, useEffect } from 'react';

interface TourStep {
  element: string;
  title: string;
  description: string;
}

const DASHBOARD_STEPS: TourStep[] = [
  {
    element: '#dashboard-header',
    title: '👋 Bem-vindo ao Telos.AI',
    description: 'Este é seu painel de controle médico inteligente. Aqui você acompanha todos os seus pacientes em tempo real com tecnologia de ponta.',
  },
  {
    element: '[data-tutorial="new-patient-btn"]',
    title: '➕ Novo Paciente',
    description: 'Clique aqui para cadastrar um novo paciente no sistema. O cadastro é rápido e intuitivo, permitindo adicionar todas as informações necessárias.',
  },
  {
    element: '[data-tutorial="research-btn"]',
    title: '🔬 Modo Pesquisa',
    description: 'Organize seus pacientes em grupos de pesquisa científica. Perfeito para estudos clínicos e análise de resultados em larga escala.',
  },
  {
    element: '[data-tutorial="stats-today-surgeries"]',
    title: '📅 Cirurgias Hoje',
    description: 'Acompanhe em tempo real quantos pacientes foram operados hoje. Este indicador ajuda a gerenciar sua agenda cirúrgica.',
  },
  {
    element: '[data-tutorial="stats-active-patients"]',
    title: '👥 Pacientes Ativos',
    description: 'Total de pacientes em acompanhamento pós-operatório ativo. Mantenha controle sobre todos os casos em andamento.',
  },
  {
    element: '[data-tutorial="stats-followups-today"]',
    title: '📋 Follow-ups Hoje',
    description: 'Quantidade de acompanhamentos programados para hoje. Nunca perca um follow-up importante com lembretes automáticos.',
  },
  {
    element: '[data-tutorial="stats-critical-alerts"]',
    title: '⚠️ Alertas Críticos',
    description: 'Pacientes que precisam de atenção urgente. O sistema detecta automaticamente situações de risco e alerta você imediatamente.',
  },
  {
    element: '[data-tutorial="search-filters"]',
    title: '🔍 Filtros e Busca',
    description: 'Use filtros avançados para encontrar pacientes rapidamente. Filtre por tipo de cirurgia, status, período ou faça buscas por nome.',
  },
];

export function SimpleTour({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const step = DASHBOARD_STEPS[currentStep];

  // Calcula posição do popover
  useEffect(() => {
    const updatePosition = () => {
      const element = document.querySelector(step.element);
      if (element) {
        // Scroll suave até o elemento
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Aguarda o scroll terminar antes de posicionar
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          const popoverWidth = 450;
          const popoverHeight = 250; // Altura estimada

          let top = rect.bottom + 10;
          let left = rect.left;

          // Ajusta se a caixa sair da tela à direita
          if (left + popoverWidth > window.innerWidth) {
            left = window.innerWidth - popoverWidth - 20;
          }

          // Ajusta se a caixa sair da tela embaixo
          if (top + popoverHeight > window.innerHeight) {
            top = rect.top - popoverHeight - 10;
          }

          // Garante que não saia da tela à esquerda
          if (left < 10) {
            left = 10;
          }

          // Garante que não saia da tela em cima
          if (top < 10) {
            top = 10;
          }

          setPosition({ top, left });
          console.log('📍 Position updated:', { top, left, element: step.element });
        }, 300);
      } else {
        console.error('❌ Element not found:', step.element);
      }
    };

    // Delay para garantir que o elemento está renderizado
    setTimeout(updatePosition, 100);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, [step.element]);

  const handleNext = () => {
    console.log('🎯 NEXT CLICADO! Step atual:', currentStep);
    if (currentStep < DASHBOARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    console.log('🎯 PREV CLICADO! Step atual:', currentStep);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
      {/* Overlay escuro */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999998,
          pointerEvents: 'none',
        }}
      />

      {/* Popover */}
      <div
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          width: '450px',
          maxWidth: '90vw',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          zIndex: 999999,
          pointerEvents: 'all',
        }}
      >
        {/* Botão fechar */}
        <button
          onClick={() => {
            console.log('🎯 CLOSE CLICADO!');
            onClose();
          }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#999',
            pointerEvents: 'all',
          }}
        >
          ×
        </button>

        {/* Conteúdo */}
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#0A2647' }}>
          {step.title}
        </h3>
        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#666', marginBottom: '20px' }}>
          {step.description}
        </p>

        {/* Botões */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {currentStep + 1} de {DASHBOARD_STEPS.length}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#E5E7EB',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  pointerEvents: 'all',
                }}
              >
                ← Anterior
              </button>
            )}

            <button
              onClick={handleNext}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0A2647',
                color: 'white',
                border: '2px solid #D4AF37',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                pointerEvents: 'all',
              }}
            >
              {currentStep < DASHBOARD_STEPS.length - 1 ? 'Próximo →' : 'Concluir ✓'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
