// Exemplo de teste das funções de exportação
// Este arquivo demonstra como usar as funções de export-utils.ts
// Para executar em produção, instale: npm install --save-dev @types/jest jest ts-jest

import {
  anonymizePatient,
  formatRawData,
  formatStatistics,
  formatPainTrajectory,
  calculateAge,
  type PatientExportData,
  type ExportFilters,
} from './export-utils';

// Dados de exemplo para testes
const mockPatients: PatientExportData[] = [
  {
    id: 'patient-123',
    name: 'João da Silva',
    cpf: '123.456.789-00',
    phone: '11999999999',
    age: 45,
    sex: 'Masculino',
    dateOfBirth: new Date('1979-01-15'),
    surgeries: [
      {
        id: 'surgery-456',
        type: 'hemorroidectomia',
        date: new Date('2024-03-15'),
        hospital: 'Hospital Exemplo',
        durationMinutes: 90,
        comorbidities: ['Hipertensão', 'Diabetes tipo 2'],
        details: {},
        preOp: { botoxUsed: true, intestinalPrep: true },
        anesthesia: { type: 'raqui', pudendoBlock: true },
        followUps: [
          {
            dayNumber: 1,
            scheduledDate: new Date('2024-03-16'),
            status: 'responded',
            painLevel: 7,
            redFlags: [],
            riskLevel: 'low',
            respondedAt: new Date('2024-03-16T10:00:00'),
          },
          {
            dayNumber: 2,
            scheduledDate: new Date('2024-03-17'),
            status: 'responded',
            painLevel: 6,
            redFlags: [],
            riskLevel: 'low',
            respondedAt: new Date('2024-03-17T10:00:00'),
          },
          {
            dayNumber: 3,
            scheduledDate: new Date('2024-03-18'),
            status: 'responded',
            painLevel: 5,
            redFlags: [],
            riskLevel: 'low',
            respondedAt: new Date('2024-03-18T10:00:00'),
          },
          {
            dayNumber: 7,
            scheduledDate: new Date('2024-03-22'),
            status: 'responded',
            painLevel: 3,
            redFlags: [],
            riskLevel: 'low',
            respondedAt: new Date('2024-03-22T10:00:00'),
          },
          {
            dayNumber: 14,
            scheduledDate: new Date('2024-03-29'),
            status: 'responded',
            painLevel: 1,
            redFlags: [],
            riskLevel: 'low',
            respondedAt: new Date('2024-03-29T10:00:00'),
          },
        ],
        nps: 9,
        complications: undefined,
      },
    ],
  },
  {
    id: 'patient-789',
    name: 'Maria Santos',
    cpf: '987.654.321-00',
    phone: '11988888888',
    age: 38,
    sex: 'Feminino',
    dateOfBirth: new Date('1986-05-20'),
    surgeries: [
      {
        id: 'surgery-789',
        type: 'fistula',
        date: new Date('2024-04-10'),
        hospital: 'Hospital Exemplo',
        durationMinutes: 60,
        comorbidities: [],
        details: {},
        preOp: { botoxUsed: false, intestinalPrep: false },
        anesthesia: { type: 'geral_IOT', pudendoBlock: false },
        followUps: [
          {
            dayNumber: 1,
            scheduledDate: new Date('2024-04-11'),
            status: 'responded',
            painLevel: 5,
            redFlags: [],
            riskLevel: 'low',
            respondedAt: new Date('2024-04-11T10:00:00'),
          },
          {
            dayNumber: 2,
            scheduledDate: new Date('2024-04-12'),
            status: 'responded',
            painLevel: 4,
            redFlags: [],
            riskLevel: 'low',
            respondedAt: new Date('2024-04-12T10:00:00'),
          },
          {
            dayNumber: 7,
            scheduledDate: new Date('2024-04-17'),
            status: 'responded',
            painLevel: 2,
            redFlags: [],
            riskLevel: 'low',
            respondedAt: new Date('2024-04-17T10:00:00'),
          },
          {
            dayNumber: 14,
            scheduledDate: new Date('2024-04-24'),
            status: 'responded',
            painLevel: 0,
            redFlags: [],
            riskLevel: 'low',
            respondedAt: new Date('2024-04-24T10:00:00'),
          },
        ],
        nps: 10,
        complications: undefined,
      },
    ],
  },
];

