"use client"

import { useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Schema de validação com Zod
const simplifiedPatientSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  dateOfBirth: z.string().min(1, "Data de nascimento é obrigatória"),
  phone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, "WhatsApp inválido. Use o formato: (XX) XXXXX-XXXX"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  surgeryType: z.enum(["hemorroidectomia", "fistula", "fissura", "pilonidal"], {
    message: "Selecione o tipo de cirurgia",
  }),
  surgeryDate: z.string().min(1, "Data da cirurgia é obrigatória"),
  notes: z.string().optional(),
})

type SimplifiedPatientFormData = z.infer<typeof simplifiedPatientSchema>

interface CadastroPacienteSimplificadoProps {
  onSubmit: (data: SimplifiedPatientFormData & { age: number }) => Promise<void>
}

export function CadastroPacienteSimplificado({ onSubmit }: CadastroPacienteSimplificadoProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [age, setAge] = useState<number | null>(null)

  // Estado para os campos do formulário
  const [formData, setFormData] = useState<SimplifiedPatientFormData>({
    name: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    surgeryType: "hemorroidectomia",
    surgeryDate: new Date().toISOString().split("T")[0], // Data de hoje como padrão
    notes: "",
  })

  // Calcular idade automaticamente
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null

    const today = new Date()
    const birth = new Date(birthDate)
    let calculatedAge = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      calculatedAge--
    }

    return calculatedAge
  }

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
      simplifiedPatientSchema.shape.phone.parse(formatted)
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
      simplifiedPatientSchema.shape.name.parse(e.target.value)
      setErrors({ ...errors, name: "" })
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors({ ...errors, name: err.issues[0]?.message || "" })
      }
    }
  }

  const handleDateOfBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const birthDate = e.target.value
    setFormData({ ...formData, dateOfBirth: birthDate })

    // Calcular idade
    const calculatedAge = calculateAge(birthDate)
    setAge(calculatedAge)

    // Validação em tempo real
    try {
      simplifiedPatientSchema.shape.dateOfBirth.parse(birthDate)
      setErrors({ ...errors, dateOfBirth: "" })
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors({ ...errors, dateOfBirth: err.issues[0]?.message || "" })
      }
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value })

    // Validação em tempo real
    if (e.target.value) {
      try {
        simplifiedPatientSchema.shape.email.parse(e.target.value)
        setErrors({ ...errors, email: "" })
      } catch (err) {
        if (err instanceof z.ZodError) {
          setErrors({ ...errors, email: err.issues[0]?.message || "" })
        }
      }
    } else {
      setErrors({ ...errors, email: "" })
    }
  }

  const handleSurgeryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value
    setFormData({ ...formData, surgeryDate: selectedDate })

    // Validar se a data não é futura
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const surgery = new Date(selectedDate)

    if (surgery > today) {
      setErrors({ ...errors, surgeryDate: "Data da cirurgia não pode ser futura" })
    } else {
      setErrors({ ...errors, surgeryDate: "" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validação completa
      const validatedData = simplifiedPatientSchema.parse(formData)

      // Validar data da cirurgia
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const surgery = new Date(validatedData.surgeryDate)

      if (surgery > today) {
        setErrors({ surgeryDate: "Data da cirurgia não pode ser futura" })
        setIsSubmitting(false)
        return
      }

      // Calcular idade final
      const finalAge = calculateAge(validatedData.dateOfBirth)
      if (!finalAge || finalAge < 0) {
        setErrors({ dateOfBirth: "Data de nascimento inválida" })
        setIsSubmitting(false)
        return
      }

      // Chamar a função de submit com a idade calculada
      await onSubmit({ ...validatedData, age: finalAge })
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

      {/* Data de Nascimento e Idade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth" className="text-base">
            Data de Nascimento *
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleDateOfBirthChange}
            className="h-12 text-base"
            aria-invalid={!!errors.dateOfBirth}
          />
          {errors.dateOfBirth && (
            <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="age" className="text-base">
            Idade (calculada automaticamente)
          </Label>
          <Input
            id="age"
            type="text"
            value={age !== null ? `${age} anos` : ""}
            disabled
            className="h-12 text-base bg-gray-50"
            placeholder="Preencha a data de nascimento"
          />
        </div>
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

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-base">
          Email (opcional)
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
              surgeryType: value as SimplifiedPatientFormData["surgeryType"],
            })
          }
        >
          <SelectTrigger id="surgeryType" className="h-12 text-base">
            <SelectValue placeholder="Selecione o tipo de cirurgia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hemorroidectomia">Hemorroidectomia</SelectItem>
            <SelectItem value="fistula">Fistulotomia/Fistulectomia</SelectItem>
            <SelectItem value="fissura">Fissurectomia</SelectItem>
            <SelectItem value="pilonidal">Exérese de Cisto Pilonidal</SelectItem>
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
          onChange={handleSurgeryDateChange}
          max={new Date().toISOString().split("T")[0]}
          className="h-12 text-base"
          aria-invalid={!!errors.surgeryDate}
        />
        {errors.surgeryDate && (
          <p className="text-sm text-destructive">{errors.surgeryDate}</p>
        )}
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-base">
          Observações (opcional)
        </Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Informações adicionais sobre o paciente ou cirurgia..."
          className="min-h-24 text-base"
          rows={4}
        />
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
            Cadastrando...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            CADASTRAR PACIENTE
          </span>
        )}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        Após o cadastro, os follow-ups automáticos serão agendados
      </p>
    </form>
  )
}
