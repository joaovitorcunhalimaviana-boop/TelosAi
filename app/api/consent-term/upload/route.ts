import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const patientId = formData.get("patientId") as string

    if (!file || !patientId) {
      return NextResponse.json({ error: "Arquivo e patientId são obrigatórios" }, { status: 400 })
    }

    // Verifica permissão
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    })

    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    if (patient.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    // Cria diretório se não existir
    const uploadDir = join(process.cwd(), "public", "uploads", "consent-terms")
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Gera nome único para o arquivo
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const filename = `consent-term-${patientId}-${timestamp}.${extension}`
    const filepath = join(uploadDir, filename)

    // Salva arquivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // URL pública do arquivo
    const fileUrl = `/uploads/consent-terms/${filename}`

    return NextResponse.json({ url: fileUrl, filename })

  } catch (error) {
    console.error("Erro ao fazer upload:", error)
    return NextResponse.json(
      { error: "Erro ao processar upload" },
      { status: 500 }
    )
  }
}
