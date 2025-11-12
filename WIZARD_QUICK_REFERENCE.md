# RegistrationWizard - Quick Reference

## 🚀 Quick Start

```tsx
import { RegistrationWizard, WizardStep } from "@/components/RegistrationWizard"

const steps: WizardStep[] = [
  {
    id: "personal-info",
    title: "Personal Information",
    description: "Enter your details",
    fields: <YourFields />,
    validate: async () => schema.safeParse(data).success,
    onSave: async () => await saveToAPI(data)
  }
]

<RegistrationWizard
  steps={steps}
  currentStep={currentStep}
  onStepChange={setCurrentStep}
  onComplete={handleSubmit}
  isResearchMode={false}
/>
```

## 📋 Step Structure

```tsx
interface WizardStep {
  id: string                              // Unique identifier
  title: string                           // Step header
  description: string                     // Subtitle
  fields: React.ReactNode                 // Form fields
  validate: () => Promise<boolean>        // Must return true to proceed
  onSave?: () => Promise<void>           // Optional auto-save
}
```

## ✅ Validation Pattern

```tsx
import { z } from "zod"

const schema = z.object({
  name: z.string().min(3, "Minimum 3 chars"),
  email: z.string().email("Invalid email")
})

validate: async () => {
  try {
    schema.parse(formData)
    return true
  } catch {
    return false
  }
}
```

## 💾 Auto-Save Pattern

```tsx
onSave: async () => {
  // localStorage
  localStorage.setItem('step-1', JSON.stringify(data))

  // or API
  await fetch('/api/save', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}
```

## 🎨 Key Features

| Feature | Description |
|---------|-------------|
| Progress Bar | Auto-calculated 0-100% |
| Step Counter | "Etapa X de Y" |
| Indicators | ✓ completed, ● current, ○ pending |
| Navigation | Voltar/Próximo buttons |
| Keyboard | Press Enter to continue |
| Summary | "Resumo" button shows all steps |
| Mobile | Responsive design |
| Validation | Blocks navigation if invalid |
| Auto-save | Optional save on step change |

## 🎯 Props at a Glance

```tsx
interface RegistrationWizardProps {
  steps: WizardStep[]                    // Required
  currentStep: number                    // Required (0-based)
  onStepChange: (step: number) => void   // Required
  onComplete: () => Promise<void>        // Required
  isResearchMode?: boolean               // Optional (default: false)
  className?: string                     // Optional
}
```

## 🎨 Telos.AI Colors

```tsx
// Primary
bg-telos-blue        // #0A2647 (Navy blue)
bg-telos-gold        // #D4AF37 (Gold)

// Text
text-telos-blue      // #0A2647
text-telos-gold      // #D4AF37

// Borders
border-telos-gold    // #D4AF37
```

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Next step or Complete |
| `Tab` | Navigate fields |
| `Esc` | Close summary dialog |

## 📱 Mobile Behavior

- Desktop: Numbered step circles
- Mobile: Horizontal progress dots
- Touch-friendly 44px+ buttons
- Simplified layout

## 🔍 Common Patterns

### Conditional Fields
```tsx
fields: (
  <>
    <Input name="email" />
    {showPhone && <Input name="phone" />}
  </>
)
```

### Multi-field Validation
```tsx
validate: async () => {
  return field1.isValid() &&
         field2.isValid() &&
         field3.isValid()
}
```

### Dynamic Steps
```tsx
const steps = useMemo(() => {
  const base = [step1, step2]
  if (isAdmin) base.push(adminStep)
  return base
}, [isAdmin])
```

## 🐛 Debugging

```tsx
validate: async () => {
  console.log('Validating:', formData)
  const result = await myValidation()
  console.log('Valid:', result)
  return result
}

onSave: async () => {
  console.log('Saving step:', stepId)
  await saveData()
  console.log('Saved successfully')
}
```

## ⚡ Performance Tips

1. Use `useCallback` for validate/onSave
2. Memoize expensive field components
3. Avoid validation on every keystroke
4. Use lazy loading for heavy components

## 🎯 Best Practices

✅ **DO**
- Keep steps focused (one purpose)
- Validate thoroughly before proceeding
- Show inline field errors
- Use descriptive titles/descriptions
- Save progress automatically
- Handle async operations gracefully

❌ **DON'T**
- Skip validation
- Create too many steps (5-8 is ideal)
- Block UI without feedback
- Ignore mobile users
- Forget error handling
- Use generic error messages

## 📊 Step Status Flow

```
pending → current → completed
   ○         ●         ✓
```

## 🔄 State Management

```tsx
// Minimal setup
const [step, setStep] = useState(0)
const [data, setData] = useState({})

// Complete setup
const [currentStep, setCurrentStep] = useState(0)
const [formData, setFormData] = useState<FormData>({})
const [errors, setErrors] = useState<Record<string, string>>({})
const [savedSteps, setSavedSteps] = useState<Set<number>>(new Set())
```

## 🎭 Loading States

The wizard handles:
- `isValidating`: Checking if step is valid
- `isSaving`: Saving step data
- `isCompleting`: Finalizing wizard

All automatic - no props needed!

## 📝 Example: 3-Step Wizard

```tsx
function MyWizard() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({ name: "", email: "", phone: "" })

  const steps = [
    {
      id: "name",
      title: "Your Name",
      description: "What should we call you?",
      fields: (
        <Input
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
      ),
      validate: async () => data.name.length >= 3
    },
    {
      id: "email",
      title: "Email Address",
      description: "Where can we reach you?",
      fields: (
        <Input
          type="email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />
      ),
      validate: async () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
    },
    {
      id: "phone",
      title: "Phone Number",
      description: "Optional contact number",
      fields: (
        <Input
          value={data.phone}
          onChange={(e) => setData({ ...data, phone: e.target.value })}
        />
      ),
      validate: async () => true // Optional field
    }
  ]

  return (
    <RegistrationWizard
      steps={steps}
      currentStep={step}
      onStepChange={setStep}
      onComplete={async () => {
        await fetch('/api/users', {
          method: 'POST',
          body: JSON.stringify(data)
        })
      }}
    />
  )
}
```

## 🔗 Related Files

- Main Component: `components/RegistrationWizard.tsx`
- Full Example: `components/RegistrationWizard.example.tsx`
- Complete Guide: `REGISTRATION_WIZARD_GUIDE.md`

## 💡 Tips

1. **Validation**: Use Zod for type-safe schemas
2. **Error Display**: Show errors inline, not just at wizard level
3. **Progress**: Users love seeing how far they've come
4. **Back Button**: Always allow going back to fix mistakes
5. **Mobile**: Test on real devices, not just browser resize
6. **Keyboard**: Many power users prefer keyboard navigation
7. **Auto-save**: Prevent data loss from accidental closes
8. **Summary**: Helps users review before final submission

## 🆘 Common Issues

**Validation not working?**
- Ensure `validate()` returns Promise<boolean>
- Check for async/await syntax
- Log errors to console

**Steps not changing?**
- Verify `onStepChange` updates state
- Check that `currentStep` prop changes
- No state mutations (use `setState`)

**Auto-save failing silently?**
- Add try/catch to `onSave`
- Log errors for debugging
- Check network tab for API calls

**Progress bar stuck?**
- Confirm `currentStep` is updating
- Check calculation: `(current + 1) / total * 100`
- Ensure no CSS conflicts

---

**Quick Help**: See full documentation in `REGISTRATION_WIZARD_GUIDE.md`
