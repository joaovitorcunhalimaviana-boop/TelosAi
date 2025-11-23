import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { PrivateLayout } from "@/components/PrivateLayout";
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
    <PrivateLayout>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground hover:text-primary">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-[#0A2647]">
              Meu Plano e Faturamento
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie sua assinatura e acompanhe seus custos
            </p>
          </div>
        </div>

        {/* Card do Plano Principal */}
        <Card className="border-2 shadow-lg mb-8 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#0A2647] to-[#1a3b66] text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                  {user.plan === "founding" ? "Plano Founding Member" : "Plano Professional"}
                  {user.plan === "founding" && <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />}
                </CardTitle>
                {user.isLifetimePrice && (
                  <div className="flex items-center gap-2 text-blue-100 bg-white/10 px-3 py-1 rounded-full w-fit">
                    <Lock className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      Preço vitalício garantido
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80 mb-1">Total estimado este mês</p>
                <p className="text-4xl font-bold tracking-tight">
                  R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Detalhamento do Billing */}
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-dashed">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <DollarSign className="h-6 w-6 text-[#0A2647]" />
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-gray-900">Plano Base</span>
                    <div className="text-sm text-muted-foreground">
                      Inclui {incluidos} pacientes ativos
                    </div>
                  </div>
                </div>
                <span className="font-bold text-xl text-gray-700">R$ {custoBase.toFixed(2)}</span>
              </div>

              {adicionais > 0 ? (
                <div className="flex justify-between items-center pb-4 border-b border-dashed bg-yellow-50/50 -mx-6 px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-100 p-3 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-yellow-700" />
                    </div>
                    <div>
                      <span className="font-semibold text-lg text-yellow-900">
                        {adicionais} paciente{adicionais > 1 ? "s" : ""} adicional{adicionais > 1 ? "is" : ""}
                      </span>
                      <div className="text-sm text-yellow-700">
                        R$ {Number(user.additionalPatientPrice).toFixed(2)} por paciente extra
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-xl text-yellow-900">
                    R$ {custoAdicional.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                  <div className="bg-green-100 p-1 rounded-full">
                    <TrendingUp className="h-3 w-3" />
                  </div>
                  Você está dentro do limite do seu plano. Sem custos adicionais.
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-xl text-[#0A2647]">Total Mensal</span>
                <span className="font-bold text-3xl text-[#0A2647]">
                  R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de Informações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Uso de Pacientes */}
          <Card className="border shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-700">
                <Users className="h-5 w-5 text-[#0A2647]" />
                Uso de Pacientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 mt-2">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-4xl font-bold text-[#0A2647]">{pacientes}</span>
                    <span className="text-muted-foreground ml-2">pacientes cadastrados</span>
                  </div>
                  <span className="font-medium text-gray-600">{usagePercentage.toFixed(0)}% do plano base</span>
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${pacientes <= incluidos ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      style={{
                        width: `${Math.min(100, (pacientes / incluidos) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>{incluidos} (Base)</span>
                    {pacientes > incluidos && <span>{pacientes} (Atual)</span>}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  {pacientes <= incluidos ? (
                    <div className="flex items-center gap-3 text-sm text-green-700 bg-green-50 p-4 rounded-lg border border-green-100">
                      <div className="bg-green-200 p-1.5 rounded-full">
                        <Users className="h-4 w-4 text-green-800" />
                      </div>
                      <div>
                        Você ainda pode adicionar <span className="font-bold">{incluidos - pacientes}</span> pacientes
                        sem custo adicional.
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-sm text-yellow-800 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                      <div className="bg-yellow-200 p-1.5 rounded-full">
                        <TrendingUp className="h-4 w-4 text-yellow-800" />
                      </div>
                      <div>
                        Você está utilizando <span className="font-bold">{adicionais}</span> vagas adicionais
                        além do seu plano base.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalhes do Plano */}
          <Card className="border shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-700">
                <Star className="h-5 w-5 text-[#0A2647]" />
                Detalhes da Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 mt-2">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Plano Atual</div>
                  <Badge
                    variant="outline"
                    className={`${user.plan === "founding"
                      ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                      : "bg-blue-50 text-blue-800 border-blue-200"
                      } px-4 py-1.5 text-base font-medium`}
                  >
                    {user.plan === "founding" ? "Founding Member 🌟" : "Professional"}
                  </Badge>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-sm py-2 border-b border-dashed">
                    <span className="text-gray-600">Valor base mensal</span>
                    <span className="font-semibold text-gray-900">R$ {custoBase.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-dashed">
                    <span className="text-gray-600">Franquia de pacientes</span>
                    <span className="font-semibold text-gray-900">{incluidos} pacientes</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-dashed">
                    <span className="text-gray-600">Custo por paciente extra</span>
                    <span className="font-semibold text-gray-900">
                      R$ {Number(user.additionalPatientPrice).toFixed(2)}
                    </span>
                  </div>
                </div>

                {user.isLifetimePrice && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <Lock className="h-5 w-5 text-blue-700 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <div className="font-bold mb-1">Preço Vitalício Garantido</div>
                        <p className="opacity-90 leading-relaxed">
                          Como membro fundador, seus valores de base e adicional estão congelados e nunca sofrerão reajustes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PrivateLayout>
  );
}
