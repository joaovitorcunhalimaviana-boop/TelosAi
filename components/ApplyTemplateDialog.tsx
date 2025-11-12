"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, FileText, Star } from "lucide-react"
import { SURGERY_TYPE_LABELS, getTemplateSummary, TemplateData } from "@/lib/template-utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface Template {
  id: string
  name: string
  surgeryType: string
  templateData: string
  templateDataParsed?: TemplateData
  isDefault: boolean
}

interface ApplyTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  surgeryType: string
  patientId: string
  surgeryId: string
  onSuccess: () => void
}

export function ApplyTemplateDialog({
  open,
  onOpenChange,
  surgeryType,
  patientId,
  surgeryId,
  onSuccess
}: ApplyTemplateDialogProps) {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    if (open) {
      loadTemplates()
    }
  }, [open, surgeryType])

  async function loadTemplates() {
    try {
      setLoading(true)
      const response = await fetch(`/api/templates?surgeryType=${surgeryType}`)

      if (!response.ok) throw new Error("Erro ao carregar templates")

      const data = await response.json()
      setTemplates(data)

      // Auto-select default template if exists
      const defaultTemplate = data.find((t: Template) => t.isDefault)
      if (defaultTemplate) {
        setSelectedTemplate(defaultTemplate.id)
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar templates",
        description: "Não foi possível carregar os templates disponíveis",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleApply() {
    if (!selectedTemplate) {
      toast({
        title: "Selecione um template",
        description: "Por favor, selecione um template para aplicar",
        variant: "destructive"
      })
      return
    }

    try {
      setApplying(true)
      const response = await fetch(`/api/templates/${selectedTemplate}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, surgeryId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao aplicar template")
      }

      const result = await response.json()

      toast({
        title: "Template aplicado com sucesso",
        description: result.message || "Os dados do template foram aplicados ao paciente"
      })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Erro ao aplicar template",
        description: error.message || "Não foi possível aplicar o template",
        variant: "destructive"
      })
    } finally {
      setApplying(false)
    }
  }

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aplicar Template</DialogTitle>
          <DialogDescription>
            Selecione um template para aplicar ao paciente. Os dados serão mesclados com as informações existentes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">
                Nenhum template disponível para {SURGERY_TYPE_LABELS[surgeryType]}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Crie um template primeiro na página de Templates
              </p>
            </div>
          ) : (
            <>
              {/* Template Selection */}
              <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <div className="space-y-3">
                  {templates.map(template => {
                    const summary = template.templateDataParsed
                      ? getTemplateSummary(template.templateDataParsed)
                      : []

                    return (
                      <div
                        key={template.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedTemplate === template.id
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value={template.id} id={template.id} className="mt-1" />
                          <div className="flex-1">
                            <Label
                              htmlFor={template.id}
                              className="text-base font-semibold cursor-pointer flex items-center gap-2"
                            >
                              {template.name}
                              {template.isDefault && (
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </Label>

                            {summary.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {summary.slice(0, 4).map((item, index) => (
                                  <p key={index} className="text-sm text-gray-600">
                                    • {item}
                                  </p>
                                ))}
                                {summary.length > 4 && (
                                  <p className="text-sm text-gray-500 italic">
                                    +{summary.length - 4} mais configurações...
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </RadioGroup>

              {/* Preview of selected template */}
              {selectedTemplateData && selectedTemplateData.templateDataParsed && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Preview do Template
                  </h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    {getTemplateSummary(selectedTemplateData.templateDataParsed).map((item, index) => (
                      <p key={index}>• {item}</p>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={applying}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApply}
            disabled={!selectedTemplate || applying || loading}
          >
            {applying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aplicando...
              </>
            ) : (
              "Aplicar Template"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
