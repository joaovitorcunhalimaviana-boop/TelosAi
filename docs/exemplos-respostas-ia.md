# Exemplos de Respostas da IA

Este documento contém exemplos de respostas esperadas do Claude AI para diferentes cenários de follow-up pós-operatório.

## Caso 1: Baixo Risco - Recuperação Normal

### Entrada
```json
{
  "surgeryType": "hemorroidectomia",
  "dayNumber": 2,
  "patientData": {
    "name": "João Silva",
    "age": 45,
    "sex": "Masculino",
    "comorbidities": [],
    "medications": []
  },
  "questionnaireData": {
    "painLevel": 4,
    "urinaryRetention": false,
    "bowelMovement": true,
    "bleeding": "light",
    "fever": false
  },
  "detectedRedFlags": []
}
```

### Saída Esperada
```json
{
  "riskLevel": "low",
  "additionalRedFlags": [],
  "empatheticResponse": "Olá João! Que bom receber seu retorno. Sua recuperação está dentro do esperado para o segundo dia após a cirurgia de hemorroidectomia. O nível de dor que você está sentindo (4/10) é normal nesta fase, e é muito positivo que você já tenha conseguido evacuar e urinar normalmente.\n\nO sangramento leve que você mencionou também é esperado nos primeiros dias. Continue seguindo as orientações que conversamos: use as pomadas conforme prescrito, mantenha uma boa hidratação e alimentação rica em fibras, e tome os analgésicos nos horários corretos.\n\nContinue cuidando bem da sua recuperação. Qualquer mudança ou preocupação, não hesite em entrar em contato.",
  "seekCareAdvice": null,
  "reasoning": "Paciente apresenta evolução normal para D+2 pós-hemorroidectomia. Dor moderada (4/10) é esperada, evacuação presente é positivo, sem sinais de alarme."
}
```

---

## Caso 2: Risco Médio - Atenção Necessária

### Entrada
```json
{
  "surgeryType": "hemorroidectomia",
  "dayNumber": 3,
  "patientData": {
    "name": "Maria Santos",
    "age": 58,
    "sex": "Feminino",
    "comorbidities": ["Hipertensão Arterial"],
    "medications": ["Losartana 50mg"]
  },
  "questionnaireData": {
    "painLevel": 7,
    "urinaryRetention": false,
    "bowelMovement": false,
    "bleeding": "light",
    "fever": false,
    "concerns": "Estou preocupada porque ainda não consegui evacuar"
  },
  "detectedRedFlags": ["Ausência de evacuação até D+3"]
}
```

### Saída Esperada
```json
{
  "riskLevel": "medium",
  "additionalRedFlags": [
    "Dor acima da média para D+3",
    "Ansiedade relacionada à primeira evacuação"
  ],
  "empatheticResponse": "Olá Maria, entendo sua preocupação e é importante conversarmos sobre isso. A dor que você está sentindo (7/10) está um pouco acima do ideal para o terceiro dia, e a ausência de evacuação pode estar contribuindo para esse desconforto.\n\nÉ fundamental que você evacue em breve. Algumas orientações importantes: aumente bastante a ingestão de água (pelo menos 2 litros por dia), continue usando o laxante que foi prescrito, e tente relaxar quando sentir vontade - o medo da dor pode piorar a situação. Você pode tomar o analgésico 30 minutos antes de tentar evacuar para diminuir o desconforto.\n\nSe até amanhã pela manhã você não conseguir evacuar, ou se a dor piorar, entre em contato com o consultório para avaliarmos juntos a necessidade de ajustar o tratamento.",
  "seekCareAdvice": "Se não houver evacuação nas próximas 24 horas ou se a dor aumentar, entre em contato com o consultório.",
  "reasoning": "Ausência de evacuação em D+3 é preocupante mas não crítica. Dor de 7/10 está elevada. Paciente demonstra ansiedade. Necessita orientação e acompanhamento próximo."
}
```

---

## Caso 3: Alto Risco - Retenção Urinária

### Entrada
```json
{
  "surgeryType": "hemorroidectomia",
  "dayNumber": 1,
  "patientData": {
    "name": "Carlos Oliveira",
    "age": 52,
    "sex": "Masculino",
    "comorbidities": ["Hiperplasia Prostática Benigna"],
    "medications": ["Tansulosina 0.4mg"]
  },
  "questionnaireData": {
    "painLevel": 8,
    "urinaryRetention": true,
    "urinaryRetentionHours": 10,
    "bowelMovement": false,
    "bleeding": "light",
    "fever": false,
    "concerns": "Não consigo urinar e a bexiga está muito cheia"
  },
  "detectedRedFlags": ["Retenção urinária há 10h", "Dor muito intensa (8/10)"]
}
```

