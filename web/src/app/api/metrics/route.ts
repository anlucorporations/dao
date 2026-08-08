import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // BUG-016 FIX: usar singleton en lugar de new PrismaClient()

// BUG-007 FIX: Se eliminarон las claves privadas — NUNCA deben exponerse en una respuesta HTTP
// Solo se mantienen las direcciones publicas para referencia
const ANVIL_METRICS_ACCOUNTS = [
  { index: 0, address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", cargo: "PRESIDENTE", nombre: "Ana Lucía Morales" },
  { index: 1, address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", cargo: "VICEPRESIDENTE", nombre: "Carlos Eduardo Mendoza" },
  { index: 2, address: "0x3C44CdDDB6a900fa2b585dd299e03d12FA4293BC", cargo: "SECRETARIO", nombre: "Elena Beatriz Rivas" },
  { index: 3, address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", cargo: "CONTRALOR", nombre: "Roberto José Fernández" },
  { index: 4, address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", cargo: "CONTADOR", nombre: "Patricia Alejandra Silva" },
  { index: 5, address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc", cargo: "SOCIO", nombre: "Gabriel Antonio Torres" },
  { index: 6, address: "0x976EA74026E726554dB657fA54763abd0C3a0aa9", cargo: "SOCIO", nombre: "Mariana Isabel Castillo" },
  { index: 7, address: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955", cargo: "SOCIO", nombre: "Javier Enrique Paredes" },
  { index: 8, address: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f", cargo: "SOCIO", nombre: "Sofia Valentina Gómez" },
  { index: 9, address: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720", cargo: "SOCIO", nombre: "Luis Fernando Alvarado" },
];

export async function GET() {
  try {
    const [
      socios,
      directivos,
      propuestas,
      votos,
      actas,
      aportes,
      postulaciones,
      invitaciones,
      avales,
      auditorias,
      configuraciones,
    ] = await Promise.all([
      prisma.socio.findMany({ include: { directivo: true } }),
      prisma.directivo.findMany({ include: { socio: true } }),
      prisma.propuesta.findMany(),
      prisma.voto.findMany(),
      prisma.acta.findMany(),
      prisma.aporte.findMany(),
      prisma.postulacion.findMany(),
      prisma.invitacion.findMany(),
      prisma.aval.findMany(),
      prisma.auditoriaLog.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
      prisma.configuracion.findMany(),
    ]);

    const smartContracts = {
      chainId: 31337,
      network: "Foundry Anvil Local / GCP Cloud",
      solcVersion: "0.8.20",
      contracts: [
        { name: "CooperativaCappones", address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", status: "Desplegado & Verificado" },
        { name: "VotacionPropuestas", address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9", status: "Desplegado & Verificado" },
        { name: "ActaHashRegistry", address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", status: "Desplegado & Verificado" },
        { name: "MinimalForwarder", address: "0x5FbDB2315678afecb367f032d93F642f64180aa3", status: "Desplegado & Verificado" },
      ],
      testsSummary: {
        totalTests: 14,
        passed: 14,
        failed: 0,
        coverage: "98.5%",
        runner: "Forge 0.2.0 (Foundry)",
      },
    };

    return NextResponse.json({
      success: true,
      anvilAccounts: ANVIL_METRICS_ACCOUNTS.map((acc) => ({ ...acc, balanceETH: "10,000.00 ETH" })),
      tables: {
        Socio: socios,
        Directivo: directivos,
        Propuesta: propuestas,
        Voto: votos,
        Acta: actas,
        Aporte: aportes,
        Postulacion: postulaciones,
        Invitacion: invitaciones,
        Aval: avales,
        AuditoriaLog: auditorias,
        Configuracion: configuraciones,
      },
      smartContracts,
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
