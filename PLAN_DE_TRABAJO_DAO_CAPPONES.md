# PLAN DE TRABAJO DETALLADO — DAO "LOS CAPPONES"

**Versión:** 1.0  
**Fecha:** 2025  
**Estado:** Pendiente de aprobación  
**Objetivo:** Llevar el prototipo de estado "no apto para producción" a "listo para piloto controlado"

---

## 📋 TABLA DE CONTENIDOS

1. [Diagnóstico Ejecutivo](#diagnóstico-ejecutivo)
2. [Decisiones de Producto Requeridas](#decisiones-de-producto-requeridas)
3. [Fases de Ejecución](#fases-de-ejecución)
4. [Cronograma Tentativo](#cronograma-tentativo)
5. [Recursos y Dependencias](#recursos-y-dependencias)
6. [Criterios de Aceptación](#criterios-de-aceptación)
7. [Riesgos y Mitigación](#riesgos-y-mitigación)

---

## 🔍 DIAGNÓSTICO EJECUTIVO

### Estado Actual
- **Componentes:** 43 archivos; contratos compilables; BD y API parciales; **frontend faltante**
- **Control de versiones:** 1 commit inicial; cambios masivos sin registrar
- **Deuda técnica:** 9 problemas críticos; 6 decisiones de producto sin cerrar
- **Apto para:** Demostración técnica local
- **NO apto para:** Manejo de fondos, usuarios reales, producción

### Objetivo Final
Una cooperativa digital donde:
- Socios se registren con MetaMask
- Aporten capital inicial (2%) + adicional
- Postúlense a cargos directivos (votación gasless)
- Creen y voten propuestas de inversión/administrativas
- Ejecuten transferencias automáticas si es aprobado
- Todo auditado en blockchain (Polygon Amoy)

### Éxito = Criterio Mínimo
```bash
git clone <repo>
npm ci && npm run build && npm start
docker compose up -d
prisma db push
forge build && forge test
# → Aplicación usable en browser + contratos sin errores
```

---

## 🚪 DECISIONES DE PRODUCTO REQUERIDAS

**Antes de codificar Fases 2-7, DEBES CERRAR estas 6 decisiones:**

### 1. Custodia de Fondos
**Pregunta:** ¿Dónde vive el capital aportado?

**Opciones:**
- **A)** Contrato único `Tesoreria.sol` (simple, centralizado)
- **B)** Multifirma 2-de-3 o 3-de-5 (seguro, lento)
- **C)** Custodia externa + registro blockchain (desacoplado)

**Recomendación:** **Opción A para testnet, Opción B para producción**

**Acción:** Decidir → Documentar en `DECISION_CUSTODIA.md`

---

### 2. Poder de Voto
**Pregunta:** ¿Cada socio tiene 1 voto o es ponderado?

**Opciones:**
- **A)** 1 socio = 1 voto (democracia directa)
- **B)** Voto ponderado por capital aportado (plutocratia suave)
- **C)** Voto + capital (sistema de puntos híbrido)

**Recomendación:** **Opción A (1 voto por socio)**

**Acción:** Decidir → Ajustar `VotacionPropuestas.sol` linea 180+

---

### 3. Inscripción: 2% del Capital
**Pregunta:** ¿Cómo se valida y cobra el 2% inicial?

**Opciones:**
- **A)** Aporte fijo en MATIC (ej: 0.01 MATIC en Amoy)
- **B)** Porcentaje del primer aporte (socio define monto, paga 2%)
- **C)** Aporte mínimo (ej: mín 1 MATIC, 2% queda bloqueado)

**Recomendación:** **Opción A (aporte fijo 0.01 MATIC en Amoy; real: 5 USDC en producción)**

**Acción:** Decidir → Codificar en `CooperativaCappones.registrarSocio()`

---

### 4. Gobernanza: Roles, Quórum, Duración
**Pregunta:** ¿Cómo se elige directiva, cuánto dura, quién ejecuta?

**Acuerdo Actual:**
- Cargos: Presidente, Vice, Secretario, Contralor, Contador
- Duración: 2 años
- Mínimo: 10% del capital para postularse
- Quórum: Mayoría simple en votación de propuestas

**Preguntas a Responder:**
- ¿Hay límite de mandatos consecutivos? (Recomendación: **SÍ, máx 2 mandatos**)
- ¿Quórum mínimo para decisiones? (Recomendación: **50% de socios activos**)
- ¿Quién ejecuta las propuestas aprobadas? (Recomendación: **Cualquier directivo**)
- ¿Puede el presidente postularse a sí mismo? (Actual: **NO** → cambiar a **SÍ con recusal**)

**Acción:** Cerrar respuestas → Actualizar contratos fase 2

---

### 5. Privacidad y Datos Personales
**Pregunta:** ¿Qué datos personales se guardan y quién los ve?

**Datos en BD (actual):**
- Cédula, nombre completo, sexo, fecha nacimiento, teléfono, correo, dirección, estado civil

**Decisiones Requeridas:**
- ¿Son todos públicos en blockchain o solo en BD? (Recomendación: **Solo BD, cifrados**)
- ¿Cuánto tiempo se retienen tras baja? (Recomendación: **90 días, luego anonimizar**)
- ¿Hay RGPD/LOPD compliance? (Recomendación: **Sí, auditoría legal**)
- ¿Dónde está el responsable de datos? (Acción: **Nombrar**)

**Acción:** Decisión legal → Documento de privacidad → Auditoría

---

### 6. Meta-transacciones Gasless
**Pregunta:** ¿Quién paga el gas de los votos?

**Opciones:**
- **A)** Relayer propio (pagamos gas, socios no pagan)
- **B)** Biconomy (tercero gestiona relayer, cobramos comisión)
- **C)** No hay gasless; socios pagan gas (simple, transparente)

**Recomendación:** **Opción A para MVP (relayer en backend)**

**Detalles:**
- El relayer (backend) firma transacciones en nombre del socio
- Socio firma con MetaMask: `mensaje = (propuestaId, voto, nonce, timestamp)`
- Backend verifica firma, recupera wallet, envía transacción vía `MinimalForwarder`
- Gas lo paga cuenta relayer; necesita 1 MATIC de reserva

**Acción:** Decidir → Implementar en Fase 3 → Test en Anvil local

**Acuerdo:** ¿Está bien pagarse gas de relayer desde tesorería? (Recomendación: **SÍ, 5% de saldo**)

---

## 📊 FASES DE EJECUCIÓN

### FASE 0 — Recuperar Línea Base Confiable
**Objetivo:** Repositorio limpio, versionado, reproducible  
**Duración:** 2-3 días  
**Responsable:** DevOps + Lead Dev

#### Tareas:
- [ ] **T0.1** — Crear rama `feature/cleanup-baseline`
  - Preservar estado actual en rama `backup/estado-inicial`
  - Revisar git history; documentar cada archivo eliminado en `DELETED_FILES.md`
  
- [ ] **T0.2** — Limpiar repositorio
  - Eliminar artefactos de compilación (`.next/`, `out/`, `node_modules/`)
  - Verificar `.gitignore` (ENV, contraseñas, claves privadas)
  - Crear `.env.example` sin secretos
  
- [ ] **T0.3** — Crear archivos base
  - `README.md` — Descripción, stack, quick start, prerrequisitos
  - `CONTRIBUTING.md` — Guía de desarrollo
  - `ARCHITECTURE.md` — Diagrama alto nivel (contratos → BD → API → Frontend)
  - `DECISION_LOG.md` — Registro de decisiones (incluir las 6 de arriba)
  
- [ ] **T0.4** — Validar reproducibilidad
  ```bash
  rm -rf node_modules contracts/lib
  npm ci
  cd contracts && forge install
  npm run build
  # Debe funcionar sin errores
  ```
  
- [ ] **T0.5** — Commit y etiqueta
  ```bash
  git add .
  git commit -m "Fase 0: Línea base limpia y documentada"
  git tag -a v0.1.0-baseline -m "Estado inicial aprobado"
  git push origin feature/cleanup-baseline
  ```

