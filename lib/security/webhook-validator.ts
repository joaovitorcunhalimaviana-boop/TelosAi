/**
 * WhatsApp Webhook Signature Validation
 * Valida que webhooks realmente vêm do Meta/WhatsApp
 *
 * Referência: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
 */

import crypto from 'crypto'

/**
 * Valida signature do WhatsApp webhook
 * @param signature - Header 'x-hub-signature-256' do webhook
 * @param body - Request body (raw)
 * @param appSecret - WHATSAPP_APP_SECRET
 * @returns true se signature é válida
 */
export function validateWhatsAppSignature(
  signature: string | null,
  body: string,
  appSecret: string
): boolean {
  if (!signature) {
    console.error('❌ Webhook signature missing')
    return false
  }

  // Remover prefixo 'sha256=' se existir
  const signatureHash = signature.startsWith('sha256=')
    ? signature.substring(7)
    : signature

  // Calcular HMAC SHA256 esperado
  const expectedHash = crypto
    .createHmac('sha256', appSecret)
    .update(body, 'utf-8')
    .digest('hex')

  // Comparação segura contra timing attacks
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signatureHash, 'hex'),
    Buffer.from(expectedHash, 'hex')
  )

  if (!isValid) {
    console.error('❌ Webhook signature validation failed')
    console.error(`Expected: ${expectedHash}`)
    console.error(`Received: ${signatureHash}`)
  }

  return isValid
}

/**
 * Valida hub challenge do WhatsApp (verificação inicial)
 * @param mode - Deve ser 'subscribe'
 * @param token - Deve corresponder ao WHATSAPP_VERIFY_TOKEN
 * @param challenge - Token challenge para retornar
 * @param verifyToken - WHATSAPP_VERIFY_TOKEN configurado
 * @returns challenge se válido, null se inválido
 */
export function validateHubChallenge(
  mode: string | null,
  token: string | null,
  challenge: string | null,
  verifyToken: string
): string | null {
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Webhook verified successfully')
    return challenge
  }

  console.error('❌ Hub verification failed')
  console.error(`Mode: ${mode}, Token match: ${token === verifyToken}`)
  return null
}
