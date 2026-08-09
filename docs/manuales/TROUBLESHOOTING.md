# 🔍 Guía de Solución de Problemas (Troubleshooting)

Resolución de incidencias comunes en el desarrollo y uso de la plataforma DAO Gasless.

---

## 1. Error: `execution reverted: El usuario ya esta inscrito como socio de la DAO`
- **Causa**: Se intentó llamar a `registerMember()` en una cuenta que ya pagó los 3 ETH.
- **Solución**: La interfaz ahora pre-verifica `checkIsMember()` antes de enviar la transacción. Si ya estás inscrito, ingresa directamente al Dashboard.

## 2. Error: `BAD_DATA (value="0x")`
- **Causa**: Incompatibilidad del proveedor Web3 del navegador cuando la red seleccionada en MetaMask no coincide con la red del nodo RPC.
- **Solución**: Se implementó un fallback a `JsonRpcProvider(RPC_URL)` en `src/lib/web3.ts` para asegurar lecturas on-chain robustas siempre.

## 3. Error: `Nonce desactualizado` en Relayer
- **Causa**: Se envió una nueva firma antes de que la transacción previa fuera minada.
- **Solución**: El endpoint `/api/relay` incluye un cerrojo de concurrencia (`userLocks`) por dirección pública para prevenir colisiones de nonce.
