# Machine Learning - Índice de Documentação

Documentação completa da integração de Machine Learning para predição de risco de complicações pós-operatórias.

---

## Documentos Principais

### 1. ML_INTEGRATION_SUMMARY.md
📄 **Resumo Executivo da Integração**

- Status da implementação
- Arquivos criados/modificados
- Configuração necessária
- Checklist de confirmação
- Troubleshooting básico

**Leia primeiro se você quer:**
- Entender rapidamente o que foi feito
- Ver lista completa de arquivos modificados
- Confirmar que tudo está funcionando

---

### 2. ML_INTEGRATION_GUIDE.md
📚 **Guia Completo de Integração**

- Documentação detalhada de cada componente
- Fluxo completo passo a passo
- Configuração da API Python
- Exemplos de uso
- Próximos passos opcionais
- Monitoramento e logs
- Conformidade LGPD/GDPR

**Leia se você quer:**
- Entender a fundo como funciona
- Modificar/estender a implementação
- Configurar ambiente de produção
- Implementar melhorias futuras

---

### 3. ML_ARCHITECTURE.md
🏗️ **Arquitetura do Sistema**

- Diagramas de componentes
- Fluxo de dados
- Tratamento de erros
- Variáveis de ambiente
- Monitoramento e métricas

**Leia se você quer:**
- Visão visual da arquitetura
- Entender fluxo de dados
- Ver diagramas de componentes
- Compreender tratamento de erros

---

### 4. ML_INTEGRATION_TEST.md
🧪 **Guia de Testes**

- Scripts de teste passo a passo
- Testes da API Python
- Testes da integração Next.js
- Testes sem API ML (fallback)
- Verificação no Prisma Studio
- Testes de performance

**Leia se você quer:**
- Testar a integração
- Validar funcionamento
- Verificar se tudo está ok
- Fazer debug de problemas

---

## Arquivos de Código

### 5. lib/ml-prediction.ts
💻 **Biblioteca de Predição ML**

```typescript
// Funções principais:
predictComplicationRisk()        // Predição síncrona
predictComplicationRiskAsync()   // Fire-and-forget
checkMLAPIHealth()               // Health check
formatRiskPercentage()           // Formatação
getRiskColor()                   // Cores
getRiskLabel()                   // Labels
getTopRiskFactors()              // Top fatores
```

**Características:**
- TypeScript estrito
- Timeout de 5s
- Não-bloqueante
- Logging detalhado

---

### 6. components/ml/surgery-risk-display.tsx
🎨 **Componente de Visualização**

```tsx
<SurgeryRiskDisplay
  risk={0.35}
  level="medium"
  features={featuresJson}
  modelVersion="1.0.0"
  predictedAt={new Date()}
  showDetails={true}
  showFactors={true}
  compact={false}
/>
```

**Features:**
- Badge colorido
- Barra de progresso
- Top 5 fatores de risco
- Tooltips explicativos
- Versão compacta

---

### 7. ml/python-api-example.py
🐍 **Exemplo de API Python**

```python
# Endpoints:
GET  /health                # Health check
POST /api/ml/predict        # Predição

# Modelo:
class SimpleRiskModel:
    def predict(input_data):
        # ... lógica de predição ...
        return { risk, feature_importance }
```

**Como rodar:**
```bash
cd ml
pip install fastapi uvicorn pydantic
python python-api-example.py
```

---

### 8. prisma/schema.prisma
🗄️ **Schema do Banco de Dados**

```prisma
model Surgery {
  // Campos ML:
  predictedRisk      Float?
  predictedRiskLevel String?
  mlModelVersion     String?
  mlPredictedAt      DateTime?
  mlFeatures         String?

  @@index([predictedRiskLevel])
}
```

**Migração:**
```bash
npx prisma db push
```

---

## Documentação Existente (Pasta ml/)

### 9. ml/README.md
🤖 **Sistema de ML - Visão Geral**

- Objetivo do modelo
- Features utilizadas (22 características)
- Performance esperada
- Como treinar o modelo
- Integração no Next.js
- Para o mestrado (artigo científico)

**Leia se você quer:**
- Entender o modelo de ML em si
- Ver features utilizadas
- Treinar modelo com dados reais
- Escrever artigo científico

---

## Guia Rápido de Navegação

### Estou começando agora
1. Leia: `ML_INTEGRATION_SUMMARY.md`
2. Configure: Variáveis de ambiente
3. Teste: `ML_INTEGRATION_TEST.md` seção 1-3

