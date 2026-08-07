"use client";

import { useState } from "react";
import UserProfileModal from "./UserProfileModal";

export type TabType = "inicio" | "propuestas" | "actas" | "mi-balance" | "finanzas" | "socios" | "metrics" | "sistema";

interface HeaderNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  wallet: string | null;
  userRole: string;
  isDirectivo: boolean;
  isGovernanceOwner: boolean;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
}

export default function HeaderNav({
  activeTab,
  setActiveTab,
  wallet,
  userRole,
  isDirectivo,
  isGovernanceOwner,
  onConnectWallet,
  onDisconnectWallet,
}: HeaderNavProps) {
  const [showProfileCard, setShowProfileCard] = useState(false);

  return (
    <header className="header" style={{ position: "relative" }}>
      {/* Brand Logo */}
      <div className="brand" onClick={() => setActiveTab("inicio")}>
        <div className="brand-logo">LC</div>
        <div>
          <div className="brand-title">Los Cappones DAO</div>
          <div className="brand-subtitle">Plataforma Cooperativa Web3</div>
        </div>
      </div>

      {/* Role-based Dynamic Navigation Tabs */}
      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === "inicio" ? "active" : ""}`}
          onClick={() => setActiveTab("inicio")}
        >
          🏛️ Inicio
        </button>

        <button
          className={`nav-tab ${activeTab === "propuestas" ? "active" : ""}`}
          onClick={() => setActiveTab("propuestas")}
        >
          📊 Propuestas
        </button>

        <button
          className={`nav-tab ${activeTab === "actas" ? "active" : ""}`}
          onClick={() => setActiveTab("actas")}
        >
          📜 Actas
        </button>

        <button
          className={`nav-tab ${activeTab === "metrics" ? "active" : ""}`}
          onClick={() => setActiveTab("metrics")}
        >
          📈 Métricas
        </button>

        <button
          className={`nav-tab ${activeTab === "sistema" ? "active" : ""}`}
          onClick={() => setActiveTab("sistema")}
        >
          ⚙️ Sistema
        </button>

        {/* Tab exclusivo para Socios Conectados */}
        {wallet && (
          <button
            className={`nav-tab ${activeTab === "mi-balance" ? "active" : ""}`}
            onClick={() => setActiveTab("mi-balance")}
          >
            💰 Mi Balance
          </button>
        )}

        {/* Tab exclusivo para la Junta Directiva */}
        {isDirectivo && (
          <button
            className={`nav-tab ${activeTab === "finanzas" ? "active" : ""}`}
            onClick={() => setActiveTab("finanzas")}
          >
            📈 Finanzas
          </button>
        )}

        {/* Tab exclusivo para Presidente / Owner / Contralor */}
        {isGovernanceOwner && (
          <button
            className={`nav-tab ${activeTab === "socios" ? "active" : ""}`}
            onClick={() => setActiveTab("socios")}
          >
            👥 Socios
          </button>
        )}
      </nav>

      {/* Wallet / Profile Control */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {wallet ? (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowProfileCard(!showProfileCard)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(52, 211, 153, 0.5)",
                padding: "8px 16px",
                borderRadius: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(52, 211, 153, 0.15)",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 8px #10b981",
                }}
              />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>
                  {userRole}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>
                  {wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}
                </div>
              </div>
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>▼</span>
            </button>

            {showProfileCard && (
              <UserProfileModal
                wallet={wallet}
                userRole={userRole}
                onDisconnect={onDisconnectWallet}
                onClose={() => setShowProfileCard(false)}
              />
            )}
          </div>
        ) : (
          <button className="button" onClick={onConnectWallet}>
            🦊 Conectar MetaMask
          </button>
        )}
      </div>
    </header>
  );
}
