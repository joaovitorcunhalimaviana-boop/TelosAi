import { NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import { AuditLogger } from "@/lib/audit/logger"
import { getClientIP } from "@/lib/utils/ip"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 req/hora por IP (prevenir spam de registros)
    const ip = getClientIP(request);
    const rateLimitResult = await rateLimit(ip, 5, 3600); // 5 requisições por 3600 segundos (1 hora)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Muitas tentativas de registro. Tente novamente mais tarde.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset?.toString() || '',
          }
        }
      );
    }

    const body = await request.json()

    const {
      nomeCompleto,
      email,
      whatsapp,
      crm,
      estado,
      senha,
      plan,
      aceitoTermos,
      acceptedTermsOfService,
      aceitoNovidades,
    } = body

    // Validate required fields
    if (!nomeCompleto || !email || !whatsapp || !crm || !estado || !senha) {
      return NextResponse.json(
        { error: "Todos os campos obrigatórios devem ser preenchidos" },
        { status: 400 }
      )
    }

    if (!aceitoTermos) {
      return NextResponse.json(
        { error: "Você deve aceitar os termos de uso" },
        { status: 400 }
      )
    }

    // Validação OBRIGATÓRIA dos Termos de Uso completos
    if (!acceptedTermsOfService) {
      return NextResponse.json(
        { error: "Você deve aceitar os Termos de Uso e Política de Privacidade para usar a plataforma" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      )
    }

    // Validate WhatsApp format
    const whatsappRegex = /^\+55 \(\d{2}\) \d{4,5}-\d{4}$/
    if (!whatsappRegex.test(whatsapp)) {
      return NextResponse.json(
        { error: "Formato de WhatsApp inválido. Use: +55 (XX) XXXXX-XXXX" },
        { status: 400 }
      )
    }

    // Validate password strength
    if (senha.length < 8) {
      return NextResponse.json(
        { error: "Senha deve ter no mínimo 8 caracteres" },
        { status: 400 }
      )
    }

    if (!/[A-Z]/.test(senha)) {
      return NextResponse.json(
        { error: "Senha deve conter pelo menos uma letra maiúscula" },
        { status: 400 }
      )
    }

    if (!/[a-z]/.test(senha)) {
      return NextResponse.json(
        { error: "Senha deve conter pelo menos uma letra minúscula" },
        { status: 400 }
      )
    }

    if (!/[0-9]/.test(senha)) {
      return NextResponse.json(
        { error: "Senha deve conter pelo menos um número" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 400 }
      )
    }

    // Check if CRM already exists
    const existingCRM = await prisma.user.findFirst({
      where: {
        crm,
        estado,
      },
    })

    if (existingCRM) {
      return NextResponse.json(
        { error: "Este CRM já está cadastrado" },
        { status: 400 }
      )
    }

    // Hash password with bcrypt
    const hashedPassword = await hashPassword(senha)

    // Validate plan
    const validPlans = ["founding", "professional"]
    const selectedPlan = validPlans.includes(plan) ? plan : "professional"

    // Set pricing based on plan
    const pricing = {
      founding: {
        basePrice: 400,
        additionalPatientPrice: 150,
        isLifetimePrice: true,
      },
      professional: {
        basePrice: 500,
        additionalPatientPrice: 180,
        isLifetimePrice: false,
      },
    }

    const planPricing = pricing[selectedPlan as keyof typeof pricing]

    // Create user in database
    const user = await prisma.user.create({
      data: {
        nomeCompleto,
        email,
        whatsapp,
        crm,
        estado,
        senha: hashedPassword,
        plan: selectedPlan,
        basePrice: planPricing.basePrice,
        additionalPatientPrice: planPricing.additionalPatientPrice,
        isLifetimePrice: planPricing.isLifetimePrice,
        aceitoTermos,
        aceitoNovidades: aceitoNovidades || false,
        firstLogin: true,

        // NOVO: Termos de Uso completos (OBRIGATÓRIO)
        acceptedTermsOfService: true,
        termsOfServiceAcceptedAt: new Date(),
        termsOfServiceVersion: "1.0",
        termsOfServiceAcceptedFromIP: ip,

        // NOVO: Automaticamente ativa Inteligência Coletiva (via Termos)
        collectiveIntelligenceOptIn: true,
        collectiveIntelligenceDate: new Date(),

        createdAt: new Date(),
      },
    })

    // Remove password from response
    const { senha: _, ...userWithoutPassword } = user

    // Audit log: novo usuário registrado
    await AuditLogger.userRegistered({
      userId: user.id,
      email: user.email,
      role: "medico",
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    // In production, you would:
    // 1. Send welcome email
    // 2. Set up Twilio WhatsApp connection
    // 3. Create session/JWT token
    // 4. Log registration event

    return NextResponse.json(
      {
        message: "Conta criada com sucesso",
        user: userWithoutPassword,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Registration error:", error)

    return NextResponse.json(
      {
        error: "Erro ao criar conta. Por favor, tente novamente.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
