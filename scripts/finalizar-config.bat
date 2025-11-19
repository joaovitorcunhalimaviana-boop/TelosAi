@echo off
echo.
echo ========================================
echo   FINALIZANDO CONFIGURACAO - 1 CLIQUE
echo ========================================
echo.
echo Abrindo navegador para adicionar header de autenticacao...
echo.
echo Job ID: 6882016
echo Header: Authorization
echo Value: Bearer eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA=
echo.

start https://console.cron-job.org/jobs/6882016/edit

echo.
echo INSTRUCOES:
echo 1. Role ate a secao "Advanced"
echo 2. Clique em "Headers"
echo 3. Adicione:
echo    - Name: Authorization
echo    - Value: Bearer eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA=
echo 4. Clique em "Save"
echo.
echo Depois, pressione qualquer tecla para criar o segundo job...
pause

echo.
echo Abrindo pagina para criar job de renovacao de token...
echo.

start https://console.cron-job.org/jobs/create

echo.
echo PREENCHA:
echo - Title: Renovacao Token WhatsApp - 50 dias
echo - URL: https://proactive-rejoicing-production.up.railway.app/api/cron/renew-whatsapp-token
echo - Schedule: Timezone = America/Sao_Paulo, primeira execucao 08/01/2025
echo - Request Method: POST
echo - Headers:
echo   - Name: Authorization
echo   - Value: Bearer eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA=
echo - Notifications: Ative "On failure" e "On success"
echo - Enable: Ativado
echo.
echo Pressione qualquer tecla quando terminar...
pause

echo.
echo ========================================
echo   CONFIGURACAO COMPLETA!
echo ========================================
echo.
echo Agora voce pode testar:
echo 1. Acesse: https://console.cron-job.org/dashboard
echo 2. Clique em "Run now" no job de Follow-ups
echo 3. Verifique se retorna Status 200
echo.
echo Tudo pronto! Sistema funcionando!
echo.
pause
