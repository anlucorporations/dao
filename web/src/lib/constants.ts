// ============================================================
// CONSTANTES DEL SISTEMA
// ============================================================

export const CARGOS = {
  PRESIDENTE: 1,
  VICEPRESIDENTE: 2,
  SECRETARIO: 3,
  CONTRALOR: 4,
  CONTADOR: 5,
} as const;

export const ESTADOS_PROPUESTA = {
  BORRADOR: 0,
  POR_DISCUTIR: 1,
  APROBADA: 2,
  RECHAZADA: 3,
  APELADA: 4,
  EJECUTADA: 5,
} as const;

export const TIPOS_PROPUESTA = {
  INVERSION: 0,
  ADMINISTRATIVA: 1,
} as const;

export const TIPOS_VOTO = {
  ACEPTADA: 0,
  RECHAZADA: 1,
  ABSTENCION: 2,
} as const;

export const DURACIONES = {
  INVERSION_HORAS: 24,
  ADMINISTRATIVA_HORAS: 12,
  POSTULACION_HORAS: 24,
} as const;

export const PORCENTAJES = {
  INSCRIPCION: 2,
  MINIMO_DIRECTIVO: 10,
  AVALES_REQUERIDOS: 3,
  MAX_REINTENTOS: 3,
} as const;

export const TIEMPOS = {
  PERIODO_CARGO_ANIOS: 2,
  APELACION_HORAS: 24,
} as const;

const getAnvilDynamicEndpoint = () => {
  if (process.env.NEXT_PUBLIC_ANVIL_RPC && !process.env.NEXT_PUBLIC_ANVIL_RPC.includes("localhost")) {
    return process.env.NEXT_PUBLIC_ANVIL_RPC;
  }
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:8545`;
  }
  return "http://34.132.231.119:8545";
};

export const REDES = {
  ANVIL: {
    chainId: 31337,
    name: "Foundry Anvil Local / Cloud",
    get rpc() {
      return getAnvilDynamicEndpoint();
    },
    get explorer() {
      return getAnvilDynamicEndpoint();
    },
  },
  AMOY: {
    chainId: 80002,
    name: "Polygon Amoy",
    rpc: "https://rpc-amoy.polygon.technology",
    explorer: "https://amoy.polygonscan.com",
  },
  POLYGON: {
    chainId: 137,
    name: "Polygon PoS",
    rpc: "https://polygon-rpc.com",
    explorer: "https://polygonscan.com",
  },
} as const;
