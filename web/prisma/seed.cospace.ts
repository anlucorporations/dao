/*
  Seed idempotente para Prisma (Cospace-safe): web/prisma/seed.cospace.ts
  - No borra tablas completas
  - Usa upsert para evitar duplicados
  - No almacena claves privadas en la DB
  - Usa variables de entorno para direcciones sensibles
*/

import { PrismaClient, Cargo } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const DEFAULT_OWNER = {
  nombre: process.env.SEED_OWNER_NOMBRE || "Ana Lucía Morales (Owner Contralor)",
  cedula: process.env.SEED_OWNER_CEDULA || "V-12533620",
  correo: process.env.SEED_OWNER_CORREO || "contralor.owner@loscappones.coop",
  telefono: process.env.SEED_OWNER_TELEFONO || "+584120101010",
  direccion: process.env.SEED_OWNER_DIRECCION || "Av. Principal Los Cappones, Edif. Presidencia, Piso 3",
  sexo: process.env.SEED_OWNER_SEXO || "F",
  fechaNacimiento: process.env.SEED_OWNER_FECHA ? new Date(process.env.SEED_OWNER_FECHA) : new Date("1982-05-14"),
  estadoCivil: process.env.SEED_OWNER_ESTADOCIVIL || "Casado",
};

async function fetchLiveAnvilAccounts(): Promise<string[]> {
  const rpcEndpoints = [
    process.env.NEXT_PUBLIC_ANVIL_RPC_URL,
    "http://anvil:8545",
    "http://127.0.0.1:8545",
    "http://localhost:8545",
  ].filter(Boolean) as string[];

  for (const url of rpcEndpoints) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "eth_accounts", params: [], id: 1 }),
      });
      const data = await res.json();
      if (data?.result && Array.isArray(data.result) && data.result.length > 0) {
        console.log(`🔗 Conectado dinámicamente a Anvil RPC (${url}). ${data.result.length} cuentas capturadas.`);
        return data.result;
      }
    } catch (err) {
      // Ignorar y probar siguiente endpoint
    }
  }
  console.log("ℹ️ No se pudo conectar a un nodo Anvil activo en este paso. Se usarán las variables de entorno o direcciones por defecto.");
  return [];
}

function exportAnvilAccountsMd(addresses: string[]) {
  const lines = addresses.map((addr, i) => `| **${i}** | \`${addr}\` |`);
  const mdContent = `# Cuentas Anvil detectadas (solo direcciones)

| # | Dirección Wallet (Anvil) |
|---|---|
${lines.join("\n")}
`;
  try {
    const rootPath = path.resolve(__dirname, "../../ANVIL_ACCOUNTS.md");
    fs.writeFileSync(rootPath, mdContent, "utf-8");
    console.log(`📄 Archivo de cuentas (direcciones) actualizado en: ${rootPath}`);
  } catch (err) {
    console.warn("No se pudo escribir el archivo ANVIL_ACCOUNTS.md:", err);
  }
}

async function main() {
  console.log("Iniciando seed idempotente (Cospace-safe)...");

  const liveAddresses = await fetchLiveAnvilAccounts();

  // Preferir la primera dirección en env (si está definida) o la primera Anvil
  const ownerAddress = process.env.SEED_OWNER_WALLET || liveAddresses[0] || process.env.SEED_FALLBACK_OWNER_WALLET;

  if (!ownerAddress) {
    console.warn("No se detectó dirección para Owner (SEED_OWNER_WALLET ni Anvil). Saltando creación del owner.");
  }

  // Exportar archivo con direcciones encontradas (sin private keys)
  exportAnvilAccountsMd(liveAddresses);

  // 1. Upsert configuración de versión y setup
  await prisma.configuracion.upsert({
    where: { clave: "VERSION_SISTEMA" },
    update: { valor: "2.1.0", descripcion: "Entorno DAO Los Cappones - Cospace Seed" },
    create: { clave: "VERSION_SISTEMA", valor: "2.1.0", descripcion: "Entorno DAO Los Cappones - Cospace Seed" },
  });

  await prisma.configuracion.upsert({
    where: { clave: "SETUP_COMPLETADO" },
    update: { valor: "false", descripcion: "Indica si la Junta Directiva ha sido completada (5 cargos)" },
    create: { clave: "SETUP_COMPLETADO", valor: "false", descripcion: "Indica si la Junta Directiva ha sido completada (5 cargos)" },
  });

  // 2. Upsert del socio owner (no insertar private keys)
  if (ownerAddress) {
    const socio = await prisma.socio.upsert({
      where: { cedula: DEFAULT_OWNER.cedula },
      update: {
        nombre: DEFAULT_OWNER.nombre,
        correo: DEFAULT_OWNER.correo,
        telefono: DEFAULT_OWNER.telefono,
        direccion: DEFAULT_OWNER.direccion,
        sexo: DEFAULT_OWNER.sexo,
        fechaNacimiento: DEFAULT_OWNER.fechaNacimiento,
        estadoCivil: DEFAULT_OWNER.estadoCivil,
        walletAddress: ownerAddress,
        activo: true,
      },
      create: {
        nombre: DEFAULT_OWNER.nombre,
        cedula: DEFAULT_OWNER.cedula,
        correo: DEFAULT_OWNER.correo,
        telefono: DEFAULT_OWNER.telefono,
        direccion: DEFAULT_OWNER.direccion,
        sexo: DEFAULT_OWNER.sexo,
        fechaNacimiento: DEFAULT_OWNER.fechaNacimiento,
        estadoCivil: DEFAULT_OWNER.estadoCivil,
        walletAddress: ownerAddress,
        activo: true,
      },
    });

    // Upsert directivo asociado al socio
    const fechaInicio = new Date();
    const fechaFin = new Date();
    fechaFin.setFullYear(fechaInicio.getFullYear() + 2);

    await prisma.directivo.upsert({
      where: { socioId: socio.id },
      update: {
        cargo: Cargo.CONTRALOR,
        fechaInicio,
        fechaFin,
        activo: true,
      },
      create: {
        socioId: socio.id,
        cargo: Cargo.CONTRALOR,
        fechaInicio,
        fechaFin,
        activo: true,
      },
    });

    console.log(`✅ Owner / Contralor upserteado: ${socio.nombre} (${ownerAddress})`);
  }

  console.log("Seed idempotente completado.");
}

main()
  .catch((e) => {
    console.error("Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
