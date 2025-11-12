# Guia Rápido - Exportação de Dados

## Como usar o sistema de exportação

### 1. Acessar a página de exportação

```
http://localhost:3000/exportar
```

### 2. Cenários comuns de uso

#### Cenário A: Exportar todos os dados de hemorroidectomia de 2024 (anonimizado)

1. **Período:**
   - Data Início: 01/01/2024
   - Data Fim: 31/12/2024

2. **Tipo de Cirurgia:**
   - ✓ Hemorroidectomia

3. **Opções:**
   - ✓ Anonimizar dados

4. **Campos:**
   - ✓ Dados demográficos
   - ✓ Comorbidades
   - ✓ Detalhes cirúrgicos
   - ✓ Trajetória de dor
   - ✓ Complicações
   - ✓ NPS

5. **Formato:** Excel (.xlsx)

6. Clique em **"Exportar Dados"**

**Resultado:** Arquivo Excel com 3 abas contendo dados anonimizados de todos os pacientes de hemorroidectomia de 2024.

---

#### Cenário B: Exportar apenas dados completos para análise estatística

1. **Período:** (deixe vazio para incluir todos)

2. **Tipo de Cirurgia:** (deixe vazio para incluir todos)

3. **Opções:**
   - ✓ Apenas dados completos (80% ou mais)
   - ✓ Anonimizar dados

4. **Campos:**
   - ✓ Dados demográficos
   - ✓ Trajetória de dor
   - ✓ NPS

5. **Formato:** CSV (.csv)

6. Clique em **"Exportar Dados"**

**Resultado:** Arquivo CSV simples para importar em R, Python ou SPSS.

---

#### Cenário C: Exportar dados identificáveis para auditoria interna

1. **Período:**
   - Data Início: 01/11/2024
   - Data Fim: 30/11/2024

2. **Tipo de Cirurgia:** (todos)

3. **Opções:**
   - ⬜ Anonimizar dados (DESATIVADO)

4. **Campos:**
   - ✓ Dados demográficos
   - ✓ Comorbidades
   - ✓ Detalhes cirúrgicos
   - ✓ Trajetória de dor
   - ✓ Complicações
   - ✓ NPS
   - ✓ **Dados identificáveis** (habilitado porque não está anonimizado)

5. **Formato:** Excel (.xlsx)

6. Clique em **"Exportar Dados"**

**Resultado:** Arquivo Excel com nomes, CPF e telefones dos pacientes para auditoria.

---

#### Cenário D: Comparar trajetórias de dor entre tipos de cirurgia

1. **Período:** (todos)

2. **Tipo de Cirurgia:**
   - ✓ Hemorroidectomia
   - ✓ Fístula Anal

3. **Opções:**
   - ✓ Anonimizar dados

4. **Campos:**
   - ✓ Dados demográficos
   - ✓ Detalhes cirúrgicos
   - ✓ **Trajetória de dor** (principal)

5. **Formato:** Excel (.xlsx)

6. Clique em **"Exportar Dados"**

**Resultado:**
- Aba "Trajetória de Dor" com matriz completa
- Aba "Estatísticas" com médias por dia
- Aba "Dados Brutos" para análises adicionais

---

## Estrutura dos arquivos gerados

### Excel (.xlsx) - 3 Abas:

**Aba 1: Dados Brutos**
```
| ID_Paciente | Idade | Sexo | Tipo_Cirurgia | Dor_D1 | Dor_D2 | ... | NPS |
|-------------|-------|------|---------------|--------|--------|-----|-----|
| P0001       | 45    | M    | hemorroidec.  | 7      | 6      | ... | 9   |
| P0002       | 38    | F    | fistula       | 5      | 4      | ... | 10  |
```

