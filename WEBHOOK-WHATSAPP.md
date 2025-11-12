# Configuração do Webhook do WhatsApp

## O que é o Webhook?

O webhook permite que o WhatsApp Business API envie mensagens dos pacientes para o seu sistema em tempo real. Sem o webhook configurado, você não receberá as respostas dos pacientes aos questionários.

---

## Pré-requisitos

1. ✅ App criado no Meta for Developers
2. ✅ WhatsApp Business API configurado no app
3. ✅ Sistema deployado na Vercel com URL pública
4. ✅ Variável `WHATSAPP_VERIFY_TOKEN` configurada

---

## Passo a Passo

### 1. Acessar Configurações do WhatsApp

1. Acesse: https://developers.facebook.com/apps/
2. Selecione seu app
3. No menu lateral: **WhatsApp** → **Configuration**

### 2. Configurar Webhook

Na seção "Webhook", você verá:

```
Callback URL: _____________________
Verify Token: _____________________
```

Preencha:
- **Callback URL**: `https://seu-dominio.vercel.app/api/webhook/whatsapp`
- **Verify Token**: O mesmo valor de `WHATSAPP_VERIFY_TOKEN` do seu `.env`
  - Padrão: `meu-token-super-secreto-2024`
  - Recomendado: Use um token forte e único

Clique em **"Verify and Save"**

**O que acontece?**
- O Meta faz uma requisição GET para sua URL
- Envia o token como parâmetro
- Seu sistema verifica se o token está correto
- Retorna um desafio se estiver OK
- Se tudo funcionar, o webhook é ativado ✅

### 3. Possíveis Erros

#### ❌ "Verification Failed"

**Causas:**
1. URL incorreta ou não acessível
2. Verify token não corresponde ao configurado no .env
3. Sistema não está rodando ou está com erro

**Solução:**
```bash
# Testar o webhook manualmente
curl "https://seu-dominio.vercel.app/api/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=meu-token-super-secreto-2024&hub.challenge=test"

# Deve retornar: test
```

Se não funcionar:
1. Verifique os logs da Vercel
2. Verifique se `WHATSAPP_VERIFY_TOKEN` está definido
3. Verifique se o sistema foi deployado corretamente

#### ❌ "The parameter verify_token is required"

**Solução:** Certifique-se de preencher o campo "Verify Token"

#### ❌ "Invalid URL"

**Causas:**
1. URL sem `https://`
2. URL com espaços ou caracteres inválidos
3. URL não acessível publicamente

**Solução:**
- Use a URL completa: `https://seu-dominio.vercel.app/api/webhook/whatsapp`
- Não use `http://` (apenas `https://`)
- Não use `localhost` (não funciona em produção)

### 4. Inscrever em Eventos (Subscribe)

Após verificar o webhook, você precisa se inscrever nos eventos que quer receber:

**Marque os seguintes eventos:**
- ✅ **messages** (OBRIGATÓRIO) - Recebe mensagens dos pacientes
- ✅ **message_status** (OPCIONAL) - Recebe status de entrega/leitura

Clique em **"Save"**

### 5. Testar o Webhook

#### Teste 1: Enviar Mensagem de Teste

No Meta for Developers:
1. Vá em **WhatsApp** → **Getting Started**
2. Na seção "Send and receive messages"
3. Adicione seu número de telefone como teste
4. Envie uma mensagem para o número do WhatsApp Business
5. Responda a mensagem

**Verificar:**
- Vá nos logs da Vercel: https://vercel.com/seu-usuario/sistema-pos-operatorio/logs
- Deve aparecer: `Webhook recebido: {...}`

#### Teste 2: Enviar Questionário Real

1. Cadastre um paciente no sistema
2. Use seu número de telefone
3. Registre uma cirurgia
4. Force o envio de um questionário (ou aguarde o agendamento)
5. Responda o questionário pelo WhatsApp

