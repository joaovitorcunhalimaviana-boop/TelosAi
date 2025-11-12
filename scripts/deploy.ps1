# Script de Deploy Automatizado para Vercel (PowerShell)
# Sistema Pós-Operatório

Write-Host "🚀 Iniciando processo de deploy..." -ForegroundColor Green

# Verificar se está em um repositório git
if (-not (Test-Path .git)) {
    Write-Host "❌ Não é um repositório Git. Execute 'git init' primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se há mudanças não commitadas
$status = git status --porcelain
if ($status) {
    Write-Host "⚠️  Há mudanças não commitadas." -ForegroundColor Yellow
    $commit = Read-Host "Fazer commit automático? (s/n)"
    if ($commit -eq 's') {
        git add .
        $message = Read-Host "Mensagem do commit"
        git commit -m $message
        Write-Host "✅ Commit realizado" -ForegroundColor Green
    }
}

# Branch atual
$branch = git branch --show-current
Write-Host "📌 Branch atual: $branch" -ForegroundColor Yellow

# Verificar type check
Write-Host "📝 Executando verificação de tipos..." -ForegroundColor Yellow
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erros de TypeScript encontrados" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Tipos verificados" -ForegroundColor Green

# Build
Write-Host "🔨 Testando build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build falhou" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build OK" -ForegroundColor Green

# Push
Write-Host "📤 Fazendo push para GitHub..." -ForegroundColor Yellow
git push origin $branch
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Push falhou" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Push realizado" -ForegroundColor Green

# Deploy
Write-Host "🚢 Fazendo deploy na Vercel..." -ForegroundColor Yellow
$prod = Read-Host "Deploy para produção? (s/n)"
if ($prod -eq 's') {
    vercel --prod
    Write-Host "✅ Deploy de PRODUÇÃO concluído" -ForegroundColor Green
} else {
    vercel
    Write-Host "✅ Deploy de PREVIEW concluído" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Deploy finalizado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Testar o sistema na URL fornecida pela Vercel"
Write-Host "2. Configurar webhook do WhatsApp com a URL de produção"
Write-Host "3. Testar APIs em /dashboard/settings/api-config"
Write-Host "4. Verificar logs em https://vercel.com"
