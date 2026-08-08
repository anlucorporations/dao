"use client";

import Image from "next/image";

interface LandingPageProps {
  onExplorePropuestas: () => void;
  onConnectWallet: () => void;
}

const JUNTA_DIRECTIVA_MEMBERS = [
  {
    cargo: "Presidente",
    nombre: "Ana Lucía Morales",
    cedula: "V-12533620",
    wallet: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    avatar: "👑",
    bio: "Líder institucional y ejecutiva de la Cooperativa Los Cappones. Encargada de la dirección estratégica, gobernanza y supervisión del ecosistema Web3.",
    badgeClass: "badge-mint",
  },
  {
    cargo: "Vicepresidente",
    nombre: "Carlos Eduardo Mendoza",
    cedula: "V-14890123",
    wallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    avatar: "🏛️",
    bio: "Coordinador de desarrollo de proyectos cooperativos e infraestructura de inversión social.",
    badgeClass: "badge-blue",
  },
  {
    cargo: "Secretaria General",
    nombre: "Elena Beatriz Rivas",
    cedula: "V-16789456",
    wallet: "0x3C44CdDDB6a900fa2b585dd299e03d12FA4293BC",
    avatar: "📝",
    bio: "Custodia de las actas de asamblea, certificación digital de hash de acuerdos y supervisión del libro de socios.",
    badgeClass: "badge-purple",
  },
  {
    cargo: "Contralor Institucional",
    nombre: "Roberto José Fernández",
    cedula: "V-18234567",
    wallet: "0x90F79bf6EB2c4f8096638522f8a92790e72A0e00",
    avatar: "🛡️",
    bio: "Auditor principal de transparencia, fiscalización de votaciones y garante del cumplimiento estatutario.",
    badgeClass: "badge-rose",
  },
  {
    cargo: "Contadora Principal",
    nombre: "Patricia Alejandra Silva",
    cedula: "V-19456789",
    wallet: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    avatar: "💼",
    bio: "Gestión contable del tesoro, fiscalización de aportes y proyecciones de distribución de excedentes.",
    badgeClass: "badge-amber",
  },
];

const BENEFICIOS_NUEVOS_SOCIOS = [
  {
    icono: "💎",
    titulo: "Participación en Excedentes",
    descripcion: "Distribución equitativa y transparente del retorno financiero generado por los proyectos de inversión aprobados por la asamblea.",
  },
  {
    icono: "🗳️",
    titulo: "Voto Social Criptográfico",
    descripcion: "Democracia real basada en '1 Socio = 1 Voto'. Ningún grupo económico puede manipular o imponer decisiones en la cooperativa.",
  },
  {
    icono: "🛡️",
    titulo: "Auditoría On-Chain 24/7",
    descripcion: "Todos los movimientos de tesorería y balances se registran de forma pública e inmutable en la red blockchain.",
  },
  {
    icono: "🌱",
    titulo: "Créditos e Incentivos Productivos",
    descripcion: "Acceso preferencial a líneas de financiamiento descentralizadas para proyectos agrícolas, tecnológicos y comerciales.",
  },
  {
    icono: "📜",
    titulo: "Certificación Digital SHA-256",
    descripcion: "Verificador de autenticidad instantáneo en navegador para validar actas, títulos de capital y constancias institucionales.",
  },
  {
    icono: "🌐",
    titulo: "Acceso Global a la Tesorería",
    descripcion: "Conexión transparente desde cualquier parte del mundo mediante tu billetera Web3 (MetaMask) sin intermediarios bancarios.",
  },
];

