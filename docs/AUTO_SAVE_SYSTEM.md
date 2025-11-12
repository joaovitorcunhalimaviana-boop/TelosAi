# Sistema de Auto-Save - Documentação Completa

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquivos Criados](#arquivos-criados)
3. [Hook useAutoSave](#hook-useautosave)
4. [Componentes de Indicador](#componentes-de-indicador)
5. [Exemplos de Uso](#exemplos-de-uso)
6. [Recursos Implementados](#recursos-implementados)
7. [Tratamento de Erros](#tratamento-de-erros)
8. [Melhores Práticas](#melhores-práticas)
9. [Testes](#testes)

---

## 🎯 Visão Geral

O Sistema de Auto-Save previne perda de dados em formulários e wizards, salvando automaticamente o progresso do usuário no localStorage do navegador.

### Principais Características

- ✅ **Auto-save debounced**: Salva automaticamente após 2 segundos de inatividade
- ✅ **Save on blur**: Salva ao sair de cada campo
- ✅ **Save on step change**: Salva ao navegar entre etapas de um wizard
- ✅ **Recuperação automática**: Restaura dados ao recarregar a página
- ✅ **Feedback visual**: Indicadores de status em tempo real
- ✅ **Limpeza inteligente**: Remove dados após submissão bem-sucedida
- ✅ **Versionamento**: Suporta mudanças no schema dos dados
- ✅ **Tratamento de erros**: Gerencia quota excedida e outros erros

---

## 📁 Arquivos Criados

```
hooks/
  └── useAutoSave.ts              # Hook principal de auto-save

components/
  ├── AutoSaveIndicator.tsx       # Componentes de indicador visual
  ├── QuickPatientFormWithAutoSave.tsx     # Form rápido com auto-save
  └── MultiStepWizardWithAutoSave.tsx      # Wizard multi-step com auto-save

app/
  └── demo-autosave/
      └── page.tsx                # Página de demonstração

docs/
  └── AUTO_SAVE_SYSTEM.md         # Esta documentação
```

---

## 🎣 Hook useAutoSave

### Interface

```typescript
interface AutoSaveOptions {
  key: string                      // Chave única do localStorage
  debounceMs?: number             // Delay do debounce (padrão: 2000ms)
  onSave?: (data: any) => void    // Callback após salvar
  onRecover?: (data: any) => void // Callback ao recuperar dados
}

interface AutoSaveReturn {
  isSaving: boolean               // Estado de salvamento
  lastSaved: Date | null          // Data do último save
  saveNow: () => void            // Salvar imediatamente
  clearSaved: () => void         // Limpar dados salvos
  getSavedData: () => any        // Obter dados salvos
}

function useAutoSave(
  data: any,
  options: AutoSaveOptions
): AutoSaveReturn
```

### Exemplo Básico

```tsx
import { useAutoSave } from "@/hooks/useAutoSave"

function MyForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  const { isSaving, lastSaved, saveNow, clearSaved } = useAutoSave(formData, {
    key: 'my-form',
    debounceMs: 2000,
    onRecover: (data) => setFormData(data),
  })

  // ... rest of component
}
```

### Parâmetros Detalhados

#### `key` (obrigatório)
Identificador único para o localStorage. Use nomes descritivos:
- ✅ Bom: `'patient-registration-wizard'`
- ✅ Bom: `'surgery-form-step-2'`
- ❌ Ruim: `'form'`
- ❌ Ruim: `'data'`

#### `debounceMs` (opcional)
Tempo de espera antes de salvar (em milissegundos).
- **Padrão**: 2000ms (2 segundos)
- **Recomendado**: 1500-3000ms
- **Formulários simples**: 2000ms
- **Wizards complexos**: 1500ms

#### `onSave` (opcional)
Callback executado após cada salvamento bem-sucedido.

```tsx
onSave: (data) => {
  console.log('Dados salvos:', data)
  // Pode fazer tracking, analytics, etc.
}
```

#### `onRecover` (opcional)
Callback executado ao recuperar dados salvos (no mount).

```tsx
onRecover: (data) => {
  setFormData(data)
  // Pode mostrar modal confirmando recuperação
}
```

---

## 🎨 Componentes de Indicador

### AutoSaveIndicator

Indicador básico e flexível.

```tsx
import { AutoSaveIndicator } from "@/components/AutoSaveIndicator"

<AutoSaveIndicator
  isSaving={isSaving}
  lastSaved={lastSaved}
  className="my-custom-class"
/>
```

**Estados visuais:**
- 🔄 **Salvando**: Spinner azul + "Salvando..."
- ✅ **Salvo**: Check verde + "Salvo há X segundos"
- ⚪ **Nunca salvo**: Não renderiza nada

### InlineAutoSaveIndicator

Para uso em headers de cards/forms.

```tsx
import { InlineAutoSaveIndicator } from "@/components/AutoSaveIndicator"

<CardHeader>
  <div className="flex items-center justify-between">
    <CardTitle>Meu Formulário</CardTitle>
    <InlineAutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
  </div>
</CardHeader>
```

### FloatingAutoSaveIndicator

Indicador flutuante no canto superior direito.

```tsx
import { FloatingAutoSaveIndicator } from "@/components/AutoSaveIndicator"

<FloatingAutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
```

---

## 💡 Exemplos de Uso

### 1. Formulário Simples

```tsx
"use client"

import { useState } from "react"
import { useAutoSave } from "@/hooks/useAutoSave"
import { InlineAutoSaveIndicator } from "@/components/AutoSaveIndicator"

export function SimpleForm() {
  const [formData, setFormData] = useState({ name: "", email: "" })

  const { isSaving, lastSaved, saveNow, clearSaved } = useAutoSave(formData, {
    key: 'simple-form',
    onRecover: (data) => setFormData(data),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Submit form...
    await submitToAPI(formData)
    clearSaved() // Limpar após sucesso
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between mb-4">
        <h2>Formulário</h2>
        <InlineAutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
      </div>

      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        onBlur={saveNow} // Save on blur
      />

      <button type="submit">Enviar</button>
    </form>
  )
}
```

### 2. Wizard Multi-Step

```tsx
"use client"

import { useState } from "react"
import { useAutoSave } from "@/hooks/useAutoSave"

export function MultiStepWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({ /* ... */ })

  // Incluir currentStep nos dados salvos
  const { isSaving, lastSaved, saveNow, clearSaved } = useAutoSave(
    { ...formData, currentStep },
    {
      key: 'wizard',
      onRecover: (data) => {
        const { currentStep: savedStep, ...savedFormData } = data
        setFormData(savedFormData)
        setCurrentStep(savedStep || 1)
      },
    }
  )

  const nextStep = () => {
    saveNow() // Salvar antes de mudar de step
    setCurrentStep(prev => prev + 1)
  }

  const prevStep = () => {
    saveNow() // Salvar antes de mudar de step
    setCurrentStep(prev => prev - 1)
  }

  // ... rest of wizard
}
```

### 3. Formulário com Validação Complexa

```tsx
"use client"

import { useState } from "react"
import { useAutoSave } from "@/hooks/useAutoSave"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
})

export function ValidatedForm() {
  const [formData, setFormData] = useState({ name: "", email: "" })
  const [errors, setErrors] = useState({})

  const { isSaving, lastSaved, clearSaved } = useAutoSave(formData, {
    key: 'validated-form',
    onSave: (data) => {
      // Validar antes de salvar (opcional)
      const result = schema.safeParse(data)
      if (result.success) {
        console.log('Dados válidos salvos')
      }
    },
    onRecover: (data) => {
      setFormData(data)
      // Mostrar aviso de recuperação
      toast({
        title: "Dados recuperados",
        description: "Seus dados foram restaurados.",
      })
    },
  })

  // ... rest of component
}
```

---

## ⚙️ Recursos Implementados

### 1. Debounced Auto-Save

O hook usa debounce para evitar salvar a cada tecla pressionada.

```typescript
// Salva apenas após 2 segundos de inatividade
useAutoSave(formData, {
  key: 'my-form',
  debounceMs: 2000
})
```

### 2. Save on Blur

Salve imediatamente ao sair de um campo:

```tsx
<input
  value={formData.name}
  onChange={handleChange}
  onBlur={saveNow} // Salvar ao sair do campo
/>
```

### 3. Save on Step Change

Para wizards, salve ao mudar de etapa:

```tsx
const nextStep = () => {
  saveNow() // Garantir save antes de mudar
  setCurrentStep(prev => prev + 1)
}
```

### 4. Recuperação Automática

Ao montar o componente, dados salvos são automaticamente recuperados:

```tsx
useAutoSave(formData, {
  key: 'my-form',
  onRecover: (savedData) => {
    setFormData(savedData)
    // Toast de sucesso é mostrado automaticamente
  },
})
```

### 5. Versionamento

Dados salvos incluem versão para compatibilidade:

```json
{
  "version": "1.0.0",
  "timestamp": "2025-11-11T10:30:45.123Z",
  "data": { /* dados do formulário */ }
}
```

Se a versão mudar, você pode:
- Migrar dados automaticamente
- Descartar dados incompatíveis
- Mostrar aviso ao usuário

### 6. Limpeza após Submissão

```tsx
const handleSubmit = async (e) => {
  e.preventDefault()

  try {
    await submitToAPI(formData)
    clearSaved() // Limpar dados salvos após sucesso
  } catch (error) {
    // Manter dados salvos se houver erro
    console.error(error)
  }
}
```

---

## 🛡️ Tratamento de Erros

### 1. QuotaExceededError

Quando o localStorage está cheio:

```tsx
// O hook automaticamente mostra um toast:
toast({
  title: "Erro ao salvar",
  description: "Espaço de armazenamento insuficiente. Limpe o cache do navegador.",
  variant: "destructive",
})
```

### 2. Incompatibilidade de Versão

```tsx
// Se a versão salva for diferente da atual
if (parsed.version !== AUTOSAVE_VERSION) {
  console.warn(`Versão incompatível. Esperada ${AUTOSAVE_VERSION}, recebida ${parsed.version}`)
  // Opcionalmente descartar dados antigos
}
```

### 3. Erros de Parsing

```tsx
try {
  const parsed = JSON.parse(stored)
  return parsed.data
} catch (error) {
  console.error("Erro ao ler dados:", error)
  return null
}
```

### 4. Dados Corrompidos

O hook sempre valida a estrutura antes de usar:

```tsx
const savedData = getSavedData()
if (!savedData) {
  // Não há dados ou dados corrompidos
  return
}
// Usar dados salvos
```

---

## 🎯 Melhores Práticas

### 1. Escolha Boas Chaves

```tsx
// ✅ Bom - específico e descritivo
useAutoSave(data, { key: 'patient-registration-wizard-step-2' })

// ❌ Ruim - genérico demais
useAutoSave(data, { key: 'form' })
```

### 2. Salve Dados Relevantes

```tsx
// ✅ Bom - apenas dados do formulário
const formData = { name, email, phone }
useAutoSave(formData, { key: 'form' })

// ❌ Ruim - incluindo dados desnecessários
const allData = { name, email, phone, errors, isSubmitting, timestamp }
useAutoSave(allData, { key: 'form' })
```

### 3. Limpe Dados após Sucesso

```tsx
// ✅ Bom
const handleSubmit = async () => {
  await submitForm()
  clearSaved() // Limpar após sucesso
}

// ❌ Ruim - dados permanecem no localStorage indefinidamente
const handleSubmit = async () => {
  await submitForm()
  // Não limpa dados
}
```

### 4. Use onRecover para Feedback

```tsx
useAutoSave(formData, {
  key: 'my-form',
  onRecover: (data) => {
    setFormData(data)
    // ✅ Bom - feedback visual
    toast({
      title: "Bem-vindo de volta!",
      description: "Seus dados foram recuperados.",
    })
  },
})
```

### 5. Salve Estado Complexo em Wizards

```tsx
// ✅ Bom - incluir step atual
const dataToSave = { ...formData, currentStep, completedSteps }
useAutoSave(dataToSave, { key: 'wizard' })

// ❌ Ruim - apenas dados do formulário
useAutoSave(formData, { key: 'wizard' })
```

### 6. Ajuste debounceMs Conforme Necessário

```tsx
// Formulário simples - 2 segundos
useAutoSave(data, { debounceMs: 2000 })

// Editor de texto - 1 segundo
useAutoSave(data, { debounceMs: 1000 })

// Wizard complexo - 1.5 segundos
useAutoSave(data, { debounceMs: 1500 })
```

---

## 🧪 Testes

### Teste Manual

1. **Teste de Auto-Save**
   - Preencha um campo
   - Aguarde 2 segundos
   - Verifique o indicador "Salvo"

2. **Teste de Recuperação**
   - Preencha alguns campos
   - Aguarde o save
   - Recarregue a página (F5)
   - Verifique se dados foram recuperados

3. **Teste de Multi-Step**
   - Preencha Etapa 1
   - Vá para Etapa 2
   - Recarregue
   - Verifique se voltou para Etapa 2

4. **Teste de Limpeza**
   - Preencha o formulário
   - Submeta com sucesso
   - Recarregue
   - Verifique que dados foram limpos

### Teste de Erros

1. **Quota Excedida**
   - Encha o localStorage
   - Tente salvar
   - Verifique toast de erro

2. **Dados Corrompidos**
   - Salve dados no localStorage
   - Modifique manualmente (DevTools)
   - Recarregue
   - Verifique tratamento de erro

### Teste em Diferentes Navegadores

- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

---

## 📝 Notas Adicionais

### Limitações do localStorage

- **Tamanho**: ~5-10MB dependendo do navegador
- **Sincronização**: Não sincroniza entre dispositivos
- **Privado**: Apenas no navegador do usuário
- **Persistência**: Permanece até ser limpo manualmente

### Quando NÃO Usar Auto-Save

- ❌ Dados sensíveis (senhas, cartões de crédito)
- ❌ Dados muito grandes (> 1MB)
- ❌ Formulários de login/autenticação
- ❌ Dados que expiram rapidamente

### Alternativas

Para casos específicos, considere:

- **SessionStorage**: Para dados de sessão única
- **IndexedDB**: Para dados grandes e estruturados
- **Server-side drafts**: Para sincronização multi-dispositivo
- **Cookies**: Para dados pequenos que precisam ir ao servidor

---

## 🚀 Próximos Passos

Possíveis melhorias futuras:

1. **Compressão de dados**: Para economizar espaço
2. **Criptografia local**: Para dados sensíveis
3. **Sincronização com servidor**: Backup em nuvem
4. **Múltiplos rascunhos**: Salvar várias versões
5. **Histórico de alterações**: Undo/redo
6. **Indicador de conflitos**: Se dados mudaram no servidor

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte esta documentação
2. Veja a página de demonstração: `/demo-autosave`
3. Revise os exemplos de código
4. Teste no ambiente de desenvolvimento

---

**Versão**: 1.0.0
**Última atualização**: 11/11/2025
**Autor**: Sistema Telos.AI