**Verificar:**
- A resposta deve aparecer no dashboard
- O sistema deve processar e responder automaticamente
- Se houver red flags, você deve receber um alerta

---

## Estrutura da Requisição do Webhook

Quando o WhatsApp envia uma mensagem para seu webhook, o payload é assim:

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15551234567",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "contacts": [
              {
                "profile": {
                  "name": "Nome do Paciente"
                },
                "wa_id": "5583999999999"
              }
            ],
            "messages": [
              {
                "from": "5583999999999",
                "id": "wamid.XXX",
                "timestamp": "1234567890",
                "text": {
                  "body": "Estou com dor nível 8"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

### O que o Sistema Faz

1. **Recebe a mensagem** no endpoint `/api/webhook/whatsapp`
2. **Extrai o número** do remetente (`from`)
3. **Busca o paciente** no banco de dados
4. **Busca o follow-up ativo** (aguardando resposta)
5. **Salva a resposta** no banco
6. **Analisa com Claude AI**:
   - Extrai sintomas (dor, febre, sangramento, etc.)
   - Detecta red flags
   - Calcula nível de risco
   - Gera resposta empática
7. **Responde ao paciente** automaticamente
8. **Alerta o médico** se necessário (risco alto/crítico)

---

## Segurança

### 1. Verificar Assinatura das Requisições (Recomendado)

Para garantir que as requisições vêm realmente do WhatsApp, você pode verificar a assinatura:

```typescript
// Adicionar ao webhook
import crypto from 'crypto';

const APP_SECRET = process.env.WHATSAPP_APP_SECRET;

function verifySignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', APP_SECRET)
    .update(payload)
    .digest('hex');

  return signature === `sha256=${expectedSignature}`;
}

// No webhook POST handler
const signature = request.headers.get('x-hub-signature-256');
const payload = await request.text();

if (!verifySignature(payload, signature)) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
}
```

### 2. Rate Limiting

Considere adicionar rate limiting para evitar spam:
- Máximo de 10 mensagens por minuto por número
- Máximo de 100 mensagens por hora

---

## Monitoramento

### Ver Logs do Webhook

**Vercel:**
```bash
vercel logs --follow
```

Ou acesse: https://vercel.com/seu-usuario/sistema-pos-operatorio/logs

**Filtrar apenas webhook:**
```bash
vercel logs | grep "webhook"
```

### Ver Estatísticas no Meta

1. Acesse: https://business.facebook.com
2. Vá em **WhatsApp Manager**
3. Clique em **Insights**
4. Veja:
   - Mensagens enviadas
   - Mensagens recebidas
   - Taxa de entrega
   - Erros

---

## Troubleshooting

### Webhook para de funcionar

**Causa:** WhatsApp desativa webhook após muitas falhas

**Solução:**
1. Corrigir erros no código
2. Reconfigurar webhook no Meta
3. Sempre retornar status 200, mesmo em erro

### Mensagens não chegam

**Verificar:**
1. ✅ Webhook está configurado?
2. ✅ Eventos "messages" está marcado?
3. ✅ Número do paciente está correto no banco?
4. ✅ Sistema está rodando?

### Respostas duplicadas

**Causa:** Webhook recebe a mesma mensagem múltiplas vezes

**Solução:** Implementar deduplicação por `message_id`:
```typescript
const messageId = message.id;
const existing = await prisma.processedMessage.findUnique({
  where: { messageId }
});
if (existing) return; // Já processada
```

---

## Próximos Passos

Após configurar o webhook:

1. ✅ Testar com seu próprio número
2. ✅ Cadastrar pacientes reais
3. ✅ Monitorar logs inicialmente
4. ✅ Ajustar parsing de respostas se necessário
5. ✅ Configurar alertas de erro (Sentry, etc.)

---

## Referências

- **Documentação oficial**: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks
- **Guia de webhooks**: https://developers.facebook.com/docs/graph-api/webhooks
- **API Reference**: https://developers.facebook.com/docs/whatsapp/cloud-api/reference
