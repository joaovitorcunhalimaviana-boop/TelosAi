#!/bin/bash

# Script para configurar variáveis de ambiente na Vercel
# Sistema Pós-Operatório

set -e

echo "🔧 Configurando variáveis de ambiente na Vercel..."

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instalando..."
    npm i -g vercel
fi

# Verificar se há arquivo .env
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado"
    exit 1
fi

echo "📋 Lendo variáveis do arquivo .env..."

# Função para adicionar variável na Vercel
add_env_var() {
    local key=$1
    local value=$2

    echo "Adding $key..."
    echo "$value" | vercel env add "$key" production preview development
}

# Ler e adicionar cada variável
while IFS='=' read -r key value; do
    # Ignorar comentários e linhas vazias
    [[ $key =~ ^#.*$ ]] && continue
    [[ -z $key ]] && continue

    # Remover aspas do valor
    value=$(echo "$value" | sed 's/^"//' | sed 's/"$//')

    # Perguntar antes de adicionar
    echo ""
    echo "Adicionar $key?"
    echo "Valor: ${value:0:20}..."
    read -p "(s/n): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Ss]$ ]]; then
        add_env_var "$key" "$value"
        echo "✅ $key adicionada"
    else
        echo "⏭️  $key pulada"
    fi

done < <(grep -v '^#' .env | grep -v '^$')

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Verifique as variáveis em: https://vercel.com/dashboard/settings"
echo "2. Faça um novo deploy para aplicar as mudanças"
echo "3. Teste o sistema"
