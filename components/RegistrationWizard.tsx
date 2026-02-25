"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Circle,
  ClipboardList,
  AlertCircle,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

/**
 * Interface for individual wizard steps
 */
export interface WizardStep {
  id: string
  title: string
  description: string
  fields: React.ReactNode
  validate: () => Promise<boolean>
  onSave?: () => Promise<void>
}

/**
 * Props for the RegistrationWizard component
 */
export interface RegistrationWizardProps {
  steps: WizardStep[]
  currentStep: number
  onStepChange: (step: number) => void
  onComplete: () => Promise<void>
  isResearchMode?: boolean
  className?: string
}

/**
 * Step status type
 */
type StepStatus = "pending" | "current" | "completed"

/**
 * RegistrationWizard Component
 *
 * A professional, accessible wizard component for multi-step registration forms.
 * Features include:
 * - Visual progress tracking
 * - Step validation
 * - Keyboard navigation
 * - Mobile responsive design
 * - Auto-save functionality
 * - Summary view
 *
 * @example
 * ```tsx
 * <RegistrationWizard
 *   steps={wizardSteps}
 *   currentStep={currentStep}
 *   onStepChange={setCurrentStep}
 *   onComplete={handleComplete}
 *   isResearchMode={true}
 * />
 * ```
 */
