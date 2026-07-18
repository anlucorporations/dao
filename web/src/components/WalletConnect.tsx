'use client';

import { useState, useEffect } from 'react';
import { connectWallet, getBalance, WindowWithEthereum } from '@/lib/web3';

declare const window: WindowWithEthereum;

export default function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already connected
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            loadBalance(accounts[0]);
          }
        });

      // Listen for account changes
      if (window.ethereum.on) {
        window.ethereum.on('accountsChanged', (accounts: unknown) => {
          const accountList = accounts as string[];
          if (accountList && accountList.length > 0) {
            setAccount(accountList[0]);
            loadBalance(accountList[0]);
          } else {
            setAccount(null);
            setBalance('0');
          }
        });
      }
    }
  }, []);

  const loadBalance = async (address: string) => {
    const bal = await getBalance(address);
    setBalance(bal);
  };

  const handleConnect = async () => {
    setLoading(true);
    const address = await connectWallet();
    if (address) {
      setAccount(address);
      await loadBalance(address);
    }
    setLoading(false);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex items-center gap-3">
      {account ? (
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <div className="text-sm">
              <div className="font-semibold text-gray-900 dark:text-white">{formatAddress(account)}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{parseFloat(balance).toFixed(4)} ETH</div>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}
