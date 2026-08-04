"use client";

import { useState, useEffect } from "react";
import { REDES } from "@/lib/constants";

type Tab = "inicio" | "propuestas" | "directorio" | "reportes";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("inicio");
  const [wallet, setWallet] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("Socio / Usuario");
  const [error, setError] = useState<string | null>(null);

  // Estados de demostración e integración de API
  const [propuestas, setPropuestas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  // Formulario nueva propuesta
  const [nombrePropuesta, setNombrePropuesta] = useState("");
  const [descPropuesta, setDescPropuesta] = useState("");
  const [montoPropuesta, setMontoPropuesta] = useState("");
  const [receptoraPropuesta, setReceptoraPropuesta] = useState("");
  const [token2FA, setToken2FA] = useState("");
  const [msgEstado, setMsgEstado] = useState<string | null>(null);

  function disconnectWallet() {
    setWallet(null);
    setUserRole("Socio / Usuario");
    setError(null);
  }

  async function connectWallet() {
    setError(null);
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setError("MetaMask no está instalada. Instala la extensión e inténtalo nuevamente.");
      return;
    }
    try {
      const provider = (window as any).ethereum;
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      const currentChain = await provider.request({ method: "eth_chainId" });

      if (accounts[0]) {
        const addr = accounts[0];
        setWallet(addr);
        setChainId(currentChain);

        // Identificar si es SuperUsuario o Directivo
        if (addr.toLowerCase() === "0xa0ee7a142d267c1f36714e4a8f75612f20a79720") {
          setUserRole("SuperUsuario (anlu) / Presidenta");
        } else if (addr.toLowerCase() === "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266") {
          setUserRole("Vicepresidente");
        } else {
          setUserRole("Socio Cooperativista");
        }
      }
    } catch (err: any) {
      setError("No se pudo conectar MetaMask: " + (err.message || err));
    }
  }

  // Escuchar cambios de cuenta en MetaMask
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const provider = (window as any).ethereum;
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          const addr = accounts[0];
          setWallet(addr);
          if (addr.toLowerCase() === "0xa0ee7a142d267c1f36714e4a8f75612f20a79720") {
            setUserRole("SuperUsuario (anlu) / Presidenta");
          } else if (addr.toLowerCase() === "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266") {
            setUserRole("Vicepresidente");
          } else {
            setUserRole("Socio Cooperativista");
          }
        }
      };
      provider.on("accountsChanged", handleAccountsChanged);
      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
        }
      };
    }
  }, []);

  async function cargarPropuestas() {
    try {
      setCargando(true);
      const res = await fetch("/api/proposals");
      const data = await res.json();
      if (data.propuestas) {
        setPropuestas(data.propuestas);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPropuestas();
  }, []);

  async function handleCrearPropuesta(e: React.FormEvent) {
    e.preventDefault();
    setMsgEstado(null);
    if (!wallet) {
      alert("Conecta tu MetaMask primero");
      return;
    }
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombrePropuesta,
          descripcion: descPropuesta,
          monto: montoPropuesta,
          walletReceptora: receptoraPropuesta,
          tipo: "INVERSION",
          walletCreador: wallet,
          token2FA: token2FA || "123456",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsgEstado("¡Propuesta registrada exitosamente!");
        setNombrePropuesta("");
        setDescPropuesta("");
        setMontoPropuesta("");
        setReceptoraPropuesta("");
        cargarPropuestas();
      } else {
        setMsgEstado("Error: " + (data.error || "No se pudo crear la propuesta"));
      }
    } catch (err: any) {
      setMsgEstado("Error en la solicitud: " + err.message);
    }
  }

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="header">
        <div className="brand">
          <div className="brand-logo">LC</div>
          <div>
            <div className="brand-title">Los Cappones DAO</div>
            <div className="brand-subtitle">Cooperativa de Ahorro y Préstamo Web3</div>
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="nav-tabs">
          <button className={`nav-tab ${activeTab === "inicio" ? "active" : ""}`} onClick={() => setActiveTab("inicio")}>
            Inicio
          </button>
          <button className={`nav-tab ${activeTab === "propuestas" ? "active" : ""}`} onClick={() => setActiveTab("propuestas")}>
            Propuestas
          </button>
          <button className={`nav-tab ${activeTab === "directorio" ? "active" : ""}`} onClick={() => setActiveTab("directorio")}>
            Directorio
          </button>
          <button className={`nav-tab ${activeTab === "reportes" ? "active" : ""}`} onClick={() => setActiveTab("reportes")}>
            Actas & Reportes
          </button>
        </nav>

        {/* WALLET STATUS */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {wallet ? (
            <>
              <div className="wallet-badge">
                <span className="status-dot"></span>
                <span>{wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}</span>
                <span className="badge badge-info">{userRole}</span>
              </div>
              <button
                className="button-outline"
                style={{ borderColor: "var(--error)", color: "var(--error)", padding: "6px 12px", fontSize: "0.85rem" }}
                onClick={disconnectWallet}
                title="Desvincular cuenta de MetaMask"
              >
                Desvincular
              </button>
            </>
          ) : (
            <button className="button" onClick={connectWallet}>Conectar MetaMask</button>
          )}
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        {error && <div className="notice" style={{ borderColor: "var(--error)" }}>{error}</div>}

        {/* TAB 1: INICIO */}
        {activeTab === "inicio" && (
          <div>
            <div className="card">
              <h1>Panel de Control de la Cooperativa</h1>
              <p className="text-muted">
                Bienvenido al sistema descentralizado de gobernanza. Consulta fondos comunes, firma tus decisiones y certifica actas en blockchain.
              </p>
            </div>

            <div className="grid">
              <div className="stat-card">
                <div className="text-muted">SuperUsuario / Owner</div>
                <div className="stat-value">anlu</div>
                <small className="text-muted">V-12533620 (Anvil Account #9)</small>
              </div>

              <div className="stat-card">
                <div className="text-muted">Red Conectada</div>
                <div className="stat-value" style={{ fontSize: "1.3rem" }}>{REDES.ANVIL.name}</div>
                <small className="text-muted">Chain ID: {REDES.ANVIL.chainId} (Localhost:8545)</small>
              </div>

              <div className="stat-card">
                <div className="text-muted">Propuestas Activas</div>
                <div className="stat-value">{propuestas.length}</div>
                <small className="text-muted">En discusión o borrador</small>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROPUESTAS */}
        {activeTab === "propuestas" && (
          <div>
            <div className="card">
              <h2>Crear Nueva Propuesta de Inversión</h2>
              <form onSubmit={handleCrearPropuesta} style={{ marginTop: "16px" }}>
                <div className="grid">
                  <div className="form-group">
                    <label className="form-label">Nombre de la Propuesta</label>
                    <input className="form-input" required value={nombrePropuesta} onChange={(e) => setNombrePropuesta(e.target.value)} placeholder="Ej: Compra de Equipos de Computo" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Monto (ETH / POL)</label>
                    <input className="form-input" required type="number" step="0.01" value={montoPropuesta} onChange={(e) => setMontoPropuesta(e.target.value)} placeholder="Ej: 1.5" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción Detallada</label>
                  <textarea className="form-textarea" rows={3} required value={descPropuesta} onChange={(e) => setDescPropuesta(e.target.value)} placeholder="Describa el objetivo del gasto..." />
                </div>

                <div className="grid">
                  <div className="form-group">
                    <label className="form-label">Wallet Receptora de Fondos</label>
                    <input className="form-input" required value={receptoraPropuesta} onChange={(e) => setReceptoraPropuesta(e.target.value)} placeholder="0x..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Código 2FA / TOTP (Solo Directivos)</label>
                    <input className="form-input" value={token2FA} onChange={(e) => setToken2FA(e.target.value)} placeholder="123456" />
                  </div>
                </div>

                <button type="submit" className="button">Registrar Propuesta</button>
                {msgEstado && <div className="notice" style={{ marginTop: "12px" }}>{msgEstado}</div>}
              </form>
            </div>

            <div className="card">
              <h2>Propuestas Registradas</h2>
              {cargando ? (
                <p>Cargando propuestas...</p>
              ) : propuestas.length === 0 ? (
                <p className="text-muted">No hay propuestas registradas aún en el sistema.</p>
              ) : (
                <div className="grid" style={{ marginTop: "16px" }}>
                  {propuestas.map((p) => (
                    <div key={p.id} className="stat-card">
                      <div className="badge badge-warning">{p.estado}</div>
                      <h3 style={{ marginTop: "8px" }}>{p.nombre}</h3>
                      <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{p.descripcion}</p>
                      <div style={{ marginTop: "12px", fontWeight: "bold" }}>Monto: {p.monto} ETH</div>
                      <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                        <button className="button-outline">Firmar Aval</button>
                        <button className="button">Votar (Gasless)</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DIRECTORIO */}
        {activeTab === "directorio" && (
          <div>
            <div className="card">
              <h2>Junta Directiva Fundadora</h2>
              <p className="text-muted">Cuentas directivas mapeadas a la red local de prueba Anvil:</p>
              <div className="grid" style={{ marginTop: "16px" }}>
                <div className="stat-card">
                  <span className="badge badge-success">PRESIDENTA (SuperUsuario)</span>
                  <h3 style={{ marginTop: "6px" }}>anlu</h3>
                  <small>Cédula: V-12533620</small><br />
                  <small>Wallet: 0xa0Ee...9720</small>
                </div>

                <div className="stat-card">
                  <span className="badge badge-info">VICEPRESIDENTE</span>
                  <h3 style={{ marginTop: "6px" }}>Carlos Mendoza</h3>
                  <small>Cédula: V-10000001</small><br />
                  <small>Wallet: 0xf39F...2266</small>
                </div>

                <div className="stat-card">
                  <span className="badge badge-info">SECRETARIA</span>
                  <h3 style={{ marginTop: "6px" }}>María Rodríguez</h3>
                  <small>Cédula: V-10000002</small><br />
                  <small>Wallet: 0x7099...79C8</small>
                </div>

                <div className="stat-card">
                  <span className="badge badge-info">CONTRALOR</span>
                  <h3 style={{ marginTop: "6px" }}>José Pérez</h3>
                  <small>Cédula: V-10000003</small><br />
                  <small>Wallet: 0x3C44...93BC</small>
                </div>

                <div className="stat-card">
                  <span className="badge badge-info">CONTADORA</span>
                  <h3 style={{ marginTop: "6px" }}>Ana Gómez</h3>
                  <small>Cédula: V-10000004</small><br />
                  <small>Wallet: 0x90F7...3341</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REPORTES */}
        {activeTab === "reportes" && (
          <div>
            <div className="card">
              <h2>Certificación de Actas Hash en Blockchain</h2>
              <p className="text-muted">
                Las actas en formato PDF son procesadas con el algoritmo SHA-256 y registradas inmutablemente en el contrato <code>ActaHashRegistry.sol</code>.
              </p>
              <div className="notice" style={{ marginTop: "16px" }}>
                <strong>Estado del Contrato Hash Registry:</strong> Operativo en Anvil
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
