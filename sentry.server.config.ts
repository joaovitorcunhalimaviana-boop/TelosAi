import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Ajusta a taxa de amostragem para capturar 10% das transações em produção
  tracesSampleRate: 0.1,

  // Define o ambiente
  environment: process.env.NODE_ENV || 'development',

  // Desabilita em desenvolvimento local
  enabled: process.env.NODE_ENV === 'production',

  // Configurações específicas do servidor
  integrations: [
    Sentry.prismaIntegration(),
  ],

  // Ignora erros esperados
  ignoreErrors: [
    // Erros comuns de rede que não precisam ser reportados
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
  ],
});
