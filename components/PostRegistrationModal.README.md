# PostRegistrationModal Component

A beautiful, interactive modal component that appears after a patient is successfully registered, allowing doctors to optionally assign the patient to an active research study.

## Location
`components/PostRegistrationModal.tsx`

## Features

### 1. Success Celebration
- Large checkmark icon with animated golden sparkles
- Personalized success message with patient name
- Smooth fade-in animations

### 2. Research Study Display
- Fetches active research studies from `/api/pesquisas`
- Shows research title, description, and patient count
- Displays surgery type when available
- Beautiful card-based layout

### 3. Research Group Selection
- Interactive group cards
- Shows group code, name, and description
- Displays current patient count per group
- Visual feedback for selected group
- Golden accent color for selection

### 4. User Actions
- **Skip**: Close modal without assignment
- **Cancel**: Close modal
- **Assign to Research**: Assign patient to selected group

### 5. Loading States
- Shows spinner while fetching research studies
- Disabled buttons during async operations
- Loading text feedback

### 6. Error Handling
- Toast notifications for errors
- Graceful handling of API failures
- Empty state when no active research exists

### 7. Responsive Design
- Works on mobile and desktop
- Scrollable content area
- Fixed header and footer

## Props

```typescript
interface PostRegistrationModalProps {
  isOpen: boolean              // Controls modal visibility
  onClose: () => void          // Called when modal is closed
  patientId: string            // ID of the registered patient
  patientName: string          // Full name of the patient
  onAssignSuccess?: () => void // Optional callback after successful assignment
}
```

## Usage Example

```tsx
import { useState } from 'react'
import { PostRegistrationModal } from '@/components/PostRegistrationModal'

export default function MyComponent() {
  const [showModal, setShowModal] = useState(false)
  const [patient, setPatient] = useState({ id: '', name: '' })

  const handleRegistration = async (data) => {
    // Register patient...
    const result = await registerPatient(data)

    // Show modal after success
    setPatient({ id: result.id, name: result.nome })
    setShowModal(true)
  }

  return (
    <>
      {/* Your form here */}

      <PostRegistrationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        patientId={patient.id}
        patientName={patient.name}
        onAssignSuccess={() => {
          console.log('Assignment successful!')
          // Refresh data, navigate, etc.
        }}
      />
    </>
  )
}
```

## API Integration

### Fetches Research Studies
**GET** `/api/pesquisas`

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "id": "research-id",
      "title": "Research Title",
      "description": "Research description",
      "surgeryType": "Ortopedia",
      "isActive": true,
      "totalPatients": 15,
      "groups": [
        {
          "id": "group-id",
          "groupCode": "A",
          "groupName": "Control Group",
          "description": "Standard treatment protocol",
          "patientCount": 7
        }
      ]
    }
  ]
}
```

### Assigns Patient to Research
**POST** `/api/paciente/[id]/pesquisa`

Request body:
```json
{
  "researchId": "research-id",
  "groupCode": "A"
}
```

Expected response:
```json
{
  "success": true,
  "message": "Patient successfully assigned to research group",
  "data": {
    "id": "patient-id",
    "isResearchParticipant": true,
    "researchGroup": "Research Title - Grupo A"
  }
}
```

## Design System

### Colors (Telos.AI Brand)
- **Primary Blue**: `#0A2647` - Deep blue
- **Medium Blue**: `#2C74B3` - Hover states
- **Dark Blue**: `#144272` - Gradients
- **Gold**: `#D4AF37` - Accents and highlights
- **Light Gray**: `#F5F7FA` - Backgrounds

### Components Used
- `Dialog` - Modal wrapper (shadcn/ui)
- `Button` - Action buttons
- `Card` - Research and group displays
- `Badge` - Labels and counts
- `Icons` - lucide-react

### Toast Notifications
Uses `sonner` for notifications:
- Success: When patient is assigned
- Error: When API calls fail
- Info: When user skips assignment

## Animations

