import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * API de Exportação de Logs de Auditoria em CSV
 * GET: Exporta logs filtrados em formato CSV
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    // Apenas admin pode exportar logs
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem exportar logs.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);

    // Parâmetros de filtro (mesmos da API GET)
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const isSensitive = searchParams.get('isSensitive');

    // Construir filtro where
    const where: Prisma.AuditLogWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    if (isSensitive === 'true') {
      where.isSensitive = true;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Buscar todos os logs (sem paginação para export)
    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nomeCompleto: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      // Limitar a 10000 registros para evitar timeout
      take: 10000,
    });

    // Gerar CSV
    const csvRows = [];

    // Header
    csvRows.push([
      'ID',
      'Data/Hora',
      'Usuário',
      'Email',
      'Ação',
      'Recurso',
      'IP',
      'User-Agent',
      'Sensível',
      'Acesso a Dados',
    ].join(','));

    // Dados
    for (const log of logs) {
      const row = [
        log.id,
        log.createdAt.toISOString(),
        `"${log.user.nomeCompleto.replace(/"/g, '""')}"`, // Escape quotes
        log.user.email,
        log.action,
        `"${log.resource.replace(/"/g, '""')}"`,
        log.ipAddress,
        `"${log.userAgent.replace(/"/g, '""')}"`,
        log.isSensitive ? 'Sim' : 'Não',
        log.isDataAccess ? 'Sim' : 'Não',
      ];
      csvRows.push(row.join(','));
    }

    const csv = csvRows.join('\n');

    // Adicionar BOM UTF-8 para Excel reconhecer encoding corretamente
    const csvWithBOM = '\uFEFF' + csv;

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `audit-logs-${timestamp}.csv`;

    return new NextResponse(csvWithBOM, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Erro ao exportar logs:', error);
    return NextResponse.json(
      { error: 'Erro ao exportar logs de auditoria' },
      { status: 500 }
    );
  }
}
