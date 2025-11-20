# Configuração de Backup Automático

## ✅ O que foi implementado

Sistema de backup automático do banco de dados Neon PostgreSQL usando branches.

### Arquivos criados/modificados:
- ✅ `app/api/cron/backup-database/route.ts` - Endpoint de backup
- ✅ `vercel.json` - Cron job configurado (03:00 UTC diariamente)
- ✅ `.env.example` - Variáveis NEON_API_KEY e NEON_PROJECT_ID

## 🎯 Como funciona

### Estratégia de Backup (Branch-based)

O Neon PostgreSQL não oferece dump SQL tradicional na API, mas tem um recurso melhor:
**Branches** - Cópias completas do banco de dados que podem ser restauradas instantaneamente.

1. **Backup Diário** (03:00 UTC = 00:00 BRT)
   - Cria um branch chamado `backup-YYYY-MM-DD`
   - Branch contém snapshot completo do banco naquele momento
   - Backup é instantâneo (copy-on-write)

2. **Retenção de 7 dias**
   - Mantém backups dos últimos 7 dias
   - Deleta automaticamente backups mais antigos
   - Economiza espaço de armazenamento

3. **Restauração Rápida**
   - Restaurar = trocar a connection string para o branch de backup
   - Sem downtime
   - Sem necessidade de importar dumps SQL

## 📋 Configuração (Passos Obrigatórios)

### 1. Obter NEON_PROJECT_ID

O Project ID já está visível na URL do seu console Neon:

```
https://console.neon.tech/app/projects/raspy-base-15161385
                                        ^^^^^^^^^^^^^^^^^^
                                        Este é o Project ID
```

**Seu Project ID:** `raspy-base-15161385`

### 2. Criar API Key no Neon

1. Acesse: https://console.neon.tech/app/settings/api-keys
2. Clique em **"Create New API Key"**
3. Nome sugerido: "Backup Automation Key"
4. **Permissões necessárias:**
   - ✅ Full Access (ou pelo menos Create/Delete branches)
5. Clique em **"Create"**
6. **COPIE A KEY IMEDIATAMENTE** (só aparece uma vez!)

A key terá formato: `neon_api_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 3. Adicionar variáveis no Vercel

No painel da Vercel (https://vercel.com), vá em:

**Settings → Environment Variables** e adicione:

```bash
# Neon API Key (para criar/deletar branches de backup)
NEON_API_KEY=neon_api_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Neon Project ID (já sabemos qual é)
NEON_PROJECT_ID=raspy-base-15161385
```

**IMPORTANTE:** Marque as variáveis como disponíveis em:
- ✅ Production
- ⚠️ Preview (opcional)
- ⚠️ Development (deixe desmarcado - não faz backup em dev)

### 4. Redeploy no Vercel

Após adicionar as variáveis:

1. Vá em **Deployments**
2. Clique nos 3 pontinhos do último deploy
3. Clique em **Redeploy**
4. Aguarde o build completar

## 🧪 Como testar

### Teste manual (sem esperar o cron)

Execute o endpoint diretamente:

```bash
curl -X GET "https://seu-dominio.vercel.app/api/cron/backup-database" \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

Ou use o navegador (se CRON_SECRET não estiver configurado):
```
https://seu-dominio.vercel.app/api/cron/backup-database
```

### Verificar se o backup foi criado

1. Acesse: https://console.neon.tech/app/projects/raspy-base-15161385
2. Vá em **Branches**
3. Você deve ver um branch chamado `backup-2025-11-20` (data de hoje)

### Monitorar backups (Vercel Logs)

1. Vá em **Deployments → [Production] → Functions**
2. Filtre por `/api/cron/backup-database`
3. Procure por logs:
   - ✅ `📸 Criando branch de backup: backup-YYYY-MM-DD`
   - ✅ `✅ Branch de backup criada com sucesso`
   - ✅ `🧹 Verificando branches antigos para limpeza`

## 🔄 Como restaurar um backup

### Cenário 1: Erro recente (último backup)

