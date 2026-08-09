# 📕 Manual del Socio Proponente — Creación y Ejecución de Propuestas DAO

Este manual orienta a los socios certificados de la DAO en la **creación de propuestas de financiamiento** y la **ejecución de resoluciones aprobadas**.

---

## 🎯 Rol y Capabilidades

En la arquitectura descentralizada de la DAO, todo **Socio Certificado (con 3.0 ETH inscritos)** puede:
- Crear propuestas de inversión o financiamiento para la comunidad.
- Seleccionar entre modalidad **⚡ Sin Gas (Meta-Transacción EIP-2771)** o **⛽ Directa (Pagando Gas)**.
- Firmar la creación utilizando la ventana de MetaMask con **información transparente en texto claro** (`accion` y `detalles`).
- Ejecutar propuestas aprobadas cuyos periodos de votación y retardo de ejecución hayan concluido exitosamente.

---

## 📝 Paso 1: Crear una Propuesta de Financiamiento

1. Conecta tu billetera MetaMask verificada en la plataforma.
2. Navega a la pestaña **"Crear Propuesta"** (`/dashboard/proposals/create`).
3. Ingresa los datos del formulario:
   - **Título**: Nombre descriptivo del proyecto.
   - **Beneficiario**: Dirección pública Ethereum (`0x...`) que recibirá el financiamiento.
   - **Monto**: Cantidad exacta de Ether (ETH) solicitada.
   - **Duración de Votación**: Tiempo en días durante el cual los socios podrán votar.
   - **Justificación**: Exposición detallada de los motivos y alcance del proyecto.
4. Selecciona la modalidad de envío: **⚡ Sin Gas (Relayer)** o **⛽ Directo**.
5. Haz clic en **"Crear Propuesta"**.
6. En MetaMask, verifica que la ventana de firma EIP-712 despliegue los detalles claros (`Acción: 🛡️ Creación de Propuesta DAO`) y presiona **"Firmar"**.

---

## 🚀 Paso 2: Ejecutar una Propuesta Aprobada

1. Cuando finaliza el plazo de votación y el periodo de retardo de seguridad:
   - Si los votos **A FAVOR** superan a los votos **EN CONTRA**, la propuesta adquiere el estado **"⏳ Aprobada (Lista p/ Ejecutar)"**.
2. Cualquier socio o el **Daemon de Ejecución** puede hacer clic en **"🚀 Ejecutar Propuesta"**.
3. El contrato `DAOVoting.sol` verifica las condiciones on-chain y transfiere automáticamente los fondos de la tesorería a la billetera del beneficiario.
