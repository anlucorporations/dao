import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ANVIL_ACCOUNTS_MASTER = [
  {
    index: 0,
    walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    balanceETH: "10,000.00",
  },
  {
    index: 1,
    walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    balanceETH: "10,000.00",
  },
  {
    index: 2,
    walletAddress: "0x3C44CdDDB6a900fa2b585dd299e03d12FA4293BC",
    privateKey: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
    balanceETH: "10,000.00",
  },
  {
    index: 3,
    walletAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    privateKey: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
    balanceETH: "10,000.00",
  },
  {
    index: 4,
    walletAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    privateKey: "0x47e179ec197488593b12f4931093882087f4181f3d46736757f3f4f45519e74a",
    balanceETH: "10,000.00",
  },
  {
    index: 5,
    walletAddress: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    privateKey: "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba",
    balanceETH: "10,000.00",
  },
  {
    index: 6,
    walletAddress: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
    privateKey: "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e",
    balanceETH: "10,000.00",
  },
  {
    index: 7,
    walletAddress: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
    privateKey: "0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356",
    balanceETH: "10,000.00",
  },
  {
    index: 8,
    walletAddress: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
    privateKey: "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97",
    balanceETH: "10,000.00",
  },
  {
    index: 9,
    walletAddress: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
    privateKey: "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6",
    balanceETH: "10,000.00",
  },
];

const TODOS_LOS_CARGOS = ["PRESIDENTE", "VICEPRESIDENTE", "SECRETARIO", "CONTRALOR", "CONTADOR"];

export async function GET() {
  try {
    const socios = await prisma.socio.findMany({
      include: { directivo: true },
    });

    const directivos = await prisma.directivo.findMany({
      where: { activo: true },
      include: { socio: true },
    });

    // Mapear el estado de cada cuenta de Anvil
    const accountsStatus = ANVIL_ACCOUNTS_MASTER.map((acc) => {
      const socioAsignado = socios.find(
        (s) => s.walletAddress.toLowerCase() === acc.walletAddress.toLowerCase()
      );

      return {
        ...acc,
        estado: socioAsignado ? "ASIGNADO" : "DISPONIBLE",
        socio: socioAsignado
          ? {
              id: socioAsignado.id,
              nombre: socioAsignado.nombre,
              cedula: socioAsignado.cedula,
              correo: socioAsignado.correo,
              cargo: socioAsignado.directivo?.cargo || "Socio",
            }
          : null,
      };
    });

    // Calcular cargos ocupados y faltantes
    const cargosOcupados = directivos.map((d) => d.cargo);
    const cargosFaltantes = TODOS_LOS_CARGOS.filter((c) => !cargosOcupados.includes(c as any));
    const setupCompletado = cargosFaltantes.length === 0;

    // Actualizar configuración si la junta está completa
    if (setupCompletado) {
      await prisma.configuracion.upsert({
        where: { clave: "SETUP_COMPLETADO" },
        update: { valor: "true" },
        create: { clave: "SETUP_COMPLETADO", valor: "true", descripcion: "Indica si la Junta Directiva ha sido completada" },
      });
    }

    const smartContracts = {
      chainId: 31337,
      network: "Foundry Anvil Local / GCP Cloud",
      contracts: [
        { name: "CooperativaCappones", address: process.env.NEXT_PUBLIC_COOPERATIVA_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0" },
        { name: "VotacionPropuestas", address: process.env.NEXT_PUBLIC_VOTACION_ADDRESS || "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9" },
        { name: "ActaHashRegistry", address: process.env.NEXT_PUBLIC_ACTA_REGISTRY_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" },
        { name: "MinimalForwarder", address: process.env.NEXT_PUBLIC_FORWARDER_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3" },
      ],
    };

    return NextResponse.json({
      success: true,
      setupCompletado,
      cargosOcupados,
      cargosFaltantes,
      totalDirectivosActivos: directivos.length,
      totalSociosRegistrados: socios.length,
      accountsStatus,
      smartContracts,
    });
  } catch (error: any) {
    console.error("Error en GET /api/sistema:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
