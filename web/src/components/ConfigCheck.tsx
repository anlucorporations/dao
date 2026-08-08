'use client';

import React from 'react';
import { DAO_CONTRACT_ADDRESS } from '@/lib/contracts';

export default function ConfigCheck({ children }: { children: React.ReactNode }) {
  const isConfigured = DAO_CONTRACT_ADDRESS;

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full glass-card p-8 rounded-3xl border border-purple-500/30 bg-slate-900/90 text-slate-100 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-extrabold text-white mb-2">
              Configuración Requerida
            </h1>
            <p className="text-slate-400 text-sm">
              Los contratos inteligentes aún no han sido desplegados o configurados en la red.
            </p>
          </div>

          <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 mb-6">
            <p className="text-xs font-bold text-amber-300">
              Falta la variable de entorno:
            </p>
            <ul className="list-disc list-inside text-xs text-amber-200 mt-1">
              {!DAO_CONTRACT_ADDRESS && (
                <li><code>NEXT_PUBLIC_DAO_CONTRACT_ADDRESS</code></li>
              )}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Inicio Rápido (Despliegue Local):</h2>
            <div className="bg-slate-950 text-cyan-300 rounded-xl p-4 font-mono text-xs overflow-x-auto border border-slate-800">
              <div className="text-slate-400 mb-1"># Iniciar nodo Anvil local</div>
              <div className="text-white mb-3">anvil</div>
              <div className="text-slate-400 mb-1"># Desplegar contratos inteligentes</div>
              <div className="text-white">./deploy-local.sh</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
