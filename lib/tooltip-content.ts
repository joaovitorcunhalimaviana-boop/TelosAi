/**
 * Educational Tooltip Content Database
 *
 * Comprehensive definitions for statistical and medical terms
 * used throughout the research system.
 *
 * Portuguese language, medically accurate, concise explanations.
 */

export interface TooltipContent {
  term: string;
  category: 'statistical' | 'medical' | 'clinical';
  definition: string;
  example?: string;
  interpretation?: string;
  learnMoreUrl?: string;
}

export const tooltipDatabase: Record<string, TooltipContent> = {
  // ==================== STATISTICAL TERMS ====================

  'p-valor': {
    term: 'P-valor (p-value)',
    category: 'statistical',
    definition: 'Probabilidade de observar um resultado tão extremo quanto o obtido, assumindo que não há efeito real (hipótese nula verdadeira).',
    example: 'p = 0.03 significa 3% de chance de obter esse resultado por puro acaso.',
    interpretation: 'p < 0.05 indica significância estatística (convenção). Quanto menor o p-valor, mais forte a evidência contra a hipótese nula.',
    learnMoreUrl: '/dashboard/glossario#p-valor'
  },

  'intervalo-confianca': {
    term: 'Intervalo de Confiança 95% (IC 95%)',
    category: 'statistical',
    definition: 'Faixa de valores onde o verdadeiro parâmetro populacional provavelmente se encontra, com 95% de confiança.',
    example: 'IC 95%: [2.1, 3.8] significa que estamos 95% confiantes de que o valor real está entre 2.1 e 3.8.',
    interpretation: 'Intervalos mais estreitos indicam estimativas mais precisas. Se o IC não inclui zero (ou 1 para razões), o resultado é significativo.',
    learnMoreUrl: '/dashboard/glossario#intervalo-confianca'
  },

  'hazard-ratio': {
    term: 'Hazard Ratio (HR)',
    category: 'statistical',
    definition: 'Razão entre as taxas de risco instantâneo de dois grupos. Usada em análise de sobrevivência para comparar o risco de um evento ao longo do tempo.',
    example: 'HR = 0.65 significa 35% de redução no risco do evento. HR = 1.5 significa 50% mais risco.',
    interpretation: 'HR < 1 indica proteção/benefício. HR > 1 indica aumento de risco. HR = 1 indica sem diferença.',
    learnMoreUrl: '/dashboard/glossario#hazard-ratio'
  },

  'eta-squared': {
    term: 'Eta-quadrado (η²)',
    category: 'statistical',
    definition: 'Medida do tamanho do efeito em ANOVA. Representa a proporção da variância total explicada pelo fator estudado.',
    example: 'η² = 0.14 significa que o tratamento explica 14% da variação na dor entre pacientes.',
    interpretation: 'η² = 0.01 (pequeno), 0.06 (médio), 0.14 (grande). Valores maiores indicam efeito mais forte.',
    learnMoreUrl: '/dashboard/glossario#eta-squared'
  },

  'r-squared': {
    term: 'R² (Coeficiente de Determinação)',
    category: 'statistical',
    definition: 'Proporção da variância da variável dependente explicada pelo modelo de regressão.',
    example: 'R² = 0.65 significa que o modelo explica 65% da variabilidade nos dados observados.',
    interpretation: 'Varia de 0 (modelo não explica nada) a 1 (explica perfeitamente). R² > 0.5 geralmente indica bom ajuste.',
    learnMoreUrl: '/dashboard/glossario#r-squared'
  },

  'f-statistic': {
    term: 'Estatística F (F-statistic)',
    category: 'statistical',
    definition: 'Razão entre a variância explicada pelo modelo e a variância residual. Testa se há diferenças significativas entre grupos.',
    example: 'F = 34.2 com p < 0.001 indica forte evidência de diferença entre os grupos.',
    interpretation: 'Valores maiores de F indicam maior evidência de diferenças reais. Sempre acompanhado de graus de liberdade e p-valor.',
    learnMoreUrl: '/dashboard/glossario#f-statistic'
  },

  'tukey-hsd': {
    term: 'Tukey HSD (Post-Hoc)',
    category: 'statistical',
    definition: 'Teste post-hoc usado após ANOVA significativa para identificar quais pares de grupos diferem entre si, controlando a taxa de erro tipo I.',
    example: 'Após ANOVA indicar diferença geral, Tukey revela que Grupo A difere de B (p = 0.002), mas não de C.',
    interpretation: 'Aplicado apenas quando ANOVA é significativa. Compara todos os pares de grupos com ajuste para múltiplas comparações.',
    learnMoreUrl: '/dashboard/glossario#tukey-hsd'
  },

  'chi-square': {
    term: 'Qui-quadrado (χ²)',
    category: 'statistical',
    definition: 'Teste estatístico para avaliar associação entre duas variáveis categóricas, comparando frequências observadas com esperadas.',
    example: 'χ² = 12.5 com p = 0.004 indica associação significativa entre tipo de cirurgia e complicações.',
    interpretation: 'Valores maiores indicam maior desvio do esperado por acaso. Requer contagens adequadas em cada célula (≥5).',
    learnMoreUrl: '/dashboard/glossario#chi-square'
  },

  'cramers-v': {
    term: "Cramér's V",
    category: 'statistical',
    definition: 'Medida da força de associação entre duas variáveis categóricas. Normalizada para variar de 0 a 1.',
    example: "V = 0.45 indica associação moderada a forte entre sexo e tipo de complicação.",
    interpretation: 'V = 0.1 (fraca), 0.3 (moderada), 0.5 (forte). Útil quando χ² é significativo para quantificar o efeito.',
    learnMoreUrl: '/dashboard/glossario#cramers-v'
  },

  'cooks-distance': {
    term: "Distância de Cook (Cook's Distance)",
    category: 'statistical',
    definition: 'Medida de influência de cada observação no modelo de regressão. Identifica outliers que podem distorcer os resultados.',
    example: "Paciente P-087 tem Cook's D = 0.42, indicando influência moderada no modelo.",
    interpretation: 'D > 0.5 indica observação influente que merece investigação. D > 1.0 indica forte influência, considere exclusão.',
    learnMoreUrl: '/dashboard/glossario#cooks-distance'
  },

  'vif': {
    term: 'VIF (Variance Inflation Factor)',
    category: 'statistical',
    definition: 'Medida de multicolinearidade entre preditores em regressão. Indica quanto a variância de um coeficiente está inflada devido à correlação com outros preditores.',
    example: 'VIF = 7.2 para idade indica alta correlação com outras variáveis no modelo.',
    interpretation: 'VIF < 5 aceitável. VIF > 5-10 indica multicolinearidade problemática. Considere remover ou combinar variáveis correlacionadas.',
    learnMoreUrl: '/dashboard/glossario#vif'
  },

  'cohens-d': {
    term: "Cohen's d",
    category: 'statistical',
    definition: 'Medida padronizada do tamanho do efeito entre dois grupos. Expressa a diferença entre médias em unidades de desvio padrão.',
    example: "d = 0.8 significa que as médias diferem em 0.8 desvios padrão, um efeito grande.",
    interpretation: 'd = 0.2 (pequeno), 0.5 (médio), 0.8 (grande). Permite comparar efeitos entre estudos diferentes.',
    learnMoreUrl: '/dashboard/glossario#cohens-d'
  },

  'beta-coefficient': {
    term: 'Coeficiente Beta (β)',
    category: 'statistical',
    definition: 'Em regressão, representa a mudança esperada na variável dependente para cada unidade de mudança no preditor, mantendo outros preditores constantes.',
    example: 'β = 0.042 para idade significa que cada ano adicional aumenta a dor em 0.042 pontos.',
    interpretation: 'β > 0 indica relação positiva. β < 0 indica relação negativa. Magnitude indica força do efeito.',
    learnMoreUrl: '/dashboard/glossario#beta-coefficient'
  },

  'standard-error': {
    term: 'Erro Padrão (EP/SE)',
    category: 'statistical',
    definition: 'Medida da variabilidade da estimativa de um parâmetro. Indica a precisão da estimativa.',
    example: 'β = 2.3, EP = 0.35 indica estimativa relativamente precisa do coeficiente.',
    interpretation: 'EP menor indica estimativa mais precisa. EP é usado para construir intervalos de confiança e testar hipóteses.',
    learnMoreUrl: '/dashboard/glossario#standard-error'
  },

  't-statistic': {
    term: 'Estatística t',
    category: 'statistical',
    definition: 'Razão entre o coeficiente estimado e seu erro padrão. Testa se o coeficiente é significativamente diferente de zero.',
    example: 't = 6.7 com p < 0.001 indica que o coeficiente é altamente significativo.',
    interpretation: '|t| > 2 geralmente indica significância. Valores maiores indicam evidência mais forte.',
    learnMoreUrl: '/dashboard/glossario#t-statistic'
  },

  'anova': {
    term: 'ANOVA (Análise de Variância)',
    category: 'statistical',
    definition: 'Teste estatístico que compara médias de três ou mais grupos simultaneamente, decompondo a variância total em componentes.',
    example: 'ANOVA com F = 34.2, p < 0.001 indica que pelo menos um grupo difere significativamente dos demais.',
    interpretation: 'Se significativa, indica diferença geral entre grupos. Requer teste post-hoc para identificar quais grupos diferem.',
    learnMoreUrl: '/dashboard/glossario#anova'
  },

  'graus-liberdade': {
    term: 'Graus de Liberdade (GL/df)',
    category: 'statistical',
    definition: 'Número de valores que podem variar livremente na estimação de um parâmetro estatístico.',
    example: 'F(2, 87) indica 2 GL entre grupos e 87 GL dentro dos grupos.',
    interpretation: 'Afeta a distribuição de testes estatísticos. Geralmente relacionado ao tamanho amostral menos parâmetros estimados.',
    learnMoreUrl: '/dashboard/glossario#graus-liberdade'
  },

  'kaplan-meier': {
    term: 'Curva de Kaplan-Meier',
    category: 'statistical',
    definition: 'Método não-paramétrico para estimar a função de sobrevivência ao longo do tempo, lidando com dados censurados.',
    example: 'Curva KM mostra que 80% dos pacientes permanecem livres de complicação após 30 dias.',
    interpretation: 'Curvas que não se sobrepõem indicam diferença entre grupos. Considere censura ao interpretar.',
    learnMoreUrl: '/dashboard/glossario#kaplan-meier'
  },

  'log-rank-test': {
    term: 'Teste Log-Rank',
    category: 'statistical',
    definition: 'Teste estatístico que compara curvas de sobrevivência entre dois ou mais grupos ao longo de todo o período de seguimento.',
    example: 'Log-rank χ² = 15.2, p = 0.001 indica diferença significativa nas curvas de sobrevivência entre grupos.',
    interpretation: 'Testa a hipótese nula de que as curvas são idênticas. Mais poderoso quando hazards são proporcionais.',
    learnMoreUrl: '/dashboard/glossario#log-rank-test'
  },

  'cox-regression': {
    term: 'Regressão de Cox',
    category: 'statistical',
    definition: 'Modelo de regressão para análise de sobrevivência que estima hazard ratios ajustando para múltiplas covariáveis simultaneamente.',
    example: 'Modelo de Cox ajustado revela HR = 0.65 (IC 95%: 0.45-0.92) para novo tratamento.',
    interpretation: 'Permite controlar fatores confundidores. Assume hazards proporcionais ao longo do tempo.',
    learnMoreUrl: '/dashboard/glossario#cox-regression'
  },

  'c-index': {
    term: 'C-index (Concordance Index)',
    category: 'statistical',
    definition: 'Medida de capacidade discriminatória de um modelo de sobrevivência. Probabilidade de que, entre dois pacientes aleatórios, aquele com maior risco predito experimente o evento primeiro.',
    example: 'C-index = 0.78 indica boa capacidade do modelo em discriminar quem terá o evento.',
    interpretation: '0.5 = acaso, 0.7-0.8 = aceitável, 0.8-0.9 = excelente, >0.9 = excepcional.',
    learnMoreUrl: '/dashboard/glossario#c-index'
  },

  'dados-censurados': {
    term: 'Dados Censurados',
    category: 'statistical',
    definition: 'Observações onde o evento de interesse não ocorreu até o final do seguimento. Informação parcial mas valiosa.',
    example: 'Paciente completou 90 dias sem complicação e saiu do estudo (censurado à direita).',
    interpretation: 'Comum em estudos de sobrevivência. Métodos especiais (Kaplan-Meier, Cox) lidam adequadamente com censura.',
    learnMoreUrl: '/dashboard/glossario#dados-censurados'
  },

  'numero-em-risco': {
    term: 'Número em Risco (At Risk)',
    category: 'statistical',
    definition: 'Quantidade de pacientes ainda sob observação (sem evento e sem censura) em cada ponto do tempo na análise de sobrevivência.',
    example: 'No dia 30, 45 pacientes ainda estão em risco de complicação no Grupo A.',
    interpretation: 'Declina ao longo do tempo devido a eventos e censura. Curvas com poucos pacientes em risco são menos confiáveis.',
    learnMoreUrl: '/dashboard/glossario#numero-em-risco'
  },

  'rmse': {
    term: 'RMSE (Root Mean Square Error)',
    category: 'statistical',
    definition: 'Raiz quadrada da média dos erros quadráticos. Medida da precisão de predições do modelo nas unidades originais da variável.',
    example: 'RMSE = 1.42 pontos significa que as predições do modelo erram em média 1.42 pontos na escala de dor.',
    interpretation: 'Valores menores indicam melhor ajuste. Útil para comparar modelos na mesma escala.',
    learnMoreUrl: '/dashboard/glossario#rmse'
  },

  'r-squared-ajustado': {
    term: 'R² Ajustado',
    category: 'statistical',
    definition: 'R² corrigido pelo número de preditores no modelo. Penaliza modelos com muitas variáveis desnecessárias.',
    example: 'R² = 0.65, R² ajustado = 0.63 indica pequena penalização por preditores.',
    interpretation: 'Sempre menor ou igual ao R². Preferível para comparar modelos com diferentes números de preditores.',
    learnMoreUrl: '/dashboard/glossario#r-squared-ajustado'
  },

  'poder-estatistico': {
    term: 'Poder Estatístico (1-β)',
    category: 'statistical',
    definition: 'Probabilidade de detectar um efeito real quando ele existe. Complemento do erro tipo II.',
    example: 'Poder = 0.85 significa 85% de chance de detectar uma diferença real se ela existir.',
    interpretation: 'Recomenda-se poder ≥ 0.80. Depende do tamanho amostral, tamanho do efeito e nível α.',
    learnMoreUrl: '/dashboard/glossario#poder-estatistico'
  },

  'alfa': {
    term: 'Nível de Significância (α)',
    category: 'statistical',
    definition: 'Probabilidade de cometer erro tipo I (rejeitar hipótese nula quando verdadeira). Define o limiar para significância estatística.',
    example: 'α = 0.05 significa aceitamos 5% de chance de falso positivo.',
    interpretation: 'Convenção: α = 0.05. Valores menores (0.01) são mais conservadores. Define o p-valor crítico.',
    learnMoreUrl: '/dashboard/glossario#alfa'
  },

  'normalidade': {
    term: 'Normalidade dos Resíduos',
    category: 'statistical',
    definition: 'Pressuposto de que os erros do modelo seguem distribuição normal. Importante para validade de testes paramétricos.',
    example: 'Q-Q plot mostra resíduos alinhados à diagonal, indicando normalidade satisfatória.',
    interpretation: 'Violações leves geralmente aceitáveis com n grande. Violações severas requerem transformação ou métodos não-paramétricos.',
    learnMoreUrl: '/dashboard/glossario#normalidade'
  },

  'homoscedasticidade': {
    term: 'Homoscedasticidade',
    category: 'statistical',
    definition: 'Pressuposto de que a variância dos resíduos é constante ao longo dos valores preditos. Variância homogênea.',
    example: 'Gráfico resíduos vs ajustados mostra dispersão uniforme, sem padrão de funil.',
    interpretation: 'Violação (heteroscedasticidade) infla erros padrão. Pode requerer transformação ou erros robustos.',
    learnMoreUrl: '/dashboard/glossario#homoscedasticidade'
  },

  'multicolinearidade': {
    term: 'Multicolinearidade',
    category: 'statistical',
    definition: 'Alta correlação entre preditores em modelo de regressão. Infla erros padrão e dificulta interpretação de coeficientes.',
    example: 'Idade e tempo de cirurgia altamente correlacionados (r = 0.85) causam multicolinearidade.',
    interpretation: 'VIF > 5-10 indica problema. Soluções: remover variáveis, combinar em índice, ou usar métodos de regularização.',
    learnMoreUrl: '/dashboard/glossario#multicolinearidade'
  },

  // ==================== MEDICAL TERMS ====================

  'hemorroidectomia': {
    term: 'Hemorroidectomia',
    category: 'medical',
    definition: 'Procedimento cirúrgico para remoção de hemorroidas internas e/ou externas quando tratamentos conservadores falharam.',
    example: 'Hemorroidectomia aberta (Milligan-Morgan) vs fechada (Ferguson) são técnicas comuns.',
    interpretation: 'Indicada para hemorroidas grau III-IV. Período de recuperação típico: 2-4 semanas.',
    learnMoreUrl: '/dashboard/glossario#hemorroidectomia'
  },

  'fistula-anal': {
    term: 'Fístula Anal',
    category: 'medical',
    definition: 'Canal anormal que conecta o canal anal ou reto à pele perianal. Geralmente resultado de abscesso perianal prévio.',
    example: 'Fístula transesfincteriana requer fistulotomia ou LIFT (Ligation of Intersphincteric Fistula Tract).',
    interpretation: 'Classificação de Parks determina abordagem cirúrgica. Risco de incontinência deve ser considerado.',
    learnMoreUrl: '/dashboard/glossario#fistula-anal'
  },

  'comorbidade': {
    term: 'Comorbidade',
    category: 'medical',
    definition: 'Presença de uma ou mais condições médicas adicionais coexistindo com a condição principal. Afeta prognóstico e manejo.',
    example: 'Diabetes e hipertensão são comorbidades comuns que aumentam risco cirúrgico.',
    interpretation: 'Múltiplas comorbidades geralmente requerem otimização pré-operatória e monitoramento intensificado.',
    learnMoreUrl: '/dashboard/glossario#comorbidade'
  },

  'bloqueio-pudendo': {
    term: 'Bloqueio do Nervo Pudendo',
    category: 'medical',
    definition: 'Técnica de anestesia regional que bloqueia o nervo pudendo para proporcionar analgesia perineal e perianal.',
    example: 'Bloqueio pudendo bilateral reduz dor pós-operatória em cirurgias anorretais.',
    interpretation: 'Pode reduzir necessidade de opioides. Duração: 12-24 horas dependendo do anestésico usado.',
    learnMoreUrl: '/dashboard/glossario#bloqueio-pudendo'
  },

  'eva': {
    term: 'EVA (Escala Visual Analógica)',
    category: 'medical',
    definition: 'Escala de 0-10 para mensuração subjetiva de dor, onde 0 = sem dor e 10 = pior dor imaginável.',
    example: 'EVA = 7 no pós-operatório imediato indica dor moderada a severa.',
    interpretation: 'Diferença ≥2 pontos geralmente considerada clinicamente significativa (MCID).',
    learnMoreUrl: '/dashboard/glossario#eva'
  },

  'mcid': {
    term: 'MCID (Minimal Clinically Important Difference)',
    category: 'medical',
    definition: 'Menor mudança em um desfecho que pacientes percebem como benéfica ou que justificaria mudança no manejo.',
    example: 'MCID para dor pós-operatória geralmente é 2.0 pontos na escala 0-10.',
    interpretation: 'Diferença estatisticamente significativa pode não ser clinicamente relevante se < MCID.',
    learnMoreUrl: '/dashboard/glossario#mcid'
  },

  'complicacao-cirurgica': {
    term: 'Complicação Cirúrgica',
    category: 'medical',
    definition: 'Evento adverso que ocorre durante ou após procedimento cirúrgico, causando desvio do curso pós-operatório normal.',
    example: 'Sangramento, infecção, deiscência são complicações comuns em cirurgias anorretais.',
    interpretation: 'Classificação de Clavien-Dindo gradua severidade. Complicações grau III+ requerem intervenção.',
    learnMoreUrl: '/dashboard/glossario#complicacao-cirurgica'
  },

  'imc': {
    term: 'IMC (Índice de Massa Corporal)',
    category: 'medical',
    definition: 'Medida de peso corporal ajustada pela altura (kg/m²). Indicador de adiposidade e fator de risco cirúrgico.',
    example: 'IMC = 32 indica obesidade grau I, aumentando risco de complicações pós-operatórias.',
    interpretation: 'Normal: 18.5-24.9. Sobrepeso: 25-29.9. Obesidade: ≥30. IMC >40 = obesidade mórbida.',
    learnMoreUrl: '/dashboard/glossario#imc'
  },

  'tempo-cirurgico': {
    term: 'Tempo Cirúrgico',
    category: 'medical',
    definition: 'Duração total do procedimento cirúrgico, desde incisão até fechamento. Fator de risco independente para complicações.',
    example: 'Hemorroidectomia com tempo cirúrgico >90 minutos associado a maior morbidade.',
    interpretation: 'Tempos prolongados aumentam risco de infecção, sangramento e eventos anestésicos.',
    learnMoreUrl: '/dashboard/glossario#tempo-cirurgico'
  },

  'retorno-atividades': {
    term: 'Retorno às Atividades Normais',
    category: 'medical',
    definition: 'Tempo até o paciente retomar atividades diárias, trabalho e exercícios habituais sem restrições significativas.',
    example: 'Média de 21 dias para retorno completo às atividades após hemorroidectomia.',
    interpretation: 'Desfecho importante centrado no paciente. Varia com tipo de cirurgia, ocupação e expectativas.',
    learnMoreUrl: '/dashboard/glossario#retorno-atividades'
  },

  'satisfacao-paciente': {
    term: 'Satisfação do Paciente',
    category: 'medical',
    definition: 'Avaliação subjetiva do paciente sobre resultado do tratamento, atendimento e experiência geral.',
    example: 'Escala 0-10: Satisfação = 8.5 indica alta satisfação com o tratamento recebido.',
    interpretation: 'Desfecho importante que captura perspectiva do paciente. Nem sempre correlaciona com desfechos clínicos.',
    learnMoreUrl: '/dashboard/glossario#satisfacao-paciente'
  },

  'infeccao-sitio-cirurgico': {
    term: 'Infecção de Sítio Cirúrgico (ISC)',
    category: 'medical',
    definition: 'Infecção que ocorre no local da incisão cirúrgica dentro de 30 dias (ou 90 dias se prótese implantada).',
    example: 'ISC superficial com eritema e drenagem purulenta no 5º dia pós-operatório.',
    interpretation: 'Classificação: superficial, profunda ou órgão/espaço. Prolonga internação e aumenta custos.',
    learnMoreUrl: '/dashboard/glossario#infeccao-sitio-cirurgico'
  },

  'sangramento-pos-op': {
    term: 'Sangramento Pós-Operatório',
    category: 'medical',
    definition: 'Hemorragia que ocorre após procedimento cirúrgico, podendo ser precoce (<24h) ou tardia (>24h).',
    example: 'Sangramento significativo requerendo transfusão ou retorno ao centro cirúrgico.',
    interpretation: 'Complicação comum em cirurgias anorretais. Fatores de risco: anticoagulação, hipertensão, técnica.',
    learnMoreUrl: '/dashboard/glossario#sangramento-pos-op'
  },

  'deiscencia': {
    term: 'Deiscência de Ferida',
    category: 'medical',
    definition: 'Separação parcial ou completa das camadas de uma ferida cirúrgica previamente fechada.',
    example: 'Deiscência de sutura no 7º dia PO requerendo cicatrização por segunda intenção.',
    interpretation: 'Fatores de risco: infecção, desnutrição, diabetes, tensão excessiva. Pode requerer resutura.',
    learnMoreUrl: '/dashboard/glossario#deiscencia'
  },

  'analgesia-multimodal': {
    term: 'Analgesia Multimodal',
    category: 'medical',
    definition: 'Estratégia que combina diferentes classes de analgésicos e técnicas para otimizar controle da dor e minimizar efeitos adversos.',
    example: 'Protocolo combinando paracetamol, AINE, bloqueio regional e opioide de resgate.',
    interpretation: 'Abordagem padrão-ouro. Reduz consumo de opioides e melhora recuperação (ERAS).',
    learnMoreUrl: '/dashboard/glossario#analgesia-multimodal'
  },

  'eras': {
    term: 'ERAS (Enhanced Recovery After Surgery)',
    category: 'medical',
    definition: 'Protocolo baseado em evidências que otimiza múltiplos aspectos do cuidado perioperatório para acelerar recuperação.',
    example: 'Protocolo ERAS: mobilização precoce, nutrição oral precoce, analgesia multimodal.',
    interpretation: 'Reduz complicações, internação e custos. Requer adesão multidisciplinar e engajamento do paciente.',
    learnMoreUrl: '/dashboard/glossario#eras'
  },

  'constipacao-pos-op': {
    term: 'Constipação Pós-Operatória',
    category: 'medical',
    definition: 'Dificuldade ou incapacidade de evacuar após cirurgia, comum em procedimentos anorretais devido a dor e opioides.',
    example: 'Constipação severa no 3º dia PO requerendo laxativos osmóticos e ajuste de analgesia.',
    interpretation: 'Prevenção: hidratação, fibras, laxantes profiláticos, redução de opioides. Pode causar complicações.',
    learnMoreUrl: '/dashboard/glossario#constipacao-pos-op'
  },

  'retencao-urinaria': {
    term: 'Retenção Urinária',
    category: 'medical',
    definition: 'Incapacidade de esvaziar completamente a bexiga. Complicação comum após cirurgias anorretais e anestesia espinal.',
    example: 'Retenção urinária requerendo cateterização no pós-operatório imediato.',
    interpretation: 'Incidência: 15-20% em cirurgias anorretais. Fatores: espinal, opioides, próstata aumentada.',
    learnMoreUrl: '/dashboard/glossario#retencao-urinaria'
  },

  'tempo-recuperacao': {
    term: 'Tempo de Recuperação',
    category: 'medical',
    definition: 'Período desde a cirurgia até o paciente retomar função normal e atividades habituais sem limitações significativas.',
    example: 'Tempo médio de recuperação: 14-21 dias para fistulotomia simples.',
    interpretation: 'Varia por procedimento, paciente e definição usada. Desfecho importante para qualidade de vida.',
    learnMoreUrl: '/dashboard/glossario#tempo-recuperacao'
  },

  'perdido-seguimento': {
    term: 'Perdido no Seguimento (Lost to Follow-up)',
    category: 'clinical',
    definition: 'Paciente que não completa as avaliações de acompanhamento previstas no protocolo do estudo.',
    example: 'Taxa de 15% de perda no seguimento de 90 dias afeta validade dos resultados.',
    interpretation: 'Alta taxa de perda (>20%) pode introduzir viés. Análise de sensibilidade recomendada.',
    learnMoreUrl: '/dashboard/glossario#perdido-seguimento'
  },

  // ==================== CLINICAL RESEARCH TERMS ====================

  'randomizacao': {
    term: 'Randomização',
    category: 'clinical',
    definition: 'Alocação aleatória de participantes a grupos de tratamento para minimizar viés de seleção e balancear fatores confundidores.',
    example: 'Randomização 1:1 para grupos controle e intervenção usando envelopes selados.',
    interpretation: 'Fundamental para ensaios clínicos de alta qualidade. Tipos: simples, em blocos, estratificada.',
    learnMoreUrl: '/dashboard/glossario#randomizacao'
  },

  'cegamento': {
    term: 'Cegamento (Mascaramento)',
    category: 'clinical',
    definition: 'Estratégia para prevenir viés mantendo participantes, avaliadores ou estatísticos sem conhecimento da alocação de tratamento.',
    example: 'Estudo duplo-cego: nem paciente nem avaliador sabem qual grupo recebeu intervenção.',
    interpretation: 'Níveis: simples, duplo, triplo. Nem sempre possível em cirurgia. Avaliador cego preferível.',
    learnMoreUrl: '/dashboard/glossario#cegamento'
  },

  'intencao-tratar': {
    term: 'Análise por Intenção de Tratar (ITT)',
    category: 'clinical',
    definition: 'Análise que inclui todos os participantes randomizados nos grupos originalmente alocados, independente de adesão ao protocolo.',
    example: 'Paciente randomizado para Grupo A mas recebeu tratamento B ainda é analisado no Grupo A.',
    interpretation: 'Preserva benefício da randomização. Reflete efetividade real. Conservadora mas mais válida.',
    learnMoreUrl: '/dashboard/glossario#intencao-tratar'
  },

  'consort': {
    term: 'CONSORT (Consolidated Standards of Reporting Trials)',
    category: 'clinical',
    definition: 'Diretrizes internacionais para relato transparente e completo de ensaios clínicos randomizados.',
    example: 'Diagrama CONSORT mostra fluxo de participantes: avaliados, randomizados, analisados.',
    interpretation: 'Melhora qualidade e transparência. Requerido por muitos periódicos. Inclui checklist e fluxograma.',
    learnMoreUrl: '/dashboard/glossario#consort'
  },

  'tamanho-amostral': {
    term: 'Tamanho Amostral',
    category: 'clinical',
    definition: 'Número de participantes necessário para detectar um efeito de tamanho especificado com poder estatístico adequado.',
    example: 'n = 120 (60 por grupo) para detectar diferença de 2 pontos na dor com poder de 80%.',
    interpretation: 'Calculado a priori. Considera: tamanho do efeito, poder desejado (0.8), alfa (0.05), variabilidade.',
    learnMoreUrl: '/dashboard/glossario#tamanho-amostral'
  },

  'media': {
    term: 'Média (M)',
    category: 'statistical',
    definition: 'Medida de tendência central que representa o valor médio de um conjunto de dados. Soma de todos os valores dividida pelo número de observações.',
    example: 'Média de dor = 4.5 indica que o valor médio da dor no grupo é 4.5 pontos.',
    interpretation: 'Sensível a valores extremos (outliers). Útil para dados com distribuição aproximadamente normal.',
    learnMoreUrl: '/dashboard/glossario#media'
  },

  'desvio-padrao': {
    term: 'Desvio Padrão (DP/SD)',
    category: 'statistical',
    definition: 'Medida de dispersão que indica quanto os valores variam em relação à média. Raiz quadrada da variância.',
    example: 'Dor = 4.5 ± 1.8 indica média de 4.5 com variabilidade de 1.8 pontos.',
    interpretation: 'DP maior indica mais variabilidade. Cerca de 68% dos dados estão dentro de ±1 DP da média.',
    learnMoreUrl: '/dashboard/glossario#desvio-padrao'
  },

  'mediana': {
    term: 'Mediana',
    category: 'statistical',
    definition: 'Valor que divide o conjunto de dados ao meio: 50% dos valores estão acima e 50% abaixo. Medida robusta de tendência central.',
    example: 'Mediana de tempo de recuperação = 14 dias significa que metade recupera antes e metade depois.',
    interpretation: 'Preferível à média quando há outliers ou distribuição assimétrica. Não afetada por valores extremos.',
    learnMoreUrl: '/dashboard/glossario#mediana'
  },

  'quartis': {
    term: 'Quartis (Q1, Q2, Q3)',
    category: 'statistical',
    definition: 'Valores que dividem os dados ordenados em quatro partes iguais. Q1 = 25º percentil, Q2 = mediana, Q3 = 75º percentil.',
    example: 'Q1 = 3, Q2 = 5, Q3 = 7 para dor. 50% dos pacientes têm dor entre 3 e 7.',
    interpretation: 'Intervalo interquartil (IQR = Q3-Q1) mede dispersão. Box plots visualizam quartis.',
    learnMoreUrl: '/dashboard/glossario#quartis'
  },

  'outlier': {
    term: 'Outlier (Valor Atípico)',
    category: 'statistical',
    definition: 'Observação que se desvia acentuadamente do padrão geral dos dados. Pode ser erro ou fenômeno real.',
    example: 'Paciente com tempo de recuperação de 180 dias enquanto outros ficam entre 10-30 dias.',
    interpretation: 'Investigar causa. Pode distorcer análises. Considerar análise de sensibilidade com/sem outliers.',
    learnMoreUrl: '/dashboard/glossario#outlier'
  },

  'soma-quadrados': {
    term: 'Soma dos Quadrados (SS)',
    category: 'statistical',
    definition: 'Soma das diferenças quadráticas entre valores e a média. Componente fundamental da ANOVA e regressão.',
    example: 'SS Total = SS Entre Grupos + SS Dentro dos Grupos na ANOVA.',
    interpretation: 'Quantifica variabilidade total, explicada e não explicada. Base para cálculo de F-statistic.',
    learnMoreUrl: '/dashboard/glossario#soma-quadrados'
  },

  'quadrado-medio': {
    term: 'Quadrado Médio (MS)',
    category: 'statistical',
    definition: 'Soma dos quadrados dividida pelos graus de liberdade. Estimativa de variância.',
    example: 'MS Entre = SS Entre / df Entre. MS Dentro = SS Dentro / df Dentro.',
    interpretation: 'F-statistic = MS Entre / MS Dentro. Compara variabilidade entre e dentro de grupos.',
    learnMoreUrl: '/dashboard/glossario#quadrado-medio'
  },

  'teste-bilateral': {
    term: 'Teste Bilateral (Bicaudal)',
    category: 'statistical',
    definition: 'Teste de hipótese que considera desvios em ambas as direções. Detecta diferença sem assumir direção.',
    example: 'Teste bilateral para comparar grupos: detecta se A > B ou A < B.',
    interpretation: 'Mais conservador que teste unilateral. Padrão em pesquisa biomédica (p é dividido em ambas as caudas).',
    learnMoreUrl: '/dashboard/glossario#teste-bilateral'
  },

  'durbin-watson': {
    term: 'Durbin-Watson',
    category: 'statistical',
    definition: 'Estatística que testa autocorrelação dos resíduos em regressão. Varia de 0 a 4.',
    example: 'DW = 1.98 indica ausência de autocorrelação (próximo a 2.0 é ideal).',
    interpretation: 'DW ≈ 2 indica independência. DW < 1.5 ou > 2.5 sugere autocorrelação problemática.',
    learnMoreUrl: '/dashboard/glossario#durbin-watson'
  },

  'residuo': {
    term: 'Resíduo',
    category: 'statistical',
    definition: 'Diferença entre valor observado e valor predito pelo modelo. Erro não explicado.',
    example: 'Dor observada = 6, predita = 4.5. Resíduo = 1.5 (modelo subestimou).',
    interpretation: 'Resíduos devem ser aleatórios, normais e homoscedásticos. Padrões indicam problemas no modelo.',
    learnMoreUrl: '/dashboard/glossario#residuo'
  },

  'qq-plot': {
    term: 'Q-Q Plot (Gráfico Quantil-Quantil)',
    category: 'statistical',
    definition: 'Gráfico que compara distribuição dos resíduos com distribuição normal teórica.',
    example: 'Pontos alinhados à diagonal indicam normalidade satisfatória dos resíduos.',
    interpretation: 'Desvios nas caudas são comuns. Desvios sistemáticos indicam não-normalidade.',
    learnMoreUrl: '/dashboard/glossario#qq-plot'
  },

  'amostra-conveniencia': {
    term: 'Amostra de Conveniência',
    category: 'clinical',
    definition: 'Método de amostragem não-probabilístico onde participantes são selecionados pela facilidade de acesso.',
    example: 'Recrutar pacientes consecutivos que comparecem à clínica.',
    interpretation: 'Menor validade externa. Pode introduzir viés de seleção. Comum mas menos rigoroso.',
    learnMoreUrl: '/dashboard/glossario#amostra-conveniencia'
  },

  'criterios-inclusao': {
    term: 'Critérios de Inclusão',
    category: 'clinical',
    definition: 'Características que os participantes devem ter para serem elegíveis ao estudo.',
    example: 'Inclusão: idade 18-75 anos, hemorroidas grau III-IV, consentimento informado.',
    interpretation: 'Define população-alvo. Critérios muito restritos limitam generalização.',
    learnMoreUrl: '/dashboard/glossario#criterios-inclusao'
  },

  'criterios-exclusao': {
    term: 'Critérios de Exclusão',
    category: 'clinical',
    definition: 'Características que impedem participação no estudo por questões de segurança ou qualidade dos dados.',
    example: 'Exclusão: gravidez, coagulopatia, cirurgia anorretal prévia.',
    interpretation: 'Protege participantes e integridade do estudo. Afeta generalização dos resultados.',
    learnMoreUrl: '/dashboard/glossario#criterios-exclusao'
  },

  'desfecho-primario': {
    term: 'Desfecho Primário',
    category: 'clinical',
    definition: 'Principal variável de interesse do estudo, definida a priori. Determina tamanho amostral e análise principal.',
    example: 'Desfecho primário: dor na evacuação no 7º dia pós-operatório (EVA 0-10).',
    interpretation: 'Deve ser clinicamente relevante, mensurável e único. Múltiplos primários requerem ajuste de alfa.',
    learnMoreUrl: '/dashboard/glossario#desfecho-primario'
  },

  'desfecho-secundario': {
    term: 'Desfecho Secundário',
    category: 'clinical',
    definition: 'Variáveis adicionais de interesse que complementam o desfecho primário.',
    example: 'Secundários: complicações, satisfação, tempo de recuperação, retorno ao trabalho.',
    interpretation: 'Exploratórios mas importantes. Resultados devem ser interpretados com cautela devido a múltiplas comparações.',
    learnMoreUrl: '/dashboard/glossario#desfecho-secundario'
  },

  'seguimento': {
    term: 'Seguimento (Follow-up)',
    category: 'clinical',
    definition: 'Período de tempo durante o qual participantes são monitorados após intervenção.',
    example: 'Seguimento: 7, 30 e 90 dias pós-operatório com avaliação clínica e questionários.',
    interpretation: 'Seguimento adequado essencial para desfechos a longo prazo. Perda alta (>20%) compromete validade.',
    learnMoreUrl: '/dashboard/glossario#seguimento'
  },

  'fissura-anal': {
    term: 'Fissura Anal',
    category: 'medical',
    definition: 'Laceração longitudinal na mucosa do canal anal distal, geralmente na linha média posterior, causando dor intensa.',
    example: 'Fissura anal crônica com hipertonia esfincteriana tratada com esfincterotomia lateral.',
    interpretation: 'Aguda: tratamento conservador. Crônica (>6 semanas): considerar intervenção cirúrgica.',
    learnMoreUrl: '/dashboard/glossario#fissura-anal'
  },

  'abscesso-perianal': {
    term: 'Abscesso Perianal',
    category: 'medical',
    definition: 'Coleção de pus no espaço perianal ou periretal, geralmente originado de glândula anal infectada.',
    example: 'Abscesso isquiorretal requerendo drenagem cirúrgica urgente.',
    interpretation: 'Classificação por localização anatômica. Drenagem é urgência cirúrgica. Risco de evolução para fístula.',
    learnMoreUrl: '/dashboard/glossario#abscesso-perianal'
  },

  'estenose-anal': {
    term: 'Estenose Anal',
    category: 'medical',
    definition: 'Estreitamento patológico do canal anal que dificulta evacuação. Pode ser complicação cirúrgica.',
    example: 'Estenose pós-hemorroidectomia requerendo dilatação anal sob anestesia.',
    interpretation: 'Complicação tardia de cirurgias extensas. Prevenção: técnica adequada, não excisão excessiva de anodermo.',
    learnMoreUrl: '/dashboard/glossario#estenose-anal'
  },

  'incontinencia-fecal': {
    term: 'Incontinência Fecal',
    category: 'medical',
    definition: 'Perda involuntária de fezes ou gases. Complicação temida de cirurgias anorretais por lesão esfincteriana.',
    example: 'Incontinência para gases após fistulotomia transesfincteriana.',
    interpretation: 'Graus: gases, fezes líquidas, fezes sólidas. Impacto severo na qualidade de vida.',
    learnMoreUrl: '/dashboard/glossario#incontinencia-fecal'
  },

  'prolapso-hemorroidario': {
    term: 'Prolapso Hemorroidário',
    category: 'medical',
    definition: 'Protrusão de hemorroidas internas através do canal anal. Classificação de Goligher (graus I-IV).',
    example: 'Hemorroidas grau IV: prolapso permanente irredutível requerendo hemorroidectomia.',
    interpretation: 'Grau I-II: tratamento conservador. Grau III-IV: cirurgia geralmente indicada.',
    learnMoreUrl: '/dashboard/glossario#prolapso-hemorroidario'
  },

  'anestesia-geral': {
    term: 'Anestesia Geral',
    category: 'medical',
    definition: 'Estado de inconsciência induzido por fármacos para realização de procedimento cirúrgico sem dor ou memória.',
    example: 'Hemorroidectomia sob anestesia geral com intubação orotraqueal.',
    interpretation: 'Permite controle completo das vias aéreas. Risco de náuseas, vômitos, complicações respiratórias.',
    learnMoreUrl: '/dashboard/glossario#anestesia-geral'
  },

  'anestesia-raquidiana': {
    term: 'Anestesia Raquídiana (Espinal)',
    category: 'medical',
    definition: 'Bloqueio anestésico pela injeção de anestésico local no líquido cefalorraquidiano no espaço subaracnóideo.',
    example: 'Raquianestesia para cirurgia anorretal proporciona analgesia de T10 a S5.',
    interpretation: 'Rápido início, bloqueio denso. Riscos: hipotensão, cefaleia pós-punção, retenção urinária.',
    learnMoreUrl: '/dashboard/glossario#anestesia-raquidiana'
  },

  'anestesia-peridural': {
    term: 'Anestesia Peridural (Epidural)',
    category: 'medical',
    definition: 'Bloqueio anestésico pela injeção de anestésico local no espaço epidural, externo à dura-máter.',
    example: 'Peridural contínua para analgesia pós-operatória prolongada.',
    interpretation: 'Início mais lento que raquianestesia. Permite cateter para analgesia contínua.',
    learnMoreUrl: '/dashboard/glossario#anestesia-peridural'
  },

  'aines': {
    term: 'AINEs (Anti-inflamatórios Não Esteroidais)',
    category: 'medical',
    definition: 'Classe de medicamentos que reduzem inflamação, dor e febre por inibição de COX. Pilar da analgesia multimodal.',
    example: 'Cetoprofeno 100mg IV 12/12h para analgesia pós-operatória.',
    interpretation: 'Eficazes mas riscos: sangramento, úlcera gástrica, lesão renal. Usar com cautela em idosos.',
    learnMoreUrl: '/dashboard/glossario#aines'
  },

  'opioides': {
    term: 'Opioides',
    category: 'medical',
    definition: 'Classe de analgésicos que atuam em receptores opioides centrais e periféricos. Potentes para dor moderada-severa.',
    example: 'Morfina 10mg SC para dor pós-operatória severa.',
    interpretation: 'Eficazes mas efeitos adversos: constipação, náusea, sedação, dependência. Usar judiciosamente.',
    learnMoreUrl: '/dashboard/glossario#opioides'
  },

  'diabetes-mellitus': {
    term: 'Diabetes Mellitus',
    category: 'medical',
    definition: 'Doença metabólica caracterizada por hiperglicemia crônica. Importante comorbidade que afeta cicatrização e risco cirúrgico.',
    example: 'Diabetes tipo 2 descompensado (HbA1c 9.2%) requer otimização pré-operatória.',
    interpretation: 'Aumenta risco de infecção, deiscência e complicações. Controle glicêmico perioperatório crucial.',
    learnMoreUrl: '/dashboard/glossario#diabetes-mellitus'
  },

  'hipertensao': {
    term: 'Hipertensão Arterial',
    category: 'medical',
    definition: 'Elevação sustentada da pressão arterial (≥140/90 mmHg). Comorbidade comum que afeta risco cardiovascular perioperatório.',
    example: 'Hipertensão controlada com losartana 50mg/dia.',
    interpretation: 'Avaliar controle pré-operatório. Manter anti-hipertensivos no perioperatório. Risco de sangramento.',
    learnMoreUrl: '/dashboard/glossario#hipertensao'
  }
};

// Helper function to get tooltip content by term ID
export function getTooltipContent(termId: string): TooltipContent | null {
  return tooltipDatabase[termId] || null;
}

// Get all terms by category
export function getTooltipsByCategory(category: 'statistical' | 'medical' | 'clinical'): TooltipContent[] {
  return Object.values(tooltipDatabase).filter(item => item.category === category);
}

// Search tooltips
export function searchTooltips(query: string): TooltipContent[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(tooltipDatabase).filter(item =>
    item.term.toLowerCase().includes(lowerQuery) ||
    item.definition.toLowerCase().includes(lowerQuery)
  );
}
