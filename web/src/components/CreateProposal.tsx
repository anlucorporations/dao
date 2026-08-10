'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getSigner } from '@/lib/web3';
import { getForwarderContract, DAO_CONTRACT_ADDRESS } from '@/lib/contracts';
import { createProposalDirect, checkIsMember, getDAOBalance, getUserBalance } from '@/lib/daoHelpers';
import { buildCreateProposalRequest, signMetaTxRequest } from '@/lib/metaTx';

interface CreateProposalProps {
  signer?: ethers.Signer | null;
  account?: string | null;
  onProposalCreated?: () => void;
  onCancel?: () => void;
}

export default function CreateProposal({ signer, account, onProposalCreated, onCancel }: CreateProposalProps) {
  const [title, setTitle] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('7'); // días
  const [description, setDescription] = useState('');
  const [isGasless, setIsGasless] = useState(true);
  
  const [isMember, setIsMember] = useState<boolean>(false);
  const [checkingMember, setCheckingMember] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentAccount, setCurrentAccount] = useState<string | null>(account || null);

  useEffect(() => {
    let isMounted = true;
    async function loadMemberStatus() {
      try {
        setCheckingMember(true);
        const activeSigner = signer || (await getSigner());
        if (!activeSigner) {
          if (isMounted) {
            setIsMember(false);
            setCheckingMember(false);
          }
          return;
        }

        const addr = account || (await activeSigner.getAddress());
        if (isMounted) setCurrentAccount(addr);

        const memberStatus = await checkIsMember(activeSigner, addr);
        if (isMounted) {
          setIsMember(memberStatus);
        }
      } catch (err) {
        console.error('Error al verificar estado de socio:', err);
      } finally {
        if (isMounted) setCheckingMember(false);
      }
    }
    loadMemberStatus();
    return () => { isMounted = false; };
  }, [signer, account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const activeSigner = signer || (await getSigner());
      if (!activeSigner) {
        throw new Error('Debes conectar tu billetera MetaMask para continuar.');
      }

      const userAddress = await activeSigner.getAddress();
      
      const member = await checkIsMember(activeSigner, userAddress);
      if (!member) {
        throw new Error('Solo los socios inscritos de la DAO (depósito de 3 ETH) pueden crear propuestas.');
      }

      if (!title.trim()) throw new Error('El título de la propuesta es requerido.');
      if (!recipient || !ethers.isAddress(recipient)) throw new Error('Dirección de beneficiario inválida.');
      if (!amount || parseFloat(amount) <= 0) throw new Error('El monto debe ser mayor a 0 ETH.');

      const amountWei = ethers.parseEther(amount);
      const votingDurationSeconds = parseInt(duration) * 24 * 60 * 60;

      // Verificar que el monto de la propuesta no supere el balance total de la DAO
      const daoTotalBalance = await getDAOBalance(activeSigner);
      const userBalance = await getUserBalance(activeSigner, userAddress);

      if (daoTotalBalance > BigInt(0) && (userBalance * BigInt(100) < daoTotalBalance * BigInt(10))) {
        throw new Error(
          `Debes poseer al menos el 10% del balance total de la tesorería de la DAO para crear una propuesta (Posees: ${ethers.formatEther(userBalance)} ETH / Tesorería: ${ethers.formatEther(daoTotalBalance)} ETH).`
        );
      }

      if (amountWei > daoTotalBalance) {
        throw new Error(
          `El monto solicitado (${amount} ETH) supera el balance total disponible en la tesorería de la DAO (${ethers.formatEther(daoTotalBalance)} ETH).`
        );
      }

      if (isGasless) {
        const forwarder = getForwarderContract(activeSigner);
        
        const requestData = await buildCreateProposalRequest(
          DAO_CONTRACT_ADDRESS,
          userAddress,
          title,
          recipient,
          amountWei,
          votingDurationSeconds,
          description
        );

        const { request, signature } = await signMetaTxRequest(
          activeSigner,
          forwarder,
          requestData
        );

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

        const data = await response.json();
        if (!response.ok || data.error) {
          const detail = data.message ? `${data.error}: ${data.message}` : data.error;
          throw new Error(detail || 'Error al procesar la propuesta mediante el relayer.');
        }

        setSuccess('🎉 Propuesta creada exitosamente sin pagar comisiones de gas (Relayed)!');
      } else {
        await createProposalDirect(
          activeSigner,
          title,
          recipient,
          amountWei,
          votingDurationSeconds,
          description
        );

        setSuccess('🎉 Propuesta creada exitosamente en la blockchain!');
      }

      setTitle('');
      setRecipient('');
      setAmount('');
      setDuration('7');
      setDescription('');

      if (onProposalCreated) {
        onProposalCreated();
      }
    } catch (err: unknown) {
      console.error('Error al crear propuesta:', err);
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as { message: string }).message);
      } else {
        setError('No se pudo crear la propuesta. Verifica tu saldo e inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-purple-950/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-400">
            Crear Nueva Propuesta
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Estipula el título, monto a transferir, billetera beneficiaria y modalidad de envío.
          </p>
        </div>

        <div className="bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80 flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsGasless(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
              isGasless
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Sin Gas (Relayer)
          </button>
          <button
            type="button"
            onClick={() => setIsGasless(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
              !isGasless
                ? 'bg-slate-700 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            Con Gas (Directo)
          </button>
        </div>
      </div>

      {!currentAccount && !signer ? (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <p className="text-slate-400 text-sm">
            Conecta tu billetera para verificar si estás inscrito y poder formular propuestas.
          </p>
        </div>
      ) : checkingMember ? (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center animate-pulse">
          <p className="text-purple-400 text-sm">Verificando estado de membresía en la DAO...</p>
        </div>
      ) : !isMember ? (
        <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-amber-300 text-base mb-1">Membresía Requerida</h4>
            <p className="text-sm text-amber-200/80">
              Para poder crear una propuesta en la DAO es necesario estar previamente inscrito como socio activo (depósito único de 3 ETH). Por favor dirígete a la pestaña <strong>Inscripción de Socio</strong> para registrar tu billetera.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Título de la Propuesta *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Financiamiento para Desarrollo de Protocolo V2"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Billetera Beneficiaria *
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Monto a Transferir (ETH) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1.5"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Duración de la Votación (Días) *
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Descripción y Objetivos *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalla los objetivos de la propuesta, la justificación del monto y el plan de ejecución..."
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-6 py-4 rounded-2xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all text-sm shrink-0"
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-4 px-6 rounded-2xl font-bold text-white transition-all duration-300 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${
                isGasless
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-400 shadow-purple-600/30'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/30'
              }`}
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{isGasless ? 'Firmando Meta-Transacción Sin Gas...' : 'Enviando Transacción a Blockchain...'}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>{isGasless ? 'Crear Propuesta (Sin Gas ⚡)' : 'Crear Propuesta (Con Gas ⛽)'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
