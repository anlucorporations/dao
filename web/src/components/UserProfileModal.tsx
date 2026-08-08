"use client";

import { useState } from "react";
import { formatAddress, formatETH } from "@/lib/utils";

interface UserProfileModalProps {
  wallet: string | null;
  userRole: string;
  onDisconnect: () => void;
  onClose: () => void;
  pendingProposalsCount?: number;
  userBalanceETH?: number;
  userCapitalPercentage?: number;
}

export default function UserProfileModal({
  wallet,
  userRole,
  onDisconnect,
  onClose,
  pendingProposalsCount = 2,
  userBalanceETH = 12.5,
  userCapitalPercentage = 15.4,
}: UserProfileModalProps) {
  const [copied, setCopied] = useState(false);

  if (!wallet) return null;

  function copyWallet() {
    if (wallet) {
      navigator.clipboard.writeText(wallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="floating-user-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #a78bfa, #60a5fa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: "#ffffff",
            }}
          >
            {"👤"}
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748b" }}>Cuenta Conectada</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>
              {userRole}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            fontSize: "1.1rem",
            color: "#94a3b8",
            cursor: "pointer",
            padding: "2px 6px",
          }}
        >
          {"✕"}
        </button>
      </div>

      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "12px",
          marginBottom: "16px",
        }}
      >
        <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Dirección Wallet</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
          <span style={{ fontFamily: "monospace", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>
            {formatAddress(wallet)}
          </span>
          <button
            onClick={copyWallet}
            style={{
              background: copied ? "#d1fae5" : "#e2e8f0",
              color: copied ? "#059669" : "#475569",
              border: "none",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "0.75rem",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {copied ? "¡Copiado!" : "Copiar"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
        <div style={{ background: "#edf2fe", padding: "12px", borderRadius: "12px" }}>
          <div style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 700 }}>Mi Balance</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e40af", marginTop: "2px" }}>
            {formatETH(userBalanceETH)}
          </div>
        </div>
        <div style={{ background: "#f0fdf4", padding: "12px", borderRadius: "12px" }}>
          <div style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 700 }}>Participación</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#065f46", marginTop: "2px" }}>
            {userCapitalPercentage}%
          </div>
        </div>
      </div>

      {pendingProposalsCount > 0 && (
        <div
          style={{
            background: "#fef3c7",
            border: "1px solid #fde68a",
            borderRadius: "12px",
            padding: "12px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#92400e" }}>
              ⏳ {pendingProposalsCount} Votaciones Pendientes
            </div>
            <div style={{ fontSize: "0.75rem", color: "#b45309" }}>Tienes propuestas por votar</div>
          </div>
          <span className="badge badge-amber" style={{ fontSize: "0.7rem" }}>Acción requerida</span>
        </div>
      )}

      <button
        onClick={() => {
          onDisconnect();
          onClose();
        }}
        style={{
          width: "100%",
          background: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fca5a5",
          padding: "10px",
          borderRadius: "12px",
          fontWeight: 700,
          cursor: "pointer",
          fontSize: "0.9rem",
          transition: "all 0.2s ease",
        }}
      >
        Desconectar Wallet
      </button>
    </div>
  );
}


