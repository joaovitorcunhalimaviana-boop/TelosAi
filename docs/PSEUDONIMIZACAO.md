# 🔒 Pseudonimização para Pesquisas Científicas

## O Que É Pseudonimização?

A **pseudonimização** é uma técnica de proteção de dados que substitui informações identificáveis por identificadores artificiais (pseudônimos), permitindo que dados sejam processados sem revelar a identidade real dos indivíduos.

**Diferença para Anonimização**:
- **Anonimização**: Impossível reverter (dados deixam de ser pessoais)
- **Pseudonimização**: Possível reverter COM acesso ao banco de dados

## ⚖️ Fundamento Legal (LGPD)

**Art. 13, § 3º da LGPD**:
> "A comunicação ou o uso compartilhado de dados pessoais de pessoa natural para fins de estudos em saúde pública [...] ou **para realização de estudos por órgão de pesquisa**, garantida, sempre que possível, a **pseudonimização** dos dados pessoais."

A LGPD **PREFERE** pseudonimização para pesquisa científica, pois:
- ✅ Protege a identidade dos pacientes
- ✅ Permite validação científica quando necessário
- ✅ Mantém a rastreabilidade para qualidade de dados

---

## 🔧 Como Funciona

### 1. **Geração do ID Pseudônimo**

```typescript
// Entrada:
patientId = "uuid-abc-123"
researchId = "research-xyz-789"
RESEARCH_SALT = "f1668d9cfdf515ffb56fc3fde839244123b64ca042a58f8bef8a332d1cc208ef"

// Hash SHA-256:
hash("uuid-abc-123-research-xyz-789-f1668d9cfdf515...")
  → "a3f2d9e8c1b5f7c4b2a1d8e6..."

// ID Pseudônimo:
"PSE-A3F2D9E8C1B5"
```

**Características**:
- ✅ **Determinístico**: Mesmo paciente = mesmo ID em todas as exportações
- ✅ **Irreversível**: Impossível descobrir o patientId apenas com "PSE-A3F2D9E8C1B5"
- ✅ **Seguro**: Hash SHA-256 + salt secreto (256 bits)

### 2. **Exportação (Excel/CSV/PDF)**

```
ID_Pseudonimo      | Idade | Sexo      | Cirurgia         | Dor D+7
-------------------|-------|-----------|------------------|--------
PSE-A3F2D9E8C1B5  | 45    | Masculino | Hemorroidectomia | 8/10
PSE-F7C4B2A1D8E6  | 52    | Feminino  | Fissura          | 3/10
PSE-B9D1E4A7C3F2  | 38    | Masculino | Fístula          | 6/10
```

☝️ **Seguro para publicação** - Ninguém identifica os pacientes

### 3. **Dashboard (Tabela de Mapeamento)**

```
┌────────────────────┬─────────────────┬───────────────┐
│ ID Pseudônimo      │ Paciente Real   │ Telefone      │
├────────────────────┼─────────────────┼───────────────┤
│ PSE-A3F2D9E8C1B5  │ João Silva      │ 83999999999   │
│ PSE-F7C4B2A1D8E6  │ Maria Costa     │ 83988888888   │
│ PSE-B9D1E4A7C3F2  │ Pedro Santos    │ 83977777777   │
└────────────────────┴─────────────────┴───────────────┘
```

☝️ **Só você vê** - Permite re-identificação quando necessário

### 4. **Re-identificação (Quando Necessário)**

```typescript
// Você quer saber: "Quem é PSE-A3F2D9E8C1B5?"

// Sistema testa TODOS os pacientes da pesquisa:
for (const patient of allPatients) {
  const hash = gerarHash(patient.id, researchId)

  if (hash === "PSE-A3F2D9E8C1B5") {
    return patient // ✅ João Silva!
  }
}
```

**Como é possível**:
- ✅ Você tem acesso ao banco de dados (lista de pacientes)
- ✅ Você tem acesso ao RESEARCH_SALT (variável de ambiente)
- ✅ Você pode recalcular o hash de cada paciente

**Por que é seguro**:
- ❌ Hackers SEM acesso ao banco não conseguem reverter
- ❌ Pesquisadores SEM acesso ao banco não conseguem reverter
- ❌ Rainbow table attacks não funcionam (salt de 256 bits)

---

## 🚀 Configuração Passo a Passo

### **Passo 1: Gerar o Salt**

No terminal, execute:

```bash
openssl rand -hex 32
```

**Saída** (exemplo):
```
f1668d9cfdf515ffb56fc3fde839244123b64ca042a58f8bef8a332d1cc208ef
```

⚠️ **ATENÇÃO**: Guarde esse valor com segurança!

### **Passo 2: Adicionar ao .env Local**

Abra o arquivo `.env` e adicione:

```env
# Pseudonimização de Pesquisas (LGPD Art. 13, § 3º)
# NUNCA compartilhe este valor! Se vazar, será necessário gerar um novo.
RESEARCH_PSEUDONYM_SALT=f1668d9cfdf515ffb56fc3fde839244123b64ca042a58f8bef8a332d1cc208ef
```

### **Passo 3: Adicionar ao Railway (Produção)**

```bash
railway variables --set RESEARCH_PSEUDONYM_SALT="f1668d9cfdf515ffb56fc3fde839244123b64ca042a58f8bef8a332d1cc208ef"
```

Ou pela interface web:
1. Acesse dashboard.railway.app
2. Selecione seu projeto
3. Vá em "Variables"
4. Adicione `RESEARCH_PSEUDONYM_SALT` com o valor gerado

