# RegistrationWizard - Visual Design Guide

## Component Preview

The RegistrationWizard provides a professional, step-by-step registration experience with Telos.AI branding.

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    Progress Bar (Top)                        │
│  Etapa X de Y                              XX% concluído     │
│  ████████████████░░░░░░░░░░░░░░░░                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Step Indicators (Desktop Only)                  │
│                                                              │
│   ✓ ─────── ● ─────── ○ ─────── ○ ─────── ○               │
│   1         2         3         4         5                  │
│ (Done)   (Current) (Pending)(Pending)(Pending)              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Main Card                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  Step Title                           [Resumo] Button   │ │
│ │  Step description text here                             │ │
│ │  ─────────────────────────────────────────────────────  │ │
│ │                                                          │ │
│ │              Form Fields Section                         │ │
│ │                                                          │ │
│ │  [Input Field 1]                                        │ │
│ │  [Input Field 2]                                        │ │
│ │  [Input Field 3]                                        │ │
│ │                                                          │ │
│ │  ─────────────────────────────────────────────────────  │ │
│ │                                                          │ │
│ │  [◄ Voltar]                          [Próximo ►]        │ │
│ │                                                          │ │
│ │  Dica: Pressione Enter para continuar                   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Color Scheme

### Primary Colors
```
Telos Blue (Primary)     #0A2647  ███████
Telos Gold (Accent)      #D4AF37  ███████
Background               #FFFFFF  ███████
Light Gray               #F5F7FA  ███████
Border Gray              #E2E8F0  ███████
```

### State Colors
```
Success (Completed)      #0A2647  ███████  (Blue with checkmark)
Active (Current)         #D4AF37  ███████  (Gold border)
Pending                  #E2E8F0  ███████  (Light gray)
Error                    #DC2626  ███████  (Red)
```

## Step Status Indicators

### Desktop View
```
┌────┐
│ ✓  │  Completed Step (Blue background, white checkmark)
└────┘

┌────┐
│ ●  │  Current Step (Gold border, larger size)
└────┘

┌────┐
│ ○  │  Pending Step (Gray border, smaller)
└────┘
```

### Mobile View
```
████  ████  ██  ██  ██  (Progress dots)
 8px   12px  6px 6px 6px
Done  Current Pending
```

## Button States

### Voltar (Back) Button
```
Default:    [◄ Voltar]     White bg, blue border
Hover:      [◄ Voltar]     Light blue bg
Disabled:   [◄ Voltar]     Gray, 50% opacity
```

### Próximo (Next) Button
```
Default:    [Próximo ►]    Blue bg, white text
Hover:      [Próximo ►]    Darker blue bg
Loading:    [⟳ Validando...] Blue bg, spinner icon
```

### Finalizar (Complete) Button
```
Default:    [✓ Finalizar]  Gold bg, white text
Hover:      [✓ Finalizar]  Darker gold bg
Loading:    [⟳ Finalizando...] Gold bg, spinner icon
```

## Progress Bar

### States
```
0%    ░░░░░░░░░░░░░░░░░░░░░░░░
25%   ████░░░░░░░░░░░░░░░░░░░░
50%   ████████████░░░░░░░░░░░░
75%   ████████████████████░░░░
100%  ████████████████████████
```

