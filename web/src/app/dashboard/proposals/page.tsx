'use client';

import { useEffect } from 'react';
import ConfigCheck from '@/components/ConfigCheck';
import ProposalList from '@/components/ProposalList';
import { startDaemon } from '@/lib/daemon';

export default function ProposalsPage() {

  useEffect(() => {
    // Start the daemon to monitor proposals
    startDaemon(60000); // Check every 60 seconds
  }, []);

  return (
    <ConfigCheck>
      <div style={{ color: 'var(--text-primary)' }} className="transition-colors duration-300">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-3">📋 Active Proposals</h1>
          <p style={{ color: 'var(--text-tertiary)' }} className="text-lg">
            View all active proposals and cast your votes. Each vote is gasless and secured with EIP-2771 meta-transactions.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
              boxShadow: `0 10px 15px var(--card-shadow)`,
            }}
            className="border rounded-xl p-6 transition-colors duration-300"
          >
            <div style={{ color: 'var(--accent-blue)' }} className="text-3xl mb-2">
              🗳️
            </div>
            <h3 style={{ color: 'var(--text-primary)' }} className="font-bold mb-1">
              Vote Now
            </h3>
            <p style={{ color: 'var(--text-tertiary)' }} className="text-sm">
              Cast your vote on active proposals without paying gas fees
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
              boxShadow: `0 10px 15px var(--card-shadow)`,
            }}
            className="border rounded-xl p-6 transition-colors duration-300"
          >
            <div style={{ color: 'var(--accent-green)' }} className="text-3xl mb-2">
              ⚡
            </div>
            <h3 style={{ color: 'var(--text-primary)' }} className="font-bold mb-1">
              Gasless Voting
            </h3>
            <p style={{ color: 'var(--text-tertiary)' }} className="text-sm">
              No transaction fees - all votes are processed via meta-transactions
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
              boxShadow: `0 10px 15px var(--card-shadow)`,
            }}
            className="border rounded-xl p-6 transition-colors duration-300"
          >
            <div style={{ color: 'var(--accent-purple)' }} className="text-3xl mb-2">
              🔐
            </div>
            <h3 style={{ color: 'var(--text-primary)' }} className="font-bold mb-1">
              Secure & Transparent
            </h3>
            <p style={{ color: 'var(--text-tertiary)' }} className="text-sm">
              All votes are cryptographically signed and verified on-chain
            </p>
          </div>
        </div>

        {/* Proposals List */}
        <div>
          <ProposalList />
        </div>

        {/* Voting Guide */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
          }}
          className="border rounded-xl p-8 mt-12"
        >
          <h2 style={{ color: 'var(--text-primary)' }} className="font-playfair text-2xl font-bold mb-6">
            How to Vote
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 style={{ color: 'var(--accent-blue)' }} className="font-bold mb-2">
                1. Review Proposal
              </h3>
              <p style={{ color: 'var(--text-tertiary)' }} className="text-sm">
                Read the proposal details, including recipient address, amount, and description
              </p>
            </div>
            <div>
              <h3 style={{ color: 'var(--accent-green)' }} className="font-bold mb-2">
                2. Make Your Choice
              </h3>
              <p style={{ color: 'var(--text-tertiary)' }} className="text-sm">
                Click FOR, AGAINST, or ABSTAIN based on your preference. You can change your vote anytime before deadline
              </p>
            </div>
            <div>
              <h3 style={{ color: 'var(--accent-purple)' }} className="font-bold mb-2">
                3. Sign & Submit
              </h3>
              <p style={{ color: 'var(--text-tertiary)' }} className="text-sm">
                Sign the message in your wallet. No gas fees required thanks to meta-transactions
              </p>
            </div>
          </div>
        </div>
      </div>
    </ConfigCheck>
  );
}
