# 📕 Manual del Socio Proponente y Administrador — Creación y Ejecución de Propuestas DAO

Este manual orienta a los socios certificados y al Owner de la DAO en la **creación de propuestas de financiamiento** y la **ejecución manual de resoluciones aprobadas**.

---

## 🎯 Rol y Capabilidades

1. **Socio Certificado (3.0 ETH inscritos)**:
   - Puede redactar y someter proyectos de financiamiento a la asamblea de socios.
   - Puede seleccionar entre modalidad **⚡ Sin Gas (EIP-712 Relayer)** o **⛽ Directa (Pagando Gas)**.
   - Puede votar en propuestas activas y recibir notificaciones de gobernanza.

2. **Owner / Administrador (`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`)**:
   - Actúa como patrocinador de las comisiones de gas del Relayer EIP-712.
   - Posee la **autorización exclusiva en el contrato inteligente `DAOVoting.sol`** para ejecutar manualmente propuestas finalizadas y aprobadas.

---

## 📝 Paso 1: Crear una Propuesta de Financiamiento

1. Conecta tu billetera MetaMask verificada en la plataforma.
2. Navega a la pestaña **"Crear Propuesta"** (`/dashboard/proposals/create`).
3. Ingresa los datos del formulario:
   - **Título**: Nombre descriptivo del proyecto.
   - **Beneficiario**: Dirección pública Ethereum (`0x...`) receptora de los fondos.
   - **Monto**: Cantidad exacta de Ether (ETH) solicitada.
   - **Duración de Votación**: Tiempo en días de votación.
   - **Justificación**: Exposición detallada de los motivos del proyecto.
4. Selecciona la modalidad: **⚡ Sin Gas (Relayer)** o **⛽ Directo**.
5. Haz clic en **"Crear Propuesta"** y confirma la firma EIP-712 en MetaMask.

---

## 🚀 Paso 2: Ejecución de Propuestas Aprobadas (Acción de Owner)

1. **Unanimidad (100%)**:
   - Si el 100% de los socios inscritos aprueban por unanimidad una propuesta (`forVotes == memberCount`), la votación se cierra inmediatamente.
   - El **Owner** puede ejecutar manualmente la propuesta en cualquier momento sin esperar el plazo de retardo.

2. **Mayoría Simple**:
   - Cuando transcurre el plazo de votación y el retardo de seguridad (1 día), la propuesta queda lista para ejecución.

3. **Ejecución On-Chain**:
   - El botón **"🚀 Ejecutar Propuesta y Desembolsar ETH (Acción de Owner)"** se habilita exclusivamente cuando el **Owner** conecta su billetera.
   - Al ejecutarla, el contrato transfiere los fondos ETH solicitados de la tesorería de la DAO al beneficiario.
