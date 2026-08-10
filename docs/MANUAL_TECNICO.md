# 🛠️ Manual Técnico y Arquitectura del Sistema — DAO Gasless EIP-2771

Este documento contiene las especificaciones técnicas completas de la arquitectura, Smart Contracts, relayer EIP-2771, sistema de notificaciones, frontend Next.js 15 y el despliegue en producción.

---

## 1. Arquitectura General del Sistema

La plataforma está estructurada en 4 capas de arquitectura totalmente desacopladas y seguras:

1. **Capa de Contratos Inteligentes (Solidity ^0.8.13 / Foundry)**:
   - [`MinimalForwarder.sol`](file:///c:/Users/lucci/MasterCodeCripto/GitLab/dao-mcc/sc/src/MinimalForwarder.sol): Verificador de firmas EIP-712 y transmisor de meta-transacciones.
   - [`DAOVoting.sol`](file:///c:/Users/lucci/MasterCodeCripto/GitLab/dao-mcc/sc/src/DAOVoting.sol): Contrato de gobernanza descentralizada que hereda de `ERC2771Context`. Incluye gestión de socios (3 ETH), votación por mayoría simple, repechaje por mayoría de abstención, cierre inmediato por unanimidad (100%) y ejecución manual reservada exclusivamente al Owner.

2. **Capa Frontend (Next.js 15 App Router & React 19)**:
   - Renderizado dinámico con Turbopack, TailwindCSS y `ethers.js` v6.
   - Muro de inscripción y guardias de acceso (`DashboardAccessGuard.tsx`).
   - Mapeo completo de propuestas en tiempo real con tarjetas estadísticas (`ProposalHistory.tsx`).
   - Menú interactivo de notificaciones en encabezado (`NotificationsMenu.tsx`).

3. **Capa de Relayer & API Serverless**:
   - `POST /api/relay`: Endpoint de Next.js que procesa solicitudes EIP-712 firmadas, verifica nonces anti-replay y transmite transacciones en la red pagando la comisión de gas (Owner como patrocinador relayer).
   - `GET /api/notifications`: Endpoint que escanea eventos on-chain de gobernanza para notificar conclusión de votaciones, logros de unanimidad 100% y aperturas de 2º periodo.
   - `GET /api/system/status`: Consulta el estado global, saldos en ETH de contratos desplegados (`DAOVoting.sol` y `MinimalForwarder.sol`) y del patrocinador relayer.
   - `GET /api/system/members`: Inspector criptográfico de membresías y saldos de socios.
   - `GET /api/daemon`: Proceso automatizado en segundo plano para verificación de propuestas.

4. **Capa de Infraestructura**:
   - **Entorno Local**: Nodo Anvil local (`http://127.0.0.1:8545`, ChainId `31337`).
   - **Nube**: Google Cloud Run (Contenedor Serverless Node 20 Alpine).

---

## 2. Reglas Técnicas de Gobernanza en Smart Contracts (`DAOVoting.sol`)

- **Membresía**: Requiere `registerMember{value: 3 ether}()`.
- **Propietario / Owner**: El desplegador del contrato (`owner = msg.sender`) es registrado como Owner del contrato.
- **Cierre de Votación**:
  - Expiración del plazo `votingDeadline`.
  - **Cierre Inmediato por Unanimidad del 100%**: Si el 100% de los socios inscritos aprueban por unanimidad (`forVotes == memberCount`), la votación se da por concluida inmediatamente.
- **Ejecución Manual Exclusiva del Owner**:
  - La función `executeProposal(uint256 _proposalId)` está protegida por `require(_msgSender() == owner, "Solo el Owner de la DAO esta autorizado para ejecutar propuestas manualmente")`.
  - Para propuestas aprobadas por unanimidad (100%), el plazo de retardo `executionDelay` se omite, permitiendo al Owner la ejecución manual inmediata.
  - Para propuestas aprobadas por mayoría simple, se requiere el transcurso del tiempo de retardo `executionDelay` (1 día).
- **Repechaje por Mayoría de Abstención**:
  - Si la abstención gana por mayoría (`abstainVotes > forVotes && abstainVotes > againstVotes`):
    - **1er Periodo**: Habilita la activación del 2º periodo de votación (repechaje).
    - **2º Periodo**: Si la abstención vuelve a ganar por mayoría, la propuesta queda definitivamente **RECHAZADA** (`rejected = true`).

---

## 3. Pruebas Automatizadas (Foundry Test Suite)

La suite de pruebas en Foundry cuenta con **12 pruebas unitarias e integración** completadas con un 100% de éxito (`forge test`):

```bash
Ran 12 tests for test/DAOVoting.t.sol:DAOVotingTest
[PASS] testCreateProposalFailsForNonMember()
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
```

---

## 4. Inicialización y Despliegue Local

```bash
# 1. Iniciar Nodo Anvil Blockchain
cd sc
anvil

# 2. Desplegar Smart Contracts e inscribir Owner (3 ETH)
forge script script/Deploy.s.sol:DeployScript --rpc-url http://127.0.0.1:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# 3. Iniciar Servidor Web Next.js 15
cd ../web
npm run dev
```

Acceso web: `http://localhost:3000`
