# Teste Manual - Questionário com IA Conversacional

## Pré-requisitos

1. **Variáveis de ambiente configuradas:**
```env
ANTHROPIC_API_KEY=sk-ant-api03-xxx
WHATSAPP_ACCESS_TOKEN=xxx
WHATSAPP_PHONE_NUMBER_ID=xxx
```

2. **Servidor rodando:**
```bash
npm run dev
```

3. **Paciente cadastrado no sistema com follow-up pendente**

## Cenários de Teste

### CENÁRIO 1: Conversa Normal - Tudo OK

```
👤 Paciente: sim

🤖 Bot: Olá [Nome]! Vou fazer algumas perguntas sobre sua recuperação.
       Primeiro, vou enviar uma escala de dor.

[Envia imagem escala de dor]

🤖 Bot: Como está sua dor hoje? Use a escala de 0 a 10.

👤 Paciente: 5

🤖 Bot: Dor moderada. E febre, você está sentindo?

👤 Paciente: não

🤖 Bot: Ótimo! Está conseguindo urinar normalmente?

👤 Paciente: sim

🤖 Bot: E evacuação, já conseguiu?

👤 Paciente: sim, hoje

🤖 Bot: Vou enviar a escala Bristol para você classificar.

[Envia escala Bristol]

👤 Paciente: tipo 4

🤖 Bot: Perfeito! Tem sangramento?

👤 Paciente: não

🤖 Bot: E alimentação, está conseguindo comer?

👤 Paciente: sim

🤖 Bot: Algum outro sintoma?

👤 Paciente: não

🤖 Bot: ✅ Questionário concluído!
       [Resposta empática gerada pela IA de análise]
```

**Resultado esperado:**
- ✅ Dados salvos no banco
- ✅ Status do follow-up: `responded`
- ✅ Risk level: `low`
- ✅ Notificação push enviada

---

### CENÁRIO 2: Paciente com Dúvidas

```
👤 Paciente: sim

🤖 Bot: Olá! Como está sua dor?

👤 Paciente: o que é a escala de dor?

🤖 Bot: A escala vai de 0 (sem dor) até 10 (pior dor imaginável).
       Vou enviar uma imagem para você ver melhor.

[Envia escala de dor]

🤖 Bot: Agora me diga, de 0 a 10, quanto está sua dor?

👤 Paciente: ah entendi, tá uns 6

🤖 Bot: Obrigado! E febre?

👤 Paciente: o que conta como febre?

🤖 Bot: Febre é quando a temperatura fica acima de 37.8°C.
       Você está sentindo calor, suor ou mediu a temperatura?

👤 Paciente: não, tô normal

[... continua ...]
```

**Resultado esperado:**
- ✅ IA responde dúvidas ANTES de avançar
- ✅ `needsClarification: true` nas respostas com dúvida
- ✅ Conversa salva no histórico

---

### CENÁRIO 3: Respostas Ambíguas

```
👤 Paciente: sim

🤖 Bot: Como está sua dor?

👤 Paciente: tá doendo

🤖 Bot: Entendo. De 0 a 10, quanto é a dor?

👤 Paciente: bastante

🤖 Bot: Bastante seria acima de 7? Ou entre 5 e 7?

👤 Paciente: uns 8

[... continua ...]
```

**Resultado esperado:**
- ✅ IA pede esclarecimento quando ambíguo
- ✅ Extrai número correto ao final

---

### CENÁRIO 4: Red Flags Detectados

```
👤 Paciente: sim

🤖 Bot: Como está sua dor?

👤 Paciente: 9, tá muito forte

🤖 Bot: Dor intensa. Tem febre?

👤 Paciente: sim, 38.5

🤖 Bot: Está conseguindo urinar?

👤 Paciente: não consegui ainda

[... coleta resto ...]

🤖 Bot: ✅ Questionário concluído!

      Obrigado pelas informações. IMPORTANTE: Devido à dor intensa,
      febre e dificuldade para urinar, recomendo que você entre em
      contato com o consultório AGORA para avaliação.
```

**Resultado esperado:**
- ✅ Risk level: `high` ou `critical`
- ✅ Red flags detectados
- ✅ Alerta enviado ao médico
- ✅ Push notification com `requireInteraction: true`

---

### CENÁRIO 5: Questionário Já Completado

```
👤 Paciente: sim

[... completa questionário normalmente ...]

🤖 Bot: ✅ Questionário concluído!

--- 2 horas depois ---

👤 Paciente: oi, agora tá doendo mais

🤖 Bot: Olá [Nome]! Você já completou o questionário de hoje.
       Se tiver alguma preocupação adicional, entre em contato
       diretamente com o consultório.
```

**Resultado esperado:**
- ✅ NÃO reinicia questionário
- ✅ Responde contextualmente
- ✅ `completed: true` permanece true

