/**
 * Termos de Uso da Plataforma VigIA
 * Juridicamente sólidos com cláusula de compartilhamento de dados anonimizados
 */

export const TERMS_OF_SERVICE = `
# TERMOS DE USO E POLÍTICA DE PRIVACIDADE
## Plataforma VigIA - Sistema de Acompanhamento Pós-Operatório

**Última atualização:** ${new Date().toLocaleDateString("pt-BR")}

---

## 1. ACEITAÇÃO DOS TERMOS

Ao criar uma conta e utilizar a plataforma VigIA ("Plataforma"), você ("Usuário" ou "Médico") declara ter lido, compreendido e concordado integralmente com estes Termos de Uso.

**A aceitação destes termos é CONDIÇÃO ESSENCIAL para o uso da Plataforma.**

---

## 2. DESCRIÇÃO DO SERVIÇO

A VigIA é uma plataforma de acompanhamento pós-operatório que oferece:

- Cadastro e gestão de pacientes cirúrgicos
- Envio automatizado de questionários via WhatsApp
- Análise inteligente de respostas com Inteligência Artificial
- Detecção de red flags e complicações pós-operatórias
- Predição de risco utilizando Machine Learning
- Dashboard analytics e exportação de dados para pesquisa

---

## 3. AUTORIZAÇÃO PARA USO DE DADOS ANONIMIZADOS ⚠️

### 3.1 Finalidade

Ao aceitar estes Termos, você **AUTORIZA EXPRESSAMENTE** o uso de dados **totalmente anonimizados** dos seus pacientes para as seguintes finalidades:

a) **Treinamento de modelos de Inteligência Artificial** para predição de complicações pós-operatórias
b) **Pesquisas científicas** na área de cirurgia colorretal e proctologia
c) **Melhoria contínua** dos algoritmos e funcionalidades da Plataforma
d) **Produção de insights agregados** e estatísticas populacionais
e) **Publicações científicas** com dados agregados e anonimizados

### 3.2 Método de Anonimização

Os dados são **irreversivelmente anonimizados** utilizando:

- **Hash criptográfico SHA-256** com salt secreto
- **Remoção de identificadores diretos**: CPF, RG, nome completo, telefone, endereço, email
- **Pseudonimização de IDs** únicos impossibilitando correlação reversa
- **Agregação estatística** impedindo individualização

### 3.3 Base Legal (LGPD)

Esta autorização está fundamentada na **Lei Geral de Proteção de Dados (LGPD)**:

- **Art. 7º, IV** - Tratamento para realização de estudos por órgão de pesquisa
- **Art. 11** - Tratamento de dados pessoais sensíveis (saúde) para pesquisa
- **Art. 12** - Dados anonimizados **NÃO são considerados dados pessoais**
- **Art. 13** - Realização de estudos garantindo anonimização

### 3.4 Garantias

Você tem a garantia de que:

✅ Os dados anonimizados **NÃO permitem identificação** do paciente
✅ Os dados **NUNCA serão compartilhados** com terceiros em formato identificável
✅ A anonimização é **irreversível** e tecnicamente inviável de reverter
✅ Apenas dados **clínicos e cirúrgicos** são utilizados (idade, sexo, comorbidades, tipo de cirurgia, outcomes)
✅ Dados sensíveis extras (raça, orientação sexual, religião) **NÃO são coletados**

### 3.5 Obrigatoriedade

**Esta autorização é IRREVOGÁVEL e CONDIÇÃO ESSENCIAL para uso da Plataforma.**

Caso não concorde com o uso de dados anonimizados para as finalidades acima, você **NÃO PODERÁ** utilizar a Plataforma.

---

## 4. RESPONSABILIDADES DO MÉDICO USUÁRIO

### 4.1 Relação Médico-Paciente

Você declara e garante que:

a) É médico devidamente inscrito no **Conselho Regional de Medicina (CRM)**
b) Possui relação médico-paciente legítima com os pacientes cadastrados
c) Obtém consentimento dos pacientes para uso da Plataforma quando aplicável
d) Utiliza a Plataforma como **ferramenta auxiliar** e não substituta do julgamento clínico

### 4.2 Recomendação de Termo de Consentimento

Embora dados anonimizados não exijam consentimento do paciente (LGPD Art. 12), **RECOMENDAMOS FORTEMENTE** que você:

- Informe seus pacientes sobre o uso da Plataforma
- Forneça o Termo de Consentimento disponibilizado pela Plataforma
- Mantenha registros de consentimentos para sua própria proteção profissional

**Nota:** A Plataforma disponibiliza modelo de Termo de Consentimento Livre e Esclarecido (TCLE) pronto para impressão.

### 4.3 Responsabilidade Clínica

Você reconhece que:

- A Plataforma fornece **sugestões baseadas em IA**, não diagnósticos definitivos
- A **decisão clínica final** é sempre sua
- Você é o **único responsável** pelo cuidado e tratamento dos seus pacientes
- A VigIA **NÃO se responsabiliza** por decisões clínicas tomadas com base nas informações da Plataforma

---

## 5. PRIVACIDADE E PROTEÇÃO DE DADOS

### 5.1 Dados Coletados

A Plataforma coleta e armazena:

**Do Médico:**
- Nome completo, CRM, estado, email, telefone/WhatsApp
- Dados de uso da Plataforma (logins, acessos)

**Do Paciente (armazenados de forma identificável apenas para você):**
- Dados cadastrais: nome, CPF, data de nascimento, telefone, email
- Dados clínicos: comorbidades, cirurgias, medicações, follow-ups
- Respostas a questionários pós-operatórios

### 5.2 Uso dos Dados Identificáveis

Dados identificáveis dos pacientes são:

✅ Armazenados de forma **segura e criptografada**
✅ Acessíveis **APENAS por você** (multi-tenant isolado)
✅ **NUNCA compartilhados** com terceiros
✅ Utilizados **exclusivamente** para funcionamento da Plataforma

### 5.3 Compartilhamento de Dados

**Dados identificáveis:** NUNCA são compartilhados
**Dados anonimizados:** Utilizados conforme cláusula 3 (autorização irrevogável)

### 5.4 Retenção de Dados

- Dados são retidos enquanto sua conta estiver ativa
- Ao cancelar sua conta, você pode solicitar exclusão completa dos dados
- Dados anonimizados já exportados para pesquisa **NÃO podem ser excluídos** (irreversibilidade)

---

## 6. INTEGRAÇÕES DE TERCEIROS

### 6.1 WhatsApp (Twilio/Meta)

A Plataforma integra-se com WhatsApp via Twilio para envio de mensagens. Ao usar esta funcionalidade:

- Você autoriza o envio de mensagens em seu nome
- Você é responsável por obter consentimento dos pacientes para contato via WhatsApp
- A VigIA não se responsabiliza por políticas de privacidade do WhatsApp/Meta

### 6.2 Inteligência Artificial (Anthropic Claude)

A Plataforma utiliza IA da Anthropic para análise de respostas. As respostas dos pacientes são:

- Enviadas de forma segura via API
- Processadas temporariamente para análise
- **NÃO armazenadas** pela Anthropic (conforme política deles)

---

## 7. PROPRIEDADE INTELECTUAL

### 7.1 Propriedade da Plataforma

Todo o código, design, algoritmos e funcionalidades da Plataforma são de **propriedade exclusiva da VigIA**.

### 7.2 Propriedade dos Dados Anonimizados

Os **dados agregados e anonimizados** gerados pela Plataforma são de **propriedade da VigIA** e podem ser utilizados para:

- Publicações científicas
- Apresentações em congressos
- Marketing da Plataforma
- Comercialização de insights (desde que anonimizados)

### 7.3 Seus Dados Identificáveis

Você mantém propriedade sobre seus dados identificáveis e pode exportá-los a qualquer momento.

---

## 8. PLANOS E PAGAMENTO

### 8.1 Planos Disponíveis

- **Founding Member**: Preço fixo vitalício
- **Professional**: Plano padrão com cobrança mensal

### 8.2 Cobrança

- Cobrança automática via cartão de crédito
- Preço base + custo por paciente adicional
- Valores podem ser reajustados com aviso prévio de 30 dias

### 8.3 Cancelamento

Você pode cancelar a qualquer momento. Ao cancelar:

- Acesso é suspenso ao fim do período pago
- Dados podem ser exportados antes do cancelamento
- Dados identificáveis podem ser excluídos mediante solicitação

---

## 9. LIMITAÇÃO DE RESPONSABILIDADE

### 9.1 Disponibilidade

A Plataforma é fornecida "no estado em que se encontra" (AS IS). Não garantimos:

- Disponibilidade ininterrupta (uptime 100%)
- Ausência total de bugs ou erros
- Compatibilidade com todos dispositivos/navegadores

### 9.2 Decisões Clínicas

A VigIA **NÃO se responsabiliza** por:

- Decisões clínicas tomadas com base nas informações da Plataforma
- Outcomes de pacientes
- Erros de interpretação das sugestões da IA
- Falhas na detecção de complicações

### 9.3 Limite de Indenização

Nossa responsabilidade máxima se limita ao valor pago nos últimos 12 meses.

---

## 10. LEGISLAÇÃO E FORO

### 10.1 Lei Aplicável

Estes Termos são regidos pelas leis do Brasil, incluindo:

- Lei Geral de Proteção de Dados (Lei 13.709/2018)
- Código de Defesa do Consumidor (Lei 8.078/1990)
- Marco Civil da Internet (Lei 12.965/2014)
- Código de Ética Médica (Resolução CFM 2.217/2018)

### 10.2 Foro

Fica eleito o foro da comarca de [SUA CIDADE] para dirimir quaisquer controvérsias.

---

## 11. DISPOSIÇÕES GERAIS

### 11.1 Alterações nos Termos

Reservamo-nos o direito de alterar estes Termos a qualquer momento. Alterações substanciais serão notificadas por email com 30 dias de antecedência.

### 11.2 Nulidade Parcial

Caso alguma cláusula seja considerada inválida, as demais permanecem em vigor.

### 11.3 Contato

Para dúvidas sobre estes Termos:

**Email:** suporte@vigia.ai
**Endereço:** [SEU ENDEREÇO]
**DPO (Encarregado de Dados):** [NOME E CONTATO]

---

## 12. DECLARAÇÃO FINAL

Ao clicar em "Aceito os Termos de Uso" você declara:

✅ Ter lido e compreendido integralmente estes Termos
✅ Concordar com TODAS as cláusulas, especialmente a **Cláusula 3** (uso de dados anonimizados)
✅ Reconhecer que o uso da Plataforma está condicionado a esta aceitação
✅ Estar ciente de suas responsabilidades como médico usuário

---

**Data de Aceitação:** [Será registrada automaticamente no sistema]
**IP de Aceitação:** [Será registrado automaticamente no sistema]
**Versão dos Termos:** 1.0

---

© ${new Date().getFullYear()} VigIA - Todos os direitos reservados.
`

