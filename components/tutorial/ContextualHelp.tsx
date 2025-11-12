'use client';

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface ContextualHelpProps {
  title: string;
  content: string | React.ReactNode;
  learnMoreLink?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ContextualHelp({
  title,
  content,
  learnMoreLink,
  className = '',
  size = 'sm',
}: ContextualHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`inline-flex items-center justify-center text-blue-600 hover:text-blue-800 transition-colors ${className}`}
          aria-label={`Ajuda: ${title}`}
        >
          <HelpCircle className={iconSizes[size]} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" side="top" align="center">
        <div className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              {title}
            </h4>
            <div className="text-sm text-gray-700 leading-relaxed">
              {content}
            </div>
          </div>
          {learnMoreLink && (
            <div className="pt-2 border-t">
              <a
                href={learnMoreLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Saiba mais →
              </a>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Pre-configured contextual helps for common statistical concepts
export const StatisticalHelp = {
  ANOVA_F: () => (
    <ContextualHelp
      title="F-statistic (ANOVA)"
      content={
        <>
          <p className="mb-2">
            <strong>F-statistic</strong> mede a razão entre a variância{' '}
            <strong>entre grupos</strong> e a variância <strong>dentro dos grupos</strong>.
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>F alto = grande diferença entre grupos</li>
            <li>F baixo = grupos similares</li>
            <li>Sempre positivo (≥ 0)</li>
          </ul>
          <p className="mt-2 text-xs bg-blue-50 p-2 rounded">
            💡 <strong>F = 4.32</strong> significa que a variação entre grupos é 4.32x maior
            que dentro dos grupos
          </p>
        </>
      }
      size="md"
    />
  ),

  P_VALUE: () => (
    <ContextualHelp
      title="p-value (Valor-p)"
      content={
        <>
          <p className="mb-2">
            <strong>p-value</strong> é a probabilidade de obter resultados tão extremos
            quanto os observados, <strong>assumindo que a hipótese nula é verdadeira</strong>.
          </p>
          <div className="space-y-1 text-xs bg-gray-50 p-2 rounded">
            <div className="flex justify-between">
              <span>p &lt; 0.001</span>
              <strong className="text-green-700">Altamente significativo ***</strong>
            </div>
            <div className="flex justify-between">
              <span>p &lt; 0.01</span>
              <strong className="text-green-600">Muito significativo **</strong>
            </div>
            <div className="flex justify-between">
              <span>p &lt; 0.05</span>
              <strong className="text-blue-600">Significativo *</strong>
            </div>
            <div className="flex justify-between">
              <span>p ≥ 0.05</span>
              <strong className="text-gray-600">Não significativo ns</strong>
            </div>
          </div>
          <p className="mt-2 text-xs">
            ⚠️ <strong>Atenção:</strong> p-value baixo ≠ efeito grande. Sempre veja o
            tamanho do efeito!
          </p>
        </>
      }
      size="md"
    />
  ),

  COHENS_D: () => (
    <ContextualHelp
      title="Cohen's d (Tamanho do Efeito)"
      content={
        <>
          <p className="mb-2">
            <strong>Cohen's d</strong> mede a <strong>magnitude da diferença</strong> entre
            dois grupos em unidades de desvio padrão.
          </p>
          <div className="space-y-1 text-xs bg-gray-50 p-2 rounded">
            <div>
              <strong>d = 0.2:</strong> Efeito pequeno 📊
            </div>
            <div>
              <strong>d = 0.5:</strong> Efeito médio 📈
            </div>
            <div>
              <strong>d = 0.8:</strong> Efeito grande 📊📈
            </div>
            <div>
              <strong>d &gt; 1.2:</strong> Efeito muito grande 🚀
            </div>
          </div>
          <p className="mt-2 text-xs bg-blue-50 p-2 rounded">
            💡 Um estudo pode ter <strong>p &lt; 0.05</strong> (significativo) mas{' '}
            <strong>d = 0.1</strong> (efeito ínfimo = irrelevante clinicamente)
          </p>
        </>
      }
      size="md"
    />
  ),

  R_SQUARED: () => (
    <ContextualHelp
      title="R² (Coeficiente de Determinação)"
      content={
        <>
          <p className="mb-2">
            <strong>R²</strong> indica quanto da <strong>variação no desfecho</strong> é
            explicado pelo modelo de regressão.
          </p>
          <div className="space-y-1 text-xs bg-gray-50 p-2 rounded">
            <div>
              <strong>R² = 0.10:</strong> Modelo explica 10% da variação
            </div>
            <div>
              <strong>R² = 0.50:</strong> Modelo explica 50% da variação
            </div>
            <div>
              <strong>R² = 0.90:</strong> Modelo explica 90% da variação
            </div>
          </div>
          <p className="mt-2 text-xs">
            📊 <strong>R² = 0.65</strong> significa que 65% da variação na dor pós-operatória
            é explicada pelas variáveis do modelo (idade, IMC, técnica cirúrgica, etc.)
          </p>
        </>
      }
      size="md"
    />
  ),

  CONFIDENCE_INTERVAL: () => (
    <ContextualHelp
      title="Intervalo de Confiança (IC 95%)"
      content={
        <>
          <p className="mb-2">
            <strong>IC 95%</strong> representa o intervalo onde, em 95% das amostras, o
            verdadeiro valor populacional estaria contido.
          </p>
          <div className="text-xs bg-gray-50 p-2 rounded space-y-2">
            <p>
              <strong>Exemplo:</strong> Média de dor = 4.5, IC 95% [3.8, 5.2]
            </p>
            <p>
              Interpretação: Temos 95% de confiança que a média real de dor na população
              está entre 3.8 e 5.2
            </p>
          </div>
          <p className="mt-2 text-xs bg-blue-50 p-2 rounded">
            💡 IC mais estreito = estimativa mais precisa
            <br />
            IC mais largo = maior incerteza
          </p>
        </>
      }
      size="md"
    />
  ),

  POST_HOC: () => (
    <ContextualHelp
      title="Testes Post-Hoc"
      content={
        <>
          <p className="mb-2">
            <strong>Testes Post-Hoc</strong> (após ANOVA significativa) identificam{' '}
            <strong>quais pares de grupos diferem</strong> entre si.
          </p>
          <div className="space-y-1 text-xs bg-gray-50 p-2 rounded">
            <div>
              <strong>Tukey HSD:</strong> Conservador, controla erro Tipo I
            </div>
            <div>
              <strong>Bonferroni:</strong> Muito conservador, múltiplas comparações
            </div>
            <div>
              <strong>Dunnett:</strong> Compara todos vs controle
            </div>
          </div>
          <p className="mt-2 text-xs">
            🔍 <strong>Exemplo:</strong> ANOVA mostrou diferença entre A, B, C. Post-hoc
            revela: A≠B (p=0.003), A≠C (p=0.041), B=C (p=0.521)
          </p>
        </>
      }
      size="md"
    />
  ),

  KAPLAN_MEIER: () => (
    <ContextualHelp
      title="Curvas de Kaplan-Meier"
      content={
        <>
          <p className="mb-2">
            <strong>Kaplan-Meier</strong> é uma análise de{' '}
            <strong>tempo até evento</strong> (sobrevida, recorrência, recuperação).
          </p>
          <div className="space-y-1 text-xs bg-gray-50 p-2 rounded">
            <div>📉 Eixo Y: Probabilidade de sobrevida (0-1)</div>
            <div>📊 Eixo X: Tempo (dias, meses, anos)</div>
            <div>⬇️ Degraus: Momento em que evento ocorreu</div>
            <div>🔍 Log-rank test: Compara curvas entre grupos</div>
          </div>
          <p className="mt-2 text-xs bg-blue-50 p-2 rounded">
            💡 <strong>Útil para:</strong> Tempo até retorno ao trabalho, recorrência de
            sintomas, sobrevida livre de complicações
          </p>
        </>
      }
      size="md"
    />
  ),
};
