"use client"

import { useEffect, useState } from 'react'

interface FormField {
  value: any
  required?: boolean
  weight?: number // Optional weight for important fields
}

interface UseFormCompletionProps {
  fields: Record<string, FormField>
  onMilestoneReached?: (milestone: 40 | 60 | 80 | 100) => void
}

export function useFormCompletion({ fields, onMilestoneReached }: UseFormCompletionProps) {
  const [completion, setCompletion] = useState(0)
  const [previousCompletion, setPreviousCompletion] = useState(0)

  useEffect(() => {
    const calculateCompletion = () => {
      const fieldEntries = Object.entries(fields)

      // Calculate total weight
      const totalWeight = fieldEntries.reduce((sum, [_, field]) => {
        return sum + (field.weight || 1)
      }, 0)

      // Calculate filled weight
      const filledWeight = fieldEntries.reduce((sum, [_, field]) => {
        const isFilled = isFieldFilled(field.value)
        return sum + (isFilled ? (field.weight || 1) : 0)
      }, 0)

      // Calculate percentage
      const percentage = totalWeight > 0
        ? Math.round((filledWeight / totalWeight) * 100)
        : 0

      return Math.min(100, Math.max(0, percentage))
    }

    const newCompletion = calculateCompletion()
    setCompletion(newCompletion)

    // Check for milestone reached
    if (onMilestoneReached) {
      const milestones: Array<40 | 60 | 80 | 100> = [40, 60, 80, 100]
      const reachedMilestone = milestones.find(
        m => newCompletion >= m && previousCompletion < m
      )

      if (reachedMilestone) {
        onMilestoneReached(reachedMilestone)
      }
    }

    setPreviousCompletion(newCompletion)
  }, [fields, onMilestoneReached, previousCompletion])

  return {
    completion,
    isComplete: completion === 100,
    nextMilestone: getNextMilestone(completion),
    percentageToNextMilestone: getPercentageToNextMilestone(completion)
  }
}

function isFieldFilled(value: any): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number') return true
  if (typeof value === 'boolean') return true
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return false
}

function getNextMilestone(completion: number): number | null {
  const milestones = [20, 40, 60, 80, 100]
  return milestones.find(m => completion < m) || null
}

function getPercentageToNextMilestone(completion: number): number {
  const nextMilestone = getNextMilestone(completion)
  if (!nextMilestone) return 0
  return nextMilestone - completion
}