#### Entregables:
- ✅ Repositorio limpio sin cambios sin versionar
- ✅ `README.md` con comando `npm ci && npm run build && make db-up && make test` funcional
- ✅ 3 archivos de documentación base
- ✅ Rama `feature/cleanup-baseline` lista para merge a `main`

---

### FASE 1 — Especificación Ejecutable y Modelo de Seguridad
**Objetivo:** Cerrar ambigüedades; validar arquitectura; identificar ataques  
**Duración:** 5-7 días  
**Responsable:** Product Owner + Security Lead

#### Tareas:
- [ ] **T1.1** — Redactar casos de uso
  - Documento `CASOS_DE_USO.md`
    - Alta de socio (inscripción)
    - Aporte adicional
    - Postulación a cargo
    - Creación de propuesta
    - Aval y votación
    - Ejecución de transferencia
    - Retirada de socio
    - Recuperación de wallet
  - Cada caso: precondiciones, pasos, postcondiciones, errores
  
- [ ] **T1.2** — Definir máquinas de estado
  - **Socio:** PENDIENTE → ACTIVO → INACTIVO
  - **Propuesta:** BORRADOR → POR_DISCUTIR → {APROBADA, RECHAZADA, APELADA} → EJECUTADA
  - **Directivo:** CANDIDATO → ELECTO → ACTIVO → EXPIRADO/REMOVIDO
  - Documento: `STATE_MACHINES.md` (Mermaid diagrams)
  
- [ ] **T1.3** — Modelo de amenazas (STRIDE)
  - **S**poofing: ¿Puede suplantarse un socio sin MetaMask? → SÍ, relayer → MITIGAR: Firma EIP-191
  - **T**ampering: ¿Puede modificarse un voto en tránsito? → SÍ, si relayer es malicioso → MITIGAR: Verificación nonce
  - **R**epudiation: ¿Puede negar que votó? → NO, blockchain es inmutable → OK
  - **I**nfo Disclosure: ¿Se exponen datos personales? → SÍ, en BD → MITIGAR: Cifrado + ACL
  - **D**enial of Service: ¿Puede bloquearse la votación? → SÍ, si relayer cae → MITIGAR: Fallback manual
  - **E**levation of Privilege: ¿Puede un socio crear propuestas? → NO, solo directivo → OK
  - Matriz de riesgo: `THREAT_MODEL.md`
  
- [ ] **T1.4** — Diagrama de arquitectura
  - Archivo: `docs/ARQUITECTURA.md`
  - Componentes: Frontend (Next.js) → API (Next.js /api) → Relayer → Contratos (Polygon) ↔ BD (PostgreSQL)
  - Flujos: Registro, voto gasless, ejecución
  - Puntos de confianza: Relayer (centralizado), Polygon RPC (externo)
  
- [ ] **T1.5** — Definir contrato de integración
  - Documento: `API_BLOCKCHAIN_CONTRACT.md`
  - Mapeo UUID (BD) ↔ uint256 (blockchain)
  - Sincronización: ¿Qué es fuente de verdad? (Recomendación: Blockchain es inmutable, BD es caché + estado privado)
  - Consistencia eventual: Cómo recuperarse de desincronización
  - Transacciones atómicas: ¿Qué pasa si API actualiza BD pero transacción falla?
  
- [ ] **T1.6** — Especificación de seguridad
  - Archivo: `SECURITY_REQUIREMENTS.md`
  - Autenticación: Firma de mensaje (EIP-191) → sesión segura con httpOnly cookie
  - Autorización: RBAC (Socio, Directivo, Admin); permisos por endpoint
  - Datos sensibles: Correo, cédula cifrados; 2FA obligatorio para directivos
  - Rates: 10 req/min por IP; 100 req/min por usuario autenticado
  - Auditoría: Log de toda acción (crear propuesta, votar, ejecutar)
  
- [ ] **T1.7** — Cerrar decisiones de producto (6 arriba)
  - Crear archivo por cada decisión: `DECISION_CUSTODIA.md`, `DECISION_VOTO.md`, etc.
  - Formato: Problema → Opciones → Recomendación → **Decisión Tomada** ← **FIRMA AQUÍ**
  - Incluir: Implicaciones técnicas, costo, cronograma

#### Entregables:
- ✅ `CASOS_DE_USO.md` (7-10 casos detallados)
- ✅ `STATE_MACHINES.md` (diagramas Mermaid)
- ✅ `THREAT_MODEL.md` (matriz de riesgos STRIDE)
- ✅ `ARQUITECTURA.md` (diagrama componentes)
- ✅ `API_BLOCKCHAIN_CONTRACT.md` (mapeo e integración)
- ✅ `SECURITY_REQUIREMENTS.md` (políticas de autenticación, autorización, auditoría)
- ✅ 6 archivos `DECISION_*.md` firmados por Product Owner

#### Criterio de Cierre:
- Un desarrollador debe poder leer estos documentos y codificar Fase 2 sin preguntar

---

### FASE 2 — Reconstrucción y Aseguramiento de Contratos
**Objetivo:** Contratos compilables, auditables, alineados con decisiones  
**Duración:** 10-12 días  
**Responsable:** Lead Solidity + Security Auditor

#### Tareas:
- [ ] **T2.1** — Instalar y bloquear dependencias
  ```bash
  cd contracts
  forge install OpenZeppelin/openzeppelin-contracts@v5.0.0
  forge install foundry-rs/forge-std
  # Generar foundry.lock
  git add foundry.lock && git commit -m "Lock Solidity dependencies"
  ```
  
- [ ] **T2.2** — Rediseñar tesorería
  - **Nuevo contrato:** `Tesoreria.sol`
  - Responsabilidades:
    - Recibir aportes (solo propietario autoriza)
    - Ejecutar transferencias (solo `VotacionPropuestas` puede llamar)
    - Emitir eventos de auditoría
    - Saldo siempre >= 0 (safe math de OpenZeppelin)
  - Lógica:
    ```solidity
    contract Tesoreria {
        CooperativaCappones cooperativa;
        mapping(address => uint256) saldoSocios; // Transparencia personal
        uint256 saldoComun;
        
        function recibirAporte(address socio, uint256 monto) external onlyCooperativa {
            saldoComun += monto;
            saldoSocios[socio] += monto;
        }
        
        function ejecutarTransferencia(address destino, uint256 monto) external onlyVotacion {
            require(saldoComun >= monto);
            saldoComun -= monto;
            (bool ok, ) = destino.call{value: monto}("");
            require(ok, "Transfer failed");
        }
    }
    ```
  - Test: `Tesoreria.t.sol` (20+ casos)
  
- [ ] **T2.3** — Refactorizar `CooperativaCappones.sol`
  - Cambios:
    - ✏️ Registrar socio exige aporte inicial: `msg.value >= 0.01 ether` (Amoy)
    - ✏️ Acumulador de capital en `Tesoreria`, no en contrato
    - ✏️ Permitir presidente postularse con recusal (no vota por sí mismo)
    - ✏️ Máximo 2 mandatos consecutivos
    - ✏️ Quórum: 50% de socios activos para cerrar postulación
  - Agregar eventos de auditoría para cada acción
  - Refactor test suite (35+ tests)
  
- [ ] **T2.4** — Integrar `VotacionPropuestas` con `Tesoreria`
  - `ejecutarPropuesta()` debe:
    ```solidity
    function ejecutarPropuesta(uint256 _id) external onlyDirectivo {
        // ... validaciones ...
        tesoreria.ejecutarTransferencia(p.walletReceptora, p.monto);
        p.ejecutada = true;
    }
    ```
  - Test 10+ escenarios: fondos insuficientes, relayer no autorizado, etc.
  
- [ ] **T2.5** — Implementar bootstrap seguro
  - Nuevo función: `initializeFromAdmin(address president, address[] memory directivos)`
  - Solo callable una vez (constructor alternativo o flag)
  - Validar que president no sea address(0)
  - Asignar roles iniciales en un bloque (transacción atómica)
  - Event: `InitializedFromAdmin(president, directivos, timestamp)`
  
