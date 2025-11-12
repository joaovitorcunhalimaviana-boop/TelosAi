/**
 * Tutorial Steps Configuration
 * Defines all interactive tutorials for the Telos.AI platform
 */

import { DriveStep } from 'driver.js';

export type TutorialId =
  | 'dashboard-tour'
  | 'patient-registration'
  | 'research-creation'
  | 'statistical-analysis'
  | 'data-export'
  | 'patient-management'
  | 'research-assignment';

export interface TutorialMetadata {
  id: TutorialId;
  title: string;
  description: string;
  category: 'basico' | 'avancado' | 'estatisticas' | 'exportacao' | 'pesquisas';
  estimatedTime: number; // in minutes
  prerequisites?: TutorialId[];
}

export const tutorialMetadata: Record<TutorialId, TutorialMetadata> = {
  'dashboard-tour': {
    id: 'dashboard-tour',
    title: 'Tour pelo Dashboard',
    description: 'Conheça seu painel de controle e funcionalidades principais',
    category: 'basico',
    estimatedTime: 3,
  },
  'patient-registration': {
    id: 'patient-registration',
    title: 'Cadastro de Pacientes',
    description: 'Aprenda a cadastrar e gerenciar pacientes rapidamente',
    category: 'basico',
    estimatedTime: 2,
  },
  'patient-management': {
    id: 'patient-management',
    title: 'Gestão de Pacientes',
    description: 'Filtros, busca e acompanhamento de pacientes',
    category: 'basico',
    estimatedTime: 4,
    prerequisites: ['dashboard-tour'],
  },
  'research-creation': {
    id: 'research-creation',
    title: 'Criação de Pesquisas',
    description: 'Configure estudos clínicos com grupos e randomização',
    category: 'pesquisas',
    estimatedTime: 8,
    prerequisites: ['dashboard-tour'],
  },
  'research-assignment': {
    id: 'research-assignment',
    title: 'Adicionar Pacientes a Pesquisas',
    description: 'Atribua pacientes a grupos de pesquisa',
    category: 'pesquisas',
    estimatedTime: 3,
    prerequisites: ['research-creation'],
  },
  'statistical-analysis': {
    id: 'statistical-analysis',
    title: 'Análise Estatística',
    description: 'Interprete resultados, ANOVA, regressão e testes estatísticos',
    category: 'estatisticas',
    estimatedTime: 12,
    prerequisites: ['research-creation'],
  },
  'data-export': {
    id: 'data-export',
    title: 'Exportação de Dados',
    description: 'Exporte dados em múltiplos formatos com formatação APA',
    category: 'exportacao',
    estimatedTime: 5,
    prerequisites: ['statistical-analysis'],
  },
};

