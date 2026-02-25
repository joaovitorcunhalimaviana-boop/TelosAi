'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Play,
  Clock,
  CheckCircle2,
  BookOpen,
  BarChart3,
  FileSpreadsheet,
  Microscope,
  Users,
  Home,
  MessageSquare,
  ArrowLeft,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';
import { useTutorial } from '@/components/tutorial/TutorialProvider';
import { tutorialMetadata, TutorialMetadata, getTutorialSteps } from '@/lib/tutorial-steps';

export default function HelpCenterPage() {
  const { startTutorial, isTutorialCompleted, getCompletionRate } = useTutorial();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const router = useRouter();

  // Convert tutorialMetadata to array format
  const allTutorials = Object.values(tutorialMetadata).map((meta) => ({
    id: meta.id,
    name: meta.title,
    description: meta.description,
    category: meta.category,
    estimatedTime: `${meta.estimatedTime} min`,
    steps: getTutorialSteps(meta.id),
  }));

  // Filter tutorials
  const filteredTutorials = allTutorials.filter((tutorial) => {
    const matchesSearch =
      searchQuery === '' ||
      tutorial.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Group tutorials by category
  const basicTutorials = filteredTutorials.filter((t) => t.category === 'basico');
  const advancedTutorials = filteredTutorials.filter((t) => t.category === 'avancado');
  const statisticsTutorials = filteredTutorials.filter((t) => t.category === 'estatisticas');

  const completionRate = getCompletionRate();

  // Category icons
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basico':
        return <Home className="h-4 w-4" />;
      case 'avancado':
        return <Microscope className="h-4 w-4" />;
      case 'estatisticas':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basico':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'avancado':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'estatisticas':
        return 'bg-[#0D7377]/20 text-[#14BDAE] border-[#0D7377]/30';
      default:
        return 'bg-[#1E2535] text-[#D8DEEB] border-[#2A3147]';
    }
  };

  const TutorialCard = ({ tutorial }: { tutorial: typeof allTutorials[0] }) => {
    const isCompleted = isTutorialCompleted(tutorial.id);

    return (
      <Card
        className={`transition-all hover:shadow-md ${
          isCompleted ? 'border-2 border-green-500/30' : 'hover:border-[#0D7377]'
        }`}
        style={{ backgroundColor: isCompleted ? '#0D73771A' : '#111520', borderColor: isCompleted ? undefined : '#1E2535' }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className={`${getCategoryColor(tutorial.category)} text-xs font-semibold`}
                >
                  {getCategoryIcon(tutorial.category)}
                  <span className="ml-1 capitalize">{tutorial.category}</span>
                </Badge>
                {isCompleted && (
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Concluído
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg" style={{ color: '#F0EAD6' }}>{tutorial.name}</CardTitle>
              <CardDescription className="mt-1" style={{ color: '#7A8299' }}>{tutorial.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm" style={{ color: '#7A8299' }}>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{tutorial.estimatedTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{tutorial.steps.length} passos</span>
              </div>
            </div>
            <Button
              variant={isCompleted ? 'outline' : 'default'}
              size="sm"
              onClick={() => startTutorial(tutorial.id)}
              className="gap-2"
              style={isCompleted ? { borderColor: '#1E2535', color: '#D8DEEB' } : { backgroundColor: '#0D7377', color: '#F0EAD6' }}
            >
              <Play className="h-4 w-4" />
              {isCompleted ? 'Revisar' : 'Iniciar Tutorial'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0B0E14' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="hover:bg-[#1E2535] -ml-2"
            style={{ color: '#7A8299' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0D7377] to-[#0A5A5E] flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#F0EAD6' }}>Central de Ajuda</h1>
              <p style={{ color: '#7A8299' }}>
                Aprenda a usar todas as funcionalidades do VigIA com tutoriais interativos
              </p>
            </div>
          </div>

          {/* Progress Overview */}
          <Card style={{ backgroundColor: '#111520', borderColor: '#0D7377', borderWidth: '2px' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1" style={{ color: '#F0EAD6' }}>
                    Seu Progresso de Aprendizado
                  </h3>
                  <p className="text-sm" style={{ color: '#7A8299' }}>
                    Continue completando tutoriais para dominar o sistema
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold" style={{ color: '#14BDAE' }}>{Math.round(completionRate)}%</div>
                  <p className="text-sm" style={{ color: '#7A8299' }}>Concluído</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#7A8299' }} />
            <Input
              type="text"
              placeholder="Buscar tutoriais..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              style={selectedCategory === 'all' ? { backgroundColor: '#0D7377', color: '#F0EAD6' } : { borderColor: '#1E2535', color: '#D8DEEB' }}
            >
              Todos
            </Button>
            <Button
              variant={selectedCategory === 'basico' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('basico')}
              style={selectedCategory === 'basico' ? { backgroundColor: '#0D7377', color: '#F0EAD6' } : { borderColor: '#1E2535', color: '#D8DEEB' }}
            >
              Básico
            </Button>
            <Button
              variant={selectedCategory === 'avancado' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('avancado')}
              style={selectedCategory === 'avancado' ? { backgroundColor: '#0D7377', color: '#F0EAD6' } : { borderColor: '#1E2535', color: '#D8DEEB' }}
            >
              Avançado
            </Button>
            <Button
              variant={selectedCategory === 'estatisticas' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('estatisticas')}
              style={selectedCategory === 'estatisticas' ? { backgroundColor: '#0D7377', color: '#F0EAD6' } : { borderColor: '#1E2535', color: '#D8DEEB' }}
            >
              Estatísticas
            </Button>
          </div>
        </div>

        {/* Tutorial Categories */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4" style={{ backgroundColor: '#161B27' }}>
            <TabsTrigger value="all" className="data-[state=active]:bg-[#0D7377] data-[state=active]:text-[#F0EAD6]" style={{ color: '#D8DEEB' }}>
              Todos ({filteredTutorials.length})
            </TabsTrigger>
            <TabsTrigger value="basico" className="data-[state=active]:bg-[#0D7377] data-[state=active]:text-[#F0EAD6]" style={{ color: '#D8DEEB' }}>
              <Home className="h-4 w-4 mr-1" />
              Básico ({basicTutorials.length})
            </TabsTrigger>
            <TabsTrigger value="avancado" className="data-[state=active]:bg-[#0D7377] data-[state=active]:text-[#F0EAD6]" style={{ color: '#D8DEEB' }}>
              <Microscope className="h-4 w-4 mr-1" />
              Avançado ({advancedTutorials.length})
            </TabsTrigger>
            <TabsTrigger value="estatisticas" className="data-[state=active]:bg-[#0D7377] data-[state=active]:text-[#F0EAD6]" style={{ color: '#D8DEEB' }}>
              <BarChart3 className="h-4 w-4 mr-1" />
              Estatísticas ({statisticsTutorials.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {filteredTutorials.length === 0 ? (
              <Card style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
                <CardContent className="pt-6 text-center">
                  <p style={{ color: '#7A8299' }}>Nenhum tutorial encontrado para sua busca.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredTutorials.map((tutorial) => (
                  <TutorialCard key={tutorial.id} tutorial={tutorial} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="basico" className="space-y-4 mt-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#F0EAD6' }}>Tutoriais Básicos</h2>
              <p style={{ color: '#7A8299' }}>
                Comece aqui! Aprenda os fundamentos do sistema e cadastro de pacientes.
              </p>
            </div>
            <div className="grid gap-4">
              {basicTutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="avancado" className="space-y-4 mt-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#F0EAD6' }}>Tutoriais Avançados</h2>
              <p style={{ color: '#7A8299' }}>
                Domine recursos avançados como integração WhatsApp e exportação de dados.
              </p>
            </div>
            <div className="grid gap-4">
              {advancedTutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="estatisticas" className="space-y-4 mt-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#F0EAD6' }}>Análise Estatística</h2>
              <p style={{ color: '#7A8299' }}>
                Aprenda a realizar análises estatísticas avançadas e interpretar resultados.
              </p>
            </div>
            <div className="grid gap-4">
              {statisticsTutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Need More Help? */}
        <Card style={{ backgroundColor: '#111520', borderColor: '#1E2535', borderWidth: '2px' }}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0D7377] to-[#0A5A5E] flex items-center justify-center shrink-0">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1" style={{ color: '#F0EAD6' }}>Precisa de mais ajuda?</h3>
                <p className="text-sm mb-3" style={{ color: '#7A8299' }}>
                  Nossa equipe está pronta para responder suas dúvidas e ajudá-lo a aproveitar ao máximo o VigIA
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" style={{ borderColor: '#1E2535', color: '#D8DEEB' }}>
                    Enviar E-mail
                  </Button>
                  <Button variant="outline" size="sm" style={{ borderColor: '#1E2535', color: '#D8DEEB' }}>
                    Chat ao Vivo
                  </Button>
                  <Button variant="outline" size="sm" style={{ borderColor: '#1E2535', color: '#D8DEEB' }}>
                    Documentação
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
