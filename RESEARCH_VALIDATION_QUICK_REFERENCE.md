# Research Field Validation - Quick Reference

## Quick Start

### For Research Participants
When a patient is marked as `isResearchParticipant: true`, the system automatically:
1. Shows red "Obrigatório para pesquisa" badges on required fields
2. Displays progress tracking card on edit page
3. Shows warning on dashboard if data incomplete
4. Enables "Pesquisa - Dados Incompletos" filter

### Required Fields (Total: 22 fields)

#### Dados Básicos (7 fields)
```
✓ Nome Completo
✓ Data de Nascimento
✓ Idade (auto-calculated)
✓ Sexo
✓ Telefone/WhatsApp
✓ Email
✓ CPF
```

#### Cirurgia (3 fields)
```
✓ Tipo de Cirurgia
✓ Data da Cirurgia
✓ Hospital
```

#### Comorbidades (1 field)
```
✓ Pelo menos uma comorbidade OU "Nenhuma"
```

#### Medicações (1 field)
```
✓ Pelo menos uma medicação OU "Nenhuma"
```

#### Detalhes Cirúrgicos (1 field)
```
✓ Técnica cirúrgica detalhada
```

#### Pré-Operatório (1 field)
```
✓ Informações de preparo intestinal
```

#### Anestesia (2 fields)
```
✓ Tipo de anestesia
✓ Detalhes da anestesia
```

#### Prescrição (1 field)
```
✓ Medicações pós-operatórias
```

## Code Snippets

### Validate Patient Data
```typescript
import { validateResearchFields } from '@/lib/research-field-validator'

const validation = validateResearchFields(patientData)
console.log(`Complete: ${validation.isComplete}`)
console.log(`Progress: ${validation.percentComplete}%`)
console.log(`Missing: ${validation.missingFields.length} fields`)
```

### Show Progress Component
```tsx
import { ResearchCompletionProgress } from '@/components/ResearchCompletionProgress'

<ResearchCompletionProgress
  validation={validation}
  isResearchParticipant={true}
  showDetails={true}
/>
```

### Add Required Badge
```tsx
import { ResearchRequiredIndicator } from '@/components/ResearchRequiredBadge'

<Label>
  Field Name <ResearchRequiredIndicator isResearchParticipant={true} />
</Label>
```

### Filter Dashboard
```typescript
// Show only research patients with incomplete data
const filters = {
  dataStatus: "research-incomplete"
}
const patients = await getDashboardPatients(filters)
```

## Dashboard Indicators

### Patient Card - Complete
```
┌─────────────────────────────────────┐
│ João Silva                    NOVO  │
│ Hemorroidectomia  D+3  Ativo        │
│ Grupo A                             │
│                                     │
│ ✓ Dados de Pesquisa Completos      │
│ 22/22 campos obrigatórios          │
└─────────────────────────────────────┘
```

### Patient Card - Incomplete
```
┌─────────────────────────────────────┐
│ Maria Santos                  NOVO  │
│ Fístula  D+1  Ativo                │
│ Grupo B                             │
│                                     │
│ ⚠ Dados de Pesquisa Incompletos    │
│ Faltam 5 campos obrigatórios       │
│ [Ver detalhes] [Completar]         │
└─────────────────────────────────────┘
```

## Edit Page - Progress Card

### Incomplete (Example: 68%)
```
╔═══════════════════════════════════════════════════╗
║ 🧪 Campos Obrigatórios para Pesquisa      ⚠     ║
║                                                   ║
║ 15 / 22 completos    68%                         ║
║ ████████████░░░░░░░░░░░░                         ║
║                                                   ║
║ ⚠ Este paciente está em pesquisa científica     ║
║   Faltam 7 campos obrigatórios                   ║
║                                                   ║
║ [▼ Ver campos faltantes (7)]                     ║
║                                                   ║
║ Dados Básicos                           [2]      ║
║ • Email                      [Preencher]         ║
║ • CPF                        [Preencher]         ║
║                                                   ║
║ Detalhes Cirúrgicos                     [1]      ║
║ • Técnica cirúrgica          [Preencher]         ║
║                                                   ║
║ ... (other categories)                           ║
╚═══════════════════════════════════════════════════╝
```