- [ ] **T2.6** — Corregir `ActaHashRegistry.sol`
  - Problema: Busca actas por índice consecutivo → Falla si IDs no son consecutivos
  - Solución: Mapeo explícito `mapping(uint256 propuestaId => bytes32 hash)`
  - Nueva firma: `function registrarHash(uint256 propuestaId, bytes32 hash) external`
  - Recuperar hash: `function obtenerHash(uint256 propuestaId) external view returns (bytes32)`
  
- [ ] **T2.7** — Protección contra reentradas
  - Review: `VotacionPropuestas.ejecutarPropuesta()` usa `call{}` → Riesgo reentrancia
  - Solución: Usar patrón checks-effects-interactions
    ```solidity
    // 1. Checks
    require(p.estado == APROBADA && !p.ejecutada);
    // 2. Effects
    p.ejecutada = true;
    p.estado = EJECUTADA;
    // 3. Interactions
    (bool success,) = walletReceptora.call{value: monto}("");
    require(success);
    ```
  
- [ ] **T2.8** — Ampliar suite de pruebas
  - Target cobertura: **95%+ de líneas críticas**
  - Nuevas pruebas:
    - Replay attacks (nonce verification)
    - Quórum insuficiente
    - Fondos insuficientes
    - Apelación fuera de plazo
    - Reentradas en transferencias
    - Bootstrap duplicado
    - Recuperación de wallet con y sin recusal
  - Comando: `forge test --gas-report` → Guardar en `test-results.json`
  
- [ ] **T2.9** — Análisis estático
  ```bash
  # Instalar slither (si es posible)
  slither . --json > slither-report.json
  # Revisar findings de nivel HIGH y CRITICAL
  ```
  
- [ ] **T2.10** — Documentación de contratos
  - Agregar NatSpec completo a cada función
  - Ejemplo:
    ```solidity
    /// @notice Registra un nuevo socio con aporte mínimo
    /// @dev Solo callable por owner; emite SocioRegistrado
    /// @param _wallet Dirección del nuevo socio
    /// @param _monto Aporte inicial en wei
    function registrarSocio(address _wallet, uint256 _monto) external onlyOwner {
    ```
  - Generar docs: `forge doc`
  
- [ ] **T2.11** — Compilar y verificar
  ```bash
  forge build --optimize --optimizer-runs 200
  forge verify-contract ... --chain amoy  # Si quieres publicar en Etherscan
  ```

#### Entregables:
- ✅ Nuevo contrato `Tesoreria.sol` compilable
- ✅ `CooperativaCappones.sol` refactorizado (bootstrap seguro, recusal, límites)
- ✅ `VotacionPropuestas.sol` integrado con tesorería
- ✅ `ActaHashRegistry.sol` corregido (mapeo por propuestaId)
- ✅ Suite completa de tests: `forge test --gas-report`
  - Output esperado: 150+ tests, 0 failures, ~95% coverage
- ✅ `slither-report.json` con 0 findings críticos
- ✅ NatSpec documentation completo
- ✅ Rama `feature/contratos-fase2` lista para merge

#### Criterio de Cierre:
```bash
git checkout feature/contratos-fase2
forge build        # ✅ Sin errores
forge test         # ✅ Todos pasan
slither .          # ✅ Sin findings críticos
forge doc          # ✅ Documentación generada
```

---

### FASE 3 — Backend Seguro (API + BD)
**Objetivo:** API compilable, autenticada, autorizada, con integración blockchain  
**Duración:** 12-14 días  
**Responsable:** Backend Lead + Security Engineer

#### Tareas:
- [ ] **T3.1** — Migración inicial de BD
  - Revisar y corregir `prisma/schema.prisma`
    - ✏️ Cambiar `Aval.directivoId` → relación correcta
    - ✏️ Agregar índices: `@@index([walletAddress])` en Socio
    - ✏️ Agregar `@@index([propuestaChainId])` en Propuesta
  - Generar migración:
    ```bash
    cd web
    npx prisma migrate dev --name init
    # Aplicar a BD vacía
    ```
  - Verificar: `npx prisma studio` debe mostrar schema correcto
  
- [ ] **T3.2** — Implementar autenticación por firma
  - Archivo: `web/src/lib/auth.ts`
  - Flow:
    1. Frontend hace POST `/api/auth/nonce` con `{ walletAddress: "0x..." }`
    2. Backend genera nonce aleatorio, lo guarda con TTL 5 min
    3. Frontend pide firma a MetaMask: `eth_signMessage(nonce + timestamp + domain)`
    4. Frontend POST `/api/auth/verify` con `{ walletAddress, signature, message }`
    5. Backend verifica: `ethers.verifyMessage(message, signature) == walletAddress`
    6. Backend genera sesión (httpOnly + secure cookie)
    7. Todas las request posteriores incluyen cookie automáticamente
  - Código base:
    ```typescript
    import { verifyMessage } from "ethers";
    
    export function verificarFirma(message: string, signature: string, expectedWallet: string): boolean {
      try {
        const recoveredWallet = verifyMessage(message, signature);
        return recoveredWallet.toLowerCase() === expectedWallet.toLowerCase();
      } catch {
        return false;
      }
    }
    ```
  - Tests: 8+ casos (nonce válido, expirado, firma inválida, etc.)
  
- [ ] **T3.3** — Implementar autorización (RBAC)
  - Archivo: `web/src/lib/permissions.ts`
  - Roles: `SOCIO`, `DIRECTIVO`, `ADMIN`
  - Permisos por endpoint:
    | Endpoint | GET | POST | Rol Requerido |
    |----------|-----|------|---------------|
    | `/api/auth/nonce` | ✅ | - | PÚBLICO |
    | `/api/auth/verify` | - | ✅ | PÚBLICO |
    | `/api/proposals` | ✅ | ✅ (crear) | SOCIO / DIRECTIVO |
    | `/api/proposals/:id/vote` | - | ✅ | SOCIO |
    | `/api/proposals/:id/execute` | - | ✅ | DIRECTIVO |
    | `/api/relay/vote` | - | ✅ | SOCIO (gasless) |
    | `/api/admin/*` | ✅ | ✅ | ADMIN |
  - Middleware: `app/api/_middleware.ts` que verifica sesión + rol
  
- [ ] **T3.4** — Guardar datos sensibles cifrados
  - Instalar: `npm install crypto-js dotenv`
  - Campos a cifrar: `cedula`, `correo`, `telefono`, `direccion`
  - Key: Variable env `ENCRYPTION_KEY` (generar: `openssl rand -hex 32`)
  - Cipher: AES-256-GCM
  - Código:
    ```typescript
    import CryptoJS from "crypto-js";
    
    export function cifrar(texto: string, key: string): string {
      return CryptoJS.AES.encrypt(texto, key).toString();
    }
    
    export function descifrar(cifrado: string, key: string): string {
      return CryptoJS.AES.decrypt(cifrado, key).toString(CryptoJS.enc.Utf8);
    }
    ```
  - Descifrar solo cuando sea necesario (auditoría)
  
- [ ] **T3.5** — 2FA para directivos
  - Instalar: `npm install speakeasy qrcode` (ya en package.json)
  - Flow al editar directivo:
    1. POST `/api/admin/directivos/:id/2fa-setup` genera secret TOTP
    2. Devuelve QR para escanear con Google Authenticator
    3. Usuario escanea y confirma con `POST /api/admin/directivos/:id/2fa-verify { totp_code }`
    4. Secret se guarda cifrado en `Directivo.secret2FA`
    5. Todo cambio administrativo requiere TOTP válido
  - Tests: 5+ casos (secret inválido, expirado, etc.)
  
- [ ] **T3.6** — Mapeo UUID ↔ Blockchain ID
  - Nueva tabla: `Propuesta.propuestaChainId` (ya existe, estaba vacía)
  - Lógica:
    - Crear propuesta en BD → UUID (ej: `550e8400-e29b-41d4-a716-446655440000`)
    - Frontend firma + envía a contrato vía relayer
    - Contrato emite evento: `PropuestaCreada(uint256 id=5, address creador, string nombre)`
    - Backend escucha evento → Actualiza `Propuesta.propuestaChainId = "5"`
    - De aquí en adelante, usar ID on-chain
  - Archivo: `web/src/lib/blockchain-listener.ts`
  - Implementación: Web3.js o ethers.js con `contract.on("PropuestaCreada", ...)`
  
