"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function TelosHeader() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Navegação pública - apenas páginas sem necessidade de login
  const navItems = [
    { href: "/", label: "Início" },
    { href: "/pricing", label: "Preços" },
    { href: "/sobre", label: "Sobre" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="group">
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
            const isActive = pathname === item.href
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

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="px-4 py-2 text-telos-blue hover:text-telos-gold font-medium transition-colors"
          >
            Login
          </Link>
          <Link
            href="/cadastro-medico?plan=professional"
            className="flex items-center gap-2 px-6 py-3 bg-telos-blue text-white rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
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
          className="md:hidden p-2 text-telos-blue hover:bg-blue-50 rounded-lg transition-colors"
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
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    block px-4 py-3 rounded-lg text-base font-medium transition-colors
                    ${
                      isActive
                        ? "bg-blue-50 text-telos-blue font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-telos-blue"
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
                className="block px-4 py-3 rounded-lg text-base font-medium text-telos-blue hover:bg-blue-50 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/cadastro-medico?plan=professional"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-telos-blue text-white rounded-lg font-medium hover:bg-opacity-90 transition-all shadow-md"
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
