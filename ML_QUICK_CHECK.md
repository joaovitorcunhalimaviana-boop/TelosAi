# Machine Learning - Verificação Rápida

✅ Use este checklist para verificar rapidamente se a integração está funcionando.

---

## 1. Banco de Dados

### Verificar Schema
```bash
cd C:\Users\joaov\sistema-pos-operatorio
npx prisma studio
```

1. Abra modelo **Surgery**
2. Verifique se existem estes campos:
   - [ ] `predictedRisk` (Float?)
   - [ ] `predictedRiskLevel` (String?)
   - [ ] `mlModelVersion` (String?)
   - [ ] `mlPredictedAt` (DateTime?)
   - [ ] `mlFeatures` (String?)

**Status:** Se todos marcados = ✅ OK

---

## 2. Arquivos Criados

Verifique se estes arquivos existem:

```bash
dir lib\ml-prediction.ts
dir components\ml\surgery-risk-display.tsx
dir ml\python-api-example.py
```

- [ ] `lib\ml-prediction.ts`
- [ ] `components\ml\surgery-risk-display.tsx`
- [ ] `ml\python-api-example.py`

**Status:** Se todos marcados = ✅ OK

---

## 3. Imports Corretos

### lib/ml-prediction.ts
```typescript
import { Patient, Surgery } from '@prisma/client'
```
- [ ] Nenhum erro de TypeScript

### app/cadastro/actions.ts
```typescript
import { predictComplicationRisk } from '@/lib/ml-prediction'
```
- [ ] Import presente
- [ ] Nenhum erro de TypeScript

### app/paciente/[id]/editar/page.tsx
```typescript
import { SurgeryRiskDisplay, SurgeryRiskNotAvailable } from "@/components/ml/surgery-risk-display"
```
- [ ] Import presente
- [ ] Nenhum erro de TypeScript

**Status:** Se todos marcados = ✅ OK

---

## 4. Teste Rápido - Cadastro SEM API ML

### Passo 1: Garantir que API ML está offline
```bash
# Não rode python-api-example.py
# API deve estar offline para este teste
```

### Passo 2: Cadastrar paciente
1. Acesse: http://localhost:3000/cadastro
2. Preencha formulário
3. Clique em "Cadastrar"

### Passo 3: Verificar resultado
- [ ] Mensagem: "Paciente cadastrado com sucesso"
- [ ] Nenhum erro na tela
- [ ] Redirecionamento para dashboard

### Passo 4: Verificar logs do servidor
Console do Next.js deve mostrar:
```
[ML] Iniciando predição de risco: { ... }
[ML] Erro ao predizer risco (não-bloqueante): { ... }
```

- [ ] Log de erro ML aparece
- [ ] Cadastro não é afetado

**Status:** Se todos marcados = ✅ OK (sistema é não-bloqueante!)

---

## 5. Teste Rápido - Visualização

### Passo 1: Acessar paciente
1. Dashboard → Clique no paciente recém-criado
2. Clique em "Editar Dados Completos"

### Passo 2: Verificar tela
- [ ] Tela carrega sem erros
- [ ] Card "Predição de risco não disponível" aparece
- [ ] Mensagem amigável explicando

**Status:** Se todos marcados = ✅ OK

---

## 6. Teste Completo - COM API ML (Opcional)

### Passo 1: Rodar API Python
```bash
cd ml
python python-api-example.py
```

- [ ] Servidor inicia sem erros
- [ ] Mensagem: "Uvicorn running on http://0.0.0.0:8000"

### Passo 2: Testar Health Check
```bash
curl http://localhost:8000/health
```

- [ ] Retorna: `{"status":"ok","version":"1.0.0",...}`

### Passo 3: Cadastrar paciente
1. Acesse: http://localhost:3000/cadastro
2. Preencha formulário
3. Clique em "Cadastrar"

### Passo 4: Verificar logs
Console do Next.js deve mostrar:
```
[ML] Iniciando predição de risco: { ... }
[ML] Predição concluída com sucesso: { risk: 0.XX, level: '...' }
[ML] Predição salva com sucesso: { ... }
```

- [ ] Logs de sucesso aparecem
- [ ] Nenhum erro

### Passo 5: Verificar visualização
1. Acesse página do paciente
2. Verificar card de predição

- [ ] Card "Predição de Risco de Complicações" aparece
- [ ] Badge com nível de risco (verde/amarelo/vermelho)
- [ ] Barra de progresso com %
- [ ] Lista de fatores de risco
- [ ] Metadata (versão modelo, timestamp)

**Status:** Se todos marcados = ✅ OK COMPLETO!

---

## 7. Variáveis de Ambiente

Arquivo `.env`:
```env
ML_API_URL=http://localhost:8000
ML_MODEL_VERSION=1.0.0
```

- [ ] Variáveis estão definidas
- [ ] URL está correta

**Status:** Se marcado = ✅ OK

---

## 8. TypeScript Compilation

```bash
npm run build
```

- [ ] Build completa sem erros
- [ ] Nenhum erro de tipo relacionado a ML

**Status:** Se marcado = ✅ OK

---

## Resumo Final

| Componente | Status | Obrigatório |
|------------|--------|-------------|
| Schema DB | ⬜ | ✅ Sim |
| Arquivos criados | ⬜ | ✅ Sim |
| Imports corretos | ⬜ | ✅ Sim |
| Cadastro sem ML | ⬜ | ✅ Sim |
| Visualização fallback | ⬜ | ✅ Sim |
| API Python | ⬜ | ⬜ Opcional |
| Cadastro com ML | ⬜ | ⬜ Opcional |
| Visualização completa | ⬜ | ⬜ Opcional |
| Variáveis de ambiente | ⬜ | ⬜ Opcional |
| Build TypeScript | ⬜ | ✅ Sim |

---

## Critérios de Sucesso

### Mínimo Funcional (Obrigatório)
- ✅ Schema DB atualizado
- ✅ Arquivos criados
- ✅ Imports corretos
- ✅ Cadastro funciona SEM API ML
- ✅ Visualização mostra fallback
- ✅ Build TypeScript sem erros

**Se todos ✅ = Sistema está funcionando corretamente!**

### Completo (Opcional)
- ✅ Todos acima +
- ✅ API Python rodando
- ✅ Cadastro funciona COM API ML
- ✅ Visualização mostra predição

**Se todos ✅ = Integração 100% completa!**

---

## Próximo Passo

### Se Mínimo Funcional = OK
Você pode:
1. Usar o sistema em produção (sem ML por enquanto)
2. Deploy da API Python quando quiser
3. Treinar modelo real com dados reais

### Se Completo = OK
Você pode:
1. Usar o sistema em produção completo
2. Coletar dados e validar acurácia
3. Implementar melhorias (dashboard, alertas)

---

**Checklist pronto para uso!**

Tempo estimado: 10-15 minutos
