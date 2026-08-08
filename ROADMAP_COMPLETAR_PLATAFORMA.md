# Roadmap de Integridad y Finalización — Sistema DAO Los Cappones

**Fecha de auditoría:** 2026-08-01  
**Estado real:** prototipo parcial; **no apto** para despliegue, manejo de fondos ni producción.

## 1. Alcance de esta evaluación

Se evaluó el árbol de trabajo actual, la historia Git disponible, los contratos, las rutas API, el esquema Prisma, las pruebas y la documentación. Se contrastó con los requisitos acordados: cooperativa simple de usar, MetaMask, votación gasless, roles directivos, aportes, propuestas y siete fases de entrega.

La documentación declara una plataforma terminada (59 archivos, 60 pruebas y despliegue preparado). El árbol actual contiene 43 archivos funcionales/documentales y conserva cambios sin confirmar: se eliminaron archivos del frontend original y se agregaron, sin confirmar, los contratos, APIs, pruebas y documentos actuales.

## 2. Resultado de integridad

| Área | Hallazgo | Impacto | Estado |
|---|---|---|---|
| Control de versiones | Existe un único commit inicial; hay eliminaciones masivas y archivos nuevos sin confirmar. | No hay línea base confiable para restaurar ni revisar cambios. | Bloqueante |
| Aplicación web | Faltan `package.json`, configuración de TypeScript/Next, páginas, estilos y componentes. | No se puede instalar, compilar ni ejecutar el frontend. | Bloqueante |
| Dependencias Solidity | `remappings.txt` requiere OpenZeppelin y forge-std, pero `contracts/lib/` no existe. | Los contratos no pueden compilar de forma reproducible. | Bloqueante |
| Contratos | Los aportes quedan en `CooperativaCappones`, mientras que la ejecución paga desde `VotacionPropuestas`. | Una propuesta aprobada no tiene acceso a los fondos aportados. | Crítico |
| Gobernanza inicial | No hay inicialización segura del presidente/directivos; el presidente no puede postularse. | El flujo de creación de propuestas puede quedar bloqueado. | Crítico |
| Aporte de inscripción | Registrar un socio no exige ni valida el 2% inicial establecido como requisito. | Regla de negocio incumplida. | Alto |
| API/autenticación | La verificación de firma está comentada; varias operaciones aceptan una wallet declarada por el cliente. | Suplantación y modificación no autorizada. | Crítico |
| Relay gasless | La API usa campos (`propuestaId`, `voto`) que no forman parte de la petición del forwarder; además mezcla IDs UUID y on-chain. | Registro de votos inconsistente o fallido. | Crítico |
| Prisma | `Aval.directivoId` se usa para relaciones incompatibles con `Directivo` y `Socio`. | Migración/generación de cliente no fiable. | Alto |
| Actas | `verificarHash` busca actas por índices consecutivos, no por los IDs reales de propuesta. | Verificación incorrecta para IDs no consecutivos. | Alto |
| Ejecución automática | El daemon citado por los requisitos y documentación no existe en el árbol actual. | Propuestas aprobadas no se ejecutan automáticamente. | Alto |
| Pruebas | Hay 60 funciones `test*` en Solidity (23+22+7+8), pero no se han ejecutado; las pruebas E2E tampoco son ejecutables sin la app web. | Las afirmaciones de cobertura y aprobación no están verificadas. | Bloqueante |
| Despliegue | Faltan `Makefile`, `docker-compose.yml`, README y configuración de hosting citados por las guías. | La guía de despliegue no se puede seguir de extremo a extremo. | Bloqueante |

## 3. Decisiones de producto que deben cerrarse antes de codificar

