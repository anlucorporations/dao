# Errores Típicos del Sistema de Meta-Transacciones

## 📋 Índice
1. [Errores de EIP-712](#errores-de-eip-712)
2. [Errores de Nonce](#errores-de-nonce)
3. [Errores de Configuración](#errores-de-configuración)
4. [Errores de Transacción](#errores-de-transacción)
5. [Errores de Relayer](#errores-de-relayer)
6. [Errores de Frontend](#errores-de-frontend)
7. [Errores de Contratos](#errores-de-contratos)

---

## Errores de EIP-712

### ❌ Error: `MinimalForwarder: signature does not match request`

**Síntomas:**
```
Error: MinimalForwarder: signature does not match request
```

**Causa:**
- Versión del dominio EIP-712 incorrecta
- Dominio no coincide con el contrato

**Solución:**
```typescript
// ❌ Incorrecto
const domain = {
  name: 'MinimalForwarder',
  version: '0.0.1', // ← Versión incorrecta
  chainId: chainId.toString(),
  verifyingContract: await forwarder.getAddress(),
};

// ✅ Correcto
const domain = {
  name: 'MinimalForwarder',
  version: '1', // ← Versión correcta del contrato
  chainId: chainId.toString(),
  verifyingContract: await forwarder.getAddress(),
};
```

### ❌ Error: `EIP712_DOMAIN_TYPE not used`

**Síntomas:**
```
Warning: 'EIP712_DOMAIN_TYPE' is defined but never used
```

**Causa:**
- Constante definida pero no utilizada

**Solución:**
```typescript
// ❌ Incorrecto - constante no usada
const EIP712_DOMAIN_TYPE = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' }
];

// ✅ Correcto - eliminar constante no usada
// No definir constantes que no se usan
```

---

## Errores de Nonce

### ❌ Error: `Nonce mismatch! Expected: X Got: Y`

**Síntomas:**
```
Nonce mismatch! Expected: 5 Got: 4
```

**Causa:**
- El frontend está usando un nonce obsoleto
- Múltiples transacciones simultáneas
- Condición de carrera entre frontend y relayer

**Solución:**
```typescript
// ❌ Incorrecto - usar nonce de la cuenta
const nonce = await signer.getNonce();

// ✅ Correcto - usar nonce del forwarder
const nonce = await forwarder.getNonce(from);

// ✅ Mejor - obtener nonce fresco cada vez
export async function signMetaTxRequest(
  signer: ethers.Signer,
  forwarder: ethers.Contract,
  input: Omit<ForwardRequest, 'nonce'>
) {
  const from = await signer.getAddress();
  
  // Siempre obtener nonce fresco
  const nonce = await forwarder.getNonce(from);
  
  // ... resto del código
}
```

### ❌ Error: Condición de Carrera en Transacciones Consecutivas

**Síntomas:**
- Primera transacción exitosa
- Segunda transacción falla con nonce incorrecto
- Múltiples pestañas del navegador

**Solución:**
```typescript
// ✅ Agregar protección en el frontend
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  if (submitting) {
    console.log('⚠️ Transaction already in progress');
    return;
  }
  
  setSubmitting(true);
  try {
    // ... lógica de transacción
  } finally {
    setSubmitting(false);
  }
};

// ✅ Agregar protección en el relayer
const userLocks = new Map<string, boolean>();

export async function POST(request: NextRequest) {
  const userAddress = forwardRequest.from.toLowerCase();
  
  if (userLocks.get(userAddress)) {
    return NextResponse.json(
      { error: 'Transaction already in progress for this user' },
      { status: 429 }
    );
  }
  
  userLocks.set(userAddress, true);
  
  try {
    // ... ejecutar transacción
  } finally {
    userLocks.delete(userAddress);
  }
}
```

---

## Errores de Configuración

### ❌ Error: `FORWARDER_CONTRACT_ADDRESS not configured`

**Síntomas:**
```
Error: FORWARDER_CONTRACT_ADDRESS not configured. Please check your .env.local file
```

**Causa:**
- Variable de entorno faltante o incorrecta
- Archivo `.env.local` no configurado

**Solución:**
```bash
# ✅ Configurar variables en .env.local
NEXT_PUBLIC_DAO_CONTRACT_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
NEXT_PUBLIC_FORWARDER_CONTRACT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
RELAYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
RPC_URL=http://127.0.0.1:8545
```

### ❌ Error: `Invalid FORWARDER_CONTRACT_ADDRESS`

**Síntomas:**
```
Error: Invalid FORWARDER_CONTRACT_ADDRESS: undefined
```

**Causa:**
- Variable de entorno vacía o con formato incorrecto

**Solución:**
```typescript
// ✅ Validar variables de entorno
export function getForwarderContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  if (!FORWARDER_CONTRACT_ADDRESS || FORWARDER_CONTRACT_ADDRESS === '') {
    throw new Error('FORWARDER_CONTRACT_ADDRESS not configured');
  }
  if (!ethers.isAddress(FORWARDER_CONTRACT_ADDRESS)) {
    throw new Error(`Invalid FORWARDER_CONTRACT_ADDRESS: ${FORWARDER_CONTRACT_ADDRESS}`);
  }
  return new ethers.Contract(FORWARDER_CONTRACT_ADDRESS, MinimalForwarderABI, signerOrProvider);
}
```

---

## Errores de Transacción

### ❌ Error: `transaction execution reverted`

**Síntomas:**
```
Error: transaction execution reverted (action="sendTransaction", data=null, reason=null, ...)
```

**Causas y Soluciones:**

#### 1. **Fondos Insuficientes del Usuario**
```solidity
// ❌ Error en DAOVoting.sol
require(userBalanceInDAO >= requiredBalance, "Insufficient balance to create proposal");
```

**Solución:**
```typescript
// Depositar fondos en el DAO antes de crear propuestas
await depositFunds(signer, amount);
```

#### 2. **Fondos Insuficientes del DAO**
```solidity
// ❌ Error en DAOVoting.sol
require(_amount <= totalDeposited, "Insufficient DAO funds");
```

**Solución:**
```typescript
// Depositar fondos en el DAO
const daoContract = getDAOContract(signer);
await daoContract.deposit({ value: ethers.parseEther("10.0") });
```

#### 3. **Call failed en MinimalForwarder**
```solidity
// ❌ Error en MinimalForwarder.sol
require(success, "Call failed");
```

**Causa:** El contrato destino no recibe correctamente los datos de EIP-2771

**Solución:**
```solidity
// ✅ Correcto en MinimalForwarder.sol
(bool success, ) = req.to.call{value: req.value}(
    abi.encodePacked(req.data, req.from) // ← Añadir req.from para EIP-2771
);
```

---

## Errores de Relayer

### ❌ Error: `RPC request failed: Error: Execution error: execution reverted`

**Síntomas:**
```
RPC request failed:
    Request: EthCall(..., data: Some(0x95d89b41), ...)
    Error: Execution error: execution reverted
```

**Causa:** El frontend está llamando funciones ERC20 en el contrato incorrecto

**Solución:**
```typescript
// ❌ Incorrecto - usar variable de entorno incorrecta
const FORWARDER_ADDRESS = process.env.FORWARDER_CONTRACT_ADDRESS || '';

// ✅ Correcto - usar variable pública
const FORWARDER_ADDRESS = process.env.NEXT_PUBLIC_FORWARDER_CONTRACT_ADDRESS || '';
```

### ❌ Error: `Internal error: EVM error StackOverflow`

**Síntomas:**
```
Error: Internal error: EVM error StackOverflow
```

**Causa:** Llamadas recursivas o caché corrupto del frontend

**Solución:**
```bash
# Limpiar caché de Next.js
cd web
rm -rf .next
npm run dev

# Reiniciar servidor de desarrollo
pkill -f "npm run dev"
npm run dev
```

---

## Errores de Frontend

### ❌ Error: `Argument of type 'Omit<ForwardRequest, "from" | "nonce">' is not assignable`

**Síntomas:**
```
Type 'Omit<ForwardRequest, "from" | "nonce">' is not assignable to parameter of type 'Omit<ForwardRequest, "nonce">'
```

**Causa:** Incompatibilidad de tipos entre funciones

**Solución:**
```typescript
// ❌ Incorrecto
const { request: signedRequest, signature } = await signMetaTxRequest(
  signer,
  forwarderContract,
  request // ← request no tiene 'from'
);

// ✅ Correcto
const { request: signedRequest, signature } = await signMetaTxRequest(
  signer,
  forwarderContract,
  { ...request, from: userAddress } // ← añadir 'from'
);
```

### ❌ Error: `Unexpected any. Specify a different type`

**Síntomas:**
```
Line X: Unexpected any. Specify a different type
```

**Solución:**
```typescript
// ❌ Incorrecto
} catch (err: any) {
  console.error('Error:', err);
  setError(err.message || 'Failed to create proposal');
}

// ✅ Correcto
} catch (err: unknown) {
  console.error('Error:', err);
  const errorMessage = err instanceof Error ? err.message : 'Failed to create proposal';
  setError(errorMessage);
}
```

---

## Errores de Contratos

### ❌ Error: `function name() public view returns (string memory)`

**Síntomas:**
```
RPC request failed: ... data: Some(0x06fdde03) ... Error: Execution error: execution reverted
```

**Causa:** Función `name()` no implementada en el contrato DAO

**Solución:**
```solidity
// ✅ Añadir función name() en DAOVoting.sol
function name() public pure returns (string memory) {
    return "DAO Voting Token";
}

function symbol() public pure returns (string memory) {
    return "DAO";
}

function decimals() public pure returns (uint8) {
    return 18;
}
```

### ❌ Error: `Call failed` en MinimalForwarder

**Síntomas:**
```
Error: Call failed
```

**Causa:** El contrato destino no puede procesar los datos de EIP-2771

**Solución:**
```solidity
// ✅ Asegurar que el contrato destino herede de ERC2771Context
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract DAOVoting is ERC2771Context {
    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) {}
    
    function createProposal(...) external returns (uint256) {
        address sender = _msgSender(); // ← Usar _msgSender() en lugar de msg.sender
        // ...
    }
}
```

---

## Errores de Deployment

### ❌ Error: `Error: insufficient funds for gas`

**Síntomas:**
```
Error: insufficient funds for gas * price + value
```

**Causa:** Cuenta de deployment sin suficientes fondos

**Solución:**
```bash
# Verificar balance de la cuenta
cast balance 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Si es necesario, transferir fondos
cast send 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --value 10ether
```

### ❌ Error: `Error: nonce too low`

**Síntomas:**
```
Error: nonce too low
```

**Causa:** Nonce de la cuenta incorrecto

**Solución:**
```bash
# Verificar nonce actual
cast nonce 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Si es necesario, resetear cuenta en Anvil
anvil --accounts 10 --balance 10000
```

---

## Checklist de Debugging

### ✅ Antes de Reportar un Error

1. **Verificar Variables de Entorno**
   ```bash
   cat web/.env.local
   ```

2. **Verificar Contratos Desplegados**
   ```bash
   ./deploy-local.sh
   ```

3. **Verificar Logs del Relayer**
   ```bash
   # Buscar en logs del servidor Next.js
   grep -i "error\|failed" web/logs/
   ```

4. **Verificar Nonces**
   ```bash
   cast call $FORWARDER_ADDRESS "getNonce(address)" $USER_ADDRESS
   ```

5. **Verificar Fondos**
   ```bash
   cast balance $USER_ADDRESS
   cast balance $DAO_ADDRESS
   ```

### ✅ Comandos de Debugging Útiles

```bash
# Verificar estado del blockchain
cast block-number

# Verificar transacción específica
cast tx 0x...

# Verificar logs de eventos
cast logs --from-block 0 --to-block latest

# Verificar balance de contratos
cast balance $DAO_ADDRESS
cast balance $FORWARDER_ADDRESS

# Verificar nonces
cast call $FORWARDER_ADDRESS "getNonce(address)" $USER_ADDRESS
```

---

## Resumen de Soluciones Rápidas

| Error | Solución Rápida |
|-------|----------------|
| `signature does not match` | Cambiar versión EIP-712 a `'1'` |
| `Nonce mismatch` | Usar `forwarder.getNonce(from)` |
| `Call failed` | Añadir `req.from` en `abi.encodePacked` |
| `RPC request failed` | Verificar variables de entorno |
| `Transaction already in progress` | Esperar o reiniciar servidor |
| `Insufficient funds` | Depositar fondos en DAO/usuario |
| `StackOverflow` | Limpiar caché `.next` |

---

*Este documento recopila los errores más comunes encontrados durante el desarrollo del sistema de meta-transacciones. Para errores específicos, consulta los logs detallados del sistema.*


