'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getSigner } from '@/lib/web3';
import { registerMemberDirect, checkIsMember } from '@/lib/daoHelpers';

interface RegisterMemberProps {
  signer?: ethers.Signer | null;
  account?: string | null;
  onMemberStatusChange?: () => void;
}

export default function RegisterMember({ signer, account, onMemberStatusChange }: RegisterMemberProps) {
  const [isMember, setIsMember] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentAccount, setCurrentAccount] = useState<string | null>(account || null);

  useEffect(() => {
    let isMounted = true;
    async function loadStatus() {
      try {
        setChecking(true);
        const activeSigner = signer || (await getSigner());
        if (!activeSigner) {
          if (isMounted) {
            setIsMember(false);
            setChecking(false);
          }
          return;
        }

        const addr = account || (await activeSigner.getAddress());
        if (isMounted) setCurrentAccount(addr);

        const status = await checkIsMember(activeSigner, addr);
        if (isMounted) {
          setIsMember(status);
        }
      } catch (err) {
        console.error('Error al verificar membresía:', err);
      } finally {
        if (isMounted) setChecking(false);
      }
    }
    loadStatus();
    return () => { isMounted = false; };
  }, [signer, account]);

  const handleRegister = async () => {
    try {
      const activeSigner = signer || (await getSigner());
      if (!activeSigner) {
        setError('Por favor, conecta tu billetera MetaMask primero.');
        return;
      }

      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      await registerMemberDirect(activeSigner);
      
      setIsMember(true);
      setSuccessMsg('🎉 ¡Felicidades! Te has inscrito exitosamente como Socio Activo de la DAO.');
      if (onMemberStatusChange) {
        onMemberStatusChange();
      }
    } catch (err: unknown) {
      console.error('Error durante la inscripción:', err);
      if (err && typeof err === 'object' && 'message' in err) {
        const msg = (err as { message: string }).message;
        if (msg.includes('user rejected') || msg.includes('ACTION_REJECTED')) {
          setError('Transacción cancelada por el usuario.');
        } else if (msg.includes('insufficient funds')) {
          setError('Fondos insuficientes en tu billetera para pagar 3 ETH + gas.');
        } else {
          setError(`Error en la inscripción: ${msg}`);
        }
      } else {
        setError('Ocurrió un error inesperado al procesar el depósito de inscripción.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!currentAccount && !signer) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-slate-900/80 to-purple-950/40 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/30">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Conecta tu Billetera</h3>
        <p className="text-slate-300 text-sm max-w-md mx-auto">
          Para verificar tu estado de membresía o inscribirte como socio de la DAO, primero conecta tu billetera MetaMask.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-slate-900/90 via-purple-950/30 to-cyan-950/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-cyan-300">
              Inscripción de Socio DAO
            </h2>
            {checking ? (
              <span className="px-3 py-1 text-xs rounded-full bg-slate-800 text-slate-400 border border-slate-700 animate-pulse">
                Verificando...
              </span>
            ) : isMember ? (
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm shadow-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Socio Activo
              </span>
            ) : (
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                No Inscrito
              </span>
            )}
          </div>
          <p className="text-slate-300 text-sm">
            Depósito obligatorio de <span className="font-bold text-cyan-300">3 ETH</span> para obtener derechos de voto y creación de propuestas.
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-3 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 border border-purple-500/30">
            <span className="font-black text-lg">3</span>
          </div>
          <div>
            <div className="text-xs text-slate-400">Cuota de Membresía</div>
            <div className="text-sm font-bold text-white">3.0 ETH</div>
          </div>
        </div>
      </div>

      {isMember ? (
        <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-emerald-300 text-base mb-1">¡Billetera Inscrita Exitosamente!</h4>
            <p className="text-sm text-emerald-200/80">
              Tu dirección <code className="bg-emerald-900/50 px-2 py-0.5 rounded text-emerald-300 text-xs font-mono">{currentAccount}</code> se encuentra registrada como socio activo de la DAO. Tienes acceso completo para crear propuestas y emitir tu voto con o sin gas.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Beneficios de la Inscripción
            </h4>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>Derecho a votar en todas las propuestas activas de la DAO.</li>
              <li>Capacidad para crear propuestas de financiamiento comunitarias.</li>
              <li>Opción de elegir entre transacciones sin gas (vía Relayer) o transacciones en cadena directas.</li>
              <li>Los 3 ETH de inscripción se suman al balance de tu cuenta en la tesorería de la DAO.</li>
            </ul>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-400 transition-all duration-300 shadow-xl shadow-purple-600/30 hover:shadow-purple-500/50 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Procesando Inscripción de 3 ETH...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Inscribirse como Socio (Depositar 3 ETH)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
