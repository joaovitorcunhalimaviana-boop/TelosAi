"""
Exemplo de API Python para Predição de Risco de Complicações Pós-Operatórias

Este é um exemplo de implementação da API ML esperada pelo sistema Next.js.
Adapte conforme seu modelo e framework preferido.

Dependências:
- fastapi
- uvicorn
- pydantic
- scikit-learn (ou seu framework ML preferido)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import joblib
import numpy as np
from datetime import datetime

# ============================================
# CONFIGURAÇÃO DA API
# ============================================

app = FastAPI(
    title="ML Prediction API",
    description="API para predição de risco de complicações pós-operatórias",
    version="1.0.0"
)

# CORS para permitir chamadas do Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique o domínio do Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# MODELOS DE DADOS
# ============================================

class PredictionInput(BaseModel):
    """Dados de entrada para predição"""
    age: Optional[int] = Field(None, ge=0, le=120, description="Idade do paciente")
    sex: Optional[str] = Field(None, description="Sexo (Masculino/Feminino/Outro)")
    surgeryType: str = Field(..., description="Tipo de cirurgia")
    hasComorbidities: Optional[bool] = Field(False, description="Possui comorbidades")
    comorbidityCount: Optional[int] = Field(0, ge=0, description="Número de comorbidades")
    medicationCount: Optional[int] = Field(0, ge=0, description="Número de medicações")

    class Config:
        json_schema_extra = {
            "example": {
                "age": 45,
                "sex": "Masculino",
                "surgeryType": "hemorroidectomia",
                "hasComorbidities": True,
                "comorbidityCount": 2,
                "medicationCount": 3
            }
        }


class PredictionOutput(BaseModel):
    """Resultado da predição"""
    risk: float = Field(..., ge=0.0, le=1.0, description="Probabilidade de complicação (0-1)")
    feature_importance: Dict[str, float] = Field(..., description="Importância de cada feature")
    model_version: str = Field(..., description="Versão do modelo usado")


class HealthResponse(BaseModel):
    """Resposta do health check"""
    status: str
    version: str
    timestamp: str


# ============================================
# MODELO ML (EXEMPLO SIMPLIFICADO)
# ============================================

class SimpleRiskModel:
    """
    Modelo exemplo simplificado.

    IMPORTANTE: Substitua por seu modelo real treinado!
    Este é apenas um exemplo para demonstrar a estrutura.
    """

    def __init__(self):
        self.version = "1.0.0"

        # Mapeamento de tipos de cirurgia para risco base
        self.surgery_base_risk = {
            "hemorroidectomia": 0.15,
            "fistula": 0.20,
            "fissura": 0.10,
            "pilonidal": 0.18,
        }

    def predict(self, input_data: PredictionInput) -> dict:
        """
        Faz a predição de risco.

        SUBSTITUA ESTA LÓGICA pelo seu modelo real!
        """
        # Risco base por tipo de cirurgia
        base_risk = self.surgery_base_risk.get(input_data.surgeryType, 0.15)

        # Fatores de risco (exemplo simplificado)
        risk = base_risk
        feature_importance = {}

        # Idade (quanto mais velho, maior o risco)
        if input_data.age:
            age_factor = max(0, (input_data.age - 40) / 100)
            risk += age_factor * 0.15
            feature_importance['age'] = age_factor
        else:
            feature_importance['age'] = 0.0

        # Comorbidades
        if input_data.comorbidityCount:
            comorbidity_factor = min(1.0, input_data.comorbidityCount / 5)
            risk += comorbidity_factor * 0.25
            feature_importance['comorbidityCount'] = comorbidity_factor
        else:
            feature_importance['comorbidityCount'] = 0.0

        # Medicações (pode indicar condições de saúde)
        if input_data.medicationCount:
            medication_factor = min(1.0, input_data.medicationCount / 10)
            risk += medication_factor * 0.10
            feature_importance['medicationCount'] = medication_factor
        else:
            feature_importance['medicationCount'] = 0.0

        # Tipo de cirurgia
        feature_importance['surgeryType'] = base_risk / 0.20  # Normalizado

        # Normalizar importâncias para somar 1.0
        total_importance = sum(feature_importance.values())
        if total_importance > 0:
            feature_importance = {
                k: v / total_importance
                for k, v in feature_importance.items()
            }

        # Limitar risco entre 0 e 1
        risk = min(1.0, max(0.0, risk))

        return {
            "risk": round(risk, 4),
            "feature_importance": feature_importance,
            "model_version": self.version
        }


# Instância global do modelo
# Em produção, carregue de um arquivo:
# model = joblib.load('model.pkl')
model = SimpleRiskModel()


# ============================================
# ENDPOINTS
# ============================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    Usado pelo Next.js para verificar disponibilidade.
    """
    return {
        "status": "ok",
        "version": model.version,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.post("/api/ml/predict", response_model=PredictionOutput)
async def predict_complication_risk(input_data: PredictionInput):
    """
    Prediz o risco de complicações pós-operatórias.

    Args:
        input_data: Dados do paciente e cirurgia

    Returns:
        Predição de risco com feature importance

    Raises:
        HTTPException: Se houver erro na predição
    """
    try:
        # Fazer predição
        result = model.predict(input_data)

        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar predição: {str(e)}"
        )


@app.get("/")
async def root():
    """Endpoint raiz com informações da API"""
    return {
        "name": "ML Prediction API",
        "version": model.version,
        "endpoints": {
            "health": "/health",
            "predict": "/api/ml/predict",
            "docs": "/docs"
        }
    }


# ============================================
# EXECUÇÃO
# ============================================

if __name__ == "__main__":
    import uvicorn

    # Desenvolvimento
    uvicorn.run(
        "python-api-example:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

    # Produção (usar gunicorn ou similar):
    # gunicorn python-api-example:app -w 4 -k uvicorn.workers.UvicornWorker


# ============================================
# MODELO REAL - EXEMPLO COM SCIKIT-LEARN
# ============================================

"""
Para usar um modelo real treinado:

1. Treinar o modelo:
```python
from sklearn.ensemble import RandomForestClassifier
import pandas as pd

# Carregar dados de treinamento
df = pd.read_csv('training_data.csv')
X = df[['age', 'comorbidityCount', 'medicationCount', ...]]
y = df['had_complication']

# Treinar modelo
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# Salvar modelo
import joblib
joblib.dump(model, 'risk_model.pkl')
```

2. Carregar modelo na API:
```python
model = joblib.load('risk_model.pkl')

def predict(input_data: PredictionInput):
    # Preparar features
    features = np.array([[
        input_data.age or 50,
        input_data.comorbidityCount or 0,
        input_data.medicationCount or 0,
        # ... outras features
    ]])

    # Predição
    risk_proba = model.predict_proba(features)[0][1]

    # Feature importance
    feature_importance = dict(zip(
        ['age', 'comorbidityCount', 'medicationCount'],
        model.feature_importances_
    ))

    return {
        "risk": float(risk_proba),
        "feature_importance": feature_importance,
        "model_version": "1.0.0"
    }
```
"""


# ============================================
# TESTES
# ============================================

"""
Testar a API:

1. Rodar servidor:
   python python-api-example.py

2. Testar no navegador:
   http://localhost:8000/docs

3. Testar com curl:
   curl -X POST http://localhost:8000/api/ml/predict \
     -H "Content-Type: application/json" \
     -d '{
       "age": 45,
       "sex": "Masculino",
       "surgeryType": "hemorroidectomia",
       "hasComorbidities": true,
       "comorbidityCount": 2,
       "medicationCount": 3
     }'

4. Health check:
   curl http://localhost:8000/health
"""
