# 🐛 PROBLEMAS IDENTIFICADOS E RESOLVIDOS - 19/11/2025

## Contexto
Paciente cadastrado ontem (18/11) deveria receber mensagem às 10h de hoje (19/11). Mensagem não chegou.

---

## ❌ PROBLEMA 1: Template WhatsApp com Parâmetros NAMED

### Erro Original
```json
{
  "error": "Parameter name is missing or empty"
}
```

### Causa Raiz
Templates `day1` e `otherdays` usam parâmetros NAMED (`{{customer_name}}`), que requerem formato específico:

```json
{
  "type": "body",
  "parameters": [{
    "type": "text",
    "text": "João",
    "name": "customer_name"  // ← Campo obrigatório estava faltando
  }]
}
```

Código estava enviando apenas:
```json
{
  "type": "text",
  "text": "João"  // ← Sem o campo "name"
}
```

### Solução Implementada
Substituir templates por versões com parâmetros POSICIONAIS:
- `day1` → `pos_op_dia1` (usa `{{1}}`)
- `otherdays` → `acompanhamento_medico` (sem parâmetros)

**Arquivo modificado:** `lib/whatsapp.ts` linha 227-254

**Teste manual:** ✅ Mensagem enviada com sucesso para 5583998663089

---

## ❌ PROBLEMA 2: Matching de Telefone Incorreto

### Erro Original
Paciente digitava "sim" → Sistema respondia: "Não identificamos você como paciente cadastrado"

### Causa Raiz
Função `findPatientByPhone()` buscava **últimos 9 dígitos** incorretamente:

**WhatsApp envia:** `558398663089` (país + DDD + número)
**Código pegava:** `.slice(-9)` = `398663089` ❌
**Deveria pegar:** `998663089` (com o "9" do celular)

**Telefone no banco:** `(83) 99866-3089`
**Normalizado:** `83998663089`
**Match falhava** porque `398663089` não está em `83998663089`

### Solução Implementada
1. Buscar pelos **últimos 8 dígitos** (mais confiável):
   ```typescript
   const last8 = normalizedPhone.slice(-8); // "98663089"
   ```

2. Fallback para **últimos 9** se não encontrar:
   ```typescript
   const last9 = normalizedPhone.slice(-9); // "998663089"
   ```

3. Adicionar **logs de debug** detalhados

**Arquivo modificado:** `app/api/whatsapp/webhook/route.ts` linha 306-342

**Teste:**
```
Telefone cadastrado: (83) 99866-3089
WhatsApp envia: 558398663089
Últimos 8: 98663089 ✅ MATCH
Paciente ENCONTRADO ✅
```

---

## ❌ PROBLEMA 3: Encoding de Caracteres (Interrogações)

### Erro Original
Mensagem WhatsApp mostrava:
- "Ol?" em vez de "Olá"
- "quest?rio" em vez de "questionário"
- "recupera??o" em vez de "recuperação"

### Causa Raiz
Templates no WhatsApp estão com encoding incorreto (não é UTF-8).

### Status
⚠️ **PROBLEMA IDENTIFICADO MAS NÃO RESOLVIDO**

Esse é um problema do **template criado na Meta**, não do código.

### Solução Recomendada
1. Deletar template `pos_op_dia1` atual
2. Recriar template com texto correto em UTF-8:
   ```
   Olá {{1}}!

   Este é seu sistema de acompanhamento pós-operatório enviado por seu médico.

   Responda o questionário para monitorar sua recuperação.

   Digite SIM para começar.
   ```

3. Aguardar aprovação da Meta (24-48h)

**OU:** Usar template `dia_1` que já existe e está aprovado:
```typescript
const templateName = followUp.dayNumber === 1 ? 'dia_1' : 'acompanhamento_medico';
```

**Template `dia_1` possui:**
- Header: "Acompanhamento Pós-Cirúrgico:"
- Parâmetro: `{{custumer_name}}` (note o typo "custumer")
- Texto bem formatado

---

## 📊 CRONOLOGIA DOS EVENTOS

**05:50 BRT** - Paciente cadastrado com data de cirurgia 18/11
**10:00 BRT** - Cron job executou ✅
**10:00 BRT** - Tentou enviar mensagem ❌ (erro de parâmetro)
**14:25 BRT** - Teste manual enviou mensagem ✅
**14:30 BRT** - Paciente digitou "sim" ❌ (não encontrou no banco)
**15:00 BRT** - Correções implementadas e em deploy

---

## ✅ STATUS FINAL

| Problema | Status | Próximo Passo |
|----------|--------|---------------|
| Template NAMED | ✅ RESOLVIDO | Usar `pos_op_dia1` |
| Matching telefone | ✅ RESOLVIDO | Deploy no Railway |
| Encoding UTF-8 | ⚠️ PENDENTE | Recriar template ou usar `dia_1` |

---

## 🧪 COMO TESTAR AGORA

1. **Aguardar deploy finalizar** (2-3 minutos)

2. **Resetar status do follow-up** no banco:
   ```sql
   UPDATE "FollowUp"
   SET status = 'pending', "sentAt" = NULL
   WHERE id = 'cmi5rhsae0004nr0ql4875zt4';
   ```

3. **Chamar cron manualmente:**
   ```bash
   curl -X GET "https://proactive-rejoicing-production.up.railway.app/api/cron/send-followups" \
     -H "Authorization: Bearer eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA="
   ```

4. **Mensagem deve chegar** com texto (ignorar interrogações por enquanto)

5. **Digitar "sim"** → Sistema deve **reconhecer paciente** ✅

6. **Sistema deve iniciar questionário** (perguntas de dor, sintomas, etc)

---

## 📝 OBSERVAÇÕES

### Template `acompanhamento_medico` (D+2 em diante)
- ✅ Sem parâmetros (mais simples)
- ✅ Sem problemas de encoding
- ✅ Texto curto e direto
- Texto: "Olá! Seu médico precisa que você responda o questionário pós-operatório."

### Template `pos_op_dia1` (D+1)
- ⚠️ Com interrogações (encoding ruim)
- ✅ Parâmetro posicional {{1}} funciona
- Recomendação: Substituir por `dia_1` temporariamente

---

## 🔧 CORREÇÃO RÁPIDA DO ENCODING

Se quiser corrigir o encoding AGORA sem esperar Meta:

```typescript
// Em lib/whatsapp.ts linha 229
const templateName = followUp.dayNumber === 1 ? 'dia_1' : 'acompanhamento_medico';
```

Template `dia_1`:
- ✅ Encoding correto (acentos funcionam)
- ✅ Parâmetro `{{custumer_name}}` (posicional)
- ✅ Já aprovado pela Meta
- ✅ Header bonito: "Acompanhamento Pós-Cirúrgico:"

---

**Data:** 19/11/2025 15:10 BRT
**Status:** Correções em deploy, aguardando Railway
**Próximo teste:** Após deploy (manual ou aguardar amanhã 10h)
