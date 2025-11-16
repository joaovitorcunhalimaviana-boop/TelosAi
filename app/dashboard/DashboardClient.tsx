"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  getDashboardStats,
  getDashboardPatients,
  getResearchStats,
  type DashboardStats,
  type PatientCard,
  type DashboardFilters,
  type SurgeryType,
  type ResearchStats,
} from "./actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  Activity,
  AlertCircle,
  Calendar,
  Clock,
  FileText,
  Plus,
  Search,
  UserCheck,
  Users,
  DollarSign,
  Shield,
  FlaskConical,
  MoreVertical,
  MessageCircle,
  Phone,
  Download,
  HelpCircle,
  BookOpen,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { FadeIn, SlideIn, StaggerChildren, StaggerItem, CountUp, ScaleOnHover } from "@/components/animations"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"
import { motion, AnimatePresence } from "framer-motion"
import { OnboardingChecklist } from "@/components/tutorial/OnboardingChecklist"
import { SimpleTour } from "@/components/tutorial/SimpleTour"

interface DashboardClientProps {
  userRole: string;
}

interface ResearchGroup {
  id: string;
  groupCode: string;
  groupName: string;
  description: string;
}

interface Research {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  groups: ResearchGroup[];
}

export default function DashboardClient({ userRole }: DashboardClientProps) {
  const router = useRouter()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [patients, setPatients] = useState<PatientCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showTour, setShowTour] = useState(false)

  // Filtros
  const [filters, setFilters] = useState<DashboardFilters>({
    surgeryType: "all",
    dataStatus: "all",
    period: "all",
    search: "",
    researchFilter: "all",
  })

  const [searchInput, setSearchInput] = useState("")

  // Research stats state
  const [researchStats, setResearchStats] = useState<{
    totalPatients: number
    nonParticipants: number
    researches: ResearchStats[]
  } | null>(null)

  // Research state
  const [researches, setResearches] = useState<Research[]>([])
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [selectedResearchId, setSelectedResearchId] = useState<string>("")
  const [selectedGroupCode, setSelectedGroupCode] = useState<string>("")
  const [researchNotes, setResearchNotes] = useState<string>("")

  // Carregar dados do dashboard
  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      try {
        const [statsData, patientsData] = await Promise.all([
          getDashboardStats(),
          getDashboardPatients(filters),
        ])
        setStats(statsData)
        setPatients(patientsData)
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [filters])

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }))
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput])

  // Load researches
  useEffect(() => {
    async function loadResearches() {
      try {
        const response = await fetch('/api/pesquisas')
        const data = await response.json()

        if (data.success) {
          // Only load active researches
          const activeResearches = data.data.filter((r: Research) => r.isActive)
          setResearches(activeResearches)
        }
      } catch (error) {
        console.error('Error loading researches:', error)
      }
    }

    loadResearches()
  }, [])

  // Load research stats
  useEffect(() => {
    async function loadResearchStats() {
      try {
        const stats = await getResearchStats()
        setResearchStats(stats)
      } catch (error) {
        console.error('Error loading research stats:', error)
      }
    }

    loadResearchStats()
  }, [filters.researchFilter]) // Reload when research filter changes

  const handleFilterChange = (key: keyof DashboardFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleOpenResearchModal = (patientId: string) => {
    setSelectedPatientId(patientId)
    setSelectedResearchId("")
    setSelectedGroupCode("")
    setResearchNotes("")
    setIsResearchModalOpen(true)
  }

  const handleAssignToResearch = async () => {
    if (!selectedPatientId || !selectedResearchId || !selectedGroupCode) {
      toast.error('Selecione uma pesquisa e um grupo')
      return
    }

    try {
      const response = await fetch(`/api/paciente/${selectedPatientId}/pesquisa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          researchId: selectedResearchId,
          groupCode: selectedGroupCode,
          notes: researchNotes.trim() || null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Paciente adicionado à pesquisa com sucesso!')
        setIsResearchModalOpen(false)
        // Reload patients to reflect changes
        const patientsData = await getDashboardPatients(filters)
        setPatients(patientsData)
      } else {
        toast.error(data.error?.message || 'Erro ao adicionar paciente à pesquisa')
      }
    } catch (error) {
      console.error('Error assigning patient to research:', error)
      toast.error('Erro ao adicionar paciente à pesquisa')
    }
  }

  const selectedResearch = researches.find((r) => r.id === selectedResearchId)

  const getCompletenessColor = (completeness: number) => {
    if (completeness >= 80) return "bg-green-500"
    if (completeness >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getCompletenessVariant = (completeness: number) => {
    if (completeness >= 80) return "default"
    if (completeness >= 40) return "secondary"
    return "destructive"
  }

  const getCompletenessMessage = (completeness: number) => {
    if (completeness === 100) return { text: "Perfeito!", icon: "🎉", color: "text-green-700" }
    if (completeness >= 80) return { text: "Quase lá!", icon: "⭐", color: "text-green-600" }
    if (completeness >= 60) return { text: "Bom progresso", icon: "📈", color: "text-blue-600" }
    if (completeness >= 40) return { text: "Continue!", icon: "💪", color: "text-yellow-600" }
    if (completeness >= 20) return { text: "Preencha mais", icon: "📝", color: "text-orange-600" }
    return { text: "Precisa completar", icon: "⚠️", color: "text-red-600" }
  }

  // Check if patient is new (registered in last 24 hours)
  const isPatientNew = (createdAt: Date): boolean => {
    const now = new Date()
    const patientCreated = new Date(createdAt)
    const hoursDiff = (now.getTime() - patientCreated.getTime()) / (1000 * 60 * 60)
    return hoursDiff <= 24
  }

  const getSurgeryTypeLabel = (type: SurgeryType) => {
    const labels: Record<SurgeryType, string> = {
      hemorroidectomia: "Hemorroidectomia",
      fistula: "Fístula",
      fissura: "Fissura",
      pilonidal: "Pilonidal",
    }
    return labels[type]
  }

  // Risk assessment for patient cards
  const getPatientRiskLevel = (patient: PatientCard): 'low' | 'medium' | 'high' | 'critical' => {
    if (patient.hasRedFlags && patient.redFlags.length > 0) return 'critical'
    if (patient.dataCompleteness < 40) return 'high'
    if (patient.dataCompleteness < 80) return 'medium'
    return 'low'
  }

  const getRiskBorderClass = (riskLevel: 'low' | 'medium' | 'high' | 'critical') => {
    const borders = {
      low: 'border-green-300 hover:border-green-400',
      medium: 'border-yellow-400 hover:border-yellow-500',
      high: 'border-orange-400 hover:border-orange-500',
      critical: 'border-red-500 hover:border-red-600 bg-red-50/50 dark:bg-red-950/20',
    }
    return borders[riskLevel]
  }

  const handleWhatsAppClick = (phone: string, patientName: string) => {
    // Usar nome do médico da sessão ao invés de hardcoded
    const doctorName = "Dr. João Vitor Viana" // TODO: Pegar do session.user.name
    const message = encodeURIComponent(`Olá ${patientName}, aqui é ${doctorName}. Como está o seu pós-operatório?`)
    window.open(`https://wa.me/55${phone.replace(/\D/g, '')}?text=${message}`, '_blank')
  }

  const handlePhoneClick = (phone: string) => {
    window.open(`tel:${phone.replace(/\D/g, '')}`, '_self')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-white to-[#F5F7FA] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-white to-[#F5F7FA] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* CSS for pulse animation */}
      <style jsx>{`
        @keyframes badge-pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        .badge-pulse {
          animation: badge-pulse 2s ease-in-out infinite;
        }
      `}</style>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div id="dashboard-header" className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#0A2647' }}>
                Dashboard Médico
              </h1>
              <p className="text-lg text-muted-foreground">
                Acompanhamento Pós-Operatório - Dr. João Vitor Viana
              </p>
            </div>
            <Button
              onClick={() => {
                console.log('🎯 Tour button clicked! Opening SimpleTour...');
                setShowTour(true);
              }}
              variant="outline"
              size="icon"
              className="rounded-full"
              title="Iniciar tour pelo dashboard"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Link para Protocolos (médicos e admins) */}
            {(userRole === "medico" || userRole === "admin") && (
              <Link href="/dashboard/protocolos">
                <Button
                  size="lg"
                  variant="outline"
                  className="shadow-sm gap-2 hover:opacity-80"
                  style={{ borderColor: '#0A2647', color: '#0A2647' }}
                >
                  <FileText className="h-5 w-5" />
                  Protocolos
                </Button>
              </Link>
            )}

            {/* Link para Billing (médicos) */}
            {userRole === "medico" && (
              <Link href="/dashboard/billing">
                <Button
                  size="lg"
                  variant="outline"
                  className="shadow-sm gap-2 hover:opacity-80"
                  style={{ borderColor: '#0A2647', color: '#0A2647' }}
                >
                  <DollarSign className="h-5 w-5" />
                  Meu Plano
                </Button>
              </Link>
            )}

            {/* Link para Admin (admins) */}
            {userRole === "admin" && (
              <Link href="/admin">
                <Button
                  size="lg"
                  variant="outline"
                  className="shadow-sm gap-2 hover:opacity-80"
                  style={{ borderColor: '#0A2647', color: '#0A2647' }}
                >
                  <Shield className="h-5 w-5" />
                  Admin Dashboard
                </Button>
              </Link>
            )}

            {/* Pesquisas - Primary Button */}
            <Link href="/dashboard/pesquisas">
              <Button
                size="lg"
                variant="outline"
                className="shadow-sm hover:opacity-80"
                style={{ borderColor: '#0A2647', color: '#0A2647' }}
                data-tutorial="research-btn"
              >
                <FlaskConical className="mr-2 h-5 w-5" />
                Pesquisas
              </Button>
            </Link>

            {/* Menu de Navegação Completo */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="shadow-sm gap-2 hover:bg-gray-50"
                  style={{ borderColor: '#0A2647', color: '#0A2647' }}
                >
                  <MoreVertical className="h-5 w-5" />
                  Menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">AÇÕES RÁPIDAS</div>
                <DropdownMenuItem asChild>
                  <Link href="/cadastro" className="flex items-center cursor-pointer">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Cadastro Express
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/exportar" className="flex items-center cursor-pointer">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Dados
                  </Link>
                </DropdownMenuItem>

                <div className="my-1 h-px bg-gray-200" />

                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">RECURSOS</div>
                <DropdownMenuItem asChild>
                  <Link href="/templates" className="flex items-center cursor-pointer">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Templates
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/termos" className="flex items-center cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    Central de Termos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/ajuda" className="flex items-center cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Central de Ajuda
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Novo Paciente - Highlighted with Golden Color */}
            <Link href="/cadastro">
              <Button
                size="lg"
                className="shadow-lg font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#D4AF37', color: '#0A2647' }}
                data-tutorial="new-patient-btn"
              >
                <Plus className="mr-2 h-5 w-5" />
                Novo Paciente
              </Button>
            </Link>
          </div>
        </div>

        {/* Estatísticas do Topo */}
        <StaggerChildren
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          staggerDelay={0.1}
        >
          <StaggerItem>
            <ScaleOnHover>
              <Card className="border-2 hover:shadow-lg transition-shadow" data-tutorial="stats-today-surgeries" style={{ borderColor: '#0A2647' }}>
                <CardHeader className="pb-3" style={{ backgroundColor: '#F8F9FB' }}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Cirurgias Hoje
                    </CardTitle>
                    <Calendar className="h-5 w-5" style={{ color: '#0A2647' }} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" style={{ color: '#0A2647' }}>
                    {prefersReducedMotion ? (
                      stats?.todaySurgeries || 0
                    ) : (
                      <CountUp value={stats?.todaySurgeries || 0} duration={1} delay={0.3} />
                    )}
                  </div>
                </CardContent>
              </Card>
            </ScaleOnHover>
          </StaggerItem>

          <StaggerItem>
            <ScaleOnHover>
              <Card className="border-2 hover:shadow-lg transition-shadow" data-tutorial="stats-active-patients" style={{ borderColor: '#0A2647' }}>
                <CardHeader className="pb-3" style={{ backgroundColor: '#F8F9FB' }}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pacientes Ativos
                    </CardTitle>
                    <Users className="h-5 w-5" style={{ color: '#0A2647' }} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" style={{ color: '#0A2647' }}>
                    {prefersReducedMotion ? (
                      stats?.activePatientsCount || 0
                    ) : (
                      <CountUp value={stats?.activePatientsCount || 0} duration={1} delay={0.4} />
                    )}
                  </div>
                </CardContent>
              </Card>
            </ScaleOnHover>
          </StaggerItem>

          <StaggerItem>
            <ScaleOnHover>
              <Card className="border-2 hover:shadow-lg transition-shadow" data-tutorial="stats-followups-today" style={{ borderColor: '#0A2647' }}>
                <CardHeader className="pb-3" style={{ backgroundColor: '#F8F9FB' }}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Follow-ups Hoje
                    </CardTitle>
                    <Clock className="h-5 w-5" style={{ color: '#0A2647' }} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" style={{ color: '#0A2647' }}>
                    {prefersReducedMotion ? (
                      stats?.pendingFollowUpsToday || 0
                    ) : (
                      <CountUp value={stats?.pendingFollowUpsToday || 0} duration={1} delay={0.5} />
                    )}
                  </div>
                </CardContent>
              </Card>
            </ScaleOnHover>
          </StaggerItem>

          <StaggerItem>
            <ScaleOnHover>
              <Card className="border-2 hover:shadow-lg transition-shadow" data-tutorial="stats-critical-alerts" style={{ borderColor: (stats?.criticalAlerts || 0) > 0 ? '#DC2626' : '#0A2647' }}>
                <CardHeader className="pb-3" style={{ backgroundColor: (stats?.criticalAlerts || 0) > 0 ? '#FEF2F2' : '#F8F9FB' }}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Alertas Críticos
                    </CardTitle>
                    <AlertCircle className="h-5 w-5" style={{ color: (stats?.criticalAlerts || 0) > 0 ? '#DC2626' : '#0A2647' }} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" style={{ color: (stats?.criticalAlerts || 0) > 0 ? '#DC2626' : '#0A2647' }}>
                    {prefersReducedMotion ? (
                      stats?.criticalAlerts || 0
                    ) : (
                      <CountUp value={stats?.criticalAlerts || 0} duration={1} delay={0.6} />
                    )}
                  </div>
                </CardContent>
              </Card>
            </ScaleOnHover>
          </StaggerItem>
        </StaggerChildren>

        {/* Onboarding Checklist */}
        <FadeIn delay={0.6} className="mb-6">
          <OnboardingChecklist />
        </FadeIn>

        {/* Filtros e Busca */}
        <SlideIn direction="down" delay={0.7}>
          <Card className="mb-6 border-2 shadow-sm" data-tutorial="search-filters">
            <CardHeader style={{ backgroundColor: '#F5F7FA' }}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2" style={{ color: '#0A2647' }}>
                  <Search className="h-5 w-5" />
                  Buscar e Filtrar Pacientes
                </CardTitle>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {patients.length} {patients.length === 1 ? "resultado" : "resultados"}
                </Badge>
              </div>
            </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Busca Principal */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou telefone do paciente..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 h-12 text-base border-2 focus:border-blue-400"
                />
              </div>

              {/* Filtros em Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    Tipo de Cirurgia
                  </label>
                  <Select
                    value={filters.surgeryType || "all"}
                    onValueChange={(value) =>
                      handleFilterChange("surgeryType", value as any)
                    }
                  >
                    <SelectTrigger className="w-full h-10 border-2">
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="hemorroidectomia">Hemorroidectomia</SelectItem>
                      <SelectItem value="fistula">Fístula Anal</SelectItem>
                      <SelectItem value="fissura">Fissura Anal</SelectItem>
                      <SelectItem value="pilonidal">Doença Pilonidal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    Status do Cadastro
                  </label>
                  <Select
                    value={filters.dataStatus || "all"}
                    onValueChange={(value) => handleFilterChange("dataStatus", value)}
                  >
                    <SelectTrigger className="w-full h-10 border-2">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="incomplete">Cadastro Incompleto</SelectItem>
                      <SelectItem value="complete">Cadastro Completo</SelectItem>
                      <SelectItem value="research-incomplete">Pesquisa - Dados Incompletos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    Período
                  </label>
                  <Select
                    value={filters.period || "all"}
                    onValueChange={(value) => handleFilterChange("period", value)}
                  >
                    <SelectTrigger className="w-full h-10 border-2">
                      <SelectValue placeholder="Todos os períodos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os períodos</SelectItem>
                      <SelectItem value="today">Cirurgias de Hoje</SelectItem>
                      <SelectItem value="7days">Últimos 7 dias</SelectItem>
                      <SelectItem value="30days">Últimos 30 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#7C3AED' }}>
                    <FlaskConical className="h-4 w-4" />
                    Pesquisas
                  </label>
                  <Select
                    value={filters.researchFilter || "all"}
                    onValueChange={(value) => handleFilterChange("researchFilter", value)}
                  >
                    <SelectTrigger className="w-full h-10 border-2 border-purple-300 focus:border-purple-500">
                      <SelectValue placeholder="Todas as pesquisas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center justify-between w-full gap-2">
                          <span>Todos os pacientes</span>
                          {researchStats && (
                            <Badge variant="secondary" className="ml-2">
                              {researchStats.totalPatients}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                      <SelectItem value="non-participants">
                        <div className="flex items-center justify-between w-full gap-2">
                          <span>Não participantes</span>
                          {researchStats && (
                            <Badge variant="outline" className="ml-2">
                              {researchStats.nonParticipants}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                      {researchStats?.researches.map((research) => (
                        <SelectItem key={research.researchId} value={research.researchId}>
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="truncate">{research.researchTitle}</span>
                            <Badge
                              className="ml-2 shrink-0"
                              style={{ backgroundColor: '#7C3AED', color: 'white' }}
                            >
                              {research.patientCount}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters Summary */}
              {(filters.surgeryType !== "all" || filters.dataStatus !== "all" || filters.period !== "all" || filters.researchFilter !== "all" || searchInput) && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className="text-sm text-gray-600">Filtros ativos:</span>
                  {filters.surgeryType !== "all" && (
                    <Badge variant="outline" className="gap-1">
                      {getSurgeryTypeLabel(filters.surgeryType as SurgeryType)}
                    </Badge>
                  )}
                  {filters.dataStatus === "incomplete" && (
                    <Badge variant="outline">Incompleto</Badge>
                  )}
                  {filters.dataStatus === "complete" && (
                    <Badge variant="outline">Completo</Badge>
                  )}
                  {filters.dataStatus === "research-incomplete" && (
                    <Badge variant="outline" className="gap-1">
                      <FlaskConical className="h-3 w-3" />
                      Pesquisa Incompleta
                    </Badge>
                  )}
                  {filters.period === "today" && (
                    <Badge variant="outline">Hoje</Badge>
                  )}
                  {filters.period === "7days" && (
                    <Badge variant="outline">7 dias</Badge>
                  )}
                  {filters.period === "30days" && (
                    <Badge variant="outline">30 dias</Badge>
                  )}
                  {filters.researchFilter === "non-participants" && (
                    <Badge variant="outline" className="gap-1" style={{ borderColor: '#7C3AED', color: '#7C3AED' }}>
                      <FlaskConical className="h-3 w-3" />
                      Não participantes
                    </Badge>
                  )}
                  {filters.researchFilter && filters.researchFilter !== "all" && filters.researchFilter !== "non-participants" && (
                    <Badge variant="outline" className="gap-1" style={{ borderColor: '#7C3AED', color: '#7C3AED' }}>
                      <FlaskConical className="h-3 w-3" />
                      {researchStats?.researches.find(r => r.researchId === filters.researchFilter)?.researchTitle || "Pesquisa"}
                    </Badge>
                  )}
                  {searchInput && (
                    <Badge variant="outline">Busca: "{searchInput}"</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilters({ surgeryType: "all", dataStatus: "all", period: "all", search: "", researchFilter: "all" })
                      setSearchInput("")
                    }}
                    className="text-xs ml-auto"
                  >
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </SlideIn>

        {/* Seção de Pacientes em Acompanhamento */}
        <FadeIn delay={0.9}>
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Pacientes em Acompanhamento
            </h2>
            <Badge variant="secondary" className="ml-2">
              {patients.length} {patients.length === 1 ? "paciente" : "pacientes"}
            </Badge>
          </div>

          {patients.length === 0 ? (
            <FadeIn delay={0.2}>
              <Card className="border-2 border-dashed">
                <CardContent className="py-12 text-center">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Nenhum paciente encontrado
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Nenhum paciente corresponde aos filtros selecionados.
                    <br />
                    Tente ajustar os filtros ou cadastre um novo paciente.
                  </p>
                  <Link href="/cadastro">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Cadastrar Novo Paciente
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </FadeIn>
          ) : (
            <StaggerChildren
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
              staggerDelay={0.05}
            >
              <AnimatePresence mode="popLayout">
              {patients.map((patient, index) => {
                const riskLevel = getPatientRiskLevel(patient)
                return (
                <StaggerItem key={patient.id}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ScaleOnHover scale={1.02}>
                      <Card
                        className={`border-2 hover:shadow-lg transition-all ${getRiskBorderClass(riskLevel)} relative`}
                      >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-1">
                          <CardTitle className="text-lg flex-1">
                            {patient.patientName}
                          </CardTitle>
                          {/* NEW Badge - Positioned prominently */}
                          {isPatientNew(patient.patientCreatedAt) && (
                            <Badge
                              className="badge-pulse font-semibold text-xs px-2 py-1 shrink-0"
                              style={{
                                backgroundColor: '#D4AF37',
                                color: '#0A2647',
                                border: '2px solid #B8941F',
                                boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)'
                              }}
                            >
                              NOVO
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {getSurgeryTypeLabel(patient.surgeryType)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {patient.followUpDay}
                          </Badge>
                          <Badge
                            variant={
                              patient.status === "active" ? "default" : "secondary"
                            }
                            className={
                              patient.status === "active"
                                ? "bg-green-500 hover:bg-green-600"
                                : ""
                            }
                          >
                            {patient.status === "active" ? "Ativo" : "Inativo"}
                          </Badge>
                          {/* Research Participant Badge */}
                          {patient.isResearchParticipant && patient.researchGroup && (
                            <Badge
                              className="text-xs font-semibold gap-1.5 px-2.5 py-1"
                              style={{
                                backgroundColor: '#7C3AED',
                                color: 'white',
                                border: '1px solid #6D28D9'
                              }}
                            >
                              <FlaskConical className="h-3 w-3" />
                              Grupo {patient.researchGroup}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Research Data Warning */}
                    {patient.isResearchParticipant && !patient.researchDataComplete && (
                      <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-red-900 text-sm mb-1">
                              Dados de Pesquisa Incompletos
                            </p>
                            <p className="text-xs text-red-800">
                              Faltam {patient.researchMissingFieldsCount} campo{patient.researchMissingFieldsCount > 1 ? 's' : ''} obrigatório{patient.researchMissingFieldsCount > 1 ? 's' : ''} para pesquisa
                            </p>
                          </div>
                          <Badge variant="destructive" className="text-xs shrink-0">
                            {patient.researchMissingFieldsCount}
                          </Badge>
                        </div>
                      </div>
                    )}
                    <div className="space-y-3">
                      {/* Data da cirurgia */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(patient.surgeryDate), "dd 'de' MMMM 'de' yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>

                      {/* Completude de dados - Gamificada */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-lg ${getCompletenessMessage(patient.dataCompleteness).color} font-semibold`}>
                              {getCompletenessMessage(patient.dataCompleteness).icon}
                            </span>
                            <span className="text-sm font-semibold text-gray-700">
                              Completude de dados
                            </span>
                          </div>
                          <Badge
                            variant={getCompletenessVariant(patient.dataCompleteness)}
                            className="text-sm font-bold"
                          >
                            {patient.dataCompleteness}%
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative overflow-hidden">
                            <div
                              className={`h-3 rounded-full transition-all duration-500 ${getCompletenessColor(
                                patient.dataCompleteness
                              )} relative`}
                              style={{ width: `${patient.dataCompleteness}%` }}
                            >
                              {patient.dataCompleteness > 10 && (
                                <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                              )}
                            </div>
                          </div>
                          <p className={`text-xs font-medium ${getCompletenessMessage(patient.dataCompleteness).color}`}>
                            {getCompletenessMessage(patient.dataCompleteness).text}
                            {patient.dataCompleteness < 100 && ` • ${100 - patient.dataCompleteness}% restante`}
                          </p>
                        </div>
                      </div>

                      {/* Red flags */}
                      {patient.hasRedFlags && (
                        <div className="bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-800 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-red-900 dark:text-red-100 text-sm mb-1">
                                ALERTA
                              </p>
                              {patient.redFlags.length > 0 && (
                                <ul className="text-xs text-red-800 dark:text-red-200 space-y-0.5">
                                  {patient.redFlags.slice(0, 2).map((flag, idx) => (
                                    <li key={idx}>• {flag}</li>
                                  ))}
                                  {patient.redFlags.length > 2 && (
                                    <li>• +{patient.redFlags.length - 2} mais</li>
                                  )}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quick Action Buttons - WhatsApp & Phone */}
                      <div className="flex gap-2 pb-2 border-b border-gray-200">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2 border-green-500 text-green-700 hover:bg-green-50"
                          onClick={() => handleWhatsAppClick(patient.phone, patient.patientName)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2 border-blue-500 text-blue-700 hover:bg-blue-50"
                          onClick={() => handlePhoneClick(patient.phone)}
                        >
                          <Phone className="h-4 w-4" />
                          Ligar
                        </Button>
                      </div>

                      {/* Botões de ação */}
                      <div className="space-y-2 pt-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/paciente/${patient.patientId}/editar`)}
                          >
                            Ver Detalhes
                          </Button>
                          {patient.dataCompleteness < 100 && (
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1"
                              onClick={() => router.push(`/paciente/${patient.patientId}/editar`)}
                            >
                              Completar Cadastro
                            </Button>
                          )}
                        </div>
                        {researches.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                            onClick={() => handleOpenResearchModal(patient.id)}
                          >
                            <FlaskConical className="mr-2 h-4 w-4" />
                            Adicionar à Pesquisa
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                    </ScaleOnHover>
                  </motion.div>
                </StaggerItem>
              )})}
              </AnimatePresence>
            </StaggerChildren>
          )}
        </FadeIn>

        {/* Research Assignment Modal */}
        <Dialog open={isResearchModalOpen} onOpenChange={setIsResearchModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Paciente à Pesquisa</DialogTitle>
              <DialogDescription>
                Selecione a pesquisa e o grupo para incluir este paciente
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Select Research */}
              <div>
                <Label htmlFor="research">Pesquisa *</Label>
                <Select
                  value={selectedResearchId}
                  onValueChange={(value) => {
                    setSelectedResearchId(value)
                    setSelectedGroupCode("")
                  }}
                >
                  <SelectTrigger id="research" className="w-full h-10 mt-2">
                    <SelectValue placeholder="Selecione uma pesquisa" />
                  </SelectTrigger>
                  <SelectContent>
                    {researches.map((research) => (
                      <SelectItem key={research.id} value={research.id}>
                        {research.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Show research description */}
              {selectedResearch && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Sobre esta pesquisa
                  </h4>
                  <p className="text-sm text-blue-800">{selectedResearch.description}</p>
                </div>
              )}

              {/* Select Group */}
              {selectedResearchId && selectedResearch && (
                <div>
                  <Label htmlFor="group">Grupo *</Label>
                  <Select
                    value={selectedGroupCode}
                    onValueChange={(value) => setSelectedGroupCode(value)}
                  >
                    <SelectTrigger id="group" className="w-full h-10 mt-2">
                      <SelectValue placeholder="Selecione um grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedResearch.groups.map((group) => (
                        <SelectItem key={group.id} value={group.groupCode}>
                          Grupo {group.groupCode}: {group.groupName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Show group description */}
              {selectedGroupCode && selectedResearch && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">
                    Grupo {selectedGroupCode}:{" "}
                    {selectedResearch.groups.find((g) => g.groupCode === selectedGroupCode)?.groupName}
                  </h4>
                  <p className="text-sm text-purple-800">
                    {selectedResearch.groups.find((g) => g.groupCode === selectedGroupCode)?.description}
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedResearchId && (
                <div>
                  <Label htmlFor="notes">Observações (Opcional)</Label>
                  <Textarea
                    id="notes"
                    value={researchNotes}
                    onChange={(e) => setResearchNotes(e.target.value)}
                    placeholder="Adicione observações sobre a inclusão deste paciente na pesquisa..."
                    rows={3}
                    className="mt-2"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsResearchModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAssignToResearch}
                  disabled={!selectedResearchId || !selectedGroupCode}
                  style={{ backgroundColor: '#0A2647', color: 'white' }}
                >
                  Adicionar à Pesquisa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* SimpleTour - custom tour replacing driver.js */}
        {showTour && (
          <SimpleTour onClose={() => {
            console.log('🎯 SimpleTour closed!');
            setShowTour(false);
          }} />
        )}
      </div>
    </div>
  )
}
