# Exemplos de Uso do Dashboard

## Cenários de Uso Comuns

### Cenário 1: Início do Dia

**Dr. João acessa o dashboard às 8h da manhã**

1. **Visualiza as estatísticas do topo**:
   - Cirurgias Hoje: **3** (três cirurgias agendadas)
   - Pacientes Ativos: **45** (45 pacientes em acompanhamento)
   - Follow-ups Hoje: **12** (12 questionários a serem enviados/respondidos)
   - Alertas Críticos: **2** (2 pacientes com red flags)

2. **Identifica prioridades**:
   - Vê um card destacado em vermelho: **João Pedro Santos**
   - Badge "ALERTA" em vermelho
   - Red flags visíveis:
     - "Dor intensa (nível 9/10)"
     - "Febre alta"
   - Clica em "Ver Detalhes" para avaliar o caso

3. **Verifica follow-ups pendentes**:
   - Filtra por "Período: Hoje"
   - Vê lista de pacientes que receberão questionário hoje
   - Nota que alguns já responderam

---

### Cenário 2: Completar Cadastros

**Dr. João tem tempo livre entre cirurgias**

1. **Filtra pacientes com dados incompletos**:
   - Seleciona "Status de dados: Incompleto (<100%)"
   - Vê 8 pacientes com cadastros parciais
   - Cards mostram barras vermelhas/amarelas de progresso

2. **Escolhe um paciente**:
   - **Maria da Silva** - 30% de completude
   - Clica em "Completar Cadastro"
   - Preenche:
     - CPF e data de nascimento
     - Comorbidades (HAS, DM tipo 2)
     - Medicações em uso
     - Detalhes da cirurgia
     - Prescrição pós-operatória
   - Completude sobe para 100%

---

### Cenário 3: Acompanhamento de Tipo Específico

**Dr. João quer revisar todas as hemorroidectomias**

1. **Aplica filtro**:
   - "Tipo de cirurgia: Hemorroidectomia"
   - Dashboard mostra 18 pacientes

2. **Analisa padrões**:
   - Vê que a maioria está em D+3 a D+7
   - Identifica 2 com alertas médios
   - Nota que 5 ainda têm dados incompletos

3. **Toma ações**:
   - Marca os 2 com alertas para contato telefônico
   - Planeja completar cadastros dos 5 incompletos

---

### Cenário 4: Busca Rápida

**Paciente liga e Dr. João precisa encontrá-lo rapidamente**

1. **Usa campo de busca**:
   - Paciente diz: "Sou a Beatriz"
   - Digita: "Beatriz"
   - Sistema filtra instantaneamente (com debounce)
   - Mostra: **Beatriz Almeida Costa**

2. **Acessa informações**:
   - Clica em "Ver Detalhes"
   - Vê histórico completo
   - Responde à dúvida do paciente

---

### Cenário 5: Final do Dia

**Dr. João revisa o dia antes de sair**

1. **Reseta filtros** (seleciona "Todos" em tudo)

2. **Verifica se há novos alertas**:
   - Card "Alertas Críticos" mostra: **3** (antes eram 2)
   - Novo alerta de paciente que respondeu tarde

3. **Marca alertas para amanhã**:
   - Verifica que não há nada urgente
   - Planeja ligar para os 3 pacientes com alerta amanhã

4. **Visualiza cirurgias de amanhã**:
   - Não há filtro direto para isso ainda
   - Anota mentalmente implementar essa feature

---

## Estados Visuais do Dashboard

### Estado 1: Dashboard com Pacientes

```
┌────────────────────────────────────────────────────────────────┐
│  Dashboard Médico                    [+ Novo Paciente Express] │
│  Acompanhamento Pós-Operatório - Dr. João Vitor Viana         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ 📅       │  │ 👥       │  │ 🕐       │  │ ⚠️       │     │
│  │ Cirurgias│  │ Pacientes│  │ Follow-  │  │ Alertas  │     │
│  │ Hoje     │  │ Ativos   │  │ ups Hoje │  │ Críticos │     │
│  │    3     │  │    45    │  │    12    │  │    2     │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  Filtros e Busca                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ 🔍 Busca │ │ Tipo     │ │ Status   │ │ Período  │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
├────────────────────────────────────────────────────────────────┤
│  Pacientes em Acompanhamento                      [45]        │
│                                                                │
│  ┌───────────────────────┐  ┌───────────────────────┐        │
│  │ 🔴 BORDA VERMELHA     │  │ Maria da Silva        │        │
│  │ João Pedro Santos     │  │ [Hemorr...][D+1][✓]  │        │
│  │ [Fístula][D+3][✓]    │  │                       │        │
│  │ ⚠️ ALERTA             │  │ 📅 09/11/2025        │        │
│  │ • Dor intensa 9/10    │  │ Completude: 30%      │        │
│  │ • Febre alta          │  │ ▰▰▰▱▱▱▱▱▱▱ (vermelho)│        │
│  │                       │  │                       │        │
│  │ 📅 06/11/2025        │  │ [Ver Detalhes]       │        │
│  │ Completude: 75%       │  │ [Completar Cadastro] │        │
│  │ ▰▰▰▰▰▰▰▱▱▱ (amarelo) │  └───────────────────────┘        │
│  │                       │                                    │
│  │ [Ver Detalhes]       │  ┌───────────────────────┐        │
│  │ [Completar Cadastro] │  │ Ana Carolina Oliveira │        │
│  └───────────────────────┘  │ [Fissura][D+7][✓]    │        │
│                              │                       │        │
│  (mais cards...)            │ 📅 02/11/2025        │        │
│                              │ Completude: 100%      │        │
│                              │ ▰▰▰▰▰▰▰▰▰▰ (verde)   │        │
│                              │                       │        │
│                              │ [Ver Detalhes]       │        │
│                              └───────────────────────┘        │
└────────────────────────────────────────────────────────────────┘
```