---

### CENÁRIO 6: Erro da API do Claude

```
[Claude API retorna erro 500]

👤 Paciente: sim

🤖 Bot: Desculpe, tive um problema técnico. Pode repetir?

👤 Paciente: sim

[Tenta novamente, agora funciona]
```

**Resultado esperado:**
- ✅ Fallback gracefully
- ✅ Não quebra o fluxo
- ✅ Logs de erro gerados

---

## Verificação no Banco de Dados

### 1. Checar `FollowUpResponse.questionnaireData`

```sql
SELECT
  id,
  "questionnaireData"::json->'conversation' as conversation,
  "questionnaireData"::json->'extractedData' as data,
  "questionnaireData"::json->'completed' as completed
FROM "FollowUpResponse"
ORDER BY "createdAt" DESC
LIMIT 1;
```

**Deve conter:**
```json
{
  "conversation": [
    {"role": "user", "content": "sim"},
    {"role": "assistant", "content": "Olá! ..."}
  ],
  "extractedData": {
    "painLevel": 5,
    "hasFever": false,
    ...
  },
  "completed": true
}
```

### 2. Checar Risk Level

```sql
SELECT
  fr.id,
  fr."riskLevel",
  fr."redFlags",
  fr."doctorAlerted",
  fu.status
FROM "FollowUpResponse" fr
JOIN "FollowUp" fu ON fu.id = fr."followUpId"
ORDER BY fr."createdAt" DESC
LIMIT 5;
```

### 3. Checar Status do Follow-Up

```sql
SELECT
  id,
  status,
  "respondedAt"
FROM "FollowUp"
WHERE status IN ('sent', 'in_progress', 'responded')
ORDER BY "createdAt" DESC;
```

**Status esperado após conclusão:** `responded`

---

## Logs a Observar

### Logs de Sucesso

```
🔄 Processando resposta com IA conversacional...
🤖 Chamando Claude API
  historyLength: 4
  userMessage: "tá doendo uns 7"

🤖 Claude raw response: {
  "message": "Entendo, dor moderada a intensa...",
  "dataCollected": {"painLevel": 7},
  "completed": false,
  "needsClarification": false
}

✅ Claude response parsed:
  completed: false
  needsImage: null
  phase: collecting_fever

📸 Imagem pain_scale enviada para 5583998663089

✅ Questionário completado via IA - finalizando...
🔄 Finalizando questionário com IA e analisando respostas...
✅ Questionário finalizado com sucesso para João Silva
```

### Logs de Erro (a investigar)

```
❌ Erro ao chamar Claude API: Error: API timeout
[Fallback ativado]

❌ Erro ao enviar imagem pain_scale: Error: Invalid image URL
[Continua sem imagem]

❌ Erro ao processar resposta com IA: SyntaxError: Unexpected token
[Resposta genérica enviada]
```

---

## Checklist de Teste

- [ ] Conversa normal funciona
- [ ] Imagens são enviadas (dor e Bristol)
- [ ] IA responde dúvidas corretamente
- [ ] Dados são extraídos corretamente
- [ ] Red flags são detectados
- [ ] Alertas ao médico funcionam
- [ ] Questionário não reinicia após completar
- [ ] Fallback funciona em caso de erro
- [ ] Histórico de conversa é salvo
- [ ] Risk level é calculado corretamente
- [ ] Notificações push são enviadas
- [ ] Status do follow-up é atualizado

---

## Debug Avançado

### 1. Testar Claude API Direto

```typescript
// No console do Node.js ou arquivo de teste
import { anthropic } from '@/lib/anthropic';

const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 2000,
  messages: [{
    role: 'user',
    content: 'Teste'
  }]
});

console.log(response.content[0].text);
```

### 2. Inspecionar Conversa Completa

```typescript
const response = await prisma.followUpResponse.findFirst({
  where: { followUpId: 'xxx' },
});

const data = JSON.parse(response.questionnaireData);
console.log('Conversa completa:', data.conversation);
console.log('Dados extraídos:', data.extractedData);
console.log('Completado:', data.completed);
```

### 3. Simular Resposta sem WhatsApp

```typescript
// Chamar processQuestionnaireAnswer direto
await processQuestionnaireAnswer(
  followUp,
  patient,
  phone,
  'sim'
);
```

---

## Métricas de Sucesso

1. **Taxa de Completude:** > 90% dos pacientes completam
2. **Tempo médio:** < 5 minutos por questionário
3. **Taxa de dúvidas respondidas:** IA responde > 80% sem intervenção
4. **Precisão de extração:** > 95% dos dados extraídos corretamente
5. **Red flags detectados:** 100% de casos críticos detectados

---

**Última atualização:** 2025-01-22
**Versão:** 2.0 - Claude AI Conversacional