- [ ] **T3.7** — Validación de entrada y limpieza
  - Middleware: `web/src/middleware/validateInput.ts`
  - Usar zod para schemas:
    ```typescript
    import { z } from "zod";
    
    export const SocioSchema = z.object({
      walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      nombre: z.string().min(3).max(100),
      cedula: z.string().regex(/^\d{10}$/),
      correo: z.string().email(),
      // ...
    });
    ```
  - Aplicar a todo POST/PUT
  
- [ ] **T3.8** — Rate limiting
  - Instalar: `npm install next-rate-limit`
  - Configurar:
    - 10 req/min por IP (endpoint público)
    - 100 req/min por usuario autenticado
    - 50 req/min para crear propuestas (evitar spam)
  - Middleware: `web/src/middleware/rateLimit.ts`
  
- [ ] **T3.9** — Auditoría completa
  - Tabla `AuditoriaLog` ya existe
  - Registrar:
    ```typescript
    await prisma.auditoriaLog.create({
      data: {
        accion: "CREAR_PROPUESTA",
        entidad: "Propuesta",
        entidadId: propuestaId,
        detalle: JSON.stringify({ nombre, monto, creador }),
        walletEjecutor: req.user.wallet,
        ipAddress: req.ip,
      },
    });
    ```
  - Immutable: `@@map("auditoria_log")` sin update
  
- [ ] **T3.10** — Gasless voting con MinimalForwarder
  - Flow:
    1. Frontend firma: `hash = keccak256(abi.encode(propuestaId, voto, nonce, block.timestamp))`
    2. Frontend POST `/api/relay/vote` con `{ propuestaId, voto, signature, nonce }`
    3. Backend verifica: `recover(hash, signature) == walletSocio` ✅
    4. Backend llama `MinimalForwarder.execute(ForwardRequest{...}, signature)`
    5. Relayer paga gas; evento `VotoEmitido` se emite en blockchain
    6. Backend escucha evento, actualiza BD: `Voto.txHash = receipt.hash`
  - Código backend:
    ```typescript
    const forwardRequest = {
      from: walletSocio,
      to: votacionPropuestasAddress,
      value: 0,
      gas: 100000,
      nonce: nonce,
      deadline: Math.floor(Date.now() / 1000) + 3600, // 1h
      data: votacionContract.interface.encodeFunctionData('votar', [propuestaId, votoEnum]),
    };
    
    const signature = await ethers.verifyMessage(
      ethers.solidityPackedKeccak256(['tuple'], [forwardRequest]),
      userSignature
    );
    
    const tx = await forwarder.execute(forwardRequest, signature);
    ```
  - Fallback: Si relayer falla, endpoint de votación manual (pago de gas)
  
- [ ] **T3.11** — Sincronización de eventos blockchain
  - Daemon: `scripts/blockchain-sync.ts`
  - Escucha eventos de `CooperativaCappones` y `VotacionPropuestas`
  - Actualiza BD en tiempo real:
    ```typescript
    cooperativaContract.on('SocioRegistrado', async (wallet, fecha) => {
      await prisma.socio.update({
        where: { walletAddress: wallet },
        data: { createdAt: new Date(fecha * 1000) },
      });
    });
    ```
  - Ejecutar como worker (PM2, systemd, etc.)
  
- [ ] **T3.12** — Tests de API
  - Framework: `@playwright/test` (ya en package.json)
  - Rutas a testear:
    - ✅ `/api/auth/nonce` y `/api/auth/verify` (happy path + error cases)
    - ✅ `/api/proposals` CRUD (crear, listar, actualizar)
    - ✅ `/api/proposals/:id/vote` (voto válido, duplicado, fuera de tiempo)
    - ✅ `/api/relay/vote` (gasless; signature válida, inválida, replay)
    - ✅ `/api/proposals/:id/execute` (permisos, fondos insuficientes)
    - ✅ Autorización: Usuario no autenticado, rol insuficiente
  - Mínimo: 30+ tests, cobertura 80%+

#### Entregables:
- ✅ Schema Prisma corregido y migración inicial
- ✅ `web/src/lib/auth.ts` con autenticación por firma
- ✅ `web/src/lib/permissions.ts` con RBAC
- ✅ Campos sensibles cifrados (cedula, correo, etc.)
- ✅ 2FA para directivos
- ✅ Mapeo UUID ↔ Blockchain ID funcional
- ✅ Validación de entrada con zod
- ✅ Rate limiting implementado
- ✅ Auditoría completa en `AuditoriaLog`
- ✅ Votación gasless vía MinimalForwarder
- ✅ Sincronización de eventos blockchain
- ✅ Suite de tests: 30+ casos, 80%+ cobertura
- ✅ Rama `feature/backend-fase3` lista para merge

#### Criterio de Cierre:
```bash
git checkout feature/backend-fase3
npm ci && npm run db:push && npm run test
# ✅ BD en estado limpio, todos tests pasan, rate limiting activo
```

---

### FASE 4 — Frontend Accesible y Flujo Completo
**Objetivo:** Aplicación usable en navegador; socios no técnicos pueden operar  
**Duración:** 14-16 días  
**Responsable:** Frontend Lead + UX/UI Designer

#### Tareas:
- [ ] **T4.1** — Estructura base Next.js
  - Carpetas:
    ```
    web/src/
    ├── app/
    │   ├── layout.tsx          (Root layout, navbar)
    │   ├── page.tsx            (Landing / Dashboard)
    │   ├── (auth)/             (Group: rutas públicas)
    │   │   ├── login/page.tsx
    │   │   ├── register/page.tsx
    │   │   └── recover/page.tsx
    │   ├── (app)/              (Group: rutas protegidas)
    │   │   ├── dashboard/page.tsx
    │   │   ├── proposals/page.tsx
    │   │   ├── proposals/[id]/page.tsx
    │   │   ├── votes/page.tsx
    │   │   ├── profile/page.tsx
    │   │   └── admin/page.tsx (solo ADMIN)
    │   └── api/ (ya existe)
    ├── components/
    │   ├── MetaMaskButton.tsx
    │   ├── ProposalCard.tsx
    │   ├── VoteForm.tsx
    │   ├── Modal.tsx
    │   └── ... (20+ componentes)
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useContractRead.ts
    │   └── useGaslessVote.ts
    └── lib/
        └── (ya existe)
    ```
  
- [ ] **T4.2** — Setup de estilos (Tailwind CSS)
  - Instalar: `npm install -D tailwindcss postcss autoprefixer`
  - Configurar: `tailwind.config.ts`, `postcss.config.mjs`
  - Theme: Colores de cooperativa (verde + blanco)
  - Utility classes: Botones, tarjetas, formularios reutilizables
  
- [ ] **T4.3** — Hooks de autenticación
  - `web/src/hooks/useAuth.ts`:
    ```typescript
    export function useAuth() {
      const [user, setUser] = useState<User | null>(null);
      const [loading, setLoading] = useState(true);
      
      async function loginWithMetaMask() {
        // Solicitar cuentas
        const accounts = await window.ethereum?.request({ method: 'eth_requestAccounts' });
        // POST /api/auth/nonce, /api/auth/verify
        // Guardar sesión en cookie
      }
      
      return { user, loading, loginWithMetaMask, logout };
    }
    ```
  - `web/src/hooks/useContractRead.ts` — Lectura de estado on-chain
  - `web/src/hooks/useGaslessVote.ts` — Firma y envío de voto gasless
  
