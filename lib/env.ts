/**
 * Environment Variables Validation
 * Valida todas as variáveis de ambiente necessárias no startup
 * Falha fast se alguma variável estiver faltando ou inválida
 */

import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL deve ser uma URL válida'),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET deve ter no mínimo 32 caracteres'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL deve ser uma URL válida'),
  AUTH_URL: z.string().url('AUTH_URL deve ser uma URL válida').optional(),

  // Anthropic Claude API
  ANTHROPIC_API_KEY: z.string()
    .startsWith('sk-ant-', 'ANTHROPIC_API_KEY deve começar com sk-ant-'),

  // WhatsApp Business Cloud API
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1),
  WHATSAPP_ACCESS_TOKEN: z.string().min(1),
  WHATSAPP_VERIFY_TOKEN: z.string().min(1),

  // Médico (configurações padrão)
  DOCTOR_NAME: z.string().optional(),
  DOCTOR_PHONE: z.string().optional(),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Monitoramento (opcional em dev)
  SENTRY_DSN: z.string().url().optional(),

  // Cron (opcional)
  CRON_SECRET: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

/**
 * Valida environment variables
 * Chamado no startup da aplicação
 * @throws {Error} Se alguma variável estiver inválida
 */
export function validateEnv(): Env {
  try {
    const env = envSchema.parse(process.env)

    // Log de sucesso (apenas em desenvolvimento)
    if (env.NODE_ENV === 'development') {
      console.log('✅ Environment variables validated successfully')
    }

    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:')
      console.error(error.errors.map(e => `  - ${e.path.join('.')}: ${e.message}`).join('\n'))
      throw new Error('Invalid environment variables. Check .env file.')
    }
    throw error
  }
}

/**
 * Environment variables tipadas e validadas
 * Use este objeto ao invés de process.env diretamente
 */
export const env = validateEnv()
