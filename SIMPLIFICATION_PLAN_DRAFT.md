# Simplification Plan

## 1. Quick Add Mode (Cadastro Rápido)
- **Goal:** Allow adding a patient with minimal info.
- **Fields Required:** Name, Phone, Surgery Date, Surgery Type, Hospital.
- **Implementation:**
  - Create `QuickAddPatient` component.
  - Modify `Patient` schema if fields are mandatory (make others optional or default).

## 2. Dynamic Checklist for Messages
- **Goal:** Replace 14-step conversation with a single "checklist" analysis.
- **Flow:**
  - Send templated question (e.g., "Como você está? Responda: Dor (0-10), Febre (Sim/Não)...").
  - User replies with full text.
  - LLM extracts all symptoms at once.
  - Only ask follow-up if CRITICAL info is missing.

## 3. Simplify Cron
- **Goal:** Reduce complexity of cron jobs.
- **Implementation:**
  - Ensure single robust cron for daily checks.
  - Remove redundant checks.