export function generateTermsHTML(): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Termos de Uso - VigIA</title>
  <style>
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      line-height: 1.8;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #333;
      background: #fff;
    }
    h1 {
      color: #1e40af;
      font-size: 28px;
      margin-bottom: 10px;
      border-bottom: 3px solid #1e40af;
      padding-bottom: 10px;
    }
    h2 {
      color: #1e40af;
      font-size: 22px;
      margin-top: 40px;
      margin-bottom: 15px;
    }
    h3 {
      color: #2563eb;
      font-size: 18px;
      margin-top: 25px;
      margin-bottom: 10px;
    }
    p {
      text-align: justify;
      margin: 15px 0;
    }
    strong {
      color: #dc2626;
      font-weight: 700;
    }
    ul {
      margin: 15px 0;
      padding-left: 30px;
    }
    li {
      margin: 8px 0;
    }
    .highlight {
      background: #fef3c7;
      padding: 20px;
      border-left: 5px solid #f59e0b;
      margin: 20px 0;
    }
    .important {
      background: #fee2e2;
      padding: 20px;
      border-left: 5px solid #dc2626;
      margin: 20px 0;
      font-weight: 600;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    @media print {
      body { padding: 20px; }
      h2 { page-break-before: always; }
    }
  </style>
</head>
<body>
  ${TERMS_OF_SERVICE.split('\n').map(line => {
    if (line.startsWith('# ')) {
      return `<h1>${line.replace('# ', '')}</h1>`
    } else if (line.startsWith('## ')) {
      return `<h2>${line.replace('## ', '')}</h2>`
    } else if (line.startsWith('### ')) {
      return `<h3>${line.replace('### ', '')}</h3>`
    } else if (line.startsWith('**') && line.endsWith('**')) {
      return `<p class="important">${line.replace(/\*\*/g, '')}</p>`
    } else if (line.includes('⚠️')) {
      return `<div class="highlight">${line}</div>`
    } else if (line.startsWith('- ') || line.startsWith('a) ') || line.startsWith('✅')) {
      return `<li>${line.replace(/^[-a-z\)]\s*/, '').replace(/✅/g, '<span style="color: #059669;">✅</span>')}</li>`
    } else if (line.trim() === '---') {
      return '<hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;">'
    } else if (line.trim()) {
      return `<p>${line}</p>`
    }
    return ''
  }).join('\n')}

  <div class="footer">
    <p>© ${new Date().getFullYear()} VigIA - Sistema de Acompanhamento Pós-Operatório</p>
    <p>Este documento foi gerado eletronicamente e é válido sem assinatura física.</p>
  </div>
</body>
</html>
  `
}
