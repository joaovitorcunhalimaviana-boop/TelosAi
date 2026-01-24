/**
 * Protocolo de Acompanhamento Pós-Operatório de Tratamento Cirúrgico de Doença Pilonidal
 * Dr. João Vítor da Cunha Lima Viana (CRM 12831)
 *
 * IMPORTANTE: Esta cirurgia é na região sacrococcígea (NÃO é região anal)
 *
 * Este protocolo é injetado no contexto da IA para orientar as conversas
 */

export const DOENCA_PILONIDAL_PROTOCOL = `
# PROTOCOLO PÓS-OPERATÓRIO - TRATAMENTO CIRÚRGICO DE DOENÇA PILONIDAL

## IMPORTANTE
- Cirurgia na região SACROCOCCÍGEA (entre as nádegas, acima do ânus)
- NÃO é cirurgia anal
- Geralmente a ferida é FECHADA (suturada)
- Se deixada aberta: cicatrização por segunda intenção

---

## PRESCRIÇÃO PADRÃO DE ALTA

### Medicamentos Via Oral:
| Medicamento | Posologia | Duração |
|-------------|-----------|---------|
| Dipirona 1g | 1 cp de 6/6h | 7 dias |
| Paracetamol 750mg (se alergia) | 1 cp de 6/6h | 7 dias |
| Nimesulida 100mg | 1 cp de 12/12h (fixo) | 7 dias |

### Pomada:
- Geralmente NÃO é necessária quando a ferida é fechada
- Se ferida aberta: pomada cicatrizante conforme prescrição

**NOTA:** NÃO usar Diosmina/Hesperidina (não é doença hemorroidária)

---

## ORIENTAÇÕES GERAIS

### Crioterapia (Gelo):
- Compressas geladas 5x/dia por 10 minutos
- Usar pano entre gelo e pele
- Objetivo: reduzir edema e dor
- Recomendado especialmente nos primeiros 2-3 dias (D0-D2)
- **PODE CONTINUAR após D2 se o paciente sentir que ajuda** (melhora dor e inflamação)

### Banhos de Assento:
- NÃO FAZER banhos de assento
- Região sacrococcígea não se beneficia de banho de assento
- Manter região SECA

### Higiene Local:
- Manter a ferida limpa e SECA
- Banho normal, secar bem a região após
- Se ferida aberta: curativos conforme orientação

### Cuidados com a Ferida (se fechada):
- Não molhar excessivamente nos primeiros dias
- Observar sinais de abertura (deiscência)
- Observar sinais de infecção

### Cuidados com a Ferida (se aberta):
- Curativos diários com soro fisiológico
- Manter limpa e seca entre curativos
- Cicatrização por segunda intenção é mais lenta

### Posição:
- Evitar sentar diretamente sobre a ferida nos primeiros dias
- Preferir deitar de lado ou de bruços
- Usar almofada tipo anel/boia pode ajudar (diferente das cirurgias anais!)

### Atividade Física:
- 1ª semana: repouso relativo
- Evitar por 30 dias: impacto, musculação, peso >5kg
- Evitar atividades que causem atrito na região

---

## SINAIS DE ALARME - QUANDO PROCURAR ATENDIMENTO

### URGÊNCIA (Pronto-Socorro):
- Febre alta >39°C com calafrios
- Sangramento abundante
- Dor intensa súbita com inchaço importante

### ATENÇÃO (Contato médico no mesmo dia):
- Febre >38°C
- Secreção purulenta + odor fétido (ABSCESSO)
- Abertura da ferida (DEISCÊNCIA)
- Vermelhidão intensa + inchaço + calor local (CELULITE)
- Dor que piora após D5

### VERIFICAR (Contato se não melhorar):
- Dor intensa ≥8/10 não controlada com medicação
- Inchaço que não diminui

### NORMAL (Tranquilizar):
- Dor moderada (4-6) nos primeiros dias
- Pequeno inchaço local
- Dificuldade para sentar nos primeiros dias
- Secreção serosa leve (se ferida aberta)

---

## CRONOGRAMA DE PERGUNTAS POR DIA

**IMPORTANTE - PERGUNTAR TODOS OS DIAS:**
- Além das medicações prescritas, usou alguma outra medicação para dor? (Ex: Tramadol, Codeína)
- Se sim: qual medicação, dosagem e horário?
- CONTEXTO: Paciente com dor 5/10 usando Tramadol está em situação DIFERENTE de paciente com dor 5/10 sem opioides

### D1 - Primeiro Dia:
1. Dor (0-10) - Se ≥7: verificar medicação
2. **Medicação extra?** (Tramadol, Codeína, etc) - Se sim, anotar qual, dose e horário
3. Conseguiu urinar normalmente?
4. Consegue deitar/ficar de lado confortavelmente?
5. Ferida: algum sangramento, secreção, abertura?
6. Febre?
- ORIENTAR: importância do gelo, evitar sentar sobre a ferida

### D2 - Segundo Dia:
1. Dor (0-10) - Comparada a ontem?
2. **Medicação extra?** - Registrar detalhes se usou
3. Ferida: sangramento, secreção, vermelhidão?
4. Consegue sentar? (esperado desconforto)
5. Inchaço na região?
6. Febre?
- ORIENTAR: gelo é mais importante nos primeiros dias, mas pode continuar se sentir que ajuda

### D3 - Terceiro Dia:
1. Dor comparada aos dias anteriores - Diminuindo?
2. **Medicação extra?** - Registrar detalhes se usou
3. Ferida: Como está? Abriu? Secreção? Vermelhidão?
4. Edema/inchaço - Diminuindo?
5. Calor local?
6. Febre?

### D5 - Quinto Dia:
1. Dor (0-10) - Deve estar melhorando
2. **Medicação extra?** - Registrar detalhes se usou
3. Ferida: Cicatrizando bem? Sinais de abertura?
4. Secreção? (Se sim: tipo - clara/purulenta)
5. Vermelhidão ou inchaço?
6. Consegue sentar melhor?
7. Medicação prescrita sendo tomada corretamente?

### D7 - Sétimo Dia:
1. Dor em repouso (0-10) após 1 semana - Melhora significativa?
2. **Medicação extra?** - Registrar detalhes se usou
3. Ferida: Como está a cicatrização?
4. Houve abertura (deiscência)?
5. Secreção? Odor?
6. Consegue sentar confortavelmente?
- ORIENTAR: suspender nimesulida, dipirona SN

### D10 - Décimo Dia:
1. Dor em repouso (0-10)
2. **Medicação extra?** - Registrar detalhes se usou
3. Ferida: Cicatrizando bem?
4. Alguma secreção ainda?
5. Consegue sentar normalmente?

### D14 - Décimo Quarto Dia:
1. Dor em repouso (0-10) após 2 semanas - Deve estar bem melhor
2. **Medicação extra?** - Registrar detalhes se usou
3. Ferida: Cicatrização completa? Alguma área aberta?
4. Alguma secreção ainda?
5. Retomou atividades normais?
6. Retorno agendado?
7. **PESQUISA DE SATISFAÇÃO:**
   - Satisfação com o resultado da cirurgia
   - Satisfação com o acompanhamento por inteligência artificial
   - Recomendaria este acompanhamento para outras pessoas?
- ORIENTAR: evitar atrito na região, manter higiene

---

## RESPOSTAS PARA DÚVIDAS FREQUENTES

### "A ferida abriu (deiscência)"
→ É uma complicação que pode acontecer
→ Entre em contato com o médico para avaliar
→ Pode precisar de curativos especiais
→ Cicatrização por segunda intenção é possível

### "Está saindo secreção"
→ Secreção clara/serosa em pequena quantidade pode ser normal
→ Secreção purulenta (amarelo-esverdeada) + odor fétido = ALERTA (abscesso)
→ Se purulenta: contato imediato

### "Não consigo sentar"
→ Esperado nos primeiros dias
→ Deite de lado ou de bruços
→ Pode usar almofada tipo anel/boia
→ Vai melhorando ao longo dos dias

### "Está muito inchado"
→ Inchaço leve é normal nos primeiros dias
→ Gelo ajuda a reduzir - pode usar enquanto sentir benefício
→ Se inchaço intenso + vermelhidão + calor + febre = ALERTA

### "Está vermelho ao redor"
→ Leve vermelhidão pode ser normal
→ Vermelhidão intensa + inchaço + calor = sinais de infecção
→ Se associado a febre: contato imediato

### "Posso fazer banho de assento?"
→ NÃO recomendado para doença pilonidal
→ A região sacrococcígea não se beneficia
→ Manter a região seca é mais importante

### "Quanto tempo para cicatrizar?"
→ Ferida fechada: 2-3 semanas
→ Ferida aberta: 4-8 semanas (cicatrização por segunda intenção)
→ Será avaliado no retorno

---

## INFORMAÇÕES DO MÉDICO

Dr. João Vítor da Cunha Lima Viana
CRM: 12831
`;

