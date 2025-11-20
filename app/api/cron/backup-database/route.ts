import { NextRequest, NextResponse } from 'next/server';

/**
 * Cron job para backup automático do banco de dados
 *
 * Execução: Diariamente às 03:00 UTC (00:00 BRT)
 *
 * Estratégia:
 * - Usa branch protection do Neon para criar snapshots
 * - Mantém backups dos últimos 7 dias
 * - Notifica sobre erros via Sentry
 */

export async function GET(request: NextRequest) {
  try {
    // Validar secret do cron (segurança)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('❌ Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Iniciando backup automático do banco de dados...');

    const neonApiKey = process.env.NEON_API_KEY;
    const neonProjectId = process.env.NEON_PROJECT_ID;

    if (!neonApiKey || !neonProjectId) {
      console.error('❌ NEON_API_KEY ou NEON_PROJECT_ID não configurados');
      return NextResponse.json(
        { error: 'Backup configuration missing' },
        { status: 500 }
      );
    }

    // 1. Criar branch de backup com timestamp
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const branchName = `backup-${timestamp}`;

    console.log(`📸 Criando branch de backup: ${branchName}`);

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
      console.error('❌ Erro ao criar branch de backup:', errorText);

      // Se branch já existe, não é erro crítico
      if (createBranchResponse.status === 409) {
        console.log('⚠️ Branch já existe - backup pode ter sido feito anteriormente hoje');
        return NextResponse.json({
          success: true,
          message: 'Backup branch already exists',
          branch: branchName,
        });
      }

      throw new Error(`Failed to create backup branch: ${errorText}`);
    }

    const branchData = await createBranchResponse.json();
    console.log('✅ Branch de backup criada com sucesso:', branchData.branch?.id);

    // 2. Listar todos os branches para cleanup
    console.log('🧹 Verificando branches antigos para limpeza...');

    const listBranchesResponse = await fetch(
      `https://console.neon.tech/api/v2/projects/${neonProjectId}/branches`,
      {
        headers: {
          'Authorization': `Bearer ${neonApiKey}`,
        },
      }
    );

    if (!listBranchesResponse.ok) {
      console.error('⚠️ Não foi possível listar branches para limpeza');
    } else {
      const branchesData = await listBranchesResponse.json();
      const backupBranches = branchesData.branches.filter((b: any) =>
        b.name.startsWith('backup-')
      );

      // Manter apenas os últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const branchesToDelete = backupBranches.filter((b: any) => {
        const branchDate = new Date(b.created_at);
        return branchDate < sevenDaysAgo;
      });

      console.log(`📊 Backups atuais: ${backupBranches.length}, para deletar: ${branchesToDelete.length}`);

      // Deletar branches antigos
      for (const branch of branchesToDelete) {
        try {
          console.log(`🗑️ Deletando backup antigo: ${branch.name}`);

          const deleteResponse = await fetch(
            `https://console.neon.tech/api/v2/projects/${neonProjectId}/branches/${branch.id}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${neonApiKey}`,
              },
            }
          );

          if (deleteResponse.ok) {
            console.log(`✅ Branch ${branch.name} deletado com sucesso`);
          } else {
            console.error(`⚠️ Erro ao deletar branch ${branch.name}:`, await deleteResponse.text());
          }
        } catch (error) {
          console.error(`⚠️ Erro ao deletar branch ${branch.name}:`, error);
        }
      }
    }

    console.log('✅ Backup automático concluído com sucesso!');

    return NextResponse.json({
      success: true,
      message: 'Database backup created successfully',
      branch: branchName,
      branchId: branchData.branch?.id,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Erro ao executar backup automático:', error);

    // Sentry será notificado automaticamente via instrumentation
    // Não é necessário chamar manualmente em Route Handlers

    return NextResponse.json(
      {
        error: 'Database backup failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
