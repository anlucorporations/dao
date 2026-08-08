'use client';

import React, { useState } from 'react';
import ProposalList from '@/components/ProposalList';
import ProposalHistory from '@/components/ProposalHistory';
import CreateProposal from '@/components/CreateProposal';
import ProposalDetailModal from '@/components/ProposalDetailModal';
import { Proposal } from '@/lib/contracts';

interface ProposalManagementProps {
  initialTab?: 'active' | 'history';
  showCreateModalInitially?: boolean;
}

export default function ProposalManagement({
  initialTab = 'active',
  showCreateModalInitially = false
}: ProposalManagementProps) {
  const [tab, setTab] = useState<'active' | 'history'>(initialTab);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(showCreateModalInitially);
  const [selectedProposal, setSelectedProposal] = useState<(Proposal & { userVote?: number }) | null>(null);

  return (
    <div className="space-y-8">
      {/* Integral Management Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">📋 Gestión Integral de Propuestas</h1>
          <p className="text-slate-400 text-sm mt-1">
            Visualiza detalles exhaustivos de cada propuesta, participa en votaciones y abre el formulador flotante para nuevas propuestas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
          {/* Floating Create Proposal Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1 md:flex-initial px-5 py-3 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-400 shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 group"
          >
            <span className="group-hover:rotate-90 transition-transform">➕</span>
            <span>Crear Propuesta (Formulario Flotante)</span>
          </button>

          {/* Tab Selector: Propuestas Activas vs Histórico */}
          <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-purple-500/30 backdrop-blur-xl flex items-center shrink-0 shadow-lg">
            <button
              onClick={() => setTab('active')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all duration-300 flex items-center gap-1.5 ${
                tab === 'active'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📋</span>
              <span>Activas</span>
            </button>

            <button
              onClick={() => setTab('history')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all duration-300 flex items-center gap-1.5 ${
                tab === 'history'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📜</span>
              <span>Histórico</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Active Tab Content */}
      {tab === 'active' && (
        <ProposalList onSelectProposal={(p) => setSelectedProposal(p)} />
      )}

      {tab === 'history' && (
        <ProposalHistory onSelectProposal={(p) => setSelectedProposal(p)} />
      )}

      {/* FORMULARIO FLOTANTE (MODAL DE CREACIÓN DE PROPUESTAS) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl my-8">
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-base transition-colors"
              >
                ✕
              </button>
            </div>
            <CreateProposal
              onProposalCreated={() => {
                setIsCreateModalOpen(false);
                setTab('active');
              }}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* MODAL DE INFORMACIÓN DETALLADA DE PROPUESTA */}
      {selectedProposal && (
        <ProposalDetailModal
          proposal={selectedProposal}
          onClose={() => setSelectedProposal(null)}
          onRefresh={() => setSelectedProposal(null)}
        />
      )}
    </div>
  );
}
