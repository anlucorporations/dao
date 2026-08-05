"use client";

import { useState } from "react";
import { formatAddress, formatETH } from "@/lib/utils";

export interface SocioItem {
  id: number;
  nombre: string;
  cedula: string;
  email: string;
  wallet: string;
  walletRecuperacion: string;
  cargo: string;
  balanceETH: number;
  activo: boolean;
  fechaIngreso: string;
}

const INITIAL_SOCIOS: SocioItem[] = [
  {
    id: 1,
    nombre: "anlu (Presidente)",
    cedula: "V-12533620",
    email: "anlucorporations@gmail.com",
    wallet: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
    walletRecuperacion: "0x1234567890123456789012345678901234567890",
    cargo: "Presidente",
    balanceETH: 45.0,
    activo: true,
    fechaIngreso: "2026-01-10",
  },
  {
    id: 2,
    nombre: "Carlos Mendoza",
    cedula: "V-14890123",
    email: "carlos.mendoza@cappones.dao",
    wallet: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    walletRecuperacion: "0x9876543210987654321098765432109876543210",
    cargo: "Vicepresidente",
    balanceETH: 30.0,
    activo: true,
    fechaIngreso: "2026-01-15",
  },
  {
    id: 3,
    nombre: "María Rodríguez",
    cedula: "V-16789456",
    email: "maria.rodriguez@cappones.dao",
    wallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    walletRecuperacion: "0x0000000000000000000000000000000000000000",
    cargo: "Secretaria",
    balanceETH: 25.0,
    activo: true,
    fechaIngreso: "2026-02-01",
  },
  {
    id: 4,
    nombre: "Roberto Silva",
    cedula: "V-20123456",
    email: "roberto.silva@gmail.com",
    wallet: "0x15d34AA5453849e164743022539062146e5a201b",
    walletRecuperacion: "0x0000000000000000000000000000000000000000",
    cargo: "Socio Cooperativista",
    balanceETH: 15.0,
    activo: true,
    fechaIngreso: "2026-03-12",
  },
];

