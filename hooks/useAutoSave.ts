"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { toast } from "@/hooks/use-toast"

// Version for saved data (useful when schema changes)
const AUTOSAVE_VERSION = "1.0.0"

interface AutoSaveOptions {
  key: string // localStorage key
  debounceMs?: number // default 2000ms
  onSave?: (data: any) => void
  onRecover?: (data: any) => void
}

interface AutoSaveReturn {
  isSaving: boolean
  lastSaved: Date | null
  saveNow: () => void
  clearSaved: () => void
  getSavedData: () => any
}

interface SavedData {
  version: string
  timestamp: string
  data: any
}

/**
 * Auto-save hook for form data
 *
 * Features:
 * - Debounced auto-save to localStorage
 * - Visual feedback with saving indicator
 * - Automatic recovery on page reload
 * - Versioning for schema changes
 * - Error handling for localStorage quota
 *
 * @param data - The data to auto-save
 * @param options - Configuration options
 * @returns Auto-save controls and state
 *
 * @example
 * ```tsx
 * const { isSaving, lastSaved, saveNow, clearSaved } = useAutoSave(formData, {
 *   key: 'patient-registration',
 *   debounceMs: 2000,
 *   onRecover: (data) => setFormData(data)
 * })
 * ```
 */
export function useAutoSave(
  data: any,
  options: AutoSaveOptions
): AutoSaveReturn {
  const {
    key,
    debounceMs = 2000,
    onSave,
    onRecover,
  } = options

  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isFirstRenderRef = useRef(true)
  const hasRecoveredRef = useRef(false)

  // Get the full localStorage key with prefix
  const getStorageKey = useCallback(() => {
    return `autosave_${key}`
  }, [key])

  /**
   * Save data to localStorage
   */
  const saveToLocalStorage = useCallback((dataToSave: any) => {
    try {
      const savedData: SavedData = {
        version: AUTOSAVE_VERSION,
        timestamp: new Date().toISOString(),
        data: dataToSave,
      }

      localStorage.setItem(getStorageKey(), JSON.stringify(savedData))
      setLastSaved(new Date())
      setIsSaving(false)

      // Call onSave callback if provided
      if (onSave) {
        onSave(dataToSave)
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error)
      setIsSaving(false)

      // Handle quota exceeded error
      if (error instanceof Error && error.name === "QuotaExceededError") {
        toast({
          title: "Erro ao salvar",
          description: "Espaço de armazenamento insuficiente. Limpe o cache do navegador.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar os dados automaticamente.",
          variant: "destructive",
        })
      }
    }
  }, [getStorageKey, onSave])

  /**
   * Get saved data from localStorage
   */
  const getSavedData = useCallback((): any => {
    try {
      const stored = localStorage.getItem(getStorageKey())
      if (!stored) return null

      const parsed: SavedData = JSON.parse(stored)

      // Check version compatibility
      if (parsed.version !== AUTOSAVE_VERSION) {
        console.warn(
          `Auto-save version mismatch. Expected ${AUTOSAVE_VERSION}, got ${parsed.version}`
        )
        // Optionally clear incompatible data
        // localStorage.removeItem(getStorageKey())
        // return null
      }

      return parsed.data
    } catch (error) {
      console.error("Error reading from localStorage:", error)
      return null
    }
  }, [getStorageKey])

  /**
   * Clear saved data from localStorage
   */
  const clearSaved = useCallback(() => {
    try {
      localStorage.removeItem(getStorageKey())
      setLastSaved(null)
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }
  }, [getStorageKey])

  /**
   * Save immediately (bypass debounce)
   */
  const saveNow = useCallback(() => {
    // Cancel pending debounced save
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    setIsSaving(true)
    saveToLocalStorage(data)
  }, [data, saveToLocalStorage])

  /**
   * Recover saved data on mount
   */
  useEffect(() => {
    if (!hasRecoveredRef.current) {
      const savedData = getSavedData()

      if (savedData) {
        // Calculate time elapsed since last save
        try {
          const stored = localStorage.getItem(getStorageKey())
          if (stored) {
            const parsed: SavedData = JSON.parse(stored)
            const savedTime = new Date(parsed.timestamp)
            const now = new Date()
            const minutesElapsed = Math.floor(
              (now.getTime() - savedTime.getTime()) / 1000 / 60
            )

            // Show recovery toast
            toast({
              title: "Dados recuperados",
              description: `Seus dados foram recuperados (salvos há ${minutesElapsed} ${
                minutesElapsed === 1 ? "minuto" : "minutos"
              }).`,
              duration: 5000,
            })

            setLastSaved(savedTime)
          }
        } catch (error) {
          console.error("Error calculating time elapsed:", error)
        }

        // Call recovery callback
        if (onRecover) {
          onRecover(savedData)
        }
      }

      hasRecoveredRef.current = true
    }
  }, [getSavedData, onRecover, getStorageKey])

  /**
   * Auto-save with debounce
   */
  useEffect(() => {
    // Skip on first render (recovery phase)
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }

    // Skip if data is empty or null
    if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
      return
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set saving indicator
    setIsSaving(true)

    // Set new debounced timer
    debounceTimerRef.current = setTimeout(() => {
      saveToLocalStorage(data)
    }, debounceMs)

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [data, debounceMs, saveToLocalStorage])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    isSaving,
    lastSaved,
    saveNow,
    clearSaved,
    getSavedData,
  }
}
