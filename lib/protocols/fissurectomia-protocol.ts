/**
 * Protocolo de Acompanhamento Pós-Operatório de Fissurectomia
 * Dr. João Vítor da Cunha Lima Viana (CRM 12831)
 *
 * Este protocolo é injetado no contexto da IA para orientar as conversas
 */

export const FISSURECTOMIA_PROTOCOL = `
# PROTOCOLO PÓS-OPERATÓRIO - FISSURECTOMIA

## PRESCRIÇÃO PADRÃO DE ALTA

### Medicamentos Via Oral:
| Medicamento | Posologia | Duração |
|-------------|-----------|---------|
| Muvinlax ou PEGLax | 1 sachê à noite | Até retorno |
| Dipirona 1g | 1 cp de 6/6h | 7 dias |
| Paracetamol 750mg (se alergia) | 1 cp de 6/6h | 7 dias |
| Nimesulida 100mg | 1 cp de 12/12h (fixo) | 7 dias |
| Ciclobenzaprina 5mg | 1 cp à noite | 7 dias |

### Pomada Manipulada:
- Diltiazem 2% + Lidocaína 2% + Vitamina E 5% + Metronidazol 10% + Sucralfato 10%
- Aplicar de 8/8h por 15 dias

---

## ORIENTAÇÕES GERAIS

### Higiene Local:
- PROIBIDO usar papel higiênico nas primeiras 4 semanas
- Higiene com água corrente (ducha/chuveirinho) após evacuação
- Sabonete líquido neutro ou glicerina permitido
- Secar com toques suaves
- Usar absorvente ou gaze para absorver secreções

### Crioterapia (D0 a D2):
- Compressas geladas 5x/dia por 10 minutos
- Usar pano entre gelo e pele
- Objetivo: reduzir edema, prevenir hematomas, analgesia

### Banhos de Assento (A partir de D3):
- Água morna (37-40°C) por 10-15 minutos
- 3 a 5x/dia, especialmente após evacuações
- Apenas água limpa, SEM produtos
- MUITO IMPORTANTE para relaxamento do esfíncter

### Alimentação:
RECOMENDADO:
- 2,5 a 3L de água/dia
- Dieta rica em fibras
- Mamão, ameixa, laranja com bagaço

EVITAR (por 30 dias):
- Banana prata, goiaba, maçã sem casca
- Pimenta, condimentos fortes, café em excesso, álcool

### Atividade Física:
- 1ª semana: repouso relativo
- Evitar por 30 dias: impacto, musculação, peso >5kg
- Vida sexual: evitar por 7 dias

### Secreção e Sangramento Esperados:
- NORMAL: secreção serossanguinolenta por até 3 semanas
- NORMAL: pequenas manchas de sangue, especialmente ao evacuar
- Cicatrização completa: 40-60 dias

---

## SINAIS DE ALARME - QUANDO PROCURAR ATENDIMENTO

### URGÊNCIA (Pronto-Socorro IMEDIATAMENTE):
- Sangramento abundante (jato, coágulos, enchendo vaso)
- Retenção urinária >8-12 horas

### ATENÇÃO (Contato médico no mesmo dia):
- Febre >38°C
- Secreção purulenta + odor fétido
- Dor que piora após D10
- Calafrios
- Espasmo anal severo e persistente

### VERIFICAR (Contato se não melhorar):
- Dor intensa ≥8/10 não controlada com medicação
- Constipação severa (>3 dias sem evacuar)

### NORMAL (Tranquilizar):
- Pequeno sangramento ao evacuar
- Dor ao evacuar (esperada nas primeiras semanas)
- Dor moderada em repouso (4-7)
- Secreção clara

---

## CRONOGRAMA DE PERGUNTAS POR DIA

**IMPORTANTE - PERGUNTAR TODOS OS DIAS:**
- Além das medicações prescritas, usou alguma outra medicação para dor? (Ex: Tramadol, Codeína)
- Se sim: qual medicação, dosagem e horário?
- CONTEXTO: Paciente com dor 5/10 usando Tramadol está em situação DIFERENTE de paciente com dor 5/10 sem opioides

### D1 - Primeiro Dia:
1. Dor em repouso (0-10) - Se ≥7: verificar medicação
2. **Medicação extra?** (Tramadol, Codeína, etc) - Se sim, anotar qual, dose e horário
3. Diurese - Urinou normalmente?
4. Evacuação - Normal não ter evacuado ainda
5. Sinais de alarme: sangramento, febre, espasmo intenso

### D2 - Segundo Dia:
1. Dor em repouso (0-10)
2. **Medicação extra?** - Registrar detalhes se usou
3. Evacuação - Se não desde cirurgia: reforçar laxante
4. Dor ao evacuar (0-10) - se evacuou
5. Sangramento - Manchas = normal, Em jato = ALERTA
- ORIENTAR: último dia de gelo, amanhã inicia banho de assento

### D3 - Terceiro Dia:
1. Dor em repouso comparada aos dias anteriores
2. **Medicação extra?** - Registrar detalhes se usou
3. Evacuação e dor ao evacuar (0-10)
4. Espasmo anal? (Leve/Moderado/Severo)
5. Sangramento comparado aos dias anteriores
- ORIENTAR: como fazer banho de assento - MUITO IMPORTANTE para fissura

### D5 - Quinto Dia:
1. Dor em repouso (0-10) - Está diminuindo?
2. **Medicação extra?** - Registrar detalhes se usou
3. Dor ao evacuar (0-10) - Principal indicador de melhora
4. Evacuação regular? Constipação?
5. Espasmo anal melhorando?
6. Medicação prescrita sendo tomada corretamente?

### D7 - Sétimo Dia:
1. Dor em repouso (0-10) após 1 semana
2. **Medicação extra?** - Registrar detalhes se usou
3. Dor ao evacuar (0-10) - Melhora significativa?
4. Evacuações regulares?
5. Sangramento - Pequenas manchas são esperadas
- ORIENTAR: suspender nimesulida e ciclobenzaprina, dipirona SN

### D10 - Décimo Dia:
1. Dor em repouso (0-10)
2. **Medicação extra?** - Registrar detalhes se usou
3. Dor ao evacuar (0-10)
4. Evacuações normais?
5. Espasmo anal ainda presente?
6. Sangramento?

### D14 - Décimo Quarto Dia:
1. Dor em repouso (0-10) após 2 semanas
2. **Medicação extra?** - Registrar detalhes se usou
3. Dor ao evacuar (0-10) - Deve estar bem melhor
4. Evacuações normais? Constipação resolvida?
5. Sangramento?
6. Retorno agendado?
7. **PESQUISA DE SATISFAÇÃO:**
   - Satisfação com o resultado da cirurgia
   - Satisfação com o acompanhamento por inteligência artificial
   - Recomendaria este acompanhamento para outras pessoas?
- ORIENTAR: continuar banhos de assento, cicatrização leva 40-60 dias

---

## RESPOSTAS PARA DÚVIDAS FREQUENTES

### "A dor ao evacuar é muito forte"
→ Esperado nas primeiras semanas - é o principal sintoma
→ Usar pomada ANTES de evacuar para lubrificar
→ Banho de assento APÓS evacuar para relaxar o esfíncter
→ Manter fezes macias (laxante + água + fibras)
→ Se ≥9/10 e impede evacuar: contato com médico

### "Tenho espasmo anal (sensação de câimbra)"
→ Comum na fissurectomia
→ Banhos de assento ajudam muito a relaxar
→ Ciclobenzaprina ajuda no espasmo
→ Se severo e persistente: contato com médico

### "Estou sangrando ao evacuar"
→ Manchas de sangue vivo ao evacuar = NORMAL
→ Jato, coágulos grandes = URGÊNCIA

### "Estou com constipação"
→ IMPORTANTE evitar - fezes duras pioram a dor
→ Aumentar laxante se necessário
→ 3L de água/dia
→ Fibras na alimentação
→ Se >3 dias sem evacuar: contato com médico

### "A dor dura muito tempo após evacuar"
→ Dor pode durar 1-2 horas após evacuar nos primeiros dias
→ Banho de assento logo após evacuação alivia
→ Se durar >2 horas constantemente: contato com médico

---

## INFORMAÇÕES DO MÉDICO

Dr. João Vítor da Cunha Lima Viana
CRM: 12831
`;

