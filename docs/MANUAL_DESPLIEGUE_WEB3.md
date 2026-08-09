# 📜 Manual de Despliegue de Smart Contracts (Web3)

Instrucciones para desplegar y verificar los contratos inteligentes en redes locales (Anvil) y redes de prueba (Amoy / Sepolia).

---

## 1. Estructura de Contratos

- `sc/src/MinimalForwarder.sol`: Contrato forwarder EIP-2771 con soporte de parámetros legibles.
- `sc/src/DAOVoting.sol`: Contrato principal de gobernanza y tesorería.

---

## 2. Comando de Despliegue (Foundry)

```bash
cd sc
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Este script despliega ambos contratos y realiza la **inscripción automática de 3 ETH** para la cuenta del deployer.
