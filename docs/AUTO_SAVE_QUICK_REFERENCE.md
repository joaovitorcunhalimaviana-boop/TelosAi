# Auto-Save System - Referência Rápida

## 🚀 Início Rápido

### 1. Importar o Hook

```tsx
import { useAutoSave } from "@/hooks/useAutoSave"
import { InlineAutoSaveIndicator } from "@/components/AutoSaveIndicator"
```

### 2. Usar no Componente

```tsx
const { isSaving, lastSaved, saveNow, clearSaved } = useAutoSave(formData, {
  key: 'my-unique-key',
  debounceMs: 2000,
  onRecover: (data) => setFormData(data),
})
```

### 3. Adicionar Indicador Visual

```tsx
<InlineAutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
```

---

## 📚 API Completa

### Hook Parameters

```tsx
useAutoSave(data, {
  key: string,                      // OBRIGATÓRIO: Chave única
  debounceMs?: number,             // OPCIONAL: Delay (padrão: 2000ms)
  onSave?: (data: any) => void,    // OPCIONAL: Callback pós-save
  onRecover?: (data: any) => void, // OPCIONAL: Callback recuperação
})
```

### Valores Retornados

```tsx
{
  isSaving: boolean,        // Estado de salvamento
  lastSaved: Date | null,   // Data do último save
  saveNow: () => void,      // Forçar save imediato
  clearSaved: () => void,   // Limpar dados salvos
  getSavedData: () => any,  // Obter dados salvos
}
```

---

## 💡 Exemplos Prontos

### Formulário Simples

```tsx
"use client"

import { useState } from "react"
import { useAutoSave } from "@/hooks/useAutoSave"
import { InlineAutoSaveIndicator } from "@/components/AutoSaveIndicator"

export function MyForm() {
  const [formData, setFormData] = useState({ name: "", email: "" })

  const { isSaving, lastSaved, saveNow, clearSaved } = useAutoSave(formData, {
    key: 'my-form',
    onRecover: (data) => setFormData(data),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await submitToAPI(formData)
    clearSaved() // Limpar após sucesso
  }

  return (
    <form onSubmit={handleSubmit}>
      <InlineAutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />

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

### Wizard Multi-Step

```tsx
const [currentStep, setCurrentStep] = useState(1)
const [formData, setFormData] = useState({ /* ... */ })

const { isSaving, lastSaved, saveNow, clearSaved } = useAutoSave(
  { ...formData, currentStep }, // Incluir step nos dados
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
  saveNow() // Salvar antes de mudar
  setCurrentStep(prev => prev + 1)
}
```

---

## 🎨 Componentes de Indicador

### InlineAutoSaveIndicator
Para headers de cards/forms:

```tsx
<CardHeader>
  <div className="flex items-center justify-between">
    <CardTitle>Formulário</CardTitle>
    <InlineAutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
  </div>
</CardHeader>
```

### FloatingAutoSaveIndicator
Flutuante no canto superior direito:

```tsx
<FloatingAutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
```

### AutoSaveIndicator
Básico (mais flexível):

```tsx
<AutoSaveIndicator
  isSaving={isSaving}
  lastSaved={lastSaved}
  className="my-custom-class"
/>
```

---

## ✅ Checklist de Implementação

- [ ] Importar `useAutoSave` hook
- [ ] Definir chave única e descritiva
- [ ] Adicionar `onRecover` callback para restaurar dados
- [ ] Implementar `saveNow()` no `onBlur` dos inputs
- [ ] Chamar `clearSaved()` após submissão bem-sucedida
- [ ] Adicionar indicador visual (InlineAutoSaveIndicator)
- [ ] Para wizards: incluir `currentStep` nos dados salvos
- [ ] Para wizards: chamar `saveNow()` ao mudar de step
- [ ] Testar recuperação recarregando a página
- [ ] Testar limpeza após submissão

---

## 🎯 Casos de Uso Comuns

### 1. Save on Blur

```tsx
<input
  value={formData.name}
  onChange={handleChange}
  onBlur={saveNow} // ← Adicione isso
/>
```

### 2. Save on Select Change

```tsx
<select
  value={formData.type}
  onChange={(e) => {
    updateField('type', e.target.value)
    saveNow() // ← Salvar imediatamente
  }}
