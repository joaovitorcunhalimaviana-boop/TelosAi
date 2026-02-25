"use client"

import { useState } from 'react'
import { generatePseudonymousId } from '@/lib/research-pseudonymization'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Search, AlertTriangle, Copy, Check } from "lucide-react"

interface Patient {
  id: string
  name: string
  phone: string
  researchGroup: string | null
}

interface PseudonymMappingTableProps {
  patients: Patient[]
  researchId: string
  researchTitle: string
}

/**
 * Tabela de Mapeamento Pseudônimo → Dados Reais
 *
 * ⚠️ SENSÍVEL: Esta tabela NÃO deve ser exportada!
 * - Mostra apenas para o pesquisador
 * - Permite re-identificar pacientes quando necessário
 * - Conforme Art. 13, § 3º da LGPD (pseudonimização para pesquisa)
 */
export function PseudonymMappingTable({
  patients,
  researchId,
  researchTitle,
}: PseudonymMappingTableProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Gera mapeamentos
  const mappings = patients.map(patient => ({
    pseudonymousId: generatePseudonymousId(patient.id, researchId),
    patientId: patient.id,
    patientName: patient.name,
    patientPhone: patient.phone,
    researchGroup: patient.researchGroup,
  }))

  // Filtro de busca
  const filteredMappings = mappings.filter(m =>
    m.pseudonymousId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.patientPhone.includes(searchTerm) ||
    m.researchGroup?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <Card className="border-2 border-amber-200 bg-amber-50/30">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="w-5 h-5" />
              Tabela de Mapeamento (USO INTERNO)
            </CardTitle>
            <CardDescription className="text-amber-700">
              <strong>⚠️ DADOS SENSÍVEIS:</strong> Esta tabela permite re-identificar pacientes
              e NÃO deve ser compartilhada ou exportada. Use apenas quando necessário para
              validação científica.
            </CardDescription>
          </div>
          <Button
            variant={isVisible ? "destructive" : "outline"}
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
            className={isVisible ? "bg-amber-600 hover:bg-amber-700" : ""}
          >
            {isVisible ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Ocultar Dados
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Mostrar Dados Reais
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {isVisible && (
        <CardContent className="space-y-4">
          {/* Campo de Busca */}
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar por ID pseudônimo, nome, telefone ou grupo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
              >
                Limpar
              </Button>
            )}
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border">
            <div>
              <p className="text-sm text-gray-600">Total de Pacientes</p>
              <p className="text-2xl font-bold text-[#14BDAE]">{mappings.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pesquisa</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{researchTitle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Grupos</p>
              <p className="text-2xl font-bold text-[#14BDAE]">
                {new Set(mappings.map(m => m.researchGroup).filter(Boolean)).size}
              </p>
            </div>
          </div>

          {/* Tabela */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-amber-100">
                  <TableHead className="font-bold text-amber-900">
                    ID Pseudônimo
                  </TableHead>
                  <TableHead className="font-bold text-amber-900">
                    Grupo
                  </TableHead>
                  <TableHead className="font-bold text-amber-900">
                    Nome Real
                  </TableHead>
                  <TableHead className="font-bold text-amber-900">
                    Telefone
                  </TableHead>
                  <TableHead className="font-bold text-amber-900 text-right">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMappings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                      Nenhum resultado encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMappings.map((mapping) => (
                    <TableRow
                      key={mapping.patientId}
                      className="hover:bg-amber-50/50"
                    >
                      <TableCell className="font-mono text-sm bg-gray-50">
                        <div className="flex items-center gap-2">
                          <code className="text-[#14BDAE] font-semibold">
                            {mapping.pseudonymousId}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(mapping.pseudonymousId, mapping.pseudonymousId)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedId === mapping.pseudonymousId ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-[#0D7377]/10 text-[#14BDAE] rounded font-semibold">
                          {mapping.researchGroup || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {mapping.patientName}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {mapping.patientPhone}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const message = `Olá ${mapping.patientName}, preciso confirmar alguns dados da pesquisa.`
                            const url = `https://wa.me/55${mapping.patientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
                            window.open(url, '_blank')
                          }}
                          className="text-xs"
                        >
                          WhatsApp
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Rodapé com avisos */}
          <div className="p-4 bg-amber-100 border-2 border-amber-300 rounded-lg">
            <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Importante - Uso Responsável
            </h4>
            <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
              <li>Esta tabela NÃO aparece na exportação (Excel/CSV/PDF)</li>
              <li>Use apenas para validação científica (ex: confirmar dados inconsistentes)</li>
              <li>Documente o motivo ao re-identificar um paciente</li>
              <li>Conforme Art. 13, § 3º da LGPD - Pseudonimização para pesquisa</li>
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
