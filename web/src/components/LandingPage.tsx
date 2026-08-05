"use client";

interface LandingPageProps {
  onExplorePropuestas: () => void;
  onConnectWallet: () => void;
}

const JUNTA_DIRECTIVA_MEMBERS = [
  {
    cargo: "Presidente",
    nombre: "Ing. anlu",
    cedula: "V-12533620",
    wallet: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
    avatar: "👑",
    bio: "Líder institucional y fundador de la Cooperativa Los Cappones. Encargado de la dirección estratégica, gobernanza y supervisión técnica del ecosistema.",
    badgeClass: "badge-mint",
  },
  {
    cargo: "Vicepresidente",
    nombre: "Dr. Carlos Mendoza",
    cedula: "V-14890123",
    wallet: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    avatar: "🏛️",
    bio: "Coordinador de relaciones institucionales y ejecutor ejecutivo de proyectos de desarrollo aprobados por la asamblea.",
    badgeClass: "badge-blue",
  },
  {
    cargo: "Secretaria General",
    nombre: "Lic. María Rodríguez",
    cedula: "V-16789456",
    wallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    avatar: "📝",
    bio: "Custodia de las actas de asamblea, certificación digital de hash de acuerdos y supervisión de registros cooperativos.",
    badgeClass: "badge-purple",
  },
  {
    cargo: "Contralor Institucional",
    nombre: "Abg. Alejandro Torres",
    cedula: "V-11234567",
    wallet: "0x3C44CdD16053471b02368B1E529E732F7922a346",
    avatar: "🛡️",
    bio: "Auditor principal de transparencia, fiscalización de votaciones y garante del cumplimiento estatutario y legal.",
    badgeClass: "badge-rose",
  },
  {
    cargo: "Contadora Principal",
    nombre: "Lcda. Elena Gómez",
    cedula: "V-18901234",
    wallet: "0x90F79bf6EB2c4f8096638522f8a92790e72A0e00",
    avatar: "💼",
    bio: "Gestión contable del tesoro, fiscalización de aportes de capital social y proyecciones de rentabilidad distributiva.",
    badgeClass: "badge-amber",
  },
];

