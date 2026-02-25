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
    <header id="dashboard-header" className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
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
            <h1 className="text-xl font-brand font-bold" style={{ color: '#0D7377' }}>
              Vig<span style={{ color: '#14BDAE' }}>IA</span>
            </h1>
            <p className="text-xs text-gray-600">Vigilância contínua</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 mx-6">
          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors hover:text-[#0D7377] ${pathname === '/dashboard' ? 'text-[#0D7377] font-bold' : 'text-gray-500'
              }`}
          >
            Dashboard
          </Link>

          {(isMedico || isAdmin) && (
            <Link
              href="/dashboard/protocolos"
              className={`text-sm font-medium transition-colors hover:text-[#0D7377] ${pathname === '/dashboard/protocolos' ? 'text-[#0D7377] font-bold' : 'text-gray-500'
                }`}
            >
              Protocolos
            </Link>
          )}

          <Link
            href="/dashboard/pesquisas"
            data-tutorial="research-btn"
            className={`text-sm font-medium transition-colors hover:text-[#0D7377] ${pathname === '/dashboard/pesquisas' ? 'text-[#0D7377] font-bold' : 'text-gray-500'
              }`}
          >
            Pesquisas
          </Link>

          {(isMedico || isAdmin) && (
            <Link
              href="/dashboard/dados-agregados"
              className={`text-sm font-medium transition-colors hover:text-[#0D7377] ${pathname === '/dashboard/dados-agregados' ? 'text-[#0D7377] font-bold' : 'text-gray-500'
                }`}
            >
              Dados Agregados
            </Link>
          )}

          {isMedico && (
            <Link
              href="/dashboard/billing"
              className={`text-sm font-medium transition-colors hover:text-[#0D7377] ${pathname === '/dashboard/billing' ? 'text-[#0D7377] font-bold' : 'text-gray-500'
                }`}
            >
              Meu Plano
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className={`text-sm font-medium transition-colors hover:text-[#0D7377] ${pathname === '/admin' ? 'text-[#0D7377] font-bold' : 'text-gray-500'
                }`}
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
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-teal-50 rounded-lg">
              <User className="w-5 h-5 text-vigia-teal" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-vigia-teal">
                  {session.user.name}
                </span>
                <span className="text-xs text-gray-600 capitalize">
                  {isAdmin ? 'Administrador' : 'Médico'}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">Sair</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 text-vigia-teal">
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
