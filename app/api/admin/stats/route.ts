import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    // Total de médicos
    const totalMedicos = await prisma.user.count({
      where: { role: "medico" },
    });

    // Total de pacientes
    const totalPacientes = await prisma.patient.count();

    // Founding members
    const foundingMembers = await prisma.user.count({
      where: {
        role: "medico",
        plan: "founding"
      },
    });

    // Professional members
    const professionalMembers = await prisma.user.count({
      where: {
        role: "medico",
        plan: "professional"
      },
    });

    // Fetch all medicos with billing data
    const medicos = await prisma.user.findMany({
      where: { role: "medico" },
      select: {
        basePrice: true,
        currentPatients: true,
        maxPatients: true,
        additionalPatientPrice: true,
        plan: true,
        whatsappConnected: true,
      },
    });

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = medicos.reduce((acc, medico) => {
      const base = Number(medico.basePrice) || 0;
      const adicional = Math.max(0, medico.currentPatients - medico.maxPatients);
      const adicionalPrice = adicional * (Number(medico.additionalPatientPrice) || 0);
      return acc + base + adicionalPrice;
    }, 0);

    // WhatsApp connected
    const whatsappConnected = medicos.filter(m => m.whatsappConnected).length;

    // Total additional patients across all doctors
    const totalAdditionalPatients = medicos.reduce((acc, medico) => {
      return acc + Math.max(0, medico.currentPatients - medico.maxPatients);
    }, 0);

    // Average patients per doctor
    const avgPatientsPerDoctor = totalMedicos > 0
      ? (totalPacientes / totalMedicos).toFixed(1)
      : "0";

    return NextResponse.json({
      totalMedicos,
      totalPacientes,
      foundingMembers,
      professionalMembers,
      mrr: Math.round(mrr),
      whatsappConnected,
      totalAdditionalPatients,
      avgPatientsPerDoctor,
    });
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar estatísticas" },
      { status: error.message === "Acesso negado. Apenas administradores." ? 403 : 500 }
    );
  }
}
