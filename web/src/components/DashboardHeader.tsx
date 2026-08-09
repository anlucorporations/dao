'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WalletConnect from '@/components/WalletConnect';
import { getSigner } from '@/lib/web3';

const baseNavItems = [
  { href: '/dashboard', label: 'Resumen', icon: '📊' },
  { href: '/dashboard/treasury', label: 'Tesorería', icon: '💰' },
  { href: '/dashboard/proposals', label: 'Propuestas', icon: '📋' },
  { href: '/dashboard/voting', label: 'Votación', icon: '🗳️' },
];

export function DashboardHeader() {
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
  }, [pathname]);

  const navItems = isOwner
    ? [...baseNavItems, { href: '/dashboard/system', label: 'Sistema', icon: '⚙️' }]
    : baseNavItems;

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/90 border-b border-purple-500/20 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-tr from-purple-400 to-cyan-300 text-lg">
                  DAO
                </div>
              </div>
              <div>
                <span className="text-base font-extrabold text-white tracking-tight">Plataforma DAO</span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold hidden sm:inline-block">
                  EIP-2771 Gasless
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Integrated Navigation Bar */}
          <nav className="bg-slate-900/80 p-1.5 rounded-2xl border border-purple-500/20 backdrop-blur-xl w-full lg:w-auto overflow-x-auto">
            <div className={`grid gap-1.5 min-w-[480px] sm:min-w-0 ${isOwner ? 'grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'}`}>
              {navItems.map((item) => {
                const active = isActive(item.href);
                const isSystemTab = item.href === '/dashboard/system';
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-xl font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 text-center shrink-0 ${
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

          {/* Right: Landing Page Link & WalletConnect */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="text-xs font-bold text-slate-400 hover:text-white transition-colors hidden xl:block">
              ← Landing Page
            </Link>
            <WalletConnect />
          </div>

        </div>
      </div>
    </header>
  );
}
