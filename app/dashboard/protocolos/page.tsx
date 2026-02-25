"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit2, Trash2, Save, X, ArrowLeft, FileText, Shield } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { PROTOCOL_TEMPLATES, ProtocolTemplate } from '@/lib/protocol-templates'

interface Protocol {
  id: string
  surgeryType: string
  category: string
  title: string
  dayRangeStart: number
  dayRangeEnd: number | null
  content: string
  priority: number
  isActive: boolean
  researchId: string | null
  research?: { title: string }
}

interface Research {
  id: string
  title: string
  isActive: boolean
}

const surgeryTypes = [
  { value: 'hemorroidectomia', label: 'Hemorroidectomia' },
  { value: 'fistula', label: 'Fístula' },
  { value: 'fissura', label: 'Fissura' },
  { value: 'pilonidal', label: 'Doença Pilonidal' },
  { value: 'geral', label: 'Geral (todas)' },
]

const categories = [
  { value: 'banho', label: 'Banho / Higiene Local' },
  { value: 'medicacao', label: 'Medicação' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'atividade_fisica', label: 'Atividade Física' },
  { value: 'higiene', label: 'Higiene Geral' },
  { value: 'sintomas_normais', label: 'Sintomas Normais' },
]

export default function ProtocolsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()

  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [researches, setResearches] = useState<Research[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const [showTemplates, setShowTemplates] = useState(false)

  const [formData, setFormData] = useState({
    surgeryType: 'hemorroidectomia',
    category: 'banho',
    title: '',
    dayRangeStart: 1,
    dayRangeEnd: null as number | null,
    content: '',
    priority: 0,
    isActive: true,
    researchId: null as string | null,
  })

  // Buscar protocolos e pesquisas
  useEffect(() => {
    fetchProtocols()
    fetchResearches()
  }, [])

  const fetchProtocols = async () => {
    try {
      const res = await fetch('/api/protocols')
      if (res.ok) {
        const data = await res.json()
        setProtocols(data.protocols)
      }
    } catch (error) {
      console.error('Erro ao buscar protocolos:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os protocolos",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchResearches = async () => {
    try {
      const res = await fetch('/api/researches')
      if (res.ok) {
        const data = await res.json()
        setResearches(data.researches || [])
      }
    } catch (error) {
      console.error('Erro ao buscar pesquisas:', error)
    }
  }

  const handleCreate = () => {
    setIsCreating(true)
    setFormData({
      surgeryType: 'hemorroidectomia',
      category: 'banho',
      title: '',
      dayRangeStart: 1,
      dayRangeEnd: null,
      content: '',
      priority: 0,
      isActive: true,
      researchId: null,
    })
  }

  const handleEdit = (protocol: Protocol) => {
    setEditingId(protocol.id)
    setFormData({
      surgeryType: protocol.surgeryType,
      category: protocol.category,
      title: protocol.title,
      dayRangeStart: protocol.dayRangeStart,
      dayRangeEnd: protocol.dayRangeEnd,
      content: protocol.content,
      priority: protocol.priority,
      isActive: protocol.isActive,
      researchId: protocol.researchId,
    })
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingId(null)
    setFormData({
      surgeryType: 'hemorroidectomia',
      category: 'banho',
      title: '',
      dayRangeStart: 1,
      dayRangeEnd: null,
      content: '',
      priority: 0,
      isActive: true,
      researchId: null,
    })
  }

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Erro",
        description: "Preencha o título e o conteúdo do protocolo",
        variant: "destructive"
      })
      return
    }

    try {
      const url = editingId ? `/api/protocols/${editingId}` : '/api/protocols'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast({
          title: "Sucesso",
          description: editingId ? "Protocolo atualizado" : "Protocolo criado"
        })
        fetchProtocols()
        handleCancel()
      } else {
        throw new Error('Erro ao salvar')
      }
    } catch (error) {
      console.error('Erro ao salvar protocolo:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o protocolo",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este protocolo?')) return

    try {
      const res = await fetch(`/api/protocols/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({
          title: "Sucesso",
          description: "Protocolo excluído"
        })
        fetchProtocols()
      }
    } catch (error) {
      console.error('Erro ao excluir protocolo:', error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o protocolo",
        variant: "destructive"
      })
    }
  }

  const applyTemplate = (template: ProtocolTemplate) => {
    setFormData({
      surgeryType: template.surgeryType,
      category: template.category,
      title: template.title,
      dayRangeStart: template.dayRangeStart,
      dayRangeEnd: template.dayRangeEnd,
      content: template.content,
      priority: template.priority,
      isActive: true,
      researchId: null
    });
    setShowTemplates(false);
    setIsCreating(true);
    setEditingId(null);
  };

  const getDayRangeText = (start: number, end: number | null) => {
    if (end === null) {
      return `D+${start} em diante`
    }
    if (start === end) {
      return `D+${start}`
    }
    return `D+${start} a D+${end}`
  }

  if (loading) {
    return <div className="p-8" style={{ color: '#7A8299' }}>Carregando...</div>
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0E14' }}>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header com botão voltar */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4 hover:bg-[#1E2535] -ml-2"
            style={{ color: '#7A8299' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0D7377] to-[#0A5A5E] flex items-center justify-center shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold" style={{ color: '#F0EAD6' }}>
                Protocolos Pós-Operatórios
              </h1>
              <p className="mt-2 text-lg" style={{ color: '#7A8299' }}>
                Configure as orientações que a IA usará para cuidar dos seus pacientes.
              </p>
            </div>
          </div>

          {/* Card informativo */}
          <Card style={{ backgroundColor: '#1A1A0E', borderColor: '#3A3A1E', borderWidth: '2px' }}>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-400">
                    Importante: Os protocolos configurados aqui serão usados pela IA para orientar todos os pacientes.
                  </p>
                  <p className="text-xs text-yellow-500/70 mt-1">
                    Certifique-se de que as orientações estejam corretas e atualizadas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mb-6 gap-3">
          {/* Botao de Templates */}
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition"
              style={{ backgroundColor: '#1E2535', color: '#D8DEEB' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Usar Template
              <svg className={`w-4 h-4 transition-transform ${showTemplates ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showTemplates && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto" style={{ backgroundColor: '#111520', border: '1px solid #1E2535' }}>
                <div className="p-2" style={{ borderBottom: '1px solid #1E2535', backgroundColor: '#161B27' }}>
                  <p className="text-sm font-medium" style={{ color: '#D8DEEB' }}>Templates Disponiveis</p>
                  <p className="text-xs" style={{ color: '#7A8299' }}>Clique para usar como base</p>
                </div>
                {PROTOCOL_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="w-full text-left px-4 py-3 hover:bg-[#1E2535] transition"
                    style={{ borderBottom: '1px solid #1E2535' }}
                  >
                    <p className="font-medium" style={{ color: '#F0EAD6' }}>{template.name}</p>
                    <p className="text-sm" style={{ color: '#7A8299' }}>{template.description}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}>
                        {template.category}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#1E2535', color: '#D8DEEB' }}>
                        D+{template.dayRangeStart}{template.dayRangeEnd ? `-${template.dayRangeEnd}` : '+'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleCreate}
            disabled={isCreating}
            size="lg"
            className="shadow-xl transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Protocolo
          </Button>
        </div>

        {/* Formulário de criação/edição */}
        {(isCreating || editingId) && (
          <Card className="mb-8 border-2 shadow-xl" style={{ backgroundColor: '#111520', borderColor: '#0D7377' }}>
            <CardHeader style={{ borderBottom: '1px solid #1E2535' }}>
              <CardTitle className="text-2xl flex items-center gap-2" style={{ color: '#F0EAD6' }}>
                {editingId ? 'Editar Protocolo' : 'Novo Protocolo'}
              </CardTitle>
              <CardDescription className="text-base mt-2" style={{ color: '#7A8299' }}>
                Configure as orientações que serão usadas automaticamente pela IA para todos os pacientes deste tipo de cirurgia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-base font-semibold" style={{ color: '#D8DEEB' }}>Tipo de Cirurgia</Label>
                  <Select
                    value={formData.surgeryType}
                    onValueChange={(value) => setFormData({ ...formData, surgeryType: value })}
                  >
                    <SelectTrigger className="h-12" style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
                      {surgeryTypes.map(type => (
                        <SelectItem key={type.value} value={type.value} style={{ color: '#D8DEEB' }}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs" style={{ color: '#7A8299' }}>Para qual cirurgia este protocolo se aplica</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold" style={{ color: '#D8DEEB' }}>Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="h-12" style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value} style={{ color: '#D8DEEB' }}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs" style={{ color: '#7A8299' }}>Tipo de orientação</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold" style={{ color: '#D8DEEB' }}>Título do Protocolo</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Banho de assento - Primeiros 3 dias"
                  className="h-12 text-base"
                  style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}
                />
                <p className="text-xs" style={{ color: '#7A8299' }}>Nome descritivo para identificar facilmente</p>
              </div>

              {/* Campo de Pesquisa */}
              <div className="space-y-2 p-4 rounded-lg" style={{ backgroundColor: '#1A1A0E', border: '2px solid #3A3A1E' }}>
                <Label className="text-base font-semibold" style={{ color: '#D8DEEB' }}>Protocolo de Pesquisa (Opcional)</Label>
                <Select
                  value={formData.researchId || 'none'}
                  onValueChange={(value) => setFormData({ ...formData, researchId: value === 'none' ? null : value })}
                >
                  <SelectTrigger className="h-12" style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
                    <SelectItem value="none" style={{ color: '#D8DEEB' }}>
                      Protocolo Normal (Prática Diária)
                    </SelectItem>
                    {researches.filter(r => r.isActive).map(research => (
                      <SelectItem key={research.id} value={research.id} style={{ color: '#D8DEEB' }}>
                        Pesquisa: {research.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="rounded p-3 mt-2" style={{ backgroundColor: '#2A2A1E', border: '1px solid #3A3A1E' }}>
                  <p className="text-sm text-yellow-400">
                    <strong>Importante:</strong> Protocolos de pesquisa são usados APENAS para pacientes vinculados àquela pesquisa específica.
                    Use quando o protocolo da pesquisa diferir da sua prática normal (ex: medicação diferente para evitar fator confundidor).
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: '#161B27', border: '1px solid #1E2535' }}>
                <Label className="text-base font-semibold mb-3 block" style={{ color: '#D8DEEB' }}>Período Pós-Operatório</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label style={{ color: '#D8DEEB' }}>Dia Inicial (D+)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.dayRangeStart}
                      onChange={(e) => setFormData({ ...formData, dayRangeStart: parseInt(e.target.value) })}
                      className="h-11"
                      style={{ backgroundColor: '#111520', borderColor: '#1E2535', color: '#D8DEEB' }}
                    />
                    <p className="text-xs" style={{ color: '#7A8299' }}>A partir de qual dia se aplica</p>
                  </div>

                  <div className="space-y-2">
                    <Label style={{ color: '#D8DEEB' }}>Dia Final (D+) <span style={{ color: '#7A8299' }}>(opcional)</span></Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.dayRangeEnd || ''}
                      onChange={(e) => setFormData({ ...formData, dayRangeEnd: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="Deixe vazio para sempre"
                      className="h-11"
                      style={{ backgroundColor: '#111520', borderColor: '#1E2535', color: '#D8DEEB' }}
                    />
                    <p className="text-xs" style={{ color: '#7A8299' }}>Até qual dia (vazio = sempre após dia inicial)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold" style={{ color: '#D8DEEB' }}>Orientação para o Paciente</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Ex: Banho de assento com água morna 2-3x ao dia por 10-15 minutos."
                  rows={5}
                  className="text-base resize-none"
                  style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}
                />
                <div className="rounded p-3 mt-2" style={{ backgroundColor: '#1A1A0E', border: '1px solid #3A3A1E' }}>
                  <p className="text-sm text-yellow-400">
                    <strong>Importante:</strong> Este texto será enviado EXATAMENTE como está para o paciente pela IA.
                    Seja claro, objetivo e use apenas informações corretas baseadas no seu protocolo.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4" style={{ borderTop: '1px solid #1E2535' }}>
                <Button variant="outline" onClick={handleCancel} size="lg" className="min-w-32" style={{ borderColor: '#1E2535', color: '#D8DEEB', backgroundColor: '#1E2535' }}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} size="lg" className="min-w-32 shadow-md transition-all hover:scale-105 active:scale-95" style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Protocolo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de protocolos */}
        <div className="space-y-4">
          {protocols.length === 0 ? (
            <Card className="border-2 border-dashed" style={{ borderColor: '#2A3147', backgroundColor: '#111520' }}>
              <CardContent className="py-16 text-center">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-xl font-medium" style={{ color: '#D8DEEB' }}>
                  Nenhum protocolo cadastrado ainda
                </p>
                <p className="text-sm mt-2" style={{ color: '#7A8299' }}>
                  Clique em &quot;Novo Protocolo&quot; para configurar suas orientações personalizadas
                </p>
              </CardContent>
            </Card>
          ) : (
            protocols.map(protocol => (
              <Card
                key={protocol.id}
                className={`group transition-all duration-300 border-0 backdrop-blur-md shadow-sm ${!protocol.isActive ? 'opacity-60 grayscale' : 'hover:-translate-y-1 hover:shadow-xl'}`}
                style={{ backgroundColor: '#111520', boxShadow: '0 0 0 1px #1E2535' }}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl font-bold" style={{ color: '#F0EAD6' }}>
                          {protocol.title}
                        </CardTitle>
                        {!protocol.isActive && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: '#1E2535', color: '#7A8299', border: '1px solid #2A3147' }}>
                            Inativo
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {protocol.researchId && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold" style={{ backgroundColor: '#1A1A0E', color: '#FFD700', border: '1px solid #3A3A1E' }}>
                            {protocol.research?.title || 'Pesquisa'}
                          </span>
                        )}
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: '#0D7377/20', color: '#14BDAE', border: '1px solid #0D7377' }}>
                          {surgeryTypes.find(t => t.value === protocol.surgeryType)?.label}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: '#1E2535', color: '#D8DEEB', border: '1px solid #2A3147' }}>
                          {categories.find(c => c.value === protocol.category)?.label}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: '#1E2535', color: '#14BDAE', border: '1px solid #2A3147' }}>
                          {getDayRangeText(protocol.dayRangeStart, protocol.dayRangeEnd)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(protocol)}
                        className="hover:bg-[#1E2535]"
                        style={{ color: '#7A8299' }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(protocol.id)}
                        className="hover:bg-red-500/10 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg p-5" style={{ backgroundColor: '#161B27', border: '1px solid #1E2535' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#7A8299' }}>Orientação ao Paciente</p>
                    <p className="text-base leading-relaxed font-serif italic" style={{ color: '#D8DEEB' }}>
                      &ldquo;{protocol.content}&rdquo;
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
