# 🧪 Plan de Pruebas Manuales y Casos de Verificación — DAO Gasless

Este documento guía la ejecución de pruebas de aceptación del usuario para certificar el correcto funcionamiento de la plataforma DAO.

---

## Casos de Prueba (Test Scenarios)

### CP-01: Conexión de Billetera e Inscripción de Socio (3.0 ETH)
- **Objetivo**: Verificar que una billetera no inscrita sea redirigida y pueda completar el depósito de 3.0 ETH.
- **Pasos**:
  1. Conectar MetaMask con una cuenta sin registro previo en Anvil o Cloud Run.
  2. Confirmar que la app muestre la opción **"🛡️ Inscribirse como Socio (3.0 ETH)"**.
  3. Confirmar la transacción en MetaMask.
- **Resultado Esperado**: La transacción concluye con éxito, la cuenta recibe la certificación de socio y accede al Dashboard.

### CP-02: Creación de Propuesta con Firma Legible EIP-712
- **Objetivo**: Verificar que la ventana de firma de MetaMask despliegue los detalles del proyecto en texto claro.
- **Pasos**:
  1. Ir a `/dashboard/proposals/create` e ingresar Título, Beneficiario, Monto ETH y Descripción.
  2. Seleccionar la opción **⚡ Sin Gas (Meta-Transacción Relayer)** y presionar **Crear Propuesta**.
- **Resultado Esperado**: MetaMask muestra la solicitud EIP-712 con los campos `Acción: 🛡️ Creación de Propuesta DAO` y la descripción legible del proyecto.

### CP-03: Votación Gasless y Regla de Voto Único Inmutable
- **Objetivo**: Probar la emisión de voto sin pagar gas y la restricción contra votos duplicados.
- **Pasos**:
  1. En `/dashboard/voting`, seleccionar una propuesta activa y presionar **👍 A FAVOR**.
  2. Confirmar la firma EIP-712 en MetaMask (sin cobro de gas).
  3. Tras la confirmación, intentar emitir un segundo voto en la misma propuesta.
- **Resultado Esperado**: El primer voto queda registrado con éxito. Al intentar votar nuevamente, la app bloquea la acción indicando `🔒 Voto Definitivo Registrado` y el contrato revierte cualquier intento de duplicación.

### CP-04: Cierre del Modal Flotante de Expediente
- **Objetivo**: Verificar la usabilidad del modal de detalle de propuesta.
- **Pasos**:
  1. Abrir cualquier propuesta haciendo clic en **Ver Detalle**.
  2. Presionar el botón `✕ Cerrar` en la cabecera, o el botón `✕ Cerrar Expediente` en el pie, o la tecla `Escape`, o pulsar fuera del panel.
- **Resultado Esperado**: El modal se cierra suavemente regresando a la vista principal sin alterar el estado.

### CP-05: Ejecución y Desembolso Automático de Fondos
- **Objetivo**: Certificar la transferencia de ETH al beneficiario al finalizar la votación.
- **Pasos**:
  1. Esperar la conclusión del periodo de votación de una propuesta ganadora.
  2. Presionar **🚀 Ejecutar Propuesta** o permitir que el Daemon `/api/daemon` la procese.
- **Resultado Esperado**: El balance del beneficiario incrementa en el monto exacto en ETH y la propuesta pasa al estado `🚀 Ejecutada & Desembolsada`.
