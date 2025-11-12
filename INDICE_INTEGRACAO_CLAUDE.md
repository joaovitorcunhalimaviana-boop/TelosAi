# Índice da Integração Claude AI

## Documentação Principal

📘 **[README_INTEGRACAO.md](./README_INTEGRACAO.md)** - Guia rápido de uso e configuração

📚 **[INTEGRACAO_CLAUDE_AI.md](./INTEGRACAO_CLAUDE_AI.md)** - Documentação técnica completa

📖 **[docs/exemplos-respostas-ia.md](./docs/exemplos-respostas-ia.md)** - Exemplos de respostas esperadas da IA

## Arquivos de Código

### Biblioteca Principal (`lib/`)

| Arquivo | Descrição | Linhas |
|---------|-----------|--------|
| **[lib/anthropic.ts](./lib/anthropic.ts)** | Cliente Anthropic + análise de IA | ~250 |
| **[lib/red-flags.ts](./lib/red-flags.ts)** | Sistema de red flags determinístico | ~300 |
| **[lib/config.ts](./lib/config.ts)** | Configurações centralizadas | ~250 |

### API Route

| Arquivo | Descrição | Linhas |
|---------|-----------|--------|
| **[app/api/analyze-response/route.ts](./app/api/analyze-response/route.ts)** | Endpoint REST para análise | ~250 |

### Tipos TypeScript

| Arquivo | Descrição | Linhas |
|---------|-----------|--------|
| **[types/followup.ts](./types/followup.ts)** | Tipos e interfaces | ~250 |

### Exemplos e Testes

| Arquivo | Descrição | Linhas |
|---------|-----------|--------|
| **[lib/anthropic.example.ts](./lib/anthropic.example.ts)** | Exemplos de uso | ~150 |
| **[lib/red-flags.test.ts](./lib/red-flags.test.ts)** | Testes do sistema de red flags | ~400 |
| **[scripts/validate-setup.ts](./scripts/validate-setup.ts)** | Script de validação | ~300 |

## Estrutura de Arquivos

```
C:\Users\joaov\sistema-pos-operatorio\
│
├── 📁 lib/                              # Bibliotecas principais
│   ├── anthropic.ts                     # ⭐ Cliente Anthropic + análise IA
│   ├── anthropic.example.ts             # Exemplos de uso
│   ├── red-flags.ts                     # ⭐ Sistema de red flags
│   ├── red-flags.test.ts                # Testes de red flags
│   └── config.ts                        # ⭐ Configurações
│
├── 📁 app/api/                          # API Routes
│   └── analyze-response/
│       └── route.ts                     # ⭐ Endpoint de análise
│
├── 📁 types/                            # Tipos TypeScript
│   └── followup.ts                      # ⭐ Tipos do follow-up
│
├── 📁 scripts/                          # Scripts utilitários
│   └── validate-setup.ts                # Validação do setup
│
├── 📁 docs/                             # Documentação adicional
│   └── exemplos-respostas-ia.md         # Exemplos de respostas
│
├── 📄 README_INTEGRACAO.md              # ⭐ Guia rápido
├── 📄 INTEGRACAO_CLAUDE_AI.md           # ⭐ Documentação completa
└── 📄 INDICE_INTEGRACAO_CLAUDE.md       # Este arquivo
```

## Guia de Navegação Rápida

### Para Começar
1. ✅ **[README_INTEGRACAO.md](./README_INTEGRACAO.md)** - Leia primeiro
2. ✅ Configure a API key no `.env`
3. ✅ Execute `npx ts-node scripts/validate-setup.ts`

### Para Desenvolvedores
1. 📖 **[INTEGRACAO_CLAUDE_AI.md](./INTEGRACAO_CLAUDE_AI.md)** - Arquitetura completa
2. 💻 **[lib/anthropic.ts](./lib/anthropic.ts)** - Implementação da IA
3. 🔴 **[lib/red-flags.ts](./lib/red-flags.ts)** - Regras de detecção
4. 🌐 **[app/api/analyze-response/route.ts](./app/api/analyze-response/route.ts)** - API endpoint

### Para Testes
1. 🧪 **[lib/red-flags.test.ts](./lib/red-flags.test.ts)** - Testes de red flags
2. 📝 **[lib/anthropic.example.ts](./lib/anthropic.example.ts)** - Exemplos práticos
3. ✔️ **[scripts/validate-setup.ts](./scripts/validate-setup.ts)** - Validação completa