export function RegistrationWizard({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  isResearchMode = false,
  className
}: RegistrationWizardProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [showSummary, setShowSummary] = useState(false)

  const totalSteps = steps.length
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  /**
   * Get the status of a step
   */
  const getStepStatus = (stepIndex: number): StepStatus => {
    if (stepIndex < currentStep) return "completed"
    if (stepIndex === currentStep) return "current"
    return "pending"
  }

  /**
   * Handle navigation to next step
   */
  const handleNext = async () => {
    setValidationError(null)
    setIsValidating(true)

    try {
      const isValid = await steps[currentStep].validate()

      if (!isValid) {
        setValidationError("Por favor, corrija os erros antes de continuar.")
        setIsValidating(false)
        return
      }

      // Auto-save if onSave is defined
      if (steps[currentStep].onSave) {
        setIsSaving(true)
        await steps[currentStep].onSave!()
        setIsSaving(false)
      }

      // Mark step as completed
      setCompletedSteps(prev => new Set([...prev, currentStep]))

      // Move to next step
      if (!isLastStep) {
        onStepChange(currentStep + 1)
      }
    } catch (error) {
      console.error("Validation error:", error)
      setValidationError("Ocorreu um erro ao validar os dados. Tente novamente.")
    } finally {
      setIsValidating(false)
    }
  }

  /**
   * Handle navigation to previous step
   */
  const handlePrevious = () => {
    if (!isFirstStep) {
      setValidationError(null)
      onStepChange(currentStep - 1)
    }
  }

  /**
   * Handle wizard completion
   */
  const handleComplete = async () => {
    setValidationError(null)
    setIsValidating(true)

    try {
      // Validate current step
      const isValid = await steps[currentStep].validate()

      if (!isValid) {
        setValidationError("Por favor, corrija os erros antes de finalizar.")
        setIsValidating(false)
        return
      }

      // Save current step if needed
      if (steps[currentStep].onSave) {
        setIsSaving(true)
        await steps[currentStep].onSave!()
        setIsSaving(false)
      }

      // Complete the wizard
      setIsCompleting(true)
      await onComplete()
    } catch (error) {
      console.error("Completion error:", error)
      setValidationError("Ocorreu um erro ao finalizar. Tente novamente.")
      setIsCompleting(false)
    } finally {
      setIsValidating(false)
    }
  }

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isValidating && !isSaving) {
      e.preventDefault()
      if (isLastStep) {
        handleComplete()
      } else {
        handleNext()
      }
    }
  }, [currentStep, isValidating, isSaving, isLastStep])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-[#14BDAE]">
            Etapa {currentStep + 1} de {totalSteps}
          </span>
          <span className="text-muted-foreground">
            {Math.round(progressPercentage)}% concluído
          </span>
        </div>
        <Progress
          value={progressPercentage}
          className="h-2.5 animate-fade-in"
        />
      </div>

      {/* Step Indicators */}
      <div className="hidden md:flex items-center justify-between gap-2 px-4 animate-fade-in-up">
        {steps.map((step, index) => {
          const status = getStepStatus(index)
          const isCompleted = completedSteps.has(index) || status === "completed"

          return (
            <div key={step.id} className="flex-1 flex items-center">
              {/* Step Circle */}
              <button
                onClick={() => {
                  if (isCompleted && index < currentStep) {
                    onStepChange(index)
                  }
                }}
                disabled={!isCompleted && index > currentStep}
                className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:ring-offset-2",
                  status === "completed" && "bg-[#0D7377] border-[#0D7377] text-white",
                  status === "current" && "bg-white border-[#C9A84C] text-[#C9A84C] shadow-lg scale-110",
                  status === "pending" && "bg-white border-gray-300 text-gray-400",
                  isCompleted && index < currentStep && "cursor-pointer hover:scale-105"
                )}
                aria-label={`Etapa ${index + 1}: ${step.title}`}
                aria-current={status === "current" ? "step" : undefined}
              >
                {status === "completed" ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </button>

              {/* Connector Line */}
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 transition-colors",
                    status === "completed" ? "bg-[#0D7377]" : "bg-gray-300"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile Step Indicator */}
      <div className="md:hidden flex items-center gap-1.5 justify-center animate-fade-in">
        {steps.map((step, index) => {
          const status = getStepStatus(index)
          const isCompleted = completedSteps.has(index)

          return (
            <div
              key={step.id}
              className={cn(
                "h-2 rounded-full transition-all",
                status === "completed" && "bg-[#0D7377] w-8",
                status === "current" && "bg-[#C9A84C] w-12",
                status === "pending" && "bg-gray-300 w-6"
              )}
            />
          )
        })}
      </div>

      {/* Main Content Card */}
      <Card className="p-6 md:p-8 shadow-lg border-2 animate-scale-in">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold text-[#14BDAE] flex items-center gap-2">
                {steps[currentStep].title}
                {isResearchMode && (
                  <Badge variant="secondary" className="text-xs">
                    Pesquisa
                  </Badge>
                )}
              </h2>
              <p className="text-muted-foreground mt-1">
                {steps[currentStep].description}
              </p>
            </div>

            {/* Summary Button */}
            <Dialog open={showSummary} onOpenChange={setShowSummary}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Resumo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-[#14BDAE]">
                    Resumo do Cadastro
                  </DialogTitle>
                  <DialogDescription>
                    Revise todas as informações inseridas até o momento
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {steps.map((step, index) => {
                    const isCompleted = completedSteps.has(index) || index < currentStep

                    return (
                      <div
                        key={step.id}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all",
                          isCompleted ? "border-[#0D7377] bg-[#161B27]" : "border-gray-200 bg-gray-50 opacity-60"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {isCompleted ? (
                            <Check className="w-5 h-5 text-[#14BDAE]" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                          <h3 className="font-semibold text-[#14BDAE]">
                            {index + 1}. {step.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground ml-7">
                          {isCompleted ? "Concluído" : "Pendente"}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-[#0D7377] via-[#C9A84C] to-transparent mt-4" />
        </div>

        {/* Step Content */}
        <div className="min-h-[400px] animate-fade-in-up animation-delay-200">
          {steps[currentStep].fields}
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="mt-6 p-4 rounded-lg bg-destructive/10 border-2 border-destructive/50 animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-destructive">Atenção</h4>
                <p className="text-sm text-destructive/90 mt-1">{validationError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep || isValidating || isSaving || isCompleting}
            className="min-w-[120px]"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-center gap-2">
            {isSaving && (
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </span>
            )}
          </div>

          {!isLastStep ? (
            <Button
              onClick={handleNext}
              disabled={isValidating || isSaving}
              className="min-w-[120px] bg-[#0D7377] hover:bg-[#0D7377]/90"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isValidating || isSaving || isCompleting}
              className="min-w-[120px] bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-white"
            >
              {isCompleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finalizando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Finalizar
                </>
              )}
            </Button>
          )}
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Dica: Pressione <kbd className="px-2 py-1 bg-gray-100 rounded border text-xs">Enter</kbd> para {isLastStep ? "finalizar" : "continuar"}
          </p>
        </div>
      </Card>

      {/* Progress Footer (Mobile) */}
      <div className="md:hidden text-center text-sm text-muted-foreground animate-fade-in">
        <p>
          {completedSteps.size} de {totalSteps} etapas concluídas
        </p>
      </div>
    </div>
  )
}

/**
 * Export types for external use
 */
export type { StepStatus }
