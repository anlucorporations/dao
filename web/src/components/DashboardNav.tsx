'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: '📊 Overview', icon: '📊' },
  { href: '/dashboard/treasury', label: '💰 Treasury', icon: '💰' },
  { href: '/dashboard/proposals/create', label: '✍️ Create Proposal', icon: '✍️' },
  { href: '/dashboard/proposals', label: '📋 Active Proposals', icon: '📋' },
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
    <nav
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        boxShadow: `0 4px 6px var(--card-shadow)`,
      }}
      className="border rounded-lg p-2 transition-colors duration-300"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              backgroundColor: isActive(item.href)
                ? 'var(--accent-blue)'
                : 'var(--bg-secondary)',
              color: isActive(item.href)
                ? '#ffffff'
                : 'var(--text-primary)',
              borderColor: isActive(item.href)
                ? 'var(--accent-blue)'
                : 'var(--border-primary)',
            }}
            className="px-4 py-3 rounded-lg border-2 font-medium transition-all duration-300 hover:opacity-80 flex items-center justify-center gap-2 text-center"
          >
            <span>{item.icon}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
