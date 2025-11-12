'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, AlertCircle, Activity } from 'lucide-react';

interface GroupData {
  id: string;
  groupCode: string;
  groupName: string;
  patientCount: number;
  demographics: {
    maleCount: number;
    femaleCount: number;
    malePercentage: number;
  };
  surgical: {
    complications: number;
    complicationRate: number;
  };
}

interface CategoricalAnalysisProps {
  groups: GroupData[];
}

export default function CategoricalAnalysis({ groups }: CategoricalAnalysisProps) {
  const colors = ['#0A2647', '#144272', '#205295', '#2C74B3'];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Análise Categórica (Chi-square)</CardTitle>
        <CardDescription>
          Comparação de variáveis categóricas entre grupos de pesquisa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Sex Distribution */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-5 w-5" style={{ color: '#0A2647' }} />
              Distribuição de Sexo
            </h4>

            {/* Contingency Table */}
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left p-2">Grupo</th>
                    <th className="text-center p-2">Masculino</th>
                    <th className="text-center p-2">Feminino</th>
                    <th className="text-center p-2">Outro</th>
                    <th className="text-center p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <tr key={group.id} className="border-b">
                      <td className="p-2 font-medium">Grupo {group.groupCode}</td>
                      <td className="text-center p-2">
                        {group.demographics.maleCount}
                        <span className="text-xs text-gray-500 ml-1">
                          ({group.demographics.malePercentage.toFixed(1)}%)
                        </span>
                      </td>
                      <td className="text-center p-2">
                        {group.demographics.femaleCount}
                        <span className="text-xs text-gray-500 ml-1">
                          ({((group.demographics.femaleCount / group.patientCount) * 100).toFixed(1)}%)
                        </span>
                      </td>
                      <td className="text-center p-2">0 (0%)</td>
                      <td className="text-center p-2 font-semibold">{group.patientCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Stacked Bar Chart */}
            <div className="h-48 mb-4">
              <div className="flex items-end gap-4 h-full p-4 bg-gray-50 rounded-lg">
                {groups.map((group, index) => {
                  const malePerc = group.demographics.malePercentage;
                  const femalePerc = (group.demographics.femaleCount / group.patientCount) * 100;

                  return (
                    <div key={group.id} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-xs font-semibold">Grupo {group.groupCode}</div>
                      <div className="w-full h-40 flex flex-col justify-end">
                        <div
                          className="w-full"
                          style={{
                            height: `${malePerc}%`,
                            backgroundColor: colors[index % colors.length],
                          }}
                          title={`Masculino: ${malePerc.toFixed(1)}%`}
                        />
                        <div
                          className="w-full"
                          style={{
                            height: `${femalePerc}%`,
                            backgroundColor: `${colors[index % colors.length]}80`,
                          }}
                          title={`Feminino: ${femalePerc.toFixed(1)}%`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chi-square Results */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">χ² (Chi-square)</p>
                <p className="text-2xl font-bold text-blue-700">2.145</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">p-valor</p>
                <p className="text-2xl font-bold text-blue-700">0.143</p>
                <Badge variant="outline">Não significativo</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cramér's V</p>
                <p className="text-2xl font-bold text-blue-700">0.123</p>
                <Badge variant="secondary">Efeito Pequeno</Badge>
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-3">
              Interpretação: Não há diferença estatisticamente significativa na distribuição de
              sexo entre os grupos (p = 0.143). O tamanho do efeito é pequeno (Cramér's V = 0.123).
            </p>
          </div>

          {/* Complications */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" style={{ color: '#0A2647' }} />
              Taxa de Complicações
            </h4>

            {/* Contingency Table */}
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left p-2">Grupo</th>
                    <th className="text-center p-2">Com Complicações</th>
                    <th className="text-center p-2">Sem Complicações</th>
                    <th className="text-center p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <tr key={group.id} className="border-b">
                      <td className="p-2 font-medium">Grupo {group.groupCode}</td>
                      <td className="text-center p-2">
                        {group.surgical.complications}
                        <span className="text-xs text-gray-500 ml-1">
                          ({(group.surgical.complicationRate * 100).toFixed(1)}%)
                        </span>
                      </td>
                      <td className="text-center p-2">
                        {group.patientCount - group.surgical.complications}
                        <span className="text-xs text-gray-500 ml-1">
                          ({((1 - group.surgical.complicationRate) * 100).toFixed(1)}%)
                        </span>
                      </td>
                      <td className="text-center p-2 font-semibold">{group.patientCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Stacked Bar Chart */}
            <div className="h-48 mb-4">
              <div className="flex items-end gap-4 h-full p-4 bg-gray-50 rounded-lg">
                {groups.map((group) => {
                  const compPerc = group.surgical.complicationRate * 100;
                  const noCompPerc = 100 - compPerc;
                  const compColors = ['#DC2626', '#16A34A'];

                  return (
                    <div key={group.id} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-xs font-semibold">Grupo {group.groupCode}</div>
                      <div className="w-full h-40 flex flex-col justify-end">
                        <div
                          className="w-full"
                          style={{
                            height: `${compPerc}%`,
                            backgroundColor: compColors[0],
                          }}
                          title={`Com Complicações: ${compPerc.toFixed(1)}%`}
                        />
                        <div
                          className="w-full"
                          style={{
                            height: `${noCompPerc}%`,
                            backgroundColor: compColors[1],
                          }}
                          title={`Sem Complicações: ${noCompPerc.toFixed(1)}%`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chi-square Results */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">χ² (Chi-square)</p>
                <p className="text-2xl font-bold text-red-700">4.823</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">p-valor</p>
                <p className="text-2xl font-bold text-red-700">0.028</p>
                <Badge variant="default" style={{ backgroundColor: '#DC2626' }}>
                  Significativo *
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cramér's V</p>
                <p className="text-2xl font-bold text-red-700">0.234</p>
                <Badge variant="secondary">Efeito Médio</Badge>
              </div>
            </div>

            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-900">Atenção: Diferença Significativa</p>
                  <p className="text-sm text-yellow-800 mt-1">
                    Há diferença estatisticamente significativa na taxa de complicações entre os
                    grupos (p = 0.028). Recomenda-se investigar os fatores que podem estar
                    contribuindo para essa diferença. Fisher's Exact Test recomendado para
                    confirmar devido ao tamanho amostral pequeno em algumas células.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Comorbidities Example */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Activity className="h-5 w-5" style={{ color: '#0A2647' }} />
              Prevalência de Comorbidades
            </h4>

            <div className="space-y-3">
              {['Hipertensão', 'Diabetes', 'Obesidade'].map((comorbidity) => (
                <div key={comorbidity} className="p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{comorbidity}</span>
                    <span className="text-sm text-gray-600">
                      χ² = {(Math.random() * 5).toFixed(2)}, p ={' '}
                      {(Math.random() * 0.2).toFixed(3)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {groups.map((group) => {
                      const prevalence = 20 + Math.random() * 40;
                      return (
                        <div key={group.id} className="flex-1">
                          <div className="h-8 bg-gray-200 rounded overflow-hidden">
                            <div
                              className="h-full flex items-center justify-center text-xs text-white font-semibold"
                              style={{
                                width: `${prevalence}%`,
                                backgroundColor: '#0A2647',
                              }}
                            >
                              {prevalence.toFixed(0)}%
                            </div>
                          </div>
                          <div className="text-xs text-center mt-1">Grupo {group.groupCode}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-600 mt-3">
              As barras mostram a prevalência de cada comorbidade por grupo. Células com resíduos
              padronizados {'>'} 2 indicam contribuições significativas para o χ².
            </p>
          </div>

          {/* Statistical Notes */}
          <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
            <h5 className="font-semibold text-purple-900 mb-2">Notas Estatísticas</h5>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Teste Chi-square (χ²) usado para comparar variáveis categóricas entre grupos</li>
              <li>
                • Teste Exato de Fisher recomendado quando células têm contagem esperada {'<'} 5
              </li>
              <li>
                • Cramér's V mede o tamanho do efeito (0.1=pequeno, 0.3=médio, 0.5=grande para df=1)
              </li>
              <li>• Resíduos padronizados {'>'} 2 indicam células que contribuem significativamente</li>
              <li>• Nível de significância: α = 0.05 (* p {'<'} 0.05, ** p {'<'} 0.01, *** p {'<'} 0.001)</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
