#!/bin/bash
# Script para configurar TODAS as variáveis de ambiente no Vercel

PROJECT_ID="prj_FDkIDplW3QLlNQ8pkZKHP5sLSBK1"
TEAM_ID="team_BnhyET7tfeX89H6UnlZa25xO"

# Obter URL do Vercel
VERCEL_URL="sistema-pos-operatorio-d6feex9sj-joao-vitor-vianas-projects.vercel.app"

echo "🔧 Configurando variáveis de ambiente no Vercel..."
echo ""

# Variáveis essenciais
vercel env add ANTHROPIC_API_KEY production --force <<< "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"
vercel env add AUTH_SECRET production --force <<< "7lBvFRYgEcVpCiELM1zcfh1JmZG4/WhbLRfgAlSmznM="
vercel env add AUTH_URL production --force <<< "https://$VERCEL_URL"
vercel env add CRON_SECRET production --force <<< "eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA="
vercel env add DATABASE_URL production --force <<< "postgresql://neondb_owner:npg_F9Kb4mPoVtcB@ep-royal-voice-ae6ov58i-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"
vercel env add DOCTOR_PHONE_NUMBER production --force <<< "5583991664904"
vercel env add NEXTAUTH_SECRET production --force <<< "7lBvFRYgEcVpCiELM1zcfh1JmZG4/WhbLRfgAlSmznM="
vercel env add NEXTAUTH_URL production --force <<< "https://$VERCEL_URL"
vercel env add RESEARCH_PSEUDONYM_SALT production --force <<< "f1668d9cfdf515ffb56fc3fde839244123b64ca042a58f8bef8a332d1cc208ef"
vercel env add RESEND_API_KEY production --force <<< "re_placeholder_key"
vercel env add WHATSAPP_ACCESS_TOKEN production --force <<< "EAATN9ORQfVcBPxMLivSMuo5mZBR2H3g1MKNNQ3lAOK6fvNYZBaGB1oZAXfzvn37JICEcl16tRFggRsIP9tMXMZBZBt4GOu5wntLz1YhOB2LPF0w6ZBxjDViGXmLv2WFlTZANpDMwmglh0LYnflzVr3Tkd0FtLfCFhKmYCAo7nu5MivEXLTj7ZBkVpYrgIqwZB"
vercel env add WHATSAPP_APP_ID production --force <<< "1352351593037143"
vercel env add WHATSAPP_APP_SECRET production --force <<< "f8788e99231afa0bbb84685c4bea4924"
vercel env add WHATSAPP_BUSINESS_ACCOUNT_ID production --force <<< "4331043357171950"
vercel env add WHATSAPP_PHONE_NUMBER_ID production --force <<< "866244236573219"
vercel env add WHATSAPP_VERIFY_TOKEN production --force <<< "meu-token-super-secreto-2024"
vercel env add WHATSAPP_WEBHOOK_VERIFY_TOKEN production --force <<< "meu-token-super-secreto-2024"

echo ""
echo "✅ Todas as variáveis configuradas!"
echo ""
echo "📝 Próximo passo: Atualizar webhook no Meta"
echo "URL: https://$VERCEL_URL/api/whatsapp/webhook"