- [ ] **T4.4** — Página de login/register
  - `app/(auth)/login/page.tsx`:
    - Botón "Conectar MetaMask"
    - Si no existe cuenta: Redirect a `/register`
    - Si existe: Dashboard
  - `app/(auth)/register/page.tsx`:
    - Form: Nombre, cédula, teléfono, correo, dirección (todos con validación)
    - Selector de aporte inicial (ej: 0.01 MATIC en Amoy)
    - Mensaje de confirmación: "¿Estás seguro? Se cobrará 0.01 MATIC"
    - Botón "Registrarse" → firma en MetaMask → POST `/api/register`
    - Loading spinner mientras se espera transacción
    - Mensaje de éxito con enlace al dashboard
  - Error handling: Mostrar mensajes en toast/modal
  
- [ ] **T4.5** — Dashboard de socio
  - `app/(app)/dashboard/page.tsx`:
    - Header: Hola, [Nombre]. Rol: [Socio/Directivo]
    - Tarjetas (cards):
      - Saldo total aportado
      - Capital de la cooperativa
      - Mis votos emitidos (contador)
      - Mis postulaciones (si aplica)
    - Secciones:
      - "Propuestas activas" (últimas 5)
      - "Mis acciones recientes" (últimos 10 logs)
    - Botones: "Ver todas las propuestas", "Perfil", "Cerrar sesión"
  
- [ ] **T4.6** — Listado de propuestas
  - `app/(app)/proposals/page.tsx`:
    - Tabla/Grid con columnas:
      - Nombre propuesta
      - Estado (badge con color)
      - Votos: "✅ 15 | ❌ 5 | ⊘ 3"
      - Deadline (si POR_DISCUTIR)
      - Acciones: Ver detalles, Votar (si aplica)
    - Filtros: Estado, tipo (Inversión/Admin), creador
    - Paginación: 10 propuestas por página
    - Si eres DIRECTIVO: Botón "+ Nueva Propuesta"
  
- [ ] **T4.7** — Detalle de propuesta y votación
  - `app/(app)/proposals/[id]/page.tsx`:
    - Encabezado: Nombre, descripción, monto, wallet receptora
    - Timeline visual: BORRADOR → POR_DISCUTIR → APROBADA → EJECUTADA
    - Avales: Lista de directivos con checkbox (si eres directivo, podes firmar)
    - Resultados en vivo: Gráfico de votos (donut chart)
    - Tu voto (si ya votaste): "Ya votaste: ✅ Aceptada" (no editable)
    - Si no votaste y está POR_DISCUTIR:
      - 3 botones: "✅ Aceptar", "❌ Rechazar", "⊘ Abstención"
      - Click → Modal de confirmación → Firma MetaMask (con gasless fallback)
      - Loading spinner → "Votando..."
      - Mensaje de éxito con tx hash (link a PolygonScan)
    - Acta (si EJECUTADA): PDF descargable con hash blockchain
  
- [ ] **T4.8** — Formulario de nueva propuesta (DIRECTIVO)
  - `app/(app)/proposals/create/page.tsx`:
    - Form:
      - Nombre (texto, max 100 chars)
      - Descripción (textarea, max 1000 chars)
      - Tipo (dropdown: Inversión / Administrativa)
      - Monto (número, min 0.001 MATIC)
      - Wallet receptora (input, validar formato 0x...)
    - Preview en tiempo real
    - Botón "Crear propuesta"
    - POST `/api/proposals` → Toast: "Propuesta creada. Esperando avales..."
    - Redirect a `/proposals/[id]`
  
- [ ] **T4.9** — Perfil de usuario
  - `app/(app)/profile/page.tsx`:
    - Mostrar: Nombre, cédula (parcial: "123***890"), correo, teléfono, dirección
    - Secciones:
      - Mis aportes (tabla: fecha, tipo, monto, tx hash)
      - Mis votos (tabla: propuesta, voto, fecha)
      - Mi rol (si directivo: cargo, vigencia, 2FA activo)
    - Botones:
      - "Editar perfil" (solo nombre, teléfono)
      - "Establecer wallet de recuperación"
      - "Cerrar sesión"
  
- [ ] **T4.10** — Panel de admin
  - `app/(app)/admin/page.tsx` (solo ADMIN):
    - Estadísticas: Total socios, capital, propuestas, directivos
    - Listado de socios con búsqueda/filtro
    - Listado de directivos (con opción de remover)
    - Logs de auditoría (tabla: acción, usuario, IP, fecha, resultado)
    - Botón "Descargar logs CSV"
  
- [ ] **T4.11** — Componentes reutilizables
  - `components/`:
    - `Button.tsx` — Botones (primary, secondary, danger, disabled)
    - `Card.tsx` — Tarjetas con shadow
    - `Modal.tsx` — Modal genérico
    - `Toast.tsx` — Notificaciones (success, error, info)
    - `Badge.tsx` — Etiquetas de estado
    - `Spinner.tsx` — Loading spinner
    - `Navbar.tsx` — Barra superior con user menu
    - `ProtectedRoute.tsx` — Wrapper que redirige si no autenticado
  
- [ ] **T4.12** — Middleware de autenticación
  - `web/src/middleware.ts`:
    ```typescript
    export async function middleware(req: NextRequest) {
      const token = req.cookies.get('session')?.value;
      
      if (!token && req.nextUrl.pathname.startsWith('/app')) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
      
      return NextResponse.next();
    }
    ```
  
- [ ] **T4.13** — Error handling y UX
  - Toast notifications en cada acción:
    - "Conectando MetaMask..."
    - "✅ Voto registrado"
    - "❌ Error: Fondos insuficientes"
  - Modal de confirmación antes de acciones críticas (votar, crear propuesta)
  - Fallback UI si MetaMask no está instalado
  - Mensaje si no hay propuestas activas (empty state)
  - Link a FAQ/Ayuda en cada página
  
- [ ] **T4.14** — Tests E2E
  - `web/tests/` (Playwright):
    - ✅ Login con MetaMask (mock)
    - ✅ Crear propuesta (directivo)
    - ✅ Firmar aval
    - ✅ Votar propuesta
    - ✅ Votación gasless fallback
    - ✅ Ver dashboard
    - ✅ Editar perfil
    - ✅ 404 pages para rutas inválidas
  - Mínimo: 15+ tests, cobertura 70%+

#### Entregables:
- ✅ Estructura Next.js completa con app router
- ✅ Tailwind CSS configurado (theme cooperativa)
- ✅ Hooks reutilizables (auth, contract, gasless)
- ✅ 8 páginas principales + componentes
- ✅ Middleware de autenticación
- ✅ Error handling y UX completo
- ✅ Tests E2E: 15+ casos
- ✅ Rama `feature/frontend-fase4` lista para merge

#### Criterio de Cierre:
```bash
git checkout feature/frontend-fase4
npm ci && npm run build
npm run dev  # → http://localhost:3000 funciona
# ✅ Puedes registrar socio, votar, crear propuesta sin errores
```

---

### FASE 5 — Automatización, Operaciones y Despliegue de Prueba
**Objetivo:** Entorno reproducible local y testnet; daemon de ejecución  
**Duración:** 8-10 días  
**Responsable:** DevOps + Backend

#### Tareas:
- [ ] **T5.1** — Docker Compose mejorado
  - Servicios:
    - `postgres` (ya existe)
    - `pgadmin` (ya existe)
    - `anvil` (blockchain local)
    - `relayer` (backend corriendo votos gasless)
    - `frontend` (Next.js dev server)
  - Archivo: `docker-compose.full.yml`
    ```yaml
    version: '3.8'
    services:
      postgres:
        image: postgres:16-alpine
        environment:
          POSTGRES_DB: cooperativa_cappones
          POSTGRES_USER: cooperativa
          POSTGRES_PASSWORD: cooperativa_local_dev
        volumes:
          - postgres_data:/var/lib/postgresql/data
        ports:
          - "5432:5432"
      
      anvil:
        image: ghcr.io/foundry-rs/foundry:latest
        ports:
          - "8545:8545"
        command: anvil --host 0.0.0.0
      
      web:
        build:
          context: ./web
          dockerfile: Dockerfile
        ports:
          - "3000:3000"
        environment:
          DATABASE_URL: postgresql://cooperativa:cooperativa_local_dev@postgres/cooperativa_cappones
          NEXT_PUBLIC_RPC_URL: http://anvil:8545
          NEXT_PUBLIC_CHAIN_ID: 31337
        depends_on:
          - postgres
          - anvil
    
    volumes:
      postgres_data:
    ```
  - `web/Dockerfile` (multi-stage):
    ```dockerfile
    FROM node:20-alpine AS builder
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci
    COPY . .
    RUN npm run build
    
    FROM node:20-alpine
    WORKDIR /app
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/package*.json ./
    EXPOSE 3000
    CMD ["npm", "start"]
    ```
  
