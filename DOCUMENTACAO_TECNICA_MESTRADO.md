# TELOS.AI - Documentação Técnica COMPLETA para Mestrado

## Sistema de Acompanhamento Pós-Operatório com Inteligência Artificial

**Autor:** Dr. João Vitor Viana
**Versão:** 2.0 (Expandida)
**Data:** Novembro 2025
**Projeto de Mestrado:** Ciência Cirúrgica Interdisciplinar - UNIFESP

---

## SUMÁRIO COMPLETO

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Arquitetura Técnica](#2-arquitetura-técnica)
3. [Variáveis Clínicas Coletadas](#3-variáveis-clínicas-coletadas)
4. [Sistema de Machine Learning](#4-sistema-de-machine-learning)
5. [Sistema de Inteligência Artificial Conversacional](#5-sistema-de-inteligência-artificial-conversacional)
6. [Sistema de Protocolos Personalizados](#6-sistema-de-protocolos-personalizados)
7. [Sistema de Termos e Consentimento (TCLE)](#7-sistema-de-termos-e-consentimento-tcle)
8. [Sistema de Inteligência Coletiva](#8-sistema-de-inteligência-coletiva)
9. [Sistema de Anonimização (SHA-256)](#9-sistema-de-anonimização-sha-256)
10. [Modo Pesquisa](#10-modo-pesquisa)
11. [Questionários Detalhados por Dia](#11-questionários-detalhados-por-dia)
12. [Sistema de Análise de Satisfação e NPS](#12-sistema-de-análise-de-satisfação-e-nps)
13. [Análises Estatísticas](#13-análises-estatísticas)
14. [Sistema de Exportação](#14-sistema-de-exportação)
15. [Fluxo de Follow-up via WhatsApp](#15-fluxo-de-follow-up-via-whatsapp)
16. [Detecção de Red Flags](#16-detecção-de-red-flags)
17. [Sistema de Notificações em Tempo Real](#17-sistema-de-notificações-em-tempo-real)
18. [Sistema de Backup e Recuperação](#18-sistema-de-backup-e-recuperação)
19. [Dashboard e Todas as Páginas do Sistema](#19-dashboard-e-todas-as-páginas-do-sistema)
20. [Conformidade LGPD](#20-conformidade-lgpd)
21. [Sugestões de Variáveis para o Mestrado](#21-sugestões-de-variáveis-para-o-mestrado)
22. [Sugestões para o Vídeo do Site](#22-sugestões-para-o-vídeo-do-site)

---

## 1. VISÃO GERAL DO SISTEMA

### 1.1 O que é o Telos.AI

O Telos.AI é uma plataforma digital de acompanhamento pós-operatório que utiliza:
- **Inteligência Artificial Conversacional** (Claude Sonnet 4.5 da Anthropic)
- **Machine Learning Preditivo** para cálculo de risco
- **Integração WhatsApp** para comunicação automatizada com pacientes
- **Sistema de Inteligência Coletiva** para aprendizado entre médicos
- **Protocolos Personalizados** que a IA utiliza para orientar pacientes
- **Sistema de Pesquisa Científica** com análises estatísticas completas

### 1.2 Especialização Atual

Cirurgias orificiais/anorretais:
- **Hemorroidectomia**
- **Fistulotomia/Fistulectomia**
- **Fissurectomia**
- **Cisto Pilonidal**

### 1.3 Dias de Follow-up

O sistema acompanha pacientes em **7 momentos específicos** pós-operatórios:
- D+1 (primeiro dia)
- D+2 (segundo dia)
- D+3 (terceiro dia)
- D+5 (quinto dia)
- D+7 (sétima dia)
- D+10 (décimo dia)
- D+14 (décimo quarto dia - inclui avaliação de satisfação)

---

## 2. ARQUITETURA TÉCNICA

### 2.1 Stack Tecnológico

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | Next.js 16, React 18, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Node.js |
| **Banco de Dados** | PostgreSQL + Prisma ORM (Neon) |
| **IA Conversacional** | Claude Sonnet 4.5 (Anthropic API) |
| **Machine Learning** | Random Forest + Gradient Boosting |
| **Mensageria** | Meta WhatsApp Business API |
| **Gráficos** | Recharts |
| **Exportação** | XLSX, CSV, PDF (jsPDF), DOCX |
| **Notificações** | SSE (Server-Sent Events) + Web Push API |
| **Backup** | Neon Branch-Based Snapshots |
| **Hospedagem** | Vercel (Frontend/API) |

### 2.2 Diagrama de Fluxo Principal

```
┌─────────────────────────────────────────────────────────────────┐
│                        CADASTRO                                  │
│  Médico cadastra paciente → Sistema cria 7 follow-ups           │
│  → Termo de consentimento gerado automaticamente                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CRON JOB (10:00 BRT)                          │
│  Sistema envia template WhatsApp nos dias programados           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PACIENTE RESPONDE                             │
│  Webhook recebe mensagem → Claude AI conduz conversa            │
│  → IA carrega protocolos personalizados do médico               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ANÁLISE AUTOMÁTICA                            │
│  1. Detecção de Red Flags (determinística)                      │
│  2. Análise com Claude AI (contextual + protocolos)             │
│  3. Predição ML (risco de complicação)                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    NOTIFICAÇÕES EM TEMPO REAL                    │
│  SSE para app aberto + Web Push para app fechado                │
│  Sons de alerta para casos críticos                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DASHBOARD DO MÉDICO                           │
│  Alertas, gráficos, exportação, pesquisa, estatísticas          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. VARIÁVEIS CLÍNICAS COLETADAS

### 3.1 Contagem Total de Variáveis

**O sistema coleta 51+ variáveis clínicas por paciente**, divididas em:

### 3.2 Variáveis de Entrada (Coleta via WhatsApp)

| # | ID da Variável | Nome PT-BR | Tipo | Escala/Valores | Dias |
|---|----------------|------------|------|----------------|------|
| 1 | `painAtRest` | Dor em repouso | Numérico | 0-10 (EVA) | Todos |
| 2 | `painDuringBowelMovement` | Dor durante evacuação | Numérico | 0-10 (EVA) | Todos |
| 3 | `painComparison` | Comparação com dia anterior | Categórico | melhor/igual/pior | Todos |
| 4 | `hasFever` | Presença de febre | Booleano | sim/não | Todos |
| 5 | `feverTemperature` | Temperatura | Numérico | °C | Se febre |
| 6 | `hadBowelMovementSinceLastContact` | Evacuou desde último contato | Booleano | sim/não | Todos |
| 7 | `bowelMovementTime` | Horário da evacuação | Texto | HH:MM | Se evacuou |
| 8 | `bristolScale` | Escala de Bristol | Numérico | 1-7 | D+5, D+7, D+10, D+14 |
| 9 | `bleeding` | Sangramento | Categórico | none/mild/moderate/severe | Todos |
| 10 | `bleedingDetails` | Detalhes do sangramento | Texto | Descrição | Se sangramento |
| 11 | `urination` | Conseguiu urinar | Booleano | sim/não | D+1, D+2 |
| 12 | `urinationIssues` | Problemas de micção | Texto | Descrição | Se problemas |
| 13 | `takingPrescribedMeds` | Tomando medicações prescritas | Booleano | sim/não | Todos |
| 14 | `prescribedMedsDetails` | Detalhes das medicações | Texto | Descrição | Detalhes |
| 15 | `takingExtraMeds` | Tomando medicações extras | Booleano | sim/não | Todos |
| 16 | `extraMedsDetails` | Quais medicações extras | Texto | Quais | Se sim |
| 17 | `hasPurulentDischarge` | Secreção purulenta | Booleano | sim/não | D+3+ |
| 18 | `purulentDischargeDetails` | Detalhes da secreção | Texto | Descrição | Se sim |
| 19 | `activityLevel` | Nível de atividade | Texto | Descrição | Todos |
| 20 | `concerns` | Outras preocupações | Texto | Livre | Todos |
| 21 | `painControlSatisfaction` | Satisfação com controle da dor | Numérico | 0-10 | D+14 |
| 22 | `aiFollowUpSatisfaction` | Satisfação com acompanhamento IA | Numérico | 0-10 | D+14 |
| 23 | `npsScore` | Net Promoter Score | Numérico | 0-10 | D+14 |
| 24 | `feedback` | Feedback livre | Texto | Livre | D+14 |

### 3.3 Variáveis Demográficas e Cirúrgicas

| # | Variável | Tipo | Descrição |
|---|----------|------|-----------|
| 25 | `age` | Numérico | Idade em anos |
| 26 | `sex` | Categórico | Masculino/Feminino/Outro |
| 27 | `surgeryType` | Categórico | Tipo de cirurgia |
| 28 | `surgeryDate` | Data | Data da cirurgia |
| 29 | `hospital` | Texto | Nome do hospital |
| 30 | `durationMinutes` | Numérico | Duração da cirurgia |
| 31 | `comorbidities` | Lista | Comorbidades do paciente |
| 32 | `comorbidityCount` | Numérico | Quantidade de comorbidades |
| 33 | `medications` | Lista | Medicações em uso |
| 34 | `medicationCount` | Numérico | Quantidade de medicações |

### 3.4 Variáveis de Anestesia

| # | Variável | Tipo | Descrição |
|---|----------|------|-----------|
| 35 | `anesthesiaType` | Categórico | Raqui/Geral/Sedação/Local |
| 36 | `pudendalBlock` | Booleano | Bloqueio do pudendo |
| 37 | `pudendalTechnique` | Texto | Técnica utilizada |
| 38 | `anesthetic` | Texto | Anestésico utilizado |

### 3.5 Variáveis de Saída (Calculadas pelo Sistema)

| # | Variável | Tipo | Descrição |
|---|----------|------|-----------|
| 39 | `riskLevel` | Categórico | low/medium/high/critical |
| 40 | `redFlags` | Lista | Red flags detectados |
| 41 | `doctorAlerted` | Booleano | Se médico foi alertado |
| 42 | `aiAnalysis` | JSON | Análise completa da IA |
| 43 | `predictedRisk` | Numérico | 0.0-1.0 (probabilidade) |
| 44 | `dataCompleteness` | Numérico | % de preenchimento |

### 3.6 Índices Calculados

| # | Índice | Fórmula/Descrição |
|---|--------|-------------------|
| 45 | `painAverage` | Média de dor no período |
| 46 | `painMax` | Dor máxima registrada |
| 47 | `painSD` | Desvio padrão da dor |
| 48 | `painTrajectory` | Tendência (melhorando/estável/piorando) |
| 49 | `adherenceRate` | % de follow-ups respondidos |
| 50 | `firstBowelMovementDay` | Dia da primeira evacuação |
| 51 | `npsCategory` | Promotor/Passivo/Detrator |

**TOTAL: 51+ variáveis rastreáveis por paciente**

---

## 4. SISTEMA DE MACHINE LEARNING

### 4.1 Arquitetura

O sistema ML funciona como um **serviço não-bloqueante**:

```
Dados do Paciente → API Python (ML_API_URL) → Score de Risco → Dashboard
                         ↓
              Se API falhar: sistema continua funcionando
              (fallback determinístico baseado em red flags)
```

### 4.2 Variáveis de Entrada do Modelo

```typescript
interface MLPredictionInput {
  age: number | null;
  sex: string | null;
  surgeryType: string;  // hemorroidectomia, fistula, fissura, pilonidal
  hasComorbidities: boolean;
  comorbidityCount: number;
  medicationCount: number;
  // + dados dinâmicos do follow-up atual
}
```

### 4.3 Algoritmos Utilizados

- **Random Forest**: Ensemble de árvores de decisão
- **Gradient Boosting**: Boosting sequencial para melhoria iterativa

### 4.4 Thresholds de Classificação

```typescript
const RISK_THRESHOLDS = {
  LOW: 0.3,     // 0.0 - 0.3 = baixo risco (verde)
  MEDIUM: 0.6,  // 0.3 - 0.6 = médio risco (amarelo)
  // > 0.6 = alto risco (vermelho)
}
```

### 4.5 Saída do Modelo

```typescript
interface MLPredictionResult {
  risk: number;                  // 0.0 a 1.0
  level: 'low' | 'medium' | 'high';
  features: {
    importance: Record<string, number>;  // Importância de cada variável
    values: Record<string, any>;
  };
  modelVersion: string;
  timestamp: Date;
}
```

### 4.6 Localização do Código

- **API Route**: `/app/api/ml/predict/route.ts`
- **Biblioteca**: `/lib/ml-prediction.ts`

---

## 5. SISTEMA DE INTELIGÊNCIA ARTIFICIAL CONVERSACIONAL

### 5.1 Modelo Utilizado

- **Modelo Principal**: Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
- **Provider**: Anthropic API
- **Temperature**: 0.3 (baixa para consistência)

### 5.2 Como a IA Carrega e Usa Protocolos

A IA carrega protocolos personalizados do médico **dinamicamente** antes de cada análise:

```typescript
// Arquivo: /lib/claude-analyzer.ts
async function analyzeFollowUp(followUp, surgery, protocols) {
  // 1. Filtra protocolos relevantes para o dia e tipo de cirurgia
  const relevantProtocols = protocols.filter(p =>
    p.surgeryType === surgery.type &&
    p.startDay <= followUp.dayNumber &&
    (p.endDay === null || p.endDay >= followUp.dayNumber)
  );

  // 2. Injeta protocolos no prompt da IA
  const systemPrompt = `
    Você é um assistente médico especializado em pós-operatório.

    PROTOCOLOS DO MÉDICO PARA ESTE PACIENTE:
    ${relevantProtocols.map(p => `
      Categoria: ${p.category}
      Dias: D+${p.startDay} até D+${p.endDay || 'indefinido'}
      Orientação: ${p.content}
    `).join('\n')}

    Use estes protocolos para orientar o paciente conforme as preferências do médico.
  `;

  // 3. Claude analisa e responde seguindo os protocolos
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    system: systemPrompt,
    messages: [/* conversa */]
  });
}
```

### 5.3 Funções da IA

#### 5.3.1 Condução do Questionário

A IA conduz uma conversa estruturada coletando dados em ordem específica:

```
1. Dor em repouso (EVA 0-10) + imagem da escala
2. Febre (sim/não → temperatura se sim)
3. Evacuação (sim/não → horário → Bristol se D+5/D+7/D+10/D+14)
4. Dor durante evacuação (EVA 0-10)
5. Sangramento (none/mild/moderate/severe)
6. Micção (D+1, D+2 apenas)
7. Medicações (prescritas → extras)
8. Secreção purulenta (D+3+)
9. Outras preocupações
10. Satisfação e NPS (D+14 apenas)
```

#### 5.3.2 Análise de Respostas

```typescript
interface AnalysisResult {
  status: 'NORMAL' | 'ATENÇÃO' | 'URGENTE' | 'EMERGÊNCIA';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  redFlags: string[];
  analise: string;  // Análise clínica detalhada
  raciocinioClinico: string;  // Explicação do raciocínio
  recomendacoes: string[];
  respostaEmpática: string;  // Mensagem para o paciente
  alertarMedico: boolean;
  urgencia: 'baixa' | 'média' | 'alta' | 'crítica';
}
```

#### 5.3.3 Prompt Caching

O sistema utiliza **prompt caching** para reduzir custos em 90%:
- Cache de 5 minutos para contextos repetidos
- Few-shot examples pré-carregados

### 5.4 Localização do Código

- **Integração Anthropic**: `/lib/anthropic.ts`
- **Analisador Claude**: `/lib/claude-analyzer.ts`
- **IA Conversacional**: `/lib/conversational-ai.ts`
- **Follow-up Analyzer**: `/lib/follow-up-analyzer.ts`
- **AI Prompts**: `/lib/ai-prompts.ts`

---

## 6. SISTEMA DE PROTOCOLOS PERSONALIZADOS

### 6.1 Conceito

Protocolos são **orientações personalizadas** que cada médico configura. A IA utiliza esses protocolos para:
1. Orientar pacientes de forma consistente
2. Responder dúvidas seguindo as preferências do médico
3. Fornecer instruções específicas por tipo de cirurgia e dia pós-operatório

### 6.2 Estrutura de um Protocolo

```typescript
interface Protocol {
  id: string;
  userId: string;              // Médico dono do protocolo
  surgeryType: string | null;  // null = todos os tipos
  category: ProtocolCategory;  // Categoria da orientação
  startDay: number;            // Dia inicial (ex: 1 para D+1)
  endDay: number | null;       // null = indefinido
  content: string;             // Texto da orientação
  isActive: boolean;
  researchId: string | null;   // Se específico para uma pesquisa
}
```

### 6.3 Categorias de Protocolos

| Categoria | ID | Descrição |
|-----------|-----|-----------|
| **Banho** | `banho` | Orientações sobre higiene corporal |
| **Medicação** | `medicacao` | Instruções de medicamentos |
| **Alimentação** | `alimentacao` | Dieta e alimentação |
| **Atividade Física** | `atividade_fisica` | Exercícios e movimentação |
| **Higiene Local** | `higiene` | Cuidados com a ferida |
| **Sintomas Normais** | `sintomas_normais` | O que esperar |

### 6.4 Exemplo de Protocolos

```
Médico: Dr. João
Tipo: Hemorroidectomia
Categoria: banho
Dias: D+1 até D+7
Conteúdo: "Pode tomar banho normalmente. Após evacuação,
           realizar banho de assento com água morna por
           10-15 minutos. Secar a região com toalha limpa
           fazendo movimentos suaves, sem esfregar."

---

Médico: Dr. João
Tipo: Hemorroidectomia
Categoria: medicacao
Dias: D+1 até D+14
Conteúdo: "Tomar Tramal 50mg de 8/8h se dor moderada (5-7).
           Se dor intensa (8-10), pode associar Dipirona 1g.
           Não suspender o laxativo até o retorno."
```

### 6.5 Como a IA Usa os Protocolos

```
Paciente pergunta: "Posso tomar banho?"
                      ↓
IA busca protocolo de "banho" para o tipo de cirurgia e dia atual
                      ↓
Se encontrar → Responde com o protocolo do médico
Se não encontrar → Usa orientação genérica + sugere contato
```

### 6.6 Protocolos de Pesquisa

Protocolos podem ser **específicos de uma pesquisa científica**:
- `researchId` vincula o protocolo à pesquisa
- Diferentes grupos podem ter protocolos diferentes
- Permite comparar outcomes de diferentes protocolos

### 6.7 Localização do Código

- **API CRUD**: `/app/api/protocolos/route.ts`
- **Dashboard**: `/app/dashboard/protocolos/page.tsx`
- **Uso na IA**: `/lib/claude-analyzer.ts`
- **Schema**: `Protocol` model no `prisma/schema.prisma`

---

## 7. SISTEMA DE TERMOS E CONSENTIMENTO (TCLE)

### 7.1 Visão Geral

O sistema gera automaticamente Termos de Consentimento Livre e Esclarecido (TCLE) para:
1. Uso do aplicativo e acompanhamento por WhatsApp
2. Participação em pesquisas científicas
3. Compartilhamento de dados anonimizados

### 7.2 Tipos de Termos

| Tipo | ID | Uso |
|------|-----|-----|
| **Consentimento Geral** | `consentimento_geral` | Uso básico do sistema |
| **Tratamento de Dados** | `tratamento_dados` | LGPD compliance |
| **Pesquisa** | `pesquisa` | Participação em estudos |
| **Telemedicina** | `telemedicina` | Orientações via IA |
| **Imagem** | `imagem` | Uso de fotos/vídeos |
| **Compartilhamento** | `compartilhamento` | Dados com outros médicos |

### 7.3 Estrutura do Termo

```typescript
interface ConsentTerm {
  id: string;
  patientId: string;
  type: ConsentTermType;
  version: string;
  content: string;           // HTML completo do termo
  acceptedAt: DateTime;
  signatureMethod: string;   // 'whatsapp' | 'digital' | 'physical'
  ipAddress: string | null;
  userAgent: string | null;
  pdfUrl: string | null;     // PDF gerado
}
```

### 7.4 Fluxo de Consentimento

```
1. Paciente cadastrado no sistema
                ↓
2. Sistema gera TCLE personalizado (nome, CPF, procedimento)
                ↓
3. Primeiro contato WhatsApp solicita aceite
                ↓
4. Paciente responde "sim, aceito"
                ↓
5. Sistema registra: data, hora, método, IP (se web)
                ↓
6. PDF do termo é gerado e armazenado
                ↓
7. Paciente pode solicitar cópia a qualquer momento
```

### 7.5 Template do TCLE

O termo inclui:
- **Identificação:** Nome, CPF, data de nascimento
- **Procedimento:** Tipo de cirurgia, data, hospital
- **Objetivo:** Explicação do acompanhamento por IA
- **Privacidade:** Como os dados são protegidos
- **Direitos:** Revogar consentimento, solicitar exclusão
- **Pesquisa:** Se aplicável, detalhes do estudo

### 7.6 Geração de PDF

```typescript
// Arquivo: /lib/consent-term-template.ts
function generateConsentTermPDF(patient, surgery, type) {
  const html = `
    <html>
      <head>
        <style>/* Estilos profissionais */</style>
      </head>
      <body>
        <header>
          <h1>TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO</h1>
          <p>Acompanhamento Pós-Operatório com Inteligência Artificial</p>
        </header>

        <section>
          <h2>IDENTIFICAÇÃO DO PACIENTE</h2>
          <p>Nome: ${patient.name}</p>
          <p>CPF: ${maskCPF(patient.cpf)}</p>
          <p>Procedimento: ${surgery.type}</p>
        </section>

        <section>
          <h2>OBJETIVO</h2>
          <p>Este termo autoriza o uso do sistema Telos.AI para...</p>
        </section>

        <!-- Mais seções -->

        <footer>
          <p>Aceito em: ${new Date().toLocaleString('pt-BR')}</p>
          <p>Via: WhatsApp</p>
        </footer>
      </body>
    </html>
  `;

  return generatePDFFromHTML(html);
}
```

### 7.7 Compliance LGPD

- **Art. 7º, I**: Consentimento como base legal
- **Art. 8º**: Consentimento por escrito ou equivalente
- **Art. 9º**: Informações claras e acessíveis
- **Art. 18**: Direitos do titular (acesso, correção, exclusão)

### 7.8 Localização do Código

- **Templates**: `/lib/termo-templates.ts`
- **Gerador PDF**: `/lib/consent-term-template.ts`
- **API**: `/app/api/consent-terms/route.ts`
- **Schema**: `ConsentTerm` model no `prisma/schema.prisma`

---

## 8. SISTEMA DE INTELIGÊNCIA COLETIVA

### 8.1 Conceito

Sistema que agrega dados de **todos os médicos participantes** para:
- Melhorar modelos de ML
- Criar benchmarks comparativos
- Detectar padrões epidemiológicos

### 8.2 Fluxo de Funcionamento

```
1. Médico opta por participar (collectiveIntelligenceOptIn: true)
2. Sistema agrega TODOS os pacientes de médicos participantes
3. Dados são anonimizados com SHA-256
4. Dataset coletivo é gerado para treinamento ML
5. Apenas admin pode exportar o dataset
```

### 8.3 Conformidade Legal

- **Base Legal**: LGPD Art. 12 - "Dados anonimizados não são dados pessoais"
- Não requer consentimento individual (dados irreversivelmente anonimizados)

### 8.4 Localização do Código

- **Opt-in**: `/app/api/collective-intelligence/opt-in/route.ts`
- **Export Dataset**: `/app/api/collective-intelligence/export-dataset/route.ts`
- **Pseudonymizer**: `/lib/collective-intelligence/pseudonymizer.ts`

---

## 9. SISTEMA DE ANONIMIZAÇÃO (SHA-256)

### 9.1 Algoritmo

```typescript
import { createHash } from 'crypto';

const SALT = process.env.PSEUDONYMIZATION_SALT || "telos-ai-collective-intelligence-2024";

export function pseudonymize(value: string): string {
  if (!value) return "";
  const hash = createHash("sha256");
  hash.update(value + SALT);
  return hash.digest("hex");
}
```

### 9.2 Características

| Propriedade | Descrição |
|-------------|-----------|
| **Algoritmo** | SHA-256 (criptográfico, 256 bits) |
| **Salt** | Secreto, concatenado antes do hash |
| **Irreversibilidade** | Impossível recuperar valor original |
| **Determinístico** | Mesmo valor sempre gera mesmo hash |

### 9.3 Dados Anonimizados vs. Mantidos

| Anonimizado (Hash) | Mantido (Claro) |
|--------------------|-----------------|
| ID do Paciente | Idade |
| CPF | Sexo |
| Telefone | Comorbidades |
| Email | Tipo de cirurgia |
| Nome | Dados clínicos |
| ID Cirurgia | Resultados |

### 9.4 Localização do Código

- **Coletivo**: `/lib/collective-intelligence/pseudonymizer.ts`
- **Pesquisa**: `/lib/research-pseudonymization.ts`

---

## 10. MODO PESQUISA

### 10.1 Funcionalidades

- Criação de **pesquisas científicas** com múltiplos grupos (A, B, C, Controle)
- Protocolos personalizados por grupo
- Alocação de pacientes em grupos
- Exportação anonimizada conforme LGPD
- Análises estatísticas integradas
- Comparação entre grupos (ANOVA, t-test, Chi-quadrado)

### 10.2 Estrutura de Dados

```prisma
model Research {
  id            String
  title         String
  description   String
  surgeryType   String?
  startDate     DateTime
  endDate       DateTime?
  totalPatients Int
  isActive      Boolean
  groups        ResearchGroup[]
  protocols     Protocol[]
  patients      Patient[]
}

model ResearchGroup {
  id           String
  groupCode    String   // A, B, C, Controle
  groupName    String
  description  String
  patientCount Int
}
```

### 10.3 Tipos de Exportação

| Tipo | Descrição |
|------|-----------|
| **Individual** | Uma linha por paciente/cirurgia |
| **Comparative** | Grupos lado-a-lado |
| **Statistical** | Resumo estatístico descritivo |
| **Timeline** | Progressão temporal |

### 10.4 Localização do Código

- **APIs**: `/app/api/pesquisas/`
- **Dashboard**: `/app/dashboard/pesquisas/`
- **Exportação**: `/app/api/export-research/`

---

## 11. QUESTIONÁRIOS DETALHADOS POR DIA

### 11.1 Estrutura Comum

Cada dia coleta perguntas específicas. Abaixo está o detalhamento COMPLETO:

### 11.2 D+1 (Primeiro Dia Pós-Operatório)

| Ordem | ID | Pergunta | Tipo | Valores | Red Flag |
|-------|-----|----------|------|---------|----------|
| 1 | `painAtRest` | "De 0 a 10, qual sua dor agora em repouso?" | Escala | 0-10 | ≥9 |
| 2 | `hasFever` | "Você está com febre?" | Sim/Não | boolean | Sim |
| 3 | `feverTemperature` | "Qual a temperatura?" | Número | °C | ≥38°C |
| 4 | `hadBowelMovement` | "Conseguiu evacuar hoje?" | Sim/Não | boolean | - |
| 5 | `bowelMovementTime` | "A que horas evacuou?" | Texto | HH:MM | - |
| 6 | `painDuringBM` | "Qual foi a dor ao evacuar? (0-10)" | Escala | 0-10 | ≥9 |
| 7 | `bleeding` | "Teve sangramento?" | Categórico | none/mild/moderate/severe | severe |
| 8 | `urination` | "Conseguiu urinar normalmente?" | Sim/Não | boolean | Não (>6h) |
| 9 | `takingMeds` | "Está tomando as medicações prescritas?" | Sim/Não | boolean | - |
| 10 | `extraMeds` | "Tomou algum remédio extra?" | Sim/Não | boolean | - |
| 11 | `concerns` | "Tem alguma preocupação ou dúvida?" | Texto | livre | - |

### 11.3 D+2 (Segundo Dia)

| Ordem | ID | Pergunta | Tipo | Valores | Red Flag |
|-------|-----|----------|------|---------|----------|
| 1 | `painAtRest` | "De 0 a 10, qual sua dor agora?" | Escala | 0-10 | ≥9 |
| 2 | `painComparison` | "Comparado a ontem, a dor está:" | Categórico | melhor/igual/pior | pior |
| 3 | `hasFever` | "Está com febre?" | Sim/Não | boolean | Sim |
| 4 | `hadBowelMovement` | "Evacuou desde ontem?" | Sim/Não | boolean | - |
| 5 | `painDuringBM` | "Dor ao evacuar (0-10)" | Escala | 0-10 | ≥9 |
| 6 | `bleeding` | "Sangramento?" | Categórico | 4 níveis | severe |
| 7 | `urination` | "Urinando normalmente?" | Sim/Não | boolean | Não |
| 8 | `takingMeds` | "Tomando medicações?" | Sim/Não | boolean | - |
| 9 | `concerns` | "Outras preocupações?" | Texto | livre | - |

### 11.4 D+3 (Terceiro Dia)

| Ordem | ID | Pergunta | Tipo | Valores | Red Flag |
|-------|-----|----------|------|---------|----------|
| 1 | `painAtRest` | "Dor em repouso (0-10)" | Escala | 0-10 | ≥9 |
| 2 | `painComparison` | "Comparado a ontem:" | Categórico | melhor/igual/pior | pior |
| 3 | `hasFever` | "Febre?" | Sim/Não | boolean | Sim |
| 4 | `hadBowelMovement` | "Evacuou?" | Sim/Não | boolean | **Não (alerta)** |
| 5 | `painDuringBM` | "Dor ao evacuar" | Escala | 0-10 | ≥9 |
| 6 | `bleeding` | "Sangramento?" | Categórico | 4 níveis | moderate+ (pós D+3) |
| 7 | `hasPurulentDischarge` | "Secreção com pus ou odor fétido?" | Sim/Não | boolean | **Sim** |
| 8 | `takingMeds` | "Tomando medicações?" | Sim/Não | boolean | - |
| 9 | `concerns` | "Preocupações?" | Texto | livre | - |

### 11.5 D+5 (Quinto Dia)

| Ordem | ID | Pergunta | Tipo | Valores | Red Flag |
|-------|-----|----------|------|---------|----------|
| 1 | `painAtRest` | "Dor em repouso (0-10)" | Escala | 0-10 | ≥8 |
| 2 | `painComparison` | "Comparado ao último contato:" | Categórico | melhor/igual/pior | pior |
| 3 | `hasFever` | "Febre?" | Sim/Não | boolean | Sim |
| 4 | `hadBowelMovement` | "Evacuou?" | Sim/Não | boolean | - |
| 5 | `bristolScale` | "Como eram as fezes? (Escala Bristol 1-7)" | Escala | 1-7 | 1-2 ou 6-7 |
| 6 | `painDuringBM` | "Dor ao evacuar" | Escala | 0-10 | ≥8 |
| 7 | `bleeding` | "Sangramento?" | Categórico | 4 níveis | moderate+ |
| 8 | `hasPurulentDischarge` | "Secreção purulenta?" | Sim/Não | boolean | Sim |
| 9 | `activityLevel` | "Como está sua atividade física?" | Texto | livre | - |
| 10 | `takingMeds` | "Tomando medicações?" | Sim/Não | boolean | - |
| 11 | `concerns` | "Preocupações?" | Texto | livre | - |

### 11.6 D+7 (Sétimo Dia)

| Ordem | ID | Pergunta | Tipo | Valores | Red Flag |
|-------|-----|----------|------|---------|----------|
| 1 | `painAtRest` | "Dor em repouso (0-10)" | Escala | 0-10 | ≥7 |
| 2 | `painComparison` | "Comparado ao último contato:" | Categórico | melhor/igual/pior | pior |
| 3 | `hasFever` | "Febre?" | Sim/Não | boolean | Sim |
| 4 | `hadBowelMovement` | "Evacuou regularmente?" | Sim/Não | boolean | - |
| 5 | `bristolScale` | "Bristol Scale (1-7)" | Escala | 1-7 | extremos |
| 6 | `painDuringBM` | "Dor ao evacuar" | Escala | 0-10 | ≥8 |
| 7 | `bleeding` | "Sangramento?" | Categórico | 4 níveis | moderate+ |
| 8 | `hasPurulentDischarge` | "Secreção purulenta?" | Sim/Não | boolean | Sim |
| 9 | `activityLevel` | "Retornou às atividades?" | Texto | livre | - |
| 10 | `takingMeds` | "Ainda tomando medicações?" | Sim/Não | boolean | - |
| 11 | `concerns` | "Preocupações?" | Texto | livre | - |

### 11.7 D+10 (Décimo Dia)

| Ordem | ID | Pergunta | Tipo | Valores | Red Flag |
|-------|-----|----------|------|---------|----------|
| 1 | `painAtRest` | "Dor em repouso (0-10)" | Escala | 0-10 | ≥6 |
| 2 | `painComparison` | "Comparado ao último contato:" | Categórico | melhor/igual/pior | pior |
| 3 | `hasFever` | "Febre?" | Sim/Não | boolean | Sim |
| 4 | `hadBowelMovement` | "Evacuações regulares?" | Sim/Não | boolean | - |
| 5 | `bristolScale` | "Bristol Scale" | Escala | 1-7 | extremos |
| 6 | `painDuringBM` | "Dor ao evacuar" | Escala | 0-10 | ≥7 |
| 7 | `bleeding` | "Sangramento?" | Categórico | 4 níveis | any significant |
| 8 | `hasPurulentDischarge` | "Secreção?" | Sim/Não | boolean | Sim |
| 9 | `woundHealing` | "Como está a cicatrização?" | Texto | livre | - |
| 10 | `activityLevel` | "Atividades normais?" | Texto | livre | - |
| 11 | `takingMeds` | "Ainda medicando?" | Sim/Não | boolean | - |
| 12 | `concerns` | "Preocupações finais?" | Texto | livre | - |

### 11.8 D+14 (Décimo Quarto Dia - INCLUI SATISFAÇÃO)

| Ordem | ID | Pergunta | Tipo | Valores | Red Flag |
|-------|-----|----------|------|---------|----------|
| 1 | `painAtRest` | "Dor em repouso (0-10)" | Escala | 0-10 | ≥5 |
| 2 | `painComparison` | "Comparado ao último contato:" | Categórico | melhor/igual/pior | pior |
| 3 | `hasFever` | "Febre?" | Sim/Não | boolean | Sim |
| 4 | `hadBowelMovement` | "Evacuações regulares?" | Sim/Não | boolean | - |
| 5 | `bristolScale` | "Bristol Scale" | Escala | 1-7 | - |
| 6 | `painDuringBM` | "Dor ao evacuar" | Escala | 0-10 | ≥6 |
| 7 | `bleeding` | "Algum sangramento?" | Categórico | 4 níveis | any |
| 8 | `hasPurulentDischarge` | "Secreção?" | Sim/Não | boolean | Sim |
| 9 | `woundHealing` | "Cicatrização completa?" | Texto | livre | - |
| 10 | `activityLevel` | "Retornou 100% às atividades?" | Texto | livre | - |
| **11** | **`painControlSatisfaction`** | **"De 0 a 10, quão satisfeito com o controle da dor?"** | **Escala** | **0-10** | - |
| **12** | **`aiFollowUpSatisfaction`** | **"De 0 a 10, quão satisfeito com o acompanhamento por IA?"** | **Escala** | **0-10** | - |
| **13** | **`npsScore`** | **"De 0 a 10, recomendaria o Telos.AI a um colega?"** | **Escala** | **0-10** | - |
| **14** | **`feedback`** | **"Gostaria de deixar algum comentário ou sugestão?"** | **Texto** | **livre** | - |

---

## 12. SISTEMA DE ANÁLISE DE SATISFAÇÃO E NPS

### 12.1 Métricas de Satisfação Coletadas em D+14

| Métrica | ID | Pergunta | Escala |
|---------|-----|----------|--------|
| **Satisfação com Controle da Dor** | `painControlSatisfaction` | "Quão satisfeito você está com o controle da sua dor durante a recuperação?" | 0-10 |
| **Satisfação com Acompanhamento IA** | `aiFollowUpSatisfaction` | "Quão satisfeito você está com o acompanhamento realizado pela inteligência artificial?" | 0-10 |
| **NPS (Net Promoter Score)** | `npsScore` | "De 0 a 10, qual a probabilidade de você recomendar o Telos.AI para um amigo ou familiar?" | 0-10 |
| **Feedback Qualitativo** | `feedback` | "Gostaria de deixar algum comentário ou sugestão sobre sua experiência?" | Texto livre |

### 12.2 Cálculo do NPS

```typescript
// Fórmula NPS
const calculateNPS = (scores: number[]) => {
  const promoters = scores.filter(s => s >= 9).length;    // 9-10 = Promotores
  const passives = scores.filter(s => s >= 7 && s <= 8).length; // 7-8 = Passivos
  const detractors = scores.filter(s => s <= 6).length;   // 0-6 = Detratores

  const total = scores.length;
  const nps = ((promoters - detractors) / total) * 100;

  return {
    nps: Math.round(nps),  // -100 a +100
    promotersPercent: (promoters / total) * 100,
    passivesPercent: (passives / total) * 100,
    detractorsPercent: (detractors / total) * 100
  };
};
```

### 12.3 Classificação NPS

| Score | Categoria | Interpretação |
|-------|-----------|---------------|
| 9-10 | **Promotor** | Muito satisfeito, recomenda ativamente |
| 7-8 | **Passivo** | Satisfeito mas não entusiasmado |
| 0-6 | **Detrator** | Insatisfeito, pode fazer críticas |

### 12.4 Fases da Coleta de Satisfação (D+14)

O webhook do WhatsApp gerencia fases específicas para D+14:

```typescript
// Arquivo: /app/api/whatsapp/webhook/route.ts
const satisfactionPhases = [
  'collecting_satisfaction_pain',    // Pergunta sobre controle da dor
  'collecting_satisfaction_ai',      // Pergunta sobre acompanhamento IA
  'collecting_nps',                  // Pergunta NPS
  'collecting_feedback'              // Feedback livre
];
```

### 12.5 Fluxo da Conversa D+14

```
IA: "Parabéns por chegar ao D+14! Vamos fazer as últimas perguntas do seu acompanhamento..."
    [Coleta dados clínicos normais]

IA: "Agora gostaríamos de saber sua opinião sobre a experiência."

IA: "De 0 a 10, quão satisfeito você está com o CONTROLE DA DOR durante sua recuperação?"
Paciente: "8"
    → Salva painControlSatisfaction = 8

IA: "De 0 a 10, quão satisfeito você está com o ACOMPANHAMENTO realizado pela IA?"
Paciente: "9"
    → Salva aiFollowUpSatisfaction = 9

IA: "De 0 a 10, qual a probabilidade de você RECOMENDAR o Telos.AI?"
Paciente: "10"
    → Salva npsScore = 10 → Categoria: Promotor

IA: "Por fim, gostaria de deixar algum comentário ou sugestão?"
Paciente: "Achei muito prático, não precisei ir ao consultório"
    → Salva feedback = "Achei muito prático..."

IA: "Muito obrigado! Seu acompanhamento está completo. Qualquer dúvida, entre em contato."
```

### 12.6 Análise de Feedback com IA

A IA analisa os feedbacks textuais para:
- Identificar temas recorrentes
- Detectar sentimentos (positivo/negativo/neutro)
- Extrair sugestões de melhoria

### 12.7 Localização do Código

- **Webhook/Fases**: `/app/api/whatsapp/webhook/route.ts`
- **Questionários**: `/lib/questionnaires.ts`
- **Analytics**: `/app/dashboard/analytics/`
- **Exportação**: Incluso nos dados de pesquisa

---

## 13. ANÁLISES ESTATÍSTICAS

### 13.1 Testes Implementados (Sem Bibliotecas Externas)

Todas as análises estatísticas foram implementadas **do zero em TypeScript**, sem dependência de bibliotecas como scipy ou R.

#### 13.1.1 Testes de Hipóteses

| Teste | Uso | Fórmula |
|-------|-----|---------|
| **Chi-Quadrado (χ²)** | Dados categóricos | χ² = Σ[(O-E)²/E] |
| **Fisher's Exact** | Tabelas 2x2, n<20 | Probabilidade exata |
| **t-Test Independente** | Comparação 2 grupos | t = (x̄₁-x̄₂) / SE |
| **t-Test Pareado** | Antes/Depois | t = d̄ / (sd/√n) |
| **ANOVA** | Comparação 3+ grupos | F = MS_between / MS_within |
| **Tukey HSD** | Post-hoc ANOVA | q = (ȳᵢ-ȳⱼ) / SE |

#### 13.1.2 Regressão

| Tipo | Fórmula |
|------|---------|
| **Simples** | y = β₀ + β₁x |
| **Múltipla** | y = β₀ + β₁x₁ + β₂x₂ + ... |
| **Coeficientes** | β = (X'X)⁻¹X'y |

**Métricas calculadas:**
- R² e R² ajustado
- RMSE (Root Mean Square Error)
- AIC e BIC
- VIF (Variance Inflation Factor)
- Distância de Cook
- Q-Q Plot para normalidade

#### 13.1.3 Análise de Sobrevivência

| Método | Descrição |
|--------|-----------|
| **Kaplan-Meier** | Curva de sobrevivência |
| **Log-Rank Test** | Comparação entre grupos |
| **Cox Regression** | Hazard ratios com covariáveis |
| **C-Index** | Capacidade discriminatória |

**Fórmulas:**
- Kaplan-Meier: S(t) = ∏[1 - (dᵢ/nᵢ)]
- Log-Rank: χ² = (O₁ - E₁)² / V
- Cox: h(t) = h₀(t) × exp(β₁X₁ + ... + βₚXₚ)

#### 13.1.4 Tamanhos de Efeito

| Medida | Interpretação |
|--------|---------------|
| **Cramér's V** | Pequeno: 0.1, Médio: 0.3, Grande: 0.5 |
| **Eta-quadrado (η²)** | Pequeno: 0.01, Médio: 0.06, Grande: 0.14 |
| **Cohen's d** | Pequeno: 0.2, Médio: 0.5, Grande: 0.8 |

### 13.2 Localização do Código

- **Regressão**: `/lib/linear-regression.ts` (780+ linhas)
- **Sobrevivência**: `/lib/survival-analysis.ts` (650+ linhas)
- **Testes Estatísticos**: `/lib/research-export-utils.ts` (1488 linhas)
- **API Stats**: `/app/api/pesquisas/[id]/stats/route.ts`
- **API Regressão**: `/app/api/pesquisas/[id]/regression/route.ts`
- **API Sobrevivência**: `/app/api/pesquisas/[id]/survival/route.ts`

---

## 14. SISTEMA DE EXPORTAÇÃO

### 14.1 Formatos Suportados

| Formato | Biblioteca | Características |
|---------|------------|-----------------|
| **Excel (.xlsx)** | xlsx | Múltiplas abas, formatação, cores |
| **CSV** | csv-stringify | UTF-8 com BOM |
| **PDF** | jsPDF + autotable | Estilo APA 7th Edition |
| **Word (.docx)** | docx | APA 7th Edition, citações |

### 14.2 Tipos de Exportação de Pesquisa

| Tipo | Descrição | Estrutura |
|------|-----------|-----------|
| **Individual** | Uma linha por paciente | Dados completos por paciente |
| **Comparative** | Grupos lado-a-lado | Colunas por grupo |
| **Statistical** | Resumo estatístico | Média, DP, IC, p-valor |
| **Timeline** | Progressão temporal | Dados por dia |

### 14.3 Abas do Excel (Exportação Pesquisa)

1. **Informações** - Metadata da pesquisa
2. **Dados** - Baseado no tipo de exportação
3. **Estatísticas** - Resumo descritivo
4. **Glossário** - Dicionário de campos

### 14.4 Campos Exportáveis

| Categoria | Campos |
|-----------|--------|
| **Demográficos** | Idade, Sexo, Data nascimento |
| **Cirúrgicos** | Tipo, Data, Hospital, Duração, Anestesia |
| **Comorbidades** | Lista, Contagem, Severidade |
| **Medicações** | Nome, Dose, Frequência, Via |
| **Follow-ups** | Dia, Status, Taxa de adesão |
| **Questionário** | Dor, Bristol, Evacuação, Sangramento, Red flags |
| **Satisfação** | NPS, Satisfação dor, Satisfação IA, Feedback |
| **IA** | Análise, Nível de risco, Alertas |

### 14.5 Exportação APA 7th Edition

O sistema gera documentos formatados conforme APA:

```typescript
// Exemplo de tabela APA
{
  title: "Tabela 1",
  subtitle: "Características Demográficas dos Participantes por Grupo",
  headers: ["Variável", "Grupo A (n=30)", "Grupo B (n=28)", "p-valor"],
  rows: [
    ["Idade, M (DP)", "45.2 (12.3)", "43.8 (11.9)", ".67"],
    ["Sexo masculino, n (%)", "18 (60%)", "15 (53.6%)", ".61"],
  ],
  notes: "Nota. M = média; DP = desvio padrão. Valores p de teste t independente ou qui-quadrado."
}
```

### 14.6 Localização do Código

- **Utilitários**: `/lib/export-utils.ts`, `/lib/research-export-utils.ts`
- **PDF**: `/lib/pdf-export.ts`
- **Word**: `/lib/word-export.ts`
- **APIs**: `/app/api/export/`, `/app/api/export-research/`

---

## 15. FLUXO DE FOLLOW-UP VIA WHATSAPP

### 15.1 Integração Meta WhatsApp Business API

```
Cadastro do Paciente
       ↓
Criação de 7 Follow-ups (D+1 a D+14)
       ↓
Cron Job às 10:00 BRT (diariamente)
       ↓
Verifica follow-ups do dia → Envia Template WhatsApp
       ↓
Paciente responde "sim"
       ↓
IA inicia questionário estruturado (carrega protocolos)
       ↓
Coleta de dados em conversa natural
       ↓
Análise automática + Score de risco
       ↓
Notificação ao médico (SSE + Push se necessário)
```

### 15.2 Templates Aprovados pela Meta

| Template | Uso | Idioma |
|----------|-----|--------|
| `day1` | D+1 (primeira mensagem) | en (conteúdo PT-BR) |
| `otherdays` | D+2 a D+14 | pt_BR |

### 15.3 Localização do Código

- **Webhook**: `/app/api/whatsapp/webhook/route.ts`
- **Cliente WhatsApp**: `/lib/whatsapp.ts`
- **Scheduler**: `/lib/follow-up-scheduler.ts`
- **Conversation Manager**: `/lib/conversation-manager.ts`
- **Cron**: `/app/api/cron/send-followups/route.ts`

---

## 16. DETECÇÃO DE RED FLAGS

### 16.1 Red Flags Universais (Todos os Tipos)

| Red Flag | Severidade | Critério |
|----------|------------|----------|
| Febre ≥ 38°C | High | Temperatura informada |
| Febre ≥ 39°C | Critical | Temperatura informada |
| Sangramento intenso | Critical | bleeding = "severe" |
| Sangramento moderado D+3+ | High | bleeding = "moderate" após D+3 |
| Dor intensa (>8/10) | Medium/High | painLevel > 8 |
| Retenção urinária >6h | High | Sem micção D+1/D+2 |
| Secreção purulenta | High | hasPurulentDischarge = true |

### 16.2 Red Flags por Tipo de Cirurgia

#### Hemorroidectomia (12 red flags)
- Dor 9-10/10 persistente após D+3
- Sangramento intenso
- Febre > 38°C
- Retenção urinária > 6h
- Prolapso recorrente
- Incontinência fecal sólida
- Trombose externa
- Ausência de evacuação após D+3

#### Fistulotomia (7 red flags)
- Febre persistente ou > 38°C
- Drenagem purulenta abundante com odor fétido
- Incontinência fecal total
- Dor crescente após D+5
- Edema e hiperemia crescentes
- Abscesso recidivante
- Novo trajeto fistuloso

#### Fissurectomia (6 red flags)
- Dor 9-10/10 ao evacuar após D+7
- Sangramento intenso
- Constipação > 3 dias
- Espasmo anal severo
- Infecção
- Incontinência fecal nova

#### Pilonidal (7 red flags)
- Febre + drenagem purulenta
- Odor fétido
- Edema crescente com hiperemia
- Deiscência completa
- Celulite (vermelhidão espalhando)
- Dor crescente após D+5
- Abscesso/flutuação

### 16.3 Localização do Código

- **Detecção**: `/lib/red-flags.ts`
- **API**: `/app/api/dashboard/red-flags/route.ts`

---

## 17. SISTEMA DE NOTIFICAÇÕES EM TEMPO REAL

### 17.1 Arquitetura Dual-Layer

O sistema implementa uma **arquitetura híbrida de notificações**:

| Camada | Tecnologia | Uso |
|--------|------------|-----|
| **Real-time** | Server-Sent Events (SSE) | App aberto |
| **Persistente** | Web Push API (VAPID) | App fechado/offline |

### 17.2 Tipos de Notificações

```typescript
type NotificationType =
  | 'red_flag_critical'    // Alerta crítico de saúde
  | 'red_flag_high'        // Alerta de alta prioridade
  | 'red_flag_medium'      // Alerta de média prioridade
  | 'followup_completed'   // Paciente respondeu
  | 'followup_overdue'     // Follow-up > 24h sem resposta
  | 'patient_created'      // Novo paciente cadastrado
  | 'surgery_created'      // Nova cirurgia criada
  | 'system_alert'         // Alertas do sistema
  | 'info'                 // Informações gerais
```

### 17.3 Prioridades e Comportamento

| Prioridade | Cor | Som | Comportamento |
|------------|-----|-----|---------------|
| `critical` | Vermelho | Sim | Requer interação, não desaparece |
| `high` | Laranja | Sim | Destaque visual |
| `medium` | Amarelo | Não | Normal |
| `low` | Azul | Não | Informativo |

### 17.4 Fluxo SSE (Server-Sent Events)

```
Cliente abre app → GET /api/notifications/stream
                         ↓
                   Autenticação (NextAuth)
                         ↓
            notificationService.subscribe(userId)
                         ↓
            Conexão armazenada em Map<userId, Connection[]>
                         ↓
            Heartbeat a cada 30 segundos
                         ↓
            Quando notificação criada:
              → notificationService.sendToUser(userId, data)
              → Formato: "data: {JSON}\n\n"
              → Browser EventSource recebe
              → Toast + atualização do badge
```

### 17.5 Web Push (PWA)

```
Usuário permite notificações → subscribeToPush()
                                    ↓
                          Registra Service Worker
                                    ↓
                        pushManager.subscribe() com VAPID
                                    ↓
                       Salva endpoint em PushSubscription
                                    ↓
                       Quando notificação crítica:
                         → webpush.sendNotification()
                         → Service Worker recebe
                         → showNotification() do sistema
                         → Funciona mesmo com app fechado
```

### 17.6 Triggers de Notificação

1. **Red Flag Detectado**: Após análise de follow-up com risco alto/crítico
2. **Novo Paciente**: Quando paciente é cadastrado
3. **Follow-up Atrasado**: Cron job verifica a cada 6h
4. **Paciente Respondeu**: Webhook do WhatsApp

### 17.7 Localização do Código

- **Service**: `/lib/notifications/notification-service.ts`
- **Create**: `/lib/notifications/create-notification.ts`
- **Push**: `/lib/push-notifications.ts`
- **SSE Stream**: `/app/api/notifications/stream/route.ts`
- **API CRUD**: `/app/api/notifications/route.ts`
- **Hook React**: `/hooks/useNotifications.ts`
- **UI**: `/components/notifications/NotificationBell.tsx`

---

## 18. SISTEMA DE BACKUP E RECUPERAÇÃO

### 18.1 Estratégia: Neon Branch-Based Backup

O sistema utiliza **snapshots de branch do Neon PostgreSQL** ao invés de dumps SQL tradicionais:

```
Vantagens:
✅ Instantâneo (copy-on-write)
✅ Sem downtime
✅ Recuperação em segundos
✅ Mínimo uso de storage
```

### 18.2 Fluxo de Backup

```
Cron Job (03:00 UTC / 00:00 BRT)
              ↓
/api/cron/backup-database ou /api/cron/daily-tasks
              ↓
Cria branch: backup-YYYY-MM-DD
              ↓
Neon API: POST /projects/{id}/branches
              ↓
Snapshot criado (copy-on-write)
              ↓
Limpa backups > 7 dias
              ↓
DELETE branches antigas
```

### 18.3 Dados Cobertos pelo Backup

**Todos os 15+ modelos do banco:**
- User, Patient, Surgery, SurgeryDetails
- Anesthesia, PreOpPreparation, PostOpPrescription
- FollowUp, FollowUpResponse, Comorbidity, Medication
- Research, ResearchGroup, Protocol, ConsentTerm
- Notification, PushSubscription, AuditLog

### 18.4 Política de Retenção

| Período | Backups Disponíveis |
|---------|---------------------|
| Últimos 7 dias | 7 snapshots (1 por dia) |
| Rolling window | Mais antigo deletado automaticamente |

### 18.5 Métodos de Restauração

#### Método 1: Troca de Connection String
```
1. Neon Console → Branches
2. Selecionar backup desejado
3. Copiar Connection String
4. Atualizar DATABASE_URL no Vercel
5. Redeploy
```

#### Método 2: Set as Primary
```
1. Neon Console → Branches
2. Selecionar backup
3. "Set as Primary"
4. Switchover instantâneo
```

#### Método 3: Recovery Seletivo
```
1. Conectar ao branch de backup via SQL client
2. Exportar dados específicos
3. Importar no branch principal
```

### 18.6 Localização do Código

- **Cron Backup**: `/app/api/cron/backup-database/route.ts`
- **Daily Tasks**: `/app/api/cron/daily-tasks/route.ts`
- **Documentação**: `/BACKUP_SETUP.md`

---

## 19. DASHBOARD E TODAS AS PÁGINAS DO SISTEMA

### 19.1 Páginas do Dashboard

O sistema possui **14 páginas principais** no dashboard:

| # | Página | Rota | Descrição |
|---|--------|------|-----------|
| 1 | **Dashboard Principal** | `/dashboard` | Visão geral de pacientes, alertas, estatísticas |
| 2 | **Analytics** | `/dashboard/analytics` | Gráficos de dor, complicações, follow-ups |
| 3 | **Pesquisas** | `/dashboard/pesquisas` | Gerenciamento de estudos científicos |
| 4 | **Estatísticas Pesquisa** | `/dashboard/pesquisas/[id]` | Análises por grupo, demografia |
| 5 | **Comparação Grupos** | `/dashboard/pesquisas/[id]/comparacao` | ANOVA, Kaplan-Meier, publicação |
| 6 | **Protocolos** | `/dashboard/protocolos` | CRUD de protocolos por tipo/dia |
| 7 | **Billing** | `/dashboard/billing` | Plano, uso, custos |
| 8 | **Notificações** | `/dashboard/notifications` | Central de alertas |
| 9 | **Ajuda/Tutoriais** | `/dashboard/ajuda` | Guias interativos |
| 10 | **Configurações** | `/dashboard/settings` | Preferências do sistema |
| 11 | **Config API** | `/dashboard/settings/api-config` | Testar conexões (Claude, WhatsApp) |
| 12 | **Exportar Pesquisa** | `/dashboard/exportar-pesquisa` | Exportação avançada |
| 13 | **Glossário** | `/dashboard/glossario` | Termos estatísticos/médicos |
| 14 | **Style Guide** | `/dashboard/style-guide` | Design system |

### 19.2 Dashboard Principal (`/dashboard`)

**Funcionalidades:**
- Cards de estatísticas (pacientes, follow-ups, red flags)
- Lista de pacientes em acompanhamento
- Filtros: tipo de cirurgia, status, período, pesquisa
- Busca por nome/telefone
- Modal de alocação em pesquisa
- Tour guiado para novos usuários

**Componentes:**
- `StatsCards`: Métricas resumidas
- `PatientCard`: Card individual do paciente
- `RedFlagPanel`: Alertas críticos
- `SimpleTour`: Onboarding interativo

### 19.3 Analytics (`/dashboard/analytics`)

**Gráficos:**
- **LineChart**: Evolução da dor D+1 a D+14
- **BarChart**: Taxa de complicações por cirurgia
- **PieChart**: Distribuição de risco
- **BarChart**: Follow-ups por status

**Filtros:**
- Período (7 dias, 30 dias, customizado)
- Tipo de cirurgia

### 19.4 Pesquisas (`/dashboard/pesquisas`)

**Funcionalidades:**
- Criar pesquisa com múltiplos grupos
- Adicionar protocolos específicos por grupo
- Pausar/retomar pesquisa
- Ver estatísticas detalhadas
- Cards expansíveis por grupo

### 19.5 Comparação de Grupos (`/dashboard/pesquisas/[id]/comparacao`)

**Análises Disponíveis:**
- ANOVA one-way com post-hoc Tukey
- Insights gerados por IA
- Intervalos de confiança 95%
- Curvas Kaplan-Meier
- Tabelas formatadas APA
- Diagramas CONSORT
- Botão copiar citação

### 19.6 Protocolos (`/dashboard/protocolos`)

**CRUD completo:**
- Criar protocolo por categoria
- Definir tipo de cirurgia (ou todos)
- Definir range de dias (D+X até D+Y)
- Vincular a pesquisa específica
- Editar/excluir protocolos

### 19.7 Exportação de Pesquisa (`/dashboard/exportar-pesquisa`)

**Opções:**
- Selecionar pesquisa
- Filtrar grupos específicos
- Escolher formato (Excel, CSV, PDF)
- Tipo de exportação (Individual, Comparativo, Estatístico, Timeline)
- Selecionar campos
- Filtro de data opcional
- Enviar por email

### 19.8 Glossário (`/dashboard/glossario`)

**3 categorias:**
- **Estatística**: ANOVA, p-valor, IC, etc.
- **Médica**: Red flags, Bristol, EVA, etc.
- **Pesquisa Clínica**: TCLE, coorte, randomização, etc.

### 19.9 Localização do Código

```
/app/dashboard/
├── page.tsx                    # Dashboard principal
├── DashboardClient.tsx         # Client component
├── analytics/page.tsx          # Analytics
├── pesquisas/
│   ├── page.tsx               # Lista pesquisas
│   └── [id]/
│       ├── page.tsx           # Stats pesquisa
│       └── comparacao/page.tsx # Comparação
├── protocolos/page.tsx         # Protocolos
├── billing/page.tsx            # Billing
├── notifications/page.tsx      # Notificações
├── ajuda/page.tsx              # Help center
├── settings/
│   ├── page.tsx               # Settings
│   └── api-config/page.tsx    # API config
├── exportar-pesquisa/page.tsx  # Export
├── glossario/page.tsx          # Glossário
└── style-guide/page.tsx        # Design system
```

---

## 20. CONFORMIDADE LGPD

### 20.1 Artigos Aplicáveis

| Artigo | Aplicação no Sistema |
|--------|---------------------|
| **Art. 7º, I** | Consentimento como base legal |
| **Art. 8º** | Consentimento por escrito via WhatsApp |
| **Art. 9º** | Informações claras nos termos |
| **Art. 12** | Dados anonimizados não são dados pessoais |
| **Art. 13 § 3º** | Pseudonimização para pesquisa em saúde |
| **Art. 18** | Direitos do titular (acesso, correção, exclusão) |

### 20.2 Medidas Implementadas

- ✅ Pseudonimização SHA-256 determinística
- ✅ Remoção de PII em exportações científicas
- ✅ TCLE automático com registro de aceite
- ✅ Termos de serviço obrigatórios
- ✅ Audit logging de todas as operações sensíveis
- ✅ Criptografia em trânsito (HTTPS)
- ✅ Controle de acesso multi-tenant
- ✅ Backups criptografados
- ✅ Direito de exclusão implementado

### 20.3 Campos Sensíveis vs. Não-Sensíveis

| Sensível (Anonimizado/Removido) | Não-Sensível (Mantido) |
|---------------------------------|------------------------|
| Nome | Idade |
| CPF | Sexo |
| Telefone | Comorbidades (nomes) |
| Data de nascimento | Dados clínicos |
| Email | Resultados |
| Endereço | Tipo de cirurgia |

---

## 21. SUGESTÕES DE VARIÁVEIS PARA O MESTRADO

### 21.1 Variáveis Dependentes (Desfechos)

| Variável | Tipo | Descrição |
|----------|------|-----------|
| **Taxa de complicações** | % | Complicações detectadas / Total |
| **Tempo até complicação** | Dias | Análise de sobrevivência |
| **Tempo até resolução da dor** | Dias | Dor < 3/10 |
| **Dor média no período** | 0-10 | Média de dor D+1 a D+14 |
| **Satisfação com tratamento** | 0-10 | painControlSatisfaction |
| **Satisfação com acompanhamento** | 0-10 | aiFollowUpSatisfaction |
| **NPS** | -100 a +100 | Net Promoter Score |
| **Adesão ao acompanhamento** | % | Follow-ups respondidos |
| **Reinternação** | Sim/Não | Necessidade de reinternação |
| **Tempo de retorno às atividades** | Dias | Recuperação funcional |

### 21.2 Variáveis Independentes (Fatores de Exposição)

| Variável | Tipo | Grupos |
|----------|------|--------|
| **Tipo de acompanhamento** | Categórico | IA vs. Tradicional |
| **Tipo de cirurgia** | Categórico | 4 tipos |
| **Idade** | Numérico | Contínua ou faixas |
| **Sexo** | Categórico | M/F |
| **Comorbidades** | Numérico/Categórico | Contagem ou presença |
| **Bloqueio pudendo** | Categórico | Sim/Não |
| **Duração da cirurgia** | Numérico | Minutos |

### 21.3 Sugestão de Design do Estudo

**Título sugerido:**
> "Acompanhamento Pós-Operatório de Cirurgias Orificiais com Inteligência Artificial: Estudo Comparativo com Seguimento Tradicional"

**Design:** Estudo de coorte prospectivo comparativo

**Grupos:**
- **Grupo Intervenção (IA):** Pacientes acompanhados via Telos.AI
- **Grupo Controle:** Pacientes com acompanhamento tradicional

**Desfechos primários:**
1. Taxa de detecção precoce de complicações
2. Tempo médio até identificação de complicação
3. Taxa de reinternação

**Desfechos secundários:**
1. Satisfação do paciente (NPS + satisfações específicas)
2. Adesão ao acompanhamento
3. Trajetória da dor
4. Custo-efetividade

**Análises sugeridas:**
1. Chi-quadrado para variáveis categóricas
2. t-test ou Mann-Whitney para variáveis contínuas
3. Kaplan-Meier + Log-rank para tempo até evento
4. Regressão de Cox para fatores de risco
5. Regressão logística para desfechos binários

---

## 22. SUGESTÕES PARA O VÍDEO DO SITE

### 22.1 Estado Atual do Componente de Vídeo

O componente `ScrollVideoSection` está implementado como um **placeholder**:
- Localização: `/components/ScrollVideoSection.tsx`
- Atualmente: Botão de play decorativo com efeitos visuais
- Aguarda: URL de vídeo real

### 22.2 Opções de Conteúdo

#### Opção A: Vídeo Institucional (60-90s)
```
[0-10s] Problema: Médico sobrecarregado com ligações pós-op
[10-25s] Solução: Apresentação do Telos.AI
[25-45s] Demonstração: Telas do sistema, conversa WhatsApp
[45-60s] Benefícios: Números, economia de tempo, segurança
[60-75s] Depoimento: Médico usando (se disponível)
[75-90s] CTA: "Seja Founding Member"
```

#### Opção B: Vídeo Tutorial (2-3 min)
```
[0-30s] Introdução: O que é o Telos.AI
[30-60s] Cadastro: Como cadastrar um paciente
[60-120s] Follow-up: Demonstração da conversa WhatsApp com IA
[120-150s] Dashboard: Como ver alertas e acompanhar
[150-180s] Pesquisa: Como usar o modo pesquisa
```

#### Opção C: Animação Conceitual (45-60s)
- Ícones animados (médico, paciente, celular, IA)
- Fluxo visual: Cirurgia → WhatsApp → IA → Alerta
- Números em destaque (24/7, 7 dias, 51+ variáveis)
- Cores da marca (azul #0A2647, dourado #D4AF37)

### 22.3 Recomendação

**Para lançamento comercial:** Opção A (curto, foco em benefícios)
**Para mestrado/apresentações:** Opção B (detalhado, mostra profundidade)

---

## ANEXO A: ARQUIVOS PRINCIPAIS DO PROJETO

### APIs

```
/app/api/
├── analytics/route.ts              - Analytics dashboard
├── dashboard/stats/route.ts        - Stats do dashboard
├── dashboard/red-flags/route.ts    - Red flags
├── ml/predict/route.ts             - Predição ML
├── follow-up/analyze/route.ts      - Análise de follow-up
├── pesquisas/route.ts              - CRUD pesquisas
├── pesquisas/[id]/stats/route.ts   - Estatísticas
├── pesquisas/[id]/regression/route.ts - Regressão
├── pesquisas/[id]/survival/route.ts   - Sobrevivência
├── protocolos/route.ts             - CRUD protocolos
├── consent-terms/route.ts          - Termos de consentimento
├── export/route.ts                 - Exportação geral
├── export-research/route.ts        - Exportação pesquisa
├── whatsapp/webhook/route.ts       - Webhook WhatsApp
├── notifications/
│   ├── route.ts                    - CRUD notificações
│   ├── stream/route.ts             - SSE stream
│   └── send/route.ts               - Web Push
├── collective-intelligence/        - Inteligência coletiva
├── cron/
│   ├── send-followups/route.ts     - Cron follow-ups
│   ├── backup-database/route.ts    - Cron backup
│   └── daily-tasks/route.ts        - Cron unificado
```

### Bibliotecas

```
/lib/
├── anthropic.ts                    - Cliente Anthropic
├── claude-analyzer.ts              - Analisador Claude (usa protocolos)
├── conversational-ai.ts            - IA conversacional
├── follow-up-analyzer.ts           - Análise follow-up
├── ml-prediction.ts                - Predição ML
├── red-flags.ts                    - Detecção red flags
├── whatsapp.ts                     - Cliente WhatsApp
├── follow-up-scheduler.ts          - Agendador
├── questionnaires.ts               - Perguntas por dia
├── linear-regression.ts            - Regressão (780+ linhas)
├── survival-analysis.ts            - Sobrevivência (650+ linhas)
├── research-export-utils.ts        - Exportação + estatísticas (1488 linhas)
├── export-utils.ts                 - Utilitários exportação
├── pdf-export.ts                   - Geração PDF
├── word-export.ts                  - Geração Word APA
├── termo-templates.ts              - Templates de termos
├── consent-term-template.ts        - TCLE HTML/PDF
├── research-pseudonymization.ts    - Anonimização pesquisa
├── push-notifications.ts           - Web Push client
├── notifications/
│   ├── notification-service.ts     - Serviço SSE
│   └── create-notification.ts      - Helper criação
└── collective-intelligence/
    └── pseudonymizer.ts            - Pseudonimização SHA-256
```

### Schema do Banco

```
/prisma/schema.prisma
├── User (médicos)
├── Patient (pacientes)
├── Surgery (cirurgias)
├── SurgeryDetails (detalhes técnicos)
├── Anesthesia (anestesia)
├── PreOpPreparation (pré-op)
├── PostOpPrescription (pós-op)
├── FollowUp (acompanhamentos)
├── FollowUpResponse (respostas)
├── Comorbidity (comorbidades - 56 pré-configuradas)
├── PatientComorbidity (paciente-comorbidade)
├── Medication (medicações - 69 pré-configuradas)
├── PatientMedication (paciente-medicação)
├── Research (pesquisas)
├── ResearchGroup (grupos)
├── Protocol (protocolos)
├── ConsentTerm (termos TCLE)
├── Conversation (conversas WhatsApp)
├── Notification (notificações)
├── PushSubscription (push subscriptions)
├── AuditLog (auditoria)
└── RedFlagView (visualizações de alertas)
```

---

## ANEXO B: MÉTRICAS DO SISTEMA

| Métrica | Valor |
|---------|-------|
| **Variáveis clínicas coletadas** | 51+ |
| **Dias de follow-up** | 7 (D+1, D+2, D+3, D+5, D+7, D+10, D+14) |
| **Tipos de cirurgia** | 4 |
| **Categorias de protocolos** | 6 |
| **Tipos de notificação** | 9 |
| **Formatos de exportação** | 4 (XLSX, CSV, PDF, DOCX) |
| **Testes estatísticos** | 10+ |
| **Comorbidades pré-configuradas** | 56 |
| **Medicações pré-configuradas** | 69 |
| **Páginas do dashboard** | 14 |
| **Modelos no banco** | 20+ |
| **Linhas de código em análises estatísticas** | 3000+ |

---

**Documento gerado automaticamente pelo Claude Code em 28/11/2025**
**Versão 2.0 - Documentação COMPLETA**

**Para o projeto de mestrado:**
- Este documento serve como base para "Materiais e Métodos"
- As variáveis listadas compõem o "Dicionário de Dados"
- As análises estatísticas são o "Plano de Análise Estatística"
- As perguntas por dia são o "Instrumento de Coleta"

**Contato:** telos.ia@gmail.com
