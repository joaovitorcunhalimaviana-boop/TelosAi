# Script PowerShell para configurar variáveis de ambiente no Vercel
# Todas as variáveis serão adicionadas ao ambiente de produção

Write-Host "🚀 Configurando variáveis de ambiente no Vercel..." -ForegroundColor Cyan

$vars = @{
    "ANTHROPIC_API_KEY" = "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"
    "AUTH_SECRET" = "7lBvFRYgEcVpCiELM1zcfh1JmZG4/WhbLRfgAlSmznM="
    "AUTH_URL" = "https://sistema-pos-operatorio-kjiivyow4-joao-vitor-vianas-projects.vercel.app"
    "CRON_SECRET" = "eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA="
    "DATABASE_URL" = "postgresql://neondb_owner:npg_F9Kb4mPoVtcB@ep-royal-voice-ae6ov58i-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"
    "DOCTOR_PHONE_NUMBER" = "5583991664904"
    "NEXTAUTH_SECRET" = "7lBvFRYgEcVpCiELM1zcfh1JmZG4/WhbLRfgAlSmznM="
    "NEXTAUTH_URL" = "https://sistema-pos-operatorio-kjiivyow4-joao-vitor-vianas-projects.vercel.app"
    "WHATSAPP_ACCESS_TOKEN" = "EAATN9ORQfVcBPxMLivSMuo5mZBR2H3g1MKNNQ3lAOK6fvNYZBaGB1oZAXfzvn37JICEcl16tRFggRsIP9tMXMZBZBt4GOu5wntLz1YhOB2LPF0w6ZBxjDViGXmLv2WFlTZANpDMwmglh0LYnflzVr3Tkd0FtLfCFhKmYCAo7nu5MivEXLTj7ZBkVpYrgIqwZB"
    "WHATSAPP_APP_ID" = "1352351593037143"
    "WHATSAPP_APP_SECRET" = "f8788e99231afa0bbb84685c4bea4924"
    "WHATSAPP_BUSINESS_ACCOUNT_ID" = "4331043357171950"
    "WHATSAPP_PHONE_NUMBER_ID" = "866244236573219"
    "WHATSAPP_VERIFY_TOKEN" = "meu-token-super-secreto-2024"
    "WHATSAPP_WEBHOOK_VERIFY_TOKEN" = "meu-token-super-secreto-2024"
    "RESEARCH_PSEUDONYM_SALT" = "f1668d9cfdf515ffb56fc3fde839244123b64ca042a58f8bef8a332d1cc208ef"
    "RESEND_API_KEY" = "re_placeholder_key"
}

$total = $vars.Count
$count = 0

foreach ($var in $vars.GetEnumerator()) {
    $count++
    $varName = $var.Key
    $varValue = $var.Value

    Write-Host "[$count/$total] Adicionando $varName..." -ForegroundColor Yellow

    # Cria arquivo temporário com o valor
    $tempFile = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tempFile -Value $varValue -NoNewline

    # Adiciona a variável usando o arquivo temporário
    $output = Get-Content $tempFile | vercel env add $varName production 2>&1

    # Remove arquivo temporário
    Remove-Item $tempFile -Force

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $varName adicionada com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $varName pode já existir ou houve erro" -ForegroundColor Yellow
    }

    Write-Host ""
}

Write-Host ""
Write-Host "✅ Configuração concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Verificar variáveis: vercel env ls" -ForegroundColor White
Write-Host "2. Fazer redeploy: vercel --prod" -ForegroundColor White
