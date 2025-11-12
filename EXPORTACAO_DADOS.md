# Sistema de Exportação de Dados para Pesquisa Científica

## Visão Geral

O sistema de exportação permite que pesquisadores e médicos exportem dados de acompanhamento pós-operatório em formatos Excel (.xlsx) ou CSV para análise estatística e publicação científica.

## Arquivos Criados

### 1. `lib/export-utils.ts`
Biblioteca de utilitários para exportação contendo:

#### Funções Principais:
- **`anonymizePatient()`**: Anonimiza dados do paciente, substituindo informações identificáveis por IDs sequenciais (P0001, P0002, etc.)
- **`formatRawData()`**: Formata dados brutos em formato tabular para exportação
- **`formatStatistics()`**: Gera estatísticas descritivas (médias, desvios-padrão, frequências)
- **`formatPainTrajectory()`**: Cria matriz paciente x dia com trajetória de dor
- **`generateExcelFile()`**: Gera arquivo Excel com múltiplas abas
- **`generateCSVFile()`**: Gera arquivo CSV simples
- **`calculateAge()`**: Calcula idade a partir da data de nascimento
- **Funções estatísticas**: `calculateStdDev()`, `calculateMedian()`

#### Tipos TypeScript:
- `PatientExportData`: Dados do paciente para exportação
- `SurgeryExportData`: Dados da cirurgia
- `FollowUpExportData`: Dados de acompanhamento
- `ExportFilters`: Filtros de exportação

### 2. `app/api/export/route.ts`
API Route do Next.js que processa as requisições de exportação:

#### Funcionalidades:
- Valida filtros recebidos
- Busca dados do Prisma com filtros aplicados
- Transforma dados do banco para formato de exportação
- Aplica anonimização se solicitado
- Gera arquivo (Excel ou CSV)
- Retorna arquivo para download com headers corretos

#### Endpoint:
- **POST** `/api/export`
- Body: `ExportFilters` (JSON)
- Response: Arquivo binário (Excel ou CSV)

### 3. `app/exportar/page.tsx`
Página web com interface de filtros e controles:

#### Seções da Interface:

**Filtros de Período:**
- Data início
- Data fim

**Tipo de Cirurgia:**
- Hemorroidectomia
- Fístula Anal
- Fissura Anal
- Doença Pilonidal
- (Checkbox para cada tipo)

**Opções de Exportação:**
- Apenas dados completos (≥80% preenchimento)
- Anonimizar dados (padrão: ativado)
- Formato: Excel ou CSV

**Campos a Exportar:**
- Dados demográficos (idade, sexo)
- Comorbidades
- Detalhes cirúrgicos (tipo, data, hospital, duração, anestesia, pré-op)
- Trajetória de dor (D+1 a D+14)
- Complicações
- Net Promoter Score (NPS)
- Dados identificáveis (nome, CPF, telefone) - desabilitado se anonimizado

### 4. `components/ui/checkbox.tsx`
Componente de checkbox usando Radix UI para interface moderna e acessível.

## Estrutura do Arquivo Excel

Quando o formato Excel é selecionado, o arquivo gerado contém 3 abas:

### Aba 1: Dados Brutos
Uma linha por paciente/cirurgia contendo:
- ID_Paciente (anonimizado ou real)
- Dados demográficos (se selecionado)
- Dados identificáveis (se não anonimizado e selecionado)
- Detalhes cirúrgicos
- Comorbidades
- Dor em cada dia (D+1, D+2, D+3, D+5, D+7, D+10, D+14)
- Estatísticas de dor (média, máxima, mínima)
- Taxa de adesão aos follow-ups
- Red flags detectados
- NPS

### Aba 2: Estatísticas Descritivas
Contém estatísticas agregadas organizadas por categoria:

**Dados Demográficos:**
- Total de pacientes
- Idade: média ± DP, mediana, mín-max
- Distribuição por sexo (N e %)