- [ ] **T5.2** — Script de deploy local
  - `scripts/local-deploy.sh`:
    ```bash
    #!/bin/bash
    set -e
    
    echo "🚀 Iniciando deploy local..."
    
    # 1. Levantar servicios
    docker compose -f docker-compose.full.yml up -d
    sleep 10
    
    # 2. Esperar a que Postgres esté listo
    until docker exec cooperativa-postgres pg_isready -U cooperativa -d cooperativa_cappones; do
      echo "Esperando PostgreSQL..."
      sleep 2
    done
    
    # 3. Migrar BD
    cd web
    npx prisma migrate deploy
    npx prisma db seed
    cd ..
    
    # 4. Deployar contratos en Anvil
    cd contracts
    forge create src/CooperativaCappones.sol:CooperativaCappones --constructor-args "0x..." --rpc-url http://localhost:8545
    # Capturar direcciones, guardar en web/.env.local
    cd ..
    
    echo "✅ Deploy local completado. Frontend: http://localhost:3000"
    ```
  - Hacerlo executable: `chmod +x scripts/local-deploy.sh`
  
- [ ] **T5.3** — Daemon de ejecución automática
  - Archivo: `scripts/execution-daemon.ts`
  - Lógica:
    ```typescript
    import { ethers } from 'ethers';
    import { PrismaClient } from '@prisma/client';
    
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, provider);
    const prisma = new PrismaClient();
    
    async function executeApprovedProposals() {
      const approved = await prisma.propuesta.findMany({
        where: { 
          estado: 'APROBADA',
          ejecutada: false,
          propuestaChainId: { not: null }
        },
      });
      
      for (const prop of approved) {
        try {
          const contract = new ethers.Contract(
            VOTACION_ADDRESS,
            VOTACION_ABI,
            wallet
          );
          
          const tx = await contract.ejecutarPropuesta(prop.propuestaChainId);
          await tx.wait();
          
          await prisma.propuesta.update({
            where: { id: prop.id },
            data: { estado: 'EJECUTADA' },
          });
          
          console.log(`✅ Ejecutada propuesta ${prop.id}`);
        } catch (err) {
          console.error(`❌ Error ejecutando ${prop.id}: ${err.message}`);
        }
      }
    }
    
    // Ejecutar cada 5 minutos
    setInterval(executeApprovedProposals, 5 * 60 * 1000);
    ```
  - Ejecutar como worker: `tsx scripts/execution-daemon.ts`
  - O via PM2: `pm2 start scripts/execution-daemon.ts --name "cappones-daemon"`
  
- [ ] **T5.4** — Seed de datos de prueba
  - `web/prisma/seed.ts`:
    ```typescript
    import { PrismaClient } from '@prisma/client';
    
    const prisma = new PrismaClient();
    
    async function main() {
      // Limpiar
      await prisma.socio.deleteMany();
      
      // Crear socios de prueba
      const socio1 = await prisma.socio.create({
        data: {
          walletAddress: '0x1234567890123456789012345678901234567890',
          nombre: 'Juan Pérez',
          cedula: '1234567890',
          // ...
        },
      });
      
      // Crear directivo
      const directivo = await prisma.directivo.create({
        data: {
          socioId: socio1.id,
          cargo: 'PRESIDENTE',
          fechaInicio: new Date(),
          fechaFin: new Date(Date.now() + 2 * 365 * 24 * 3600 * 1000),
        },
      });
      
      console.log('✅ Base de datos seeded');
    }
    
    main().catch(console.error).finally(() => prisma.$disconnect());
    ```
  - Ejecutar: `npx prisma db seed`
  
- [ ] **T5.5** — Configuración de Amoy (testnet)
  - Crear `.env.amoy`:
    ```
    NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology
    NEXT_PUBLIC_CHAIN_ID=80002
    NEXT_PUBLIC_COOPERATIVA_ADDRESS=0x...
    NEXT_PUBLIC_VOTACION_ADDRESS=0x...
    NEXT_PUBLIC_FORWARDER_ADDRESS=0x...
    
    DATABASE_URL=postgresql://...amoy_db...
    RELAYER_PRIVATE_KEY=0x...
    RELAYER_ADDRESS=0x...
    ```
  - Script de deploy en Amoy: `scripts/deploy-amoy.sh`
    ```bash
    cd contracts
    forge create src/CooperativaCappones.sol:CooperativaCappones \
      --rpc-url https://rpc-amoy.polygon.technology \
      --private-key $DEPLOYER_KEY \
      --etherscan-api-key $POLYGONSCAN_API_KEY \
      --verify
    # Guardar dirección → .env.amoy
    ```
  
- [ ] **T5.6** — Smoke tests (E2E en Amoy)
  - `scripts/smoke-tests-amoy.ts`:
    - ✅ Conectar a Amoy RPC
    - ✅ Leer saldo de cuenta relayer (debe tener MATIC)
    - ✅ Leer estado de tesorería
    - ✅ Crear dummy socio en BD + simular aporte
    - ✅ Enviar voto gasless via MinimalForwarder
    - ✅ Verificar evento en blockchain
    - ✅ Leer propuesta desde BD
  - Ejecutar: `npx ts-node scripts/smoke-tests-amoy.ts`
  
- [ ] **T5.7** — Monitoreo y alertas
  - Configurar logs estructurados:
    ```typescript
    // web/src/lib/logger.ts
    import winston from 'winston';
    
    export const logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      defaultMeta: { service: 'cappones-api' },
      transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
      ],
    });
    ```
  - Alertas (via email/Slack):
    - Relayer sin fondos (saldo < 0.1 MATIC)
    - Error en execution daemon
    - BD desincronizada (event lag > 10 bloques)
  - Herramienta: Usar `pino` o `winston` con webhook a Discord/Slack
  
- [ ] **T5.8** — Backup y recuperación
  - Script diario: `scripts/backup-db.sh`
    ```bash
    #!/bin/bash
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR
    
    docker exec cooperativa-postgres pg_dump -U cooperativa cooperativa_cappones \
      > $BACKUP_DIR/db.sql
    
    # Guardar en S3 o bucket seguro
    aws s3 cp $BACKUP_DIR s3://backups-cappones/$BACKUP_DIR/
    ```
  - Restore: `psql -U cooperativa cooperativa_cappones < backup.sql`
  
- [ ] **T5.9** — Documentación de operaciones
  - `docs/OPERACIONES.md`:
    - Cómo levantar stack local
    - Cómo deployar en Amoy
    - Cómo escalar (agregar más relayers)
    - Procedimiento si relayer falla
    - Procedimiento si BD se corrompe
    - Contactos de emergencia
  
- [ ] **T5.10** — Makefile mejorado
  - Agregar targets:
    ```makefile
    local-deploy:
    	bash scripts/local-deploy.sh
    
    amoy-deploy:
    	bash scripts/deploy-amoy.sh
    
    smoke-tests:
    	npx ts-node scripts/smoke-tests-amoy.ts
    
    logs-relayer:
    	docker logs -f cappones-relayer
    
    backup:
    	bash scripts/backup-db.sh
    ```

#### Entregables:
- ✅ `docker-compose.full.yml` con all services
- ✅ `web/Dockerfile` multi-stage
- ✅ Script `scripts/local-deploy.sh` (one-click setup)
- ✅ Daemon `scripts/execution-daemon.ts`
- ✅ Seed data `web/prisma/seed.ts`
- ✅ Configuración `.env.amoy`
- ✅ Script deploy Amoy
- ✅ Smoke tests E2E
- ✅ Logging + alertas (relayer, BD)
- ✅ Backup diario
- ✅ `docs/OPERACIONES.md`
- ✅ Makefile con targets de deploy

