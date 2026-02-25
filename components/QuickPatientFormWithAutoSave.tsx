"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail } from "lucide-react"
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

// Schema de validação com Zod
const quickPatientSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, "WhatsApp inválido. Use o formato: (XX) XXXXX-XXXX"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  surgeryType: z.enum(["hemorroidectomia", "fistula", "fissura", "pilonidal"], {
    message: "Selecione o tipo de cirurgia",
  }),
  surgeryDate: z.string().min(1, "Data da cirurgia é obrigatória"),
})

type QuickPatientFormData = z.infer<typeof quickPatientSchema>

interface QuickPatientFormWithAutoSaveProps {
  onSubmit: (data: QuickPatientFormData) => Promise<void>
  autoSaveKey?: string
}

export function QuickPatientFormWithAutoSave({
  onSubmit,
  autoSaveKey = "patient-registration-wizard",
}: QuickPatientFormWithAutoSaveProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Estado para os campos do formulário
  const [formData, setFormData] = useState<QuickPatientFormData>({
    name: "",
    phone: "",
    email: "",
    surgeryType: "hemorroidectomia",
    surgeryDate: new Date().toISOString().split("T")[0], // Data de hoje como padrão
  })

  // Auto-save hook
  const { isSaving, lastSaved, saveNow, clearSaved } = useAutoSave(formData, {
    key: autoSaveKey,
    debounceMs: 2000,
    onRecover: (savedData) => {
      // Recover saved form data
      setFormData(savedData)
    },
  })

  // Máscara para WhatsApp brasileiro
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData({ ...formData, phone: formatted })

    // Validação em tempo real
    try {
      quickPatientSchema.shape.phone.parse(formatted)
      setErrors({ ...errors, phone: "" })
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors({ ...errors, phone: err.issues[0]?.message || "" })
      }
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value })

    // Validação em tempo real
    try {
      quickPatientSchema.shape.name.parse(e.target.value)
      setErrors({ ...errors, name: "" })
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors({ ...errors, name: err.issues[0]?.message || "" })
      }
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value })

    // Validação em tempo real (apenas se o campo não estiver vazio)
    if (e.target.value.trim() !== "") {
      try {
        quickPatientSchema.shape.email.parse(e.target.value)
        setErrors({ ...errors, email: "" })
      } catch (err) {
        if (err instanceof z.ZodError) {
          setErrors({ ...errors, email: err.issues[0]?.message || "" })
        }
      }
    } else {
      // Campo vazio é válido (opcional)
      setErrors({ ...errors, email: "" })
    }
  }

  // Save on blur of input fields
  const handleBlur = () => {
    saveNow()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validação completa
      const validatedData = quickPatientSchema.parse(formData)

      // Chamar a função de submit
      await onSubmit(validatedData)

      // Clear saved data after successful submission
      clearSaved()
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

  return (
    <Card className="shadow-2xl border-2 border-gray-100">
      <CardHeader className="border-b bg-gradient-to-r from-[#F5F7FA] to-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-[#14BDAE]">Dados do Paciente</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Preencha os dados essenciais para iniciar o acompanhamento automatizado
            </CardDescription>
          </div>
          <InlineAutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome Completo */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              Nome Completo *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              onBlur={handleBlur}
              placeholder="Ex: João Silva Santos"
              className="h-12 text-base"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base">
              WhatsApp *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              onBlur={handleBlur}
              placeholder="(XX) XXXXX-XXXX"
              maxLength={15}
              className="h-12 text-base"
              aria-invalid={!!errors.phone}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          {/* Email field (optional) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email (opcional)
              </span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleEmailChange}
              onBlur={handleBlur}
              placeholder="exemplo@email.com"
              className="h-12 text-base"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Tipo de Cirurgia */}
          <div className="space-y-2">
            <Label htmlFor="surgeryType" className="text-base">
              Tipo de Cirurgia *
            </Label>
            <Select
              value={formData.surgeryType}
              onValueChange={(value) => {
                setFormData({
                  ...formData,
                  surgeryType: value as QuickPatientFormData["surgeryType"],
                })
                // Save immediately on field change
                saveNow()
              }}
            >
              <SelectTrigger id="surgeryType" className="h-12 text-base" onBlur={handleBlur}>
                <SelectValue placeholder="Selecione o tipo de cirurgia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hemorroidectomia">{SURGERY_TYPE_LABELS['hemorroidectomia']}</SelectItem>
                <SelectItem value="fistula">{SURGERY_TYPE_LABELS['fistula']}</SelectItem>
                <SelectItem value="fissura">{SURGERY_TYPE_LABELS['fissurectomia']}</SelectItem>
                <SelectItem value="pilonidal">{SURGERY_TYPE_LABELS['pilonidal']}</SelectItem>
              </SelectContent>
            </Select>
            {errors.surgeryType && (
              <p className="text-sm text-destructive">{errors.surgeryType}</p>
            )}
          </div>

          {/* Data da Cirurgia */}
          <div className="space-y-2">
            <Label htmlFor="surgeryDate" className="text-base">
              Data da Cirurgia *
            </Label>
            <Input
              id="surgeryDate"
              type="date"
              value={formData.surgeryDate}
              onChange={(e) => {
                setFormData({ ...formData, surgeryDate: e.target.value })
                // Save immediately on date change
                saveNow()
              }}
              onBlur={handleBlur}
              className="h-12 text-base"
              aria-invalid={!!errors.surgeryDate}
            />
            {errors.surgeryDate && (
              <p className="text-sm text-destructive">{errors.surgeryDate}</p>
            )}
          </div>

          {/* Botão de Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Ativando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                ATIVAR ACOMPANHAMENTO
              </span>
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Tempo estimado: 30 segundos
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
