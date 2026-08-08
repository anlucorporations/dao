'use client';

import React from 'react';

export function FeaturesSection() {
  const useCases = [
    {
      icon: '🚀',
      title: 'Financiamiento de Desarrollo & Ecosistema',
      description: 'Asignación transparente de recursos para el desarrollo de nuevos protocolos, auditorías de contratos inteligentes e infraestructura técnica.'
    },
    {
      icon: '🌱',
      title: 'Fondo de Subvenciones Comunitarias',
      description: 'Apoyo a iniciativas impulsadas por miembros de la comunidad, creadores de contenido, investigadores y proyectos de código abierto.'
    },
    {
      icon: '🏛️',
      title: 'Gestión de Tesorería & Reservas',
      description: 'Toma de decisiones colectivas para administrar las reservas de ETH, diversificación de activos y estrategias de rendimiento.'
    },
    {
      icon: '⚖️',
      title: 'Votación de Parámetros de Protocolo',
      description: 'Ajuste descentralizado de parámetros de la DAO como plazos de votación, retardo de ejecución y reglas de membresía.'
    }
  ];

  const stepsUX = [
    {
      step: '01',
      title: 'Conecta tu Billetera Web3',
      description: 'Inicia sesión conectando MetaMask. No se requieren registros de correo ni contraseñas intermedias.'
    },
    {
      step: '02',
      title: 'Inscríbete como Socio (3 ETH)',
      description: 'Realiza el depósito único de 3 ETH para registrar tu dirección y activar tus derechos plenos de voto y propuesta.'
    },
    {
      step: '03',
      title: 'Formula Propuestas o Vota',
      description: 'Elige entre transacciones sin gas (vía Relayer EIP-2771) o en cadena directas para emitir tu voz y voto.'
    }
  ];

  return (
    <div id="casos-de-uso" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* Section Header: Positive Use Cases */}
        <div>
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">
              Impacto & Aplicaciones Prácticas
            </h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-white">
              Casos de Uso Positivos en la DAO
            </h3>
            <p className="text-slate-400 text-sm sm:text-base">
              Nuestra arquitectura descentralizada impulsa la toma de decisiones eficiente y democrática en proyectos de alto impacto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((uc, index) => (
              <div
                key={index}
                className="glass-card p-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-purple-950/20 hover:border-purple-500/40 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-300 flex items-center justify-center text-3xl mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
                  {uc.icon}
                </div>
                <h4 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {uc.title}
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {uc.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* UX Experience Steps */}
        <div className="glass-card p-10 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-slate-900/90 via-purple-950/30 to-slate-950/90">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">
              Experiencia de Usuario (UX) Simple & Fluida
            </h3>
            <p className="text-slate-400 text-sm">
              Diseñado para que cualquier miembro participe en la gobernanza en solo 3 pasos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stepsUX.map((st, i) => (
              <div key={i} className="relative p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300 opacity-60">
                  {st.step}
                </span>
                <h4 className="text-lg font-bold text-white">{st.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{st.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
