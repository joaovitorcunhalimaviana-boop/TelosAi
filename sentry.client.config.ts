import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Ajusta a taxa de amostragem para capturar 10% das transações em produção
  tracesSampleRate: 0.1,

  // Define o ambiente
  environment: process.env.NODE_ENV || 'development',

  // Desabilita em desenvolvimento local
  enabled: process.env.NODE_ENV === 'production',

  // Configurações de integração
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Session Replay: Captura 10% das sessões normais
  replaysSessionSampleRate: 0.1,

  // Session Replay: Captura 100% das sessões com erros
  replaysOnErrorSampleRate: 1.0,
});