export default function LandingPage({ onExplorePropuestas, onConnectWallet }: LandingPageProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
      {/* Hero Section */}
      <section
        className="card"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 253, 244, 0.95))",
          border: "1px solid rgba(167, 243, 208, 0.8)",
          padding: "48px 36px",
          textAlign: "center",
          boxShadow: "0 20px 40px -10px rgba(52, 211, 153, 0.15)",
        }}
      >
        <span className="badge badge-mint" style={{ padding: "6px 18px", fontSize: "0.85rem", marginBottom: "16px" }}>
          🌱 El Futuro del Cooperativismo Web3 Descentralizado
        </span>
        <h1
          style={{
            fontSize: "2.9rem",
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
            maxWidth: "800px",
            margin: "0 auto 32px",
            lineHeight: 1.7,
          }}
        >
          Transformando la economía social y productiva mediante contratos inteligentes inmutables.
          Gobernanza participativa, distribución justa de excedentes y control democrático al servicio de nuestros socios.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
          <button className="button" style={{ padding: "14px 32px", fontSize: "1rem" }} onClick={onConnectWallet}>
            🚀 Asóciate Hoy con MetaMask
          </button>
          <button className="button-outline" style={{ padding: "14px 32px", fontSize: "1rem" }} onClick={onExplorePropuestas}>
            📊 Ver Propuestas Activas
          </button>
        </div>
      </section>

      {/* CASOS DE ÉXITO Y EXPERIENCIA DE LOS SOCIOS */}
      <section className="card">
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span className="badge badge-blue">Casos de Éxito & Experiencia Reales</span>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginTop: "8px" }}>
            🌟 Impacto Social y Resultados Positivos de Nuestra Comunidad
          </h2>
          <p style={{ color: "#64748b", maxWidth: "650px", margin: "8px auto 0" }}>
            Conoce cómo la combinación del cooperativismo tradicional y la tecnología blockchain impulsa proyectos de alto rendimiento.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {/* Caso 1 */}
          <div style={{ background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.04)" }}>
            <div style={{ position: "relative", width: "100%", height: "220px" }}>
              <Image src="/images/success1.jpg" alt="Casos Positivos" fill style={{ objectFit: "cover" }} />
            </div>
            <div style={{ padding: "20px" }}>
              <span className="badge badge-mint">Tecnología & Agroinversión</span>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginTop: "8px" }}>
                Financiamiento Colectivo Tecnológico
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#475569", marginTop: "8px", lineHeight: 1.6 }}>
                A través de propuestas descentralizadas votadas por los socios, logramos adquirir infraestructura de cómputo y sensores agrícolas inteligentes que incrementaron un 38% la eficiencia productiva de la cooperativa.
              </p>
            </div>
          </div>

          {/* Caso 2 */}
          <div style={{ background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.04)" }}>
            <div style={{ position: "relative", width: "100%", height: "220px" }}>
              <Image src="/images/success2.jpg" alt="Asamblea de Socios" fill style={{ objectFit: "cover" }} />
            </div>
            <div style={{ padding: "20px" }}>
              <span className="badge badge-blue">Asamblea 100% Criptográfica</span>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginTop: "8px" }}>
                Democracia Institucional Transparente
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#475569", marginTop: "8px", lineHeight: 1.6 }}>
                En nuestras asambleas, más de 50 socios ejercen su derecho al voto de manera inmutable mediante la red blockchain. Cada acta queda sellada con hash SHA-256 evitando alteraciones o disputas.
              </p>
            </div>
          </div>

          {/* Caso 3 */}
          <div style={{ background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.04)" }}>
            <div style={{ position: "relative", width: "100%", height: "220px" }}>
              <Image src="/images/benefits.jpg" alt="Crecimiento Patrimonial" fill style={{ objectFit: "cover" }} />
            </div>
            <div style={{ padding: "20px" }}>
              <span className="badge badge-purple">Rentabilidad & Excedentes</span>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginTop: "8px" }}>
                Retorno Social y Distribución Justa
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#475569", marginTop: "8px", lineHeight: 1.6 }}>
                La tesorería cooperativa descentralizada permite que el 100% de los excedentes generados se distribuyan directamente entre los socios registrados según su participación transparente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS PARA LOS NUEVOS SOCIOS */}
      <section className="card" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #edf2fe 100%)" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span className="badge badge-purple">¿Por qué unirte?</span>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginTop: "8px" }}>
            💎 Beneficios Exclusivos para Nuevos Socios
          </h2>
          <p style={{ color: "#64748b", maxWidth: "600px", margin: "8px auto 0" }}>
            Diseñado para proteger tu inversión y potenciar tus derechos democráticos dentro de la organización.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {BENEFICIOS_NUEVOS_SOCIOS.map((b, idx) => (
            <div
              key={idx}
              style={{
                background: "#ffffff",
                padding: "24px",
                borderRadius: "18px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 15px rgba(148, 163, 184, 0.05)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ fontSize: "2.2rem" }}>{b.icono}</div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>{b.titulo}</h3>
              <p style={{ fontSize: "0.88rem", color: "#475569", lineHeight: 1.6 }}>{b.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Junta Directiva */}
      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a" }}>👔 Junta Directiva Institucional</h2>
            <p style={{ fontSize: "0.9rem", color: "#64748b" }}>Órgano directivo electo que lidera las operaciones de la Cooperativa</p>
          </div>
          <span className="badge badge-blue">Cuentas Nativas de Anvil</span>
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

      {/* Call to Action Final */}
      <section className="card" style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", color: "#ffffff", textAlign: "center", padding: "40px" }}>
        <h2 style={{ fontSize: "2.2rem", fontWeight: 900, marginBottom: "12px" }}>
          🚀 ¿Listo para formar parte de la Cooperativa Los Cappones?
        </h2>
        <p style={{ fontSize: "1rem", color: "#94a3b8", maxWidth: "600px", margin: "0 auto 24px" }}>
          Conecta tu billetera MetaMask en pocos segundos e intégrate a la asamblea digital con pleno derecho social y patrimonial.
        </p>
        <button className="button" style={{ padding: "14px 32px", fontSize: "1rem", background: "#38bdf8", color: "#0f172a" }} onClick={onConnectWallet}>
          🦊 Conectar mi Wallet ahora
        </button>
      </section>
    </div>
  );
}
