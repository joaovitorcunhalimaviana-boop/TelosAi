# RegistrationWizard Component Guide

## Overview

The `RegistrationWizard` is a professional, production-ready wizard component for multi-step registration forms. It provides an excellent user experience with visual progress tracking, validation, keyboard navigation, and responsive design.

## Features

### Core Features
- **Step-based Navigation**: Voltar/Próximo buttons for intuitive navigation
- **Visual Progress Tracking**:
  - Progress bar showing 0-100% completion
  - Step counter (X/8 format)
  - Step status indicators (pending, current, completed)
- **Validation**: Async validation before advancing to next step
- **Auto-save**: Optional auto-save functionality on step change
- **Keyboard Navigation**: Press Enter to continue/complete
- **Mobile Responsive**: Optimized for all screen sizes
- **Smooth Transitions**: Animated transitions between steps
- **Summary View**: Modal to review all entered data

### Visual Design
- **Telos.AI Branding**: Uses #0A2647 (blue) and #D4AF37 (gold)
- **Step Indicators**:
  - Desktop: Numbered circles with checkmarks when completed
  - Mobile: Horizontal progress dots
- **Animated Progress Bar**: Smooth transitions with Telos.AI colors
- **Clean Layout**: Card-based design with clear hierarchy
- **Status Feedback**: Visual indicators for validation errors and loading states

## Installation

The component is located at:
```
C:\Users\joaov\sistema-pos-operatorio\components\RegistrationWizard.tsx
```

### Dependencies

The component uses these UI components (already installed):
- `@/components/ui/button`
- `@/components/ui/card`
- `@/components/ui/progress`
- `@/components/ui/badge`
- `@/components/ui/dialog`

And these icons from `lucide-react`:
- `ChevronLeft`, `ChevronRight`
- `Check`, `Circle`
- `ClipboardList`, `AlertCircle`, `Loader2`

## Usage

### Basic Example

```tsx
import { RegistrationWizard, WizardStep } from "@/components/RegistrationWizard"

const steps: WizardStep[] = [
  {
    id: "step-1",
    title: "Personal Information",
    description: "Enter your basic details",
    fields: <YourFormFields />,
    validate: async () => {
      // Return true if valid, false otherwise
      return formIsValid
    },
    onSave: async () => {
      // Optional: Save data to localStorage or API
      await saveData()
    }
  },
  // ... more steps
]

function MyRegistration() {
  const [currentStep, setCurrentStep] = useState(0)

  const handleComplete = async () => {
    // Handle final submission
    await submitForm()
  }

  return (
    <RegistrationWizard
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onComplete={handleComplete}
      isResearchMode={false}
    />
  )
}
```

### Complete Example

See `RegistrationWizard.example.tsx` for a complete 8-step patient registration example with:
- Personal data validation
- Address fields
- Medical history
- Emergency contacts
- Insurance information
- Surgery details
- Consent terms
- Additional notes

## Props Reference

### RegistrationWizardProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `steps` | `WizardStep[]` | Yes | - | Array of wizard steps |
| `currentStep` | `number` | Yes | - | Current active step index (0-based) |
| `onStepChange` | `(step: number) => void` | Yes | - | Callback when step changes |
| `onComplete` | `() => Promise<void>` | Yes | - | Callback when wizard completes |
| `isResearchMode` | `boolean` | No | `false` | Show "Pesquisa" badge |
| `className` | `string` | No | - | Additional CSS classes |

### WizardStep Interface

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier for the step |
| `title` | `string` | Yes | Step title displayed in header |
| `description` | `string` | Yes | Step description/subtitle |
| `fields` | `React.ReactNode` | Yes | Form fields to render |
| `validate` | `() => Promise<boolean>` | Yes | Async validation function |
| `onSave` | `() => Promise<void>` | No | Optional save callback |

## Step Validation

Each step must implement a `validate` function that returns a Promise<boolean>:

```tsx
validate: async () => {
  try {
    // Using zod schema
    mySchema.parse(formData)
    return true
  } catch (error) {
    // Log errors for debugging
    console.error("Validation failed:", error)
    return false
  }
}
```

