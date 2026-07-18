'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getProvider, getSigner } from '@/lib/web3';
import { getDAOBalance, getUserBalance as getUserBalanceHelper, getProposalCount as getProposalCountHelper, depositDirect } from '@/lib/daoHelpers';

export default function DAOStats() {
  const [balance, setBalance] = useState('0');
  const [userBalance, setUserBalance] = useState('0');
  const [proposalCount, setProposalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [depositing, setDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [userAddress, setUserAddress] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const provider = getProvider();
      if (!provider) {
        setLoading(false);
        return;
      }

      const bal = await getDAOBalance(provider);
      const count = await getProposalCountHelper(provider);

      setBalance(ethers.formatEther(bal));
      setProposalCount(Number(count));

      // Get user's balance in the DAO
      try {
        const signer = await getSigner();
        if (signer) {
          const address = await signer.getAddress();
          setUserAddress(address);
          const userBal = await getUserBalanceHelper(provider, address);
          setUserBalance(ethers.formatEther(userBal));
        }
      } catch {
        // User not connected, it's ok
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositing(true);

    try {
      const signer = await getSigner();
      if (!signer) {
        alert('Please connect your wallet');
        return;
      }

      const amountWei = ethers.parseEther(depositAmount);
      await depositDirect(signer, amountWei);

      alert('Deposit successful!');
      setDepositAmount('');
      await loadStats();
    } catch (err: unknown) {
      console.error('Error depositing:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to deposit';
      alert(errorMessage);
    } finally {
      setDepositing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
        <h2 className="font-playfair text-2xl font-bold mb-6 dark:text-white">DAO Treasury</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400" />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        boxShadow: `0 10px 15px var(--card-shadow)`,
        color: 'var(--text-primary)',
      }}
      className="rounded-xl border p-6 space-y-6 transition-all duration-300"
    >
      <h2 className="font-playfair text-2xl font-bold dark:text-white">DAO Treasury</h2>

      <div className="grid grid-cols-2 gap-4">
        <div
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'var(--accent-blue)',
            color: 'var(--accent-blue)',
          }}
          className="p-5 rounded-lg border"
        >
          <div style={{ color: 'var(--text-tertiary)' }} className="text-xs font-semibold uppercase tracking-wide mb-2">
            Treasury Balance
          </div>
          <div className="text-3xl font-bold">{parseFloat(balance).toFixed(4)}</div>
          <div style={{ color: 'var(--text-tertiary)' }} className="text-xs mt-1">
            ETH
          </div>
        </div>
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: 'var(--accent-green)',
            color: 'var(--accent-green)',
          }}
          className="p-5 rounded-lg border"
        >
          <div style={{ color: 'var(--text-tertiary)' }} className="text-xs font-semibold uppercase tracking-wide mb-2">
            Proposals
          </div>
          <div className="text-3xl font-bold">{proposalCount}</div>
          <div style={{ color: 'var(--text-tertiary)' }} className="text-xs mt-1">
            Active
          </div>
        </div>
      </div>

      {userAddress && (
        <div
          style={{
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            borderColor: 'var(--accent-purple)',
            color: 'var(--accent-purple)',
          }}
          className="p-5 rounded-lg border"
        >
          <div style={{ color: 'var(--text-tertiary)' }} className="text-xs font-semibold uppercase tracking-wide mb-2">
            Your Balance
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold">{parseFloat(userBalance).toFixed(4)}</div>
            <div className="text-sm font-semibold">
              {parseFloat(balance) > 0
                ? `${((parseFloat(userBalance) / parseFloat(balance)) * 100).toFixed(2)}%`
                : '0%'}
            </div>
          </div>
          <div style={{ color: 'var(--text-tertiary)' }} className="text-xs mt-2">
            ETH of total
          </div>
        </div>
      )}

      <form onSubmit={handleDeposit} className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Deposit ETH to Treasury
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.001"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.0"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 font-medium">
              ETH
            </span>
          </div>
        </div>
        <button
          type="submit"
          disabled={depositing}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {depositing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Depositing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Deposit to DAO
            </>
          )}
        </button>
        <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
          💡 Depositing ETH allows you to participate in voting (requires minimum balance to create proposals)
        </p>
      </form>
    </div>
  );
}
