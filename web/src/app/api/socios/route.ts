import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    const socioActualizado = await prisma.socio.update({
      where: { id },
      data: {
        nombre,
        correo,
        telefono,
        direccion,
        sexo,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
        estadoCivil,
      },
    });

    return NextResponse.json({ success: true, socio: socioActualizado });
  } catch (error) {
    console.error("Error al actualizar socio:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
