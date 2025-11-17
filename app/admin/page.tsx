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
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-white to-[#F5F7FA]">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">
                Admin Dashboard - Telos.AI
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
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-yellow-200">
            <div className="flex items-center gap-3 mb-4">
              <Star className="h-6 w-6 text-yellow-600" />
              <h2 className="text-xl font-bold text-gray-900">Founding Members</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de membros</span>
                <span className="text-2xl font-bold text-yellow-600">{foundingMembers}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Plano base</span>
                <span className="font-semibold">R$ 400/mês</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Paciente adicional</span>
                <span className="font-semibold">R$ 150</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Professional</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de membros</span>
                <span className="text-2xl font-bold text-blue-600">
                  {totalMedicos - foundingMembers}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Plano base</span>
                <span className="font-semibold">R$ 500/mês</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Paciente adicional</span>
                <span className="font-semibold">R$ 180</span>
              </div>
            </div>
          </div>
        </div>

        {/* Links rápidos */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
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
