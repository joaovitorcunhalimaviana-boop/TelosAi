# Configuração das APIs - Sistema Pós-Operatório

## Status de Configuração

### Anthropic API (Claude AI)
- **Status**: ✅ Configurado
- **API Key**: Configurada no .env
- **Função**: Análise inteligente das respostas dos pacientes aos questionários

### WhatsApp Business API
- **Status**: ✅ Configurado
- **Phone Number ID**: 857908160740631
- **Business Account ID**: 1699737104331443
- **Função**: Envio automático de mensagens e questionários

### Número do Médico
- **Status**: ✅ Configurado
- **Número**: +55 83 99122-1599
- **Função**: Receber alertas de red flags

---

## Como Testar as APIs

### Opção 1: Página de Configuração (Recomendado)

1. Acesse o sistema: http://localhost:3000
2. Faça login
3. Navegue até: **Dashboard → Settings → API Config**
4. URL direta: http://localhost:3000/dashboard/settings/api-config
5. Clique em "Testar Conexão" para cada API

### Opção 2: Teste Manual via API

**Testar Anthropic:**
```bash
curl -X POST http://localhost:3000/api/test/anthropic
```

**Testar WhatsApp:**
```bash
curl -X POST http://localhost:3000/api/test/whatsapp
```

---

## Variáveis de Ambiente (.env)

Todas as variáveis já estão configuradas no arquivo `.env`:

```env
# Anthropic API
ANTHROPIC_API_KEY="sk-ant-api03-..."

# WhatsApp API
WHATSAPP_PHONE_NUMBER_ID="857908160740631"
WHATSAPP_ACCESS_TOKEN="EAARBS2LEDjQ..."
WHATSAPP_BUSINESS_ACCOUNT_ID="1699737104331443"

# Telefone do Médico
DOCTOR_PHONE_NUMBER="5583991221599"
```

---

## Como Funciona o Sistema

### 1. Questionários Automáticos
- O sistema envia questionários via WhatsApp nos dias D+1, D+3, D+7, D+15 e D+30
- Os pacientes respondem às perguntas sobre dor, sangramento, febre, etc.

### 2. Análise Inteligente (Claude AI)
- As respostas são analisadas pela IA da Anthropic
- A IA detecta red flags e calcula o nível de risco
- Gera respostas empáticas personalizadas para cada paciente

### 3. Alertas Automáticos
- Se detectado risco alto ou crítico, o médico recebe um alerta via WhatsApp
- O alerta contém: nome do paciente, dia pós-operatório, nível de risco e red flags

### 4. Dashboard de Monitoramento
- Visualize todos os follow-ups em tempo real
- Filtre por nível de risco, tipo de cirurgia, etc.
- Acesse histórico completo de cada paciente

---

## Troubleshooting

### API Anthropic não funciona
1. Verifique se a chave está correta no .env
2. Verifique se tem créditos na conta Anthropic
3. Teste em: https://console.anthropic.com/settings/keys

### API WhatsApp não funciona
1. Verifique se o token não expirou
2. Confirme o Phone Number ID está correto
3. Verifique se o número de telefone está verificado no Meta
4. Acesse: https://developers.facebook.com/apps/

### Alertas não estão sendo enviados
1. Verifique o DOCTOR_PHONE_NUMBER no .env
2. Confirme que o número está no formato correto: 5583991221599
3. O número deve estar cadastrado no WhatsApp Business API

---

## Próximos Passos

1. **Testar as APIs** na página de configuração
2. **Cadastrar um paciente de teste**
3. **Enviar um questionário de teste**
4. **Verificar se as respostas são analisadas corretamente**
5. **Confirmar recebimento de alertas**

---

## Suporte

Para dúvidas sobre as APIs:
- **Anthropic**: https://docs.anthropic.com
- **WhatsApp**: https://developers.facebook.com/docs/whatsapp