#### Criterio de Cierre:
```bash
bash scripts/local-deploy.sh
# ✅ Todo funciona en http://localhost:3000

make amoy-deploy
make smoke-tests
# ✅ Transacciones en Amoy, eventos capturados, BD sincronizada
```

---

### FASE 6 — Calidad, Seguridad y Aceptación
**Objetivo:** Evidencia verificable de funcionalidad, cobertura, sin vulnerabilidades  
**Duración:** 10-12 días  
**Responsable:** QA Lead + Security Auditor

#### Tareas:
- [ ] **T6.1** — Auditoría de seguridad independiente
  - Contratar auditor externo (firma especializada en smart contracts)
  - Scope: 4 contratos Solidity (~500 LOC)
  - Duración: 3-5 días
  - Entregas: Reporte con findings (críticos, altos, medios, bajos)
  - Criterio de aceptación: 0 críticos, máx 2 altos (con plan de mitigación)
  - Costo estimado: $5,000 - $15,000 USD
  
- [ ] **T6.2** — Tests de carga
  - Herramienta: `k6` o `JMeter`
  - Escenario: 1000 usuarios simultáneos votando en 5 propuestas
  - Métricas:
    - Latencia P95 < 500ms
    - Error rate < 1%
    - Rate limit efectivo
  - Resultado: `load-test-report.html`
  
- [ ] **T6.3** — Tests de recuperación
  - Escenario 1: Relayer cae
    - Acción: Kill proceso relayer
    - Resultado: Fallback a votación pagada funciona
    - Tiempo de recuperación: < 5 min (manual restart)
  - Escenario 2: BD se desincroniza
    - Acción: Eliminar algunos logs
    - Resultado: Daemon reconstruye estado desde blockchain
    - Tiempo: < 10 min
  - Escenario 3: RPC no responde
    - Acción: Cambiar RPC a endpoint invalido
    - Resultado: Aplicación sigue funcionando (caché local)
    - Fallback automático a otro RPC
  - Documento: `DISASTER_RECOVERY.md`
  
- [ ] **T6.4** — Cobertura de tests
  - Solidity: `forge coverage` → Reportar % (target 95%+)
  - API: `npm test -- --coverage` → Reportar % (target 85%+)
  - Frontend: `npm test -- --coverage` → Reportar % (target 70%+)
  - Consolidar en: `COVERAGE_REPORT.md`
  
- [ ] **T6.5** — Pruebas de usabilidad
  - Reclutar 3-5 socios reales (o representantes)
  - Tasks:
    1. Conectar MetaMask
    2. Registrarse como socio
    3. Hacer aporte adicional
    4. Ver propuestas activas
    5. Votar una propuesta
  - Observar: ¿Pueden hacerlo sin ayuda? ¿Hay confusión?
  - Ajustar UI según feedback
  - Documento: `USABILITY_FEEDBACK.md`
  
- [ ] **T6.6** — Matriz de validación
  - Tabla con todos los requisitos funcionales vs. tests
  - Ejemplo:
    | Requisito | Test ID | Status | Evidencia |
    |-----------|---------|--------|-----------|
    | Socio se registra con aporte 2% | T3.1, T4.4 | ✅ PASS | test-results.json |
    | Propuesta aprobada se ejecuta | T2.8, T5.6 | ✅ PASS | tx-hash-amoy |
    | Voto gasless funciona | T3.10, T6.2 | ✅ PASS | event-log |
  - Documento: `VALIDATION_MATRIX.md`
  
- [ ] **T6.7** — Checklist de seguridad
  - [ ] No hay claves privadas en repo
  - [ ] Cifrado AES-256 para datos sensibles
  - [ ] 2FA obligatorio para directivos
  - [ ] Rate limiting activo
  - [ ] CORS configurado (solo localhost + amoy RPC)
  - [ ] Helmet headers en respuestas HTTP
  - [ ] SQL injection prevention (Prisma ORM)
  - [ ] XSS prevention (React sanitizes output)
  - [ ] CSRF tokens en forms (Next.js Middleware)
  - [ ] Auditoría completa en `AuditoriaLog`
  - Documento: `SECURITY_CHECKLIST.md` (con checkmarks)
  
- [ ] **T6.8** — Documentación final
  - `docs/USER_GUIDE.md` — Manual en español para socios
    - Cómo conectar MetaMask
    - Cómo registrarse
    - Cómo votar
    - Cómo recuperar wallet
    - FAQ
  - `docs/ADMIN_GUIDE.md` — Manual para administrador
    - Cómo inicializar contrato
    - Cómo resolver incidentes
    - Monitoreo
  - `docs/DEVELOPER_GUIDE.md` — Manual para desarrolladores futuros
    - Arquitectura
    - Cómo extender
    - Testing
  - Todos en markdown + HTML
  
- [ ] **T6.9** — Registro de issues y resolución
  - Durante testing, registrar todos los bugs en `ISSUES.md`:
    - ID | Severidad | Descripción | Asignado | Status | Resolución
  - Target: 0 críticos, 0 altos antes de go-live
  - Mantener actualizado diariamente
  
- [ ] **T6.10** — Firma de aceptación
  - Documento: `ACCEPTANCE_SIGN_OFF.md`
  - Firmado por: Product Owner, Tech Lead, Seguridad, Legal
  - Declara: "Este sistema está listo para piloto controlado"

#### Entregables:
- ✅ Reporte de auditoría de seguridad (0 críticos)
- ✅ Reporte de carga (P95 < 500ms)
- ✅ `DISASTER_RECOVERY.md` con 3 escenarios testados
- ✅ `COVERAGE_REPORT.md` (Solidity 95%, API 85%, Frontend 70%)
- ✅ `USABILITY_FEEDBACK.md` + capturas
- ✅ `VALIDATION_MATRIX.md` (todos requisitos: ✅)
- ✅ `SECURITY_CHECKLIST.md` (all checked)
- ✅ 3 guías de usuario (español)
- ✅ `ISSUES.md` con 0 críticos / 0 altos
- ✅ `ACCEPTANCE_SIGN_OFF.md` firmado

#### Criterio de Cierre:
```bash
# Todo debe estar en status ✅
cat COVERAGE_REPORT.md      # Solidity 95%+
cat SECURITY_CHECKLIST.md   # All checked
cat ISSUES.md               # 0 critical, 0 high
cat ACCEPTANCE_SIGN_OFF.md  # Signed by 4 parties
```

---

### FASE 7 — Producción Controlada
**Objetivo:** Migración a entorno real; multifirma; límites de fondos; monitoreo 24/7  
**Duración:** 7-10 días  
**Responsable:** DevOps + Legal + Operations

#### Tareas:
- [ ] **T7.1** — Auditoría legal y compliance
  - Revisar términos de uso, privacidad, responsabilidades
  - Asegurar GDPR/RGPD si hay datos de EU
  - Declaración de responsabilidad: "Cooperativa es responsable de fondos"
  - Documento: `LEGAL_COMPLIANCE.md`
  
- [ ] **T7.2** — Multifirma para tesorería
  - Usar `MultiSigWallet` de OpenZeppelin
  - 3-de-5 multifirma (Presidente, Contador, Auditor externo, + 2 directivos)
  - Cualquier gasto requiere 3 firmas
  - Tiempo de lock: 2 días (window para que otros cancelen si es sospechoso)
  - Toda transferencia debe ser propuesta primero (no ejecución directa)
  
- [ ] **T7.3** — Desplegar en Polygon mainnet
  - Red: Polygon (no Amoy)
  - Validación: Deploy contrato dummy primero (test)
  - Usar `forge deploy` con verificación Etherscan
  - Guardar direcciones en `.env.mainnet`
  - Commit (sin private keys)
  
- [ ] **T7.4** — Límites operacionales
  - Límite monto por propuesta: $50,000 USD (10 MATIC @ 5000 MATIC/USD)
  - Límite diario: $100,000 USD (máx 2 propuestas grandes/día)
  - Límite de socios: 500 inicialmente (escala después)
  - Documentar en `OPERATIONAL_LIMITS.md`
  
