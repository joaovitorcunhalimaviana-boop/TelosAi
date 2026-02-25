'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, UserPlus, FileText, Menu, FlaskConical, Download, BarChart3 } from 'lucide-react';
import { useState } from 'react';

export function BottomNav() {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Cadastro',
      href: '/cadastro',
      icon: UserPlus,
    },
    {
      name: 'Termos',
      href: '/termos',
      icon: FileText,
    },
    {
      name: 'Mais',
      href: '#',
      icon: Menu,
      onClick: () => setShowMenu(true),
    },
  ];

  return (
    <>
      {/* Bottom Navigation - Only on mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t z-40 safe-area-inset-bottom" style={{ backgroundColor: '#111520', borderColor: '#1E2535' }}>
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.onClick) {
              return (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className={`
                    flex flex-col items-center justify-center gap-1 transition-colors
                    ${isActive
                      ? 'text-[#14BDAE]'
                      : 'text-[#7A8299] hover:text-[#F0EAD6]'
                    }
                  `}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.name}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center gap-1 transition-colors
                  ${isActive
                    ? 'text-[#14BDAE]'
                    : 'text-[#7A8299] hover:text-[#F0EAD6]'
                  }
                `}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Menu Modal */}
      {showMenu && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-50 animate-in fade-in duration-200"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl p-6 animate-in slide-in-from-bottom duration-300"
            style={{ backgroundColor: '#111520' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full mx-auto mb-6" style={{ backgroundColor: '#2A3147' }} />

            <h2 className="text-lg font-semibold mb-4" style={{ color: '#F0EAD6' }}>Menu</h2>

            <div className="space-y-1">
              <Link
                href="/dashboard"
                className="block px-4 py-3 rounded-lg hover:bg-[#1E2535] transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-[#7A8299]" />
                  <span className="font-medium" style={{ color: '#F0EAD6' }}>Dashboard</span>
                </div>
              </Link>

              <Link
                href="/cadastro"
                className="block px-4 py-3 rounded-lg hover:bg-[#1E2535] transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5 text-[#7A8299]" />
                  <span className="font-medium" style={{ color: '#F0EAD6' }}>Cadastro Express</span>
                </div>
              </Link>

              <Link
                href="/termos"
                className="block px-4 py-3 rounded-lg hover:bg-[#1E2535] transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#7A8299]" />
                  <span className="font-medium" style={{ color: '#F0EAD6' }}>Termos e Templates</span>
                </div>
              </Link>

              <Link
                href="/exportar"
                className="block px-4 py-3 rounded-lg hover:bg-[#1E2535] transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-[#7A8299]" />
                  <span className="font-medium" style={{ color: '#F0EAD6' }}>Exportar Dados</span>
                </div>
              </Link>

              <Link
                href="/dashboard/protocolos"
                className="block px-4 py-3 rounded-lg hover:bg-[#1E2535] transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#7A8299]" />
                  <span className="font-medium" style={{ color: '#F0EAD6' }}>Protocolos</span>
                </div>
              </Link>

              <Link
                href="/dashboard/pesquisas"
                className="block px-4 py-3 rounded-lg hover:bg-[#1E2535] transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <div className="flex items-center gap-3">
                  <FlaskConical className="w-5 h-5 text-[#7A8299]" />
                  <span className="font-medium" style={{ color: '#F0EAD6' }}>Pesquisas</span>
                </div>
              </Link>

              <Link
                href="/dashboard/dados-agregados"
                className="block px-4 py-3 rounded-lg hover:bg-[#1E2535] transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-[#7A8299]" />
                  <span className="font-medium" style={{ color: '#F0EAD6' }}>Dados Agregados</span>
                </div>
              </Link>
            </div>

            <button
              onClick={() => setShowMenu(false)}
              className="w-full mt-6 px-4 py-3 font-medium rounded-lg transition-colors hover:bg-[#1E2535]"
              style={{ backgroundColor: '#161B27', color: '#F0EAD6' }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Spacer for bottom nav on mobile */}
      <div className="md:hidden h-16" aria-hidden="true" />

      <style jsx global>{`
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .safe-area-inset-bottom {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
    </>
  );
}