1. **Custodia de fondos:** definir si el capital vive en un único contrato tesorería, en una multifirma o fuera de la cadena con el registro blockchain como auditoría. Para producción se recomienda una tesorería/multifirma, no una clave privada de administrador en el servidor.
2. **Poder de voto:** confirmar si cada socio tiene un voto o si el voto es ponderado por capital. La implementación actual usa un voto por wallet.
3. **Inscripción del 2%:** precisar la fórmula cuando el capital es cero, el activo de referencia (MATIC, stablecoin u otro) y quién valida el ingreso del socio.
4. **Gobernanza:** confirmar cargos, duración, remoción, quórum, plazo de propuestas, plazo de apelación y quién puede ejecutar gastos.
5. **Privacidad y normativa:** decidir qué datos personales son estrictamente necesarios, su retención y el responsable. Nunca guardar claves privadas ni secretos 2FA sin cifrado.
6. **Gasless:** elegir un único modelo compatible: ERC-2771 con relayer propio, o Biconomy compatible. No mezclar ambos sin una especificación de mensajes firmados.

## 4. Roadmap de ejecución

### Fase 0 — Recuperar una línea base confiable

**Objetivo:** convertir el estado actual en un repositorio revisable y reproducible.

- Crear una rama de trabajo y preservar el estado actual antes de restaurar o mover archivos.
- Clasificar cada archivo eliminado como: recuperar, reemplazar o retirar formalmente.
- Añadir `.gitignore` seguro y confirmar que no haya `.env`, claves privadas, secretos TOTP ni artefactos de compilación versionados.
- Crear un `README.md` mínimo con arquitectura, prerrequisitos y comandos que realmente existan.
- Definir estructura definitiva: `contracts/`, `web/`, `scripts/`, `docs/`, infraestructura local.

**Salida:** árbol limpio, cambios versionados, README coherente y ningún secreto rastreado.

### Fase 1 — Especificación ejecutable y modelo de seguridad

**Objetivo:** sustituir supuestos contradictorios por reglas aprobadas y comprobables.

- Redactar casos de uso y una máquina de estados para socio, candidatura, propuesta, apelación y ejecución.
- Diseñar modelo de amenazas: suplantación, replay, pérdida de wallet, abuso del relayer, retiro indebido, indisponibilidad del proveedor.
- Elegir arquitectura de tesorería y roles on-chain; definir inicialización del primer directorio.
- Definir el contrato de integración entre API, BD y blockchain: IDs, eventos, sincronización y fuente de verdad.
- Revisar la protección de datos personales y eliminar del diseño los datos no necesarios.

**Salida:** especificación aprobada, diagrama de arquitectura, modelo de datos validado y matriz de permisos.

### Fase 2 — Reconstrucción y aseguramiento de contratos

**Objetivo:** tener contratos compilables, auditables y alineados con las reglas acordadas.

- Instalar y bloquear versiones de OpenZeppelin y forge-std; añadir `foundry.lock` y dependencias documentadas.
- Rediseñar la tesorería: los fondos y la función de ejecución deben convivir o estar conectados mediante una interfaz con permisos explícitos.
- Implementar el aporte de inscripción del 2%, incluyendo el caso de capital inicial.
- Crear un mecanismo seguro de bootstrap para owner, presidente y roles iniciales.
- Corregir recuperación de wallet, expiración de cargos, lista de socios y verificación de hashes de actas.
- Añadir protección contra reentradas en transferencias y restringir quién puede ejecutar una propuesta aprobada.
- Rehacer o ampliar pruebas: propiedades, ataques de replay, autorización, quórum, fondos insuficientes, apelación y ejecución.

**Salida:** `forge build`, `forge test` y análisis estático aprobados; cobertura de reglas críticas y revisión manual de seguridad.

### Fase 3 — Base de datos y backend seguro

**Objetivo:** API compilable que no actúe por identidades declaradas por el cliente.

- Corregir el esquema Prisma y generar una migración inicial reproducible.
- Implementar autenticación por nonce, mensaje con dominio/caducidad y `ethers.verifyMessage` o EIP-712.
- Usar sesión segura después de autenticar; no confiar en `walletAddress` enviado en cada acción.
- Exigir autorización y 2FA para acciones administrativas; guardar secretos TOTP cifrados o gestionarlos externamente.
- Unificar IDs UUID de BD con IDs numéricos on-chain mediante una tabla/mapeo explícito.
- Definir el payload gasless de forma compatible con el forwarder; decodificar `data` en el servidor si necesita persistir un voto.
- Añadir validación de entrada, límites de tasa, auditoría, manejo correcto de IP (`x-forwarded-for`) y pruebas de rutas.

