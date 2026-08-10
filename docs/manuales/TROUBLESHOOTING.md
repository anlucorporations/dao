# 🔍 Guía de Solución de Problemas (Troubleshooting)

Resolución de incidencias comunes en el desarrollo y uso de la plataforma DAO Gasless.

---

## 1. Error: `Solo el Owner de la DAO esta autorizado para ejecutar propuestas manualmente`
- **Causa**: Se intentó llamar a `executeProposal()` desde una billetera distinta a la del Owner (`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`).
- **Solución**: Conecta la billetera del Owner / Administrador en MetaMask para realizar la ejecución manual y desembolso de fondos ETH de propuestas aprobadas.

## 2. Error: `Firma EIP-712 invalida o no coincide con el emisor`
- **Causa**: Discrepancia entre los campos firmados por el usuario en MetaMask y el payload enviado al endpoint `/api/relay`.
- **Solución**: Asegurar que los campos `request.accion` y `request.detalles` se incluyan exactamente igual en el payload JSON que procesa el relayer backend.

## 3. Error: `El usuario ya esta inscrito como socio de la DAO`
- **Causa**: Intento de re-inscripción en una billetera activa.
- **Solución**: La interfaz valida `checkIsMember()` previamente y redirige directamente al Dashboard de socio.

## 4. Error: `Nonce desactualizado` en Relayer
- **Causa**: Envío concurrente de múltiples firmas EIP-712 antes del minado del bloque previo.
- **Solución**: El endpoint `/api/relay` utiliza un cerrojo de concurrencia (`userLocks`) por dirección pública para garantizar el incremento ordenado de nonces.
