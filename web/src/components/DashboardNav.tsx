'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: '📊 Resumen General', icon: '📊' },
  { href: '/dashboard/treasury', label: '💰 Tesorería & Inscripción', icon: '💳' },
  { href: '/dashboard/proposals/create', label: '➕ Crear Propuesta', icon: '➕' },
  { href: '/dashboard/proposals', label: '📋 Propuestas & Votación', icon: '📋' },
];

export function DashboardNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-slate-900/80 p-2 rounded-2xl border border-purple-500/20 backdrop-blur-xl">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 text-center ${
                active
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