### Validation Best Practices

1. **Use Schema Validation**: Leverage Zod or similar libraries
2. **Show Field Errors**: Display inline validation errors in your fields
3. **Async Validation**: Support async validations (API checks, etc.)
4. **Clear Error Messages**: Provide helpful error messages to users

Example with Zod:

```tsx
import { z } from "zod"

const stepSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Telefone inválido"),
})

const validate = async () => {
  try {
    stepSchema.parse(formData)
    setErrors({}) // Clear errors
    return true
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = {}
      error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0]] = err.message
        }
      })
      setErrors(fieldErrors)
    }
    return false
  }
}
```

## Auto-Save Functionality

Implement the optional `onSave` callback to auto-save data:

```tsx
onSave: async () => {
  // Save to localStorage
  localStorage.setItem(`step_${stepId}`, JSON.stringify(formData))

  // Or save to API
  await fetch('/api/save-progress', {
    method: 'POST',
    body: JSON.stringify(formData)
  })
}
```

## Keyboard Navigation

The wizard supports keyboard shortcuts:
- **Enter**: Advance to next step or complete wizard
- **Escape**: Close summary dialog (if open)

The Enter key is automatically disabled during:
- Validation
- Saving
- Completion

## Progress Tracking

### Progress Bar
- Automatically calculated: `(currentStep + 1) / totalSteps * 100`
- Animated transitions using CSS
- Telos.AI blue color (#0A2647)

### Step Indicators

**Desktop View**:
- Numbered circles (1, 2, 3...)
- Checkmarks for completed steps
- Gold border for current step
- Gray for pending steps
- Clickable for completed steps (allows going back)

**Mobile View**:
- Horizontal dots
- Different widths for status:
  - Completed: 8px width
  - Current: 12px width
  - Pending: 6px width

### Step Status

Three possible states:
- `completed`: Step was successfully validated and saved
- `current`: Currently active step
- `pending`: Not yet reached

## Summary Dialog

The "Resumo" button opens a dialog showing:
- All steps with their status
- Checkmarks for completed steps
- Gray circles for pending steps
- Step titles and descriptions

Useful for:
- Reviewing progress
- Identifying missing steps
- Navigation overview

## Error Handling

The wizard displays validation errors in a prominent alert:

```tsx
// Validation error is shown automatically
// when validate() returns false
```

Error states:
- **Validation Error**: Red alert box with error icon
- **Loading States**: Spinner indicators on buttons
- **Disabled States**: Buttons disabled during processing

## Styling & Theming

### Telos.AI Colors

The component uses CSS variables from `globals.css`:

```css
--telos-blue-deep: #0A2647;    /* Primary blue */
--telos-gold: #D4AF37;          /* Accent gold */
--telos-gray-light: #F5F7FA;    /* Light backgrounds */
```

### Custom Animations

Uses built-in animation classes:
- `animate-fade-in`
- `animate-fade-in-up`
- `animate-scale-in`
- `animation-delay-200`

### Responsive Design

Breakpoints:
- Mobile: < 768px
- Desktop: ≥ 768px

Mobile-specific features:
- Horizontal dot indicators instead of numbered circles
- Simplified navigation
- Touch-friendly buttons

## Accessibility

### ARIA Labels

```tsx
aria-label="Etapa X: Title"
aria-current="step" // for current step
```

### Keyboard Support

- Tab navigation through form fields
- Enter to submit/continue
- Focus indicators on all interactive elements

### Screen Reader Support

- Progress announcements
- Error message associations
- Clear button labels

## Performance Optimization

### Preventing Re-renders

```tsx
// Use useCallback for handlers
const handleKeyDown = useCallback((e: KeyboardEvent) => {
  // ...
}, [currentStep, isValidating, isSaving])
```

### Lazy Validation

Validation only runs when:
- User clicks "Próximo"
- User clicks "Finalizar"
- User presses Enter

Not on every keystroke, preventing performance issues.

## Common Patterns

### Multi-Field Validation

```tsx
validate: async () => {
  const errors = []

  if (!field1) errors.push("Field 1 required")
  if (!field2) errors.push("Field 2 required")
  if (field3 && !isValid(field3)) errors.push("Field 3 invalid")

  if (errors.length > 0) {
    showErrors(errors)
    return false
  }

  return true
}
```

### Conditional Fields

```tsx
fields: (
  <div className="space-y-4">
    <Checkbox
      checked={showAdditional}
      onChange={setShowAdditional}
    />

    {showAdditional && (
      <div className="space-y-4">
        {/* Additional fields */}
      </div>
    )}
  </div>
)
```

### API Integration

```tsx
onSave: async () => {
  try {
    await fetch('/api/patients', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
  } catch (error) {
    console.error("Save failed:", error)
    throw error // Will show error to user
  }
}
```

## Testing

### Manual Testing Checklist

- [ ] All steps navigate correctly
- [ ] Validation works on each step
- [ ] Error messages display properly
- [ ] Progress bar updates accurately
- [ ] Step indicators show correct status
- [ ] Keyboard navigation (Enter key)
- [ ] Summary dialog shows all steps
- [ ] Mobile responsive design
- [ ] Auto-save functionality
- [ ] Complete callback fires correctly

### Example Test Cases

```tsx
describe('RegistrationWizard', () => {
  it('should start at step 0', () => {
    // Test initial state
  })

  it('should not advance with invalid data', async () => {
    // Test validation blocking
  })

  it('should save on step change', async () => {
    // Test auto-save
  })

  it('should complete wizard', async () => {
    // Test completion flow
  })
})
```

## Troubleshooting

### Common Issues

**Problem**: Validation always fails
- Check that `validate()` returns a boolean
- Ensure async/await is used correctly
- Log validation errors for debugging

**Problem**: Auto-save not working
- Verify `onSave` is defined and async
- Check for errors in save function
- Ensure proper error handling

**Problem**: Progress bar not updating
- Verify `currentStep` state is updating
- Check that `onStepChange` is called correctly
- Ensure no state mutation issues

**Problem**: Keyboard navigation not working
- Check that event listeners are attached
- Verify no other handlers are preventing default
- Test with console logs in handleKeyDown

## Advanced Usage

### Custom Progress Indicators

You can customize the progress display by accessing the wizard state:

```tsx
const progressPercentage = ((currentStep + 1) / totalSteps) * 100
const completedCount = completedSteps.size
```

### Multi-Path Wizards

Implement conditional step flows:

```tsx
const getNextStep = (current: number) => {
  if (current === 2 && userData.skipStep3) {
    return 4 // Skip step 3
  }
  return current + 1
}
```

### Data Persistence

Load saved progress on mount:

```tsx
useEffect(() => {
  // Load from localStorage
  for (let i = 0; i < steps.length; i++) {
    const saved = localStorage.getItem(`step_${i}`)
    if (saved) {
      setStepData(i, JSON.parse(saved))
    }
  }
}, [])
```

## Migration Guide

### From Existing Forms

If you have an existing multi-step form:

1. **Extract Step Data**: Separate your form into logical steps
2. **Create Step Components**: Build individual step field components
3. **Add Validation**: Implement validate function for each step
4. **Configure Wizard**: Set up WizardStep[] array
5. **Handle Completion**: Move final submission to onComplete

## Best Practices

1. **Keep Steps Focused**: Each step should have a single purpose
2. **Validate Thoroughly**: Don't let users proceed with invalid data
3. **Provide Feedback**: Show loading states and success messages
4. **Save Progress**: Auto-save to prevent data loss
5. **Mobile First**: Test on mobile devices early
6. **Accessibility**: Use proper ARIA labels and keyboard support
7. **Error Recovery**: Allow users to go back and fix errors
8. **Clear Instructions**: Use descriptive titles and descriptions

## Support

For issues or questions:
1. Check this documentation
2. Review the example implementation
3. Examine the component source code
4. Check browser console for errors

## Version History

**v1.0.0** (Current)
- Initial release
- 8-step wizard support
- Full keyboard navigation
- Mobile responsive
- Auto-save functionality
- Summary dialog
- Telos.AI theming

## License

Part of the Telos.AI Post-Operative System