### Saída Esperada
```json
{
  "riskLevel": "high",
  "additionalRedFlags": [
    "Histórico de hiperplasia prostática aumenta risco de retenção",
    "Distensão vesical causando desconforto adicional",
    "Tempo de retenção próximo ao limite crítico"
  ],
  "empatheticResponse": "Carlos, recebi sua resposta e vejo que você está com dificuldade para urinar há 10 horas, o que é uma situação que precisa de atenção urgente. Considerando seu histórico de problema prostático, essa retenção pode se tornar séria.\n\nÉ importante que você tente algumas medidas imediatamente: tome um banho morno, tente urinar com a torneira aberta (o som da água pode ajudar), e se possível, peça para alguém te ajudar a andar um pouco. A dor intensa que você está sentindo pode ser parcialmente pela bexiga cheia.\n\nNo entanto, se nas próximas 2 horas você não conseguir urinar, você DEVE procurar atendimento de emergência, pois pode ser necessário fazer uma sondagem vesical para aliviar a bexiga. Não espere a situação piorar.",
  "seekCareAdvice": "URGENTE: Se não conseguir urinar nas próximas 2 horas, procure atendimento de emergência imediatamente. Pode ser necessário cateterismo vesical.",
  "reasoning": "Retenção urinária de 10h em paciente com HPB é situação de risco alto. Está próximo do limite de 12h que configura emergência. Dor elevada. Requer orientação para buscar atendimento se não resolver rapidamente."
}
```

---

## Caso 4: Crítico - Febre Alta + Múltiplos Sintomas

### Entrada
```json
{
  "surgeryType": "fistula",
  "dayNumber": 5,
  "patientData": {
    "name": "Pedro Costa",
    "age": 41,
    "sex": "Masculino",
    "comorbidities": ["Diabetes Mellitus tipo 2"],
    "medications": ["Metformina 850mg", "Glibenclamida 5mg"]
  },
  "questionnaireData": {
    "painLevel": 9,
    "urinaryRetention": false,
    "bowelMovement": true,
    "bleeding": "none",
    "fever": true,
    "temperature": 39.2,
    "discharge": "purulent",
    "additionalSymptoms": ["Vermelhidão", "Inchaço", "Calor local"],
    "concerns": "A região está muito inchada e com secreção com mau cheiro"
  },
  "detectedRedFlags": [
    "Febre de 39.2°C",
    "Secreção purulenta abundante",
    "Dor extrema (9/10)",
    "Sinais de celulite (vermelhidão/inchaço)"
  ]
}
```

### Saída Esperada
```json
{
  "riskLevel": "critical",
  "additionalRedFlags": [
    "Diabetes aumenta significativamente risco de infecção grave",
    "Sinais sistêmicos de infecção (febre alta)",
    "Possível abscesso ou infecção de ferida operatória",
    "Combinação de múltiplos red flags críticos"
  ],
  "empatheticResponse": "Pedro, sua situação requer atenção médica IMEDIATA. Os sintomas que você está apresentando - febre alta de 39.2°C, dor intensa, secreção purulenta e sinais inflamatórios importantes - indicam uma possível infecção que precisa ser tratada com urgência, especialmente considerando seu diabetes.\n\nVocê DEVE procurar atendimento de emergência AGORA. Não espere. Leve seus exames e a lista de medicamentos que você usa. Será necessário avaliar a ferida, possivelmente coletar exames e iniciar antibiótico.\n\nEnquanto você se prepara para ir ao hospital, não tente tratar por conta própria. Se possível, peça para alguém te acompanhar. Esta é uma situação séria que requer avaliação médica presencial urgente.",
  "seekCareAdvice": "EMERGÊNCIA: Procure atendimento hospitalar IMEDIATAMENTE. Não espere. Leve seus documentos, lista de medicamentos e exames anteriores. Informe que é pós-operatório de fístula anal com sinais de infecção.",
  "reasoning": "Quadro altamente sugestivo de infecção grave pós-operatória. Paciente diabético tem risco aumentado. Múltiplos red flags críticos presentes. Febre alta + secreção purulenta + sinais flogísticos = possível abscesso ou celulite. Requer atendimento hospitalar imediato para antibioticoterapia e possível drenagem cirúrgica."
}
```

---

## Caso 5: Crítico - Sangramento Ativo Intenso

### Entrada
```json
{
  "surgeryType": "hemorroidectomia",
  "dayNumber": 4,
  "patientData": {
    "name": "Ana Paula",
    "age": 35,
    "sex": "Feminino",
    "comorbidities": [],
    "medications": []
  },
  "questionnaireData": {
    "painLevel": 7,
    "urinaryRetention": false,
    "bowelMovement": true,
    "bleeding": "severe",
    "fever": false,
    "bleedingDetails": "Sangramento ativo, encharcando o absorvente",
    "concerns": "Estou sangrando muito, ficando tonta"
  },
  "detectedRedFlags": ["Sangramento ativo intenso"]
}
```

