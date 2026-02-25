"use client"

import React, { useState } from "react"
import { RegistrationWizard, WizardStep } from "./RegistrationWizard"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { z } from "zod"

/**
 * Example implementation of RegistrationWizard
 *
 * This example demonstrates a complete 8-step patient registration wizard
 * with validation, auto-save, and data persistence.
 */

// Data schemas for each step
const basicDataSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  dateOfBirth: z.string().min(1, "Data de nascimento é obrigatória"),
  sex: z.enum(["Masculino", "Feminino", "Outro"]),
  phone: z.string().min(10, "Telefone inválido"),
})

const addressSchema = z.object({
  street: z.string().min(3, "Endereço é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().length(2, "Estado deve ter 2 letras"),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
})

const medicalHistorySchema = z.object({
  hasAllergies: z.boolean(),
  allergies: z.string().optional(),
  hasMedications: z.boolean(),
  medications: z.string().optional(),
  hasConditions: z.boolean(),
  conditions: z.string().optional(),
})

export function RegistrationWizardExample() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isResearchMode, setIsResearchMode] = useState(false)

  // Form data state
  const [basicData, setBasicData] = useState({
    name: "",
    dateOfBirth: "",
    sex: "Masculino",
    phone: "",
  })

  const [addressData, setAddressData] = useState({
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  })

  const [medicalHistory, setMedicalHistory] = useState({
    hasAllergies: false,
    allergies: "",
    hasMedications: false,
    medications: "",
    hasConditions: false,
    conditions: "",
  })

  const [contactData, setContactData] = useState({
    emergencyContact: "",
    emergencyPhone: "",
    relationship: "",
  })

  const [insuranceData, setInsuranceData] = useState({
    hasInsurance: false,
    insuranceName: "",
    insuranceNumber: "",
  })

  const [surgeryData, setSurgeryData] = useState({
    surgeryType: "",
    surgeryDate: "",
    hospital: "",
  })

  const [consentData, setConsentData] = useState({
    dataConsent: false,
    researchConsent: false,
    whatsappConsent: false,
  })

  const [notes, setNotes] = useState("")

  /**
   * Step 1: Basic Data
   */
  const step1: WizardStep = {
    id: "basic-data",
    title: "Dados Básicos",
    description: "Informações pessoais do paciente",
    fields: (
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nome Completo *</Label>
          <Input
            id="name"
            value={basicData.name}
            onChange={(e) => setBasicData({ ...basicData, name: e.target.value })}
            placeholder="Digite o nome completo"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dateOfBirth">Data de Nascimento *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={basicData.dateOfBirth}
              onChange={(e) => setBasicData({ ...basicData, dateOfBirth: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefone/WhatsApp *</Label>
            <Input
              id="phone"
              value={basicData.phone}
              onChange={(e) => setBasicData({ ...basicData, phone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <div>
          <Label>Sexo *</Label>
          <RadioGroup
            value={basicData.sex}
            onValueChange={(value) => setBasicData({ ...basicData, sex: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Masculino" id="male" />
              <Label htmlFor="male" className="font-normal">Masculino</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Feminino" id="female" />
              <Label htmlFor="female" className="font-normal">Feminino</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Outro" id="other" />
              <Label htmlFor="other" className="font-normal">Outro</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    ),
    validate: async () => {
      try {
        basicDataSchema.parse(basicData)
        return true
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("Validation errors:", error.issues)
        }
        return false
      }
    },
    onSave: async () => {
      // Save to localStorage or API
      localStorage.setItem("registration_step1", JSON.stringify(basicData))
      console.log("Step 1 saved:", basicData)
    },
  }

  /**
   * Step 2: Address
   */
  const step2: WizardStep = {
    id: "address",
    title: "Endereço",
    description: "Endereço residencial do paciente",
    fields: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="street">Rua/Avenida *</Label>
            <Input
              id="street"
              value={addressData.street}
              onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
              placeholder="Nome da rua"
            />
          </div>
          <div>
            <Label htmlFor="number">Número *</Label>
            <Input
              id="number"
              value={addressData.number}
              onChange={(e) => setAddressData({ ...addressData, number: e.target.value })}
              placeholder="123"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="neighborhood">Bairro *</Label>
            <Input
              id="neighborhood"
              value={addressData.neighborhood}
              onChange={(e) => setAddressData({ ...addressData, neighborhood: e.target.value })}
              placeholder="Nome do bairro"
            />
          </div>
          <div>
            <Label htmlFor="zipCode">CEP *</Label>
            <Input
              id="zipCode"
              value={addressData.zipCode}
              onChange={(e) => setAddressData({ ...addressData, zipCode: e.target.value })}
              placeholder="12345-678"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              value={addressData.city}
              onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
              placeholder="Nome da cidade"
            />
          </div>
          <div>
            <Label htmlFor="state">Estado (UF) *</Label>
            <Input
              id="state"
              value={addressData.state}
              onChange={(e) => setAddressData({ ...addressData, state: e.target.value.toUpperCase() })}
              placeholder="SP"
              maxLength={2}
            />
          </div>
        </div>
      </div>
    ),
    validate: async () => {
      try {
        addressSchema.parse(addressData)
        return true
      } catch {
        return false
      }
    },
    onSave: async () => {
      localStorage.setItem("registration_step2", JSON.stringify(addressData))
      console.log("Step 2 saved:", addressData)
    },
  }

  /**
   * Step 3: Medical History
   */
  const step3: WizardStep = {
    id: "medical-history",
    title: "Histórico Médico",
    description: "Alergias, medicações e condições pré-existentes",
    fields: (
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasAllergies"
              checked={medicalHistory.hasAllergies}
              onCheckedChange={(checked) =>
                setMedicalHistory({ ...medicalHistory, hasAllergies: checked as boolean })
              }
            />
            <Label htmlFor="hasAllergies" className="font-semibold">
              Possui alergias?
            </Label>
          </div>
          {medicalHistory.hasAllergies && (
            <Textarea
              value={medicalHistory.allergies}
              onChange={(e) => setMedicalHistory({ ...medicalHistory, allergies: e.target.value })}
              placeholder="Descreva as alergias (medicamentos, alimentos, etc.)"
              rows={3}
            />
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasMedications"
              checked={medicalHistory.hasMedications}
              onCheckedChange={(checked) =>
                setMedicalHistory({ ...medicalHistory, hasMedications: checked as boolean })
              }
            />
            <Label htmlFor="hasMedications" className="font-semibold">
              Faz uso de medicações?
            </Label>
          </div>
          {medicalHistory.hasMedications && (
            <Textarea
              value={medicalHistory.medications}
              onChange={(e) => setMedicalHistory({ ...medicalHistory, medications: e.target.value })}
              placeholder="Liste as medicações em uso e dosagens"
              rows={3}
            />
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasConditions"
              checked={medicalHistory.hasConditions}
              onCheckedChange={(checked) =>
                setMedicalHistory({ ...medicalHistory, hasConditions: checked as boolean })
              }
            />
            <Label htmlFor="hasConditions" className="font-semibold">
              Possui condições médicas pré-existentes?
            </Label>
          </div>
          {medicalHistory.hasConditions && (
            <Textarea
              value={medicalHistory.conditions}
              onChange={(e) => setMedicalHistory({ ...medicalHistory, conditions: e.target.value })}
              placeholder="Descreva as condições (diabetes, hipertensão, etc.)"
              rows={3}
            />
          )}
        </div>
      </div>
    ),
    validate: async () => {
      // Medical history is optional but if checked, must have description
      if (medicalHistory.hasAllergies && !medicalHistory.allergies?.trim()) return false
      if (medicalHistory.hasMedications && !medicalHistory.medications?.trim()) return false
      if (medicalHistory.hasConditions && !medicalHistory.conditions?.trim()) return false
      return true
    },
    onSave: async () => {
      localStorage.setItem("registration_step3", JSON.stringify(medicalHistory))
    },
  }

  /**
   * Step 4: Emergency Contact
   */
  const step4: WizardStep = {
    id: "emergency-contact",
    title: "Contato de Emergência",
    description: "Informações de contato para emergências",
    fields: (
      <div className="space-y-4">
        <div>
          <Label htmlFor="emergencyContact">Nome do Contato *</Label>
          <Input
            id="emergencyContact"
            value={contactData.emergencyContact}
            onChange={(e) => setContactData({ ...contactData, emergencyContact: e.target.value })}
            placeholder="Nome completo"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="emergencyPhone">Telefone *</Label>
            <Input
              id="emergencyPhone"
              value={contactData.emergencyPhone}
              onChange={(e) => setContactData({ ...contactData, emergencyPhone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div>
            <Label htmlFor="relationship">Parentesco *</Label>
            <Input
              id="relationship"
              value={contactData.relationship}
              onChange={(e) => setContactData({ ...contactData, relationship: e.target.value })}
              placeholder="Ex: Cônjuge, Filho(a), etc."
            />
          </div>
        </div>
      </div>
    ),
    validate: async () => {
      return (
        contactData.emergencyContact.length >= 3 &&
        contactData.emergencyPhone.length >= 10 &&
        contactData.relationship.length >= 2
      )
    },
    onSave: async () => {
      localStorage.setItem("registration_step4", JSON.stringify(contactData))
    },
  }

  /**
   * Step 5: Insurance
   */
  const step5: WizardStep = {
    id: "insurance",
    title: "Convênio Médico",
    description: "Informações sobre plano de saúde (opcional)",
    fields: (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasInsurance"
            checked={insuranceData.hasInsurance}
            onCheckedChange={(checked) =>
              setInsuranceData({ ...insuranceData, hasInsurance: checked as boolean })
            }
          />
          <Label htmlFor="hasInsurance" className="font-semibold">
            Possui convênio médico?
          </Label>
        </div>

        {insuranceData.hasInsurance && (
          <div className="space-y-4 pl-6">
            <div>
              <Label htmlFor="insuranceName">Nome do Convênio</Label>
              <Input
                id="insuranceName"
                value={insuranceData.insuranceName}
                onChange={(e) => setInsuranceData({ ...insuranceData, insuranceName: e.target.value })}
                placeholder="Ex: Unimed, Bradesco Saúde, etc."
              />
            </div>
            <div>
              <Label htmlFor="insuranceNumber">Número da Carteirinha</Label>
              <Input
                id="insuranceNumber"
                value={insuranceData.insuranceNumber}
                onChange={(e) => setInsuranceData({ ...insuranceData, insuranceNumber: e.target.value })}
                placeholder="Número do plano"
              />
            </div>
          </div>
        )}

        {!insuranceData.hasInsurance && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Caso não possua convênio, o atendimento será realizado de forma particular.
            </p>
          </div>
        )}
      </div>
    ),
    validate: async () => {
      if (!insuranceData.hasInsurance) return true
      return insuranceData.insuranceName.length >= 3 && insuranceData.insuranceNumber.length >= 3
    },
    onSave: async () => {
      localStorage.setItem("registration_step5", JSON.stringify(insuranceData))
    },
  }

  /**
   * Step 6: Surgery Details
   */
  const step6: WizardStep = {
    id: "surgery-details",
    title: "Detalhes da Cirurgia",
    description: "Informações sobre o procedimento cirúrgico",
    fields: (
      <div className="space-y-4">
        <div>
          <Label htmlFor="surgeryType">Tipo de Cirurgia *</Label>
          <Input
            id="surgeryType"
            value={surgeryData.surgeryType}
            onChange={(e) => setSurgeryData({ ...surgeryData, surgeryType: e.target.value })}
            placeholder="Ex: Hemorroidectomia"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="surgeryDate">Data da Cirurgia *</Label>
            <Input
              id="surgeryDate"
              type="date"
              value={surgeryData.surgeryDate}
              onChange={(e) => setSurgeryData({ ...surgeryData, surgeryDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="hospital">Hospital</Label>
            <Input
              id="hospital"
              value={surgeryData.hospital}
              onChange={(e) => setSurgeryData({ ...surgeryData, hospital: e.target.value })}
              placeholder="Nome do hospital"
            />
          </div>
        </div>
      </div>
    ),
    validate: async () => {
      return surgeryData.surgeryType.length >= 3 && surgeryData.surgeryDate.length > 0
    },
    onSave: async () => {
      localStorage.setItem("registration_step6", JSON.stringify(surgeryData))
    },
  }

  /**
   * Step 7: Consent Terms
   */
  const step7: WizardStep = {
    id: "consent",
    title: "Termos de Consentimento",
    description: "Leia e aceite os termos necessários",
    fields: (
      <div className="space-y-6">
        <div className="p-4 border-2 border-[#0D7377] rounded-lg space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="dataConsent"
              checked={consentData.dataConsent}
              onCheckedChange={(checked) =>
                setConsentData({ ...consentData, dataConsent: checked as boolean })
              }
            />
            <div>
              <Label htmlFor="dataConsent" className="font-semibold text-base">
                Consentimento de Dados *
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Autorizo o uso dos meus dados pessoais e médicos para fins de acompanhamento
                pós-operatório e tratamento médico, conforme a LGPD.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-2 border-[#C9A84C] rounded-lg space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="researchConsent"
              checked={consentData.researchConsent}
              onCheckedChange={(checked) =>
                setConsentData({ ...consentData, researchConsent: checked as boolean })
              }
            />
            <div>
              <Label htmlFor="researchConsent" className="font-semibold text-base">
                Participação em Pesquisa (Opcional)
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Autorizo o uso dos meus dados de forma anônima para pesquisas científicas
                que possam contribuir para o avanço da medicina.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-2 border-gray-300 rounded-lg space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="whatsappConsent"
              checked={consentData.whatsappConsent}
              onCheckedChange={(checked) =>
                setConsentData({ ...consentData, whatsappConsent: checked as boolean })
              }
            />
            <div>
              <Label htmlFor="whatsappConsent" className="font-semibold text-base">
                Comunicação via WhatsApp (Opcional)
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Autorizo o envio de mensagens pelo WhatsApp para acompanhamento,
                lembretes e orientações pós-operatórias.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
    validate: async () => {
      // Only data consent is required
      return consentData.dataConsent
    },
    onSave: async () => {
      localStorage.setItem("registration_step7", JSON.stringify(consentData))
    },
  }

  /**
   * Step 8: Additional Notes
   */
  const step8: WizardStep = {
    id: "notes",
    title: "Observações Adicionais",
    description: "Informações complementares (opcional)",
    fields: (
      <div className="space-y-4">
        <div>
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione qualquer informação adicional relevante..."
            rows={8}
            className="resize-none"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Este campo é opcional. Use-o para adicionar qualquer informação que considere importante.
          </p>
        </div>
      </div>
    ),
    validate: async () => {
      // Notes are always valid (optional)
      return true
    },
    onSave: async () => {
      localStorage.setItem("registration_step8", JSON.stringify({ notes }))
    },
  }

  // Combine all steps
  const wizardSteps: WizardStep[] = [
    step1,
    step2,
    step3,
    step4,
    step5,
    step6,
    step7,
    step8,
  ]

  /**
   * Handle wizard completion
   */
  const handleComplete = async () => {
    // Combine all data
    const completeData = {
      basicData,
      addressData,
      medicalHistory,
      contactData,
      insuranceData,
      surgeryData,
      consentData,
      notes,
      completedAt: new Date().toISOString(),
    }

    console.log("Registration completed:", completeData)

    // Save to API or database
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Clear localStorage
      for (let i = 1; i <= 8; i++) {
        localStorage.removeItem(`registration_step${i}`)
      }

      // Redirect or show success message
      alert("Cadastro concluído com sucesso!")
    } catch (error) {
      console.error("Error completing registration:", error)
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#161B27] to-white py-12 px-4">
      <RegistrationWizard
        steps={wizardSteps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onComplete={handleComplete}
        isResearchMode={isResearchMode}
      />
    </div>
  )
}
