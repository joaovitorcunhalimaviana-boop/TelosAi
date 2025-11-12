# Exemplo de Uso - Central de Termos de Consentimento

## Cenário 1: Paciente Novo com Cirurgia Agendada

### Situação
Paciente Maria Silva agendou hemorroidectomia para próxima semana.

### Passos:

1. **Acessar Central de Termos**
   - No Dashboard, clicar em "Central de Termos"
   - Ou acessar diretamente: `http://localhost:3000/termos`

2. **Pré-preencher Nome**
   ```
   Nome do Paciente: Maria Silva
   ```

3. **Imprimir Termos Necessários**
   - Clicar em "Imprimir" em "Hemorroidectomia"
   - Clicar em "Imprimir" em "Uso de Dados (LGPD)"
   - Clicar em "Imprimir" em "Acompanhamento WhatsApp"

4. **Revisar e Ajustar**
   - Em cada termo aberto, verificar:
     - Nome está correto
     - Adicionar CPF se disponível
     - Confirmar data
     - Confirmar cidade

5. **Imprimir em Lote**
   - Imprimir todos de uma vez
   - Ou salvar cada um como PDF

### Resultado
Três termos prontos para assinatura na consulta pré-operatória.

---

## Cenário 2: Consulta Presencial - Preenchimento Rápido

### Situação
Paciente João Santos está no consultório para consulta pré-operatória de fístula anal.

### Passos:

1. **Abrir Central de Termos**
   - Acessar `/termos` no navegador

2. **Deixar Nome em Branco**
   - Não preencher o campo de nome
   - Clicar em "Visualizar" em "Fístula Anal"

3. **Preencher com Paciente Presente**
   ```
   Nome do Paciente: João Santos
   CPF: 123.456.789-00
   Cidade: João Pessoa
   Data: 09/11/2025
   ```

4. **Revisar com Paciente**
   - Ler o termo junto com o paciente
   - Esclarecer dúvidas
   - Explicar riscos e benefícios

5. **Imprimir e Assinar**
   - Ctrl+P para imprimir
   - Paciente assina
   - Médico assina

### Resultado
Termo assinado e arquivado no prontuário.

---

## Cenário 3: Múltiplos Termos para Mesmo Paciente

### Situação
Paciente Ana Costa precisa assinar termo cirúrgico + LGPD + WhatsApp.

### Passos:

1. **Central de Termos**
   - Preencher nome: "Ana Costa"

2. **Abrir Todos em Abas Separadas**
   - Clicar em "Abrir em Nova Aba" para:
     - Doença Pilonidal
     - Uso de Dados (LGPD)
     - Acompanhamento WhatsApp

3. **Completar Dados em Cada Aba**
   - Aba 1 (Pilonidal): Adicionar CPF
   - Aba 2 (LGPD): Verificar data
   - Aba 3 (WhatsApp): Adicionar número de telefone no campo apropriado

4. **Imprimir Sequencialmente**
   - Imprimir aba por aba
   - Ou usar "Imprimir" em cada uma

### Resultado
Três termos com dados consistentes, prontos para assinatura.

---

## Cenário 4: Salvar em PDF para Prontuário Eletrônico

### Situação
Criar arquivo digital do termo para anexar ao prontuário eletrônico.

### Passos:

1. **Visualizar Termo**
   - Acessar termo desejado
   - Preencher todos os dados

2. **Imprimir como PDF**
   ```
   Windows: Ctrl+P
   Mac: Cmd+P
   ```

3. **Selecionar "Salvar como PDF"**
   - Na janela de impressão
   - Escolher destino: "Microsoft Print to PDF" ou "Salvar como PDF"

4. **Nomear Arquivo**
   ```
   Exemplo: Termo_Hemorroidectomia_MariaSilva_09112025.pdf
   ```

5. **Salvar em Local Apropriado**
   - Pasta do paciente
   - Sistema de prontuário eletrônico
   - Cloud storage

### Resultado
PDF profissional pronto para arquivamento digital.

