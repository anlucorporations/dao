# 📡 Documentación de Endpoints API — DAO Gasless

Especificación de los endpoints HTTP provistos por el servidor Next.js 15.

---

## 1. POST `/api/relay`
Recibe y transmite una meta-transacción firmada mediante EIP-712.

### Body (JSON):
```json
{
  "request": {
    "from": "0x...",
    "to": "0x...",
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

### Respuesta Exitosa (200 OK):
```json
{
  "success": true,
  "txHash": "0x...",
  "blockNumber": 123
}
```

---

## 2. GET `/api/daemon`
Verifica y ejecuta de forma automática las propuestas aprobadas cuyo periodo de votación ha concluido.
