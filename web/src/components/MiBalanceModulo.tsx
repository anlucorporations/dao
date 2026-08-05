"use client";

import { formatAddress, formatETH } from "@/lib/utils";

interface VotoEmitido {
  id: number;
  propuestaId: number;
  tituloPropuesta: string;
  miVoto: "A Favor" | "En Contra" | "Abstención";
  fechaVoto: string;
  resultadoPropuesta: "Aprobada y Ejecutada" | "En Votacion" | "Rechazada";
}

const MOCK_VOTOS_SOCIO: VotoEmitido[] = [
  {
    id: 1,
    propuestaId: 1,
    tituloPropuesta: "Adquisición de Servidores de Alta Disponibilidad para Nodo Validator",
    miVoto: "A Favor",
    fechaVoto: "2026-07-21",
    resultadoPropuesta: "Aprobada y Ejecutada",
  },
  {
    id: 2,
    propuestaId: 2,
    tituloPropuesta: "Fondo de Liquidez para Proyectos Agrícolas Comunitarios",
    miVoto: "A Favor",
    fechaVoto: "2026-08-02",
    resultadoPropuesta: "En Votacion",
  },
];

interface MiBalanceModuloProps {
  wallet: string | null;
  userRole: string;
}

export default function MiBalanceModulo({ wallet, userRole }: MiBalanceModuloProps) {
  const miBalanceETH = 12.5;
  const miPorcentajeCapital = 15.4;

  if (!wallet) {
    return (
      <div className="card">
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>Inicia sesión con tu Wallet</h2>
        <p style={{ fontSize: "0.9rem", color: "#64748b" }}>Conecta tu billetera MetaMask para acceder al desglose de tu balance personal.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div className="card" style={{ background: "linear-gradient(135deg, #ffffff, #f0fdf4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a" }}>Mi Balance & Participación Societaria</h1>
            <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
              Resumen personal de aportes de capital, poder de voto y actividad democrática
            </p>
          </div>
          <span className="badge badge-mint" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
            Socio Activo Certificado
          </span>
        </div>
      </div>

      {/* Tarjetas de Desglose Personal */}
      <div className="grid">
        <div className="stat-card">
          <span className="badge badge-mint">Mi Aporte de Capital</span>
          <div className="stat-value">{formatETH(miBalanceETH)}</div>
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>Fondo aportado a la cooperativa</p>
        </div>

        <div className="stat-card">
          <span className="badge badge-blue">Participación Relativa</span>
          <div className="stat-value" style={{ color: "#2563eb" }}>{miPorcentajeCapital}%</div>
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>Poder de representación en decisiones</p>
        </div>

        <div className="stat-card">
          <span className="badge badge-purple">Propuestas Votadas</span>
          <div className="stat-value" style={{ color: "#7c3aed" }}>{MOCK_VOTOS_SOCIO.length} Propuestas</div>
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>Participación democrática acumulada</p>
        </div>
      </div>

      {/* Histórico de Votaciones del Socio */}
      <div className="card">
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", marginBottom: "16px" }}>
          Mis Votos Emitidos en la Asamblea
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {MOCK_VOTOS_SOCIO.map((voto) => (
            <div
              key={voto.id}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#64748b" }}>Propuesta #{voto.propuestaId}</span>
                  <span
                    className={`badge ${
                      voto.miVoto === "A Favor"
                        ? "badge-mint"
                        : voto.miVoto === "En Contra"
                        ? "badge-rose"
                        : "badge-amber"
                    }`}
                  >
                    Mi Voto: {voto.miVoto}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>{voto.tituloPropuesta}</h3>
                <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>Emitido el: {voto.fechaVoto}</div>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block" }}>Resultado Actual</span>
                <span className="badge badge-blue">{voto.resultadoPropuesta}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

