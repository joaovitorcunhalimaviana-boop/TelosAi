#!/bin/bash

# Quick Test Script para Sistema Pós-Operatório
# Testa rapidamente deploy, webhook e APIs

DOMAIN="sistema-pos-operatorio-5i1swk9c0-joao-vitor-vianas-projects.vercel.app"
VERIFY_TOKEN="meu-token-super-secreto-2024"

echo "🚀 TESTE RÁPIDO - Sistema Pós-Operatório"
echo "========================================"
echo ""

# 1. Site Principal
echo "1️⃣  Testando site principal..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN")
if [ "$STATUS" = "200" ]; then
  echo "   ✅ Site OK (200)"
else
  echo "   ❌ Site com problema ($STATUS)"
fi
echo ""

# 2. Webhook
echo "2️⃣  Testando webhook..."
CHALLENGE=$(curl -s "https://$DOMAIN/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=$VERIFY_TOKEN&hub.challenge=test123")
if [ "$CHALLENGE" = "test123" ]; then
  echo "   ✅ Webhook OK"
else
  echo "   ❌ Webhook com problema (resposta: $CHALLENGE)"
fi
echo ""

# 3. NextAuth
echo "3️⃣  Testando NextAuth..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/api/auth/signin")
if [ "$STATUS" -ge 200 ] && [ "$STATUS" -lt 500 ]; then
  echo "   ✅ NextAuth OK ($STATUS)"
else
  echo "   ❌ NextAuth com problema ($STATUS)"
fi
echo ""

# 4. Middleware
echo "4️⃣  Testando middleware (proteção de rotas)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/dashboard")
if [ "$STATUS" = "302" ] || [ "$STATUS" = "307" ] || [ "$STATUS" = "401" ]; then
  echo "   ✅ Middleware OK (rota protegida, código $STATUS)"
else
  echo "   ⚠️  Middleware resposta inesperada ($STATUS)"
fi
echo ""

echo "========================================"
echo "✅ Teste concluído!"
echo ""
echo "🎯 Próximo passo: Envie 'sim' para +55 83 99166-4904"
echo ""
