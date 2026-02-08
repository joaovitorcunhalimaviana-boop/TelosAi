/**
 * Centralized phone number formatting utilities
 * Handles Brazilian phone numbers with country code, DDD, etc.
 */

/**
 * Extracts only digits from a phone string
 */
export function extractDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Formats phone for display: +55 (11) 99999-9999
 */
export function formatPhoneForDisplay(phone: string): string {
  const digits = extractDigits(phone);

  // Remove country code if present
  const cleaned = digits.startsWith('55') ? digits.slice(2) : digits;

  if (cleaned.length === 11) {
    // Mobile with DDD: 11999999999
    return `+55 (${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    // Landline with DDD: 1133334444
    return `+55 (${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }

  return phone; // Return original if can't format
}

/**
 * Formats phone for WhatsApp API: 5511999999999
 */
export function formatPhoneForWhatsApp(phone: string): string {
  const digits = extractDigits(phone);

  // Ensure it starts with 55 (Brazil)
  if (!digits.startsWith('55')) {
    return `55${digits}`;
  }

  return digits;
}

/**
 * Normalizes phone for database storage and comparison
 * Returns just digits with country code: 5511999999999
 */
export function normalizePhone(phone: string): string {
  return formatPhoneForWhatsApp(phone);
}

/**
 * Checks if two phone numbers are the same (ignoring formatting)
 */
export function phonesMatch(phone1: string, phone2: string): boolean {
  return normalizePhone(phone1) === normalizePhone(phone2);
}

/**
 * Validates if a phone number is a valid Brazilian number
 */
export function isValidBrazilianPhone(phone: string): boolean {
  const digits = extractDigits(phone);
  const cleaned = digits.startsWith('55') ? digits.slice(2) : digits;

  // Must be 10 (landline) or 11 (mobile) digits
  return cleaned.length === 10 || cleaned.length === 11;
}
