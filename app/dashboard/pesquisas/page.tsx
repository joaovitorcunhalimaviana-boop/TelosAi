'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, FlaskConical, Users, BarChart3, Play, Pause, Trash2, ChevronDown, ChevronUp, FileText, ArrowLeft } from 'lucide-react';

const surgeryTypes = [
  { value: 'hemorroidectomia', label: 'Hemorroidectomia' },
  { value: 'fistula', label: 'Fístula' },
  { value: 'fissura', label: 'Fissura' },
  { value: 'pilonidal', label: 'Doença Pilonidal' },
  { value: 'geral', label: 'Geral (todas)' },
];

const categories = [
  { value: 'banho', label: 'Banho / Higiene Local' },
  { value: 'medicacao', label: 'Medicação' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'atividade_fisica', label: 'Atividade Física' },
  { value: 'higiene', label: 'Higiene Geral' },
  { value: 'sintomas_normais', label: 'Sintomas Normais' },
];

interface ResearchGroup {
  id: string;
  groupCode: string;
  groupName: string;
  description: string;
  patientCount: number;
}

interface Research {
  id: string;
  title: string;
  description: string;
  surgeryType: string | null;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  totalPatients: number;
  groups: ResearchGroup[];
}

interface GroupInput {
  groupCode: string;
  groupName: string;
  description: string;
}

interface ProtocolInput {
  surgeryType: string;
  category: string;
  title: string;
  dayRangeStart: number;
  dayRangeEnd: number | null;
  content: string;
  priority: number;
  researchGroupCode: string | null; // null = todos os grupos, ou código específico (A, B, C...)
}

