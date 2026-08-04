"use client";

import { useState, useEffect } from "react";
import { REDES } from "@/lib/constants";

type Tab = "inicio" | "votaciones" | "propuestas" | "directorio" | "reportes";

const DIRECTIVOS_WALLETS = [
  "0xa0ee7a142d267c1f36714e4a8f75612f20a79720", // Presidenta / SuperUsuario (anlu)
  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", // Vicepresidente
  "0x70997970c51812dc3a010c7d01b50e0d17dc79c8", // Secretaria
  "0x3c44cdd45a60018658536810480b0097c7a08620", // Contralor
  "0x90f79bf6eb2c4f8080653648241616ed26543b59"  // Contadora
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("inicio");
  const [wallet, setWallet] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("Socio / Usuario");
  const [error, setError] = useState<string | null>(null);

  // Verificación de rol Directivo
  const isDirectivo = wallet ? DIRECTIVOS_WALLETS.includes(wallet.toLowerCase()) : false;

  // Estados de API y listas
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

        if (addr.toLowerCase() === "0xa0ee7a142d267c1f36714e4a8f75612f20a79720") {
          setUserRole("SuperUsuario (anlu) / Presidenta");
        } else if (addr.toLowerCase() === "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266") {
          setUserRole("Vicepresidente");
        } else if (DIRECTIVOS_WALLETS.includes(addr.toLowerCase())) {
          setUserRole("Miembro Junta Directiva");
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
          } else if (DIRECTIVOS_WALLETS.includes(addr.toLowerCase())) {
            setUserRole("Miembro Junta Directiva");
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
    if (!isDirectivo) {
      alert("Acceso denegado: Solo los miembros de la Junta Directiva pueden registrar propuestas.");
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

  // Datos demostrativos de votación en curso y finalizadas para el Monitoreo
  const propuestasEnVotacion = [
    {
      id: "v-1",
      nombre: "Adquisición de Servidores de Alta Disponibilidad",
      descripcion: "Compra de infraestructura física para respaldar el nodo local y la base de datos distribuida.",
      monto: "2.50 ETH",
      creador: "anlu (Presidenta)",
      quorumMinimo: 60,
      quorumActual: 80,
      votosFavor: 14,
      votosContra: 4,
      abstenciones: 2,
      totalSocios: 20,
      deadline: new Date(Date.now() + 2 * 24 * 3600 * 1000 + 14 * 3600 * 1000 + 32 * 60 * 1000),
    },
    {
      id: "v-2",
      nombre: "Fondo Semilla para Proyectos Comunitarios 2026",
      descripcion: "Asignación de microcréditos para cooperativistas de bajos recursos.",
      monto: "1.00 ETH",
      creador: "Carlos Mendoza (Vicepresidente)",
      quorumMinimo: 70,
      quorumActual: 90,
      votosFavor: 18,
      votosContra: 1,
      abstenciones: 1,
      totalSocios: 20,
      deadline: new Date(Date.now() + 0 * 24 * 3600 * 1000 + 8 * 3600 * 1000 + 15 * 60 * 1000),
    }
  ];

  const propuestasFinalizadas = [
    {
      id: "f-1",
      nombre: "Fondo de Reserva Agrícola y de Emergencia",
      descripcion: "Creación del fondo de protección ante contingencias climáticas.",
      monto: "5.00 ETH",
      estadoFinal: "APROBADA_EJECUTADA",
      resultadoTexto: "Aprobada con 95% de votos a favor. Pago de tesorería ejecutado.",
      votosFavor: 19,
      votosContra: 1,
      fechaCierre: "01/08/2026",
      txHash: "0x7a3f8901bcd98231e45a67890b01234567890abc",
    },
    {
      id: "f-2",
      nombre: "Adquisición de Vehículo de Carga Usado",
      descripcion: "Compra de camioneta para transporte de insumos agrícolas.",
      monto: "3.20 ETH",
      estadoFinal: "RECHAZADA",
      resultadoTexto: "Rechazada. No superó el porcentaje mínimo requerido de votos a favor.",
      votosFavor: 5,
      votosContra: 15,
      fechaCierre: "28/07/2026",
      txHash: "0x4b123890adef5678901234567890123456789012",
    }
  ];

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
          <button className={`nav-tab ${activeTab === "votaciones" ? "active" : ""}`} onClick={() => setActiveTab("votaciones")}>
            Votaciones & Monitoreo
          </button>
          <button className={`nav-tab ${activeTab === "propuestas" ? "active" : ""}`} onClick={() => setActiveTab("propuestas")}>
            Gestión Propuestas {isDirectivo ? "🔒" : "🚫"}
          </button>
          <button className={`nav-tab ${activeTab === "directorio" ? "active" : ""}`} onClick={() => setActiveTab("directorio")}>
            Junta Directiva {isDirectivo ? "🔒" : "🚫"}
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
                <span className={`badge ${isDirectivo ? "badge-success" : "badge-info"}`}>{userRole}</span>
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
                Bienvenido al sistema descentralizado de gobernanza. Consulta fondos comunes, vota de forma gratuita (Gasless) y certifica actas en blockchain.
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
                <small className="text-muted">Chain ID: {REDES.ANVIL.chainId} (34.135.157.26:8545)</small>
              </div>

              <div className="stat-card">
                <div className="text-muted">Estado de Acceso</div>
                <div className="stat-value" style={{ fontSize: "1.2rem", color: isDirectivo ? "var(--accent)" : "var(--info)" }}>
                  {isDirectivo ? "Directivo Autorizado" : "Socio / Lector"}
                </div>
                <small className="text-muted">{isDirectivo ? "Acceso total a gestión" : "Solo consulta y votación"}</small>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VOTACIONES Y MONITOREO (ACCESIBLE A TODOS LOS SOCIOS) */}
        {activeTab === "votaciones" && (
          <div>
            <div className="card">
              <h2>⚡ Propuestas en Proceso de Votación (En Curso)</h2>
              <p className="text-muted">Monitoreo en tiempo real de los votos emitidos, quórum alcanzado y tiempo restante antes del cierre.</p>
              
              <div className="grid" style={{ marginTop: "20px" }}>
                {propuestasEnVotacion.map((p) => {
                  const totalVotos = p.votosFavor + p.votosContra + p.abstenciones;
                  const porcFavor = Math.round((p.votosFavor / totalVotos) * 100);
                  const porcContra = Math.round((p.votosContra / totalVotos) * 100);
                  const porcAbstencion = Math.round((p.abstenciones / totalVotos) * 100);

                  return (
                    <div key={p.id} className="card" style={{ borderColor: "var(--accent)", background: "rgba(16, 185, 129, 0.03)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <span className="badge badge-success">ABIERTA PARA VOTACIÓN</span>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>⏳ Tiempo Restante:</span>
                          <span style={{ fontWeight: "bold", color: "var(--accent)", fontSize: "1.05rem" }}>
                            02d 14h 32m
                          </span>
                        </div>
                      </div>

                      <h3 style={{ marginTop: "12px" }}>{p.nombre}</h3>
                      <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{p.descripcion}</p>
                      
                      <div style={{ marginTop: "12px", fontSize: "0.95rem" }}>
                        <strong>Monto Solicitado:</strong> <span style={{ color: "var(--accent)" }}>{p.monto}</span> | <strong>Proponente:</strong> {p.creador}
                      </div>

                      {/* BARRA DE DESGLOSE DE VOTOS */}
                      <div style={{ marginTop: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
                          <span>A Favor: <strong>{p.votosFavor} ({porcFavor}%)</strong></span>
                          <span>En Contra: <strong>{p.votosContra} ({porcContra}%)</strong></span>
                          <span>Abstención: <strong>{p.abstenciones} ({porcAbstencion}%)</strong></span>
                        </div>
                        <div style={{ height: "10px", width: "100%", background: "#334155", borderRadius: "5px", overflow: "hidden", display: "flex" }}>
                          <div style={{ width: `${porcFavor}%`, background: "#10b981" }} title="A Favor" />
                          <div style={{ width: `${porcContra}%`, background: "#ef4444" }} title="En Contra" />
                          <div style={{ width: `${porcAbstencion}%`, background: "#94a3b8" }} title="Abstención" />
                        </div>
                      </div>

                      {/* QUÓRUM */}
                      <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                        <span>Quórum Mínimo: <strong>{p.quorumMinimo}%</strong></span>
                        <span style={{ color: p.quorumActual >= p.quorumMinimo ? "var(--accent)" : "var(--warning)", fontWeight: "bold" }}>
                          Quórum Actual: {p.quorumActual}% ({totalVotos}/{p.totalSocios} Socios)
                        </span>
                      </div>

                      <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
                        <button className="button" style={{ width: "100%" }}>Emitir Voto (Gasless)</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECCIÓN PROPUESTAS FINALIZADAS Y VOTADAS */}
            <div className="card" style={{ marginTop: "24px" }}>
              <h2>📜 Propuestas Finalizadas & Resultados Históricos</h2>
              <p className="text-muted">Registro oficial de decisiones aprobadas o rechazadas por la Asamblea General.</p>

              <div className="grid" style={{ marginTop: "20px" }}>
                {propuestasFinalizadas.map((pf) => (
                  <div key={pf.id} className="card" style={{ borderColor: pf.estadoFinal === "APROBADA_EJECUTADA" ? "var(--accent)" : "var(--error)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className={`badge ${pf.estadoFinal === "APROBADA_EJECUTADA" ? "badge-success" : "badge-error"}`}>
                        {pf.estadoFinal === "APROBADA_EJECUTADA" ? "🟢 APROBADA Y EJECUTADA" : "🔴 RECHAZADA"}
                      </span>
                      <small className="text-muted">Fecha: {pf.fechaCierre}</small>
                    </div>

                    <h3 style={{ marginTop: "10px" }}>{pf.nombre}</h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{pf.descripcion}</p>

                    <div style={{ marginTop: "12px", fontSize: "0.9rem" }}>
                      <strong>Resultado Final:</strong> {pf.resultadoTexto}
                    </div>

                    <div style={{ marginTop: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Votos a Favor: {pf.votosFavor} | Votos en Contra: {pf.votosContra}
                    </div>

                    <div style={{ marginTop: "12px", fontSize: "0.8rem", wordBreak: "break-all", background: "rgba(0,0,0,0.2)", padding: "8px", borderRadius: "4px" }}>
                      <strong>Blockchain Tx:</strong> <code>{pf.txHash}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GESTIÓN DE PROPUESTAS (RESTRINGIDO SOLO A DIRECTIVOS) */}
        {activeTab === "propuestas" && (
          <div>
            {!isDirectivo ? (
              <div className="card" style={{ borderColor: "var(--warning)", background: "rgba(245, 158, 11, 0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "2.5rem" }}>🔒</span>
                  <div>
                    <h2 style={{ margin: 0, color: "var(--warning)" }}>Acceso Restringido: Reservado para la Junta Directiva</h2>
                    <p className="text-muted" style={{ marginTop: "6px" }}>
                      La creación y firma de avales de propuestas de inversión está reservada exclusivamente para los miembros directivos autenticados de la Cooperativa.
                    </p>
                  </div>
                </div>
                <div className="notice" style={{ marginTop: "16px" }}>
                  💡 <strong>¿Eres Directivo?</strong> Conecta la wallet autorizada de Presidenta, Vicepresidente, Secretario, Contralor o Contador para habilitar esta interfaz.
                </div>
              </div>
            ) : (
              <div>
                <div className="card">
                  <h2>Crear Nueva Propuesta de Inversión (Panel Directivo)</h2>
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
                        <label className="form-label">Código 2FA / TOTP (Requerido)</label>
                        <input className="form-input" value={token2FA} onChange={(e) => setToken2FA(e.target.value)} placeholder="123456" />
                      </div>
                    </div>

                    <button type="submit" className="button">Registrar Propuesta</button>
                    {msgEstado && <div className="notice" style={{ marginTop: "12px" }}>{msgEstado}</div>}
                  </form>
                </div>

                <div className="card">
                  <h2>Propuestas Registradas en BD</h2>
                  {cargando ? (
                    <p>Cargando propuestas...</p>
                  ) : propuestas.length === 0 ? (
                    <p className="text-muted">No hay propuestas registradas aún en la base de datos.</p>
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
          </div>
        )}

        {/* TAB 4: DIRECTORIO (RESTRINGIDO SOLO A DIRECTIVOS) */}
        {activeTab === "directorio" && (
          <div>
            {!isDirectivo ? (
              <div className="card" style={{ borderColor: "var(--warning)", background: "rgba(245, 158, 11, 0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "2.5rem" }}>🔒</span>
                  <div>
                    <h2 style={{ margin: 0, color: "var(--warning)" }}>Acceso Restringido: Directorio Exclusivo de Directivos</h2>
                    <p className="text-muted" style={{ marginTop: "6px" }}>
                      La información detallada de la Junta Directiva y sus credenciales institucionales se encuentra protegida y restringida para el público general.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <h2>Junta Directiva Fundadora</h2>
                <p className="text-muted">Cuentas directivas con permisos administrativos en la plataforma:</p>
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
            )}
          </div>
        )}

        {/* TAB 5: REPORTES Y ACTAS */}
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
