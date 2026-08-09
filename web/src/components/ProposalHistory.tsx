'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getProvider, getSigner } from '@/lib/web3';
import { Proposal } from '@/lib/contracts';
import { getProposalCount, getProposal, executeProposalDirect, getUserVote } from '@/lib/daoHelpers';
import ProposalDetailModal from './ProposalDetailModal';

interface ProposalWithVote extends Proposal {
  userVote?: number;
}

interface ProposalHistoryProps {
  onSelectProposal?: (proposal: ProposalWithVote) => void;
}

export default function ProposalHistory({ onSelectProposal }: ProposalHistoryProps) {
  const [proposals, setProposals] = useState<ProposalWithVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'executed' | 'approved_pending' | 'rejected'>('all');
  const [executingId, setExecutingId] = useState<number | null>(null);
  const [blockchainTime, setBlockchainTime] = useState<number>(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<ProposalWithVote | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const provider = getProvider();
      if (!provider) {
        setLoading(false);
        return;
      }

      try {
        const blockNumber = await provider.getBlockNumber();
        const latestBlock = await provider.getBlock(blockNumber);
        if (latestBlock) {
          setBlockchainTime(Number(latestBlock.timestamp));
        }
      } catch (err) {
        console.error('Error al obtener timestamp de blockchain:', err);
      }

      let currentUserAddress: string | null = null;
      try {
        const signer = await getSigner();
        if (signer) {
          currentUserAddress = await signer.getAddress();
        }
      } catch {
        // Billetera no conectada
      }

      const count = await getProposalCount(provider);
      const historyList: ProposalWithVote[] = [];

      const now = blockchainTime > 0 ? blockchainTime : Math.floor(Date.now() / 1000);

      for (let i = 1; i <= Number(count); i++) {
        const p = await getProposal(provider, i);
        const deadline = Number(p.votingDeadline);
        const executed = p.executed;
        const rejected = p.rejected;

        if (executed || rejected || now >= deadline) {
          let userVote: number | undefined = undefined;
          if (currentUserAddress) {
            try {
              const vote = await getUserVote(provider, i, currentUserAddress);
              userVote = Number(vote);
            } catch {
              // sin voto
            }
          }

          historyList.push({
            ...p,
            userVote
          });
        }
      }

      setProposals(historyList.reverse());
    } catch (error) {
      console.error('Error al cargar histórico de propuestas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async (proposalId: number) => {
    setExecutingId(proposalId);
    setNotification(null);

    try {
      const signer = await getSigner();
      if (!signer) throw new Error('Conecta tu billetera para ejecutar la propuesta.');

      await executeProposalDirect(signer, proposalId);
      setNotification({ type: 'success', message: '🚀 ¡Propuesta ejecutada y fondos desembolsados exitosamente!' });
      setTimeout(loadHistory, 1500);
    } catch (err: unknown) {
      console.error('Error al ejecutar propuesta:', err);
      const msg = err instanceof Error ? err.message : 'Falló la ejecución de la propuesta.';
      setNotification({ type: 'error', message: msg });
    } finally {
      setExecutingId(null);
    }
  };

  const handleOpenDetail = (prop: ProposalWithVote) => {
    if (onSelectProposal) {
      onSelectProposal(prop);
    } else {
      setSelectedDetail(prop);
    }
  };

  const totalExecuted = proposals.filter((p) => p.executed);
  const totalETHDisbursed = totalExecuted.reduce((acc, p) => acc + BigInt(p.amount), BigInt(0));
  
  const nowTime = blockchainTime > 0 ? blockchainTime : Math.floor(Date.now() / 1000);
  const pendingExecution = proposals.filter(
    (p) => !p.executed && nowTime >= Number(p.votingDeadline) && p.forVotes > p.againstVotes
  );
  const rejectedCount = proposals.filter(
    (p) => !p.executed && nowTime >= Number(p.votingDeadline) && p.forVotes <= p.againstVotes
  ).length;

  const filteredProposals = proposals.filter((p) => {
    if (filter === 'executed') return p.executed;
    if (filter === 'approved_pending') return !p.executed && nowTime >= Number(p.votingDeadline) && p.forVotes > p.againstVotes;
    if (filter === 'rejected') return !p.executed && nowTime >= Number(p.votingDeadline) && p.forVotes <= p.againstVotes;
    return true;
  });

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Component Header & Stats Bar */}
      <div className="glass-card p-8 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-purple-950/40 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300">
              📜 Histórico Completo de Propuestas
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Haz clic en cualquier propuesta histórica para desplegar la ficha de información detallada.
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-extrabold shrink-0">
            Registro Histórico Inmutable
          </div>
        </div>

        {/* Global Historical Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Concluidas</span>
            <div className="text-2xl font-extrabold text-white">{proposals.length}</div>
            <p className="text-[10px] text-slate-500">Propuestas evaluadas</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Ejecutadas con Éxito</span>
            <div className="text-2xl font-extrabold text-emerald-400">{totalExecuted.length}</div>
            <p className="text-[10px] text-slate-500">Fondos desembolsados</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Total ETH Transferido</span>
            <div className="text-2xl font-extrabold text-cyan-300">
              {ethers.formatEther(totalETHDisbursed)} <span className="text-xs">ETH</span>
            </div>
            <p className="text-[10px] text-slate-500">Aprobadado por la comunidad</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Rechazadas / Vencidas</span>
            <div className="text-2xl font-extrabold text-rose-400">{rejectedCount}</div>
            <p className="text-[10px] text-slate-500">Sin consenso suficiente</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-bold text-slate-400 mr-2">Filtrar Histórico:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todas ({proposals.length})
          </button>
          <button
            onClick={() => setFilter('executed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'executed'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🚀 Ejecutadas ({totalExecuted.length})
          </button>
          <button
            onClick={() => setFilter('approved_pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'approved_pending'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ⏳ Aprobadas Pendientes ({pendingExecution.length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'rejected'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ❌ Rechazadas ({rejectedCount})
          </button>
        </div>
      </div>

      {/* Global Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center justify-between gap-3 ${
            notification.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Historical List Cards */}
      {loading ? (
        <div className="glass-card p-12 rounded-3xl border border-purple-500/20 text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Cargando historial desde la blockchain...</p>
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-purple-500/20 text-center bg-slate-900/60">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
            📜
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No hay propuestas en este filtro</h3>
          <p className="text-slate-400 text-sm">No se encontraron propuestas registradas bajo el criterio seleccionado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((prop) => {
            const isApprovedPending = !prop.executed && nowTime >= Number(prop.votingDeadline) && prop.forVotes > prop.againstVotes;
            const isRejected = !prop.executed && nowTime >= Number(prop.votingDeadline) && prop.forVotes <= prop.againstVotes;
            const totalVotes = Number(prop.forVotes + prop.againstVotes + prop.abstainVotes);
            
            const forPercent = totalVotes > 0 ? (Number(prop.forVotes) / totalVotes) * 100 : 0;
            const againstPercent = totalVotes > 0 ? (Number(prop.againstVotes) / totalVotes) * 100 : 0;

            return (
              <div
                key={Number(prop.id)}
                className="glass-card p-7 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-purple-950/20 shadow-xl hover:border-purple-500/40 transition-all duration-300 relative overflow-hidden group"
              >
                {/* Header Card */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 font-extrabold flex items-center justify-center border border-purple-500/30 text-sm">
                      #{Number(prop.id)}
                    </span>
                    <div>
                      <h3
                        onClick={() => handleOpenDetail(prop)}
                        className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <span>{prop.title || `Propuesta #${Number(prop.id)}`}</span>
                        <span className="text-xs text-cyan-400 font-normal">🔍</span>
                      </h3>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        Beneficiario: <span className="text-slate-300">{prop.recipient}</span> • Finalizada: <span className="text-slate-300">{formatDate(prop.votingDeadline)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleOpenDetail(prop)}
                      className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <span>🔍 Ver Detalles</span>
                    </button>

                    {prop.executed ? (
                      <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        🚀 Ejecutada
                      </span>
                    ) : isApprovedPending ? (
                      <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                        ⏳ Aprobada Pendiente
                      </span>
                    ) : isRejected ? (
                      <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        ❌ Rechazada
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        📋 Cerrada
                      </span>
                    )}

                    <div className="bg-purple-950/60 border border-purple-500/30 px-3 py-1 rounded-xl text-xs font-bold text-cyan-300">
                      {ethers.formatEther(prop.amount)} ETH
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="py-4 text-slate-300 text-sm leading-relaxed line-clamp-3">
                  {prop.description}
                </p>

                {/* Voting Outcome Progress */}
                <div className="space-y-2 py-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-400">Votos A Favor: {Number(prop.forVotes)} ({forPercent.toFixed(0)}%)</span>
                    <span className="text-rose-400">Votos En Contra: {Number(prop.againstVotes)} ({againstPercent.toFixed(0)}%)</span>
                    <span className="text-slate-400">Abstenciones: {Number(prop.abstainVotes)}</span>
                  </div>

                  <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden flex">
                    <div style={{ width: `${forPercent}%` }} className="bg-emerald-500 h-full" />
                    <div style={{ width: `${againstPercent}%` }} className="bg-rose-500 h-full" />
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between gap-4">
                  <button
                    onClick={() => handleOpenDetail(prop)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all flex items-center gap-1.5"
                  >
                    <span>🔍 Ver Información Detallada Completa</span>
                  </button>

                  {isApprovedPending && (
                    <button
                      onClick={() => handleExecute(Number(prop.id))}
                      disabled={executingId === Number(prop.id)}
                      className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {executingId === Number(prop.id) ? (
                        <span>Ejecutando...</span>
                      ) : (
                        <>
                          <span>🚀 Ejecutar y Desembolsar</span>
                          <span>→</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Standalone Detail Modal if not handled by parent */}
      {selectedDetail && (
        <ProposalDetailModal
          proposal={selectedDetail}
          onClose={() => setSelectedDetail(null)}
          onRefresh={loadHistory}
          blockchainTime={blockchainTime}
        />
      )}
    </div>
  );
}
