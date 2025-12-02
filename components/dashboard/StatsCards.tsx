"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users, AlertCircle } from "lucide-react"
import { StaggerChildren, StaggerItem, CountUp, ScaleOnHover } from "@/components/animations"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"
import type { DashboardStats } from "@/app/dashboard/actions"

interface StatsCardsProps {
  stats: DashboardStats | null
}

const PRIMARY_COLOR = '#0A2647'
const DANGER_COLOR = '#DC2626'
const HEADER_BG = '#F8F9FB'
const DANGER_BG = '#FEF2F2'

export function StatsCards({ stats }: StatsCardsProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const hasCriticalAlerts = (stats?.criticalAlerts || 0) > 0

  return (
    <StaggerChildren
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      staggerDelay={0.1}
    >
      {/* Cirurgias Hoje */}
      <StaggerItem>
        <ScaleOnHover>
          <Card
            className="border-2 hover:shadow-lg transition-shadow"
            data-tutorial="stats-today-surgeries"
            style={{ borderColor: PRIMARY_COLOR }}
          >
            <CardHeader className="pb-3" style={{ backgroundColor: HEADER_BG }}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Cirurgias Hoje
                </CardTitle>
                <Calendar
                  className="h-5 w-5"
                  style={{ color: PRIMARY_COLOR }}
                  aria-hidden="true"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: PRIMARY_COLOR }}>
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

      {/* Pacientes Ativos */}
      <StaggerItem>
        <ScaleOnHover>
          <Card
            className="border-2 hover:shadow-lg transition-shadow"
            data-tutorial="stats-active-patients"
            style={{ borderColor: PRIMARY_COLOR }}
          >
            <CardHeader className="pb-3" style={{ backgroundColor: HEADER_BG }}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pacientes Ativos
                </CardTitle>
                <Users
                  className="h-5 w-5"
                  style={{ color: PRIMARY_COLOR }}
                  aria-hidden="true"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: PRIMARY_COLOR }}>
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

      {/* Follow-ups Hoje */}
      <StaggerItem>
        <ScaleOnHover>
          <Card
            className="border-2 hover:shadow-lg transition-shadow"
            data-tutorial="stats-followups-today"
            style={{ borderColor: PRIMARY_COLOR }}
          >
            <CardHeader className="pb-3" style={{ backgroundColor: HEADER_BG }}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Follow-ups Hoje
                </CardTitle>
                <Clock
                  className="h-5 w-5"
                  style={{ color: PRIMARY_COLOR }}
                  aria-hidden="true"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: PRIMARY_COLOR }}>
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

      {/* Alertas Críticos */}
      <StaggerItem>
        <ScaleOnHover>
          <Card
            className="border-2 hover:shadow-lg transition-shadow"
            data-tutorial="stats-critical-alerts"
            style={{ borderColor: hasCriticalAlerts ? DANGER_COLOR : PRIMARY_COLOR }}
          >
            <CardHeader
              className="pb-3"
              style={{ backgroundColor: hasCriticalAlerts ? DANGER_BG : HEADER_BG }}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Alertas Críticos
                </CardTitle>
                <AlertCircle
                  className="h-5 w-5"
                  style={{ color: hasCriticalAlerts ? DANGER_COLOR : PRIMARY_COLOR }}
                  aria-hidden="true"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="text-3xl font-bold"
                style={{ color: hasCriticalAlerts ? DANGER_COLOR : PRIMARY_COLOR }}
              >
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
  )
}
