# Gamification System Cheat Sheet

## Quick Copy-Paste Templates

### Basic Setup (Copy & Use)

```tsx
"use client"
import { useState } from 'react'
import { CompletenessIncentive } from '@/components/CompletenessIncentive'
import { MilestoneReward } from '@/components/MilestoneReward'
import { useFormCompletion } from '@/hooks/useFormCompletion'

export default function MyForm() {
  const [formData, setFormData] = useState({
    field1: '', field2: '', field3: ''
  })

  const [showMilestone, setShowMilestone] = useState<40|60|80|100|null>(null)

  const { completion } = useFormCompletion({
    fields: {
      field1: { value: formData.field1 },
      field2: { value: formData.field2 },
      field3: { value: formData.field3 }
    },
    onMilestoneReached: (m) => setShowMilestone(m)
  })

  return (
    <>
      <div className="sticky top-4 z-20 mb-8">
        <CompletenessIncentive
          currentCompletion={completion}
          onContinue={() => {/* scroll logic */}}
        />
      </div>

      <form>{/* Your fields */}</form>

      {showMilestone && (
        <MilestoneReward
          milestone={showMilestone}
          isVisible={true}
          onClose={() => setShowMilestone(null)}
        />
      )}
    </>
  )
}
```

---

## Props Reference

### CompletenessIncentive
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| currentCompletion | number | ✅ | - | 0-100 |
| onContinue | function | ❌ | - | CTA callback |
| showConfetti | boolean | ❌ | true | Enable confetti |

### MilestoneReward
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| milestone | 40\|60\|80\|100 | ✅ | - | Which milestone |
| isVisible | boolean | ✅ | - | Show/hide modal |
| onClose | function | ❌ | - | Close callback |
| autoClose | boolean | ❌ | true | Auto dismiss |
| autoCloseDelay | number | ❌ | 5000 | Delay in ms |

### useFormCompletion
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| fields | object | ✅ | Field definitions |
| onMilestoneReached | function | ❌ | Milestone callback |

**Returns**: `{ completion, isComplete, nextMilestone, percentageToNextMilestone }`

---

## Common Patterns

### 1. Auto-scroll to Next Field
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

<CompletenessIncentive
  currentCompletion={completion}
  onContinue={scrollToNext}
/>
```

### 2. Weighted Important Fields
```tsx
const { completion } = useFormCompletion({
  fields: {
    name: { value: formData.name, weight: 1 },
    email: { value: formData.email, weight: 1 },
    // Medical fields are 2x important
    bloodType: { value: formData.bloodType, weight: 2 },
    allergies: { value: formData.allergies, weight: 2 }
  }
})
```

### 3. Conditional Milestone Display
```tsx
{completion >= 40 && showMilestone && (
  <MilestoneReward
    milestone={showMilestone}
    isVisible={true}
    onClose={() => setShowMilestone(null)}
    autoClose={completion < 100} // Keep 100% open longer
  />
)}
```

### 4. Save Progress on Milestone
```tsx
const handleMilestone = async (milestone: number) => {
  setShowMilestone(milestone as 40|60|80|100)

  // Save progress
  await saveFormProgress(formData, milestone)

  // Analytics
  trackEvent('milestone_reached', { milestone, completion })
}

const { completion } = useFormCompletion({
  fields,
  onMilestoneReached: handleMilestone
})
```

### 5. Disable Confetti in Specific Cases
```tsx
<CompletenessIncentive
  currentCompletion={completion}
  showConfetti={!isInMeeting && !isLowPowerMode}
