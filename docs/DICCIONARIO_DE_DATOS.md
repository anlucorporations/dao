# 📖 Diccionario de Datos y Modelo de Esquemas — DAO Los Cappones

Este documento define la estructura detallada del **Modelo de Datos Relacional (PostgreSQL via Prisma ORM)** y los **Tipos de Datos en Smart Contracts (Solidity)** de la plataforma **DAO Los Cappones**.

---

## 1. Modelo de Datos Relacional (PostgreSQL / Prisma)

### 1.1 Tabla `Socio`
Almacena la información de identificación y estado de los socios cooperativistas.

| Campo | Tipo PostgreSQL | Nulo | Descripción / Restricciones |
|---|---|:---:|---|
| `id` | `UUID` | No | Llave Primaria (Default: `uuid()`). |
| `cedula` | `VARCHAR(20)` | No | Cédula de Identidad única (`@unique`). |
| `nombreCompleto` | `VARCHAR(150)` | No | Nombre completo del socio. |
| `correo` | `VARCHAR(150)` | No | Correo electrónico único (`@unique`). |
| `walletAddress` | `VARCHAR(42)` | No | Dirección pública Ethereum única (`@unique`). |
| `activo` | `BOOLEAN` | No | Estado de afiliación (`Default: true`). |
| `fechaRegistro` | `TIMESTAMP` | No | Fecha de creación (`Default: now()`). |

### 1.2 Tabla `Directivo`
Almacena las asignaciones de la Junta Directiva y secretos de autenticación 2FA.

| Campo | Tipo PostgreSQL | Nulo | Descripción / Restricciones |
|---|---|:---:|---|
| `id` | `UUID` | No | Llave Primaria. |
| `socioId` | `UUID` | No | Llave Foránea -> `Socio(id)`. |
| `cargo` | `ENUM` | No | `PRESIDENTE`, `VICEPRESIDENTE`, `SECRETARIO`, `CONTRALOR`, `CONTADOR`. |
| `secret2FA` | `VARCHAR(255)` | Sí | Clave secreta cifrada para verificación TOTP. |
| `activo` | `BOOLEAN` | No | Estado del cargo (`Default: true`). |
| `fechaFinCargo` | `TIMESTAMP` | Sí | Expiración del periodo legal (2 años). |

### 1.3 Tabla `Propuesta`
Almacena las propuestas de inversión y resoluciones de gobernanza.

| Campo | Tipo PostgreSQL | Nulo | Descripción / Restricciones |
|---|---|:---:|---|
| `id` | `UUID` | No | Llave Primaria. |
| `propuestaChainId`| `VARCHAR(50)` | Sí | ID numérico correspondiente en el Smart Contract. |
| `nombre` | `VARCHAR(255)` | No | Título de la propuesta. |
| `descripcion` | `TEXT` | No | Exposición de motivos y detalle técnico. |
| `monto` | `DECIMAL(18,4)` | No | Monto a financiar en Ether / POL. |
| `walletReceptora` | `VARCHAR(42)` | No | Wallet destino del pago de tesorería. |
| `tipo` | `ENUM` | No | `INVERSION` o `ADMINISTRATIVA`. |
| `estado` | `ENUM` | No | `BORRADOR`, `POR_DISCUTIR`, `EN_VOTACION`, `APROBADA`, `RECHAZADA`, `EJECUTADA`. |
| `disponible` | `BOOLEAN` | No | Control de visibilidad pública (`Default: true`). |
| `creadorId` | `UUID` | No | Llave Foránea -> `Socio(id)`. |

### 1.4 Tabla `Aval`
Registra el respaldo requerido de los directivos antes de publicar una propuesta.

| Campo | Tipo PostgreSQL | Nulo | Descripción / Restricciones |
|---|---|:---:|---|
| `id` | `UUID` | No | Llave Primaria. |
| `propuestaId` | `UUID` | No | Llave Foránea -> `Propuesta(id)`. |
| `directivoId` | `UUID` | No | Llave Foránea -> `Directivo(id)`. |
| `firmado` | `BOOLEAN` | No | Indica si el directivo avaló (`Default: false`). |
| `fechaFirma` | `TIMESTAMP` | Sí | Momento exacto del registro del aval. |

### 1.5 Tabla `Voto`
Registra los votos procesados en la plataforma.

| Campo | Tipo PostgreSQL | Nulo | Descripción / Restricciones |
|---|---|:---:|---|
| `id` | `UUID` | No | Llave Primaria. |
| `propuestaId` | `UUID` | No | Llave Foránea -> `Propuesta(id)`. |
| `socioId` | `UUID` | No | Llave Foránea -> `Socio(id)`. |
| `tipo` | `ENUM` | No | `ACEPTADA`, `RECHAZADA`, `ABSTENCION`. |
| `hashSecreto` | `VARCHAR(66)` | No | Hash Keccak-256 para preservar el secreto del voto. |
| `txHash` | `VARCHAR(66)` | Sí | Hash de transacción en la blockchain. |

---

## 2. Structs y Enums en Smart Contracts (Solidity)

### 2.1 Struct `Socio` (`CooperativaCappones.sol`)
```solidity
struct Socio {
    address wallet;
    uint256 balance;
    uint256 fechaRegistro;
    bool activo;
    address walletRecuperacion;
}
```

### 2.2 Struct `Directivo` (`CooperativaCappones.sol`)
```solidity
struct Directivo {
    address wallet;
    Cargo cargo;
    uint256 fechaInicio;
    uint256 fechaFin;
    bool activo;
}
```

### 2.3 Struct `Propuesta` (`VotacionPropuestas.sol`)
```solidity
struct Propuesta {
    uint256 id;
    string nombre;
    string descripcion;
    uint256 monto;
    address walletReceptora;
    uint256 fechaCreacion;
    uint256 votosFavor;
    uint256 votosContra;
    uint256 abstenciones;
    uint256 avales;
    EstadoPropuesta estado;
    TipoPropuesta tipo;
    bool ejecutada;
    bool disponible;
    uint256 fechaApelacion;
}
```
