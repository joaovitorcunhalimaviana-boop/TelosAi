# 🤖 Sistema de Machine Learning - Predição de Complicações

## 📋 Visão Geral

Sistema de Machine Learning que **prevê a probabilidade de complicações pós-operatórias** em cirurgia colorretal, usando Random Forest e Gradient Boosting.

## 🎯 Objetivo

Identificar pacientes com **alto risco de complicações** nos primeiros dias após a cirurgia, permitindo **intervenção precoce** e melhorando outcomes.

## 📊 Features Utilizadas

O modelo analisa **22 características** do paciente e da cirurgia:

### Demográficas
- **Idade** (normalizada 0-1)
- **Sexo** (M/F)

### Comorbidades
- **Número total** de comorbidades
- Comorbidades específicas:
  - HAS (Hipertensão)
  - DM tipo 2 (Diabetes)
  - Obesidade
  - IRC (Insuficiência Renal Crônica)
  - Tabagismo
  - DPOC

### Cirúrgicas
- **Tipo de cirurgia** (hemorroidectomia, fístula, fissura, pilonidal)
- **Duração** da cirurgia (minutos)
- **Bloqueio do nervo pudendo** (sim/não)

### Pós-Operatórias (D+1)
- **Dor** (escala 0-10)
- **Retenção urinária** (sim/não)
- **Febre** (sim/não)
- **Sangramento intenso** (sim/não)

### Features Derivadas (Interações)
- Idoso (>65 anos) com DM
- Dor alta (>7) + retenção urinária
- Múltiplas comorbidades (≥3) + cirurgia complexa

## 🏆 Performance do Modelo

Métricas esperadas (após treinamento com ~200 pacientes):

- **Acurácia**: 0.75-0.85
- **Precisão**: 0.70-0.80
- **Recall**: 0.65-0.75
- **F1-Score**: 0.70-0.80
- **AUC-ROC**: **0.80-0.90** ⭐

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
cd ml
pip install -r requirements.txt
```

### 2. Treinar o Modelo

```bash
python train_model.py
```

Este script:
- Conecta ao banco PostgreSQL
- Busca dados de pacientes com follow-ups completos
- Treina Random Forest e Gradient Boosting
- Compara modelos e salva o melhor
- Gera relatórios de performance

### 3. Iniciar API

```bash
python api.py
```

A API estará disponível em: `http://localhost:5000`

### 4. Testar API

```bash
# Health check
curl http://localhost:5000/health

# Predição
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
    "sangramento_intenso": 0
  }'
```

### 5. Integrar no Next.js

```tsx
import { ComplicationRiskPredictor } from "@/components/ml/ComplicationRiskPredictor"

<ComplicationRiskPredictor
  patientData={{
    idade: 65,
    sexo: "Masculino",
    comorbidades: "HAS,DM tipo 2",
    tipo_cirurgia: "hemorroidectomia",
    dor_d1: 8,
    retencao_urinaria: 1,
    // ...
  }}
/>
```

## 📈 Exemplo de Resposta

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
    },
    {
      "name": "dor_d1_normalizada",
      "contribution": 0.156
    }
  ]
}
```

## 🔬 Para o Mestrado

### Artigo Científico Sugerido

**Título:** "Desenvolvimento e Validação de Modelo Preditivo de Complicações Pós-Operatórias em Cirurgia Colorretal Utilizando Machine Learning"

**Estrutura:**

1. **Introdução**
   - Problema: Complicações pós-operatórias são frequentes
   - Objetivo: Predição precoce para intervenção

2. **Métodos**
   - Coleta de dados: N pacientes, X variáveis
   - Modelos: Random Forest, Gradient Boosting
   - Validação: 80/20 split, cross-validation 5-fold
   - Métricas: Acurácia, Sensibilidade, Especificidade, AUC-ROC

3. **Resultados**
   - AUC-ROC: 0.XX
   - Sensibilidade: XX%
   - Especificidade: XX%
   - Features mais importantes: Dor D+1, Idade, Comorbidades

4. **Discussão**
   - Modelo permite identificar pacientes de alto risco
   - Pode guiar intensificação de monitoramento
   - Limitações: Tamanho amostral, viés de seleção

5. **Conclusão**
   - Ferramenta viável para predição de complicações
   - Pode melhorar outcomes e reduzir custos

### Análises Adicionais

```python
# Curva ROC
from sklearn.metrics import roc_curve, auc
import matplotlib.pyplot as plt

fpr, tpr, _ = roc_curve(y_test, y_pred_proba)
roc_auc = auc(fpr, tpr)

plt.plot(fpr, tpr, label=f'AUC = {roc_auc:.2f}')
plt.xlabel('Taxa de Falsos Positivos')
plt.ylabel('Taxa de Verdadeiros Positivos')
plt.title('Curva ROC - Predição de Complicações')
plt.legend()
plt.savefig('roc_curve.png', dpi=300)
```

## 🎓 Conceitos Importantes

### O que é AUC-ROC?

AUC-ROC = Area Under the Receiver Operating Characteristic Curve

- **0.90-1.00**: Excelente
- **0.80-0.90**: Muito bom ⭐ (Nosso objetivo)
- **0.70-0.80**: Bom
- **0.60-0.70**: Regular
- **0.50**: Aleatório (inútil)

### Por que Random Forest?

1. **Resistente a overfitting**
2. **Lida bem com features correlacionadas**
3. **Fornece feature importance** (importante para artigo)
4. **Não requer normalização** (mas fazemos mesmo assim)
5. **Funciona bem com dados desbalanceados** (poucas complicações)

### Interpretando Feature Importance

```
dor_d1_normalizada: 0.234 (23.4%)
```

Significa que **23.4% da decisão do modelo** é baseada na dor D+1.

## 🚨 Considerações Éticas

1. **Não substitui julgamento clínico**
2. **Ferramenta auxiliar de decisão**
3. **Sempre explicar ao paciente**
4. **Documentar uso do modelo**
5. **Monitorar viés** (idade, sexo, etc)

## 📚 Referências

- Breiman, L. (2001). Random Forests. Machine Learning, 45(1), 5-32.
- Friedman, J. H. (2001). Greedy function approximation: a gradient boosting machine.
- Pedregosa et al. (2011). Scikit-learn: Machine Learning in Python. JMLR 12, pp. 2825-2830.

## 🔧 Troubleshooting

**Erro: Poucos dados**
- Mínimo: 30 pacientes (para testar)
- Recomendado: 100+ pacientes
- Ideal: 200+ pacientes

**Erro: Modelo não converge**
- Aumentar `max_iter`
- Reduzir `learning_rate`
- Simplificar modelo (reduzir `max_depth`)

**Erro: AUC baixo (<0.70)**
- Mais dados
- Mais features
- Feature engineering
- Verificar qualidade dos dados

## 📞 Suporte

Para dúvidas sobre ML:
- Dr. João Vitor Viana
- Email: joao@telos.ai
