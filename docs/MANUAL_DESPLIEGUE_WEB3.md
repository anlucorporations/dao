# 🌐 Manual de Despliegue en Redes Web3 (Testnet Polygon Amoy & Mainnet)

Este manual guía en el proceso completo para compilar, verificar y desplegar la plataforma **DAO Los Cappones** en redes públicas Web3 (Testnets y Mainnet de Polygon / Ethereum) y servicios de alojamiento descentralizados.

---

## 1. Arquitectura de Despliegue Web3

```mermaid
graph TD
    subgraph Alojamiento Frontend
        FLEEK[IPFS / Fleek / Vercel]
        ENS[Dominio ENS / .eth]
    end

    subgraph Infraestructura Web3 Relayer
        RELAY[Servidor Relayer / Gelato / Biconomy]
        SIGNER[Wallet Admin Paga Gas POL/ETH]
    end

    subgraph Red Blockchain (Polygon Amoy / Mainnet)
        FWD[MinimalForwarder.sol]
        VOT[VotacionPropuestas.sol]
        TES[CooperativaCappones.sol]
        REG[ActaHashRegistry.sol]
    end

    FLEEK --> ENS
    FLEEK -->|Meta-Tx Firmada| RELAY
    RELAY --> SIGNER
    SIGNER -->|Submit Tx| FWD
    FWD --> VOT
    VOT --> TES & REG
```

---

## 2. Despliegue de Smart Contracts con Foundry

### 2.1 Variables de Entorno Requeridas (`contracts/.env`)

Crea un archivo `.env` dentro del directorio `contracts/`:

```env
# Clave privada del Owner/Deployer
PRIVATE_KEY=0x...
# RPC de Polygon Amoy Testnet (Chain ID 80002)
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
# API Key de Polygonscan para verificación de código fuente
POLYGONSCAN_API_KEY=YOUR_POLYGONSCAN_API_KEY
```

### 2.2 Ejecución del Despliegue en Polygon Amoy

Navega a la carpeta `contracts/` y ejecuta el script de despliegue con Foundry:

```bash
forge script script/DeployAmoy.s.sol:DeployAmoy \
  --rpc-url $AMOY_RPC_URL \
  --broadcast \
  --verify \
  --etherscan-api-key $POLYGONSCAN_API_KEY \
  -vvvv
```

### 2.3 Registro de Direcciones Desplegadas

El script generará el archivo `contracts/deployments/amoy.json` con las direcciones verificadas:

```json
{
  "FORWARDER_ADDRESS": "0x...",
  "ACTA_REGISTRY_ADDRESS": "0x...",
  "COOPERATIVA_ADDRESS": "0x...",
  "VOTACION_ADDRESS": "0x..."
}
```

---

## 3. Configuración del Servicio Relayer Gasless en Testnet/Mainnet

Para permitir votaciones **Gasless (sin cobro de comisiones al usuario)** en redes públicas:

1. **Fondeo de la Wallet Relayer:**
   - La wallet especificada en `ADMIN_PRIVATE_KEY` en la app web debe contar con un saldo mínimo de **POL / MATIC** (ej: 5-10 POL en Amoy) para pagar las tarifas de red.
2. **Actualización de Variables de Entorno Web (`web/.env.production`):**
   ```env
   NEXT_PUBLIC_CHAIN_ID=80002
   NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology
   NEXT_PUBLIC_FORWARDER_ADDRESS=0x... (Dirección de Amoy)
   NEXT_PUBLIC_COOPERATIVA_ADDRESS=0x... (Dirección de Amoy)
   NEXT_PUBLIC_VOTACION_ADDRESS=0x... (Dirección de Amoy)
   ADMIN_PRIVATE_KEY=0x... (Wallet Relayer con saldo POL)
   DATABASE_URL=postgresql://user:pass@postgres-host:5432/cooperativa_dao
   ```

---

## 4. Alojamiento Descentralizado del Frontend (IPFS / Fleek)

Para garantizar la resistencia a la censura de la interfaz de usuario:

### Opción A: Despliegue en IPFS vía Fleek CLI
1. Instala Fleek CLI: `npm install -g @fleek/cli`
2. Autentica tu cuenta: `fleek login`
3. Publica la compilación estática:
   ```bash
   cd web
   npm run build
   fleek site deploy
   ```

### Opción B: Enlace con Dominio ENS / Unstoppable Domains
1. Asocia el CID IPFS obtenido de Fleek en el registro `contenthash` de tu nombre de dominio ENS (ejemplo: `loscapponesdao.eth`).
2. Los usuarios podrán acceder directamente mediante navegadores Web3 o proxies IPFS (`https://loscapponesdao.eth.limo`).

---

## 5. Checklist de Verificación en Producción Web3

- [ ] Todos los Smart Contracts verificados en Polygonscan / Etherscan.
- [ ] Transferencia de ownership de `ActaHashRegistry.sol` ejecutada hacia `VotacionPropuestas.sol`.
- [ ] `cooperativa.setVotacionContract()` ejecutado en el contrato de tesorería.
- [ ] Balance del Relayer asegurado con alertas de fondos bajos.
- [ ] Base de datos PostgreSQL en servidor seguro con copias de respaldo automatizadas.
