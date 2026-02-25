"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function VigiaHeader() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Navegação pública - apenas páginas sem necessidade de login
  const navItems = [
    { href: "/", label: "Início" },
    { href: "/como-funciona", label: "Como Funciona" },
    { href: "/pricing", label: "Preços" },
    { href: "/sobre", label: "Sobre" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full header-glass">
      <div className="container mx-auto flex h-20 items-center px-6">
        {/* Logo VigIA */}
        <Link href="/" className="flex-shrink-0 w-[120px] hidden md:block">
          <span className="font-brand text-2xl font-bold text-vigia-dark">
            Vig<span className="text-teal-light">IA</span>
          </span>
        </Link>

        {/* Navigation - Centralizado */}
        <nav className="hidden md:flex items-center gap-10 flex-1 justify-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  text-base font-medium transition-all duration-200
                  ${isActive
                    ? "text-vigia-teal font-semibold border-b-2 border-vigia-teal pb-1"
                    : "text-gray-600 hover:text-vigia-teal"
                  }
                `}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
          <Link
            href="/auth/login"
            className="px-4 py-2 text-vigia-teal hover:text-vigia-dark font-medium transition-colors"
          >
            Login
          </Link>
          <Link
            href="/cadastro-medico?plan=professional"
            className="flex items-center gap-2 px-6 py-3 bg-vigia-teal text-white rounded-lg font-medium btn-glow-premium shadow-md"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Começar Agora
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-vigia-teal hover:bg-teal-50 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-lg animate-fade-in-down">
          <div className="container mx-auto px-6 py-4 space-y-3">
            {/* Mobile Logo */}
            <div className="pb-3 border-b border-gray-100">
              <span className="font-brand text-xl font-bold text-vigia-dark">
                Vig<span className="text-teal-light">IA</span>
              </span>
            </div>

            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    block px-4 py-3 rounded-lg text-base font-medium transition-colors
                    ${isActive
                      ? "bg-teal-50 text-vigia-teal font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-vigia-teal"
                    }
                  `}
                >
                  {item.label}
                </Link>
              )
            })}

            <div className="pt-4 border-t border-gray-200 space-y-3">
              <Link
                href="/auth/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-base font-medium text-vigia-teal hover:bg-teal-50 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/cadastro-medico?plan=professional"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-vigia-teal text-white rounded-lg font-medium hover:bg-opacity-90 transition-all shadow-md"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Começar Agora
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
