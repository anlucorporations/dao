'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ethers } from 'ethers';
import { Proposal, VoteType, getForwarderContract, DAO_CONTRACT_ADDRESS } from '@/lib/contracts';
import { voteDirect, executeProposalDirect, checkIsMember } from '@/lib/daoHelpers';
import { buildVoteRequest, signMetaTxRequest } from '@/lib/metaTx';
import { getSigner } from '@/lib/web3';

interface ProposalDetailModalProps {
  proposal: (Proposal & { userVote?: number }) | null;
  onClose: () => void;
  blockchainTime?: number;
  onRefresh?: () => void;
  showVotingActions?: boolean;
}

export default function ProposalDetailModal({
  proposal,
  onClose,
  blockchainTime = 0,
  onRefresh,
  showVotingActions = false
}: ProposalDetailModalProps) {
  const [isGasless, setIsGasless] = useState<boolean>(true);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!proposal) return null;

  const now = blockchainTime > 0 ? blockchainTime : Math.floor(Date.now() / 1000);
  const isVotingActive = now < Number(proposal.votingDeadline) && !proposal.executed;
  const canExecute = !proposal.executed && now >= Number(proposal.votingDeadline) && now >= Number(proposal.executionDelay) && proposal.forVotes > proposal.againstVotes;
  const hasVoted = proposal.userVote !== undefined && proposal.userVote !== 0;

  const totalVotes = Number(proposal.forVotes + proposal.againstVotes + proposal.abstainVotes);
  const forPercent = totalVotes > 0 ? (Number(proposal.forVotes) / totalVotes) * 100 : 0;
  const againstPercent = totalVotes > 0 ? (Number(proposal.againstVotes) / totalVotes) * 100 : 0;
  const abstainPercent = totalVotes > 0 ? (Number(proposal.abstainVotes) / totalVotes) * 100 : 0;

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVote = async (voteType: VoteType) => {
    if (hasVoted) return;
    setLoadingAction(true);
    setNotification(null);

    try {
      const signer = await getSigner();
      if (!signer) throw new Error('Por favor conecta tu billetera MetaMask.');

      const currentAddr = await signer.getAddress();
      const member = await checkIsMember(signer, currentAddr);
      if (!member) {
        throw new Error('Debes estar inscrito como socio activo (3 ETH) para votar.');
      }

      if (isGasless) {
        const forwarder = getForwarderContract(signer);
        const reqData = await buildVoteRequest(DAO_CONTRACT_ADDRESS, currentAddr, Number(proposal.id), voteType);
        const { request, signature } = await signMetaTxRequest(signer, forwarder, reqData);

        const response = await fetch('/api/relay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            request: {
              from: request.from,
              to: request.to,
              value: request.value.toString(),
              gas: request.gas.toString(),
              nonce: request.nonce.toString(),
              data: request.data
            },
            signature
          })
        });

        const resData = await response.json();
        if (!response.ok || resData.error) {
          const detail = resData.message ? `${resData.error}: ${resData.message}` : resData.error;
          throw new Error(detail || 'Error al procesar el voto en el relayer.');
        }

        setNotification({ type: 'success', message: '⚡ ¡Voto registrado sin pagar gas!' });
      } else {
        await voteDirect(signer, Number(proposal.id), voteType);
        setNotification({ type: 'success', message: '⛽ ¡Voto registrado directamente en la blockchain!' });
      }

      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      console.error('Error al votar:', err);
      const msg = err instanceof Error ? err.message : 'Error al emitir voto.';
      setNotification({ type: 'error', message: msg });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleExecute = async () => {
    setLoadingAction(true);
    setNotification(null);

    try {
      const signer = await getSigner();
      if (!signer) throw new Error('Conecta tu billetera para ejecutar la propuesta.');

      await executeProposalDirect(signer, Number(proposal.id));
      setNotification({ type: 'success', message: '🚀 ¡Propuesta ejecutada y fondos desembolsados exitosamente!' });
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      console.error('Error al ejecutar:', err);
      const msg = err instanceof Error ? err.message : 'Error al ejecutar propuesta.';
      setNotification({ type: 'error', message: msg });
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl glass-card p-8 rounded-3xl border border-purple-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-purple-950/50 text-slate-100 shadow-2xl space-y-6 my-8">
        
        {/* Header bar of modal */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 font-extrabold text-sm border border-purple-500/30">
              #{Number(proposal.id)}
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-white">
                {proposal.title || `Propuesta #${Number(proposal.id)}`}
              </h2>
              <span className="text-xs text-slate-400">Expediente de Información Detallada</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-base transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Notification Alerter */}
        {notification && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
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

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Monto a Transferir</span>
            <div className="text-2xl font-extrabold text-cyan-300">
              {ethers.formatEther(proposal.amount)} <span className="text-xs">ETH</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Financiamiento solicitado</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Estado en Blockchain</span>
            <div className="text-sm font-extrabold text-white mt-1">
              {proposal.executed ? (
                <span className="text-emerald-400">🚀 Ejecutada & Desembolsada</span>
              ) : isVotingActive ? (
                <span className="text-emerald-300 animate-pulse">🗳️ Votación Activa</span>
              ) : canExecute ? (
                <span className="text-cyan-300">⏳ Aprobada (Lista p/ Ejecutar)</span>
              ) : (
                <span className="text-rose-400">❌ Rechazada / Vencida</span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Estado de gobernanza</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Total Votos Emitidos</span>
            <div className="text-2xl font-extrabold text-white">{totalVotes} <span className="text-xs text-slate-400">voto(s)</span></div>
            <p className="text-[10px] text-slate-500 font-medium">Participación comunitaria</p>
          </div>
        </div>

        {/* Beneficiary Info */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Billetera Beneficiaria Receptora</span>
          <div className="font-mono text-xs font-bold text-white break-all bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            {proposal.recipient}
          </div>
        </div>

        {/* Description & Justification */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-purple-300">Descripción y Justificación del Proyecto</h4>
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
            {proposal.description}
          </div>
        </div>

        {/* Breakdown of Voting Results */}
        <div className="space-y-3 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <h4 className="font-bold text-xs uppercase tracking-wider text-white">Desglose Detallado de Votación</h4>
          
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
              <div className="text-emerald-400 font-extrabold text-base">{Number(proposal.forVotes)}</div>
              <div className="text-[10px] text-emerald-300 font-bold">A FAVOR ({forPercent.toFixed(0)}%)</div>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30">
              <div className="text-rose-400 font-extrabold text-base">{Number(proposal.againstVotes)}</div>
              <div className="text-[10px] text-rose-300 font-bold">EN CONTRA ({againstPercent.toFixed(0)}%)</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700">
              <div className="text-slate-300 font-extrabold text-base">{Number(proposal.abstainVotes)}</div>
              <div className="text-[10px] text-slate-400 font-bold">ABSTENCIÓN ({abstainPercent.toFixed(0)}%)</div>
            </div>
          </div>

          <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex">
            <div style={{ width: `${forPercent}%` }} className="bg-emerald-500 h-full" />
            <div style={{ width: `${againstPercent}%` }} className="bg-rose-500 h-full" />
            <div style={{ width: `${abstainPercent}%` }} className="bg-slate-600 h-full" />
          </div>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
          <div>
            📅 <span className="font-semibold text-slate-300">Cierre de Votación:</span><br />
            <span className="text-white text-xs">{formatDate(proposal.votingDeadline)}</span>
          </div>
          <div>
            ⏳ <span className="font-semibold text-slate-300">Fecha Límite de Ejecución:</span><br />
            <span className="text-white text-xs">{formatDate(proposal.executionDelay)}</span>
          </div>
        </div>

        {/* Voting Actions inside modal if showVotingActions is TRUE */}
        {isVotingActive && showVotingActions && (
          <div className="space-y-3 pt-2">
            {hasVoted ? (
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 flex items-center justify-between">
                <span>
                  ✓ Tu voto ya fue registrado:{' '}
                  <strong className="text-white">
                    {proposal.userVote === 1 ? 'A FAVOR' : proposal.userVote === 2 ? 'EN CONTRA' : 'ABSTENCIÓN'}
                  </strong>
                </span>
                <span className="text-[10px] text-amber-300 font-bold">🔒 Voto Definitivo (No modificable)</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Emitir Voto:</span>
                  <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setIsGasless(true)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        isGasless ? 'bg-purple-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      ⚡ Sin Gas
                    </button>
                    <button
                      onClick={() => setIsGasless(false)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        !isGasless ? 'bg-slate-700 text-amber-300' : 'text-slate-400'
                      }`}
                    >
                      ⛽ Con Gas
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleVote(VoteType.FOR)}
                    disabled={loadingAction || hasVoted}
                    className="py-3 px-4 rounded-xl text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    👍 A Favor
                  </button>
                  <button
                    onClick={() => handleVote(VoteType.AGAINST)}
                    disabled={loadingAction || hasVoted}
                    className="py-3 px-4 rounded-xl text-xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    👎 En Contra
                  </button>
                  <button
                    onClick={() => handleVote(VoteType.ABSTAIN)}
                    disabled={loadingAction || hasVoted}
                    className="py-3 px-4 rounded-xl text-xs font-extrabold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ⚪ Abstención
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* If opened from Proposals section, direct user to Voting section to cast vote */}
        {isVotingActive && !showVotingActions && (
          <div className="pt-2 text-center">
            <Link
              href="/dashboard/voting"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-xl shadow-purple-600/30 transition-all"
            >
              <span>🗳️ Ir a la Sección Votación para Emitir Voto</span>
              <span>→</span>
            </Link>
          </div>
        )}

        {canExecute && (
          <div className="pt-2">
            <button
              onClick={handleExecute}
              disabled={loadingAction}
              className="w-full py-4 px-6 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/30 transition-all disabled:opacity-50"
            >
              🚀 Ejecutar Propuesta y Desembolsar {ethers.formatEther(proposal.amount)} ETH
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
