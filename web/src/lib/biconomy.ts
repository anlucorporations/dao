// ============================================================
// BICONOMY CONFIGURATION
// Fase 4: Despliegue - Integración con Relayer Externo
// ============================================================

/**
 * PASOS PARA CONFIGURAR BICONOMY (hacer ANTES del despliegue):
 * 
 * 1. Ir a https://dashboard.biconomy.io y crear cuenta gratuita
 * 2. Crear un nuevo "Paymaster" para la red Polygon Amoy (Chain ID: 80002)
 * 3. Obtener el API Key y el Paymaster URL
 * 4. Copiar las claves en el archivo .env.local
 * 5. Agregar fondos de MATIC (testnet) al Paymaster para pagar gas
 * 
 * NOTA: Biconomy ofrece 5,000 transacciones gratis/mes en testnet.
 * Para mainnet se paga por volumen (~$0.001 por transacción).
 */

export const BICONOMY_CONFIG = {
  // Red de pruebas (usar durante Fase 4 y 5)
  testnet: {
    chainId: 80002,
    name: "Polygon Amoy",
    paymasterUrl: process.env.BICONOMY_PAYMASTER_URL || "",
    apiKey: process.env.BICONOMY_API_KEY || "",
    bundlerUrl: "https://bundler.biconomy.io/api/v2/80002/...",
    whitelistedContracts: [
      process.env.NEXT_PUBLIC_VOTACION_ADDRESS,
      process.env.NEXT_PUBLIC_COOPERATIVA_ADDRESS,
    ],
  },

  // Red de producción (usar en Fase 7)
  mainnet: {
    chainId: 137,
    name: "Polygon PoS",
    paymasterUrl: process.env.BICONOMY_PAYMASTER_URL_MAINNET || "",
    apiKey: process.env.BICONOMY_API_KEY_MAINNET || "",
    bundlerUrl: "https://bundler.biconomy.io/api/v2/137/...",
    whitelistedContracts: [
      process.env.NEXT_PUBLIC_VOTACION_ADDRESS,
      process.env.NEXT_PUBLIC_COOPERATIVA_ADDRESS,
    ],
  },
};

export const PAYMASTER_POLICY = {
  maxGasPerTransaction: "100000",
  maxTransactionsPerDay: 500,
  allowedMethods: [
    "votar(uint256,uint8)",
    "firmarAval(uint256)",
    "postularseACargo(uint8)",
    "votarPostulacion(uint256,uint8)",
  ],
  lowBalanceAlert: "0.5",
};
