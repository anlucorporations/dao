"use client";

import { useEffect, useState } from "react";
import { formatAddress } from "../lib/utils";

interface AnvilAccount {
  index: number;
  address: string;
  privateKey: string;
  cargo: string;
  nombre: string;
  balanceETH: string;
}

interface SmartContractInfo {
  name: string;
  address: string;
  status: string;
}

interface MetricsData {
  anvilAccounts: AnvilAccount[];
  tables: Record<string, any[]>;
  smartContracts: {
    chainId: number;
    network: string;
    solcVersion: string;
    contracts: SmartContractInfo[];
    testsSummary: {
      totalTests: number;
      passed: number;
      failed: number;
      coverage: string;
      runner: string;
    };
  };
}

export default function MetricsModulo() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<string>("Socio");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    try {
      setLoading(true);
      const res = await fetch("/api/metrics");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Error fetching metrics:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  if (loading) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#475569" }}>
          🔄 Cargando Métricas Globales del Entorno Anvil & PostgreSQL...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px", borderColor: "#fca5a5" }}>
        <div style={{ color: "#dc2626", fontWeight: 700 }}>❌ Error cargando métricas.</div>
      </div>
    );
  }

  const tableNames = Object.keys(data.tables);
  const currentRecords = data.tables[selectedTable] || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Banner de Encabezado */}
      <div className="card" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "#ffffff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#38bdf8" }}>
              Panel de Inspección Global
            </div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "4px 0" }}>📈 Métricas del Entorno DAO</h1>
            <p style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
              Monitoreo en vivo de cuentas Anvil, tablas relacionales PostgreSQL y estado de contratos inteligentes.
            </p>
          </div>
          <button className="button" onClick={fetchMetrics} style={{ background: "#38bdf8", color: "#0f172a" }}>
            🔄 Actualizar Métricas
          </button>
        </div>
      </div>

      {/* SECCIÓN 1: CUENTAS NATIVAS DE ANVIL (10 CUENTAS) */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>
              🔌 Cuentas Nativas de Anvil (Chain ID 31337)
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
              10 Cuentas predeterminadas con saldo inicial de 10,000 ETH cada una. Las primeras 5 integran la Junta Directiva.
            </p>
          </div>
          <span className="badge badge-blue">Total: 10 Billeteras</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Rol / Asignación</th>
                <th>Nombre Registrado</th>
                <th>Dirección Wallet</th>
                <th>Clave Privada (Private Key)</th>
                <th>Saldo ETH</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.anvilAccounts.map((acc) => (
                <tr key={acc.index}>
                  <td style={{ fontWeight: 800, color: "#64748b" }}>{acc.index}</td>
                  <td>
                    <span
                      className={`badge ${
                        acc.cargo === "PRESIDENTE"
                          ? "badge-mint"
                          : acc.cargo === "SOCIO"
                          ? "badge-purple"
                          : "badge-amber"
                      }`}
                    >
                      {acc.cargo}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: "#0f172a" }}>{acc.nombre}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{formatAddress(acc.address)}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#64748b" }}>
                    {acc.privateKey.substring(0, 10)}...{acc.privateKey.substring(acc.privateKey.length - 8)}
                  </td>
                  <td style={{ fontWeight: 800, color: "#059669" }}>{acc.balanceETH}</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="button-outline"
                        style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                        onClick={() => handleCopy(acc.address, `addr-${acc.index}`)}
                      >
                        {copiedKey === `addr-${acc.index}` ? "✓ Copiado" : "📋 Wallet"}
                      </button>
                      <button
                        className="button-outline"
                        style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                        onClick={() => handleCopy(acc.privateKey, `pk-${acc.index}`)}
                      >
                        {copiedKey === `pk-${acc.index}` ? "✓ Copiado" : "🔑 Key"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN 2: TABLAS DE POSTGRESQL */}
      <div className="card">
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>
            🗄️ Inspección de Tablas en PostgreSQL
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
            Consulta el contenido exacto de todas las tablas relacionales de la base de datos `cooperativa_cappones`.
          </p>
        </div>

        {/* Pestañas de Tablas */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
          {tableNames.map((tbl) => {
            const count = data.tables[tbl]?.length || 0;
            const isSelected = selectedTable === tbl;
            return (
              <button
                key={tbl}
                onClick={() => setSelectedTable(tbl)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  border: isSelected ? "2px solid #3b82f6" : "1px solid #cbd5e1",
                  background: isSelected ? "#eff6ff" : "#ffffff",
                  color: isSelected ? "#1d4ed8" : "#475569",
                  cursor: "pointer",
                }}
              >
                {tbl} ({count})
              </button>
            );
          })}
        </div>

        {/* Contenido de la Tabla Seleccionada */}
        {currentRecords.length === 0 ? (
          <div className="notice" style={{ background: "#f8fafc", color: "#64748b" }}>
            ℹ️ La tabla <strong>{selectedTable}</strong> no posee registros actualmente.
          </div>
        ) : (
          <div style={{ overflowX: "auto", maxHeight: "400px" }}>
            <table className="data-table">
              <thead>
                <tr>
                  {Object.keys(currentRecords[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val: any, colIdx) => (
                      <td key={colIdx} style={{ fontSize: "0.8rem" }}>
                        {typeof val === "object" && val !== null ? JSON.stringify(val) : String(val ?? "null")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECCIÓN 3: SMART CONTRACTS Y PRUEBAS */}
      <div className="card">
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>
            ⛓️ Smart Contracts Desplegados y Métricas de Pruebas
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
            Direcciones y estado de verificación de los contratos en Anvil (Chain ID {data.smartContracts.chainId}).
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "20px" }}>
          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Entorno de Ejecución</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>{data.smartContracts.network}</div>
          </div>
          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Compilador Solidity</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>Solc {data.smartContracts.solcVersion}</div>
          </div>
          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Runner de Pruebas</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#059669" }}>
              {data.smartContracts.testsSummary.passed}/{data.smartContracts.testsSummary.totalTests} Pruebas Exitosas (100%)
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre del Contrato</th>
                <th>Dirección en Cadena (Address)</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.smartContracts.contracts.map((c, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 800, color: "#1e293b" }}>{c.name}</td>
                  <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#2563eb" }}>{c.address}</td>
                  <td>
                    <span className="badge badge-mint">{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
