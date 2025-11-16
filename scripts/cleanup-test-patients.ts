/**
 * Script para Limpar Pacientes de Teste
 *
 * USO:
 * npx ts-node scripts/cleanup-test-patients.ts
 *
 * ATENÇÃO: Este script deleta permanentemente os pacientes de teste.
 * Use com cuidado!
 */

import { prisma } from '../lib/prisma.js'

async function cleanupTestPatients() {
  console.log('🗑️  Iniciando limpeza de pacientes de teste...\n')

  try {
    // 1. Listar todos os pacientes
    const allPatients = await prisma.patient.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📋 Total de pacientes cadastrados: ${allPatients.length}\n`)

    if (allPatients.length === 0) {
      console.log('✅ Nenhum paciente encontrado. Banco já está limpo!')
      return
    }

    // Mostrar todos os pacientes
    console.log('📋 Pacientes cadastrados:')
    allPatients.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name} - ${p.phone} - ${p.createdAt.toLocaleDateString('pt-BR')}`)
    })

    console.log('\n⚠️  ATENÇÃO: Este script vai deletar TODOS os pacientes.')
    console.log('Se você quiser deletar apenas alguns, comente a linha do deleteMany abaixo')
    console.log('e descomente as linhas de delete individual.\n')

    // OPÇÃO 1: Deletar TODOS os pacientes (use com cuidado!)
    const deletedPatients = await prisma.patient.deleteMany({})
    console.log(`✅ ${deletedPatients.count} pacientes deletados com sucesso!`)

    // OPÇÃO 2: Deletar pacientes específicos por telefone (descomente e ajuste)
    /*
    const testPhones = [
      '83999999999', // Substitua pelos números de teste
      '83988888888',
    ]

    for (const phone of testPhones) {
      const deleted = await prisma.patient.deleteMany({
        where: {
          phone: {
            contains: phone.replace(/\D/g, '').slice(-11) // Últimos 11 dígitos
          }
        }
      })
      console.log(`✅ Deletados ${deleted.count} pacientes com telefone contendo ${phone}`)
    }
    */

    // OPÇÃO 3: Deletar pacientes específicos por nome
    /*
    const testNames = [
      'João Teste',
      'Maria Teste'
    ]

    for (const name of testNames) {
      const deleted = await prisma.patient.deleteMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive'
          }
        }
      })
      console.log(`✅ Deletados ${deleted.count} pacientes com nome contendo "${name}"`)
    }
    */

    console.log('\n✅ Limpeza concluída!')

  } catch (error) {
    console.error('❌ Erro ao limpar pacientes:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o script
cleanupTestPatients()
  .then(() => {
    console.log('\n🎉 Script finalizado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error)
    process.exit(1)
  })
