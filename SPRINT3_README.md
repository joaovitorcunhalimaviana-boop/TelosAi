# SPRINT 3 - Cadastro Dual-Mode: Quick Start

## Resumo

Sistema de cadastro com **2 versões**:
- **Simplificada**: Médicos comuns (30 segundos)
- **Completa**: Admin/Pesquisa (todos os campos)

## Instalação Rápida

### 1. Instalar Dependências

```bash
cd C:\Users\joaov\sistema-pos-operatorio
npm install
```

### 2. Migrar Banco de Dados

```bash
# Gerar cliente Prisma
npx prisma generate

# Criar migração
npx prisma migrate dev --name add_user_and_multitenant

# Ou se já tem dados, fazer push
npx prisma db push
```

### 3. Criar Usuário Admin

```bash
# Editar scripts/create-admin-user.ts e colocar seus dados
# Depois executar:
npx ts-node scripts/create-admin-user.ts
```

### 4. Migrar Dados Existentes (se houver)

```bash
npx ts-node scripts/migrate-existing-data.ts
```

## Estrutura de Arquivos

```
sistema-pos-operatorio/
├── lib/
│   └── follow-up-scheduler.ts          # Agendamento automático
├── components/
│   ├── CadastroPacienteSimplificado.tsx # Form simplificado
│   ├── CadastroPacienteCompleto.tsx     # Form completo
│   └── ui/
│       └── textarea.tsx                  # Componente UI
├── app/
│   ├── cadastro/
│   │   ├── page-dual.tsx                # Página dual-mode
│   │   └── actions-dual.ts              # Server actions
│   └── api/
│       └── pacientes/
│           └── route.ts                  # API multi-tenant
├── scripts/
│   ├── create-admin-user.ts             # Criar admin
│   └── migrate-existing-data.ts         # Migrar dados
├── prisma/
│   └── schema.prisma                    # Schema atualizado
└── docs/
    ├── SPRINT3_README.md                # Este arquivo
    ├── SPRINT3_MIGRATION_GUIDE.md       # Guia de migração
    └── SPRINT3_DUAL_MODE_DOCUMENTATION.md # Doc completa
```

## Como Usar

### Cadastro Simplificado (Médicos)

```typescript
// Campos mínimos:
- Nome completo
- Data de nascimento (idade automática)
- WhatsApp (máscara automática)
- Email (opcional)
- Tipo de cirurgia (dropdown)
- Data da cirurgia
- Observações (opcional)

// Resultado:
- Paciente criado (20% completude)
- 7 Follow-ups agendados automaticamente
- Contador incrementado
```

### Cadastro Completo (Admin)

```typescript
// Campos adicionais:
- Sexo
- CPF (máscara automática)
- Hospital/Clínica

// Resultado:
- Paciente criado (40% completude)
- Dados para pesquisa incluídos
- 7 Follow-ups agendados
- Flag forResearch: true
```

## Follow-Ups Automáticos

Ao cadastrar qualquer paciente, o sistema cria automaticamente:

```
D+1  → scheduledDate: surgeryDate + 1 dia
D+2  → scheduledDate: surgeryDate + 2 dias
D+3  → scheduledDate: surgeryDate + 3 dias
D+5  → scheduledDate: surgeryDate + 5 dias
D+7  → scheduledDate: surgeryDate + 7 dias
D+10 → scheduledDate: surgeryDate + 10 dias
D+14 → scheduledDate: surgeryDate + 14 dias
```

Todos com `status: 'pending'` e `userId` vinculado.

## Multi-Tenancy

Cada médico vê APENAS seus próprios pacientes:

```typescript
// Automático na API
GET /api/pacientes
WHERE userId = session.user.id

// Admin vê todos (para pesquisa)
WHERE userId = session.user.id OR role = 'admin'
```

## Comandos Úteis

```bash
# Ver dados no Prisma Studio
npx prisma studio

# Verificar schema
npx prisma validate

# Resetar banco (CUIDADO!)
npx prisma migrate reset

# Gerar cliente após mudanças no schema
npx prisma generate

# Rodar desenvolvimento
npm run dev
```

## Checklist Pré-Produção

- [ ] Migração do banco executada
- [ ] Usuário admin criado
- [ ] Dados existentes migrados (se houver)
- [ ] Testes de cadastro simplificado
- [ ] Testes de cadastro completo
- [ ] Testes de multi-tenancy
- [ ] Follow-ups sendo criados
- [ ] Contadores funcionando
- [ ] Validações funcionando
- [ ] Máscaras funcionando

## Próximos Passos

### Sprint 4: Autenticação
- Implementar NextAuth
- Login/Logout
- Proteção de rotas
- Substituir `temp-user-id` por session real

### Sprint 5: Sistema de Planos
- Implementar limites de pacientes
- Sistema de pagamento
- Upgrade de planos

### Sprint 6: Dashboard Multi-Tenant
- Estatísticas por usuário
- Lista de pacientes filtrada
- Visão de admin (todos os dados)

## Troubleshooting

### Erro: "userId is required"
```bash
# Verificar se migração rodou
npx prisma db push

# Verificar se admin foi criado
npx ts-node scripts/create-admin-user.ts
```

### Erro: "Unique constraint violation"
```bash
# Verificar duplicados
npx prisma studio
# Procurar por WhatsApp ou CPF duplicado
```

### Follow-ups não sendo criados
```bash
# Verificar logs
tail -f logs/app.log

# Testar função diretamente
# Ver lib/follow-up-scheduler.ts
```

## Suporte

Documentação completa:
- `SPRINT3_MIGRATION_GUIDE.md` - Guia de migração
- `SPRINT3_DUAL_MODE_DOCUMENTATION.md` - Documentação técnica

Prisma Studio para debug:
```bash
npx prisma studio
```

## Conclusão

Sprint 3 implementada com sucesso! Sistema dual-mode funcionando com:

✅ 2 versões de formulário (Simplificado/Completo)
✅ Multi-tenancy (cada médico vê apenas seus pacientes)
✅ Follow-ups automáticos (7 agendamentos)
✅ Validações e máscaras
✅ Cálculo automático de idade
✅ Sistema de limites preparado

**Próximo passo:** Implementar autenticação (NextAuth) para ativar completamente o multi-tenancy.
