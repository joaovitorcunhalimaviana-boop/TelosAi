// Utilitários para exportação de dados científicos
// XLSX is dynamically imported in functions to reduce bundle size

// Tipos de dados do paciente e cirurgia
export interface PatientExportData {
  id: string;
  name?: string;
  cpf?: string;
  phone?: string;
  age?: number;
  sex?: string;
  dateOfBirth?: Date;
  surgeries: SurgeryExportData[];
}

export interface SurgeryExportData {
  id: string;
  type: string;
  date: Date;
  hospital?: string;
  durationMinutes?: number;
  comorbidities: string[];
  details?: any;
  preOp?: any;
  anesthesia?: any;
  followUps: FollowUpExportData[];
  nps?: number;
  complications?: string;
}

export interface FollowUpExportData {
  dayNumber: number;
  scheduledDate: Date;
  status: string;
  painLevel?: number;
  redFlags?: string[];
  riskLevel?: string;
  respondedAt?: Date;
}

export interface ExportFilters {
  startDate?: Date;
  endDate?: Date;
  surgeryTypes?: string[];
  onlyComplete?: boolean;
  anonymize?: boolean;
  format: 'xlsx' | 'csv';
  fields: {
    demographic: boolean;
    comorbidities: boolean;
    surgeryDetails: boolean;
    painTrajectory: boolean;
    complications: boolean;
    nps: boolean;
    identifiable: boolean;
  };
}

// Função para anonimizar dados de um paciente
export function anonymizePatient(patient: PatientExportData, index: number): PatientExportData {
  return {
    ...patient,
    id: `P${String(index + 1).padStart(4, '0')}`, // P0001, P0002, etc
    name: undefined,
    cpf: undefined,
    phone: undefined,
    surgeries: patient.surgeries.map((surgery, surgIdx) => ({
      ...surgery,
      id: `S${String(index + 1).padStart(4, '0')}-${surgIdx + 1}`, // S0001-1, S0001-2, etc
    })),
  };
}

// Função para calcular idade a partir da data de nascimento
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }

  return age;
}

// Formatar dados para planilha de dados brutos
export function formatRawData(patients: PatientExportData[], filters: ExportFilters): any[] {
  const rows: any[] = [];

  patients.forEach((patient) => {
    patient.surgeries.forEach((surgery) => {
      const baseRow: any = {};

      // ID do paciente (sempre incluído)
      baseRow['ID_Paciente'] = patient.id;

      // Dados demográficos
      if (filters.fields.demographic) {
        baseRow['Idade'] = patient.age;
        baseRow['Sexo'] = patient.sex;
      }

      // Dados identificáveis (apenas se não anonimizado)
      if (filters.fields.identifiable && !filters.anonymize) {
        baseRow['Nome'] = patient.name;
        baseRow['CPF'] = patient.cpf;
        baseRow['Telefone'] = patient.phone;
      }

      // Detalhes cirúrgicos
      if (filters.fields.surgeryDetails) {
        baseRow['ID_Cirurgia'] = surgery.id;
        baseRow['Tipo_Cirurgia'] = surgery.type;
        baseRow['Data_Cirurgia'] = surgery.date.toISOString().split('T')[0];
        baseRow['Hospital'] = surgery.hospital;
        baseRow['Duracao_Min'] = surgery.durationMinutes;

        // Anestesia
        if (surgery.anesthesia) {
          baseRow['Tipo_Anestesia'] = surgery.anesthesia.type;
          baseRow['Bloqueio_Pudendo'] = surgery.anesthesia.pudendoBlock ? 'Sim' : 'Não';
        }

        // Pré-operatório
        if (surgery.preOp) {
          baseRow['Botox_Usado'] = surgery.preOp.botoxUsed ? 'Sim' : 'Não';
          baseRow['Preparo_Intestinal'] = surgery.preOp.intestinalPrep ? 'Sim' : 'Não';
        }
      }

      // Comorbidades
      if (filters.fields.comorbidities) {
        baseRow['Comorbidades'] = surgery.comorbidities.join('; ');
        baseRow['Num_Comorbidades'] = surgery.comorbidities.length;
      }

      // Complicações
      if (filters.fields.complications) {
        baseRow['Complicacoes'] = surgery.complications || '';
      }

      // NPS
      if (filters.fields.nps) {
        baseRow['NPS'] = surgery.nps;
      }

      // Trajetória de dor (D+1 a D+14)
      if (filters.fields.painTrajectory) {
        const painByDay: { [key: number]: number | null } = {};

        surgery.followUps.forEach((followUp) => {
          if (followUp.painLevel !== undefined && followUp.painLevel !== null) {
            painByDay[followUp.dayNumber] = followUp.painLevel;
          }
        });

        // Dias padrão de follow-up: D+1, D+2, D+3, D+5, D+7, D+10, D+14
        [1, 2, 3, 5, 7, 10, 14].forEach((day) => {
          baseRow[`Dor_D${day}`] = painByDay[day] ?? null;
        });

        // Estatísticas de dor
        const painValues = Object.values(painByDay).filter(v => v !== null) as number[];
        if (painValues.length > 0) {
          baseRow['Dor_Media'] = (painValues.reduce((a, b) => a + b, 0) / painValues.length).toFixed(2);
          baseRow['Dor_Maxima'] = Math.max(...painValues);
          baseRow['Dor_Minima'] = Math.min(...painValues);
        }
      }

      // Dados de follow-up
      const completedFollowUps = surgery.followUps.filter(f => f.status === 'responded').length;
      baseRow['FollowUps_Completos'] = completedFollowUps;
      baseRow['Taxa_Adesao'] = `${((completedFollowUps / 7) * 100).toFixed(1)}%`;

      // Red flags
      const allRedFlags = surgery.followUps
        .flatMap(f => f.redFlags || [])
        .filter((v, i, a) => a.indexOf(v) === i); // unique
      baseRow['Red_Flags'] = allRedFlags.join('; ');

      rows.push(baseRow);
    });
  });

  return rows;
}

