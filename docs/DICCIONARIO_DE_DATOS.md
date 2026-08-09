# 📖 Diccionario de Datos y Modelo de Esquemas — DAO Gasless EIP-2771

Este documento define la estructura de datos on-chain en Smart Contracts (**Solidity / EIP-2771**) y las estructuras DTO del Frontend (**TypeScript / Next.js 15**).

---

## 1. Estructuras On-Chain (Smart Contracts Solidity)

### 1.1 Struct `Proposal` (`DAOVoting.sol`)
Almacena la información de gobernanza y financiera de cada propuesta registrada en la blockchain.

| Campo | Tipo Solidity | Descripción / Restricciones |
|---|---|---|
| `id` | `uint256` | Identificador único secuencial (1, 2, 3...). |
| `proposer` | `address` | Wallet del socio creador de la propuesta. |
| `title` | `string` | Título descriptivo de la propuesta. |
| `recipient` | `address` | Dirección pública Ethereum receptora de los fondos. |
| `amount` | `uint256` | Monto solicitado en Ether (almacenado en Wei). |
| `votingDeadline` | `uint256` | Timestamp UNIX de expiración del periodo de votación. |
| `executionDelay` | `uint256` | Timestamp UNIX mínimo para permitir la ejecución. |
| `executed` | `bool` | `true` si la propuesta ya desembolsó los fondos. |
| `forVotes` | `uint256` | Contador acumulado de votos **A FAVOR**. |
| `againstVotes` | `uint256` | Contador acumulado de votos **EN CONTRA**. |
| `abstainVotes` | `uint256` | Contador acumulado de votos de **ABSTENCIÓN**. |
| `description` | `string` | Memoria justificativa del proyecto. |

### 1.2 Struct `ForwardRequest` (`MinimalForwarder.sol`)
Estructura EIP-712 para meta-transacciones firmadas off-chain con transparencia en MetaMask.

| Campo | Tipo Solidity | Tipo EIP-712 | Descripción |
|---|---|---|---|
| `from` | `address` | `address` | Dirección pública del socio emisor. |
| `to` | `address` | `address` | Dirección del contrato objetivo (`DAOVoting.sol`). |
| `value` | `uint256` | `uint256` | Valor en ETH a transferir con la llamada. |
| `gas` | `uint256` | `uint256` | Límite de gas estimado para la ejecución. |
| `nonce` | `uint256` | `uint256` | Contador secuencial de transacción por usuario anti-replay. |
| `accion` | `string` | `string` | Texto legible en MetaMask (Ej: *🗳️ Emisión de Voto*). |
| `detalles` | `string` | `string` | Descripción legible de la transacción para el socio. |
| `data` | `bytes` | `bytes` | Payload ABI codificado de la función objetivo. |

### 1.3 Enum `VoteType` (`DAOVoting.sol`)
| Valor | Constante | Descripción |
|:---:|---|---|
| `0` | `NONE` | Estado por defecto / Sin voto registrado. |
| `1` | `FOR` | Voto **A FAVOR** de la propuesta. |
| `2` | `AGAINST` | Voto **EN CONTRA** de la propuesta. |
| `3` | `ABSTAIN` | Voto de **ABSTENCIÓN**. |

---

## 2. Modelos de Datos en Frontend (TypeScript DTOs)

### 2.1 Interface `Proposal` (`src/lib/contracts.ts`)
```typescript
export interface Proposal {
  id: bigint;
  proposer: string;
  title: string;
  recipient: string;
  amount: bigint;
  votingDeadline: bigint;
  executionDelay: bigint;
  executed: boolean;
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  description: string;
  userVote?: number;
}
```

### 2.2 Payload API Relayer (`/api/relay`)
```json
{
  "request": {
    "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "to": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    "value": "0",
    "gas": "1000000",
    "nonce": "0",
    "accion": "🗳️ Emisión de Voto en Propuesta DAO",
    "detalles": "Propuesta ID: #1 | Decisión: 👍 A FAVOR | Modalidad: ⚡ Meta-Transacción Sin Gas",
    "data": "0x..."
  },
  "signature": "0x..."
}
```
