/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Download, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ExportPatientPDFButtonProps {
  patientId: string
  patientName: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  showIcon?: boolean
  showText?: boolean
}

export function ExportPatientPDFButton({
  patientId,
  patientName,
  variant = "outline",
  size = "sm",
  showIcon = true,
  showText = true,
}: ExportPatientPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    setIsExporting(true)

    try {
      const response = await fetch("/api/export/patient-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patientId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao exportar PDF")
      }

      // Baixa o PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `paciente-${patientName.replace(/\s/g, "_")}-${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("PDF exportado com sucesso!")
    } catch (error: any) {
      console.error("Erro ao exportar PDF:", error)
      toast.error(error.message || "Erro ao exportar PDF")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting}
      title="Exportar relatório em PDF"
    >
      {isExporting ? (
        <>
          {showIcon && <Loader2 className="h-4 w-4 animate-spin" />}
          {showText && size !== "icon" && <span className="ml-2">Exportando...</span>}
        </>
      ) : (
        <>
          {showIcon && <FileText className="h-4 w-4" />}
          {showText && size !== "icon" && <span className="ml-2">Exportar PDF</span>}
        </>
      )}
    </Button>
  )
}