>
```

### 3. Save Before Navigation

```tsx
const handleNext = () => {
  saveNow() // ← Garantir save
  navigate('/next-page')
}
```

### 4. Clear After Success

```tsx
const handleSubmit = async () => {
  try {
    await api.submit(formData)
    clearSaved() // ← Limpar dados salvos
    navigate('/success')
  } catch (error) {
    // Manter dados salvos em caso de erro
  }
}
```

---

## 🛡️ Erros Comuns e Soluções

### ❌ Dados não estão sendo salvos

**Problema**: O debounce não está sendo acionado

**Solução**: Verifique se o objeto `data` está realmente mudando

```tsx
// ✅ Correto - cria novo objeto
setFormData({ ...formData, name: value })

// ❌ Errado - mutação direta
formData.name = value
```

### ❌ Dados não são recuperados

**Problema**: `onRecover` não foi implementado

**Solução**: Adicione o callback:

```tsx
useAutoSave(formData, {
  key: 'my-form',
  onRecover: (data) => setFormData(data), // ← Adicione isso
})
```

### ❌ Save acontece em cada tecla

**Problema**: Não está usando debounce corretamente

**Solução**: Não force `saveNow()` no `onChange`:

```tsx
// ❌ Errado
<input onChange={(e) => {
  handleChange(e)
  saveNow() // Remove isso
}} />

// ✅ Correto - auto-save cuida disso
<input onChange={handleChange} onBlur={saveNow} />
```

### ❌ Dados permanecem após submissão

**Problema**: Não está chamando `clearSaved()`

**Solução**:

```tsx
const handleSubmit = async () => {
  await submit()
  clearSaved() // ← Adicione isso
}
```

---

## 📊 Formato dos Dados Salvos

```json
{
  "version": "1.0.0",
  "timestamp": "2025-11-11T10:30:45.123Z",
  "data": {
    "name": "João Silva",
    "email": "joao@email.com",
    "currentStep": 2
  }
}
```

**LocalStorage Key**: `autosave_${key}`

**Exemplo**: `autosave_patient-registration-wizard`

---

## 🔧 Configurações Recomendadas

### Formulário Simples (3-5 campos)

```tsx
useAutoSave(data, {
  key: 'simple-form',
  debounceMs: 2000,
})
```

### Formulário Complexo (10+ campos)

```tsx
useAutoSave(data, {
  key: 'complex-form',
  debounceMs: 1500,
})
```

### Editor de Texto

```tsx
useAutoSave(data, {
  key: 'text-editor',
  debounceMs: 1000,
})
```

### Wizard Multi-Step

```tsx
useAutoSave({ ...data, currentStep }, {
  key: 'wizard',
  debounceMs: 1500,
  onRecover: (data) => {
    const { currentStep, ...formData } = data
    setFormData(formData)
    setCurrentStep(currentStep)
  },
})
```

---

## 🚨 Quando NÃO Usar

- ❌ Formulários de login/senha
- ❌ Dados de pagamento (cartão de crédito)
- ❌ Dados > 1MB
- ❌ Informações confidenciais
- ❌ Dados que mudam muito rapidamente (> 10x/segundo)

---

## 🧪 Teste Rápido

1. Preencha alguns campos
2. Aguarde 2 segundos
3. Veja indicador "Salvo"
4. Recarregue a página (F5)
5. Dados devem estar lá!

---

## 📞 Links Úteis

- **Documentação Completa**: `/docs/AUTO_SAVE_SYSTEM.md`
- **Demo Interativa**: `/demo-autosave`
- **Arquivo do Hook**: `/hooks/useAutoSave.ts`
- **Componentes**: `/components/AutoSaveIndicator.tsx`

---

## 🎓 Exemplo Completo Copy-Paste

```tsx
"use client"

import { useState } from "react"
import { useAutoSave } from "@/hooks/useAutoSave"
import { InlineAutoSaveIndicator } from "@/components/AutoSaveIndicator"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function MyFormPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const { isSaving, lastSaved, saveNow, clearSaved } = useAutoSave(formData, {
    key: 'my-awesome-form',
    debounceMs: 2000,
    onRecover: (data) => {
      setFormData(data)
      console.log('Dados recuperados!')
    },
  })

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Dados enviados:', formData)

      clearSaved() // Limpar após sucesso
      alert('Formulário enviado com sucesso!')
    } catch (error) {
      alert('Erro ao enviar')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Meu Formulário</CardTitle>
            <InlineAutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                onBlur={saveNow}
                placeholder="Seu nome"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                onBlur={saveNow}
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                onBlur={saveNow}
                placeholder="(11) 98765-4321"
              />
            </div>

            <Button type="submit" className="w-full">
              Enviar Formulário
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Pronto! Copie, cole e ajuste conforme necessário.**

---

**Última atualização**: 11/11/2025
