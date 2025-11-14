"use server"

import { createFollowUpSchedule } from "@/lib/follow-up-scheduler"
import { prisma } from '@/lib/prisma'
import { fromBrasiliaTime } from '@/lib/date-utils'

// Tipos para os dados dos pacientes
interface SimplifiedPatientData {
  name: string
  dateOfBirth: string
  phone: string
  email?: string
  surgeryType: "hemorroidectomia" | "fistula" | "fissura" | "pilonidal"
  surgeryDate: string
  notes?: string
  age: number
}

interface CompletePatientData extends SimplifiedPatientData {
  sex: "Masculino" | "Feminino" | "Outro"
  cpf?: string
  hospital?: string
}

/**
 * Cadastro Simplificado (Médicos comuns)
 * Apenas dados básicos, sem campos de pesquisa
 */
export async function createSimplifiedPatient(data: SimplifiedPatientData) {
  try {
    // TODO: Pegar userId da session
    // const session = await getServerSession()
    // const userId = session.user.id
    const userId = "temp-user-id" // Temporário

    // 1. Criar o paciente
    const patient = await prisma.patient.create({
      data: {
        userId,
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        dateOfBirth: new Date(data.dateOfBirth),
        age: data.age,
        sex: null, // Não coletado no formulário simplificado
        cpf: null,
      },
    })

    // 2. Criar a cirurgia vinculada ao paciente
    // Converter a data do formulário (horário de Brasília) para UTC
    const surgeryDate = fromBrasiliaTime(new Date(data.surgeryDate))
    const surgery = await prisma.surgery.create({
      data: {
        userId,
        patientId: patient.id,
        type: data.surgeryType,
        date: surgeryDate,
        hospital: null,
        dataCompleteness: 20, // 20% conforme especificado
        status: "active",
      },
    })

    // 3. Criar os 7 follow-ups agendados (D+1, D+2, D+3, D+5, D+7, D+10, D+14)
    await createFollowUpSchedule({
      patientId: patient.id,
      surgeryId: surgery.id,
      surgeryDate,
      userId,
    })

    // 4. Incrementar contador de pacientes do usuário
    // TODO: Descomentar quando User estiver no banco
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: { currentPatients: { increment: 1 } }
    // })

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

/**
 * Cadastro Completo (Admin)
 * Todos os campos incluindo dados para pesquisa científica
 */
export async function createCompletePatient(data: CompletePatientData) {
  try {
    // TODO: Pegar userId da session e verificar se é admin
    // const session = await getServerSession()
    // const userId = session.user.id
    // if (session.user.role !== 'admin') {
    //   return { success: false, error: 'Acesso negado' }
    // }
    const userId = "temp-user-id" // Temporário

    // 1. Criar o paciente com TODOS os dados
    const patient = await prisma.patient.create({
      data: {
        userId,
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        dateOfBirth: new Date(data.dateOfBirth),
        age: data.age,
        sex: data.sex,
        cpf: data.cpf || null,
      },
    })

    // 2. Criar a cirurgia vinculada ao paciente
    // Converter a data do formulário (horário de Brasília) para UTC
    const surgeryDate = fromBrasiliaTime(new Date(data.surgeryDate))
    const surgery = await prisma.surgery.create({
      data: {
        userId,
        patientId: patient.id,
        type: data.surgeryType,
        date: surgeryDate,
        hospital: data.hospital || null,
        dataCompleteness: 40, // 40% porque tem mais dados preenchidos
        status: "active",
      },
    })

    // 3. Criar os 7 follow-ups agendados
    await createFollowUpSchedule({
      patientId: patient.id,
      surgeryId: surgery.id,
      surgeryDate,
      userId,
    })

    // 4. Incrementar contador de pacientes do usuário
    // TODO: Descomentar quando User estiver no banco
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: { currentPatients: { increment: 1 } }
    // })

    // 5. Se tiver observações, criar uma nota (implementar modelo Notes no futuro)
    if (data.notes) {
      // TODO: Implementar modelo Notes
      console.log("Observações do paciente:", data.notes)
    }

    return {
      success: true,
      patientId: patient.id,
      surgeryId: surgery.id,
      message: "Paciente cadastrado com sucesso! Acompanhamento ativado. Dados para pesquisa incluídos.",
      forResearch: true,
    }
  } catch (error) {
    console.error("Erro ao criar paciente:", error)

    // Verificar se é um erro de duplicação
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      if (error.message.includes("cpf")) {
        return {
          success: false,
          error: "Já existe um paciente cadastrado com este CPF.",
        }
      }
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

/**
 * Verificar se o usuário atingiu o limite de pacientes
 */
export async function checkPatientLimit(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentPatients: true,
        maxPatients: true,
      },
    })

    if (!user) {
      return { success: false, error: "Usuário não encontrado" }
    }

    const hasReachedLimit = user.currentPatients >= user.maxPatients

    return {
      success: true,
      currentPatients: user.currentPatients,
      maxPatients: user.maxPatients,
      hasReachedLimit,
      canAddMore: !hasReachedLimit,
    }
  } catch (error) {
    console.error("Erro ao verificar limite de pacientes:", error)
    return {
      success: false,
      error: "Erro ao verificar limite de pacientes",
    }
  }
}
