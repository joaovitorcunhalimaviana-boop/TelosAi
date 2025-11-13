# 💾 Guia de Backups - Neon PostgreSQL

## 🎯 Por Que Fazer Backups?

O banco de dados Neon contém informações **CRÍTICAS**:
- ✅ Dados de pacientes (LGPD)
- ✅ Histórico de cirurgias
- ✅ Respostas de follow-up
- ✅ Prescrições e medicamentos
- ✅ Dados de pesquisa científica

**Perder esses dados = Perda irreparável**

---

## 🔒 Backups Automáticos do Neon (GRÁTIS)

O Neon oferece backups automáticos **GRATUITOS**:

### 📊 Plano Free (Padrão)
- ✅ **7 dias** de história de backups
- ✅ **Point-in-time Recovery** (PITR)
- ✅ Backups a cada **24 horas**
- ✅ Restauração com 1 clique

### 🚀 Plano Pro (Recomendado)
- ✅ **30 dias** de história
- ✅ **Point-in-time Recovery** avançado
- ✅ Backups mais frequentes
- ✅ Suporte prioritário

---

## 📋 Como Configurar Backups Automáticos

### Passo 1: Acessar o Neon Console

1. Acesse: https://console.neon.tech/
2. Faça login com sua conta
3. Selecione o projeto: **"neondb"**

### Passo 2: Verificar Configuração de Backup

1. No menu lateral, clique em **"Settings"**
2. Procure a seção **"Backups"**
3. Verifique se está ativado:
   - ✅ Automatic Backups: **Enabled**
   - ✅ Retention Period: **7 days** (ou 30 no Pro)

### Passo 3: (Opcional) Upgrade para Pro

Se você quer **mais proteção**:

1. Clique em **"Billing"** no menu
2. Selecione **"Upgrade to Pro"**
3. Benefícios:
   - 30 dias de backups
   - Mais storage
   - Suporte prioritário
   - Sem downtime

**Custo**: ~$19/mês (USD)

---

## 🔄 Como Restaurar um Backup

### Restauração Point-in-Time (PITR)

1. Acesse Neon Console
2. Vá em **"Branches"**
3. Clique em **"Create Branch"**
4. Selecione:
   - **Source**: main
   - **Type**: Point in Time
   - **Date/Time**: Escolha quando restaurar
5. Clique em **"Create Branch"**

Isso cria uma **cópia** do banco no estado escolhido!

### Restauração de Backup Completo

1. Acesse **"Settings"** → **"Backups"**
2. Veja a lista de backups disponíveis
3. Clique em **"Restore"** no backup desejado
4. Escolha:
   - Restaurar em novo branch (seguro)
   - Restaurar em branch existente (cuidado!)

---

## 📥 Backup Manual (Adicional)

Para **extra segurança**, faça backups manuais regulares:

### Método 1: pg_dump (Recomendado)

\`\`\`bash
# Exportar banco completo
pg_dump "postgresql://neondb_owner:npg_F9Kb4mPoVtcB@ep-royal-voice-ae6ov58i-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require" > backup_$(date +%Y%m%d).sql

# Compactar para economizar espaço
gzip backup_$(date +%Y%m%d).sql
\`\`\`

### Método 2: Neon CLI

\`\`\`bash
# Instalar Neon CLI
npm install -g neonctl

# Login
neonctl auth

# Criar backup branch
neonctl branches create --name backup-$(date +%Y%m%d) --type restore
\`\`\`

### Método 3: Prisma (Para Desenvolvedores)

\`\`\`bash
# Exportar schema e dados
npx prisma db pull
npx prisma db seed  # Se tiver seed file
\`\`\`

---

## 📅 Rotina de Backup Recomendada

### Para Desenvolvimento (Antes de Produção)

- **Diário**: Backup automático Neon (já configurado)
- **Semanal**: Backup manual com pg_dump
- **Antes de migrations**: Sempre! (veja README-MIGRATIONS.md)

### Para Produção (Com Pacientes Reais)

- **Diário**: Backup automático Neon ✅
- **Semanal**: Backup manual e armazenar em local externo
- **Mensal**: Backup full e testar restauração
- **Antes de migrations**: SEMPRE fazer backup!
- **Antes de deploy**: SEMPRE fazer backup!

---

## 🗂️ Onde Armazenar Backups Manuais?

### Opções Recomendadas:

1. **Google Drive**
   - Fácil, grátis até 15GB
   - Backup compactado (.sql.gz)

2. **AWS S3**
   - Profissional, barato
   - Versionamento automático

3. **GitHub (Private Repo)**
   - Para backups de schema apenas
   - **NÃO** para dados de pacientes (LGPD!)

4. **Dropbox**
   - Similar ao Google Drive
   - Sincronização automática

### ⚠️ IMPORTANTE - LGPD

Backups contêm dados sensíveis de pacientes:
- ✅ Sempre criptografar backups
- ✅ Armazenar em local seguro
- ✅ Controle de acesso restrito
- ✅ Seguir LGPD (Lei 13.709/2018)

---

## 🆘 Plano de Recuperação de Desastres

### Se algo der errado:

1. **Mantenha a calma** 🧘
2. **NÃO faça mais nada** no banco
3. **Acesse backups imediatamente**
4. **Restaure para branch separado** primeiro
5. **Teste a restauração**
6. **Só depois** restaure em produção

### Contatos de Emergência:

- **Neon Support**: https://neon.tech/docs/introduction/support
- **Neon Discord**: https://discord.gg/92vNTzKDGp
- **Prisma Discord**: https://pris.ly/discord

---

## ✅ Checklist de Segurança

Antes de começar a usar em produção:

- [ ] Backups automáticos do Neon ativados
- [ ] Testei restauração de backup uma vez
- [ ] Configurei rotina de backup manual
- [ ] Defini local seguro para armazenar backups
- [ ] Li e entendi processo de restauração
- [ ] Tenho plano B se tudo der errado
- [ ] Avisei a equipe sobre procedimentos

---

## 📊 Monitoramento

### Como saber se backups estão funcionando?

1. Acesse Neon Console semanalmente
2. Verifique **"Backups"** → **"History"**
3. Confirme que há backups recentes
4. Se não houver, **INVESTIGUE IMEDIATAMENTE**

### Alertas Recomendados:

Configure alertas para:
- ⚠️ Falha no backup automático
- ⚠️ Uso de disco > 80%
- ⚠️ Conexões do banco > limite
- ⚠️ Queries lentas (> 5s)

---

## 🔗 Links Úteis

- [Neon Backups Documentation](https://neon.tech/docs/introduction/point-in-time-restore)
- [Neon Console](https://console.neon.tech/)
- [PostgreSQL pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html)
- [LGPD - Lei Geral de Proteção de Dados](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

---

**Última Atualização**: 2025-11-13
**Database**: ep-royal-voice-ae6ov58i-pooler.c-2.us-east-2.aws.neon.tech
**Projeto**: neondb
**Plano Atual**: Free (7 dias de backups)

---

## 💡 Dica Final

> "O melhor backup é aquele que você nunca precisa usar,
> mas está sempre disponível quando necessário."

**Faça backups regularmente. Seu futuro eu agradece! 🙏**