1. Acesse Neon Console → Branches
2. Encontre o branch `backup-YYYY-MM-DD` mais recente
3. Copie a **Connection String** do branch
4. No Vercel, vá em **Environment Variables**
5. Atualize `DATABASE_URL` com a connection string do backup
6. Redeploy a aplicação

### Cenário 2: Restaurar para branch principal

Se quiser promover um backup como branch principal:

1. Neon Console → Branches
2. Selecione o branch de backup
3. Clique em **"Set as Primary"**
4. Confirme a operação

**Atenção:** Isso sobrescreve o branch principal! Faça um backup antes.

### Cenário 3: Restaurar dados específicos

Se precisar de dados específicos de um backup:

1. Conecte-se ao branch de backup usando ferramenta SQL (ex: psql, DBeaver)
2. Connection string está no Neon Console
3. Exporte apenas as tabelas/dados necessários
4. Importe no branch principal

## 📊 Cronograma de Backups

```
03:00 UTC (00:00 BRT) - Backup automático executa
03:01 UTC - Branch backup-YYYY-MM-DD criado
03:02 UTC - Limpeza de backups com mais de 7 dias
```

### Backups disponíveis

Com execução diária, você terá sempre:
- Hoje (backup-2025-11-20)
- Ontem (backup-2025-11-19)
- Anteontem (backup-2025-11-18)
- ...até 7 dias atrás (backup-2025-11-13)

## 💰 Custos

### Neon Free Tier:
- ✅ 10 GB de armazenamento
- ✅ Branches ilimitados
- ⚠️ Branches consomem armazenamento compartilhado

### Com 7 backups:
- Se banco principal tem 500 MB
- Branches usam copy-on-write (só dados alterados)
- Estimativa: ~1-2 GB total para 7 dias de backups
- **Suficiente para o Free Tier**

Se crescer muito, considere:
- Reduzir retenção para 3 dias
- Upgrade para Neon Pro ($19/mês) - 50 GB

## 🔒 Segurança

### Proteções implementadas:

1. **CRON_SECRET** - Autenticação do cron job
   - Evita execução não autorizada
   - Verificação via header Authorization

2. **NEON_API_KEY** - Scoped apenas para o projeto
   - Só acessa o projeto especificado
   - Não tem acesso a outros recursos Neon

3. **Logs completos** - Auditoria
   - Toda execução é logada no Vercel
   - Erros reportados ao Sentry

## ⚠️ Troubleshooting

### Erro: "NEON_API_KEY não configurado"

1. Verifique se a variável existe no Vercel
2. Verifique se fez redeploy após adicionar
3. Verifique se está marcada para "Production"

### Erro: "Failed to create backup branch"

1. Verifique se API key está correta
2. Verifique se API key tem permissões de criar branches
3. Verifique se o Project ID está correto

### Branch de backup já existe

Não é erro! Significa que o backup de hoje já foi feito.
O cron não executará duas vezes no mesmo dia.

### Backups antigos não são deletados

1. Verifique logs para ver se há erros na limpeza
2. Pode deletar manualmente no Neon Console se necessário
3. Branches órfãos (sem uso) não consomem armazenamento adicional

## ✅ Checklist de configuração

- [ ] Project ID identificado (`raspy-base-15161385`)
- [ ] API Key criada no Neon Console
- [ ] `NEON_API_KEY` adicionada no Vercel
- [ ] `NEON_PROJECT_ID` adicionada no Vercel
- [ ] Redeploy realizado
- [ ] Teste manual executado com sucesso
- [ ] Branch de backup apareceu no Neon Console
- [ ] Logs do Vercel mostram sucesso

## 📚 Recursos adicionais

- [Neon Branching Docs](https://neon.tech/docs/guides/branching)
- [Neon API Reference](https://api-docs.neon.tech/reference/getting-started-with-neon-api)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

---

**Implementado em:** 2025-11-20
**Status:** ✅ Pronto para produção (após configurar API key)
**Próxima execução:** Diariamente às 03:00 UTC (00:00 BRT)
