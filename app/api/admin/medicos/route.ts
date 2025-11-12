import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const plan = searchParams.get("plan") || "all";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    const where: any = {
      role: "medico",
    };

    // Search filter
    if (search) {
      where.OR = [
        { nomeCompleto: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { whatsapp: { contains: search, mode: "insensitive" } },
      ];
    }

    // Plan filter
    if (plan !== "all") {
      where.plan = plan;
    }

    const medicos = await prisma.user.findMany({
      where,
      select: {
        id: true,
        nomeCompleto: true,
        whatsapp: true,
        email: true,
        crm: true,
        estado: true,
        plan: true,
        basePrice: true,
        additionalPatientPrice: true,
        isLifetimePrice: true,
        currentPatients: true,
        maxPatients: true,
        whatsappConnected: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            patients: true,
            surgeries: true,
          },
        },
      },
      orderBy: {
        [sortBy]: order,
      },
    });

    // Calculate billing for each doctor
    const medicosWithBilling = medicos.map((medico) => {
      const basePrice = Number(medico.basePrice);
      const additionalPatients = Math.max(0, medico.currentPatients - medico.maxPatients);
      const additionalCost = additionalPatients * Number(medico.additionalPatientPrice);
      const totalMonthly = basePrice + additionalCost;

      return {
        ...medico,
        billing: {
          basePrice,
          additionalPatients,
          additionalCost,
          totalMonthly,
        },
      };
    });

    return NextResponse.json(medicosWithBilling);
  } catch (error: any) {
    console.error("Error fetching medicos:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar médicos" },
      { status: error.message === "Acesso negado. Apenas administradores." ? 403 : 500 }
    );
  }
}
