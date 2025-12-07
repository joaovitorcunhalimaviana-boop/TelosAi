/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const ML_API_URL = process.env.ML_API_URL || "http://localhost:5000"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const patientData = await request.json()

    // Chama API Python de ML
    const response = await fetch(`${ML_API_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patientData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Erro na predição ML")
    }

    const prediction = await response.json()

    return NextResponse.json(prediction)
  } catch (error: any) {
    console.error("Erro ao chamar API ML:", error)
    return NextResponse.json(
      { error: error.message || "Erro ao fazer predição" },
      { status: 500 }
    )
  }
}
