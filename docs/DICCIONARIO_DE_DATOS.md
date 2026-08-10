# 📖 Diccionario de Datos y Modelo de Esquemas — DAO Gasless EIP-2771

Este documento define las estructuras de datos en contratos inteligentes (**Solidity / EIP-2771**) y las definiciones TypeScript DTO en la aplicación Frontend (**Next.js 15**).

---

## 1. Estructuras On-Chain (Smart Contracts Solidity)

### 1.1 Struct `Proposal` (`DAOVoting.sol`)
Almacena la información de gobernanza y financiera de cada propuesta registrada en la blockchain.

| Campo | Tipo Solidity | Descripción / Restricciones |
|---|---|---|
| `id` | `uint256` | Identificador único secuencial (1, 2, 3...). |
| `title` | `string` | Título descriptivo del proyecto. |
| `recipient` | `address` | Billetera Ethereum receptora de los fondos desembolsados. |
| `amount` | `uint256` | Monto solicitado en Wei (convertible a ETH). |
| `votingDeadline` | `uint256` | Timestamp UNIX límite para emitir votos. |
| `executionDelay` | `uint256` | Timestamp UNIX de retardo para ejecución (1 día). |
| `executed` | `bool` | `true` si la propuesta fue ejecutada por el Owner. |
| `forVotes` | `uint256` | Votos acumulados **A FAVOR**. |
| `againstVotes` | `uint256` | Votos acumulados **EN CONTRA**. |
| `abstainVotes` | `uint256` | Votos acumulados de **ABSTENCIÓN**. |
| `description` | `string` | Memoria justificativa del proyecto. |
| `secondPeriod` | `bool` | `true` si se activó el 2º periodo de votación (repechaje). |
| `rejected` | `bool` | `true` si la propuesta fue rechazada definitivamente. |

---

### 1.2 Variables de Estado de Gobernanza (`DAOVoting.sol`)

| Variable | Tipo Solidity | Visibilidad | Descripción |
|---|---|---|---|
| `owner` | `address` | `public` | Billetera del Owner autorizada para la ejecución manual. |
| `proposalCount` | `uint256` | `public` | Contador total de propuestas creadas. |
| `memberCount` | `uint256` | `public` | Contador total de socios registrados (3 ETH). |
| `totalDeposited` | `uint256` | `public` | Fondos totales en Wei almacenados en la DAO. |
| `minimumBalance` | `uint256` | `public` | Balance mínimo operativo configurado. |
| `isMember` | `mapping(address => bool)` | `public` | Registro de membresía de socios. |
| `balances` | `mapping(address => uint256)` | `public` | Depósitos individuales por socio. |

---

### 1.3 Struct `ForwardRequest` (`MinimalForwarder.sol`)
Estructura EIP-712 para meta-transacciones firmadas off-chain con transparencia en MetaMask.

| Campo | Tipo Solidity | Tipo EIP-712 | Descripción |
|---|---|---|---|
| `from` | `address` | `address` | Dirección pública del socio emisor. |
| `to` | `address` | `address` | Dirección del contrato objetivo (`DAOVoting.sol`). |
| `value` | `uint256` | `uint256` | Valor en ETH a transferir con la llamada. |
| `gas` | `uint256` | `uint256` | Límite de gas estimado. |
| `nonce` | `uint256` | `uint256` | Contador secuencial por socio anti-replay. |
| `accion` | `string` | `string` | Título legible en MetaMask (Ej: *🗳️ Emisión de Voto*). |
| `detalles` | `string` | `string` | Descripción detallada de la transacción. |
| `data` | `bytes` | `bytes` | Payload ABI codificado de la función ejecutada. |

---

### 1.4 Enum `VoteType` (`DAOVoting.sol`)
| Valor | Constante | Descripción |
|:---:|---|---|
| `0` | `ABSTAIN` | Voto de **ABSTENCIÓN**. |
| `1` | `FOR` | Voto **A FAVOR**. |
| `2` | `AGAINST` | Voto **EN CONTRA**. |

---

## 2. Modelos de Datos en Frontend (TypeScript DTOs)

### 2.1 Interface `Proposal` (`web/src/lib/contracts.ts`)
```typescript
export interface Proposal {
  id: bigint;
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
  secondPeriod: boolean;
  rejected: boolean;
  userVote?: number;
}
```

### 2.2 Interface `NotificationItem` (`web/src/lib/notifications.ts`)
```typescript
export interface NotificationItem {
  id: string;
  proposalId: number;
  title: string;
  message: string;
  timestamp: number;
  type: 'unanimity' | 'voting_concluded' | 'second_period' | 'rejected';
  read?: boolean;
}
```
