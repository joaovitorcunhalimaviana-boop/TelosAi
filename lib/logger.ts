/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Centralized Logger System
 *
 * Provides structured logging with environment-aware level filtering
 * and optional Sentry integration for production error tracking.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableSentry: boolean;
}

class Logger {
  private config: LoggerConfig;
  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor() {
    this.config = {
      // In production, default to 'info' to ensure visibility of key events
      level: (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
      enableConsole: true,
      enableSentry: process.env.NODE_ENV === 'production',
    };
  }

  /**
   * Check if a log level should be output based on current config
   */
  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.config.level];
  }

  /**
   * Format log message with emoji in development
   */
  private formatMessage(level: LogLevel, message: string): string {
    const isDev = process.env.NODE_ENV !== 'production';

    if (isDev) {
      const emoji = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
      };
      return `${emoji[level]} [${level.toUpperCase()}] ${message}`;
    }

    return `[${level.toUpperCase()}] ${message}`;
  }

  /**
   * Debug logs - only in development
   * Use for verbose information that helps during development
   */
  debug(message: string, data?: any): void {
    if (!this.shouldLog('debug') || !this.config.enableConsole) return;

    console.log(this.formatMessage('debug', message), data !== undefined ? data : '');
  }

  /**
   * Info logs - general information
   * Use for important state changes or milestones
   */
  info(message: string, data?: any): void {
    if (!this.shouldLog('info') || !this.config.enableConsole) return;

    console.log(this.formatMessage('info', message), data !== undefined ? data : '');
  }

  /**
   * Warning logs - potential issues
   * Use for unexpected situations that don't break functionality
   */
  warn(message: string, data?: any): void {
    if (!this.shouldLog('warn') || !this.config.enableConsole) return;

    console.warn(this.formatMessage('warn', message), data !== undefined ? data : '');
  }

  /**
   * Error logs - critical issues
   * Use for exceptions and failures
   * Automatically reports to Sentry in production
   */
  error(message: string, error?: Error | any): void {
    if (!this.shouldLog('error') || !this.config.enableConsole) return;

    console.error(this.formatMessage('error', message), error || '');

    // Send to Sentry in production if available
    if (this.config.enableSentry && typeof window !== 'undefined') {
      try {
        // Dynamic import to avoid errors if Sentry is not configured
        import('@sentry/nextjs').then((Sentry) => {
          if (error instanceof Error) {
            Sentry.captureException(error, {
              extra: { message },
            });
          } else {
            Sentry.captureMessage(`${message}: ${JSON.stringify(error)}`, 'error');
          }
        }).catch(() => {
          // Silently fail if Sentry is not available
        });
      } catch {
        // Ignore Sentry errors
      }
    }
  }

  /**
   * Set log level dynamically (useful for testing)
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Enable/disable console output
   */
  setConsoleEnabled(enabled: boolean): void {
    this.config.enableConsole = enabled;
  }

  /**
   * Enable/disable Sentry reporting
   */
  setSentryEnabled(enabled: boolean): void {
    this.config.enableSentry = enabled;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for use in other files
export type { LogLevel, LoggerConfig };