---

## Cenário 5: Revisão de Termo Antes da Cirurgia

### Situação
Paciente liga com dúvidas sobre o termo assinado semana passada.

### Passos:

1. **Acessar Termo Original**
   - Ir para `/termos/hemorroidectomia`
   - Preencher nome do paciente

2. **Revisar Conteúdo**
   - Ler seções específicas
   - Localizar informação solicitada

3. **Explicar ao Telefone**
   - Usar termo como guia
   - Referenciar seções específicas
   - Esclarecer dúvidas

### Resultado
Paciente esclarecido, cirurgia mantida conforme planejado.

---

## Cenário 6: Atualização de Procedimento

### Situação
Durante cirurgia de fissura, foi necessário procedimento adicional.

### Passos:

1. **Gerar Novo Termo Pós-Operatório**
   - Acessar termo relevante
   - Preencher dados do paciente

2. **Adicionar Observações Manuscritas**
   - Imprimir termo
   - Adicionar nota: "Procedimento adicional realizado: [descrição]"
   - Data e assinatura

3. **Arquivar com Prontuário**
   - Anexar ao prontuário cirúrgico
   - Digitalizar se necessário

### Resultado
Documentação completa do procedimento realizado.

---

## Dicas de Uso

### Velocidade
- **Atalho de Teclado:** Ctrl+P imprime rapidamente
- **Múltiplas Abas:** Abra vários termos simultaneamente
- **Modelos Salvos:** Salve PDFs em branco para preenchimento manual

### Qualidade
- **Impressora:** Use modo "Alta Qualidade" para melhor resultado
- **Papel:** A4 branco, 75g ou superior
- **Preview:** Sempre visualize antes de imprimir

### Organização
- **Nomenclatura:** Use padrão consistente para PDFs
- **Pastas:** Organize por tipo de procedimento ou data
- **Backup:** Mantenha cópias digitais de todos os termos assinados

### Privacidade
- **Dados Sensíveis:** Não compartilhe termos por e-mail não criptografado
- **Descarte:** Use triturador para versões descartadas
- **Armazenamento:** Local seguro, acesso restrito

---

## Checklist Pré-Impressão

Antes de imprimir qualquer termo, verificar:

- [ ] Nome do paciente correto e completo
- [ ] CPF conferido (se aplicável)
- [ ] Data atual ou data correta da consulta
- [ ] Cidade correta
- [ ] Conteúdo do termo apropriado para o procedimento
- [ ] Layout formatado corretamente (preview)
- [ ] Impressora selecionada
- [ ] Papel A4 disponível

---

## Solução de Problemas Comuns

### Termo não imprime corretamente
- Verificar configuração de margem
- Selecionar "Ajustar à página"
- Usar modo retrato (não paisagem)

### Nome não aparece no termo
- Preencher campo antes de clicar em imprimir
- Aguardar página carregar completamente
- Verificar JavaScript habilitado

### Layout quebrado
- Atualizar navegador
- Limpar cache (Ctrl+Shift+Delete)
- Usar Chrome ou Firefox para melhor compatibilidade

### PDF muito grande
- Reduzir qualidade de impressão
- Usar modo "Econômico"
- Verificar se há imagens desnecessárias

---

## URLs Diretas para Cada Termo

Para acesso rápido, salve estes links:

```
Hemorroidectomia:
http://localhost:3000/termos/hemorroidectomia

Fístula Anal:
http://localhost:3000/termos/fistulaAnal

Fissura Anal:
http://localhost:3000/termos/fissuraAnal

Doença Pilonidal:
http://localhost:3000/termos/doencaPilonidal

LGPD:
http://localhost:3000/termos/lgpd

WhatsApp:
http://localhost:3000/termos/whatsapp
```

### Com Nome Pré-preenchido:

```
Exemplo:
http://localhost:3000/termos/hemorroidectomia?nome=Maria%20Silva

(Substituir "Maria Silva" pelo nome desejado)
```
