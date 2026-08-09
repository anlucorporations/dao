'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getProvider, getSigner } from '@/lib/web3';
import { VoteType, Proposal, getForwarderContract, DAO_CONTRACT_ADDRESS } from '@/lib/contracts';
import { voteDirect, getProposalCount, getProposal, getUserVote, checkIsMember, enableSecondPeriodDirect } from '@/lib/daoHelpers';
import { buildVoteRequest, signMetaTxRequest } from '@/lib/metaTx';
import ProposalDetailModal from './ProposalDetailModal';

interface ProposalWithVote extends Proposal {
  userVote?: number;
}

export default function VotingCenter() {
  const [proposals, setProposals] = useState<ProposalWithVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingProposal, setVotingProposal] = useState<number | null>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [blockchainTime, setBlockchainTime] = useState<number>(0);
  const [isGasless, setIsGasless] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<ProposalWithVote | null>(null);

  useEffect(() => {
    loadActiveProposals();
    const interval = setInterval(loadActiveProposals, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadActiveProposals = async () => {
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
      const activeList: ProposalWithVote[] = [];

      let currentUserAddress: string | null = null;

      try {
        const signer = await getSigner();
        if (signer) {
          currentUserAddress = await signer.getAddress();
          const memberStatus = await checkIsMember(provider, currentUserAddress);
          setIsMember(memberStatus);
        }
      } catch {
        // Billetera no conectada
      }

      for (let i = 1; i <= Number(count); i++) {
        const p = await getProposal(provider, i);
        if (!p.executed && !p.rejected) {
          let userVote: number | undefined = undefined;
          if (currentUserAddress) {
            try {
              const vote = await getUserVote(provider, i, currentUserAddress);
              userVote = Number(vote);
            } catch {
              // sin voto
            }
          }

          activeList.push({
            ...p,
            userVote
          });
        }
      }

      setProposals(activeList.reverse());
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar centro de votación:', error);
      setLoading(false);
    }
  };

  const handleVote = async (proposalId: number, voteType: VoteType) => {
    setVotingProposal(proposalId);
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
        const reqData = await buildVoteRequest(DAO_CONTRACT_ADDRESS, currentAddr, proposalId, voteType);
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
        await voteDirect(signer, proposalId, voteType);
        setNotification({ type: 'success', message: '⛽ ¡Voto registrado directamente en la blockchain!' });
      }

      setTimeout(loadActiveProposals, 1200);
    } catch (err: unknown) {
      console.error('Error al votar:', err);
      const msg = err instanceof Error ? err.message : 'Error al emitir voto.';
      setNotification({ type: 'error', message: msg });
    } finally {
      setVotingProposal(null);
    }
  };

  const handleStartSecondPeriod = async (proposalId: number) => {
    setVotingProposal(proposalId);
    setNotification(null);

    try {
      const signer = await getSigner();
      if (!signer) throw new Error('Conecta tu billetera para activar el 2º periodo de votación.');

      await enableSecondPeriodDirect(signer, proposalId, 3 * 24 * 60 * 60);
      setNotification({ type: 'success', message: '🔄 ¡Segundo periodo de votación (repechaje) activado por 3 días!' });
      setTimeout(loadActiveProposals, 1200);
    } catch (err: unknown) {
      console.error('Error al activar 2º periodo:', err);
      const msg = err instanceof Error ? err.message : 'Error al activar 2º periodo de votación.';
      setNotification({ type: 'error', message: msg });
    } finally {
      setVotingProposal(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="glass-card p-6 rounded-3xl border border-purple-500/30 bg-slate-900/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300">
            🗳️ Centro de Votación en Vivo
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Gobernanza descentralizada con mayoría simple. Emite tu voto <strong>sin pagar gas</strong> utilizando meta-transacciones EIP-712.
          </p>
        </div>

        {/* Mode Selector Gasless vs Direct */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <button
            onClick={() => setIsGasless(true)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isGasless
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Sin Gas (Relayer)
          </button>
          <button
            onClick={() => setIsGasless(false)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              !isGasless
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⛽ Directo (Con Gas)
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

      {/* Proposals Grid */}
      {loading ? (
        <div className="glass-card p-12 rounded-3xl border border-purple-500/20 text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Cargando propuestas activas...</p>
        </div>
      ) : proposals.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-purple-500/20 text-center bg-slate-900/60">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
            🗳️
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No hay votaciones activas en este momento</h3>
          <p className="text-slate-400 text-sm">Todas las propuestas existentes han sido concluidas o ejecutadas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {proposals.map((prop) => {
            const totalVotes = Number(prop.forVotes + prop.againstVotes + prop.abstainVotes);
            const hasVoted = prop.userVote !== undefined && prop.userVote !== 0;
            const now = blockchainTime > 0 ? blockchainTime : Math.floor(Date.now() / 1000);
            const isAbstentionMajority = prop.abstainVotes > prop.forVotes && prop.abstainVotes > prop.againstVotes;
            const isTimeFinished = now >= Number(prop.votingDeadline);
            const canStartSecondPeriod = isTimeFinished && isAbstentionMajority && !prop.secondPeriod;

            const forPercent = totalVotes > 0 ? (Number(prop.forVotes) / totalVotes) * 100 : 0;
            const againstPercent = totalVotes > 0 ? (Number(prop.againstVotes) / totalVotes) * 100 : 0;
            const abstainPercent = totalVotes > 0 ? (Number(prop.abstainVotes) / totalVotes) * 100 : 0;

            return (
              <div
                key={Number(prop.id)}
                className="glass-card p-6 rounded-3xl border border-purple-500/30 bg-slate-900/80 backdrop-blur-xl flex flex-col justify-between space-y-5 hover:border-purple-500/60 transition-all duration-300 shadow-xl"
              >
                <div className="space-y-4">
                  {/* Top Status */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 font-extrabold text-xs border border-purple-500/30">
                      Propuesta #{Number(prop.id)}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 animate-pulse">
                      {prop.secondPeriod ? '🔄 2º Periodo Activo' : '🗳️ Votación Activa'}
                    </span>
                  </div>

                  {/* Title and Beneficiary */}
                  <div>
                    <h3
                      onClick={() => setSelectedDetail(prop)}
                      className="text-lg font-extrabold text-white hover:text-cyan-300 cursor-pointer transition-colors"
                    >
                      {prop.title || `Propuesta #${Number(prop.id)}`}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-1 break-all">
                      Beneficiario: {prop.recipient}
                    </p>
                  </div>

                  {/* Amount & Time */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Solicitado</span>
                      <span className="text-sm font-extrabold text-cyan-300">{ethers.formatEther(prop.amount)} ETH</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Cierre Votación</span>
                      <span className="text-xs font-bold text-slate-200">{new Date(Number(prop.votingDeadline) * 1000).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>

                  {/* Vote Results Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>Votos Registrados</span>
                      <span className="text-white">{totalVotes} Voto(s)</span>
                    </div>

                    <div className="h-2.5 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
                      <div style={{ width: `${forPercent}%` }} className="bg-emerald-500" title={`A Favor: ${forPercent.toFixed(1)}%`} />
                      <div style={{ width: `${againstPercent}%` }} className="bg-rose-500" title={`En Contra: ${againstPercent.toFixed(1)}%`} />
                      <div style={{ width: `${abstainPercent}%` }} className="bg-slate-500" title={`Abstención: ${abstainPercent.toFixed(1)}%`} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                      <span className="text-emerald-400 bg-emerald-950/30 p-1 rounded-lg border border-emerald-500/20">👍 {Number(prop.forVotes)}</span>
                      <span className="text-rose-400 bg-rose-950/30 p-1 rounded-lg border border-rose-500/20">👎 {Number(prop.againstVotes)}</span>
                      <span className="text-slate-400 bg-slate-900 p-1 rounded-lg border border-slate-700">⚪ {Number(prop.abstainVotes)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  {canStartSecondPeriod ? (
                    <button
                      onClick={() => handleStartSecondPeriod(Number(prop.id))}
                      disabled={votingProposal === Number(prop.id)}
                      className="w-full py-3 px-4 rounded-xl text-xs font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all"
                    >
                      🔄 Activar 2º Periodo de Votación (Abstención Mayoritaria)
                    </button>
                  ) : hasVoted && !prop.secondPeriod ? (
                    <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-bold text-center">
                      🔒 Voto Definitivo Registrado
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleVote(Number(prop.id), VoteType.FOR)}
                        disabled={votingProposal === Number(prop.id) || !isMember}
                        className="py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all disabled:opacity-40"
                      >
                        👍 A Favor
                      </button>
                      <button
                        onClick={() => handleVote(Number(prop.id), VoteType.AGAINST)}
                        disabled={votingProposal === Number(prop.id) || !isMember}
                        className="py-2.5 px-3 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all disabled:opacity-40"
                      >
                        👎 En Contra
                      </button>
                      <button
                        onClick={() => handleVote(Number(prop.id), VoteType.ABSTAIN)}
                        disabled={votingProposal === Number(prop.id) || !isMember}
                        className="py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all disabled:opacity-40"
                      >
                        ⚪ Abstención
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedDetail(prop)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-900 border border-slate-800 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>🔍 Ver Expediente Completo</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Detail Modal */}
      {selectedDetail && (
        <ProposalDetailModal
          proposal={selectedDetail}
          onClose={() => setSelectedDetail(null)}
          blockchainTime={blockchainTime}
          onRefresh={loadActiveProposals}
          showVotingActions={true}
        />
      )}
    </div>
  );
}
