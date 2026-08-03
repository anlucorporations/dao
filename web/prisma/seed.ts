import { PrismaClient, Cargo } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed de base de datos...");

  // 1. Configuración general
  await prisma.configuracion.upsert({
    where: { clave: "VERSION_SISTEMA" },
    update: { valor: "1.0.0", descripcion: "Entorno local de desarrollo DAO Los Cappones" },
    create: { clave: "VERSION_SISTEMA", valor: "1.0.0", descripcion: "Entorno local de desarrollo DAO Los Cappones" },
  });

  // 2. Directivos e Identidades de Anvil
  const directivosIniciales = [
    {
      nombre: "anlu",
      cedula: "V-12533620",
      correo: "anlucorporations@gmail.com",
      walletAddress: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720", // Anvil #9
      cargo: Cargo.PRESIDENTE,
      telefono: "+584120000000",
      direccion: "Sede Principal Cooperativa Los Cappones",
      sexo: "M",
      fechaNacimiento: new Date("1985-01-01"),
      estadoCivil: "Soltero",
    },
    {
      nombre: "Carlos Mendoza (Vicepresidente)",
      cedula: "V-10000001",
      correo: "vicepresidente@loscappones.coop",
      walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Anvil #0
      cargo: Cargo.VICEPRESIDENTE,
      telefono: "+584120000001",
      direccion: "Caracas, Venezuela",
      sexo: "M",
      fechaNacimiento: new Date("1988-03-15"),
      estadoCivil: "Casado",
    },
    {
      nombre: "María Rodríguez (Secretaria)",
      cedula: "V-10000002",
      correo: "secretario@loscappones.coop",
      walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Anvil #1
      cargo: Cargo.SECRETARIO,
      telefono: "+584120000002",
      direccion: "Caracas, Venezuela",
      sexo: "F",
      fechaNacimiento: new Date("1990-07-20"),
      estadoCivil: "Soltera",
    },
    {
      nombre: "José Pérez (Contralor)",
      cedula: "V-10000003",
      correo: "contralor@loscappones.coop",
      walletAddress: "0x3C44CdDDB6a900fa2b585dd299e03d12FA4293BC", // Anvil #2
      cargo: Cargo.CONTRALOR,
      telefono: "+584120000003",
      direccion: "Caracas, Venezuela",
      sexo: "M",
      fechaNacimiento: new Date("1982-11-05"),
      estadoCivil: "Casado",
    },
    {
      nombre: "Ana Gómez (Contadora)",
      cedula: "V-10000004",
      correo: "contador@loscappones.coop",
      walletAddress: "0x90F79bf6EB2c4f6703055175b43657a0501a3341", // Anvil #3
      cargo: Cargo.CONTADOR,
      telefono: "+584120000004",
      direccion: "Caracas, Venezuela",
      sexo: "F",
      fechaNacimiento: new Date("1992-04-12"),
      estadoCivil: "Soltera",
    },
  ];

  const fechaInicio = new Date();
  const fechaFin = new Date();
  fechaFin.setFullYear(fechaInicio.getFullYear() + 2);

  for (const d of directivosIniciales) {
    const socio = await prisma.socio.upsert({
      where: { walletAddress: d.walletAddress },
      update: {
        nombre: d.nombre,
        cedula: d.cedula,
        correo: d.correo,
      },
      create: {
        nombre: d.nombre,
        cedula: d.cedula,
        correo: d.correo,
        walletAddress: d.walletAddress,
        telefono: d.telefono,
        direccion: d.direccion,
        sexo: d.sexo,
        fechaNacimiento: d.fechaNacimiento,
        estadoCivil: d.estadoCivil,
        activo: true,
      },
    });

    await prisma.directivo.upsert({
      where: { socioId: socio.id },
      update: {
        cargo: d.cargo,
        activo: true,
      },
      create: {
        socioId: socio.id,
        cargo: d.cargo,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        activo: true,
      },
    });

    console.log(`Directivo registrado/actualizado: ${d.nombre} (${d.cargo}) - Wallet: ${d.walletAddress}`);
  }

  console.log("Seed completado exitosamente.");
}

main()
  .catch((e) => {
    console.error("Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
