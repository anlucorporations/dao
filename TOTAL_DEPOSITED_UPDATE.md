# Actualización: Variable `totalDeposited`

## Problema

El contrato usaba `address(this).balance` para verificaciones, pero esto incluye todo el ETH del contrato (incluso ETH que podría llegar de otras fuentes). No teníamos una variable que rastreara específicamente cuánto han depositado los usuarios.

## Solución

### 1. Nueva Variable de Estado

```solidity
uint256 public totalDeposited; // Balance total depositado por todos los usuarios
```

Esta variable rastrea la suma de todos los depósitos de usuarios en el DAO.

### 2. Actualización en Funciones de Depósito

**deposit():**
```solidity
function deposit() external payable {
    require(msg.value > 0, "Must send ETH");
    address sender = _msgSender();
    balances[sender] += msg.value;
    totalDeposited += msg.value;  // ✅ Incrementa el total
    emit FundsDeposited(sender, msg.value);
}
```

**receive():**
```solidity
receive() external payable {
    balances[msg.sender] += msg.value;
    totalDeposited += msg.value;  // ✅ Incrementa el total
    emit FundsDeposited(msg.sender, msg.value);
}
```

**fallback():**
```solidity
fallback() external payable {
    if (msg.value > 0) {
        balances[msg.sender] += msg.value;
        totalDeposited += msg.value;  // ✅ Incrementa el total
        emit FundsDeposited(msg.sender, msg.value);
    }
}
```

### 3. Uso de `totalDeposited` en Verificaciones

**createProposal():**
```solidity
// Antes: (address(this).balance * 10) / 100
// Ahora:
uint256 requiredBalance = (totalDeposited * PROPOSAL_CREATION_THRESHOLD) / 100;
require(balances[sender] >= requiredBalance, "Insufficient balance to create proposal");

// Antes: _amount <= address(this).balance
// Ahora:
require(_amount <= totalDeposited, "Insufficient DAO funds");
```

**executeProposal():**
```solidity
// Antes: require(address(this).balance >= proposal.amount, ...)
// Ahora:
require(totalDeposited >= proposal.amount, "Insufficient DAO balance");

proposal.executed = true;
totalDeposited -= proposal.amount; // ✅ Reduce el total al transferir
```

**canExecute():**
```solidity
// Antes: address(this).balance >= proposal.amount
// Ahora:
totalDeposited >= proposal.amount
```

### 4. Nuevas Funciones Getter

```solidity
/**
 * @dev Get total deposited balance in the DAO
 */
function getBalance() external view returns (uint256) {
    return totalDeposited;  // Ahora retorna totalDeposited
}

/**
 * @dev Get actual ETH balance of the contract
 */
function getContractBalance() external view returns (uint256) {
    return address(this).balance;  // Por si se necesita el balance real
}

/**
 * @dev Get total deposited amount
 */
function getTotalDeposited() external view returns (uint256) {
    return totalDeposited;
}
```

## Diferencias Clave

### `totalDeposited` vs `address(this).balance`

| Aspecto | `totalDeposited` | `address(this).balance` |
|---------|-----------------|------------------------|
| **Qué representa** | Suma de depósitos de usuarios | ETH real en el contrato |
| **Se reduce al ejecutar propuesta** | ✅ Sí | ✅ Sí |
| **Incluye ETH de otras fuentes** | ❌ No | ✅ Sí |
| **Control preciso** | ✅ Sí | ❌ No |
| **Refleja participación DAO** | ✅ Sí | ⚠️ Puede incluir otros fondos |

## Ventajas

1. ✅ **Control Preciso**: Sabemos exactamente cuánto depositaron los usuarios
2. ✅ **Contabilidad Correcta**: `totalDeposited` refleja el "capital social" del DAO
3. ✅ **Verificaciones Precisas**: El 10% se calcula sobre fondos de usuarios, no ETH aleatorio
4. ✅ **Reduce al Ejecutar**: Cuando se ejecuta una propuesta, `totalDeposited` se reduce correctamente
5. ✅ **Transparencia**: Dos funciones distintas para consultar balances

## Flujo Completo

```
1. Usuario deposita 10 ETH
   → balances[user] += 10 ETH
   → totalDeposited += 10 ETH
   → address(this).balance += 10 ETH

2. Usuario crea propuesta de 5 ETH
   → Verifica: balances[user] >= (totalDeposited * 10) / 100
   → Verifica: 5 ETH <= totalDeposited

3. Propuesta se aprueba y ejecuta
   → totalDeposited -= 5 ETH
   → Transfiere 5 ETH al recipient
   → address(this).balance -= 5 ETH

Resultado:
- balances[user] = 10 ETH (no cambia, user sigue teniendo su stake)
- totalDeposited = 5 ETH (refle fondos disponibles)
- address(this).balance = 5 ETH (ETH real en contrato)
```

## Ejemplo Práctico

```solidity
// Escenario inicial
Alice deposita: 50 ETH
Bob deposita: 30 ETH
Charlie deposita: 20 ETH

totalDeposited = 100 ETH
balances[Alice] = 50 ETH
balances[Bob] = 30 ETH
balances[Charlie] = 20 ETH

// Alice quiere crear propuesta
requiredBalance = (100 * 10) / 100 = 10 ETH
balances[Alice] = 50 ETH >= 10 ETH ✅ Puede crear

// Alice crea propuesta de 15 ETH
15 ETH <= 100 ETH (totalDeposited) ✅ Hay fondos

// Propuesta se aprueba y ejecuta
totalDeposited = 100 - 15 = 85 ETH

// Nuevo estado
balances[Alice] = 50 ETH (sin cambio)
balances[Bob] = 30 ETH (sin cambio)
balances[Charlie] = 20 ETH (sin cambio)
totalDeposited = 85 ETH ✅

// Para próxima propuesta
requiredBalance = (85 * 10) / 100 = 8.5 ETH
Alice aún puede crear (50 >= 8.5) ✅
```

## Tests

Todos los tests pasan con los cambios:

```bash
forge test
# ✅ 17 tests passed
```

## Breaking Changes

⚠️ **Importante**: `getBalance()` ahora retorna `totalDeposited` en lugar de `address(this).balance`

Si el frontend usa `getBalance()`, funcionará correctamente porque ahora retorna el balance depositado (que es lo que debe mostrar).

## Migración

Si tienes contratos deployados:

1. **Re-deploy** el contrato con la nueva versión
2. **Actualizar ABI** en el frontend
3. Los usuarios deben **depositar nuevamente**

```bash
# Desde el root del proyecto
./deploy-local.sh
```

## Archivos Modificados

- ✅ `sc/src/DAOVoting.sol`
- ✅ `sc/test/DAOVoting.t.sol` (tests pasan)
- ✅ `web/src/lib/DAOVoting.abi.json` (regenerado)

## Próximos Pasos

El frontend ya está configurado para usar `getBalance()` y `getUserBalance()`, por lo que debería funcionar sin cambios adicionales.

Para usar:

```bash
# 1. Re-deployar
./deploy-local.sh

# 2. Iniciar web
cd web
npm run dev

# 3. Los balances se mostrarán correctamente
```