// Formatar dados para planilha de estatísticas descritivas
export function formatStatistics(patients: PatientExportData[], filters: ExportFilters): any[] {
  const stats: any[] = [];

  // Estatísticas demográficas
  if (filters.fields.demographic) {
    const ages = patients.map(p => p.age).filter(a => a !== undefined) as number[];
    const sexCounts = patients.reduce((acc, p) => {
      if (p.sex) {
        acc[p.sex] = (acc[p.sex] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    stats.push({ Categoria: 'DADOS DEMOGRÁFICOS', Medida: '', Valor: '' });
    stats.push({ Categoria: 'Total de Pacientes', Medida: 'N', Valor: patients.length });

    if (ages.length > 0) {
      stats.push({ Categoria: 'Idade', Medida: 'Média', Valor: (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) });
      stats.push({ Categoria: 'Idade', Medida: 'Desvio Padrão', Valor: calculateStdDev(ages).toFixed(1) });
      stats.push({ Categoria: 'Idade', Medida: 'Mínima', Valor: Math.min(...ages) });
      stats.push({ Categoria: 'Idade', Medida: 'Máxima', Valor: Math.max(...ages) });
      stats.push({ Categoria: 'Idade', Medida: 'Mediana', Valor: calculateMedian(ages).toFixed(1) });
    }

    Object.entries(sexCounts).forEach(([sex, count]) => {
      stats.push({ Categoria: 'Sexo', Medida: sex, Valor: `${count} (${((count / patients.length) * 100).toFixed(1)}%)` });
    });

    stats.push({ Categoria: '', Medida: '', Valor: '' });
  }

  // Estatísticas por tipo de cirurgia
  if (filters.fields.surgeryDetails) {
    const allSurgeries = patients.flatMap(p => p.surgeries);
    const surgeryTypeCounts = allSurgeries.reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    stats.push({ Categoria: 'TIPO DE CIRURGIA', Medida: '', Valor: '' });
    Object.entries(surgeryTypeCounts).forEach(([type, count]) => {
      stats.push({ Categoria: type, Medida: 'N', Valor: `${count} (${((count / allSurgeries.length) * 100).toFixed(1)}%)` });
    });

    stats.push({ Categoria: '', Medida: '', Valor: '' });
  }

  // Estatísticas de dor
  if (filters.fields.painTrajectory) {
    stats.push({ Categoria: 'TRAJETÓRIA DE DOR', Medida: '', Valor: '' });

    [1, 2, 3, 5, 7, 10, 14].forEach((day) => {
      const painValues: number[] = [];

      patients.forEach(patient => {
        patient.surgeries.forEach(surgery => {
          const followUp = surgery.followUps.find(f => f.dayNumber === day);
          if (followUp?.painLevel !== undefined && followUp?.painLevel !== null) {
            painValues.push(followUp.painLevel);
          }
        });
      });

      if (painValues.length > 0) {
        stats.push({
          Categoria: `Dor D+${day}`,
          Medida: 'Média ± DP',
          Valor: `${(painValues.reduce((a, b) => a + b, 0) / painValues.length).toFixed(2)} ± ${calculateStdDev(painValues).toFixed(2)}`
        });
        stats.push({
          Categoria: `Dor D+${day}`,
          Medida: 'Mediana [Min-Max]',
          Valor: `${calculateMedian(painValues).toFixed(1)} [${Math.min(...painValues)}-${Math.max(...painValues)}]`
        });
        stats.push({
          Categoria: `Dor D+${day}`,
          Medida: 'N respostas',
          Valor: painValues.length
        });
      }
    });

    stats.push({ Categoria: '', Medida: '', Valor: '' });
  }

  // Estatísticas de comorbidades
  if (filters.fields.comorbidities) {
    const allComorbidities = patients.flatMap(p =>
      p.surgeries.flatMap(s => s.comorbidities)
    );
    const comorbidityNames = allComorbidities.filter((v, i, a) => a.indexOf(v) === i);
    const comorbidCounts = comorbidityNames.reduce((acc, name) => {
      acc[name] = allComorbidities.filter(c => c === name).length;
      return acc;
    }, {} as Record<string, number>);

    stats.push({ Categoria: 'COMORBIDADES', Medida: '', Valor: '' });
    Object.entries(comorbidCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        stats.push({
          Categoria: name,
          Medida: 'Frequência',
          Valor: `${count} (${((count / patients.length) * 100).toFixed(1)}%)`
        });
      });

    stats.push({ Categoria: '', Medida: '', Valor: '' });
  }

  // Estatísticas de NPS
  if (filters.fields.nps) {
    const npsValues = patients.flatMap(p =>
      p.surgeries.map(s => s.nps).filter(n => n !== undefined)
    ) as number[];

    if (npsValues.length > 0) {
      stats.push({ Categoria: 'NET PROMOTER SCORE (NPS)', Medida: '', Valor: '' });
      stats.push({
        Categoria: 'NPS',
        Medida: 'Média',
        Valor: (npsValues.reduce((a, b) => a + b, 0) / npsValues.length).toFixed(1)
      });
      stats.push({
        Categoria: 'NPS',
        Medida: 'N respostas',
        Valor: npsValues.length
      });

      const promoters = npsValues.filter(n => n >= 9).length;
      const passives = npsValues.filter(n => n >= 7 && n < 9).length;
      const detractors = npsValues.filter(n => n < 7).length;

      stats.push({ Categoria: 'Promotores (9-10)', Medida: '%', Valor: ((promoters / npsValues.length) * 100).toFixed(1) });
      stats.push({ Categoria: 'Neutros (7-8)', Medida: '%', Valor: ((passives / npsValues.length) * 100).toFixed(1) });
      stats.push({ Categoria: 'Detratores (0-6)', Medida: '%', Valor: ((detractors / npsValues.length) * 100).toFixed(1) });
      stats.push({
        Categoria: 'NPS Score',
        Medida: '(% Promotores - % Detratores)',
        Valor: (((promoters - detractors) / npsValues.length) * 100).toFixed(1)
      });
    }
  }

  return stats;
}

// Formatar dados para matriz de trajetória de dor (paciente x dia)
export function formatPainTrajectory(patients: PatientExportData[]): any[] {
  const rows: any[] = [];

  patients.forEach((patient) => {
    patient.surgeries.forEach((surgery) => {
      const row: any = {
        ID_Paciente: patient.id,
        ID_Cirurgia: surgery.id,
        Tipo_Cirurgia: surgery.type,
        Data_Cirurgia: surgery.date.toISOString().split('T')[0],
      };

      // Adicionar dor para cada dia
      [1, 2, 3, 5, 7, 10, 14].forEach((day) => {
        const followUp = surgery.followUps.find(f => f.dayNumber === day);
        row[`D+${day}`] = followUp?.painLevel ?? null;
      });

      rows.push(row);
    });
  });

  return rows;
}

// Calcular desvio padrão
function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;

  return Math.sqrt(variance);
}

// Calcular mediana
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}

// Gerar arquivo Excel com múltiplas abas
export async function generateExcelFile(patients: PatientExportData[], filters: ExportFilters): Promise<Buffer> {
  // Dynamic import to reduce initial bundle size
  const XLSX = await import('xlsx');

  const workbook = XLSX.utils.book_new();

  // Aba 1: Dados brutos
  const rawData = formatRawData(patients, filters);
  const rawSheet = XLSX.utils.json_to_sheet(rawData);
  XLSX.utils.book_append_sheet(workbook, rawSheet, 'Dados Brutos');

  // Aba 2: Estatísticas descritivas
  const statsData = formatStatistics(patients, filters);
  const statsSheet = XLSX.utils.json_to_sheet(statsData);
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Estatísticas');

  // Aba 3: Trajetória de dor (se selecionado)
  if (filters.fields.painTrajectory) {
    const painData = formatPainTrajectory(patients);
    const painSheet = XLSX.utils.json_to_sheet(painData);
    XLSX.utils.book_append_sheet(workbook, painSheet, 'Trajetória de Dor');
  }

  // Converter para buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return excelBuffer;
}

// Gerar arquivo CSV
export async function generateCSVFile(patients: PatientExportData[], filters: ExportFilters): Promise<string> {
  // Dynamic import to reduce initial bundle size
  const XLSX = await import('xlsx');

  const rawData = formatRawData(patients, filters);
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rawData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');

  // Converter para CSV
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  return csv;
}
