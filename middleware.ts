// NextAuth v5 middleware para Edge Runtime
// Usa apenas authConfig (sem Prisma/bcrypt) para compatibilidade com Edge
export { auth as middleware } from "@/lib/auth";

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
