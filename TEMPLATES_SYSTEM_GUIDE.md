# Sistema de Templates - Guia Completo

## Visão Geral

O sistema de templates permite que o Dr. João salve suas configurações padrão de procedimentos cirúrgicos e as aplique rapidamente a novos pacientes, economizando tempo e garantindo consistência nos protocolos.

## Arquivos Criados

### 1. Database Schema
**Arquivo:** `prisma/schema.prisma`
- Adicionado model `SurgeryTemplate` com campos:
  - `id`, `createdAt`, `updatedAt`
  - `name`: Nome do template (ex: "Minha hemorroidectomia padrão")
  - `surgeryType`: Tipo de cirurgia (hemorroidectomia, fistula, fissura, pilonidal)
  - `templateData`: JSON com todas as configurações
  - `isDefault`: Flag para template padrão

### 2. Biblioteca de Utilitários
**Arquivo:** `lib/template-utils.ts`

Funções principais:
- `extractTemplateFromSurgery()`: Extrai dados de template de uma cirurgia existente
- `applyTemplateToSurgery()`: Aplica template aos dados de um paciente
- `validateTemplate()`: Valida compatibilidade entre template e tipo de cirurgia
- `getTemplateSummary()`: Gera resumo legível do template
- `SURGERY_TYPE_LABELS`: Mapeamento de tipos de cirurgia

### 3. API Routes

#### `app/api/templates/route.ts`
- **GET**: Lista todos os templates (com filtro por tipo de cirurgia)
- **POST**: Cria novo template
- **PATCH**: Atualiza template existente
- **DELETE**: Remove template

#### `app/api/templates/[id]/apply/route.ts`
- **POST**: Aplica template a uma cirurgia específica
- Atualiza todas as seções: detalhes cirúrgicos, pré-op, anestesia, prescrição
- Recalcula completeness da cirurgia

### 4. Páginas

#### `app/templates/page.tsx` - Gestão de Templates
Funcionalidades:
- Listagem de todos os templates
- Filtro por tipo de cirurgia
- Preview de template com resumo
- Definir/remover como padrão
- Excluir templates
- Link para criar novo template

#### `app/templates/novo/page.tsx` - Guia para Criar Templates
- Instruções passo a passo
- Exemplo de uso
- Links de ação rápida
- Explica que templates são criados a partir de pacientes existentes

### 5. Componentes

#### `components/ApplyTemplateDialog.tsx`
Dialog para aplicar template:
- Lista templates disponíveis para o tipo de cirurgia
- Seleção com radio buttons
- Preview do template selecionado
- Auto-seleciona template padrão se existir
- Aplica template e recarrega dados do paciente

#### `components/SaveAsTemplateDialog.tsx`
Dialog para salvar como template:
- Input para nome do template
- Checkbox para definir como padrão
- Extrai dados automaticamente do paciente atual
- Remove informações pessoais (mantém apenas configurações clínicas)

#### `components/ui/alert-dialog.tsx`
Componente de diálogo de alerta (criado para suportar confirmações)

#### `components/ui/radio-group.tsx`
Componente de seleção única (criado para seleção de templates)

### 6. Integração na Página de Edição

**Arquivo:** `app/paciente/[id]/editar/page.tsx`

Adicionado:
- Botão "Aplicar Template" (com ícone Download)
- Botão "Salvar como Template" (com ícone FileText)
- Dialogs de template
- Função de reload após aplicar template

### 7. Integração no Dashboard

**Arquivo:** `app/dashboard/page.tsx`

Adicionado:
- Botão "Templates" na barra de ações do header

## Como Usar

### Criar um Template

1. **Preencha um paciente completamente:**
   - Vá para a página de edição de qualquer paciente
   - Preencha todas as seções com suas configurações padrão:
     - Detalhes cirúrgicos (técnica, energia, etc)
     - Pré-operatório (botox, preparo intestinal)
     - Anestesia (tipo, bloqueio pudendo)
     - Prescrição pós-operatória (pomadas e medicamentos)

2. **Salve como template:**
   - Clique no botão "Salvar como Template"
   - Digite um nome descritivo (ex: "Minha hemorroidectomia padrão do Dr. João")
   - Marque "Definir como padrão" se quiser que seja aplicado automaticamente
   - Clique em "Salvar Template"

3. **Gerencie templates:**
   - Acesse Dashboard > Templates
   - Visualize, edite ou exclua templates
   - Defina qual é o padrão para cada tipo de cirurgia

### Aplicar um Template

1. **Durante edição de paciente:**
   - Na página de edição do paciente
   - Clique no botão "Aplicar Template"
   - Selecione o template desejado
   - Visualize o preview
   - Clique em "Aplicar Template"

2. **Resultado:**
   - Todos os campos são preenchidos automaticamente
   - Dados existentes são preservados
   - Template apenas adiciona/atualiza configurações clínicas
   - Dados pessoais do paciente não são afetados

## Estrutura dos Dados do Template