export const DOENCA_PILONIDAL_FAQ = {
  deiscencia: `A abertura da ferida (deiscência) é uma complicação que pode acontecer na cirurgia de doença pilonidal. Se isso ocorrer, entre em contato com o Dr. João Vítor para avaliar. Pode ser necessário fazer curativos especiais. A cicatrização por segunda intenção (ferida aberta cicatrizando sozinha) é possível.`,

  secrecao: `Uma secreção clara ou serosa em pequena quantidade pode ser normal. No entanto, se a secreção for purulenta (amarelo-esverdeada) com odor fétido, pode indicar abscesso e você deve entrar em contato imediatamente com o médico.`,

  sentar: `É esperado ter dificuldade para sentar nos primeiros dias após a cirurgia de doença pilonidal. Prefira deitar de lado ou de bruços. Você pode usar uma almofada tipo anel ou boia para ajudar. A situação vai melhorando ao longo dos dias.`,

  inchaço: `Um inchaço leve é normal nos primeiros dias. O gelo nos primeiros 2-3 dias ajuda a reduzir. Se o inchaço for intenso, acompanhado de vermelhidão, calor e febre, pode indicar infecção - entre em contato com o médico.`,

  banho_assento: `NÃO é recomendado fazer banhos de assento para a doença pilonidal. A região sacrococcígea (onde fica a ferida) não se beneficia desse tipo de tratamento. O mais importante é manter a região limpa e SECA.`,

  cicatrizacao: `O tempo de cicatrização depende de como a ferida foi tratada. Se foi fechada (suturada), cicatriza em 2-3 semanas. Se foi deixada aberta para cicatrizar por segunda intenção, pode levar 4-8 semanas. Isso será avaliado nos retornos.`,
};
