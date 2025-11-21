import { NextRequest, NextResponse } from 'next/server';
import { logger } from "@/lib/logger";

/**
 * Cron job unificado para tarefas diárias
 *
 * Execução: Diariamente às 03:00 UTC (00:00 BRT)
 *
 * Tarefas executadas:
 * 1. Envio de follow-ups agendados (10:00 BRT)
 * 2. Backup automático do banco de dados
 */

export async function GET(request: NextRequest) {
  try {
    // Validar secret do cron (segurança)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
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

    try {
      const neonApiKey = process.env.NEON_API_KEY;
      const neonProjectId = process.env.NEON_PROJECT_ID;

      if (!neonApiKey || !neonProjectId) {
        throw new Error('NEON_API_KEY ou NEON_PROJECT_ID não configurados');
      }

      // Criar branch de backup com timestamp
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const branchName = `backup-${timestamp}`;

      logger.debug(`📸 Criando branch de backup: ${branchName}`);

      const createBranchResponse = await fetch(
        `https://console.neon.tech/api/v2/projects/${neonProjectId}/branches`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${neonApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            branch: {
              name: branchName,
            },
          }),
        }
      );

      if (!createBranchResponse.ok) {
        const errorText = await createBranchResponse.text();

        // Se branch já existe, não é erro crítico
        if (createBranchResponse.status === 409) {
          logger.info('backup já foi feito hoje');
          results.tasks.push({
            name: 'Database Backup',
            status: 'success',
            message: 'Backup branch already exists',
            details: { branch: branchName },
          });
        } else {
          throw new Error(`Failed to create backup branch: ${errorText}`);
        }
      } else {
        const branchData = await createBranchResponse.json();
        logger.info('backup criada:', branchData.branch?.id);

        results.tasks.push({
          name: 'Database Backup',
          status: 'success',
          message: 'Backup created successfully',
          details: {
            branch: branchName,
            branchId: branchData.branch?.id,
          },
        });

        // Limpeza de branches antigos (7 dias)
        logger.info('backups antigos...');

        const listBranchesResponse = await fetch(
          `https://console.neon.tech/api/v2/projects/${neonProjectId}/branches`,
          {
            headers: {
              'Authorization': `Bearer ${neonApiKey}`,
            },
          }
        );

        if (listBranchesResponse.ok) {
          const branchesData = await listBranchesResponse.json();
          const backupBranches = branchesData.branches.filter((b: any) =>
            b.name.startsWith('backup-')
          );

          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          const branchesToDelete = backupBranches.filter((b: any) => {
            const branchDate = new Date(b.created_at);
            return branchDate < sevenDaysAgo;
          });

          logger.debug(`📊 Backups: ${backupBranches.length}, deletar: ${branchesToDelete.length}`);

          for (const branch of branchesToDelete) {
            try {
              await fetch(
                `https://console.neon.tech/api/v2/projects/${neonProjectId}/branches/${branch.id}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${neonApiKey}`,
                  },
                }
              );
              logger.debug(`✅ Deletado: ${branch.name}`);
            } catch (error) {
              logger.error(`⚠️ Erro ao deletar ${branch.name}:`, error);
            }
          }
        }
      }
    } catch (error) {
      logger.error('❌ Erro no backup:', error);
      results.tasks.push({
        name: 'Database Backup',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // ============================================
    // TAREFA 2: ENVIO DE FOLLOW-UPS
    // ============================================
    logger.debug('\n📨 TAREFA 2/2: Envio de follow-ups agendados');

    try {
      // Chamar o endpoint de envio de follow-ups
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://proactive-rejoicing-production.up.railway.app';

      const followupResponse = await fetch(`${baseUrl}/api/cron/send-followups`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader || '',
        },
      });

      const followupData = await followupResponse.json();

      if (followupResponse.ok) {
        logger.debug('✅ Follow-ups enviados com sucesso');
        results.tasks.push({
          name: 'Send Follow-ups',
          status: 'success',
          message: 'Follow-ups sent successfully',
          details: followupData,
        });
      } else {
        throw new Error(followupData.error || 'Failed to send follow-ups');
      }
    } catch (error) {
      logger.error('❌ Erro no envio de follow-ups:', error);
      results.tasks.push({
        name: 'Send Follow-ups',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // ============================================
    // RESULTADO FINAL
    // ============================================
    logger.debug('\n✅ Tarefas diárias concluídas!');
    logger.debug(`📊 Sucesso: ${results.tasks.filter(t => t.status === 'success').length}/${results.tasks.length}`);

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
