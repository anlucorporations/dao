'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getProvider, getSigner } from '@/lib/web3';
import { checkIsMember, getUserBalance, getMemberCount } from '@/lib/daoHelpers';
import ConfigCheck from '@/components/ConfigCheck';

interface SystemStatus {
  ownerAddress: string;
  relayer: {
    address: string;
    balanceETH: string;
    status: string;
  };
  contracts: {
    daoAddress: string;
    daoDeployed: boolean;
    forwarderAddress: string;
    forwarderDeployed: boolean;
  };
  network: {
    rpcUrl: string;
    chainId: number;
    blockNumber: number;
    status: string;
  };
}

export default function SystemPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  // Estados de consulta individual de socio
  const [searchAddress, setSearchAddress] = useState<string>('');
  const [searchResult, setSearchResult] = useState<{
    address: string;
    isMember: boolean;
    daoBalanceETH: string;
    walletBalanceETH: string;
  } | null>(null);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  // Estados de Diagnóstico
  const [diagResults, setDiagResults] = useState<{
    rpcPing: 'pending' | 'success' | 'failed';
    relayerCheck: 'pending' | 'success' | 'failed';
    daemonCheck: 'pending' | 'success' | 'failed';
    contractsBytecode: 'pending' | 'success' | 'failed';
  } | null>(null);
  const [diagRunning, setDiagRunning] = useState<boolean>(false);

  const OWNER_ADDRESS = process.env.NEXT_PUBLIC_OWNER_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

  useEffect(() => {
    async function initSystem() {
      try {
        setLoading(true);
        const signer = await getSigner();
        let currentAddr: string | null = null;
        if (signer) {
          currentAddr = await signer.getAddress();
          setAccount(currentAddr);
          setIsOwner(currentAddr.toLowerCase() === OWNER_ADDRESS.toLowerCase());
        } else {
          setAccount(null);
          setIsOwner(false);
        }

        // Cargar estado de la API del sistema
        const res = await fetch('/api/system/status');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSystemStatus(data);
          }
        }
      } catch (err) {
        console.error('Error al inicializar panel de sistema:', err);
      } finally {
        setLoading(false);
      }
    }

    initSystem();
  }, [OWNER_ADDRESS]);

  const handleSearchMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchAddress || !ethers.isAddress(searchAddress)) {
      alert('Ingresa una dirección Ethereum válida (0x...).');
      return;
    }

    setSearchLoading(true);
    setSearchResult(null);

    try {
      const provider = getProvider();
      if (!provider) throw new Error('Proveedor no disponible.');

      const memberStatus = await checkIsMember(provider, searchAddress);
      const daoBal = await getUserBalance(provider, searchAddress);
      const walletWei = await provider.getBalance(searchAddress);

      setSearchResult({
        address: searchAddress,
        isMember: memberStatus,
        daoBalanceETH: ethers.formatEther(daoBal),
        walletBalanceETH: parseFloat(ethers.formatEther(walletWei)).toFixed(4)
      });
    } catch (err) {
      console.error('Error al buscar socio:', err);
      alert('Fallo la consulta del socio en la blockchain.');
    } finally {
      setSearchLoading(false);
    }
  };

  const runFullDiagnostics = async () => {
    setDiagRunning(true);
    setDiagResults({
      rpcPing: 'pending',
      relayerCheck: 'pending',
      daemonCheck: 'pending',
      contractsBytecode: 'pending'
    });

    try {
      const provider = getProvider();
      let rpcPing: 'success' | 'failed' = 'failed';
      if (provider) {
        const block = await provider.getBlockNumber();
        if (block >= 0) rpcPing = 'success';
      }

      let relayerCheck: 'success' | 'failed' = 'failed';
      try {
        const relRes = await fetch('/api/system/status');
        if (relRes.ok) relayerCheck = 'success';
      } catch {
        relayerCheck = 'failed';
      }

      let daemonCheck: 'success' | 'failed' = 'failed';
      try {
        const daeRes = await fetch('/api/daemon');
        if (daeRes.ok) daemonCheck = 'success';
      } catch {
        daemonCheck = 'failed';
      }

      let contractsBytecode: 'success' | 'failed' = 'failed';
      if (systemStatus?.contracts.daoDeployed && systemStatus?.contracts.forwarderDeployed) {
        contractsBytecode = 'success';
      }

      setDiagResults({
        rpcPing,
        relayerCheck,
        daemonCheck,
        contractsBytecode
      });
    } catch (err) {
      console.error('Error en diagnóstico:', err);
    } finally {
      setDiagRunning(false);
    }
  };

  const downloadJsonReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      accountConnected: account,
      isOwner,
      systemStatus,
      diagnostics: diagResults
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `informe_diagnostico_dao_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading) {
    return (
      <div className="glass-card p-12 rounded-3xl border border-purple-500/20 text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Verificando credenciales de acceso de Administrador / Owner...</p>
      </div>
    );
  }

  // Si no es la billetera del Owner: Mostrar pantalla de acceso restringido
  if (!isOwner) {
    return (
      <ConfigCheck>
        <div className="glass-card p-10 rounded-3xl border border-rose-500/40 bg-gradient-to-b from-slate-900 via-rose-950/20 to-slate-950 text-center space-y-6 max-w-2xl mx-auto my-12 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-4xl shadow-inner">
            🔒
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Acceso Restringido Únicamente al Owner</h2>
            <p className="text-rose-300 text-xs sm:text-sm max-w-lg mx-auto">
              La sección <strong>⚙️ Sistema</strong> contiene herramientas de administración técnica, diagnóstico de relayer y registros generales exclusivos para el administrador del contrato.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-400 text-left space-y-1">
            <div>Billetera Conectada: <span className="text-white font-bold">{account || 'No Conectada'}</span></div>
            <div>Billetera Owner Requerida: <span className="text-amber-400 font-bold">{OWNER_ADDRESS}</span></div>
          </div>

          <p className="text-xs text-slate-500">
            Conecta la billetera Owner en MetaMask para acceder a este panel de administración técnica.
          </p>
        </div>
      </ConfigCheck>
    );
  }

  return (
    <ConfigCheck>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-7 rounded-3xl border border-amber-500/40 bg-gradient-to-r from-slate-900 via-amber-950/20 to-purple-950/30 shadow-2xl">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-white">⚙️ Panel de Gestión del Sistema</h1>
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-400/20">
                OWNER / ADMIN ROOT
              </span>
            </div>
            <p className="text-slate-300 text-xs mt-1">
              Control técnico centralizado de billeteras, relayer EIP-2771, Smart Contracts y verificación de socios.
            </p>
          </div>

          <div className="text-right font-mono text-xs text-slate-300 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 shrink-0">
            <span className="text-[10px] text-amber-400 font-bold uppercase block">Owner Autenticado</span>
            <span className="font-bold text-white">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
          </div>
        </div>

        {/* Section 1: Relayer & Wallet Status */}
        <div className="glass-card p-7 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🖥️ Billeteras del Sistema & Relayer Serverless</span>
            </h3>
            <span className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold">
              EIP-2771 Relayer
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Billetera Relayer (Comisiones de Gas)</span>
              <div className="font-mono font-bold text-white break-all bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                {systemStatus?.relayer.address || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Saldo Disponible en Relayer:</span>
                <span className="font-extrabold text-cyan-300">{systemStatus?.relayer.balanceETH || '0.0000'} ETH</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Billetera Owner Administradora</span>
              <div className="font-mono font-bold text-white break-all bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                {systemStatus?.ownerAddress || OWNER_ADDRESS}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Estado de Autorización:</span>
                <span className="font-extrabold text-emerald-400">✓ Superusuario Activo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Deployed Smart Contracts */}
        <div className="glass-card p-7 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📜 Smart Contracts Desplegados & Red EVM</span>
            </h3>
            <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold">
              Solidity 0.8.19
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">DAOVoting.sol</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">🟢 Desplegado</span>
              </div>
              <div className="font-mono text-[11px] text-slate-400 break-all bg-slate-900 p-2 rounded-lg">
                {systemStatus?.contracts.daoAddress}
              </div>
              <ul className="text-[10px] text-slate-400 space-y-1 pt-1">
                <li>• Membresía Fija: <strong>3.0 ETH</strong></li>
                <li>• Umbral Propuestas: <strong>10% Tesorería</strong></li>
                <li>• Execution Delay: <strong>1 Día</strong></li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">MinimalForwarder.sol</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">🟢 Desplegado</span>
              </div>
              <div className="font-mono text-[11px] text-slate-400 break-all bg-slate-900 p-2 rounded-lg">
                {systemStatus?.contracts.forwarderAddress}
              </div>
              <ul className="text-[10px] text-slate-400 space-y-1 pt-1">
                <li>• Estándar: <strong>EIP-712 Meta-Tx</strong></li>
                <li>• Dominio: <strong>MinimalForwarder v1</strong></li>
                <li>• Anti-Replay: <strong>Mapping Nonce</strong></li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Red Blockchain RPC</span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">Anvil / Hardhat</span>
              </div>
              <div className="font-mono text-[11px] text-cyan-300 bg-slate-900 p-2 rounded-lg">
                {systemStatus?.network.rpcUrl}
              </div>
              <ul className="text-[10px] text-slate-400 space-y-1 pt-1">
                <li>• Chain ID: <strong>{systemStatus?.network.chainId}</strong></li>
                <li>• Último Bloque: <strong>#{systemStatus?.network.blockNumber}</strong></li>
                <li>• Estado RPC: <strong>{systemStatus?.network.status}</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 3: Certified Member Management & Search */}
        <div className="glass-card p-7 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>👥 Inspección & Verificación de Socios Certificados</span>
            </h3>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
              Registro Criptográfico
            </span>
          </div>

          <form onSubmit={handleSearchMember} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-300 block">
              Buscador Criptográfico de Billeteras de Socios (Dirección Ethereum 0x...):
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Ingresa dirección 0x..."
                required
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
              />
              <button
                type="submit"
                disabled={searchLoading}
                className="px-6 py-3 rounded-xl font-extrabold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all disabled:opacity-50 shrink-0"
              >
                {searchLoading ? 'Consultando...' : '🔍 Inspeccionar Billetera'}
              </button>
            </div>
          </form>

          {/* Search Result Display */}
          {searchResult && (
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-amber-500/40 space-y-3 text-xs animate-fade-in">
              <div className="flex items-center justify-between font-mono font-bold text-white border-b border-slate-800 pb-2">
                <span>Resultado de Inspección:</span>
                <span className="text-amber-300">{searchResult.address}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Membresía DAO</span>
                  <span className={`font-extrabold text-sm ${searchResult.isMember ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {searchResult.isMember ? '🛡️ Socio Certificado' : '❌ No Inscrito'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Balance Aportado en DAO</span>
                  <span className="font-extrabold text-sm text-purple-300">{searchResult.daoBalanceETH} ETH</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Saldo Nativo en Wallet</span>
                  <span className="font-extrabold text-sm text-cyan-300">{searchResult.walletBalanceETH} ETH</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: System Diagnostics & Report Export */}
        <div className="glass-card p-7 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🛠️ Diagnóstico Técnico & Reporte de Auditoría</span>
            </h3>
            <div className="flex gap-2">
              <button
                onClick={runFullDiagnostics}
                disabled={diagRunning}
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-purple-600 hover:bg-purple-500 transition-all disabled:opacity-50"
              >
                {diagRunning ? 'Diagnosticando...' : '⚡ Ejecutar Test de Diagnóstico'}
              </button>
              <button
                onClick={downloadJsonReport}
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
              >
                📥 Exportar JSON
              </button>
            </div>
          </div>

          {diagResults && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className={`p-3 rounded-xl border text-center font-bold ${
                diagResults.rpcPing === 'success' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}>
                <div className="text-[10px] uppercase font-bold">RPC Node Ping</div>
                <div className="mt-1">{diagResults.rpcPing === 'success' ? '✓ Respuesta OK' : '✕ Sin Respuesta'}</div>
              </div>

              <div className={`p-3 rounded-xl border text-center font-bold ${
                diagResults.relayerCheck === 'success' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}>
                <div className="text-[10px] uppercase font-bold">Relayer API</div>
                <div className="mt-1">{diagResults.relayerCheck === 'success' ? '✓ API Serverless OK' : '✕ Error'}</div>
              </div>

              <div className={`p-3 rounded-xl border text-center font-bold ${
                diagResults.daemonCheck === 'success' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}>
                <div className="text-[10px] uppercase font-bold">Daemon Auto-Exec</div>
                <div className="mt-1">{diagResults.daemonCheck === 'success' ? '✓ Servicio OK' : '✕ Error'}</div>
              </div>

              <div className={`p-3 rounded-xl border text-center font-bold ${
                diagResults.contractsBytecode === 'success' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}>
                <div className="text-[10px] uppercase font-bold">Smart Contracts</div>
                <div className="mt-1">{diagResults.contractsBytecode === 'success' ? '✓ Bytecode Verificado' : '✕ Error'}</div>
              </div>
            </div>
          )}
        </div>

      </div>
    </ConfigCheck>
  );
}
