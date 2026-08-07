"use client";

import { useEffect, useState } from "react";
import { formatAddress, formatETH } from "@/lib/utils";

export interface SocioItem {
  id: string;
  nombre: string;
  cedula: string;
  correo: string;
  walletAddress: string;
  telefono?: string;
  direccion?: string;
  sexo?: string;
  estadoCivil?: string;
  cargo: string;
  balanceETH: number;
  activo: boolean;
}

export default function SociosCrudModulo() {
  const [sociosList, setSociosList] = useState<SocioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSocio, setEditingSocio] = useState<SocioItem | null>(null);

  useEffect(() => {
    fetchSocios();
  }, []);

  async function fetchSocios() {
    try {
      setLoading(true);
      const res = await fetch("/api/socios");
      const data = await res.json();
      if (data.success) {
        const formatted = data.socios.map((s: any) => ({
          id: s.id,
          nombre: s.nombre,
          cedula: s.cedula,
          correo: s.correo,
          walletAddress: s.walletAddress,
          telefono: s.telefono || "",
          direccion: s.direccion || "",
          sexo: s.sexo || "M",
          estadoCivil: s.estadoCivil || "Soltero",
          cargo: s.directivo?.cargo || "Socio",
          balanceETH: 10000.0, // Anvil balance per wallet
          activo: s.activo,
        }));
        setSociosList(formatted);
      }
    } catch (err) {
      console.error("Error al cargar socios:", err);
    } finally {
      setLoading(false);
    }
  }

  // REQUERIMIENTO EXPLÍCITO: Editar SOLO DATOS PERSONALES
  async function handleSavePersonalData(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSocio) return;

    try {
      const res = await fetch("/api/socios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingSocio.id,
          nombre: editingSocio.nombre,
          correo: editingSocio.correo,
          telefono: editingSocio.telefono,
          direccion: editingSocio.direccion,
          sexo: editingSocio.sexo,
          estadoCivil: editingSocio.estadoCivil,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSociosList(sociosList.map((s) => (s.id === editingSocio.id ? editingSocio : s)));
        setEditingSocio(null);
      }
    } catch (err) {
      console.error("Error al guardar datos personales:", err);
    }
  }

  const capitalTotalGeneral = sociosList.reduce((acc, curr) => acc + (curr.activo ? curr.balanceETH : 0), 0);

  if (loading) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#475569" }}>🔄 Cargando Padrón Societario desde PostgreSQL...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a" }}>👥 Módulo de Gestión de Socios (CRUD)</h1>
          <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
            Administración del padrón societario inicializado con la Cuenta Owner y Cuentas de Anvil
          </p>
        </div>
      </div>

      {/* Resumen de Capital Social */}
      <div className="grid">
        <div className="stat-card">
          <span className="badge badge-mint">Socios Registrados</span>
          <div className="stat-value">{sociosList.length} Socios</div>
        </div>
        <div className="stat-card">
          <span className="badge badge-blue">Capital Anvil Total</span>
          <div className="stat-value" style={{ color: "#2563eb" }}>{formatETH(capitalTotalGeneral)}</div>
        </div>
      </div>

      {/* Tabla CRUD de Socios */}
      <div className="card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
              <th style={{ padding: "12px" }}>Socio</th>
              <th style={{ padding: "12px" }}>Cédula</th>
              <th style={{ padding: "12px" }}>Wallet Address (Anvil)</th>
              <th style={{ padding: "12px" }}>Cargo</th>
              <th style={{ padding: "12px" }}>Aporte ETH</th>
              <th style={{ padding: "12px" }}>Estado</th>
              <th style={{ padding: "12px", textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sociosList.map((socio) => (
              <tr key={socio.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "14px 12px", fontWeight: 700, color: "#0f172a" }}>
                  <div>{socio.nombre}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 400 }}>{socio.correo}</div>
                </td>
                <td style={{ padding: "12px", fontFamily: "monospace" }}>{socio.cedula}</td>
                <td style={{ padding: "12px", fontFamily: "monospace", fontSize: "0.85rem", color: "#2563eb" }}>
                  {formatAddress(socio.walletAddress)}
                </td>
                <td style={{ padding: "12px" }}>
                  <span className={`badge ${socio.cargo === "Socio" ? "badge-purple" : "badge-blue"}`}>
                    {socio.cargo}
                  </span>
                </td>
                <td style={{ padding: "12px", fontWeight: 800, color: "#059669" }}>{formatETH(socio.balanceETH)}</td>
                <td style={{ padding: "12px" }}>
                  <span className={`badge ${socio.activo ? "badge-mint" : "badge-rose"}`}>
                    {socio.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td style={{ padding: "12px", textAlign: "right" }}>
                  <button
                    className="button-outline"
                    style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                    onClick={() => setEditingSocio(socio)}
                    title="Editar solo datos personales"
                  >
                    ✏️ Datos Personales
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Editar SOLO Datos Personales */}
      {editingSocio && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div className="card" style={{ width: "min(500px, 90%)", background: "#ffffff" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
              ✏️ Editar Datos Personales del Socio
            </h2>
            <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "18px" }}>
              Restricción de seguridad: Solo se permite modificar información personal no financiera.
            </p>

            <form onSubmit={handleSavePersonalData}>
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input
                  className="form-input"
                  value={editingSocio.nombre}
                  onChange={(e) => setEditingSocio({ ...editingSocio, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input
                  className="form-input"
                  type="email"
                  value={editingSocio.correo}
                  onChange={(e) => setEditingSocio({ ...editingSocio, correo: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono de Contacto</label>
                <input
                  className="form-input"
                  value={editingSocio.telefono}
                  onChange={(e) => setEditingSocio({ ...editingSocio, telefono: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Dirección Habitacional</label>
                <input
                  className="form-input"
                  value={editingSocio.direccion}
                  onChange={(e) => setEditingSocio({ ...editingSocio, direccion: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px" }}>
                <button type="button" className="button-outline" onClick={() => setEditingSocio(null)}>
                  Cancelar
                </button>
                <button type="submit" className="button">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
