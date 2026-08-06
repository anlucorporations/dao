import { PrismaClient, Cargo } from "@prisma/client";

const prisma = new PrismaClient();

// Cuentas predeterminadas de Anvil (Chain ID 31337)
const ANVIL_ACCOUNTS = [
  {
    index: 0,
    walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    nombre: "Ana Lucía Morales",
    cedula: "V-12533620",
    correo: "presidente@loscappones.coop",
    telefono: "+584120101010",
    direccion: "Av. Principal Los Cappones, Edif. Presidencia, Piso 3",
    sexo: "F",
    fechaNacimiento: new Date("1982-05-14"),
    estadoCivil: "Casado",
    cargo: Cargo.PRESIDENTE,
  },
  {
    index: 1,
    walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    nombre: "Carlos Eduardo Mendoza",
    cedula: "V-14890123",
    correo: "vicepresidente@loscappones.coop",
    telefono: "+584140202020",
    direccion: "Urb. El Bosque, Calle 4, Quinta San Carlos",
    sexo: "M",
    fechaNacimiento: new Date("1985-09-22"),
    estadoCivil: "Casado",
    cargo: Cargo.VICEPRESIDENTE,
  },
  {
    index: 2,
    walletAddress: "0x3C44CdDDB6a900fa2b585dd299e03d12FA4293BC",
    privateKey: "0x5de4111da505504f2c316411e83624d479d0b3f2de9fa0390193604f57ce825c",
    nombre: "Elena Beatriz Rivas",
    cedula: "V-16789456",
    correo: "secretaria@loscappones.coop",
    telefono: "+584160303030",
    direccion: "Residencias La Floresta, Torre B, Apto 4-A",
    sexo: "F",
    fechaNacimiento: new Date("1988-11-03"),
    estadoCivil: "Soltero",
    cargo: Cargo.SECRETARIO,
  },
  {
    index: 3,
    walletAddress: "0x90F79bf6EB2c4f6703055175b43657a0501a3341",
    privateKey: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
    nombre: "Roberto José Fernández",
    cedula: "V-18234567",
    correo: "contralor@loscappones.coop",
    telefono: "+584120404040",
    direccion: "Sector Los Naranjos, Calle Las Flores #12",
    sexo: "M",
    fechaNacimiento: new Date("1990-03-18"),
    estadoCivil: "Divorciado",
    cargo: Cargo.CONTRALOR,
  },
  {
    index: 4,
    walletAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    privateKey: "0x47e179ec197488593b12f4931093882087f4181f3d46736757f3f4f45519e74a",
    nombre: "Patricia Alejandra Silva",
    cedula: "V-19456789",
    correo: "contador@loscappones.coop",
    telefono: "+584240505050",
    direccion: "Av. Las Ciencias, Colinas de Bello Monte",
    sexo: "F",
    fechaNacimiento: new Date("1992-07-29"),
    estadoCivil: "Soltero",
    cargo: Cargo.CONTADOR,
  },
  {
    index: 5,
    walletAddress: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    privateKey: "0x8b3a350cf5c343fa13fe3a159e1b096a3168ea6500567d23a10c6f3581f7d54c",
    nombre: "Gabriel Antonio Torres",
    cedula: "V-20123456",
    correo: "gabriel.torres@loscappones.coop",
    telefono: "+584120606060",
    direccion: "Urbanización Vista Alegre, Calle 3",
    sexo: "M",
    fechaNacimiento: new Date("1994-01-12"),
    estadoCivil: "Soltero",
    cargo: null,
  },
  {
    index: 6,
    walletAddress: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
    privateKey: "0x92db14e403b83dfe3df233524e23a30087f12363d6609904992e984f6c4af266",
    nombre: "Mariana Isabel Castillo",
    cedula: "V-21345678",
    correo: "mariana.castillo@loscappones.coop",
    telefono: "+584140707070",
    direccion: "Av. Francisco de Miranda, Edif. Centro",
    sexo: "F",
    fechaNacimiento: new Date("1995-06-25"),
    estadoCivil: "Casado",
    cargo: null,
  },
  {
    index: 7,
    walletAddress: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
    privateKey: "0x4b57788d2b420d6965ce9d506151297b6992d92723b4361609248a4c86456900",
    nombre: "Javier Enrique Paredes",
    cedula: "V-22456789",
    correo: "javier.paredes@loscappones.coop",
    telefono: "+584160808080",
    direccion: "Calle Los Cerezos, Casa #45, El Valle",
    sexo: "M",
    fechaNacimiento: new Date("1997-08-14"),
    estadoCivil: "Soltero",
    cargo: null,
  },
  {
    index: 8,
    walletAddress: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
    privateKey: "0xdbda8c7d044fb067883cd95682461fd6e6c5e10172ba4728699f5784af7788c1",
    nombre: "Sofia Valentina Gómez",
    cedula: "V-23567890",
    correo: "sofia.gomez@loscappones.coop",
    telefono: "+584240909090",
    direccion: "Residencias Paraíso, Torre A, Apto 8-C",
    sexo: "F",
    fechaNacimiento: new Date("1998-12-05"),
    estadoCivil: "Soltero",
    cargo: null,
  },
  {
    index: 9,
    walletAddress: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
    privateKey: "0x2a871d0798f97d796df285775602922437370edd16347100108392d40b03220a",
    nombre: "Luis Fernando Alvarado",
    cedula: "V-24678901",
    correo: "luis.alvarado@loscappones.coop",
    telefono: "+584121010101",
    direccion: "Av. Universidad, Edif. Imperial, Piso 2",
    sexo: "M",
    fechaNacimiento: new Date("2000-04-20"),
    estadoCivil: "Soltero",
    cargo: null,
  },
];

