# 📡 Documentación de Endpoints API — DAO Gasless EIP-2771

Especificación detallada de los endpoints HTTP provistos por el servidor Next.js 15 App Router.

---

## 1. POST `/api/relay`
Recibe y transmite transacciones sin gas (meta-transacciones) firmadas mediante el estándar EIP-712. El servicio actúa como relayer pagando las comisiones de gas.

### Request Body (JSON):
```json
{
  "request": {
    "from": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "to": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    "value": "0",
    "gas": "1000000",
    "nonce": "0",
    "accion": "🗳️ Emisión de Voto en Propuesta DAO",
    "detalles": "Propuesta ID: #1 | Decisión: 👍 A FAVOR",
    "data": "0x..."
  },
  "signature": "0x..."
}
```

### Response (200 OK):
```json
{
  "success": true,
  "txHash": "0xdb67a210ab2cc53e61d0e6008579cd405705d9b8338d2f413cc2ecc991f18f42",
  "blockNumber": 12
}
```

---

## 2. GET `/api/notifications`
Escanea los eventos on-chain de la blockchain y devuelve las notificaciones de gobernanza para la dirección del socio solicitante.

### Parámetros Query:
- `account` (`string`): Dirección Ethereum del socio (`0x...`).

### Response (200 OK):
```json
{
  "success": true,
  "notifications": [
    {
      "id": "notif-1786326800",
      "proposalId": 1,
      "title": "⚡ Propuesta #1 Aprobada por Unanimidad (100%)",
      "message": "El 100% de los socios aprueban la propuesta 'Financiamiento Desarrollo Web3'. Votación concluida.",
      "timestamp": 1786326800,
      "type": "unanimity"
    }
  ]
}
```

---

## 3. GET `/api/system/status`
Devuelve el estado operativo de la plataforma, información de la red RPC y los saldos nativos en ETH de todos los contratos inteligentes desplegados y de la wallet patrocinadora relayer.

### Response (200 OK):
```json
{
  "success": true,
  "daoContract": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  "forwarderContract": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "relayerAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "daoBalanceETH": "3.0",
  "forwarderBalanceETH": "0.0",
  "relayerBalanceETH": "9996.84",
  "proposalCount": 2,
  "memberCount": 2,
  "blockNumber": 15
}
```

---

## 4. GET `/api/system/members`
Permite consultar si una dirección Ethereum está certificada como socio de la DAO y su saldo en depósitos.

### Parámetros Query:
- `address` (`string`): Billetera Ethereum a consultar (`0x...`).

### Response (200 OK):
```json
{
  "success": true,
  "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "isMember": true,
  "depositedBalanceETH": "3.0"
}
```

---

## 5. GET `/api/daemon`
Servicio de verificación en segundo plano que revisa propuestas activas y monitorea eventos de gobernanza.
