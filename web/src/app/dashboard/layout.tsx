import React from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import DashboardAccessGuard from '@/components/DashboardAccessGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden">
      {/* Glow Ambient Lights */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Header with Integrated Navigation Bar */}
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <DashboardAccessGuard>
          {children}
        </DashboardAccessGuard>
      </main>

      <footer className="mt-16 border-t border-purple-500/20 py-8 text-center text-xs text-slate-500">
        Plataforma de Gobernanza DAO Gasless • Implementación EIP-2771 con MinimalForwarder & Next.js 15
      </footer>
    </div>
  );
}
