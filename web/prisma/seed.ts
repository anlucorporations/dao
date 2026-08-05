import { PrismaClient, Cargo } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed de base de datos (Modo Unico SuperUsuario)...");

  // 1. Configuración general
  await prisma.configuracion.upsert({
    where: { clave: "VERSION_SISTEMA" },
    update: { valor: "1.0.0", descripcion: "Entorno DAO Los Cappones - SuperUsuario anlu" },
    create: { clave: "VERSION_SISTEMA", valor: "1.0.0", descripcion: "Entorno DAO Los Cappones - SuperUsuario anlu" },
  });

  // 2. Único SuperUsuario / Owner: anlu
  const superUsuario = {
    nombre: "anlu",
    cedula: "V-12533620",
    correo: "anlucorporations@gmail.com",
    walletAddress: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720", // Anvil Account #9 (anlu)
    cargo: Cargo.PRESIDENTE,
    telefono: "+584120358824",
    direccion: "Sede Principal Cooperativa Los Cappones",
    sexo: "M",
    fechaNacimiento: new Date("1985-01-01"),
    estadoCivil: "Soltero",
  };

  const fechaInicio = new Date();
  const fechaFin = new Date();
  fechaFin.setFullYear(fechaInicio.getFullYear() + 2);

  const socio = await prisma.socio.upsert({
    where: { walletAddress: superUsuario.walletAddress },
    update: {
      nombre: superUsuario.nombre,
      cedula: superUsuario.cedula,
      correo: superUsuario.correo,
    },
    create: {
      nombre: superUsuario.nombre,
      cedula: superUsuario.cedula,
      correo: superUsuario.correo,
      walletAddress: superUsuario.walletAddress,
      telefono: superUsuario.telefono,
      direccion: superUsuario.direccion,
      sexo: superUsuario.sexo,
      fechaNacimiento: superUsuario.fechaNacimiento,
      estadoCivil: superUsuario.estadoCivil,
      activo: true,
    },
  });

  await prisma.directivo.upsert({
    where: { socioId: socio.id },
    update: {
      cargo: superUsuario.cargo,
      activo: true,
    },
    create: {
      socioId: socio.id,
      cargo: superUsuario.cargo,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      activo: true,
    },
  });

  console.log(`SuperUsuario registrado exitosamente: ${superUsuario.nombre} (${superUsuario.cargo}) - Wallet: ${superUsuario.walletAddress}`);
  console.log("Seed completado exitosamente con único SuperUsuario.");
}

main()
  .catch((e) => {
    console.error("Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
