# 🎯 Tutorial System - Quick Reference Card

## 🚀 Quick Start

```tsx
// 1. Trigger a tutorial programmatically
import { useTutorial } from '@/components/tutorial/TutorialProvider';
const { startTutorial } = useTutorial();
startTutorial('dashboard-tour');

// 2. Add tutorial trigger button
import { TutorialTrigger } from '@/components/tutorial/TutorialTrigger';
<TutorialTrigger tutorialId="dashboard-tour" variant="icon" />

// 3. Add contextual help
import { ContextualHelp } from '@/components/tutorial/ContextualHelp';
<ContextualHelp description="Quick help text" tutorialId="statistical-analysis" />
```

---

## 📚 Available Tutorials

| ID | Name | Category | Steps | Time |
|----|------|----------|-------|------|
| `dashboard-tour` | Tour pelo Dashboard | Básico | 8 | 3 min |
| `patient-registration` | Cadastro de Pacientes | Básico | 6 | 3 min |
| `patient-management` | Gestão de Pacientes | Básico | 8 | 4 min |
| `research-creation` | Criação de Pesquisas | Pesquisas | 9 | 8 min |
| `research-assignment` | Adicionar Pacientes | Pesquisas | 4 | 3 min |
| `statistical-analysis` | Análise Estatística | Estatísticas | 12 | 12 min |
| `data-export` | Exportação de Dados | Exportação | 5 | 5 min |

---

## 🎨 Component Variants

### TutorialTrigger
```tsx
// Icon (?) button
<TutorialTrigger tutorialId="..." variant="icon" />

// Full button
<TutorialTrigger tutorialId="..." variant="button" label="Ver Tutorial" />

// Inline link
<TutorialTrigger tutorialId="..." variant="inline" label="Ajuda?" />
```

### ContextualHelp
```tsx
// Simple tooltip
<ContextualHelp description="Help text" />

// With tutorial link
<ContextualHelp description="..." tutorialId="statistical-analysis" />

// Inline help block
<InlineHelp title="..." description="..." tutorialId="..." />

// Full help section
<HelpSection title="..." description="..." tips={[...]} tutorialId="..." />
```

### Pre-configured Statistical Help
```tsx
<StatisticalHelp.P_VALUE />
<StatisticalHelp.ANOVA_F />
<StatisticalHelp.COHENS_D />
<StatisticalHelp.R_SQUARED />
<StatisticalHelp.CONFIDENCE_INTERVAL />
<StatisticalHelp.POST_HOC />
<StatisticalHelp.KAPLAN_MEIER />
```

---

## 🔧 Adding data-tour Attributes

```tsx
// Add to any element you want highlighted in tutorial
<div data-tour="my-element-id">
  Content
</div>

// Common IDs already in use:
data-tour="dashboard-stats"          // Stats overview
data-tour="stats-today-surgeries"    // Today's surgeries card
data-tour="stats-active-patients"    // Active patients card
data-tour="stats-followups-today"    // Follow-ups card
data-tour="stats-critical-alerts"    // Critical alerts card
data-tour="search-filters"           // Filters section
data-tour="new-patient-btn"          // New patient button
data-tour="research-btn"             // Research button
data-tour="patient-card"             // Patient card
```

---

## 📊 Using Analytics

```tsx
const {
  isTutorialCompleted,      // Check if specific tutorial done
  isOnboardingComplete,      // Check if basic tutorials done
  getCompletionRate,         // Get 0-100% completion
  getSuggestedTutorial,      // Get next recommended tutorial
  isFirstTimeUser,           // Check if brand new user
  resetTutorial,             // Reset single tutorial
  resetTutorials,            // Reset all tutorials
} = useTutorial();

// Examples:
const isDone = isTutorialCompleted('dashboard-tour');
const progress = getCompletionRate(); // e.g., 42.85
const nextUp = getSuggestedTutorial(); // e.g., 'patient-registration'
```

---

## 🎯 Common Use Cases

### 1. Add tutorial to page header
```tsx
<div className="flex items-center gap-3">
  <h1>Page Title</h1>
  <TutorialTrigger tutorialId="my-tutorial" variant="icon" />
</div>
```

### 2. Add help to complex feature
```tsx
<div className="flex items-center gap-2">
  <label>P-value</label>
  <StatisticalHelp.P_VALUE />
</div>
```

### 3. Show help section at page top
```tsx
<HelpSection
  title="About this Page"
  description="This page allows you to..."
  tutorialId="relevant-tutorial"
/>
```

### 4. Create onboarding flow
```tsx
useEffect(() => {
  if (isFirstTimeUser()) {
    startTutorial('dashboard-tour');
  }
}, []);
```

---

## 🧪 Testing Commands

```javascript
// Browser console commands:

// View all analytics
JSON.parse(localStorage.getItem('telos_tutorial_analytics'))

// Reset all tutorials (test first-time experience)
localStorage.removeItem('telos_tutorial_analytics')

// Check specific tutorial completion
const analytics = JSON.parse(localStorage.getItem('telos_tutorial_analytics'));
console.log(analytics.tutorials['dashboard-tour']);
```

---

## 📁 Key Files

| File | Purpose | Lines |
|------|---------|-------|
| `lib/tutorial-steps.ts` | Tutorial definitions | 635 |
| `lib/tutorial-analytics.ts` | Progress tracking | 238 |
| `components/tutorial/TutorialProvider.tsx` | Context & driver.js | 264 |
| `components/tutorial/TutorialTrigger.tsx` | Trigger buttons | 90 |
| `components/tutorial/OnboardingChecklist.tsx` | Checklist widget | 230 |
| `components/tutorial/ContextualHelp.tsx` | Help tooltips | 284 |
| `app/dashboard/ajuda/page.tsx` | Help Center | 389 |

---

## 🔗 Important Routes

- `/dashboard` - Auto-triggers tour for new users
- `/dashboard/ajuda` - Help Center (all tutorials)
- `/cadastro` - Patient registration (has tutorial)
- `/dashboard/pesquisas` - Research page (has tutorials)

---

## 🎨 Brand Colors Used

```css
Primary: #0A2647 (Navy Blue)
Accent: #D4AF37 (Gold)
Success: #10B981 (Green)
Info: #3B82F6 (Blue)
Warning: #F59E0B (Orange)
Error: #EF4444 (Red)
```

---

## ⚡ Performance

- Bundle size: ~6KB (driver.js)
- Auto-trigger delay: 1.5s
- Animation duration: 0.3s
- Tutorial data: localStorage (< 1KB)

---

## ✅ Checklist for Adding New Tutorial

- [ ] Define tutorial in `lib/tutorial-steps.ts`
- [ ] Add to `allTutorials` array
- [ ] Update `TutorialId` type
- [ ] Add `data-tour` attributes to page elements
- [ ] Add TutorialTrigger button to page
- [ ] Test tutorial flow
- [ ] Update Help Center metadata

---

## 🆘 Emergency Fixes

**Tutorial not showing?**
```tsx
// 1. Check element exists
document.querySelector('[data-tour="element-id"]')

// 2. Force start tutorial
import { driver } from 'driver.js';
const driverObj = driver({ steps: [...] });
driverObj.drive();
```

**Analytics broken?**
```javascript
// Reset and start fresh
localStorage.removeItem('telos_tutorial_analytics');
window.location.reload();
```

**Auto-trigger too aggressive?**
```typescript
// In TutorialProvider.tsx, change delay:
setTimeout(() => { startTutorial('dashboard-tour'); }, 5000); // 5s instead of 1.5s
```

---

**Last Updated:** 2025-11-11
**Version:** 1.0.0
**Status:** ✅ Production Ready
