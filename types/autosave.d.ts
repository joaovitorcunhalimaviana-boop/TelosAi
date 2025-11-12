/**
 * Type definitions for Auto-Save System
 *
 * This file provides TypeScript type definitions for the auto-save system.
 * Import these types when implementing auto-save functionality.
 *
 * @example
 * ```tsx
 * import type { AutoSaveOptions, AutoSaveReturn } from '@/types/autosave'
 * ```
 */

/**
 * Configuration options for the useAutoSave hook
 */
export interface AutoSaveOptions {
  /**
   * Unique key for localStorage
   *
   * This key is used to store and retrieve data from localStorage.
   * Must be unique per form/wizard to avoid conflicts.
   *
   * @example 'patient-registration-wizard'
   * @example 'surgery-form-step-2'
   */
  key: string

  /**
   * Debounce delay in milliseconds
   *
   * Time to wait after last change before saving.
   * Default: 2000ms (2 seconds)
   *
   * @default 2000
   * @example 1500 // 1.5 seconds
   * @example 3000 // 3 seconds
   */
  debounceMs?: number

  /**
   * Callback executed after each successful save
   *
   * Use for tracking, analytics, or side effects.
   *
   * @param data - The data that was saved
   * @example (data) => console.log('Saved:', data)
   */
  onSave?: (data: any) => void

  /**
   * Callback executed when saved data is recovered
   *
   * Called on component mount if saved data exists.
   * Use to restore form state.
   *
   * @param data - The recovered data
   * @example (data) => setFormData(data)
   */
  onRecover?: (data: any) => void
}

/**
 * Return value from the useAutoSave hook
 */
export interface AutoSaveReturn {
  /**
   * Whether data is currently being saved
   *
   * Use for showing loading indicators.
   * Automatically managed by the hook.
   */
  isSaving: boolean

  /**
   * Timestamp of the last successful save
   *
   * Null if no save has occurred yet.
   * Use for "Saved X seconds ago" messages.
   */
  lastSaved: Date | null

  /**
   * Force an immediate save, bypassing debounce
   *
   * Useful for:
   * - Save on blur events
   * - Save before navigation
   * - Manual save buttons
   *
   * @example
   * ```tsx
   * <input onBlur={saveNow} />
   * <button onClick={saveNow}>Save Now</button>
   * ```
   */
  saveNow: () => void

  /**
   * Clear saved data from localStorage
   *
   * Should be called after successful form submission
   * to prevent stale data recovery.
   *
   * @example
   * ```tsx
   * const handleSubmit = async () => {
   *   await submitForm()
   *   clearSaved() // Clean up after success
   * }
   * ```
   */
  clearSaved: () => void

  /**
   * Get the currently saved data without recovering it
   *
   * Returns null if no data is saved.
   * Useful for debugging or conditional logic.
   *
   * @returns The saved data or null
   */
  getSavedData: () => any
}

/**
 * Structure of data saved to localStorage
 *
 * Internal format used by the auto-save system.
 * You typically don't need to interact with this directly.
 */
export interface SavedData<T = any> {
  /**
   * Version of the auto-save system
   *
   * Used for schema migration and compatibility.
   */
  version: string

  /**
   * ISO 8601 timestamp of when data was saved
   *
   * @example '2025-11-11T10:30:45.123Z'
   */
  timestamp: string

  /**
   * The actual form data
   *
   * Generic type T represents your form data structure.
   */
  data: T
}

/**
 * Props for AutoSaveIndicator components
 */
export interface AutoSaveIndicatorProps {
  /**
   * Whether data is currently being saved
   */
  isSaving: boolean

  /**
   * Timestamp of the last successful save
   */
  lastSaved: Date | null

  /**
   * Optional CSS class name for styling
   */
  className?: string
}

/**
 * Type-safe wrapper for form data with auto-save
 *
 * @template T - Type of your form data
 * @example
 * ```tsx
 * interface MyFormData {
 *   name: string
 *   email: string
 * }
 *
 * const formData: AutoSaveFormData<MyFormData> = {
 *   name: 'John',
 *   email: 'john@example.com'
 * }
 * ```
 */
export type AutoSaveFormData<T> = T

/**
 * Type-safe wrapper for wizard data with auto-save
 *
 * Includes currentStep for multi-step wizards
 *
 * @template T - Type of your form data
 * @example
 * ```tsx
 * interface WizardData {
 *   name: string
 *   email: string
 * }
 *
 * const wizardData: AutoSaveWizardData<WizardData> = {
 *   name: 'John',
 *   email: 'john@example.com',
 *   currentStep: 2
 * }
 * ```
 */
export type AutoSaveWizardData<T> = T & {
  currentStep: number
  completedSteps?: number[]
}

/**
 * Configuration for different auto-save strategies
 */
export type AutoSaveStrategy =
  | 'debounce' // Save after debounce delay (default)
  | 'immediate' // Save immediately on every change
  | 'manual' // Only save when saveNow() is called
  | 'hybrid' // Debounce + save on blur

/**
 * Error types that can occur during auto-save
 */
export type AutoSaveError =
  | 'QUOTA_EXCEEDED' // localStorage is full
  | 'PARSE_ERROR' // JSON parsing failed
  | 'VERSION_MISMATCH' // Saved data version incompatible
  | 'STORAGE_DISABLED' // localStorage not available
  | 'UNKNOWN_ERROR' // Other errors

/**
 * Event data for auto-save events
 */
export interface AutoSaveEvent<T = any> {
  /**
   * Type of event
   */
  type: 'save' | 'recover' | 'clear' | 'error'

  /**
   * Timestamp of the event
   */
  timestamp: Date

  /**
   * The data involved in the event
   */
  data?: T

  /**
   * Error information if type is 'error'
   */
  error?: {
    type: AutoSaveError
    message: string
  }
}

/**
 * Hook signature for useAutoSave
 *
 * @template T - Type of data to auto-save
 * @param data - The data to save
 * @param options - Configuration options
 * @returns Auto-save controls and state
 */
export function useAutoSave<T = any>(
  data: T,
  options: AutoSaveOptions
): AutoSaveReturn

/**
 * Re-export component types for convenience
 */
export {
  AutoSaveIndicator,
  InlineAutoSaveIndicator,
  FloatingAutoSaveIndicator,
} from '@/components/AutoSaveIndicator'
