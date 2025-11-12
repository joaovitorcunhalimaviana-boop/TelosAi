import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Rotas públicas que não precisam de autenticação
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

  // Permitir acesso a rotas públicas sem verificar token
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Pegar sessão usando NextAuth v5
  const session = await auth();

  // Se não está autenticado e não é rota pública, redireciona para login
  if (!session) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  // Redirecionar para onboarding se for primeiro login
  if (session.user.firstLogin && !path.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // Proteção de rotas de admin
  if (path.startsWith("/admin")) {
    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.ico|sw.js|manifest.json|icons).*)",
  ],
};
