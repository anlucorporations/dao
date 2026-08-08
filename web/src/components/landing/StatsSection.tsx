'use client';

import React from 'react';

export function StatsSection() {
  return (
    <div className="py-16 relative border-y border-purple-500/20 bg-slate-950/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">
              0.00 ETH
            </div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Costo de Gas al Votar (Relayer)</div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">
              3.0 ETH
            </div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Inscripción Única de Socio</div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">
              EIP-2771
            </div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Estándar de Meta-Transacciones</div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">
              100%
            </div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Transparencia en Cadena</div>
          </div>
        </div>
      </div>
    </div>
  );
}
