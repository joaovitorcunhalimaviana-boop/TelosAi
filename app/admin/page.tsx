import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/admin/MetricCard";
import { QuickLink } from "@/components/admin/QuickLink";
import { Users, Heart, DollarSign, Star, UserCheck, Wifi, Brain, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  await requireAdmin();

  // Métricas gerais
  const totalMedicos = await prisma.user.count({
    where: { role: "medico" },
  });

  const totalPacientes = await prisma.patient.count();

  const foundingMembers = await prisma.user.count({
    where: {
      role: "medico",
      plan: "founding"
    },
  });

  // MRR (Monthly Recurring Revenue)
  const medicos = await prisma.user.findMany({
    where: { role: "medico" },
    select: {
      basePrice: true,
      currentPatients: true,
      maxPatients: true,
      additionalPatientPrice: true,
    },
  });

  const mrr = medicos.reduce((acc, medico) => {
    const base = Number(medico.basePrice) || 0;
    const adicional = Math.max(0, medico.currentPatients - medico.maxPatients);
    const adicionalPrice = adicional * (Number(medico.additionalPatientPrice) || 0);
    return acc + base + adicionalPrice;
  }, 0);

  // WhatsApp connected
  const whatsappConnected = await prisma.user.count({
    where: {
      role: "medico",
      whatsappConnected: true,
    },
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0A2647]">
                Admin Dashboard - VigIA
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Sistema de Acompanhamento Pós-Operatório
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Métricas */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Médicos Cadastrados"
            value={totalMedicos}
            icon={Users}
            description={`${foundingMembers} founding members`}
          />
          <MetricCard
            title="Pacientes Total"
            value={totalPacientes}
            icon={Heart}
            description={`Média ${totalMedicos > 0 ? (totalPacientes / totalMedicos).toFixed(1) : 0} por médico`}
          />
          <MetricCard
            title="MRR"
            value={`R$ ${Math.round(mrr).toLocaleString("pt-BR")}`}
            icon={DollarSign}
            description="Receita Mensal Recorrente"
          />
          <MetricCard
            title="WhatsApp Conectado"
            value={`${whatsappConnected}/${totalMedicos}`}
            icon={Wifi}
            description={`${totalMedicos > 0 ? Math.round((whatsappConnected / totalMedicos) * 100) : 0}% conectados`}
          />
        </div>

        {/* Detalhamento de Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg ring-1 ring-gold-200/50 p-6 border-l-4 border-l-[#D4AF37]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Star className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Founding Members</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-yellow-50/50 rounded-md">
                <span className="text-gray-600 font-medium">Total de membros</span>
                <span className="text-2xl font-bold text-[#D4AF37]">{foundingMembers}</span>
              </div>
              <div className="flex justify-between items-center text-sm px-2">
                <span className="text-gray-500">Plano base</span>
                <span className="font-bold text-gray-900">R$ 400/mês</span>
              </div>
              <div className="flex justify-between items-center text-sm px-2">
                <span className="text-gray-500">Paciente adicional</span>
                <span className="font-bold text-gray-900">R$ 150</span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg ring-1 ring-blue-100 p-6 border-l-4 border-l-[#0A2647]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <UserCheck className="h-6 w-6 text-[#0A2647]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Professional</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-blue-50/50 rounded-md">
                <span className="text-gray-600 font-medium">Total de membros</span>
                <span className="text-2xl font-bold text-[#0A2647]">
                  {totalMedicos - foundingMembers}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm px-2">
                <span className="text-gray-500">Plano base</span>
                <span className="font-bold text-gray-900">R$ 500/mês</span>
              </div>
              <div className="flex justify-between items-center text-sm px-2">
                <span className="text-gray-500">Paciente adicional</span>
                <span className="font-bold text-gray-900">R$ 180</span>
              </div>
            </div>
          </div>
        </div>

        {/* Links rápidos */}
        <div className="mb-6 mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🚀 Ações Rápidas
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickLink
            href="/admin/medicos"
            title="Gerenciar Médicos"
            description="Ver, editar e exportar todos os médicos cadastrados no sistema"
            icon={<Users className="h-6 w-6" />}
          />
          <QuickLink
            href="/admin/pacientes"
            title="Gerenciar Pacientes"
            description="Ver e exportar pacientes de todos os médicos"
            icon={<Heart className="h-6 w-6" />}
          />
          <QuickLink
            href="/admin/collective-intelligence"
            title="Inteligência Coletiva"
            description="Insights de Machine Learning baseados em dados agregados de todos os médicos"
            icon={<Brain className="h-6 w-6 text-purple-600" />}
          />
          <QuickLink
            href="/admin/audit-logs"
            title="Auditoria do Sistema"
            description="Histórico completo de ações e eventos do sistema"
            icon={<FileText className="h-6 w-6 text-blue-600" />}
          />
        </div>
      </div>
    </div>
  );
}
