'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-purple-500/20 bg-slate-950 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-sm border border-purple-500/30">
            DAO
          </div>
          <div>
            <div className="font-extrabold text-white">Plataforma DAO EIP-2771</div>
            <div>Votación Descentralizada Sin Gas</div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-slate-300">
          <Link href="/dashboard" className="hover:text-purple-400 transition-colors">Dashboard</Link>
          <a href="#casos-de-uso" className="hover:text-purple-400 transition-colors">Casos de Uso</a>
          <a href="#contacto" className="hover:text-purple-400 transition-colors">Contacto & Redes</a>
        </div>

        <div className="text-slate-500">
          © {new Date().getFullYear()} DAO Platform. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
