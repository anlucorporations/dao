import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // BUG-016 FIX: usar singleton en lugar de new PrismaClient()

// GET /api/socios: Obtener todos los socios con su rol de directivo
export async function GET() {
  try {
    const socios = await prisma.socio.findMany({
      include: {
        directivo: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, socios });
  } catch (error) {
    console.error("Error al obtener socios:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// PUT /api/socios: Editar únicamente datos personales de un socio
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, nombre, correo, telefono, direccion, sexo, fechaNacimiento, estadoCivil } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID del socio requerido" }, { status: 400 });
    }

    // BUG-026 FIX: construir explicitamente el objeto data solo con los campos permitidos
    // evita que campos desconocidos (walletAddress, cedula, activo) lleguen a Prisma
    const dataPermitida: Record<string, unknown> = {};
    if (nombre !== undefined) dataPermitida.nombre = nombre;
    if (correo !== undefined) dataPermitida.correo = correo;
    if (telefono !== undefined) dataPermitida.telefono = telefono;
    if (direccion !== undefined) dataPermitida.direccion = direccion;
    if (sexo !== undefined) dataPermitida.sexo = sexo;
    if (estadoCivil !== undefined) dataPermitida.estadoCivil = estadoCivil;
    if (fechaNacimiento !== undefined) {
      dataPermitida.fechaNacimiento = new Date(fechaNacimiento);
    }

    const socioActualizado = await prisma.socio.update({
      where: { id },
      data: dataPermitida,
    });

    return NextResponse.json({ success: true, socio: socioActualizado });
  } catch (error) {
    console.error("Error al actualizar socio:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/socios: Registrar nuevo socio y opcionalmente asignarlo a la Junta Directiva
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, cedula, correo, walletAddress, telefono, direccion, sexo, fechaNacimiento, estadoCivil, cargo } = body;

    if (!nombre || !cedula || !correo || !walletAddress) {
      return NextResponse.json(
        { success: false, error: "Campos requeridos: nombre, cedula, correo, walletAddress" },
        { status: 400 }
      );
    }

    // Verificar si la wallet o cedula ya están registradas
    const existente = await prisma.socio.findFirst({
      where: {
        OR: [
          { walletAddress: { equals: walletAddress, mode: "insensitive" } },
          { cedula: { equals: cedula } },
        ],
      },
    });

    if (existente) {
      return NextResponse.json(
        { success: false, error: "Socio ya registrado con esa Wallet o Cédula" },
        { status: 400 }
      );
    }

    // Si se especifica cargo directivo, verificar si el cargo está libre
    if (cargo && ["PRESIDENTE", "VICEPRESIDENTE", "SECRETARIO", "CONTRALOR", "CONTADOR"].includes(cargo)) {
      const cargoOcupado = await prisma.directivo.findFirst({
        where: { cargo: cargo as any, activo: true },
      });

      if (cargoOcupado) {
        return NextResponse.json(
          { success: false, error: `El cargo de ${cargo} ya está ocupado en la Junta Directiva` },
          { status: 400 }
        );
      }
    }

    // Crear el Socio
    const socio = await prisma.socio.create({
      data: {
        nombre,
        cedula,
        correo,
        walletAddress: walletAddress.toLowerCase(),
        telefono: telefono || "",
        direccion: direccion || "",
        sexo: sexo || "M",
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : new Date("1990-01-01"),
        estadoCivil: estadoCivil || "Soltero",
        activo: true,
      },
    });

    // Si se especificó cargo, crear el registro de Directivo
    if (cargo && ["PRESIDENTE", "VICEPRESIDENTE", "SECRETARIO", "CONTRALOR", "CONTADOR"].includes(cargo)) {
      const fechaInicio = new Date();
      const fechaFin = new Date();
      fechaFin.setFullYear(fechaInicio.getFullYear() + 2);

      await prisma.directivo.create({
        data: {
          socioId: socio.id,
          cargo: cargo as any,
          fechaInicio,
          fechaFin,
          activo: true,
        },
      });
    }

    // Verificar si con este registro se han completado los 5 cargos de la Junta Directiva
    const directivosActivos = await prisma.directivo.count({ where: { activo: true } });
    const juntaCompleta = directivosActivos >= 5;

    if (juntaCompleta) {
      await prisma.configuracion.upsert({
        where: { clave: "SETUP_COMPLETADO" },
        update: { valor: "true" },
        create: { clave: "SETUP_COMPLETADO", valor: "true", descripcion: "Indica si la Junta Directiva ha sido completada" },
      });
    }

    return NextResponse.json({
      success: true,
      socio,
      juntaCompleta,
      message: juntaCompleta
        ? "✅ Socio registrado y Junta Directiva completada exitosamente (5/5). El sistema ha pasado a Operación Normal."
        : `✅ Socio registrado exitosamente. (${directivosActivos}/5 directivos configurados).`,
    });
  } catch (error: any) {
    console.error("Error al registrar socio:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
