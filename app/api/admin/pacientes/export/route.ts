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

    const pacientes = await prisma.patient.findMany({
      select: {
        name: true,
        phone: true,
        email: true,
        age: true,
        sex: true,
        isActive: true,
        createdAt: true,
        user: {
          select: {
            nomeCompleto: true,
            email: true,
          },
        },
        surgeries: {
          select: {
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
        createdAt: "desc",
      },
    });

    // Prepare data for export
    const exportData = pacientes.map((paciente) => {
      const lastSurgery = paciente.surgeries[0];

      const surgeryTypeLabels: Record<string, string> = {
        hemorroidectomia: "Hemorroidectomia",
        fistula: "Fístula",
        fissura: "Fissura",
        pilonidal: "Pilonidal",
      };

      return {
        "Nome": paciente.name,
        "WhatsApp": paciente.phone,
        "Email": paciente.email || "Não informado",
        "Idade": paciente.age || "N/A",
        "Sexo": paciente.sex || "N/A",
        "Status": paciente.isActive ? "Ativo" : "Inativo",
        "Médico Responsável": paciente.user.nomeCompleto,
        "Email do Médico": paciente.user.email,
        "Tipo de Cirurgia": lastSurgery ? surgeryTypeLabels[lastSurgery.type] || lastSurgery.type : "Sem cirurgia",
        "Data da Cirurgia": lastSurgery ? new Date(lastSurgery.date).toLocaleDateString("pt-BR") : "N/A",
        "Status da Cirurgia": lastSurgery ? (lastSurgery.status === "active" ? "Ativo" : lastSurgery.status) : "N/A",
        "Completude de Dados (%)": lastSurgery ? lastSurgery.dataCompleteness : 0,
        "Data de Cadastro": new Date(paciente.createdAt).toLocaleDateString("pt-BR"),
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
          "Content-Disposition": `attachment; filename="pacientes-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    } else if (format === "excel") {
      // Create Excel workbook
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Pacientes");

      // Generate buffer
      const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      return new Response(excelBuffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="pacientes-${new Date().toISOString().split("T")[0]}.xlsx"`,
        },
      });
    }

    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  } catch (error: any) {
    console.error("Error exporting pacientes:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao exportar pacientes" },
      { status: error.message === "Acesso negado. Apenas administradores." ? 403 : 500 }
    );
  }
}