export const FISSURECTOMIA_FAQ = {
  dor_evacuar: `A dor ao evacuar é o principal sintoma após a fissurectomia e é esperada nas primeiras semanas. Use a pomada ANTES de evacuar para ajudar na lubrificação. Faça um banho de assento morno LOGO APÓS a evacuação para relaxar o esfíncter. Mantenha as fezes macias com o laxante e boa hidratação. Se a dor for insuportável (acima de 9/10) e impedir você de evacuar, entre em contato com o Dr. João Vítor.`,

  espasmo_anal: `O espasmo anal (sensação de câimbra ou aperto no ânus) é comum após a fissurectomia. Os banhos de assento com água morna ajudam muito a relaxar a musculatura. A ciclobenzaprina também ajuda no espasmo. Se o espasmo for severo e persistente, entre em contato com o médico.`,

  sangramento: `Pequenas quantidades de sangue vivo ao evacuar são normais após a fissurectomia. Se o sangramento for em pequenas manchas, está dentro do esperado. Se houver sangramento em jato ou coágulos grandes, procure atendimento médico imediatamente.`,

  constipacao: `A constipação deve ser evitada a todo custo na fissurectomia, pois fezes duras aumentam muito a dor. Continue tomando o laxante, beba pelo menos 3 litros de água por dia e mantenha alimentação rica em fibras. Se passar de 3 dias sem evacuar, entre em contato com o médico.`,

  duracao_dor: `Nos primeiros dias, a dor pode durar 1-2 horas após evacuar. Os banhos de assento logo após a evacuação ajudam a aliviar. Se a dor durar mais de 2 horas constantemente, entre em contato com o médico.`,
};
