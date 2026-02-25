"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { LogOut, User } from "lucide-react"
import { NotificationBell } from "@/components/notifications/NotificationBell"

export function DashboardHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const userRole = session?.user?.role?.toLowerCase() || '';
  const isMedico = userRole === 'medico';
  const isAdmin = userRole === 'admin';

  return (
    <header
      id="dashboard-header"
      className="sticky top-0 z-50 w-full backdrop-blur-md"
      style={{ backgroundColor: 'rgba(11, 14, 20, 0.9)', borderBottom: '1px solid #1E2535' }}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo e Nome */}
        <Link href="/dashboard" className="group flex items-center gap-3">
          <div className="relative w-14 h-14">
            <Image
              src="/icons/icon-192.png"
              alt="VigIA Logo"
              width={56}
              height={56}
              className="transition-transform group-hover:scale-110"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              <span style={{ color: '#F0EAD6' }}>Vig</span><span style={{ color: '#14BDAE', fontStyle: 'italic' }}>IA</span>
            </h1>
            <p className="text-xs" style={{ color: '#7A8299' }}>Vigilância contínua</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 mx-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium transition-colors"
            style={{ color: pathname === '/dashboard' ? '#14BDAE' : '#7A8299', fontWeight: pathname === '/dashboard' ? 700 : 500 }}
            onMouseEnter={(e) => { if (pathname !== '/dashboard') e.currentTarget.style.color = '#F0EAD6' }}
            onMouseLeave={(e) => { if (pathname !== '/dashboard') e.currentTarget.style.color = '#7A8299' }}
          >
            Dashboard
          </Link>

          {(isMedico || isAdmin) && (
            <Link
              href="/dashboard/protocolos"
              className="text-sm font-medium transition-colors"
              style={{ color: pathname === '/dashboard/protocolos' ? '#14BDAE' : '#7A8299', fontWeight: pathname === '/dashboard/protocolos' ? 700 : 500 }}
              onMouseEnter={(e) => { if (pathname !== '/dashboard/protocolos') e.currentTarget.style.color = '#F0EAD6' }}
              onMouseLeave={(e) => { if (pathname !== '/dashboard/protocolos') e.currentTarget.style.color = '#7A8299' }}
            >
              Protocolos
            </Link>
          )}

          <Link
            href="/dashboard/pesquisas"
            data-tutorial="research-btn"
            className="text-sm font-medium transition-colors"
            style={{ color: pathname === '/dashboard/pesquisas' ? '#14BDAE' : '#7A8299', fontWeight: pathname === '/dashboard/pesquisas' ? 700 : 500 }}
            onMouseEnter={(e) => { if (pathname !== '/dashboard/pesquisas') e.currentTarget.style.color = '#F0EAD6' }}
            onMouseLeave={(e) => { if (pathname !== '/dashboard/pesquisas') e.currentTarget.style.color = '#7A8299' }}
          >
            Pesquisas
          </Link>

          {(isMedico || isAdmin) && (
            <Link
              href="/dashboard/dados-agregados"
              className="text-sm font-medium transition-colors"
              style={{ color: pathname === '/dashboard/dados-agregados' ? '#14BDAE' : '#7A8299', fontWeight: pathname === '/dashboard/dados-agregados' ? 700 : 500 }}
              onMouseEnter={(e) => { if (pathname !== '/dashboard/dados-agregados') e.currentTarget.style.color = '#F0EAD6' }}
              onMouseLeave={(e) => { if (pathname !== '/dashboard/dados-agregados') e.currentTarget.style.color = '#7A8299' }}
            >
              Dados Agregados
            </Link>
          )}

          {isMedico && (
            <Link
              href="/dashboard/billing"
              className="text-sm font-medium transition-colors"
              style={{ color: pathname === '/dashboard/billing' ? '#14BDAE' : '#7A8299', fontWeight: pathname === '/dashboard/billing' ? 700 : 500 }}
              onMouseEnter={(e) => { if (pathname !== '/dashboard/billing') e.currentTarget.style.color = '#F0EAD6' }}
              onMouseLeave={(e) => { if (pathname !== '/dashboard/billing') e.currentTarget.style.color = '#7A8299' }}
            >
              Meu Plano
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm font-medium transition-colors"
              style={{ color: pathname === '/admin' ? '#14BDAE' : '#7A8299', fontWeight: pathname === '/admin' ? 700 : 500 }}
              onMouseEnter={(e) => { if (pathname !== '/admin') e.currentTarget.style.color = '#F0EAD6' }}
              onMouseLeave={(e) => { if (pathname !== '/admin') e.currentTarget.style.color = '#7A8299' }}
            >
              Admin
            </Link>
          )}
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          {/* Notificações */}
          <NotificationBell />

          {session?.user && (
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-lg" style={{ backgroundColor: '#161B27' }}>
              <User className="w-5 h-5" style={{ color: '#14BDAE' }} />
              <div className="flex flex-col">
                <span className="text-sm font-semibold" style={{ color: '#F0EAD6' }}>
                  {session.user.name}
                </span>
                <span
                  className="text-xs capitalize px-1.5 py-0.5 rounded"
                  style={{ color: '#F0EAD6', backgroundColor: 'rgba(20, 189, 174, 0.2)' }}
                >
                  {isAdmin ? 'Administrador' : 'Médico'}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{ color: '#7A8299', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#161B27'; e.currentTarget.style.color = '#F0EAD6' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#7A8299' }}
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">Sair</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2" style={{ color: '#14BDAE' }}>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </header>
  )
}
