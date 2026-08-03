import { ethers } from "ethers";

// ABIs simplificados (en producción se importan desde artifacts)
export const COOPERATIVA_ABI = [
  "function registrarSocio(address _wallet) external",
  "function depositarAporte() external payable",
  "function esSocioActivo(address _wallet) external view returns (bool)",
  "function directivos(address) external view returns (address wallet, uint8 cargo, uint256 fechaInicio, uint256 fechaFin, bool activo)",
  "function capitalTotal() external view returns (uint256)",
  "function getListaSocios() external view returns (address[] memory)",
  "event SocioRegistrado(address indexed wallet, uint256 fecha)",
  "event AporteDepositado(address indexed wallet, uint256 monto, uint256 nuevoBalance)",
];

export const VOTACION_ABI = [
  "function crearPropuesta(string memory _nombre, string memory _descripcion, uint256 _monto, address _walletReceptora, uint8 _tipo) external returns (uint256)",
  "function firmarAval(uint256 _id) external",
  "function votar(uint256 _id, uint8 _voto) external",
  "function cerrarPropuesta(uint256 _id) external",
  "function apelarPropuesta(uint256 _id) external",
  "function ejecutarPropuesta(uint256 _id) external",
  "function setDisponibilidad(uint256 _id, bool _disponible) external",
  "function getPropuesta(uint256 _id) external view returns (tuple(uint256 id, string nombre, string descripcion, uint256 monto, address walletReceptora, uint8 tipo, uint8 estado, bool disponible, uint256 fechaCreacion, uint256 fechaAprobacion, uint256 fechaApelacion, uint256 deadline, uint256 intentos, uint256 votosAceptada, uint256 votosRechazada, uint256 votosAbstencion, bool ejecutada, address creador))",
  "function getPropuestas() external view returns (tuple(uint256 id, string nombre, string descripcion, uint256 monto, address walletReceptora, uint8 tipo, uint8 estado, bool disponible, uint256 fechaCreacion, uint256 fechaAprobacion, uint256 fechaApelacion, uint256 deadline, uint256 intentos, uint256 votosAceptada, uint256 votosRechazada, uint256 votosAbstencion, bool ejecutada, address creador)[] memory)",
  "function avales(uint256, address) external view returns (address directivo, bool firmado, uint256 fechaFirma)",
  "function conteoAvales(uint256) external view returns (uint256)",
  "event PropuestaCreada(uint256 indexed id, address creador, string nombre)",
  "event AvalFirmado(uint256 indexed id, address directivo)",
  "event PropuestaPublicada(uint256 indexed id, uint256 deadline)",
  "event VotoEmitido(uint256 indexed id, address votante, uint8 voto)",
  "event PropuestaCerrada(uint256 indexed id, uint8 estado)",
];

export const FORWARDER_ABI = [
  "function getNonce(address from) external view returns (uint256)",
  "function verify(tuple(address from, address to, uint256 value, uint256 gas, uint256 nonce, bytes data) calldata req, bytes calldata signature) external view returns (bool)",
  "function execute(tuple(address from, address to, uint256 value, uint256 gas, uint256 nonce, bytes data) calldata req, bytes calldata signature) external payable returns (bool, bytes memory)",
];

export const ACTA_ABI = [
  "function registrarHash(uint256 _propuestaId, bytes32 _hash) external",
  "function verificarHash(bytes32 _hash) external view returns (bool, uint256)",
  "function actas(uint256) external view returns (bytes32 hash, uint256 propuestaId, uint256 fechaRegistro, bool valida)",
];

// Provider para lecturas (sin necesidad de wallet)
export function getProvider() {
  return new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
}

// Provider con signer para transacciones (backend)
export function getAdminSigner() {
  const provider = getProvider();
  return new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);
}

// Instancias de contratos (lectura)
export function getCooperativaRead() {
  const provider = getProvider();
  return new ethers.Contract(
    process.env.NEXT_PUBLIC_COOPERATIVA_ADDRESS!,
    COOPERATIVA_ABI,
    provider
  );
}

export function getVotacionRead() {
  const provider = getProvider();
  return new ethers.Contract(
    process.env.NEXT_PUBLIC_VOTACION_ADDRESS!,
    VOTACION_ABI,
    provider
  );
}

// Instancias de contratos (escritura)
export function getCooperativaWrite(signer: ethers.Signer) {
  return new ethers.Contract(
    process.env.NEXT_PUBLIC_COOPERATIVA_ADDRESS!,
    COOPERATIVA_ABI,
    signer
  );
}

export function getVotacionWrite(signer: ethers.Signer) {
  return new ethers.Contract(
    process.env.NEXT_PUBLIC_VOTACION_ADDRESS!,
    VOTACION_ABI,
    signer
  );
}

export function getForwarderRead() {
  const provider = getProvider();
  return new ethers.Contract(
    process.env.NEXT_PUBLIC_FORWARDER_ADDRESS!,
    FORWARDER_ABI,
    provider
  );
}

export function getActaWrite(signer: ethers.Signer) {
  return new ethers.Contract(
    process.env.NEXT_PUBLIC_ACTA_REGISTRY_ADDRESS!,
    ACTA_ABI,
    signer
  );
}
