# 🛠️ Manual Técnico de la Plataforma DAO Los Cappones

Este documento constituye el **Manual Técnico** oficial de la plataforma **DAO Los Cappones**, detallando la arquitectura del sistema, el diseño de Smart Contracts, las integraciones API, los mecanismos de seguridad y la infraestructura containerizada.

---

## 1. Arquitectura del Sistema

La solución sigue una arquitectura basada en microservicios containerizados y desacoplados:

```mermaid
graph TD
    subgraph Cliente Web
        UI[App React / Next.js 15]
        MM[Wallet MetaMask]
    end

    subgraph Capa API & Servidor Next.js
        API_AUTH[/api/auth - Autenticacion SIWE / 2FA/]
        API_PROP[/api/proposals - Gestion de Propuestas/]
        API_RELAY[/api/relay - Relayer Gasless EIP-2771/]
        API_REP[/api/reports - Certificacion de Actas/]
        PRISMA[Prisma ORM]
    end

    subgraph Base de Datos
        PG[(PostgreSQL 16)]
    end

    subgraph Blockchain Layer (EVM)
        FWD[MinimalForwarder.sol]
        VOT[VotacionPropuestas.sol]
        TES[CooperativaCappones.sol Tesoreria]
        REG[ActaHashRegistry.sol]
    end

    UI -->|Conexion Web3| MM
    UI -->|Peticiones REST| API_AUTH
    UI -->|Peticiones REST| API_PROP
    UI -->|Meta-Tx Firmada| API_RELAY
    API_AUTH & API_PROP & API_RELAY & API_REP --> PRISMA
    PRISMA --> PG
    API_RELAY -->|Relay Signer Admin| FWD
    FWD -->|Call Exec| VOT
    VOT -->|Desembolso Autorizado| TES
    VOT -->|Registro Hash| REG
```

---

## 2. Especificación de Smart Contracts (Solidity ^0.8.20)

### 2.1 `CooperativaCappones.sol`
Contrato central de tesorería y registro de socios y miembros de la Junta Directiva.

- **Variables Estado Clave:**
  - `mapping(address => Socio) public socios;`
  - `mapping(address => Directivo) public directivos;`
  - `address public votacionContract;`
  - `uint256 public capitalTotal;`
- **Funciones Principales:**
  - `depositarAporte() external payable`: Permite a los socios depositar capital a la tesorería.
  - `setVotacionContract(address _votacionContract) external onlyOwner`: Asigna el contrato autorizado para solicitar retiros de inversión.
  - `pagarPropuestaInversion(address payable _receptora, uint256 _monto) external onlyVotacion`: Realiza el desembolso a la wallet receptora aprobada.

### 2.2 `VotacionPropuestas.sol`
Contrato de gobernanza compatible con el estándar de metatransacciones **ERC-2771** (`ERC2771Context`).

- **Funciones Principales:**
  - `crearPropuesta(string memory _nombre, string memory _descripcion, uint256 _monto, address _receptora, TipoPropuesta _tipo)`
  - `firmarAval(uint256 _id) external onlyDirectivo`: Registra la firma de respaldo de los miembros de la Junta Directiva.
  - `votar(uint256 _id, TipoVoto _voto) external onlySocio`: Procesa el voto emitido directamente o mediante metatransacción.
  - `ejecutarPropuesta(uint256 _id) external onlyDirectivo`: Comprueba la aprobación y activa la transferencia en la tesorería de `CooperativaCappones.sol`.

### 2.3 `MinimalForwarder.sol`
Implementación estándar EIP-2771 para metatransacciones gasless.

- **Estructura `ForwardRequest`:**
  - `address from`: Dirección del socio emisor.
  - `address to`: Contrato objetivo (`VotacionPropuestas`).
  - `uint256 value`: Valor en wei (0 para votos).
  - `uint256 gas`: Límite de gas.
  - `uint256 nonce`: Anti-replay nonce.
  - `bytes data`: Payload codificado de la función `votar(...)`.

---

## 3. Seguridad y Autenticación Backend

1. **Firma Criptográfica (SIWE / EIP-191):**
   Cada petición a `/api/auth` requiere la verificación de la firma digital con `ethers.verifyMessage(mensaje, signature)` para autenticar la propiedad de la wallet.
2. **Segundo Factor de Autenticación (2FA TOTP):**
   Los miembros de la Junta Directiva poseen un secreto TOTP cifrado en PostgreSQL. Las acciones de creación de propuestas y firmas de avales exigen la validación con `speakeasy.totp.verify`.
3. **Control Anti-Replay en Relayer:**
   En `/api/relay`, el servidor verifica la firma en `MinimalForwarder` y consulta el nonce actual del usuario antes de enviar la transacción pagada por el admin signer.

---

## 4. Orquestación Docker Compose

El sistema opera en un stack multi-contenedor definido en `docker-compose.yml`:

| Contenedor | Imagen Base | Puerto Interno | Puerto Host | Función |
|---|---|---|---|---|
| `cooperativa-postgres` | `postgres:16-alpine` | `5432` | `5432` | Base de Datos relacional |
| `cooperativa-anvil` | `ghcr.io/foundry-rs/foundry` | `8545` | `8545` | Nodo blockchain local y script autodeploy |
| `cooperativa-web` | `node:20-alpine` (Production) | `3000` | `3000` | Frontend y API Routes compilados |