### Saída Esperada
```json
{
  "riskLevel": "critical",
  "additionalRedFlags": [
    "Sintomas de hipovolemia (tontura)",
    "Sangramento que interfere com absorventes",
    "Possível sangramento arterial",
    "Risco de choque hipovolêmico"
  ],
  "empatheticResponse": "Ana Paula, esta é uma EMERGÊNCIA MÉDICA. Sangramento intenso ativo com tontura são sinais muito graves que requerem atendimento IMEDIATO.\n\nPor favor, siga estas orientações AGORA:\n1. Chame uma ambulância (192) ou peça para alguém te levar ao pronto-socorro IMEDIATAMENTE\n2. Deite-se e eleve as pernas\n3. NÃO tente ir sozinha ao hospital\n4. Se possível, coloque compressas limpas na região\n5. Mantenha-se calma e evite esforços\n\nInforme no hospital que você está no 4º dia de pós-operatório de hemorroidectomia com sangramento ativo. Isso é muito importante. Vá AGORA para o hospital.",
  "seekCareAdvice": "EMERGÊNCIA CRÍTICA: Chame ambulância (192) ou vá IMEDIATAMENTE ao pronto-socorro. Sangramento intenso pós-operatório com tontura pode indicar sangramento arterial que requer intervenção cirúrgica urgente. NÃO ESPERE.",
  "reasoning": "Sangramento ativo intenso em D+4 pós-hemorroidectomia é emergência cirúrgica. Sintomas de hipovolemia (tontura) indicam perda sanguínea significativa. Possível sangramento arterial de pedículo ligado. Requer hemostasia cirúrgica urgente. Risco de choque hipovolêmico."
}
```

---

## Caso 6: Médio Risco - Fissura com Dor Intensa

### Entrada
```json
{
  "surgeryType": "fissura",
  "dayNumber": 2,
  "patientData": {
    "name": "Roberto Alves",
    "age": 29,
    "sex": "Masculino",
    "comorbidities": [],
    "medications": []
  },
  "questionnaireData": {
    "painLevel": 8,
    "urinaryRetention": false,
    "bowelMovement": false,
    "bleeding": "light",
    "fever": false,
    "concerns": "Tenho muito medo de evacuar pela dor"
  },
  "detectedRedFlags": []
}
```

### Saída Esperada
```json
{
  "riskLevel": "medium",
  "additionalRedFlags": [
    "Ansiedade antecipatória em relação à evacuação",
    "Dor mais intensa que o esperado para D+2",
    "Risco de constipação por medo"
  ],
  "empatheticResponse": "Roberto, entendo perfeitamente seu medo. A dor após cirurgia de fissura pode ser intensa, especialmente no momento da evacuação, mas é fundamental que isso aconteça para sua recuperação completa.\n\nAlgumas estratégias que podem te ajudar: tome o analgésico 30-40 minutos ANTES de ir ao banheiro, use a pomada generosamente antes e depois, faça um banho de assento com água morna antes (isso relaxa o músculo), e quando sentir vontade, vá ao banheiro - não segure.\n\nLembre-se: quanto mais você adiar, mais dura e dolorosa a evacuação vai ser. É importante evacuar nas próximas 24 horas. Se a dor estiver realmente insuportável mesmo com os analgésicos, entre em contato para avaliarmos se precisamos ajustar a medicação.\n\nVocê vai conseguir passar por isso. Não tenha vergonha de entrar em contato se precisar de apoio.",
  "seekCareAdvice": "Se a dor não melhorar com os analgésicos ou se não conseguir evacuar nas próximas 24 horas, entre em contato com o consultório para ajustarmos o tratamento.",
  "reasoning": "Dor intensa (8/10) em D+2 é significativa mas não crítica. Componente psicológico importante (medo). Ausência de evacuação por receio pode piorar quadro. Requer suporte emocional e orientação sobre manejo da dor. Importante encorajar evacuação breve."
}
```

---

## Notas sobre Respostas da IA

### Características das Respostas Empáticas

1. **Tom acolhedor**: Sempre inicia com saudação usando o nome do paciente
2. **Validação**: Reconhece as preocupações e sentimentos do paciente
3. **Clareza**: Usa linguagem simples, evita termos médicos complexos
4. **Orientação prática**: Fornece passos concretos quando necessário
5. **Urgência apropriada**: Gradua a urgência de acordo com o risco
6. **Empoderamento**: Encoraja o paciente sem minimizar sintomas

### Padrões de Classificação de Risco

- **Low**: Sintomas esperados, evolução normal
- **Medium**: Sintomas que requerem atenção mas não urgência
- **High**: Sintomas preocupantes, requer avaliação em breve
- **Critical**: Sintomas graves, requer atendimento imediato/emergencial

### Elementos Essenciais

Toda resposta deve conter:
1. ✅ Reconhecimento da situação do paciente
2. ✅ Avaliação do quadro clínico
3. ✅ Orientações práticas
4. ✅ Quando procurar ajuda (se aplicável)
5. ✅ Encorajamento/suporte emocional
