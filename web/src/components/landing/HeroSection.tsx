'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import WalletConnect from '@/components/WalletConnect';

export function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-12 pb-20">
      {/* Glow Ambient Light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/20 via-pink-500/15 to-cyan-400/20 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Badge Intro */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-purple-500/30 backdrop-blur-xl mb-8 transform transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300">
            Plataforma de Gobernanza DAO de Última Generación
          </span>
        </div>

        {/* Main Headline */}
        <div className={`space-y-6 transform transition-all duration-1000 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-none text-white">
            Gobernanza Descentralizada <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-300">
              Votación Sin Gas (EIP-2771)
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Participa activamente en la toma de decisiones comunitarias, financiamiento de proyectos y administración de la tesorería. Transacciones firmadas fuera de la cadena sin costo de gas gracias a nuestro protocolo de meta-transacciones.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link href="/dashboard">
              <button className="px-8 py-4 rounded-2xl font-extrabold text-sm sm:text-base text-white bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-400 transition-all duration-300 shadow-xl shadow-purple-600/30 hover:shadow-purple-500/50 hover:scale-[1.03] active:scale-[0.98] flex items-center gap-3">
                <span>Ingresar a la Plataforma (Dashboard)</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </Link>

            <a href="#casos-de-uso">
              <button className="px-8 py-4 rounded-2xl font-bold text-sm sm:text-base text-slate-200 bg-slate-900/80 border border-slate-700/80 hover:bg-slate-800 transition-all hover:border-purple-500/40">
                Explorar Casos de Uso
              </button>
            </a>
          </div>

          <div className="pt-4 flex justify-center">
            <WalletConnect />
          </div>
        </div>

        {/* Feature Cards Showcase */}
        <div className={`mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 transform transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="glass-card p-6 rounded-3xl border border-purple-500/20 bg-slate-900/60 backdrop-blur-xl text-left hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-4 text-2xl font-bold border border-purple-500/30">
              ⚡
            </div>
            <h3 className="font-bold text-white text-base mb-1">Votación 100% Sin Gas</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Firma digitalmente tus votos con MetaMask sin gastar tu saldo de ETH. El relayer se encarga de pagar la comisión.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-purple-500/20 bg-slate-900/60 backdrop-blur-xl text-left hover:border-cyan-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-4 text-2xl font-bold border border-cyan-500/30">
              💳
            </div>
            <h3 className="font-bold text-white text-base mb-1">Socios Inscritos (3 ETH)</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Un registro transparente mediante depósito de 3 ETH que otorga acceso exclusivo a voto y creación de propuestas.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-purple-500/20 bg-slate-900/60 backdrop-blur-xl text-left hover:border-pink-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-300 flex items-center justify-center mb-4 text-2xl font-bold border border-pink-500/30">
              🔒
            </div>
            <h3 className="font-bold text-white text-base mb-1">Ejecución Automatizada</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Las propuestas aprobadas se ejecutan automáticamente tras transcurrir el período de votación y el plazo de retardo de seguridad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
