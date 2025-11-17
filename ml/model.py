"""
Modelo de Machine Learning para Predição de Complicações Pós-Operatórias
Sistema Telos.AI

Este modelo prevê a probabilidade de um paciente ter complicações
no pós-operatório baseado em características pré e pós-operatórias.

Autor: Dr. João Vitor Viana
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
)
import joblib
from typing import Dict, List, Tuple, Optional
import json
from datetime import datetime


class ComplicationPredictor:
    """
    Preditor de complicações pós-operatórias em cirurgia colorretal
    """

    def __init__(self, model_type: str = "random_forest"):
        """
        Inicializa o preditor

        Args:
            model_type: 'random_forest' ou 'gradient_boosting'
        """
        self.model_type = model_type
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_names = []
        self.feature_importance = {}
        self.metrics = {}

    def prepare_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Prepara features para o modelo

        Features utilizadas:
        - Idade
        - Sexo (M/F)
        - Número de comorbidades
        - Comorbidades específicas (HAS, DM, etc)
        - Tipo de cirurgia
        - Técnica cirúrgica
        - Duração da cirurgia
        - Uso de bloqueio pudendo
        - Dor D+1 (0-10)
        - Retenção urinária (sim/não)
        - Febre D+1 (sim/não)
        - Sangramento intenso (sim/não)
        """
        df = data.copy()

        # 1. Features demográficas
        df["idade_normalizada"] = df["idade"] / 100  # Normaliza 0-1

        # Sexo: 1 = Masculino, 0 = Feminino
        df["sexo_masculino"] = (df["sexo"] == "Masculino").astype(int)

        # 2. Comorbidades
        df["num_comorbidades"] = df["comorbidades"].apply(
            lambda x: len(x.split(",")) if pd.notna(x) and x else 0
        )

        # Comorbidades específicas (OneHot)
        comorbidades_importantes = [
            "HAS",
            "DM tipo 2",
            "Obesidade",
            "IRC",
            "Tabagismo",
            "DPOC",
        ]

        for comorb in comorbidades_importantes:
            col_name = f"tem_{comorb.lower().replace(' ', '_')}"
            df[col_name] = df["comorbidades"].apply(
                lambda x: 1 if pd.notna(x) and comorb in x else 0
            )

        # 3. Características cirúrgicas
        # Tipo de cirurgia (OneHot)
        surgery_types = ["hemorroidectomia", "fistula", "fissura", "pilonidal"]
        for surgery in surgery_types:
            df[f"cirurgia_{surgery}"] = (df["tipo_cirurgia"] == surgery).astype(int)

        # Duração normalizada (minutos / 180)
        df["duracao_normalizada"] = df["duracao_minutos"].fillna(60) / 180

        # Bloqueio pudendo
        df["bloqueio_pudendo"] = df["bloqueio_pudendo"].fillna(0).astype(int)

        # 4. Features pós-operatórias (D+1)
        df["dor_d1_normalizada"] = df["dor_d1"].fillna(5) / 10  # Normaliza 0-1

        df["retencao_urinaria"] = df["retencao_urinaria"].fillna(0).astype(int)

        df["febre"] = df["febre"].fillna(0).astype(int)

        df["sangramento_intenso"] = df["sangramento_intenso"].fillna(0).astype(int)

        # 5. Features derivadas (interações)
        # Idosos (>65) com DM têm risco maior
        df["idoso_com_dm"] = (
            (df["idade"] > 65) & (df["tem_dm_tipo_2"] == 1)
        ).astype(int)

        # Dor alta + retenção urinária = risco
        df["dor_alta_retencao"] = (
            (df["dor_d1"] > 7) & (df["retencao_urinaria"] == 1)
        ).astype(int)

        # Múltiplas comorbidades + cirurgia complexa
        df["multiplas_comorb_cirurgia_complexa"] = (
            (df["num_comorbidades"] >= 3)
            & (df["cirurgia_hemorroidectomia"] == 1)
        ).astype(int)

        return df

    def train(self, data: pd.DataFrame, target_column: str = "teve_complicacao"):
        """
        Treina o modelo

        Args:
            data: DataFrame com dados de treinamento
            target_column: Nome da coluna target (0/1)
        """
        print("🔥 Iniciando treinamento do modelo ML...")
        print(f"📊 Dataset: {len(data)} pacientes")

        # Prepara features
        df = self.prepare_features(data)

        # Seleciona features
        self.feature_names = [
            "idade_normalizada",
            "sexo_masculino",
            "num_comorbidades",
            "tem_has",
            "tem_dm_tipo_2",
            "tem_obesidade",
            "tem_irc",
            "tem_tabagismo",
            "tem_dpoc",
            "cirurgia_hemorroidectomia",
            "cirurgia_fistula",
            "cirurgia_fissura",
            "cirurgia_pilonidal",
            "duracao_normalizada",
            "bloqueio_pudendo",
            "dor_d1_normalizada",
            "retencao_urinaria",
            "febre",
            "sangramento_intenso",
            "idoso_com_dm",
            "dor_alta_retencao",
            "multiplas_comorb_cirurgia_complexa",
        ]

        X = df[self.feature_names]
        y = df[target_column]

        print(f"✅ Features: {len(self.feature_names)}")
        print(f"📈 Casos positivos: {y.sum()} ({y.sum()/len(y)*100:.1f}%)")
        print(f"📉 Casos negativos: {len(y) - y.sum()} ({(len(y)-y.sum())/len(y)*100:.1f}%)")

        # Split treino/teste (80/20)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        print(f"\n🎯 Treinamento: {len(X_train)} pacientes")
        print(f"🧪 Teste: {len(X_test)} pacientes")

        # Normaliza features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Treina modelo
        if self.model_type == "random_forest":
            print("\n🌲 Treinando Random Forest...")
            self.model = RandomForestClassifier(
                n_estimators=200,
                max_depth=10,
                min_samples_split=10,
                min_samples_leaf=5,
                class_weight="balanced",  # Importante para dados desbalanceados
                random_state=42,
                n_jobs=-1,
            )
        else:
            print("\n⚡ Treinando Gradient Boosting...")
            self.model = GradientBoostingClassifier(
                n_estimators=100,
                max_depth=5,
                learning_rate=0.1,
                random_state=42,
            )

        self.model.fit(X_train_scaled, y_train)

        # Avalia modelo
        y_pred = self.model.predict(X_test_scaled)
        y_pred_proba = self.model.predict_proba(X_test_scaled)[:, 1]

        # Métricas
        self.metrics = {
            "accuracy": accuracy_score(y_test, y_pred),
            "precision": precision_score(y_test, y_pred, zero_division=0),
            "recall": recall_score(y_test, y_pred, zero_division=0),
            "f1_score": f1_score(y_test, y_pred, zero_division=0),
            "roc_auc": roc_auc_score(y_test, y_pred_proba),
        }

        # Validação cruzada
        cv_scores = cross_val_score(
            self.model, X_train_scaled, y_train, cv=5, scoring="roc_auc"
        )
        self.metrics["cv_roc_auc_mean"] = cv_scores.mean()
        self.metrics["cv_roc_auc_std"] = cv_scores.std()

        # Feature importance
        if hasattr(self.model, "feature_importances_"):
            self.feature_importance = dict(
                zip(self.feature_names, self.model.feature_importances_)
            )
            # Ordena por importância
            self.feature_importance = dict(
                sorted(
                    self.feature_importance.items(),
                    key=lambda x: x[1],
                    reverse=True,
                )
            )

        # Relatório
        print("\n" + "=" * 60)
        print("📊 RESULTADOS DO TREINAMENTO")
        print("=" * 60)
        print(f"✅ Acurácia: {self.metrics['accuracy']:.3f}")
        print(f"✅ Precisão: {self.metrics['precision']:.3f}")
        print(f"✅ Recall (Sensibilidade): {self.metrics['recall']:.3f}")
        print(f"✅ F1-Score: {self.metrics['f1_score']:.3f}")
        print(f"✅ AUC-ROC: {self.metrics['roc_auc']:.3f}")
        print(
            f"✅ Cross-Validation AUC: {self.metrics['cv_roc_auc_mean']:.3f} ± {self.metrics['cv_roc_auc_std']:.3f}"
        )

        print("\n🔝 TOP 10 FEATURES MAIS IMPORTANTES:")
        for i, (feature, importance) in enumerate(
            list(self.feature_importance.items())[:10], 1
        ):
            print(f"{i}. {feature}: {importance:.4f}")

        print("\n" + "=" * 60)

        return self.metrics

    def predict(self, patient_data: Dict) -> Dict:
        """
        Faz predição para um paciente

        Args:
            patient_data: Dict com dados do paciente

        Returns:
            Dict com probabilidade e classificação de risco
        """
        if self.model is None:
            raise ValueError("Modelo não treinado. Execute train() primeiro.")

        # Converte para DataFrame
        df = pd.DataFrame([patient_data])

        # Prepara features
        df_features = self.prepare_features(df)

        # Extrai features
        X = df_features[self.feature_names]

        # Normaliza
        X_scaled = self.scaler.transform(X)

        # Predição
        probability = self.model.predict_proba(X_scaled)[0, 1]
        prediction = self.model.predict(X_scaled)[0]

        # Classifica risco
        if probability >= 0.75:
            risk_level = "critical"
            risk_label = "CRÍTICO"
            recommendation = "Contato IMEDIATO com médico! Alto risco de complicação."
        elif probability >= 0.50:
            risk_level = "high"
            risk_label = "ALTO"
            recommendation = "Monitoramento próximo recomendado. Considere contato preventivo."
        elif probability >= 0.25:
            risk_level = "medium"
            risk_label = "MÉDIO"
            recommendation = "Atenção! Continue acompanhamento regular."
        else:
            risk_level = "low"
            risk_label = "BAIXO"
            recommendation = "Evolução dentro do esperado. Continue cuidados."

        # Top 3 fatores de risco
        feature_values = X.iloc[0].to_dict()
        risk_factors = []

        for feature, value in feature_values.items():
            if value > 0 and feature in self.feature_importance:
                risk_factors.append(
                    {
                        "feature": feature,
                        "importance": self.feature_importance[feature],
                        "value": value,
                    }
                )

        risk_factors = sorted(
            risk_factors, key=lambda x: x["importance"], reverse=True
        )[:3]

        return {
            "probability": float(probability),
            "prediction": int(prediction),
            "risk_level": risk_level,
            "risk_label": risk_label,
            "recommendation": recommendation,
            "top_risk_factors": [
                {
                    "name": rf["feature"],
                    "contribution": float(rf["importance"]),
                }
                for rf in risk_factors
            ],
        }

    def save(self, path: str = "models/complication_predictor.joblib"):
        """Salva modelo treinado"""
        import os

        os.makedirs(os.path.dirname(path), exist_ok=True)

        model_data = {
            "model": self.model,
            "scaler": self.scaler,
            "feature_names": self.feature_names,
            "feature_importance": self.feature_importance,
            "metrics": self.metrics,
            "model_type": self.model_type,
            "trained_at": datetime.now().isoformat(),
        }

        joblib.dump(model_data, path)
        print(f"✅ Modelo salvo em: {path}")

    def load(self, path: str = "models/complication_predictor.joblib"):
        """Carrega modelo treinado"""
        model_data = joblib.load(path)

        self.model = model_data["model"]
        self.scaler = model_data["scaler"]
        self.feature_names = model_data["feature_names"]
        self.feature_importance = model_data["feature_importance"]
        self.metrics = model_data["metrics"]
        self.model_type = model_data["model_type"]

        print(f"✅ Modelo carregado de: {path}")
        print(f"📅 Treinado em: {model_data.get('trained_at', 'N/A')}")
        print(f"📊 AUC-ROC: {self.metrics.get('roc_auc', 'N/A'):.3f}")


