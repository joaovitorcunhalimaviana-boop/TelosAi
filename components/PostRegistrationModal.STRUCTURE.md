# PostRegistrationModal - Component Structure

## Visual Tree

```
PostRegistrationModal
│
├── Dialog (open={isOpen})
│   │
│   └── DialogContent (max-w-3xl, scrollable)
│       │
│       ├── DialogHeader (celebration section)
│       │   ├── Success Icon Container
│       │   │   ├── Animated blur background (gold)
│       │   │   ├── CheckCircle2 icon (large, blue)
│       │   │   └── Sparkles icon (animated bounce, gold)
│       │   │
│       │   ├── DialogTitle
│       │   │   └── "Paciente Cadastrado com Sucesso!"
│       │   │
│       │   └── DialogDescription
│       │       ├── Patient name (bold)
│       │       └── Optional research prompt
│       │
│       ├── Content Area (scrollable)
│       │   │
│       │   ├── Loading State
│       │   │   ├── Loader2 icon (spinning)
│       │   │   └── "Carregando pesquisas..."
│       │   │
│       │   ├── Empty State
│       │   │   ├── FlaskConical icon
│       │   │   └── "Nenhuma pesquisa ativa"
│       │   │
│       │   └── Research List
│       │       ├── Info banner
│       │       │   ├── Info icon
│       │       │   └── Selection instructions
│       │       │
│       │       └── Research Cards (map)
│       │           │
│       │           └── Card (clickable)
│       │               ├── CardHeader
│       │               │   ├── FlaskConical icon
│       │               │   ├── Research title
│       │               │   ├── Research description
│       │               │   ├── Surgery type badge (optional)
│       │               │   └── Patient count badge
│       │               │
│       │               └── CardContent (when selected)
│       │                   ├── Groups header
│       │                   │   ├── Users icon
│       │                   │   └── "Grupos de Pesquisa (N)"
│       │                   │
│       │                   └── Group Cards (map)
│       │                       └── Group Card (clickable)
│       │                           ├── Group code badge
│       │                           ├── Group name
│       │                           ├── Description
│       │                           ├── Patient count
│       │                           └── ChevronRight (when selected)
│       │
│       └── Footer (fixed)
│           ├── Skip Button
│           │   └── "Pular por Agora"
│           │
│           └── Action Buttons
│               ├── Cancel Button
│               │   └── "Cancelar"
│               │
│               └── Assign Button (gradient)
│                   ├── Users icon / Loader2 (loading)
│                   └── "Atribuir à Pesquisa"
```

## State Flow

```
Initial Load
    │
    ├── isOpen = true
    │   │
    │   └── Fetch researches from API
    │       │
    │       ├── isLoading = true
    │       │   └── Show spinner
    │       │
    │       └── isLoading = false
    │           │
    │           ├── researches.length > 0
    │           │   └── Show research cards
    │           │
    │           └── researches.length = 0
    │               └── Show empty state
    │
    ├── User selects research
    │   │
    │   ├── setSelectedResearch(research)
    │   ├── setSelectedGroup(null)
    │   └── Show groups in selected card
    │
    ├── User selects group
    │   │
    │   ├── setSelectedGroup(groupCode)
    │   ├── Highlight selected group
    │   └── Enable assign button
    │
    ├── User clicks "Assign"
    │   │
    │   └── Validation
    │       │
    │       ├── Valid (research + group selected)
    │       │   │
    │       │   ├── isAssigning = true
    │       │   ├── POST to /api/paciente/[id]/pesquisa
    │       │   │   │
    │       │   │   ├── Success
    │       │   │   │   ├── Show success toast
    │       │   │   │   ├── Call onAssignSuccess()
    │       │   │   │   └── Close modal
    │       │   │   │
    │       │   │   └── Error
    │       │   │       ├── Show error toast
    │       │   │       └── Keep modal open
    │       │   │
    │       │   └── isAssigning = false
    │       │
    │       └── Invalid
    │           └── Show error toast
    │
    ├── User clicks "Skip"
    │   │
    │   ├── Show info toast
    │   └── Close modal
    │
    └── User clicks "Cancel" or Close
        │
        └── Close modal
```

## Data Flow

```
API: /api/pesquisas
    │
    └── GET Request
        │
        └── Response
            │
            ├── Research[]
            │   ├── id
            │   ├── title
            │   ├── description
            │   ├── surgeryType
            │   ├── isActive
            │   ├── totalPatients
            │   └── groups[]
            │       ├── id
            │       ├── groupCode
            │       ├── groupName
            │       ├── description
            │       └── patientCount
            │
            └── Filter: isActive = true
                │
                └── setResearches(activeResearches)

API: /api/paciente/[id]/pesquisa
    │
    └── POST Request
        │
        ├── Body
        │   ├── researchId
        │   └── groupCode
        │
        └── Response
            │
            ├── Success
            │   ├── message
            │   └── updatedPatient
            │       ├── isResearchParticipant = true
            │       └── researchGroup = "Title - Grupo X"
            │
            └── Error
                └── error message
```

