"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  getDashboardStats,
  getDashboardPatients,
  getResearchStats,
  type DashboardStats,
  type PatientCard as PatientCardData,
  type DashboardFilters,
  type SurgeryType,
  type ResearchStats,
} from "./actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  AlertCircle,
  Plus,
  Search,
  UserCheck,
  Users,
  FlaskConical,
  Filter,
  X,
  Stethoscope,
  CheckCircle2,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FadeIn, SlideIn, StaggerChildren, StaggerItem } from "@/components/animations"
import { AnimatePresence } from "framer-motion"
import { useRedFlags } from "@/hooks/useRedFlags"
import { RedFlagsCard } from "@/components/dashboard/RedFlagsCard"
import { PatientCard, getSurgeryTypeLabel } from "@/components/dashboard/PatientCard"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton"
import { SmartInbox } from "@/components/dashboard/SmartInbox"

interface DashboardClientProps {
  userRole: string;
  userName: string;
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

export default function DashboardClient({ userName }: DashboardClientProps) {

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [patients, setPatients] = useState<PatientCardData[]>([])
  const [loading, setLoading] = useState(true)

  // Red Flags Hook
  const { redFlags, count: redFlagsCount, markAsViewed } = useRedFlags()

  // Filtros
  const [filters, setFilters] = useState<DashboardFilters>({
    surgeryType: "all",
    dataStatus: "all",
    period: "all",
    search: "",
    researchFilter: "all",
    followUpStatus: "active" as const,
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

  const reloadPatients = async () => {
    const [statsData, patientsData] = await Promise.all([
      getDashboardStats(),
      getDashboardPatients(filters),
    ])
    setStats(statsData)
    setPatients(patientsData)
  }

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
      } catch (error: unknown) {
        console.error('Error loading research stats:', error)
      }
    }

    loadResearchStats()
  }, [filters.researchFilter])

  const handleFilterChange = (key: keyof DashboardFilters, value: DashboardFilters[keyof DashboardFilters]) => {
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

  // Filter critical patients for alert
  const criticalPatients = patients.filter(p =>
    p.latestResponse?.riskLevel === 'critical' ||
    p.latestResponse?.riskLevel === 'high'
  )

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0B0E14, #111520, #0B0E14)' }}>
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
        <div id="dashboard-header" className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Premium Icon */}
            <div className="hidden md:flex h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0A2647] to-[#144272] items-center justify-center shadow-lg">
              <Stethoscope className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
                <h1 className="text-2xl md:text-4xl font-bold title-premium" style={{ color: '#F0EAD6' }}>
                  Central Médica
                </h1>
                {/* Live Badge */}
                <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold badge-pulse" style={{ backgroundColor: 'rgba(26, 140, 106, 0.2)', color: '#1A8C6A', borderColor: '#1A8C6A', borderWidth: '1px', borderStyle: 'solid' }}>
                  <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full animate-pulse" style={{ backgroundColor: '#1A8C6A' }} />
                  LIVE
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1 md:gap-2" style={{ color: '#7A8299' }}>
                <span className="text-sm md:text-base">Bem-vindo,</span>
                <span className="text-sm md:text-base font-semibold" style={{ color: '#14BDAE' }}>{userName}</span>
                <span className="hidden sm:inline-flex items-center gap-1.5 ml-2 text-xs" style={{ color: '#1A8C6A' }}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Sistema operacional
                </span>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex w-full md:w-auto">
            {/* Novo Paciente - Highlighted with Golden Color */}
            <Link href="/cadastro" className="w-full md:w-auto">
              <Button
                size="lg"
                className="w-full md:w-auto shadow-lg shadow-yellow-500/20 font-semibold transition-transform hover:scale-105 active:scale-95 text-sm md:text-base px-6 md:px-8 h-11 md:h-12 bg-[#D4AF37] hover:bg-[#D4AF37] text-[#0A2647]"
                data-tutorial="new-patient-btn"
              >
                <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Novo Paciente
              </Button>
            </Link>
          </div>
        </div>

        {/* Estatísticas do Topo */}
        <StatsCards stats={stats} />

        {/* Onboarding Checklist - REMOVIDO: Estava bugado */}
        {/* <FadeIn delay={0.6} className="mb-6">
          <OnboardingChecklist />
        </FadeIn> */}

        {/* Red Flags Card - ALERTAS URGENTES */}
        <RedFlagsCard
          redFlags={redFlags}
          count={redFlagsCount}
          onView={markAsViewed}
        />

        {/* Tarefas de Hoje Section */}
        <div className="mb-6">
          <SmartInbox />
        </div>

        {/* Compact Filter Toolbar */}
        <SlideIn direction="down" delay={0.7}>
          <div className="rounded-xl shadow-sm p-4 mb-6 flex flex-col gap-4" style={{ backgroundColor: '#161B27', borderColor: '#1E2535', borderWidth: '1px', borderStyle: 'solid' }} data-tutorial="search-filters">
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou telefone..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 h-10 transition-colors"
                  style={{ backgroundColor: '#0B0E14', borderColor: '#1E2535', color: '#F0EAD6' }}
                />
              </div>

              {/* Filter Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2 border-dashed" style={{ color: '#D8DEEB', borderColor: '#2A3147' }}>
                    <Filter className="h-4 w-4" />
                    Filtros
                    {(filters.surgeryType !== "all" || filters.dataStatus !== "all" || filters.period !== "all" || filters.researchFilter !== "all") && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 min-w-[1.25rem]" style={{ backgroundColor: '#2A3147', color: '#F0EAD6' }}>
                        {[
                          filters.surgeryType !== "all",
                          filters.dataStatus !== "all",
                          filters.period !== "all",
                          filters.researchFilter !== "all"
                        ].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end" style={{ backgroundColor: '#161B27', borderColor: '#1E2535' }}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium leading-none" style={{ color: '#F0EAD6' }}>Filtros Avançados</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                        onClick={() => setFilters({ surgeryType: "all", dataStatus: "all", period: "all", search: searchInput, researchFilter: "all", followUpStatus: filters.followUpStatus })}
                      >
                        Limpar
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Tipo de Cirurgia</label>
                      <Select
                        value={filters.surgeryType || "all"}
                        onValueChange={(value) => handleFilterChange("surgeryType", value)}
                      >
                        <SelectTrigger className="h-9">
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
                      <label className="text-xs font-medium text-muted-foreground">Status do Cadastro</label>
                      <Select
                        value={filters.dataStatus || "all"}
                        onValueChange={(value) => handleFilterChange("dataStatus", value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="incomplete">Cadastro Incompleto</SelectItem>
                          <SelectItem value="complete">Cadastro Completo</SelectItem>
                          <SelectItem value="research-incomplete">Pesquisa - Incompleto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Período</label>
                      <Select
                        value={filters.period || "all"}
                        onValueChange={(value) => handleFilterChange("period", value)}
                      >
                        <SelectTrigger className="h-9">
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
                      <label className="text-xs font-medium flex items-center gap-1" style={{ color: '#A78BFA' }}>
                        <FlaskConical className="h-3 w-3" /> Pesquisas
                      </label>
                      <Select
                        value={filters.researchFilter || "all"}
                        onValueChange={(value) => handleFilterChange("researchFilter", value)}
                      >
                        <SelectTrigger className="h-9" style={{ borderColor: '#7C3AED' }}>
                          <SelectValue placeholder="Todas as pesquisas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os pacientes</SelectItem>
                          <SelectItem value="non-participants">Não participantes</SelectItem>
                          {researchStats?.researches.map((research) => (
                            <SelectItem key={research.researchId} value={research.researchId}>
                              {research.researchTitle}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Active Filters Summary */}
            {(filters.surgeryType !== "all" || filters.dataStatus !== "all" || filters.period !== "all" || filters.researchFilter !== "all" || searchInput) && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-dashed" style={{ borderColor: '#2A3147' }}>
                <span className="text-xs mr-1" style={{ color: '#7A8299' }}>Filtros ativos:</span>

                {filters.surgeryType !== "all" && (
                  <Badge variant="secondary" className="gap-1" style={{ backgroundColor: 'rgba(13, 115, 119, 0.2)', color: '#14BDAE', borderColor: '#0D7377', borderWidth: '1px', borderStyle: 'solid' }}>
                    {getSurgeryTypeLabel(filters.surgeryType as SurgeryType)}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("surgeryType", "all")} />
                  </Badge>
                )}

                {filters.dataStatus !== "all" && (
                  <Badge variant="secondary" className="gap-1" style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)', color: '#D4AF37', borderColor: '#D4AF37', borderWidth: '1px', borderStyle: 'solid' }}>
                    {filters.dataStatus === "incomplete" ? "Incompleto" : filters.dataStatus === "complete" ? "Completo" : "Pesquisa Incompleta"}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("dataStatus", "all")} />
                  </Badge>
                )}

                {filters.period !== "all" && (
                  <Badge variant="secondary" className="gap-1" style={{ backgroundColor: 'rgba(26, 140, 106, 0.2)', color: '#1A8C6A', borderColor: '#1A8C6A', borderWidth: '1px', borderStyle: 'solid' }}>
                    {filters.period === "today" ? "Hoje" : filters.period === "7days" ? "7 dias" : "30 dias"}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("period", "all")} />
                  </Badge>
                )}

                {filters.researchFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1" style={{ backgroundColor: 'rgba(124, 58, 237, 0.2)', color: '#A78BFA', borderColor: '#7C3AED', borderWidth: '1px', borderStyle: 'solid' }}>
                    <FlaskConical className="h-3 w-3" />
                    {filters.researchFilter === "non-participants" ? "Não participantes" : researchStats?.researches.find(r => r.researchId === filters.researchFilter)?.researchTitle || "Pesquisa"}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("researchFilter", "all")} />
                  </Badge>
                )}

                {searchInput && (
                  <Badge variant="secondary" className="gap-1" style={{ backgroundColor: '#2A3147', color: '#D8DEEB' }}>
                    &quot;{searchInput}&quot;
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchInput("")} />
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilters({ surgeryType: "all", dataStatus: "all", period: "all", search: "", researchFilter: "all", followUpStatus: filters.followUpStatus })
                    setSearchInput("")
                  }}
                  className="text-xs ml-auto h-6 px-2 text-muted-foreground hover:text-destructive"
                >
                  Limpar tudo
                </Button>
              </div>
            )}
          </div>
        </SlideIn>

        {/* Seção de Pacientes em Acompanhamento */}
        <FadeIn delay={0.9}>
          {/* Critical Patients Alert */}
          {criticalPatients.length > 0 && (
            <Alert variant="destructive" className="mb-6" role="alert" aria-live="assertive">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertTitle>⚠️ {criticalPatients.length} PACIENTES CRÍTICOS</AlertTitle>
              <AlertDescription>
                Requerem atenção médica imediata
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFilters(prev => ({ ...prev, followUpStatus: "active" as const }))}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filters.followUpStatus !== "completed"
                    ? "shadow-sm"
                    : ""
                }`}
                style={filters.followUpStatus !== "completed"
                  ? { backgroundColor: '#0D7377', color: '#F0EAD6' }
                  : { backgroundColor: '#1E2535', color: '#7A8299' }
                }
              >
                Em Acompanhamento
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, followUpStatus: "completed" as const }))}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filters.followUpStatus === "completed"
                    ? "shadow-sm"
                    : ""
                }`}
                style={filters.followUpStatus === "completed"
                  ? { backgroundColor: '#0D7377', color: '#F0EAD6' }
                  : { backgroundColor: '#1E2535', color: '#7A8299' }
                }
              >
                Concluídos
              </button>
            </div>
            <Badge variant="secondary" className="ml-0 sm:ml-2 w-fit">
              {patients.length} {patients.length === 1 ? "paciente" : "pacientes"}
            </Badge>
          </div>

          {patients.length === 0 ? (
            <FadeIn delay={0.2}>
              <Card className="border-2 border-dashed" style={{ backgroundColor: '#161B27', borderColor: '#2A3147' }}>
                <CardContent className="py-12 text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" style={{ color: '#7A8299' }} />
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#F0EAD6' }}>
                    {filters.followUpStatus === "completed"
                      ? "Nenhum paciente com acompanhamento concluído"
                      : "Nenhum paciente em acompanhamento"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {filters.followUpStatus === "completed"
                      ? "Nenhum paciente concluiu o acompanhamento ainda."
                      : "Nenhum paciente corresponde aos filtros selecionados."}
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
                {patients.map((patient) => (
                  <StaggerItem key={patient.id}>
                    <PatientCard
                      patient={patient}
                      userName={userName}
                      showResearchButton={researches.length > 0}
                      onAddToResearch={handleOpenResearchModal}
                      onPatientChanged={reloadPatients}
                    />
                  </StaggerItem>
                ))}
              </AnimatePresence>
            </StaggerChildren>
          )}
        </FadeIn>

        {/* Research Assignment Modal */}
        <Dialog open={isResearchModalOpen} onOpenChange={setIsResearchModalOpen}>
          <DialogContent className="max-w-2xl" style={{ backgroundColor: '#161B27', borderColor: '#1E2535', color: '#D8DEEB' }} aria-labelledby="research-dialog-title" aria-describedby="research-dialog-description">
            <DialogHeader>
              <DialogTitle id="research-dialog-title">Adicionar Paciente à Pesquisa</DialogTitle>
              <DialogDescription id="research-dialog-description">
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
                <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(13, 115, 119, 0.15)', borderColor: '#0D7377', borderWidth: '1px', borderStyle: 'solid' }}>
                  <h4 className="font-semibold mb-2" style={{ color: '#14BDAE' }}>
                    Sobre esta pesquisa
                  </h4>
                  <p className="text-sm" style={{ color: '#D8DEEB' }}>{selectedResearch.description}</p>
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
                <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(124, 58, 237, 0.15)', borderColor: '#7C3AED', borderWidth: '1px', borderStyle: 'solid' }}>
                  <h4 className="font-semibold mb-2" style={{ color: '#A78BFA' }}>
                    Grupo {selectedGroupCode}:{" "}
                    {selectedResearch.groups.find((g) => g.groupCode === selectedGroupCode)?.groupName}
                  </h4>
                  <p className="text-sm" style={{ color: '#D8DEEB' }}>
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

      </div>
    </div >
  )
}
