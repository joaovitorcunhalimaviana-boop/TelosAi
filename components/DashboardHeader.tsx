"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { LogOut, User } from "lucide-react"

export function DashboardHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Navegação privada - apenas após login
  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/cadastro", label: "Cadastro Express" },
    { href: "/exportar", label: "Exportar Dados" },
    { href: "/termos", label: "Termos" },
    { href: "/templates", label: "Templates" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/dashboard" className="group">
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
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "text-telos-blue font-semibold border-b-2 border-telos-gold pb-1"
                      : "text-gray-600 hover:text-telos-blue"
                  }
                `}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-4">
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