## Styling Architecture

```
Color System (Telos.AI)
│
├── Primary Blues
│   ├── Deep: #0A2647 (main brand)
│   ├── Dark: #144272 (gradients)
│   ├── Medium: #205295 (hover)
│   └── Light: #2C74B3 (accents)
│
├── Accent Gold
│   ├── Main: #D4AF37 (highlights)
│   └── Light: #E8C547 (shine)
│
└── Neutrals
    ├── White: #FFFFFF
    ├── Light Gray: #F5F7FA (backgrounds)
    └── Medium Gray: #E2E8F0 (borders)

Component Variants
│
├── Research Card
│   ├── Default: white bg, gray border
│   ├── Hover: blue border (#2C74B3)
│   └── Selected: blue ring, light bg (#F5F7FA)
│
├── Group Card
│   ├── Default: white bg, gray border
│   ├── Hover: blue border, gray bg
│   └── Selected: gold border, gold gradient bg
│
└── Buttons
    ├── Skip: ghost variant
    ├── Cancel: outline variant
    └── Assign: gradient (blue -> darker blue)
```

## Animation Timeline

```
Modal Open
    │
    ├── t=0ms: Overlay fade-in
    ├── t=100ms: Content zoom-in + fade-in
    ├── t=200ms: Success icon appears
    └── t=300ms: Sparkles bounce starts (infinite)

Success Icon
    │
    ├── Blur background: pulse (2s cycle)
    └── Sparkles: bounce (1s cycle)

User Interactions
    │
    ├── Card hover: 200ms transition (border, shadow)
    ├── Card select: instant ring + background
    ├── Button hover: 200ms transition (gradient shift)
    └── Button disabled: 150ms opacity transition

Loading States
    │
    ├── Loader2: rotate 360° (1s, linear, infinite)
    └── Button text: fade transition (200ms)

Toast Notifications
    │
    ├── Slide-in: 300ms from right
    ├── Display: 5000ms (configurable)
    └── Slide-out: 300ms to right
```

## Responsive Breakpoints

```
Mobile (< 640px)
    │
    ├── Dialog: max-w-[calc(100%-2rem)]
    ├── Single column layout
    ├── Larger touch targets (min 44px)
    └── Stacked buttons in footer

Tablet (640px - 1024px)
    │
    ├── Dialog: max-w-lg (32rem)
    ├── Two-column grid possible
    └── Side-by-side buttons

Desktop (> 1024px)
    │
    ├── Dialog: max-w-3xl (48rem)
    ├── Optimized card layout
    └── Enhanced hover effects
```

## Component Dependencies

```
External Libraries
├── react (hooks: useState, useEffect)
├── sonner (toast notifications)
└── lucide-react (icons)

UI Components (shadcn/ui)
├── Dialog (modal wrapper)
├── Button (actions)
├── Card (research/group display)
└── Badge (labels)

Utilities
├── cn (className merger)
└── API endpoints

Icons Used
├── CheckCircle2 (success)
├── Sparkles (celebration)
├── Users (groups, counts)
├── FlaskConical (research)
├── ChevronRight (selection indicator)
├── Loader2 (loading)
└── Info (instructions)
```

## Event Handlers

```
Modal Events
├── onOpenChange: handleClose()
└── onClose: props callback

Card Events
├── onClick (Research): setSelectedResearch()
└── onClick (Group): setSelectedGroup()

Button Events
├── Skip: handleSkip()
│   ├── Show info toast
│   └── handleClose()
│
├── Cancel: handleClose()
│   ├── Reset selectedResearch
│   ├── Reset selectedGroup
│   └── Call props.onClose()
│
└── Assign: handleAssignToResearch()
    ├── Validate selection
    ├── POST to API
    ├── Handle success/error
    └── Close on success

API Events
├── fetchResearches()
│   ├── GET /api/pesquisas
│   ├── Filter active
│   └── Update state
│
└── assignPatient()
    ├── POST /api/paciente/[id]/pesquisa
    ├── Update counts
    └── Return response
```

## TypeScript Interfaces

```typescript
PostRegistrationModalProps
├── isOpen: boolean
├── onClose: () => void
├── patientId: string
├── patientName: string
└── onAssignSuccess?: () => void (optional)

Research
├── id: string
├── title: string
├── description: string
├── surgeryType: string | null
├── isActive: boolean
├── groups: ResearchGroup[]
└── totalPatients: number

ResearchGroup
├── id: string
├── groupCode: string
├── groupName: string
├── description: string
└── patientCount: number
```

This structure provides a complete overview of how the PostRegistrationModal component is organized, how data flows through it, and how all parts work together.
