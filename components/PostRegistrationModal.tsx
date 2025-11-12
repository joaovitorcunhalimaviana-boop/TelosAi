"use client"

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  CheckCircle2,
  Sparkles,
  Users,
  FlaskConical,
  ChevronRight,
  Loader2,
  Info
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Types
interface ResearchGroup {
  id: string
  groupCode: string
  groupName: string
  description: string
  patientCount: number
}

interface Research {
  id: string
  title: string
  description: string
  surgeryType: string | null
  isActive: boolean
  groups: ResearchGroup[]
  totalPatients: number
}

interface PostRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  patientName: string
  onAssignSuccess?: () => void
}

export function PostRegistrationModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  onAssignSuccess,
}: PostRegistrationModalProps) {
  const [researches, setResearches] = useState<Research[]>([])
  const [selectedResearch, setSelectedResearch] = useState<Research | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)

  // Fetch active research studies
  useEffect(() => {
    if (isOpen) {
      fetchResearches()
    }
  }, [isOpen])

  const fetchResearches = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/pesquisas')
      const data = await response.json()

      if (data.success) {
        // Filter only active researches
        const activeResearches = data.data.filter((r: Research) => r.isActive)
        setResearches(activeResearches)
      } else {
        toast.error('Erro ao carregar pesquisas', {
          description: data.message || 'Tente novamente mais tarde',
        })
      }
    } catch (error) {
      console.error('Error fetching researches:', error)
      toast.error('Erro ao carregar pesquisas', {
        description: 'Verifique sua conexão e tente novamente',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignToResearch = async () => {
    if (!selectedResearch || !selectedGroup) {
      toast.error('Seleção incompleta', {
        description: 'Por favor, selecione uma pesquisa e um grupo',
      })
      return
    }

    setIsAssigning(true)
    try {
      const response = await fetch(`/api/paciente/${patientId}/pesquisa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          researchId: selectedResearch.id,
          groupCode: selectedGroup,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Paciente atribuído com sucesso!', {
          description: `${patientName} foi adicionado ao grupo ${selectedGroup}`,
          duration: 5000,
        })
        onAssignSuccess?.()
        handleClose()
      } else {
        toast.error('Erro ao atribuir paciente', {
          description: data.message || 'Tente novamente mais tarde',
        })
      }
    } catch (error) {
      console.error('Error assigning patient:', error)
      toast.error('Erro ao atribuir paciente', {
        description: 'Verifique sua conexão e tente novamente',
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleClose = () => {
    // Reset state
    setSelectedResearch(null)
    setSelectedGroup(null)
    onClose()
  }

  const handleSkip = () => {
    toast.info('Paciente cadastrado', {
      description: 'Você pode atribuir a uma pesquisa posteriormente',
    })
    handleClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with celebration */}
        <DialogHeader className="space-y-4 pb-4 border-b">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#D4AF37] blur-xl opacity-20 animate-pulse"></div>
              <CheckCircle2 className="w-16 h-16 text-[#0A2647] relative z-10" />
              <Sparkles className="w-6 h-6 text-[#D4AF37] absolute -top-1 -right-1 animate-bounce" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <DialogTitle className="text-2xl font-bold text-[#0A2647]">
              Paciente Cadastrado com Sucesso!
            </DialogTitle>
            <DialogDescription className="text-base">
              <span className="font-semibold text-[#0A2647]">{patientName}</span> foi adicionado ao sistema.
              <br />
              <span className="text-sm text-muted-foreground mt-1 inline-block">
                Deseja atribuí-lo a alguma pesquisa ativa?
              </span>
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#0A2647]" />
              <p className="text-sm text-muted-foreground">Carregando pesquisas...</p>
            </div>
          ) : researches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <FlaskConical className="w-12 h-12 text-gray-300" />
              <div>
                <h3 className="font-semibold text-[#0A2647] mb-1">
                  Nenhuma pesquisa ativa
                </h3>
                <p className="text-sm text-muted-foreground">
                  Você pode cadastrar pesquisas no painel de administração
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="w-4 h-4" />
                <span>Selecione uma pesquisa e depois escolha o grupo</span>
              </div>

              {/* Research Cards */}
              <div className="space-y-3">
                {researches.map((research) => (
                  <Card
                    key={research.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      selectedResearch?.id === research.id
                        ? "ring-2 ring-[#0A2647] bg-[#F5F7FA]"
                        : "hover:border-[#2C74B3]"
                    )}
                    onClick={() => {
                      setSelectedResearch(research)
                      setSelectedGroup(null)
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <FlaskConical className="w-5 h-5 text-[#0A2647]" />
                            <CardTitle className="text-lg">{research.title}</CardTitle>
                          </div>
                          <CardDescription className="text-sm">
                            {research.description}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {research.surgeryType && (
                            <Badge variant="outline" className="text-xs">
                              {research.surgeryType}
                            </Badge>
                          )}
                          <Badge
                            variant="secondary"
                            className="text-xs bg-[#0A2647] text-white"
                          >
                            <Users className="w-3 h-3 mr-1" />
                            {research.totalPatients} pacientes
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Groups - Show only when research is selected */}
                    {selectedResearch?.id === research.id && (
                      <CardContent className="space-y-2 border-t pt-4 bg-white/50">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-4 h-4 text-[#0A2647]" />
                          <span className="text-sm font-semibold text-[#0A2647]">
                            Grupos de Pesquisa ({research.groups.length})
                          </span>
                        </div>
                        <div className="grid gap-2">
                          {research.groups.map((group) => (
                            <div
                              key={group.id}
                              className={cn(
                                "p-3 rounded-lg border-2 transition-all cursor-pointer",
                                selectedGroup === group.groupCode
                                  ? "border-[#D4AF37] bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5"
                                  : "border-gray-200 hover:border-[#2C74B3] hover:bg-gray-50"
                              )}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedGroup(group.groupCode)
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge
                                      variant={selectedGroup === group.groupCode ? "default" : "outline"}
                                      className={cn(
                                        "font-mono",
                                        selectedGroup === group.groupCode &&
                                        "bg-[#D4AF37] text-white border-[#D4AF37]"
                                      )}
                                    >
                                      {group.groupCode}
                                    </Badge>
                                    <span className="font-semibold text-sm text-[#0A2647]">
                                      {group.groupName}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {group.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Users className="w-3 h-3" />
                                  <span>{group.patientCount}</span>
                                  {selectedGroup === group.groupCode && (
                                    <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="border-t pt-4 mt-2 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkip}
            disabled={isAssigning}
            className="text-muted-foreground hover:text-[#0A2647]"
          >
            Pular por Agora
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isAssigning}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAssignToResearch}
              disabled={!selectedResearch || !selectedGroup || isAssigning}
              className={cn(
                "bg-gradient-to-r from-[#0A2647] to-[#144272] hover:from-[#144272] hover:to-[#205295]",
                "shadow-lg hover:shadow-xl transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isAssigning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Atribuindo...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Atribuir à Pesquisa
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
