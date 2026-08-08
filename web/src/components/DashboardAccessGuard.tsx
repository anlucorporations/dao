'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProvider, getSigner, WindowWithEthereum } from '@/lib/web3';
import { checkIsMember, registerMemberDirect } from '@/lib/daoHelpers';
import WalletConnect from '@/components/WalletConnect';

declare const window: WindowWithEthereum;

export default function DashboardAccessGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [account, setAccount] = useState<string | null>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function checkAccess() {
      try {
        setLoading(true);
        const signer = await getSigner();
        const provider = getProvider();

        if (signer && provider) {
          const addr = await signer.getAddress();
          setAccount(addr);

          const memberStatus = await checkIsMember(provider, addr);
          setIsMember(memberStatus);
        } else {
          setAccount(null);
          setIsMember(false);
        }
      } catch (err) {
        console.error('Error al comprobar acceso al Dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();

    if (typeof window !== 'undefined' && window.ethereum && window.ethereum.on) {
      window.ethereum.on('accountsChanged', (accounts: unknown) => {
        const accs = accounts as string[];
        if (accs && accs.length > 0) {
          setAccount(accs[0]);
          checkAccess();
        } else {
          setAccount(null);
          setIsMember(false);
          setLoading(false);
        }
      });
    }
  }, []);

  const handleRegister = async () => {
    setError(null);
    setSuccess(null);
    setActionLoading(true);

    try {
      const signer = await getSigner();
      if (!signer) throw new Error('Por favor conecta tu billetera MetaMask.');

      const addr = await signer.getAddress();
      const provider = getProvider();
      if (provider) {
        const alreadyMember = await checkIsMember(provider, addr);
        if (alreadyMember) {
          setIsMember(true);
          setSuccess('🎉 Tu billetera ya está inscrita y certificada como socio de la DAO.');
          return;
        }
      }

      await registerMemberDirect(signer);
      setSuccess('🎉 ¡Inscripción exitosa! Te has registrado como Socio Certificado con 3 ETH.');
      
      if (provider) {
        const memberStatus = await checkIsMember(provider, addr);
        setIsMember(memberStatus);
      }
    } catch (err: unknown) {
      console.error('Error en inscripción:', err);
      const msg = err instanceof Error ? err.message : 'Fallo en la inscripción de socio.';
      
      if (msg.includes('ya esta inscrito') || msg.includes('ya está inscrito')) {
        setIsMember(true);
        setSuccess('🎉 Tu billetera ya se encuentra inscrita en la DAO.');
      } else {
        setError(msg);
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-semibold animate-pulse">
          Verificando credenciales de membresía en la blockchain...
        </p>
      </div>
    );
  }

  // SI NO TIENE BILLETERA CONECTADA O NO ESTÁ INSCRITO: MOSTRAR OPCIÓN DE INSCRIPCIÓN
  if (!account || !isMember) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full glass-card p-8 sm:p-12 rounded-3xl border border-purple-500/40 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-purple-950/40 backdrop-blur-2xl shadow-2xl space-y-8 relative overflow-hidden text-center">
          
          {/* Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header Icon */}
          <div className="relative z-10 space-y-3">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600/20 to-pink-500/20 text-purple-300 flex items-center justify-center text-4xl border border-purple-500/40 shadow-xl shadow-purple-600/20">
              🛡️
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-extrabold">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>Inscripción de Socio Requerida</span>
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Inscríbete para Desbloquear el Dashboard
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
              Tu billetera no se encuentra inscrita en la DAO. Para ingresar al Dashboard y participar en la gobernanza, completa tu depósito único de <strong>3.0 ETH</strong>.
            </p>
          </div>

          {/* Action Form / Error / Success Messages */}
          <div className="relative z-10 space-y-4">
            {error && (
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-center gap-2">
                <span>🎉</span>
                <span>{success}</span>
              </div>
            )}

            {!account ? (
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Paso 1: Conecta tu Billetera Web3
                </p>
                <div className="flex justify-center">
                  <WalletConnect />
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Paso 2: Confirmar Depósito de Membresía</span>
                  <span className="text-xs font-mono text-slate-400 truncate max-w-[180px]">{account}</span>
                </div>

                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>Monto de Inscripción:</span>
                    <span className="text-cyan-300 font-extrabold text-sm">3.00 ETH</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Al presionar el botón, se enviará una transacción de 3 ETH al Smart Contract. Quedarás certificado como socio activo e ingresarás al Dashboard inmediatamente.
                  </p>
                </div>

                <button
                  onClick={handleRegister}
                  disabled={actionLoading}
                  className="w-full py-4 px-6 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-400 shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <span>Procesando Inscripción en Blockchain (3 ETH)...</span>
                  ) : (
                    <>
                      <span>🛡️ Inscribirse como Socio (3.0 ETH) y Entrar</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => router.replace('/')}
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                ← Volver a la Página de Inicio
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // SI ESTÁ CONECTADO Y ES SOCIO REGISTRADO: DESBLOQUEA EL DASHBOARD COMPLETO
  return <>{children}</>;
}