**Aba 2: Estatísticas**
```
| Categoria              | Medida          | Valor              |
|------------------------|-----------------|-------------------|
| DADOS DEMOGRÁFICOS     |                 |                   |
| Total de Pacientes     | N               | 150               |
| Idade                  | Média           | 42.5              |
| Idade                  | Desvio Padrão   | 12.3              |
| Sexo                   | Masculino       | 95 (63.3%)        |
| Sexo                   | Feminino        | 55 (36.7%)        |
|                        |                 |                   |
| TRAJETÓRIA DE DOR      |                 |                   |
| Dor D+1                | Média ± DP      | 6.5 ± 1.8         |
| Dor D+1                | Mediana [Min-Max]| 7 [2-10]         |
```

**Aba 3: Trajetória de Dor**
```
| ID_Paciente | Tipo_Cirurgia | D+1 | D+2 | D+3 | D+5 | D+7 | D+10 | D+14 |
|-------------|---------------|-----|-----|-----|-----|-----|------|------|
| P0001       | hemorroidec.  | 7   | 6   | 5   | 4   | 3   | 2    | 1    |
| P0002       | fistula       | 5   | 4   | 3   | 3   | 2   | 1    | 0    |
```

### CSV (.csv) - Arquivo único:

Contém apenas os dados brutos em formato de valores separados por vírgula, compatível com qualquer software estatístico.

---

## Dicas importantes

### Anonimização (LGPD)
- **Sempre use anonimização para pesquisas científicas**
- Dados anonimizados podem ser compartilhados sem consentimento adicional
- IDs sequenciais (P0001, P0002) permitem rastreamento sem identificação

### Completude de dados
- Use "Apenas dados completos" para análises rigorosas
- Filtro de 80% garante que a maioria dos campos está preenchida
- Evita viés por dados ausentes

### Formato
- **Excel:** Melhor para visualização, relatórios e apresentações
- **CSV:** Melhor para importar em software estatístico (R, Python, SPSS)

### Período
- Deixe vazio para incluir todos os dados históricos
- Use períodos específicos para estudos longitudinais
- Ex: "Primeiro trimestre de 2024" vs "Todo 2024"

### Campos a exportar
- Selecione apenas os campos necessários para sua pesquisa
- Menos campos = arquivo menor e mais focado
- Sempre inclua "Dados demográficos" e "Detalhes cirúrgicos" como baseline

---

## Troubleshooting

### "Nenhum paciente encontrado"
- Verifique se os filtros não estão muito restritivos
- Tente expandir o período de datas
- Remova filtros de tipo de cirurgia
- Desative "Apenas dados completos"

### Arquivo muito grande
- Aplique filtros de período
- Selecione apenas tipos de cirurgia específicos
- Use formato CSV ao invés de Excel
- Exporte em lotes (por trimestre, por exemplo)

### Dados identificáveis desabilitados
- Desative a opção "Anonimizar dados"
- O checkbox de "Dados identificáveis" será habilitado automaticamente

---

## Exemplos de uso científico

### Para artigo científico
**Título:** "Trajetória de dor pós-operatória em hemorroidectomia com bloqueio pudendo"

**Filtros:**
- Período: 2024 completo
- Tipo: Hemorroidectomia
- Anonimizar: Sim
- Campos: Demográficos + Detalhes cirúrgicos + Trajetória de dor

**Uso dos dados:**
- Aba "Estatísticas" → Seção Methods (média de idade, distribuição por sexo)
- Aba "Estatísticas" → Seção Results (tabela de dor por dia)
- Aba "Trajetória de Dor" → Gráfico de linha mostrando evolução

### Para apresentação em congresso
**Título:** "Análise comparativa de complicações entre técnicas cirúrgicas"

**Filtros:**
- Período: Todos
- Tipos: Todos
- Anonimizar: Sim
- Campos: Demográficos + Detalhes + Complicações + NPS

**Uso dos dados:**
- Aba "Dados Brutos" → Filtrar por técnica no Excel
- Aba "Estatísticas" → Slides com frequências de complicações
- Criar tabelas e gráficos diretamente no PowerPoint

---

## Suporte

Para dúvidas ou problemas:
1. Verifique este guia
2. Consulte o arquivo `EXPORTACAO_DADOS.md` para documentação técnica completa
3. Entre em contato com o desenvolvedor do sistema
