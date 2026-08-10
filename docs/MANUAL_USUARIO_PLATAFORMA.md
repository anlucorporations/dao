# 👤 Manual de Usuario — Plataforma DAO Gasless EIP-2771

Bienvenido a la guía oficial de usuario para interactuar con la plataforma **DAO Gasless con Gobernanza Descentralizada**.

---

## 1. Conexión de Billetera y Certificación de Membresía

1. **Ingreso a la Aplicación**: Navega a `http://localhost:3000` (entorno local) o a la URL pública en Cloud Run.
2. **Conectar MetaMask**: Haz clic en **"Conectar Wallet"** en la barra superior del Dashboard.
3. **Inscripción de Socio (3.0 ETH)**:
   - Si tu dirección no está registrada como socio, verás la pantalla de verificación de membresía.
   - Haz clic en **"🛡️ Inscribirse como Socio (3.0 ETH)"** y confirma el depósito en MetaMask.
   - Una vez procesada la transacción, obtendrás el estado de **Socio Certificado** y acceso completo al sistema.

---

## 2. Creación de Propuestas

1. Ingresa a la pestaña **"Crear Propuesta"** en el menú lateral.
2. Completa los campos solicitados: Título, Billetera Beneficiaria, Monto en ETH, Plazo de Votación y Memoria Justificativa.
3. Elige la modalidad de transmisión:
   - **⚡ Sin Gas (EIP-712 Relayer)**: Firmarás un mensaje estructurado en MetaMask sin costo de comisiones de red. El Owner actúa como patrocinador de gas.
   - **⛽ Directo**: Transacción tradicional pagando las tarifas de gas de la blockchain.
4. Presiona **"Crear Propuesta"** y confirma en MetaMask.

---

## 3. Emisión de Votos y Unanimidad (100%)

1. Dirígete a **"Centro de Votación"** (`/dashboard/voting`).
2. Haz clic en **"Ver Detalle / Votar"** sobre la propuesta activa.
3. Selecciona tu opción de voto:
   - **👍 A FAVOR**
   - **👎 EN CONTRA**
   - **⚪ ABSTENCIÓN**
4. Firma la transacción (modalidad Gasless o Directa).
5. **Cierre por Unanimidad del 100%**: Si el 100% de los socios inscritos en la DAO aprueban por unanimidad una propuesta, el periodo de votación concluye inmediatamente sin esperar la fecha límite.

---

## 4. Ejecución de Propuestas Aprobadas (Exclusiva del Owner)

- **Regla de Autorización**: La ejecución manual de propuestas finalizadas y aprobadas está **restringida exclusivamente a la billetera del Owner / Administrador** (`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`).
- **Vista para Socios Convencionales**: Los socios verán la insignia de estado:
  `🔒 Propuesta Aprobada. La ejecución manual está reservada exclusivamente a la billetera del Owner`.
- **Vista para la Wallet del Owner**: El Owner visualizará el botón **"🚀 Ejecutar Propuesta y Desembolsar ETH (Acción de Owner)"**, permitiéndole realizar el desembolso de fondos al beneficiario en cualquier momento.

---

## 5. Menú de Notificaciones en Vivo 🔔

En la barra superior del Dashboard se ubica el **Menú de Notificaciones**:
- **Campana de Alertas 🔔**: Muestra un contador en tiempo real con las alertas no leídas.
- **Eventos Notificados**:
  - 🏁 Finalización de votaciones.
  - ⚡ Aprobación por Unanimidad (100%).
  - ⚖️ Activación del 2º Periodo de Votación (Repechaje).
- **Acciones**: Permite marcar notificaciones como leídas o borrar el historial.

---

## 6. Histórico de Propuestas y Resumen Metodológico

En la sección **"Histórico de Propuestas"** (`/dashboard/proposals`):
- Muestra el listado de **todas las propuestas registradas** en la historia de la DAO.
- Encabezado con 5 tarjetas métricas:
  1. **Total Creadas**
  2. **Total Concluidas**
  3. **Aprobadas / Ejecutadas** (con suma total de ETH desembolsado)
  4. **Rechazadas**
  5. **En Abstención**
- Filtros por estatus: *Todas*, *Activas*, *Ejecutadas*, *Aprobadas Pendientes*, *Rechazadas*, *Abstención*.

---

## 7. Panel de Administración de Sistema (`/dashboard/system`)

Sección reservada exclusivamente al **Owner / Administrador**:
- **Saldos en ETH de Contratos**: Tarjetas informativas con los fondos de `DAOVoting.sol` (Tesorería) y `MinimalForwarder.sol`.
- **Supervisión de Gas Relayer**: Balance en ETH de la wallet patrocinadora de gas.
- **Buscador de Socios**: Inspección criptográfica del estado de membresía y saldos de cualquier dirección Ethereum (`0x...`).
