# Auto-Save System for Registration Wizard

A comprehensive, production-ready auto-save system for React forms and wizards.

## Quick Start

```tsx
import { useAutoSave } from "@/hooks/useAutoSave"
import { InlineAutoSaveIndicator } from "@/components/AutoSaveIndicator"

function MyForm() {
  const [formData, setFormData] = useState({ name: "", email: "" })

  const { isSaving, lastSaved, clearSaved } = useAutoSave(formData, {
    key: 'my-form',
    onRecover: (data) => setFormData(data),
  })

  return (
    <div>
      <InlineAutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
      {/* Your form fields */}
    </div>
  )
}
```

## Features

- **Auto-save debounced**: Saves after 2 seconds of inactivity
- **Save on blur**: Saves when leaving input fields
- **Save on step change**: For multi-step wizards
- **Auto-recovery**: Restores data on page reload
- **Visual feedback**: Real-time save indicators
- **Error handling**: Gracefully handles storage errors
- **TypeScript**: Full type safety
- **Zero dependencies**: Uses only React and browser APIs

## Files Created

```
hooks/
  └── useAutoSave.ts                       # Main hook

components/
  ├── AutoSaveIndicator.tsx                # Visual indicators
  ├── QuickPatientFormWithAutoSave.tsx     # Example: Quick form
  └── MultiStepWizardWithAutoSave.tsx      # Example: Wizard

app/
  └── demo-autosave/
      └── page.tsx                         # Interactive demo

types/
  └── autosave.d.ts                        # TypeScript types

docs/
  ├── AUTO_SAVE_INDEX.md                   # Navigation hub
  ├── AUTO_SAVE_SYSTEM.md                  # Complete docs
  ├── AUTO_SAVE_QUICK_REFERENCE.md         # Quick reference
  └── AUTO_SAVE_TESTING_GUIDE.md           # Testing guide

AUTO_SAVE_IMPLEMENTATION_SUMMARY.md        # Implementation summary
AUTO_SAVE_COMPLETE.md                      # Quick overview
```

## Documentation

- **[Complete Documentation](docs/AUTO_SAVE_SYSTEM.md)** - Full technical reference
- **[Quick Reference](docs/AUTO_SAVE_QUICK_REFERENCE.md)** - Fast lookup and examples
- **[Testing Guide](docs/AUTO_SAVE_TESTING_GUIDE.md)** - How to test the system
- **[Index](docs/AUTO_SAVE_INDEX.md)** - Central navigation hub

## Demo

Visit `/demo-autosave` to see the system in action with:
- Quick form example
- Multi-step wizard example
- Interactive testing

## API

### useAutoSave Hook

```typescript
interface AutoSaveOptions {
  key: string                      // Unique localStorage key
  debounceMs?: number             // Debounce delay (default: 2000ms)
  onSave?: (data: any) => void    // Callback after save
  onRecover?: (data: any) => void // Callback on recovery
}

interface AutoSaveReturn {
  isSaving: boolean       // Is currently saving
  lastSaved: Date | null  // Last save timestamp
  saveNow: () => void     // Force immediate save
  clearSaved: () => void  // Clear saved data
  getSavedData: () => any // Get saved data
}
```

### Components

**AutoSaveIndicator** - Basic indicator
```tsx
<AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
```

**InlineAutoSaveIndicator** - For card headers
```tsx
<InlineAutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
```

**FloatingAutoSaveIndicator** - Floating corner indicator
```tsx
<FloatingAutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
```

## Examples

### Simple Form

```tsx
const [formData, setFormData] = useState({ name: "", email: "" })

const { isSaving, lastSaved, saveNow, clearSaved } = useAutoSave(formData, {
  key: 'simple-form',
  onRecover: (data) => setFormData(data),
})

const handleSubmit = async () => {
  await submitToAPI(formData)
  clearSaved() // Clean up after success
}
```

### Multi-Step Wizard

```tsx
const [currentStep, setCurrentStep] = useState(1)
const [formData, setFormData] = useState({ /* ... */ })

const { saveNow } = useAutoSave(
  { ...formData, currentStep },
  {
    key: 'wizard',
    onRecover: (data) => {
      setFormData(data)
      setCurrentStep(data.currentStep || 1)
    },
  }
)

const nextStep = () => {
  saveNow() // Save before changing step
  setCurrentStep(prev => prev + 1)
}
```

## Testing

### Quick Test (2 minutes)
1. Visit `/demo-autosave`
2. Fill in some fields
3. Wait 2 seconds (see "Saved")
4. Reload page (F5)
5. Data should be recovered

See **[Testing Guide](docs/AUTO_SAVE_TESTING_GUIDE.md)** for comprehensive tests.

## Configuration

### Recommended Settings

| Use Case | debounceMs |
|----------|-----------|
| Simple form (3-5 fields) | 2000ms |
| Complex form (10+ fields) | 1500ms |
| Text editor | 1000ms |
| Multi-step wizard | 1500ms |

## Error Handling

The system handles:
- **QuotaExceededError** - localStorage full
- **Parse errors** - Invalid JSON
- **Version mismatch** - Schema changes
- **Disabled storage** - Incognito mode
- **Corrupted data** - Invalid data structure

All errors are gracefully handled with user-friendly messages.

## Browser Support

- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers

## Best Practices

**DO:**
- Clear saved data after successful submission
- Show visual feedback to users
- Use unique, descriptive keys
- Test recovery on page reload

**DON'T:**
- Save passwords or sensitive data
- Save payment information
- Mutate objects directly (use spread)
- Forget to implement `onRecover`

## Integration Example

Replace your existing form:

```tsx
// Before
import { QuickPatientForm } from "@/components/QuickPatientForm"
<QuickPatientForm onSubmit={handleSubmit} />

// After
import { QuickPatientFormWithAutoSave } from "@/components/QuickPatientFormWithAutoSave"
<QuickPatientFormWithAutoSave onSubmit={handleSubmit} autoSaveKey="patient-reg" />
```

## Saved Data Format

```json
{
  "version": "1.0.0",
  "timestamp": "2025-11-11T10:30:45.123Z",
  "data": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## Support

- **Problems?** Check [Quick Reference - Common Errors](docs/AUTO_SAVE_QUICK_REFERENCE.md)
- **Need help?** See [Testing Guide - Debugging](docs/AUTO_SAVE_TESTING_GUIDE.md)
- **Want examples?** View [Complete Docs - Examples](docs/AUTO_SAVE_SYSTEM.md)

## License

Part of Telos.AI post-operative care system.

## Version

**1.0.0** - Released 11/11/2025

---

**Ready to use in production!** Start with `/demo-autosave` to see it in action.
