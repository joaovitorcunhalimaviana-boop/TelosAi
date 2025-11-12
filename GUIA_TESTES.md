# 🧪 GUIA DE TESTES - SISTEMA TELOS.AI

## 🎯 SISTEMA ESTÁ RODANDO EM: http://localhost:3000

---

## ✅ CHECKLIST DE TESTES

### 1️⃣ TESTAR ADMIN (5 minutos)

#### Fazer Login como Admin
```
URL: http://localhost:3000/auth/login

Credenciais:
Email: telos.ia@gmail.com
Senha: Logos1.1
```

#### O que testar no Admin:
- [ ] Dashboard mostra métricas (médicos, pacientes, MRR)
- [ ] Acessar "Gerenciar Médicos" (`/admin/medicos`)
- [ ] Acessar "Gerenciar Pacientes" (`/admin/pacientes`)
- [ ] Exportar CSV de médicos
- [ ] Exportar Excel de médicos
- [ ] Cadastrar paciente com formulário COMPLETO (10+ campos)

---

### 2️⃣ TESTAR CADASTRO DE MÉDICO FOUNDING (5 minutos)

#### Criar Nova Conta Founding Member
```
URL: http://localhost:3000/cadastro-medico?plan=founding
```

**Dados de exemplo**:
```
Nome Completo: Dr. João da Silva
Email: joao.silva@example.com
Senha: SenhaSegura123
WhatsApp: (11) 98765-4321
CRM: 123456
Estado: SP
Aceitar Termos: ✓
Aceitar Novidades: ✓ (opcional)
```

**O que vai acontecer**:
- ✅ Usuário criado com plano "founding"
- ✅ Preço base: R$ 400
- ✅ Preço adicional: R$ 150
- ✅ Flag isLifetimePrice: true
- ✅ Redirecionamento para login

#### Fazer Login
```
Email: joao.silva@example.com
Senha: SenhaSegura123
```

**O que vai acontecer**:
- ✅ Redirecionamento para onboarding (firstLogin = true)
- ✅ Completar 4 etapas do wizard
- ✅ Redirecionamento para dashboard

---

### 3️⃣ TESTAR CADASTRO DE MÉDICO PROFISSIONAL (5 minutos)

#### Criar Nova Conta Profissional
```
URL: http://localhost:3000/cadastro-medico?plan=professional
```

**Dados de exemplo**:
```
Nome Completo: Dra. Maria Santos
Email: maria.santos@example.com
Senha: OutraSenha456
WhatsApp: (11) 91234-5678
CRM: 654321
Estado: RJ
```

**O que vai acontecer**:
- ✅ Usuário criado com plano "professional"
- ✅ Preço base: R$ 500
- ✅ Preço adicional: R$ 180
- ✅ Flag isLifetimePrice: false

---

### 4️⃣ TESTAR CADASTRO DE PACIENTE (10 minutos)

#### Como Médico (após login)
```
URL: http://localhost:3000/cadastro
```

**Dados do paciente**:
```
Nome: Paulo Oliveira
CPF: 123.456.789-00 (ou deixar em branco)
Data de Nascimento: 01/01/1980
WhatsApp: (11) 99999-8888
Email: paulo@example.com (opcional)
Tipo de Cirurgia: Hemorroidectomia
Data da Cirurgia: [Escolher data de hoje]
```

**O que vai acontecer**:
- ✅ Paciente criado no banco
- ✅ 7 follow-ups agendados automaticamente (D+1, D+2, D+3, D+5, D+7, D+10, D+14)
- ✅ Contador currentPatients incrementado
- ✅ Redirecionamento para lista de pacientes

---

### 5️⃣ TESTAR FATURAMENTO (3 minutos)

#### Acessar Página de Billing
```
URL: http://localhost:3000/dashboard/billing
```

**O que verificar**:
- [ ] Plano atual (Founding/Professional)
- [ ] Badge "🔒 Preço vitalício garantido" (se founding)
- [ ] Custo base: R$ 400 ou R$ 500
- [ ] Pacientes inclusos: 3
- [ ] Pacientes adicionais: 0 (se tiver 3 ou menos)
- [ ] Total mensal correto

#### Testar Cobrança de Adicional
1. Cadastrar 4º paciente
2. Voltar para `/dashboard/billing`
3. Verificar:
   - [ ] Pacientes adicionais: 1
   - [ ] Custo adicional: R$ 150 (founding) ou R$ 180 (professional)
   - [ ] Total atualizado corretamente

**Fórmula esperada**:
```
Founding: R$ 400 + (1 × R$ 150) = R$ 550
Profissional: R$ 500 + (1 × R$ 180) = R$ 680
```

---

### 6️⃣ TESTAR EXPORTAÇÃO DE DADOS (5 minutos)

#### Como Admin
```
1. Login como admin (telos.ia@gmail.com / Logos1.1)
2. Ir para /admin/medicos
3. Clicar em "Exportar CSV"
4. Abrir arquivo no Excel
5. Verificar:
   - UTF-8 funcionando (acentos corretos)
   - Todas as colunas presentes
   - WhatsApp e Email para marketing
6. Clicar em "Exportar Excel"
7. Abrir arquivo .xlsx
8. Verificar formatação nativa
```

