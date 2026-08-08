'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ethers } from 'ethers';
import { getProvider, getSigner } from '@/lib/web3';
import { Proposal } from '@/lib/contracts';
import { getProposalCount, getProposal, getUserVote, checkIsMember, executeProposalDirect } from '@/lib/daoHelpers';
import ProposalDetailModal from './ProposalDetailModal';

interface ProposalWithVote extends Proposal {
  userVote?: number;
}

interface ProposalListProps {
  onSelectProposal?: (proposal: ProposalWithVote) => void;
}

export default function ProposalList({ onSelectProposal }: ProposalListProps) {
  const [proposals, setProposals] = useState<ProposalWithVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [executingProposal, setExecutingProposal] = useState<number | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [blockchainTime, setBlockchainTime] = useState<number>(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<ProposalWithVote | null>(null);

  useEffect(() => {
    loadProposals();
    const interval = setInterval(loadProposals, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadProposals = async () => {
    try {
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

      const count = await getProposalCount(provider);
      const proposalsList: ProposalWithVote[] = [];

      let currentUserAddress: string | null = null;
      let memberStatus = false;

      try {
        const signer = await getSigner();
        if (signer) {
          currentUserAddress = await signer.getAddress();
          setUserAddress(currentUserAddress);
          memberStatus = await checkIsMember(provider, currentUserAddress);
          setIsMember(memberStatus);
        }
      } catch {
        // Billetera no conectada
      }

      for (let i = 1; i <= Number(count); i++) {
        const p = await getProposal(provider, i);

        let userVote: number | undefined = undefined;
        if (currentUserAddress) {
          try {
            const vote = await getUserVote(provider, i, currentUserAddress);
            userVote = Number(vote);
          } catch {
            // Ignorar error si no votó
          }
        }

        proposalsList.push({
          id: BigInt(p[0]),
          title: p[1],
          recipient: p[2],
          amount: BigInt(p[3]),
          votingDeadline: BigInt(p[4]),
          executionDelay: BigInt(p[5]),
          executed: p[6],
          forVotes: BigInt(p[7]),
          againstVotes: BigInt(p[8]),
          abstainVotes: BigInt(p[9]),
          description: p[10],
          userVote
        });
      }

      setProposals(proposalsList.reverse());
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar propuestas:', error);
      setLoading(false);
    }
  };

  const handleExecute = async (proposalId: number) => {
    setExecutingProposal(proposalId);
    setNotification(null);

    try {
      const signer = await getSigner();
      if (!signer) throw new Error('Conecta tu billetera para ejecutar la propuesta.');

      await executeProposalDirect(signer, proposalId);
      setNotification({ type: 'success', message: '🚀 ¡Propuesta ejecutada y fondos transferidos al beneficiario!' });
      setTimeout(loadProposals, 1500);
    } catch (err: unknown) {
      console.error('Error al ejecutar propuesta:', err);
      const msg = err instanceof Error ? err.message : 'Fallo la ejecución de la propuesta.';
      setNotification({ type: 'error', message: msg });
    } finally {
      setExecutingProposal(null);
    }
  };

  const getProposalStatus = (p: Proposal) => {
    const now = blockchainTime > 0 ? blockchainTime : Math.floor(Date.now() / 1000);
    if (p.executed) return { label: 'Ejecutada', color: 'bg-slate-700 text-slate-300 border-slate-600' };
    if (now < Number(p.votingDeadline)) return { label: 'En Votación', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse' };
    if (p.forVotes > p.againstVotes) return { label: 'Aprobada', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
    return { label: 'Rechazada', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
  };

  const canVoteOnProposal = (p: Proposal) => {
    const now = blockchainTime > 0 ? blockchainTime : Math.floor(Date.now() / 1000);
    return now < Number(p.votingDeadline) && !p.executed;
  };

  const canExecuteProposalCheck = (p: Proposal) => {
    const now = blockchainTime > 0 ? blockchainTime : Math.floor(Date.now() / 1000);
    return (
      !p.executed &&
      now >= Number(p.votingDeadline) &&
      now >= Number(p.executionDelay) &&
      p.forVotes > p.againstVotes
    );
  };

  const handleOpenDetail = (prop: ProposalWithVote) => {
    if (onSelectProposal) {
      onSelectProposal(prop);
    } else {
      setSelectedDetail(prop);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Info Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-purple-500/30 bg-slate-900/80 backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300">
            Registro General de Propuestas
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Consulta los expedientes detallados. Para emitir votos dirígete a la sección <strong>🗳️ Votación</strong>.
          </p>
        </div>

        <Link
          href="/dashboard/voting"
          className="px-5 py-2.5 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-lg shadow-purple-600/30 transition-all shrink-0 flex items-center gap-2"
        >
          <span>🗳️ Ir a Sección Votación</span>
          <span>→</span>
        </Link>
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

      {/* Proposal Cards List */}
      {loading ? (
        <div className="glass-card p-12 rounded-3xl border border-purple-500/20 text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Cargando propuestas desde la blockchain...</p>
        </div>
      ) : proposals.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-purple-500/20 text-center bg-slate-900/60">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
            📋
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No hay propuestas registradas</h3>
          <p className="text-slate-400 text-sm">Presiona el botón <strong>Crear Propuesta</strong> para abrir el formulario flotante.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {proposals.map((prop) => {
            const status = getProposalStatus(prop);
            const isVotingActive = canVoteOnProposal(prop);
            const canExec = canExecuteProposalCheck(prop);
            const totalVotes = Number(prop.forVotes + prop.againstVotes + prop.abstainVotes);
            
            const forPercent = totalVotes > 0 ? (Number(prop.forVotes) / totalVotes) * 100 : 0;
            const againstPercent = totalVotes > 0 ? (Number(prop.againstVotes) / totalVotes) * 100 : 0;
            const abstainPercent = totalVotes > 0 ? (Number(prop.abstainVotes) / totalVotes) * 100 : 0;

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
                        <span className="text-xs text-cyan-400">🔍</span>
                      </h3>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        Beneficiario: <span className="text-slate-300">{prop.recipient}</span>
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

                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${status.color}`}>
                      {status.label}
                    </span>
                    <div className="bg-purple-950/60 border border-purple-500/30 px-3 py-1 rounded-xl text-xs font-bold text-cyan-300">
                      {ethers.formatEther(prop.amount)} ETH
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="py-4 text-slate-300 text-sm leading-relaxed line-clamp-3">
                  {prop.description}
                </p>

                {/* Voting Statistics & Progress Bar */}
                <div className="space-y-3 py-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-400">A Favor: {Number(prop.forVotes)} ({forPercent.toFixed(0)}%)</span>
                    <span className="text-rose-400">En Contra: {Number(prop.againstVotes)} ({againstPercent.toFixed(0)}%)</span>
                    <span className="text-slate-400">Abstenciones: {Number(prop.abstainVotes)} ({abstainPercent.toFixed(0)}%)</span>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex">
                    <div style={{ width: `${forPercent}%` }} className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full transition-all duration-500" />
                    <div style={{ width: `${againstPercent}%` }} className="bg-gradient-to-r from-rose-600 to-rose-400 h-full transition-all duration-500" />
                    <div style={{ width: `${abstainPercent}%` }} className="bg-slate-600 h-full transition-all duration-500" />
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 mt-2 border-t border-slate-800/80 flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-400 font-semibold">
                    {isVotingActive ? '🗳️ Votación en curso' : 'Periodo de votación cerrado'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenDetail(prop)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>🔍 Información Detallada</span>
                    </button>

                    {canExec && (
                      <button
                        onClick={() => handleExecute(Number(prop.id))}
                        disabled={executingProposal === Number(prop.id)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        🚀 Ejecutar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Standalone Proposal Detail Modal if not handled by parent */}
      {selectedDetail && (
        <ProposalDetailModal
          proposal={selectedDetail}
          onClose={() => setSelectedDetail(null)}
          onRefresh={loadProposals}
          blockchainTime={blockchainTime}
          showVotingActions={false}
        />
      )}
    </div>
  );
}
