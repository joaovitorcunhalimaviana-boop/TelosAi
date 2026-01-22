/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { logger } from "@/lib/logger";
import { performDatabaseBackup, sendScheduledFollowUps, renewWhatsAppToken } from '@/lib/cron-jobs';

/**
 * Cron job unificado para tarefas diárias
 *
 * Execução: Diariamente às 03:00 UTC (00:00 BRT)
 *
 * Tarefas executadas:
 * 1. Envio de follow-ups agendados
 * 2. Backup automático do banco de dados
 */

export async function GET(request: NextRequest) {
  try {
    // Validar secret do cron (segurança) - aceita via header OU query parameter
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET?.trim();

    // Aceitar via query parameter para compatibilidade com cron-job.org
    const url = new URL(request.url);
    const providedSecretQuery = url.searchParams.get('secret')?.trim();
    const providedSecretHeader = authHeader?.replace('Bearer ', '').trim();

    const providedSecret = providedSecretHeader || providedSecretQuery;

    if (cronSecret && providedSecret !== cronSecret) {
      logger.error('❌ Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.debug('🕐 Iniciando tarefas diárias...');

    const results = {
      timestamp: new Date().toISOString(),
      tasks: [] as Array<{ name: string; status: 'success' | 'error'; message: string; details?: any }>,
    };

    // ============================================
    // TAREFA 1: BACKUP DO BANCO DE DADOS
    // ============================================
    logger.info('Backup do banco de dados');
    const backupResult = await performDatabaseBackup();

    results.tasks.push({
      name: 'Database Backup',
      status: backupResult.success ? 'success' : 'error',
      message: backupResult.message || backupResult.error || 'Unknown status',
      details: backupResult.branchId ? { branchId: backupResult.branchId } : undefined
    });

    // ============================================
    // TAREFA 2: ENVIO DE FOLLOW-UPS
    // ============================================
    logger.debug('\n📨 TAREFA 2/2: Envio de follow-ups agendados');
    const followupResult = await sendScheduledFollowUps();

    results.tasks.push({
      name: 'Send Follow-ups',
      status: followupResult.success ? 'success' : 'error',
      message: followupResult.success ? 'Follow-ups processed' : (followupResult.error || 'Failed'),
      details: followupResult.results
    });

    // ============================================
    // TAREFA 3: RENOVAÇÃO TOKEN WHATSAPP
    // ============================================
    logger.debug('\n🔄 TAREFA 3/3: Renovação Token WhatsApp');
    const tokenResult = await renewWhatsAppToken();

    results.tasks.push({
      name: 'Renew WhatsApp Token',
      status: tokenResult.success ? 'success' : 'error',
      message: tokenResult.message || tokenResult.error || 'Unknown status',
      details: tokenResult.expiresInDays ? { expiresInDays: tokenResult.expiresInDays } : undefined
    });

    // ============================================
    // RESULTADO FINAL
    // ============================================
    logger.debug('\n✅ Tarefas diárias concluídas!');
    const hasErrors = results.tasks.some(t => t.status === 'error');

    return NextResponse.json(
      {
        success: !hasErrors,
        message: 'Daily tasks completed',
        ...results,
      },
      { status: hasErrors ? 500 : 200 }
    );

  } catch (error) {
    logger.error('❌ Erro crítico nas tarefas diárias:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Daily tasks failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
