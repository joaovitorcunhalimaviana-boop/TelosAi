# Relatório de Correção de Timezone - Follow-ups

## Problema Identificado

Os follow-ups estavam sendo agendados em UTC, o que causava mensagens chegando no horário errado para os pacientes no Brasil.

## Solução Implementada

### 1. Arquivo: `lib/follow-up-scheduler.ts`

**Mudanças:**
- Adicionado import das funções de timezone: `toBrasiliaTime`, `fromBrasiliaTime`, `BRASILIA_TZ` do módulo `@/lib/date-utils`
- Adicionada constante `SEND_HOUR = 10` para definir o horário de envio (10:00 BRT)
- Modificada função `createFollowUpSchedule()`:
  - Agora converte a data da cirurgia para timezone de Brasília
  - Define o horário de envio como 10:00 BRT
  - Converte de volta para UTC antes de salvar no banco de dados
- Modificada função `getTodayFollowUps()`:
  - Agora obtém a data atual no timezone de Brasília
  - Converte para UTC antes de consultar o banco de dados

**Exemplo de código implementado:**
```typescript
// Converter para timezone do Brasil
const zonedDate = toBrasiliaTime(scheduledDate);
zonedDate.setHours(SEND_HOUR, 0, 0, 0);

// Converter de volta para UTC para salvar no banco
const utcDate = fromBrasiliaTime(zonedDate);
```

### 2. Arquivo: `app/api/cron/send-followups/route.ts`

**Mudanças:**
- Atualizado comentário do cabeçalho para especificar "10:00 AM BRT (Brasília Time)"
- Adicionado import das funções de timezone: `toBrasiliaTime`, `fromBrasiliaTime`
- Modificada lógica de busca de follow-ups do dia:
  - Agora obtém a data atual no timezone de Brasília
  - Converte para UTC antes de consultar o banco de dados
- Atualizada função `getNextRunInfo()`:
  - Agora calcula o próximo horário de execução considerando o timezone de Brasília
  - Retorna o horário em UTC (ISO string)

### 3. Arquivo: `vercel.json`

**Mudanças:**
- Alterado o horário do cron job de `0 10 * * *` para `0 13 * * *`
- Motivo: Vercel Cron usa UTC, portanto 13:00 UTC = 10:00 BRT (Brasília está UTC-3)

**Antes:**
```json
{
  "crons": [
    {
      "path": "/api/cron/send-followups",
      "schedule": "0 10 * * *"
    }
  ]
}
```

**Depois:**
```json
{
  "crons": [
    {
      "path": "/api/cron/send-followups",
      "schedule": "0 13 * * *"
    }
  ]
}
```

## Dependências Utilizadas

O pacote `date-fns-tz` (versão 3.2.0) já estava instalado no projeto e foi utilizado através das funções wrapper em `lib/date-utils.ts`:
- `toBrasiliaTime()` - Converte UTC para timezone de Brasília
- `fromBrasiliaTime()` - Converte timezone de Brasília para UTC
- `BRASILIA_TZ` - Constante com valor 'America/Sao_Paulo'

## Como Funciona Agora

1. **Criação de Follow-ups:**
   - Quando uma cirurgia é cadastrada, os follow-ups são criados com datas calculadas a partir da data da cirurgia
   - Cada follow-up é agendado para as 10:00 da manhã (horário de Brasília) do dia correspondente (D+1, D+2, D+3, etc.)
   - As datas são armazenadas em UTC no banco de dados

2. **Envio de Follow-ups:**
   - O cron job do Vercel executa diariamente às 13:00 UTC (10:00 BRT)
   - A API busca todos os follow-ups agendados para "hoje" no timezone de Brasília
   - As mensagens são enviadas via WhatsApp no horário correto

3. **Consulta de Follow-ups:**
   - A função `getTodayFollowUps()` considera o timezone de Brasília ao buscar follow-ups do dia
   - Garante que follow-ups sejam listados corretamente independente do timezone do servidor

## Testes Recomendados

1. Criar um novo paciente com cirurgia realizada hoje
2. Verificar no banco de dados se os follow-ups foram criados com horário correto (UTC)
3. Testar a rota `/api/cron/send-followups` manualmente
4. Verificar se os follow-ups são listados corretamente no dashboard
5. Aguardar o próximo dia útil às 10:00 BRT para confirmar o envio automático

## Notas Importantes

- **Horário de Verão:** O timezone 'America/Sao_Paulo' já lida automaticamente com horário de verão brasileiro
- **UTC no Banco:** As datas continuam sendo armazenadas em UTC no banco de dados (padrão recomendado)
- **Conversão Transparente:** A conversão de timezone é feita apenas nas camadas de aplicação e apresentação
- **Compatibilidade:** As mudanças são retrocompatíveis com follow-ups já existentes no banco

## Arquivos Modificados

1. `lib/follow-up-scheduler.ts` - Lógica principal de agendamento
2. `app/api/cron/send-followups/route.ts` - Cron job de envio
3. `vercel.json` - Configuração do cron (horário ajustado para UTC)

## Data da Correção

20 de novembro de 2025
