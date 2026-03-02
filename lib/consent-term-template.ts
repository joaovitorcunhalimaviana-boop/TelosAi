/**
 * Termo de Consentimento Livre e Esclarecido (TCLE) - UNIFICADO
 * Para uso na plataforma VigIA
 *
 * Cobre em um único documento:
 * 1. Consentimento cirúrgico (procedimento, riscos, complicações)
 * 2. Acompanhamento pós-operatório via WhatsApp
 * 3. Coleta, uso e proteção de dados (LGPD)
 * 4. Uso de dados anonimizados para pesquisa científica
 * 5. Inteligência artificial e Machine Learning
 */

export interface TermData {
  patientName: string
  patientCpf: string
  doctorName: string
  doctorCrm: string
  doctorState: string
  date: string
  researchTitle?: string
  isResearch: boolean
  surgeryType?: string
}

// Dados cirúrgicos por tipo de procedimento
const surgeryInfo: Record<string, { nome: string; descricao: string; complicacoes: string }> = {
  hemorroidectomia: {
    nome: "Hemorroidectomia (Cirurgia de Hemorroidas)",
    descricao: "Remoção cirúrgica dos coxins hemorroidários quando causam sangramento, prolapso, dor ou desconforto. Técnicas possíveis: Milligan-Morgan (ferida aberta), Ferguson (ferida fechada) ou PPH (grampeador). A escolha da técnica será definida pelo cirurgião durante o ato operatório, sob anestesia raquidiana, geral ou combinada.",
    complicacoes: "dor pós-operatória (especialmente durante evacuações nas primeiras semanas), sangramento, retenção urinária, infecção da ferida, incontinência fecal (temporária ou, excepcionalmente, permanente), estenose anal, recidiva, fissura anal pós-operatória e trombose hemorroidária residual"
  },
  fistula: {
    nome: "Tratamento Cirúrgico de Fístula Anal",
    descricao: "Tratamento de trajeto anormal entre o canal anal e a pele perianal, geralmente consequência de abscesso prévio. Técnicas possíveis: fistulotomia, sedenho, LIFT, retalho de avanço, VAAFT ou FiLaC. A escolha depende da complexidade e do envolvimento esfincteriano.",
    complicacoes: "dor e desconforto pós-operatório, sangramento, infecção, recidiva da fístula, incontinência fecal, estenose anal, formação de abscesso, cicatrização prolongada e possível necessidade de múltiplos procedimentos"
  },
  fissura: {
    nome: "Tratamento Cirúrgico de Fissura Anal",
    descricao: "Tratamento de ferida/úlcera no canal anal que causa dor intensa durante e após evacuações. Técnicas possíveis: esfincterotomia lateral interna, fissurectomia com ou sem retalho de avanço. Indicado quando o tratamento conservador não foi eficaz.",
    complicacoes: "dor pós-operatória, sangramento, infecção, recidiva da fissura, incontinência fecal para gases ou fezes (temporária ou permanente), estenose anal e cicatrização prolongada"
  },
  pilonidal: {
    nome: "Tratamento Cirúrgico de Doença Pilonidal",
    descricao: "Tratamento de cisto ou abscesso na região sacrococcígea (entre as nádegas), causado por pelos que penetram a pele. Técnicas possíveis: excisão com cicatrização por segunda intenção, excisão com fechamento primário, retalho de Limberg ou Karydakis.",
    complicacoes: "dor pós-operatória, sangramento, infecção da ferida, deiscência (abertura da sutura), recidiva da doença, cicatrização prolongada (semanas a meses) e restrição temporária de atividades"
  }
}

