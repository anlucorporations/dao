# 🛠️ Manual Técnico y Arquitectura del Sistema — DAO Gasless EIP-2771

Este documento contiene las especificaciones técnicas de la arquitectura, Smart Contracts, relayer EIP-2771, frontend Next.js 15 y el despliegue en Google Cloud Run.

---

## 1. Arquitectura General

La plataforma está estructurada en 4 capas de arquitectura desacopladas:

1. **Capa de Contratos Inteligentes (Solidity / Foundry)**:
   - `MinimalForwarder.sol`: Verificador de firmas EIP-712 y ejecutor de meta-transacciones.
   - `DAOVoting.sol`: Contrato de gobernanza que hereda de `ERC2771Context`.
2. **Capa Frontend (Next.js 15 App Router & React 19)**:
   - Renderizado dinámico, TailwindCSS, ethers.js v6.
   - Guardias de acceso (`DashboardAccessGuard.tsx`) y componentes modulares de gobernanza.
3. **Capa de Relayer & API Serverless**:
   - `/api/relay`: Endpoint de Next.js que recibe firmas EIP-712, verifica el nonce y transmite la transacción pagando la comisión de gas.
   - `/api/daemon`: Proceso automatizado en segundo plano para la verificación y ejecución de propuestas aprobadas.
4. **Capa de Infraestructura**:
   - **Local**: Nodo Anvil local (`http://127.0.0.1:8545`, ChainId `31337`).
   - **Nube**: Google Cloud Run (Contenedor Serverless Node 20 Alpine).

---

## 2. Reglas de Gobernanza en Smart Contracts (DAOVoting.sol)

- **Membresía**: Requiere `registerMember{value: 3 ether}()`.
- **Cierre Anticipado o por Plazo**: La votación finaliza al cumplirse el plazo `votingDeadline` **O** de forma anticipada cuando el **100% de los socios registrados** (`memberCount`) han emitido su voto (`forVotes + againstVotes + abstainVotes >= memberCount`).
- **Aprobación por Mayoría Simple**: La propuesta se aprueba si los votos A Favor superan a los votos En Contra (`forVotes > againstVotes`) y no ganó la abstención.
- **Repechaje por Mayoría de Abstención**:
  - Si la abstención es la opción con mayor número de votos (`abstainVotes > forVotes && abstainVotes > againstVotes`):
    - **1er Periodo**: Se habilita la activación de un **segundo periodo de votación (repechaje)** por un plazo adicional.
    - **2º Periodo**: Si en la segunda votación la abstención vuelve a ganar por mayoría, la propuesta queda definitivamente **RECHAZADA** (`rejected = true`).
- **Sender Contextual**: Utiliza `_msgSender()` provisto por `ERC2771Context` para extraer la dirección del socio original en meta-transacciones EIP-712.

---

## 3. Pruebas Automatizadas (Foundry Test Suite)

La suite de pruebas contiene **12 pruebas unitarias e integración** pasadas con 100% de éxito:
```bash
forge test
```
Resultados:
- `testRegisterMemberSuccess()` (PASS)
- `testRegisterMemberFailsAlreadyRegistered()` (PASS)
- `testCreateProposalSuccess()` (PASS)
- `testVoteFor()` (PASS)
- `testVoteFailsIfAlreadyVoted()` (PASS)
- `testVotingFinishesWhenAllMembersVote()` (PASS)
- `testSecondVotingPeriodOnAbstentionMajority()` (PASS)
- `testProposalRejectedIfAbstentionWinsSecondPeriod()` (PASS)
- `testMetaTransactionCreateProposal()` (PASS)
- `testExecuteApprovedProposal()` (PASS)

---

## 4. Comandos de Inicialización Local

```bash
# 1. Iniciar nodo Anvil
cd sc
anvil

# 2. Desplegar contratos e inscribir owner (3 ETH)
forge script script/Deploy.s.sol:DeployScript --rpc-url http://127.0.0.1:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# 3. Iniciar Frontend Web
cd ../web
npm run dev
```
