# Research Field Validation System

## Overview

This system enforces mandatory field completion for research participants in the surgical follow-up system. It provides visual indicators, progress tracking, validation, and dashboard integration to ensure all required research data is collected.

## Features Implemented

### 1. Visual Indicators

#### Research Required Badge
- **Component**: `ResearchRequiredBadge.tsx`
- **Location**: Replaces standard asterisks on field labels
- **Display**: Red badge with flask icon: "Obrigatório para pesquisa"
- **Usage**: Only shown when `isResearchParticipant === true`

#### Progress Bar
- **Component**: `ResearchCompletionProgress.tsx`
- **Display**: Shows "X/Y completos" with percentage
- **Colors**:
  - Green (100%): Complete
  - Yellow (70-99%): Nearly complete
  - Red (<70%): Needs attention

### 2. Required Fields for Research

The system validates these categories:

#### Dados Básicos
- Nome Completo
- Data de Nascimento
- Idade
- Sexo
- Telefone/WhatsApp
- Email
- CPF

#### Cirurgia
- Tipo de Cirurgia
- Data da Cirurgia
- Hospital

#### Comorbidades
- At least one comorbidity OR "Nenhuma" marked

#### Medicações
- At least one medication OR "Nenhuma" marked

#### Detalhes Cirúrgicos
- Technique details (varies by surgery type)

#### Pré-Operatório
- Intestinal preparation information

#### Anestesia
- Type of anesthesia
- Details about anesthesia administration

#### Prescrição Pós-Operatória
- Post-operative medications

### 3. Validation System

#### Core Validator
- **File**: `lib/research-field-validator.ts`
- **Function**: `validateResearchFields(patientData)`
- **Returns**: `ValidationResult` object with:
  - `isComplete`: boolean
  - `totalFields`: number
  - `completedFields`: number
  - `percentComplete`: number (0-100)
  - `missingFields`: Array of missing field objects
  - `missingByCategory`: Grouped by category

#### Field Detection
```typescript
// Check if field is required
isFieldRequiredForResearch(fieldPath: string): boolean

// Get category completion
getCategoryCompletion(patientData, category): {
  completed: number,
  total: number,
  percentage: number,
  isCategoryComplete: boolean
}

// Get first missing field for auto-scroll
getFirstMissingFieldId(validation): string | null
```

### 4. Dashboard Integration

#### Patient Cards
- **Warning Badge**: Shows when research data incomplete
- **Display**: "Dados de Pesquisa Incompletos"
- **Count**: Shows number of missing fields
- **Example**: "Faltam 3 campos obrigatórios para pesquisa"

#### Filter Option
- **Label**: "Pesquisa - Dados Incompletos"
- **Value**: `dataStatus: "research-incomplete"`
- **Behavior**: Shows only research participants with missing required fields
- **Implementation**: Post-query filter in `getDashboardPatients()`

#### Active Filters Display
- Shows badge when research-incomplete filter is active
- Includes flask icon for visual identification

### 5. Edit Page Enhancement

#### Progress Card
- **Position**: Above main form tabs
- **Features**:
  - Overall completion percentage
  - Missing fields count
  - Expandable list of missing fields grouped by category
  - Click-to-scroll functionality
  - Success message when complete

#### Section Updates
- All edit sections now accept `isResearchParticipant` prop
- Required fields show research badge when participant
- Standard asterisk shown for non-participants

#### Auto-Scroll
```typescript
onFieldClick={(fieldId) => {
  const element = document.getElementById(fieldId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    element.focus()
  }
}}
```

## Usage Examples

### Check if Patient Data is Complete

```typescript
import { validateResearchFields } from '@/lib/research-field-validator'

const validation = validateResearchFields(patientData)

if (validation.isComplete) {
  console.log('All research fields complete!')
} else {
  console.log(`Missing ${validation.missingFields.length} fields`)
  console.log('Missing by category:', validation.missingByCategory)
}
```

### Display Progress Component

```tsx
import { ResearchCompletionProgress } from '@/components/ResearchCompletionProgress'

<ResearchCompletionProgress
  validation={researchValidation}
  isResearchParticipant={patient.isResearchParticipant}
  showDetails={true}
  onFieldClick={(fieldId) => {
    // Scroll to field
    document.getElementById(fieldId)?.scrollIntoView()
  }}
/>
```

### Add Required Badge to Field

```tsx
import { ResearchRequiredIndicator } from '@/components/ResearchRequiredBadge'

<Label htmlFor="name">
  Nome Completo <ResearchRequiredIndicator isResearchParticipant={isResearchParticipant} />
</Label>
```

### Filter Dashboard for Incomplete Research Data

```typescript
// In dashboard filters
const filters: DashboardFilters = {
  dataStatus: "research-incomplete"
}

const patients = await getDashboardPatients(filters)
// Returns only research participants with missing required fields
```

## Database Schema Updates

