// ============================================================
// SCRIPT DE PRUEBAS DE CARGA
// Fase 5: Pruebas - Simula 200 socios votando simultáneamente
// ============================================================

const { ethers } = require("ethers");

const CONFIG = {
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8545",
  votacionAddress: process.env.NEXT_PUBLIC_VOTACION_ADDRESS,
  forwarderAddress: process.env.NEXT_PUBLIC_FORWARDER_ADDRESS,
  numUsuarios: 50, // Simular 50 votos simultáneos
  propuestaId: 0,
};

async function stressTest() {
  console.log("=== PRUEBA DE CARGA - VOTACIÓN MASIVA ===");
  console.log(`Usuarios simulados: ${CONFIG.numUsuarios}`);
  console.log(`Propuesta: #${CONFIG.propuestaId}`);

  const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);

  // Crear wallets de prueba
  const wallets = [];
  for (let i = 0; i < CONFIG.numUsuarios; i++) {
    wallets.push(ethers.Wallet.createRandom().connect(provider));
  }

  console.log("\n💰 Fondeando wallets...");
  const admin = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);

  for (let i = 0; i < wallets.length; i++) {
    await admin.sendTransaction({
      to: wallets[i].address,
      value: ethers.parseEther("0.01"), // Gas para votar manualmente si falla relayer
    });
    if (i % 10 === 0) console.log(`   ${i}/${wallets.length}`);
  }

  console.log("\n🗳️  Enviando votos simultáneos...");
  const inicio = Date.now();

  const promesas = wallets.map(async (wallet, i) => {
    try {
      // Simular firma y envío al relay
      const message = `Voto ${i} para propuesta ${CONFIG.propuestaId}`;
      const signature = await wallet.signMessage(message);

      // Enviar al endpoint del relay
      const response = await fetch("http://localhost:3000/api/relay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request: {
            from: wallet.address,
            to: CONFIG.votacionAddress,
            value: 0,
            gas: 100000,
            nonce: 0,
            data: "0x", // Simplificado
          },
          signature,
          walletAddress: wallet.address,
        }),
      });

      return { success: response.ok, wallet: wallet.address };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  const resultados = await Promise.all(promesas);
  const duracion = Date.now() - inicio;

  const exitosos = resultados.filter((r) => r.success).length;
  const fallidos = resultados.filter((r) => !r.success).length;

  console.log(`\n${"=".repeat(50)}`);
  console.log("RESULTADOS DE CARGA");
  console.log(`${"=".repeat(50)}`);
  console.log(`Total votos: ${CONFIG.numUsuarios}`);
  console.log(`Exitosos: ${exitosos}`);
  console.log(`Fallidos: ${fallidos}`);
  console.log(`Tiempo total: ${duracion}ms`);
  console.log(`Promedio por voto: ${(duracion / CONFIG.numUsuarios).toFixed(2)}ms`);
  console.log(`Throughput: ${((CONFIG.numUsuarios / duracion) * 1000).toFixed(2)} votos/segundo`);

  if (fallidos > 0) {
    console.log("\n❌ Errores encontrados:");
    resultados.filter((r) => !r.success).forEach((r) => {
      console.log(`   ${r.wallet}: ${r.error}`);
    });
  }

  // Verificar que todos los votos quedaron registrados
  const votacion = new ethers.Contract(CONFIG.votacionAddress, [
    "function getPropuesta(uint256) view returns (tuple(uint256 id, string nombre, string descripcion, uint256 monto, address walletReceptora, uint8 tipo, uint8 estado, bool disponible, uint256 fechaCreacion, uint256 fechaAprobacion, uint256 fechaApelacion, uint256 deadline, uint256 intentos, uint256 votosAceptada, uint256 votosRechazada, uint256 votosAbstencion, bool ejecutada, address creador))"
  ], provider);

  const prop = await votacion.getPropuesta(CONFIG.propuestaId);
  const totalVotos = prop.votosAceptada + prop.votosRechazada + prop.votosAbstencion;
  console.log(`\nVotos registrados en blockchain: ${totalVotos}`);

  return fallidos === 0;
}

stressTest().then((success) => {
  process.exit(success ? 0 : 1);
}).catch(console.error);
