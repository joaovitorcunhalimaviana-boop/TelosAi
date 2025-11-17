"use client"

import { useState } from "react"
import { generateConsentTermHTML, type TermData } from "@/lib/consent-term-template"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Printer, Upload, Check, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ConsentTermViewerProps {
  data: TermData
  patientId: string
}

export function ConsentTermViewer({ data, patientId }: ConsentTermViewerProps) {
  const router = useRouter()
  const [physicalSignatureConfirmed, setPhysicalSignatureConfirmed] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [confirming, setConfirming] = useState(false)

  const termHtml = generateConsentTermHTML(data)

  const handlePrint = () => {
    // Abre janela de impressão
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(termHtml)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()

      toast.success("Termo pronto para impressão")
    }
  }

  const handleDownloadPDF = () => {
    // Abre o termo em nova aba para salvar como PDF
    const pdfWindow = window.open("", "_blank")
    if (pdfWindow) {
      pdfWindow.document.write(termHtml)
      pdfWindow.document.close()

      // Aguarda carregamento e dispara ctrl+p
      setTimeout(() => {
        pdfWindow.focus()
        pdfWindow.print()
      }, 250)

      toast.success("Use 'Salvar como PDF' na janela de impressão")
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Valida tipo de arquivo
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
      if (!allowedTypes.includes(file.type)) {
        toast.error("Apenas PDF ou imagens (JPG, PNG) são permitidos")
        return
      }

      // Valida tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Máximo: 5MB")
        return
      }

      setUploadedFile(file)
      toast.success(`Arquivo "${file.name}" selecionado`)
    }
  }

  const handleConfirm = async () => {
    if (!physicalSignatureConfirmed) {
      toast.error("Você precisa confirmar que obteve a assinatura física")
      return
    }

    setConfirming(true)

    try {
      // Se há arquivo, faz upload primeiro
      let fileUrl = null
      if (uploadedFile) {
        const formData = new FormData()
        formData.append("file", uploadedFile)
        formData.append("patientId", patientId)

        const uploadRes = await fetch("/api/consent-term/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) {
          throw new Error("Erro ao fazer upload do arquivo")
        }

        const uploadData = await uploadRes.json()
        fileUrl = uploadData.url
      }

      // Registra o consentimento no banco
      const res = await fetch("/api/consent-term/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          fileUrl,
          termData: data,
        }),
      })

      if (!res.ok) {
        throw new Error("Erro ao confirmar consentimento")
      }

      toast.success("Consentimento registrado com sucesso!")

      // Redireciona de volta ao dashboard do paciente
      setTimeout(() => {
        router.push(`/pacientes/${patientId}`)
      }, 1500)

    } catch (error) {
      console.error("Erro ao confirmar:", error)
      toast.error("Erro ao registrar consentimento. Tente novamente.")
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Instruções */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Como Obter o Consentimento
          </CardTitle>
          <CardDescription>
            Siga os passos abaixo para formalizar o consentimento do paciente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <p className="font-medium">Imprima o termo</p>
              <p className="text-sm text-muted-foreground">
                Use o botão "Imprimir Termo" abaixo para gerar uma cópia física
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <p className="font-medium">Obtenha a assinatura física</p>
              <p className="text-sm text-muted-foreground">
                Apresente o termo ao paciente, explique e colete a assinatura manuscrita
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <p className="font-medium">Upload do termo assinado (opcional)</p>
              <p className="text-sm text-muted-foreground">
                Escaneie ou fotografe o termo assinado e faça upload para arquivo digital
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <p className="font-medium">Confirme no sistema</p>
              <p className="text-sm text-muted-foreground">
                Marque a checkbox de confirmação e clique em "Confirmar Consentimento"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <Card>
        <CardHeader>
          <CardTitle>Ações do Termo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handlePrint} variant="default" size="lg">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Termo
            </Button>

            <Button onClick={handleDownloadPDF} variant="outline" size="lg">
              <Download className="mr-2 h-4 w-4" />
              Salvar como PDF
            </Button>
          </div>

          {/* Upload opcional */}
          <div className="border-t pt-4">
            <Label htmlFor="file-upload" className="block mb-2 font-medium">
              Upload do Termo Assinado (Opcional)
            </Label>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Escolher Arquivo
                </label>
              </Button>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,image/jpeg,image/png,image/jpg"
                onChange={handleFileSelect}
                className="hidden"
              />
              {uploadedFile && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  {uploadedFile.name}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Formatos aceitos: PDF, JPG, PNG (máx. 5MB)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Confirmação */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle>Confirmar Consentimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="physical-signature"
              checked={physicalSignatureConfirmed}
              onCheckedChange={(checked) => setPhysicalSignatureConfirmed(checked as boolean)}
            />
            <Label
              htmlFor="physical-signature"
              className="text-sm font-normal cursor-pointer leading-relaxed"
            >
              <span className="font-medium">Confirmo que obtive a assinatura física do paciente</span>
              <br />
              <span className="text-muted-foreground">
                O termo foi impresso, apresentado ao paciente, devidamente explicado, e a assinatura manuscrita foi coletada no documento físico.
              </span>
            </Label>
          </div>

          <Button
            onClick={handleConfirm}
            disabled={!physicalSignatureConfirmed || confirming}
            size="lg"
            className="w-full"
          >
            {confirming ? (
              <>Registrando...</>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Confirmar Consentimento
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview do termo */}
      <Card>
        <CardHeader>
          <CardTitle>Preview do Termo</CardTitle>
          <CardDescription>
            Visualização de como o termo será impresso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border rounded-lg p-6 bg-white max-h-[600px] overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: termHtml }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