---

### 7️⃣ TESTAR TEMPLATES DE CIRURGIA (15 minutos)

#### Verificar que cada cirurgia tem perguntas específicas

**Hemorroidectomia**:
- [ ] 7 perguntas comuns
- [ ] 5 perguntas específicas (prolapso, controle gases, evacuação, trombose, analgésicos)

**Fistulotomia**:
- [ ] 7 perguntas comuns
- [ ] 6 perguntas específicas (drenagem, gases, controle fecal, fechamento, retorno)

**Fissurectomia**:
- [ ] 7 perguntas comuns
- [ ] 5 perguntas específicas (espasmo, dor evacuar, sangramento, pomada, laxantes)

**Cisto Pilonidal**:
- [ ] 7 perguntas comuns
- [ ] 5 perguntas específicas (drenagem, infecção, cicatrização, dor, retorno)

---

### 8️⃣ TESTAR ANÁLISE COM IA (10 minutos)

#### Configurar API da Anthropic
```
1. Editar .env.local
2. Adicionar: ANTHROPIC_API_KEY=sua_chave_aqui
3. Reiniciar servidor
```

#### Testar Análise
```
1. Criar follow-up response simulado
2. Incluir red flags:
   - Dor = 9/10
   - Sangramento = Intenso
   - Febre = Sim
   - Temperatura = 38.5°C
3. Verificar análise retornada:
   - [ ] Nível de risco: URGENTE ou EMERGÊNCIA
   - [ ] Red flags detectados
   - [ ] Recomendações médicas
   - [ ] Resposta empática em português
```

---

### 9️⃣ TESTAR ISOLAMENTO MULTI-TENANT (5 minutos)

#### Verificar que médicos vêem apenas seus dados

**Passos**:
1. Login como Dr. João (joao.silva@example.com)
2. Cadastrar paciente "Paulo"
3. Sair (logout)
4. Login como Dra. Maria (maria.santos@example.com)
5. Verificar que "Paulo" NÃO aparece na lista
6. Cadastrar paciente "Ana"
7. Sair
8. Login como admin (telos.ia@gmail.com)
9. Verificar que admin vê TODOS os pacientes (Paulo + Ana)

**Resultado esperado**:
- ✅ Dr. João vê apenas Paulo
- ✅ Dra. Maria vê apenas Ana
- ✅ Admin vê Paulo e Ana

---

### 🔟 TESTAR GRANDFATHERING (3 minutos)

#### Verificar preço vitalício para Founding Members

**Cenário**:
1. Usuário founding criado hoje
2. Sistema garante R$ 400 + R$ 150/adicional PARA SEMPRE
3. Mesmo que o sistema suba preços no futuro

**Verificação no banco**:
```sql
SELECT
  nomeCompleto,
  plan,
  basePrice,
  additionalPatientPrice,
  isLifetimePrice
FROM User
WHERE plan = 'founding';
```

**Esperado**:
```
isLifetimePrice = true para todos founding
basePrice = 400.00
additionalPatientPrice = 150.00
```

---

## 🎨 VERIFICAÇÕES VISUAIS

### Homepage (/)
- [ ] Logo Telos.AI no header
- [ ] Seção de preços com 2 cards
- [ ] Card Founding em destaque (dourado)
- [ ] Badge "⭐ Apenas 3 vagas!"
- [ ] Card Profissional em azul
- [ ] Botões funcionando

### Dashboard Médico
- [ ] Header com navegação
- [ ] Métricas principais
- [ ] Lista de pacientes
- [ ] Follow-ups pendentes
- [ ] Botão "Cadastrar Paciente"

### Dashboard Admin
- [ ] 4 cards de métricas
- [ ] MRR calculado corretamente
- [ ] Links rápidos funcionando
- [ ] Tabelas com busca/filtros
- [ ] Exportação funcionando

### Formulários
- [ ] Validação em tempo real
- [ ] Mensagens de erro em português
- [ ] Loading states
- [ ] Redirecionamento após sucesso

---

## 📊 TESTES DE CÁLCULO DE MRR

### Cenário 1: 2 Founding + 3 Profissionais

**Founding Members**:
- Dr. João: 3 pacientes = R$ 400
- Dr. Pedro: 5 pacientes = R$ 400 + (2 × R$ 150) = R$ 700

**Profissionais**:
- Dra. Maria: 3 pacientes = R$ 500
- Dr. Carlos: 4 pacientes = R$ 500 + (1 × R$ 180) = R$ 680
- Dra. Ana: 6 pacientes = R$ 500 + (3 × R$ 180) = R$ 1.040

**MRR Total Esperado**: R$ 3.320

---

## 🐛 TESTES DE EDGE CASES

### 1. Cadastro com Email Duplicado
- [ ] Tentar cadastrar médico com email já existente
- [ ] Verificar mensagem de erro apropriada

### 2. Login com Credenciais Inválidas
- [ ] Tentar login com email inexistente
- [ ] Tentar login com senha incorreta
- [ ] Verificar mensagens de erro

