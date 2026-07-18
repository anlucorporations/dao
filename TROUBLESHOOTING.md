# Troubleshooting Guide - DAO Voting Platform

## Error: "ENS name used for a contract target must be correctly configured"

**Causa**: Las direcciones de los contratos no están configuradas en `.env.local`

**Solución**:

### Opción 1: Script Automático (Recomendado)

```bash
# Terminal 1
anvil

# Terminal 2
./deploy-local.sh
```

### Opción 2: Manual

1. Verifica que Anvil esté corriendo:
```bash
anvil
```

2. Deploy de contratos:
```bash
cd sc
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

3. **Copia las direcciones** que aparecen en el output

4. Crea `web/.env.local`:
```env
NEXT_PUBLIC_DAO_CONTRACT_ADDRESS=0x... # Tu dirección aquí
NEXT_PUBLIC_FORWARDER_CONTRACT_ADDRESS=0x... # Tu dirección aquí
RELAYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
RELAYER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
RPC_URL=http://127.0.0.1:8545
```

5. Reinicia el servidor:
```bash
cd web
npm run dev
```

---

## Error: "missing revert data" o "CALL_EXCEPTION"

**Causas posibles**:
1. Dirección de contrato incorrecta
2. Contrato no deployado en esa dirección
3. Red incorrecta (Anvil no está corriendo)
4. ABIs desactualizados

**Soluciones**:

### 1. Verificar que Anvil está corriendo
```bash
curl http://127.0.0.1:8545
```

Si no responde, inicia Anvil:
```bash
anvil
```

### 2. Verificar direcciones en .env.local
```bash
cd web
cat .env.local
```

Asegúrate de que las direcciones sean válidas (formato 0x...)

### 3. Re-generar ABIs
```bash
cd sc
jq -r '.abi' out/DAOVoting.sol/DAOVoting.json > ../web/src/lib/DAOVoting.abi.json
jq -r '.abi' out/MinimalForwarder.sol/MinimalForwarder.json > ../web/src/lib/MinimalForwarder.abi.json
```

### 4. Re-deployar todo
```bash
./deploy-local.sh
```

---

## Error: "Insufficient balance to create proposal"

**Causa**: Tu cuenta no tiene al menos 10% del balance del contrato DAO

**Solución**:

1. Verifica el balance del DAO:
   - Mira la UI en "Treasury Balance"

2. Asegúrate de que tu cuenta tenga suficiente ETH:
   - Necesitas ≥ 10% del balance del DAO
   - Si el DAO tiene 100 ETH, necesitas ≥ 10 ETH en tu cuenta

3. Si usas cuentas de Anvil, todas tienen 10,000 ETH por defecto

---

## Error: "Insufficient balance to vote"

**Causa**: Tu cuenta no tiene el balance mínimo requerido (0.1 ETH por defecto)

**Solución**:

Usa una cuenta de Anvil que tenga fondos, o deposita al DAO primero.

---

## Error: MetaMask no se conecta

**Solución**:

1. Configura la red en MetaMask:
   - **Network Name**: Localhost
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH

2. Importa una cuenta de Anvil:
   - Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
   - (Cuenta #1 de Anvil)

---

## Error: Daemon no ejecuta propuestas

**Causas**:
- Propuesta no aprobada (forVotes ≤ againstVotes)
- Voting deadline no ha pasado
- Execution delay no ha pasado (1 día después del deadline)
- Contrato sin fondos suficientes

**Solución**:

1. Verifica el estado de la propuesta en la UI

2. Espera que pasen los tiempos:
   - Voting deadline
   - + 1 día (execution delay)

3. Para testing, puedes modificar el contrato para usar delays más cortos

4. Revisa logs del daemon en la consola del navegador

---

## Error: "User rejected transaction"

Esto es normal - significa que cancelaste la firma en MetaMask.

**Para votación**: La firma NO cuesta gas (es gratis), solo estás firmando el mensaje.

---

## Error: Compilación de contratos falla

```bash
cd sc
forge clean
forge build
```

Si persiste:
```bash
rm -rf lib cache out
forge install
forge build
```

---

## Error: npm install falla

```bash
cd web
rm -rf node_modules package-lock.json
npm install
```

---

## Verificar estado del sistema completo

### 1. Check Anvil
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://127.0.0.1:8545
```

### 2. Check environment variables
```bash
cd web
cat .env.local
```

### 3. Check ABIs exist
```bash
ls -la src/lib/*.abi.json
```

### 4. Rebuild everything
```bash
# Desde el root
./deploy-local.sh
cd web
npm run dev
```

---

## Logs útiles

### Ver logs del relayer
Abre la consola del navegador (F12) → Console

### Ver transacciones en Anvil
Anvil muestra todas las transacciones en su terminal

### Ver estado de contratos
Puedes usar cast:
```bash
cast call <DAO_ADDRESS> "getBalance()" --rpc-url http://127.0.0.1:8545
cast call <DAO_ADDRESS> "proposalCount()" --rpc-url http://127.0.0.1:8545
```

---

## Reset completo

Si nada funciona:

```bash
# 1. Matar Anvil (Ctrl+C)

# 2. Limpiar todo
cd sc
forge clean
rm -rf out cache broadcast

cd ../web
rm -rf .next node_modules .env.local
rm src/lib/*.abi.json

# 3. Reinstalar
cd web
npm install

# 4. Re-deployar
cd ..
anvil  # en otra terminal
./deploy-local.sh

# 5. Reiniciar web
cd web
npm run dev
```

---

## ¿Aún tienes problemas?

1. Verifica que tienes las versiones correctas:
   - Node.js ≥ 18
   - Foundry actualizado: `foundryup`

2. Lee los mensajes de error completos en la consola

3. Verifica los archivos:
   - `sc/.env` existe y tiene PRIVATE_KEY
   - `web/.env.local` existe y tiene las direcciones
   - ABIs existen en `web/src/lib/`

4. Usa el script automático: `./deploy-local.sh`
