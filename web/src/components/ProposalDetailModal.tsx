'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Proposal, VoteType, getForwarderContract, DAO_CONTRACT_ADDRESS } from '@/lib/contracts';
import { voteDirect, executeProposalDirect, enableSecondPeriodDirect, checkIsMember } from '@/lib/daoHelpers';
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

  // Cerrar modal al presionar la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!proposal) return null;

  const now = blockchainTime > 0 ? blockchainTime : Math.floor(Date.now() / 1000);
  const totalVotes = Number(proposal.forVotes + proposal.againstVotes + proposal.abstainVotes);
  const isAbstentionMajority = proposal.abstainVotes > proposal.forVotes && proposal.abstainVotes > proposal.againstVotes;
  const isVotingTimeFinished = now >= Number(proposal.votingDeadline);
  const isVotingActive = !proposal.executed && !proposal.rejected && !isVotingTimeFinished;

  const canExecute = !proposal.executed && !proposal.rejected && isVotingTimeFinished && now >= Number(proposal.executionDelay) && proposal.forVotes > proposal.againstVotes && !isAbstentionMajority;
  const canStartSecondPeriod = isVotingTimeFinished && isAbstentionMajority && !proposal.secondPeriod && !proposal.executed && !proposal.rejected;

  const hasVoted = proposal.userVote !== undefined && proposal.userVote !== 0;

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
              accion: request.accion,
              detalles: request.detalles,
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

  const handleStartSecondPeriod = async () => {
    setLoadingAction(true);
    setNotification(null);

    try {
      const signer = await getSigner();
      if (!signer) throw new Error('Conecta tu billetera para activar el 2º periodo de votación.');

      await enableSecondPeriodDirect(signer, Number(proposal.id), 3 * 24 * 60 * 60);
      setNotification({ type: 'success', message: '🔄 ¡Segundo periodo de votación (repechaje) activado exitosamente por 3 días!' });
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      console.error('Error al activar 2º periodo:', err);
      const msg = err instanceof Error ? err.message : 'Error al activar 2º periodo de votación.';
      setNotification({ type: 'error', message: msg });
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl glass-card p-8 rounded-3xl border border-purple-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-purple-950/50 text-slate-100 shadow-2xl space-y-6 my-8"
      >
        
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
            type="button"
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95"
            title="Cerrar ventana emergente"
          >
            <span className="text-sm leading-none">✕</span>
            <span>Cerrar</span>
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
              ) : proposal.rejected ? (
                <span className="text-rose-400">❌ Rechazada Definitivamente</span>
              ) : canStartSecondPeriod ? (
                <span className="text-amber-400 animate-pulse">⚠️ Requiere 2º Periodo (Abstención)</span>
              ) : proposal.secondPeriod && isVotingActive ? (
                <span className="text-cyan-300 animate-pulse">🔄 2º Periodo Activo (Repechaje)</span>
              ) : isVotingActive ? (
                <span className="text-emerald-300 animate-pulse">🗳️ Votación Activa (1er Periodo)</span>
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

        {/* Timeline details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-400 font-semibold block">Cierre del Periodo de Votación:</span>
            <span className="text-white font-bold block">{formatDate(proposal.votingDeadline)}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-400 font-semibold block">Periodo de Retardo para Ejecución:</span>
            <span className="text-white font-bold block">{formatDate(proposal.executionDelay)}</span>
          </div>
        </div>

        {/* Vote Results Progress Bar */}
        <div className="space-y-3 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>Resultados de Votación por Mayoría Simple</span>
            <span className="text-slate-400">{totalVotes} Voto(s) Registrados</span>
          </div>

          <div className="h-3 rounded-full bg-slate-900 overflow-hidden flex border border-slate-800">
            <div style={{ width: `${forPercent}%` }} className="bg-emerald-500 transition-all duration-500" title={`A Favor: ${forPercent.toFixed(1)}%`} />
            <div style={{ width: `${againstPercent}%` }} className="bg-rose-500 transition-all duration-500" title={`En Contra: ${againstPercent.toFixed(1)}%`} />
            <div style={{ width: `${abstainPercent}%` }} className="bg-slate-500 transition-all duration-500" title={`Abstención: ${abstainPercent.toFixed(1)}%`} />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
            <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
              <div className="text-[10px] text-emerald-400 font-bold uppercase">A Favor</div>
              <div className="font-extrabold text-emerald-300">{Number(proposal.forVotes)} ({forPercent.toFixed(1)}%)</div>
            </div>

            <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/30">
              <div className="text-[10px] text-rose-400 font-bold uppercase">En Contra</div>
              <div className="font-extrabold text-rose-300">{Number(proposal.againstVotes)} ({againstPercent.toFixed(1)}%)</div>
            </div>

            <div className="p-2 rounded-xl bg-slate-900 border border-slate-700">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Abstención</div>
              <div className="font-extrabold text-slate-300">{Number(proposal.abstainVotes)} ({abstainPercent.toFixed(1)}%)</div>
            </div>
          </div>
        </div>

        {/* Start Second Period Button */}
        {canStartSecondPeriod && (
          <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-3">
            <div className="text-xs text-amber-200 font-medium">
              ⚠️ La votación finalizó en el primer periodo con **mayoría de abstención**. Se habilita la opción de incorporar un **segundo periodo de votación (repechaje)**. Si en el segundo periodo la abstención vuelve a ser la mayoría, la propuesta será rechazada definitivamente.
            </div>
            <button
              onClick={handleStartSecondPeriod}
              disabled={loadingAction}
              className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-xl shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              🔄 Activar 2º Periodo de Votación (Extender 3 Días)
            </button>
          </div>
        )}

        {/* Voting Actions inside Voting section */}
        {showVotingActions && isVotingActive && (
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="font-extrabold text-sm text-white">
                {proposal.secondPeriod ? '🔄 Emitir Voto en 2º Periodo (Repechaje)' : 'Emitir Voto en esta Propuesta'}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-semibold">Modo:</span>
                <button
                  type="button"
                  onClick={() => setIsGasless(!isGasless)}
                  className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all border ${
                    isGasless
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  }`}
                >
                  {isGasless ? '⚡ Voto Sin Gas (Relayer)' : '⛽ Voto Directo (Pagando Gas)'}
                </button>
              </div>
            </div>

            {hasVoted && !proposal.secondPeriod ? (
              <div className="p-3.5 rounded-xl bg-purple-950/50 border border-purple-500/40 text-purple-300 text-xs font-bold text-center flex items-center justify-center gap-2">
                <span>🔒 Voto Registrado en 1er Periodo (Definitivo hasta fin del periodo)</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleVote(VoteType.FOR)}
                  disabled={loadingAction}
                  className="py-3 px-4 rounded-xl text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  👍 A Favor
                </button>
                <button
                  onClick={() => handleVote(VoteType.AGAINST)}
                  disabled={loadingAction}
                  className="py-3 px-4 rounded-xl text-xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  👎 En Contra
                </button>
                <button
                  onClick={() => handleVote(VoteType.ABSTAIN)}
                  disabled={loadingAction}
                  className="py-3 px-4 rounded-xl text-xs font-extrabold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ⚪ Abstención
                </button>
              </div>
            )}
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

        {/* Footer Close Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="w-full sm:w-auto px-8 py-3 rounded-2xl font-extrabold text-xs text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>✕ Cerrar Expediente</span>
          </button>
        </div>

      </div>
    </div>
  );
}
