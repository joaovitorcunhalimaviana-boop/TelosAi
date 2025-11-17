import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ConsentTermViewer } from "@/components/ConsentTermViewer"

interface PageProps {
  params: {
    patientId: string
  }
  searchParams: {
    research?: string
  }
}

export default async function ConsentTermPage({ params, searchParams }: PageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  // Busca paciente
  const patient = await prisma.patient.findUnique({
    where: { id: params.patientId },
    include: {
      surgeries: {
        orderBy: { date: "desc" },
        take: 1,
      },
      user: true,
    },
  })

  if (!patient) {
    redirect("/dashboard")
  }

  // Verifica permissão (multi-tenant)
  if (patient.userId !== session.user.id && session.user.role !== "admin") {
    redirect("/dashboard")
  }

  // Se for pesquisa, busca dados da pesquisa
  let researchTitle = undefined
  if (searchParams.research) {
    const research = await prisma.research.findUnique({
      where: { id: searchParams.research },
    })
    researchTitle = research?.title
  }

  const termData = {
    patientName: patient.name,
    patientCpf: patient.cpf || "Não informado",
    doctorName: patient.user.nomeCompleto,
    doctorCrm: patient.user.crm || "Não informado",
    doctorState: patient.user.estado || "Não informado",
    date: new Date().toLocaleDateString("pt-BR"),
    isResearch: !!searchParams.research,
    researchTitle,
  }

  return <ConsentTermViewer data={termData} patientId={params.patientId} />
}
