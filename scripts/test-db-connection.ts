/**
 * Script para testar conexão com o banco de dados
 *
 * Para executar:
 * npx ts-node scripts/test-db-connection.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  console.log('🔄 Testando conexão com o banco de dados...\n')
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'))

  try {
    // Tentar executar uma query simples
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!')

    // Mostrar informações do banco
    const result = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`
    console.log('\n📊 Versão do PostgreSQL:')
    console.log(result[0].version)

    // Contar tabelas
    const tables = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `
    console.log(`\n📋 Número de tabelas no schema 'public': ${tables[0].count}`)

    return true
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:')
    console.error(error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })
