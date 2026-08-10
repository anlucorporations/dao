# 🌐 DAO Voting Platform — Gobernanza Descentralizada Gasless (EIP-2771 & EIP-712)

---

> ### 📢 Publicación Destacada para LinkedIn
>
> 🚀 **¡Revolucionando la Gobernanza Web3: Presento mi plataforma DAO con Votación 100% Gasless (EIP-2771 & EIP-712)!** 🌐⚡
>
> Uno de los mayores obstáculos en el uso de Organizaciones Autónomas Descentralizadas (DAOs) son los altos costos de gas y la mala experiencia de usuario al confirmar transacciones complejas. 
>
> Para resolver este desafío, he desarrollado una plataforma integral de **Gobernanza Descentralizada y Gestión de Tesorería**, que permite a los usuarios crear propuestas y emitir sus votos de forma completamente **gratuita y transparente (Gasless)** mediante firmas digitales estructuradas.
>
> ---
>
> #### 🌟 Características Principales del Proyecto:
> 1. ⚡ **Experiencia de Voto Sin Gas (Gasless Meta-Transactions)**: Los socios firman autorizaciones off-chain mediante **EIP-712** sin gastar Ether. Un servicio **Relayer EIP-2771** transmite la transacción a la blockchain pagando las comisiones de red por el usuario.
> 2. 👁️ **Firmas Transparentes y Legibles en MetaMask**: A diferencia de las firmas opacas habituales, el contrato `MinimalForwarder` muestra mensajes en texto claro (`Acción: 🗳️ Emisión de Voto | Detalles: Propuesta #1 | 👍 A FAVOR`) garantizando seguridad contra phishing.
> 3. 🗳️ **Gobernanza Avanzada & Repechaje**:
>    - ⚡ **Cierre Inmediato por Unanimidad (100%)**: Si todos los socios registrados aprueban una propuesta, esta concluye de forma automática sin esperar la fecha límite.
>    - ⚖️ **2º Periodo de Votación (Repechaje)**: Si la opción de Abstención resulta ganadora por mayoría, la DAO activa una ventana de desempate de 3 días antes de rechazarla.
>    - 🔒 **Ejecución Manual Exclusiva del Owner**: Protección criptográfica on-chain para que la liquidación y desembolso de fondos de tesorería sean autorizados por la wallet del Administrador.
> 4. 🔔 **Centro de Notificaciones en Vivo**: Menú interactivo en el header con contador de alertas on-chain para cierres de votación, unanimidades y aperturas de repechaje.
> 5. 📊 **Histórico Metodológico & Control de Sistema**: Indicadores cuantitativos del total de ETH desembolsado e inspección en tiempo real de los saldos de cada contrato inteligente desplegado.
>
> ---
>
> #### 🛠️ Stack Tecnológico & Arquitectura:
> - **Smart Contracts & Blockchain**:
>   - `Solidity ^0.8.19` | `OpenZeppelin (ERC2771Context, ECDSA)`
>   - `Foundry (forge, anvil)` | **13/13 Unit Tests aprobados (100% Coverage)** 🧪
>   - Estándares `EIP-2771` (Trusted Forwarder) y `EIP-712` (Typed Structured Data).
> - **Frontend & Web3 UX**:
>   - `Next.js 15 (App Router & Turbopack)` | `React 19` | `TypeScript`
>   - `TailwindCSS (Diseño Glassmorphism & Dark Mode)` | `ethers.js v6`
> - **Backend & Cloud Infrastructure**:
>   - `Serverless API Routes (/api/relay, /api/notifications)` con cerrojo de concurrencia anti-replay attacks.
>   - `Google Cloud Run` (Contenedor Serverless Docker Node 20 Alpine).
>
> ---
>
> 💡 *La tecnología Blockchain no solo trata de descentralización, sino de crear interfaces accesibles, seguras y de impacto real para los usuarios.*
>
> **#Web3 #Ethereum #Solidity #Nextjs #SmartContracts #Blockchain #Foundry #OpenZeppelin #Gasless #DecentralizedGovernance #CloudRun**

