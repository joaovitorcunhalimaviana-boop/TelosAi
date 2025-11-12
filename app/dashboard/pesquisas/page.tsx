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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, FlaskConical, Users, BarChart3, Play, Pause, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

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
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#0A2647' }}>
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
              className={`border-2 ${
                research.isActive ? 'border-green-200' : 'border-gray-200'
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
