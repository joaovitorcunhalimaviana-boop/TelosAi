/**
 * Script para limpar TODOS os pacientes do banco de dados
 * USO: npx ts-node scripts/limpar-pacientes.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Iniciando limpeza de pacientes...')

  try {
    // Deletar todos os follow-ups primeiro (foreign key)
    const followUpsDeleted = await prisma.followUp.deleteMany({})
    console.log(`✅ ${followUpsDeleted.count} follow-ups deletados`)

    // Deletar todas as cirurgias
    const surgeriesDeleted = await prisma.surgery.deleteMany({})
    console.log(`✅ ${surgeriesDeleted.count} cirurgias deletadas`)

    // Deletar todos os pacientes
    const patientsDeleted = await prisma.patient.deleteMany({})
    console.log(`✅ ${patientsDeleted.count} pacientes deletados`)

    console.log('\n✨ Limpeza concluída com sucesso!')
    console.log('📊 Banco de dados zerado e pronto para novos cadastros')
  } catch (error) {
    console.error('❌ Erro ao limpar banco:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
