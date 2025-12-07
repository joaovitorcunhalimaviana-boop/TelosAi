"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"

interface AutoSaveIndicatorProps {
  isSaving: boolean
  lastSaved: Date | null
  className?: string
}

/**
 * Visual indicator for auto-save status
 *
 * Shows:
 * - "Salvando..." with spinner when saving
 * - "Salvo há X segundos/minutos" when saved
 * - Nothing if never saved
 *
 * @example
 * ```tsx
 * <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
 * ```
 */
export function AutoSaveIndicator({
  isSaving,
  lastSaved,
  className = "",
}: AutoSaveIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>("")

  // Update time ago every second
  useEffect(() => {
    if (!lastSaved) {
      setTimeout(() => setTimeAgo(""), 0)
      return
    }

    const updateTimeAgo = () => {
      const now = new Date()
      const secondsElapsed = Math.floor(
        (now.getTime() - lastSaved.getTime()) / 1000
      )

      if (secondsElapsed < 5) {
        setTimeAgo("agora mesmo")
      } else if (secondsElapsed < 60) {
        setTimeAgo(`há ${secondsElapsed} segundo${secondsElapsed === 1 ? "" : "s"}`)
      } else if (secondsElapsed < 3600) {
        const minutes = Math.floor(secondsElapsed / 60)
        setTimeAgo(`há ${minutes} minuto${minutes === 1 ? "" : "s"}`)
      } else {
        const hours = Math.floor(secondsElapsed / 3600)
        setTimeAgo(`há ${hours} hora${hours === 1 ? "" : "s"}`)
      }
    }

    // Update immediately
    updateTimeAgo()

    // Update every second
    const interval = setInterval(updateTimeAgo, 1000)

    return () => clearInterval(interval)
  }, [lastSaved])

  // Don't render if never saved and not saving
  if (!isSaving && !lastSaved) {
    return null
  }

  return (
    <div
      className={`flex items-center gap-2 text-sm transition-all duration-200 ${className}`}
      role="status"
      aria-live="polite"
    >
      {isSaving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-gray-600 font-medium">Salvando...</span>
        </>
      ) : lastSaved ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-gray-600">
            <span className="text-green-600 font-medium">Salvo</span> {timeAgo}
          </span>
        </>
      ) : null}
    </div>
  )
}

/**
 * Floating auto-save indicator (top-right position)
 *
 * Minimal, non-intrusive design that floats in the top-right corner
 *
 * @example
 * ```tsx
 * <FloatingAutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
 * ```
 */
export function FloatingAutoSaveIndicator({
  isSaving,
  lastSaved,
}: AutoSaveIndicatorProps) {
  // Don't render if never saved and not saving
  if (!isSaving && !lastSaved) {
    return null
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-2"
      role="status"
      aria-live="polite"
    >
      <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
    </div>
  )
}

/**
 * Inline auto-save indicator for forms
 *
 * Designed to be placed inside form headers or cards
 *
 * @example
 * ```tsx
 * <CardHeader>
 *   <div className="flex items-center justify-between">
 *     <CardTitle>Patient Registration</CardTitle>
 *     <InlineAutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
 *   </div>
 * </CardHeader>
 * ```
 */
export function InlineAutoSaveIndicator({
  isSaving,
  lastSaved,
}: AutoSaveIndicatorProps) {
  return (
    <AutoSaveIndicator
      isSaving={isSaving}
      lastSaved={lastSaved}
      className="ml-auto"
    />
  )
}
