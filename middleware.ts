// NextAuth v5 middleware para Edge Runtime
// Usa apenas authConfig (sem Prisma/bcrypt) para compatibilidade com Edge
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (authentication endpoints)
     * - api/postop/webhook (WhatsApp webhook)
     * - api/test (API tests)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|api/postop/webhook|api/test|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.ico|sw.js|manifest.json|icons).*)",
  ],
};
