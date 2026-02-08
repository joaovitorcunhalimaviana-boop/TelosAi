"use client"

import { useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getNowBrasilia, startOfDayBrasilia } from "@/lib/date-utils"
import { SURGERY_TYPE_LABELS } from "@/lib/constants/surgery-types"

// Schema de validação com Zod
const simplifiedPatientSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  dateOfBirth: z.string().optional().or(z.literal("")),
  phone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, "WhatsApp inválido. Use o formato: (XX) XXXXX-XXXX"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  surgeryType: z.string().min(1, "Tipo de cirurgia é obrigatório"),
  surgeryDate: z.string().min(1, "Data da cirurgia é obrigatória"),
  notes: z.string().optional(),
  hospital: z.string().min(1, "Hospital é obrigatório").default("Clínica"),
})

type SimplifiedPatientFormData = z.infer<typeof simplifiedPatientSchema>

interface CadastroPacienteSimplificadoProps {
  onSubmit: (data: SimplifiedPatientFormData & { age?: number }) => Promise<void>
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
    surgeryType: "", // Campo de texto livre
    surgeryDate: new Date().toISOString().split("T")[0],
    notes: "",
    hospital: "Clínica",
  })

  // Calcular idade automaticamente (apenas se data preenchida)
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null

    const today = new Date()
    const birth = new Date(birthDate)

    if (isNaN(birth.getTime())) return null

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
    if (formatted.length >= 14) {
      try {
        simplifiedPatientSchema.shape.phone.parse(formatted)
        setErrors(prev => ({ ...prev, phone: "" }))
      } catch (err) {
        // Silently fail during typing until complete
      }
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value })
    if (e.target.value.length > 2) setErrors(prev => ({ ...prev, name: "" }))
  }

  const handleDateOfBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const birthDate = e.target.value
    setFormData({ ...formData, dateOfBirth: birthDate })

    // Calcular idade se data válida
    const calculatedAge = calculateAge(birthDate)
    setAge(calculatedAge)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value })
  }

  const handleSurgeryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, surgeryDate: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validação completa
      const validatedData = simplifiedPatientSchema.parse(formData)

      // Validar data da cirurgia (usar horário de Brasília)
      // Usar Intl.DateTimeFormat para obter a data correta no fuso de Brasília
      const now = new Date()
      const brazilFormatter = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
      const todayStr = brazilFormatter.format(now) // Formato YYYY-MM-DD

      if (validatedData.surgeryDate > todayStr) {
        setErrors({ surgeryDate: `Data da cirurgia não pode ser futura (Hoje é ${todayStr.split('-').reverse().join('/')})` })
        setIsSubmitting(false)
        return
      }

      // Calcular idade final se data de nascimento existir
      const finalAge = validatedData.dateOfBirth ? calculateAge(validatedData.dateOfBirth) : undefined

      // Chamar a função de submit com a idade calculada (se houver)
      await onSubmit({ ...validatedData, age: finalAge || undefined })
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome Completo */}
        <div className="space-y-2 col-span-2">
          <Label htmlFor="name" className="text-base font-semibold">
            Nome do Paciente *
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
          <Label htmlFor="phone" className="text-base font-semibold">
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

        {/* Data de Nascimento (Opcional) */}
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth" className="text-base text-gray-600">
            Data de Nascimento (Opcional)
          </Label>
          <div className="flex gap-2">
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleDateOfBirthChange}
              className="h-12 text-base flex-1"
            />
            {age !== null && (
              <div className="h-12 flex items-center justify-center px-4 bg-gray-100 rounded-md border text-gray-600 font-medium min-w-[3rem]">
                {age}a
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mt-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <span className="text-lg">🏥</span> Dados da Cirurgia
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo de Cirurgia (Select com opções fixas) */}
          <div className="space-y-2">
            <Label htmlFor="surgeryType" className="text-base">
              Tipo de Cirurgia *
            </Label>
            <Select
              value={formData.surgeryType}
              onValueChange={(value) => {
                setFormData({ ...formData, surgeryType: value })
                if (value) setErrors(prev => ({ ...prev, surgeryType: "" }))
              }}
            >
              <SelectTrigger id="surgeryType" className="h-12 text-base" aria-invalid={!!errors.surgeryType}>
                <SelectValue placeholder="Selecione o tipo de cirurgia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hemorroidectomia">{SURGERY_TYPE_LABELS['hemorroidectomia']}</SelectItem>
                <SelectItem value="fistula">{SURGERY_TYPE_LABELS['fistula']}</SelectItem>
                <SelectItem value="fissura">{SURGERY_TYPE_LABELS['fissurectomia']}</SelectItem>
                <SelectItem value="pilonidal">{SURGERY_TYPE_LABELS['doenca_pilonidal']}</SelectItem>
              </SelectContent>
            </Select>
            {errors.surgeryType && (
              <p className="text-sm text-destructive">{errors.surgeryType}</p>
            )}
          </div>

          {/* Hospital */}
          <div className="space-y-2">
            <Label htmlFor="hospital" className="text-base">
              Hospital
            </Label>
            <Input
              id="hospital"
              type="text"
              value={formData.hospital}
              onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
              placeholder="Ex: Clínica, Hospital X..."
              className="h-12 text-base"
              aria-invalid={!!errors.hospital}
            />
            {errors.hospital && (
              <p className="text-sm text-destructive">{errors.hospital}</p>
            )}
          </div>

          {/* Data da Cirurgia */}
          <div className="space-y-2 col-span-2 md:col-span-1">
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
        </div>
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-base">
          Observações (opcional)
        </Label>
        <Textarea
          id="notes"
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Informações adicionais..."
          className="min-h-20 text-base"
          rows={3}
        />
      </div>

      {/* Botão de Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-14 text-lg font-bold bg-[#0A2647] hover:bg-[#0D3156] text-white shadow-lg transition-all"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            Cadastrando...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            ✅ ADICIONAR PACIENTE
          </span>
        )}
      </Button>

      <p className="text-xs text-center text-gray-500 mt-2">
        O paciente receberá uma mensagem automática no dia seguinte à cirurgia.
      </p>
    </form>
  )
}
