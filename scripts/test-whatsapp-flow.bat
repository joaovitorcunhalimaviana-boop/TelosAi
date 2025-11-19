@echo off
echo ====================================
echo TESTE DO FLUXO WHATSAPP COMPLETO
echo ====================================
echo.

echo [1/3] Resetando follow-up no banco...
echo Execute no Supabase SQL Editor:
echo.
echo UPDATE "FollowUp"
echo SET status = 'pending', "sentAt" = NULL
echo WHERE id = 'cmi5rhsae0004nr0ql4875zt4';
echo.
pause

echo.
echo [2/3] Chamando cron job manualmente...
curl -X GET "https://proactive-rejoicing-production.up.railway.app/api/cron/send-followups" ^
  -H "Authorization: Bearer eUNh2cF7Ul5grcGvXwz4T1hHg+jUiB/ilG8wY3Am/VA="

echo.
echo.
echo [3/3] AGUARDE A MENSAGEM NO CELULAR
echo.
echo O que vai acontecer:
echo ✅ Mensagem deve chegar com texto correto (sem interrogações)
echo ✅ Responda "sim" no WhatsApp
echo ✅ Sistema deve te reconhecer como paciente
echo ✅ Questionário deve iniciar
echo.
pause