### PatientCard Interface (actions.ts)
```typescript
export interface PatientCard {
  // ... existing fields
  isResearchParticipant: boolean
  researchGroup: string | null
  researchDataComplete: boolean        // NEW
  researchMissingFieldsCount: number   // NEW
}
```

### DashboardFilters Interface
```typescript
export interface DashboardFilters {
  surgeryType?: SurgeryType | "all"
  dataStatus?: "all" | "incomplete" | "complete" | "research-incomplete" // UPDATED
  period?: "today" | "7days" | "30days" | "all"
  search?: string
}
```

## Components Created

### 1. ResearchFieldValidator (`lib/research-field-validator.ts`)
- Core validation logic
- Field requirement definitions
- Completion calculation
- Missing field identification

### 2. ResearchCompletionProgress (`components/ResearchCompletionProgress.tsx`)
- Progress display card
- Missing fields list
- Category breakdown
- Auto-scroll functionality

### 3. ResearchRequiredBadge (`components/ResearchRequiredBadge.tsx`)
- Required field indicator
- Research-specific styling
- Conditional display

## Files Modified

### 1. Patient Edit Page (`app/paciente/[id]/editar/page.tsx`)
- Added research validation state
- Integrated progress component
- Pass `isResearchParticipant` to sections
- Auto-scroll implementation

### 2. Dashboard Client (`app/dashboard/DashboardClient.tsx`)
- Added research warning cards
- Added filter option
- Updated filter summary display
- Shows missing field count on patient cards

### 3. Dashboard Actions (`app/dashboard/actions.ts`)
- Added validation import
- Updated PatientCard interface
- Added research validation in patient mapping
- Added post-query filter for research-incomplete

### 4. Dados Básicos Section (`components/edit/DadosBasicosSection.tsx`)
- Added `isResearchParticipant` prop
- Updated all required field labels
- Uses ResearchRequiredIndicator

## Testing Checklist

### Visual Elements
- [ ] Research badges appear on required fields for research participants
- [ ] Standard asterisks appear for non-research participants
- [ ] Progress bar shows correct percentage
- [ ] Progress bar colors match completion level
- [ ] Warning cards appear on dashboard for incomplete research patients

### Validation Logic
- [ ] Validation correctly identifies missing fields
- [ ] Completion percentage calculates accurately
- [ ] Category breakdown shows correct counts
- [ ] isComplete flag is accurate

### Dashboard Features
- [ ] Filter "Pesquisa - Dados Incompletos" works
- [ ] Missing field count badge appears
- [ ] Warning card shows on incomplete research patients
- [ ] Filter summary shows research filter when active

### Edit Page Features
- [ ] Progress card appears for research participants
- [ ] Progress card hidden for non-research participants
- [ ] Missing fields list expands/collapses
- [ ] Auto-scroll works when clicking "Preencher"
- [ ] Success message shows when complete

### User Workflow
- [ ] Doctor can easily identify incomplete research patients
- [ ] Doctor can see exactly which fields are missing
- [ ] Doctor can click to jump to missing fields
- [ ] Dashboard clearly shows research data status

## Performance Considerations

### Validation Performance
- Validation runs client-side for edit page (instant feedback)
- Validation runs server-side for dashboard (cached in PatientCard)
- No database queries needed for validation
- O(n) complexity where n = number of required fields

### Dashboard Performance
- Research validation runs once per patient during query
- Results cached in PatientCard object
- Post-query filter is O(n) where n = number of patients
- No additional database roundtrips

## Future Enhancements

### Potential Additions
1. **Validation Blocking**: Prevent form submission if incomplete
2. **Email Notifications**: Alert doctor about incomplete research data
3. **Bulk Actions**: Mark multiple patients as complete
4. **Export**: Generate report of incomplete research patients
5. **Custom Required Fields**: Allow per-research customization
6. **Validation History**: Track when fields were completed
7. **Reminder System**: Automatic reminders for incomplete data

### Customization Options
1. **Field Weight**: Prioritize certain fields
2. **Conditional Requirements**: Fields required based on surgery type
3. **Grace Periods**: Allow time before marking as incomplete
4. **Team Permissions**: Who can mark research data complete

## Troubleshooting

### Issue: Badges not showing
**Solution**: Check `isResearchParticipant` prop is being passed correctly

### Issue: Progress always shows 0%
**Solution**: Verify patient data structure matches validation expectations

### Issue: Filter not working
**Solution**: Check that `dataStatus: "research-incomplete"` is in filters

### Issue: Auto-scroll not working
**Solution**: Ensure field IDs match the format (field.path → field-path)

## Support

For questions or issues with the research field validation system:
1. Check this documentation
2. Review the validation logic in `lib/research-field-validator.ts`
3. Test with a known research participant
4. Verify database has `isResearchParticipant` flag set

---

**Last Updated**: 2025-11-11
**Version**: 1.0.0
**Author**: Sistema de Acompanhamento Pós-Operatório
