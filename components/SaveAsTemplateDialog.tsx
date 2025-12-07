"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"
import { extractTemplateFromSurgery, SURGERY_TYPE_LABELS } from "@/lib/template-utils"

interface SaveAsTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patientData: any
  onSuccess: () => void
}

export function SaveAsTemplateDialog({
  open,
  onOpenChange,
  patientData,
  onSuccess
}: SaveAsTemplateDialogProps) {
  const { toast } = useToast()
  const [templateName, setTemplateName] = useState("")
  const [isDefault, setIsDefault] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!templateName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite um nome para o template",
        variant: "destructive"
      })
      return
    }

    try {
      setSaving(true)

      // Extract template data from patient data
      const templateData = extractTemplateFromSurgery(patientData)

      // Create template
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName,
          surgeryType: patientData.surgery.type,
          templateData,
          isDefault
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao salvar template")
      }

      toast({
        title: "Template salvo com sucesso",
        description: `"${templateName}" foi salvo e pode ser aplicado a outros pacientes`
      })

      // Reset form
      setTemplateName("")
      setIsDefault(false)

      onSuccess()
      onOpenChange(false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Erro ao salvar template",
        description: error.message || "Não foi possível salvar o template",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Generate a suggested name
  const suggestedName = patientData
    ? `Minha ${SURGERY_TYPE_LABELS[patientData.surgery.type]?.toLowerCase()} padrão`
    : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Salvar como Template</DialogTitle>
          <DialogDescription>
            Salve as configurações atuais como um template para reutilizar em outros pacientes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {patientData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>Tipo de cirurgia:</strong> {SURGERY_TYPE_LABELS[patientData.surgery.type]}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Os dados específicos do paciente (nome, datas, etc) não serão salvos, apenas as configurações de procedimento, anestesia e prescrição.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="templateName">Nome do Template</Label>
            <Input
              id="templateName"
              placeholder={suggestedName}
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              onFocus={(e) => {
                if (!templateName && suggestedName) {
                  setTemplateName(suggestedName)
                }
              }}
            />
            <p className="text-xs text-gray-500">
              Ex: &quot;Minha hemorroidectomia padrão&quot;, &quot;Fístula - protocolo Dr. João&quot;
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked as boolean)}
            />
            <Label
              htmlFor="isDefault"
              className="text-sm font-normal cursor-pointer"
            >
              Definir como template padrão para este tipo de cirurgia
            </Label>
          </div>

          {isDefault && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                Este template será automaticamente sugerido ao criar novos pacientes com {SURGERY_TYPE_LABELS[patientData?.surgery.type]?.toLowerCase()}.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
