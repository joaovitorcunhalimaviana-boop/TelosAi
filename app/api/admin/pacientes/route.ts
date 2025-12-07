/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const surgeryType = searchParams.get("surgeryType") || "all";
    const medicoId = searchParams.get("medicoId") || "all";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filter by medico
    if (medicoId !== "all") {
      where.userId = medicoId;
    }

    const pacientes = await prisma.patient.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        age: true,
        sex: true,
        createdAt: true,
        isActive: true,
        user: {
          select: {
            id: true,
            nomeCompleto: true,
            email: true,
          },
        },
        surgeries: {
          select: {
            id: true,
            type: true,
            date: true,
            status: true,
            dataCompleteness: true,
          },
          orderBy: {
            date: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        [sortBy]: order,
      },
    });

    // Filter by surgery type if specified
    let filteredPacientes = pacientes;
    if (surgeryType !== "all") {
      filteredPacientes = pacientes.filter(
        (p) => p.surgeries[0]?.type === surgeryType
      );
    }

    // Format response
    const formattedPacientes = filteredPacientes.map((paciente) => {
      const lastSurgery = paciente.surgeries[0];

      return {
        id: paciente.id,
        name: paciente.name,
        phone: paciente.phone,
        email: paciente.email,
        age: paciente.age,
        sex: paciente.sex,
        isActive: paciente.isActive,
        createdAt: paciente.createdAt,
        medico: {
          id: paciente.user.id,
          nomeCompleto: paciente.user.nomeCompleto,
          email: paciente.user.email,
        },
        lastSurgery: lastSurgery ? {
          id: lastSurgery.id,
          type: lastSurgery.type,
          date: lastSurgery.date,
          status: lastSurgery.status,
          dataCompleteness: lastSurgery.dataCompleteness,
        } : null,
      };
    });

    return NextResponse.json(formattedPacientes);
  } catch (error: any) {
    console.error("Error fetching pacientes:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar pacientes" },
      { status: error.message === "Acesso negado. Apenas administradores." ? 403 : 500 }
    );
  }
}
