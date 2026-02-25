export interface TermoData {
  pacienteNome: string;
  pacienteCPF?: string;
  data: string;
  cidade?: string;
}

export const termoTemplates = {
  hemorroidectomia: {
    titulo: "TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO",
    subtitulo: "Hemorroidectomia (Cirurgia de Hemorroidas)",
    conteudo: (data: TermoData) => `
      <p>Eu, <strong>${data.pacienteNome}</strong>${data.pacienteCPF ? `, CPF ${data.pacienteCPF}` : ''}, declaro que fui devidamente informado(a) pelo Dr. João Vitor Viana, CRM-PB 12831, sobre o procedimento cirúrgico de <strong>Hemorroidectomia</strong> que será realizado.</p>

      <h3>Informações sobre o procedimento:</h3>
      <p>A hemorroidectomia é a cirurgia indicada para tratamento de hemorroidas (dilatações das veias do ânus e reto) quando outros tratamentos não foram eficazes. O procedimento consiste na remoção cirúrgica dos mamilos hemorroidários através de técnicas modernas que visam diminuir a dor no pós-operatório.</p>

      <h3>Riscos e complicações possíveis:</h3>
      <ul>
        <li>Dor no pós-operatório (controlada com medicação adequada)</li>
        <li>Sangramento leve a moderado nas primeiras 24-48 horas</li>
        <li>Dificuldade para urinar temporariamente</li>
        <li>Infecção local (pouco frequente com os cuidados adequados)</li>
        <li>Incontinência temporária ou permanente (pouco frequente)</li>
        <li>Estenose anal (estreitamento do canal anal - pouco frequente)</li>
        <li>Recidiva das hemorroidas (nova formação)</li>
      </ul>

      <h3>Cuidados pós-operatórios:</h3>
      <p>Fui orientado(a) sobre a importância dos cuidados no pós-operatório, incluindo: higiene adequada da região anal, uso correto das medicações prescritas, alimentação rica em fibras, hidratação adequada e repouso nas primeiras semanas. O retorno às atividades normais será gradual conforme orientação médica.</p>

      <h3>Alternativas de tratamento:</h3>
      <p>Fui informado(a) sobre as alternativas de tratamento não cirúrgico, incluindo tratamento clínico com medicações, mudanças alimentares, e procedimentos ambulatoriais como ligadura elástica. Compreendo que a cirurgia foi indicada por ser a melhor opção para o meu caso.</p>

      <h3>Consentimento:</h3>
      <p>Declaro que tive oportunidade de esclarecer todas as minhas dúvidas e que compreendi todas as informações fornecidas. Autorizo a realização do procedimento cirúrgico e estou ciente dos riscos envolvidos.</p>
    `
  },

  fistulaAnal: {
    titulo: "TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO",
    subtitulo: "Tratamento Cirúrgico de Fístula Anal",
    conteudo: (data: TermoData) => `
      <p>Eu, <strong>${data.pacienteNome}</strong>${data.pacienteCPF ? `, CPF ${data.pacienteCPF}` : ''}, declaro que fui devidamente informado(a) pelo Dr. João Vitor Viana, CRM-PB 12831, sobre o procedimento cirúrgico para tratamento de <strong>Fístula Anal</strong>.</p>

      <h3>Informações sobre o procedimento:</h3>
      <p>A fístula anal é um trajeto anormal que se forma entre o canal anal e a pele ao redor do ânus, geralmente como consequência de um abscesso. O tratamento cirúrgico visa identificar e tratar o trajeto fistuloso, podendo envolver diferentes técnicas dependendo da complexidade da fístula (fistulotomia, uso de seton, LIFT, entre outras).</p>

      <h3>Riscos e complicações possíveis:</h3>
      <ul>
        <li>Dor e desconforto no pós-operatório</li>
        <li>Sangramento local</li>
        <li>Infecção da ferida operatória</li>
        <li>Recidiva da fístula (reaparecimento do trajeto fistuloso)</li>
        <li>Incontinência fecal parcial ou total (risco maior em fístulas complexas que envolvem o esfíncter anal)</li>
        <li>Estenose anal (estreitamento do canal anal)</li>
        <li>Necessidade de mais de um procedimento cirúrgico</li>
      </ul>

      <h3>Cuidados pós-operatórios:</h3>
      <p>Fui orientado(a) sobre a importância dos cuidados pós-operatórios: higiene meticulosa da região, banhos de assento com água morna, uso das medicações conforme prescrito, alimentação adequada e acompanhamento regular. O processo de cicatrização pode levar semanas a meses, dependendo da complexidade da fístula.</p>

      <h3>Expectativas de tratamento:</h3>
      <p>Compreendo que o tratamento de fístulas anais pode ser desafiador e que, em alguns casos, pode haver necessidade de mais de uma cirurgia. A escolha da técnica cirúrgica leva em consideração a preservação da função esfincteriana e a melhor chance de cura definitiva.</p>

      <h3>Consentimento:</h3>
      <p>Declaro que tive oportunidade de esclarecer todas as minhas dúvidas e que compreendi todas as informações fornecidas. Autorizo a realização do procedimento cirúrgico e estou ciente dos riscos envolvidos.</p>
    `
  },

  fissuraAnal: {
    titulo: "TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO",
    subtitulo: "Tratamento Cirúrgico de Fissura Anal",
    conteudo: (data: TermoData) => `
      <p>Eu, <strong>${data.pacienteNome}</strong>${data.pacienteCPF ? `, CPF ${data.pacienteCPF}` : ''}, declaro que fui devidamente informado(a) pelo Dr. João Vitor Viana, CRM-PB 12831, sobre o procedimento cirúrgico para tratamento de <strong>Fissura Anal</strong>.</p>

      <h3>Informações sobre o procedimento:</h3>
      <p>A fissura anal é uma ferida ou rachadura na mucosa do canal anal que causa dor intensa durante e após as evacuações. Quando o tratamento clínico não é eficaz, indica-se o tratamento cirúrgico, geralmente através da esfincterotomia lateral interna (corte parcial do músculo esfíncter interno) para diminuir a pressão no canal anal e permitir a cicatrização.</p>

      <h3>Riscos e complicações possíveis:</h3>
      <ul>
        <li>Dor no pós-operatório inicial</li>
        <li>Sangramento leve a moderado</li>
        <li>Incontinência fecal temporária ou permanente, geralmente para gases (5-10% dos casos)</li>
        <li>Infecção local</li>
        <li>Hematoma (acúmulo de sangue no local)</li>
        <li>Persistência ou recidiva da fissura (pouco frequente)</li>
        <li>Formação de abscesso ou fístula (pouco frequente)</li>
      </ul>

      <h3>Cuidados pós-operatórios:</h3>
      <p>Fui orientado(a) sobre os cuidados necessários: higiene adequada, uso de pomadas e medicações prescritas, manutenção de fezes macias através de dieta rica em fibras e hidratação, evitar esforço evacuatório. A cicatrização completa geralmente ocorre em 4 a 6 semanas.</p>

      <h3>Tratamento prévio:</h3>
      <p>Compreendo que a cirurgia foi indicada após tentativa de tratamento clínico (pomadas, amaciantes de fezes, mudanças alimentares) sem sucesso adequado. A fissura crônica tem menor chance de cicatrização espontânea, sendo a cirurgia a melhor opção para resolução definitiva.</p>

      <h3>Consentimento:</h3>
      <p>Declaro que tive oportunidade de esclarecer todas as minhas dúvidas e que compreendi todas as informações fornecidas. Autorizo a realização do procedimento cirúrgico e estou ciente dos riscos envolvidos.</p>
    `
  },

  doencaPilonidal: {
    titulo: "TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO",
    subtitulo: "Tratamento Cirúrgico de Doença Pilonidal (Cisto Pilonidal)",
    conteudo: (data: TermoData) => `
      <p>Eu, <strong>${data.pacienteNome}</strong>${data.pacienteCPF ? `, CPF ${data.pacienteCPF}` : ''}, declaro que fui devidamente informado(a) pelo Dr. João Vitor Viana, CRM-PB 12831, sobre o procedimento cirúrgico para tratamento de <strong>Doença Pilonidal</strong>.</p>

      <h3>Informações sobre o procedimento:</h3>
      <p>A doença pilonidal caracteriza-se pela formação de cistos ou abscessos na região do cóccix (rabinho), causados por pelos que penetram na pele. O tratamento cirúrgico envolve a remoção completa do cisto e trajetos associados. Existem diferentes técnicas cirúrgicas, que podem deixar a ferida aberta para cicatrização por segunda intenção ou fechada com suturas, dependendo de cada caso.</p>

      <h3>Riscos e complicações possíveis:</h3>
      <ul>
        <li>Dor no pós-operatório, especialmente ao sentar</li>
        <li>Sangramento e formação de hematoma</li>
        <li>Infecção da ferida operatória</li>
        <li>Deiscência da ferida (abertura dos pontos em casos de sutura)</li>
        <li>Cicatrização prolongada (especialmente em feridas deixadas abertas)</li>
        <li>Recidiva da doença (retorno do cisto - pode ocorrer em 10-30% dos casos dependendo da técnica)</li>
        <li>Necessidade de curativos frequentes</li>
        <li>Afastamento prolongado de atividades laborais</li>
      </ul>

      <h3>Cuidados pós-operatórios:</h3>
      <p>Fui orientado(a) sobre a importância dos cuidados: manutenção da ferida limpa e seca, realização de curativos conforme orientação, depilação regular da região para prevenir recidiva, evitar permanecer sentado por períodos prolongados nas primeiras semanas, uso adequado das medicações prescritas. O tempo de cicatrização varia conforme a técnica utilizada.</p>

      <h3>Expectativas realistas:</h3>
      <p>Compreendo que o tratamento da doença pilonidal pode requerer um período de recuperação relativamente longo e que medidas preventivas (como depilação regular da região) são importantes para reduzir o risco de recidiva após a cicatrização completa.</p>

      <h3>Consentimento:</h3>
      <p>Declaro que tive oportunidade de esclarecer todas as minhas dúvidas e que compreendi todas as informações fornecidas. Autorizo a realização do procedimento cirúrgico e estou ciente dos riscos envolvidos.</p>
    `
  },

  lgpd: {
    titulo: "TERMO DE CONSENTIMENTO PARA USO DE DADOS",
    subtitulo: "Lei Geral de Proteção de Dados (LGPD) - Lei nº 13.709/2018",
    conteudo: (data: TermoData) => `
      <p>Eu, <strong>${data.pacienteNome}</strong>${data.pacienteCPF ? `, CPF ${data.pacienteCPF}` : ''}, autorizo o uso dos meus dados pessoais e de saúde conforme disposto na Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>

      <h3>1. Identificação do Controlador de Dados:</h3>
      <p><strong>Controlador:</strong> Dr. João Vitor Viana - CRM-PB 12831<br/>
      <strong>Plataforma:</strong> VigIA - Sistema de Acompanhamento Pós-Operatório<br/>
      <strong>Endereço:</strong> João Pessoa, Paraíba<br/>
      <strong>E-mail para contato:</strong> vigia.app.br@gmail.com</p>

      <h3>2. Base Legal do Tratamento:</h3>
      <p>O tratamento dos seus dados pessoais é realizado com base nas seguintes hipóteses legais previstas no Art. 7º e 11º da LGPD:</p>
      <ul>
        <li><strong>Consentimento:</strong> Você autoriza expressamente o tratamento dos seus dados</li>
        <li><strong>Execução de contrato:</strong> Necessário para a prestação de serviços médicos</li>
        <li><strong>Exercício regular de direitos:</strong> Cumprimento de obrigação legal ou regulatória (Código de Ética Médica, CFM)</li>
        <li><strong>Tutela da saúde:</strong> Procedimento realizado por profissionais de saúde</li>
        <li><strong>Pesquisa:</strong> Pesquisa científica com garantia de anonimização quando aplicável</li>
      </ul>

      <h3>3. Dados Coletados e Finalidades:</h3>
      <p>Os seguintes tipos de dados poderão ser coletados e tratados:</p>
      <ul>
        <li><strong>Dados cadastrais:</strong> nome, CPF, RG, data de nascimento, endereço, telefone, e-mail</li>
        <li><strong>Dados de saúde:</strong> histórico médico, diagnósticos, procedimentos cirúrgicos realizados, medicações, evolução clínica, respostas a questionários pós-operatórios, fotografias clínicas (quando aplicável)</li>
        <li><strong>Dados de acompanhamento:</strong> mensagens via WhatsApp, respostas a questionários automáticos, alertas de complicações</li>
      </ul>

      <p><strong>Finalidades do tratamento:</strong></p>
      <ul>
        <li>Prestação de serviços médicos e acompanhamento pós-operatório</li>
        <li>Pesquisas científicas na área de cirurgia colorretal e proctologia</li>
        <li>Estudos sobre eficácia de tratamentos e técnicas cirúrgicas</li>
        <li>Publicações acadêmicas em revistas científicas e apresentações em congressos médicos (dados anonimizados)</li>
        <li>Melhoria contínua dos protocolos de atendimento e qualidade assistencial</li>
        <li>Cumprimento de obrigações legais e regulatórias do Conselho Federal de Medicina</li>
        <li>Defesa de direitos em processos judiciais, administrativos ou arbitrais</li>
      </ul>

      <h3>4. Compartilhamento de Dados:</h3>
      <p>Seus dados poderão ser compartilhados com:</p>
      <ul>
        <li><strong>Equipe médica:</strong> Profissionais envolvidos no seu tratamento</li>
        <li><strong>Laboratórios e serviços de diagnóstico:</strong> Para realização de exames</li>
        <li><strong>Hospitais e clínicas:</strong> Onde o procedimento será realizado</li>
        <li><strong>Instituições de pesquisa:</strong> Somente dados anonimizados para fins científicos</li>
        <li><strong>Autoridades competentes:</strong> Quando exigido por lei ou ordem judicial</li>
        <li><strong>Prestadores de serviço:</strong> Empresas de tecnologia que auxiliam na plataforma VigIA (sob contrato de confidencialidade)</li>
      </ul>
      <p>Em nenhuma hipótese seus dados identificáveis serão vendidos ou comercializados.</p>

      <h3>5. Período de Retenção:</h3>
      <p>Seus dados serão armazenados pelo seguinte período:</p>
      <ul>
        <li><strong>Prontuário médico:</strong> Mínimo de 20 anos conforme Resolução CFM nº 1.821/2007</li>
        <li><strong>Dados para pesquisa:</strong> Anonimizados permanentemente após término do tratamento</li>
        <li><strong>Dados de backup:</strong> Mantidos de forma segura pelo período legal exigido</li>
        <li><strong>Imagens e exames:</strong> Conforme determinação do CFM e necessidade clínica</li>
      </ul>
      <p>Após esses períodos, os dados serão eliminados de forma segura ou mantidos apenas de forma anonimizada para fins estatísticos ou de pesquisa.</p>

      <h3>6. Segurança e Proteção:</h3>
      <p>Fui informado(a) sobre as medidas de segurança implementadas:</p>
      <ul>
        <li>Armazenamento em servidores seguros com criptografia</li>
        <li>Acesso restrito apenas a profissionais autorizados mediante autenticação</li>
        <li>Backups regulares para prevenção de perda de dados</li>
        <li>Logs de acesso para rastreabilidade</li>
        <li>Protocolos de resposta a incidentes de segurança</li>
        <li>Treinamento regular da equipe sobre proteção de dados</li>
        <li>Anonimização de dados para uso em pesquisas científicas</li>
      </ul>

      <h3>7. Direitos do Titular dos Dados (Art. 18 da LGPD):</h3>
      <p>Compreendo que possuo os seguintes direitos que podem ser exercidos a qualquer momento:</p>
      <ul>
        <li><strong>Confirmação e acesso:</strong> Confirmar a existência de tratamento e acessar meus dados</li>
        <li><strong>Correção:</strong> Solicitar a correção de dados incompletos, inexatos ou desatualizados</li>
        <li><strong>Anonimização, bloqueio ou eliminação:</strong> De dados desnecessários, excessivos ou tratados em desconformidade</li>
        <li><strong>Portabilidade:</strong> Solicitar a transferência dos dados a outro prestador de serviço</li>
        <li><strong>Eliminação:</strong> Dos dados tratados com base no consentimento (ressalvadas as hipóteses de guarda obrigatória)</li>
        <li><strong>Informação:</strong> Sobre entidades públicas e privadas com as quais houve compartilhamento</li>
        <li><strong>Informação sobre a possibilidade de não fornecer consentimento:</strong> E sobre as consequências da negativa</li>
        <li><strong>Revogação do consentimento:</strong> A qualquer momento mediante manifestação expressa</li>
        <li><strong>Oposição:</strong> Ao tratamento realizado com dispensa de consentimento</li>
        <li><strong>Revisão:</strong> De decisões automatizadas (quando aplicável)</li>
      </ul>
      <p><strong>Como exercer seus direitos:</strong> Entre em contato através do e-mail vigia.app.br@gmail.com ou durante consulta médica presencial.</p>

      <h3>8. Tratamento Automatizado e Inteligência Artificial:</h3>
      <p>A plataforma VigIA utiliza Inteligência Artificial para:</p>
      <ul>
        <li>Análise automatizada de respostas aos questionários pós-operatórios</li>
        <li>Detecção de sinais de alerta e complicações (red flags)</li>
        <li>Geração de relatórios e insights para o médico</li>
      </ul>
      <p>Importante: As decisões clínicas finais são sempre tomadas pelo médico responsável. A IA é uma ferramenta de apoio, não substituindo o julgamento profissional.</p>

      <h3>9. Transferência Internacional de Dados:</h3>
      <p>Alguns dados podem ser armazenados em servidores localizados fora do Brasil (ex: AWS, Google Cloud) que atendem aos padrões internacionais de segurança e privacidade. Essa transferência ocorre com garantias adequadas previstas na LGPD.</p>

      <h3>10. Uso em Pesquisa Científica:</h3>
      <p>Para fins de pesquisa científica:</p>
      <ul>
        <li>Os dados serão sempre anonimizados antes de uso em publicações</li>
        <li>Não será possível identificar pacientes individualmente</li>
        <li>Os resultados contribuirão para o avanço da medicina</li>
        <li>A pesquisa seguirá as normas éticas do Conselho Nacional de Saúde (Resolução CNS 466/2012)</li>
      </ul>

      <h3>11. Voluntariedade e Consequências:</h3>
      <p>Declaro que:</p>
      <ul>
        <li>Este consentimento é dado de forma livre, informada e inequívoca</li>
        <li>A recusa em fornecer dados necessários ao tratamento médico pode impossibilitar a prestação adequada dos serviços</li>
        <li>A recusa em autorizar o uso para pesquisa científica NÃO prejudicará meu atendimento médico</li>
        <li>Posso revogar este consentimento a qualquer momento, ressalvadas as hipóteses de guarda obrigatória</li>
      </ul>

      <h3>12. Autoridade Nacional de Proteção de Dados (ANPD):</h3>
      <p>Em caso de tratamento inadequado dos meus dados, posso apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD) através do site: www.gov.br/anpd</p>

      <h3>13. Vigência:</h3>
      <p>Este termo entra em vigor na data de sua aceitação e permanece válido durante todo o período de tratamento, podendo ser revogado conforme previsto na LGPD.</p>

      <h3>14. Consentimento Expresso:</h3>
      <p>Declaro que:</p>
      <ul>
        <li>Li e compreendi integralmente todas as informações acima</li>
        <li>Tive oportunidade de esclarecer todas as minhas dúvidas</li>
        <li>Autorizo expressamente o tratamento dos meus dados pessoais e de saúde para as finalidades descritas</li>
        <li>Autorizo o uso de dados anonimizados para pesquisa científica</li>
        <li>Estou ciente dos meus direitos e de como exercê-los</li>
        <li>Recebi uma cópia deste termo para meus registros</li>
      </ul>

      <p style="margin-top: 30px;"><em>Data do consentimento: ${data.data}${data.cidade ? ` - ${data.cidade}` : ''}</em></p>
    `
  },

  whatsapp: {
    titulo: "TERMO DE CONSENTIMENTO E ADESÃO",
    subtitulo: "Acompanhamento Pós-Operatório via WhatsApp e Plataforma VigIA",
    conteudo: (data: TermoData) => `
      <p>Eu, <strong>${data.pacienteNome}</strong>${data.pacienteCPF ? `, CPF ${data.pacienteCPF}` : ''}, autorizo expressamente o acompanhamento do meu pós-operatório através do aplicativo WhatsApp integrado à plataforma VigIA.</p>

      <h3>1. Identificação do Serviço:</h3>
      <p><strong>Responsável Técnico:</strong> Dr. João Vitor Viana - CRM-PB 12831<br/>
      <strong>Plataforma:</strong> VigIA - Sistema de Acompanhamento Pós-Operatório com Inteligência Artificial<br/>
      <strong>Endereço:</strong> João Pessoa, Paraíba<br/>
      <strong>E-mail de contato:</strong> vigia.app.br@gmail.com</p>

      <h3>2. Descrição do Serviço de Acompanhamento:</h3>
      <p>Fui informado(a) que o Dr. João Vitor Viana oferece um serviço inovador de acompanhamento pós-operatório que combina o WhatsApp com tecnologia de Inteligência Artificial, proporcionando:</p>
      <ul>
        <li><strong>Questionários automatizados:</strong> Envio de perguntas sobre minha evolução clínica nos dias D+1, D+2, D+3, D+5, D+7, D+10 e D+14 após a cirurgia</li>
        <li><strong>Análise por Inteligência Artificial:</strong> As respostas são analisadas automaticamente para detectar sinais de alerta (red flags) e complicações</li>
        <li><strong>Alertas ao médico:</strong> O sistema notifica o Dr. João Vitor imediatamente em caso de detecção de riscos</li>
        <li><strong>Lembretes personalizados:</strong> Sobre medicações, cuidados e horários de retorno</li>
        <li><strong>Orientações pós-operatórias:</strong> Informações sobre recuperação e cuidados gerais</li>
        <li><strong>Canal de comunicação direta:</strong> Para esclarecimento de dúvidas pontuais (horário comercial)</li>
        <li><strong>Notificações:</strong> Sobre consultas de retorno e acompanhamento</li>
        <li><strong>Contato em urgências:</strong> Possibilidade de contato rápido para dúvidas urgentes relacionadas à recuperação</li>
      </ul>

      <h3>3. Funcionamento da Plataforma VigIA:</h3>
      <p>A plataforma funciona da seguinte forma:</p>
      <ul>
        <li>Envio automatizado de mensagens pelo sistema nos horários programados</li>
        <li>As respostas são processadas por Inteligência Artificial que identifica padrões de risco</li>
        <li>Alertas importantes são encaminhados imediatamente ao médico responsável</li>
        <li>O médico revisa todas as respostas e toma as decisões clínicas finais</li>
        <li>A IA é uma ferramenta de apoio, não substituindo o julgamento médico profissional</li>
      </ul>

      <h3>4. Limites e Escopo do Atendimento via WhatsApp:</h3>
      <p>Compreendo claramente que:</p>
      <ul>
        <li><strong>Ferramenta complementar:</strong> O WhatsApp é um recurso adicional que NÃO substitui consultas presenciais</li>
        <li><strong>Emergências médicas:</strong> Em casos de sangramento intenso, dor muito forte, febre alta, ou qualquer situação grave, devo procurar imediatamente atendimento médico presencial (pronto-socorro) e NÃO depender apenas do WhatsApp</li>
        <li><strong>Horário de atendimento:</strong> O acompanhamento por mensagens ocorre prioritariamente em horário comercial (segunda a sexta, 8h às 18h), exceto situações de urgência</li>
        <li><strong>Tempo de resposta:</strong> Não há garantia de resposta imediata, especialmente fora do horário comercial</li>
        <li><strong>Limitações técnicas:</strong> Problemas de conectividade, falhas no WhatsApp ou indisponibilidade temporária podem ocorrer</li>
        <li><strong>Consultas presenciais obrigatórias:</strong> Avaliações complexas, exames físicos, procedimentos e reavaliações detalhadas requerem consulta presencial</li>
        <li><strong>Confidencialidade:</strong> Não devo compartilhar o número de contato do médico com terceiros sem autorização</li>
        <li><strong>Uso adequado:</strong> O canal deve ser usado exclusivamente para questões relacionadas ao meu tratamento pós-operatório</li>
      </ul>

      <h3>5. Tratamento de Dados e LGPD:</h3>
      <p>Fui informado(a) sobre como meus dados serão tratados:</p>
      <ul>
        <li><strong>Dados coletados:</strong> Mensagens de texto, fotos clínicas (quando enviadas), respostas aos questionários, horários de interação</li>
        <li><strong>Base legal LGPD:</strong> Consentimento expresso (Art. 7º, I) e tutela da saúde (Art. 11, II, f)</li>
        <li><strong>Finalidade:</strong> Acompanhamento pós-operatório, monitoramento de recuperação, detecção precoce de complicações, pesquisa científica (dados anonimizados)</li>
        <li><strong>Armazenamento:</strong> As conversas são armazenadas de forma segura na plataforma VigIA e podem fazer parte do prontuário médico</li>
        <li><strong>Período de retenção:</strong> Mínimo de 20 anos conforme Resolução CFM nº 1.821/2007</li>
        <li><strong>Compartilhamento:</strong> Dados anonimizados podem ser usados para pesquisa científica e melhoria da plataforma</li>
        <li><strong>Segurança:</strong> Criptografia de ponta a ponta do WhatsApp + segurança adicional da plataforma VigIA</li>
        <li><strong>Direitos:</strong> Acesso, correção, eliminação (ressalvadas hipóteses de guarda obrigatória), portabilidade e revogação do consentimento</li>
      </ul>

      <h3>6. Privacidade, Segurança e Boas Práticas:</h3>
      <p>Comprometo-me a:</p>
      <ul>
        <li>Manter meu número de WhatsApp atualizado e informar mudanças</li>
        <li>Não compartilhar o número de contato do médico com terceiros</li>
        <li>Enviar fotos apenas quando solicitado ou quando clinicamente relevante</li>
        <li>Evitar enviar fotos com informações pessoais desnecessárias (documentos, rostos de terceiros, etc.)</li>
        <li>Não utilizar o canal para assuntos não relacionados ao meu tratamento</li>
        <li>Compreender que o WhatsApp utiliza criptografia de ponta a ponta, mas nenhum sistema é 100% imune a falhas</li>
        <li>Não enviar informações financeiras ou senhas por mensagem</li>
        <li>Manter meu aparelho celular seguro com senha/biometria</li>
      </ul>

      <h3>7. Responsabilidades do Paciente:</h3>
      <p>Declaro que sou responsável por:</p>
      <ul>
        <li>Responder aos questionários automáticos de forma honesta e completa</li>
        <li>Reportar prontamente qualquer sintoma preocupante</li>
        <li>Seguir as orientações médicas fornecidas</li>
        <li>Comparecer às consultas presenciais agendadas</li>
        <li>Procurar atendimento presencial imediato em emergências</li>
        <li>Informar se não puder ou não desejar mais receber mensagens</li>
      </ul>

      <h3>8. Responsabilidades do Médico e da Plataforma:</h3>
      <p>O Dr. João Vitor Viana e a plataforma VigIA comprometem-se a:</p>
      <ul>
        <li>Utilizar o sistema exclusivamente para fins de acompanhamento clínico</li>
        <li>Manter sigilo médico sobre todas as informações compartilhadas</li>
        <li>Responder mensagens em tempo adequado durante horário comercial</li>
        <li>Garantir que a IA seja usada apenas como ferramenta de apoio, com decisões finais sempre tomadas pelo médico</li>
        <li>Proteger os dados conforme LGPD e normas do Conselho Federal de Medicina</li>
        <li>Informar sobre atualizações no sistema que possam afetar o serviço</li>
      </ul>

      <h3>9. Isenção de Responsabilidade - WhatsApp:</h3>
      <p>Compreendo que:</p>
      <ul>
        <li>O WhatsApp é um aplicativo de terceiros (Meta/Facebook) não controlado pelo médico ou pela VigIA</li>
        <li>Problemas técnicos do WhatsApp (instabilidade, bloqueios, alterações de política) estão fora do controle do serviço</li>
        <li>Em caso de indisponibilidade do WhatsApp, outros meios de contato devem ser utilizados</li>
        <li>A plataforma VigIA fará o melhor esforço para garantir disponibilidade, mas não pode garantir 100% de uptime</li>
      </ul>

      <h3>10. Situações de Emergência - IMPORTANTE:</h3>
      <p><strong style="color: red;">ATENÇÃO:</strong> As seguintes situações constituem EMERGÊNCIA MÉDICA e exigem atendimento presencial IMEDIATO no pronto-socorro, NÃO devendo aguardar resposta pelo WhatsApp:</p>
      <ul style="font-weight: bold;">
        <li>Sangramento intenso ou persistente pelo ânus</li>
        <li>Dor abdominal muito forte que não melhora com analgésicos</li>
        <li>Febre alta (acima de 38,5°C) persistente</li>
        <li>Retenção urinária (incapacidade de urinar)</li>
        <li>Sinais de infecção grave (vermelhidão intensa, secreção purulenta, febre)</li>
        <li>Mal-estar geral intenso, confusão mental, desmaios</li>
        <li>Dificuldade respiratória</li>
        <li>Qualquer sintoma que considere grave ou ameaçador</li>
      </ul>
      <p><strong>Em emergências: procurar imediatamente pronto-socorro ou ligar 192 (SAMU)</strong></p>

      <h3>11. Custos e Faturamento:</h3>
      <p>Fui informado(a) que:</p>
      <ul>
        <li>O acompanhamento via WhatsApp/VigIA está incluso no valor da consulta pós-operatória</li>
        <li>Não há custos adicionais para utilizar este serviço</li>
        <li>Custos de dados móveis ou internet são de responsabilidade do paciente</li>
        <li>Consultas presenciais adicionais podem ser cobradas conforme tabela do médico</li>
      </ul>

      <h3>12. Voluntariedade e Revogação:</h3>
      <p>Declaro que:</p>
      <ul>
        <li>Esta autorização é totalmente <strong>voluntária</strong></li>
        <li>A recusa em participar NÃO prejudicará meu atendimento médico de forma alguma</li>
        <li>Posso solicitar a <strong>exclusão</strong> do acompanhamento via WhatsApp a qualquer momento</li>
        <li>A revogação pode ser feita por mensagem ou durante consulta presencial</li>
        <li>Após a revogação, as mensagens automáticas serão interrompidas, mas os dados já coletados serão mantidos no prontuário médico conforme exigido por lei</li>
        <li>Mesmo após revogação, posso solicitar reativação do serviço</li>
      </ul>

      <h3>13. Dados Para Contato:</h3>
      <p><strong>Número de WhatsApp cadastrado para acompanhamento:</strong> ________________</p>
      <p><em>(Por favor, informar imediatamente caso este número seja alterado)</em></p>

      <h3>14. Pesquisa Científica:</h3>
      <p>Autorizo que dados anonimizados das minhas respostas e evolução clínica sejam utilizados para:</p>
      <ul>
        <li>Estudos sobre eficácia do acompanhamento pós-operatório remoto</li>
        <li>Pesquisas sobre Inteligência Artificial aplicada à medicina</li>
        <li>Melhoria contínua da plataforma VigIA</li>
        <li>Publicações científicas (sempre de forma anonimizada)</li>
      </ul>
      <p>Compreendo que em nenhuma hipótese minha identidade será revelada.</p>

      <h3>15. Vigência e Alterações:</h3>
      <p>Este termo:</p>
      <ul>
        <li>Entra em vigor na data de aceitação</li>
        <li>Permanece válido durante todo o período de acompanhamento pós-operatório</li>
        <li>Pode ser revogado a qualquer momento pelo paciente</li>
        <li>Pode ser alterado mediante comunicação prévia e novo consentimento</li>
        <li>Alterações significativas na plataforma serão comunicadas com antecedência</li>
      </ul>

      <h3>16. Foro e Legislação Aplicável:</h3>
      <p>Este termo é regido pelas leis brasileiras, especialmente:</p>
      <ul>
        <li>Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)</li>
        <li>Código de Defesa do Consumidor (Lei 8.078/1990)</li>
        <li>Código de Ética Médica do CFM</li>
        <li>Marco Civil da Internet (Lei 12.965/2014)</li>
        <li>Resoluções do Conselho Federal de Medicina sobre prontuário e telemedicina</li>
      </ul>

      <h3>17. Declaração de Ciência e Consentimento Expresso:</h3>
      <p>Declaro expressamente que:</p>
      <ul>
        <li>Li e compreendi integralmente todas as cláusulas deste termo</li>
        <li>Tive oportunidade de esclarecer todas as minhas dúvidas</li>
        <li>Compreendo os limites e alcance do acompanhamento via WhatsApp</li>
        <li>Estou ciente de que devo procurar atendimento presencial em emergências</li>
        <li>Autorizo expressamente o acompanhamento pós-operatório via WhatsApp integrado à plataforma VigIA</li>
        <li>Autorizo o tratamento dos meus dados conforme descrito neste termo</li>
        <li>Autorizo o uso de dados anonimizados para pesquisa científica</li>
        <li>Recebi uma cópia deste termo para meus registros</li>
        <li>Concordo em seguir as orientações e boas práticas descritas</li>
        <li>Aceito todos os termos e condições estabelecidos</li>
      </ul>

      <p style="margin-top: 30px;"><em>Data do consentimento: ${data.data}${data.cidade ? ` - ${data.cidade}` : ''}</em></p>

      <p style="margin-top: 20px; padding: 15px; background-color: #f0f0f0; border-left: 4px solid #0A2647;">
        <strong>Importante:</strong> Este é um documento legal que estabelece os termos do serviço de acompanhamento pós-operatório. Guarde uma cópia para referência futura. Em caso de dúvidas, entre em contato através do e-mail vigia.app.br@gmail.com
      </p>
    `
  }
};

export const getTiposList = () => [
  {
    id: 'hemorroidectomia',
    nome: 'Hemorroidectomia',
    descricao: 'Cirurgia de Hemorroidas',
    categoria: 'Cirúrgico'
  },
  {
    id: 'fistulaAnal',
    nome: 'Fístula Anal',
    descricao: 'Tratamento Cirúrgico de Fístula Anal',
    categoria: 'Cirúrgico'
  },
  {
    id: 'fissuraAnal',
    nome: 'Fissura Anal',
    descricao: 'Tratamento Cirúrgico de Fissura Anal',
    categoria: 'Cirúrgico'
  },
  {
    id: 'doencaPilonidal',
    nome: 'Doença Pilonidal',
    descricao: 'Cirurgia de Cisto Pilonidal',
    categoria: 'Cirúrgico'
  },
  {
    id: 'lgpd',
    nome: 'Uso de Dados (LGPD)',
    descricao: 'Autorização para uso de dados em pesquisa científica',
    categoria: 'Consentimento'
  },
  {
    id: 'whatsapp',
    nome: 'Acompanhamento WhatsApp',
    descricao: 'Autorização para acompanhamento via WhatsApp',
    categoria: 'Consentimento'
  }
];
