"""
Script para treinar modelo ML com dados COLETIVOS pseudonimizados
Usa API Next.js para buscar dataset anonimizado de médicos participantes
"""

import pandas as pd
import requests
import os
from dotenv import load_dotenv
from model import ComplicationPredictor

# Carrega variáveis de ambiente
load_dotenv("../.env")

NEXTAUTH_URL = os.getenv("NEXTAUTH_URL", "http://localhost:3000")
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY")  # API key do admin


def fetch_collective_dataset():
    """
    Busca dataset pseudonimizado da API Next.js
    Apenas admin pode fazer isso
    """
    print("🔗 Buscando dataset coletivo pseudonimizado...")

    url = f"{NEXTAUTH_URL}/api/collective-intelligence/export-dataset"

    headers = {}
    if ADMIN_API_KEY:
        headers["Authorization"] = f"Bearer {ADMIN_API_KEY}"

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()

        data = response.json()

        if not data.get("success"):
            print(f"❌ Erro: {data.get('message', 'Erro desconhecido')}")
            return None

        dataset = data["dataset"]
        stats = data.get("stats", {})

        print(f"✅ Dataset carregado com sucesso!")
        print(f"   Médicos participantes: {stats.get('participatingDoctors', 0)}")
        print(f"   Pacientes elegíveis: {stats.get('eligiblePatients', 0)}")
        print(f"   Total de cirurgias: {dataset['totalSurgeries']}")
        print(f"   Total de follow-ups: {dataset['totalFollowUps']}")

        return dataset

    except requests.RequestException as e:
        print(f"❌ Erro ao buscar dataset: {e}")
        return None


def convert_to_dataframe(dataset):
    """
    Converte dataset pseudonimizado para DataFrame
    """
    print("\n📊 Convertendo dataset para formato tabular...")

    rows = []

    for patient in dataset["patients"]:
        age = patient["age"]
        sex = patient["sex"]
        comorbidities = ",".join(patient["comorbidities"]) if patient["comorbidities"] else ""
        comorbidity_count = len(patient["comorbidities"])

        # Processa cada cirurgia
        for surgery in patient["surgeries"]:
            surgery_type = surgery["type"]
            duration = surgery["durationMinutes"]
            pudendal_block = 1 if surgery["pudendalBlock"] else 0

            # Processa cada follow-up
            for followup in patient["followUps"]:
                if followup["day"] == 1:  # Apenas D+1 para features
                    row = {
                        "idade": age,
                        "sexo": sex,
                        "comorbidades": comorbidities,
                        "tipo_cirurgia": surgery_type,
                        "duracao_minutos": duration,
                        "bloqueio_pudendo": pudendal_block,
                        "dor_d1": followup["painLevel"],
                        "retencao_urinaria": 1 if followup["urinaryRetention"] else 0,
                        "febre": 1 if followup["fever"] else 0,
                        "sangramento_intenso": 1 if followup["bleeding"] else 0,
                        "teve_complicacao": 1 if followup["hasComplications"] else 0,
                    }
                    rows.append(row)

    df = pd.DataFrame(rows)

    # Remove linhas com dados faltantes críticos
    df = df.dropna(subset=["idade", "tipo_cirurgia", "dor_d1"])

    print(f"✅ DataFrame criado: {len(df)} amostras")

    return df


