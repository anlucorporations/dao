"use client";

import { useState } from "react";
import { calculateFileSHA256 } from "@/lib/utils";

interface ActaRecord {
  id: number;
  codigo: string;
  titulo: string;
  fecha: string;
  hashSHA256: string;
  firmadoPor: string;
}

const ACTAS_REGISTRADAS: ActaRecord[] = [
  {
    id: 1,
    codigo: "ACTA-2026-001",
    titulo: "Acta de Constitución y Elección de Junta Directiva 2026-2028",
    fecha: "2026-01-15",
    hashSHA256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    firmadoPor: "Presidente anlu (V-12533620)",
  },
  {
    id: 2,
    codigo: "ACTA-2026-002",
    titulo: "Aprobación de Fondo de Reserva e Inversión Tecnológica",
    fecha: "2026-04-10",
    hashSHA256: "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0",
    firmadoPor: "Asamblea General de Socios",
  },
  {
    id: 3,
    codigo: "ACTA-2026-003",
    titulo: "Aprobación de la Propuesta de Adquisición de Servidores",
    fecha: "2026-07-22",
    hashSHA256: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    firmadoPor: "Junta Directiva Institucional",
  },
];

export default function ActasModulo() {
  const [fileToVerify, setFileToVerify] = useState<File | null>(null);
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    acta?: ActaRecord;
    message: string;
  } | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileToVerify(file);
      setVerificationResult(null);
      setVerifying(true);

      try {
        const hash = await calculateFileSHA256(file);
        setComputedHash(hash);

        // Verificación OFF-CHAIN en la base de datos (Ahorro de Gas)
        const matchedActa = ACTAS_REGISTRADAS.find(
          (a) => a.hashSHA256.toLowerCase() === hash.toLowerCase()
        );

        if (matchedActa) {
          setVerificationResult({
            valid: true,
            acta: matchedActa,
            message: "¡Acta Auténtica y Certificada! El hash coincide exactamente con los registros de la Cooperativa.",
          });
        } else {
          setVerificationResult({
            valid: false,
            message: "El hash generado no se encuentra registrado en el sistema. El documento podría haber sido modificado.",
          });
        }
      } catch (err: any) {
        setVerificationResult({
          valid: false,
          message: "Error al procesar el archivo: " + err.message,
        });
      } finally {
        setVerifying(false);
      }
    }
  }

  function downloadActa(acta: ActaRecord) {
    const content = `================================================
ACTA OFICIAL COOPERATIVA LOS CAPPONES
Código: ${acta.codigo}
Título: ${acta.titulo}
Fecha: ${acta.fecha}
Firmado por: ${acta.firmadoPor}
SHA-256 Hash: ${acta.hashSHA256}
================================================
Documento verificado e inmutable.`;
    
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${acta.codigo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Encabezado Módulo */}
      <div className="card">
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a" }}>Módulo de Actas e Histórico Institucional</h1>
        <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
          Consulta de actas emitidas y verificador off-chain de integridad mediante hash SHA-256
        </p>
      </div>

      {/* Verificador Off-Chain de Actas */}
      <div className="card" style={{ background: "linear-gradient(135deg, #ffffff, #f0fdf4)", border: "1px solid #bbf7d0" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#065f46", marginBottom: "8px" }}>
          Verificador de Autenticidad Off-Chain (SHA-256)
        </h2>
        <p style={{ fontSize: "0.85rem", color: "#475569", marginBottom: "18px" }}>
          Adjunta un archivo local (PDF, JSON o TXT). El navegador calculará el hash criptográfico localmente y verificará off-chain su presencia en la base de datos, ahorrando gas.
        </p>

        <div
          style={{
            border: "2px dashed #34d399",
            borderRadius: "16px",
            padding: "32px",
            textAlign: "center",
            background: "rgba(255, 255, 255, 0.8)",
            cursor: "pointer",
          }}
        >
          <input
            type="file"
            id="actaFileInput"
            onChange={handleFileSelect}
            style={{ display: "none" }}
            accept=".pdf,.txt,.json"
          />
          <label htmlFor="actaFileInput" style={{ cursor: "pointer" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>📄</div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
              {fileToVerify ? fileToVerify.name : "Haz clic o arrastra aquí el archivo de Acta a verificar"}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>
              Formatos soportados: PDF, TXT, JSON (Máx 25MB)
            </div>
          </label>
        </div>

        {verifying && (
          <div style={{ marginTop: "16px", color: "#2563eb", fontWeight: 700, fontSize: "0.9rem" }}>
            Calculando SHA-256 y consultando registro off-chain...
          </div>
        )}

        {computedHash && (
          <div style={{ marginTop: "16px", background: "#f8fafc", padding: "12px", borderRadius: "10px", fontFamily: "monospace", fontSize: "0.8rem" }}>
            <strong style={{ color: "#475569" }}>Hash SHA-256 Calculado:</strong> {computedHash}
          </div>
        )}

        {verificationResult && (
          <div
            className="notice"
            style={{
              marginTop: "16px",
              background: verificationResult.valid ? "#d1fae5" : "#fee2e2",
              borderColor: verificationResult.valid ? "#34d399" : "#fca5a5",
              color: verificationResult.valid ? "#065f46" : "#991b1b",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: "1rem", marginBottom: "4px" }}>
              {verificationResult.message}
            </div>
            {verificationResult.acta && (
              <div style={{ fontSize: "0.85rem", marginTop: "8px" }}>
                <div><strong>Código:</strong> {verificationResult.acta.codigo}</div>
                <div><strong>Título:</strong> {verificationResult.acta.titulo}</div>
                <div><strong>Firmado por:</strong> {verificationResult.acta.firmadoPor}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Listado Histórico de Actas */}
      <div className="card">
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", marginBottom: "16px" }}>
          Histórico Oficial de Actas Institucionales
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {ACTAS_REGISTRADAS.map((acta) => (
            <div
              key={acta.id}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span className="badge badge-blue">{acta.codigo}</span>
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Fecha: {acta.fecha}</span>
                </div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>{acta.titulo}</h3>
                <div style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "monospace", marginTop: "4px" }}>
                  SHA-256: {acta.hashSHA256}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button className="button-outline" style={{ padding: "8px 14px", fontSize: "0.8rem" }} onClick={() => downloadActa(acta)}>
                  Descargar Acta
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

