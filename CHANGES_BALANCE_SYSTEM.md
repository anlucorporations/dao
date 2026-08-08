# Cambios: Sistema de Balance Interno

## Problema Identificado

El contrato original verificaba el balance de la wallet del usuario (`sender.balance`), pero no mantenía un registro de cuánto había depositado cada usuario al DAO. Esto causaba problemas de lógica:

1. Usuarios podían votar sin haber depositado al DAO
2. No había forma de rastrear la participación de cada usuario
3. Las funciones `deposit()`, `receive()` y `fallback()` no actualizaban ningún balance interno

## Solución Implementada

### 1. Smart Contract (DAOVoting.sol)

#### Nuevo Mapping de Balances

```solidity
mapping(address => uint256) public balances; // Balance de cada usuario en el DAO
```

#### Funciones Actualizadas

**deposit():**
```solidity
function deposit() external payable {
    require(msg.value > 0, "Must send ETH");
    address sender = _msgSender();
    balances[sender] += msg.value;  // ✅ Actualiza balance interno
    emit FundsDeposited(sender, msg.value);
}
```

**receive():**
```solidity
receive() external payable {
    balances[msg.sender] += msg.value;  // ✅ Actualiza balance interno
    emit FundsDeposited(msg.sender, msg.value);
}
```

**fallback():**
```solidity
fallback() external payable {
    if (msg.value > 0) {
        balances[msg.sender] += msg.value;  // ✅ Actualiza balance interno
        emit FundsDeposited(msg.sender, msg.value);
    }
}
```

#### Verificaciones Actualizadas

**createProposal():**
```solidity
// Antes: require(sender.balance >= requiredBalance, ...)
// Ahora:
require(balances[sender] >= requiredBalance, "Insufficient balance to create proposal");
```

**vote():**
```solidity
// Antes: require(sender.balance >= minimumBalance, ...)
// Ahora:
require(balances[sender] >= minimumBalance, "Insufficient balance to vote");
```

#### Nueva Función

```solidity
function getUserBalance(address _user) external view returns (uint256) {
    return balances[_user];
}
```

### 2. Tests Actualizados (DAOVoting.t.sol)

**setUp():**
- Los usuarios ahora depositan ETH al DAO durante el setup
- Alice deposita 50 ETH, Bob 30 ETH, Charlie 20 ETH
- Total en DAO: 100 ETH

**Nuevos Tests:**
- Verifican que `getUserBalance()` retorna el balance correcto
- Verifican que usuarios sin balance suficiente no pueden votar/crear propuestas

### 3. Frontend (web/)

#### DAOStats.tsx

**Nuevos Estados:**
```typescript
const [userBalance, setUserBalance] = useState('0');
const [userAddress, setUserAddress] = useState<string | null>(null);
```

**Nueva UI:**
```tsx
<div className="bg-purple-50 p-4 rounded-lg mb-6">
  <div className="text-sm text-gray-600 mb-1">Your Balance in DAO</div>
  <div className="text-xl font-bold text-purple-600">
    {parseFloat(userBalance).toFixed(4)} ETH
  </div>
  <div className="text-xs text-gray-500 mt-1">
    {((parseFloat(userBalance) / parseFloat(balance)) * 100).toFixed(2)}% of total
  </div>
</div>
```

#### CreateProposal.tsx

**Verificación Actualizada:**
```typescript
const userBalanceInDAO = await daoContract.getUserBalance(userAddress);
const contractBalance = await daoContract.getBalance();
const requiredBalance = (contractBalance * BigInt(10)) / BigInt(100);

if (userBalanceInDAO < requiredBalance) {
  throw new Error(
    `You need at least ${ethers.formatEther(requiredBalance)} ETH deposited in the DAO...`
  );
}
```

## Beneficios

1. ✅ **Transparencia**: Cada usuario sabe exactamente cuánto ha depositado
2. ✅ **Seguridad**: Solo usuarios que depositaron pueden participar
3. ✅ **Tracking**: Se puede rastrear la participación de cada usuario
4. ✅ **Porcentaje**: Se muestra el % de participación del usuario
5. ✅ **Correctitud**: Las validaciones ahora usan el balance interno correcto

## Cómo Usar

### Usuario

1. **Depositar al DAO:**
   ```
   - Conectar wallet
   - Ir a "DAO Treasury"
   - Ingresar cantidad y click "Deposit to DAO"
   - Confirmar transacción en MetaMask
   ```

2. **Ver tu balance:**
   ```
   - Automáticamente se muestra en "Your Balance in DAO"
   - Incluye porcentaje del total
   ```

3. **Crear propuesta:**
   ```
   - Requiere tener ≥10% del balance total del DAO
   - El sistema verifica tu balance depositado
   ```

4. **Votar:**
   ```
   - Requiere tener ≥ balance mínimo (0.1 ETH por defecto)
   - El sistema verifica tu balance depositado
   ```

### Desarrollador

**Consultar balance de un usuario:**
```solidity
uint256 balance = dao.getUserBalance(userAddress);
```

**Consultar balance en frontend:**
```typescript
const daoContract = getDAOContract(signer);
const userBalance = await daoContract.getUserBalance(userAddress);
```

## Tests

Todos los tests pasan con los nuevos cambios:

```bash
forge test
# ✅ 17 tests passed
```

## Migración

Si ya tienes contratos deployados:

1. Re-deployar con el nuevo código
2. Los usuarios deben depositar nuevamente para obtener balance interno
3. Actualizar ABIs en el frontend
4. Los balances antiguos no se migran automáticamente

## Archivos Modificados

- ✅ `sc/src/DAOVoting.sol`
- ✅ `sc/test/DAOVoting.t.sol`
- ✅ `web/src/components/DAOStats.tsx`
- ✅ `web/src/components/CreateProposal.tsx`
- ✅ `web/src/lib/DAOVoting.abi.json` (regenerado)

## Próximos Pasos

Para usar el sistema actualizado:

```bash
# 1. Re-deployar contratos
./deploy-local.sh

# 2. Iniciar web
cd web
npm run dev

# 3. Depositar ETH al DAO para participar
```
