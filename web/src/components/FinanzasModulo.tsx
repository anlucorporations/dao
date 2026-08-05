"use client";

import { formatETH } from "@/lib/utils";

export default function FinanzasModulo() {
  const capitalTotalETH = 150.0;
  const capitalReservadoETH = 30.0;
  const capitalDisponibleETH = 120.0;
  const totalDesembolsadoETH = 45.5;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div className="card" style={{ background: "linear-gradient(135deg, #ffffff, #edf2fe)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a" }}>📈 Análisis Financiero & Gestión de Fondos</h1>
            <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
              Panel de control exclusivo de la Junta Directiva para supervisar la tesorería cooperativa
            </p>
          </div>
          <span className="badge badge-purple" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
            🔒 Acceso Reservado Directivos
          </span>
        </div>
      </div>

      {/* Tarjetas de Métricas de Tesorería */}
      <div className="grid">
        <div className="stat-card">
          <span className="badge badge-mint">Capital Social Total</span>
          <div className="stat-value">{formatETH(capitalTotalETH)}</div>
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>≈ $480,000 USD (Ref. $3,200/ETH)</p>
        </div>

        <div className="stat-card">
          <span className="badge badge-blue">Capital Disponible Liquido</span>
          <div className="stat-value" style={{ color: "#2563eb" }}>{formatETH(capitalDisponibleETH)}</div>
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>Fondo listo para propuestas de inversión</p>
        </div>

        <div className="stat-card">
          <span className="badge badge-amber">Fondo de Reserva Estatutaria</span>
          <div className="stat-value" style={{ color: "#d97706" }}>{formatETH(capitalReservadoETH)}</div>
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>20% del patrimonio intocable</p>
        </div>

        <div className="stat-card">
          <span className="badge badge-rose">Total Desembolsado Proyectos</span>
          <div className="stat-value" style={{ color: "#db2777" }}>{formatETH(totalDesembolsadoETH)}</div>
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>Inversiones ejecutadas con éxito</p>
        </div>
      </div>

      {/* Flujo de Fondos y Gráfico Estructural */}
      <div className="grid" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <div className="card">
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "16px" }}>
            📊 Distribución y Salud de los Fondos Cooperativos
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
                <span>Fondo Disponible para Inversiones (80%)</span>
                <span style={{ color: "#059669" }}>120.00 ETH</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-segment-green" style={{ width: "80%" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 700, marginBottom: "6px" }}>
                <span>Reserva Legal de Contingencia (20%)</span>
                <span style={{ color: "#d97706" }}>30.00 ETH</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-segment-yellow" style={{ width: "20%" }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ background: "#f8fafc" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
            ⚙️ Acciones Financieras
          </h3>
          <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "16px" }}>
            Herramientas directivas de balance contable.
          </p>
          <button className="button" style={{ width: "100%", marginBottom: "10px", fontSize: "0.85rem" }}>
            📑 Generar Balance General PDF
          </button>
          <button className="button-outline" style={{ width: "100%", fontSize: "0.85rem" }}>
            🔄 Auditar Saldos On-Chain
          </button>
        </div>
      </div>
    </div>
  );
}
