'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getProvider, getSigner } from '@/lib/web3';
import { getDAOBalance, getUserBalance as getUserBalanceHelper, getProposalCount as getProposalCountHelper, depositDirect, checkIsMember } from '@/lib/daoHelpers';

export default function DAOStats() {
  const [balance, setBalance] = useState('0');
  const [userBalance, setUserBalance] = useState('0');
  const [proposalCount, setProposalCount] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [depositing, setDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [userAddress, setUserAddress] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 8000);
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

      try {
        const signer = await getSigner();
        if (signer) {
          const address = await signer.getAddress();
          setUserAddress(address);
          const userBal = await getUserBalanceHelper(provider, address);
          setUserBalance(ethers.formatEther(userBal));
          const member = await checkIsMember(provider, address);
          setIsMember(member);
        }
      } catch {
        // Usuario no conectado
      }

      setLoading(false);
    } catch (error) {
      console.error('Error al cargar estadísticas de la DAO:', error);
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    setDepositing(true);

    try {
      const signer = await getSigner();
      if (!signer) {
        alert('Por favor conecta tu billetera');
        return;
      }

      const amountWei = ethers.parseEther(depositAmount);
      await depositDirect(signer, amountWei);

      alert('¡Depósito realizado exitosamente!');
      setDepositAmount('');
      await loadStats();
    } catch (err: unknown) {
      console.error('Error en depósito:', err);
      const errorMessage = err instanceof Error ? err.message : 'Fallo el depósito';
      alert(errorMessage);
    } finally {
      setDepositing(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-3xl border border-purple-500/20 text-center animate-pulse">
        <p className="text-slate-400 text-sm">Cargando métricas de la Tesorería...</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-7 rounded-3xl border border-purple-500/30 bg-slate-900/80 backdrop-blur-xl shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300">
          Tesorería & Métricas DAO
        </h2>
        {userAddress && (
          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
            isMember
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}>
            {isMember ? '✓ Socio Activo' : '⚠ No Inscrito'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/30">
          <div className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
            Balance Tesorería
          </div>
          <div className="text-2xl font-extrabold text-white">
            {parseFloat(balance).toFixed(4)} <span className="text-xs font-normal text-purple-300">ETH</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
            Propuestas Totales
          </div>
          <div className="text-2xl font-extrabold text-white">
            {proposalCount} <span className="text-xs font-normal text-cyan-300">Propuestas</span>
          </div>
        </div>
      </div>

      {userAddress && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider">Tu Depósito en Tesorería</span>
            <span className="font-extrabold text-emerald-400 text-sm">{parseFloat(userBalance).toFixed(4)} ETH</span>
          </div>

          <form onSubmit={handleDeposit} className="flex gap-2">
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Depósito opcional (ETH)"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={depositing || !depositAmount}
              className="px-4 py-2 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-50"
            >
              {depositing ? 'Depositando...' : 'Depositar'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
