import { NextRequest, NextResponse } from 'next/server';
import { checkAndAlertDoctor } from '@/lib/cron/doctor-alert';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Aceita auth via header OU query string
    const authHeader = request.headers.get('authorization');
    const secretFromHeader = authHeader?.replace('Bearer ', '');
    const secretFromQuery = request.nextUrl.searchParams.get('secret');
    const providedSecret = secretFromHeader || secretFromQuery;

    if (providedSecret !== process.env.CRON_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    logger.info('⏰ Iniciando Cron de Alerta ao Médico');
    await checkAndAlertDoctor();

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Erro no cron de alerta médico:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
