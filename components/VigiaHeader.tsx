"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function VigiaHeader() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Inicio" },
    { href: "/como-funciona", label: "Como Funciona" },
    { href: "/pricing", label: "Precos" },
    { href: "/sobre", label: "Sobre" },
  ]

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] h-[60px] flex items-center justify-between px-6 md:px-[60px]"
      style={{
        background: "rgba(11, 14, 20, 0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid #1E2535",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex-shrink-0">
        <span
          className="text-[22px] font-medium tracking-[0.05em]"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          <span className="text-[#F0EAD6]">Vig</span>
          <span className="italic text-[#14BDAE]">IA</span>
        </span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors duration-200
                ${isActive
                  ? "text-[#C9A84C]"
                  : "text-[#7A8299] hover:text-[#C9A84C]"
                }
              `}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* CTA Buttons */}
      <div className="hidden md:flex items-center gap-4 flex-shrink-0">
        <Link
          href="/auth/login"
          className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#7A8299] hover:text-[#C9A84C] transition-colors duration-200"
        >
          Login
        </Link>
        <Link
          href="/cadastro-medico?plan=professional"
          className="px-5 py-2 bg-[#0D7377] text-[#F0EAD6] text-[11px] font-semibold uppercase tracking-[0.15em] rounded transition-colors duration-200 hover:bg-[#14BDAE]"
        >
          Comecar Agora
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 text-[#7A8299] hover:text-[#F0EAD6] transition-colors"
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="absolute top-[60px] left-0 right-0 md:hidden"
          style={{
            background: "#111520",
            borderBottom: "1px solid #1E2535",
          }}
        >
          <div className="px-6 py-6 space-y-1">
            {/* Mobile Logo */}
            <div className="pb-4 mb-4" style={{ borderBottom: "1px solid #1E2535" }}>
              <span
                className="text-[20px] font-medium tracking-[0.05em]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                <span className="text-[#F0EAD6]">Vig</span>
                <span className="italic text-[#14BDAE]">IA</span>
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
                    block px-4 py-3 rounded text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors duration-200
                    ${isActive
                      ? "text-[#C9A84C]"
                      : "text-[#7A8299] hover:text-[#C9A84C]"
                    }
                  `}
                >
                  {item.label}
                </Link>
              )
            })}

            <div className="pt-4 mt-4 space-y-3" style={{ borderTop: "1px solid #1E2535" }}>
              <Link
                href="/auth/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#7A8299] hover:text-[#C9A84C] transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                href="/cadastro-medico?plan=professional"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center px-4 py-3 bg-[#0D7377] text-[#F0EAD6] text-[11px] font-semibold uppercase tracking-[0.15em] rounded transition-colors duration-200 hover:bg-[#14BDAE]"
              >
                Comecar Agora
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
