# Guía de Deployment - DAO Voting Platform

## Paso 1: Iniciar red local

Abre una terminal y ejecuta Anvil (viene con Foundry):

```bash
anvil
```

Esto iniciará una blockchain local en `http://127.0.0.1:8545` y te dará 10 cuentas con 10,000 ETH cada una.

**Copia una de las private keys** que Anvil muestra (por ejemplo, la primera).

## Paso 2: Configurar environment para deployment

```bash
cd sc
cp .env.example .env
```

Edita `sc/.env` con:

```env
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
RPC_URL=http://127.0.0.1:8545
MINIMUM_BALANCE=100000000000000000
```

(La private key de arriba es la primera cuenta por defecto de Anvil)

## Paso 3: Deploy de contratos

```bash
cd sc

# Verificar que los contratos compilan
forge build

# Ejecutar tests
forge test

# Deploy
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**IMPORTANTE**: Después del deployment, verás en la consola algo como:

```
MinimalForwarder deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
DAOVoting deployed at: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

**Copia estas direcciones**, las necesitarás en el siguiente paso.

## Paso 4: Configurar la Web App

```bash
cd ../web
cp .env.example .env.local
```

Edita `web/.env.local` con las direcciones que obtuviste:

```env
# Direcciones de los contratos deployados
NEXT_PUBLIC_DAO_CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_FORWARDER_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Relayer (puede ser la misma cuenta que deployó)
RELAYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
RELAYER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Red local
RPC_URL=http://127.0.0.1:8545
```

## Paso 5: Generar ABIs para la web

```bash
cd ../sc
jq -r '.abi' out/DAOVoting.sol/DAOVoting.json > ../web/src/lib/DAOVoting.abi.json
jq -r '.abi' out/MinimalForwarder.sol/MinimalForwarder.json > ../web/src/lib/MinimalForwarder.abi.json
```

## Paso 6: Iniciar la aplicación web

```bash
cd ../web
npm install
npm run dev
```

La app estará en `http://localhost:3000`

## Paso 7: Configurar MetaMask

1. Abre MetaMask
2. Ve a Settings → Networks → Add Network
3. Configura:
   - **Network Name**: Localhost
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH

4. Importa una cuenta de Anvil:
   - Click en el icono de cuenta
   - "Import Account"
   - Pega una private key de Anvil (usa una diferente a la del relayer)
   - Ejemplo: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` (segunda cuenta)

## Paso 8: Usar la aplicación

1. **Conectar wallet**: Click en "Connect Wallet"
2. **Depositar al DAO**: Deposita al menos 0.1 ETH para poder votar
3. **Fondear el DAO**: El contrato necesita fondos para las propuestas. Deposita varios ETH.
4. **Crear propuesta**:
   - Necesitas al menos 10% del balance del contrato
   - Ingresa recipient, amount, duration, description
   - ¡Votación gasless!
5. **Votar**: Las votaciones son gasless, el relayer paga el gas
6. **Ejecución automática**: El daemon ejecutará propuestas aprobadas automáticamente

## Troubleshooting

### Error: "Insufficient balance to create proposal"
- Asegúrate de que tu cuenta tenga al menos 10% del balance del DAO contract
- El DAO contract debe tener fondos

### Error: "ENS name not configured"
- Verifica que las direcciones en `.env.local` estén correctas
- Asegúrate de que los contratos estén deployados en la red correcta

### Error: "User rejected transaction"
- Acepta la firma en MetaMask (no cuesta gas para votar)

### Daemon no ejecuta propuestas
- Verifica que la propuesta esté aprobada (forVotes > againstVotes)
- Verifica que haya pasado el voting deadline + execution delay
- Revisa logs en la consola del navegador

## Testing con múltiples cuentas

Para probar el sistema completo:

1. Importa 3-4 cuentas de Anvil en MetaMask
2. Desde la cuenta principal, deposita fondos al DAO
3. Crea una propuesta
4. Cambia de cuenta en MetaMask para votar
5. Observa cómo el daemon ejecuta la propuesta aprobada

## Deployment a Testnet (Sepolia)

```bash
# En sc/.env
PRIVATE_KEY=<tu-private-key-real>
RPC_URL=https://sepolia.infura.io/v3/<tu-infura-key>

# Deploy
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify \
  --etherscan-api-key <tu-etherscan-key>
```

Luego actualiza `web/.env.local` con las nuevas direcciones.
