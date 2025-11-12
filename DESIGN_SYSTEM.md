# Telos.AI Design System

> A comprehensive design language for medical professional software that combines trustworthiness, sophistication, and cutting-edge technology.

## Table of Contents

1. [Introduction](#introduction)
2. [Brand Philosophy](#brand-philosophy)
3. [Color Palette](#color-palette)
4. [Typography](#typography)
5. [Spacing System](#spacing-system)
6. [Grid System](#grid-system)
7. [Component Patterns](#component-patterns)
8. [Animation Principles](#animation-principles)
9. [Accessibility Standards](#accessibility-standards)
10. [Best Practices](#best-practices)

---

## Introduction

The Telos.AI Design System is built on three core principles:

1. **Medical Professional Aesthetic**: Clean, trustworthy, and sophisticated
2. **Purpose-Driven Design**: Every element serves the ultimate goal - better patient care
3. **Accessible by Default**: WCAG AA compliance minimum, AAA where possible

---

## Brand Philosophy

### Telos.AI Identity

**Telos** (Greek: τέλος) - Ultimate purpose, end goal, fulfillment

The brand represents the fusion of:
- **Technology**: AI-powered intelligence
- **Purpose**: Patient recovery and care
- **Excellence**: Gold standard in medical software

### Brand Colors Meaning

- **Deep Blue (#0A2647)**: Trust, professionalism, medical authority
- **Gold (#D4AF37)**: Excellence, achievement, premium quality
- **Purple (#7C3AED)**: Innovation, research, advanced technology

---

## Color Palette

### Primary Colors

#### Telos Blue
The foundation of our brand - representing trust and medical professionalism.

```css
--telos-blue-50:  #E6EBF2  /* Backgrounds, very subtle */
--telos-blue-100: #B3C5DB  /* Hover states, light backgrounds */
--telos-blue-200: #8099C4  /* Borders, dividers */
--telos-blue-300: #4D6CAD  /* Disabled states */
--telos-blue-400: #264E8D  /* Hover states */
--telos-blue-500: #0A2647  /* PRIMARY - Main brand color */
--telos-blue-600: #081E39  /* Pressed states */
--telos-blue-700: #06162B  /* Deep backgrounds */
--telos-blue-800: #040E1D  /* Footer, dark sections */
--telos-blue-900: #02070E  /* Maximum contrast */
```

**Usage Guidelines:**
- **500**: Primary buttons, headers, brand elements
- **600**: Hover states for primary buttons
- **50-200**: Backgrounds, borders, subtle UI elements
- **700-900**: Dark themes, footers, high-contrast text

#### Telos Gold
Accent color representing excellence and premium quality.

```css
--telos-gold-50:  #FBF8EF  /* Light backgrounds */
--telos-gold-100: #F5ECCC  /* Hover backgrounds */
--telos-gold-200: #EFE0A9  /* Borders */
--telos-gold-300: #E9D486  /* Subtle accents */
--telos-gold-400: #DFC75E  /* Active states */
--telos-gold-500: #D4AF37  /* ACCENT - Main gold */
--telos-gold-600: #B89630  /* Hover states */
--telos-gold-700: #8B7124  /* Text on light backgrounds */
--telos-gold-800: #5E4C18  /* Dark accents */
--telos-gold-900: #31260C  /* Maximum contrast */
```

**Usage Guidelines:**
- **500**: CTA buttons, badges, highlights, premium features
- **600**: Hover states for gold buttons
- **50-200**: Subtle highlights, success backgrounds
- **700-900**: Text, icons on light backgrounds

#### Telos Purple
Research and innovation accent - for data visualization and advanced features.

```css
--telos-purple-50:  #F3EEFB  /* Light backgrounds */
--telos-purple-100: #DCC9F3  /* Hover states */
--telos-purple-200: #C5A4EB  /* Borders */
--telos-purple-300: #AE7FE3  /* Subtle elements */
--telos-purple-400: #9760DB  /* Active states */
--telos-purple-500: #7C3AED  /* RESEARCH - Main purple */
--telos-purple-600: #6930CA  /* Hover states */
--telos-purple-700: #5626A7  /* Dark accents */
--telos-purple-800: #431C84  /* Deep purple */
--telos-purple-900: #301261  /* Maximum contrast */
```

**Usage Guidelines:**
- **500**: Research features, data viz, innovation badges
- **600**: Hover states
- **50-200**: Research section backgrounds
- Use sparingly - reserved for research-related features

### Semantic Colors

#### Success (Green)
```css
--telos-success-50:  #ECFDF5
--telos-success-500: #10B981  /* Main success color */
--telos-success-600: #059669  /* Hover state */
--telos-success-700: #047857  /* Dark variant */
```

**Usage**: Successful operations, completed follow-ups, positive health indicators

#### Warning (Amber)
```css
--telos-warning-50:  #FFFBEB
--telos-warning-500: #F59E0B  /* Main warning color */
--telos-warning-600: #D97706  /* Hover state */
--telos-warning-700: #B45309  /* Dark variant */
```

**Usage**: Pending actions, moderate risk indicators, attention needed

#### Error (Red)
```css
--telos-error-50:  #FEF2F2
--telos-error-500: #EF4444  /* Main error color */
--telos-error-600: #DC2626  /* Hover state */
--telos-error-700: #B91C1C  /* Dark variant */
```

**Usage**: Errors, high-risk alerts, critical notifications, validation errors

#### Info (Blue)
```css
--telos-info-50:  #EFF6FF
--telos-info-500: #3B82F6  /* Main info color */
--telos-info-600: #2563EB  /* Hover state */
--telos-info-700: #1D4ED8  /* Dark variant */
```

**Usage**: Informational messages, tooltips, help text

### Neutral Colors

```css
--telos-gray-50:  #F9FAFB  /* Page backgrounds */
--telos-gray-100: #F3F4F6  /* Card backgrounds */
--telos-gray-200: #E5E7EB  /* Borders */
--telos-gray-300: #D1D5DB  /* Disabled borders */
--telos-gray-400: #9CA3AF  /* Placeholder text */
--telos-gray-500: #6B7280  /* Secondary text */
--telos-gray-600: #4B5563  /* Body text */
--telos-gray-700: #374151  /* Headings */
--telos-gray-800: #1F2937  /* Dark text */
--telos-gray-900: #111827  /* Maximum contrast */
```

### Color Accessibility

All color combinations meet **WCAG AA** standards (4.5:1 for normal text, 3:1 for large text).

**Contrast Ratios:**
- Blue 500 on White: 13.5:1 (AAA)
- Gold 500 on Blue 500: 4.8:1 (AA)
- Gray 600 on White: 7.2:1 (AAA)
- White on Blue 500: 13.5:1 (AAA)

---

## Typography

### Font Families

#### Primary Font: Inter
Modern, professional sans-serif with excellent readability.

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**When to use**: Body text, UI elements, buttons, labels

#### Monospace Font: JetBrains Mono
For code, IDs, technical data.

```css
font-family: 'JetBrains Mono', 'Courier New', monospace;
```

**When to use**: Patient IDs, code snippets, technical identifiers

#### Brand Font: Georgia (Telos)
Serif font for brand "Telos" wordmark only.

```css
font-family: 'Georgia', 'Times New Roman', serif;
```

**When to use**: Only for "Telos" in brand logo

### Type Scale

Based on a 1.125 ratio (Major Second) for harmonious scaling.

```css
/* Display (Hero sections) */
--font-size-4xl: 3.5rem    /* 56px - Hero headlines */
--font-size-3xl: 3rem      /* 48px - Page titles */
--font-size-2xl: 2.25rem   /* 36px - Section headers */

/* Headings */
--font-size-xl:  1.875rem  /* 30px - Card titles */
--font-size-lg:  1.5rem    /* 24px - Subheadings */
--font-size-md:  1.25rem   /* 20px - Small headings */

/* Body */
--font-size-base: 1rem     /* 16px - Body text (DEFAULT) */
--font-size-sm:   0.875rem /* 14px - Secondary text */
--font-size-xs:   0.75rem  /* 12px - Captions, labels */
```

### Font Weights

```css
--font-light:      300  /* Rarely used */
--font-normal:     400  /* Body text */
--font-medium:     500  /* Emphasis, labels */
--font-semibold:   600  /* Headings, buttons */
--font-bold:       700  /* Strong emphasis */
--font-extrabold:  800  /* Hero text */
```

### Line Heights

```css
--leading-none:    1      /* Tight headlines */
--leading-tight:   1.25   /* Display text */
--leading-snug:    1.375  /* Headings */
--leading-normal:  1.5    /* Body text (DEFAULT) */
--leading-relaxed: 1.625  /* Long-form content */
--leading-loose:   2      /* Spacious text */
```

### Typography Usage Examples

```tsx
// Page Title
<h1 className="text-3xl font-bold text-telos-blue leading-tight">
  Dashboard
</h1>

// Section Header
<h2 className="text-2xl font-semibold text-telos-blue mb-4">
  Pacientes Ativos
</h2>

// Card Title
<h3 className="text-xl font-semibold text-gray-800">
  João da Silva
</h3>

// Body Text
<p className="text-base text-gray-600 leading-normal">
  Follow-up description...
</p>

// Caption
<span className="text-xs text-gray-500">
  Atualizado há 2 horas
</span>
```

---

## Spacing System

Based on **4px grid** for consistent, predictable spacing.

### Spacing Scale

```css
--space-0:   0px      /* No space */
--space-1:   4px      /* Tiny - icon gaps */
--space-2:   8px      /* Small - tight spacing */
--space-3:   12px     /* Compact - button padding */
--space-4:   16px     /* Default - standard spacing */
--space-5:   20px     /* Medium - card padding */
--space-6:   24px     /* Large - section spacing */
--space-8:   32px     /* XL - major sections */
--space-10:  40px     /* 2XL - page sections */
--space-12:  48px     /* 3XL - hero spacing */
--space-16:  64px     /* 4XL - major dividers */
--space-20:  80px     /* 5XL - page padding */
--space-24:  96px     /* 6XL - hero sections */
```

### Spacing Guidelines

**Component Internal Spacing:**
- Buttons: `px-4 py-2` (16px x 8px)
- Cards: `p-6` (24px all sides)
- Input fields: `px-3 py-2` (12px x 8px)

**Component Gaps:**
- Form fields: `gap-4` (16px)
- Card grids: `gap-6` (24px)
- Section dividers: `gap-8` (32px)

**Page Layout:**
- Page padding: `px-6` (24px mobile), `px-8` (32px desktop)
- Section spacing: `py-12` (48px mobile), `py-16` (64px desktop)

---

## Grid System

### Breakpoints

Following Tailwind CSS standard breakpoints:

```css
--screen-sm:  640px   /* Small tablets */
--screen-md:  768px   /* Tablets */
--screen-lg:  1024px  /* Small laptops */
--screen-xl:  1280px  /* Desktops */
--screen-2xl: 1536px  /* Large desktops */
```

### Container Widths

```css
/* Default container with responsive max-widths */
sm:  640px   (100% on mobile)
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

### Grid Columns

Use **12-column grid** for flexible layouts:

```tsx
// Two-column layout (desktop)
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

// Three-column cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card />
  <Card />
  <Card />
</div>

// Sidebar layout (8-4)
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
  <main className="lg:col-span-8">Main content</main>
  <aside className="lg:col-span-4">Sidebar</aside>
</div>
```

---

## Component Patterns

### Buttons

#### Primary Button
```tsx
<Button className="bg-telos-blue hover:bg-telos-blue-600 text-white">
  Cadastrar Paciente
</Button>
```

#### Gold CTA Button
```tsx
<Button className="bg-telos-gold hover:bg-telos-gold-600 text-white">
  Quero ser Founding Member
</Button>
```

#### Secondary Button
```tsx
<Button variant="outline" className="border-telos-blue text-telos-blue">
  Cancelar
</Button>
```

#### Danger Button
```tsx
<Button variant="destructive">
  Excluir
</Button>
```

#### Icon Button
```tsx
<Button size="icon" variant="ghost">
  <Settings className="h-4 w-4" />
</Button>
```

### Cards

#### Default Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Paciente: João Silva</CardTitle>
    <CardDescription>Colecistectomia - D+3</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card content */}
  </CardContent>
</Card>
```

#### Interactive Card (Hover)
```tsx
<Card className="hover-lift transition-smooth cursor-pointer">
  {/* Card content */}
</Card>
```

#### Highlighted Card
```tsx
<Card className="border-telos-gold border-2">
  {/* Premium/Important content */}
</Card>
```

### Badges

#### Status Badges
```tsx
{/* Active */}
<Badge className="bg-telos-success text-white">Ativo</Badge>

{/* Warning */}
<Badge className="bg-telos-warning text-white">Pendente</Badge>

{/* Error */}
<Badge className="bg-telos-error text-white">Alerta</Badge>

{/* Info */}
<Badge className="bg-telos-blue text-white">D+3</Badge>
```

#### Research Badges
```tsx
<Badge className="bg-telos-purple text-white">
  <FlaskConical className="h-3 w-3" />
  Grupo Controle
</Badge>
```

### Forms

#### Input Field
```tsx
<div className="space-y-2">
  <Label htmlFor="name">Nome do Paciente</Label>
  <Input
    id="name"
    placeholder="Digite o nome completo"
    className="focus:ring-telos-blue"
  />
</div>
```

#### Select Dropdown
```tsx
<Select>
  <SelectTrigger className="focus:ring-telos-blue">
    <SelectValue placeholder="Selecione..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Opção 1</SelectItem>
  </SelectContent>
</Select>
```

---

## Animation Principles

### Animation Duration

```css
--duration-fast:   150ms  /* Quick feedback */
--duration-base:   300ms  /* Standard transitions */
--duration-slow:   500ms  /* Complex animations */
--duration-slower: 700ms  /* Page transitions */
```

### Easing Functions

```css
--ease-out:     cubic-bezier(0, 0, 0.2, 1)     /* Default */
--ease-in:      cubic-bezier(0.4, 0, 1, 1)     /* Enter */
--ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1)   /* Both */
--ease-bounce:  cubic-bezier(0.68, -0.55, 0.27, 1.55)  /* Playful */
```

### Animation Classes

```css
/* Fade Animations */
.animate-fade-in        /* Fade in */
.animate-fade-in-up     /* Fade + slide up */
.animate-fade-in-down   /* Fade + slide down */

/* Hover Effects */
.hover-lift             /* Lift on hover */
.hover-glow             /* Glow effect */
.hover-scale            /* Scale up slightly */

/* Interactive States */
.transition-smooth      /* All properties smooth */
```

### Animation Guidelines

1. **Subtle by default**: Don't distract from content
2. **Fast feedback**: User interactions should feel instant (<150ms)
3. **Purposeful motion**: Every animation should serve a function
4. **Respect prefers-reduced-motion**: Disable for accessibility

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility Standards

### WCAG Compliance

**Minimum**: WCAG AA (4.5:1 for normal text, 3:1 for large text)
**Target**: WCAG AAA where feasible (7:1 for normal text)

### Focus Indicators

All interactive elements MUST have visible focus indicators:

```css
.focus-visible:ring-2
.focus-visible:ring-telos-blue
.focus-visible:ring-offset-2
```

Never use `outline: none` without replacing with visible alternative.

### Keyboard Navigation

- All interactive elements accessible via Tab
- Logical tab order (left-to-right, top-to-bottom)
- Skip links for main content
- Escape key closes modals/dialogs

### Screen Reader Support

```tsx
// Always include labels
<Label htmlFor="email">Email</Label>
<Input id="email" aria-describedby="email-error" />

// ARIA landmarks
<nav aria-label="Main navigation">
<main aria-label="Main content">
<aside aria-label="Sidebar">

// Status messages
<div role="status" aria-live="polite">
  Saving...
</div>

// Error messages
<div role="alert" aria-live="assertive">
  Error: Invalid email
</div>
```

### Color Independence

Never rely on color alone to convey information:

```tsx
// Bad
<Badge className="bg-red-500">High Risk</Badge>

// Good
<Badge className="bg-red-500">
  <AlertCircle className="h-3 w-3" />
  High Risk
</Badge>
```

---

## Best Practices

### 1. Consistency

- Use design tokens, not hardcoded values
- Follow component patterns
- Maintain spacing system
- Use semantic naming

### 2. Performance

- Optimize images (WebP, lazy loading)
- Minimize bundle size (tree-shaking)
- Use CSS transforms for animations (GPU-accelerated)
- Lazy load components when possible

### 3. Mobile-First

- Design for mobile first, enhance for desktop
- Touch targets minimum 44x44px
- Readable text without zooming (16px minimum)
- Test on real devices

### 4. Progressive Enhancement

- Core functionality works without JavaScript
- Enhanced features with JS enabled
- Graceful degradation for older browsers

### 5. Documentation

- Comment complex components
- Document prop types
- Include usage examples
- Maintain changelog

---

## Component Checklist

Before shipping a new component, ensure:

- [ ] Follows color palette
- [ ] Uses spacing system
- [ ] Typography scale applied
- [ ] Responsive design
- [ ] Keyboard accessible
- [ ] Screen reader tested
- [ ] Focus indicators visible
- [ ] WCAG AA contrast
- [ ] Animation respects prefers-reduced-motion
- [ ] Works without JavaScript (where possible)
- [ ] Tested on mobile device
- [ ] Documented with examples

---

## Resources

### Tools

- **Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Color Blindness Simulator**: https://www.color-blindness.com/coblis-color-blindness-simulator/
- **Lighthouse**: Built into Chrome DevTools
- **axe DevTools**: Browser extension for accessibility testing

### Documentation

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com/
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

### Figma Design File

Internal style guide available at: `/style-guide`

---

## Version History

- **v1.0.0** (2025-11-11): Initial design system documentation
  - Established color palette
  - Defined typography scale
  - Created spacing system
  - Documented component patterns
  - Set accessibility standards

---

**Maintained by**: Telos.AI Development Team
**Last Updated**: 2025-11-11
**Next Review**: Quarterly
