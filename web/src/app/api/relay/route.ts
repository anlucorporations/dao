import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getForwarderRead, getVotacionWrite, getAdminSigner } from "@/lib/ethers";
import { ethers } from "ethers";
import { getClientIp } from "@/lib/request";

/**
 * POST /api/relay
 * Recibe un voto firmado y lo ejecuta en la blockchain pagando el gas
 */
export async function POST(req: NextRequest) {
  try {
    const { request, signature, walletAddress } = await req.json();

    if (!request || !signature || !walletAddress) {
      return NextResponse.json(
        { error: "Request, firma y wallet requeridos" },
        { status: 400 }
      );
    }

    // 1. Verificar que es socio activo
    const socio = await prisma.socio.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!socio || !socio.activo) {
      return NextResponse.json(
        { error: "No es socio activo" },
        { status: 403 }
      );
    }

    // 2. Verificar firma en el forwarder
    const forwarder = getForwarderRead();
    const esValida = await forwarder.verify(request, signature);

    if (!esValida) {
      return NextResponse.json(
        { error: "Firma invalida" },
        { status: 401 }
      );
    }

    // 3. Verificar nonce (anti-replay)
    const nonceEsperado = await forwarder.getNonce(walletAddress);
    if (BigInt(request.nonce) !== nonceEsperado) {
      return NextResponse.json(
        { error: "Nonce incorrecto - posible ataque de repeticion" },
        { status: 401 }
      );
    }

    // 4. Ejecutar la transacción con el signer del admin (paga el gas)
    const signer = getAdminSigner();
    const forwarderWrite = new ethers.Contract(
      process.env.NEXT_PUBLIC_FORWARDER_ADDRESS!,
      ["function execute(tuple(address from, address to, uint256 value, uint256 gas, uint256 nonce, bytes data) calldata req, bytes calldata signature) external payable returns (bool, bytes memory)"],
      signer
    );

    const tx = await forwarderWrite.execute(request, signature, {
      gasLimit: 500000, // BUG-017 FIX: aumentado para cubrir operaciones complejas como crearPropuesta
    });

    const receipt = await tx.wait();

    // BUG-003 FIX: verificar que la TX no fue revertida antes de guardar en BD
    if (!receipt || receipt.status === 0) {
      throw new Error("Transaccion revertida en blockchain — voto no registrado");
    }

    // BUG-004 FIX: validar tipos antes de calcular el hash
    const propuestaId = request.propuestaId != null ? BigInt(request.propuestaId) : null;
    const tipoVoto = request.voto != null ? Number(request.voto) : null;

    if (propuestaId === null || tipoVoto === null || ![0, 1, 2].includes(tipoVoto)) {
      throw new Error("Datos de voto invalidos: propuestaId o voto no definidos correctamente");
    }

    const hashSecreto = ethers.keccak256(
      ethers.solidityPacked(
        ["address", "uint256", "uint8"],
        [walletAddress, propuestaId, tipoVoto]
      )
    );

    await prisma.voto.create({
      data: {
        propuestaId: String(propuestaId),
        socioId: socio.id,
        tipo: tipoVoto === 0 ? "ACEPTADA" : tipoVoto === 1 ? "RECHAZADA" : "ABSTENCION",
        hashSecreto,
        txHash: receipt.hash,
      },
    });

    // 6. Auditoría
    await prisma.auditoriaLog.create({
      data: {
        accion: "VOTO_RELAY",
        entidad: "Voto",
        detalle: `Voto relay ejecutado - Propuesta ${request.propuestaId}`,
        walletEjecutor: walletAddress,
        ipAddress: getClientIp(req),
      },
    });

    return NextResponse.json({
      success: true,
      txHash: receipt.hash,
      message: "Voto registrado exitosamente",
    });
  } catch (error: any) {
    console.error("Error en relay:", error);

    // Si el relayer externo falla, notificar para Plan B
    if (error.message?.includes("insufficient funds")) {
      return NextResponse.json(
        { error: "Relayer sin fondos - activar Plan B", activarPlanB: true },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Error al procesar voto: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/relay
 * Verifica estado del relayer (balance, conexión)
 */
export async function GET(req: NextRequest) {
  try {
    // BUG-009 FIX: usar NEXT_PUBLIC_ANVIL_RPC (nombre correcto en docker-compose.yml)
    const rpcUrl = process.env.NEXT_PUBLIC_ANVIL_RPC || process.env.RPC_URL || "http://anvil:8545";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    if (!process.env.ADMIN_PRIVATE_KEY) {
      throw new Error("ADMIN_PRIVATE_KEY no configurada");
    }
    const adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);

    const balance = await provider.getBalance(adminWallet.address);
    const balanceMatic = ethers.formatEther(balance);

    return NextResponse.json({
      activo: parseFloat(balanceMatic) > 0.5,
      balance: balanceMatic,
      wallet: adminWallet.address,
      red: process.env.NEXT_PUBLIC_CHAIN_ID,
    });
  } catch (error) {
    return NextResponse.json(
      { activo: false, error: "No se pudo verificar el relayer" },
      { status: 500 }
    );
  }
}