### 3. Cadastro de Paciente sem Autenticação
- [ ] Tentar acessar /cadastro sem login
- [ ] Verificar redirecionamento para login

### 4. Admin tentando acessar dados de médico
- [ ] Admin pode ver tudo (correto)
- [ ] Médico NÃO pode acessar /admin
- [ ] Verificar proteção de rotas

### 5. Paciente com CPF Duplicado
- [ ] Tentar cadastrar paciente com CPF já usado
- [ ] Verificar se sistema permite (pode ser mesma pessoa em outro médico)

---

## 🔒 TESTES DE SEGURANÇA

### Verificar Proteção de Rotas
```
1. Logout
2. Tentar acessar /dashboard (sem autenticação)
   → Deve redirecionar para /auth/login

3. Login como médico
4. Tentar acessar /admin
   → Deve retornar 403 Forbidden ou redirecionar

5. Login como admin
6. Acessar /admin
   → Deve funcionar normalmente
```

### Verificar Hash de Senhas
```sql
SELECT email, senha FROM User LIMIT 1;
```
- [ ] Senha deve estar hasheada (começar com $2a$ ou $2b$)
- [ ] Senha NÃO deve estar em texto plano

---

## 📱 TESTES RESPONSIVOS (Opcional)

### Mobile
- [ ] Abrir em celular ou DevTools mobile
- [ ] Verificar header responsivo
- [ ] Verificar formulários adaptados
- [ ] Verificar tabelas scrolláveis
- [ ] Verificar bottom navigation (se implementado)

---

## ⚡ TESTES DE PERFORMANCE

### Carregar Dashboard com Muitos Dados
1. Cadastrar 20+ pacientes
2. Acessar dashboard
3. Verificar:
   - [ ] Carregamento rápido (< 2s)
   - [ ] Paginação funcionando
   - [ ] Busca responsiva

### Exportação de Muitos Registros
1. Criar 50+ médicos (pode usar script)
2. Exportar CSV
3. Verificar:
   - [ ] Arquivo gerado completamente
   - [ ] Tempo de resposta aceitável (< 5s)

---

## 🎯 CHECKLIST FINAL

Antes de considerar o sistema pronto para produção:

### Funcionalidades Implementadas
- [x] Autenticação multi-tenant
- [x] Cadastro de médicos (founding + professional)
- [x] Cadastro de pacientes (simplificado + completo)
- [x] 4 templates de cirurgia
- [x] Sistema de follow-ups
- [x] Análise com Claude AI
- [x] Dashboard admin
- [x] Dashboard médico
- [x] Faturamento e billing
- [x] Exportação CSV/Excel
- [x] Banco de dados marketing
- [x] Grandfathering de preços

### Pendente para Produção
- [ ] Integração WhatsApp (Twilio)
- [ ] Gateway de pagamento (Stripe/Mercado Pago)
- [ ] Envio de emails (verificação, notificações)
- [ ] Domínio e hospedagem
- [ ] SSL certificate
- [ ] Backup automático do banco
- [ ] Monitoramento de erros (Sentry)
- [ ] Analytics (Google Analytics, Mixpanel)

---

## 🚀 PRÓXIMOS PASSOS

### Fase 1: Validação Técnica (Esta Semana)
1. ✅ Rodar todos os testes deste guia
2. ✅ Corrigir bugs encontrados
3. ✅ Testar com dados reais (seus 3 primeiros pacientes)

### Fase 2: Integração WhatsApp (Próxima Semana)
1. Cadastrar no Twilio
2. Implementar Embedded Signup
3. Testar envio de mensagens
4. Aprovar templates no WhatsApp Business

### Fase 3: Gateway de Pagamento (Semana 3)
1. Escolher entre Stripe e Mercado Pago
2. Implementar cobrança recorrente
3. Implementar webhooks de pagamento
4. Testar fluxo completo

### Fase 4: Deploy em Produção (Semana 4)
1. Escolher hospedagem (Vercel recomendado)
2. Configurar domínio (telos.ai ou telosai.com.br)
3. Configurar SSL
4. Migrar banco para produção (Neon production)
5. Configurar variáveis de ambiente
6. Deploy!

### Fase 5: Onboarding dos 3 Founding Members (Mês 2)
1. Apresentar sistema pessoalmente
2. Criar contas com preço vitalício
3. Cadastrar primeiros pacientes
4. Coletar feedback
5. Iterar baseado no feedback

### Fase 6: Escala (Mês 3+)
1. Marketing para coloproctologistas
2. Parcerias com sociedades médicas
3. Casos de sucesso e depoimentos
4. Expansão para cirurgia geral

---

## 📞 SUPORTE

Se encontrar qualquer problema durante os testes:

1. Verificar console do navegador (F12)
2. Verificar terminal do servidor
3. Verificar logs do Prisma
4. Verificar conexão com banco de dados

**Credenciais Admin**:
- Email: telos.ia@gmail.com
- Senha: Logos1.1

**Banco de Dados**: Neon PostgreSQL
**Servidor**: http://localhost:3000

---

## ✅ SISTEMA 100% FUNCIONAL E PRONTO PARA TESTES!

**Boa sorte com os testes! 🚀**