export default function SociosCrudModulo() {
  const [sociosList, setSociosList] = useState<SocioItem[]>(INITIAL_SOCIOS);
  const [editingSocio, setEditingSocio] = useState<SocioItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Formulario nuevo socio
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaCedula, setNuevaCedula] = useState("");
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevaWallet, setNuevaWallet] = useState("");
  const [nuevoAporte, setNuevoAporte] = useState("");

  const capitalTotalGeneral = sociosList.reduce((acc, curr) => acc + (curr.activo ? curr.balanceETH : 0), 0);

  function handleCreateSocio(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoNombre || !nuevaCedula || !nuevaWallet) return;

    const newId = sociosList.length + 1;
    const nuevoItem: SocioItem = {
      id: newId,
      nombre: nuevoNombre,
      cedula: nuevaCedula,
      email: nuevoEmail,
      wallet: nuevaWallet,
      walletRecuperacion: "0x0000000000000000000000000000000000000000",
      cargo: "Socio Cooperativista",
      balanceETH: parseFloat(nuevoAporte) || 10.0,
      activo: true,
      fechaIngreso: new Date().toISOString().split("T")[0],
    };

    setSociosList([...sociosList, nuevoItem]);
    setShowCreateModal(false);
    setNuevoNombre("");
    setNuevaCedula("");
    setNuevoEmail("");
    setNuevaWallet("");
    setNuevoAporte("");
  }

  // REQUERIMIENTO EXPLÍCITO: Editar SOLO DATOS PERSONALES
  function handleSavePersonalData(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSocio) return;

    setSociosList(
      sociosList.map((s) => (s.id === editingSocio.id ? editingSocio : s))
    );
    setEditingSocio(null);
  }

  function toggleEstadoSocio(id: number) {
    setSociosList(
      sociosList.map((s) => (s.id === id ? { ...s, activo: !s.activo } : s))
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a" }}>👥 Módulo de Gestión de Socios (CRUD)</h1>
          <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
            Administración de padrón societario y cálculo del % de capital social relativo
          </p>
        </div>

        <button className="button" onClick={() => setShowCreateModal(true)}>
          ➕ Registrar Nuevo Socio
        </button>
      </div>

      {/* Resumen de Capital Social */}
      <div className="grid">
        <div className="stat-card">
          <span className="badge badge-mint">Socios Activos</span>
          <div className="stat-value">{sociosList.filter((s) => s.activo).length} Socios</div>
        </div>
        <div className="stat-card">
          <span className="badge badge-blue">Capital Social Agregado</span>
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
              <th style={{ padding: "12px" }}>Wallet</th>
              <th style={{ padding: "12px" }}>Cargo</th>
              <th style={{ padding: "12px" }}>Aporte ETH</th>
              <th style={{ padding: "12px" }}>% Capital</th>
              <th style={{ padding: "12px" }}>Estado</th>
              <th style={{ padding: "12px", textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sociosList.map((socio) => {
              const pctCapital = capitalTotalGeneral > 0 && socio.activo ? Math.round((socio.balanceETH / capitalTotalGeneral) * 1000) / 10 : 0;

              return (
                <tr key={socio.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "14px 12px", fontWeight: 700, color: "#0f172a" }}>
                    <div>{socio.nombre}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 400 }}>{socio.email}</div>
                  </td>
                  <td style={{ padding: "12px", fontFamily: "monospace" }}>{socio.cedula}</td>
                  <td style={{ padding: "12px", fontFamily: "monospace", fontSize: "0.85rem" }}>{formatAddress(socio.wallet)}</td>
                  <td style={{ padding: "12px" }}>
                    <span className="badge badge-blue">{socio.cargo}</span>
                  </td>
                  <td style={{ padding: "12px", fontWeight: 800, color: "#059669" }}>{formatETH(socio.balanceETH)}</td>
                  <td style={{ padding: "12px", fontWeight: 800, color: "#2563eb" }}>{pctCapital}%</td>
                  <td style={{ padding: "12px" }}>
                    <span className={`badge ${socio.activo ? "badge-mint" : "badge-rose"}`}>
                      {socio.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <button
                        className="button-outline"
                        style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                        onClick={() => setEditingSocio(socio)}
                        title="Editar solo datos personales"
                      >
                        ✏️ Datos Personales
                      </button>
                      <button
                        style={{
                          background: socio.activo ? "#fee2e2" : "#d1fae5",
                          color: socio.activo ? "#991b1b" : "#065f46",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                        onClick={() => toggleEstadoSocio(socio.id)}
                      >
                        {socio.activo ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cédula de Identidad</label>
                <input
                  className="form-input"
                  value={editingSocio.cedula}
                  onChange={(e) => setEditingSocio({ ...editingSocio, cedula: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input
                  className="form-input"
                  type="email"
                  value={editingSocio.email}
                  onChange={(e) => setEditingSocio({ ...editingSocio, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Wallet de Recuperación</label>
                <input
                  className="form-input"
                  value={editingSocio.walletRecuperacion}
                  onChange={(e) => setEditingSocio({ ...editingSocio, walletRecuperacion: e.target.value })}
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

      {/* Modal Crear Socio */}
      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div className="card" style={{ width: "min(500px, 90%)", background: "#ffffff" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "18px" }}>
              ➕ Registrar Nuevo Socio Cooperativista
            </h2>

            <form onSubmit={handleCreateSocio}>
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input className="form-input" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Cédula de Identidad</label>
                <input className="form-input" value={nuevaCedula} onChange={(e) => setNuevaCedula(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input className="form-input" type="email" value={nuevoEmail} onChange={(e) => setNuevoEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Dirección Wallet Ethereum</label>
                <input className="form-input" value={nuevaWallet} onChange={(e) => setNuevaWallet(e.target.value)} required placeholder="0x..." />
              </div>
              <div className="form-group">
                <label className="form-label">Aporte Inicial ETH</label>
                <input className="form-input" type="number" step="0.1" value={nuevoAporte} onChange={(e) => setNuevoAporte(e.target.value)} placeholder="10.0" />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px" }}>
                <button type="button" className="button-outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="button">
                  Registrar Socio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