### Complete (100%)
```
╔═══════════════════════════════════════════════════╗
║ 🧪 Campos Obrigatórios para Pesquisa      ✓     ║
║                                                   ║
║ 22 / 22 completos    100%                        ║
║ ██████████████████████████████                   ║
║                                                   ║
║ ✓ Todos os campos obrigatórios foram            ║
║   preenchidos!                                   ║
║   Este paciente está pronto para inclusão       ║
║   na pesquisa.                                   ║
╚═══════════════════════════════════════════════════╝
```

## Filter Usage

### Dashboard Filters
```
Tipo de Cirurgia:    [Todos os tipos ▼]
Status do Cadastro:  [Pesquisa - Dados Incompletos ▼]
Período:             [Todos os períodos ▼]
```

### Active Filter Display
```
Filtros ativos:  [🧪 Pesquisa Incompleta] [x Limpar]
```

## API Response Structure

### PatientCard (with validation)
```typescript
{
  id: "cuid",
  patientName: "João Silva",
  surgeryType: "hemorroidectomia",
  isResearchParticipant: true,
  researchGroup: "A",
  researchDataComplete: false,          // ← NEW
  researchMissingFieldsCount: 5,        // ← NEW
  // ... other fields
}
```

### ValidationResult
```typescript
{
  isComplete: false,
  totalFields: 22,
  completedFields: 17,
  percentComplete: 77,
  missingFields: [
    {
      category: "Dados Básicos",
      field: "email",
      label: "Email",
      value: null,
      isFilled: false
    },
    // ... more missing fields
  ],
  missingByCategory: {
    "Dados Básicos": [...],
    "Detalhes Cirúrgicos": [...]
  }
}
```

## Common Patterns

### Check Single Field
```typescript
import { isFieldRequiredForResearch } from '@/lib/research-field-validator'

if (isFieldRequiredForResearch('email')) {
  // Show required indicator
}
```

### Get Category Status
```typescript
import { getCategoryCompletion } from '@/lib/research-field-validator'

const status = getCategoryCompletion(patientData, 'dadosBasicos')
console.log(`${status.completed}/${status.total} complete`)
```

### Auto-scroll to Missing Field
```typescript
import { getFirstMissingFieldId } from '@/lib/research-field-validator'

const firstMissing = getFirstMissingFieldId(validation)
if (firstMissing) {
  document.getElementById(firstMissing)?.scrollIntoView({ behavior: 'smooth' })
}
```

## Color Coding

### Progress Indicators
- 🟢 **Green (80-100%)**: "Quase lá!" - Nearly complete
- 🟡 **Yellow (40-79%)**: "Bom progresso" - Making progress
- 🔴 **Red (0-39%)**: "Precisa completar" - Needs attention

### Badges
- 🔴 **Red**: "Obrigatório para pesquisa"
- 🟣 **Purple**: "Grupo A/B/C" (research group)
- 🟡 **Gold**: "NOVO" (new patient)
- 🔵 **Blue**: General information

## Keyboard Shortcuts

When on edit page:
- Click field name → Auto-scroll to field
- Tab through required fields
- ESC to collapse missing fields list

## Best Practices

### For Doctors
1. Filter by "Pesquisa - Dados Incompletos" weekly
2. Complete all research fields before marking surgery complete
3. Use the progress card to track completion
4. Click "Preencher" to jump directly to missing fields

### For Developers
1. Always pass `isResearchParticipant` prop to sections
2. Validate on both client (instant) and server (authoritative)
3. Cache validation results in dashboard queries
4. Use provided components (don't recreate validation logic)

## Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| Badge not showing | Check `isResearchParticipant` prop |
| Progress at 0% | Verify patient data structure |
| Filter not working | Check `dataStatus: "research-incomplete"` |
| Can't scroll to field | Ensure field ID matches pattern |

## Files Reference

| File | Purpose |
|------|---------|
| `lib/research-field-validator.ts` | Core validation logic |
| `components/ResearchCompletionProgress.tsx` | Progress display |
| `components/ResearchRequiredBadge.tsx` | Required indicators |
| `app/paciente/[id]/editar/page.tsx` | Edit page with validation |
| `app/dashboard/DashboardClient.tsx` | Dashboard with warnings |
| `app/dashboard/actions.ts` | Server-side validation |

---

**Need Help?** See full documentation in `RESEARCH_FIELD_VALIDATION.md`