async function main() {
  console.log("Iniciando seed de base de datos (10 Cuentas Nativas de Anvil)...");

  // 1. Configuración de versión de sistema
  await prisma.configuracion.upsert({
    where: { clave: "VERSION_SISTEMA" },
    update: { valor: "2.0.0", descripcion: "Entorno DAO Los Cappones - 10 Cuentas Anvil" },
    create: { clave: "VERSION_SISTEMA", valor: "2.0.0", descripcion: "Entorno DAO Los Cappones - 10 Cuentas Anvil" },
  });

  const fechaInicio = new Date();
  const fechaFin = new Date();
  fechaFin.setFullYear(fechaInicio.getFullYear() + 2);

  // 2. Insertar las 10 cuentas de Anvil como Socios (y Directivos si poseen cargo)
  for (const acc of ANVIL_ACCOUNTS) {
    const socio = await prisma.socio.upsert({
      where: { walletAddress: acc.walletAddress },
      update: {
        nombre: acc.nombre,
        cedula: acc.cedula,
        correo: acc.correo,
        telefono: acc.telefono,
        direccion: acc.direccion,
        sexo: acc.sexo,
        fechaNacimiento: acc.fechaNacimiento,
        estadoCivil: acc.estadoCivil,
        activo: true,
      },
      create: {
        nombre: acc.nombre,
        cedula: acc.cedula,
        correo: acc.correo,
        walletAddress: acc.walletAddress,
        telefono: acc.telefono,
        direccion: acc.direccion,
        sexo: acc.sexo,
        fechaNacimiento: acc.fechaNacimiento,
        estadoCivil: acc.estadoCivil,
        activo: true,
      },
    });

    if (acc.cargo) {
      await prisma.directivo.upsert({
        where: { socioId: socio.id },
        update: {
          cargo: acc.cargo,
          activo: true,
        },
        create: {
          socioId: socio.id,
          cargo: acc.cargo,
          fechaInicio: fechaInicio,
          fechaFin: fechaFin,
          activo: true,
        },
      });
      console.log(`✅ Directivo Registrado [${acc.index}]: ${acc.nombre} (${acc.cargo}) - ${acc.walletAddress}`);
    } else {
      console.log(`👤 Socio Registrado [${acc.index}]: ${acc.nombre} - ${acc.walletAddress}`);
    }
  }

  // 3. Limpiar cualquier propuesta previa para garantizar base de datos limpia sin mocks
  await prisma.acta.deleteMany({});
  await prisma.voto.deleteMany({});
  await prisma.aval.deleteMany({});
  await prisma.propuesta.deleteMany({});

  console.log("Seed completado exitosamente: 10 Cuentas de Anvil registradas. Tabla de propuestas limpia.");
}

main()
  .catch((e) => {
    console.error("Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