- [ ] **T7.5** — Rotación de secretos
  - Cambiar todas las claves que se expusieron en testnet
  - Regenerar:
    - RELAYER_PRIVATE_KEY
    - DATABASE_PASSWORD
    - ENCRYPTION_KEY
    - API_SECRET
  - Guardar en gestor de secretos (AWS Secrets Manager, HashiCorp Vault)
  - Acceso solo para personal autorizado
  
- [ ] **T7.6** — Infraestructura de producción
  - Hosting: AWS ECS Fargate o Heroku (auto-scaling)
  - BD: AWS RDS PostgreSQL (multi-AZ, automated backups)
  - RPC: Alchemy o Infura (no un solo endpoint)
  - Dominio HTTPS + certificate
  - CDN para assets estáticos
  - Documento: `INFRASTRUCTURE.md`
  
- [ ] **T7.7** — Monitoreo 24/7
  - Herramientas: Datadog, New Relic o similar
  - Métricas:
    - Uptime (target: 99.9%)
    - Latencia API (P95 < 500ms)
    - Error rate (< 0.5%)
    - Saldo del relayer (alerta si < 1 MATIC)
    - Tamaño BD (alerta si > 100GB)
  - Alertas vía PagerDuty si hay incidente
  - Runbook: `INCIDENT_RESPONSE.md`
  
- [ ] **T7.8** — Plan de lanzamiento (Go-Live)
  - Fase 1: Soft launch (100 socios, máx $10k)
  - Fase 2: Launch (500 socios, máx $50k)
  - Fase 3: Scale (1000+ socios, sin límite)
  - Cada fase: 1-2 semanas de monitoreo antes de pasar a siguiente
  - Criterio de go: 0 incidents críticos, 99.5% uptime mínimo
  
- [ ] **T7.9** — Capacitación de operadores
  - Entrenamiento para 2 operadores designados:
    - Cómo monitorear alertas
    - Cómo reiniciar servicios
    - Cómo responder a incidentes
    - Cómo hacer backups manuales
    - Contactos de escalación
  - Documentos: `OPERATOR_MANUAL.md`
  
- [ ] **T7.10** — Firma de go/no-go
  - Documento: `GO_LIVE_APPROVAL.md`
  - Firmado por: CEO, CFO, CTO, Legal, Operations
  - Declara: "Autorizado para recibir fondos reales a partir de [fecha]"

#### Entregables:
- ✅ `LEGAL_COMPLIANCE.md` (auditoría completa)
- ✅ MultiSigWallet desplegada y testeada
- ✅ Contratos en Polygon mainnet (verificados Etherscan)
- ✅ `OPERATIONAL_LIMITS.md`
- ✅ Secretos rotados (en gestor externo)
- ✅ `INFRASTRUCTURE.md` (hosting, RPC, DB)
- ✅ Monitoreo Datadog/New Relic activo
- ✅ `GO_LIVE_APPROVAL.md` firmado por 5 partes

#### Criterio de Cierre:
```bash
# Checklist final
✅ Multifirma 3-de-5 funcional
✅ Contratos verificados en mainnet
✅ Monitoreo 24/7 activo
✅ Backups diarios verificados
✅ 2 operadores capacitados y certificados
✅ Legal compliance completado
✅ Go-live aprobado por 5 autoridades
```

---

## 📅 CRONOGRAMA TENTATIVO

| Fase | Nombre | Duración | Fin Estimado | Responsable |
|------|--------|----------|--------------|-------------|
| 0 | Línea Base | 2-3d | Semana 1 | DevOps |
| 1 | Especificación | 5-7d | Semana 2 | Product |
| 2 | Contratos | 10-12d | Semana 3-4 | Solidity |
| 3 | Backend | 12-14d | Semana 5-6 | Backend |
| 4 | Frontend | 14-16d | Semana 7-8 | Frontend |
| 5 | Operaciones | 8-10d | Semana 9-10 | DevOps |
| 6 | Calidad | 10-12d | Semana 11-12 | QA |
| 7 | Producción | 7-10d | Semana 13 | DevOps + Legal |

**Total: ~13 semanas** (3.25 meses) con equipo de 6-8 personas

---

## 💼 RECURSOS Y DEPENDENCIAS

### Equipo Requerido
1. **Lead Developer** (1) — Arquitectura + reviews
2. **Solidity Engineer** (1) — Contratos
3. **Backend Developer** (1-2) — API + BD
4. **Frontend Developer** (1-2) — UI/UX
5. **DevOps / SRE** (1) — Infraestructura
6. **QA / Tester** (1) — Testing
7. **Security Auditor** (1) — Auditoría externa (contratado)
8. **Product Owner** (1) — Decisiones + acceptance

### Dependencias Externas
- **Auditor de Seguridad:** Fase 2 → Fase 6 (3-5 semanas)
- **Asesor Legal:** Fase 1 + Fase 7 (disponible ongoing)
- **Proveedor Cloud (AWS/GCP):** Para Fase 5+ (account setup)
- **Alchemy / Infura:** Para RPC en producción

### Bloqueadores Potenciales
- ⚠️ Decisiones de producto sin cerrar (Fase 1 debe completar primero)
- ⚠️ Auditor externo no disponible (booking con tiempo)
- ⚠️ Encontrar 3 signatarios para multifirma (requerido Fase 7)
- ⚠️ Cambios regulatorios (ley blockchain en jurisdicción)

---

## ✅ CRITERIOS DE ACEPTACIÓN

### Criterio Global
Cuando alguien clona el repo en machine limpia:
```bash
bash scripts/local-deploy.sh          # ✅ Instala todo
npm run dev                           # ✅ Frontend en http://localhost:3000
make contracts-test                   # ✅ 150+ tests pasan, 0 failures
curl http://localhost:3000/api/health # ✅ 200 OK
# → Puede registrar socio, votar propuesta, crear propuesta → TODO FUNCIONA
```

### Por Fase

**Fase 0:** README funcional, repo limpio, 1 commit  
**Fase 1:** 6 archivos de decisión firmados, 0 ambigüedades  
**Fase 2:** `forge test` 150+ tests ✅, `slither` 0 críticos  
**Fase 3:** `npm test` 30+ tests ✅, autenticación por firma verificada  
**Fase 4:** 8 páginas funcionales, E2E 15+ tests ✅  
**Fase 5:** `bash scripts/local-deploy.sh` one-click, smoke tests en Amoy ✅  
**Fase 6:** Auditoría 0 críticos, cobertura 95%+ Solidity, `ACCEPTANCE_SIGN_OFF.md` firmado  
**Fase 7:** Multifirma operativa, monitoreo 24/7 activo, go-live aprobado

---

## 🚨 RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|--------|-----------|
| Auditor externo desestima contratos | Media | Alto | Incluir review interna temprana (Fase 2 week 2) |
| Cambios regulatorios DAO | Baja | Crítico | Asesor legal monitoring ongoing |
| Falta de socios en piloto | Media | Medio | Reclutar internamente primero (empleados, amigos) |
| Fallo de relayer en producción | Media | Alto | Fallback manual + 2 instancias redundantes |
| BD crece sin control | Baja | Medio | Archiving strategy + índices |
| Descubrimiento de vulnerabilidad post-launch | Baja | Crítico | Pause deposits, emergency multisig withdraw, auditor hotline |

---

## 📋 APROBACIÓN

**Este plan requiere tu firma de aprobación en los siguientes puntos:**

- [ ] **Autorizo** que comience Fase 0 (Línea Base)
- [ ] **Apruebo** el equipo de 6-8 personas propuesto
- [ ] **Acepto** el cronograma de ~13 semanas
- [ ] **Confirmo** que los 6 directivos serán signatarios de multifirma (Fase 7)
- [ ] **Asigno** presupuesto para auditor externo ($5-15k USD) y hosting cloud
- [ ] **Designo** Product Owner responsable de decisiones (Fase 1)
- [ ] **Autorizo** contratación de auditor de seguridad especializado

---

**Fecha de aprobación:** _______________  
**Firma:** _______________  
**Nombre:** _______________

---

