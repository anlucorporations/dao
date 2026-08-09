# 🚀 Manual de Inicio Rápido — DAO Gasless

Sigue estos pasos sencillos para poner en marcha toda la plataforma localmente en menos de 3 minutos.

---

## Requisitos Previos

- **Node.js**: v18.x o v20.x
- **Foundry**: CLI de `forge` y `anvil` instalados
- **MetaMask**: Extensión instalada en el navegador

---

## Pasos de Ejecución Local

### Paso 1: Iniciar el Nodo Anvil
En una terminal:
```bash
cd sc
anvil
```

### Paso 2: Desplegar Smart Contracts
En una segunda terminal:
```bash
cd sc
forge script script/Deploy.s.sol:DeployScript --rpc-url http://127.0.0.1:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Paso 3: Iniciar el Frontend Web
En una tercera terminal:
```bash
cd web
npm run dev
```

Abre en tu navegador: `http://localhost:3000`

---

## Importar Cuenta de Prueba en MetaMask

Para probar con la cuenta del Owner (ya inscrita con 3 ETH):
- **Private Key**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **RPC URL**: `http://127.0.0.1:8545`
- **Chain ID**: `31337`