### **Passo 4: Restart (se já estiver rodando)**

```bash
railway redeploy
```

---

## 📊 Exemplo de Uso Completo

### **1. Exportar Dados de Pesquisa**

```typescript
// No dashboard de exportação:
// 1. Selecione a pesquisa
// 2. Escolha os grupos (A, B, C...)
// 3. Selecione os campos desejados
// 4. Clique em "Exportar"

// Resultado: arquivo Excel com IDs pseudônimos
```

### **2. Ver Tabela de Mapeamento**

```typescript
// No dashboard de exportação:
// 1. Clique em "Mostrar Dados Reais"
// 2. Tabela de mapeamento aparece
// 3. Busque por ID pseudônimo, nome ou telefone
```

### **3. Re-contatar um Paciente**

```typescript
// Cenário: Você vê no Excel que PSE-A3F2D9E8C1B5 tem NPS 9 suspeito

// No dashboard:
// 1. Busque "PSE-A3F2D9E8C1B5" na tabela de mapeamento
// 2. Veja que é "João Silva"
// 3. Clique em "WhatsApp" para confirmar o dado
```

---

## 🔒 Boas Práticas de Segurança

### ✅ **O Que FAZER**:

1. **Proteja o RESEARCH_SALT**:
   - ❌ Nunca commite no Git
   - ❌ Nunca compartilhe por email/WhatsApp
   - ✅ Armazene em gerenciador de senhas (1Password, LastPass, etc)

2. **Use a tabela de mapeamento com responsabilidade**:
   - ✅ Documente POR QUÊ você re-identificou alguém
   - ✅ Re-identifique apenas quando NECESSÁRIO
   - ✅ Exemplo de justificativa: "Validar NPS inconsistente no PSE-XXX"

3. **Ao publicar artigo**:
   - ✅ Exporte apenas os dados pseudonimizados
   - ❌ NUNCA inclua a tabela de mapeamento
   - ✅ Mencione: "Dados pseudonimizados conforme Art. 13, § 3º da LGPD"

### ❌ **O Que NÃO FAZER**:

1. ❌ Não compartilhe o RESEARCH_SALT com co-autores sem necessidade
2. ❌ Não exporte a tabela de mapeamento para Excel
3. ❌ Não envie dados pseudonimizados + tabela de mapeamento juntos
4. ❌ Não use o mesmo salt para múltiplos projetos (se possível)

---

## 🆘 Troubleshooting

### **Erro: "RESEARCH_PSEUDONYM_SALT não configurado"**

**Causa**: Variável de ambiente não definida

**Solução**:
```bash
# Local:
echo 'RESEARCH_PSEUDONYM_SALT=SEU_SALT_AQUI' >> .env

# Railway:
railway variables --set RESEARCH_PSEUDONYM_SALT="SEU_SALT_AQUI"
```

### **IDs pseudônimos mudaram após re-deploy**

**Causa**: RESEARCH_SALT diferente ou perdido

**Solução**:
1. Use o MESMO salt sempre
2. Se perdeu o salt original, será necessário gerar um novo
3. **Consequência**: IDs pseudônimos serão diferentes em novas exportações

### **Preciso mudar o RESEARCH_SALT**

**Quando mudar**:
- ✅ Se o salt vazou
- ✅ Se suspeita de comprometimento
- ❌ Nunca mude por motivo trivial

**Consequência**:
- ⚠️ IDs pseudônimos **MUDARÃO** para todos os pacientes
- ⚠️ Exportações antigas **NÃO** serão compatíveis com novas

**Procedimento**:
```bash
# 1. Gere novo salt
openssl rand -hex 32

# 2. Atualize .env
RESEARCH_PSEUDONYM_SALT=NOVO_SALT_AQUI

# 3. Atualize Railway
railway variables --set RESEARCH_PSEUDONYM_SALT="NOVO_SALT_AQUI"

# 4. Redeploy
railway redeploy

# 5. Re-exporte TODAS as pesquisas afetadas
```

---

## 📚 Documentação Adicional

- **LGPD Completa**: [http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- **Art. 13, § 3º**: Sobre pseudonimização em pesquisas
- **Hash SHA-256**: [https://en.wikipedia.org/wiki/SHA-2](https://en.wikipedia.org/wiki/SHA-2)
- **Código-fonte**: `lib/research-pseudonymization.ts`

---

## ❓ Perguntas Frequentes

**P: Por que usar hash ao invés de um ID sequencial?**
R: Hash é irreversível sem acesso ao banco. ID sequencial (P001, P002...) não tem segurança alguma se a tabela de mapeamento vazar.

**P: Posso usar o mesmo salt para todas as pesquisas?**
R: Sim, mas idealmente cada pesquisa deveria ter seu próprio salt. Para simplificar, usamos um salt global que já oferece ótima segurança.

**P: O que acontece se o banco de dados vazar?**
R: Com acesso ao banco + salt, é possível re-identificar pacientes. Por isso o salt NUNCA deve estar no código-fonte (use .env).

**P: Preciso do consentimento do paciente?**
R: **SIM!** O TCLE (Termo de Consentimento) deve informar que dados serão usados para pesquisa científica e pseudonimizados.

**P: Posso publicar os IDs pseudônimos?**
R: **SIM!** IDs pseudônimos (PSE-XXX) são seguros para publicação. Apenas **não publique** a tabela de mapeamento.

---

**Última atualização**: Janeiro 2025
**Versão da LGPD**: Lei nº 13.709/2018
**Contato**: telos.ia@gmail.com
