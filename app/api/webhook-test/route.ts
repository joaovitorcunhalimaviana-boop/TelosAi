/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * ENDPOINT DE DEBUG - SEM SIGNATURE VALIDATION
 * Use para testar se o fallback JavaScript funciona
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const testPhone = body.phone || '5583998663089'

    console.log('\n🧪 DEBUG ENDPOINT - TESTANDO BUSCA DE PACIENTE\n')
    console.log('Telefone:', testPhone)

    // Normalizar número de telefone
    const normalizedPhone = testPhone.replace(/\D/g, '')
    const last11 = normalizedPhone.slice(-11)
    const last9 = normalizedPhone.slice(-9)
    const last8 = normalizedPhone.slice(-8)

    console.log('Normalizado:', normalizedPhone)
    console.log('Últimos 11:', last11)
    console.log('Últimos 9:', last9)
    console.log('Últimos 8:', last8)

    // Tentar SQL primeiro
    let sqlResult = null
    try {
      console.log('\n1️⃣ Tentando SQL com REGEXP_REPLACE...')

      const result = await prisma.$queryRaw`
        SELECT id, name, phone, "userId"
        FROM "Patient"
        WHERE "isActive" = true
        AND (
          REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE ${`%${last11}%`}
          OR REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE ${`%${last9}%`}
          OR REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE ${`%${last8}%`}
        )
        LIMIT 1
      ` as any[]

      if (result && result.length > 0) {
        sqlResult = result[0]
        console.log('✅ SQL ENCONTROU:', sqlResult)
      } else {
        console.log('⚠️ SQL retornou vazio')
      }
    } catch (error: any) {
      console.log('❌ SQL falhou:', error.message)
    }

    // Tentar JavaScript fallback
    console.log('\n2️⃣ Tentando JavaScript fallback...')

    const allPatients = await prisma.patient.findMany({
      where: { isActive: true },
      select: { id: true, name: true, phone: true, userId: true }
    })

    console.log(`Total de pacientes ativos: ${allPatients.length}`)

    let jsResult = null
    for (const patient of allPatients) {
      const patientPhoneNormalized = patient.phone.replace(/\D/g, '')

      if (patientPhoneNormalized.includes(last11) ||
        patientPhoneNormalized.includes(last9) ||
        patientPhoneNormalized.includes(last8)) {
        jsResult = patient
        console.log('✅ JAVASCRIPT ENCONTROU:', jsResult)
        break
      }
    }

    if (!jsResult) {
      console.log('❌ JavaScript NÃO encontrou')
      console.log('\nAmostra de telefones no banco:')
      allPatients.slice(0, 5).forEach(p => {
        console.log(`  - ${p.name}: "${p.phone}" → "${p.phone.replace(/\D/g, '')}"`)
      })
    }

    return NextResponse.json({
      success: true,
      testPhone,
      normalizedPhone,
      searchTerms: { last11, last9, last8 },
      sqlResult,
      jsResult,
      totalPatients: allPatients.length,
      message: jsResult
        ? '✅ Paciente ENCONTRADO via fallback JavaScript'
        : '❌ Paciente NÃO encontrado'
    })

  } catch (error: any) {
    console.error('❌ Erro no endpoint de debug:', error)

    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
