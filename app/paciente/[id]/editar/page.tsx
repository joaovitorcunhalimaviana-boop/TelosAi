"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Save, CheckCircle2, FileText, Download } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ApplyTemplateDialog } from "@/components/ApplyTemplateDialog"
import { SaveAsTemplateDialog } from "@/components/SaveAsTemplateDialog"
import { ResearchCompletionProgress } from "@/components/ResearchCompletionProgress"
import { validateResearchFields, type ValidationResult } from "@/lib/research-field-validator"
import { SurgeryRiskDisplay, SurgeryRiskNotAvailable } from "@/components/ml/surgery-risk-display"

// Section components
import { DadosBasicosSection } from "@/components/edit/DadosBasicosSection"
import { ComorbidadesSection } from "@/components/edit/ComorbidadesSection"
import { MedicacoesSection } from "@/components/edit/MedicacoesSection"
import { DetalhesCirurgicosSection } from "@/components/edit/DetalhesCirurgicosSection"
import { PreOperatorioSection } from "@/components/edit/PreOperatorioSection"
import { AnestesiaSection } from "@/components/edit/AnestesiaSection"
import { PrescricaoSection } from "@/components/edit/PrescricaoSection"
import { DescricaoCompletaSection } from "@/components/edit/DescricaoCompletaSection"

// New patient components
import { ConversationTimeline } from "@/components/patient/ConversationTimeline"
import { PainEvolutionChart } from "@/components/patient/PainEvolutionChart"
import { AIRecoveryInsights } from "@/components/patient/AIRecoveryInsights"

interface PatientData {
  id: string
  name: string
  cpf?: string
  dateOfBirth?: Date
  age?: number
  sex?: string
  phone: string
  email?: string
  isResearchParticipant?: boolean
  researchGroup?: string
  surgery: {
    id: string
    type: string
    date: Date
    hospital?: string
    durationMinutes?: number
    dataCompleteness: number
    // ML Prediction fields
    predictedRisk?: number
    predictedRiskLevel?: 'low' | 'medium' | 'high'
    mlModelVersion?: string
    mlPredictedAt?: Date
    mlFeatures?: string
  }
}

