# Plan de Trabajo: Finalización de la Plataforma DAO Los Cappones y Despliegue Local en Docker (Foundry + Anvil)

Este plan de trabajo detalla la ruta de ejecución técnica para solucionar las discrepancias identificadas en los contratos y la API, finalizar el desarrollo web y empaquetar toda la plataforma en una arquitectura totalmente containerizada con **Docker Compose**, impulsada por un nodo local de **Foundry (Anvil)**, una base de datos **PostgreSQL** y la app en **Next.js** en modo producción.

---

## User Decisions & Confirmed Requirements

> [!IMPORTANT]
> **Configuración del SuperUsuario ('anlu'):**
> Se registrará al usuario principal `anlu` con acceso total en todas las capas del sistema:
> - **Nombre:** `anlu`
> - **Cédula:** `V-12533620`
> - **Correo:** `anlucorporations@gmail.com`
> - **Wallet (Anvil #9):** `0xa0Ee7A142d267C1f36714E4a8F75612F20a79720`
> - **Private Key (Anvil #9):** `0x2a871d0798f97d796df285775602922437370edd16347100108392d40b03220a`
> - **Cargo:** Owner de Contratos & Presidenta/Directora Principal en el seed.
> - **Credenciales de PostgreSQL:** `POSTGRES_USER=anlucorporations`, `POSTGRES_PASSWORD=KeLuDa.2324`, `POSTGRES_DB=cooperativa_cappones`.
> 
> **Build de Producción:**
> La aplicación web se compilará y ejecutará en modo **Producción (`next build` + `next start`)** dentro del contenedor Docker.

---

## Proposed Changes

### 1. Smart Contracts & Scripting

#### [MODIFY] [CooperativaCappones.sol](file:///c:/Users/lucci/MasterCodeCripto/GitLab/dao/contracts/src/CooperativaCappones.sol) & [VotacionPropuestas.sol](file:///c:/Users/lucci/MasterCodeCripto/GitLab/dao/contracts/src/VotacionPropuestas.sol)
- Vincular los fondos recaudados en `CooperativaCappones` con la autorización de ejecución en `VotacionPropuestas`.
- Configurar el constructor para aceptar la wallet de `anlu` (`0xa0Ee7A142d267C1f36714E4a8F75612F20a79720`) como el `owner` inicial.

#### [MODIFY] [DeployLocal.s.sol](file:///c:/Users/lucci/MasterCodeCripto/GitLab/dao/contracts/script/DeployLocal.s.sol)
- Usar la Private Key #9 (`0x2a871d0798f97d796df285775602922437370edd16347100108392d40b03220a`) como `deployerPrivateKey` para que `anlu` sea el desplegador y propietario único.
- Exportar un archivo JSON/env de salida (`deployments/local.json` / `.env.contracts`) con las direcciones desplegadas (`Forwarder`, `ActaRegistry`, `Cooperativa`, `Votacion`).

---

### 2. Infraestructura Docker & Orquestación

#### [MODIFY] [docker-compose.yml](file:///c:/Users/lucci/MasterCodeCripto/GitLab/dao/docker-compose.yml)
- Configurar las credenciales de PostgreSQL: `POSTGRES_USER=anlucorporations` y `POSTGRES_PASSWORD=KeLuDa.2324`.
- Integrar servicios `postgres`, `anvil` (ejecutando Anvil y desplegando contratos como `anlu`), y `web` (Next.js compilado en producción).

#### [NEW] [Dockerfile](file:///c:/Users/lucci/MasterCodeCripto/GitLab/dao/web/Dockerfile)
- Crear Dockerfile multi-stage optimizado para Next.js en producción (`npm run build` -> `npm run start`).

#### [NEW] [Dockerfile.anvil](file:///c:/Users/lucci/MasterCodeCripto/GitLab/dao/contracts/Dockerfile.anvil) y [docker-entrypoint.sh](file:///c:/Users/lucci/MasterCodeCripto/GitLab/dao/contracts/docker-entrypoint.sh)
- Contenedor para ejecutar el nodo Anvil local y desplegar los contratos inteligentes firmado por la cuenta de `anlu`.

---

### 3. Aplicación Web y Base de Datos

#### [MODIFY] [schema.prisma](file:///c:/Users/lucci/MasterCodeCripto/GitLab/dao/web/prisma/schema.prisma) & [seed.ts](file:///c:/Users/lucci/MasterCodeCripto/GitLab/dao/web/prisma/seed.ts)
- Registrar en la base de datos a `anlu` (`V-12533620`, `anlucorporations@gmail.com`, wallet `0xa0Ee7A142d267C1f36714E4a8F75612F20a79720`) como Socio Fundador y Directivo con cargo `PRESIDENTE`.
- Poblar los demás cargos directivos con las cuentas Anvil 0 a 3.

#### [MODIFY] [constants.ts](file:///c:/Users/lucci/MasterCodeCripto/GitLab/dao/web/src/lib/constants.ts) & [ethers.ts](file:///c:/Users/lucci/MasterCodeCripto/GitLab/dao/web/src/lib/ethers.ts)
- Configurar la red `ANVIL` (`http://localhost:8545`, Chain ID `31337`).
- Conectar la API web a PostgreSQL con `DATABASE_URL=postgresql://anlucorporations:KeLuDa.2324@postgres:5432/cooperativa_cappones?schema=public`.

---

### 4. Automatización y Control

#### [MODIFY] [Makefile](file:///c:/Users/lucci/MasterCodeCripto/GitLab/dao/Makefile)
- Actualizar comandos `db-up`, `db-migrate` y agregar `local-up`, `local-down`, `local-logs` alineados a las nuevas credenciales de `anlucorporations`.

---

## Verification Plan

### Automated Tests
1. **Compilación y Tests de Contratos**:
   ```bash
   cd contracts && forge test
   ```
2. **Pruebas de TypeScript / Typecheck en Web**:
   ```bash
   cd web && npm run typecheck
   ```

### Manual Verification
1. **Levantar Entorno Docker**:
   ```bash
   docker compose up --build
   ```
2. **Verificar Servicios en Ejecución**:
   - PostgreSQL con usuario `anlucorporations` en `localhost:5432`.
   - Nodo Anvil en `http://localhost:8545`.
   - Web en `http://localhost:3000` ejecutando producción.
3. **Flujo de Usuario en MetaMask**:
   - Importar la Private Key #9 de Anvil (`0x2a87...`) en MetaMask.
   - Verificar ingreso a la plataforma web como `anlu` con rol SuperUsuario/Presidente y ownership de contratos.
