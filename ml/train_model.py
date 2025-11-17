"""
Script para treinar modelo ML com dados do banco PostgreSQL
"""

import pandas as pd
import psycopg2
from model import ComplicationPredictor
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv("../.env")

DATABASE_URL = os.getenv("DATABASE_URL")

def fetch_training_data():
    """
    Busca dados do banco PostgreSQL para treinamento
    """
    print("🔗 Conectando ao banco de dados...")

    conn = psycopg2.connect(DATABASE_URL)

    query = """
    SELECT
        p.id as patient_id,
        p.age as idade,
        p.sex as sexo,

        -- Comorbidades (concatenadas)
        STRING_AGG(DISTINCT c.name, ',') as comorbidades,

        -- Cirurgia
        s.type as tipo_cirurgia,
        s."durationMinutes" as duracao_minutos,

        -- Anestesia
        CASE WHEN a."pudendoBlock" = true THEN 1 ELSE 0 END as bloqueio_pudendo,

        -- Follow-up D+1
        MAX(CASE
            WHEN fu."dayNumber" = 1
            THEN CAST(fur."questionnaireData"->>'painLevel' AS INTEGER)
        END) as dor_d1,

        MAX(CASE
            WHEN fu."dayNumber" = 1
            THEN CASE WHEN fur."questionnaireData"->>'urinaryRetention' = 'true' THEN 1 ELSE 0 END
        END) as retencao_urinaria,

        MAX(CASE
            WHEN fu."dayNumber" = 1
            THEN CASE WHEN fur."questionnaireData"->>'fever' = 'true' THEN 1 ELSE 0 END
        END) as febre,

        MAX(CASE
            WHEN fu."dayNumber" = 1
            THEN CASE WHEN fur."questionnaireData"->>'intenseBleeding' = 'true' THEN 1 ELSE 0 END
        END) as sangramento_intenso,

        -- TARGET: Teve complicação? (risco high ou critical em D+3 a D+14)
        MAX(CASE
            WHEN fu."dayNumber" >= 3 AND fur."riskLevel" IN ('high', 'critical')
            THEN 1
            ELSE 0
        END) as teve_complicacao

    FROM "Patient" p
    LEFT JOIN "PatientComorbidity" pc ON p.id = pc."patientId"
    LEFT JOIN "Comorbidity" c ON pc."comorbidityId" = c.id
    LEFT JOIN "Surgery" s ON p.id = s."patientId"
    LEFT JOIN "Anesthesia" a ON s.id = a."surgeryId"
    LEFT JOIN "FollowUp" fu ON s.id = fu."surgeryId"
    LEFT JOIN "FollowUpResponse" fur ON fu.id = fur."followUpId"

    WHERE
        p.age IS NOT NULL
        AND s.type IS NOT NULL
        AND s.status = 'completed'
        -- Apenas pacientes com pelo menos 1 follow-up respondido
        AND EXISTS (
            SELECT 1 FROM "FollowUp" fu2
            WHERE fu2."patientId" = p.id AND fu2.status = 'responded'
        )

    GROUP BY p.id, p.age, p.sex, s.type, s."durationMinutes", a."pudendoBlock"
    HAVING
        -- Precisa ter respondido D+1
        MAX(CASE WHEN fu."dayNumber" = 1 THEN 1 ELSE 0 END) = 1
    """

    print("📊 Executando query...")
    df = pd.read_sql_query(query, conn)
    conn.close()

    print(f"✅ Dados carregados: {len(df)} pacientes")

    return df


def main():
    """
    Função principal de treinamento
    """
    print("=" * 60)
    print("🤖 TREINAMENTO DO MODELO DE PREDIÇÃO DE COMPLICAÇÕES")
    print("=" * 60)

    # 1. Busca dados
    df = fetch_training_data()

    if len(df) < 30:
        print("⚠️ ATENÇÃO: Poucos dados para treinamento!")
        print(f"   Mínimo recomendado: 100 pacientes")
        print(f"   Você tem: {len(df)} pacientes")
        print()

        response = input("Deseja continuar mesmo assim? (s/n): ")
        if response.lower() != 's':
            print("❌ Treinamento cancelado.")
            return

    # 2. Análise exploratória
    print("\n📈 ANÁLISE EXPLORATÓRIA DOS DADOS:")
    print(f"Total de pacientes: {len(df)}")
    print(f"Complicações: {df['teve_complicacao'].sum()} ({df['teve_complicacao'].sum()/len(df)*100:.1f}%)")
    print(f"Idade média: {df['idade'].mean():.1f} anos (±{df['idade'].std():.1f})")
    print(f"Dor D+1 média: {df['dor_d1'].mean():.1f}/10 (±{df['dor_d1'].std():.1f})")

    print("\nDistribuição por tipo de cirurgia:")
    print(df['tipo_cirurgia'].value_counts())

    print("\nDistribuição por sexo:")
    print(df['sexo'].value_counts())

    # 3. Treina modelo Random Forest
    print("\n" + "=" * 60)
    print("🌲 RANDOM FOREST")
    print("=" * 60)

    predictor_rf = ComplicationPredictor(model_type="random_forest")
    metrics_rf = predictor_rf.train(df)
    predictor_rf.save("models/complication_predictor_rf.joblib")

    # 4. Treina modelo Gradient Boosting
    print("\n" + "=" * 60)
    print("⚡ GRADIENT BOOSTING")
    print("=" * 60)

    predictor_gb = ComplicationPredictor(model_type="gradient_boosting")
    metrics_gb = predictor_gb.train(df)
    predictor_gb.save("models/complication_predictor_gb.joblib")

    # 5. Compara modelos
    print("\n" + "=" * 60)
    print("🏆 COMPARAÇÃO DE MODELOS")
    print("=" * 60)

    comparison = pd.DataFrame({
        "Random Forest": metrics_rf,
        "Gradient Boosting": metrics_gb
    }).T

    print(comparison)

    # Escolhe melhor modelo
    if metrics_rf['roc_auc'] >= metrics_gb['roc_auc']:
        print("\n✅ VENCEDOR: Random Forest")
        print(f"   AUC-ROC: {metrics_rf['roc_auc']:.3f}")

        # Salva como modelo padrão
        predictor_rf.save("models/complication_predictor.joblib")
    else:
        print("\n✅ VENCEDOR: Gradient Boosting")
        print(f"   AUC-ROC: {metrics_gb['roc_auc']:.3f}")

        # Salva como modelo padrão
        predictor_gb.save("models/complication_predictor.joblib")

    print("\n" + "=" * 60)
    print("✅ TREINAMENTO CONCLUÍDO!")
    print("=" * 60)
    print("\nPróximos passos:")
    print("1. Inicie a API: python api.py")
    print("2. Teste predições: curl http://localhost:5000/health")
    print("3. Integre no Next.js")


if __name__ == "__main__":
    main()