### Estado 2: Dashboard Vazio (Sem Pacientes)

```
┌────────────────────────────────────────────────────────────────┐
│  Dashboard Médico                    [+ Novo Paciente Express] │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │    0     │  │    0     │  │    0     │  │    0     │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
├────────────────────────────────────────────────────────────────┤
│  Filtros e Busca                                              │
├────────────────────────────────────────────────────────────────┤
│  Pacientes em Acompanhamento                      [0]         │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │                     👥 (opaco)                          │ │
│  │                                                          │ │
│  │          Nenhum paciente encontrado                     │ │
│  │                                                          │ │
│  │  Nenhum paciente corresponde aos filtros selecionados.  │ │
│  │  Tente ajustar os filtros ou cadastre um novo paciente. │ │
│  │                                                          │ │
│  │              [+ Cadastrar Novo Paciente]                │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Estado 3: Carregando

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                                                                │
│                        ⌛ (girando)                            │
│                                                                │
│                  Carregando dashboard...                       │
│                                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Exemplos de Dados Retornados pelas Actions

### getDashboardStats()

```json
{
  "todaySurgeries": 3,
  "activePatientsCount": 45,
  "pendingFollowUpsToday": 12,
  "criticalAlerts": 2
}
```

### getDashboardPatients()

```json
[
  {
    "id": "clx1234567890",
    "patientName": "João Pedro Santos",
    "surgeryType": "fistula",
    "surgeryDate": "2025-11-06T10:30:00.000Z",
    "daysSinceSurgery": 3,
    "followUpDay": "D+3",
    "status": "active",
    "dataCompleteness": 75,
    "hasRedFlags": true,
    "redFlags": [
      "Dor intensa (nível 9/10)",
      "Febre alta",
      "Sangramento ativo"
    ],
    "patientId": "clx0987654321"
  },
  {
    "id": "clx1111111111",
    "patientName": "Maria da Silva",
    "surgeryType": "hemorroidectomia",
    "surgeryDate": "2025-11-09T08:00:00.000Z",
    "daysSinceSurgery": 0,
    "followUpDay": "D+0",
    "status": "active",
    "dataCompleteness": 30,
    "hasRedFlags": false,
    "redFlags": [],
    "patientId": "clx2222222222"
  }
]
```

---

## Exemplos de Interações do Usuário

### Exemplo 1: Filtrar por Tipo

**Ação do usuário:**
```
1. Clica no dropdown "Tipo de cirurgia"
2. Seleciona "Hemorroidectomia"
```

**Resultado:**
- URL não muda (estado local)
- Lista de pacientes é filtrada instantaneamente
- Mostra apenas pacientes com type === "hemorroidectomia"
- Contador atualiza: "18 pacientes"

---

### Exemplo 2: Buscar por Nome

**Ação do usuário:**
```
1. Clica no campo de busca
2. Digita: "João"
3. Aguarda 500ms (debounce)
```

**Resultado:**
- Sistema faz nova query ao banco
- Filtra por: name LIKE '%João%' OU phone LIKE '%João%'
- Mostra 3 resultados:
  - João Pedro Santos
  - João Carlos Silva
  - Maria João Oliveira

---

### Exemplo 3: Combinar Filtros

**Ação do usuário:**
```
1. Tipo: "Fístula"
2. Período: "Últimos 7 dias"
3. Status: "Incompleto"
```

**Resultado:**
- Query complexa aplicada:
  - type = 'fistula'
  - date >= hoje - 7 dias
  - dataCompleteness < 100
- Mostra apenas pacientes que atendem TODOS os critérios
- Exemplo: 2 pacientes encontrados

---

### Exemplo 4: Ver Detalhes de Paciente com Red Flag

**Ação do usuário:**
```
1. Vê card de João Pedro Santos (vermelho)
2. Lê os red flags:
   - Dor intensa (nível 9/10)
   - Febre alta
