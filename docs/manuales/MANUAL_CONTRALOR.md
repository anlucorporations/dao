# 📗 Manual de Auditoría Criptográfica y Control de Membresías

Guía técnica para la verificación on-chain de inscripciones de socios y firmas de meta-transacciones.

---

## 🛡️ Auditoría de Registro de Socios (3.0 ETH)

1. **Requisito de Certificación**: Cada socio debe poseer un registro activo en el mapeo `isMember[wallet] == true` en el contrato `DAOVoting.sol`.
2. **Depósito en Tesorería**: La membresía requiere transferir un valor exacto de `3.0 ETH` al invocar `registerMember()`.
3. **Inscripción Inicial**: Al inicializar la red o nodo local Anvil, la cuenta del **Deployer / Owner** queda inscrita automáticamente con 3 ETH.

---

## 🔐 Auditoría de Firmas Off-Chain EIP-712

- Todas las meta-transacciones utilizan la verificación del `MinimalForwarder.sol`.
- **Estructura Transparente**: El mensaje EIP-712 codifica los campos `accion` y `detalles` para que el socio valide exactamente lo que firma antes de enviar la instrucción al Relayer.
- **Prevención de Replay Attacks**: Se verifica que `req.nonce` coincida exactamente con el nonce almacenado en `MinimalForwarder.getNonce(from)`.
