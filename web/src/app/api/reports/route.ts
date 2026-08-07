import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCooperativaRead, getVotacionRead, getAdminSigner, getActaWrite } from "@/lib/ethers";
import { ethers } from "ethers";
import { getClientIp } from "@/lib/request";

/**
 * GET /api/reports?type=...
 * Genera reportes: balance, movimientos, socios, propuestas
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const wallet = searchParams.get("wallet");

    if (!type) {
      return NextResponse.json({ error: "Tipo de reporte requerido" }, { status: 400 });
    }

    switch (type) {
      case "balance":
        return generarBalance();
      case "movimientos":
        return generarMovimientos();
      case "socios":
        return generarReporteSocios();
      case "propuestas":
        return generarReportePropuestas();
      default:
        return NextResponse.json({ error: "Tipo invalido" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function generarBalance() {
  const cooperativa = getCooperativaRead();
  const capitalTotal = await cooperativa.capitalTotal();

  const aportes = await prisma.aporte.findMany({
    select: { monto: true },
    where: { tipo: "INSCRIPCION" },
  });

  const propuestasAprobadas = await prisma.propuesta.count({
    where: { estado: "APROBADA" },
  });

  return NextResponse.json({
    capitalTotalWei: capitalTotal.toString(),
    capitalTotalMatic: ethers.formatEther(capitalTotal),
    totalInscripciones: aportes.reduce((total, aporte) => total + BigInt(aporte.monto), 0n).toString(),
    propuestasAprobadas,
    fechaGeneracion: new Date().toISOString(),
  });
}

async function generarMovimientos() {
  const aportes = await prisma.aporte.findMany({
    include: { socio: { select: { nombre: true, walletAddress: true } } },
    orderBy: { fecha: "desc" },
    take: 100,
  });

  return NextResponse.json({ movimientos: aportes });
}

async function generarReporteSocios() {
  const socios = await prisma.socio.findMany({
    where: { activo: true },
    include: {
      aportes: { select: { monto: true, tipo: true } },
      directivo: { select: { cargo: true, activo: true } },
    },
  });

  const sociosConCapital = socios.map((s) => ({
    ...s,
    capitalAportado: s.aportes.reduce((acc, a) => acc + parseFloat(a.monto), 0),
  }));

  return NextResponse.json({ socios: sociosConCapital, total: socios.length });
}

async function generarReportePropuestas() {
  const propuestas = await prisma.propuesta.findMany({
    include: {
      avales: { include: { directivo: { include: { socio: true } } } },
      votos: { select: { tipo: true } },
      acta: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ propuestas });
}

/**
 * POST /api/reports
 * Genera acta PDF + registra hash en blockchain
 */
export async function POST(req: NextRequest) {
  try {
    const { propuestaId, walletEjecutor, firma } = await req.json();

    // BUG-014 FIX: verificar identidad del solicitante antes de generar acta
    if (!walletEjecutor || !firma) {
      return NextResponse.json(
        { error: "Se requiere walletEjecutor y firma para generar actas" },
        { status: 401 }
      );
    }

    // Verificar firma criptografica
    const { ethers: ethersLib } = await import("ethers");
    const mensajeEsperado = `Generar acta propuesta ${propuestaId}`;
    const recoveredAddress = ethersLib.verifyMessage(mensajeEsperado, firma);
    if (recoveredAddress.toLowerCase() !== walletEjecutor.toLowerCase()) {
      return NextResponse.json({ error: "Firma invalida" }, { status: 401 });
    }

    // Verificar que es directivo activo
    const directivo = await prisma.directivo.findFirst({
      where: {
        socio: { walletAddress: walletEjecutor.toLowerCase() },
        activo: true,
      },
    });
    if (!directivo) {
      return NextResponse.json({ error: "Solo directivos pueden generar actas" }, { status: 403 });
    }

    if (!propuestaId) {
      return NextResponse.json({ error: "propuestaId requerido" }, { status: 400 });
    }

    const propuesta = await prisma.propuesta.findUnique({
      where: { id: propuestaId },
      include: {
        votos: { include: { socio: { select: { nombre: true } } } },
        avales: { include: { directivo: { include: { socio: true } } } },
      },
    });

    if (!propuesta) {
      return NextResponse.json({ error: "Propuesta no encontrada" }, { status: 404 });
    }

    // Generar contenido del acta
    const actaContent = {
      cooperativa: "Los Cappones",
      propuesta: propuesta.nombre,
      descripcion: propuesta.descripcion,
      monto: propuesta.monto,
      estado: propuesta.estado,
      fechaCreacion: propuesta.fechaCreacion,
      fechaCierre: propuesta.fechaAprobacion || propuesta.updatedAt,
      votos: {
        aceptadas: propuesta.votos.filter((v) => v.tipo === "ACEPTADA").length,
        rechazadas: propuesta.votos.filter((v) => v.tipo === "RECHAZADA").length,
        abstenciones: propuesta.votos.filter((v) => v.tipo === "ABSTENCION").length,
      },
      avales: propuesta.avales.filter((a) => a.firmado).map((a) => ({
        cargo: a.directivo.cargo,
        nombre: a.directivo.socio.nombre,
        fecha: a.fechaFirma,
      })),
    };

    // Calcular hash SHA-256 del contenido JSON
    const actaJson = JSON.stringify(actaContent, null, 2);
    const hash = ethers.keccak256(ethers.toUtf8Bytes(actaJson));

    // Guardar PDF en servidor (simulado - en producción se generaría con una librería)
    const urlPdf = `/actas/acta_${propuestaId}_${Date.now()}.pdf`;

    // Registrar hash en blockchain
    const signer = getAdminSigner();
    const actaContract = getActaWrite(signer);

    if (propuesta.propuestaChainId) {
      const tx = await actaContract.registrarHash(
        propuesta.propuestaChainId,
        hash
      );
      await tx.wait();
    }

    // Guardar en BD
    const acta = await prisma.acta.create({
      data: {
        propuestaId,
        contenido: actaContent,
        urlPdf,
        hashBlockchain: hash,
      },
    });

    // Actualizar propuesta
    await prisma.propuesta.update({
      where: { id: propuestaId },
      data: { estado: propuesta.estado === "APROBADA" ? "EJECUTADA" : propuesta.estado },
    });

    // Auditoría
    await prisma.auditoriaLog.create({
      data: {
        accion: "GENERAR_ACTA",
        entidad: "Acta",
        entidadId: acta.id,
        detalle: `Acta generada para propuesta ${propuestaId}`,
        walletEjecutor: "sistema",
        ipAddress: getClientIp(req),
      },
    });

    return NextResponse.json({
      success: true,
      acta,
      hash,
      urlPdf,
    });
  } catch (error: any) {
    console.error("Error generando acta:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
