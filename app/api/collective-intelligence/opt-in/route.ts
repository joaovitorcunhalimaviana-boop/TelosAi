import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { optIn } = await req.json()

    if (typeof optIn !== "boolean") {
      return NextResponse.json({ error: "optIn deve ser boolean" }, { status: 400 })
    }

    // Atualiza o usuário
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        collectiveIntelligenceOptIn: optIn,
        collectiveIntelligenceDate: optIn ? new Date() : null,
      },
    })

    return NextResponse.json({ success: true, optIn })

  } catch (error) {
    console.error("Erro ao processar opt-in:", error)
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        collectiveIntelligenceOptIn: true,
        collectiveIntelligenceDate: true,
      },
    })

    return NextResponse.json({
      optIn: user?.collectiveIntelligenceOptIn || false,
      date: user?.collectiveIntelligenceDate || null,
    })

  } catch (error) {
    console.error("Erro ao buscar status:", error)
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    )
  }
}
