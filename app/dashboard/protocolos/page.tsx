"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

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

  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [researches, setResearches] = useState<Research[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

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
    return <div className="p-8">Carregando...</div>
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Protocolos Pós-Operatórios
        </h1>
        <p className="text-lg text-muted-foreground mt-3">
          Configure uma vez os protocolos para cada tipo de cirurgia. A IA usará automaticamente para todos os pacientes.
        </p>
      </div>

      <div className="flex justify-end mb-6">
        <Button onClick={handleCreate} disabled={isCreating} size="lg" className="shadow-lg">
          <Plus className="w-5 h-5 mr-2" />
          Novo Protocolo
        </Button>
      </div>

      {/* Formulário de criação/edição */}
      {(isCreating || editingId) && (
        <Card className="mb-8 border-2 border-blue-300 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="border-b border-blue-200 bg-white/50">
            <CardTitle className="text-2xl flex items-center gap-2">
              {editingId ? '✏️ Editar Protocolo' : '✨ Novo Protocolo'}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Configure as orientações que serão usadas automaticamente pela IA para todos os pacientes deste tipo de cirurgia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">🔪 Tipo de Cirurgia</Label>
                <Select
                  value={formData.surgeryType}
                  onValueChange={(value) => setFormData({ ...formData, surgeryType: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {surgeryTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Para qual cirurgia este protocolo se aplica</p>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">📌 Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Tipo de orientação</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">📝 Título do Protocolo</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Banho de assento - Primeiros 3 dias"
                className="h-12 text-base"
              />
              <p className="text-xs text-muted-foreground">Nome descritivo para identificar facilmente</p>
            </div>

            {/* Campo de Pesquisa */}
            <div className="space-y-2 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border-2 border-amber-300">
              <Label className="text-base font-semibold">🔬 Protocolo de Pesquisa (Opcional)</Label>
              <Select
                value={formData.researchId || 'none'}
                onValueChange={(value) => setFormData({ ...formData, researchId: value === 'none' ? null : value })}
              >
                <SelectTrigger className="h-12 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    Protocolo Normal (Prática Diária)
                  </SelectItem>
                  {researches.filter(r => r.isActive).map(research => (
                    <SelectItem key={research.id} value={research.id}>
                      🔬 Pesquisa: {research.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="bg-amber-100 border border-amber-300 rounded p-3 mt-2">
                <p className="text-sm text-amber-900">
                  <strong>⚠️ Importante:</strong> Protocolos de pesquisa são usados APENAS para pacientes vinculados àquela pesquisa específica.
                  Use quando o protocolo da pesquisa diferir da sua prática normal (ex: medicação diferente para evitar fator confundidor).
                </p>
              </div>
            </div>

            <div className="bg-white/80 p-4 rounded-lg border border-blue-200">
              <Label className="text-base font-semibold mb-3 block">📅 Período Pós-Operatório</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dia Inicial (D+)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.dayRangeStart}
                    onChange={(e) => setFormData({ ...formData, dayRangeStart: parseInt(e.target.value) })}
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">A partir de qual dia se aplica</p>
                </div>

                <div className="space-y-2">
                  <Label>Dia Final (D+) <span className="text-muted-foreground">(opcional)</span></Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.dayRangeEnd || ''}
                    onChange={(e) => setFormData({ ...formData, dayRangeEnd: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Deixe vazio para sempre"
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">Até qual dia (vazio = sempre após dia inicial)</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">💬 Orientação para o Paciente</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Ex: Banho de assento com água morna 2-3x ao dia por 10-15 minutos."
                rows={5}
                className="text-base resize-none"
              />
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-2">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Importante:</strong> Este texto será enviado EXATAMENTE como está para o paciente pela IA.
                  Seja claro, objetivo e use apenas informações corretas baseadas no seu protocolo.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-blue-200">
              <Button variant="outline" onClick={handleCancel} size="lg" className="min-w-32">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave} size="lg" className="min-w-32 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
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
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="py-16 text-center">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-xl text-muted-foreground font-medium">
                Nenhum protocolo cadastrado ainda
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Clique em "Novo Protocolo" para configurar suas orientações personalizadas
              </p>
            </CardContent>
          </Card>
        ) : (
          protocols.map(protocol => (
            <Card
              key={protocol.id}
              className={`transition-all hover:shadow-lg ${!protocol.isActive ? 'opacity-50' : 'border-l-4 border-l-blue-500'}`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-blue-900">
                      {protocol.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {protocol.researchId && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md">
                          🔬 PESQUISA: {protocol.research?.title || 'Pesquisa'}
                        </span>
                      )}
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        🔪 {surgeryTypes.find(t => t.value === protocol.surgeryType)?.label}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        📌 {categories.find(c => c.value === protocol.category)?.label}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        📅 {getDayRangeText(protocol.dayRangeStart, protocol.dayRangeEnd)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(protocol)}
                      className="hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(protocol.id)}
                      className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">💬 Orientação que será enviada:</p>
                  <p className="text-base whitespace-pre-wrap text-gray-900">{protocol.content}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
