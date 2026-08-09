'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getProvider, getSigner } from '@/lib/web3';
import { VoteType, Proposal, getForwarderContract, DAO_CONTRACT_ADDRESS } from '@/lib/contracts';
import { voteDirect, getProposalCount, getProposal, getUserVote, checkIsMember } from '@/lib/daoHelpers';
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
      let memberStatus = false;

      try {
        const signer = await getSigner();
        if (signer) {
          currentUserAddress = await signer.getAddress();
          memberStatus = await checkIsMember(provider, currentUserAddress);
          setIsMember(memberStatus);
        }
      } catch {
        // Billetera no conectada
      }

      const now = blockchainTime > 0 ? blockchainTime : Math.floor(Date.now() / 1000);

      for (let i = 1; i <= Number(count); i++) {
        const p = await getProposal(provider, i);
        const deadline = Number(p[4]);
        const executed = p[6];

        // Solo propuestas en periodo activo de votación
        if (!executed && now < deadline) {
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

        setNotification({ type: 'success', message: '⚡ Voto emitido exitosamente sin pagar comisiones de gas!' });
      } else {
        await voteDirect(signer, proposalId, voteType);
        setNotification({ type: 'success', message: '⛽ Voto registrado exitosamente directamente en la blockchain!' });
      }

      setTimeout(loadActiveProposals, 1500);
    } catch (err: unknown) {
      console.error('Error al emitir voto:', err);
      const msg = err instanceof Error ? err.message : 'Fallo al emitir el voto.';
      setNotification({ type: 'error', message: msg });
    } finally {
      setVotingProposal(null);
    }
  };

  const unvotedProposals = proposals.filter((p) => p.userVote === undefined || p.userVote === 0);

  return (
    <div className="space-y-8">
      {/* Voting Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-purple-500/30 bg-slate-900/80 backdrop-blur-xl">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300">
            🗳️ Centro de Votaciones
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Sección dedicada a la emisión de voto. El voto emitido es definitivo y no se puede modificar.
          </p>
        </div>

        {/* Modo de Gas Selector */}
        <div className="flex items-center gap-3 bg-slate-950/90 p-2 rounded-2xl border border-slate-800 shrink-0">
          <span className="text-xs font-bold text-slate-300 pl-2">Modalidad de Voto:</span>
          <button
            type="button"
            onClick={() => setIsGasless(true)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 flex items-center gap-1.5 ${
              isGasless
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Sin Gas (Relayer)
          </button>
          <button
            type="button"
            onClick={() => setIsGasless(false)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 flex items-center gap-1.5 ${
              !isGasless
                ? 'bg-slate-700 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⛽ Con Gas (Directo)
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

      {/* Unvoted Banner Status */}
      {isMember && unvotedProposals.length > 0 && (
        <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">🗳️</span>
            <div>
              <h4 className="font-extrabold text-white text-sm">
                Tienes <span className="text-cyan-300">{unvotedProposals.length} votación(es) pendiente(s)</span>
              </h4>
              <p className="text-slate-300 text-xs">Selecciona con responsabilidad. Recuerda que una vez registrado, el voto es definitivo y no se puede cambiar.</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
            Voto Único
          </span>
        </div>
      )}

      {/* List of Active Voting Cards */}
      {loading ? (
        <div className="glass-card p-12 rounded-3xl border border-purple-500/20 text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Cargando centro de votación en vivo...</p>
        </div>
      ) : proposals.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-purple-500/20 text-center bg-slate-900/60">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
            🗳️
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No hay votaciones abiertas en este momento</h3>
          <p className="text-slate-400 text-sm">Todas las votaciones activas han sido completadas o no hay propuestas en periodo de votación.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {proposals.map((prop) => {
            const totalVotes = Number(prop.forVotes + prop.againstVotes + prop.abstainVotes);
            const forPercent = totalVotes > 0 ? (Number(prop.forVotes) / totalVotes) * 100 : 0;
            const againstPercent = totalVotes > 0 ? (Number(prop.againstVotes) / totalVotes) * 100 : 0;
            const abstainPercent = totalVotes > 0 ? (Number(prop.abstainVotes) / totalVotes) * 100 : 0;

            const hasVotedThis = prop.userVote !== undefined && prop.userVote !== 0;

            return (
              <div
                key={Number(prop.id)}
                className="glass-card p-7 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-purple-950/20 shadow-xl hover:border-purple-500/40 transition-all duration-300 relative overflow-hidden"
              >
                {/* Header Card */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 font-extrabold flex items-center justify-center border border-purple-500/30 text-sm">
                      #{Number(prop.id)}
                    </span>
                    <div>
                      <h3
                        onClick={() => setSelectedDetail(prop)}
                        className="text-lg font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-2"
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
                    {hasVotedThis ? (
                      <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ✓ Voto Registrado
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                        ⚠️ Pendiente por Votar
                      </span>
                    )}

                    <div className="bg-purple-950/60 border border-purple-500/30 px-3 py-1 rounded-xl text-xs font-bold text-cyan-300">
                      {ethers.formatEther(prop.amount)} ETH
                    </div>
                  </div>
                </div>

                {/* Description snippet */}
                <p className="py-4 text-slate-300 text-sm leading-relaxed line-clamp-2">
                  {prop.description}
                </p>

                {/* Voting Progress */}
                <div className="space-y-2 py-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-400">A Favor: {Number(prop.forVotes)} ({forPercent.toFixed(0)}%)</span>
                    <span className="text-rose-400">En Contra: {Number(prop.againstVotes)} ({againstPercent.toFixed(0)}%)</span>
                    <span className="text-slate-400">Abstenciones: {Number(prop.abstainVotes)}</span>
                  </div>

                  <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden flex">
                    <div style={{ width: `${forPercent}%` }} className="bg-emerald-500 h-full" />
                    <div style={{ width: `${againstPercent}%` }} className="bg-rose-500 h-full" />
                    <div style={{ width: `${abstainPercent}%` }} className="bg-slate-600 h-full" />
                  </div>
                </div>

                {/* User Vote Status Badge */}
                {hasVotedThis && (
                  <div className="mt-3 text-xs text-purple-300 bg-purple-950/40 border border-purple-500/30 p-2.5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>
                        Voto emitido:{' '}
                        <strong className="text-white">
                          {prop.userVote === 1 ? 'A FAVOR (FOR)' : prop.userVote === 2 ? 'EN CONTRA (AGAINST)' : 'ABSTENCIÓN'}
                        </strong>
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-300 font-bold">🔒 Voto Definitivo (No modificable)</span>
                  </div>
                )}

                {/* Action Buttons: Emit Vote */}
                <div className="pt-4 mt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleVote(Number(prop.id), VoteType.FOR)}
                      disabled={votingProposal === Number(prop.id) || !isMember || hasVotedThis}
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      👍 A Favor
                    </button>

                    <button
                      onClick={() => handleVote(Number(prop.id), VoteType.AGAINST)}
                      disabled={votingProposal === Number(prop.id) || !isMember || hasVotedThis}
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      👎 En Contra
                    </button>

                    <button
                      onClick={() => handleVote(Number(prop.id), VoteType.ABSTAIN)}
                      disabled={votingProposal === Number(prop.id) || !isMember || hasVotedThis}
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-extrabold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      ⚪ Abstenerse
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedDetail(prop)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>🔍 Ver Información Detallada</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Proposal Detail Modal with Voting Actions enabled */}
      {selectedDetail && (
        <ProposalDetailModal
          proposal={selectedDetail}
          onClose={() => setSelectedDetail(null)}
          onRefresh={loadActiveProposals}
          blockchainTime={blockchainTime}
          showVotingActions={true}
        />
      )}
    </div>
  );
}
