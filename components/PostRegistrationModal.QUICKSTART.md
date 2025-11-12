# PostRegistrationModal - Quick Start Guide

## 30-Second Integration

```tsx
import { PostRegistrationModal } from '@/components/PostRegistrationModal'

// In your component
const [showModal, setShowModal] = useState(false)
const [patient, setPatient] = useState({ id: '', name: '' })

// After successful registration
handleSuccess(newPatient) {
  setPatient({ id: newPatient.id, name: newPatient.nome })
  setShowModal(true)
}

// In JSX
<PostRegistrationModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  patientId={patient.id}
  patientName={patient.name}
/>
```

## What It Does

1. Shows celebration message after patient registration
2. Lists all active research studies
3. Lets doctor assign patient to a research group
4. Or skip and continue without assignment

## Key Features

- Beautiful Telos.AI branded design
- Automatic research fetching
- Smooth animations
- Toast notifications
- Mobile responsive
- Loading states
- Error handling

## Props Reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Show/hide modal |
| `onClose` | function | Yes | Close handler |
| `patientId` | string | Yes | Patient ID |
| `patientName` | string | Yes | Patient full name |
| `onAssignSuccess` | function | No | Success callback |

## User Flow

```
1. Modal opens with celebration
   ↓
2. Show active research studies
   ↓
3. User clicks a research study
   ↓
4. Groups for that research appear
   ↓
5. User selects a group
   ↓
6. User clicks "Assign" or "Skip"
   ↓
7. Modal closes
```

## API Endpoints Used

- **GET** `/api/pesquisas` - Fetch active studies
- **POST** `/api/paciente/[id]/pesquisa` - Assign to group

## Styling

- Primary: `#0A2647` (Deep Blue)
- Accent: `#D4AF37` (Gold)
- Success icon with animated sparkles
- Gradient buttons
- Smooth hover effects

## Dependencies

```bash
# Already installed in your project
- lucide-react (icons)
- sonner (toasts)
- shadcn/ui components
```

## Toast Setup Required

Make sure you have Toaster in your layout:

```tsx
import { Toaster } from 'sonner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

## Common Use Cases

### 1. Simple Usage (Skip Optional)
```tsx
<PostRegistrationModal
  isOpen={show}
  onClose={() => setShow(false)}
  patientId={id}
  patientName={name}
/>
```

### 2. With Success Callback
```tsx
<PostRegistrationModal
  isOpen={show}
  onClose={() => setShow(false)}
  patientId={id}
  patientName={name}
  onAssignSuccess={() => {
    refreshPatients()
    router.push('/dashboard/pesquisas')
  }}
/>
```

### 3. With Navigation After Close
```tsx
<PostRegistrationModal
  isOpen={show}
  onClose={() => {
    setShow(false)
    router.push('/dashboard/pacientes')
  }}
  patientId={id}
  patientName={name}
/>
```

## Validation

- Research must be selected before groups show
- Both research AND group must be selected to assign
- Skip button always available
- Shows helpful error messages

## States

| State | Description | Display |
|-------|-------------|---------|
| Loading | Fetching research | Spinner |
| Empty | No active research | Empty state message |
| Ready | Research available | Research cards |
| Assigning | Saving assignment | Disabled buttons + spinner |

## Error Handling

All errors show toast notifications:
- API fetch errors
- Network errors
- Validation errors
- Assignment failures

## Accessibility

- Keyboard navigation
- Screen reader friendly
- Focus management
- Semantic HTML
- Close on Escape

## Mobile Responsive

- Adapts to screen size
- Touch-friendly targets
- Scrollable content
- Proper spacing

## Testing Checklist

- [ ] Modal opens after registration
- [ ] Displays patient name correctly
- [ ] Fetches and shows research studies
- [ ] Groups appear when research selected
- [ ] Can select different groups
- [ ] Assign button disabled until both selected
- [ ] Skip button works
- [ ] Cancel button works
- [ ] Success assignment closes modal
- [ ] Error shows toast and keeps modal open
- [ ] Loading states work
- [ ] Empty state shows when no research
- [ ] Toast notifications appear
- [ ] Mobile layout works

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Modal won't open | Check `isOpen` prop is true |
| No research showing | Verify `/api/pesquisas` endpoint works |
| Can't assign | Ensure both research and group selected |
| No toasts | Add Toaster component to layout |
| API errors | Check browser console for details |

## Files Created

```
components/
├── PostRegistrationModal.tsx           (Main component - 371 lines)
├── PostRegistrationModal.README.md     (Full documentation)
├── PostRegistrationModal.example.tsx   (Integration examples)
├── PostRegistrationModal.STRUCTURE.md  (Component architecture)
└── PostRegistrationModal.QUICKSTART.md (This file)
```

## Next Steps

1. Import component in your patient registration page
2. Add state to control modal visibility
3. Pass patient data after successful registration
4. Optional: Add success callback for custom behavior
5. Test the full flow

## Support

- Check `PostRegistrationModal.example.tsx` for detailed examples
- See `PostRegistrationModal.README.md` for full documentation
- Review `PostRegistrationModal.STRUCTURE.md` for architecture details

---

**Ready to use!** The component is fully functional and styled to match your Telos.AI brand.
