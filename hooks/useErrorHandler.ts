import { useCallback } from 'react';
import { logger } from '@/lib/logger';

/**
 * Hook for handling errors in functional components
 *
 * Provides a unified way to handle errors across the application.
 * Integrates with centralized logger and Sentry.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { handleError } = useErrorHandler();
 *
 *   const handleSubmit = async () => {
 *     try {
 *       await submitData();
 *     } catch (error) {
 *       handleError(error as Error, 'MyComponent.handleSubmit');
 *     }
 *   };
 * }
 * ```
 */
export function useErrorHandler() {
  const handleError = useCallback((error: Error, context?: string) => {
    // Log error to console and centralized logger
    logger.error(`Error in ${context || 'unknown context'}:`, error);

    // Report to Sentry if available
    if (typeof window !== 'undefined') {
      try {
        import('@sentry/nextjs').then((Sentry) => {
          Sentry.captureException(error, {
            tags: { context: context || 'unknown' }
          });
        }).catch(() => {
          // Silently fail if Sentry not available
        });
      } catch {
        // Ignore Sentry errors
      }
    }
  }, []);

  return { handleError };
}
