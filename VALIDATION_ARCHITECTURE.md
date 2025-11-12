# Validation System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CONTEXTUAL VALIDATION SYSTEM                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────┐      ┌───────────────────┐                     │
│  │ User Inputs    │─────▶│ Validation Engine │                     │
│  │ Form Data      │      │ (Core Logic)      │                     │
│  └────────────────┘      └─────────┬─────────┘                     │
│                                    │                                │
│                           ┌────────▼─────────┐                     │
│                           │ Validation       │                     │
│                           │ Context          │                     │
│                           │ - Patient Type   │                     │
│                           │ - Study Rules    │                     │
│                           └────────┬─────────┘                     │
│                                    │                                │
│                           ┌────────▼─────────┐                     │
│                           │ Validation       │                     │
│                           │ Result           │                     │
│                           │ - Errors         │                     │
│                           │ - Warnings       │                     │
│                           │ - Missing Fields │                     │
│                           └────────┬─────────┘                     │
│                                    │                                │
│  ┌────────────────┐      ┌────────▼─────────┐                     │
│  │ Visual         │◀─────│ UI Components    │                     │
│  │ Feedback       │      │ (React)          │                     │
│  └────────────────┘      └──────────────────┘                     │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         COMPONENT LAYERS                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 1: Core Validation Logic (lib/registration-validation.ts)      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  validateRegistrationData()  ──▶  Full form validation               │
│  validateField()             ──▶  Single field validation            │
│  getRequiredFields()         ──▶  Context-based requirements         │
│  meetsResearchCriteria()     ──▶  Eligibility checking              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 2: Visual Components (components/FieldRequirementBadge.tsx)    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  FieldRequirementBadge       ──▶  Shows requirement level            │
│  FieldValidationMessage      ──▶  Shows error/warning                │
│  ValidationSummary          ──▶  Overall status                      │
│  SectionValidationSummary   ──▶  Section status                      │
│  ResearchCriteriaChecker    ──▶  Eligibility display                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 3: Complete Forms (components/examples/ValidatedPatientForm.tsx)│
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ValidatedPatientForm        ──▶  Full implementation example        │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 4: Demo & Testing                                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  app/validation-demo/page.tsx    ──▶  Interactive demo              │
│  lib/__tests__/*.test.ts         ──▶  Test suite                    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW                                 │
└────────────────────────────────────────────────────────────────────┘

User Types
    │
    ▼
┌──────────────────┐
│ Field onChange   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Update State     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐         ┌──────────────────┐
│ validateField()  │────────▶│ Field Validation │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         │                            ▼
         │                   ┌──────────────────┐
         │                   │ Update Field     │
         │                   │ Error State      │
         │                   └────────┬─────────┘
         │                            │
         │                            ▼
         │                   ┌──────────────────┐
         │                   │ Show Visual      │
         │                   │ Feedback         │
         │                   └──────────────────┘
         │
         ▼
┌──────────────────┐
│ validateRegistr- │
│ ationData()      │
│ (on blur/submit) │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Full Form        │
│ Validation       │
└────────┬─────────┘
         │
         ▼
    Is Valid?
    │      │
    Yes    No
    │      │
    │      ▼
    │  Show All Errors
    │  Mark All Touched
    │  Scroll to First
    │
    ▼
Submit Form
```

## Validation Decision Tree

```
┌────────────────────────────────────────────────────────────────────┐
│                    VALIDATION DECISION TREE                         │
└────────────────────────────────────────────────────────────────────┘

                        Field Change Event
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Has field been       │
                    │ touched?             │
                    └──────┬───────┬───────┘
                          No      Yes
                           │       │
                           ▼       ▼
                    Don't Validate  Validate
                    Show          │
                           │       ▼
                           │  ┌──────────────────────┐
                           │  │ Get Validation       │
                           │  │ Context              │
                           │  └──────┬───────────────┘
                           │         │
                           │         ▼
                           │  ┌──────────────────────┐
                           │  │ Is Research          │
                           │  │ Participant?         │
                           │  └──────┬───────┬───────┘
                           │        Yes     No
                           │         │       │
                           │         ▼       ▼
                           │  Research    Standard
                           │  Rules       Rules
                           │         │       │
                           │         └───┬───┘
                           │             │
                           │             ▼
                           │      ┌──────────────────┐
                           │      │ Validate Field   │
                           │      └──────┬───────────┘
                           │             │
                           │             ▼
                           │      ┌──────────────────┐
                           │      │ Check Required?  │
                           │      └──────┬───────────┘
                           │             │
                           │     ┌───────┴────────┐
                           │     │                │
                           │     ▼                ▼
                           │  Required      Recommended
                           │     │                │
                           │     ▼                ▼
                           │  Error if      Warning if
                           │  Empty         Empty
                           │     │                │
                           │     └────────┬───────┘
                           │              │
                           │              ▼
                           │       ┌──────────────────┐
                           │       │ Field-Specific   │
                           │       │ Validation       │
                           │       └──────┬───────────┘
                           │              │
                           │              ▼
                           │       ┌──────────────────┐
                           │       │ Cross-Field      │
                           │       │ Validation       │
                           │       └──────┬───────────┘
                           │              │
                           │              ▼
                           │       ┌──────────────────┐
                           │       │ Return Error/    │
                           │       │ Warning          │
                           │       └──────┬───────────┘
                           │              │
                           └──────────────┼──────────────┘
                                          │
                                          ▼
                                   Update UI
```

## Context-Based Rules

```
┌────────────────────────────────────────────────────────────────────┐
│                   CONTEXT-BASED VALIDATION                          │
└────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐          ┌─────────────────────────┐
│ STANDARD PATIENT        │          │ RESEARCH PARTICIPANT    │
├─────────────────────────┤          ├─────────────────────────┤
│                         │          │                         │
│ Required:               │          │ Required:               │
│  • Name                 │          │  • Name                 │
│  • Phone                │          │  • Phone                │
│  • Surgery Type         │          │  • Email                │
│  • Surgery Date         │          │  • CPF                  │
│                         │          │  • Date of Birth        │
│ Recommended:            │          │  • Sex                  │
│  • Email                │          │  • Surgery Type         │
│  • CPF                  │          │  • Surgery Date         │
│  • Date of Birth        │          │                         │
│  • Sex                  │          │ Recommended:            │
│                         │          │  • Surgery Details      │
│ Flexible               │          │  • Comorbidities        │
│ Can save incomplete     │          │  • Medications          │
│                         │          │                         │
│                         │          │ Strict                  │
│                         │          │ Must be complete        │
│                         │          │ Age range check         │
│                         │          │ Eligibility check       │
│                         │          │                         │
└─────────────────────────┘          └─────────────────────────┘
```

## Validation States

```
┌────────────────────────────────────────────────────────────────────┐
│                      VALIDATION STATES                              │
└────────────────────────────────────────────────────────────────────┘

Field State Machine:

    Initial
       │
       ▼
   ┌─────────┐
   │ Untouched│
   └────┬─────┘
        │
        │ (onFocus/onChange)
        ▼
   ┌─────────┐
   │ Touched  │
   └────┬─────┘
        │
        │ (onBlur)
        ▼
   ┌─────────┐
   │Validating│
   └────┬─────┘
        │
        ├──▶ Valid   ──▶ ✅ Show success/nothing
        ├──▶ Warning ──▶ ⚠️  Show warning
        └──▶ Error   ──▶ ❌ Show error


Form State Machine:

    Initial
       │
       ▼
   ┌─────────┐
   │ Empty    │
   └────┬─────┘
        │
        │ (user starts typing)
        ▼
   ┌─────────┐
   │ Partial  │
   └────┬─────┘
        │
        │ (validates continuously)
        ├──▶ Has Errors   ──▶ Invalid
        ├──▶ Has Warnings ──▶ Valid with warnings
        └──▶ All Valid    ──▶ Valid
                                 │
                                 │ (onSubmit)
                                 ▼
                              Submit
```

## Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────┐
│                     COMPONENT HIERARCHY                             │
└────────────────────────────────────────────────────────────────────┘

App
└── Page
    └── ValidatedPatientForm
        ├── ValidationContext (provider)
        │
        ├── Section: Personal Data
        │   ├── Field: Name
        │   │   ├── Label
        │   │   │   └── FieldRequirementBadge
        │   │   ├── Input
        │   │   └── FieldValidationMessage
        │   │
        │   ├── Field: Phone
        │   ├── Field: Email
        │   └── ...
        │   └── SectionValidationSummary
        │
        ├── Section: Surgery Data
        │   ├── Field: Surgery Type
        │   ├── Field: Surgery Date
        │   └── ...
        │   └── SectionValidationSummary
        │
        ├── Section: Medical History
        │   └── ...
        │
        ├── ResearchCriteriaChecker (if research)
        │
        ├── ValidationSummary (overall)
        │
        └── Submit Button
```

## Integration Points

```
┌────────────────────────────────────────────────────────────────────┐
│                     INTEGRATION POINTS                              │
└────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│ Your App     │
└──────┬───────┘
       │
       ├──▶ Import Validation Functions
       │    • validateRegistrationData()
       │    • validateField()
       │    • getRequiredFields()
       │
       ├──▶ Import UI Components
       │    • FieldRequirementBadge
       │    • ValidationSummary
       │    • FieldValidationMessage
       │
       ├──▶ Define Context
       │    const context = {
       │      isResearchParticipant: true,
       │      studyAgeRange: { min: 18, max: 80 }
       │    }
       │
       ├──▶ Implement Validation
       │    const result = validateRegistrationData(data, context)
       │
       ├──▶ Add Visual Feedback
       │    <FieldRequirementBadge fieldName="email" context={context} />
       │    <FieldValidationMessage error={error} />
       │
       └──▶ Handle Submit
            if (result.isValid) {
              submitToServer(data)
            }
```

## Error Handling Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                     ERROR HANDLING FLOW                             │
└────────────────────────────────────────────────────────────────────┘

                    Validation Runs
                           │
                           ▼
                  ┌────────────────┐
                  │ Any Errors?    │
                  └────┬─────┬─────┘
                      No    Yes
                       │     │
                       │     ▼
                       │  ┌──────────────────────┐
                       │  │ Is field Required?   │
                       │  └────┬──────────┬──────┘
                       │      Yes        No
                       │       │          │
                       │       ▼          ▼
                       │   Add Error  Add Warning
                       │       │          │
                       │       └────┬─────┘
                       │            │
                       │            ▼
                       │    ┌──────────────────┐
                       │    │ Store in Result  │
                       │    └────┬─────────────┘
                       │         │
                       │         ▼
                       │    ┌──────────────────┐
                       │    │ Has field been   │
                       │    │ touched?         │
                       │    └────┬─────┬───────┘
                       │        Yes   No
                       │         │     │
                       │         ▼     ▼
                       │      Show   Hide
                       │         │
                       └─────────┴──────────────┐
                                                │
                                                ▼
                                        Update UI
```

## Performance Optimization

```
┌────────────────────────────────────────────────────────────────────┐
│                  PERFORMANCE OPTIMIZATIONS                          │
└────────────────────────────────────────────────────────────────────┘

Strategy                    Implementation
────────                    ──────────────

1. Debouncing              useDebouncedCallback(validate, 300ms)
                           └─▶ Reduce validation calls

2. Memoization             React.memo(FieldRequirementBadge)
                           └─▶ Prevent unnecessary re-renders

3. Lazy Validation         Only validate touched fields
                           └─▶ Don't validate untouched fields

4. Stable Refs             useState(context) not inline object
                           └─▶ Prevent context recreation

5. Batch Updates           Validate all at once on submit
                           └─▶ Single state update

6. Field-level             Validate single field, not whole form
                           └─▶ Faster real-time feedback

7. Early Returns           Return on first error per field
                           └─▶ Skip unnecessary checks
```

## Testing Strategy

```
┌────────────────────────────────────────────────────────────────────┐
│                     TESTING STRATEGY                                │
└────────────────────────────────────────────────────────────────────┘

Level 1: Unit Tests (lib/__tests__/registration-validation.test.ts)
├── Test each validation function
├── Test edge cases
├── Test error messages
└── Test helper functions

Level 2: Integration Tests
├── Test full form validation
├── Test context switching
├── Test cross-field validation
└── Test research criteria

Level 3: Component Tests
├── Test UI components render
├── Test user interactions
├── Test visual feedback
└── Test accessibility

Level 4: E2E Tests
├── Test complete user flows
├── Test form submission
├── Test error recovery
└── Test across browsers

Coverage Target: 90%+ ✅
```

## Architecture Principles

1. **Separation of Concerns**: Logic (lib) separate from UI (components)
2. **Context-Aware**: Validation adapts to patient type automatically
3. **Progressive Enhancement**: Start simple, add features as needed
4. **Fail Fast**: Validate early, show errors immediately
5. **User-Friendly**: Clear messages, helpful feedback
6. **Type-Safe**: Full TypeScript coverage
7. **Testable**: Pure functions, easy to test
8. **Extensible**: Easy to add new validation rules
9. **Performant**: Optimized for real-time validation
10. **Accessible**: WCAG 2.1 AA compliant

## Technology Stack

```
Core Logic:        Pure TypeScript (no dependencies)
UI Components:     React 18 + TypeScript
Styling:          Tailwind CSS
UI Library:       shadcn/ui + Radix UI
Testing:          Jest + React Testing Library
Type Checking:    TypeScript 5
```

## File Dependencies

```
registration-validation.ts (Core - No dependencies)
           │
           ├──▶ FieldRequirementBadge.tsx (Uses core types)
           │              │
           │              └──▶ ValidatedPatientForm.tsx (Uses both)
           │                            │
           │                            └──▶ validation-demo/page.tsx
           │
           └──▶ registration-validation.test.ts (Tests core)
```
