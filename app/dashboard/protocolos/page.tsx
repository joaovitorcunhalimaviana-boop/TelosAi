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
  })

  // Buscar protocolos
  useEffect(() => {
    fetchProtocols()
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
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Protocolos Pós-Operatórios</h1>
          <p className="text-muted-foreground mt-2">
            Configure as orientações que a IA usará para responder pacientes
          </p>
        </div>
        <Button onClick={handleCreate} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Protocolo
        </Button>
      </div>

      {/* Formulário de criação/edição */}
      {(isCreating || editingId) && (
        <Card className="mb-6 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Protocolo' : 'Novo Protocolo'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Cirurgia</Label>
                <Select
                  value={formData.surgeryType}
                  onValueChange={(value) => setFormData({ ...formData, surgeryType: value })}
                >
                  <SelectTrigger>
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
              </div>

              <div>
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
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
              </div>
            </div>

            <div>
              <Label>Título do Protocolo</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Banho de assento - Primeiros 3 dias"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Dia Inicial (D+)</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.dayRangeStart}
                  onChange={(e) => setFormData({ ...formData, dayRangeStart: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label>Dia Final (D+) - opcional</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.dayRangeEnd || ''}
                  onChange={(e) => setFormData({ ...formData, dayRangeEnd: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Deixe vazio = sempre"
                />
              </div>

              <div>
                <Label>Prioridade</Label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label>Conteúdo do Protocolo</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Ex: Compressa gelada na região 3x ao dia por 10-15 minutos, especialmente após evacuações. Isso ajuda a reduzir o inchaço e a dor."
                rows={4}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Este texto será usado pela IA para responder o paciente. Seja claro e objetivo.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de protocolos */}
      <div className="space-y-4">
        {protocols.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum protocolo cadastrado. Clique em "Novo Protocolo" para começar.
            </CardContent>
          </Card>
        ) : (
          protocols.map(protocol => (
            <Card key={protocol.id} className={!protocol.isActive ? 'opacity-50' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{protocol.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {surgeryTypes.find(t => t.value === protocol.surgeryType)?.label} •{' '}
                      {categories.find(c => c.value === protocol.category)?.label} •{' '}
                      {getDayRangeText(protocol.dayRangeStart, protocol.dayRangeEnd)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(protocol)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(protocol.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{protocol.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
