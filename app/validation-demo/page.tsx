'use client';

/**
 * Validation System Demo Page
 *
 * Interactive demonstration of the contextual validation system
 * showing how validation changes based on patient type.
 */

import React, { useState } from 'react';
import { ValidatedPatientForm } from '@/components/examples/ValidatedPatientForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  getRequiredFields,
  getRecommendedFields,
  getFieldLabel,
  type ValidationContext
} from '@/lib/registration-validation';
import { Info, Users, FlaskConical, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ValidationDemoPage() {
  const [mode, setMode] = useState<'standard' | 'research'>('standard');
  const [showComparison, setShowComparison] = useState(true);

  const standardContext: ValidationContext = {
    isResearchParticipant: false
  };

  const researchContext: ValidationContext = {
    isResearchParticipant: true,
    researchId: 'DEMO-STUDY-001',
    studyAgeRange: { min: 18, max: 80 }
  };

  const context = mode === 'research' ? researchContext : standardContext;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Sistema de Validação Contextual</h1>
              <p className="text-muted-foreground text-lg">
                Demonstração interativa de validação adaptativa
              </p>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Como funciona</AlertTitle>
            <AlertDescription>
              O sistema de validação ajusta automaticamente os campos obrigatórios e recomendados
              baseado no contexto do paciente. Troque entre os modos abaixo para ver as diferenças.
            </AlertDescription>
          </Alert>
        </div>

        {/* Mode Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Selecione o Tipo de Paciente</CardTitle>
            <CardDescription>
              Veja como as regras de validação mudam baseado no contexto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant={mode === 'standard' ? 'default' : 'outline'}
                size="lg"
                className="h-auto flex-col gap-2 p-6"
                onClick={() => setMode('standard')}
              >
                <Users className="w-8 h-8" />
                <div className="space-y-1">
                  <div className="font-semibold text-lg">Paciente Padrão</div>
                  <div className="text-sm font-normal text-muted-foreground">
                    Validação básica para acompanhamento clínico
                  </div>
                </div>
              </Button>

              <Button
                variant={mode === 'research' ? 'default' : 'outline'}
                size="lg"
                className="h-auto flex-col gap-2 p-6"
                onClick={() => setMode('research')}
              >
                <FlaskConical className="w-8 h-8" />
                <div className="space-y-1">
                  <div className="font-semibold text-lg">Participante de Pesquisa</div>
                  <div className="text-sm font-normal text-muted-foreground">
                    Validação rigorosa para estudos científicos
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Section */}
        {showComparison && (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Comparação de Requisitos</CardTitle>
                  <CardDescription>
                    Diferenças entre os dois modos de validação
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComparison(false)}
                >
                  Ocultar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Standard Patient Requirements */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-lg">Paciente Padrão</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="font-medium">Campos Obrigatórios ({getRequiredFields(standardContext).length})</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getRequiredFields(standardContext).map(field => (
                          <Badge key={field} variant="destructive">
                            {getFieldLabel(field)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-amber-500" />
                        <span className="font-medium">Campos Recomendados ({getRecommendedFields(standardContext).length})</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getRecommendedFields(standardContext).map(field => (
                          <Badge key={field} variant="secondary" className="bg-amber-100 text-amber-700">
                            {getFieldLabel(field)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Research Participant Requirements */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold text-lg">Participante de Pesquisa</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="font-medium">Campos Obrigatórios ({getRequiredFields(researchContext).length})</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getRequiredFields(researchContext).map(field => (
                          <Badge key={field} variant="destructive">
                            {getFieldLabel(field)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-amber-500" />
                        <span className="font-medium">Campos Recomendados ({getRecommendedFields(researchContext).length})</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getRecommendedFields(researchContext).map(field => (
                          <Badge key={field} variant="secondary" className="bg-amber-100 text-amber-700">
                            {getFieldLabel(field)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Principais Diferenças</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Pesquisas exigem <strong>CPF, Email, Data de Nascimento e Sexo</strong> como obrigatórios</li>
                      <li>Pesquisas validam <strong>idade dentro do intervalo do estudo</strong> (18-80 anos)</li>
                      <li>Pesquisas recomendam <strong>histórico médico completo</strong></li>
                      <li>Pacientes padrão têm <strong>mais flexibilidade</strong> nos campos</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Demo Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Formulário Demonstrativo</CardTitle>
                <CardDescription>
                  Modo: {mode === 'standard' ? 'Paciente Padrão' : 'Participante de Pesquisa'}
                </CardDescription>
              </div>
              <Badge variant={mode === 'research' ? 'default' : 'secondary'} className="text-sm">
                {mode === 'standard' ? (
                  <>
                    <Users className="w-3 h-3 mr-1" />
                    Padrão
                  </>
                ) : (
                  <>
                    <FlaskConical className="w-3 h-3 mr-1" />
                    Pesquisa
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ValidatedPatientForm
              isResearchParticipant={mode === 'research'}
              researchId={mode === 'research' ? 'DEMO-STUDY-001' : undefined}
              studyAgeRange={mode === 'research' ? { min: 18, max: 80 } : undefined}
              onSubmit={(data) => {
                console.log('Form submitted:', data);
                alert('Formulário válido! Verifique o console para os dados.');
              }}
            />
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <CardTitle className="text-lg">Validação em Tempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Feedback instantâneo enquanto o usuário preenche o formulário,
                mostrando erros e avisos apenas após interação com o campo.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Info className="w-8 h-8 text-blue-500 mb-2" />
              <CardTitle className="text-lg">Badges Contextuais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Indicadores visuais que mostram quais campos são obrigatórios,
                recomendados ou opcionais, com tooltips explicativos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
              <CardTitle className="text-lg">Resumo de Validação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Visualização clara de todos os campos pendentes e erros,
                organizada por seções para facilitar a correção.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Documentation Links */}
        <Card>
          <CardHeader>
            <CardTitle>Documentação</CardTitle>
            <CardDescription>
              Recursos adicionais para implementação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start" asChild>
                <a href="/VALIDATION_SYSTEM_GUIDE.md" target="_blank">
                  <Info className="w-4 h-4 mr-2" />
                  Guia Completo do Sistema
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href="/VALIDATION_QUICK_REFERENCE.md" target="_blank">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Referência Rápida
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
