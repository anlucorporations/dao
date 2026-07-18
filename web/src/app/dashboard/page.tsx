'use client';

import ConfigCheck from '@/components/ConfigCheck';
import Link from 'next/link';

const sections = [
  {
    icon: '💰',
    title: 'DAO Treasury',
    description: 'View treasury balance, deposit ETH, and manage DAO funds',
    href: '/dashboard/treasury',
    color: 'var(--accent-blue)',
  },
  {
    icon: '✍️',
    title: 'Create Proposal',
    description: 'Create new proposals for voting and fund allocation',
    href: '/dashboard/proposals/create',
    color: 'var(--accent-green)',
  },
  {
    icon: '📋',
    title: 'Active Proposals',
    description: 'View all active proposals and cast your votes',
    href: '/dashboard/proposals',
    color: 'var(--accent-purple)',
  },
];

export default function Dashboard() {
  return (
    <ConfigCheck>
      <div style={{ color: 'var(--text-primary)' }} className="transition-colors duration-300">
        {/* Intro Section */}
        <div className="mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-3">DAO Governance</h1>
          <p style={{ color: 'var(--text-tertiary)' }} className="text-lg">
            Manage treasury, create proposals, and vote on DAO decisions with gasless transactions.
          </p>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
                boxShadow: `0 10px 15px var(--card-shadow)`,
              }}
              className="group rounded-xl border p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-blue-500"
            >
              {/* Icon */}
              <div
                style={{
                  backgroundColor: section.color,
                }}
                className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300"
              >
                {section.icon}
              </div>

              {/* Content */}
              <h2 style={{ color: 'var(--text-primary)' }} className="font-playfair text-2xl font-bold mb-2">
                {section.title}
              </h2>
              <p style={{ color: 'var(--text-tertiary)' }} className="text-sm mb-4">
                {section.description}
              </p>

              {/* Arrow */}
              <div
                style={{ color: section.color }}
                className="flex items-center gap-2 font-semibold text-sm group-hover:translate-x-2 transition-transform"
              >
                <span>Go to</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
          }}
          className="border rounded-xl p-8 mt-12"
        >
          <h3 style={{ color: 'var(--text-primary)' }} className="font-playfair text-2xl font-bold mb-4">
            Quick Start
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div
                style={{ color: 'var(--accent-blue)' }}
                className="text-2xl font-bold flex-shrink-0"
              >
                1
              </div>
              <div>
                <h4 style={{ color: 'var(--text-primary)' }} className="font-semibold mb-1">
                  Connect Wallet
                </h4>
                <p style={{ color: 'var(--text-tertiary)' }} className="text-sm">
                  Click the &quot;Connect Wallet&quot; button to link your MetaMask account
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div
                style={{ color: 'var(--accent-green)' }}
                className="text-2xl font-bold flex-shrink-0"
              >
                2
              </div>
              <div>
                <h4 style={{ color: 'var(--text-primary)' }} className="font-semibold mb-1">
                  Deposit ETH
                </h4>
                <p style={{ color: 'var(--text-tertiary)' }} className="text-sm">
                  Go to Treasury to deposit ETH and participate in voting
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div
                style={{ color: 'var(--accent-purple)' }}
                className="text-2xl font-bold flex-shrink-0"
              >
                3
              </div>
              <div>
                <h4 style={{ color: 'var(--text-primary)' }} className="font-semibold mb-1">
                  Vote & Propose
                </h4>
                <p style={{ color: 'var(--text-tertiary)' }} className="text-sm">
                  Create proposals or vote on active ones (requires minimum balance)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConfigCheck>
  );
}
