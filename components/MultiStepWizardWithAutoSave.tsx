"use client"

import { useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAutoSave } from "@/hooks/useAutoSave"
import { InlineAutoSaveIndicator } from "@/components/AutoSaveIndicator"
import { SURGERY_TYPE_LABELS } from "@/lib/constants/surgery-types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Save } from "lucide-react"

// Complete wizard schema
const wizardSchema = z.object({
  // Step 1: Personal Info
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),

  // Step 2: Medical Info
  surgeryType: z.enum(["hemorroidectomia", "fistula", "fissura", "pilonidal"]),
  surgeryDate: z.string().min(1, "Data da cirurgia é obrigatória"),
  allergies: z.string().optional(),

  // Step 3: Additional Info
  emergencyContact: z.string().min(3, "Nome do contato de emergência é obrigatório"),
  emergencyPhone: z.string().min(10, "Telefone de emergência inválido"),
  notes: z.string().optional(),
})

type WizardFormData = z.infer<typeof wizardSchema>

interface MultiStepWizardWithAutoSaveProps {
  onComplete: (data: WizardFormData) => Promise<void>
  autoSaveKey?: string
}

export function MultiStepWizardWithAutoSave({
  onComplete,
  autoSaveKey = "multi-step-wizard",
}: MultiStepWizardWithAutoSaveProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form data
  const [formData, setFormData] = useState<Partial<WizardFormData>>({
    name: "",
    email: "",
    phone: "",
    surgeryType: "hemorroidectomia",
    surgeryDate: new Date().toISOString().split("T")[0],
    allergies: "",
    emergencyContact: "",
    emergencyPhone: "",
    notes: "",
  })

  // Auto-save hook
  const { isSaving, lastSaved, saveNow, clearSaved } = useAutoSave(
    { ...formData, currentStep },
    {
      key: autoSaveKey,
      debounceMs: 2000,
      onRecover: (savedData) => {
        const { currentStep: savedStep, ...savedFormData } = savedData
        setFormData(savedFormData)
        if (savedStep) {
          setCurrentStep(savedStep)
        }
      },
    }
  )

  // Update form field
  const updateField = (field: keyof WizardFormData, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  // Save on blur
  const handleBlur = () => {
    saveNow()
  }

  // Navigate to next step
  const nextStep = () => {
    // Validate current step before proceeding
    if (validateCurrentStep()) {
      saveNow() // Save before changing step
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  // Navigate to previous step
  const prevStep = () => {
    saveNow() // Save before changing step
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  // Validate current step
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.name || formData.name.length < 3) {
        newErrors.name = "Nome deve ter pelo menos 3 caracteres"
      }
      if (!formData.email || !z.string().email().safeParse(formData.email).success) {
        newErrors.email = "Email inválido"
      }
      if (!formData.phone || formData.phone.length < 10) {
        newErrors.phone = "Telefone inválido"
      }
    } else if (currentStep === 2) {
      if (!formData.surgeryDate) {
        newErrors.surgeryDate = "Data da cirurgia é obrigatória"
      }
    } else if (currentStep === 3) {
      if (!formData.emergencyContact || formData.emergencyContact.length < 3) {
        newErrors.emergencyContact = "Nome do contato de emergência é obrigatório"
      }
      if (!formData.emergencyPhone || formData.emergencyPhone.length < 10) {
        newErrors.emergencyPhone = "Telefone de emergência inválido"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit final form
  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const validatedData = wizardSchema.parse(formData)
      await onComplete(validatedData)
      clearSaved() // Clear saved data after successful submission
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        err.issues.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0].toString()] = error.message
          }
        })
        setErrors(newErrors)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">
            Passo {currentStep} de {totalSteps}
          </span>
          <InlineAutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Wizard Card */}
      <Card className="shadow-xl">
        <CardHeader className="border-b bg-gradient-to-r from-[#F5F7FA] to-white">
          {currentStep === 1 && (
            <>
              <CardTitle className="text-2xl text-[#14BDAE]">
                Informações Pessoais
              </CardTitle>
              <CardDescription className="text-base">
                Dados básicos do paciente
              </CardDescription>
            </>
          )}
          {currentStep === 2 && (
            <>
              <CardTitle className="text-2xl text-[#14BDAE]">
                Informações Médicas
              </CardTitle>
              <CardDescription className="text-base">
                Dados sobre a cirurgia e histórico médico
              </CardDescription>
            </>
          )}
          {currentStep === 3 && (
            <>
              <CardTitle className="text-2xl text-[#14BDAE]">
                Informações Adicionais
              </CardTitle>
              <CardDescription className="text-base">
                Contato de emergência e observações
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => updateField("name", e.target.value)}
                  onBlur={handleBlur}
                  placeholder="João Silva Santos"
                  className="h-12"
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => updateField("email", e.target.value)}
                  onBlur={handleBlur}
                  placeholder="joao@email.com"
                  className="h-12"
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => updateField("phone", e.target.value)}
                  onBlur={handleBlur}
                  placeholder="(11) 98765-4321"
                  className="h-12"
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Medical Info */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="surgeryType">Tipo de Cirurgia *</Label>
                <Select
                  value={formData.surgeryType || "hemorroidectomia"}
                  onValueChange={(value) =>
                    updateField("surgeryType", value)
                  }
                >
                  <SelectTrigger id="surgeryType" className="h-12" onBlur={handleBlur}>
                    <SelectValue placeholder="Selecione o tipo de cirurgia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hemorroidectomia">{SURGERY_TYPE_LABELS['hemorroidectomia']}</SelectItem>
                    <SelectItem value="fistula">{SURGERY_TYPE_LABELS['fistula']}</SelectItem>
                    <SelectItem value="fissura">{SURGERY_TYPE_LABELS['fissurectomia']}</SelectItem>
                    <SelectItem value="pilonidal">{SURGERY_TYPE_LABELS['pilonidal']}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="surgeryDate">Data da Cirurgia *</Label>
                <Input
                  id="surgeryDate"
                  type="date"
                  value={formData.surgeryDate || ""}
                  onChange={(e) => updateField("surgeryDate", e.target.value)}
                  onBlur={handleBlur}
                  className="h-12"
                  aria-invalid={!!errors.surgeryDate}
                />
                {errors.surgeryDate && (
                  <p className="text-sm text-destructive">{errors.surgeryDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Alergias (opcional)</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies || ""}
                  onChange={(e) => updateField("allergies", e.target.value)}
                  onBlur={handleBlur}
                  placeholder="Liste quaisquer alergias medicamentosas..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          {/* Step 3: Additional Info */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Contato de Emergência *</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact || ""}
                  onChange={(e) => updateField("emergencyContact", e.target.value)}
                  onBlur={handleBlur}
                  placeholder="Maria Silva (esposa)"
                  className="h-12"
                  aria-invalid={!!errors.emergencyContact}
                />
                {errors.emergencyContact && (
                  <p className="text-sm text-destructive">
                    {errors.emergencyContact}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Telefone de Emergência *</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  value={formData.emergencyPhone || ""}
                  onChange={(e) => updateField("emergencyPhone", e.target.value)}
                  onBlur={handleBlur}
                  placeholder="(11) 98765-4321"
                  className="h-12"
                  aria-invalid={!!errors.emergencyPhone}
                />
                {errors.emergencyPhone && (
                  <p className="text-sm text-destructive">
                    {errors.emergencyPhone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => updateField("notes", e.target.value)}
                  onBlur={handleBlur}
                  placeholder="Informações adicionais relevantes..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={saveNow}
                disabled={isSaving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Salvar Agora
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="gap-2 bg-[#0D7377] hover:bg-blue-900"
                >
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "Enviando..." : "Concluir"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Seus dados são salvos automaticamente a cada 2 segundos e ao mudar de etapa.
          Você pode fechar esta página e retornar depois - seus dados estarão aqui.
        </p>
      </div>
    </div>
  )
}
