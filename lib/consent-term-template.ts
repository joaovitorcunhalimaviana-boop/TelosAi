/**
 * Template profissional do Termo de Consentimento Livre e Esclarecido (TCLE)
 * Para uso na plataforma Telos.AI
 *
 * Cobre:
 * 1. Acompanhamento por WhatsApp
 * 2. Compartilhamento de dados anonimizados
 * 3. Uso de dados para pesquisa científica
 * 4. Machine Learning
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
}

export function generateConsentTermHTML(data: TermData): string {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Termo de Consentimento - Telos.AI</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }

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
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 0.5cm;
      text-transform: uppercase;
      border-bottom: 2px solid #0A2647;
      padding-bottom: 0.3cm;
    }

    h2 {
      font-size: 13pt;
      font-weight: bold;
      margin-top: 0.8cm;
      margin-bottom: 0.4cm;
      color: #0A2647;
    }

    h3 {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 0.5cm;
      margin-bottom: 0.3cm;
      color: #0A2647;
    }

    p {
      margin-bottom: 0.4cm;
      text-indent: 1.5cm;
      text-align: justify;
    }

    .no-indent {
      text-indent: 0;
    }

    ul, ol {
      margin-left: 2cm;
      margin-bottom: 0.4cm;
    }

    li {
      margin-bottom: 0.2cm;
      text-align: justify;
    }

    .header-info {
      text-align: center;
      margin-bottom: 1cm;
      font-size: 11pt;
      line-height: 1.4;
    }

    .signature-box {
      margin-top: 1.5cm;
      page-break-inside: avoid;
    }

    .signature-line {
      border-top: 1px solid #000;
      width: 70%;
      margin: 0.8cm auto 0.3cm auto;
    }

    .signature-label {
      text-align: center;
      font-size: 10pt;
      margin-bottom: 0.5cm;
    }

    .checkbox {
      display: inline-block;
      width: 0.5cm;
      height: 0.5cm;
      border: 1px solid #000;
      margin-right: 0.3cm;
      vertical-align: middle;
    }

    .footer {
      margin-top: 1.5cm;
      padding-top: 0.5cm;
      border-top: 1px solid #ccc;
      font-size: 9pt;
      text-align: center;
      color: #666;
    }

    .highlight {
      background-color: #FFF9C4;
      padding: 0.2cm;
      border-left: 3px solid #D4AF37;
      margin: 0.5cm 0;
    }

    strong {
      font-weight: bold;
    }

    em {
      font-style: italic;
    }

    @media print {
      body {
        padding: 0;
      }

      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header-info">
    <strong>TELOS.AI</strong><br>
    Sistema Inteligente de Acompanhamento Pós-Operatório<br>
    www.telos.ai
  </div>

  <h1>Termo de Consentimento Livre e Esclarecido</h1>

  <p class="no-indent">
    <strong>Paciente:</strong> ${data.patientName}<br>
    <strong>CPF:</strong> ${data.patientCpf}<br>
    <strong>Médico Responsável:</strong> ${data.doctorName}<br>
    <strong>CRM:</strong> ${data.doctorCrm}/${data.doctorState}<br>
    <strong>Data:</strong> ${currentDate}
  </p>

  <h2>PREÂMBULO</h2>

  <p>
    Este documento tem por objetivo esclarecer e registrar o seu consentimento livre e esclarecido para
    utilização da plataforma digital <strong>Telos.AI</strong>, um sistema desenvolvido para
    <strong>acompanhamento pós-operatório inteligente</strong>, que utiliza tecnologia de comunicação
    via WhatsApp, análise de dados e inteligência artificial para promover melhor assistência à sua
    recuperação cirúrgica.
  </p>

  <p>
    Você está sendo convidado(a) a autorizar o uso desta tecnologia como complemento ao acompanhamento
    médico tradicional. Leia atentamente todas as informações abaixo e, havendo dúvidas, solicite
    esclarecimentos ao seu médico antes de assinar este termo.
  </p>

  <h2>1. OBJETIVO E FUNCIONAMENTO DA PLATAFORMA</h2>

  <p>
    A plataforma <strong>Telos.AI</strong> tem como objetivo facilitar e aprimorar o acompanhamento
    pós-operatório através de:
  </p>

  <ul>
    <li>
      <strong>Monitoramento remoto:</strong> Envio automatizado de questionários de acompanhamento
      em dias específicos após sua cirurgia (D+1, D+2, D+3, D+5, D+7, D+10, D+14);
    </li>
    <li>
      <strong>Comunicação via WhatsApp:</strong> Utilização do aplicativo WhatsApp como canal de
      comunicação entre você e a equipe médica;
    </li>
    <li>
      <strong>Análise inteligente:</strong> Processamento de suas respostas através de algoritmos
      de inteligência artificial para identificação precoce de possíveis complicações;
    </li>
    <li>
      <strong>Alertas médicos:</strong> Notificação automática ao seu médico em caso de detecção
      de sinais de alerta ou risco aumentado.
    </li>
  </ul>

  <h2>2. AUTORIZAÇÃO PARA ACOMPANHAMENTO VIA WHATSAPP</h2>

  <p>
    Ao assinar este termo, você <strong>AUTORIZA</strong> expressamente:
  </p>

  <ul>
    <li>
      O envio de mensagens automáticas através do WhatsApp cadastrado (${data.patientCpf ? '***.***.***-**' : '[seu número]'})
      para fins de acompanhamento pós-operatório;
    </li>
    <li>
      O recebimento de questionários sobre sua evolução clínica, incluindo perguntas sobre dor,
      sangramento, evacuação, febre e outros sintomas;
    </li>
    <li>
      O processamento de suas respostas por sistema automatizado de análise;
    </li>
    <li>
      O contato telefônico direto pelo médico ou equipe em caso de identificação de sinais de alerta.
    </li>
  </ul>

  <div class="highlight">
    <p class="no-indent">
      <strong>IMPORTANTE:</strong> O acompanhamento via WhatsApp <strong>NÃO SUBSTITUI</strong>
      consultas presenciais, retornos médicos ou atendimento de urgência quando necessário. Em caso
      de sintomas graves, procure atendimento médico imediatamente.
    </p>
  </div>

  <h2>3. COLETA E USO DE DADOS PESSOAIS</h2>

  <h3>3.1. Dados Coletados</h3>

  <p>
    Para funcionamento da plataforma, serão coletados e armazenados os seguintes dados:
  </p>

  <ul>
    <li><strong>Dados de identificação:</strong> nome completo, CPF, data de nascimento, telefone (WhatsApp);</li>
    <li><strong>Dados de saúde:</strong> tipo de cirurgia, data do procedimento, comorbidades, medicações em uso;</li>
    <li><strong>Dados pós-operatórios:</strong> respostas aos questionários de acompanhamento, níveis de dor,
        presença de sintomas, evolução clínica;</li>
    <li><strong>Dados de comunicação:</strong> histórico de mensagens trocadas via WhatsApp.</li>
  </ul>

  <h3>3.2. Finalidades do Tratamento de Dados</h3>

  <p>
    Seus dados serão utilizados para as seguintes finalidades:
  </p>

  <ol>
    <li>
      <strong>Assistência à saúde:</strong> Monitoramento de sua recuperação pós-operatória e
      identificação precoce de complicações;
    </li>
    <li>
      <strong>Comunicação médica:</strong> Facilitar o contato entre você e a equipe médica;
    </li>
    <li>
      <strong>Melhoria do sistema:</strong> Aprimoramento contínuo dos algoritmos de inteligência
      artificial através de análise de padrões (sempre com dados anonimizados);
    </li>
    <li>
      <strong>Pesquisa científica:</strong> Realização de estudos para avanço do conhecimento
      médico (conforme detalhado na seção 4).
    </li>
  </ol>

  <h3>3.3. Segurança e Armazenamento</h3>

  <p>
    Seus dados são armazenados em servidores seguros com criptografia, seguindo as melhores práticas
    de segurança da informação. O acesso aos seus dados identificáveis é restrito ao seu médico
    responsável e à equipe técnica autorizada, sob rigoroso dever de sigilo.
  </p>

  <h3>3.4. Conformidade com a LGPD</h3>

  <p>
    O tratamento de seus dados está em conformidade com a <strong>Lei Geral de Proteção de Dados
    (Lei nº 13.709/2018 - LGPD)</strong>, sendo realizado com base nas seguintes hipóteses legais:
  </p>

  <ul>
    <li><strong>Art. 7º, I:</strong> Mediante seu consentimento;</li>
    <li><strong>Art. 7º, IV:</strong> Para realização de estudos por órgão de pesquisa;</li>
    <li><strong>Art. 11, I, a):</strong> Prestação de serviços de saúde.</li>
  </ul>

  <h2>4. AUTORIZAÇÃO PARA USO DE DADOS EM PESQUISA CIENTÍFICA</h2>

  <h3>4.1. Uso de Dados Anonimizados</h3>

  <p>
    Ao assinar este termo, você <strong>AUTORIZA</strong> o uso de seus dados de forma
    <strong>ANONIMIZADA</strong> (sem identificação pessoal) para:
  </p>

  <ul>
    <li>Estudos científicos sobre resultados pós-operatórios em cirurgia colorretal;</li>
    <li>Desenvolvimento e validação de modelos de inteligência artificial para predição de complicações;</li>
    <li>Análises estatísticas agregadas para identificação de fatores de risco e melhores práticas;</li>
    <li>Publicações científicas em revistas especializadas e congressos médicos.</li>
  </ul>

  <h3>4.2. Processo de Anonimização</h3>

  <p>
    Antes de qualquer uso para pesquisa, seus dados passarão por processo de <strong>anonimização</strong>
    ou <strong>pseudonimização</strong>, conforme previsto no Art. 13, § 3º da LGPD, incluindo:
  </p>

  <ul>
    <li>Remoção de nome, CPF, telefone, endereço e outros identificadores diretos;</li>
    <li>Substituição por códigos pseudônimos quando necessária vinculação longitudinal;</li>
    <li>Agregação estatística que impossibilite identificação individual.</li>
  </ul>

  <div class="highlight">
    <p class="no-indent">
      <strong>GARANTIA:</strong> Em publicações científicas resultantes destes estudos, será
      <strong>IMPOSSÍVEL</strong> identificá-lo(a) individualmente. Apenas dados estatísticos
      agregados serão divulgados (exemplo: "dor média de 7,2/10 em 200 pacientes").
    </p>
  </div>

  ${data.isResearch ? `
  <h3>4.3. Participação em Pesquisa Específica</h3>

  <p>
    Além do uso de dados anonimizados, você está sendo convidado(a) a participar da pesquisa intitulada:
  </p>

  <p class="no-indent" style="text-align: center; margin: 0.5cm 0;">
    <strong>"${data.researchTitle}"</strong>
  </p>

  <p>
    <strong>Pesquisador responsável:</strong> ${data.doctorName}, CRM ${data.doctorCrm}/${data.doctorState}
  </p>

  <p>
    Para esta pesquisa específica, seus dados poderão ser utilizados de forma pseudonimizada (com código
    de identificação que permite rastreamento, mas não identificação pública). A pesquisa foi aprovada
    pelo Comitê de Ética em Pesquisa e seguirá rigorosamente as normas éticas vigentes.
  </p>

  <p>
    <strong>Sua participação nesta pesquisa específica é VOLUNTÁRIA.</strong> Você pode recusar-se a
    participar ou retirar seu consentimento a qualquer momento, sem qualquer prejuízo à continuidade de
    seu tratamento médico.
  </p>
  ` : ''}

  <h2>5. SEUS DIREITOS COMO TITULAR DE DADOS</h2>

  <p>
    Conforme garantido pela LGPD, você tem os seguintes direitos em relação aos seus dados:
  </p>

  <ul>
    <li>
      <strong>Confirmação e acesso:</strong> Confirmar a existência de tratamento e acessar seus dados;
    </li>
    <li>
      <strong>Correção:</strong> Solicitar correção de dados incompletos, inexatos ou desatualizados;
    </li>
    <li>
      <strong>Portabilidade:</strong> Requisitar a portabilidade de seus dados a outro fornecedor;
    </li>
    <li>
      <strong>Eliminação:</strong> Solicitar a eliminação de dados desnecessários, excessivos ou
      tratados em desconformidade;
    </li>
    <li>
      <strong>Revogação do consentimento:</strong> Revogar este consentimento a qualquer momento;
    </li>
    <li>
      <strong>Oposição:</strong> Opor-se ao tratamento de dados realizado com fundamento em uma
      das hipóteses de dispensa de consentimento.
    </li>
  </ul>

  <p>
    Para exercer qualquer destes direitos, entre em contato através do email:
    <strong>lgpd@telos.ai</strong> ou diretamente com seu médico responsável.
  </p>

  <h2>6. BENEFÍCIOS E RISCOS</h2>

  <h3>6.1. Benefícios Esperados</h3>

  <ul>
    <li>Acompanhamento pós-operatório mais próximo e personalizado;</li>
    <li>Detecção precoce de possíveis complicações através de inteligência artificial;</li>
    <li>Maior comodidade na comunicação com a equipe médica;</li>
    <li>Contribuição para avanço do conhecimento científico em cirurgia colorretal.</li>
  </ul>

  <h3>6.2. Riscos Potenciais</h3>

  <ul>
    <li>
      <strong>Riscos mínimos:</strong> Violação de dados (mitigado por medidas rigorosas de segurança);
    </li>
    <li>
      <strong>Falsos negativos:</strong> Possibilidade de o sistema não detectar alguma complicação
      (por isso, consultas presenciais e avaliação clínica permanecem essenciais);
    </li>
    <li>
      <strong>Desconforto mínimo:</strong> Tempo dedicado para responder questionários via WhatsApp.
    </li>
  </ul>

  <h2>7. VOLUNTARIEDADE E REVOGAÇÃO</h2>

  <p>
    Sua participação e o fornecimento de seus dados são <strong>VOLUNTÁRIOS</strong>. A recusa em
    participar ou a revogação posterior deste consentimento <strong>NÃO ACARRETARÁ</strong> qualquer
    prejuízo ao seu atendimento médico.
  </p>

  <p>
    Você pode revogar este consentimento a qualquer momento, solicitando a exclusão de seus dados do
    sistema. Neste caso:
  </p>

  <ul>
    <li>O acompanhamento via WhatsApp será interrompido;</li>
    <li>Seus dados identificáveis serão excluídos do sistema;</li>
    <li>Dados já anonimizados e utilizados em análises agregadas não podem ser removidos
        retrospectivamente (pois não há como identificá-los);</li>
    <li>Seu tratamento médico continuará normalmente, com acompanhamento tradicional.</li>
  </ul>

  <h2>8. CONTATOS E ESCLARECIMENTOS</h2>

  <p class="no-indent">
    <strong>Médico Responsável:</strong><br>
    ${data.doctorName}<br>
    CRM: ${data.doctorCrm}/${data.doctorState}<br>
  </p>

  <p class="no-indent" style="margin-top: 0.5cm;">
    <strong>Plataforma Telos.AI:</strong><br>
    Website: www.telos.ai<br>
    Email LGPD: lgpd@telos.ai<br>
    Suporte: suporte@telos.ai
  </p>

  ${data.isResearch ? `
  <p class="no-indent" style="margin-top: 0.5cm;">
    <strong>Comitê de Ética em Pesquisa (CEP):</strong><br>
    [Nome da Instituição]<br>
    Telefone: [telefone]<br>
    Email: [email]
  </p>
  ` : ''}

  <h2>9. DECLARAÇÃO DE CONSENTIMENTO</h2>

  <p class="no-indent">
    Eu, <strong>${data.patientName}</strong>, portador(a) do CPF <strong>${data.patientCpf}</strong>,
    declaro que:
  </p>

  <ul style="list-style: none; margin-left: 0;">
    <li><span class="checkbox"></span> Li e compreendi todas as informações contidas neste Termo de Consentimento;</li>
    <li><span class="checkbox"></span> Tive oportunidade de fazer perguntas e todas foram respondidas satisfatoriamente;</li>
    <li><span class="checkbox"></span> Autorizo o acompanhamento pós-operatório via WhatsApp;</li>
    <li><span class="checkbox"></span> Autorizo a coleta e uso de meus dados conforme descrito neste termo;</li>
    <li><span class="checkbox"></span> Autorizo o uso de meus dados anonimizados para pesquisa científica;</li>
    ${data.isResearch ? '<li><span class="checkbox"></span> Aceito participar voluntariamente da pesquisa específica mencionada;</li>' : ''}
    <li><span class="checkbox"></span> Estou ciente de que posso revogar este consentimento a qualquer momento;</li>
    <li><span class="checkbox"></span> Recebi uma cópia deste termo para meus registros.</li>
  </ul>

  <div class="signature-box">
    <div class="signature-line"></div>
    <div class="signature-label">
      <strong>Assinatura do(a) Paciente</strong><br>
      ${data.patientName}<br>
      CPF: ${data.patientCpf}
    </div>
  </div>

  <div class="signature-box">
    <div class="signature-line"></div>
    <div class="signature-label">
      <strong>Assinatura do(a) Médico(a) Responsável</strong><br>
      ${data.doctorName}<br>
      CRM: ${data.doctorCrm}/${data.doctorState}
    </div>
  </div>

  <div class="signature-box">
    <div class="signature-line"></div>
    <div class="signature-label">
      <strong>Testemunha (opcional)</strong><br>
      Nome: _______________________________________<br>
      CPF: ________________________________________
    </div>
  </div>

  <p class="no-indent" style="text-align: center; margin-top: 1cm;">
    <strong>Local e Data:</strong> _________________________, _____ de _____________ de _______
  </p>

  <div class="footer">
    <p class="no-indent">
      Este documento foi gerado pela plataforma Telos.AI em ${currentDate}.<br>
      Imprima este termo em 2 (duas) vias: uma para o paciente e outra para arquivo médico.<br>
      Protocolo: ${Math.random().toString(36).substring(2, 10).toUpperCase()}
    </p>
  </div>

  <div class="no-print" style="margin-top: 2cm; text-align: center; page-break-before: always;">
    <button onclick="window.print()" style="padding: 15px 30px; font-size: 14pt; background: #0A2647; color: white; border: none; border-radius: 8px; cursor: pointer;">
      🖨️ Imprimir Termo
    </button>
  </div>
</body>
</html>
  `.trim()
}

export function generateConsentTermPDF(data: TermData): string {
  // Para futuro: Gerar PDF usando jsPDF
  // Por enquanto, retorna HTML que pode ser impresso como PDF
  return generateConsentTermHTML(data)
}
