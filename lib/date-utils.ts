/**
 * Utilitários para trabalhar com datas no horário de Brasília (UTC-3)
 */

import { startOfDay as fnsStartOfDay, endOfDay as fnsEndOfDay } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

export const BRASILIA_TZ = 'America/Sao_Paulo';

/**
 * Retorna a data/hora atual no horário de Brasília
 */
export function getNowBrasilia(): Date {
  return toZonedTime(new Date(), BRASILIA_TZ);
}

/**
 * Converte uma data para o horário de Brasília
 */
export function toBrasiliaTime(date: Date): Date {
  return toZonedTime(date, BRASILIA_TZ);
}

/**
 * Converte uma data do horário de Brasília para UTC
 */
export function fromBrasiliaTime(date: Date): Date {
  return fromZonedTime(date, BRASILIA_TZ);
}

/**
 * Retorna o início do dia (00:00:00) no horário de Brasília
 */
export function startOfDayBrasilia(date?: Date): Date {
  const brasiliaDate = date ? toBrasiliaTime(date) : getNowBrasilia();
  return fromBrasiliaTime(fnsStartOfDay(brasiliaDate));
}

/**
 * Retorna o final do dia (23:59:59.999) no horário de Brasília
 */
export function endOfDayBrasilia(date?: Date): Date {
  const brasiliaDate = date ? toBrasiliaTime(date) : getNowBrasilia();
  return fromBrasiliaTime(fnsEndOfDay(brasiliaDate));
}

/**
 * Formata uma data para exibição no formato brasileiro
 */
export function formatBrasiliaDate(date: Date, format: 'short' | 'long' = 'short'): string {
  const brasiliaDate = toBrasiliaTime(date);

  if (format === 'short') {
    return brasiliaDate.toLocaleDateString('pt-BR');
  }

  return brasiliaDate.toLocaleString('pt-BR', {
    timeZone: BRASILIA_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
