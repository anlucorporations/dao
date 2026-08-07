"use client";

import { useState, useEffect } from "react";
import { formatAddress, formatETH } from "@/lib/utils";

interface Propuesta {
  id: number;
  titulo: string;
  descripcion: string;
  montoETH: number;
  destinatario: string;
  estatus: "Borrador" | "En Votacion" | "Aprobada y Ejecutada" | "Rechazada";
  publicada: boolean;
  votosFavor: number;
  votosContra: number;
  votosAbstencion: number;
  totalVotantes: number;
  fechaCreacion: string;
  ultimaModificacion: string;
}

const MOCK_PROPUESTAS: Propuesta[] = [];

interface PropuestasDashboardProps {
  isDirectivo: boolean;
  isGovernanceOwner: boolean;
  wallet: string | null;
  onEmitirVoto: (propuestaId: number, voto: "favor" | "contra" | "abstencion") => void;
}

export default function PropuestasDashboard({
  isDirectivo,
  isGovernanceOwner,
  wallet,
  onEmitirVoto,
}: PropuestasDashboardProps) {
  const [propuestasList, setPropuestasList] = useState<Propuesta[]>(MOCK_PROPUESTAS);
  const [filterEstatus, setFilterEstatus] = useState<string>("todas");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchPropuestas();
  }, []);

  async function fetchPropuestas() {
    try {
      const res = await fetch("/api/proposals");
      const json = await res.json();
      if (json && Array.isArray(json.propuestas) && json.propuestas.length > 0) {
        const formatted: Propuesta[] = json.propuestas.map((p: any) => ({
          id: p.id,
          titulo: p.nombre,
          descripcion: p.descripcion,
          montoETH: parseFloat(p.monto) || 0,
          destinatario: p.walletReceptora,
          estatus: p.estado === "BORRADOR" ? "Borrador" : p.estado === "POR_DISCUTIR" ? "En Votacion" : p.estado === "APROBADA" || p.estado === "EJECUTADA" ? "Aprobada y Ejecutada" : "Rechazada",
          publicada: p.estado !== "BORRADOR",
          votosFavor: p.votos ? p.votos.filter((v: any) => v.tipo === "ACEPTADA").length : 0,
          votosContra: p.votos ? p.votos.filter((v: any) => v.tipo === "RECHAZADA").length : 0,
          votosAbstencion: p.votos ? p.votos.filter((v: any) => v.tipo === "ABSTENCION").length : 0,
          totalVotantes: p.votos ? p.votos.length : 0,
          fechaCreacion: p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : "",
          ultimaModificacion: p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : "",
        }));
        setPropuestasList(formatted);
      }
    } catch {
      // Si la API falla o no hay datos, mantener vacías las propuestas
    }
  }

  // Campos del formulario flotante
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevaDesc, setNuevaDesc] = useState("");
  const [nuevoMonto, setNuevoMonto] = useState("");
  const [nuevaReceptora, setNuevaReceptora] = useState("");
  const [nuevaPublicada, setNuevaPublicada] = useState(true);

  function handleCreatePropuesta(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoTitulo || !nuevaDesc || !nuevoMonto) return;

    const fechaHoy = new Date().toISOString().split("T")[0];
    const nuevaProp: Propuesta = {
      id: propuestasList.length + 1,
      titulo: nuevoTitulo,
      descripcion: nuevaDesc,
      montoETH: parseFloat(nuevoMonto) || 0,
      destinatario: nuevaReceptora || "0x0000000000000000000000000000000000000000",
      estatus: nuevaPublicada ? "En Votacion" : "Borrador",
      publicada: nuevaPublicada,
      votosFavor: 0,
      votosContra: 0,
      votosAbstencion: 0,
      totalVotantes: 0,
      fechaCreacion: fechaHoy,
      ultimaModificacion: fechaHoy,
    };

    setPropuestasList([nuevaProp, ...propuestasList]);
    setShowCreateModal(false);
    setNuevoTitulo("");
    setNuevaDesc("");
    setNuevoMonto("");
    setNuevaReceptora("");
    setNuevaPublicada(true);
  }

  // Filtrar propuestas borradores si NO es directivo
  const propuestasVisibles = propuestasList.filter((p) => {
    if (!p.publicada && !isDirectivo) return false;
    if (filterEstatus === "todas") return true;
    return p.estatus.toLowerCase().includes(filterEstatus.toLowerCase());
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header del Dashboard */}
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a" }}>📊 Dashboard de Propuestas</h1>
          <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
            Monitoreo y gobernanza transparente de proyectos de la Cooperativa
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Botón flotante para Owner, Presidente o Contralor */}
          {isGovernanceOwner && (
            <button className="button" onClick={() => setShowCreateModal(true)}>
              ➕ Crear Nueva Propuesta
            </button>
          )}

          <select
            className="form-select"
            value={filterEstatus}
            onChange={(e) => setFilterEstatus(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="todas">Todas las Propuestas</option>
            <option value="votacion">En Votación</option>
            <option value="aprobada">Aprobadas</option>
            <option value="borrador">Borradores (Solo Directivos)</option>
          </select>
        </div>
      </div>

      {/* Alerta de privilegio directivo si hay borradores */}
      {!isDirectivo && (
        <div className="notice" style={{ background: "#edf2fe", borderColor: "#bfdbfe", color: "#1e40af" }}>
          ℹ️ <strong>Aviso de Transparencia:</strong> Las propuestas en fase de borrador o preparación técnica interna por la Junta Directiva permanecen reservadas hasta su publicación oficial a la asamblea.
        </div>
      )}

      {/* Formulario Flotante Modal para Cargar Propuesta (Exclusivo Governance) */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
          }}
        >
          <div className="card" style={{ width: "min(600px, 92%)", background: "#ffffff", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>
                ➕ Formulario de Carga de Propuesta
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: "transparent", border: "none", fontSize: "1.2rem", color: "#94a3b8", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePropuesta}>
              <div className="form-group">
                <label className="form-label">Título de la Propuesta</label>
                <input
                  className="form-input"
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                  placeholder="Ej. Proyecto de Inversión Tecnológica Node v3"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descripción Detallada</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={nuevaDesc}
                  onChange={(e) => setNuevaDesc(e.target.value)}
                  placeholder="Detalla los objetivos, justificación y alcance del proyecto..."
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group">
                  <label className="form-label">Monto a Transferir (ETH)</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.01"
                    value={nuevoMonto}
                    onChange={(e) => setNuevoMonto(e.target.value)}
                    placeholder="10.0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Visibilidad Inicial</label>
                  <select
                    className="form-select"
                    value={nuevaPublicada ? "publica" : "borrador"}
                    onChange={(e) => setNuevaPublicada(e.target.value === "publica")}
                  >
                    <option value="publica">Publicar en Votación Abierta</option>
                    <option value="borrador">Borrador Reservado (Directivos)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Dirección Wallet Receptora</label>
                <input
                  className="form-input"
                  value={nuevaReceptora}
                  onChange={(e) => setNuevaReceptora(e.target.value)}
                  placeholder="0x..."
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px" }}>
                <button type="button" className="button-outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="button">
                  Cargar Propuesta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grilla de Propuestas */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {propuestasVisibles.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📊</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
              No hay propuestas registradas actualmente
            </div>
            <p style={{ fontSize: "0.88rem", marginTop: "4px" }}>
              {isGovernanceOwner
                ? "Como miembro directivo autorizado, puedes cargar una nueva propuesta utilizando el botón '➕ Crear Nueva Propuesta' arriba."
                : "La asamblea no posee propuestas activas en este momento."}
            </p>
          </div>
        ) : (
          propuestasVisibles.map((prop) => {
          const totalVotos = prop.votosFavor + prop.votosContra + prop.votosAbstencion;
          const pctFavor = totalVotos > 0 ? Math.round((prop.votosFavor / totalVotos) * 100) : 0;
          const pctContra = totalVotos > 0 ? Math.round((prop.votosContra / totalVotos) * 100) : 0;
          const pctAbstencion = totalVotos > 0 ? Math.round((prop.votosAbstencion / totalVotos) * 100) : 0;

          return (
            <div
              key={prop.id}
              className="card"
              style={{
                borderLeft: prop.estatus === "Borrador" ? "6px solid #fbbf24" : prop.estatus === "En Votacion" ? "6px solid #3b82f6" : "6px solid #10b981",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "14px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#64748b" }}>#{prop.id}</span>
                    <span
                      className={`badge ${
                        prop.estatus === "Borrador"
                          ? "badge-amber"
                          : prop.estatus === "En Votacion"
                          ? "badge-blue"
                          : "badge-mint"
                      }`}
                    >
                      {prop.estatus === "Borrador" ? "🔒 Borrador Reservado Directivos" : prop.estatus}
                    </span>
                  </div>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>{prop.titulo}</h2>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Monto a Transferir</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#059669" }}>
                    {formatETH(prop.montoETH)}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: "0.95rem", color: "#334155", lineHeight: 1.6, marginBottom: "18px" }}>
                {prop.descripcion}
              </p>

              {/* Ficha Técnica de la Propuesta */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "16px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "14px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Destinatario (Wallet)</span>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, fontFamily: "monospace", color: "#1e293b" }}>
                    {formatAddress(prop.destinatario)}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Fecha de Creación</span>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>{prop.fechaCreacion}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Última Modificación</span>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>{prop.ultimaModificacion}</div>
                </div>
              </div>

              {/* Desglose Tricolor de Votos */}
              {prop.publicada && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 700, marginBottom: "8px" }}>
                    <span>Estatus de Votación (Tricolor)</span>
                    <span style={{ color: "#64748b" }}>Total Votantes: {totalVotos}</span>
                  </div>

                  {/* Barra tricolor */}
                  <div className="progress-bar-container" style={{ marginBottom: "10px", height: "12px" }}>
                    <div className="progress-segment-green" style={{ width: `${pctFavor}%` }} title={`A favor: ${pctFavor}%`} />
                    <div className="progress-segment-red" style={{ width: `${pctContra}%` }} title={`En contra: ${pctContra}%`} />
                    <div className="progress-segment-yellow" style={{ width: `${pctAbstencion}%` }} title={`Abstención: ${pctAbstencion}%`} />
                  </div>

                  <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem", fontWeight: 700, flexWrap: "wrap" }}>
                    <span style={{ color: "#059669" }}>🟢 A Favor: {prop.votosFavor} ({pctFavor}%)</span>
                    <span style={{ color: "#dc2626" }}>🔴 En Contra: {prop.votosContra} ({pctContra}%)</span>
                    <span style={{ color: "#d97706" }}>🟡 Abstenciones: {prop.votosAbstencion} ({pctAbstencion}%)</span>
                  </div>

                  {/* Botones para emitir voto si está en votación */}
                  {prop.estatus === "En Votacion" && wallet && (
                    <div style={{ marginTop: "18px", display: "flex", gap: "10px" }}>
                      <button
                        className="button"
                        style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                        onClick={() => onEmitirVoto(prop.id, "favor")}
                      >
                        👍 Votar A Favor
                      </button>
                      <button
                        style={{
                          background: "#fee2e2",
                          color: "#991b1b",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "10px",
                          fontWeight: 700,
                          cursor: "pointer",
                          fontSize: "0.85rem",
                        }}
                        onClick={() => onEmitirVoto(prop.id, "contra")}
                      >
                        👎 Votar En Contra
                      </button>
                      <button
                        className="button-outline"
                        style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                        onClick={() => onEmitirVoto(prop.id, "abstencion")}
                      >
                        ✋ Abstención
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }))}
      </div>
    </div>
  );
}
