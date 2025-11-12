'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, UserPlus, FileText, Menu } from 'lucide-react';
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-inset-bottom">
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
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
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
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
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
          className="md:hidden fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

            <h2 className="text-lg font-semibold text-gray-900 mb-4">Menu</h2>

            <div className="space-y-1">
              <Link
                href="/dashboard"
                className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">Dashboard</span>
                </div>
              </Link>

              <Link
                href="/cadastro"
                className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">Cadastro Express</span>
                </div>
              </Link>

              <Link
                href="/termos"
                className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">Termos e Templates</span>
                </div>
              </Link>

              <Link
                href="/exportar"
                className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">Exportar Dados</span>
                </div>
              </Link>
            </div>

            <button
              onClick={() => setShowMenu(false)}
              className="w-full mt-6 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
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
