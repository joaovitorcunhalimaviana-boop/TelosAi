# 🧠 Guia Completo de Inteligência Coletiva

## 📋 Visão Geral

O sistema de **Inteligência Coletiva** permite que médicos compartilhem dados anonimizados de seus pacientes para melhorar o modelo de Machine Learning de predição de complicações pós-operatórias.

### 🎯 Benefícios

**Para Médicos Participantes:**
- ✅ Modelo de IA **mais preciso** (treinado com dados de múltiplos perfis)
- ✅ Melhoria contínua sem esforço adicional
- ✅ Contribuição para avanço da ciência médica

**Para o Administrador (Você):**
- ✅ Acesso exclusivo às estatísticas agregadas
- ✅ Dados para publicações científicas
- ✅ Dashboard completo de insights
- ✅ Exportação de dados para análise

### 🔒 Privacidade e Conformidade

- ✅ **LGPD Compliant** (Art. 7º, IV; Art. 11; Art. 13 §3º)
- ✅ **Pseudonimização SHA-256** com salt secreto
- ✅ **Consentimento obrigatório** de cada paciente
- ✅ **Opt-in voluntário** dos médicos
- ✅ **Reversível a qualquer momento**

---

## 🚀 Como Testar o Workflow Completo

### Passo 1: Configurar Variável de Ambiente

Adicione ao `.env`:

```bash
# Salt para pseudonimização (mantenha secreto!)
PSEUDONYMIZATION_SALT=seu-salt-super-secreto-aqui-2024
```

### Passo 2: Onboarding de Novo Médico

1. Faça login com uma conta de médico (não admin)
2. Acesse `/onboarding`
3. Complete os 4 passos do tour
4. Ao finalizar, verá o **Modal de Inteligência Coletiva**
5. Leia as informações e escolha:
   - **"Participar"**: Ativa compartilhamento de dados
   - **"Não Participar Agora"**: Pode ativar depois nas configurações

### Passo 3: Gerenciar Participação nas Configurações

1. Acesse `/dashboard/settings`
2. Veja a aba **"Inteligência Coletiva"**
3. Use o toggle para ativar/desativar participação
4. Confira:
   - Status atual (ativo/inativo)
   - Data de adesão
   - Benefícios e privacidade
   - Pode sair a qualquer momento

### Passo 4: Coletar Consentimento do Paciente

1. Cadastre um paciente
2. Acesse `/termos/consentimento/[patientId]`
3. Workflow:
   - **Imprima** o termo (botão "Imprimir Termo")
   - **Apresente** ao paciente e explique
   - **Colete** assinatura manuscrita
   - **Upload** (opcional): Escaneie e faça upload do termo assinado
   - **Confirme**: Marque checkbox e clique em "Confirmar Consentimento"

### Passo 5: Verificar Dashboard Admin

1. Faça login como **admin**
2. Acesse `/admin/collective-intelligence`
3. Veja:
   - **Visão Geral**: Total de médicos participantes, pacientes, cirurgias
   - **Métricas**: Taxa de complicações, dor média D+1, taxa de bloqueio pudendo
   - **Insights de IA**: Padrões identificados automaticamente
   - **Gráficos**: Distribuição de cirurgias, top comorbidades
   - **Lista de Médicos Participantes**

### Passo 6: Exportar Dataset Pseudonimizado

**Via Dashboard:**

```javascript
// No componente CollectiveIntelligenceDashboard
// Botão "Exportar para Publicação (JSON)"
// Botão "Exportar CSV"
```

**Via API (para scripts Python):**

```bash
curl -X GET http://localhost:3000/api/collective-intelligence/export-dataset \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

Retorna:

```json
{
  "success": true,
  "dataset": {
    "exportDate": "2024-11-16T...",
    "totalPatients": 45,
    "totalSurgeries": 52,
    "totalFollowUps": 234,
    "patients": [
      {
        "pseudoId": "abc123...",
        "age": 45,
        "sex": "Masculino",
        "comorbidities": ["HAS", "DM tipo 2"],
        "surgeries": [...],
        "followUps": [...]
      }
    ],
    "metadata": {
      "version": "1.0.0",
      "pseudonymizationMethod": "SHA-256 with secret salt",
      "lgpdCompliant": true
    }
  },
  "stats": {
    "participatingDoctors": 5,
    "eligiblePatients": 45
  }
}
```

### Passo 7: Treinar Modelo com Dados Coletivos

```bash
cd ml
python train_model_collective.py
```

Output esperado:

```
============================================================
🤖 TREINAMENTO COM INTELIGÊNCIA COLETIVA
============================================================

