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
      <div className="container mx-auto px-6 py-8" style={{ backgroundColor: '#0B0E14' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="-ml-3 hover:bg-[#1E2535]" style={{ color: '#7A8299' }}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold" style={{ color: '#F0EAD6' }}>
              Meu Plano e Faturamento
            </h1>
            <p className="mt-1" style={{ color: '#7A8299' }}>
              Gerencie sua assinatura e acompanhe seus custos
            </p>
          </div>
        </div>

        {/* Card do Plano Principal */}
        <Card className="border-2 shadow-lg mb-8 overflow-hidden" style={{ borderColor: '#1E2535', backgroundColor: '#111520' }}>
          <CardHeader className="bg-gradient-to-r from-[#0D7377] to-[#0A5A5E] text-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2 flex items-center gap-2 text-white">
                  {user.plan === "founding" ? "Plano Founding Member" : "Plano Professional"}
                  {user.plan === "founding" && <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />}
                </CardTitle>
                {user.isLifetimePrice && (
                  <div className="flex items-center gap-2 text-teal-100 bg-white/10 px-3 py-1 rounded-full w-fit">
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
              <div className="flex justify-between items-center pb-4" style={{ borderBottom: '1px dashed #1E2535' }}>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: '#1E2535' }}>
                    <DollarSign className="h-6 w-6" style={{ color: '#14BDAE' }} />
                  </div>
                  <div>
                    <span className="font-semibold text-lg" style={{ color: '#F0EAD6' }}>Plano Base</span>
                    <div className="text-sm" style={{ color: '#7A8299' }}>
                      Inclui {incluidos} pacientes ativos
                    </div>
                  </div>
                </div>
                <span className="font-bold text-xl" style={{ color: '#D8DEEB' }}>R$ {custoBase.toFixed(2)}</span>
              </div>

              {adicionais > 0 ? (
                <div className="flex justify-between items-center pb-4 -mx-6 px-6 py-4" style={{ borderBottom: '1px dashed #1E2535', backgroundColor: '#1A1A0E' }}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: '#2A2A1E' }}>
                      <TrendingUp className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <span className="font-semibold text-lg text-yellow-400">
                        {adicionais} paciente{adicionais > 1 ? "s" : ""} adicional{adicionais > 1 ? "is" : ""}
                      </span>
                      <div className="text-sm text-yellow-500/80">
                        R$ {Number(user.additionalPatientPrice).toFixed(2)} por paciente extra
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-xl text-yellow-400">
                    R$ {custoAdicional.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-sm p-3 rounded-lg" style={{ backgroundColor: '#0D73771A', color: '#14BDAE' }}>
                  <div className="p-1 rounded-full" style={{ backgroundColor: '#0D7377' }}>
                    <TrendingUp className="h-3 w-3 text-white" />
                  </div>
                  Você está dentro do limite do seu plano. Sem custos adicionais.
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-xl" style={{ color: '#14BDAE' }}>Total Mensal</span>
                <span className="font-bold text-3xl" style={{ color: '#14BDAE' }}>
                  R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de Informações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Uso de Pacientes */}
          <Card className="border shadow-sm h-full" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg" style={{ color: '#D8DEEB' }}>
                <Users className="h-5 w-5" style={{ color: '#14BDAE' }} />
                Uso de Pacientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 mt-2">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-4xl font-bold" style={{ color: '#14BDAE' }}>{pacientes}</span>
                    <span className="ml-2" style={{ color: '#7A8299' }}>pacientes cadastrados</span>
                  </div>
                  <span className="font-medium" style={{ color: '#D8DEEB' }}>{usagePercentage.toFixed(0)}% do plano base</span>
                </div>

                <div className="space-y-2">
                  <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: '#1E2535' }}>
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${pacientes <= incluidos ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      style={{
                        width: `${Math.min(100, (pacientes / incluidos) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: '#7A8299' }}>
                    <span>0</span>
                    <span>{incluidos} (Base)</span>
                    {pacientes > incluidos && <span>{pacientes} (Atual)</span>}
                  </div>
                </div>

                <div className="pt-4" style={{ borderTop: '1px solid #1E2535' }}>
                  {pacientes <= incluidos ? (
                    <div className="flex items-center gap-3 text-sm p-4 rounded-lg" style={{ backgroundColor: '#0D73771A', color: '#14BDAE', border: '1px solid #0D7377' }}>
                      <div className="p-1.5 rounded-full" style={{ backgroundColor: '#0D7377' }}>
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        Você ainda pode adicionar <span className="font-bold">{incluidos - pacientes}</span> pacientes
                        sem custo adicional.
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-sm text-yellow-400 p-4 rounded-lg" style={{ backgroundColor: '#1A1A0E', border: '1px solid #3A3A1E' }}>
                      <div className="p-1.5 rounded-full bg-yellow-500/20">
                        <TrendingUp className="h-4 w-4 text-yellow-400" />
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
          <Card className="border shadow-sm h-full" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg" style={{ color: '#D8DEEB' }}>
                <Star className="h-5 w-5" style={{ color: '#14BDAE' }} />
                Detalhes da Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 mt-2">
                <div>
                  <div className="text-sm mb-2" style={{ color: '#7A8299' }}>Plano Atual</div>
                  <Badge
                    variant="outline"
                    className={`${user.plan === "founding"
                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                      : "bg-[#0D7377]/10 text-[#14BDAE] border-[#0D7377]/30"
                      } px-4 py-1.5 text-base font-medium`}
                  >
                    {user.plan === "founding" ? "Founding Member" : "Professional"}
                  </Badge>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-sm py-2" style={{ borderBottom: '1px dashed #1E2535' }}>
                    <span style={{ color: '#7A8299' }}>Valor base mensal</span>
                    <span className="font-semibold" style={{ color: '#F0EAD6' }}>R$ {custoBase.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2" style={{ borderBottom: '1px dashed #1E2535' }}>
                    <span style={{ color: '#7A8299' }}>Franquia de pacientes</span>
                    <span className="font-semibold" style={{ color: '#F0EAD6' }}>{incluidos} pacientes</span>
                  </div>
                  <div className="flex justify-between text-sm py-2" style={{ borderBottom: '1px dashed #1E2535' }}>
                    <span style={{ color: '#7A8299' }}>Custo por paciente extra</span>
                    <span className="font-semibold" style={{ color: '#F0EAD6' }}>
                      R$ {Number(user.additionalPatientPrice).toFixed(2)}
                    </span>
                  </div>
                </div>

                {user.isLifetimePrice && (
                  <div className="rounded-lg p-4 mt-4" style={{ backgroundColor: '#0D7377/10', border: '1px solid #0D7377' }}>
                    <div className="flex items-start gap-3">
                      <Lock className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#14BDAE' }} />
                      <div className="text-sm" style={{ color: '#D8DEEB' }}>
                        <div className="font-bold mb-1" style={{ color: '#F0EAD6' }}>Preço Vitalício Garantido</div>
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
