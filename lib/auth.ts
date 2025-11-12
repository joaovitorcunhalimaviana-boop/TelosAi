import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
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
  callbacks: {
    async jwt({ token, user }) {
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
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.plan = token.plan as string;
        session.user.firstLogin = token.firstLogin as boolean;
        session.user.crm = token.crm as string | undefined;
        session.user.estado = token.estado as string | undefined;
        session.user.maxPatients = token.maxPatients as number;
        session.user.basePrice = token.basePrice as number;
        session.user.additionalPatientPrice = token.additionalPatientPrice as number;
        session.user.isLifetimePrice = token.isLifetimePrice as boolean;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
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
