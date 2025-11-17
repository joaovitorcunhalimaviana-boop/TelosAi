import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard"

export default async function AnalyticsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  // Busca dados para analytics
  const patients = await prisma.patient.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
    },
    include: {
      surgeries: {
        include: {
          followUps: {
            include: {
              responses: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Processa dados para analytics
  const analyticsData = {
    totalPatients: patients.length,
    patients: patients.map((p) => ({
      id: p.id,
      name: p.name,
      age: p.age,
      sex: p.sex,
      surgeries: p.surgeries.map((s) => ({
        id: s.id,
        type: s.type,
        date: s.date.toISOString(),
        followUps: s.followUps.map((fu) => ({
          dayNumber: fu.dayNumber,
          status: fu.status,
          responses: fu.responses.map((r) => ({
            questionnaireData: r.questionnaireData,
            riskLevel: r.riskLevel,
            redFlags: r.redFlags,
          })),
        })),
      })),
    })),
  }

  return <AnalyticsDashboard data={analyticsData} userName={session.user.name || ""} />
}
