// Middleware simplificado para Vercel Edge
// Rotas de API são protegidas individualmente com getServerSession
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir todas as rotas de API (protegidas individualmente)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Permitir rotas públicas
  const publicPaths = [
    '/',
    '/auth/login',
    '/auth/error',
    '/cadastro-medico',
    '/pricing',
    '/sobre',
    '/termos',
  ];

  if (publicPaths.some(path => pathname === path || pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Para outras rotas, Next.js auth vai lidar via getServerSession nas páginas
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.ico|sw.js|manifest.json|icons).*)",
  ],
};