📋 Este script usa dados PSEUDONIMIZADOS de:
   ✓ Médicos que optaram por participar
   ✓ Pacientes com termo de consentimento assinado
   ✓ Dados anonimizados (SHA-256)
   ✓ Conforme LGPD (Art. 7º, IV e Art. 11)

🔗 Buscando dataset coletivo pseudonimizado...
✅ Dataset carregado com sucesso!
   Médicos participantes: 5
   Pacientes elegíveis: 45
   Total de cirurgias: 52
   Total de follow-ups: 234

📊 Convertendo dataset para formato tabular...
✅ DataFrame criado: 156 amostras

📈 ANÁLISE EXPLORATÓRIA DOS DADOS COLETIVOS:
Total de amostras: 156
Complicações: 23 (14.7%)
Idade média: 52.3 anos (±15.2)
Dor D+1 média: 5.8/10 (±2.1)

...

✅ TREINAMENTO COM INTELIGÊNCIA COLETIVA CONCLUÍDO!
============================================================

🎯 Melhor modelo: Random Forest
📊 AUC-ROC: 0.827
📁 Salvo em: models/complication_predictor_collective.joblib

📈 Dados utilizados:
   • 45 pacientes pseudonimizados
   • 52 cirurgias
   • 234 follow-ups
   • De 5 médicos participantes

🔒 Privacidade:
   • Método: SHA-256 with secret salt
   • LGPD Compliant: True
```

### Passo 8: Iniciar API com Modelo Coletivo

```bash
cd ml
python api.py
```

Output:

```
✅ Modelo individual carregado com sucesso!
✅ Modelo coletivo carregado com sucesso!
   📊 Este modelo foi treinado com dados de múltiplos médicos
 * Running on http://127.0.0.1:5000
```

### Passo 9: Testar Predição

```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "idade": 65,
    "sexo": "Masculino",
    "comorbidades": "HAS,DM tipo 2",
    "tipo_cirurgia": "hemorroidectomia",
    "duracao_minutos": 90,
    "bloqueio_pudendo": 1,
    "dor_d1": 8,
    "retencao_urinaria": 1,
    "febre": 0,
    "sangramento_intenso": 0,
    "use_collective_model": true
  }'
```

Resposta:

```json
{
  "probability": 0.73,
  "prediction": 1,
  "risk_level": "high",
  "risk_label": "ALTO",
  "recommendation": "Monitoramento próximo recomendado. Considere contato preventivo.",
  "top_risk_factors": [
    {
      "name": "dor_alta_retencao",
      "contribution": 0.234
    },
    {
      "name": "idoso_com_dm",
      "contribution": 0.187
    }
  ],
  "model_used": "collective"
}
```

---

## 📊 Estrutura de Arquivos

```
sistema-pos-operatorio/
├── app/
│   ├── admin/
│   │   └── collective-intelligence/
│   │       └── page.tsx                    # Dashboard admin
│   ├── api/
│   │   └── collective-intelligence/
│   │       ├── opt-in/route.ts             # API opt-in médicos
│   │       └── export-dataset/route.ts     # API exportar dataset
│   ├── consent-term/
│   │   ├── confirm/route.ts                # API confirmar consentimento
│   │   └── upload/route.ts                 # API upload termo assinado
│   ├── termos/
│   │   └── consentimento/[patientId]/
│   │       └── page.tsx                    # Página do termo
│   ├── dashboard/
│   │   └── settings/
│   │       └── page.tsx                    # Configurações gerais
│   └── onboarding/
│       └── page.tsx                        # Onboarding + modal opt-in
├── components/
│   ├── admin/
│   │   └── CollectiveIntelligenceDashboard.tsx
│   ├── onboarding/
│   │   └── CollectiveIntelligenceModal.tsx
│   ├── settings/
│   │   └── CollectiveIntelligenceSettings.tsx
│   └── ConsentTermViewer.tsx
├── lib/
│   ├── consent-term-template.ts             # Template HTML do TCLE
│   └── collective-intelligence/
│       └── pseudonymizer.ts                 # Funções de pseudonimização
├── ml/
│   ├── train_model_collective.py            # Script treinar com dados coletivos
│   ├── api.py                               # Flask API (atualizada)
│   └── models/
│       ├── complication_predictor.joblib              # Modelo individual
│       └── complication_predictor_collective.joblib   # Modelo coletivo
└── prisma/
    ├── schema.prisma                        # Schema atualizado
    └── migrations/
        ├── 20251116231404_add_collective_intelligence/
        └── 20251116231831_add_consent_fields/
