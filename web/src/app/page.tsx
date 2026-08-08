'use client';

import React from 'react';
import Link from 'next/link';
import WalletConnect from '@/components/WalletConnect';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { Footer } from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Landing Page Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-tr from-purple-400 to-cyan-300 text-lg">
                DAO
              </div>
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight">Plataforma DAO</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                EIP-2771 Gasless
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-300">
            <a href="#casos-de-uso" className="hover:text-purple-400 transition-colors">Casos de Uso</a>
            <a href="#contacto" className="hover:text-purple-400 transition-colors">Contacto & Redes</a>
            <Link href="/dashboard" className="text-cyan-300 hover:text-white transition-colors">Ingresar al Dashboard →</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-lg shadow-purple-600/30 transition-all">
                Ir al Dashboard
              </button>
            </Link>
            <div className="hidden sm:block">
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      {/* Landing Sections */}
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}
