import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Usa auth.config.ts que é compatível com Edge Runtime (sem Prisma)
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // Bloquear endpoints de debug em produção
  if (
    process.env.NODE_ENV === "production" &&
    req.nextUrl.pathname.startsWith("/api/debug")
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
});

export const config = {
  matcher: [
    // Debug routes (para bloquear em produção)
    "/api/debug/:path*",
    /*
     * Match all request paths except for the ones starting with:
     * - api/ (all API routes - incluindo webhooks, auth, cron)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