```

---

## 🔍 Verificações de Conformidade

### Checklist LGPD

- [x] **Art. 7º, IV** - Tratamento para estudo por órgão de pesquisa
- [x] **Art. 11** - Tratamento de dados sensíveis de saúde
- [x] **Art. 13 §3º** - Consentimento em formulários padrão
- [x] **Pseudonimização** - SHA-256 com salt secreto
- [x] **Consentimento explícito** - Termo físico assinado
- [x] **Opt-in voluntário** - Médicos escolhem participar
- [x] **Reversibilidade** - Podem sair a qualquer momento
- [x] **Transparência** - Uso dos dados claramente explicado

### Checklist Ética em Pesquisa

- [x] Consentimento informado
- [x] Voluntariedade garantida
- [x] Possibilidade de retirada
- [x] Transparência sobre uso dos dados
- [x] Anonimização robusta
- [x] Benefícios claramente comunicados

---

## 🎓 Para Publicações Científicas

### Exemplo de Metodologia

> **Coleta de Dados:** Foram coletados dados pseudonimizados de N pacientes submetidos a cirurgias colorretais, provenientes de X médicos participantes do programa de Inteligência Coletiva. Todos os médicos forneceram opt-in explícito para compartilhamento de dados anonimizados, e todos os pacientes assinaram Termo de Consentimento Livre e Esclarecido (TCLE) autorizando o uso de seus dados para pesquisa científica.
>
> **Pseudonimização:** Os dados foram pseudonimizados utilizando hash SHA-256 com salt secreto, conforme LGPD Art. 13 §3º, garantindo a impossibilidade de reidentificação dos pacientes.
>
> **Variáveis:** Foram analisadas 22 características incluindo dados demográficos (idade, sexo), comorbidades, tipo de cirurgia, duração do procedimento, técnicas anestésicas, e outcomes pós-operatórios (dor D+1, complicações).
>
> **Modelo:** Random Forest com X estimadores, validação cruzada 5-fold, AUC-ROC de Y.

### Exemplo de Resultados

> Dos X médicos participantes, Y pacientes foram incluídos após assinatura do TCLE. A taxa média de complicações foi de Z%, inferior à reportada na literatura (15-20%). O modelo preditivo alcançou AUC-ROC de W, demonstrando capacidade de identificar pacientes de alto risco com sensibilidade de S% e especificidade de E%.

---

## 🚨 Troubleshooting

### Erro: "Nenhum médico optou por participar ainda"

**Solução:**
1. Faça login como médico (não admin)
2. Acesse `/dashboard/settings`
3. Ative "Participar do Programa"

### Erro: "Nenhum paciente elegível"

**Solução:**
1. Certifique-se de que pacientes assinaram termo
2. Verifique campo `consentTermSigned = true` no banco
3. Use `/termos/consentimento/[patientId]` para coletar consentimento

### Erro: "Modelo coletivo não carregado"

**Solução:**
```bash
cd ml
python train_model_collective.py
```

### Dataset vazio na exportação

**Causa:** Médicos não optaram OU pacientes sem consentimento

**Solução:**
1. Verifique `collectiveIntelligenceOptIn = true` para médicos
2. Verifique `consentTermSigned = true` para pacientes
3. Query de debug:
```sql
SELECT COUNT(*) FROM "User" WHERE "collectiveIntelligenceOptIn" = true;
SELECT COUNT(*) FROM "Patient" WHERE "consentTermSigned" = true;
```

---

## 📞 Próximos Passos Recomendados

1. **Adicionar mais médicos ao programa** via campanha de marketing
2. **Coletar consentimentos** de pacientes existentes
3. **Treinar modelo coletivo** com dados reais
4. **Comparar performance** modelo individual vs coletivo
5. **Publicar artigo científico** com resultados agregados
6. **Implementar retreinamento automático** (cron job mensal)
7. **Adicionar métricas de drift** para monitorar performance do modelo

---

## 📚 Referências

- **LGPD**: Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
- **Resolução CNS 466/2012**: Pesquisa com Seres Humanos
- **Breiman, L. (2001)**: Random Forests. Machine Learning, 45(1), 5-32.
- **Friedman, J. H. (2001)**: Greedy function approximation: a gradient boosting machine.

---

**Dúvidas?** Entre em contato: joao@telos.ai
