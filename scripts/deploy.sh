#!/bin/bash

# Script de Deploy Automatizado para Vercel
# Sistema Pós-Operatório

set -e

echo "🚀 Iniciando processo de deploy..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está em um repositório git
if [ ! -d .git ]; then
    echo -e "${RED}❌ Não é um repositório Git. Execute 'git init' primeiro.${NC}"
    exit 1
fi

# Verificar se há mudanças não commitadas
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  Há mudanças não commitadas. Deseja commitá-las?${NC}"
    read -p "Commit automático? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        git add .
        read -p "Mensagem do commit: " commit_message
        git commit -m "$commit_message"
        echo -e "${GREEN}✅ Commit realizado${NC}"
    fi
fi

# Verificar branch
current_branch=$(git branch --show-current)
echo -e "${YELLOW}📌 Branch atual: $current_branch${NC}"

# Rodar testes (se existirem)
if [ -f "package.json" ]; then
    echo -e "${YELLOW}🧪 Verificando package.json...${NC}"

    # Verificar type check
    if grep -q '"type-check"' package.json; then
        echo -e "${YELLOW}📝 Executando verificação de tipos...${NC}"
        npm run type-check || {
            echo -e "${RED}❌ Erros de TypeScript encontrados${NC}"
            exit 1
        }
        echo -e "${GREEN}✅ Tipos verificados${NC}"
    fi

    # Verificar build
    echo -e "${YELLOW}🔨 Testando build...${NC}"
    npm run build || {
        echo -e "${RED}❌ Build falhou${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Build OK${NC}"
fi

# Push para GitHub
echo -e "${YELLOW}📤 Fazendo push para GitHub...${NC}"
git push origin $current_branch || {
    echo -e "${RED}❌ Push falhou${NC}"
    exit 1
}
echo -e "${GREEN}✅ Push realizado${NC}"

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI não encontrado. Instalando...${NC}"
    npm i -g vercel
fi

# Deploy na Vercel
echo -e "${YELLOW}🚢 Fazendo deploy na Vercel...${NC}"
read -p "Deploy para produção? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    vercel --prod
    echo -e "${GREEN}✅ Deploy de PRODUÇÃO concluído${NC}"
else
    vercel
    echo -e "${GREEN}✅ Deploy de PREVIEW concluído${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deploy finalizado com sucesso!${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo "1. Testar o sistema na URL fornecida pela Vercel"
echo "2. Configurar webhook do WhatsApp com a URL de produção"
echo "3. Testar APIs em /dashboard/settings/api-config"
echo "4. Verificar logs em https://vercel.com"
