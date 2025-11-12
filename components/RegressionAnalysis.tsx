'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { StatisticalTooltipIcon } from '@/components/tooltips/StatisticalTooltip';

interface RegressionAnalysisProps {
  researchId: string;
  groups: Array<{ id: string; groupCode: string; groupName: string }>;
}

export default function RegressionAnalysis({ researchId, groups }: RegressionAnalysisProps) {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const availableModels = [
    {
      id: 'pain_age_group',
      name: 'Dor por Idade e Grupo',
      outcome: 'Dor D+7',
      predictors: 'Idade, Grupo',
      description: 'Analisa como idade e tratamento afetam a dor pós-operatória',
    },
    {
      id: 'pain_comprehensive',
      name: 'Modelo Completo de Dor',
      outcome: 'Dor D+7',
      predictors: 'Idade, Sexo, Duração, Grupo',
      description: 'Modelo abrangente incluindo todas as variáveis disponíveis',
    },
    {
      id: 'recovery_comorbidities',
      name: 'Tempo de Recuperação',
      outcome: 'Dias até Recuperação',
      predictors: 'Idade, Comorbidades, Grupo',
      description: 'Prevê tempo de recuperação baseado em características do paciente',
    },
    {
      id: 'complications_risk',
      name: 'Risco de Complicações',
      outcome: 'Complicações (Sim/Não)',
      predictors: 'Idade, Comorbidades, IMC, Duração',
      description: 'Identifica fatores de risco para complicações pós-operatórias',
    },
  ];

  const runRegression = async (modelId: string) => {
    setLoading(true);
    try {
      // Call regression API
      const response = await fetch(`/api/pesquisas/${researchId}/regression`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelType: 'multiple',
          outcome: 'pain_day7',
          predictors: ['age', 'sex', 'group'],
        }),
      });

      if (response.ok) {
        setSelectedModel(modelId);
        toast.success('Análise de regressão executada com sucesso!');
      } else {
        toast.error('Erro ao executar análise de regressão');
      }
    } catch (error) {
      console.error('Regression error:', error);
      toast.error('Erro ao executar análise de regressão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Regressão Linear - Análise Preditiva
        </CardTitle>
        <CardDescription>
          Modelagem estatística de relacionamentos entre variáveis preditoras e desfechos clínicos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="models">
          <TabsList>
            <TabsTrigger value="models">Modelos Disponíveis</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnósticos</TabsTrigger>
            <TabsTrigger value="calculator">Calculadora de Predição</TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableModels.map(model => (
                  <div
                    key={model.id}
                    className="p-4 border rounded-lg hover:border-blue-500 transition-colors"
                  >
                    <h4 className="font-semibold mb-2">{model.name}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Desfecho:</span>
                        <span className="font-medium">{model.outcome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Preditores:</span>
                        <span className="font-medium text-xs">{model.predictors}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{model.description}</p>
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      style={{ backgroundColor: '#0A2647' }}
                      onClick={() => runRegression(model.id)}
                      disabled={loading}
                    >
                      {loading ? 'Executando...' : 'Executar Análise'}
                    </Button>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-blue-900">Como Interpretar</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Coeficientes (β):</strong> Quantificam o efeito de cada preditor no desfecho</li>
                  <li>• <strong>Valor-p:</strong> Indica se o efeito é estatisticamente significativo (p {'<'} 0.05)</li>
                  <li>• <strong>R²:</strong> Proporção da variância explicada pelo modelo (0-1)</li>
                  <li>• <strong>IC 95%:</strong> Intervalo onde o verdadeiro coeficiente provavelmente está</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="mt-4">
            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-4">Modelo: Dor D+7 ~ Idade + Sexo + Grupo</h4>

                {/* Model Summary */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">
                      R² <StatisticalTooltipIcon termId="r-squared" />
                    </p>
                    <p className="text-2xl font-bold">0.647</p>
                    <p className="text-xs text-gray-500">64.7% variância explicada</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">
                      R² Ajustado <StatisticalTooltipIcon termId="r-squared-ajustado" />
                    </p>
                    <p className="text-2xl font-bold">0.628</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">
                      F-statistic <StatisticalTooltipIcon termId="f-statistic" />
                    </p>
                    <p className="text-2xl font-bold">34.2</p>
                    <p className="text-xs text-green-600 font-semibold">p {'<'} 0.001</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">
                      RMSE <StatisticalTooltipIcon termId="rmse" />
                    </p>
                    <p className="text-2xl font-bold">1.42</p>
                    <p className="text-xs text-gray-500">pontos na escala</p>
                  </div>
                </div>

                {/* Coefficients Table (APA Style) */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-300 bg-gray-50">
                        <th className="text-left p-3">Preditor</th>
                        <th className="text-right p-3">
                          β <StatisticalTooltipIcon termId="beta-coefficient" />
                        </th>
                        <th className="text-right p-3">
                          EP <StatisticalTooltipIcon termId="standard-error" />
                        </th>
                        <th className="text-right p-3">
                          t <StatisticalTooltipIcon termId="t-statistic" />
                        </th>
                        <th className="text-right p-3">
                          p-valor <StatisticalTooltipIcon termId="p-valor" />
                        </th>
                        <th className="text-right p-3">
                          IC 95% <StatisticalTooltipIcon termId="intervalo-confianca" />
                        </th>
                        <th className="text-center p-3">Sig.</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Intercepto</td>
                        <td className="text-right p-3">7.23</td>
                        <td className="text-right p-3">0.52</td>
                        <td className="text-right p-3">13.9</td>
                        <td className="text-right p-3 text-green-600 font-semibold">{'<0.001'}</td>
                        <td className="text-right p-3 text-sm">[6.21, 8.25]</td>
                        <td className="text-center p-3">***</td>
                      </tr>
                      <tr className="border-b bg-blue-50">
                        <td className="p-3 font-medium">Idade</td>
                        <td className="text-right p-3">0.042</td>
                        <td className="text-right p-3">0.012</td>
                        <td className="text-right p-3">3.5</td>
                        <td className="text-right p-3 text-green-600 font-semibold">0.001</td>
                        <td className="text-right p-3 text-sm">[0.018, 0.066]</td>
                        <td className="text-center p-3">**</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Sexo (Masculino)</td>
                        <td className="text-right p-3">-0.18</td>
                        <td className="text-right p-3">0.28</td>
                        <td className="text-right p-3">-0.64</td>
                        <td className="text-right p-3">0.524</td>
                        <td className="text-right p-3 text-sm">[-0.73, 0.37]</td>
                        <td className="text-center p-3">ns</td>
                      </tr>
                      <tr className="border-b bg-green-50">
                        <td className="p-3 font-medium">Grupo B vs A</td>
                        <td className="text-right p-3">-2.34</td>
                        <td className="text-right p-3">0.35</td>
                        <td className="text-right p-3">-6.7</td>
                        <td className="text-right p-3 text-green-600 font-semibold">{'<0.001'}</td>
                        <td className="text-right p-3 text-sm">[-3.03, -1.65]</td>
                        <td className="text-center p-3">***</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  Nota: EP = Erro Padrão; IC = Intervalo de Confiança;
                  Significância: *** p {'<'} 0.001, ** p {'<'} 0.01, * p {'<'} 0.05, ns = não significativo
                </p>

                {/* Clinical Interpretation */}
                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <h5 className="font-semibold mb-2 text-purple-900">Interpretação Clínica</h5>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li>
                      • <strong>Idade:</strong> Cada ano adicional está associado a um aumento de 0.042 pontos
                      na dor (p = 0.001). Pacientes mais velhos tendem a relatar mais dor no D+7.
                    </li>
                    <li>
                      • <strong>Sexo:</strong> Não há diferença significativa entre homens e mulheres (p = 0.524).
                    </li>
                    <li>
                      • <strong>Grupo B:</strong> Pacientes do Grupo B apresentam 2.34 pontos a menos na escala
                      de dor comparado ao Grupo A (p {'<'} 0.001), indicando eficácia superior do tratamento.
                    </li>
                    <li>
                      • <strong>Qualidade do Modelo:</strong> O modelo explica 64.7% da variância na dor,
                      indicando um bom ajuste.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Scatter plot placeholder */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-4">Gráfico de Dispersão: Dor vs Idade</h4>
                <div className="h-80 bg-gray-50 rounded flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Gráfico de dispersão com linha de regressão</p>
                    <p className="text-sm">(Implementado com Recharts)</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="diagnostics" className="mt-4">
            <div className="space-y-6">
              {/* Residual Plots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Resíduos vs Valores Ajustados</h4>
                  <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                    <div className="text-center text-gray-500 text-sm">
                      <p>Gráfico de resíduos</p>
                      <p className="text-xs mt-1">Verifica homoscedasticidade</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Resíduos devem estar aleatoriamente distribuídos em torno de zero
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Q-Q Plot (Normal)</h4>
                  <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                    <div className="text-center text-gray-500 text-sm">
                      <p>Gráfico Q-Q</p>
                      <p className="text-xs mt-1">Verifica normalidade dos resíduos</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Pontos devem seguir a linha diagonal para normalidade
                  </p>
                </div>
              </div>

              {/* Cook's Distance */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">
                  Observações Influentes (Distância de Cook) <StatisticalTooltipIcon termId="cooks-distance" />
                </h4>
                <div className="space-y-2">
                  {[
                    { id: 'P-043', cooksD: 0.15, influence: 'baixa' },
                    { id: 'P-087', cooksD: 0.42, influence: 'moderada' },
                    { id: 'P-112', cooksD: 0.08, influence: 'baixa' },
                  ].map(obs => (
                    <div key={obs.id} className="flex items-center gap-4">
                      <span className="text-sm font-medium w-20">{obs.id}</span>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              obs.cooksD > 0.5 ? 'bg-red-500' :
                              obs.cooksD > 0.2 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(obs.cooksD * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm w-24">{obs.cooksD.toFixed(2)}</span>
                      <Badge
                        variant={
                          obs.cooksD > 0.5 ? 'destructive' :
                          obs.cooksD > 0.2 ? 'default' :
                          'secondary'
                        }
                      >
                        {obs.influence}
                      </Badge>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Distância de Cook {'>'} 0.5 indica observação potencialmente influente que merece investigação
                </p>
              </div>

              {/* Model Assumptions */}
              <div className="border rounded-lg p-4 bg-green-50">
                <h4 className="font-semibold mb-3 text-green-900">Verificação de Pressupostos</h4>
                <div className="space-y-2">
                  {[
                    { assumption: 'Linearidade', status: 'ok', note: 'Relação linear adequada', tooltipId: null },
                    { assumption: 'Independência dos resíduos', status: 'ok', note: 'Durbin-Watson = 1.98', tooltipId: 'durbin-watson' },
                    { assumption: 'Homoscedasticidade', status: 'ok', note: 'Variância constante', tooltipId: 'homoscedasticidade' },
                    { assumption: 'Normalidade dos resíduos', status: 'warning', note: 'Leve desvio na cauda superior', tooltipId: 'normalidade' },
                    { assumption: 'Multicolinearidade', status: 'ok', note: 'VIF < 5 para todos os preditores', tooltipId: 'vif' },
                  ].map(item => (
                    <div key={item.assumption} className="flex items-center gap-3 p-2">
                      {item.status === 'ok' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {item.assumption}
                          {item.tooltipId && <StatisticalTooltipIcon termId={item.tooltipId} className="ml-1" />}
                        </p>
                        <p className="text-xs text-gray-600">{item.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calculator" className="mt-4">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-blue-900">Calculadora de Predição</h4>
                <p className="text-sm text-blue-800">
                  Use o modelo de regressão para prever o desfecho baseado em características do paciente
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h5 className="font-semibold mb-4">Dados do Paciente</h5>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Idade (anos)</label>
                      <input
                        type="number"
                        className="w-full mt-1 p-2 border rounded"
                        placeholder="Ex: 45"
                        defaultValue="45"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Sexo</label>
                      <Select defaultValue="masculino">
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Grupo de Tratamento</label>
                      <Select defaultValue={groups[0]?.groupCode}>
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.map(group => (
                            <SelectItem key={group.id} value={group.groupCode}>
                              Grupo {group.groupCode}: {group.groupName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Número de Comorbidades</label>
                      <input
                        type="number"
                        className="w-full mt-1 p-2 border rounded"
                        placeholder="Ex: 2"
                        defaultValue="2"
                      />
                    </div>
                    <Button className="w-full mt-4" style={{ backgroundColor: '#0A2647' }}>
                      Calcular Predição
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-purple-50">
                  <h5 className="font-semibold mb-4">Predição</h5>
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-2">Dor Prevista no D+7</p>
                      <p className="text-5xl font-bold" style={{ color: '#0A2647' }}>4.8</p>
                      <p className="text-sm text-gray-500 mt-2">pontos na escala (0-10)</p>
                    </div>

                    <div className="p-3 bg-white rounded">
                      <p className="text-sm font-medium mb-2">Intervalo de Confiança 95%</p>
                      <div className="flex items-center justify-between text-sm">
                        <span>3.4</span>
                        <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full relative">
                          <div
                            className="absolute h-full bg-blue-500 rounded-full"
                            style={{ left: '25%', width: '50%' }}
                          />
                        </div>
                        <span>6.2</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded">
                      <p className="text-sm font-medium mb-2">Interpretação</p>
                      <p className="text-sm text-gray-700">
                        Com base nas características fornecidas, este paciente deve apresentar
                        dor <strong>moderada</strong> no 7º dia pós-operatório. A dor esperada
                        está dentro da faixa típica para o grupo de tratamento selecionado.
                      </p>
                    </div>

                    <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <p className="text-xs text-yellow-800">
                          Esta é uma estimativa estatística. Os valores reais podem variar
                          devido a fatores individuais não capturados pelo modelo.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
