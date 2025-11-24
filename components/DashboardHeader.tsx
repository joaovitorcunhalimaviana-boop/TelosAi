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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo e Nome */}
        <Link href="/dashboard" className="group flex items-center gap-3">
          <div className="relative w-14 h-14">
            <Image
              src="/icons/icon-192.png"
              alt="Telos.AI Logo"
              width={56}
              height={56}
              className="transition-transform group-hover:scale-110"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold" style={{ color: '#0A2647' }}>Telos.AI</h1>
            <p className="text-xs text-gray-600">Inteligência no Cuidado</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 mx-6">
          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors hover:text-[#0A2647] ${pathname === '/dashboard' ? 'text-[#0A2647] font-bold' : 'text-gray-500'
              }`}
          >
            Dashboard
          </Link>

          {(session?.user?.role === 'medico' || session?.user?.role === 'admin') && (
            <Link
              href="/dashboard/protocolos"
              className={`text-sm font-medium transition-colors hover:text-[#0A2647] ${pathname === '/dashboard/protocolos' ? 'text-[#0A2647] font-bold' : 'text-gray-500'
                }`}
            >
              Protocolos
            </Link>
          )}

          <Link
            href="/dashboard/pesquisas"
            className={`text-sm font-medium transition-colors hover:text-[#0A2647] ${pathname === '/dashboard/pesquisas' ? 'text-[#0A2647] font-bold' : 'text-gray-500'
              }`}
          >
            Pesquisas
          </Link>

          {session?.user?.role === 'medico' && (
            <Link
              href="/dashboard/billing"
              className={`text-sm font-medium transition-colors hover:text-[#0A2647] ${pathname === '/dashboard/billing' ? 'text-[#0A2647] font-bold' : 'text-gray-500'
                }`}
            >
              Meu Plano
            </Link>
          )}

          {session?.user?.role === 'admin' && (
            <Link
              href="/admin"
              className={`text-sm font-medium transition-colors hover:text-[#0A2647] ${pathname === '/admin' ? 'text-[#0A2647] font-bold' : 'text-gray-500'
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
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-lg">
              <User className="w-5 h-5 text-telos-blue" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-telos-blue">
                  {session.user.name}
                </span>
                <span className="text-xs text-gray-600 capitalize">
                  {session.user.role === 'admin' ? 'Administrador' : 'Médico'}
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
        <button className="md:hidden p-2 text-telos-blue">
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
