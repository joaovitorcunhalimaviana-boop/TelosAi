# Gamification Quick Start Guide

Get your form completion incentives up and running in 5 minutes!

## Quick Implementation

### Step 1: Import Components (30 seconds)

```tsx
import { CompletenessIncentive } from '@/components/CompletenessIncentive'
import { MilestoneReward } from '@/components/MilestoneReward'
import { useFormCompletion } from '@/hooks/useFormCompletion'
```

### Step 2: Add State (30 seconds)

```tsx
const [formData, setFormData] = useState({
  field1: '',
  field2: '',
  field3: ''
})

const [showMilestone, setShowMilestone] = useState<40 | 60 | 80 | 100 | null>(null)
```

### Step 3: Calculate Completion (1 minute)

```tsx
const { completion } = useFormCompletion({
  fields: {
    field1: { value: formData.field1 },
    field2: { value: formData.field2 },
    field3: { value: formData.field3 }
  },
  onMilestoneReached: (milestone) => setShowMilestone(milestone)
})
```

### Step 4: Add Components (2 minutes)

```tsx
return (
  <>
    {/* Incentive Banner */}
    <CompletenessIncentive
      currentCompletion={completion}
      onContinue={() => {/* scroll to next field */}}
    />

    {/* Your Form */}
    <form>{/* ... */}</form>

    {/* Milestone Celebration */}
    {showMilestone && (
      <MilestoneReward
        milestone={showMilestone}
        isVisible={true}
        onClose={() => setShowMilestone(null)}
      />
    )}
  </>
)
```

### Step 5: Done! (1 minute)

Test your form and watch the magic happen!

---

## Common Patterns

### Pattern 1: Sticky Top Banner
```tsx
<div className="sticky top-4 z-20 mb-8">
  <CompletenessIncentive currentCompletion={completion} />
</div>
```

### Pattern 2: Weighted Important Fields
```tsx
const { completion } = useFormCompletion({
  fields: {
    name: { value: formData.name, weight: 1 },
    // Medical info is 2x more important
    bloodType: { value: formData.bloodType, weight: 2 }
  }
})
```

### Pattern 3: Auto-scroll Helper
```tsx
const scrollToNext = () => {
  const empty = Object.entries(formData).find(([_, v]) => !v)
  if (empty) {
    document.getElementById(empty[0])?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }
}
```

---

## Props Cheat Sheet

### CompletenessIncentive
```tsx
currentCompletion: number  // 0-100 (required)
onContinue?: () => void    // Button click handler
showConfetti?: boolean     // Default: true
```

### MilestoneReward
```tsx
milestone: 40 | 60 | 80 | 100  // (required)
isVisible: boolean             // (required)
onClose?: () => void
autoClose?: boolean            // Default: true
autoCloseDelay?: number        // Default: 5000ms
```

### useFormCompletion
```tsx
fields: {
  [key]: {
    value: any,
    weight?: number  // Default: 1
  }
}
onMilestoneReached?: (milestone) => void
```

---

## Demo Pages

Test the components:
- **Interactive Demo**: `/demo-incentive`
- **Full Form Example**: `/demo-form-completion`

---

## Completion Levels

| % | Label | Color | Emoji |
|---|-------|-------|-------|
| 0-20 | Dados básicos | Red | 🔴 |
| 21-40 | Informações essenciais | Orange | 🟠 |
| 41-60 | Bom progresso | Yellow | 🟡 |
| 61-80 | Quase completo | Green | 🟢 |
| 81-99 | Excelente! | Green | ✨ |
| 100 | Cadastro perfeito! | Gold | 🏆 |

---

## Benefits Unlocked

**20%**: Follow-ups básicos
**40%**: Relatórios simples
**60%**: Análises preditivas + Alertas
**80%**: Exportação + Gráficos avançados
**100%**: Todos os recursos + Pontuação máxima

---

## Troubleshooting

**Confetti not working?**
- Check: `showConfetti={true}`
- Verify: `canvas-confetti` installed

**Completion stuck at 0%?**
- Check: Form values are bound correctly
- Verify: Fields object structure

**Milestones not triggering?**
- Add: `onMilestoneReached` callback
- Check: State updates properly

---

## Need More?

See full documentation: `GAMIFICATION_GUIDE.md`

---

**Ready in 5 minutes. Delightful forever.**