**Tipo de Cirurgia:**
- Frequência de cada tipo (N e %)

**Trajetória de Dor:**
- Para cada dia (D+1 a D+14):
  - Média ± desvio padrão
  - Mediana [mín-max]
  - Número de respostas

**Comorbidades:**
- Frequência de cada comorbidade (N e %)
- Ordenado por frequência decrescente

**Net Promoter Score:**
- NPS médio
- % Promotores (9-10)
- % Neutros (7-8)
- % Detratores (0-6)
- NPS Score final

### Aba 3: Trajetória de Dor
Matriz paciente x dia:
- Colunas: ID_Paciente, ID_Cirurgia, Tipo_Cirurgia, Data_Cirurgia, D+1, D+2, D+3, D+5, D+7, D+10, D+14
- Uma linha por cirurgia
- Facilita análise longitudinal e gráficos de evolução

## Formato CSV

Se CSV for selecionado, apenas os dados brutos são exportados em formato de valores separados por vírgula, compatível com Excel, R, Python (pandas), SPSS, etc.

## Anonimização

Quando a opção "Anonimizar dados" está ativada:
- Nome é removido
- CPF é removido
- Telefone é removido
- ID do paciente é substituído por código sequencial: P0001, P0002, P0003...
- ID da cirurgia é substituído por: S0001-1, S0001-2 (paciente-cirurgia)

Todos os outros dados clínicos são preservados para análise científica.

## Filtros Disponíveis

### Período:
- Filtra cirurgias realizadas entre data início e data fim
- Ambos opcionais
- Se não especificados, inclui todas as cirurgias

### Tipo de Cirurgia:
- Permite selecionar múltiplos tipos
- Se nenhum tipo for selecionado, inclui todos

### Apenas Dados Completos:
- Quando ativado, exporta apenas cirurgias com ≥80% de completude de dados
- Útil para pesquisas que exigem dados consistentes

### Anonimizar:
- Recomendado por padrão para conformidade com LGPD
- Remove dados identificáveis e substitui por códigos

## Uso

### Acesso:
1. Acesse: `http://localhost:3000/exportar`
2. Configure os filtros desejados
3. Selecione os campos a exportar
4. Escolha o formato (Excel ou CSV)
5. Clique em "Exportar Dados"
6. O arquivo será baixado automaticamente

### Exemplo de Uso Científico:

**Para artigo sobre dor pós-operatória em hemorroidectomia:**
1. Período: 01/01/2024 a 31/12/2024
2. Tipo: Hemorroidectomia
3. Anonimizar: Sim
4. Campos:
   - Dados demográficos ✓
   - Detalhes cirúrgicos ✓
   - Trajetória de dor ✓
   - Comorbidades ✓
5. Formato: Excel

**Resultado:**
- Arquivo Excel com 3 abas
- Estatísticas prontas para uso em Methods/Results
- Matriz de dor para gráficos de evolução
- Dados completamente anonimizados

## Tecnologias Utilizadas

- **Next.js 16**: Framework React com API Routes
- **Prisma**: ORM para acesso ao banco PostgreSQL
- **xlsx**: Biblioteca para geração de arquivos Excel
- **Radix UI**: Componentes acessíveis de interface
- **TypeScript**: Tipagem estática para segurança

## Segurança e Privacidade

- Anonimização por padrão
- Conformidade com LGPD
- Dados identificáveis só exportados se explicitamente solicitado
- Sem armazenamento de arquivos exportados no servidor
- Download direto no navegador

## Próximas Melhorias

Possíveis melhorias futuras:
- Exportação de imagens/fotos (se houver)
- Filtros por hospital/médico
- Agendamento de exportações periódicas
- Gráficos automáticos no Excel
- Análise estatística automática (testes de hipótese)
- Exportação em formato R/Python (scripts prontos)
- Template de artigo científico pré-formatado