1. **Dialog**: Fade-in and zoom effect
2. **Success Icon**: Pulsing gold glow
3. **Sparkles**: Bounce animation
4. **Loading**: Spinner rotation
5. **Hover**: Smooth color transitions
6. **Selection**: Border and background changes

## State Management

```typescript
const [researches, setResearches] = useState<Research[]>([])
const [selectedResearch, setSelectedResearch] = useState<Research | null>(null)
const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
const [isLoading, setIsLoading] = useState(false)
const [isAssigning, setIsAssigning] = useState(false)
```

## Validation

- Ensures research is selected before group selection
- Requires both research and group for assignment
- Shows error toast if validation fails
- Disables assign button when incomplete

## Accessibility

- Proper dialog semantics
- Keyboard navigation support
- Screen reader friendly labels
- Focus management
- Close on Escape key

## Error Scenarios Handled

1. **API Fetch Failure**: Shows error toast, allows retry
2. **No Active Research**: Shows empty state with helpful message
3. **Assignment Failure**: Shows error toast, keeps modal open
4. **Network Error**: Graceful error handling with user feedback

## Styling Highlights

### Gradient Buttons
```tsx
className="bg-gradient-to-r from-[#0A2647] to-[#144272]
           hover:from-[#144272] hover:to-[#205295]"
```

### Selected Research Card
```tsx
className="ring-2 ring-[#0A2647] bg-[#F5F7FA]"
```

### Selected Group
```tsx
className="border-[#D4AF37]
           bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5"
```

## Responsive Behavior

- **Desktop**: Full modal with scrollable content
- **Mobile**: Adapted layout, touch-friendly targets
- **Max Height**: 90vh with internal scrolling
- **Max Width**: 3xl (48rem)

## Best Practices

1. **Call after successful registration**: Only show modal after patient is saved
2. **Provide patient ID**: Always pass valid patient ID from registration
3. **Handle callbacks**: Use `onAssignSuccess` to refresh UI
4. **Clean state**: Modal resets state on close
5. **Toast setup**: Ensure Toaster component is in layout

## Dependencies

```json
{
  "lucide-react": "^0.553.0",
  "sonner": "^2.0.7",
  "@radix-ui/react-dialog": "latest",
  "class-variance-authority": "latest",
  "tailwind-merge": "latest",
  "clsx": "latest"
}
```

## File Structure
```
components/
├── PostRegistrationModal.tsx           # Main component
├── PostRegistrationModal.example.tsx   # Usage examples
├── PostRegistrationModal.README.md     # This file
└── ui/
    ├── dialog.tsx
    ├── button.tsx
    ├── card.tsx
    └── badge.tsx
```

## Testing Scenarios

1. **With Active Research**: Should display all active studies
2. **Without Research**: Should show empty state
3. **API Error**: Should show error toast
4. **Skip Action**: Should close without assignment
5. **Successful Assignment**: Should show success and callback
6. **Cancel Action**: Should close and reset state
7. **Loading States**: Should disable actions during fetch/post

## Troubleshooting

### Modal doesn't open
- Check `isOpen` prop is true
- Verify Dialog component is installed

### No research shown
- Check API endpoint `/api/pesquisas` is working
- Verify research studies exist and are active
- Check browser console for errors

### Assignment fails
- Verify API endpoint `/api/paciente/[id]/pesquisa` exists
- Check patient ID is valid
- Ensure research and group are selected
- Check network tab for response

### Toast not showing
- Verify Toaster component is in layout
- Check `sonner` is installed
- Import toast correctly

## Future Enhancements

- [ ] Add notes field for research assignment
- [ ] Show research criteria/requirements
- [ ] Add patient matching score
- [ ] Export assignment details
- [ ] Multi-language support
- [ ] Undo assignment option
- [ ] Email notification on assignment

## Support

For issues or questions:
1. Check the example file: `PostRegistrationModal.example.tsx`
2. Review API endpoints in `app/api/` directory
3. Check browser console for errors
4. Verify all dependencies are installed
