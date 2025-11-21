'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 *
 * Captura erros em componentes filhos e exibe uma UI de fallback.
 * Integra com Sentry e sistema de logging centralizado.
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to centralized logger
    logger.error('Error caught by boundary', error);

    // Report to Sentry if available
    if (typeof window !== 'undefined') {
      try {
        import('@sentry/nextjs').then((Sentry) => {
          Sentry.captureException(error, {
            contexts: {
              react: {
                componentStack: errorInfo.componentStack
              }
            }
          });
        }).catch(() => {
          // Silently fail if Sentry not available
        });
      } catch {
        // Ignore Sentry errors
      }
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">
            Algo deu errado
          </h2>
          <p className="text-sm text-red-700 mb-4 text-center max-w-md">
            {this.state.error?.message || 'Erro desconhecido'}
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
            variant="outline"
          >
            Tentar novamente
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
