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
              <h1 className="text-4xl font-bold mb-2 text-gradient-blue pb-1">
                Dashboard Médico
              </h1>
              <p className="text-lg text-muted-foreground">
                Workstation Clínica - {userName}
              </p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Novo Paciente - Highlighted with Golden Color */}
            <Link href="/cadastro">
              <Button
                size="lg"
                className="shadow-lg shadow-yellow-500/20 font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95 text-base px-8 h-12 hover-glow bg-telos-gold text-telos-blue"
                data-tutorial="new-patient-btn"
              >
                <Plus className="mr-2 h-5 w-5" />
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

        {/* Smart Inbox Section */}
        <div className="mb-6">
          <SmartInbox />
        </div>

        {/* Compact Filter Toolbar */}
        <SlideIn direction="down" delay={0.7}>
          <div className="bg-white rounded-xl border shadow-sm p-4 mb-6 flex flex-col gap-4" data-tutorial="search-filters">
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou telefone..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>

              {/* Filter Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2 border-dashed text-gray-600 hover:text-gray-900">
                    <Filter className="h-4 w-4" />
                    Filtros
                    {(filters.surgeryType !== "all" || filters.dataStatus !== "all" || filters.period !== "all" || filters.researchFilter !== "all") && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 min-w-[1.25rem] bg-gray-100 text-gray-900">
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
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium leading-none">Filtros Avançados</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                        onClick={() => setFilters({ surgeryType: "all", dataStatus: "all", period: "all", search: searchInput, researchFilter: "all" })}
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
                      <label className="text-xs font-medium text-purple-600 flex items-center gap-1">
                        <FlaskConical className="h-3 w-3" /> Pesquisas
                      </label>
                      <Select
                        value={filters.researchFilter || "all"}
                        onValueChange={(value) => handleFilterChange("researchFilter", value)}
                      >
                        <SelectTrigger className="h-9 border-purple-200 focus:border-purple-400">
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
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-dashed">
                <span className="text-xs text-muted-foreground mr-1">Filtros ativos:</span>

                {filters.surgeryType !== "all" && (
                  <Badge variant="secondary" className="gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                    {getSurgeryTypeLabel(filters.surgeryType as SurgeryType)}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("surgeryType", "all")} />
                  </Badge>
                )}

                {filters.dataStatus !== "all" && (
                  <Badge variant="secondary" className="gap-1 bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200">
                    {filters.dataStatus === "incomplete" ? "Incompleto" : filters.dataStatus === "complete" ? "Completo" : "Pesquisa Incompleta"}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("dataStatus", "all")} />
                  </Badge>
                )}

                {filters.period !== "all" && (
                  <Badge variant="secondary" className="gap-1 bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                    {filters.period === "today" ? "Hoje" : filters.period === "7days" ? "7 dias" : "30 dias"}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("period", "all")} />
                  </Badge>
                )}

                {filters.researchFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200">
                    <FlaskConical className="h-3 w-3" />
                    {filters.researchFilter === "non-participants" ? "Não participantes" : researchStats?.researches.find(r => r.researchId === filters.researchFilter)?.researchTitle || "Pesquisa"}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange("researchFilter", "all")} />
                  </Badge>
                )}

                {searchInput && (
                  <Badge variant="secondary" className="gap-1 bg-gray-100 text-gray-700">
                    &quot;{searchInput}&quot;
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchInput("")} />
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilters({ surgeryType: "all", dataStatus: "all", period: "all", search: "", researchFilter: "all" })
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

          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="h-6 w-6 text-blue-600" aria-hidden="true" />
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
                {patients.map((patient) => (
                  <StaggerItem key={patient.id}>
                    <PatientCard
                      patient={patient}
                      userName={userName}
                      showResearchButton={researches.length > 0}
                      onAddToResearch={handleOpenResearchModal}
                    />
                  </StaggerItem>
                ))}
              </AnimatePresence>
            </StaggerChildren>
          )}
        </FadeIn>

        {/* Research Assignment Modal */}
        <Dialog open={isResearchModalOpen} onOpenChange={setIsResearchModalOpen}>
          <DialogContent className="max-w-2xl" aria-labelledby="research-dialog-title" aria-describedby="research-dialog-description">
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

      </div>
    </div >
  )
}
