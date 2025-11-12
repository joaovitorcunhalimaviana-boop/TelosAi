/**
 * Seed do banco de dados - Dados base do sistema
 *
 * Este seed cria:
 * - Comorbidades comuns
 * - Medicações pré-operatórias comuns
 *
 * Para executar:
 * npm run db:seed
 *
 * Ou automaticamente após migrations:
 * npm run db:migrate
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n')

  // ============================================
  // COMORBIDADES BASE
  // ============================================

  console.log('📋 Criando comorbidades base...')

  const comorbidities = [
    // Cardiovasculares
    { name: 'Hipertensão Arterial Sistêmica (HAS)', category: 'cardiovascular' },
    { name: 'Insuficiência Cardíaca', category: 'cardiovascular' },
    { name: 'Arritmias Cardíacas', category: 'cardiovascular' },
    { name: 'Doença Arterial Coronariana', category: 'cardiovascular' },
    { name: 'Infarto Agudo do Miocárdio Prévio', category: 'cardiovascular' },
    { name: 'AVC (Acidente Vascular Cerebral) Prévio', category: 'cardiovascular' },

    // Metabólicas
    { name: 'Diabetes Mellitus tipo 1', category: 'metabolica' },
    { name: 'Diabetes Mellitus tipo 2', category: 'metabolica' },
    { name: 'Obesidade (IMC > 30)', category: 'metabolica' },
    { name: 'Obesidade Mórbida (IMC > 40)', category: 'metabolica' },
    { name: 'Dislipidemia', category: 'metabolica' },
    { name: 'Hipotireoidismo', category: 'metabolica' },
    { name: 'Hipertireoidismo', category: 'metabolica' },

    // Pulmonares
    { name: 'Asma', category: 'pulmonar' },
    { name: 'DPOC (Doença Pulmonar Obstrutiva Crônica)', category: 'pulmonar' },
    { name: 'Enfisema', category: 'pulmonar' },
    { name: 'Fibrose Pulmonar', category: 'pulmonar' },
    { name: 'Apneia do Sono', category: 'pulmonar' },
    { name: 'Tuberculose Prévia', category: 'pulmonar' },

    // Renais
    { name: 'Insuficiência Renal Crônica', category: 'renal' },
    { name: 'Doença Renal Crônica em Diálise', category: 'renal' },
    { name: 'Transplante Renal', category: 'renal' },
    { name: 'Litíase Renal', category: 'renal' },

    // Hepáticas
    { name: 'Hepatite B', category: 'hepatica' },
    { name: 'Hepatite C', category: 'hepatica' },
    { name: 'Cirrose Hepática', category: 'hepatica' },
    { name: 'Esteatose Hepática', category: 'hepatica' },

    // Imunológicas
    { name: 'HIV/AIDS', category: 'imunologica' },
    { name: 'Lúpus Eritematoso Sistêmico', category: 'imunologica' },
    { name: 'Artrite Reumatoide', category: 'imunologica' },
    { name: 'Doença de Crohn', category: 'imunologica' },
    { name: 'Retocolite Ulcerativa', category: 'imunologica' },
    { name: 'Psoríase', category: 'imunologica' },
    { name: 'Imunossupressão (transplantado)', category: 'imunologica' },

    // Hematológicas
    { name: 'Anemia Crônica', category: 'outras' },
    { name: 'Hemofilia', category: 'outras' },
    { name: 'Trombocitopenia', category: 'outras' },
    { name: 'Uso de Anticoagulantes', category: 'outras' },

    // Neurológicas
    { name: 'Epilepsia', category: 'outras' },
    { name: 'Parkinson', category: 'outras' },
    { name: 'Alzheimer', category: 'outras' },
    { name: 'Esclerose Múltipla', category: 'outras' },

    // Psiquiátricas
    { name: 'Depressão', category: 'outras' },
    { name: 'Ansiedade Generalizada', category: 'outras' },
    { name: 'Transtorno Bipolar', category: 'outras' },
    { name: 'Esquizofrenia', category: 'outras' },

    // Outras
    { name: 'Tabagismo', category: 'outras' },
    { name: 'Etilismo', category: 'outras' },
    { name: 'Uso de Drogas Ilícitas', category: 'outras' },
    { name: 'Neoplasia (Câncer) Prévia', category: 'outras' },
    { name: 'Neoplasia Ativa', category: 'outras' },
    { name: 'Gravidez', category: 'outras' },
  ]

  for (const comorbidity of comorbidities) {
    await prisma.comorbidity.upsert({
      where: { name: comorbidity.name },
      update: {},
      create: comorbidity,
    })
  }

  console.log(`✅ ${comorbidities.length} comorbidades criadas\n`)

  // ============================================
  // MEDICAÇÕES BASE
  // ============================================

  console.log('💊 Criando medicações base...')

  const medications = [
    // Analgésicos
    { name: 'Dipirona', category: 'Analgésico' },
    { name: 'Paracetamol', category: 'Analgésico' },
    { name: 'Tramadol', category: 'Analgésico Opioide' },
    { name: 'Codeína', category: 'Analgésico Opioide' },
    { name: 'Morfina', category: 'Analgésico Opioide' },

    // Anti-inflamatórios
    { name: 'Ibuprofeno', category: 'Anti-inflamatório' },
    { name: 'Diclofenaco', category: 'Anti-inflamatório' },
    { name: 'Nimesulida', category: 'Anti-inflamatório' },
    { name: 'Cetoprofeno', category: 'Anti-inflamatório' },
    { name: 'Dexametasona', category: 'Corticoide' },
    { name: 'Prednisolona', category: 'Corticoide' },
    { name: 'Prednisona', category: 'Corticoide' },

    // Antibióticos
    { name: 'Amoxicilina', category: 'Antibiótico' },
    { name: 'Amoxicilina + Clavulanato', category: 'Antibiótico' },
    { name: 'Cefalexina', category: 'Antibiótico' },
    { name: 'Ciprofloxacino', category: 'Antibiótico' },
    { name: 'Metronidazol', category: 'Antibiótico' },
    { name: 'Azitromicina', category: 'Antibiótico' },

    // Laxantes
    { name: 'Lactulose', category: 'Laxante' },
    { name: 'Bisacodil', category: 'Laxante' },
    { name: 'Polietilenoglicol (PEG)', category: 'Laxante' },
    { name: 'Óleo Mineral', category: 'Laxante' },
    { name: 'Psyllium (Metamucil)', category: 'Laxante/Fibra' },

    // Cardiovasculares
    { name: 'Losartana', category: 'Anti-hipertensivo' },
    { name: 'Enalapril', category: 'Anti-hipertensivo' },
    { name: 'Captopril', category: 'Anti-hipertensivo' },
    { name: 'Anlodipino', category: 'Anti-hipertensivo' },
    { name: 'Atenolol', category: 'Anti-hipertensivo/Beta-bloqueador' },
    { name: 'Propranolol', category: 'Beta-bloqueador' },
    { name: 'Hidroclorotiazida', category: 'Diurético' },
    { name: 'Furosemida', category: 'Diurético' },
    { name: 'Sinvastatina', category: 'Hipolipemiante' },
    { name: 'Atorvastatina', category: 'Hipolipemiante' },
    { name: 'AAS (Ácido Acetilsalicílico)', category: 'Antiagregante Plaquetário' },
    { name: 'Clopidogrel', category: 'Antiagregante Plaquetário' },
    { name: 'Varfarina', category: 'Anticoagulante' },
    { name: 'Rivaroxabana', category: 'Anticoagulante' },

    // Diabetes
    { name: 'Metformina', category: 'Antidiabético' },
    { name: 'Glibenclamida', category: 'Antidiabético' },
    { name: 'Insulina NPH', category: 'Insulina' },
    { name: 'Insulina Regular', category: 'Insulina' },

    // Gastrintestinais
    { name: 'Omeprazol', category: 'Inibidor de Bomba de Prótons' },
    { name: 'Pantoprazol', category: 'Inibidor de Bomba de Prótons' },
    { name: 'Ranitidina', category: 'Antiácido' },
    { name: 'Bromoprida', category: 'Antiemético/Procinético' },
    { name: 'Metoclopramida', category: 'Antiemético/Procinético' },
    { name: 'Ondansetrona', category: 'Antiemético' },

    // Pomadas Proctológicas
    { name: 'Lidocaína 5% Pomada', category: 'Anestésico Tópico' },
    { name: 'Nitroglicerina 0.2% Pomada', category: 'Vasodilatador Tópico' },
    { name: 'Diltiazem 2% Pomada', category: 'Bloqueador de Canal de Cálcio Tópico' },
    { name: 'Metronidazol 10% Pomada', category: 'Antibiótico Tópico' },
    { name: 'Proctocream', category: 'Anti-inflamatório Tópico' },

    // Outros
    { name: 'Levotiroxina', category: 'Hormônio Tireoidiano' },
    { name: 'Diazepam', category: 'Benzodiazepínico' },
    { name: 'Clonazepam', category: 'Benzodiazepínico' },
    { name: 'Sertralina', category: 'Antidepressivo' },
    { name: 'Fluoxetina', category: 'Antidepressivo' },
    { name: 'Amitriptilina', category: 'Antidepressivo' },
  ]

  for (const medication of medications) {
    await prisma.medication.upsert({
      where: { name: medication.name },
      update: {},
      create: medication,
    })
  }

  console.log(`✅ ${medications.length} medicações criadas\n`)

  // ============================================
  // RESUMO
  // ============================================

  console.log('📊 Resumo do Seed:')
  console.log('==================')

  const comorbidityCount = await prisma.comorbidity.count()
  const medicationCount = await prisma.medication.count()
  const patientCount = await prisma.patient.count()
  const surgeryCount = await prisma.surgery.count()

  console.log(`✅ Comorbidades: ${comorbidityCount}`)
  console.log(`✅ Medicações: ${medicationCount}`)
  console.log(`✅ Pacientes: ${patientCount}`)
  console.log(`✅ Cirurgias: ${surgeryCount}`)
  console.log('\n🎉 Seed concluído com sucesso!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erro ao executar seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
