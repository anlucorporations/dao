'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getSigner } from '@/lib/web3';

const baseNavItems = [
  { href: '/dashboard', label: '📊 Resumen General', icon: '📊' },
  { href: '/dashboard/treasury', label: '💰 Tesorería & Inscripción', icon: '💳' },
  { href: '/dashboard/proposals/create', label: '➕ Crear Propuesta', icon: '➕' },
  { href: '/dashboard/proposals', label: '📋 Propuestas & Votación', icon: '📋' },
];

export function DashboardNav() {
  const pathname = usePathname();
  const [isOwner, setIsOwner] = useState<boolean>(false);

  const OWNER_ADDRESS = process.env.NEXT_PUBLIC_OWNER_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

  useEffect(() => {
    async function checkOwnerStatus() {
      try {
        const signer = await getSigner();
        if (signer) {
          const addr = await signer.getAddress();
          setIsOwner(addr.toLowerCase() === OWNER_ADDRESS.toLowerCase());
        } else {
          setIsOwner(false);
        }
      } catch {
        setIsOwner(false);
      }
    }

    checkOwnerStatus();
    const interval = setInterval(checkOwnerStatus, 4000);
    return () => clearInterval(interval);
  }, [pathname, OWNER_ADDRESS]);

  const navItems = isOwner
    ? [...baseNavItems, { href: '/dashboard/system', label: '⚙️ Sistema', icon: '⚙️' }]
    : baseNavItems;

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-slate-900/80 p-2 rounded-2xl border border-purple-500/20 backdrop-blur-xl">
      <div className={`grid gap-2 ${isOwner ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          const isSystemTab = item.href === '/dashboard/system';
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 text-center ${
                active
                  ? isSystemTab
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30'
                  : isSystemTab
                  ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30 font-extrabold'
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
