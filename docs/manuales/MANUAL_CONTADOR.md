# 📙 Manual de Administración de Infraestructura y Servidor Relayer

Guía para la gestión del servicio Relayer EIP-2771, configuración de nodos RPC y despliegue en la nube.

---

## ⚡ Administración del Servidor Relayer (`/api/relay`)

El endpoint `/api/relay` actúa como el motor que procesa y financia el gas de las meta-transacciones de los socios:
- **Variable de Entorno Privada**: `RELAYER_PRIVATE_KEY` almacena la clave privada de la wallet administradora que paga las comisiones de gas.
- **Lock Anti-Concurrencia**: Previene conflictos de nonce mediante un cerrojo en memoria (`userLocks.add(userAddress)`).
- **Procesamiento de Firma**: Invoca `forwarder.execute(forwardRequest, signature)` enviando el payload al contrato `MinimalForwarder.sol`.

---

## 🤖 Configuración del Daemon de Ejecución (`/api/daemon`)

- El Daemon consulta periódicamente la blockchain para identificar propuestas aprobadas cuyo plazo ha vencido.
- Invoca la función `executeProposal(id)` para realizar el desembolso automático de la tesorería al beneficiario.
