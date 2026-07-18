'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { getSigner } from '@/lib/web3';
import { getDAOContract } from '@/lib/contracts';
import { createProposalDirect, getUserBalance } from '@/lib/daoHelpers';

interface CreateProposalProps {
  onProposalCreated: () => void;
}

export default function CreateProposal({ onProposalCreated }: CreateProposalProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('7'); // days
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple simultaneous submissions
    if (submitting) {
      console.log('⚠️ Transaction already in progress, ignoring duplicate submission');
      return;
    }
    
    setError('');
    setLoading(true);
    setSubmitting(true);

    try {
      const signer = await getSigner();
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      const userAddress = await signer.getAddress();

      // Check if user has enough balance in the DAO to create proposal
      const userBalanceInDAO = await getUserBalance(signer, userAddress);
      const daoContract = getDAOContract(signer);
      const contractBalance = await daoContract.getBalance();
      const requiredBalance = (contractBalance * BigInt(10)) / BigInt(100); // 10%

      if (userBalanceInDAO < requiredBalance) {
        throw new Error(
          `You need at least ${ethers.formatEther(requiredBalance)} ETH deposited in the DAO to create a proposal (10% of DAO balance). ` +
          `You currently have ${ethers.formatEther(userBalanceInDAO)} ETH deposited.`
        );
      }

      // Convert amount to wei
      const amountWei = ethers.parseEther(amount);

      // Convert duration from days to seconds
      const votingDuration = parseInt(duration) * 24 * 60 * 60;

      // Direct transaction (user pays gas)
      await createProposalDirect(
        signer,
        recipient,
        amountWei,
        votingDuration,
        description
      );

      alert('Proposal created successfully!');

      // Reset form
      setRecipient('');
      setAmount('');
      setDuration('7');
      setDescription('');

      // Notify parent
      onProposalCreated();
    } catch (err: unknown) {
      console.error('Error creating proposal:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create proposal';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-300 dark:border-gray-700 shadow-lg dark:shadow-2xl dark:shadow-gray-900/50 p-6 lg:p-8 transition-all duration-300">
      <h2 className="font-playfair text-2xl font-bold mb-6 dark:text-white">Create Proposal</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Amount (ETH)
            </label>
            <input
              type="number"
              step="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Duration (days)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the proposal objectives and expected outcomes..."
            required
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg flex gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-300">Error</h3>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || submitting}
          className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading || submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Creating Proposal...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Proposal
            </>
          )}
        </button>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 p-4 rounded-lg">
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">📋 Requirement</p>
          <p className="text-sm text-blue-800 dark:text-blue-400">
            You need at least 10% of the DAO contract balance to create a proposal.
          </p>
        </div>
      </form>
    </div>
  );
}
