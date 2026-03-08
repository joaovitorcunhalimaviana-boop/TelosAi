/**
 * Script para criar paciente de teste com cirurgia ONTEM
 * Para testar envio de mensagens D+1 HOJE
 */

import { PrismaClient } from '@prisma/client'
import { fromBrasiliaTime } from '../lib/date-utils'

const prisma = new PrismaClient()

async function main() {
  // Você precisa colocar seu userId aqui
  const userId = 'SEU_USER_ID_AQUI' // SUBSTITUA pelo seu ID de usuário

  console.log('📝 Criando paciente de teste...')

  // Data de ONTEM (para D+1 ser hoje)
  const ontem = new Date()
  ontem.setDate(ontem.getDate() - 1) // Ontem
  const surgeryDate = fromBrasiliaTime(ontem)

  console.log('📅 Data da cirurgia (ontem):', ontem.toLocaleDateString('pt-BR'))

  // 1. Criar paciente
  const patient = await prisma.patient.create({
    data: {
      userId,
      name: 'Paciente Teste D+1',
      phone: '+5583998663089', // SEU NÚMERO - Substitua se necessário
      email: 'teste@example.com',
      dateOfBirth: new Date('1990-01-01'),
      age: 35,
      sex: 'M',
      cpf: null,
    },
  })

  console.log('✅ Paciente criado:', patient.name)

  // 2. Criar cirurgia (ONTEM)
  const surgery = await prisma.surgery.create({
    data: {
      userId,
      patientId: patient.id,
      type: 'hemorroidectomia',
      date: surgeryDate,
      hospital: 'Hospital Teste',
      dataCompleteness: 30,
      status: 'active',
    },
  })

  console.log('✅ Cirurgia criada para ontem')

  // 3. Criar follow-ups (D+1, D+2, D+3, D+5, D+7, D+10, D+14)
  const followUpDays = [1, 2, 3, 4, 5, 6, 7, 10, 14]

  for (const dayNumber of followUpDays) {
    const scheduledDate = new Date(surgeryDate)
    scheduledDate.setDate(scheduledDate.getDate() + dayNumber)

    await prisma.followUp.create({
      data: {
        userId,
        surgeryId: surgery.id,
        patientId: patient.id,
        dayNumber,
        scheduledDate,
        status: 'pending',
      },
    })

    const isToday = dayNumber === 1
    console.log(
      `${isToday ? '🎯' : '📅'} Follow-up D+${dayNumber} agendado para: ${scheduledDate.toLocaleDateString('pt-BR')}${isToday ? ' (HOJE!)' : ''}`
    )
  }

  console.log('\n✨ Paciente de teste criado com sucesso!')
  console.log(`📱 Número: ${patient.phone}`)
  console.log('🎯 Follow-up D+1 agendado para HOJE')
  console.log('\n🚀 Agora clique no botão "Enviar D+1 Agora" no dashboard!')
}

main()
  .catch((error) => {
    console.error('❌ Erro:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
