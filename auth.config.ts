import type { NextAuthConfig } from "next-auth";

// Configuração compatível com Edge Runtime (sem Prisma/bcrypt)
export const authConfig = {
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      // Rotas públicas
      const publicPaths = [
        "/",
        "/auth/login",
        "/auth/error",
        "/cadastro-medico",
        "/pricing",
        "/sobre",
        "/termos",
      ];

      const isPublicPath = publicPaths.some((p) => path === p || path.startsWith(p));

      if (isPublicPath) {
        return true;
      }

      // Se não está autenticado, não autorizado
      if (!isLoggedIn) {
        return false;
      }

      // Verificar first login
      if (auth.user.firstLogin && !path.startsWith("/onboarding")) {
        return Response.redirect(new URL("/onboarding", nextUrl));
      }

      // Verificar rotas de admin
      if (path.startsWith("/admin") && auth.user.role !== "admin") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
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
  providers: [], // Providers serão adicionados em auth.ts
} satisfies NextAuthConfig;
