# Central de Termos de Consentimento

Sistema para geração, visualização e impressão de termos de consentimento livre e esclarecido.

## Funcionalidades

### 1. Central de Termos (`/termos`)
- Lista organizada de todos os tipos de termos disponíveis
- Campos para pré-preenchimento do nome do paciente
- Botões para visualizar, imprimir e baixar cada termo
- Categorização por tipo: Cirúrgicos e Consentimentos

### 2. Visualização de Termo (`/termos/[tipo]`)
- Layout A4 otimizado para impressão
- Campos editáveis antes da impressão:
  - Nome do paciente
  - CPF
  - Cidade
  - Data
- Formato profissional com cabeçalho e assinaturas
- CSS específico para impressão (@media print)

## Tipos de Termos Disponíveis

### Termos Cirúrgicos

1. **Hemorroidectomia** (`/termos/hemorroidectomia`)
   - Informações sobre o procedimento
   - Riscos e complicações
   - Cuidados pós-operatórios
   - Alternativas de tratamento

2. **Fístula Anal** (`/termos/fistulaAnal`)
   - Descrição do tratamento cirúrgico
   - Técnicas possíveis (fistulotomia, seton, LIFT)
   - Riscos específicos incluindo incontinência
   - Expectativas de tratamento

3. **Fissura Anal** (`/termos/fissuraAnal`)
   - Esfincterotomia lateral interna
   - Riscos de incontinência
   - Processo de cicatrização
   - Indicações cirúrgicas

4. **Doença Pilonidal** (`/termos/doencaPilonidal`)
   - Tratamento de cisto pilonidal
   - Técnicas de fechamento
   - Cuidados com curativos
   - Prevenção de recidiva

### Termos de Consentimento

5. **LGPD - Uso de Dados** (`/termos/lgpd`)
   - Autorização para uso em pesquisa científica
   - Garantias de privacidade e anonimato
   - Direitos do titular dos dados
   - Conformidade com LGPD (Lei 13.709/2018)

6. **Acompanhamento WhatsApp** (`/termos/whatsapp`)
   - Autorização para acompanhamento via mensagem
   - Limites do atendimento digital
   - Privacidade e segurança
   - Horários de atendimento

## Como Usar

### Na Central de Termos:

1. **Pré-preenchimento (Opcional)**
   - Digite o nome do paciente no campo superior
   - O nome será automaticamente inserido no termo

2. **Visualizar**
   - Abre o termo em nova aba para revisão
   - Permite edição de todos os campos antes de imprimir

3. **Imprimir**
   - Abre diretamente a janela de impressão
   - Layout A4 otimizado

4. **Abrir em Nova Aba**
   - Mantém a central aberta
   - Útil para imprimir múltiplos termos

### Na Página do Termo:

1. **Preencher Dados**
   - Nome do paciente (obrigatório)
   - CPF (opcional)
   - Cidade (padrão: João Pessoa)
   - Data (padrão: data atual)

2. **Revisar Conteúdo**
   - Ler o termo completo
   - Verificar informações

3. **Imprimir**
   - Clicar no botão "Imprimir"
   - Ou usar Ctrl+P (Windows) / Cmd+P (Mac)

4. **Salvar PDF**
   - Na janela de impressão, selecionar "Salvar como PDF"
   - Útil para arquivamento digital

## Estrutura de Arquivos

```
app/
  termos/
    page.tsx              # Central de termos (lista)
    [tipo]/
      page.tsx            # Visualização/impressão do termo

lib/
  termo-templates.ts      # Templates de todos os termos
```

## Recursos Técnicos

### Layout A4
- Dimensões: 210mm x 297mm
- Margens: 20mm (tela) / 15mm (impressão)
- Fonte otimizada para leitura

### CSS de Impressão
- Remove elementos de interface (botões, campos de edição)
- Ajusta tamanhos de fonte
- Evita quebra de página em seções importantes
- Formatação profissional

### Responsividade
- Interface adaptável para diferentes telas
- Grid responsivo na lista de termos
- Visualização mobile-friendly

## Personalização

### Adicionar Novo Termo

1. Editar `lib/termo-templates.ts`
2. Adicionar template ao objeto `termoTemplates`
3. Adicionar ao array em `getTiposList()`
4. Criar rota em `app/termos/[tipo]/page.tsx` (automático)

Exemplo:
```typescript
novoTermo: {
  titulo: "TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO",
  subtitulo: "Nome do Procedimento",
  conteudo: (data: TermoData) => `
    <p>Eu, <strong>${data.pacienteNome}</strong>...</p>
    ...
  `
}
```

### Modificar Template Existente

Editar o conteúdo em `lib/termo-templates.ts` mantendo:
- Variáveis: `${data.pacienteNome}`, `${data.pacienteCPF}`, etc.
- Tags HTML: `<h3>`, `<p>`, `<ul>`, `<li>`
- Estrutura clara e legível

## Dados do Médico

Informações pré-configuradas:
- **Nome:** Dr. João Vitor Viana
- **CRM:** CRM-PB 12831
- **Especialidade:** Cirurgião Colorretal

Para alterar, editar os templates em `termo-templates.ts` e o cabeçalho em `[tipo]/page.tsx`.

## Aspectos Legais

### Consentimento Informado
Todos os termos seguem as diretrizes para consentimento informado:
- Descrição clara do procedimento
- Lista de riscos e complicações
- Alternativas de tratamento
- Caráter voluntário da autorização

### LGPD
O termo de uso de dados está em conformidade com:
- Lei 13.709/2018 (LGPD)
- Direitos do titular
- Anonimização em pesquisas
- Possibilidade de revogação

## Suporte

Para dúvidas ou problemas:
1. Verificar se o navegador está atualizado
2. Testar em modo de impressão (Ctrl+P)
3. Conferir se JavaScript está habilitado
4. Limpar cache do navegador

## Próximas Melhorias

Funcionalidades planejadas:
- [ ] Assinatura digital
- [ ] Integração com prontuário do paciente
- [ ] Histórico de termos assinados
- [ ] Envio por e-mail
- [ ] QR Code para validação
- [ ] Múltiplos idiomas