**Salida:** migraciones aplican en BD vacía; pruebas de API cubren autenticación, roles, replay y persistencia consistente.

### Fase 4 — Frontend accesible y flujo completo

**Objetivo:** recuperar una aplicación Next.js instalable y apta para socios no técnicos.

- Restaurar o reconstruir la base Next.js: dependencias, TypeScript, lint, estilos, layout y variables de entorno.
- Implementar onboarding MetaMask, alta de socio, aporte, dashboard, candidatura, propuestas, avales, votos y reportes según la especificación.
- Usar lenguaje simple, botones grandes, estados visuales, errores comprensibles y diseño móvil primero.
- Integrar voto gasless con feedback de firma, envío, confirmación y alternativa segura si el relayer no está disponible.
- Añadir pruebas de componentes y flujos E2E con datos/contratos locales controlados.

**Salida:** `npm ci`, lint, typecheck, build y E2E ejecutan correctamente desde cero.

### Fase 5 — Automatización, operaciones y despliegue de prueba

**Objetivo:** hacer reproducible el entorno local y probar una red de prueba sin prometer producción.

- Crear `docker-compose.yml` para PostgreSQL y servicios necesarios; añadir seed idempotente sin datos personales reales.
- Crear comandos reales (`Makefile` o scripts multiplataforma) para instalar, migrar, probar, desplegar local y desplegar Amoy.
- Implementar el servicio de cierre/ejecución como worker autenticado, job programado o automatización on-chain; documentar su operador y recuperación.
- Desplegar en Anvil primero; luego en Amoy con direcciones y verificación registradas.
- Configurar observabilidad: logs estructurados, alertas de saldo del relayer, errores de API y copias de seguridad de BD.

**Salida:** despliegue local y Amoy repetibles, checklist de smoke tests completado y evidencia de transacciones de prueba.

### Fase 6 — Calidad, seguridad y aceptación

**Objetivo:** sustituir las casillas documentales por evidencia verificable.

- Ejecutar y guardar resultados de unitarias Solidity, API, E2E, integración y carga.
- Hacer revisión de seguridad independiente antes de custodiar fondos reales.
- Probar restauración de backups, pérdida de wallet, relayer sin fondos y degradación del RPC.
- Realizar pruebas de usabilidad con socios reales; ajustar interfaz y manuales según observaciones.
- Actualizar toda documentación para que sólo describa funciones existentes y comprobadas.

**Salida:** informe de pruebas, incidencias resueltas o aceptadas explícitamente, aprobación funcional y de seguridad.

### Fase 7 — Producción controlada

**Objetivo:** migrar únicamente si las fases anteriores están cerradas con evidencia.

- Usar auditoría externa de contratos y multifirma para administración/tesorería.
- Separar secretos por entorno con gestor de secretos; rotar toda clave expuesta durante el prototipo.
- Ejecutar una prueba piloto con límites de monto, monitoreo intensivo y plan de reversión operativo.
- Definir soporte, responsables, capacitación y un proceso de cambios con revisión.

**Salida:** aprobación de go/no-go firmada, piloto exitoso y operación sostenible.

## 5. Orden inmediato recomendado

1. No desplegar ni cargar fondos en los contratos actuales.
2. Cerrar las seis decisiones de la sección 3.
3. Ejecutar Fase 0 y crear una rama/versionado confiable.
4. Resolver Fases 1 y 2 antes de invertir esfuerzo en UI o documentación adicional.
5. Rehabilitar el frontend y las pruebas solamente sobre una base de contratos y API definida.

## 6. Criterio de “plataforma completa”

El proyecto podrá declararse completo sólo cuando una clonación limpia pueda instalar dependencias, levantar BD, compilar contratos, ejecutar pruebas, iniciar la web, completar un flujo gasless en Anvil/Amoy y producir evidencia de todos esos pasos. Las afirmaciones documentales, por sí solas, no son criterio de aceptación.
