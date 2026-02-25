/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Plus, FlaskConical, Users, BarChart3, Play, Pause, Trash2, ChevronDown, ChevronUp, FileText, ArrowLeft, Shield } from 'lucide-react';
import { getSurgeryTypeLabel } from '@/lib/constants/surgery-types';

const surgeryTypes = [
  { value: 'hemorroidectomia', label: 'Hemorroidectomia' },
  { value: 'fistula', label: 'Fístula Anal' },
  { value: 'fissura', label: 'Fissurectomia' },
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
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#0B0E14' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#14BDAE' }}></div>
          <p className="mt-4" style={{ color: '#7A8299' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: '#0B0E14' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4 -ml-2"
            style={{ color: '#7A8299' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#0D7377' }}>
                <FlaskConical className="w-8 h-8" style={{ color: '#F0EAD6' }} />
              </div>
              <div>
                <h1 className="text-4xl font-bold" style={{ color: '#F0EAD6' }}>
                  Minhas Pesquisas
                </h1>
                <p className="mt-2 text-lg" style={{ color: '#7A8299' }}>
                  Gerencie seus estudos clínicos e monitore o progresso dos pacientes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card informativo - Igual a Protocolos */}
        <Card className="mt-8 border-2 shadow-sm" style={{ backgroundColor: '#161B27', borderColor: '#C9A84C' }}>
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#C9A84C' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#F0EAD6' }}>
                  Importante: As pesquisas permitem agrupar pacientes e comparar resultados clínicos.
                </p>
                <p className="text-xs mt-1" style={{ color: '#D8DEEB' }}>
                  Crie grupos (ex: Controle vs Intervenção) para análise detalhada no dashboard.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Botão Nova Pesquisa - Alinhado à direita igual Protocolos */}
        <div className="flex justify-end mb-6">
          <Button
            size="lg"
            onClick={() => setIsDialogOpen(true)}
            className="shadow-xl transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#14BDAE', color: '#0B0E14' }}
          >
            <Plus className="mr-2 h-5 w-5" />
            Nova Pesquisa
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
            <DialogHeader>
              <DialogTitle style={{ color: '#F0EAD6' }}>Criar Nova Pesquisa</DialogTitle>
              <DialogDescription style={{ color: '#7A8299' }}>
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
              <div className="space-y-4 p-6 rounded-lg border-2" style={{ backgroundColor: '#161B27', borderColor: '#C9A84C' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-lg font-semibold flex items-center gap-2" style={{ color: '#F0EAD6' }}>
                      <FileText className="h-5 w-5" style={{ color: '#C9A84C' }} />
                      Protocolos da Pesquisa (Opcional)
                    </Label>
                    <p className="text-sm mt-1" style={{ color: '#D8DEEB' }}>
                      Configure protocolos específicos que serão usados apenas para pacientes nesta pesquisa
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddProtocol}
                    style={{ borderColor: '#1E2535', color: '#D8DEEB' }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Protocolo
                  </Button>
                </div>

                {protocols.length === 0 ? (
                  <div className="rounded-lg p-6 text-center border-2 border-dashed" style={{ backgroundColor: '#0B0E14', borderColor: '#1E2535' }}>
                    <FileText className="h-12 w-12 mx-auto mb-2" style={{ color: '#C9A84C' }} />
                    <p className="text-sm" style={{ color: '#D8DEEB' }}>
                      Nenhum protocolo adicionado. Clique em &quot;Adicionar Protocolo&quot; para criar.
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#7A8299' }}>
                      Protocolos de pesquisa garantem orientações uniformes para todos os pacientes do estudo
                    </p>
                  </div>
                ) : (
                  protocols.map((protocol, index) => (
                    <Card key={index} className="border-2" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
                      <CardHeader className="pb-3" style={{ backgroundColor: '#0B0E14' }}>
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
                              <span className="text-[10px]" style={{ color: '#7A8299' }}>(opcional)</span>
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
                  style={{ backgroundColor: '#14BDAE', color: '#0B0E14' }}
                >
                  Criar Pesquisa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Research List */}
        {
          researches.length === 0 ? (
            <Card className="border-2 border-dashed" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FlaskConical className="h-16 w-16 mb-4" style={{ color: '#7A8299' }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#F0EAD6' }}>
                  Nenhuma pesquisa criada
                </h3>
                <p className="mb-6" style={{ color: '#7A8299' }}>
                  Comece criando sua primeira pesquisa clínica
                </p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  style={{ backgroundColor: '#14BDAE', color: '#0B0E14' }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Pesquisa
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {researches.map((research) => (
                <Card
                  key={research.id}
                  className={`transition-all duration-300 hover:shadow-xl border-0 backdrop-blur-md shadow-sm ${!research.isActive ? 'opacity-75 grayscale-[0.8]' : 'hover:-translate-y-1'}`}
                  style={{ backgroundColor: '#111520', boxShadow: '0 0 0 1px #1E2535' }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-2xl font-bold" style={{ color: '#F0EAD6' }}>
                            {research.title}
                          </CardTitle>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider" style={research.isActive ? { backgroundColor: '#0D7377', color: '#F0EAD6', border: '1px solid #14BDAE' } : { backgroundColor: '#1E2535', color: '#7A8299', border: '1px solid #1E2535' }}>
                            {research.isActive ? 'Ativa' : 'Pausada'}
                          </span>
                        </div>
                        <CardDescription className="text-base leading-relaxed max-w-2xl" style={{ color: '#7A8299' }}>
                          {research.description}
                        </CardDescription>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(research.id, research.isActive)}
                          className="hover:opacity-80"
                          style={{ color: '#7A8299' }}
                          title={research.isActive ? "Pausar" : "Ativar"}
                        >
                          {research.isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setExpandedResearch(
                              expandedResearch === research.id ? null : research.id
                            )
                          }
                          className="hover:opacity-80"
                          style={{ color: '#7A8299' }}
                        >
                          {expandedResearch === research.id ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {research.surgeryType && (
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: '#0D7377', color: '#F0EAD6', border: '1px solid #14BDAE' }}>
                          🔪 {getSurgeryTypeLabel(research.surgeryType)}
                        </span>
                      )}
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: '#1E2535', color: '#D8DEEB', border: '1px solid #1E2535' }}>
                        📊 {research.groups.length} Grupos
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-2">
                      <div className="p-4 rounded-xl transition-colors" style={{ backgroundColor: '#161B27', border: '1px solid #1E2535' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#14BDAE' }}>Pacientes</span>
                          <Users className="h-5 w-5 opacity-60" style={{ color: '#14BDAE' }} />
                        </div>
                        <p className="text-3xl font-bold" style={{ color: '#F0EAD6' }}>{research.totalPatients}</p>
                        <p className="text-xs mt-1" style={{ color: '#7A8299' }}>Total recrutados</p>
                      </div>

                      <div className="p-4 rounded-xl transition-colors" style={{ backgroundColor: '#161B27', border: '1px solid #1E2535' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#C9A84C' }}>Duração</span>
                          <BarChart3 className="h-5 w-5 opacity-60" style={{ color: '#C9A84C' }} />
                        </div>
                        <p className="text-xl font-bold truncate" style={{ color: '#F0EAD6' }}>
                          {new Date(research.startDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#7A8299' }}>
                          {research.endDate ? `Até ${new Date(research.endDate).toLocaleDateString('pt-BR')}` : 'Em andamento'}
                        </p>
                      </div>

                      <div className="flex items-center justify-center">
                        <Button
                          className="w-full h-full min-h-[100px] border-2 border-dashed transition-all flex flex-col gap-2 shadow-none hover:opacity-90"
                          style={{ backgroundColor: '#0B0E14', borderColor: '#1E2535', color: '#7A8299' }}
                          onClick={() => router.push(`/dashboard/pesquisas/${research.id}`)}
                        >
                          <BarChart3 className="h-8 w-8" />
                          <span className="font-semibold text-sm">Ver Dados Completos</span>
                        </Button>
                      </div>
                    </div>

                    {/* Groups Details Expanded */}
                    {expandedResearch === research.id && (
                      <div className="mt-6 pt-6 animate-in fade-in slide-in-from-top-2 duration-300" style={{ borderTop: '1px solid #1E2535' }}>
                        <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: '#F0EAD6' }}>
                          <Users className="w-4 h-4" /> Grupos do Estudo
                        </h4>
                        <div className="grid gap-3">
                          {research.groups.map((group) => (
                            <div key={group.id} className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#161B27', border: '1px solid #1E2535' }}>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm" style={{ backgroundColor: '#0D7377', color: '#F0EAD6' }}>
                                    {group.groupCode}
                                  </span>
                                  <span className="font-semibold" style={{ color: '#F0EAD6' }}>{group.groupName}</span>
                                </div>
                                <p className="text-sm mt-1 ml-10" style={{ color: '#7A8299' }}>{group.description}</p>
                              </div>
                              <Badge variant="secondary" style={{ backgroundColor: '#0B0E14', color: '#D8DEEB', border: '1px solid #1E2535' }}>
                                {group.patientCount} participantes
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}
