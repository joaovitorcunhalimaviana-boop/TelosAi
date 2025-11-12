import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, Star, TrendingUp, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";

export default async function BillingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "medico") {
    redirect("/dashboard");
  }

  const pacientes = await prisma.patient.count({
    where: { userId: user.id },
  });

  const incluidos = user.maxPatients;
  const adicionais = Math.max(0, pacientes - incluidos);
  const custoBase = Number(user.basePrice);
  const custoAdicional = adicionais * Number(user.additionalPatientPrice);
  const total = custoBase + custoAdicional;

  // Calculate usage percentage
  const usagePercentage = Math.min(100, (pacientes / incluidos) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar ao Dashboard
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-blue-900">
                Meu Plano e Billing
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Acompanhe seu plano e custos mensais
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Card do Plano Principal */}
        <Card className="border-2 shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">
                  {user.plan === "founding" ? "Plano Founding Member" : "Plano Professional"}
                </CardTitle>
                {user.isLifetimePrice && (
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                      Preço vitalício garantido
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Total este mês</p>
                <p className="text-4xl font-bold">
                  R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Detalhamento do Billing */}
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-medium">Plano base</span>
                    <div className="text-sm text-gray-600">
                      Inclui {incluidos} pacientes
                    </div>
                  </div>
                </div>
                <span className="font-bold text-lg">R$ {custoBase.toFixed(2)}</span>
              </div>

              {adicionais > 0 && (
                <div className="flex justify-between items-center pb-3 border-b bg-yellow-50 -mx-6 px-6 py-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <span className="font-medium text-yellow-900">
                        {adicionais} paciente{adicionais > 1 ? "s" : ""} adicional
                        {adicionais > 1 ? "is" : ""}
                      </span>
                      <div className="text-sm text-yellow-700">
                        R$ {Number(user.additionalPatientPrice).toFixed(2)} por paciente
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-lg text-yellow-900">
                    R$ {custoAdicional.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t-2">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl text-blue-600">
                  R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uso de Pacientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Uso de Pacientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pacientes cadastrados</span>
                  <span className="font-bold text-2xl text-blue-600">{pacientes}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Limite do plano: {incluidos}</span>
                    <span>{usagePercentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        pacientes <= incluidos ? "bg-green-500" : "bg-yellow-500"
                      }`}
                      style={{
                        width: `${usagePercentage}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t">
                  {pacientes <= incluidos ? (
                    <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                      Você ainda tem{" "}
                      <span className="font-bold">{incluidos - pacientes}</span> paciente
                      {incluidos - pacientes !== 1 ? "s" : ""} disponível
                      {incluidos - pacientes !== 1 ? "is" : ""} no plano
                    </div>
                  ) : (
                    <div className="text-sm text-yellow-800 bg-yellow-50 p-3 rounded-lg">
                      Você está usando{" "}
                      <span className="font-bold">{adicionais}</span> paciente
                      {adicionais !== 1 ? "s" : ""} adicional{adicionais !== 1 ? "is" : ""}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalhes do Plano */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {user.plan === "founding" ? (
                  <Star className="h-5 w-5 text-yellow-600" />
                ) : (
                  <DollarSign className="h-5 w-5 text-blue-600" />
                )}
                Detalhes do Plano
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Tipo de plano</div>
                  <Badge
                    variant={user.plan === "founding" ? "secondary" : "default"}
                    className={`${
                      user.plan === "founding"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    } px-3 py-1 text-sm`}
                  >
                    {user.plan === "founding" ? "Founding Member" : "Professional"}
                  </Badge>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valor base mensal</span>
                    <span className="font-semibold">R$ {custoBase.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pacientes inclusos</span>
                    <span className="font-semibold">{incluidos}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Preço por adicional</span>
                    <span className="font-semibold">
                      R$ {Number(user.additionalPatientPrice).toFixed(2)}
                    </span>
                  </div>
                </div>

                {user.isLifetimePrice && (
                  <div className="border-t pt-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Lock className="h-4 w-4 text-yellow-700 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-yellow-800">
                          <div className="font-semibold mb-1">Preço vitalício garantido</div>
                          <div>
                            Como founding member, seus preços estão garantidos para sempre,
                            sem reajustes.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações Adicionais */}
        <Card className="border-2 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-2">Como funciona o billing</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Seu plano base inclui {incluidos} pacientes cadastrados</li>
                  <li>
                    • Cada paciente adicional custa R${" "}
                    {Number(user.additionalPatientPrice).toFixed(2)}/mês
                  </li>
                  <li>• O billing é calculado automaticamente com base no número de pacientes</li>
                  <li>• Você pode adicionar quantos pacientes precisar</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
