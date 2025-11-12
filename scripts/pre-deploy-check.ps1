# Script de Verificação Pré-Deploy (PowerShell)
# Sistema Pós-Operatório

Write-Host "🔍 Verificando se o sistema está pronto para deploy..." -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Não encontrado package.json. Execute na raiz do projeto." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Verificando dependências..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️  node_modules não encontrado. Executando npm install..." -ForegroundColor Yellow
    npm install
    $warnings++
}

Write-Host ""
Write-Host "📄 Verificando arquivo .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ Arquivo .env encontrado" -ForegroundColor Green

    # Verificar variáveis obrigatórias
    $envContent = Get-Content .env -Raw
    $requiredVars = @(
        "DATABASE_URL",
        "NEXTAUTH_SECRET",
        "NEXTAUTH_URL",
        "ANTHROPIC_API_KEY",
        "WHATSAPP_PHONE_NUMBER_ID",
        "WHATSAPP_ACCESS_TOKEN",
        "WHATSAPP_VERIFY_TOKEN",
        "DOCTOR_PHONE_NUMBER"
    )

    foreach ($var in $requiredVars) {
        if ($envContent -match "$var=") {
            Write-Host "  ✅ $var" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $var não encontrada" -ForegroundColor Red
            $errors++
        }
    }
} else {
    Write-Host "❌ Arquivo .env não encontrado" -ForegroundColor Red
    $errors++
}

Write-Host ""
Write-Host "📝 Verificando TypeScript..." -ForegroundColor Yellow
npm run type-check 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ TypeScript sem erros" -ForegroundColor Green
} else {
    Write-Host "❌ Erros de TypeScript encontrados. Execute: npm run type-check" -ForegroundColor Red
    $errors++
}

Write-Host ""
Write-Host "🔨 Testando build..." -ForegroundColor Yellow
npm run build 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build funcionando" -ForegroundColor Green
} else {
    Write-Host "❌ Build falhou. Execute: npm run build" -ForegroundColor Red
    $errors++
}

Write-Host ""
Write-Host "🗄️  Verificando Prisma..." -ForegroundColor Yellow
if (Test-Path "prisma/schema.prisma") {
    Write-Host "✅ Schema do Prisma encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Schema do Prisma não encontrado" -ForegroundColor Red
    $errors++
}

Write-Host ""
Write-Host "🔧 Verificando Git..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "✅ Repositório Git inicializado" -ForegroundColor Green

    # Verificar se há remote
    $remote = git remote -v 2>&1
    if ($remote) {
        Write-Host "✅ Remote configurado" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Remote não configurado" -ForegroundColor Yellow
        $warnings++
    }

    # Verificar gitignore
    if (Test-Path ".gitignore") {
        $gitignoreContent = Get-Content .gitignore -Raw
        if ($gitignoreContent -match ".env") {
            Write-Host "✅ .env no .gitignore" -ForegroundColor Green
        } else {
            Write-Host "❌ .env NÃO está no .gitignore (SEGURANÇA!)" -ForegroundColor Red
            $errors++
        }
    }
} else {
    Write-Host "❌ Git não inicializado. Execute: git init" -ForegroundColor Red
    $errors++
}

Write-Host ""
Write-Host "📋 Verificando arquivos de documentação..." -ForegroundColor Yellow
$docs = @("README.md", "DEPLOY-VERCEL.md", "WEBHOOK-WHATSAPP.md", "CHECKLIST-DEPLOY.md")
foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Write-Host "  ✅ $doc" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $doc não encontrado" -ForegroundColor Yellow
        $warnings++
    }
}

# Resumo final
Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "           RESUMO DA VERIFICAÇÃO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "🎉 SISTEMA PRONTO PARA DEPLOY!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos passos:" -ForegroundColor Yellow
    Write-Host "1. Commit suas mudanças: git add . && git commit -m 'mensagem'" -ForegroundColor White
    Write-Host "2. Push para GitHub: git push" -ForegroundColor White
    Write-Host "3. Deploy na Vercel: vercel --prod" -ForegroundColor White
    Write-Host "4. Ou use o script: .\scripts\deploy.ps1" -ForegroundColor White
    exit 0
} elseif ($errors -eq 0) {
    Write-Host "⚠️  $warnings avisos encontrados" -ForegroundColor Yellow
    Write-Host "Sistema pode ser deployado, mas revise os avisos acima." -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "❌ $errors erros e $warnings avisos encontrados" -ForegroundColor Red
    Write-Host ""
    Write-Host "Corrija os erros antes de fazer deploy." -ForegroundColor Red
    Write-Host "Veja a documentação em CHECKLIST-DEPLOY.md" -ForegroundColor Yellow
    exit 1
}
