# 🚀 Manual de Inicio Rápido — DAO Gasless

Pone en marcha toda la plataforma localmente en menos de 3 minutos siguiendo estas instrucciones.

---

## Requisitos Previos

- **Node.js**: v18.x o v20.x
- **Foundry**: Herramientas `forge` y `anvil` instaladas
- **MetaMask**: Extensión instalada en el navegador

---

## Pasos de Ejecución Local

### Paso 1: Iniciar el Nodo Anvil Blockchain
Abre una terminal:
```bash
cd sc
anvil
```

### Paso 2: Desplegar Smart Contracts e Inscribir Owner (3 ETH)
Abre una segunda terminal:
```bash
cd sc
forge script script/Deploy.s.sol:DeployScript --rpc-url http://127.0.0.1:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Paso 3: Iniciar el Servidor Web Next.js 15
Abre una tercera terminal:
```bash
cd web
npm run dev
```

Ingresa en tu navegador: **[http://localhost:3000](http://localhost:3000)**

---

## Importar Cuentas de Prueba en MetaMask

- **Billetera del Owner (Cuenta #0 Anvil)**:
  - **Dirección**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
  - **Clave Privada**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
  - **Rol**: Owner / Administrador y Patrocinador de Gas (Relayer).

- **Red RPC en MetaMask**:
  - **Nombre de Red**: Anvil Localhost
  - **RPC URL**: `http://127.0.0.1:8545`
  - **Chain ID**: `31337`
  - **Símbolo**: `ETH`
