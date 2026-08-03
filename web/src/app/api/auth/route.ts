import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCooperativaRead } from "@/lib/ethers";
import speakeasy from "speakeasy";
import { ethers } from "ethers";


/**
 * POST /api/auth
 * Autentica un socio verificando su wallet y, si es directivo, su 2FA
 */
export async function POST(req: NextRequest) {
  try {
    const { walletAddress, signature, message } = await req.json();

    if (!walletAddress || !signature) {
      return NextResponse.json(
        { error: "Wallet y firma requeridas" },
        { status: 400 }
      );
    }

    // Verificar que es socio activo en blockchain
    const cooperativa = getCooperativaRead();
    const esSocio = await cooperativa.esSocioActivo(walletAddress);

    if (!esSocio) {
      return NextResponse.json(
        { error: "No es socio activo de la cooperativa" },
        { status: 403 }
      );
    }

    // Verificar firma criptográfica del mensaje de autenticación
    const mensajeFirma = message || "Autenticacion DAO Los Cappones";
    const recoveredAddress = ethers.verifyMessage(mensajeFirma, signature);
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "Firma de wallet invalida" },
        { status: 401 }
      );
    }

    // Buscar en base de datos
    const socio = await prisma.socio.findFirst({
      where: { walletAddress: { equals: walletAddress, mode: "insensitive" } },
      include: { directivo: true },
    });


    if (!socio) {
      return NextResponse.json(
        { error: "Socio no encontrado en base de datos" },
        { status: 404 }
      );
    }

    // Si es directivo, verificar 2FA
    if (socio.directivo?.activo) {
      const { token2FA } = await req.json();

      if (!token2FA) {
        return NextResponse.json(
          { error: "2FA requerido para directivos", requiere2FA: true },
          { status: 401 }
        );
      }

      const verificado = speakeasy.totp.verify({
        secret: socio.directivo.secret2FA || "",
        encoding: "base32",
        token: token2FA,
        window: 2,
      });

      if (!verificado) {
        return NextResponse.json(
          { error: "Codigo 2FA invalido" },
          { status: 401 }
        );
      }
    }

    // Registrar en auditoría
    await prisma.auditoriaLog.create({
      data: {
        accion: "LOGIN",
        entidad: "Socio",
        entidadId: socio.id,
        detalle: `Login exitoso - ${socio.directivo?.activo ? "Directivo" : "Socio"}`,
        walletEjecutor: walletAddress,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1",

      },
    });

    return NextResponse.json({
      success: true,
      socio: {
        id: socio.id,
        nombre: socio.nombre,
        wallet: socio.walletAddress,
        esDirectivo: socio.directivo?.activo || false,
        cargo: socio.directivo?.cargo || null,
      },
    });
  } catch (error) {
    console.error("Error en auth:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth?wallet=...&adminKey=...
 * Genera secreto TOTP para un directivo (solo admin)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get("wallet");
    const adminKey = searchParams.get("adminKey");

    if (adminKey !== process.env.ADMIN_SETUP_KEY) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    if (!wallet) {
      return NextResponse.json({ error: "Wallet requerida" }, { status: 400 });
    }

    const secret = speakeasy.generateSecret({
      name: `Cooperativa Los Cappones (${wallet})`,
      length: 32,
    });

    // Guardar secreto en BD
    await prisma.directivo.updateMany({
      where: {
        socio: { walletAddress: wallet.toLowerCase() },
        activo: true,
      },
      data: { secret2FA: secret.base32 },
    });

    return NextResponse.json({
      secret: secret.base32,
      qrCode: secret.otpauth_url,
      message: "Escanea el QR con Google Authenticator",
    });
  } catch (error) {
    console.error("Error en setup 2FA:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
