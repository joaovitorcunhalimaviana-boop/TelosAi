"use server"

import { redirect } from "next/navigation"
import { prisma } from '@/lib/prisma'
import { fromBrasiliaTime } from '@/lib/date-utils'
import { predictComplicationRisk } from '@/lib/ml-prediction'
import { invalidateAllDashboardData } from '@/lib/cache-helpers'

interface QuickPatientData {
  userId: string
  name: string
  phone: string
  email?: string // Added: Optional email field
  surgeryType: "hemorroidectomia" | "fistula" | "fissura" | "pilonidal"
  surgeryDate: string
}

export async function createQuickPatient(data: QuickPatientData) {
  try {
    // 1. Criar o paciente
    const patient = await prisma.patient.create({
      data: {
        userId: data.userId,
        name: data.name,
        phone: data.phone,
        email: data.email && data.email.trim() !== "" ? data.email : null, // Added: Save email if provided, null otherwise
        // Dados opcionais ficam em branco por enquanto
        cpf: null,
        dateOfBirth: null,
        age: null,
        sex: null,
      },
    })

    // 2. Criar a cirurgia vinculada ao paciente
    // Converter a data do formulário (horário de Brasília) para UTC
    const surgeryDate = fromBrasiliaTime(new Date(data.surgeryDate))
    const surgery = await prisma.surgery.create({
      data: {
        userId: data.userId,
        patientId: patient.id,
        type: data.surgeryType,
        date: surgeryDate,
        dataCompleteness: 20, // 20% conforme especificado
        status: "active",
      },
    })

    // 3. Criar os 7 follow-ups agendados (D+1, D+2, D+3, D+5, D+7, D+10, D+14)
    const followUpDays = [1, 2, 3, 5, 7, 10, 14]

    const followUpsData = followUpDays.map((dayNumber) => {
      const scheduledDate = new Date(surgeryDate)
      scheduledDate.setDate(scheduledDate.getDate() + dayNumber)

      return {
        userId: data.userId,
        surgeryId: surgery.id,
        patientId: patient.id,
        dayNumber,
        scheduledDate,
        status: "pending" as const,
      }
    })

    // Criar todos os follow-ups de uma vez
    await prisma.followUp.createMany({
      data: followUpsData,
    })

    // 4. INTEGRAÇÃO ML: Predizer risco de complicações (não-bloqueante)
    // Esta chamada é assíncrona e não afeta o sucesso do cadastro
    predictComplicationRisk(surgery, patient)
      .then(async (prediction) => {
        if (prediction) {
          // Salvar predição no banco de dados
          await prisma.surgery.update({
            where: { id: surgery.id },
            data: {
              predictedRisk: prediction.risk,
              predictedRiskLevel: prediction.level,
              mlModelVersion: prediction.modelVersion,
              mlPredictedAt: prediction.timestamp,
              mlFeatures: JSON.stringify(prediction.features),
            },
          })

          console.log('[ML] Predição salva com sucesso:', {
            surgeryId: surgery.id,
            risk: prediction.risk,
            level: prediction.level,
          })
        }
      })
      .catch((error) => {
        // Log de erro mas NÃO falha o cadastro
        console.error('[ML] Erro ao salvar predição (não-crítico):', error)
      })

    // Invalidate dashboard cache (novo paciente e cirurgia)
    invalidateAllDashboardData()

    return {
      success: true,
      patientId: patient.id,
      surgeryId: surgery.id,
      message: "Paciente cadastrado com sucesso! Acompanhamento ativado.",
    }
  } catch (error) {
    console.error("Erro ao criar paciente:", error)

    // Verificar se é um erro de duplicação (WhatsApp já existe)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return {
        success: false,
        error: "Já existe um paciente cadastrado com este WhatsApp.",
      }
    }

    return {
      success: false,
      error: "Erro ao cadastrar paciente. Tente novamente.",
    }
  }
}
