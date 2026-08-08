'use client';

import React, { useState, useEffect } from 'react';
import { connectWallet, getBalance, WindowWithEthereum } from '@/lib/web3';

declare const window: WindowWithEthereum;

export default function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            loadBalance(accounts[0]);
          }
        });

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
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/40 shadow-lg shadow-purple-900/20 backdrop-blur-lg">
          <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          <div className="text-xs">
            <div className="font-extrabold text-white font-mono">{formatAddress(account)}</div>
            <div className="text-[11px] font-semibold text-cyan-300">{parseFloat(balance).toFixed(4)} ETH</div>
          </div>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-400 text-white rounded-2xl font-bold text-xs shadow-xl shadow-purple-600/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>{loading ? 'Conectando...' : 'Conectar Billetera'}</span>
        </button>
      )}
    </div>
  );
}
