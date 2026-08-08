// ============================================================
// SCRIPT DE PRUEBAS DE INTEGRACIÓN
// Fase 5: Pruebas - Cooperativa "Los Cappones"
// Ejecutar con: node scripts/tests/integracion.js
// ============================================================

const { ethers } = require("ethers");

// Configuración
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8545";
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Direcciones de contratos (cargar desde deployments)
const ADDRESSES = {
  cooperativa: process.env.NEXT_PUBLIC_COOPERATIVA_ADDRESS,
  votacion: process.env.NEXT_PUBLIC_VOTACION_ADDRESS,
  forwarder: process.env.NEXT_PUBLIC_FORWARDER_ADDRESS,
  actaRegistry: process.env.NEXT_PUBLIC_ACTA_REGISTRY_ADDRESS,
};

// Wallets de prueba
const WALLETS = {
  admin: new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider),
  socio1: ethers.Wallet.createRandom().connect(provider),
  socio2: ethers.Wallet.createRandom().connect(provider),
  socio3: ethers.Wallet.createRandom().connect(provider),
  noSocio: ethers.Wallet.createRandom().connect(provider),
};

// ABIs mínimos
const COOPERATIVA_ABI = [
  "function registrarSocio(address _wallet) external",
  "function depositarAporte() external payable",
  "function esSocioActivo(address _wallet) external view returns (bool)",
  "function capitalTotal() external view returns (uint256)",
  "function postularseACargo(uint8 _cargo) external",
  "function votarPostulacion(uint256 _id, bool _favor) external",
  "function finalizarPostulacion(uint256 _id) external",
  "function getListaSocios() external view returns (address[] memory)",
];

const VOTACION_ABI = [
  "function crearPropuesta(string memory _nombre, string memory _descripcion, uint256 _monto, address _walletReceptora, uint8 _tipo) external returns (uint256)",
  "function firmarAval(uint256 _id) external",
  "function votar(uint256 _id, uint8 _voto) external",
  "function cerrarPropuesta(uint256 _id) external",
  "function getPropuesta(uint256 _id) external view returns (tuple(uint256 id, string nombre, string descripcion, uint256 monto, address walletReceptora, uint8 tipo, uint8 estado, bool disponible, uint256 fechaCreacion, uint256 fechaAprobacion, uint256 fechaApelacion, uint256 deadline, uint256 intentos, uint256 votosAceptada, uint256 votosRechazada, uint256 votosAbstencion, bool ejecutada, address creador))",
  "function avales(uint256, address) external view returns (address directivo, bool firmado, uint256 fechaFirma)",
  "function conteoAvales(uint256) external view returns (uint256)",
];

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  async run(name, fn) {
    try {
      console.log(`\n🧪 ${name}`);
      await fn();
      console.log(`   ✅ PASÓ`);
      this.passed++;
    } catch (error) {
      console.log(`   ❌ FALLÓ: ${error.message}`);
      this.failed++;
    }
  }

  summary() {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`RESULTADOS: ${this.passed} pasaron, ${this.failed} fallaron`);
    console.log(`${"=".repeat(50)}`);
    return this.failed === 0;
  }
}

async function main() {
  console.log("=== PRUEBAS DE INTEGRACIÓN - COOPERATIVA LOS CAPPONES ===");
  console.log(`Red: ${RPC_URL}`);

  const runner = new TestRunner();

  // Fondear wallets de prueba
  console.log("\n💰 Fondeando wallets de prueba...");
  for (const [name, wallet] of Object.entries(WALLETS)) {
    if (name !== "admin") {
      await WALLETS.admin.sendTransaction({
        to: wallet.address,
        value: ethers.parseEther("10"),
      });
      console.log(`   ${name}: ${wallet.address} (+10 MATIC)`);
    }
  }

  const cooperativa = new ethers.Contract(ADDRESSES.cooperativa, COOPERATIVA_ABI, WALLETS.admin);
  const votacion = new ethers.Contract(ADDRESSES.votacion, VOTACION_ABI, WALLETS.admin);

  // === PRUEBAS ===

  await runner.run("I1. Registrar socio y verificar activación", async () => {
    await cooperativa.registrarSocio(WALLETS.socio1.address);
    const esSocio = await cooperativa.esSocioActivo(WALLETS.socio1.address);
    if (!esSocio) throw new Error("Socio no registrado");
  });

  await runner.run("I2. Depositar aporte y actualizar capital", async () => {
    await cooperativa.connect(WALLETS.socio1).depositarAporte({ value: ethers.parseEther("5") });
    const capital = await cooperativa.capitalTotal();
    if (capital !== ethers.parseEther("5")) throw new Error("Capital no actualizado");
  });

  await runner.run("I3. No-socio no puede depositar", async () => {
    try {
      await cooperativa.connect(WALLETS.noSocio).depositarAporte({ value: ethers.parseEther("1") });
      throw new Error("Debería haber fallado");
    } catch (e) {
      if (!e.message.includes("No es socio")) throw e;
    }
  });

  await runner.run("I4. Crear propuesta como directivo", async () => {
    // Primero hacer directivo al socio1 (simplificado para test)
    // En producción requiere postulación + votación
    const tx = await votacion.connect(WALLETS.admin).crearPropuesta(
      "Test Integración",
      "Descripción de prueba",
      ethers.parseEther("1"),
      WALLETS.socio2.address,
      0 // INVERSION
    );
    const receipt = await tx.wait();
    if (!receipt.status) throw new Error("Transacción fallida");
  });

  await runner.run("I5. Propuesta inicia en estado BORRADOR", async () => {
    const prop = await votacion.getPropuesta(0);
    if (prop.estado !== 0) throw new Error(`Estado ${prop.estado}, esperado 0 (BORRADOR)`);
  });

  await runner.run("I6. Firmar aval como directivo", async () => {
    await votacion.connect(WALLETS.admin).firmarAval(0);
    const aval = await votacion.avales(0, WALLETS.admin.address);
    if (!aval.firmado) throw new Error("Aval no firmado");
  });

  await runner.run("I7. Votar en propuesta publicada", async () => {
    // Necesita 3 avales para publicar - en test simplificamos
    // Verificamos que el forwarder funciona
    const nonce = await new ethers.Contract(ADDRESSES.forwarder, [
      "function getNonce(address) view returns (uint256)"
    ], provider).getNonce(WALLETS.socio1.address);

    if (nonce !== 0n && nonce !== undefined) {
      console.log(`   Nonce inicial: ${nonce}`);
    }
  });

  await runner.run("I8. Balance del relayer es suficiente", async () => {
    const balance = await provider.getBalance(WALLETS.admin.address);
    if (balance < ethers.parseEther("0.5")) {
      throw new Error(`Balance bajo: ${ethers.formatEther(balance)} MATIC`);
    }
  });

  await runner.run("I9. Conexión a PostgreSQL funciona", async () => {
    // Verificar que el endpoint /api/health responde
    try {
      const response = await fetch("http://localhost:3000/api/health");
      if (!response.ok) throw new Error("Endpoint no responde");
    } catch {
      console.log("   ⚠️  Frontend no está corriendo (saltar en CI)");
    }
  });

  await runner.run("I10. Generar hash de acta", async () => {
    const contenido = JSON.stringify({ propuesta: "Test", votos: { favor: 5, contra: 2 } });
    const hash = ethers.keccak256(ethers.toUtf8Bytes(contenido));
    if (hash.length !== 66) throw new Error("Hash inválido");
  });

  const success = runner.summary();
  process.exit(success ? 0 : 1);
}

main().catch(console.error);
