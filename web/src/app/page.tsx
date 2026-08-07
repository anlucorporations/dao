"use client";

import { useState, useEffect } from "react";
import HeaderNav, { TabType } from "@/components/HeaderNav";
import LandingPage from "@/components/LandingPage";
import PropuestasDashboard from "@/components/PropuestasDashboard";
import ActasModulo from "@/components/ActasModulo";
import FinanzasModulo from "@/components/FinanzasModulo";
import SociosCrudModulo from "@/components/SociosCrudModulo";
import MiBalanceModulo from "@/components/MiBalanceModulo";
import MetricsModulo from "@/components/MetricsModulo";
import SistemaModulo from "@/components/SistemaModulo";

const DIRECTIVOS_WALLETS = [
  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", // Presidente (Cuenta #0 Anvil)
  "0x70997970c51812dc3a010c7d01b50e0d17dc79c8", // Vicepresidente (Cuenta #1 Anvil)
  "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc", // Secretario (Cuenta #2 Anvil)
  "0x90f79bf6eb2c4f6703055175b43657a0501a3341", // Contralor (Cuenta #3 Anvil)
  "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65", // Contador (Cuenta #4 Anvil)
];

const GOVERNANCE_WALLETS = [
  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", // Presidente
  "0x70997970c51812dc3a010c7d01b50e0d17dc79c8", // Vicepresidente
  "0x90f79bf6eb2c4f6703055175b43657a0501a3341", // Contralor
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>("inicio");
  const [wallet, setWallet] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("Socio / Visitante");
  const [notification, setNotification] = useState<string | null>(null);

  // Verificación de roles
  const isDirectivo = wallet ? DIRECTIVOS_WALLETS.includes(wallet.toLowerCase()) : false;
  const isGovernanceOwner = wallet ? GOVERNANCE_WALLETS.includes(wallet.toLowerCase()) : false;

  function disconnectWallet() {
    setWallet(null);
    setUserRole("Socio / Visitante");
    setActiveTab("inicio");
    showNotification("Wallet desconectada correctamente.");
  }

  function getRoleForWallet(addr: string): string {
    const lower = addr.toLowerCase();
    if (lower === "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266") return "Contralor / Owner (Ana Lucía Morales)";
    if (lower === "0x70997970c51812dc3a010c7d01b50e0d17dc79c8") return "Vicepresidente (Carlos Mendoza)";
    if (lower === "0x3c44cdddb6a900fa2b585dd299e03d12FA4293BC".toLowerCase()) return "Secretaria (Elena Rivas)";
    if (lower === "0x90f79bf6eb2c4f870365e785982e1f101e93b906".toLowerCase()) return "Presidente (Roberto Fernández)";
    if (lower === "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65") return "Contadora (Patricia Silva)";
    if (DIRECTIVOS_WALLETS.includes(lower)) return "Junta Directiva";
    return "Socio Cooperativista";
  }

  async function connectWallet() {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("MetaMask no está instalada. Por favor instala la extensión MetaMask.");
      return;
    }
    try {
      const provider = (window as any).ethereum;
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      if (accounts && accounts[0]) {
        const addr = accounts[0];
        setWallet(addr);
        setUserRole(getRoleForWallet(addr));
        showNotification("Wallet conectada con éxito.");
      }
    } catch (err: any) {
      alert("Error al conectar wallet: " + (err.message || err));
    }
  }

  function showNotification(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
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
          setUserRole(getRoleForWallet(addr));
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

  function handleEmitirVoto(propuestaId: number, voto: "favor" | "contra" | "abstencion") {
    showNotification(`Voto "${voto.toUpperCase()}" emitido correctamente para la propuesta #${propuestaId}.`);
  }

  return (
    <div className="app-container">
      {/* Barra de Navegación Dinámica */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wallet={wallet}
        userRole={userRole}
        isDirectivo={isDirectivo}
        isGovernanceOwner={isGovernanceOwner}
        onConnectWallet={connectWallet}
        onDisconnectWallet={disconnectWallet}
      />

      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#065f46",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            fontWeight: 700,
            fontSize: "0.9rem",
            zIndex: 1000,
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          {notification}
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === "inicio" && (
          <LandingPage
            onExplorePropuestas={() => setActiveTab("propuestas")}
            onConnectWallet={connectWallet}
          />
        )}

        {activeTab === "propuestas" && (
          <PropuestasDashboard
            isDirectivo={isDirectivo}
            isGovernanceOwner={isGovernanceOwner}
            wallet={wallet}
            onEmitirVoto={handleEmitirVoto}
          />
        )}

        {activeTab === "actas" && <ActasModulo />}

        {activeTab === "mi-balance" && (
          <MiBalanceModulo wallet={wallet} userRole={userRole} />
        )}

        {activeTab === "finanzas" && <FinanzasModulo />}

        {activeTab === "socios" && <SociosCrudModulo />}

        {activeTab === "metrics" && <MetricsModulo />}

        {activeTab === "sistema" && <SistemaModulo />}
      </main>
    </div>
  );
}
