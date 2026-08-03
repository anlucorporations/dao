import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVotacionWrite, getCooperativaRead, getAdminSigner } from "@/lib/ethers";
import speakeasy from "speakeasy";
import { ethers } from "ethers";
import { getClientIp } from "@/lib/request";

/**
 * GET /api/proposals
 * Lista propuestas con filtros y paginación
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const estado = searchParams.get("estado");
    const tipo = searchParams.get("tipo");
    const disponible = searchParams.get("disponible");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = {};
    if (estado) where.estado = estado;
    if (tipo) where.tipo = tipo;
    if (disponible !== null) where.disponible = disponible === "true";

    const [propuestas, total] = await Promise.all([
      prisma.propuesta.findMany({
        where,
        include: {
          avales: { include: { directivo: { include: { socio: true } } } },
          votos: { select: { id: true } },
          acta: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.propuesta.count({ where }),
    ]);

    return NextResponse.json({
      propuestas,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error listando propuestas:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/**
 * POST /api/proposals
 * Crea una nueva propuesta (solo Presidente, Contralor, Contador)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, descripcion, monto, walletReceptora, tipo, walletCreador, token2FA } = body;

    // Verificar 2FA del creador
    const directivo = await prisma.directivo.findFirst({
      where: {
        socio: { walletAddress: walletCreador.toLowerCase() },
        activo: true,
      },
      include: { socio: true },
    });

    if (!directivo) {
      return NextResponse.json({ error: "No es directivo activo" }, { status: 403 });
    }

    // Verificar 2FA
    const verificado = speakeasy.totp.verify({
      secret: directivo.secret2FA || "",
      encoding: "base32",
      token: token2FA,
      window: 2,
    });

    if (!verificado) {
      return NextResponse.json({ error: "2FA invalido" }, { status: 401 });
    }

    // Verificar permisos (solo Presidente, Contralor, Contador)
    const cargoPermitido = ["PRESIDENTE", "CONTRALOR", "CONTADOR"].includes(directivo.cargo);
    if (!cargoPermitido) {
      return NextResponse.json({ error: "Sin permiso para crear propuestas" }, { status: 403 });
    }

    // Crear en blockchain
    const signer = getAdminSigner();
    const votacion = getVotacionWrite(signer);

    const tx = await votacion.crearPropuesta(
      nombre,
      descripcion,
      ethers.parseEther(monto.toString()),
      walletReceptora,
      tipo === "INVERSION" ? 0 : 1
    );

    const receipt = await tx.wait();

    // Obtener ID de la propuesta del evento
    const event = receipt.logs.find(
      (log: any) => log.fragment?.name === "PropuestaCreada"
    );
    const propuestaChainId = event ? event.args[0].toString() : null;

    // Guardar en BD
    const propuesta = await prisma.propuesta.create({
      data: {
        propuestaChainId,
        nombre,
        descripcion,
        monto: monto.toString(),
        walletReceptora,
        tipo,
        estado: "BORRADOR",
        creadorId: directivo.socio.id,
      },
    });

    // Crear registros de aval para cada directivo
    const directivos = await prisma.directivo.findMany({
      where: { activo: true },
      include: { socio: true },
    });

    await prisma.aval.createMany({
      data: directivos.map((d) => ({
        propuestaId: propuesta.id,
        directivoId: d.id,
        firmado: false,
      })),
    });

    // Auditoría
    await prisma.auditoriaLog.create({
      data: {
        accion: "CREAR_PROPUESTA",
        entidad: "Propuesta",
        entidadId: propuesta.id,
        detalle: `Propuesta "${nombre}" creada por ${directivo.cargo}`,
        walletEjecutor: walletCreador,
        ipAddress: getClientIp(req),
      },
    });

    return NextResponse.json({ success: true, propuesta });
  } catch (error: any) {
    console.error("Error creando propuesta:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/proposals?action=...
 * Acciones: firmar-aval, publicar, cambiar-disponibilidad
 */
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const body = await req.json();

    switch (action) {
      case "firmar-aval":
        return firmarAval(body, req);
      case "cambiar-disponibilidad":
        return cambiarDisponibilidad(body, req);
      default:
        return NextResponse.json({ error: "Accion invalida" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function firmarAval(body: any, req: NextRequest) {
  const { propuestaId, walletDirectivo, token2FA } = body;

  // Verificar 2FA
  const directivo = await prisma.directivo.findFirst({
    where: {
      socio: { walletAddress: walletDirectivo.toLowerCase() },
      activo: true,
    },
  });

  if (!directivo) {
    return NextResponse.json({ error: "No es directivo" }, { status: 403 });
  }

  const verificado = speakeasy.totp.verify({
    secret: directivo.secret2FA || "",
    encoding: "base32",
    token: token2FA,
    window: 2,
  });

  if (!verificado) {
    return NextResponse.json({ error: "2FA invalido" }, { status: 401 });
  }

  // Firmar en blockchain
  const signer = getAdminSigner();
  const votacion = getVotacionWrite(signer);

  const propuesta = await prisma.propuesta.findUnique({
    where: { id: propuestaId },
  });

  if (!propuesta?.propuestaChainId) {
    return NextResponse.json({ error: "Propuesta no tiene ID en blockchain" }, { status: 400 });
  }

  const tx = await votacion.firmarAval(propuesta.propuestaChainId);
  await tx.wait();

  // Actualizar en BD
  await prisma.aval.updateMany({
    where: { propuestaId, directivoId: directivo.id },
    data: { firmado: true, fechaFirma: new Date() },
  });

  // Verificar si ya hay 3 avales para publicar
  const avalesFirmados = await prisma.aval.count({
    where: { propuestaId, firmado: true },
  });

  if (avalesFirmados >= 3) {
    await prisma.propuesta.update({
      where: { id: propuestaId },
      data: { estado: "POR_DISCUTIR" },
    });
  }

  // Auditoría
  await prisma.auditoriaLog.create({
    data: {
      accion: "FIRMAR_AVAL",
      entidad: "Aval",
      detalle: `Aval firmado para propuesta ${propuestaId}`,
      walletEjecutor: walletDirectivo,
      ipAddress: getClientIp(req),
    },
  });

  return NextResponse.json({ success: true, avalesFirmados });
}

async function cambiarDisponibilidad(body: any, req: NextRequest) {
  const { propuestaId, disponible, walletDirectivo } = body;

  const directivo = await prisma.directivo.findFirst({
    where: {
      socio: { walletAddress: walletDirectivo.toLowerCase() },
      activo: true,
    },
  });

  if (!directivo) {
    return NextResponse.json({ error: "No es directivo" }, { status: 403 });
  }

  await prisma.propuesta.update({
    where: { id: propuestaId },
    data: { disponible },
  });

  await prisma.auditoriaLog.create({
    data: {
      accion: "CAMBIAR_DISPONIBILIDAD",
      entidad: "Propuesta",
      entidadId: propuestaId,
      detalle: `Disponibilidad cambiada a ${disponible}`,
      walletEjecutor: walletDirectivo,
      ipAddress: getClientIp(req),
    },
  });

  return NextResponse.json({ success: true });
}
