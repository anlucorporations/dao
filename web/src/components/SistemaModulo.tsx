"use client";

import { useEffect, useState } from "react";
import { formatAddress } from "@/lib/utils";

interface AccountStatus {
  index: number;
  walletAddress: string;
  privateKey: string;
  balanceETH: string;
  estado: "ASIGNADO" | "DISPONIBLE";
  socio: {
    id: string;
    nombre: string;
    cedula: string;
    correo: string;
    cargo: string;
  } | null;
}

interface ContractInfo {
  name: string;
  address: string;
}

interface SistemaData {
  setupCompletado: boolean;
  cargosOcupados: string[];
  cargosFaltantes: string[];
  totalDirectivosActivos: number;
  totalSociosRegistrados: number;
  accountsStatus: AccountStatus[];
  smartContracts: {
    chainId: number;
    network: string;
    contracts: ContractInfo[];
  };
}

const CARGOS_DISPONIBLES = [
  { value: "PRESIDENTE", label: "👑 Presidente" },
  { value: "VICEPRESIDENTE", label: "🏛️ Vicepresidente" },
  { value: "SECRETARIO", label: "📜 Secretario" },
  { value: "CONTADOR", label: "📊 Contador" },
  { value: "SOCIO", label: "👤 Socio Cooperativista (Sin Cargo Directivo)" },
];

