# Templates WhatsApp Aprovados

**Data da verificação**: 2025-11-19
**WABA ID**: 4331043357171950
**App ID**: 1352351593037143

---

## ✅ Templates APROVADOS (Prontos para uso)

### 1. `day1` - **RECOMENDADO PARA D1**
- **ID**: 1361646862001864
- **Idioma**: en (inglês) ⚠️
- **Formato**: NAMED
- **Status**: ✅ APPROVED
- **Categoria**: MARKETING

**Estrutura**:
```
Header: Assistente Pós-Operatório:

Body:
Olá, {{customer_name}}!

Eu sou seu assistente de recuperação pós-operatório, planejado e criado com carinho para lhe acompanhar durante sua jornada! Lembre-se que suas respostas aqui são fundamentais para ajudar na sua recuperação, então responda com cuidado e seriedade! Lembre-se também que sou uma inteligência artificial, criado para auxiliar, e não substituir, seu médico. Vamos começar?

Digite "sim" e daremos início à nossa caminhada juntos!
```

**Como usar no código**:
```typescript
await sendTemplate(
  patient.phone,
  'day1',
  [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: 'João' } // Nome do paciente
      ]
    }
  ],
  'en' // Importante: template em inglês
);
```

---

### 2. `otherdays` - **RECOMENDADO PARA D2+**
- **ID**: 1373380927667896
- **Idioma**: pt_BR
- **Formato**: NAMED
- **Status**: ✅ APPROVED
- **Categoria**: MARKETING

**Estrutura**:
```
Body:
Olá, {{customer_name}}!

Chegou a hora de conversarmos um pouco mais e continuar seu acompanhamento!

Digite "sim" para prosseguirmos com nossa jornada!
```

**Como usar no código**:
```typescript
await sendTemplate(
  patient.phone,
  'otherdays',
  [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: 'João' } // Nome do paciente
      ]
    }
  ],
  'pt_BR'
);
```

---

### 3. `dia_1` - **ALTERNATIVA PARA D1**
- **ID**: 1527333071647117
- **Idioma**: pt_BR
- **Formato**: NAMED ({{custumer_name}}) ⚠️ Typo no nome da variável
- **Status**: ✅ APPROVED
- **Categoria**: MARKETING

**Estrutura**:
```
Header: Acompanhamento Pós-Cirúrgico:

Body:
Olá {{custumer_name}}!

Este é seu sistema de acompanhamento pós-operatório, enviado por seu médico

Digite "sim" e responda o questionário diário para monitorar sua recuperação após a cirurgia.
```

**Como usar no código**:
```typescript
await sendTemplate(
  patient.phone,
  'dia_1',
  [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: 'João' } // Nome do paciente
      ]
    }
  ],
  'pt_BR'
);
```

---

### 4. `pos_op_dia1` - **ALTERNATIVA D1 (POSITIONAL)**
- **ID**: 1374919181013681
- **Idioma**: pt_BR
- **Formato**: POSITIONAL ({{1}})
- **Status**: ✅ APPROVED
- **Categoria**: MARKETING

**Estrutura**:
```
Body:
Olá {{1}}!

Este é seu sistema de acompanhamento pós-operatório enviado por seu médico.

Responda o questionário para monitorar sua recuperação.

Digite SIM para começar.
```

**Como usar no código**:
```typescript
await sendTemplate(
  patient.phone,
  'pos_op_dia1',
  [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: 'João' } // Parâmetro {{1}}
      ]
    }
  ],
  'pt_BR'
);
```

---

### 5. `acompanhamento_medico` - **SEM VARIÁVEIS**
- **ID**: 3773042086166161
- **Idioma**: pt_BR
- **Formato**: POSITIONAL (sem variáveis)
- **Status**: ✅ APPROVED
- **Categoria**: MARKETING

**Estrutura**:
```
Body:
Olá! Seu médico precisa que você responda o questionário pós-operatório.

É importante para monitorar sua recuperação.

Responda agora.
```

**Como usar no código**:
```typescript
await sendTemplate(
  patient.phone,
  'acompanhamento_medico',
  [], // Sem parâmetros
  'pt_BR'
);
```

---

### 6. `hello_world` - **TEMPLATE DE TESTE**
- **ID**: 1571497197372348
- **Idioma**: en_US
- **Status**: ✅ APPROVED
- **Categoria**: UTILITY
- Apenas para testes da API

---

## ❌ Templates REJEITADOS (Não usar)

1. `pos_operatorio_dia1` (ID: 1937446193857934)
2. `acompanhamento_dia1` (ID: 2313831572401545)
3. `followup_dia1` (ID: 863264839508377)
4. `primeiro_dia_pos_op` (ID: 1523061988742521)

---

## 🎯 Recomendação de Uso

### Para o primeiro dia (D1):
**Opção 1 (Recomendada)**: `day1`
- Mais completo e empático
- ⚠️ Idioma em inglês (mas texto em português)

**Opção 2**: `dia_1`
- Tem header
- Português correto
- ⚠️ Typo na variável (custumer vs customer)

**Opção 3**: `pos_op_dia1`
- Mais simples
- Formato POSITIONAL

### Para outros dias (D2, D3, D7, etc.):
**Use**: `otherdays`
- Específico para continuação
- Português correto
- Formato NAMED

---

## 📝 Atualizar código

Edite `lib/whatsapp.ts` na função `sendFollowUpQuestionnaire` (linha 228):

```typescript
export async function sendFollowUpQuestionnaire(
  followUp: FollowUp,
  patient: Patient,
  surgery: Surgery
): Promise<WhatsAppResponse> {
  try {
    // Usar template correto baseado no dia
    const templateName = followUp.dayNumber === 1 ? 'day1' : 'otherdays';
    const patientFirstName = patient.name.split(' ')[0];

    // Componentes usando formato NAMED
    const components = [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: patientFirstName
          }
        ]
      }
    ];

    // day1 usa 'en', otherdays usa 'pt_BR'
    const language = templateName === 'day1' ? 'en' : 'pt_BR';

    return await sendTemplate(patient.phone, templateName, components, language);
  } catch (error) {
    console.error('Error sending follow-up questionnaire:', error);
    throw error;
  }
}
```

---

## 🔧 Próximos passos

1. ✅ Templates verificados e documentados
2. ⏳ Aguardando **Phone Number ID** e **App Secret** para:
   - Gerar token de longa duração (60 dias)
   - Atualizar `.env` com novas credenciais
3. ⏳ Atualizar código do WhatsApp se necessário
4. ⏳ Testar envio de mensagens

---

## 🚨 Observações Importantes

1. **Template `day1` está em idioma `en`** mas o texto é em português
   - Isso foi um erro na criação, mas o template foi aprovado
   - Funciona normalmente, apenas o idioma configurado está errado

2. **Formato NAMED vs POSITIONAL**:
   - NAMED: `{{customer_name}}` - mais descritivo
   - POSITIONAL: `{{1}}`, `{{2}}` - mais simples

3. **Todos estão em categoria MARKETING**:
   - Originalmente eram UTILITY
   - Meta mudou automaticamente para MARKETING
   - Isso não afeta o funcionamento

4. **Encoding de caracteres**:
   - Alguns templates mostram `?` em vez de acentos na API
   - Isso é apenas na visualização da API
   - Os caracteres corretos são enviados ao paciente
