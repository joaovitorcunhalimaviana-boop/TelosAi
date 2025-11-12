import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { stringify } from "csv-stringify/sync";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";

    const medicos = await prisma.user.findMany({
      where: { role: "medico" },
      select: {
        nomeCompleto: true,
        whatsapp: true,
        email: true,
        crm: true,
        estado: true,
        plan: true,
        basePrice: true,
        additionalPatientPrice: true,
        currentPatients: true,
        maxPatients: true,
        isLifetimePrice: true,
        whatsappConnected: true,
        createdAt: true,
        _count: {
          select: {
            patients: true,
            surgeries: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Prepare data for export
    const exportData = medicos.map((medico) => {
      const basePrice = Number(medico.basePrice);
      const additionalPatients = Math.max(0, medico.currentPatients - medico.maxPatients);
      const additionalCost = additionalPatients * Number(medico.additionalPatientPrice);
      const totalMonthly = basePrice + additionalCost;

      return {
        "Nome Completo": medico.nomeCompleto,
        "WhatsApp": medico.whatsapp || "Não informado",
        "Email": medico.email,
        "CRM": medico.crm || "Não informado",
        "Estado": medico.estado || "N/A",
        "Plano": medico.plan === "founding" ? "Founding Member" : "Professional",
        "Preço Base (R$)": basePrice.toFixed(2),
        "Preço Adicional (R$)": Number(medico.additionalPatientPrice).toFixed(2),
        "Pacientes Inclusos": medico.maxPatients,
        "Pacientes Atuais": medico.currentPatients,
        "Pacientes Adicionais": additionalPatients,
        "Custo Adicional (R$)": additionalCost.toFixed(2),
        "Total Mensal (R$)": totalMonthly.toFixed(2),
        "Preço Vitalício": medico.isLifetimePrice ? "Sim" : "Não",
        "WhatsApp Conectado": medico.whatsappConnected ? "Sim" : "Não",
        "Total de Pacientes Cadastrados": medico._count.patients,
        "Total de Cirurgias": medico._count.surgeries,
        "Data de Cadastro": new Date(medico.createdAt).toLocaleDateString("pt-BR"),
      };
    });

    if (format === "csv") {
      const csv = stringify(exportData, {
        header: true,
        bom: true, // Add BOM for Excel compatibility with special characters
      });

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="medicos-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    } else if (format === "excel") {
      // Create Excel workbook
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Médicos");

      // Generate buffer
      const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      return new Response(excelBuffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="medicos-${new Date().toISOString().split("T")[0]}.xlsx"`,
        },
      });
    }

    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  } catch (error: any) {
    console.error("Error exporting medicos:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao exportar médicos" },
      { status: error.message === "Acesso negado. Apenas administradores." ? 403 : 500 }
    );
  }
}