export function generateConsentTermHTML(data: TermData): string {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Determina dados cirúrgicos
  const surgery = data.surgeryType ? surgeryInfo[data.surgeryType] : null

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Termo de Consentimento Unificado - VigIA</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      max-width: 21cm;
      margin: 0 auto;
      padding: 2cm;
      text-align: justify;
      background: white;
    }
    h1 {
      text-align: center;
      font-size: 15pt;
      font-weight: bold;
      margin-bottom: 0.3cm;
      text-transform: uppercase;
      border-bottom: 2px solid #0A2647;
      padding-bottom: 0.3cm;
    }
    h2 {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 0.6cm;
      margin-bottom: 0.3cm;
      color: #0A2647;
    }
    p { margin-bottom: 0.3cm; text-indent: 1.5cm; text-align: justify; }
    .no-indent { text-indent: 0; }
    ul, ol { margin-left: 1.5cm; margin-bottom: 0.3cm; }
    li { margin-bottom: 0.15cm; text-align: justify; }
    .header-info {
      text-align: center;
      margin-bottom: 0.8cm;
      font-size: 11pt;
      line-height: 1.4;
    }
    .signature-box { margin-top: 1cm; page-break-inside: avoid; }
    .signature-line { border-top: 1px solid #000; width: 70%; margin: 0.6cm auto 0.2cm auto; }
    .signature-label { text-align: center; font-size: 10pt; margin-bottom: 0.4cm; }
    .checkbox {
      display: inline-block;
      width: 0.4cm;
      height: 0.4cm;
      border: 1px solid #000;
      margin-right: 0.3cm;
      vertical-align: middle;
    }
    .highlight {
      background-color: #FFF9C4;
      padding: 0.2cm 0.3cm;
      border-left: 3px solid #0A2647;
      margin: 0.4cm 0;
    }
    .footer {
      margin-top: 1cm;
      padding-top: 0.3cm;
      border-top: 1px solid #ccc;
      font-size: 9pt;
      text-align: center;
      color: #666;
    }
    @media print { body { padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header-info">
    <strong>VigIA</strong> — Sistema Inteligente de Acompanhamento Pós-Operatório<br>
    www.vigia.med.br
  </div>

  <h1>Termo de Consentimento Livre e Esclarecido</h1>

  <p class="no-indent">
    <strong>Paciente:</strong> ${data.patientName} &nbsp;|&nbsp;
    <strong>CPF:</strong> ${data.patientCpf}<br>
    <strong>Médico:</strong> ${data.doctorName} &nbsp;|&nbsp;
    <strong>CRM:</strong> ${data.doctorCrm}/${data.doctorState} &nbsp;|&nbsp;
    <strong>Data:</strong> ${currentDate}
  </p>

  <p>
    Este Termo reúne, em documento único, o consentimento para: (a) o procedimento cirúrgico proposto;
    (b) o acompanhamento pós-operatório via WhatsApp pela plataforma VigIA; e (c) a coleta, uso e
    proteção dos seus dados pessoais e de saúde, conforme a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
  </p>

  ${surgery ? `
  <h2>1. PROCEDIMENTO CIRÚRGICO</h2>

  <p>
    <strong>Procedimento:</strong> ${surgery.nome}
  </p>

  <p>${surgery.descricao}</p>

  <p>
    <strong>Complicações possíveis:</strong> Apesar de todos os cuidados técnicos, complicações podem
    ocorrer, incluindo: ${surgery.complicacoes}. Fatores individuais como diabetes, obesidade, tabagismo,
    imunossupressão, uso de anticoagulantes, cirurgias prévias na região e doença inflamatória intestinal
    podem influenciar o resultado e a cicatrização.
  </p>

  <p>
    Fui informado(a) sobre alternativas de tratamento (conservador e/ou ambulatorial) e compreendo que
    a cirurgia foi indicada por ser a melhor opção para o meu caso. O resultado não pode ser garantido
    de forma absoluta. Autorizo o médico e sua equipe a realizarem o procedimento, bem como quaisquer
    medidas adicionais necessárias durante o ato operatório.
  </p>
  ` : `
  <h2>1. PROCEDIMENTO CIRÚRGICO</h2>

  <p>
    Fui informado(a) sobre o procedimento cirúrgico proposto, suas indicações, técnicas disponíveis,
    complicações possíveis e alternativas de tratamento. Compreendo que complicações podem ocorrer
    mesmo com técnica adequada e que o resultado não pode ser garantido de forma absoluta. Autorizo
    o médico e sua equipe a realizarem o procedimento e quaisquer medidas adicionais necessárias.
  </p>
  `}

  <h2>2. ACOMPANHAMENTO PÓS-OPERATÓRIO VIA WHATSAPP</h2>

  <p>
    Autorizo o envio de questionários automáticos via WhatsApp nos dias D+1, D+2, D+3, D+5, D+7,
    D+10 e D+14 após a cirurgia, para monitoramento da minha recuperação. As respostas serão
    analisadas por inteligência artificial para detecção precoce de complicações, com alertas
    automáticos ao médico quando necessário. Em caso de sinais de alerta, poderei ser contatado(a)
    diretamente pela equipe médica.
  </p>

  <div class="highlight">
    <p class="no-indent">
      <strong>IMPORTANTE:</strong> O acompanhamento via WhatsApp <strong>NÃO SUBSTITUI</strong>
      consultas presenciais ou atendimento de urgência. Em caso de sintomas graves, procure
      atendimento médico imediatamente (SAMU: 192).
    </p>
  </div>

  <h2>3. COLETA, USO E PROTEÇÃO DE DADOS (LGPD)</h2>

  <p>
    <strong>Dados coletados:</strong> nome, CPF, data de nascimento, telefone, tipo de cirurgia,
    comorbidades, medicações, respostas aos questionários, níveis de dor, evolução clínica e
    histórico de mensagens via WhatsApp.
  </p>

  <p>
    <strong>Finalidades:</strong> (i) assistência à saúde e monitoramento da recuperação;
    (ii) comunicação entre paciente e equipe médica; (iii) aprimoramento dos algoritmos de
    inteligência artificial (com dados anonimizados); e (iv) pesquisa científica (conforme seção 4).
  </p>

  <p>
    <strong>Segurança:</strong> Dados armazenados em servidores com criptografia, acesso restrito ao
    médico responsável e equipe técnica autorizada, com registro de auditoria. Bases legais: Art. 7º, I
    (consentimento), Art. 7º, IV (pesquisa) e Art. 11, I, a (saúde) da LGPD.
  </p>

  <p>
    <strong>Seus direitos (Art. 18, LGPD):</strong> acesso, correção, portabilidade, eliminação de
    dados desnecessários e revogação do consentimento a qualquer momento, via <strong>lgpd@vigia.med.br</strong>
    ou diretamente com seu médico.
  </p>

  <h2>4. USO DE DADOS PARA PESQUISA CIENTÍFICA</h2>

  <p>
    Autorizo o uso dos meus dados de forma <strong>anonimizada</strong> (sem qualquer identificação
    pessoal) para estudos científicos sobre resultados pós-operatórios, desenvolvimento de modelos de
    inteligência artificial e publicações em revistas e congressos médicos. A anonimização inclui
    remoção de nome, CPF, telefone e demais identificadores, conforme Art. 13, §3º da LGPD. Em
    publicações, será impossível a identificação individual.
  </p>

  ${data.isResearch && data.researchTitle ? `
  <p>
    <strong>Pesquisa específica:</strong> Estou sendo convidado(a) a participar da pesquisa
    "<em>${data.researchTitle}</em>", conduzida por ${data.doctorName} (CRM ${data.doctorCrm}/${data.doctorState}).
    Nesta pesquisa, meus dados poderão ser usados de forma pseudonimizada. A participação é voluntária
    e posso recusar ou revogar a qualquer momento, sem prejuízo ao meu tratamento.
  </p>
  ` : ''}

  <h2>5. VOLUNTARIEDADE E REVOGAÇÃO</h2>

  <p>
    Minha participação é <strong>voluntária</strong>. A recusa ou revogação posterior deste consentimento
    não prejudicará meu atendimento médico. Em caso de revogação: o acompanhamento via WhatsApp será
    interrompido, meus dados identificáveis serão excluídos, mas dados já anonimizados em análises
    agregadas não poderão ser removidos (pois não há como identificá-los). O tratamento continuará
    normalmente com acompanhamento tradicional.
  </p>

  <h2>6. DECLARAÇÃO DE CONSENTIMENTO</h2>

  <p class="no-indent">
    Eu, <strong>${data.patientName}</strong>, CPF <strong>${data.patientCpf}</strong>, declaro que:
  </p>

  <ul style="list-style: none; margin-left: 0;">
    <li><span class="checkbox"></span> Li e compreendi todas as informações deste Termo;</li>
    <li><span class="checkbox"></span> Tive oportunidade de fazer perguntas e todas foram esclarecidas;</li>
    ${surgery ? `<li><span class="checkbox"></span> Autorizo a realização do procedimento cirúrgico descrito;</li>` : ''}
    <li><span class="checkbox"></span> Autorizo o acompanhamento pós-operatório via WhatsApp;</li>
    <li><span class="checkbox"></span> Autorizo a coleta e uso dos meus dados conforme descrito;</li>
    <li><span class="checkbox"></span> Autorizo o uso de dados anonimizados para pesquisa científica;</li>
    ${data.isResearch ? '<li><span class="checkbox"></span> Aceito participar voluntariamente da pesquisa específica mencionada;</li>' : ''}
    <li><span class="checkbox"></span> Estou ciente de que posso revogar este consentimento a qualquer momento;</li>
    <li><span class="checkbox"></span> Recebi uma cópia deste Termo.</li>
  </ul>

  <div class="signature-box">
    <div class="signature-line"></div>
    <div class="signature-label">
      <strong>Paciente:</strong> ${data.patientName} — CPF: ${data.patientCpf}
    </div>
  </div>

  <div class="signature-box">
    <div class="signature-line"></div>
    <div class="signature-label">
      <strong>Médico:</strong> ${data.doctorName} — CRM: ${data.doctorCrm}/${data.doctorState}
    </div>
  </div>

  <div class="signature-box">
    <div class="signature-line"></div>
    <div class="signature-label">
      <strong>Testemunha (opcional):</strong> Nome: __________________ CPF: __________________
    </div>
  </div>

  <p class="no-indent" style="text-align: center; margin-top: 0.8cm;">
    <strong>Local e Data:</strong> _________________________, _____ de _____________ de _______
  </p>

  <div class="footer">
    <p class="no-indent">
      Documento gerado pela plataforma VigIA em ${currentDate}.<br>
      Imprima em 2 vias: uma para o paciente e outra para arquivo médico.<br>
      Contato LGPD: lgpd@vigia.med.br | Suporte: suporte@vigia.med.br<br>
      Protocolo: ${Math.random().toString(36).substring(2, 10).toUpperCase()}
    </p>
  </div>

  <div class="no-print" style="margin-top: 2cm; text-align: center;">
    <button onclick="window.print()" style="padding: 15px 30px; font-size: 14pt; background: #0A2647; color: white; border: none; border-radius: 8px; cursor: pointer;">
      🖨️ Imprimir Termo
    </button>
  </div>
</body>
</html>
  `.trim()
}

export function generateConsentTermPDF(data: TermData): string {
  return generateConsentTermHTML(data)
}
