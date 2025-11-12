"use client"

import { useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Schema de validação completo (Admin com campos de pesquisa)
const completePatientSchema = z.object({
  // Dados básicos
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  dateOfBirth: z.string().min(1, "Data de nascimento é obrigatória"),
  sex: z.enum(["Masculino", "Feminino", "Outro"], {
    message: "Selecione o sexo",
  }),
  phone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, "WhatsApp inválido. Use o formato: (XX) XXXXX-XXXX"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  cpf: z.string().optional(),

  // Dados da cirurgia
  surgeryType: z.enum(["hemorroidectomia", "fistula", "fissura", "pilonidal"], {
    message: "Selecione o tipo de cirurgia",
  }),
  surgeryDate: z.string().min(1, "Data da cirurgia é obrigatória"),
  hospital: z.string().optional(),

  // Observações
  notes: z.string().optional(),
})

type CompletePatientFormData = z.infer<typeof completePatientSchema>

interface CadastroPacienteCompletoProps {
  onSubmit: (data: CompletePatientFormData & { age: number }) => Promise<void>
}

export function CadastroPacienteCompleto({ onSubmit }: CadastroPacienteCompletoProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [age, setAge] = useState<number | null>(null)

  // Estado para os campos do formulário
  const [formData, setFormData] = useState<CompletePatientFormData>({
    name: "",
    dateOfBirth: "",
    sex: "Masculino",
    phone: "",
    email: "",
    cpf: "",
    surgeryType: "hemorroidectomia",
    surgeryDate: new Date().toISOString().split("T")[0],
    hospital: "",
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

  // Máscara para CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData({ ...formData, phone: formatted })

    try {
      completePatientSchema.shape.phone.parse(formatted)
      setErrors({ ...errors, phone: "" })
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors({ ...errors, phone: err.issues[0]?.message || "" })
      }
    }
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setFormData({ ...formData, cpf: formatted })
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value })

    try {
      completePatientSchema.shape.name.parse(e.target.value)
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

    try {
      completePatientSchema.shape.dateOfBirth.parse(birthDate)
      setErrors({ ...errors, dateOfBirth: "" })
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors({ ...errors, dateOfBirth: err.issues[0]?.message || "" })
      }
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value })

    if (e.target.value) {
      try {
        completePatientSchema.shape.email.parse(e.target.value)
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
      const validatedData = completePatientSchema.parse(formData)

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
      {/* Header para Admin */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold text-amber-900">Modo Admin - Cadastro Completo</span>
        </div>
        <p className="text-sm text-amber-700 mt-1">
          Este formulário inclui todos os campos, incluindo dados para pesquisa científica.
        </p>
      </div>

      {/* Dados Pessoais */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-telos-blue border-b pb-2">Dados Pessoais</h3>

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              Idade
            </Label>
            <Input
              id="age"
              type="text"
              value={age !== null ? `${age} anos` : ""}
              disabled
              className="h-12 text-base bg-gray-50"
              placeholder="Auto"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sex" className="text-base">
              Sexo *
            </Label>
            <Select
              value={formData.sex}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  sex: value as CompletePatientFormData["sex"],
                })
              }
            >
              <SelectTrigger id="sex" className="h-12 text-base">
                <SelectValue placeholder="Selecione o sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Feminino">Feminino</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* CPF */}
        <div className="space-y-2">
          <Label htmlFor="cpf" className="text-base">
            CPF (opcional, para pesquisa)
          </Label>
          <Input
            id="cpf"
            type="text"
            value={formData.cpf}
            onChange={handleCPFChange}
            placeholder="000.000.000-00"
            maxLength={14}
            className="h-12 text-base"
          />
        </div>

        {/* WhatsApp e Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>

      {/* Dados da Cirurgia */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-telos-blue border-b pb-2">Dados da Cirurgia</h3>

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
                surgeryType: value as CompletePatientFormData["surgeryType"],
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

        {/* Data da Cirurgia e Hospital */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="space-y-2">
            <Label htmlFor="hospital" className="text-base">
              Hospital/Clínica (opcional)
            </Label>
            <Input
              id="hospital"
              type="text"
              value={formData.hospital}
              onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
              placeholder="Nome do hospital"
              className="h-12 text-base"
            />
          </div>
        </div>
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
        Após o cadastro, os follow-ups automáticos serão agendados e você poderá completar os dados restantes (80%)
      </p>
    </form>
  )
}
