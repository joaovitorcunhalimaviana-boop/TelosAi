/**
 * Script para limpar TODOS os pacientes do banco
 * Uso: node scripts/cleanup.mjs
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanup() {
  console.log('🗑️  Iniciando limpeza...\n')

  try {
    // Listar pacientes antes de deletar
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true
      }
    })

    console.log(`📋 Total de pacientes: ${patients.length}\n`)

    if (patients.length > 0) {
      console.log('Pacientes encontrados:')
      patients.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} - ${p.phone}`)
      })
      console.log('')
    }

    // Deletar TODOS os pacientes
    const result = await prisma.patient.deleteMany({})

    console.log(`✅ ${result.count} pacientes deletados!\n`)
    console.log('🎉 Banco limpo!')

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanup()
