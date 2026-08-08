'use client';

import React, { useState } from 'react';

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div id="contacto" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Info & Social Networks */}
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-300">
              Comunidad & Soporte
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              Conéctate con nuestra Comunidad DAO
            </h2>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              ¿Tienes dudas sobre la inscripción de socios, la integración del protocolo EIP-2771 o el desarrollo de propuestas? Únete a nuestras comunidades o envía una consulta directa.
            </p>

            {/* Social Links */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all text-center group"
              >
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">💬</div>
                <div className="text-xs font-bold text-white">Discord</div>
                <div className="text-[10px] text-slate-400">Comunidad</div>
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all text-center group"
              >
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🐦</div>
                <div className="text-xs font-bold text-white">X / Twitter</div>
                <div className="text-[10px] text-slate-400">Novedades</div>
              </a>

              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all text-center group"
              >
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">✈️</div>
                <div className="text-xs font-bold text-white">Telegram</div>
                <div className="text-[10px] text-slate-400">Chat Oficial</div>
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all text-center group"
              >
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🐙</div>
                <div className="text-xs font-bold text-white">GitHub</div>
                <div className="text-[10px] text-slate-400">Código Fuente</div>
              </a>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="glass-card p-8 rounded-3xl border border-purple-500/30 bg-slate-900/80 backdrop-blur-xl">
            <h3 className="text-2xl font-bold text-white mb-2">Envíanos un Mensaje</h3>
            <p className="text-xs text-slate-400 mb-6">Completa el formulario para recibir asistencia técnica o soporte.</p>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-center space-y-2">
                <div className="text-3xl">🎉</div>
                <h4 className="font-bold text-base">¡Mensaje Enviado Exitosamente!</h4>
                <p className="text-xs text-emerald-200/80">Nos pondremos en contacto contigo a la brevedad.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Nombre o Alias</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Socio DAO"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="socio@dao.org"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Consulta o Sugerencia</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Escribe aquí tu consulta..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 transition-all text-sm shadow-lg shadow-purple-600/30"
                >
                  Enviar Consulta
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
