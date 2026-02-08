import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from '@/lib/prisma';
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      // Se login for com Google, criar usuário automaticamente se não existir
      if (account?.provider === "google" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // Criar novo usuário com dados do Google
          await prisma.user.create({
            data: {
              email: user.email,
              nomeCompleto: user.name || user.email.split("@")[0],
              senha: "", // Senha vazia para logins OAuth
              role: "medico",
              plan: "professional",
              maxPatients: 3,
              basePrice: 950,
              additionalPatientPrice: 350,
              isLifetimePrice: false,
              firstLogin: true,
              aceitoTermos: false, // Requer aceite explícito dos termos (LGPD)
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // Se login for com Google, buscar dados do usuário no banco
      if (account?.provider === "google" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.plan = dbUser.plan;
          token.firstLogin = dbUser.firstLogin;
          token.crm = dbUser.crm ?? undefined;
          token.estado = dbUser.estado ?? undefined;
          token.maxPatients = dbUser.maxPatients;
          token.basePrice = Number(dbUser.basePrice);
          token.additionalPatientPrice = Number(dbUser.additionalPatientPrice);
          token.isLifetimePrice = dbUser.isLifetimePrice;
        }
      }

      // Se login for com credenciais, user já vem preenchido
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.plan = user.plan;
        token.firstLogin = user.firstLogin;
        token.crm = user.crm;
        token.estado = user.estado;
        token.maxPatients = user.maxPatients;
        token.basePrice = user.basePrice;
        token.additionalPatientPrice = user.additionalPatientPrice;
        token.isLifetimePrice = user.isLifetimePrice;
      }
      return token;
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user) {
          throw new Error("Credenciais inválidas");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.senha
        );

        if (!isPasswordValid) {
          throw new Error("Credenciais inválidas");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.nomeCompleto,
          role: user.role,
          plan: user.plan,
          firstLogin: user.firstLogin,
          crm: user.crm ?? undefined,
          estado: user.estado ?? undefined,
          maxPatients: user.maxPatients,
          basePrice: Number(user.basePrice),
          additionalPatientPrice: Number(user.additionalPatientPrice),
          isLifetimePrice: user.isLifetimePrice,
        };
      }
    })
  ],
});

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

// Helper function to verify passwords
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
