'use client';

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { getSigner, getProvider } from '@/lib/web3';
import { registerMemberDirect, depositDirect, checkIsMember } from '@/lib/daoHelpers';

interface MemberFinancialOverviewProps {
  account: string | null;
  isMember: boolean;
  userBalanceETH: string;
  walletBalanceETH?: string;
  totalDAOBalanceETH: string;
  onBalanceUpdated?: () => void;
  loading?: boolean;
}

export default function MemberFinancialOverview({
  account,
  isMember,
  userBalanceETH,
  walletBalanceETH = '0',
  totalDAOBalanceETH,
  onBalanceUpdated,
  loading = false
}: MemberFinancialOverviewProps) {
  const [depositAmount, setDepositAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const userBalanceNum = parseFloat(userBalanceETH) || 0;
  const totalBalanceNum = parseFloat(totalDAOBalanceETH) || 0;
  const participationPercentage = totalBalanceNum > 0 ? ((userBalanceNum / totalBalanceNum) * 100).toFixed(2) : '0.00';

  const handleRegister = async () => {
    setError(null);
    setSuccess(null);
    setActionLoading(true);

    try {
      const signer = await getSigner();
      if (!signer) throw new Error('Por favor conecta tu billetera MetaMask.');

      const addr = await signer.getAddress();
      const provider = getProvider();
      if (provider) {
        const alreadyMember = await checkIsMember(provider, addr);
        if (alreadyMember) {
          setSuccess('🎉 Tu billetera ya está inscrita y certificada como socio de la DAO.');
          if (onBalanceUpdated) onBalanceUpdated();
          return;
        }
      }

      await registerMemberDirect(signer);
      setSuccess('🎉 ¡Inscripción exitosa! Te has registrado como Socio Certificado con un depósito de 3 ETH.');
      if (onBalanceUpdated) onBalanceUpdated();
    } catch (err: unknown) {
      console.error('Error en inscripción:', err);
      const msg = err instanceof Error ? err.message : 'Fallo en la inscripción de socio.';
      
      if (msg.includes('ya esta inscrito') || msg.includes('ya está inscrito')) {
        setSuccess('🎉 Tu billetera ya se encuentra inscrita en la DAO.');
        if (onBalanceUpdated) onBalanceUpdated();
      } else {
        setError(msg);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setActionLoading(true);

    try {
      const signer = await getSigner();
      if (!signer) throw new Error('Por favor conecta tu billetera MetaMask.');
      if (!depositAmount || parseFloat(depositAmount) <= 0) {
        throw new Error('Ingresa un monto válido en ETH.');
      }

      const amountWei = ethers.parseEther(depositAmount);
      await depositDirect(signer, amountWei);

      setSuccess(`🎉 ¡Depósito adicional de ${depositAmount} ETH realizado exitosamente!`);
      setDepositAmount('');
      if (onBalanceUpdated) onBalanceUpdated();
    } catch (err: unknown) {
      console.error('Error en depósito adicional:', err);
      const msg = err instanceof Error ? err.message : 'Fallo el depósito de fondos.';
      setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-purple-950/40 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
              💳 Finanzas de la Billetera Conectada
            </h2>
            {/* Sello de Usuario Inscrito y Certificado */}
            {isMember && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold">
                🛡️ VERIFICADO & CERTIFICADO
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Resumen del saldo líquido de tu billetera y de tus aportes depositados en la DAO.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Billetera Conectada</span>
          <span className="font-mono text-xs text-white font-bold block">
            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'No Conectada'}
          </span>
          <span className="text-xs font-bold text-cyan-300 font-mono block">
            Saldo: {walletBalanceETH} ETH
          </span>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Member Metric Cards (4 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Líquido de la Billetera Conectada */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-1 shadow-lg shadow-cyan-500/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Saldo Billetera (MetaMask)</span>
          <div className="text-2xl font-extrabold text-cyan-300">
            {loading ? '...' : `${walletBalanceETH} ETH`}
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Balance disponible en la wallet</p>
        </div>

        {/* Card 2: Fondo Depositado en la DAO */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Total ETH Aportado en DAO</span>
          <div className="text-2xl font-extrabold text-white">
            {loading ? '...' : `${userBalanceETH} ETH`}
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Fondo personal custodiado por DAO</p>
        </div>

        {/* Card 3: Porcentaje de Ponderación */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">Porcentaje de Ponderación</span>
          <div className="text-2xl font-extrabold text-pink-300">
            {loading ? '...' : `${participationPercentage}%`}
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Participación relativa en tesorería</p>
        </div>

        {/* Card 4: Estado de Membresía */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Estado de Membresía</span>
          <div className="text-sm font-extrabold text-white mt-1">
            {isMember ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Socio Activo Certificado
              </span>
            ) : (
              <span className="text-amber-400">Pendiente de Inscripción</span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Cuota fija de 3 ETH</p>
        </div>
      </div>

      {/* Financial Action Forms */}
      {!isMember ? (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Inscripción Obligatoria de Socio</h4>
              <p className="text-xs text-slate-400">Deposita exactamente 3 ETH para certificarte como socio activo de la DAO.</p>
            </div>
            <span className="text-sm font-extrabold text-cyan-300 font-mono">3.00 ETH</span>
          </div>

          <button
            onClick={handleRegister}
            disabled={actionLoading}
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-400 shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {actionLoading ? (
              <span>Procesando Inscripción en Blockchain...</span>
            ) : (
              <>
                <span>🛡️ Realizar Inscripción (3.0 ETH)</span>
                <span>→</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <form onSubmit={handleDeposit} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Aportar ETH Adicional a la Tesorería</h4>
            <p className="text-xs text-slate-400">Como socio certificado, puedes incrementar tu balance depositando ETH a la DAO.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Ej: 0.5 ETH"
              required
              className="flex-1 w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
            />

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 shrink-0"
            >
              {actionLoading ? 'Procesando...' : '💰 Depositar ETH'}
            </button>
          </div>
        </form>
      )}

      {/* Transaction History Snippet */}
      <div className="pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Historial de Transacciones Financieras del Socio</h4>
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
          {isMember ? (
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-emerald-400 font-semibold">✓ Inscripción de Socio Certificado (Cuota Fija)</span>
              <span className="font-mono text-white font-bold">+3.00 ETH</span>
            </div>
          ) : null}
          {userBalanceNum > 3 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-cyan-400 font-semibold">+ Depósitos Adicionales Realizados</span>
              <span className="font-mono text-white font-bold">+{(userBalanceNum - 3).toFixed(4)} ETH</span>
            </div>
          ) : null}
          {!isMember && userBalanceNum === 0 ? (
            <div className="text-center text-slate-500 py-2">No hay transacciones registradas todavía.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
