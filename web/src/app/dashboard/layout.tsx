import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardNav } from '@/components/DashboardNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} className="min-h-screen transition-colors duration-300">
      <DashboardHeader />

      <main
        style={{
          background: `linear-gradient(to bottom, var(--bg-primary), var(--bg-secondary))`,
        }}
        className="transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation */}
          <div className="mb-8">
            <DashboardNav />
          </div>

          {/* Page Content */}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: 'var(--card-bg)',
          borderTopColor: 'var(--border-primary)',
        }}
        className="border-t mt-16 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 style={{ color: 'var(--text-primary)' }} className="font-semibold mb-3">
                About
              </h3>
              <p style={{ color: 'var(--text-tertiary)' }} className="text-sm">
                Gasless DAO voting platform built with EIP-2771 meta-transactions for secure,
                cost-free governance.
              </p>
            </div>
            <div>
              <h3 style={{ color: 'var(--text-primary)' }} className="font-semibold mb-3">
                Quick Start
              </h3>
              <ul style={{ color: 'var(--text-tertiary)' }} className="text-sm space-y-2">
                <li>1. Connect your MetaMask wallet</li>
                <li>2. Deposit ETH to participate</li>
                <li>3. Vote on proposals (gasless)</li>
              </ul>
            </div>
            <div>
              <h3 style={{ color: 'var(--text-primary)' }} className="font-semibold mb-3">
                Requirements
              </h3>
              <p style={{ color: 'var(--text-tertiary)' }} className="text-sm">
                Minimum balance needed to create proposals (10% of DAO balance)
              </p>
            </div>
          </div>

          <div
            style={{
              borderTopColor: 'var(--border-primary)',
              color: 'var(--text-tertiary)',
            }}
            className="border-t pt-8 text-center text-sm"
          >
            <p>© 2026 DAO Voting Platform. Built with Solidity, Foundry, and Next.js.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