export default function LandingPage({ onExplorePropuestas, onConnectWallet }: LandingPageProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
      {/* Hero Section */}
      <section
        className="card"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 253, 244, 0.9))",
          border: "1px solid rgba(167, 243, 208, 0.8)",
          padding: "48px 36px",
          textAlign: "center",
          boxShadow: "0 20px 40px -10px rgba(52, 211, 153, 0.15)",
        }}
      >
        <span className="badge badge-mint" style={{ padding: "6px 16px", fontSize: "0.85rem", marginBottom: "16px" }}>
          🌱 Modelo Cooperativo Descentralizado (Web3 DAO)
        </span>
        <h1
          style={{
            fontSize: "2.8rem",
            fontWeight: 900,
            lineHeight: 1.2,
            letterSpacing: "-0.03em",
            margin: "16px 0",
            background: "linear-gradient(135deg, #047857, #1d4ed8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Cooperativa "Los Cappones"
        </h1>
        <p
          style={{
            fontSize: "1.15rem",
            color: "#475569",
            maxWidth: "780px",
            margin: "0 auto 28px",
            lineHeight: 1.7,
          }}
        >
          Transformando la economía social a través de la tecnología blockchain. Gobernanza transparente,
          tesorería descentralizada y participación democrática directa donde cada socio cuenta con voz y voto asegurado por contratos inteligentes.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
          <button className="button" style={{ padding: "14px 28px", fontSize: "1rem" }} onClick={onExplorePropuestas}>
            📊 Explorar Propuestas
          </button>
          <button className="button-outline" style={{ padding: "14px 28px", fontSize: "1rem" }} onClick={onConnectWallet}>
            🦊 Ingresar con Wallet
          </button>
        </div>
      </section>

      {/* Filosofía y Principios Cooperativos */}
      <section className="card">
        <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", marginBottom: "20px" }}>
          🏛️ Filosofía e Identidad Cooperativista
        </h2>
        <div className="grid">
          <div style={{ background: "#f0fdf4", padding: "20px", borderRadius: "16px", border: "1px solid #bbf7d0" }}>
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🤝</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#065f46" }}>Democracia Social</h3>
            <p style={{ fontSize: "0.9rem", color: "#334155", marginTop: "6px" }}>
              Cada socio registrado posee voz y derecho al voto en las asambleas, respaldado por contratos inteligentes auditables.
            </p>
          </div>

          <div style={{ background: "#edf2fe", padding: "20px", borderRadius: "16px", border: "1px solid #bfdbfe" }}>
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🛡️</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e40af" }}>Transparencia Inmutable</h3>
            <p style={{ fontSize: "0.9rem", color: "#334155", marginTop: "6px" }}>
              Cada acuerdo y acta institucional queda registrada criptográficamente con SHA-256 en la blockchain y registro central.
            </p>
          </div>

          <div style={{ background: "#faf5ff", padding: "20px", borderRadius: "16px", border: "1px solid #e9d5ff" }}>
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🌱</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#6b21a8" }}>Prosperidad Colectiva</h3>
            <p style={{ fontSize: "0.9rem", color: "#334155", marginTop: "6px" }}>
              El capital social aportado financia proyectos de inversión productivos de alto retorno social y económico.
            </p>
          </div>
        </div>
      </section>

      {/* Logros e Impacto */}
      <section className="card">
        <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", marginBottom: "20px" }}>
          📈 Logros e Impacto de la Plataforma
        </h2>
        <div className="grid">
          <div className="stat-card">
            <span className="badge badge-mint">Capital Colectivizado</span>
            <div className="stat-value">150.00 ETH</div>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "4px" }}>Fondo total de la tesorería cooperativa</p>
          </div>

          <div className="stat-card">
            <span className="badge badge-blue">Propuestas Ejecutadas</span>
            <div className="stat-value" style={{ color: "#2563eb" }}>14 Proyectos</div>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "4px" }}>100% financiados y aprobados por la asamblea</p>
          </div>

          <div className="stat-card">
            <span className="badge badge-purple">Socios Registrados</span>
            <div className="stat-value" style={{ color: "#7c3aed" }}>45 Socios</div>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "4px" }}>Participación del 92% en las asambleas</p>
          </div>

          <div className="stat-card">
            <span className="badge badge-rose">Actas Certificadas</span>
            <div className="stat-value" style={{ color: "#db2777" }}>28 Actas</div>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "4px" }}>Selladas con hash cryptographic SHA-256</p>
          </div>
        </div>
      </section>

      {/* Junta Directiva */}
      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a" }}>👔 Junta Directiva Institucional</h2>
            <p style={{ fontSize: "0.9rem", color: "#64748b" }}>Órgano directivo electo para el periodo 2026-2028</p>
          </div>
          <span className="badge badge-blue">Elecciones Activas</span>
        </div>

        <div className="grid">
          {JUNTA_DIRECTIVA_MEMBERS.map((dir, idx) => (
            <div
              key={idx}
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                border: "1px solid #e2e8f0",
                borderRadius: "18px",
                padding: "22px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                boxShadow: "0 4px 15px rgba(148, 163, 184, 0.06)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className={`badge ${dir.badgeClass}`}>{dir.cargo}</span>
                <span style={{ fontSize: "1.8rem" }}>{dir.avatar}</span>
              </div>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>{dir.nombre}</h3>
                <div style={{ fontSize: "0.8rem", color: "#64748b", fontFamily: "monospace" }}>Cédula: {dir.cedula}</div>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.5, flex: "1" }}>
                {dir.bio}
              </p>
              <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "10px", fontSize: "0.75rem", fontFamily: "monospace", color: "#64748b" }}>
                Wallet: {dir.wallet.substring(0, 8)}...{dir.wallet.substring(dir.wallet.length - 6)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contacto e Información Institucional */}
      <section className="card" style={{ background: "linear-gradient(135deg, #f8fafc, #edf2fe)" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "16px" }}>
          📞 Contacto & Canales Institucionales
        </h2>
        <div className="grid">
          <div>
            <div style={{ fontWeight: 700, color: "#1e40af" }}>Sede Principal</div>
            <div style={{ fontSize: "0.9rem", color: "#475569" }}>Av. Principal Los Cappones, Edif. DAO Piso 4, Caracas - Venezuela</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#1e40af" }}>Teléfonos Institucionales</div>
            <div style={{ fontSize: "0.9rem", color: "#475569" }}>+58 (212) 555-0199 / +58 (414) 123-4567</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#1e40af" }}>Correo Electrónico</div>
            <div style={{ fontSize: "0.9rem", color: "#475569" }}>anlucorporations@gmail.com</div>
          </div>
        </div>
      </section>
    </div>
  );
}
