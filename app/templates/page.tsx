"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Plus,
  FileText,
  Trash2,
  Star,
  StarOff,
  Eye,
  Calendar,
  Stethoscope
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SURGERY_TYPE_LABELS, getTemplateSummary, TemplateData } from "@/lib/template-utils"

interface Template {
  id: string
  createdAt: Date
  updatedAt: Date
  name: string
  surgeryType: string
  templateData: string
  templateDataParsed?: TemplateData
  isDefault: boolean
}

export default function TemplatesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [selectedType, setSelectedType] = useState<string>("all")

  useEffect(() => {
    loadTemplates()
  }, [selectedType])

  async function loadTemplates() {
    try {
      const url = selectedType === "all"
        ? "/api/templates"
        : `/api/templates?surgeryType=${selectedType}`

      const response = await fetch(url)
      if (!response.ok) throw new Error("Erro ao carregar templates")

      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      toast({
        title: "Erro ao carregar templates",
        description: "Não foi possível carregar os templates",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/templates?id=${id}`, {
        method: "DELETE"
      })

      if (!response.ok) throw new Error("Erro ao excluir template")

      toast({
        title: "Template excluído",
        description: "O template foi removido com sucesso"
      })

      loadTemplates()
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o template",
        variant: "destructive"
      })
    } finally {
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
    }
  }

  async function toggleDefault(template: Template) {
    try {
      const response = await fetch("/api/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: template.id,
          isDefault: !template.isDefault
        })
      })

      if (!response.ok) throw new Error("Erro ao atualizar template")

      toast({
        title: template.isDefault ? "Removido como padrão" : "Definido como padrão",
        description: template.isDefault
          ? "Este template não será mais aplicado automaticamente"
          : "Este template será aplicado automaticamente a novos pacientes"
      })

      loadTemplates()
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o template",
        variant: "destructive"
      })
    }
  }

  const surgeryTypes = [
    { value: "all", label: "Todos os Tipos" },
    { value: "hemorroidectomia", label: "Hemorroidectomia" },
    { value: "fistula", label: "Fístula" },
    { value: "fissura", label: "Fissura" },
    { value: "pilonidal", label: "Pilonidal" }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando templates...</p>
        </div>
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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Templates de Procedimentos
              </h1>
              <p className="text-gray-600">
                Salve e aplique suas configurações padrão de cirurgias
              </p>
            </div>

            <Button onClick={() => router.push("/templates/novo")}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Template
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2 flex-wrap">
              {surgeryTypes.map(type => (
                <Button
                  key={type.value}
                  variant={selectedType === type.value ? "default" : "outline"}
                  onClick={() => setSelectedType(type.value)}
                  size="sm"
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Templates List */}
        {templates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum template encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedType === "all"
                  ? "Crie seu primeiro template para agilizar cadastros"
                  : `Nenhum template para ${SURGERY_TYPE_LABELS[selectedType]}`}
              </p>
              <Button onClick={() => router.push("/templates/novo")}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => {
              const summary = template.templateDataParsed
                ? getTemplateSummary(template.templateDataParsed)
                : []

              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {template.name}
                          {template.isDefault && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          <Badge variant="outline" className="mt-1">
                            <Stethoscope className="h-3 w-3 mr-1" />
                            {SURGERY_TYPE_LABELS[template.surgeryType] || template.surgeryType}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Summary */}
                    {summary.length > 0 && (
                      <div className="mb-4 space-y-1">
                        {summary.slice(0, 3).map((item, index) => (
                          <p key={index} className="text-sm text-gray-600">
                            • {item}
                          </p>
                        ))}
                        {summary.length > 3 && (
                          <p className="text-sm text-gray-500 italic">
                            +{summary.length - 3} mais...
                          </p>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <Calendar className="h-3 w-3" />
                      Criado em {new Date(template.createdAt).toLocaleDateString("pt-BR")}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDefault(template)}
                        title={template.isDefault ? "Remover como padrão" : "Definir como padrão"}
                      >
                        {template.isDefault ? (
                          <StarOff className="h-4 w-4" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTemplateToDelete(template.id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => templateToDelete && handleDelete(templateToDelete)}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Preview Dialog */}
        {previewTemplate && (
          <AlertDialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
            <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <AlertDialogHeader>
                <AlertDialogTitle>{previewTemplate.name}</AlertDialogTitle>
                <AlertDialogDescription>
                  <Badge variant="outline">
                    {SURGERY_TYPE_LABELS[previewTemplate.surgeryType]}
                  </Badge>
                  {previewTemplate.isDefault && (
                    <Badge variant="default" className="ml-2">
                      Template Padrão
                    </Badge>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-4 text-sm">
                {previewTemplate.templateDataParsed && (
                  <>
                    {/* Anestesia */}
                    {previewTemplate.templateDataParsed.anesthesia && (
                      <div>
                        <h4 className="font-semibold mb-2">Anestesia</h4>
                        <div className="bg-gray-50 p-3 rounded space-y-1">
                          {previewTemplate.templateDataParsed.anesthesia.type && (
                            <p>Tipo: {previewTemplate.templateDataParsed.anesthesia.type}</p>
                          )}
                          {previewTemplate.templateDataParsed.anesthesia.pudendoBlock && (
                            <p>Bloqueio Pudendo: Sim ({previewTemplate.templateDataParsed.anesthesia.pudendoTechnique})</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Prescrição */}
                    {previewTemplate.templateDataParsed.prescription && (
                      <div>
                        <h4 className="font-semibold mb-2">Prescrição</h4>
                        <div className="bg-gray-50 p-3 rounded space-y-2">
                          {previewTemplate.templateDataParsed.prescription.ointments && (
                            <div>
                              <p className="font-medium">Pomadas:</p>
                              {previewTemplate.templateDataParsed.prescription.ointments.map((o, i) => (
                                <p key={i} className="text-sm ml-2">
                                  • {o.name} - {o.frequency} por {o.durationDays} dias
                                </p>
                              ))}
                            </div>
                          )}
                          {previewTemplate.templateDataParsed.prescription.medications && (
                            <div>
                              <p className="font-medium">Medicações:</p>
                              {previewTemplate.templateDataParsed.prescription.medications.map((m, i) => (
                                <p key={i} className="text-sm ml-2">
                                  • {m.name} {m.dose} - {m.frequency} por {m.durationDays} dias
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Fechar</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}
