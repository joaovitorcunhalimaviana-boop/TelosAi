"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail } from "lucide-react" // Added: Email icon

// Schema de validação com Zod
const quickPatientSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, "WhatsApp inválido. Use o formato: (XX) XXXXX-XXXX"),
  email: z.string().email("Email inválido").optional().or(z.literal("")), // Added: Optional email field with validation
  surgeryType: z.enum(["hemorroidectomia", "fistula", "fissura", "pilonidal"], {
    message: "Selecione o tipo de cirurgia",
  }),
  surgeryDate: z.string().min(1, "Data da cirurgia é obrigatória"),
})

type QuickPatientFormData = z.infer<typeof quickPatientSchema>

interface QuickPatientFormProps {
  onSubmit: (data: QuickPatientFormData) => Promise<void>
}

export function QuickPatientForm({ onSubmit }: QuickPatientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Estado para os campos do formulário
  const [formData, setFormData] = useState<QuickPatientFormData>({
    name: "",
    phone: "",
    email: "", // Added: Email field to form state
    surgeryType: "hemorroidectomia",
    surgeryDate: new Date().toISOString().split("T")[0], // Data de hoje como padrão
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

  // Added: Email change handler with real-time validation
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validação completa
      const validatedData = quickPatientSchema.parse(formData)

      // Chamar a função de submit
      await onSubmit(validatedData)
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
          placeholder="(XX) XXXXX-XXXX"
          maxLength={15}
          className="h-12 text-base"
          aria-invalid={!!errors.phone}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone}</p>
        )}
      </div>

      {/* Added: Email field (optional) */}
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
          onValueChange={(value) =>
            setFormData({
              ...formData,
              surgeryType: value as QuickPatientFormData["surgeryType"],
            })
          }
        >
          <SelectTrigger id="surgeryType" className="h-12 text-base">
            <SelectValue placeholder="Selecione o tipo de cirurgia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hemorroidectomia">Hemorroidectomia</SelectItem>
            <SelectItem value="fistula">Fístula Anal</SelectItem>
            <SelectItem value="fissura">Fissura Anal</SelectItem>
            <SelectItem value="pilonidal">Doença Pilonidal</SelectItem>
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
          onChange={(e) =>
            setFormData({ ...formData, surgeryDate: e.target.value })
          }
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
  )
}
