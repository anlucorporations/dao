'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getProvider, getSigner } from '@/lib/web3';
import { Proposal } from '@/lib/contracts';
import { getProposalCount, getProposal, executeProposalDirect, getUserVote, getMemberCount } from '@/lib/daoHelpers';
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
  const [memberCount, setMemberCount] = useState<number>(1);
  const [filter, setFilter] = useState<'all' | 'active' | 'executed' | 'approved_pending' | 'rejected' | 'abstention'>('all');
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

      try {
        const mCount = await getMemberCount(provider);
        setMemberCount(Number(mCount));
      } catch {
        setMemberCount(1);
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

      // Cargar TODAS las propuestas del sistema (ID 1 a count)
      for (let i = 1; i <= Number(count); i++) {
        const p = await getProposal(provider, i);

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

  const nowTime = blockchainTime > 0 ? blockchainTime : Math.floor(Date.now() / 1000);

  // Auxiliares de estatus de propuesta
  const isFinished = (p: ProposalWithVote) => {
    if (p.executed || p.rejected) return true;
    if (nowTime >= Number(p.votingDeadline)) return true;
    const totalVotes = Number(p.forVotes + p.againstVotes + p.abstainVotes);
    return memberCount > 0 && totalVotes >= memberCount;
  };

  const totalExecuted = proposals.filter((p) => p.executed);
  const totalETHDisbursed = totalExecuted.reduce((acc, p) => acc + BigInt(p.amount), BigInt(0));

  const pendingExecution = proposals.filter(
    (p) => !p.executed && !p.rejected && isFinished(p) && p.forVotes > p.againstVotes
  );

  const finishedProposals = proposals.filter((p) => isFinished(p));
  
  const rejectedProposals = proposals.filter(
    (p) => p.rejected || (!p.executed && isFinished(p) && p.forVotes <= p.againstVotes)
  );

  const abstentionProposals = proposals.filter(
    (p) => p.secondPeriod || (p.abstainVotes > p.forVotes && p.abstainVotes > p.againstVotes)
  );

  const activeProposals = proposals.filter((p) => !isFinished(p));

  const filteredProposals = proposals.filter((p) => {
    if (filter === 'active') return !isFinished(p);
    if (filter === 'executed') return p.executed;
    if (filter === 'approved_pending') return !p.executed && !p.rejected && isFinished(p) && p.forVotes > p.againstVotes;
    if (filter === 'rejected') return p.rejected || (!p.executed && isFinished(p) && p.forVotes <= p.againstVotes);
    if (filter === 'abstention') return p.secondPeriod || (p.abstainVotes > p.forVotes && p.abstainVotes > p.againstVotes);
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
              📜 Registro Histórico Completo de Propuestas
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Visualiza el listado global de todas las propuestas con sus estados (Activa, Aprobada, Ejecutada, Rechazada, Abstención).
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-extrabold shrink-0">
            Smart Contract On-Chain
          </div>
        </div>

        {/* Resumen Global de Propuestas Registradas y Finalizadas */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Creadas</span>
            <div className="text-2xl font-extrabold text-white">{proposals.length}</div>
            <p className="text-[10px] text-slate-500">Registradas en DAO</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Total Concluidas</span>
            <div className="text-2xl font-extrabold text-cyan-300">{finishedProposals.length}</div>
            <p className="text-[10px] text-slate-500">Votación finalizada</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Aprobadas / Ejecutadas</span>
            <div className="text-2xl font-extrabold text-emerald-400">{totalExecuted.length}</div>
            <p className="text-[10px] text-slate-500">{ethers.formatEther(totalETHDisbursed)} ETH desembolsados</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Rechazadas</span>
            <div className="text-2xl font-extrabold text-rose-400">{rejectedProposals.length}</div>
            <p className="text-[10px] text-slate-500">Sin consenso de votos</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">En Abstención</span>
            <div className="text-2xl font-extrabold text-amber-400">{abstentionProposals.length}</div>
            <p className="text-[10px] text-slate-500">2º periodo o indecisión</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-bold text-slate-400 mr-2">Filtrar por Estado:</span>
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
            onClick={() => setFilter('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'active'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🟢 Activas ({activeProposals.length})
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
            ❌ Rechazadas ({rejectedProposals.length})
          </button>
          <button
            onClick={() => setFilter('abstention')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'abstention'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ⚖️ Abstención ({abstentionProposals.length})
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
          <p className="text-slate-400 text-sm">Cargando propuestas desde la blockchain...</p>
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
            const finished = isFinished(prop);
            const isApprovedPending = !prop.executed && !prop.rejected && finished && prop.forVotes > prop.againstVotes;
            const isRejected = prop.rejected || (!prop.executed && finished && prop.forVotes <= prop.againstVotes);
            const isUnanimous = prop.executed && memberCount > 0 && Number(prop.forVotes) === memberCount;
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
                        Beneficiario: <span className="text-slate-300">{prop.recipient}</span> • Caducidad Votación: <span className="text-slate-300">{formatDate(prop.votingDeadline)}</span>
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

                    {/* Insignias de Estatus */}
                    {isUnanimous ? (
                      <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-gradient-to-r from-purple-500/30 to-cyan-500/30 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20">
                        ⚡ Unanimidad (100%)
                      </span>
                    ) : prop.executed ? (
                      <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        🚀 Ejecutada
                      </span>
                    ) : isApprovedPending ? (
                      <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                        ⏳ Aprobada Pendiente
                      </span>
                    ) : prop.secondPeriod ? (
                      <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ⚖️ 2º Periodo
                      </span>
                    ) : isRejected ? (
                      <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        ❌ Rechazada
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                        🟢 Votación Activa
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
                    <span className="text-slate-400">Resultados de Votación ({totalVotes} Voto/s)</span>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400">👍 {Number(prop.forVotes)} ({forPercent.toFixed(0)}%)</span>
                      <span className="text-rose-400">👎 {Number(prop.againstVotes)} ({againstPercent.toFixed(0)}%)</span>
                      <span className="text-amber-400">⚪ {Number(prop.abstainVotes)}</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${forPercent}%` }} />
                    <div className="bg-rose-500 h-full transition-all" style={{ width: `${againstPercent}%` }} />
                  </div>
                </div>

                {/* Card Action Footer */}
                {isApprovedPending && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-cyan-300 font-medium">
                      ✓ La propuesta cuenta con votos a favor suficientes para ser ejecutada.
                    </span>
                    <button
                      onClick={() => handleExecute(Number(prop.id))}
                      disabled={executingId === Number(prop.id)}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-600/30 flex items-center gap-2"
                    >
                      {executingId === Number(prop.id) ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Ejecutando...</span>
                        </>
                      ) : (
                        <span>🚀 Ejecutar Ahora</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalle Completo de Propuesta */}
      {selectedDetail && (
        <ProposalDetailModal
          proposal={selectedDetail}
          onClose={() => setSelectedDetail(null)}
          onRefresh={loadHistory}
        />
      )}
    </div>
  );
}