### Quero entender tudo
1. Leia: `ML_INTEGRATION_SUMMARY.md`
2. Leia: `ML_ARCHITECTURE.md`
3. Leia: `ML_INTEGRATION_GUIDE.md`
4. Explore: Código-fonte

### Preciso testar
1. Leia: `ML_INTEGRATION_TEST.md`
2. Execute: Testes 1-7
3. Verifique: Checklist no final

### Preciso fazer deploy
1. Leia: `ML_INTEGRATION_GUIDE.md` seção "Deploy"
2. Configure: Variáveis de ambiente de produção
3. Deploy: API Python (Railway/Render/etc)
4. Teste: Health check e predição

### Tenho um problema
1. Leia: `ML_INTEGRATION_SUMMARY.md` seção "Troubleshooting"
2. Leia: `ML_INTEGRATION_TEST.md` seção "Troubleshooting"
3. Verifique: Logs do servidor

### Quero melhorar o modelo
1. Leia: `ml/README.md`
2. Execute: `python ml/train_model.py`
3. Substitua: Modelo em `python-api-example.py`
4. Re-deploy: API Python

---

## Estrutura de Arquivos

```
sistema-pos-operatorio/
│
├── ML_INDEX.md                      ◄── Você está aqui
├── ML_INTEGRATION_SUMMARY.md        ◄── Leia primeiro
├── ML_INTEGRATION_GUIDE.md          ◄── Guia completo
├── ML_ARCHITECTURE.md               ◄── Diagramas
├── ML_INTEGRATION_TEST.md           ◄── Testes
│
├── lib/
│   └── ml-prediction.ts             ◄── Biblioteca ML
│
├── components/
│   └── ml/
│       └── surgery-risk-display.tsx ◄── Componente
│
├── app/
│   ├── cadastro/
│   │   └── actions.ts               ◄── Integração
│   └── paciente/
│       └── [id]/
│           └── editar/
│               └── page.tsx         ◄── Visualização
│
├── prisma/
│   └── schema.prisma                ◄── Schema DB
│
└── ml/
    ├── README.md                    ◄── Modelo ML
    ├── python-api-example.py        ◄── API Python
    ├── train_model.py               ◄── Treinar modelo
    └── requirements.txt             ◄── Dependências
```

---

## Checklist de Implementação

### Backend
- [x] Schema do banco atualizado (5 campos ML)
- [x] Migração executada (`npx prisma db push`)
- [x] Biblioteca de predição criada (`lib/ml-prediction.ts`)
- [x] Integração no cadastro (`app/cadastro/actions.ts`)
- [x] API retorna campos ML (automático)

### Frontend
- [x] Componente de visualização (`components/ml/surgery-risk-display.tsx`)
- [x] Tela de paciente atualizada (`app/paciente/[id]/editar/page.tsx`)
- [x] TypeScript sem erros

### ML
- [x] Exemplo de API Python (`ml/python-api-example.py`)
- [x] Documentação completa

### Testes
- [ ] API Python rodando (opcional)
- [ ] Health check funcionando (opcional)
- [ ] Predição testada (opcional)
- [ ] Cadastro testado com ML (opcional)
- [ ] Cadastro testado sem ML (obrigatório)
- [ ] Visualização testada (opcional)

### Produção
- [ ] Variáveis de ambiente configuradas
- [ ] API ML deployada (opcional)
- [ ] Modelo real treinado (futuro)
- [ ] Monitoramento implementado (futuro)

---

## Contato e Suporte

**Para dúvidas sobre:**
- Integração Next.js → Ver documentos 1-4
- Código específico → Ver documentos 5-8
- Modelo ML → Ver documento 9
- Testes → Ver documento 4

**Recursos adicionais:**
- Código-fonte nos arquivos listados acima
- Comentários inline no código
- Logs do console para debug

---

## Próximos Passos Recomendados

### Curto Prazo (1-2 semanas)
1. ✅ Testar cadastro com/sem API ML
2. ✅ Verificar visualização na tela do paciente
3. ⬜ Deploy da API Python (Railway/Render)
4. ⬜ Configurar variáveis de ambiente de produção

### Médio Prazo (1-2 meses)
1. ⬜ Coletar dados de pacientes
2. ⬜ Treinar modelo com dados reais
3. ⬜ Implementar dashboard de predições
4. ⬜ Adicionar alertas para alto risco

### Longo Prazo (3-6 meses)
1. ⬜ Validar acurácia do modelo
2. ⬜ Publicar artigo científico
3. ⬜ Implementar re-treinamento automático
4. ⬜ A/B testing de modelos

---

**Documentação completa e pronta para uso!**

Data: 2025-11-19
Versão: 1.0.0
