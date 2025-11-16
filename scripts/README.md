# Scripts Utilitários

Esta pasta contém scripts de manutenção e utilitários para o sistema.

## 🗑️ Limpar Pacientes de Teste

### Uso Rápido

```bash
npx ts-node scripts/cleanup-test-patients.ts
```

### O que o script faz?

1. **Lista todos os pacientes** cadastrados no banco
2. Mostra nome, telefone e data de cadastro
3. **Deleta TODOS os pacientes** (por padrão)

### ⚠️ ATENÇÃO

**Este script deleta permanentemente os pacientes do banco de dados!**

### Opções de Uso

#### Opção 1: Deletar TODOS os pacientes

O comportamento padrão do script deleta TODOS os pacientes:

```bash
npx ts-node scripts/cleanup-test-patients.ts
```

#### Opção 2: Deletar pacientes por telefone

Se você quer deletar apenas pacientes com números específicos:

1. Abra o arquivo `scripts/cleanup-test-patients.ts`
2. **Comente** a seção "OPÇÃO 1" (linha ~46):
   ```typescript
   // const deletedPatients = await prisma.patient.deleteMany({})
   ```
3. **Descomente** a seção "OPÇÃO 2" (linhas ~50-63)
4. Edite os números de telefone:
   ```typescript
   const testPhones = [
     '83999999999', // Seu número de teste 1
     '83988888888', // Seu número de teste 2
   ]
   ```
5. Execute o script

#### Opção 3: Deletar pacientes por nome

Se você quer deletar apenas pacientes com nomes específicos:

1. Abra o arquivo `scripts/cleanup-test-patients.ts`
2. **Comente** a seção "OPÇÃO 1"
3. **Descomente** a seção "OPÇÃO 3" (linhas ~66-79)
4. Edite os nomes:
   ```typescript
   const testNames = [
     'João Teste',
     'Maria Teste'
   ]
   ```
5. Execute o script

### Exemplo de Execução

```bash
$ npx ts-node scripts/cleanup-test-patients.ts

🗑️  Iniciando limpeza de pacientes de teste...

📋 Total de pacientes cadastrados: 2

📋 Pacientes cadastrados:
1. João Vitor - 83999999999 - 15/01/2025
2. Maria Silva - 83988888888 - 14/01/2025

⚠️  ATENÇÃO: Este script vai deletar TODOS os pacientes.

✅ 2 pacientes deletados com sucesso!

✅ Limpeza concluída!

🎉 Script finalizado com sucesso!
```

---

## 🔄 Outros Scripts (Futuros)

Esta pasta pode conter outros scripts úteis:

- `seed-database.ts` - Popular banco com dados de exemplo
- `migrate-data.ts` - Migrar dados entre versões
- `backup-database.ts` - Fazer backup do banco
- `generate-reports.ts` - Gerar relatórios

---

## 📝 Boas Práticas

1. ✅ **Sempre faça backup** antes de rodar scripts de limpeza
2. ✅ **Leia o código** do script antes de executar
3. ✅ **Teste em ambiente local** antes de produção
4. ⚠️ **Nunca rode scripts de limpeza em produção** sem confirmar

---

## 🆘 Recuperação de Dados

Se você deletou pacientes por engano:

1. **Se tiver backup do Prisma Studio**:
   - Reimporte os dados

2. **Se tiver backup do PostgreSQL**:
   ```bash
   railway run psql $DATABASE_URL < backup.sql
   ```

3. **Se não tiver backup**:
   - Você precisará recadastrar os pacientes manualmente
   - Por isso sempre faça backup antes de limpar dados!

---

## 📞 Dúvidas?

Se tiver problemas ao executar os scripts, verifique:

1. Node.js instalado (v18+)
2. Dependências instaladas (`npm install`)
3. Arquivo `.env` configurado com `DATABASE_URL`
4. Conexão com o banco funcionando
