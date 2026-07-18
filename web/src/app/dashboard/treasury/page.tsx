'use client';

import ConfigCheck from '@/components/ConfigCheck';
import DAOStats from '@/components/DAOStats';

export default function TreasuryPage() {
  return (
    <ConfigCheck>
      <div style={{ color: 'var(--text-primary)' }} className="transition-colors duration-300">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-3">💰 DAO Treasury</h1>
          <p style={{ color: 'var(--text-tertiary)' }} className="text-lg">
            Manage your DAO funds, view treasury balance, and make deposits to participate in voting.
          </p>
        </div>

        {/* Treasury Stats */}
        <div className="mb-8">
          <DAOStats />
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* How It Works */}
          <div
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
              boxShadow: `0 10px 15px var(--card-shadow)`,
            }}
            className="border rounded-xl p-6 transition-colors duration-300"
          >
            <h2 style={{ color: 'var(--text-primary)' }} className="font-playfair text-2xl font-bold mb-4">
              How It Works
            </h2>
            <ul style={{ color: 'var(--text-tertiary)' }} className="space-y-3">
              <li className="flex gap-3">
                <span className="text-xl">1️⃣</span>
                <span>Deposit ETH to the DAO treasury</span>
              </li>
              <li className="flex gap-3">
                <span className="text-xl">2️⃣</span>
                <span>Your balance determines voting power</span>
              </li>
              <li className="flex gap-3">
                <span className="text-xl">3️⃣</span>
                <span>Vote on proposals without paying gas</span>
              </li>
              <li className="flex gap-3">
                <span className="text-xl">4️⃣</span>
                <span>Approved proposals execute automatically</span>
              </li>
            </ul>
          </div>

          {/* Requirements */}
          <div
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
              boxShadow: `0 10px 15px var(--card-shadow)`,
            }}
            className="border rounded-xl p-6 transition-colors duration-300"
          >
            <h2 style={{ color: 'var(--text-primary)' }} className="font-playfair text-2xl font-bold mb-4">
              Requirements
            </h2>
            <div style={{ color: 'var(--text-tertiary)' }} className="space-y-3">
              <div>
                <h3 style={{ color: 'var(--accent-blue)' }} className="font-semibold mb-1">
                  Minimum to Vote
                </h3>
                <p className="text-sm">You need any amount of ETH deposited to participate in voting</p>
              </div>
              <div>
                <h3 style={{ color: 'var(--accent-green)' }} className="font-semibold mb-1">
                  To Create a Proposal
                </h3>
                <p className="text-sm">You must hold at least 10% of the DAO&apos;s total balance</p>
              </div>
              <div>
                <h3 style={{ color: 'var(--accent-purple)' }} className="font-semibold mb-1">
                  Gas-Free Voting
                </h3>
                <p className="text-sm">All votes are submitted without paying gas fees via meta-transactions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Treasury Info */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
          }}
          className="border rounded-xl p-6 mt-6"
        >
          <h2 style={{ color: 'var(--text-primary)' }} className="font-playfair text-2xl font-bold mb-4">
            About Treasury
          </h2>
          <p style={{ color: 'var(--text-tertiary)' }} className="mb-3">
            The DAO Treasury is the collective fund that holds all deposited ETH. This fund is governed by the community through voting.
            Proposals can request withdrawals from the treasury for various purposes, and these withdrawals only happen if the proposal receives
            more votes in favor than against.
          </p>
          <p style={{ color: 'var(--text-tertiary)' }}>
            Your deposit represents your stake in the DAO and gives you voting power proportional to your balance.
            You can withdraw your funds at any time by submitting a withdrawal proposal.
          </p>
        </div>
      </div>
    </ConfigCheck>
  );
}
