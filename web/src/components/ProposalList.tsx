'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getProvider, getSigner } from '@/lib/web3';
import { VoteType, Proposal } from '@/lib/contracts';
import { voteDirect, getProposalCount, getProposal, getUserVote } from '@/lib/daoHelpers';

interface ProposalWithVote extends Proposal {
  userVote?: number;
}

export default function ProposalList() {
  const [proposals, setProposals] = useState<ProposalWithVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingProposal, setVotingProposal] = useState<number | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [blockchainTime, setBlockchainTime] = useState<number>(0);

  useEffect(() => {
    loadProposals();
    const interval = setInterval(loadProposals, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadProposals = async () => {
    try {
      const provider = getProvider();
      if (!provider) {
        console.error('No provider available');
        setLoading(false);
        return;
      }

      console.log('Loading proposals...');

      // Get current blockchain timestamp FIRST
      try {
        // Force fresh block by getting block number first, then fetching that specific block
        const blockNumber = await provider.getBlockNumber();
        console.log('Current block number:', blockNumber);

        const latestBlock = await provider.getBlock(blockNumber);
        console.log('Latest block:', latestBlock);
        if (latestBlock) {
          const timestamp = Number(latestBlock.timestamp);
          console.log('Blockchain timestamp (number):', timestamp);
          console.log('Blockchain time:', new Date(timestamp * 1000).toLocaleString());
          setBlockchainTime(timestamp);
        } else {
          console.error('Latest block is null');
        }
      } catch (error) {
        console.error('Error getting latest block:', error);
      }

      const count = await getProposalCount(provider);
      const proposalsList: ProposalWithVote[] = [];

      // Get user address if connected
      let currentUserAddress: string | null = null;
      try {
        const signer = await getSigner();
        if (signer) {
          currentUserAddress = await signer.getAddress();
          setUserAddress(currentUserAddress);
        }
      } catch {
        // User not connected
      }

      for (let i = 1; i <= count; i++) {
        const proposal = await getProposal(provider, i);

        // Get user's vote if connected
        let userVote: number | undefined = undefined;
        if (currentUserAddress) {
          try {
            const vote = await getUserVote(provider, i, currentUserAddress);
            userVote = Number(vote);
          } catch {
            // Error getting vote, skip
          }
        }

        proposalsList.push({
          id: proposal[0],
          recipient: proposal[1],
          amount: proposal[2],
          votingDeadline: proposal[3],
          executionDelay: proposal[4],
          executed: proposal[5],
          forVotes: proposal[6],
          againstVotes: proposal[7],
          abstainVotes: proposal[8],
          description: proposal[9],
          userVote,
        });
      }

      setProposals(proposalsList.reverse()); // Show newest first
      setLoading(false);
    } catch (error) {
      console.error('Error loading proposals:', error);
      setLoading(false);
    }
  };

  const handleVote = async (proposalId: number, voteType: VoteType) => {
    setVotingProposal(proposalId);

    try {
      const signer = await getSigner();
      if (!signer) {
        alert('Please connect your wallet');
        return;
      }

      // Direct transaction (user pays gas)
      await voteDirect(signer, proposalId, voteType);
      alert('Vote submitted successfully!');

      // Reload proposals
      setTimeout(loadProposals, 2000);
    } catch (err: unknown) {
      console.error('Error voting:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to vote';
      alert(errorMessage);
    } finally {
      setVotingProposal(null);
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const getProposalStatus = (proposal: Proposal) => {
    const now = blockchainTime > 0 ? blockchainTime : Math.floor(Date.now() / 1000);
    if (proposal.executed) return 'Executed';
    if (now < Number(proposal.votingDeadline)) return 'Active';
    if (proposal.forVotes > proposal.againstVotes) return 'Approved';
    return 'Rejected';
  };

  const canVote = (proposal: Proposal) => {
    const now = blockchainTime > 0 ? blockchainTime : Math.floor(Date.now() / 1000);
    return now < Number(proposal.votingDeadline) && !proposal.executed;
  };

  const getVoteTypeLabel = (voteType: number) => {
    switch (voteType) {
      case 0: return { label: 'Abstain', color: 'text-gray-600 dark:text-gray-400' };
      case 1: return { label: 'For', color: 'text-green-600 dark:text-green-400' };
      case 2: return { label: 'Against', color: 'text-red-600 dark:text-red-400' };
      default: return { label: 'Unknown', color: 'text-gray-600 dark:text-gray-400' };
    }
  };

  const getTimeRemaining = (deadline: bigint) => {
    if (blockchainTime === 0) return '';

    const remaining = Number(deadline) - blockchainTime;
    if (remaining <= 0) return 'Ended';

    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          boxShadow: `0 10px 15px var(--card-shadow)`,
        }}
        className="border rounded-xl p-8 transition-colors duration-300"
      >
        <h2 style={{ color: 'var(--text-primary)' }} className="font-playfair text-3xl font-bold mb-6">
          Active Proposals
        </h2>
        <div style={{ color: 'var(--text-tertiary)' }} className="text-center py-12 text-lg">
          Loading proposals...
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: 'var(--text-primary)' }} className="transition-colors duration-300">
      {blockchainTime > 0 && (
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
          }}
          className="border rounded-lg p-4 mb-8"
        >
          <div style={{ color: 'var(--text-secondary)' }} className="flex items-center justify-between">
            <span className="font-semibold">⏰ Blockchain Time:</span>
            <div className="text-right">
              <div style={{ color: 'var(--accent-blue)' }} className="font-mono font-semibold">
                {formatDate(BigInt(blockchainTime))}
              </div>
              <div style={{ color: 'var(--text-tertiary)' }} className="text-xs mt-1">
                (Timestamp: {blockchainTime})
              </div>
            </div>
          </div>
        </div>
      )}

      {proposals.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            boxShadow: `0 10px 15px var(--card-shadow)`,
          }}
          className="border rounded-xl p-12 text-center transition-colors duration-300"
        >
          <div style={{ color: 'var(--text-tertiary)' }} className="text-lg">
            No proposals yet. Create the first one! 🚀
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {proposals.map((proposal) => {
            const status = getProposalStatus(proposal);
            const totalVotes =
              Number(proposal.forVotes) +
              Number(proposal.againstVotes) +
              Number(proposal.abstainVotes);
            const forPercentage =
              totalVotes > 0
                ? (Number(proposal.forVotes) / totalVotes * 100).toFixed(1)
                : '0';
            const againstPercentage =
              totalVotes > 0
                ? (Number(proposal.againstVotes) / totalVotes * 100).toFixed(1)
                : '0';
            const abstainPercentage =
              totalVotes > 0
                ? (Number(proposal.abstainVotes) / totalVotes * 100).toFixed(1)
                : '0';

            return (
              <div
                key={proposal.id.toString()}
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                  boxShadow: `0 10px 15px var(--card-shadow)`,
                }}
                className="border rounded-xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6 pb-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)' }} className="font-playfair text-2xl lg:text-3xl font-bold mb-3">
                      Proposal #{proposal.id.toString()}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span
                        style={{
                          backgroundColor:
                            status === 'Active'
                              ? 'rgba(59, 130, 246, 0.1)'
                              : status === 'Approved'
                                ? 'rgba(16, 185, 129, 0.1)'
                                : status === 'Executed'
                                  ? 'rgba(107, 114, 128, 0.1)'
                                  : 'rgba(239, 68, 68, 0.1)',
                          color:
                            status === 'Active'
                              ? 'var(--accent-blue)'
                              : status === 'Approved'
                                ? 'var(--accent-green)'
                                : status === 'Executed'
                                  ? 'var(--text-tertiary)'
                                  : 'var(--accent-red)',
                          borderColor:
                            status === 'Active'
                              ? 'var(--accent-blue)'
                              : status === 'Approved'
                                ? 'var(--accent-green)'
                                : status === 'Executed'
                                  ? 'var(--border-primary)'
                                  : 'var(--accent-red)',
                        }}
                        className="px-4 py-2 text-sm font-semibold rounded-lg border-2"
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div style={{ color: 'var(--accent-blue)' }} className="font-playfair text-2xl lg:text-3xl font-bold">
                      {ethers.formatEther(proposal.amount)} ETH
                    </div>
                    <div style={{ color: 'var(--text-tertiary)' }} className="text-sm mt-2">
                      to {proposal.recipient.slice(0, 12)}...
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p style={{ color: 'var(--text-secondary)' }} className="text-lg leading-relaxed mb-6">
                  {proposal.description}
                </p>

                {/* Vote Statistics */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 style={{ color: 'var(--text-primary)' }} className="font-bold text-lg">
                      Vote Statistics
                    </h4>
                    <span style={{ color: 'var(--accent-blue)' }} className="font-semibold text-lg">
                      Total: {totalVotes}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* For */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ color: 'var(--accent-green)' }} className="font-semibold text-base">
                          ✓ For
                        </span>
                        <span style={{ color: 'var(--accent-green)' }} className="font-semibold text-base">
                          {proposal.forVotes.toString()} ({forPercentage}%)
                        </span>
                      </div>
                      <div
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                        className="w-full rounded-full h-3"
                      >
                        <div
                          style={{
                            backgroundColor: 'var(--accent-green)',
                            width: `${forPercentage}%`,
                          }}
                          className="h-3 rounded-full transition-all"
                        ></div>
                      </div>
                    </div>

                    {/* Against */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ color: 'var(--accent-red)' }} className="font-semibold text-base">
                          ✗ Against
                        </span>
                        <span style={{ color: 'var(--accent-red)' }} className="font-semibold text-base">
                          {proposal.againstVotes.toString()} ({againstPercentage}%)
                        </span>
                      </div>
                      <div
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                        className="w-full rounded-full h-3"
                      >
                        <div
                          style={{
                            backgroundColor: 'var(--accent-red)',
                            width: `${againstPercentage}%`,
                          }}
                          className="h-3 rounded-full transition-all"
                        ></div>
                      </div>
                    </div>

                    {/* Abstain */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ color: 'var(--text-tertiary)' }} className="font-semibold text-base">
                          — Abstain
                        </span>
                        <span style={{ color: 'var(--text-tertiary)' }} className="font-semibold text-base">
                          {proposal.abstainVotes.toString()} ({abstainPercentage}%)
                        </span>
                      </div>
                      <div
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                        className="w-full rounded-full h-3"
                      >
                        <div
                          style={{
                            backgroundColor: 'var(--text-light)',
                            width: `${abstainPercentage}%`,
                          }}
                          className="h-3 rounded-full transition-all"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)',
                  }}
                  className="border rounded-lg p-4 mb-6 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">
                      ⏱️ Voting ends:
                    </span>
                    <div className="text-right">
                      <div style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">
                        {formatDate(proposal.votingDeadline)}
                      </div>
                      {getTimeRemaining(proposal.votingDeadline) && (
                        <div style={{ color: 'var(--accent-blue)' }} className="font-bold text-sm mt-1">
                          {getTimeRemaining(proposal.votingDeadline)}
                        </div>
                      )}
                    </div>
                  </div>

                  {status === 'Approved' && (
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">
                        ✓ Can execute after:
                      </span>
                      <div className="text-right">
                        <div style={{ color: 'var(--text-primary)' }} className="font-semibold text-sm">
                          {formatDate(proposal.executionDelay)}
                        </div>
                        {getTimeRemaining(proposal.executionDelay) && (
                          <div style={{ color: 'var(--accent-green)' }} className="font-bold text-sm mt-1">
                            {getTimeRemaining(proposal.executionDelay)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Vote */}
                {userAddress && proposal.userVote !== undefined && (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                    }}
                    className="border rounded-lg p-4 mb-6"
                  >
                    <div className="flex items-center gap-3">
                      <span style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">
                        Your vote:
                      </span>
                      <span
                        style={{ color: getVoteTypeLabel(proposal.userVote).color }}
                        className="font-bold text-lg"
                      >
                        {getVoteTypeLabel(proposal.userVote).label}
                      </span>
                    </div>
                  </div>
                )}

                {/* Vote Buttons */}
                {canVote(proposal) && (
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleVote(Number(proposal.id), VoteType.FOR)}
                      disabled={votingProposal === Number(proposal.id)}
                      style={{
                        backgroundColor: 'var(--accent-green)',
                      }}
                      className="px-4 py-3 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity text-base"
                    >
                      {votingProposal === Number(proposal.id) ? '...' : 'Vote For'}
                    </button>
                    <button
                      onClick={() => handleVote(Number(proposal.id), VoteType.AGAINST)}
                      disabled={votingProposal === Number(proposal.id)}
                      style={{
                        backgroundColor: 'var(--accent-red)',
                      }}
                      className="px-4 py-3 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity text-base"
                    >
                      {votingProposal === Number(proposal.id) ? '...' : 'Vote Against'}
                    </button>
                    <button
                      onClick={() => handleVote(Number(proposal.id), VoteType.ABSTAIN)}
                      disabled={votingProposal === Number(proposal.id)}
                      style={{
                        backgroundColor: 'var(--text-tertiary)',
                      }}
                      className="px-4 py-3 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity text-base"
                    >
                      {votingProposal === Number(proposal.id) ? '...' : 'Abstain'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
