'use client';

import Link from 'next/link';
import WalletConnect from '@/components/WalletConnect';
import { ThemeToggle } from '@/components/ThemeToggle';

export function DashboardHeader() {
  return (
    <header
      style={{
        backgroundColor: 'var(--header-bg)',
        borderBottomColor: 'var(--header-border)',
        boxShadow: `0 1px 3px var(--header-shadow)`,
      }}
      className="sticky top-0 z-40 border-b backdrop-blur-sm transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Back Link */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="text-2xl">🏛️</div>
              <div className="hidden sm:block">
                <h1
                  style={{ color: 'var(--text-primary)' }}
                  className="font-playfair text-lg font-bold group-hover:opacity-70 transition-opacity duration-200"
                >
                  DAO Voting
                </h1>
                <p style={{ color: 'var(--text-tertiary)' }} className="text-xs">
                  Governance Platform
                </p>
              </div>
            </Link>
          </div>

          {/* Right side - Wallet & Theme */}
          <div className="flex items-center gap-3">
            <WalletConnect />
            <div
              style={{
                backgroundColor: 'var(--border-primary)',
              }}
              className="w-px h-6"
            />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