/>
```

---

## Completion Levels Quick Reference

| % | Color | Emoji | Label |
|---|-------|-------|-------|
| 0-20 | Red | 🔴 | Dados básicos |
| 21-40 | Orange | 🟠 | Informações essenciais |
| 41-60 | Yellow | 🟡 | Bom progresso |
| 61-80 | Lt Green | 🟢 | Quase completo |
| 81-99 | Green | ✨ | Excelente! |
| 100 | Gold | 🏆 | Cadastro perfeito! |

---

## Benefits Unlocked

| % | Benefits |
|---|----------|
| 20 | Follow-ups básicos |
| 40 | Relatórios simples |
| 60 | Análises preditivas, Alertas |
| 80 | Exportação, Gráficos avançados |
| 100 | Todos recursos, Pontuação max, Elegível pesquisas |

---

## Field Types Support

```tsx
const { completion } = useFormCompletion({
  fields: {
    // Strings (filled if not empty)
    name: { value: "John" },          // ✓ Filled
    empty: { value: "" },              // ✗ Empty

    // Numbers (always filled if set)
    age: { value: 0 },                 // ✓ Filled
    unset: { value: null },            // ✗ Empty

    // Booleans (always filled)
    agreed: { value: false },          // ✓ Filled

    // Arrays (filled if has items)
    tags: { value: ["a", "b"] },       // ✓ Filled
    noTags: { value: [] },             // ✗ Empty

    // Objects (filled if has keys)
    address: { value: { city: "LA" }}, // ✓ Filled
    noAddr: { value: {} },             // ✗ Empty
  }
})
```

---

## Styling Customization

### Change Primary Color
```tsx
// In CompletenessIncentive.tsx, find:
className="bg-gradient-to-r from-[#0066CC] to-[#00A3E0]"

// Replace with your brand colors:
className="bg-gradient-to-r from-[#YOUR_COLOR] to-[#YOUR_COLOR2]"
```

### Modify Level Colors
```tsx
// In CompletenessIncentive.tsx, update levels array:
const levels = [
  { threshold: 0, label: "...", color: "#YOUR_COLOR", ... },
  // ...
]
```

### Custom Confetti Colors
```tsx
// In CompletenessIncentive.tsx, find confetti() calls:
confetti({
  colors: ['#COLOR1', '#COLOR2', '#COLOR3']
})
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Confetti not showing | Check `showConfetti={true}` prop |
| Completion stuck at 0% | Verify field values are updating |
| Milestone not triggering | Add `onMilestoneReached` callback |
| Progress ring not animating | Check Framer Motion is installed |
| Types error | Ensure TypeScript config includes .tsx |
| Modal won't close | Check `onClose` is wired up |
| Weights not working | Verify weight values are numbers |

---

## Testing Checklist

- [ ] Fill form from 0% to 100%
- [ ] See all 6 completion levels
- [ ] Milestone appears at 40%, 60%, 80%, 100%
- [ ] Confetti shows at 100%
- [ ] CTA button scrolls to next field
- [ ] Benefits unlock progressively
- [ ] Mobile responsive
- [ ] Keyboard accessible
- [ ] Screen reader friendly
- [ ] Works in all major browsers

---

## Performance Tips

✅ **Do**:
- Use `React.memo()` for large forms
- Debounce rapid field changes
- Lazy load milestone component
- Use `key` prop for list items

❌ **Don't**:
- Calculate completion on every keystroke
- Render all modals at once
- Use inline functions in render
- Forget to clean up event listeners

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Focus next element |
| Shift+Tab | Focus previous |
| Enter | Activate button |
| Space | Activate button |
| Escape | Close milestone modal |

---

## Analytics Events to Track

```tsx
// Milestone reached
trackEvent('milestone_reached', {
  milestone: 40,
  time: Date.now()
})

// CTA clicked
trackEvent('continue_clicked', {
  completion: 75
})

// Form completed
trackEvent('form_completed', {
  duration: 180000 // ms
})

// Milestone modal closed
trackEvent('milestone_closed', {
  milestone: 60,
  action: 'user_dismissed' | 'auto_closed'
})
```

---

## Files Reference

**Components**:
- `components/CompletenessIncentive.tsx`
- `components/MilestoneReward.tsx`
- `components/ui/slider.tsx`

**Hooks**:
- `hooks/useFormCompletion.ts`

**Demos**:
- `/demo-incentive` - Interactive demo
- `/demo-form-completion` - Full example

**Docs**:
- `GAMIFICATION_GUIDE.md` - Full guide
- `GAMIFICATION_QUICK_START.md` - 5min setup
- `GAMIFICATION_VISUAL_GUIDE.md` - Visual ref
- `GAMIFICATION_IMPLEMENTATION_SUMMARY.md` - Summary

---

## Dependencies

```bash
npm install canvas-confetti framer-motion @radix-ui/react-slider
```

---

## Links

**Demo Pages**:
- Interactive: `http://localhost:3000/demo-incentive`
- Full Form: `http://localhost:3000/demo-form-completion`

**Documentation**: See `/GAMIFICATION_*.md` files

---

**Version**: 1.0.0 | **Updated**: 2025-11-11 | **By**: Telos.AI
