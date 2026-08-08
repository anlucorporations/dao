# ============================================================
# GUÍA DE DESPLIEGUE - FASE 4
# Cooperativa "Los Cappones" - Sistema DAO
# ============================================================

## REQUISITOS PREVIOS

- Node.js 18+ y npm
- Docker y Docker Compose
- Git
- Cuenta en MetaMask con wallet del SuperUsuario
- Cuenta en Biconomy (gratis)
- MATIC de testnet (gratis en faucet de Polygon Amoy)

## PASO 1: Clonar y preparar el proyecto

```bash
git clone <repositorio>
cd cooperativa-los-cappones
make install
```

## PASO 2: Configurar variables de entorno

```bash
cp web/.env.local.example web/.env.local
```

Edita `web/.env.local` y completa:

```env
# === ADMIN / SUPERUSUARIO ===
ADMIN_ADDRESS=0x2d3db17af7a2e9c256c9204ae8881d63ad1df833
ADMIN_PRIVATE_KEY=0x...                    # Tu clave privada (¡NUNCA compartir!)
ADMIN_SETUP_KEY=clave_segura_aleatoria_123  # Para configurar 2FA de otros

# === BASE DE DATOS (PostgreSQL local) ===
DATABASE_URL="postgresql://cappones_admin:cambiar_esta_clave_segura@localhost:5432/cooperativa_cappones?schema=public"
DB_USER=cappones_admin
DB_PASSWORD=cambiar_esta_clave_segura

# === BICONOMY (obtener en dashboard.biconomy.io) ===
BICONOMY_API_KEY=tu_api_key_aqui
BICONOMY_PAYMASTER_URL=https://paymaster.biconomy.io/api/v1/80002/...

# === RED BLOCKCHAIN ===
NEXT_PUBLIC_CHAIN_ID=80002
NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology

# === DIRECCIONES DE CONTRATOS (se llenan después del despliegue) ===
NEXT_PUBLIC_FORWARDER_ADDRESS=
NEXT_PUBLIC_COOPERATIVA_ADDRESS=
NEXT_PUBLIC_VOTACION_ADDRESS=
NEXT_PUBLIC_ACTA_REGISTRY_ADDRESS=
```

## PASO 3: Levantar la base de datos

```bash
make db-up
```

Esto levanta:
- PostgreSQL en `localhost:5432`
- pgAdmin en `http://localhost:5050` (usuario: admin@loscappones.com)

El seed se ejecuta automáticamente, creando al SuperUsuario Angel Lucci.

## PASO 4: Obtener MATIC de testnet

1. Ve a https://faucet.polygon.technology
2. Selecciona "Amoy Testnet"
3. Pega la wallet del SuperUsuario: `0x2d3db17af7a2e9c256c9204ae8881d63ad1df833`
4. Recibe 2 MATIC gratis (suficiente para desplegar)

## PASO 5: Desplegar contratos en Polygon Amoy

```bash
make deploy-amoy
```

Este comando:
1. Compila los 4 contratos
2. Los despliega en Polygon Amoy
3. Guarda las direcciones en `deployments/amoy-latest.json`
4. Verifica los contratos en Polygonscan

**Tiempo estimado:** 3-5 minutos

## PASO 6: Actualizar direcciones en el frontend

Copia las direcciones del archivo `deployments/amoy-latest.json` y péguelas en `web/.env.local`:

```env
NEXT_PUBLIC_FORWARDER_ADDRESS=0x...
NEXT_PUBLIC_COOPERATIVA_ADDRESS=0x...
NEXT_PUBLIC_VOTACION_ADDRESS=0x...
NEXT_PUBLIC_ACTA_REGISTRY_ADDRESS=0x...
```

## PASO 7: Configurar Biconomy

1. Ve a https://dashboard.biconomy.io
2. Crea un "Paymaster" para la red Polygon Amoy (Chain ID: 80002)
3. Agrega las direcciones de los contratos a la whitelist
4. Deposita 1 MATIC en el Paymaster (para pagar gas de los socios)
5. Copia el API Key y Paymaster URL al `.env.local`

## PASO 8: Configurar 2FA del SuperUsuario

```bash
make setup-2fa
```

Escanea el QR con **Google Authenticator** o **Authy**.

## PASO 9: Levantar el frontend

```bash
cd web
npm run dev
```

La aplicación estará en: http://localhost:3000

## PASO 10: Verificar que todo funciona

1. Conecta MetaMask con la red Polygon Amoy
2. Entra a http://localhost:3000
3. Conecta la wallet del SuperUsuario
4. Verifica que aparezca como "Presidente"
5. Prueba crear una propuesta de prueba

## COMANDOS ÚTILES

| Comando | Descripción |
|---------|-------------|
| `make db-up` | Levanta PostgreSQL |
| `make db-down` | Detiene PostgreSQL |
| `make deploy-local` | Despliega en red local |
| `make deploy-amoy` | Despliega en Polygon Amoy |
| `make test-contracts` | Ejecuta tests de Solidity |
| `make test-frontend` | Ejecuta tests de Next.js |

## SOLUCIÓN DE PROBLEMAS

**Error: "insufficient funds"**
→ Obtén más MATIC del faucet de Amoy.

**Error: "nonce too low"**
→ Resetea la cuenta en MetaMask (Configuración > Avanzado > Resetear cuenta).

**Error: "replacement transaction underpriced"**
→ Espera 30 segundos y vuelve a intentar.

**Error: "could not detect network"**
→ Verifica que Docker esté corriendo y PostgreSQL esté levantado.

## CONTACTO DE SOPORTE

Si algo falla durante el despliegue, contacta al desarrollador con:
1. El error exacto (screenshot o copiar texto)
2. El hash de la transacción (si aplica)
3. La salida del comando `forge --version`
