# 📡 DOCUMENTACIÓN DE API
## Cooperativa "Los Cappones" - Endpoints

**Base URL:** `https://loscappones.vercel.app/api` (producción)  
**Base URL:** `http://localhost:3000/api` (desarrollo)

---

## 🔐 Autenticación

Todos los endpoints requieren autenticación mediante **firma de wallet**.

### Headers requeridos:
```
Content-Type: application/json
```

### Body de autenticación:
```json
{
  "walletAddress": "0x...",
  "signature": "0x...",
  "message": "Mensaje firmado"
}
```

---

## 👤 AUTH

### POST `/api/auth`
Autentica un socio. Si es directivo, requiere 2FA.

**Request:**
```json
{
  "walletAddress": "0x2d3db17af7a2e9c256c9204ae8881d63ad1df833",
  "signature": "0x...",
  "message": "Login Los Cappones 2026-07-31",
  "token2FA": "123456"
}
```

**Response (éxito):**
```json
{
  "success": true,
  "socio": {
    "id": "uuid...",
    "nombre": "Angel Lucci",
    "wallet": "0x2d3d...f833",
    "esDirectivo": true,
    "cargo": "PRESIDENTE"
  }
}
```

**Response (2FA requerido):**
```json
{
  "error": "2FA requerido para directivos",
  "requiere2FA": true
}
```

---

### GET `/api/auth?wallet=...&adminKey=...`
Genera secreto TOTP para un directivo (solo admin).

**Query params:**
- `wallet`: Dirección del directivo
- `adminKey`: Clave de configuración del admin

**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "otpauth://totp/...",
  "message": "Escanea el QR con Google Authenticator"
}
```

---

## 🗳️ RELAY (Votación Gasless)

### POST `/api/relay`
Recibe un voto firmado y lo ejecuta en la blockchain.

**Request:**
```json
{
  "request": {
    "from": "0x...",
    "to": "0x...",
    "value": 0,
    "gas": 100000,
    "nonce": 0,
    "data": "0x..."
  },
  "signature": "0x...",
  "walletAddress": "0x..."
}
```

**Response (éxito):**
```json
{
  "success": true,
  "txHash": "0x...",
  "message": "Voto registrado exitosamente"
}
```

**Response (Plan B):**
```json
{
  "error": "Relayer sin fondos - activar Plan B",
  "activarPlanB": true
}
```

---

### GET `/api/relay`
Verifica estado del relayer.

**Response:**
```json
{
  "activo": true,
  "balance": "2.5",
  "wallet": "0x...",
  "red": "80002"
}
```

---

## 📋 PROPOSALS

### GET `/api/proposals`
Lista propuestas con filtros.

**Query params:**
- `estado`: BORRADOR, POR_DISCUTIR, APROBADA, RECHAZADA, APELADA
- `tipo`: INVERSION, ADMINISTRATIVA
- `disponible`: true, false
- `page`: Número de página (default: 1)
- `limit`: Resultados por página (default: 10)

**Response:**
```json
{
  "propuestas": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### POST `/api/proposals`
Crea una nueva propuesta (solo Presidente, Contralor, Contador).

**Request:**
```json
{
  "nombre": "Compra de equipos",
  "descripcion": "Comprar 5 computadoras",
  "monto": 1000,
  "walletReceptora": "0x...",
  "tipo": "INVERSION",
  "walletCreador": "0x...",
  "token2FA": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "propuesta": {
    "id": "uuid...",
    "nombre": "Compra de equipos",
    "estado": "BORRADOR"
  }
}
```

---

### PATCH `/api/proposals?action=firmar-aval`
Firma aval para una propuesta.

**Request:**
```json
{
  "propuestaId": "uuid...",
  "walletDirectivo": "0x...",
  "token2FA": "123456"
}
```

---

### PATCH `/api/proposals?action=cambiar-disponibilidad`
Activa/desactiva visibilidad de una propuesta.

**Request:**
```json
{
  "propuestaId": "uuid...",
  "disponible": false,
  "walletDirectivo": "0x..."
}
```

---

## 📊 REPORTS

### GET `/api/reports?type=...`
Genera reportes financieros.

**Query params:**
- `type`: balance, movimientos, socios, propuestas

**Response (balance):**
```json
{
  "capitalTotalWei": "5000000000000000000",
  "capitalTotalMatic": "5.0",
  "totalInscripciones": "2000000000000000000",
  "propuestasAprobadas": 3,
  "fechaGeneracion": "2026-07-31T20:00:00Z"
}
```

---

### POST `/api/reports`
Genera acta PDF y registra hash en blockchain.

**Request:**
```json
{
  "propuestaId": "uuid..."
}
```

**Response:**
```json
{
  "success": true,
  "acta": {
    "id": "uuid...",
    "urlPdf": "/actas/acta_xxx.pdf",
    "hashBlockchain": "0x..."
  },
  "hash": "0x...",
  "urlPdf": "/actas/acta_xxx.pdf"
}
```

---

## ❌ CÓDIGOS DE ERROR

| Código | Significado | Solución |
|--------|-------------|----------|
| 400 | Bad Request | Revisar parámetros enviados |
| 401 | Unauthorized | Firmar mensaje o verificar 2FA |
| 403 | Forbidden | No tienes permiso para esta acción |
| 404 | Not Found | Recurso no existe |
| 500 | Internal Error | Contactar al Contador |
| 503 | Service Unavailable | Relayer caído, activar Plan B |

---

## 🔒 RATE LIMITS

- **Votación:** 1 voto por propuesta por socio
- **API general:** 100 requests por minuto por IP
- **Crear propuestas:** 10 por día por directivo
