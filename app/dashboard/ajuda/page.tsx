'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useTutorial } from '@/components/tutorial/TutorialProvider';
import { tutorialMetadata, TutorialMetadata, getTutorialSteps } from '@/lib/tutorial-steps';

export default function HelpCenterPage() {
  const { startTutorial, isTutorialCompleted, getCompletionRate } = useTutorial();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
        return 'bg-green-100 text-green-700 border-green-200';
      case 'avancado':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'estatisticas':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const TutorialCard = ({ tutorial }: { tutorial: typeof allTutorials[0] }) => {
    const isCompleted = isTutorialCompleted(tutorial.id);

    return (
      <Card
        className={`transition-all hover:shadow-md ${
          isCompleted ? 'border-2 border-green-300 bg-green-50' : 'hover:border-blue-300'
        }`}
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
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Concluído
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{tutorial.name}</CardTitle>
              <CardDescription className="mt-1">{tutorial.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Central de Ajuda</h1>
            <p className="text-lg text-gray-600">
              Aprenda a usar todas as funcionalidades do Telos.AI com nossos tutoriais interativos
            </p>
          </div>

          {/* Progress Overview */}
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Seu Progresso de Aprendizado
                  </h3>
                  <p className="text-sm text-gray-600">
                    Continue completando tutoriais para dominar o sistema
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600">{Math.round(completionRate)}%</div>
                  <p className="text-sm text-gray-600">Concluído</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar tutoriais..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              Todos
            </Button>
            <Button
              variant={selectedCategory === 'basico' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('basico')}
            >
              Básico
            </Button>
            <Button
              variant={selectedCategory === 'avancado' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('avancado')}
            >
              Avançado
            </Button>
            <Button
              variant={selectedCategory === 'estatisticas' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('estatisticas')}
            >
              Estatísticas
            </Button>
          </div>
        </div>

        {/* Tutorial Categories */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              Todos ({filteredTutorials.length})
            </TabsTrigger>
            <TabsTrigger value="basico">
              <Home className="h-4 w-4 mr-1" />
              Básico ({basicTutorials.length})
            </TabsTrigger>
            <TabsTrigger value="avancado">
              <Microscope className="h-4 w-4 mr-1" />
              Avançado ({advancedTutorials.length})
            </TabsTrigger>
            <TabsTrigger value="estatisticas">
              <BarChart3 className="h-4 w-4 mr-1" />
              Estatísticas ({statisticsTutorials.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {filteredTutorials.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-500">Nenhum tutorial encontrado para sua busca.</p>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tutoriais Básicos</h2>
              <p className="text-gray-600">
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tutoriais Avançados</h2>
              <p className="text-gray-600">
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Análise Estatística</h2>
              <p className="text-gray-600">
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
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Precisa de mais ajuda?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Nossa equipe está pronta para responder suas dúvidas e ajudá-lo a aproveitar ao máximo o Telos.AI
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    📧 Enviar E-mail
                  </Button>
                  <Button variant="outline" size="sm">
                    💬 Chat ao Vivo
                  </Button>
                  <Button variant="outline" size="sm">
                    📚 Documentação
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
