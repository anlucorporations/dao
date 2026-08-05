"use client";

import { useState } from "react";
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

const MOCK_PROPUESTAS: Propuesta[] = [
  {
    id: 1,
    titulo: "Adquisición de Servidores de Alta Disponibilidad para Nodo Validator",
    descripcion: "Compra de infraestructura hardware dedicada para expandir la capacidad computacional de la cooperativa.",
    montoETH: 5.5,
    destinatario: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    estatus: "Aprobada y Ejecutada",
    publicada: true,
    votosFavor: 32,
    votosContra: 4,
    votosAbstencion: 2,
    totalVotantes: 38,
    fechaCreacion: "2026-07-20",
    ultimaModificacion: "2026-07-22",
  },
  {
    id: 2,
    titulo: "Fondo de Liquidez para Proyectos Agrícolas Comunitarios",
    descripcion: "Asignación de capital de trabajo para la primera fase del proyecto de soberanía alimentaria.",
    montoETH: 12.0,
    destinatario: "0x3C44CdD16053471b02368B1E529E732F7922a346",
    estatus: "En Votacion",
    publicada: true,
    votosFavor: 20,
    votosContra: 8,
    votosAbstencion: 5,
    totalVotantes: 33,
    fechaCreacion: "2026-08-01",
    ultimaModificacion: "2026-08-04",
  },
  {
    id: 3,
    titulo: "[Borrador Directivo] Proyecto de Auditoría de Seguridad Smart Contracts v2",
    descripcion: "Contratación de firma externa para auditoría formal de los nuevos contratos de tesorería multifirma.",
    montoETH: 8.0,
    destinatario: "0x90F79bf6EB2c4f8096638522f8a92790e72A0e00",
    estatus: "Borrador",
    publicada: false, // SOLO VISIBLE PARA JUNTA DIRECTIVA
    votosFavor: 0,
    votosContra: 0,
    votosAbstencion: 0,
    totalVotantes: 0,
    fechaCreacion: "2026-08-04",
    ultimaModificacion: "2026-08-05",
  },
];

interface PropuestasDashboardProps {
  isDirectivo: boolean;
  wallet: string | null;
  onEmitirVoto: (propuestaId: number, voto: "favor" | "contra" | "abstencion") => void;
}

export default function PropuestasDashboard({ isDirectivo, wallet, onEmitirVoto }: PropuestasDashboardProps) {
  const [filterEstatus, setFilterEstatus] = useState<string>("todas");

  // Filtrar propuestas borradores si NO es directivo
  const propuestasVisibles = MOCK_PROPUESTAS.filter((p) => {
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

        <div style={{ display: "flex", gap: "10px" }}>
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

      {/* Grilla de Propuestas */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {propuestasVisibles.map((prop) => {
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
        })}
      </div>
    </div>
  );
}
