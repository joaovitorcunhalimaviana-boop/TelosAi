import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Por segurança, sempre retornamos sucesso (mesmo se email não existir)
    // Isso previne enumeração de emails
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Gera token seguro
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // Salva token no banco
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expires,
      },
    })

    // URL de reset
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`

    // Envia email
    try {
      await resend.emails.send({
        from: "Telos.AI <noreply@telos.ai>",
        to: email,
        subject: "Recuperação de Senha - Telos.AI",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #0A2647 0%, #144272 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Telos.AI</h1>
                <p style="color: #D4AF37; margin: 10px 0 0 0; font-size: 14px;">Acompanhamento Pós-Operatório Inteligente</p>
              </div>

              <div style="background: white; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none;">
                <h2 style="color: #0A2647; margin-top: 0;">Recuperação de Senha</h2>

                <p>Olá <strong>${user.nomeCompleto}</strong>,</p>

                <p>Recebemos uma solicitação para redefinir a senha da sua conta Telos.AI.</p>

                <p>Clique no botão abaixo para criar uma nova senha:</p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" style="background: #0A2647; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                    Redefinir Senha
                  </a>
                </div>

                <p style="font-size: 14px; color: #666;">Ou copie e cole este link no navegador:</p>
                <p style="font-size: 12px; background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
                  ${resetUrl}
                </p>

                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #856404;">
                    <strong>⚠️ Importante:</strong> Este link expira em <strong>1 hora</strong>.
                  </p>
                </div>

                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  Se você não solicitou esta redefinição, ignore este email. Sua senha permanecerá inalterada.
                </p>
              </div>

              <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                <p style="margin: 0; font-size: 12px; color: #666;">
                  © ${new Date().getFullYear()} Telos.AI - Sistema de Acompanhamento Pós-Operatório
                </p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
                  Este é um email automático. Por favor, não responda.
                </p>
              </div>
            </body>
          </html>
        `,
      })
    } catch (emailError) {
      console.error("Erro ao enviar email:", emailError)
      return NextResponse.json(
        { error: "Erro ao enviar email. Tente novamente mais tarde." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao processar recuperação de senha:", error)
    return NextResponse.json(
      { error: "Erro ao processar solicitação" },
      { status: 500 }
    )
  }
}
