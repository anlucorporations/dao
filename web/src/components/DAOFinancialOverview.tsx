'use client';

import React from 'react';
import { ethers } from 'ethers';

interface DAOFinancialOverviewProps {
  totalTreasuryBalance: string; // Balance actual de la tesorería en ETH
  totalIngresos: string;       // Total acumulado ingresado
  totalEgresos: string;        // Total desembolsado por propuestas ejecutadas
  gasSavedETH: string;         // Estimado de gas financiado por Relayer EIP-2771
  memberCount: number;         // Número de socios certificados
  proposalCount: number;       // Propuestas registradas
  loading?: boolean;
}

export default function DAOFinancialOverview({
  totalTreasuryBalance,
  totalIngresos,
  totalEgresos,
  gasSavedETH,
  memberCount,
  proposalCount,
  loading = false
}: DAOFinancialOverviewProps) {
  return (
    <div className="glass-card p-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-cyan-950/30 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Component Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
            📊 Finanzas Generales de la DAO
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Estado patrimonial global, flujo de ingresos, egresos y optimización de comisiones en la blockchain.
          </p>
        </div>
        <div className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold shrink-0">
          Tesorería Pública
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm animate-pulse">
          Cargando balance financiero de la DAO...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Balance General de Tesorería */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Balance General Actual</span>
              <div className="text-2xl font-extrabold text-white">
                {parseFloat(totalTreasuryBalance).toFixed(4)} <span className="text-xs text-cyan-300">ETH</span>
              </div>
              <p className="text-[10px] text-slate-500">Disponible en Smart Contract</p>
            </div>

            {/* Balance de Ingresos */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Total Ingresos (Cuotas & Aportes)</span>
              <div className="text-2xl font-extrabold text-white">
                +{parseFloat(totalIngresos).toFixed(4)} <span className="text-xs text-emerald-300">ETH</span>
              </div>
              <p className="text-[10px] text-slate-500">{memberCount} socio(s) inscritos (3 ETH c/u)</p>
            </div>

            {/* Balance de Egresos */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Total Egresos (Desembolsos)</span>
              <div className="text-2xl font-extrabold text-white">
                -{parseFloat(totalEgresos).toFixed(4)} <span className="text-xs text-rose-300">ETH</span>
              </div>
              <p className="text-[10px] text-slate-500">Financiamiento por propuestas</p>
            </div>

            {/* Comisiones de Gas Ahorradas / Relayer */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Gas Cancelado / Ahorrado</span>
              <div className="text-2xl font-extrabold text-white">
                ⚡ ~{parseFloat(gasSavedETH).toFixed(4)} <span className="text-xs text-purple-300">ETH</span>
              </div>
              <p className="text-[10px] text-slate-500">Relayer Meta-Tx EIP-2771</p>
            </div>
          </div>

          {/* Governance Stats Row */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏛️</span>
              <div>
                <span className="font-bold text-white">Contrato DAO:</span>{' '}
                <span className="text-slate-400 font-mono">Total de Socios Certificados ({memberCount})</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <div>
                <span className="font-bold text-white">Propuestas Evaluadas:</span>{' '}
                <span className="text-slate-400">{proposalCount} registro(s) históricos</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <div>
                <span className="font-bold text-white">Protocolo de Red:</span>{' '}
                <span className="text-purple-300">Meta-transacciones Sin Gas</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
