import { NextRequest, NextResponse } from 'next/server';
import { checkAndRemindPatient } from '@/lib/cron/patient-reminder';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    logger.info('⏰ Iniciando Cron de Lembrete ao Paciente');
    await checkAndRemindPatient();

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Erro no cron de lembrete:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
