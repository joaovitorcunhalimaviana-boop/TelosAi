/**
 * Templates de Protocolos Médicos
 *
 * Baseados no protocolo do Dr. João Vítor
 * Estes templates podem ser usados por outros médicos como ponto de partida
 */

export interface ProtocolTemplate {
  id: string;
  name: string;
  description: string;
  surgeryType: string;
  category: string;
  title: string;
  dayRangeStart: number;
  dayRangeEnd: number | null;
  content: string;
  priority: number;
}

export const PROTOCOL_TEMPLATES: ProtocolTemplate[] = [
  // ============ BANHO / CRIOTERAPIA ============
  {
    id: 'crioterapia-d0-d2',
    name: 'Crioterapia (D+0 a D+2)',
    description: 'Compressas geladas nos primeiros dias para reduzir edema e dor',
    surgeryType: 'hemorroidectomia',
    category: 'banho',
    title: 'Crioterapia (Gelo) - D+0 a D+2',
    dayRangeStart: 0,
    dayRangeEnd: 2,
    content: `CRIOTERAPIA (GELO) - PRIMEIROS 3 DIAS

📌 COMO FAZER:
- Compressas geladas 5x/dia por 10 minutos
- Usar pano/toalha entre o gelo e a pele (nunca gelo direto!)
- OU banho de assento com água GELADA

📌 BENEFÍCIOS:
- Reduz inchaço (edema)
- Previne hematomas
- Alivia a dor

⚠️ IMPORTANTE:
- D+0, D+1, D+2 = GELO/ÁGUA GELADA
- A partir de D+3 = trocar para água MORNA`,
    priority: 100
  },
  {
    id: 'banho-assento-d3',
    name: 'Banho de Assento (D+3 em diante)',
    description: 'Banho de assento com água morna a partir do terceiro dia',
    surgeryType: 'hemorroidectomia',
    category: 'banho',
    title: 'Banho de Assento com Água Morna - D+3 em diante',
    dayRangeStart: 3,
    dayRangeEnd: null,
    content: `BANHO DE ASSENTO COM ÁGUA MORNA

📌 COMO FAZER:
- Água MORNA (37-40°C, temperatura agradável)
- 10 a 15 minutos de duração
- 3 a 5x por dia
- Especialmente APÓS as evacuações

📌 BENEFÍCIOS:
- Relaxa a musculatura
- Alivia a dor
- Facilita a cicatrização
- Higieniza a região

⚠️ IMPORTANTE:
- Apenas água limpa, SEM produtos (sal, vinagre, sabonete)
- A partir de D+3 (antes é GELO!)`,
    priority: 90
  },

  // ============ MEDICAÇÕES ============
  {
    id: 'pomada-anal',
    name: 'Pomada Analgésica',
    description: 'Orientações sobre uso de pomada tópica',
    surgeryType: 'hemorroidectomia',
    category: 'medicacao',
    title: 'Pomada Tópica Analgésica',
    dayRangeStart: 0,
    dayRangeEnd: 14,
    content: `POMADA TÓPICA ANALGÉSICA

📌 COMO USAR:
- Aplicar de 8/8 horas (3x ao dia)
- Usar APÓS evacuar
- Pode usar antes de evacuar para lubrificar (se dor muito intensa)
- Quantidade: "uma ervilha" de pomada

📌 COMPOSIÇÃO TÍPICA:
- Diltiazem 2% (relaxa esfíncter)
- Lidocaína 2% (anestésico)
- Vitamina E 5% (cicatrizante)
- Metronidazol 10% (previne infecção)
- Sucralfato 10% (protege a mucosa)

⚠️ A pomada é COMPLEMENTAR aos banhos de assento, não substitui!`,
    priority: 80
  },
  {
    id: 'diosmina-hesperidina',
    name: 'Diosmina + Hesperidina',
    description: 'Medicamento para reduzir inchaço e inflamação',
    surgeryType: 'hemorroidectomia',
    category: 'medicacao',
    title: 'Diosmina + Hesperidina (Daflon/Velunid)',
    dayRangeStart: 0,
    dayRangeEnd: 14,
    content: `DIOSMINA + HESPERIDINA (DAFLON / VELUNID)

📌 COMO TOMAR:
- 1000mg de 12/12h (ou 2 comprimidos de 500mg 2x/dia)
- Por 15 dias

📌 BENEFÍCIOS:
- Reduz inchaço (edema)
- Melhora a circulação
- Ajuda na cicatrização
- Reduz os plicomas (inchaços de pele)

⚠️ Este medicamento é específico para cirurgia de hemorroidas`,
    priority: 70
  },
  {
    id: 'laxante',
    name: 'Laxante',
    description: 'Orientações sobre uso de laxante para manter fezes macias',
    surgeryType: 'geral',
    category: 'medicacao',
    title: 'Laxante para Fezes Macias',
    dayRangeStart: 0,
    dayRangeEnd: null,
    content: `LAXANTE - MANTER FEZES MACIAS

📌 OPÇÕES:
- Muvinlax ou PEGLax: 1 sachê à noite
- Lactulose: 15ml à noite

📌 OBJETIVO:
- Fezes macias = menos dor ao evacuar
- Evitar esforço
- Prevenir constipação

📌 AJUSTAR CONFORME NECESSIDADE:
- Se fezes muito líquidas: reduzir dose
- Se ainda duras: aumentar dose ou usar 2x/dia

⚠️ IMPORTANTE: NÃO SEGURE A VONTADE DE EVACUAR!
Evacuar é fundamental para a cicatrização.`,
    priority: 60
  },
  {
    id: 'analgesia',
    name: 'Analgesia (Dor)',
    description: 'Medicamentos para controle da dor',
    surgeryType: 'geral',
    category: 'medicacao',
    title: 'Medicações para Dor',
    dayRangeStart: 0,
    dayRangeEnd: 7,
    content: `MEDICAÇÕES PARA DOR

📌 ANALGÉSICOS (usar de horário, não só quando doer):
- Dipirona 1g: 1 comprimido de 6/6h por 7 dias
- OU Paracetamol 750mg: 1 comprimido de 6/6h (se alergia à dipirona)

📌 ANTI-INFLAMATÓRIO:
- Nimesulida 100mg: 1 comprimido de 12/12h (fixo) por 7 dias
- Tomar APÓS as refeições

📌 RELAXANTE MUSCULAR:
- Ciclobenzaprina 5mg: 1 comprimido à noite por 7 dias
- Pode dar sonolência

⚠️ D+7: Suspender nimesulida e ciclobenzaprina. Dipirona usar se necessário.`,
    priority: 75
  },

  // ============ ALIMENTAÇÃO ============
  {
    id: 'alimentacao',
    name: 'Alimentação',
    description: 'Orientações alimentares para facilitar evacuação',
    surgeryType: 'geral',
    category: 'alimentacao',
    title: 'Orientações Alimentares',
    dayRangeStart: 0,
    dayRangeEnd: null,
    content: `ALIMENTAÇÃO PÓS-OPERATÓRIA

📌 BEBER BASTANTE ÁGUA:
- 2,5 a 3 litros por dia
- Fundamental para fezes macias

📌 ALIMENTOS RECOMENDADOS (soltam o intestino):
✅ Mamão
✅ Ameixa (fresca ou seca)
✅ Laranja com bagaço
✅ Verduras e legumes
✅ Alimentos integrais
✅ Iogurte natural

📌 EVITAR POR 30 DIAS:
❌ Banana prata (prende)
❌ Goiaba (prende)
❌ Maçã sem casca (prende)
❌ Pimenta e condimentos fortes
❌ Café em excesso
❌ Álcool`,
    priority: 50
  },

  // ============ ATIVIDADE FÍSICA ============
  {
    id: 'atividade-fisica',
    name: 'Atividade Física',
    description: 'Restrições de atividade física no pós-operatório',
    surgeryType: 'geral',
    category: 'atividade_fisica',
    title: 'Restrições de Atividade Física',
    dayRangeStart: 0,
    dayRangeEnd: 30,
    content: `RESTRIÇÕES DE ATIVIDADE FÍSICA

📌 PRIMEIRA SEMANA:
- Repouso relativo
- Pode caminhar normalmente em casa
- Evitar esforço físico

📌 EVITAR POR 30 DIAS:
❌ Atividades de impacto (corrida, pular)
❌ Musculação / academia
❌ Carregar peso > 5kg
❌ Relações sexuais (7 dias)
❌ Dirigir (enquanto usar medicamentos que dão sono)

📌 PODE FAZER:
✅ Caminhadas leves
✅ Atividades cotidianas normais
✅ Trabalho de escritório (após 7-10 dias)

⚠️ HEMORROIDECTOMIA: Almofada tipo boia/anel é CONTRAINDICADA!`,
    priority: 40
  },

  // ============ HIGIENE ============
  {
    id: 'higiene-local',
    name: 'Higiene Local',
    description: 'Como fazer higiene da região operada',
    surgeryType: 'geral',
    category: 'higiene',
    title: 'Higiene da Região Operada',
    dayRangeStart: 0,
    dayRangeEnd: null,
    content: `HIGIENE LOCAL

📌 REGRA DE OURO:
⛔ PROIBIDO usar papel higiênico nas primeiras 4 semanas!

📌 COMO FAZER A HIGIENE:
- Usar água corrente (ducha/chuveirinho) após evacuação
- Sabonete líquido neutro ou de glicerina é permitido
- Secar com toques SUAVES (não esfregar!)

📌 ABSORÇÃO DE SECREÇÕES:
- Usar absorvente ou gaze na roupa íntima
- Trocar quando úmido
- Secreção clara/rosada é NORMAL`,
    priority: 45
  },

  // ============ SINTOMAS NORMAIS ============
  {
    id: 'sintomas-normais',
    name: 'Sintomas Normais',
    description: 'O que é normal sentir no pós-operatório',
    surgeryType: 'hemorroidectomia',
    category: 'sintomas_normais',
    title: 'Sintomas Normais no Pós-Operatório',
    dayRangeStart: 0,
    dayRangeEnd: null,
    content: `SINTOMAS NORMAIS (NÃO SE PREOCUPE)

📌 DOR:
- Dor é esperada, especialmente ao evacuar
- Melhora progressiva ao longo das semanas
- Dor moderada (4-6/10) é normal

📌 SANGRAMENTO:
- Pequenas manchas de sangue são normais
- Especialmente durante/após evacuação

📌 SECREÇÃO:
- Secreção clara, rosada ou amarelada é NORMAL
- Faz parte da cicatrização
- Pode durar até 3 semanas

📌 INCHAÇOS (PLICOMAS):
- "Caroços" de pele ao redor são MUITO comuns
- NÃO significa que as hemorroidas voltaram
- Tendem a diminuir com o tempo

📌 TEMPO DE CICATRIZAÇÃO:
- Cicatrização completa: 40-60 dias
- Paciência é fundamental!`,
    priority: 30
  },

  // ============ SINAIS DE ALARME ============
  {
    id: 'sinais-alarme',
    name: 'Sinais de Alarme (Red Flags)',
    description: 'Quando procurar atendimento médico',
    surgeryType: 'geral',
    category: 'sintomas_normais',
    title: 'SINAIS DE ALARME - Quando Procurar Atendimento',
    dayRangeStart: 0,
    dayRangeEnd: null,
    content: `🚨 SINAIS DE ALARME - QUANDO PROCURAR ATENDIMENTO

📌 URGÊNCIA (Pronto-Socorro IMEDIATAMENTE):
🔴 Sangramento abundante (jato, coágulos, enchendo vaso)
🔴 Não consegue urinar há mais de 8-12 horas
🔴 Febre alta (> 39°C) com calafrios

📌 ATENÇÃO (Contato médico no mesmo dia):
🟠 Febre > 38°C
🟠 Secreção purulenta (pus) + odor forte/fétido
🟠 Dor que PIORA após D+10 (deveria estar melhorando)
🟠 Calafrios

📌 VERIFICAR (Contato se não melhorar):
🟡 Dor intensa ≥ 8/10 não controlada com medicação
🟡 Constipação severa (> 3 dias sem evacuar)

⚠️ NA DÚVIDA, SEMPRE ENTRE EM CONTATO!`,
    priority: 100
  }
];

/**
 * Busca templates por tipo de cirurgia
 */
export function getTemplatesBySurgeryType(surgeryType: string): ProtocolTemplate[] {
  const type = surgeryType.toLowerCase();
  return PROTOCOL_TEMPLATES.filter(t =>
    t.surgeryType === 'geral' || t.surgeryType === type
  );
}

/**
 * Busca templates por categoria
 */
export function getTemplatesByCategory(category: string): ProtocolTemplate[] {
  return PROTOCOL_TEMPLATES.filter(t => t.category === category);
}

/**
 * Busca template por ID
 */
export function getTemplateById(id: string): ProtocolTemplate | undefined {
  return PROTOCOL_TEMPLATES.find(t => t.id === id);
}

/**
 * Lista todas as categorias disponíveis
 */
export function getAvailableCategories(): string[] {
  return [...new Set(PROTOCOL_TEMPLATES.map(t => t.category))];
}