3. Clica em "Ver Detalhes"
```

**Resultado:**
- Navega para: `/paciente/clx1234567890`
- Página de detalhes mostra:
  - Informações completas do paciente
  - Timeline de follow-ups
  - Resposta completa do questionário
  - Análise da IA
  - Recomendações
  - Opção de contatar paciente

---

## Fluxo Completo: Do Cadastro ao Acompanhamento

### Passo 1: Cadastro Express
```
Dr. João termina uma cirurgia
↓
Acessa /cadastro
↓
Preenche:
- Nome: "Carlos Silva"
- Telefone: "11988776655"
- Tipo: "Fissura"
- Data: "09/11/2025"
↓
Clica "Cadastrar"
↓
Sistema cria:
- Patient
- Surgery (dataCompleteness: 20%)
- 7 FollowUps agendados
↓
Redireciona para /dashboard
```

### Passo 2: Visualização no Dashboard
```
Dashboard recarrega
↓
Estatística "Cirurgias Hoje" aumenta: 3 → 4
↓
Novo card aparece:
┌─────────────────────┐
│ Carlos Silva        │
│ [Fissura][D+0][✓]  │
│ Completude: 20%     │
│ ▰▰▱▱▱▱▱▱▱▱ (vermelho)│
│ [Ver Detalhes]      │
│ [Completar Cadastro]│
└─────────────────────┘
```

### Passo 3: Completar Cadastro
```
Dr. João clica "Completar Cadastro"
↓
Navega para /paciente/[id]/editar
↓
Preenche mais dados:
- CPF, data nascimento
- Comorbidades
- Detalhes da cirurgia
- Prescrição pós-operatória
↓
Salva
↓
Completude sobe: 20% → 85%
↓
Volta para dashboard
↓
Card atualizado:
┌─────────────────────┐
│ Carlos Silva        │
│ [Fissura][D+0][✓]  │
│ Completude: 85%     │
│ ▰▰▰▰▰▰▰▰▱▱ (verde)  │
│ [Ver Detalhes]      │
│ [Completar Cadastro]│
└─────────────────────┘
```

### Passo 4: Follow-up Automático (D+1)
```
Sistema envia WhatsApp no dia seguinte
↓
Carlos responde questionário
↓
IA (Claude) analisa resposta
↓
Detecta: dor leve, sem complicações
↓
Salva no banco: riskLevel: "low"
↓
Dashboard atualizado:
┌─────────────────────┐
│ Carlos Silva        │
│ [Fissura][D+1][✓]  │
│ Completude: 85%     │
│ ▰▰▰▰▰▰▰▰▱▱ (verde)  │
│ (sem red flags)     │
│ [Ver Detalhes]      │
└─────────────────────┘
```

### Passo 5: Red Flag Detectado (D+3)
```
Sistema envia WhatsApp (D+3)
↓
Carlos responde: dor 8/10, febre 38.5°C
↓
IA detecta red flags
↓
Salva: riskLevel: "high"
↓
Dashboard atualizado:
┌───────────────────────┐
│ 🔴 BORDA VERMELHA     │
│ Carlos Silva          │
│ [Fissura][D+3][✓]    │
│ ⚠️ ALERTA             │
│ • Dor intensa (8/10)  │
│ • Febre alta          │
│                       │
│ Completude: 85%       │
│ [Ver Detalhes]       │
└───────────────────────┘
↓
Estatística "Alertas Críticos": 2 → 3
↓
Dr. João vê e liga para Carlos
```

---

## Cores e Indicadores Visuais

### Completude de Dados
- **0-39%**: 🔴 Vermelho (crítico)
- **40-79%**: 🟡 Amarelo (atenção)
- **80-100%**: 🟢 Verde (bom)

### Níveis de Risco
- **low**: Sem destaque
- **medium**: 🟡 Badge amarelo
- **high**: 🟠 Badge laranja, borda destacada
- **critical**: 🔴 Card vermelho, alerta grande

### Status de Acompanhamento
- **active**: 🟢 Badge verde "Ativo"
- **completed**: ⚪ Badge cinza "Concluído"
- **cancelled**: ⚫ Badge preto "Cancelado"

### Tipos de Cirurgia (Cores dos Badges)
- **Hemorroidectomia**: Azul
- **Fístula**: Roxo
- **Fissura**: Verde
- **Pilonidal**: Laranja

---

Estes exemplos cobrem os principais cenários de uso do dashboard!
