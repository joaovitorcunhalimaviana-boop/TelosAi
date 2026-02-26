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
      <p>Eu, <strong>${data.pacienteNome}</strong>${data.pacienteCPF ? `, CPF ${data.pacienteCPF}` : ''}, declaro que fui devidamente informado(a) pelo <strong>Dr. João Vitor Viana, CRM-PB 12831</strong>, sobre o procedimento cirúrgico de <strong>Hemorroidectomia</strong>, e forneço meu consentimento nos termos abaixo descritos.</p>

      <h3>1. Informações sobre o procedimento:</h3>
      <p>A hemorroidectomia consiste na remoção cirúrgica dos coxins hemorroidários (estruturas vasculares localizadas no canal anal) quando estes se encontram doentes, causando sintomas como sangramento, prolapso (exteriorização), dor ou desconforto. O procedimento é indicado quando os tratamentos conservadores (medicações, mudanças alimentares) e procedimentos ambulatoriais (ligadura elástica) não foram suficientes para o controle dos sintomas.</p>
      <p>Existem diferentes técnicas cirúrgicas disponíveis, entre elas: a técnica de Milligan-Morgan (ferida aberta), a técnica de Ferguson (ferida fechada com sutura) e a hemorroidopexia com grampeador (PPH). A escolha da técnica será definida pelo cirurgião com base no grau das hemorroidas, na anatomia do paciente e nas condições encontradas durante o ato operatório. O procedimento é realizado sob anestesia (raquidiana, geral ou combinada), conforme avaliação do anestesiologista.</p>

      <h3>2. Complicações que podem ocorrer:</h3>
      <p>Apesar de todos os cuidados técnicos adotados, complicações podem ocorrer, incluindo:</p>
      <ul>
        <li><strong>Dor pós-operatória:</strong> Pode ocorrer dor na região anal, especialmente durante as evacuações nas primeiras duas semanas. <em>Impacto:</em> Desconforto que pode dificultar atividades cotidianas como sentar e caminhar. <em>Manejo:</em> Controlada com analgésicos, banhos de assento com água morna e uso de laxantes para amolecimento das fezes.</li>
        <li><strong>Sangramento:</strong> Pode ocorrer sangramento durante ou após a cirurgia, no período de cicatrização. <em>Impacto:</em> Perda de sangue que pode causar preocupação e, se significativo, necessitar de intervenção. <em>Manejo:</em> Na maioria das vezes é autolimitado e cessa espontaneamente; em casos mais significativos, pode ser necessária revisão cirúrgica para hemostasia.</li>
        <li><strong>Retenção urinária:</strong> Pode ocorrer dificuldade para urinar após a cirurgia, em decorrência da anestesia e do reflexo local. <em>Impacto:</em> Impossibilidade de esvaziamento vesical, causando desconforto abdominal. <em>Manejo:</em> Pode requerer passagem temporária de sonda vesical até a normalização da função urinária.</li>
        <li><strong>Infecção da ferida operatória:</strong> Pode ocorrer infecção no local cirúrgico. <em>Impacto:</em> Sinais como vermelhidão, inchaço, secreção purulenta e febre podem surgir, retardando a cicatrização. <em>Manejo:</em> Tratada com antibióticos e cuidados locais da ferida.</li>
        <li><strong>Incontinência fecal:</strong> Pode ocorrer dificuldade no controle de gases ou fezes. <em>Impacto:</em> Pode ser temporária ou, em situações excepcionais, permanente, afetando a qualidade de vida e atividades sociais. <em>Manejo:</em> Tratada com reabilitação do assoalho pélvico (biofeedback) e, quando necessário, acompanhamento especializado.</li>
        <li><strong>Estenose anal:</strong> Pode ocorrer estreitamento do canal anal durante o processo de cicatrização. <em>Impacto:</em> Dificuldade para evacuar, fezes afiladas e desconforto. <em>Manejo:</em> Tratada com dilatações anais seriadas ou, em casos persistentes, cirurgia de revisão.</li>
        <li><strong>Recidiva:</strong> Pode ocorrer reaparecimento das hemorroidas ao longo do tempo. <em>Impacto:</em> Retorno dos sintomas originais. <em>Manejo:</em> Pode necessitar de novo tratamento clínico ou cirúrgico.</li>
        <li><strong>Fissura anal pós-operatória:</strong> Pode ocorrer formação de uma ferida na região do canal anal durante a cicatrização. <em>Impacto:</em> Dor ao evacuar. <em>Manejo:</em> Tratada com medicações tópicas e cuidados locais.</li>
        <li><strong>Trombose hemorroidária residual:</strong> Pode ocorrer formação de coágulo em tecido hemorroidário remanescente. <em>Impacto:</em> Dor e inchaço local. <em>Manejo:</em> Tratada com anti-inflamatórios e, se necessário, drenagem.</li>
      </ul>

      <h3>3. Fatores individuais que podem influenciar o resultado:</h3>
      <p>Fui informado(a) de que determinadas condições pessoais podem influenciar o resultado cirúrgico e o processo de cicatrização, entre elas:</p>
      <ul>
        <li><strong>Diabetes mellitus:</strong> Pode retardar a cicatrização e aumentar o risco de infecção.</li>
        <li><strong>Obesidade:</strong> Pode dificultar o acesso cirúrgico e a cicatrização.</li>
        <li><strong>Tabagismo:</strong> Compromete a microcirculação e prejudica a cicatrização tecidual.</li>
        <li><strong>Imunossupressão:</strong> Condições ou medicamentos que reduzem a imunidade podem aumentar o risco de complicações infecciosas.</li>
        <li><strong>Uso crônico de corticosteroides:</strong> Pode enfraquecer os tecidos e dificultar a cicatrização.</li>
        <li><strong>Cirurgias prévias na região anal:</strong> Podem alterar a anatomia e aumentar a complexidade do procedimento.</li>
        <li><strong>Doença inflamatória intestinal:</strong> Pode comprometer a cicatrização e alterar o planejamento cirúrgico.</li>
        <li><strong>Coagulopatias ou uso de anticoagulantes:</strong> Podem aumentar o risco de sangramento no período perioperatório.</li>
      </ul>

      <h3>4. Cuidados pós-operatórios:</h3>
      <p>Fui orientado(a) sobre a importância dos cuidados no pós-operatório, incluindo: higiene adequada da região anal após cada evacuação, banhos de assento com água morna, uso correto das medicações prescritas (analgésicos, anti-inflamatórios, laxantes), alimentação rica em fibras e ingestão abundante de líquidos para manter as fezes macias, e repouso relativo nas primeiras semanas. O retorno às atividades laborais e físicas será gradual, conforme orientação médica individualizada. As consultas de retorno são indispensáveis para acompanhamento da cicatrização.</p>

      <h3>5. Alternativas de tratamento:</h3>
      <p>Fui informado(a) sobre as alternativas ao tratamento cirúrgico, incluindo: tratamento clínico conservador com medicações tópicas e orais, mudanças na dieta e hábitos intestinais, e procedimentos ambulatoriais como a ligadura elástica. Compreendo que a cirurgia foi indicada por ser a melhor opção para o meu caso clínico, considerando o grau das hemorroidas e a resposta insatisfatória aos tratamentos prévios.</p>

      <h3>6. Consentimento:</h3>
      <p>Declaro que:</p>
      <ul>
        <li>Fui informado(a), em linguagem acessível, sobre o procedimento a ser realizado, seus riscos, benefícios e alternativas terapêuticas;</li>
        <li>Tive a oportunidade de fazer perguntas e todas as minhas dúvidas foram esclarecidas de forma satisfatória;</li>
        <li>Compreendo que complicações podem ocorrer mesmo quando a técnica cirúrgica é realizada de forma correta e dentro dos padrões estabelecidos pela boa prática médica;</li>
        <li>Compreendo que o resultado do procedimento não pode ser garantido de forma absoluta;</li>
        <li>Autorizo o Dr. João Vitor Viana, CRM-PB 12831, e sua equipe a realizarem o procedimento cirúrgico de hemorroidectomia, bem como quaisquer procedimentos adicionais que se façam necessários durante o ato operatório;</li>
        <li>Recebi uma cópia deste Termo de Consentimento Livre e Esclarecido.</li>
      </ul>

      <p style="margin-top: 30px;"><em>Data do consentimento: ${data.data}${data.cidade ? ` - ${data.cidade}` : ''}</em></p>
    `
  },

  fistulaAnal: {
    titulo: "TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO",
    subtitulo: "Tratamento Cirúrgico de Fístula Anal",
    conteudo: (data: TermoData) => `
      <p>Eu, <strong>${data.pacienteNome}</strong>${data.pacienteCPF ? `, CPF ${data.pacienteCPF}` : ''}, declaro que fui devidamente informado(a) pelo <strong>Dr. João Vitor Viana, CRM-PB 12831</strong>, sobre o procedimento cirúrgico para tratamento de <strong>Fístula Anal</strong>, e forneço meu consentimento nos termos abaixo descritos.</p>

      <h3>1. Informações sobre o procedimento:</h3>
      <p>A fístula anal é um trajeto anormal (túnel) que se forma entre o interior do canal anal e a pele da região ao redor do ânus, geralmente como consequência de um abscesso (coleção de pus) prévio. Esse trajeto mantém secreção persistente e pode causar dor, desconforto e infecções de repetição, sendo o tratamento cirúrgico necessário para a resolução definitiva.</p>
      <p>Existem diversas técnicas cirúrgicas disponíveis, cuja escolha depende da complexidade do trajeto fistuloso e do grau de envolvimento do músculo esfíncter anal. Entre as opções estão: fistulotomia (abertura do trajeto), colocação de sedenho (fio de drenagem), técnica LIFT (ligadura do trajeto interesfincteriano), retalho de avanço mucoso, VAAFT (tratamento videoassistido) e FiLaC (fechamento a laser). O cirurgião definirá a melhor abordagem com base nos achados clínicos e intraoperatórios.</p>

      <h3>2. Complicações que podem ocorrer:</h3>
      <p>Apesar de todos os cuidados técnicos adotados, complicações podem ocorrer, incluindo:</p>
      <ul>
        <li><strong>Dor e desconforto pós-operatório:</strong> Pode ocorrer dor na região anal e perianal nos dias seguintes à cirurgia. <em>Impacto:</em> Desconforto que pode limitar atividades cotidianas. <em>Manejo:</em> Controlada com analgésicos e banhos de assento com água morna.</li>
        <li><strong>Sangramento:</strong> Pode ocorrer sangramento no local operado. <em>Impacto:</em> Geralmente leve, com manchas em curativos ou papel higiênico. <em>Manejo:</em> Na maioria das vezes é autolimitado; em casos mais significativos, pode ser necessária avaliação médica e hemostasia.</li>
        <li><strong>Infecção da ferida operatória:</strong> Pode ocorrer infecção no local da cirurgia. <em>Impacto:</em> Dor, vermelhidão, inchaço e secreção purulenta, podendo retardar a cicatrização. <em>Manejo:</em> Tratada com antibióticos e cuidados locais intensificados.</li>
        <li><strong>Recidiva da fístula:</strong> Pode ocorrer reaparecimento do trajeto fistuloso após a cirurgia. <em>Impacto:</em> Retorno dos sintomas de secreção e desconforto, necessitando de nova abordagem. <em>Manejo:</em> Pode requerer procedimento cirúrgico adicional com técnica diferente.</li>
        <li><strong>Incontinência fecal:</strong> Pode ocorrer dificuldade no controle de gases ou fezes, dependendo do grau de envolvimento do esfíncter pelo trajeto fistuloso. <em>Impacto:</em> Pode ser temporária ou, em situações excepcionais, permanente, comprometendo a qualidade de vida. <em>Manejo:</em> Tratada com reabilitação do assoalho pélvico (biofeedback) e acompanhamento especializado.</li>
        <li><strong>Estenose anal:</strong> Pode ocorrer estreitamento do canal anal durante a cicatrização. <em>Impacto:</em> Dificuldade para evacuar e desconforto. <em>Manejo:</em> Tratada com dilatações anais ou, se necessário, cirurgia de revisão.</li>
        <li><strong>Formação de abscesso:</strong> Pode ocorrer nova coleção de pus na região perianal. <em>Impacto:</em> Dor intensa, inchaço e febre. <em>Manejo:</em> Requer drenagem cirúrgica e antibioticoterapia.</li>
        <li><strong>Cicatrização prolongada:</strong> Pode ocorrer demora na cicatrização da ferida operatória, levando semanas a meses para fechamento completo. <em>Impacto:</em> Necessidade de curativos prolongados e acompanhamento frequente. <em>Manejo:</em> Cuidados locais da ferida, curativos regulares e acompanhamento ambulatorial.</li>
        <li><strong>Necessidade de múltiplos procedimentos:</strong> Pode ocorrer a necessidade de cirurgias em etapas, especialmente em fístulas complexas. <em>Impacto:</em> Prolonga o tempo total de tratamento. <em>Manejo:</em> Planejamento cirúrgico sequencial visando a cura com preservação da função esfincteriana.</li>
      </ul>

      <h3>3. Fatores individuais que podem influenciar o resultado:</h3>
      <p>Fui informado(a) de que determinadas condições pessoais podem influenciar o resultado cirúrgico e o processo de cicatrização, entre elas:</p>
      <ul>
        <li><strong>Diabetes mellitus:</strong> Pode retardar a cicatrização e aumentar o risco de infecção.</li>
        <li><strong>Obesidade:</strong> Pode dificultar o acesso cirúrgico e a cicatrização.</li>
        <li><strong>Tabagismo:</strong> Compromete a microcirculação e prejudica a cicatrização tecidual.</li>
        <li><strong>Imunossupressão:</strong> Condições ou medicamentos que reduzem a imunidade podem aumentar o risco de complicações infecciosas.</li>
        <li><strong>Uso crônico de corticosteroides:</strong> Pode enfraquecer os tecidos e dificultar a cicatrização.</li>
        <li><strong>Cirurgias prévias na região anal:</strong> Podem alterar a anatomia, aumentar a complexidade do procedimento e afetar a continência.</li>
        <li><strong>Doença inflamatória intestinal (Doença de Crohn):</strong> Pode comprometer significativamente a cicatrização e está associada a fístulas de maior complexidade.</li>
        <li><strong>Coagulopatias ou uso de anticoagulantes:</strong> Podem aumentar o risco de sangramento no período perioperatório.</li>
      </ul>

      <h3>4. Cuidados pós-operatórios:</h3>
      <p>Fui orientado(a) sobre a importância dos cuidados pós-operatórios, incluindo: higiene meticulosa da região perianal, banhos de assento com água morna após evacuações, uso correto das medicações prescritas, alimentação equilibrada rica em fibras e boa hidratação para manter fezes macias. O processo de cicatrização pode levar semanas a meses, dependendo da complexidade da fístula e da técnica empregada. O acompanhamento regular em consultas de retorno é fundamental para avaliação da cicatrização e detecção precoce de recidiva.</p>

      <h3>5. Expectativas de tratamento:</h3>
      <p>Compreendo que o tratamento de fístulas anais pode ser desafiador e que, em alguns casos, pode haver necessidade de mais de um procedimento cirúrgico para alcançar a cura definitiva. A escolha da técnica cirúrgica leva em consideração o equilíbrio entre a melhor chance de cura e a preservação da função esfincteriana (continência). Compreendo que não é possível garantir a cura em um único procedimento e que o planejamento terapêutico pode ser ajustado conforme a evolução clínica.</p>

      <h3>6. Consentimento:</h3>
      <p>Declaro que:</p>
      <ul>
        <li>Fui informado(a), em linguagem acessível, sobre o procedimento a ser realizado, seus riscos, benefícios e alternativas terapêuticas;</li>
        <li>Tive a oportunidade de fazer perguntas e todas as minhas dúvidas foram esclarecidas de forma satisfatória;</li>
        <li>Compreendo que complicações podem ocorrer mesmo quando a técnica cirúrgica é realizada de forma correta e dentro dos padrões estabelecidos pela boa prática médica;</li>
        <li>Compreendo que o resultado do procedimento não pode ser garantido de forma absoluta;</li>
        <li>Autorizo o Dr. João Vitor Viana, CRM-PB 12831, e sua equipe a realizarem o procedimento cirúrgico para tratamento da fístula anal, bem como quaisquer procedimentos adicionais que se façam necessários durante o ato operatório;</li>
        <li>Recebi uma cópia deste Termo de Consentimento Livre e Esclarecido.</li>
      </ul>

      <p style="margin-top: 30px;"><em>Data do consentimento: ${data.data}${data.cidade ? ` - ${data.cidade}` : ''}</em></p>
    `
  },

  fissuraAnal: {
    titulo: "TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO",
    subtitulo: "Tratamento Cirúrgico de Fissura Anal",
    conteudo: (data: TermoData) => `
      <p>Eu, <strong>${data.pacienteNome}</strong>${data.pacienteCPF ? `, CPF ${data.pacienteCPF}` : ''}, declaro que fui devidamente informado(a) pelo <strong>Dr. João Vitor Viana, CRM-PB 12831</strong>, sobre o procedimento cirúrgico para tratamento de <strong>Fissura Anal</strong>, e forneço meu consentimento nos termos abaixo descritos.</p>

      <h3>1. Informações sobre o procedimento:</h3>
      <p>A fissura anal é uma ferida (úlcera) localizada na mucosa do canal anal, que provoca dor intensa durante e após as evacuações, frequentemente acompanhada de sangramento. Quando a fissura se torna crônica (persistente apesar do tratamento clínico), o tratamento cirúrgico é indicado para promover a cicatrização definitiva.</p>
      <p>A técnica mais utilizada é a esfincterotomia lateral interna, que consiste na secção parcial e controlada do músculo esfíncter interno do ânus, com o objetivo de reduzir a pressão excessiva no canal anal e permitir que a fissura cicatrize. Outras opções cirúrgicas incluem a injeção de toxina botulínica (Botox) no esfíncter e o retalho de avanço mucoso. A escolha da técnica será feita pelo cirurgião de acordo com as características clínicas de cada paciente. O procedimento é realizado sob anestesia (raquidiana, geral ou combinada), conforme avaliação do anestesiologista.</p>

      <h3>2. Complicações que podem ocorrer:</h3>
      <p>Apesar de todos os cuidados técnicos adotados, complicações podem ocorrer, incluindo:</p>
      <ul>
        <li><strong>Dor pós-operatória:</strong> Pode ocorrer dor na região anal nos primeiros dias, geralmente de intensidade inferior à dor causada pela fissura antes da cirurgia. <em>Impacto:</em> Desconforto que pode limitar temporariamente as atividades. <em>Manejo:</em> Controlada com analgésicos, banhos de assento e manutenção de fezes macias.</li>
        <li><strong>Sangramento:</strong> Pode ocorrer sangramento leve no local da cirurgia. <em>Impacto:</em> Manchas em curativos ou papel higiênico. <em>Manejo:</em> Na maioria das vezes é autolimitado e cessa espontaneamente.</li>
        <li><strong>Infecção local:</strong> Pode ocorrer infecção na região operada. <em>Impacto:</em> Dor, vermelhidão e secreção, podendo retardar a cicatrização. <em>Manejo:</em> Tratada com antibióticos e cuidados locais da ferida.</li>
        <li><strong>Incontinência fecal:</strong> Pode ocorrer dificuldade no controle de gases ou, menos comumente, de fezes, em decorrência da secção parcial do esfíncter. <em>Impacto:</em> Pode ser temporária ou, em situações excepcionais, permanente, afetando as atividades sociais e a qualidade de vida. <em>Manejo:</em> Tratada com reabilitação do assoalho pélvico (biofeedback) e acompanhamento especializado.</li>
        <li><strong>Hematoma perianal:</strong> Pode ocorrer acúmulo de sangue nos tecidos ao redor do ânus. <em>Impacto:</em> Inchaço e dor local. <em>Manejo:</em> Na maioria das vezes resolve espontaneamente; se volumoso, pode necessitar de drenagem.</li>
        <li><strong>Persistência ou recidiva da fissura:</strong> Pode ocorrer que a fissura não cicatrize completamente ou que retorne. <em>Impacto:</em> Manutenção ou retorno dos sintomas de dor e sangramento. <em>Manejo:</em> Pode necessitar de tratamento clínico adicional ou nova intervenção cirúrgica.</li>
        <li><strong>Formação de abscesso:</strong> Pode ocorrer coleção de pus na região perianal. <em>Impacto:</em> Dor, inchaço e febre. <em>Manejo:</em> Requer drenagem e antibioticoterapia.</li>
        <li><strong>Fístula anal:</strong> Pode ocorrer formação de um trajeto anormal entre o canal anal e a pele perianal. <em>Impacto:</em> Secreção persistente pela pele perianal. <em>Manejo:</em> Pode necessitar de tratamento cirúrgico específico.</li>
      </ul>

      <h3>3. Fatores individuais que podem influenciar o resultado:</h3>
      <p>Fui informado(a) de que determinadas condições pessoais podem influenciar o resultado cirúrgico e o processo de cicatrização, entre elas:</p>
      <ul>
        <li><strong>Diabetes mellitus:</strong> Pode retardar a cicatrização e aumentar o risco de infecção.</li>
        <li><strong>Obesidade:</strong> Pode dificultar o acesso cirúrgico e a cicatrização.</li>
        <li><strong>Tabagismo:</strong> Compromete a microcirculação e prejudica a cicatrização tecidual.</li>
        <li><strong>Imunossupressão:</strong> Condições ou medicamentos que reduzem a imunidade podem aumentar o risco de complicações infecciosas.</li>
        <li><strong>Uso crônico de corticosteroides:</strong> Pode enfraquecer os tecidos e dificultar a cicatrização.</li>
        <li><strong>Cirurgias prévias na região anal:</strong> Podem alterar a anatomia esfincteriana e aumentar o risco de incontinência.</li>
        <li><strong>Doença inflamatória intestinal:</strong> Pode comprometer a cicatrização e alterar o planejamento cirúrgico.</li>
        <li><strong>Coagulopatias ou uso de anticoagulantes:</strong> Podem aumentar o risco de sangramento no período perioperatório.</li>
      </ul>

      <h3>4. Cuidados pós-operatórios:</h3>
      <p>Fui orientado(a) sobre os cuidados necessários no pós-operatório, incluindo: higiene adequada da região anal, banhos de assento com água morna, uso correto das medicações prescritas (analgésicos, pomadas tópicas), manutenção de fezes macias através de dieta rica em fibras e ingestão abundante de líquidos, evitando esforço evacuatório. A cicatrização completa geralmente ocorre em quatro a seis semanas. As consultas de retorno são indispensáveis para acompanhamento da evolução.</p>

      <h3>5. Alternativas de tratamento:</h3>
      <p>Compreendo que a cirurgia foi indicada após tentativa de tratamento clínico conservador (pomadas cicatrizantes, vasodilatadores tópicos, laxantes, mudanças alimentares) sem resposta satisfatória. A fissura anal crônica apresenta menor chance de cicatrização espontânea, sendo a abordagem cirúrgica considerada a melhor opção para resolução definitiva do quadro. Fui informado(a) sobre a possibilidade de tratamento com toxina botulínica como alternativa menos invasiva, com suas respectivas taxas de sucesso e limitações.</p>

      <h3>6. Consentimento:</h3>
      <p>Declaro que:</p>
      <ul>
        <li>Fui informado(a), em linguagem acessível, sobre o procedimento a ser realizado, seus riscos, benefícios e alternativas terapêuticas;</li>
        <li>Tive a oportunidade de fazer perguntas e todas as minhas dúvidas foram esclarecidas de forma satisfatória;</li>
        <li>Compreendo que complicações podem ocorrer mesmo quando a técnica cirúrgica é realizada de forma correta e dentro dos padrões estabelecidos pela boa prática médica;</li>
        <li>Compreendo que o resultado do procedimento não pode ser garantido de forma absoluta;</li>
        <li>Autorizo o Dr. João Vitor Viana, CRM-PB 12831, e sua equipe a realizarem o procedimento cirúrgico para tratamento da fissura anal, bem como quaisquer procedimentos adicionais que se façam necessários durante o ato operatório;</li>
        <li>Recebi uma cópia deste Termo de Consentimento Livre e Esclarecido.</li>
      </ul>

      <p style="margin-top: 30px;"><em>Data do consentimento: ${data.data}${data.cidade ? ` - ${data.cidade}` : ''}</em></p>
    `
  },

  doencaPilonidal: {
    titulo: "TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO",
    subtitulo: "Tratamento Cirúrgico de Doença Pilonidal (Cisto Pilonidal)",
    conteudo: (data: TermoData) => `
      <p>Eu, <strong>${data.pacienteNome}</strong>${data.pacienteCPF ? `, CPF ${data.pacienteCPF}` : ''}, declaro que fui devidamente informado(a) pelo <strong>Dr. João Vitor Viana, CRM-PB 12831</strong>, sobre o procedimento cirúrgico para tratamento de <strong>Doença Pilonidal (Cisto Pilonidal)</strong>, e forneço meu consentimento nos termos abaixo descritos.</p>

      <h3>1. Informações sobre o procedimento:</h3>
      <p>A doença pilonidal é uma condição que acomete a região sacrococcígea (entre as nádegas, próximo ao cóccix), caracterizada pela formação de cistos, abscessos e trajetos (seios) contendo pelos e debris, causando dor, secreção e infecções de repetição. O tratamento cirúrgico visa a remoção completa do cisto e de todos os trajetos associados, promovendo a cura definitiva.</p>
      <p>Existem diversas técnicas cirúrgicas disponíveis, entre elas: excisão com cicatrização por segunda intenção (ferida aberta), excisão com fechamento primário (sutura direta), retalhos cutâneos (Limberg, Karydakis) e técnicas minimamente invasivas (pit picking, tratamento endoscópico). A escolha da técnica será definida pelo cirurgião com base na extensão da doença, nas condições locais e nas características individuais do paciente. O procedimento é realizado sob anestesia (raquidiana, geral ou combinada), conforme avaliação do anestesiologista.</p>

      <h3>2. Complicações que podem ocorrer:</h3>
      <p>Apesar de todos os cuidados técnicos adotados, complicações podem ocorrer, incluindo:</p>
      <ul>
        <li><strong>Dor pós-operatória:</strong> Pode ocorrer dor na região operada, especialmente ao sentar. <em>Impacto:</em> Desconforto que pode limitar a posição sentada e atividades cotidianas nas primeiras semanas. <em>Manejo:</em> Controlada com analgésicos e uso de almofada ou coxim ao sentar.</li>
        <li><strong>Sangramento e hematoma:</strong> Pode ocorrer sangramento no local cirúrgico e acúmulo de sangue nos tecidos. <em>Impacto:</em> Inchaço, dor local e manchas no curativo. <em>Manejo:</em> Na maioria das vezes é autolimitado; hematomas volumosos podem necessitar de drenagem.</li>
        <li><strong>Infecção da ferida operatória:</strong> Pode ocorrer infecção no local da cirurgia. <em>Impacto:</em> Dor, vermelhidão, secreção purulenta e febre, podendo retardar significativamente a cicatrização. <em>Manejo:</em> Tratada com antibióticos e cuidados locais da ferida.</li>
        <li><strong>Deiscência da ferida:</strong> Pode ocorrer abertura dos pontos e separação das bordas da ferida cirúrgica. <em>Impacto:</em> Necessidade de cicatrização por segunda intenção com curativos prolongados. <em>Manejo:</em> Cuidados locais intensificados com curativos regulares até cicatrização completa; em casos selecionados, pode ser indicada nova sutura.</li>
        <li><strong>Cicatrização prolongada:</strong> Pode ocorrer demora na cicatrização, especialmente quando a ferida é deixada aberta (técnica de segunda intenção). <em>Impacto:</em> O processo pode levar semanas a meses, requerendo curativos frequentes e acompanhamento ambulatorial. <em>Manejo:</em> Curativos regulares, acompanhamento médico e, em casos selecionados, terapias auxiliares de cicatrização.</li>
        <li><strong>Recidiva da doença:</strong> Pode ocorrer reaparecimento da doença pilonidal, mesmo após cirurgia bem-sucedida. <em>Impacto:</em> Retorno dos sintomas de dor, secreção e infecção. <em>Manejo:</em> Medidas preventivas como depilação regular da região são fundamentais; se houver recidiva, pode ser necessário novo procedimento cirúrgico.</li>
        <li><strong>Seroma:</strong> Pode ocorrer acúmulo de líquido seroso (claro) no local da cirurgia. <em>Impacto:</em> Inchaço e sensação de flutuação local. <em>Manejo:</em> Pode necessitar de aspiração com seringa e curativo compressivo.</li>
        <li><strong>Necrose de retalho:</strong> Pode ocorrer sofrimento ou morte parcial do retalho cutâneo, nas técnicas que utilizam retalhos. <em>Impacto:</em> Atraso na cicatrização e possível necessidade de nova intervenção. <em>Manejo:</em> Cuidados locais e, se necessário, desbridamento ou cirurgia de revisão.</li>
        <li><strong>Alteração estética da região:</strong> Pode ocorrer formação de cicatriz visível na região interglútea. <em>Impacto:</em> Alteração cosmética no local operado. <em>Manejo:</em> A cicatriz tende a melhorar com o tempo; em casos selecionados, podem ser adotadas medidas para otimização estética.</li>
      </ul>

      <h3>3. Fatores individuais que podem influenciar o resultado:</h3>
      <p>Fui informado(a) de que determinadas condições pessoais podem influenciar o resultado cirúrgico e o processo de cicatrização, entre elas:</p>
      <ul>
        <li><strong>Diabetes mellitus:</strong> Pode retardar a cicatrização e aumentar o risco de infecção.</li>
        <li><strong>Obesidade:</strong> Pode dificultar o acesso cirúrgico, aumentar a tensão na ferida e prejudicar a cicatrização.</li>
        <li><strong>Tabagismo:</strong> Compromete a microcirculação e prejudica significativamente a cicatrização tecidual.</li>
        <li><strong>Imunossupressão:</strong> Condições ou medicamentos que reduzem a imunidade podem aumentar o risco de complicações infecciosas.</li>
        <li><strong>Uso crônico de corticosteroides:</strong> Pode enfraquecer os tecidos e dificultar a cicatrização.</li>
        <li><strong>Cirurgias prévias na região sacrococcígea:</strong> Podem alterar a anatomia local e aumentar a complexidade do procedimento.</li>
        <li><strong>Pilosidade excessiva:</strong> Pode aumentar o risco de recidiva da doença.</li>
        <li><strong>Coagulopatias ou uso de anticoagulantes:</strong> Podem aumentar o risco de sangramento e formação de hematoma no período perioperatório.</li>
      </ul>

      <h3>4. Cuidados pós-operatórios:</h3>
      <p>Fui orientado(a) sobre a importância dos cuidados no pós-operatório, incluindo: manutenção da ferida limpa e seca, realização de curativos conforme orientação médica, depilação regular da região para prevenção de recidiva (após cicatrização completa), evitar permanecer sentado por períodos prolongados nas primeiras semanas, uso adequado das medicações prescritas e higiene cuidadosa da região. O tempo de cicatrização varia conforme a técnica utilizada e pode ser prolongado, especialmente em feridas abertas. As consultas de retorno são indispensáveis para acompanhamento da cicatrização e orientação sobre medidas preventivas.</p>

      <h3>5. Expectativas de tratamento:</h3>
      <p>Compreendo que o tratamento da doença pilonidal pode requerer um período de recuperação relativamente longo, que varia conforme a técnica cirúrgica empregada e as características individuais de cicatrização. Compreendo que medidas preventivas, como a depilação regular da região interglútea e a manutenção de boa higiene local, são fundamentais para reduzir o risco de recidiva após a cicatrização completa. Compreendo que, apesar de todas as medidas adotadas, a doença pode recorrer e eventualmente necessitar de novo tratamento.</p>

      <h3>6. Consentimento:</h3>
      <p>Declaro que:</p>
      <ul>
        <li>Fui informado(a), em linguagem acessível, sobre o procedimento a ser realizado, seus riscos, benefícios e alternativas terapêuticas;</li>
        <li>Tive a oportunidade de fazer perguntas e todas as minhas dúvidas foram esclarecidas de forma satisfatória;</li>
        <li>Compreendo que complicações podem ocorrer mesmo quando a técnica cirúrgica é realizada de forma correta e dentro dos padrões estabelecidos pela boa prática médica;</li>
        <li>Compreendo que o resultado do procedimento não pode ser garantido de forma absoluta;</li>
        <li>Autorizo o Dr. João Vitor Viana, CRM-PB 12831, e sua equipe a realizarem o procedimento cirúrgico para tratamento da doença pilonidal, bem como quaisquer procedimentos adicionais que se façam necessários durante o ato operatório;</li>
        <li>Recebi uma cópia deste Termo de Consentimento Livre e Esclarecido.</li>
      </ul>

      <p style="margin-top: 30px;"><em>Data do consentimento: ${data.data}${data.cidade ? ` - ${data.cidade}` : ''}</em></p>
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
