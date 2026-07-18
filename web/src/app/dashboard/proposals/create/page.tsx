'use client';

import { useRouter } from 'next/navigation';
import ConfigCheck from '@/components/ConfigCheck';
import CreateProposal from '@/components/CreateProposal';

export default function CreateProposalPage() {
  const router = useRouter();

  const handleProposalCreated = () => {
    // Redirect to proposals page after creation
    router.push('/dashboard/proposals');
  };

  return (
    <ConfigCheck>
      <div style={{ color: 'var(--text-primary)' }} className="transition-colors duration-300">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-3">✍️ Create Proposal</h1>
          <p style={{ color: 'var(--text-tertiary)' }} className="text-lg">
            Submit a new proposal to the DAO for voting. Proposals request fund allocation and require community approval.
          </p>
        </div>

        {/* Create Proposal Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <CreateProposal onProposalCreated={handleProposalCreated} />
          </div>

          {/* Guidelines */}
          <div className="space-y-6">
            {/* Good Practices */}
            <div
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
                boxShadow: `0 10px 15px var(--card-shadow)`,
              }}
              className="border rounded-xl p-6 transition-colors duration-300"
            >
              <h2 style={{ color: 'var(--text-primary)' }} className="font-playfair text-xl font-bold mb-4">
                Best Practices
              </h2>
              <ul style={{ color: 'var(--text-tertiary)' }} className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Be clear and specific about the proposal purpose</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Include implementation details</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Request reasonable amounts</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Set appropriate voting duration</span>
                </li>
              </ul>
            </div>

            {/* Requirements */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
              className="border rounded-xl p-6"
            >
              <h3 style={{ color: 'var(--text-primary)' }} className="font-bold mb-3">
                Requirements
              </h3>
              <p style={{ color: 'var(--text-tertiary)' }} className="text-sm">
                You must hold at least <strong>10% of DAO balance</strong> to create a proposal. This ensures quality and discourages spam.
              </p>
            </div>

            {/* Voting Process */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
              className="border rounded-xl p-6"
            >
              <h3 style={{ color: 'var(--text-primary)' }} className="font-bold mb-3">
                Voting Process
              </h3>
              <div style={{ color: 'var(--text-tertiary)' }} className="text-sm space-y-2">
                <p>1. Community members vote FOR or AGAINST</p>
                <p>2. Voting ends at the deadline you set</p>
                <p>3. If votes FOR {'>'} votes AGAINST, proposal is approved</p>
                <p>4. Approved proposals execute automatically</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConfigCheck>
  );
}
