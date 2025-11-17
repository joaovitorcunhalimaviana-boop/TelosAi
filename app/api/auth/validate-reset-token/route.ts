import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token")

    if (!token) {
      return NextResponse.json({ valid: false, error: "Token não fornecido" }, { status: 400 })
    }

    // Busca token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return NextResponse.json({ valid: false, error: "Token inválido" })
    }

    // Verifica se já foi usado
    if (resetToken.used) {
      return NextResponse.json({ valid: false, error: "Token já foi utilizado" })
    }

    // Verifica se expirou
    if (resetToken.expires < new Date()) {
      return NextResponse.json({ valid: false, error: "Token expirado" })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("Erro ao validar token:", error)
    return NextResponse.json(
      { valid: false, error: "Erro ao validar token" },
      { status: 500 }
    )
  }
}