def main():
    """
    Função principal de treinamento com dados coletivos
    """
    print("=" * 60)
    print("🤖 TREINAMENTO COM INTELIGÊNCIA COLETIVA")
    print("=" * 60)
    print("\n📋 Este script usa dados PSEUDONIMIZADOS de:")
    print("   ✓ Médicos que optaram por participar")
    print("   ✓ Pacientes com termo de consentimento assinado")
    print("   ✓ Dados anonimizados (SHA-256)")
    print("   ✓ Conforme LGPD (Art. 7º, IV e Art. 11)")
    print()

    # 1. Busca dataset coletivo
    dataset = fetch_collective_dataset()

    if not dataset or dataset["totalPatients"] == 0:
        print("\n❌ Sem dados para treinamento.")
        print("   Certifique-se de que:")
        print("   1. Médicos optaram por participar (collectiveIntelligenceOptIn)")
        print("   2. Pacientes assinaram termo de consentimento")
        print("   3. Você está autenticado como admin")
        return

    # 2. Converte para DataFrame
    df = convert_to_dataframe(dataset)

    if len(df) < 30:
        print("\n⚠️ ATENÇÃO: Poucos dados para treinamento!")
        print(f"   Mínimo recomendado: 100 amostras")
        print(f"   Você tem: {len(df)} amostras")
        print()

        response = input("Deseja continuar mesmo assim? (s/n): ")
        if response.lower() != "s":
            print("❌ Treinamento cancelado.")
            return

    # 3. Análise exploratória
    print("\n📈 ANÁLISE EXPLORATÓRIA DOS DADOS COLETIVOS:")
    print(f"Total de amostras: {len(df)}")
    print(
        f"Complicações: {df['teve_complicacao'].sum()} ({df['teve_complicacao'].sum()/len(df)*100:.1f}%)"
    )
    print(f"Idade média: {df['idade'].mean():.1f} anos (±{df['idade'].std():.1f})")
    print(f"Dor D+1 média: {df['dor_d1'].mean():.1f}/10 (±{df['dor_d1'].std():.1f})")

    print("\nDistribuição por tipo de cirurgia:")
    print(df["tipo_cirurgia"].value_counts())

    print("\nDistribuição por sexo:")
    print(df["sexo"].value_counts())

    # 4. Treina modelo Random Forest
    print("\n" + "=" * 60)
    print("🌲 RANDOM FOREST (Dados Coletivos)")
    print("=" * 60)

    predictor_rf = ComplicationPredictor(model_type="random_forest")
    metrics_rf = predictor_rf.train(df)
    predictor_rf.save("models/complication_predictor_collective_rf.joblib")

    # 5. Treina modelo Gradient Boosting
    print("\n" + "=" * 60)
    print("⚡ GRADIENT BOOSTING (Dados Coletivos)")
    print("=" * 60)

    predictor_gb = ComplicationPredictor(model_type="gradient_boosting")
    metrics_gb = predictor_gb.train(df)
    predictor_gb.save("models/complication_predictor_collective_gb.joblib")

    # 6. Compara modelos
    print("\n" + "=" * 60)
    print("🏆 COMPARAÇÃO DE MODELOS")
    print("=" * 60)

    comparison = pd.DataFrame(
        {"Random Forest": metrics_rf, "Gradient Boosting": metrics_gb}
    ).T

    print(comparison)

    # Escolhe melhor modelo
    if metrics_rf["roc_auc"] >= metrics_gb["roc_auc"]:
        print("\n✅ VENCEDOR: Random Forest")
        print(f"   AUC-ROC: {metrics_rf['roc_auc']:.3f}")

        # Salva como modelo padrão COLETIVO
        predictor_rf.save("models/complication_predictor_collective.joblib")
        best_model = "Random Forest"
        best_auc = metrics_rf["roc_auc"]
    else:
        print("\n✅ VENCEDOR: Gradient Boosting")
        print(f"   AUC-ROC: {metrics_gb['roc_auc']:.3f}")

        # Salva como modelo padrão COLETIVO
        predictor_gb.save("models/complication_predictor_collective.joblib")
        best_model = "Gradient Boosting"
        best_auc = metrics_gb["roc_auc"]

    print("\n" + "=" * 60)
    print("✅ TREINAMENTO COM INTELIGÊNCIA COLETIVA CONCLUÍDO!")
    print("=" * 60)
    print(f"\n🎯 Melhor modelo: {best_model}")
    print(f"📊 AUC-ROC: {best_auc:.3f}")
    print(f"📁 Salvo em: models/complication_predictor_collective.joblib")
    print(f"\n📈 Dados utilizados:")
    print(f"   • {dataset['totalPatients']} pacientes pseudonimizados")
    print(f"   • {dataset['totalSurgeries']} cirurgias")
    print(f"   • {dataset['totalFollowUps']} follow-ups")
    print(f"   • De múltiplos médicos participantes")
    print(f"\n🔒 Privacidade:")
    print(f"   • Método: {dataset['metadata']['pseudonymizationMethod']}")
    print(f"   • LGPD Compliant: {dataset['metadata']['lgpdCompliant']}")

    print("\n📝 Próximos passos:")
    print("1. Compare com modelo individual (se existir)")
    print("2. Inicie a API: python api.py")
    print("3. Modelo coletivo está disponível para TODOS os médicos participantes")
    print("4. Benefício: Maior precisão com dados de diferentes perfis")


if __name__ == "__main__":
    main()