export default function EditPatientPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [patient, setPatient] = useState<PatientData | null>(null)
  const [activeTab, setActiveTab] = useState("basicos")
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set())
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [applyDialogOpen, setApplyDialogOpen] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [researchValidation, setResearchValidation] = useState<ValidationResult | null>(null)

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (patient) {
        autoSave()
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [patient])

  // Load patient data
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true)
      await loadPatient()
      setLoading(false)
    }

    loadInitialData()
  }, [params.id])

  // Validate research fields whenever patient data changes
  useEffect(() => {
    if (patient && patient.isResearchParticipant) {
      const validation = validateResearchFields(patient)
      setResearchValidation(validation)
    } else {
      setResearchValidation(null)
    }
  }, [patient])

  function calculateCompletedSections(data: PatientData): Set<string> {
    const completed = new Set<string>()

    // Dados básicos sempre completo (vem do express)
    completed.add("basicos")

    // Check other sections based on data presence
    if (data.surgery.hospital || data.surgery.durationMinutes) {
      completed.add("detalhes")
    }

    // Add more logic for other sections

    return completed
  }

  async function autoSave() {
    if (!patient) return

    try {
      await fetch(`/api/paciente/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patient)
      })
      setLastSaved(new Date())
    } catch (error) {
      console.error("Auto-save failed:", error)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await fetch(`/api/paciente/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patient)
      })

      toast({
        title: "Dados salvos com sucesso",
        description: "As informações do paciente foram atualizadas"
      })

      setLastSaved(new Date())
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  function markSectionComplete(sectionId: string) {
    setCompletedSections(prev => new Set([...prev, sectionId]))
  }

  function handleTemplateApplied() {
    // Reload patient data after template is applied
    loadPatient()
  }

  function handleTemplateSaved() {
    toast({
      title: "Template salvo",
      description: "Você pode aplicá-lo a outros pacientes na página de Templates"
    })
  }

  async function loadPatient() {
    try {
      const response = await fetch(`/api/paciente/${params.id}`)
      if (!response.ok) throw new Error("Paciente não encontrado")

      const result = await response.json()

      if (!result.success || !result.data) {
        throw new Error("Formato de dados inválido")
      }

      const patientData = result.data

      // Transform surgeries array to surgery object (take the latest one)
      if (patientData.surgeries && patientData.surgeries.length > 0) {
        patientData.surgery = patientData.surgeries[0]
      } else {
        // Fallback for patients with no surgery (avoids undefined crash)
        patientData.surgery = {
          id: "",
          type: "não informado",
          date: new Date(),
          dataCompleteness: 0
        }
      }

      setPatient(patientData)

      // Calculate completed sections
      const completed = calculateCompletedSections(patientData)
      setCompletedSections(completed)
    } catch (error) {
      console.error("Error loading patient:", error)
      toast({
        title: "Erro ao carregar dados",
        description: error instanceof Error ? error.message : "Não foi possível carregar os dados do paciente",
        variant: "destructive"
      })
    }
  }

  const sections = [
    { id: "basicos", label: "Dados Básicos", component: DadosBasicosSection },
    { id: "comorbidades", label: "Comorbidades", component: ComorbidadesSection },
    { id: "medicacoes", label: "Medicações", component: MedicacoesSection },
    { id: "detalhes", label: "Detalhes Cirúrgicos", component: DetalhesCirurgicosSection },
    { id: "preop", label: "Pré-Operatório", component: PreOperatorioSection },
    { id: "anestesia", label: "Anestesia", component: AnestesiaSection },
    { id: "prescricao", label: "Prescrição Pós-Op", component: PrescricaoSection },
    { id: "descricao", label: "Descrição Completa", component: DescricaoCompletaSection }
  ]

  const completionPercentage = (completedSections.size / sections.length) * 100

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do paciente...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Paciente não encontrado</CardTitle>
            <CardDescription>
              Não foi possível encontrar os dados deste paciente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E2E8F0] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{patient.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {patient.surgery.type.charAt(0).toUpperCase() + patient.surgery.type.slice(1)} - {" "}
                    {new Date(patient.surgery.date).toLocaleDateString("pt-BR")}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge
                    variant={completionPercentage >= 80 ? "default" : "secondary"}
                    className="mb-2"
                  >
                    {Math.round(completionPercentage)}% Completo
                  </Badge>
                  {lastSaved && (
                    <p className="text-xs text-gray-500">
                      Salvo às {lastSaved.toLocaleTimeString("pt-BR")}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {completedSections.size} de {sections.length} seções completas
                  </span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Research Completion Progress */}
        {patient?.isResearchParticipant && researchValidation && (
          <ResearchCompletionProgress
            validation={researchValidation}
            isResearchParticipant={true}
            className="mb-6"
            showDetails={true}
            onFieldClick={(fieldId) => {
              // Auto-scroll to field
              const element = document.getElementById(fieldId)
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                element.focus()
              }
            }}
          />
        )}

        {/* ML Risk Prediction */}
        {patient?.surgery?.predictedRisk !== null &&
          patient?.surgery?.predictedRisk !== undefined &&
          patient?.surgery?.predictedRiskLevel ? (
          <SurgeryRiskDisplay
            risk={patient.surgery.predictedRisk}
            level={patient.surgery.predictedRiskLevel}
            features={patient.surgery.mlFeatures}
            modelVersion={patient.surgery.mlModelVersion}
            predictedAt={patient.surgery.mlPredictedAt}
            showDetails={true}
            showFactors={true}
            className="mb-6"
          />
        ) : (
          <SurgeryRiskNotAvailable className="mb-6" />
        )}

        {/* AI Recovery Insights */}
        {patient?.surgery?.id && (
          <div className="mb-6">
            <AIRecoveryInsights surgeryId={patient.surgery.id} />
          </div>
        )}

        {/* Pain Evolution Chart */}
        <div className="mb-6">
          <PainEvolutionChart patientId={patient.id} />
        </div>

        {/* WhatsApp Conversation Timeline */}
        <div className="mb-6">
          <ConversationTimeline patientId={patient.id} />
        </div>

        {/* Main Form */}
        <Card>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-6">
                {sections.map(section => (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="relative"
                  >
                    {section.label}
                    {completedSections.has(section.id) && (
                      <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-green-600" />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {sections.map(section => {
                const SectionComponent = section.component
                return (
                  <TabsContent key={section.id} value={section.id}>
                    <SectionComponent
                      patient={patient}
                      onUpdate={setPatient}
                      onComplete={() => markSectionComplete(section.id)}
                      isResearchParticipant={patient?.isResearchParticipant || false}
                    />
                  </TabsContent>
                )
              })}
            </Tabs>

            {/* Template Actions */}
            <div className="flex justify-center gap-3 mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setApplyDialogOpen(true)}
                className="flex-1 max-w-xs"
              >
                <Download className="mr-2 h-4 w-4" />
                Aplicar Template
              </Button>

              <Button
                variant="outline"
                onClick={() => setSaveDialogOpen(true)}
                className="flex-1 max-w-xs"
              >
                <FileText className="mr-2 h-4 w-4" />
                Salvar como Template
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
              >
                Cancelar
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={autoSave}
                  disabled={saving}
                >
                  Salvar Rascunho
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Salvando..." : "Salvar e Concluir"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Dialogs */}
        {patient && (
          <>
            <ApplyTemplateDialog
              open={applyDialogOpen}
              onOpenChange={setApplyDialogOpen}
              surgeryType={patient.surgery.type}
              patientId={patient.id}
              surgeryId={patient.surgery.id}
              onSuccess={handleTemplateApplied}
            />

            <SaveAsTemplateDialog
              open={saveDialogOpen}
              onOpenChange={setSaveDialogOpen}
              patientData={patient}
              onSuccess={handleTemplateSaved}
            />
          </>
        )}
      </div>
    </div>
  )
}
