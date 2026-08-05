"use client";

import { useState, useEffect } from "react";
import HeaderNav, { TabType } from "@/components/HeaderNav";
import LandingPage from "@/components/LandingPage";
import PropuestasDashboard from "@/components/PropuestasDashboard";
import ActasModulo from "@/components/ActasModulo";
import FinanzasModulo from "@/components/FinanzasModulo";
import SociosCrudModulo from "@/components/SociosCrudModulo";
import MiBalanceModulo from "@/components/MiBalanceModulo";

const DIRECTIVOS_WALLETS = [
  "0xa0ee7a142d267c1f36714e4a8f75612f20a79720", // Presidente / SuperUsuario (anlu)
  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", // Vicepresidente
  "0x70997970c51812dc3a010c7d01b50e0d17dc79c8", // Secretaria
  "0x3c44cdd16053471b02368b1e529e732f7922a346", // Contralor
  "0x90f79bf6eb2c4f8096638522f8a92790e72a0e00", // Contadora
];

const GOVERNANCE_WALLETS = [
  "0xa0ee7a142d267c1f36714e4a8f75612f20a79720", // Presidente / Owner
  "0x3c44cdd16053471b02368b1e529e732f7922a346", // Contralor
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

        if (addr.toLowerCase() === "0xa0ee7a142d267c1f36714e4a8f75612f20a79720") {
          setUserRole("Presidente (anlu)");
        } else if (addr.toLowerCase() === "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266") {
          setUserRole("Vicepresidente");
        } else if (addr.toLowerCase() === "0x3c44cdd16053471b02368b1e529e732f7922a346") {
          setUserRole("Contralor Institucional");
        } else if (DIRECTIVOS_WALLETS.includes(addr.toLowerCase())) {
          setUserRole("Junta Directiva");
        } else {
          setUserRole("Socio Cooperativista");
        }

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
          if (addr.toLowerCase() === "0xa0ee7a142d267c1f36714e4a8f75612f20a79720") {
            setUserRole("Presidente (anlu)");
          } else if (addr.toLowerCase() === "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266") {
            setUserRole("Vicepresidente");
          } else if (addr.toLowerCase() === "0x3c44cdd16053471b02368b1e529e732f7922a346") {
            setUserRole("Contralor Institucional");
          } else if (DIRECTIVOS_WALLETS.includes(addr.toLowerCase())) {
            setUserRole("Junta Directiva");
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
      </main>
    </div>
  );
}
