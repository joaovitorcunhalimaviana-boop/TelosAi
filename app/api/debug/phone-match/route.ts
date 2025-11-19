import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const phone = searchParams.get('phone') || '558398663089';

  // Normalizar número de telefone
  const normalizedPhone = phone.replace(/\D/g, '');

  // Testar diferentes estratégias
  const last8 = normalizedPhone.slice(-8);
  const last9 = normalizedPhone.slice(-9);
  const last10 = normalizedPhone.slice(-10);

  // Buscar todos os pacientes
  const allPatients = await prisma.patient.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
    }
  });

  // Testar match com últimos 8
  const match8 = await prisma.patient.findFirst({
    where: {
      phone: {
        contains: last8,
      },
    },
  });

  // Testar match com últimos 9
  const match9 = await prisma.patient.findFirst({
    where: {
      phone: {
        contains: last9,
      },
    },
  });

  // Testar match com últimos 10
  const match10 = await prisma.patient.findFirst({
    where: {
      phone: {
        contains: last10,
      },
    },
  });

  return NextResponse.json({
    input: {
      original: phone,
      normalized: normalizedPhone,
    },
    slices: {
      last8,
      last9,
      last10,
    },
    matches: {
      last8: match8 ? { name: match8.name, phone: match8.phone } : null,
      last9: match9 ? { name: match9.name, phone: match9.phone } : null,
      last10: match10 ? { name: match10.name, phone: match10.phone } : null,
    },
    allPatients: allPatients.map(p => ({
      name: p.name,
      phone: p.phone,
      normalized: p.phone.replace(/\D/g, ''),
      includes8: p.phone.replace(/\D/g, '').includes(last8),
      includes9: p.phone.replace(/\D/g, '').includes(last9),
      includes10: p.phone.replace(/\D/g, '').includes(last10),
    })),
  });
}
