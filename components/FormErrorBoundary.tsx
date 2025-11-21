'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  formName?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Form-specific Error Boundary
 *
 * Provides enhanced error handling for forms with data preservation hints.
 * Shows helpful messages about autosave and data recovery.
 *
 * @example
 * ```tsx
 * <FormErrorBoundary formName="Cadastro de Paciente">
 *   <PatientRegistrationForm />
 * </FormErrorBoundary>
 * ```
 */
export class FormErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const formContext = this.props.formName || 'Form';
    logger.error(`Error in ${formContext}`, error);

    // Report to Sentry
    if (typeof window !== 'undefined') {
      try {
        import('@sentry/nextjs').then((Sentry) => {
          Sentry.captureException(error, {
            contexts: {
              react: {
                componentStack: errorInfo.componentStack
              },
              form: {
                name: formContext
              }
            }
          });
        }).catch(() => {});
      } catch {}
    }

    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const formName = this.props.formName || 'formulário';

      return (
        <div className="flex flex-col items-center justify-center p-8 max-w-2xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-lg">Erro no {formName}</AlertTitle>
            <AlertDescription className="mt-2">
              {this.state.error?.message || 'Ocorreu um erro inesperado no formulário'}
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 w-full">
            <div className="flex items-start gap-3">
              <Save className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Seus dados estão seguros
                </h3>
                <p className="text-sm text-blue-800 mb-2">
                  O sistema possui autosave automático. Seus dados foram salvos
                  automaticamente antes do erro ocorrer.
                </p>
                <p className="text-sm text-blue-800">
                  Ao recarregar, o formulário será restaurado com os dados salvos.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="flex-1"
              variant="default"
            >
              Tentar Novamente
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex-1"
              variant="outline"
            >
              Recarregar Página
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-6 text-center">
            Se o problema persistir, entre em contato com o suporte técnico
            <br />
            Código do erro: {this.state.error?.name || 'UNKNOWN'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