```typescript
{
  surgeryDetails: {
    // Hemorroidectomia
    hemorrhoidTechnique: ["Ferguson modificada por Campos"],
    hemorrhoidEnergyType: "ligasure",
    hemorrhoidType: "mista",
    hemorrhoidInternalGrade: "III",

    // Fístula
    fistulaType: "interesfincteriana",
    fistulaTechnique: "LIFT",
    fistulaSeton: false,

    // Fissura
    fissureType: "cronica",
    fissureLocation: "posterior",
    fissureTechnique: ["esfincterotomia lateral"],

    // Pilonidal
    pilonidalTechnique: "ressecção ampla",

    // Comum
    recoveryRoomMinutes: 60,
    sameDayDischarge: true
  },

  preOp: {
    botoxUsed: true,
    botoxDoseUnits: 100,
    botoxLocation: "esfíncter interno",
    intestinalPrep: true,
    intestinalPrepType: "manitol"
  },

  anesthesia: {
    type: "raqui",
    pudendoBlock: true,
    pudendoTechnique: "ultrassom",
    pudendoAccess: "transperineal",
    pudendoAnesthetic: "ropivacaina",
    pudendoConcentration: "0.5%",
    pudendoVolumeML: 20,
    pudendoLaterality: "bilateral",
    pudendoAdjuvants: ["dexametasona"]
  },

  prescription: {
    ointments: [
      {
        name: "Diltiazem 2% + Lidocaína 2% + Vit E 5% + Metronidazol 10%",
        frequency: "3x/dia",
        durationDays: 30
      }
    ],
    medications: [
      {
        name: "Dipirona",
        dose: "1g",
        route: "VO",
        frequency: "6/6h",
        durationDays: 7,
        category: "Analgésico"
      },
      {
        name: "Lactulose",
        dose: "10mL",
        route: "VO",
        frequency: "12/12h",
        durationDays: 15,
        category: "Laxante"
      }
    ]
  }
}
```

## Segurança e Privacidade

### O que NÃO é salvo no template:
- Nome do paciente
- CPF
- Data de nascimento
- Telefone/Email
- Datas específicas (cirurgia, consultas)
- Nome do anestesista
- Descrição cirúrgica completa (texto livre)
- Complicações
- Comorbidades específicas do paciente

### O que É salvo no template:
- Tipo de anestesia e técnicas
- Configurações de bloqueio pudendo
- Técnicas cirúrgicas padrão
- Tipo de energia utilizada
- Protocolos de preparo
- Prescrição pós-operatória (medicamentos e pomadas)

## Migração do Banco de Dados

**IMPORTANTE:** Antes de usar o sistema, execute a migração:

```bash
cd C:\Users\joaov\sistema-pos-operatorio
npx prisma migrate dev --name add_surgery_templates
```

Ou se preferir gerar apenas o SQL:

```bash
npx prisma migrate dev --create-only --name add_surgery_templates
```

A migração criará a tabela `SurgeryTemplate` com todos os campos necessários.

## Fluxo de Trabalho Recomendado

### Setup Inicial (Uma vez)
1. Configure o banco de dados (migração)
2. Cadastre um paciente "teste" para cada tipo de cirurgia
3. Preencha completamente com suas configurações padrão
4. Salve como template padrão

### Uso Diário
1. Cadastro express do novo paciente
2. Ir para edição do paciente
3. Clicar em "Aplicar Template"
4. Template preenche tudo automaticamente
5. Ajustar campos específicos do paciente (se necessário)
6. Salvar

### Manutenção
- Atualize templates quando seus protocolos mudarem
- Crie variações de templates (ex: "Hemorroidectomia simples", "Hemorroidectomia complexa")
- Revise templates periodicamente

## Benefícios

1. **Economia de Tempo**
   - Cadastro completo em segundos
   - Não precisa preencher os mesmos dados repetidamente

2. **Consistência**
   - Todos os pacientes do mesmo tipo seguem o mesmo protocolo
   - Reduz erros de prescrição

3. **Rastreabilidade**
   - Histórico de quando templates foram criados/atualizados
   - Fácil visualizar protocolos atuais

4. **Flexibilidade**
   - Múltiplos templates por tipo de cirurgia
   - Templates específicos para situações especiais
   - Fácil alteração sem afetar pacientes anteriores

## Exemplo de Caso Real

**Cenário:** Dr. João tem sua configuração padrão para hemorroidectomia:

**Problema Anterior:**
- Preencher manualmente 50+ campos para cada paciente
- Risco de esquecer medicamentos da prescrição
- Inconsistência nos protocolos

**Solução com Templates:**
1. Criou template "Hemorroidectomia Padrão Dr. João"
2. Incluiu:
   - Raqui + bloqueio pudendo bilateral US
   - Ferguson modificada com Ligasure
   - Pomada especial (Diltiazem 2% + Lidocaína 2% + Vit E 5% + Metronidazol 10%)
   - Prescrição completa (Dipirona + Lactulose + Orientações)

**Resultado:**
- Cadastro completo em menos de 1 minuto
- 100% de consistência
- Prescrição nunca esquecida
- Fácil atualizar protocolo quando necessário

## Suporte e Melhorias Futuras

### Possíveis Expansões:
- Import/Export de templates
- Compartilhamento entre médicos
- Versionamento de templates
- Analytics de uso de templates
- Templates com IA (sugestões baseadas no histórico)

## Troubleshooting

### Template não aparece na lista
- Verifique se o tipo de cirurgia corresponde
- Confirme que o template foi salvo corretamente

### Erro ao aplicar template
- Verifique compatibilidade de tipos
- Confirme que o paciente tem cirurgia cadastrada

### Dados não são preenchidos
- Verifique se o template tem dados naquela seção
- Confirme que as seções do paciente foram criadas

## Contato

Para dúvidas ou sugestões sobre o sistema de templates, entre em contato com a equipe de desenvolvimento.