### Para Referência
1. 📊 **[docs/exemplos-respostas-ia.md](./docs/exemplos-respostas-ia.md)** - Respostas esperadas
2. ⚙️ **[lib/config.ts](./lib/config.ts)** - Todas as configurações
3. 🎯 **[types/followup.ts](./types/followup.ts)** - Tipos e interfaces

## Funcionalidades Implementadas

### ✅ Sistema de Red Flags Determinístico
- [x] Red flags universais (todos os tipos de cirurgia)
- [x] Red flags específicos por tipo de cirurgia
  - [x] Hemorroidectomia
  - [x] Fístula
  - [x] Fissura
  - [x] Pilonidal
- [x] Classificação de severidade (critical, high, medium)
- [x] Cálculo automático de nível de risco

### ✅ Integração Claude AI
- [x] Cliente Anthropic configurado
- [x] Análise contextual de respostas
- [x] Geração de resposta empática
- [x] Detecção de red flags adicionais pela IA
- [x] Orientação sobre buscar atendimento

### ✅ API REST
- [x] POST /api/analyze-response - Analisar resposta
- [x] GET /api/analyze-response?responseId=X - Buscar análise
- [x] Validação de dados
- [x] Tratamento de erros
- [x] Salvamento no banco de dados

### ✅ Tipos TypeScript
- [x] Tipos completos para follow-up
- [x] Validação de dados
- [x] Helpers e utilitários
- [x] Type-safety em toda a aplicação

### ✅ Configurações
- [x] Configurações centralizadas
- [x] Thresholds configuráveis
- [x] Mensagens WhatsApp padrão
- [x] Configuração de alertas médicos

### ✅ Testes e Validação
- [x] Testes de red flags
- [x] Exemplos de uso
- [x] Script de validação completo
- [x] Exemplos de respostas esperadas

## Comandos Úteis

```bash
# Validar instalação completa
npx ts-node scripts/validate-setup.ts

# Testar sistema de red flags
npx ts-node lib/red-flags.test.ts

# Executar exemplos
npx ts-node lib/anthropic.example.ts

# Iniciar servidor
npm run dev

# Testar API (requer jq para formatação)
curl -X POST http://localhost:3000/api/analyze-response \
  -H "Content-Type: application/json" \
  -d '{"followUpId":"test-id","questionnaireData":{"painLevel":5}}' \
  | jq
```

## Variáveis de Ambiente Necessárias

```bash
# .env
ANTHROPIC_API_KEY="sk-ant-..."        # ⭐ OBRIGATÓRIO
DATABASE_URL="postgresql://..."       # ⭐ OBRIGATÓRIO
NODE_ENV="development"                # Opcional
```

## Dependências Principais

```json
{
  "@anthropic-ai/sdk": "^0.68.0",
  "@prisma/client": "^6.19.0",
  "zod": "^4.1.12"
}
```

## Estatísticas do Projeto

- **Total de arquivos criados**: 8
- **Total de linhas de código**: ~2,000
- **Linguagens**: TypeScript, Markdown
- **Modelo IA**: Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
- **Custo estimado por análise**: ~$0.008
- **Tempo médio de análise**: 2-5 segundos

## Próximos Passos Sugeridos

1. ⬜ Integração com WhatsApp (envio automático de respostas)
2. ⬜ Dashboard médico (visualização de alertas)
3. ⬜ Sistema de notificações (SMS/Email)
4. ⬜ Histórico e comparação de respostas
5. ⬜ Relatórios e analytics
6. ⬜ Exportação para pesquisa científica

## Recursos Adicionais

- **Documentação Anthropic**: https://docs.anthropic.com/
- **Status da API**: https://status.anthropic.com/
- **Console Anthropic**: https://console.anthropic.com/
- **Prisma Docs**: https://www.prisma.io/docs

## Suporte

Para questões sobre a integração:
1. Consulte a documentação completa
2. Verifique os exemplos de código
3. Execute o script de validação
4. Revise os logs de erro

---

**Desenvolvido para**: Sistema de Acompanhamento Pós-Operatório - Dr. João Vitor Viana
**Tecnologias**: Next.js 16, TypeScript, Claude AI, PostgreSQL, Prisma
**Data**: Novembro 2025