// ==================== DASHBOARD TOUR ====================
export const dashboardTourSteps: DriveStep[] = [
  {
    element: '#dashboard-header',
    popover: {
      title: '👋 Bem-vindo ao Telos.AI',
      description: 'Este é seu painel de controle médico. Aqui você acompanha todos os seus pacientes em tempo real e gerencia pesquisas clínicas.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="stats-today-surgeries"]',
    popover: {
      title: '📅 Cirurgias de Hoje',
      description: 'Acompanhe quantos pacientes foram operados hoje. Esta métrica atualiza automaticamente.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tutorial="stats-active-patients"]',
    popover: {
      title: '👥 Pacientes Ativos',
      description: 'Total de pacientes em acompanhamento pós-operatório ativo. Inclui todos os pacientes com follow-ups pendentes.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tutorial="stats-followups-today"]',
    popover: {
      title: '⏰ Follow-ups Hoje',
      description: 'Quantidade de questionários agendados para hoje. A IA enviará automaticamente via WhatsApp.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tutorial="stats-critical-alerts"]',
    popover: {
      title: '🚨 Alertas Críticos',
      description: 'Red flags identificados pela IA que requerem sua atenção imediata. Clique no paciente para ver detalhes.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tutorial="search-filters"]',
    popover: {
      title: '🔍 Busca e Filtros',
      description: 'Use esta seção para encontrar pacientes específicos. Você pode filtrar por tipo de cirurgia, completude de dados, período e participação em pesquisas.',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="patient-card"]',
    popover: {
      title: '📋 Cartão do Paciente',
      description: 'Cada cartão mostra informações essenciais: nome, tipo de cirurgia, dia de follow-up, completude de dados e alertas. Use os botões para contato rápido via WhatsApp ou telefone.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="new-patient-btn"]',
    popover: {
      title: '➕ Cadastrar Novo Paciente',
      description: 'Clique aqui para iniciar um cadastro expresso. Em apenas 30 segundos você ativa o acompanhamento automatizado!',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '[data-tutorial="research-btn"]',
    popover: {
      title: '🧪 Pesquisas Clínicas',
      description: 'Acesse esta área para criar e gerenciar estudos clínicos, comparar grupos e realizar análises estatísticas avançadas.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    popover: {
      title: '✅ Tour Completo!',
      description: 'Você concluiu o tour pelo dashboard! Explore à vontade e lembre-se: você pode acessar este tutorial novamente clicando no ícone (?) no cabeçalho.',
    },
  },
];

// ==================== PATIENT REGISTRATION ====================
export const patientRegistrationSteps: DriveStep[] = [
  {
    element: '#registration-header',
    popover: {
      title: '⚡ Cadastro Express',
      description: 'Este formulário foi projetado para cadastrar pacientes em apenas 30 segundos. Preencha apenas os dados essenciais e o sistema faz o resto!',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="patient-name"]',
    popover: {
      title: '📝 Nome Completo',
      description: 'Digite o nome completo do paciente. Este será usado para personalizar mensagens automáticas.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="patient-phone"]',
    popover: {
      title: '📱 WhatsApp',
      description: 'Número para envio dos questionários automáticos. Digite com DDD. A IA enviará follow-ups nos dias D+1, D+2, D+3, D+5, D+7, D+10 e D+14.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="surgery-type"]',
    popover: {
      title: '🏥 Tipo de Cirurgia',
      description: 'Selecione o procedimento realizado. Isso personaliza os questionários e métricas de acompanhamento.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="surgery-date"]',
    popover: {
      title: '📅 Data da Cirurgia',
      description: 'Defina quando o procedimento foi realizado. Os follow-ups serão automaticamente agendados a partir desta data.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="submit-btn"]',
    popover: {
      title: '🚀 Ativar Acompanhamento',
      description: 'Ao clicar, o paciente será cadastrado com 20% de completude. Você poderá completar os 80% restantes depois. Follow-ups automáticos serão ativados imediatamente!',
      side: 'top',
      align: 'center',
    },
  },
  {
    popover: {
      title: '✅ Pronto para Cadastrar!',
      description: 'Agora você sabe como usar o Cadastro Express. É rápido, simples e eficiente. Após o cadastro, você pode adicionar o paciente a pesquisas ou completar dados adicionais.',
    },
  },
];

// ==================== PATIENT MANAGEMENT ====================
export const patientManagementSteps: DriveStep[] = [
  {
    element: '[data-tutorial="search-input"]',
    popover: {
      title: '🔍 Busca Inteligente',
      description: 'Digite o nome ou telefone do paciente. A busca é instantânea e funciona com termos parciais.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="filter-surgery-type"]',
    popover: {
      title: '🏥 Filtrar por Cirurgia',
      description: 'Visualize apenas pacientes de um tipo específico de cirurgia (hemorroidectomia, fístula, etc.).',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="filter-data-status"]',
    popover: {
      title: '📊 Status do Cadastro',
      description: 'Filtre pacientes com cadastro incompleto para priorizar a completude de dados. "Pesquisa - Dados Incompletos" mostra participantes de pesquisa que precisam de mais informações.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="filter-period"]',
    popover: {
      title: '📅 Filtrar por Período',
      description: 'Veja apenas pacientes operados hoje, nos últimos 7 dias ou 30 dias. Útil para acompanhamento cronológico.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="filter-research"]',
    popover: {
      title: '🧪 Filtro de Pesquisas',
      description: 'Visualize pacientes por pesquisa específica ou veja apenas "Não participantes" para identificar candidatos a incluir em estudos.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="patient-completeness"]',
    popover: {
      title: '📈 Completude de Dados',
      description: 'Esta barra gamificada mostra o percentual de dados preenchidos. Verde = 80%+, Amarelo = 40-79%, Vermelho = <40%. Complete 100% para desbloquear análises avançadas!',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tutorial="quick-actions"]',
    popover: {
      title: '💬 Ações Rápidas',
      description: 'Botões de contato direto: WhatsApp abre conversa pré-formatada, Telefone inicia chamada. Perfeito para follow-up manual quando necessário.',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tutorial="patient-actions"]',
    popover: {
      title: '🎯 Ações do Paciente',
      description: '"Ver Detalhes" abre prontuário completo. "Completar Cadastro" leva ao formulário de edição. "Adicionar à Pesquisa" permite incluir em estudos.',
      side: 'left',
      align: 'center',
    },
  },
  {
    popover: {
      title: '✅ Gestão Dominada!',
      description: 'Você agora sabe filtrar, buscar e gerenciar pacientes eficientemente. Use os filtros combinados para criar visualizações personalizadas!',
    },
  },
];

// ==================== RESEARCH CREATION ====================
export const researchCreationSteps: DriveStep[] = [
  {
    element: '#research-list',
    popover: {
      title: '🧪 Central de Pesquisas',
      description: 'Aqui você gerencia todos os seus estudos clínicos. Crie pesquisas randomizadas, compare grupos e gere publicações científicas.',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="create-research-btn"]',
    popover: {
      title: '➕ Criar Nova Pesquisa',
      description: 'Clique aqui para iniciar a criação de um novo estudo clínico.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="research-title"]',
    popover: {
      title: '📝 Título da Pesquisa',
      description: 'Escolha um título descritivo e científico. Ex: "Comparação entre Técnica Convencional vs Laser em Hemorroidectomia"',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="research-description"]',
    popover: {
      title: '📄 Descrição',
      description: 'Descreva objetivos, metodologia e endpoints. Esta informação aparecerá em relatórios e exportações.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="research-groups"]',
    popover: {
      title: '👥 Grupos de Estudo',
      description: 'Defina os grupos (A, B, C, etc.). Para cada grupo: código, nome e descrição do protocolo. Ex: Grupo A = Técnica Convencional, Grupo B = Técnica Laser',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="sample-size"]',
    popover: {
      title: '📊 Tamanho da Amostra',
      description: 'Defina quantos pacientes deseja em cada grupo. O sistema alertará quando atingir o número planejado.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="randomization"]',
    popover: {
      title: '🎲 Randomização',
      description: 'Escolha: Simples (aleatória pura), Por Blocos (garante equilíbrio) ou Estratificada (por características). Randomização científica adequada!',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="endpoints"]',
    popover: {
      title: '🎯 Desfechos (Endpoints)',
      description: 'Configure desfechos primários e secundários: dor, sangramento, retorno às atividades, satisfação, etc. Essenciais para análise estatística.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="activate-research"]',
    popover: {
      title: '✅ Ativar Pesquisa',
      description: 'Após salvar, ative a pesquisa para começar a incluir pacientes. Pesquisas inativas não aparecem nas opções de atribuição.',
      side: 'top',
      align: 'center',
    },
  },
  {
    popover: {
      title: '🎉 Pesquisa Criada com Sucesso!',
      description: 'Agora você pode adicionar pacientes aos grupos, acompanhar progresso e realizar análises estatísticas. Explore a página de comparação para ver resultados!',
    },
  },
];

// ==================== RESEARCH ASSIGNMENT ====================
export const researchAssignmentSteps: DriveStep[] = [
  {
    element: '[data-tutorial="assign-to-research-btn"]',
    popover: {
      title: '🧪 Adicionar à Pesquisa',
      description: 'Este botão permite incluir um paciente em um estudo clínico ativo.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="select-research"]',
    popover: {
      title: '📋 Selecionar Pesquisa',
      description: 'Escolha em qual pesquisa ativa deseja incluir o paciente. Apenas pesquisas ativadas aparecem aqui.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="select-group"]',
    popover: {
      title: '👥 Selecionar Grupo',
      description: 'Escolha o grupo de alocação (A, B, C, etc.). Se estiver usando randomização, o sistema sugerirá automaticamente.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="research-notes"]',
    popover: {
      title: '📝 Observações',
      description: 'Campo opcional para anotar motivos de inclusão, critérios específicos ou observações relevantes para o estudo.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    popover: {
      title: '✅ Paciente Adicionado!',
      description: 'Pronto! O paciente agora faz parte da pesquisa. Um badge roxo "Grupo X" aparecerá no cartão dele. Complete os dados obrigatórios para pesquisa para habilitar análises.',
    },
  },
];

// ==================== STATISTICAL ANALYSIS ====================
export const statisticalAnalysisSteps: DriveStep[] = [
  {
    element: '#comparison-page',
    popover: {
      title: '📊 Análise Estatística Avançada',
      description: 'Esta é a central de análise da sua pesquisa. Aqui você encontra estatísticas descritivas, testes inferenciais e visualizações científicas.',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="tabs-overview"]',
    popover: {
      title: '📑 Abas de Análise',
      description: 'Navegue entre: Visão Geral (resumo), Estatísticas Descritivas, Comparação de Grupos, Regressão, Sobrevida e Relatório Executivo.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="overview-summary"]',
    popover: {
      title: '📈 Visão Geral',
      description: 'Dashboard resumido com total de pacientes, distribuição por grupo, taxa de completude e principais desfechos. Ideal para apresentações rápidas.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="anova-results"]',
    popover: {
      title: '🧮 Resultados ANOVA',
      description: 'ANOVA (Analysis of Variance) compara médias entre 3+ grupos. **F-statistic** mede variância entre grupos. **p-value** indica significância (p<0.05 = significativo).',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="p-value-interpretation"]',
    popover: {
      title: '📌 Interpretando p-values',
      description: '**p < 0.001**: Altamente significativo (***)\n**p < 0.01**: Muito significativo (**)\n**p < 0.05**: Significativo (*)\n**p ≥ 0.05**: Não significativo (ns)',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tutorial="post-hoc-tests"]',
    popover: {
      title: '🔍 Testes Post-Hoc',
      description: 'Quando ANOVA é significativa, testes post-hoc (Tukey, Bonferroni) identificam **quais pares de grupos diferem**. Essencial para conclusões específicas!',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="effect-size"]',
    popover: {
      title: '💪 Tamanho do Efeito (Effect Size)',
      description: '**Cohen\'s d** mede magnitude da diferença:\n• d=0.2: pequeno\n• d=0.5: médio\n• d=0.8: grande\nSignificância estatística ≠ relevância clínica!',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tutorial="regression-analysis"]',
    popover: {
      title: '📉 Análise de Regressão',
      description: 'Regressão Linear/Logística identifica preditores de desfechos. **R²** = quanto da variação é explicada (0-1). **Coeficientes** mostram direção e força da relação.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="kaplan-meier"]',
    popover: {
      title: '⏱️ Curvas de Kaplan-Meier',
      description: 'Análise de sobrevida/tempo-até-evento. Útil para: tempo até retorno ao trabalho, recorrência, complicações. **Log-rank test** compara curvas.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="export-results"]',
    popover: {
      title: '💾 Exportar Resultados',
      description: 'Exporte gráficos, tabelas e estatísticas em formatos: PDF, Excel, CSV, SPSS. Formatação automática em estilo APA para publicações.',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tutorial="apa-formatting"]',
    popover: {
      title: '📝 Formato APA',
      description: 'Todas as estatísticas seguem APA 7th edition: "F(2, 57) = 4.32, p = .018, η² = .13". Copie e cole direto no seu manuscrito!',
      side: 'left',
      align: 'center',
    },
  },
  {
    popover: {
      title: '🎓 Análise Estatística Completa!',
      description: 'Você agora entende ANOVA, testes post-hoc, tamanho de efeito, regressão e curvas de sobrevida. Use essas ferramentas para gerar publicações de qualidade!',
    },
  },
];

// ==================== DATA EXPORT ====================
export const dataExportSteps: DriveStep[] = [
  {
    element: '#export-page',
    popover: {
      title: '💾 Exportação de Dados',
      description: 'Central para exportar dados da pesquisa em múltiplos formatos profissionais.',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="export-format"]',
    popover: {
      title: '📄 Formatos Disponíveis',
      description: '**PDF**: Relatório executivo visual\n**Excel**: Análise e gráficos\n**CSV**: Dados brutos\n**SPSS**: Arquivo .sav para análise estatística\n**Word**: Tabelas formatadas APA',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="export-options"]',
    popover: {
      title: '⚙️ Opções de Exportação',
      description: 'Personalize: incluir/excluir dados demográficos, estatísticas descritivas, testes inferenciais, gráficos, dados brutos.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tutorial="apa-citation"]',
    popover: {
      title: '📚 Citação Automática',
      description: 'Gera citação formatada APA 7th: "Viana, J. V. (2025). Título da Pesquisa. Sistema Telos.AI, v1.0."',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tutorial="download-btn"]',
    popover: {
      title: '⬇️ Download',
      description: 'Clique para gerar e baixar o arquivo. Processamento pode levar alguns segundos para pesquisas grandes.',
      side: 'top',
      align: 'center',
    },
  },
  {
    popover: {
      title: '✅ Pronto para Exportar!',
      description: 'Agora você sabe exportar dados profissionalmente formatados. Use PDF para apresentações, Excel para análises, CSV para softwares externos e SPSS para estatísticas avançadas.',
    },
  },
];

// Helper to get steps by tutorial ID
export function getTutorialSteps(tutorialId: TutorialId): DriveStep[] {
  const stepsMap: Record<TutorialId, DriveStep[]> = {
    'dashboard-tour': dashboardTourSteps,
    'patient-registration': patientRegistrationSteps,
    'patient-management': patientManagementSteps,
    'research-creation': researchCreationSteps,
    'research-assignment': researchAssignmentSteps,
    'statistical-analysis': statisticalAnalysisSteps,
    'data-export': dataExportSteps,
  };

  return stepsMap[tutorialId] || [];
}
