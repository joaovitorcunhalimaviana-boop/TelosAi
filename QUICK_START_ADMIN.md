# Guia Rápido - Admin Dashboard

## Acesso Rápido

### URLs Principais

```
Dashboard Admin:        /admin
Gerenciar Médicos:      /admin/medicos
Gerenciar Pacientes:    /admin/pacientes
Billing (Médicos):      /dashboard/billing
```

### Credenciais Admin

```
Email: telos.ia@gmail.com
Role:  admin
```

---

## Fluxo de Uso

### Como Admin

1. **Login** com email admin
2. Acessar **Dashboard** (`/dashboard`)
3. Clicar em **"Admin Dashboard"** (botão azul)
4. Ver métricas principais:
   - Médicos cadastrados
   - Total de pacientes
   - MRR (Receita Mensal Recorrente)
   - WhatsApp conectados

5. **Gerenciar Médicos**:
   - Buscar por nome/email/WhatsApp
   - Filtrar por plano
   - Ver billing individual
   - Exportar CSV ou Excel

6. **Gerenciar Pacientes**:
   - Buscar por nome/telefone
   - Filtrar por tipo de cirurgia
   - Ver completude de dados
   - Exportar CSV ou Excel

### Como Médico

1. **Login** com email do médico
2. Acessar **Dashboard** (`/dashboard`)
3. Clicar em **"Meu Plano"**
4. Ver:
   - Total mensal a pagar
   - Pacientes inclusos vs cadastrados
   - Pacientes adicionais (se houver)
   - Detalhes do plano

---

## Exportação de Dados

### CSV
- Clique em **"CSV"**
- Arquivo baixa automaticamente
- Abre no Excel (UTF-8 com BOM)

### Excel
- Clique em **"Excel"**
- Arquivo .xlsx baixa
- Todas as formatações preservadas

---

## Cálculo de Billing

### Fórmula
```
Total = Preço Base + (Pacientes Adicionais × Preço por Adicional)
```

### Exemplo
```
Plano: Founding Member
Pacientes cadastrados: 5
Pacientes inclusos: 3
Pacientes adicionais: 2

Cálculo:
R$ 400 (base) + (2 × R$ 150) = R$ 700
```

---

## Comandos de Desenvolvimento

### Instalar Dependências
```bash
npm install
```

### Rodar em Desenvolvimento
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
```

### Iniciar Servidor de Produção
```bash
npm start
```

---

## Estrutura de Preços

### Founding Member
- **Base**: R$ 400/mês
- **Inclusos**: 3 pacientes
- **Adicional**: R$ 150/paciente
- **Preço vitalício**: Sim (garantido)

### Professional
- **Base**: R$ 500/mês
- **Inclusos**: 3 pacientes
- **Adicional**: R$ 180/paciente
- **Preço vitalício**: Não

---

## Troubleshooting

### Admin não consegue acessar `/admin`
- Verificar se role = "admin" no banco
- Verificar se está logado
- Limpar cache do navegador

### Billing está errado
- Verificar campo `currentPatients` no user
- Verificar campo `maxPatients` no user
- Cálculo: `Math.max(0, currentPatients - maxPatients)`

### Exportação não funciona
- Verificar se xlsx e csv-stringify estão instalados
- Verificar permissões de admin
- Ver console do navegador para erros

---

## APIs Disponíveis

### GET /api/admin/stats
Retorna estatísticas gerais

### GET /api/admin/medicos
Lista médicos com billing
- Query: `?search=nome&plan=founding`

### GET /api/admin/medicos/export
Exporta médicos
- Query: `?format=csv` ou `?format=excel`

### GET /api/admin/pacientes
Lista pacientes
- Query: `?search=nome&surgeryType=hemorroidectomia`

### GET /api/admin/pacientes/export
Exporta pacientes
- Query: `?format=csv` ou `?format=excel`

---

## Suporte

Para dúvidas técnicas:
- Consulte: `ADMIN_DASHBOARD_GUIDE.md` (guia completo)
- Consulte: `SPRINT_5_SUMMARY.md` (resumo da implementação)

Email: telos.ia@gmail.com

---

**Versão**: 1.0.0
**Data**: 2025-11-10