// Filtros de exemplo
const mockFilters: ExportFilters = {
  format: 'xlsx',
  anonymize: true,
  onlyComplete: false,
  fields: {
    demographic: true,
    comorbidities: true,
    surgeryDetails: true,
    painTrajectory: true,
    complications: true,
    nps: true,
    identifiable: false,
  },
};

// Exemplo 1: Testar anonimização
console.log('=== TESTE 1: Anonimização ===');
const anonymized = anonymizePatient(mockPatients[0], 0);
console.log('Original ID:', mockPatients[0].id);
console.log('Anonimizado ID:', anonymized.id);
console.log('Original Nome:', mockPatients[0].name);
console.log('Anonimizado Nome:', anonymized.name); // undefined
console.log('Original CPF:', mockPatients[0].cpf);
console.log('Anonimizado CPF:', anonymized.cpf); // undefined
console.log('');

// Exemplo 2: Calcular idade
console.log('=== TESTE 2: Cálculo de Idade ===');
const birthDate = new Date('1979-01-15');
const age = calculateAge(birthDate);
console.log('Data de Nascimento:', birthDate.toLocaleDateString('pt-BR'));
console.log('Idade Calculada:', age, 'anos');
console.log('');

// Exemplo 3: Formatar dados brutos
console.log('=== TESTE 3: Dados Brutos ===');
const rawData = formatRawData(mockPatients, mockFilters);
console.log('Total de linhas:', rawData.length);
console.log('Primeira linha:', JSON.stringify(rawData[0], null, 2));
console.log('');

// Exemplo 4: Formatar estatísticas
console.log('=== TESTE 4: Estatísticas Descritivas ===');
const stats = formatStatistics(mockPatients, mockFilters);
console.log('Total de linhas de estatísticas:', stats.length);
console.log('Primeiras 10 linhas:');
stats.slice(0, 10).forEach((stat, idx) => {
  console.log(`${idx + 1}.`, stat);
});
console.log('');

// Exemplo 5: Formatar trajetória de dor
console.log('=== TESTE 5: Trajetória de Dor ===');
const painTrajectory = formatPainTrajectory(mockPatients);
console.log('Total de linhas:', painTrajectory.length);
console.log('Primeira linha:', JSON.stringify(painTrajectory[0], null, 2));
console.log('');

// Exemplo 6: Verificar dados de múltiplos pacientes
console.log('=== TESTE 6: Resumo Geral ===');
console.log('Total de pacientes:', mockPatients.length);
console.log('Total de cirurgias:', mockPatients.reduce((acc, p) => acc + p.surgeries.length, 0));
console.log('Tipos de cirurgia:', [
  ...new Set(mockPatients.flatMap(p => p.surgeries.map(s => s.type))),
].join(', '));
console.log('');

// Como usar em produção:
console.log('=== USO EM PRODUÇÃO ===');
console.log(`
Para usar as funções de exportação em produção:

1. Buscar dados do Prisma:
   const patients = await prisma.patient.findMany({
     include: { surgeries: { include: { followUps: true } } }
   });

2. Transformar para formato de exportação:
   const exportData = transformPrismaToExport(patients);

3. Anonimizar se necessário:
   const anonymized = exportData.map((p, i) => anonymizePatient(p, i));

4. Gerar arquivo Excel:
   import { generateExcelFile } from './export-utils';
   const buffer = generateExcelFile(anonymized, filters);

5. Retornar para download:
   return new Response(buffer, {
     headers: {
       'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
       'Content-Disposition': 'attachment; filename="export.xlsx"'
     }
   });
`);

// Executar este arquivo com:
// npx ts-node lib/export-utils.test.example.ts