export default function SistemaModulo() {
  const [data, setData] = useState<SistemaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealedKeys, setRevealedKeys] = useState<Record<number, boolean>>({});
  const [assigningAccount, setAssigningAccount] = useState<AccountStatus | null>(null);

  // Form state para asignación
  const [formNombre, setFormNombre] = useState("");
  const [formCedula, setFormCedula] = useState("");
  const [formCorreo, setFormCorreo] = useState("");
  const [formTelefono, setFormTelefono] = useState("");
  const [formCargo, setFormCargo] = useState("PRESIDENTE");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchSistemaData();
  }, []);

  async function fetchSistemaData() {
    try {
      setLoading(true);
      const res = await fetch("/api/sistema");
      const json = await res.json();
      if (json.success) {
        setData(json);
        // Si hay cargos faltantes, seleccionar el primero disponible por defecto
        if (json.cargosFaltantes.length > 0) {
          setFormCargo(json.cargosFaltantes[0]);
        }
      }
    } catch (err) {
      console.error("Error al cargar datos del sistema:", err);
    } finally {
      setLoading(false);
    }
  }

  function toggleRevealKey(index: number) {
    setRevealedKeys((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setMessage({ text: `📋 ${label} copiada al portapapeles.`, type: "success" });
    setTimeout(() => setMessage(null), 3000);
  }

  function handleOpenAssignModal(acc: AccountStatus) {
    setAssigningAccount(acc);
    setFormNombre("");
    setFormCedula(`V-${Math.floor(10000000 + Math.random() * 89999999)}`);
    setFormCorreo("");
    setFormTelefono("+584120000000");
    if (data?.cargosFaltantes && data.cargosFaltantes.length > 0) {
      setFormCargo(data.cargosFaltantes[0]);
    } else {
      setFormCargo("SOCIO");
    }
  }

  async function handleRegisterSocio(e: React.FormEvent) {
    e.preventDefault();
    if (!assigningAccount) return;

    try {
      setSubmitting(true);
      setMessage(null);

      const res = await fetch("/api/socios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formNombre,
          cedula: formCedula,
          correo: formCorreo,
          walletAddress: assigningAccount.walletAddress,
          telefono: formTelefono,
          cargo: formCargo === "SOCIO" ? null : formCargo,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setMessage({ text: json.message || "Socio asignado con éxito.", type: "success" });
        setAssigningAccount(null);
        await fetchSistemaData();
      } else {
        setMessage({ text: json.error || "Error al asignar socio.", type: "error" });
      }
    } catch (err: any) {
      setMessage({ text: "Error de red: " + err.message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#475569" }}>
          🔄 Cargando Estado del Sistema y Cuentas Anvil...
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Toast alert */}
      {message && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: message.type === "success" ? "#065f46" : "#991b1b",
            color: "#ffffff",
            padding: "14px 22px",
            borderRadius: "14px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
            fontWeight: 700,
            fontSize: "0.9rem",
            zIndex: 2000,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a" }}>⚙️ Panel de Sistema & Cuentas Anvil</h1>
          <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
            Monitoreo de despliegue, llaves privadas de prueba y configuración de la Junta Directiva.
          </p>
        </div>
        <button className="button-outline" onClick={fetchSistemaData}>
          🔄 Actualizar Estado
        </button>
      </div>

      {/* Banner de Estado del Setup */}
      <div
        className="card"
        style={{
          borderLeft: data.setupCompletado ? "6px solid #10b981" : "6px solid #f59e0b",
          background: data.setupCompletado
            ? "linear-gradient(135deg, rgba(209, 250, 229, 0.4) 0%, #ffffff 100%)"
            : "linear-gradient(135deg, rgba(254, 243, 199, 0.5) 0%, #ffffff 100%)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span className={`badge ${data.setupCompletado ? "badge-mint" : "badge-orange"}`}>
                {data.setupCompletado ? "✅ Junta Directiva Completa" : "🔧 En Configuración / Setup"}
              </span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569" }}>
                Directivos Activos: {data.totalDirectivosActivos}/5
              </span>
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
              {data.setupCompletado
                ? "El proyecto se encuentra en Operación Normal."
                : "Se requiere completar la Junta Directiva por el Owner/Contralor."}
            </h3>

            <p style={{ fontSize: "0.85rem", color: "#475569", marginTop: "4px" }}>
              {data.setupCompletado
                ? "Todos los 5 cargos de la directiva (Presidente, Vicepresidente, Secretario, Contralor, Contador) han sido asignados."
                : `Cargos directivos pendientes por asignar: ${data.cargosFaltantes.join(", ")}`}
            </p>
          </div>

          {/* Barra de progreso */}
          <div style={{ minWidth: "220px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, marginBottom: "6px" }}>
              <span>Progreso del Setup</span>
              <span>{data.totalDirectivosActivos * 20}%</span>
            </div>
            <div style={{ width: "100%", height: "10px", background: "#e2e8f0", borderRadius: "6px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${data.totalDirectivosActivos * 20}%`,
                  height: "100%",
                  background: data.setupCompletado ? "#10b981" : "#f59e0b",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Cuentas Anvil */}
      <div className="card" style={{ overflowX: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>🔑 Cuentas Nativas de Anvil (Chain ID 31337)</h3>
            <p style={{ fontSize: "0.8rem", color: "#64748b" }}>
              Direcciones y Llaves Privadas generadas por el nodo Ethereum local para pruebas y asignaciones.
            </p>
          </div>
          <span className="badge badge-blue">10 Cuentas Desplegadas</span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
              <th style={{ padding: "10px" }}>#</th>
              <th style={{ padding: "10px" }}>Dirección Wallet</th>
              <th style={{ padding: "10px" }}>Clave Privada (Private Key)</th>
              <th style={{ padding: "10px" }}>Saldo ETH</th>
              <th style={{ padding: "10px" }}>Estado</th>
              <th style={{ padding: "10px" }}>Socio / Cargo Asignado</th>
              <th style={{ padding: "10px", textAlign: "right" }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {data.accountsStatus.map((acc) => {
              const isRevealed = revealedKeys[acc.index];
              return (
                <tr key={acc.index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 10px", fontWeight: 800, color: "#64748b" }}>#{acc.index}</td>

                  {/* Wallet */}
                  <td style={{ padding: "10px", fontFamily: "monospace" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontWeight: 700, color: "#2563eb" }}>{formatAddress(acc.walletAddress)}</span>
                      <button
                        onClick={() => copyToClipboard(acc.walletAddress, "Wallet Address")}
                        style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "0.8rem" }}
                        title="Copiar dirección"
                      >
                        📋
                      </button>
                    </div>
                  </td>

                  {/* Private Key */}
                  <td style={{ padding: "10px", fontFamily: "monospace" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>{isRevealed ? acc.privateKey : "0x" + "•".repeat(24)}</span>
                      <button
                        onClick={() => toggleRevealKey(acc.index)}
                        style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "0.88rem" }}
                        title={isRevealed ? "Ocultar clave" : "Mostrar clave"}
                      >
                        {isRevealed ? "👁️‍🗨️" : "👁️"}
                      </button>
                      {isRevealed && (
                        <button
                          onClick={() => copyToClipboard(acc.privateKey, "Clave Privada")}
                          style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "0.8rem" }}
                          title="Copiar clave privada"
                        >
                          📋
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Balance */}
                  <td style={{ padding: "10px", fontWeight: 800, color: "#059669" }}>{acc.balanceETH} ETH</td>

                  {/* Estado */}
                  <td style={{ padding: "10px" }}>
                    <span className={`badge ${acc.estado === "ASIGNADO" ? "badge-mint" : "badge-orange"}`}>
                      {acc.estado === "ASIGNADO" ? "✅ Asignado" : "🟡 Disponible"}
                    </span>
                  </td>

                  {/* Socio / Cargo */}
                  <td style={{ padding: "10px" }}>
                    {acc.socio ? (
                      <div>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{acc.socio.nombre}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {acc.socio.cedula} • <strong style={{ color: "#2563eb" }}>{acc.socio.cargo}</strong>
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Sin asignar</span>
                    )}
                  </td>

                  {/* Acción */}
                  <td style={{ padding: "10px", textAlign: "right" }}>
                    {acc.estado === "DISPONIBLE" ? (
                      <button
                        className="button"
                        style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                        onClick={() => handleOpenAssignModal(acc)}
                      >
                        ➕ Asignar Socio
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 700 }}>✓ Registrado</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Contratos Inteligentes Desplegados */}
      <div className="card">
        <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
          📜 Smart Contracts Desplegados en Anvil
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
          {data.smartContracts.contracts.map((c) => (
            <div key={c.name} style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#2563eb", fontFamily: "monospace", marginTop: "4px" }}>
                {formatAddress(c.address)}
              </div>
              <button
                onClick={() => copyToClipboard(c.address, `Dirección de ${c.name}`)}
                style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "0.75rem", color: "#64748b", marginTop: "6px" }}
              >
                📋 Copiar dirección
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para Registrar / Asignar Socio a Cuenta Anvil */}
      {assigningAccount && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="card" style={{ width: "min(520px, 92%)", background: "#ffffff", padding: "24px" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
              👤 Registrar Socio en Cuenta Anvil #{assigningAccount.index}
            </h2>
            <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "18px" }}>
              Wallet: <code style={{ color: "#2563eb" }}>{assigningAccount.walletAddress}</code>
            </p>

            <form onSubmit={handleRegisterSocio}>
              <div className="form-group">
                <label className="form-label">Nombre Completo del Socio</label>
                <input
                  className="form-input"
                  placeholder="ej. Carlos Eduardo Mendoza"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Cédula de Identidad</label>
                  <input
                    className="form-input"
                    placeholder="V-14890123"
                    value={formCedula}
                    onChange={(e) => setFormCedula(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="socio@loscappones.coop"
                    value={formCorreo}
                    onChange={(e) => setFormCorreo(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cargo en la Junta Directiva / Rol</label>
                <select
                  className="form-input"
                  value={formCargo}
                  onChange={(e) => setFormCargo(e.target.value)}
                  style={{ fontWeight: 700 }}
                >
                  {CARGOS_DISPONIBLES.map((c) => {
                    const yaOcupado = data.cargosOcupados.includes(c.value);
                    return (
                      <option key={c.value} value={c.value} disabled={yaOcupado}>
                        {c.label} {yaOcupado ? "(Ya Asignado)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px" }}>
                <button
                  type="button"
                  className="button-outline"
                  onClick={() => setAssigningAccount(null)}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button type="submit" className="button" disabled={submitting}>
                  {submitting ? "Registrando..." : "✅ Confirmar Registro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
