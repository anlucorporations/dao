'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ethers } from 'ethers';
import { getProvider, getSigner, WindowWithEthereum } from '@/lib/web3';
import { checkIsMember, getDAOBalance, getUserBalance, getProposalCount, getProposal, getUserVote } from '@/lib/daoHelpers';
import { Proposal } from '@/lib/contracts';
import WalletConnect from '@/components/WalletConnect';

declare const window: WindowWithEthereum;

export default function DashboardPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [daoBalance, setDaoBalance] = useState<string>('0');
  const [userBalanceInDAO, setUserBalanceInDAO] = useState<string>('0');
  const [activeProposals, setActiveProposals] = useState<Proposal[]>([]);
  const [unvotedCount, setUnvotedCount] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoadingStats(true);
        const activeSigner = await getSigner();
        const provider = getProvider();

        let currentAddr: string | null = null;

        if (activeSigner) {
          currentAddr = await activeSigner.getAddress();
          setAccount(currentAddr);

          if (provider) {
            const memberStatus = await checkIsMember(provider, currentAddr);
            setIsMember(memberStatus);

            const userBal = await getUserBalance(provider, currentAddr);
            setUserBalanceInDAO(ethers.formatEther(userBal));
          }
        } else {
          setAccount(null);
          setIsMember(false);
          setUserBalanceInDAO('0');
        }

        if (provider) {
          const totalBal = await getDAOBalance(provider);
          setDaoBalance(ethers.formatEther(totalBal));

          const count = await getProposalCount(provider);
          const blockNumber = await provider.getBlockNumber();
          const latestBlock = await provider.getBlock(blockNumber);
          const now = latestBlock ? Number(latestBlock.timestamp) : Math.floor(Date.now() / 1000);

          const activeList: Proposal[] = [];
          let unvotedCounter = 0;

          for (let i = 1; i <= Number(count); i++) {
            const p = await getProposal(provider, i);
            const deadline = Number(p.votingDeadline);
            const executed = p.executed;
            const rejected = p.rejected;

            if (!executed && !rejected && now < deadline) {
              activeList.push(p);

              if (currentAddr) {
                try {
                  const voteType = await getUserVote(provider, i, currentAddr);
                  if (Number(voteType) === 0) {
                    unvotedCounter++;
                  }
                } catch {
                  unvotedCounter++;
                }
              }
            }
          }

          setActiveProposals(activeList.reverse());
          setUnvotedCount(unvotedCounter);
        }
      } catch (err) {
        console.error('Error al cargar datos del resumen:', err);
      } finally {
        setLoadingStats(false);
      }
    }

    loadDashboardData();

    if (typeof window !== 'undefined' && window.ethereum && window.ethereum.on) {
      window.ethereum.on('accountsChanged', (accounts: unknown) => {
        const accs = accounts as string[];
        if (accs && accs.length > 0) {
          setAccount(accs[0]);
          loadDashboardData();
        } else {
          setAccount(null);
          setIsMember(false);
        }
      });
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Section Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">📊 Resumen</h1>
        <p className="text-slate-400 text-sm mt-1">
          Panel de control con el balance de tu membresía, tesorería de la DAO y métricas de propuestas activas.
        </p>
      </div>

      {/* Check Wallet Connection */}
      {!account ? (
        <div className="glass-card p-12 rounded-3xl border border-purple-500/30 bg-slate-900/90 text-center space-y-6 max-w-xl mx-auto my-12">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-4xl border border-purple-500/30">
            🔐
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white mb-2">Inicia Sesión con tu Billetera</h2>
            <p className="text-slate-400 text-sm">
              Para acceder al Resumen de gobernanza, administrar tu balance o interactuar con las propuestas, conecta tu billetera MetaMask.
            </p>
          </div>
          <div className="flex justify-center pt-2">
            <WalletConnect />
          </div>
        </div>
      ) : (
        <>
          {/* Banner de Estado de Socio si no está inscrito */}
          {!isMember && (
            <div className="glass-card p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-2xl shrink-0 border border-amber-500/30">
                  💳
                </div>
                <div>
                  <h3 className="font-bold text-amber-300 text-base">Inscripción Pendiente</h3>
                  <p className="text-xs text-amber-200/80 mt-0.5">
                    Tu billetera no está registrada como socio activo de la DAO. Deposita 3 ETH para desbloquear derechos de voto y creación de propuestas.
                  </p>
                </div>
              </div>

              <Link href="/dashboard/treasury">
                <button className="px-6 py-3 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/20 shrink-0 transition-all">
                  Inscribirme Ahora (3 ETH)
                </button>
              </Link>
            </div>
          )}

          {/* Metrics Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Card 1: Balance del Socio */}
            <div className="glass-card p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Tu Balance en la DAO</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isMember ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                  {isMember ? '✓ Socio Activo' : '⚠ No Inscrito'}
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {loadingStats ? '...' : parseFloat(userBalanceInDAO).toFixed(4)} <span className="text-sm font-semibold text-purple-300">ETH</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-2 font-mono truncate">
                {account}
              </div>
            </div>

            {/* Card 2: Balance Tesorería DAO */}
            <div className="glass-card p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                Balance Total Tesorería
              </div>
              <div className="text-3xl font-extrabold text-white">
                {loadingStats ? '...' : parseFloat(daoBalance).toFixed(4)} <span className="text-sm font-semibold text-cyan-300">ETH</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                Fondo administrado colectivamente
              </div>
            </div>

            {/* Card 3: Propuestas Activas Count */}
            <div className="glass-card p-6 rounded-3xl border border-pink-500/30 bg-gradient-to-br from-pink-950/40 via-slate-900 to-slate-950">
              <div className="text-xs font-bold uppercase tracking-wider text-pink-400 mb-2">
                Propuestas en Votación Activa
              </div>
              <div className="text-3xl font-extrabold text-white">
                {loadingStats ? '...' : activeProposals.length} <span className="text-sm font-semibold text-pink-300">Activas</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                Votaciones abiertas a la comunidad
              </div>
            </div>
          </div>

          {/* Banner con Conteo de Propuestas Sin Votar que Redirige a Votación */}
          {isMember && unvotedCount > 0 && (
            <div className="glass-card p-6 rounded-3xl border border-purple-500/50 bg-gradient-to-r from-purple-950/70 via-slate-900 to-cyan-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-purple-600/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-2xl shrink-0 border border-purple-500/40 animate-pulse">
                  🗳️
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    Tienes <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-pink-300">{unvotedCount} propuesta(s) activa(s)</span> sin votar
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Como socio de la DAO, tu voto es determinante para aprobar o rechazar propuestas. ¡Haz escuchar tu voz!
                  </p>
                </div>
              </div>

              <Link href="/dashboard/proposals" className="shrink-0 w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 py-3 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-400 shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2">
                  <span>Ir a Votación</span>
                  <span className="text-sm">→</span>
                </button>
              </Link>
            </div>
          )}

          {/* Active Proposals Summary Section */}
          <div className="glass-card p-8 rounded-3xl border border-purple-500/30 bg-slate-900/80 backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300">
                  Propuestas Activas
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Resumen de propuestas actualmente abiertas a votación en la plataforma.
                </p>
              </div>

              <Link
                href="/dashboard/proposals"
                className="text-xs font-bold text-cyan-300 hover:text-white transition-colors"
              >
                Ir a Votación Completa →
              </Link>
            </div>

            {loadingStats ? (
              <div className="p-8 text-center text-slate-400 text-sm animate-pulse">
                Cargando propuestas activas...
              </div>
            ) : activeProposals.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-2xl">📋</div>
                <h4 className="font-bold text-white text-sm">No hay propuestas activas en este momento</h4>
                <p className="text-xs text-slate-400">
                  Puedes formular una propuesta desde la sección{' '}
                  <Link href="/dashboard/proposals/create" className="text-purple-300 font-bold underline">
                    Crear Propuesta
                  </Link>.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeProposals.map((prop) => {
                  const totalVotes = Number(prop.forVotes + prop.againstVotes + prop.abstainVotes);
                  const forPercent = totalVotes > 0 ? (Number(prop.forVotes) / totalVotes) * 100 : 0;
                  const againstPercent = totalVotes > 0 ? (Number(prop.againstVotes) / totalVotes) * 100 : 0;

                  return (
                    <div
                      key={Number(prop.id)}
                      className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 font-extrabold text-xs">
                            #{Number(prop.id)}
                          </span>
                          <h3 className="font-bold text-white text-base">{prop.title}</h3>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">{prop.description}</p>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Beneficiario: {prop.recipient}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 w-full md:w-auto shrink-0">
                        <div className="text-sm font-extrabold text-cyan-300 bg-cyan-950/40 px-3 py-1 rounded-xl border border-cyan-500/30">
                          {ethers.formatEther(prop.amount)} ETH
                        </div>

                        <div className="w-full md:w-48 space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-emerald-400">A FAVOR: {forPercent.toFixed(0)}%</span>
                            <span className="text-rose-400">EN CONTRA: {againstPercent.toFixed(0)}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
                            <div style={{ width: `${forPercent}%` }} className="bg-emerald-500 h-full" />
                            <div style={{ width: `${againstPercent}%` }} className="bg-rose-500 h-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