### Animation
- Smooth CSS transition (300ms ease-in-out)
- Blue fill color (#0A2647)
- Light blue background (#0A2647 at 20% opacity)

## Error Display

```
┌─────────────────────────────────────────────────────┐
│  ⚠  Atenção                                         │
│     Por favor, corrija os erros antes de continuar. │
└─────────────────────────────────────────────────────┘

Colors:
- Background: #DC2626 at 10% opacity
- Border: #DC2626 at 50% opacity
- Icon: #DC2626
- Text: #DC2626 at 90% opacity
```

## Summary Dialog

```
┌─────────────────────────────────────────────────┐
│  Resumo do Cadastro                       ✕     │
│  Revise todas as informações inseridas          │
│  ───────────────────────────────────────────    │
│                                                  │
│  ┌──────────────────────────────────────┐       │
│  │ ✓  1. Dados Básicos                  │       │
│  │    Concluído                         │       │
│  └──────────────────────────────────────┘       │
│                                                  │
│  ┌──────────────────────────────────────┐       │
│  │ ●  2. Endereço (Current)             │       │
│  │    Em andamento                      │       │
│  └──────────────────────────────────────┘       │
│                                                  │
│  ┌──────────────────────────────────────┐       │
│  │ ○  3. Histórico Médico               │       │
│  │    Pendente                          │       │
│  └──────────────────────────────────────┘       │
│                                                  │
└─────────────────────────────────────────────────┘
```

## Responsive Breakpoints

### Mobile (< 768px)
- Single column layout
- Horizontal progress dots instead of circles
- Smaller padding (1.5rem)
- Stacked navigation buttons
- Hidden step titles (only numbers)

### Tablet (768px - 1024px)
- Two-column form fields where appropriate
- Full step indicators with circles
- Standard padding (2rem)
- Side-by-side navigation buttons

### Desktop (> 1024px)
- Multi-column form layouts
- Full visual indicators
- Maximum width: 1024px (centered)
- Spacious padding (2.5rem)

## Typography

### Step Title
```
Font: Geist Sans (system default)
Size: 1.5rem (24px)
Weight: 700 (Bold)
Color: #0A2647 (Telos Blue)
Line Height: 1.2
```

### Step Description
```
Font: Geist Sans
Size: 0.875rem (14px)
Weight: 400 (Regular)
Color: #64748B (Muted foreground)
Line Height: 1.5
```

### Progress Text
```
Font: Geist Sans
Size: 0.875rem (14px)
Weight: 500 (Medium)
Color: #0A2647 (Telos Blue)
```

### Button Text
```
Font: Geist Sans
Size: 0.875rem (14px)
Weight: 500 (Medium)
Letter Spacing: 0.02em
```

## Spacing Scale

```
Component Spacing:
- Gap between sections:     2rem (32px)
- Card padding:             2rem (32px)
- Button padding:           0.5rem 1.5rem
- Input field gap:          1rem (16px)
- Indicator gap:            0.5rem (8px)
```

## Animation Timing

```
Component Transitions:
- Step change:              300ms ease-in-out
- Progress bar:             300ms ease-in-out
- Button hover:             200ms ease
- Error appearance:         200ms ease-in
- Loading spinner:          800ms linear infinite

Keyframes:
- fadeIn:                   600ms ease-out
- fadeInUp:                 800ms ease-out
- scaleIn:                  500ms ease-out
```

## Shadow Hierarchy

```
Card Shadow:        0 4px 6px rgba(0,0,0,0.1)
Button Shadow:      0 1px 3px rgba(0,0,0,0.1)
Active Shadow:      0 8px 16px rgba(0,0,0,0.15)
Dialog Shadow:      0 20px 40px rgba(0,0,0,0.2)
```

## Interactive States

### Step Indicator (Desktop)
```
Default (Completed):
  Background: #0A2647
  Border: 2px solid #0A2647
  Icon: White checkmark
  Cursor: pointer
  Hover: scale(1.05)

Default (Current):
  Background: White
  Border: 2px solid #D4AF37
  Text: #D4AF37
  Size: scale(1.1)
  Shadow: 0 4px 12px rgba(212, 175, 55, 0.3)

Default (Pending):
  Background: White
  Border: 2px solid #E2E8F0
  Text: #94A3B8
  Cursor: not-allowed
```

### Buttons
```
Voltar:
  Default:  bg-white border-2 border-gray-300
  Hover:    bg-gray-50
  Active:   bg-gray-100
  Disabled: opacity-50 cursor-not-allowed

Próximo:
  Default:  bg-[#0A2647] text-white
  Hover:    bg-[#144272]
  Active:   bg-[#0A2647]/90
  Loading:  bg-[#0A2647] + spinner

Finalizar:
  Default:  bg-[#D4AF37] text-white
  Hover:    bg-[#C19A2F]
  Active:   bg-[#D4AF37]/90
  Loading:  bg-[#D4AF37] + spinner
```

## Accessibility

### ARIA Labels
```html
<button
  aria-label="Etapa 1: Dados Básicos"
  aria-current="step"
  role="tab"
/>
```

### Focus States
```
Focus Indicator:
  Ring: 2px solid #D4AF37
  Ring Offset: 2px
  Outline: 2px solid transparent
```

### Keyboard Navigation
```
Tab:        Focus next/previous element
Enter:      Advance to next step
Space:      Activate focused button
Escape:     Close dialogs
```

## Mobile-Specific Design

### Touch Targets
```
Minimum Touch Size: 44px × 44px
Button Height:      48px
Input Height:       48px
Step Dot Size:      12px (current: 16px)
```

### Mobile Progress Indicator
```
Container:
  display: flex
  justify-content: center
  gap: 6px

Dot (Completed):
  width: 32px
  height: 8px
  background: #0A2647
  border-radius: 4px

Dot (Current):
  width: 48px
  height: 8px
  background: #D4AF37
  border-radius: 4px

Dot (Pending):
  width: 24px
  height: 8px
  background: #E2E8F0
  border-radius: 4px
```

## Loading States

### Validation Loading
```
[⟳ Validando...]
Icon: Spinning circle (lucide-react Loader2)
Rotation: 360deg in 800ms
Color: White (on colored button)
```

### Save Loading
```
Text: "Salvando..."
Icon: Spinning loader
Position: Next to navigation buttons
Color: Muted foreground
```

### Complete Loading
```
[⟳ Finalizando...]
Button disabled: true
Background: Gold (#D4AF37)
Full-width spinner overlay: Optional
```

## Examples

### Step 1/8 - Beginning
```
Progress: 12.5% (████░░░░░░░░░░░░░░░░░░░░░░░░)
Indicators: ● ─── ○ ─── ○ ─── ○ ─── ○ ─── ○ ─── ○ ─── ○
Back Button: Disabled
Next Button: Enabled (blue)
```

### Step 4/8 - Middle
```
Progress: 50% (████████████████░░░░░░░░░░░░)
Indicators: ✓ ─── ✓ ─── ✓ ─── ● ─── ○ ─── ○ ─── ○ ─── ○
Back Button: Enabled
Next Button: Enabled (blue)
```

### Step 8/8 - End
```
Progress: 100% (████████████████████████████████)
Indicators: ✓ ─── ✓ ─── ✓ ─── ✓ ─── ✓ ─── ✓ ─── ✓ ─── ●
Back Button: Enabled
Next Button: Changed to "Finalizar" (gold)
```

## Design Tokens

```css
/* Colors */
--wizard-primary: #0A2647;
--wizard-accent: #D4AF37;
--wizard-background: #FFFFFF;
--wizard-muted: #F5F7FA;
--wizard-border: #E2E8F0;
--wizard-error: #DC2626;

/* Spacing */
--wizard-gap-sm: 0.5rem;    /* 8px */
--wizard-gap-md: 1rem;      /* 16px */
--wizard-gap-lg: 2rem;      /* 32px */
--wizard-gap-xl: 3rem;      /* 48px */

/* Sizes */
--wizard-indicator-size: 40px;
--wizard-indicator-current: 44px;
--wizard-dot-height: 8px;
--wizard-button-height: 40px;

/* Animations */
--wizard-transition-fast: 200ms;
--wizard-transition-base: 300ms;
--wizard-transition-slow: 500ms;

/* Typography */
--wizard-font-title: 1.5rem;
--wizard-font-body: 0.875rem;
--wizard-font-small: 0.75rem;
```

## Best Practices

### Visual Hierarchy
1. **Progress bar** - Most prominent, always visible
2. **Step title** - Large, bold, draws attention
3. **Step indicators** - Secondary navigation aid
4. **Form fields** - Main interactive area
5. **Navigation buttons** - Clear call-to-action

### Color Usage
- **Blue (#0A2647)**: Primary actions, completed states
- **Gold (#D4AF37)**: Current state, final action
- **Gray**: Pending states, disabled elements
- **Red**: Errors, warnings

### Spacing Rhythm
- Consistent 8px baseline grid
- Generous whitespace around form fields
- Clear section separation
- Breathing room for buttons

### Responsive Strategy
1. Mobile-first approach
2. Progressive enhancement
3. Touch-friendly targets
4. Simplified UI on small screens

---

**Design System**: Telos.AI
**Version**: 1.0.0
**Last Updated**: 2025-11-11
