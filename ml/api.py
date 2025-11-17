"""
API Flask para servir modelo de ML
Endpoint para predição de complicações pós-operatórias
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from model import ComplicationPredictor
import os

app = Flask(__name__)
CORS(app)  # Permite requests do Next.js

# Carrega modelos (individual e coletivo)
MODEL_PATH = "models/complication_predictor.joblib"
MODEL_COLLECTIVE_PATH = "models/complication_predictor_collective.joblib"

predictor = ComplicationPredictor()
predictor_collective = ComplicationPredictor()

# Tenta carregar modelo individual
if os.path.exists(MODEL_PATH):
    try:
        predictor.load(MODEL_PATH)
        print("✅ Modelo individual carregado com sucesso!")
    except Exception as e:
        print(f"⚠️ Erro ao carregar modelo individual: {e}")
else:
    print("⚠️ Modelo individual não encontrado. Execute: python train_model.py")

# Tenta carregar modelo coletivo (preferencial)
if os.path.exists(MODEL_COLLECTIVE_PATH):
    try:
        predictor_collective.load(MODEL_COLLECTIVE_PATH)
        print("✅ Modelo coletivo carregado com sucesso!")
        print("   📊 Este modelo foi treinado com dados de múltiplos médicos")
    except Exception as e:
        print(f"⚠️ Erro ao carregar modelo coletivo: {e}")
else:
    print("💡 Modelo coletivo não encontrado. Execute: python train_model_collective.py")


@app.route("/health", methods=["GET"])
def health():
    """Health check"""
    return jsonify({
        "status": "ok",
        "models": {
            "individual": {
                "loaded": predictor.model is not None,
                "type": predictor.model_type if predictor.model else None,
                "metrics": predictor.metrics if predictor.metrics else None
            },
            "collective": {
                "loaded": predictor_collective.model is not None,
                "type": predictor_collective.model_type if predictor_collective.model else None,
                "metrics": predictor_collective.metrics if predictor_collective.metrics else None
            }
        },
        "recommended_model": "collective" if predictor_collective.model else "individual"
    })


@app.route("/predict", methods=["POST"])
def predict():
    """
    Endpoint de predição

    Body (JSON):
    {
        "idade": 65,
        "sexo": "Masculino",
        "comorbidades": "HAS,DM tipo 2",
        "tipo_cirurgia": "hemorroidectomia",
        "duracao_minutos": 90,
        "bloqueio_pudendo": 1,
        "dor_d1": 7,
        "retencao_urinaria": 1,
        "febre": 0,
        "sangramento_intenso": 0,
        "use_collective_model": true  // Opcional: força uso do modelo coletivo
    }

    Response:
    {
        "probability": 0.73,
        "prediction": 1,
        "risk_level": "high",
        "risk_label": "ALTO",
        "recommendation": "Monitoramento próximo recomendado...",
        "top_risk_factors": [...],
        "model_used": "collective" // ou "individual"
    }
    """
    try:
        data = request.json

        # Validação básica
        required_fields = [
            "idade", "sexo", "tipo_cirurgia", "dor_d1"
        ]

        for field in required_fields:
            if field not in data:
                return jsonify({
                    "error": f"Campo obrigatório ausente: {field}"
                }), 400

        # Escolhe modelo: coletivo se disponível e solicitado, senão individual
        use_collective = data.get("use_collective_model", True)

        if use_collective and predictor_collective.model is not None:
            model = predictor_collective
            model_used = "collective"
        elif predictor.model is not None:
            model = predictor
            model_used = "individual"
        else:
            return jsonify({
                "error": "Nenhum modelo treinado. Execute train_model.py ou train_model_collective.py primeiro."
            }), 503

        # Predição
        result = model.predict(data)
        result["model_used"] = model_used

        return jsonify(result)

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


@app.route("/feature-importance", methods=["GET"])
def feature_importance():
    """Retorna importância das features"""
    if predictor.model is None:
        return jsonify({
            "error": "Modelo não treinado"
        }), 503

    return jsonify({
        "feature_importance": predictor.feature_importance,
        "top_10": dict(list(predictor.feature_importance.items())[:10])
    })


@app.route("/metrics", methods=["GET"])
def metrics():
    """Retorna métricas do modelo"""
    if predictor.model is None:
        return jsonify({
            "error": "Modelo não treinado"
        }), 503

    return jsonify({
        "metrics": predictor.metrics,
        "model_type": predictor.model_type
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
