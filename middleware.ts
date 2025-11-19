import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware ultra-leve (sem Prisma) para Edge Runtime
export function middleware(request: NextRequest) {
  // Para rotas públicas (API, auth, etc), apenas permite
  return NextResponse.next();
}

export const config = {
  matcher: [
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