export default function PesquisasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [researches, setResearches] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedResearch, setExpandedResearch] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [surgeryType, setSurgeryType] = useState('');
  const [groups, setGroups] = useState<GroupInput[]>([
    { groupCode: 'A', groupName: '', description: '' },
  ]);
  const [protocols, setProtocols] = useState<ProtocolInput[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadResearches();
    }
  }, [status]);

  const loadResearches = async () => {
    try {
      const response = await fetch('/api/pesquisas');
      const data = await response.json();

      if (data.success) {
        setResearches(data.data);
      } else {
        toast.error('Erro ao carregar pesquisas');
      }
    } catch (error) {
      console.error('Error loading researches:', error);
      toast.error('Erro ao carregar pesquisas');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGroup = () => {
    const nextCode = String.fromCharCode(65 + groups.length); // A, B, C, D...
    setGroups([...groups, { groupCode: nextCode, groupName: '', description: '' }]);
  };

  const handleRemoveGroup = (index: number) => {
    if (groups.length > 1) {
      setGroups(groups.filter((_, i) => i !== index));
    }
  };

  const handleUpdateGroup = (index: number, field: keyof GroupInput, value: string) => {
    const updated = [...groups];
    updated[index][field] = value;
    setGroups(updated);
  };

  const handleAddProtocol = () => {
    setProtocols([...protocols, {
      surgeryType: surgeryType || 'geral',
      category: 'medicacao',
      title: '',
      dayRangeStart: 1,
      dayRangeEnd: null,
      content: '',
      priority: 0,
      researchGroupCode: null, // Padrão: protocolo para todos os grupos
    }]);
  };

  const handleRemoveProtocol = (index: number) => {
    setProtocols(protocols.filter((_, i) => i !== index));
  };

  const handleUpdateProtocol = (index: number, field: keyof ProtocolInput, value: any) => {
    const updated = [...protocols];
    updated[index] = { ...updated[index], [field]: value };
    setProtocols(updated);
  };

  const handleCreateResearch = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Título e descrição são obrigatórios');
      return;
    }

    const invalidGroup = groups.find(
      (g) => !g.groupCode.trim() || !g.groupName.trim() || !g.description.trim()
    );

    if (invalidGroup) {
      toast.error('Todos os grupos devem ter código, nome e descrição');
      return;
    }

    try {
      const response = await fetch('/api/pesquisas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          surgeryType: surgeryType.trim() || null,
          groups,
          protocols,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Pesquisa criada com sucesso!');
        setIsDialogOpen(false);
        resetForm();
        loadResearches();
      } else {
        toast.error(data.error?.message || 'Erro ao criar pesquisa');
      }
    } catch (error) {
      console.error('Error creating research:', error);
      toast.error('Erro ao criar pesquisa');
    }
  };

  const handleToggleStatus = async (researchId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/pesquisas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: researchId,
          isActive: !currentStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Pesquisa ${!currentStatus ? 'ativada' : 'desativada'} com sucesso!`
        );
        loadResearches();
      } else {
        toast.error(data.error?.message || 'Erro ao atualizar pesquisa');
      }
    } catch (error) {
      console.error('Error updating research:', error);
      toast.error('Erro ao atualizar pesquisa');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSurgeryType('');
    setGroups([{ groupCode: 'A', groupName: '', description: '' }]);
    setProtocols([]);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center" style={{ color: '#0A2647' }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
              className="mr-4 hover:bg-gray-100"
            >
              <ArrowLeft className="h-8 w-8" />
            </Button>
            <FlaskConical className="inline-block mr-3 h-10 w-10" />
            Minhas Pesquisas
          </h1>
          <p className="text-gray-600">
            Gerencie seus estudos clínicos e grupos de pesquisa
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="shadow-lg"
              style={{ backgroundColor: '#0A2647', color: 'white' }}
            >
              <Plus className="mr-2 h-5 w-5" />
              Nova Pesquisa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Pesquisa</DialogTitle>
              <DialogDescription>
                Configure sua pesquisa e defina os grupos de estudo
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título da Pesquisa *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Bloqueio do Nervo Pudendo em Hemorroidectomia"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva os objetivos e metodologia da pesquisa..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="surgeryType">Tipo de Cirurgia (Opcional)</Label>
                  <Input
                    id="surgeryType"
                    value={surgeryType}
                    onChange={(e) => setSurgeryType(e.target.value)}
                    placeholder="Ex: Hemorroidectomia"
                  />
                </div>
              </div>

              {/* Groups */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Grupos da Pesquisa</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddGroup}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Grupo
                  </Button>
                </div>

                {groups.map((group, index) => (
                  <Card key={index} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Grupo {group.groupCode}
                        </CardTitle>
                        {groups.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveGroup(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Código do Grupo</Label>
                        <Input
                          value={group.groupCode}
                          onChange={(e) =>
                            handleUpdateGroup(index, 'groupCode', e.target.value)
                          }
                          placeholder="A"
                          maxLength={3}
                        />
                      </div>
                      <div>
                        <Label>Nome do Grupo</Label>
                        <Input
                          value={group.groupName}
                          onChange={(e) =>
                            handleUpdateGroup(index, 'groupName', e.target.value)
                          }
                          placeholder="Ex: Grupo Controle"
                        />
                      </div>
                      <div>
                        <Label>Descrição</Label>
                        <Textarea
                          value={group.description}
                          onChange={(e) =>
                            handleUpdateGroup(index, 'description', e.target.value)
                          }
                          placeholder="Ex: Pacientes sem bloqueio do nervo pudendo"
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Protocols Section */}
              <div className="space-y-4 bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border-2 border-amber-300">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-amber-700" />
                      Protocolos da Pesquisa (Opcional)
                    </Label>
                    <p className="text-sm text-amber-800 mt-1">
                      Configure protocolos específicos que serão usados apenas para pacientes nesta pesquisa
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddProtocol}
                    className="bg-white hover:bg-amber-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Protocolo
                  </Button>
                </div>

                {protocols.length === 0 ? (
                  <div className="bg-white/80 rounded-lg p-6 text-center border-2 border-dashed border-amber-300">
                    <FileText className="h-12 w-12 mx-auto text-amber-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Nenhum protocolo adicionado. Clique em "Adicionar Protocolo" para criar.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Protocolos de pesquisa garantem orientações uniformes para todos os pacientes do estudo
                    </p>
                  </div>
                ) : (
                  protocols.map((protocol, index) => (
                    <Card key={index} className="border-2 border-amber-200 bg-white">
                      <CardHeader className="pb-3 bg-amber-50/50">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Protocolo {index + 1}
                          </CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProtocol(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs">Tipo de Cirurgia</Label>
                            <Select
                              value={protocol.surgeryType}
                              onValueChange={(value) => handleUpdateProtocol(index, 'surgeryType', value)}
                            >
                              <SelectTrigger className="h-9">
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
                            <Label className="text-xs">Categoria</Label>
                            <Select
                              value={protocol.category}
                              onValueChange={(value) => handleUpdateProtocol(index, 'category', value)}
                            >
                              <SelectTrigger className="h-9">
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
                          <div>
                            <Label className="text-xs flex items-center gap-1">
                              Grupo Específico
                              <span className="text-[10px] text-gray-500">(opcional)</span>
                            </Label>
                            <Select
                              value={protocol.researchGroupCode || 'all'}
                              onValueChange={(value) => handleUpdateProtocol(index, 'researchGroupCode', value === 'all' ? null : value)}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos os grupos</SelectItem>
                                {groups.map(group => (
                                  <SelectItem key={group.groupCode} value={group.groupCode}>
                                    Grupo {group.groupCode}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Título</Label>
                          <Input
                            value={protocol.title}
                            onChange={(e) => handleUpdateProtocol(index, 'title', e.target.value)}
                            placeholder="Ex: Pomada de lidocaína - pós-operatório"
                            className="h-9"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Dia Inicial (D+)</Label>
                            <Input
                              type="number"
                              min="1"
                              value={protocol.dayRangeStart}
                              onChange={(e) => handleUpdateProtocol(index, 'dayRangeStart', parseInt(e.target.value))}
                              className="h-9"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Dia Final (D+) - Opcional</Label>
                            <Input
                              type="number"
                              min="1"
                              value={protocol.dayRangeEnd || ''}
                              onChange={(e) => handleUpdateProtocol(index, 'dayRangeEnd', e.target.value ? parseInt(e.target.value) : null)}
                              placeholder="Vazio = sempre"
                              className="h-9"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Orientação para o Paciente</Label>
                          <Textarea
                            value={protocol.content}
                            onChange={(e) => handleUpdateProtocol(index, 'content', e.target.value)}
                            placeholder="Ex: Aplicar pomada de lidocaína 2% após evacuações e banhos..."
                            rows={3}
                            className="text-sm"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateResearch}
                  style={{ backgroundColor: '#0A2647', color: 'white' }}
                >
                  Criar Pesquisa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Research List */}
      {researches.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FlaskConical className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhuma pesquisa criada
            </h3>
            <p className="text-gray-500 mb-6">
              Comece criando sua primeira pesquisa clínica
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              style={{ backgroundColor: '#0A2647', color: 'white' }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Pesquisa
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {researches.map((research) => (
            <Card
              key={research.id}
              className={`border-2 ${research.isActive ? 'border-green-200' : 'border-gray-200'
                }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-2xl">{research.title}</CardTitle>
                      <Badge
                        variant={research.isActive ? 'default' : 'secondary'}
                        className={
                          research.isActive
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-gray-400'
                        }
                      >
                        {research.isActive ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                    <CardDescription className="text-base">
                      {research.description}
                    </CardDescription>
                    {research.surgeryType && (
                      <p className="text-sm text-gray-500 mt-2">
                        Tipo de cirurgia: <strong>{research.surgeryType}</strong>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => router.push(`/dashboard/pesquisas/${research.id}`)}
                      style={{ backgroundColor: '#0A2647', color: 'white' }}
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Estatísticas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(research.id, research.isActive)}
                    >
                      {research.isActive ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Ativar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setExpandedResearch(
                          expandedResearch === research.id ? null : research.id
                        )
                      }
                    >
                      {expandedResearch === research.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold text-blue-700">
                      {research.totalPatients}
                    </p>
                    <p className="text-sm text-gray-600">Total de Pacientes</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                    <p className="text-2xl font-bold text-purple-700">
                      {research.groups.length}
                    </p>
                    <p className="text-sm text-gray-600">Grupos</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <FlaskConical className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold text-green-700">
                      {new Date(research.startDate).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-gray-600">Data de Início</p>
                  </div>
                </div>

                {/* Groups Details */}
                {expandedResearch === research.id && (
                  <div className="space-y-3 mt-6 pt-6 border-t">
                    <h4 className="font-semibold text-lg mb-4">Grupos da Pesquisa</h4>
                    {research.groups.map((group) => (
                      <Card key={group.id} className="border">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              Grupo {group.groupCode}: {group.groupName}
                            </CardTitle>
                            <Badge variant="outline">
                              {group.patientCount} pacientes
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">{group.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