---

## 📋 Tabla de Contenidos

1. [Descripción y Arquitectura del Sistema](#-descripción-y-arquitectura-del-sistema)
2. [Lógica Negocial de Smart Contracts (DAOVoting.sol)](#-lógica-negocial-de-smart-contracts-daovotingsol)
3. [Ecosistema de Meta-Transacciones (MinimalForwarder.sol & EIP-712)](#-ecosistema-de-meta-transacciones-minimalforwardersol--eip-712)
4. [Herramientas Principales & Stack Tecnológico](#-herramientas-principales--stack-tecnológico)
5. [Mejoras del Frontend & Experiencia de Usuario (UI/UX)](#-mejoras-del-frontend--experiencia-de-usuario-uiux)
6. [Estructura del Proyecto](#-estructura-del-proyecto)
7. [⚙️ GUÍA DETALLADA DE DESPLIEGUE (Local, Testnet y Cloud Run)](#️-guía-detallada-de-despliegue-local-testnet-y-cloud-run)
   - [7.1 Despliegue Entorno Local (Anvil + Next.js 15)](#71-despliegue-entorno-local-anvil--nextjs-15)
   - [7.2 Despliegue en Redes Testnet / Mainnet (Sepolia / Arbitrum)](#72-despliegue-en-redes-testnet--mainnet-sepolia--arbitrum)
   - [7.3 Despliegue en la Nube (Google Cloud Run / Docker)](#73-despliegue-en-la-nube-google-cloud-run--docker)
8. [Batería de Pruebas Automatizadas (Foundry)](#-batería-de-pruebas-automatizadas-foundry)
9. [Documentación Complementaria (`./docs`)](#-documentación-complementaria-docs)

---

## 🏗️ Descripción y Arquitectura del Sistema

La **DAO Voting Platform** es una solución empresarial de gobernanza cooperativa construida sobre tecnología EVM que resuelve el problema de la alta fricción por comisiones de gas en transacciones blockchain.

El sistema utiliza una arquitectura modular de 4 capas:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 15 / React 19)                │
│   • Dashboard General   • Centro de Votación   • Menú Notificaciones   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Firmas EIP-712
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        RELAYER BACKEND API (/api/relay)                │
│   • Cerrojo anti-replay   • Validación de Nonces   • Owner Gas Sponsor │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Transmisión de Transacciones
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    SMART CONTRACTS (MinimalForwarder & DAOVoting)      │
│   • EIP-712 Typed Data   • ERC2771Context   • Tesorería ETH          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ⚖️ Lógica Negocial de Smart Contracts (`DAOVoting.sol`)

- **Membresía por Cuota Fija (3.0 ETH)**:
  - Todo usuario debe depositar exactamente 3.0 ETH a través de `registerMember()` para obtener la certificación de socio de la DAO.
- **Umbral de Creación del 10% (`PROPOSAL_CREATION_THRESHOLD`)**:
  - Para evitar propuestas no fundamentadas, el creador debe poseer al menos el **10% del balance total depositado en la tesorería de la DAO** (`balances[sender] * 100 >= totalDeposited * 10`).
- **Cierre Anticipado por Unanimidad del 100%**:
  - Si el 100% de los socios inscritos en la DAO votan a favor (`memberCount > 0 && forVotes == memberCount`), el periodo de votación concluye de inmediato.
- **Segunda Votación / Repechaje en Caso de Abstención**:
  - Si la opción de Abstención obtiene la mayoría de votos (`abstainVotes > forVotes && abstainVotes > againstVotes`), el contrato activa un **2º Periodo de Votación (Repechaje)** de 3 días. Si la abstención gana nuevamente en el 2º periodo, la propuesta queda definitivamente **RECHAZADA** (`rejected = true`).
- **Ejecución Manual Exclusiva del Owner**:
  - La función `executeProposal(uint256)` está restringida criptográficamente mediante `require(_msgSender() == owner)`. 
  - Si la propuesta fue aprobada por unanimidad del 100%, el tiempo de retardo `executionDelay` (1 día) se omite, permitiendo la ejecución manual inmediata por el Owner.

---

## 🛡️ Ecosistema de Meta-Transacciones (`MinimalForwarder.sol` & EIP-712)

- **MinimalForwarder.sol**:
  - Implementa el estándar **EIP-712 (Typed Structured Data Hashing)** con verificador ECDSA.
  - Campos enriquecidos para transparencia visual: `from`, `to`, `value`, `gas`, `nonce`, `accion`, `detalles`, `data`.
- **Sender Contextual**:
  - `DAOVoting.sol` hereda de `ERC2771Context`, extrayendo la dirección pública del socio original a través de `_msgSender()`.
- **Owner como Patrocinador Relayer**:
  - La wallet del Owner (`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`) asume los costos de gas al transmitir las peticiones desde el endpoint `/api/relay`.

---

## 🛠️ Herramientas Principales & Stack Tecnológico

| Dominio | Herramientas Utilizadas | Descripción |
| :--- | :--- | :--- |
| **Smart Contracts** | `Solidity ^0.8.19`, `Foundry`, `OpenZeppelin` | Desarrollo de contratos, compilación y suite de pruebas unitarias. |
| **Estándares Web3** | `EIP-2771`, `EIP-712`, `ERC2771Context` | Meta-transacciones gasless y firmas estructuradas de texto claro. |
| **Frontend Framework** | `Next.js 15 (App Router)`, `Turbopack`, `React 19` | Renderizado rápido, routing dinámico y Server Components. |
| **Librería Blockchain** | `ethers.js v6` | Interacción con MetaMask, proveedores RPC y codificación ABI. |
| **Estilos & UI** | `TailwindCSS`, `Vanilla CSS` | Diseño futurista con efectos Glassmorphism y temas oscuros. |
| **Lenguaje** | `TypeScript` (Estricto `tsc --noEmit`) | Tipado estático completo de DTOs, ABI interfaces y props. |
| **Infraestructura Cloud** | `Google Cloud Run`, `Docker Node 20 Alpine` | Despliegue de producción serverless escalable. |

---

## 🎨 Mejoras del Frontend & Experiencia de Usuario (UI/UX)

1. **🔔 Menú de Notificaciones de Gobernanza en Vivo**:
   - Menú desplegable en el header con campana interactiva y contador de alertas no leídas para cierres de votación, aprobaciones unánimes y aperturas de repechaje.
2. **📊 Histórico Global con Cuadro Resumen Metodológico**:
   - Tarjetas métricas en el encabezado de `/dashboard/proposals` con Total de Creadas, Concluidas, Aprobadas/Ejecutadas con suma de ETH desembolsado, Rechazadas y En Abstención.
3. **⚙️ Saldos Nativo de Contratos en Sección Sistema**:
   - Muestra en tiempo real los balances en ETH de `DAOVoting.sol` (Tesorería) y `MinimalForwarder.sol` en `/dashboard/system`.
4. **👁️ Mensajes Legibles EIP-712 en MetaMask**:
   - Vista previa transparente de los campos `accion` y `detalles` al firmar votaciones o creaciones de propuestas.
5. **🔒 Controles de Ejecución Basados en Roles**:
   - El botón **"🚀 Ejecutar Propuesta (Owner)"** se muestra únicamente cuando se conecta la wallet del Owner. Para socios convencionales se indica el badge `🔒 Ejecución reservada al Owner`.

---

## 📁 Estructura del Proyecto

```
.
├── sc/                              # Smart contracts (Foundry)
│   ├── src/
│   │   ├── DAOVoting.sol            # Contrato principal de gobernanza (ERC2771Context)
│   │   └── MinimalForwarder.sol     # Forwarder EIP-712
│   ├── test/
│   │   └── DAOVoting.t.sol          # Suite de 13 pruebas unitarias (100% PASS)
│   └── script/
│       └── Deploy.s.sol             # Script de despliegue en Anvil / Testnet
│
├── web/                             # Aplicación Next.js 15 Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/relay/           # Endpoint Relayer Gasless (POST)
│   │   │   ├── api/notifications/   # API de Notificaciones de Gobernanza (GET)
│   │   │   ├── api/system/status/   # Monitor de Saldos en ETH de Contratos (GET)
│   │   │   ├── api/system/members/  # Inspector de Membresías de Socios (GET)
│   │   │   └── dashboard/           # Secciones (Proposals, Voting, Treasury, System)
│   │   ├── components/              # Componentes UI (NotificationsMenu, ProposalHistory, etc.)
│   │   └── lib/                     # Utilities (metaTx.ts, daoHelpers.ts, contracts.ts)
│   └── Dockerfile                   # Dockerfile Node 20 Alpine multi-stage build
│
└── docs/                            # Documentación exhaustiva técnica y de usuario
    ├── MANUAL_TECNICO.md
    ├── MANUAL_USUARIO_PLATAFORMA.md
    ├── DICCIONARIO_DE_DATOS.md
    ├── CASOS_DE_USO_Y_DIAGRAMAS.md
    └── api/DOCUMENTACION_API.md
```

---

## ⚙️ GUÍA DETALLADA DE DESPLIEGUE (Local, Testnet y Cloud Run)

### 7.1 Despliegue Entorno Local (Anvil + Next.js 15)

#### Paso 1: Iniciar el Nodo Anvil Blockchain
Abre la primera terminal e inicia Anvil:
```bash
cd sc
anvil
```
*Anvil genera 10 cuentas privadas con 10,000 ETH cada una en `http://127.0.0.1:8545` (Chain ID `31337`).*

#### Paso 2: Desplegar Smart Contracts e Inscribir al Owner (3 ETH)
Abre la segunda terminal y ejecuta el script de Foundry:
```bash
cd sc
forge script script/Deploy.s.sol:DeployScript --rpc-url http://127.0.0.1:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```
*Resultado*:
- `MinimalForwarder`: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- `DAOVoting`: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- La wallet `#0` de Anvil se inscribe automáticamente depositando 3 ETH.

#### Paso 3: Configurar Variables de Entorno Web (`web/.env.local`)
Asegúrate de que `web/.env.local` contenga los valores del despliegue:
```env
# Direcciones públicas de contratos inteligentes
NEXT_PUBLIC_DAO_CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_FORWARDER_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Dirección del Owner (Cuenta #0 Anvil)
NEXT_PUBLIC_OWNER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Patrocinador Relayer (Owner)
RELAYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
RELAYER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Nodo Blockchain RPC
RPC_URL=http://127.0.0.1:8545
```

#### Paso 4: Iniciar Servidor Web Next.js 15
Abre la tercera terminal e inicia el servidor en desarrollo:
```bash
cd web
npm run dev
```
Navega a **[http://localhost:3000](http://localhost:3000)**.

---

### 7.2 Despliegue en Redes Testnet / Mainnet (Sepolia / Arbitrum)

Para desplegar en una red pública de prueba como **Sepolia**:

1. **Configurar claves y RPC en `sc/.env`**:
   ```env
   PRIVATE_KEY=0x_tu_clave_privada_con_sepolia_eth
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/TU_API_KEY
   ETHERSCAN_API_KEY=TU_API_KEY_ETHERSCAN
   ```

2. **Ejecutar Despliegue y Verificación On-Chain**:
   ```bash
   cd sc
   forge script script/Deploy.s.sol:DeployScript \
     --rpc-url $SEPOLIA_RPC_URL \
     --broadcast \
     --verify \
     --etherscan-api-key $ETHERSCAN_API_KEY \
     --private-key $PRIVATE_KEY
   ```

3. **Actualizar `web/.env.local`** con las nuevas direcciones asignadas en Sepolia y compilar la versión de producción:
   ```bash
   cd web
   npm run build
   ```

---

### 7.3 Despliegue en la Nube (Google Cloud Run / Docker)

El proyecto incluye un contenedor Docker multi-stage optimizado (`web/Dockerfile`).

#### Paso 1: Construcción de la Imagen Docker
```bash
cd web
docker build -t gcr.io/TU_PROJECT_ID_GCP/dao-web:v2.2.0 .
```

#### Paso 2: Subida al Registro de Contenedores de GCP
```bash
docker push gcr.io/TU_PROJECT_ID_GCP/dao-web:v2.2.0
```

#### Paso 3: Despliegue en Google Cloud Run
```bash
gcloud run deploy dao-app \
  --image gcr.io/TU_PROJECT_ID_GCP/dao-web:v2.2.0 \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_DAO_CONTRACT_ADDRESS="0x...",NEXT_PUBLIC_FORWARDER_CONTRACT_ADDRESS="0x...",RPC_URL="https://sepolia.infura.io/v3/...",RELAYER_PRIVATE_KEY="0x..."
```

---

## 🧪 Batería de Pruebas Automatizadas (Foundry)

Para ejecutar la suite de pruebas unitarias y de integración:

```bash
cd sc
forge test
```

### Resultados de Ejecución:
```
Ran 13 tests for test/DAOVoting.t.sol:DAOVotingTest
[PASS] testCreateProposalFailsForNonMember()
[PASS] testCreateProposalFailsInsufficientBalanceThreshold()
[PASS] testCreateProposalSuccess()
[PASS] testExecuteApprovedProposalUnanimous()
[PASS] testMetaTransactionCreateProposal()
[PASS] testProposalRejectedIfAbstentionWinsSecondPeriod()
[PASS] testRegisterMemberFailsAlreadyRegistered()
[PASS] testRegisterMemberFailsWrongEth()
[PASS] testRegisterMemberSuccess()
[PASS] testSecondVotingPeriodOnAbstentionMajority()
[PASS] testVoteFailsIfAlreadyVoted()
[PASS] testVoteFor()
[PASS] testVotingFinishesWhenAllMembersVote()
Suite result: ok. 13 passed; 0 failed; 0 skipped
```

---

## 📄 Documentación Complementaria (`./docs`)

- [`MANUAL_TECNICO.md`](file:///c:/Users/lucci/MasterCodeCripto/GitLab/dao-mcc/docs/MANUAL_TECNICO.md): Arquitectura detallada, parámetros de contratos y despliegue.
- [`MANUAL_USUARIO_PLATAFORMA.md`](file:///c:/Users/lucci/MasterCodeCripto/GitLab/dao-mcc/docs/MANUAL_USUARIO_PLATAFORMA.md): Guía de usuario para socios y administrador.
- [`DOCUMENTACION_API.md`](file:///c:/Users/lucci/MasterCodeCripto/GitLab/dao-mcc/docs/api/DOCUMENTACION_API.md): Especificación de endpoints HTTP `/api/relay`, `/api/notifications`, etc.
- [`DICCIONARIO_DE_DATOS.md`](file:///c:/Users/lucci/MasterCodeCripto/GitLab/dao-mcc/docs/DICCIONARIO_DE_DATOS.md): Esquemas de Solidity y tipos TypeScript DTO.
- [`CASOS_DE_USO_Y_DIAGRAMAS.md`](file:///c:/Users/lucci/MasterCodeCripto/GitLab/dao-mcc/docs/CASOS_DE_USO_Y_DIAGRAMAS.md): Diagramas de secuencia en Mermaid.

---

## 📝 Licencia

Este proyecto está bajo la Licencia **MIT**.