# Exemplo de uso
if __name__ == "__main__":
    # Dados de exemplo (em produção, virão do banco)
    sample_data = pd.DataFrame(
        [
            {
                "idade": 45,
                "sexo": "Masculino",
                "comorbidades": "HAS",
                "tipo_cirurgia": "hemorroidectomia",
                "duracao_minutos": 60,
                "bloqueio_pudendo": 1,
                "dor_d1": 5,
                "retencao_urinaria": 0,
                "febre": 0,
                "sangramento_intenso": 0,
                "teve_complicacao": 0,
            },
            {
                "idade": 72,
                "sexo": "Feminino",
                "comorbidades": "HAS,DM tipo 2,Obesidade",
                "tipo_cirurgia": "hemorroidectomia",
                "duracao_minutos": 120,
                "bloqueio_pudendo": 0,
                "dor_d1": 9,
                "retencao_urinaria": 1,
                "febre": 1,
                "sangramento_intenso": 0,
                "teve_complicacao": 1,
            },
            # ... mais dados
        ]
    )

    # Treina modelo
    predictor = ComplicationPredictor(model_type="random_forest")
    predictor.train(sample_data)

    # Salva
    predictor.save()

    # Predição
    novo_paciente = {
        "idade": 65,
        "sexo": "Masculino",
        "comorbidades": "DM tipo 2",
        "tipo_cirurgia": "hemorroidectomia",
        "duracao_minutos": 90,
        "bloqueio_pudendo": 1,
        "dor_d1": 7,
        "retencao_urinaria": 1,
        "febre": 0,
        "sangramento_intenso": 0,
    }

    result = predictor.predict(novo_paciente)
    print(f"\n🎯 Predição: {result}")
