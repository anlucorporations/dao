# ✅ CHECKLIST DE MIGRACIÓN A MAINNET
## Fase 7: Puesta en Producción - Cooperativa "Los Cappones"

---

## 🎯 OBJETIVO
Migrar el sistema desde Polygon Amoy (testnet) a Polygon PoS (mainnet) para operación real.

---

## 📋 PRE-MIGRACIÓN (Antes de tocar mainnet)

### Seguridad
- [ ] Auditar contratos con herramienta (Slither, Mythril o auditor externo)
- [ ] Revisar que NO hay claves privadas hardcodeadas en el código
- [ ] Verificar que el owner del contrato es una wallet multisig o hardware wallet
- [ ] Confirmar que el relayer tiene fondos suficientes para 1 mes de operación
- [ ] Verificar backup de la base de datos PostgreSQL

### Fondos
- [ ] Comprar MATIC en exchange (Binance, Kraken, etc.)
- [ ] Transferir MATIC a la wallet del SuperUsuario (0x2d3d...f833)
- [ ] Transferir MATIC al Paymaster de Biconomy (mínimo 50 MATIC para empezar)
- [ ] Verificar balance en mainnet: https://polygonscan.com

### Configuración
- [ ] Actualizar `.env.local` con direcciones de mainnet
- [ ] Cambiar `NEXT_PUBLIC_CHAIN_ID` de 80002 a 137
- [ ] Cambiar `NEXT_PUBLIC_RPC_URL` a https://polygon-rpc.com
- [ ] Actualizar API keys de Biconomy para mainnet
- [ ] Actualizar API key de Polygonscan para verificación

---

## 🚀 MIGRACIÓN (Día de la migración)

### Paso 1: Desplegar contratos en mainnet
```bash
# Asegurarse de tener MATIC en la wallet
# Verificar balance
npx hardhat verify --network polygon ...

# Desplegar (mismo comando que Amoy pero con red diferente)
cd contracts
forge script script/DeployAmoy.s.sol \
  --rpc-url https://polygon-rpc.com \
  --broadcast \
  --verify \
  --verifier polygonscan \
  --verifier-url https://api.polygonscan.com/api
```
- [ ] MinimalForwarder desplegado y verificado
- [ ] ActaHashRegistry desplegado y verificado
- [ ] CooperativaCappones desplegado y verificado
- [ ] VotacionPropuestas desplegado y verificado
- [ ] Direcciones guardadas en `deployments/polygon-mainnet.json`

### Paso 2: Verificar contratos en Polygonscan
- [ ] Ir a https://polygonscan.com/address/[DIRECCION]
- [ ] Verificar que el código fuente está visible
- [ ] Verificar que los eventos se emiten correctamente
- [ ] Verificar que el owner es la wallet correcta

### Paso 3: Configurar Biconomy en mainnet
- [ ] Crear nuevo Paymaster en dashboard.biconomy.io para Chain ID 137
- [ ] Agregar direcciones de contratos a la whitelist
- [ ] Depositar mínimo 50 MATIC en el Paymaster
- [ ] Obtener nuevo API Key y Paymaster URL
- [ ] Actualizar `.env.local` con nuevas claves

### Paso 4: Migrar base de datos
- [ ] Exportar datos de PostgreSQL local
```bash
pg_dump -U cappones_admin cooperativa_cappones > backup_pre_produccion.sql
```
- [ ] Crear base de datos en servidor de producción (o usar Supabase/Neon)
- [ ] Importar datos
```bash
psql -U usuario -d cooperativa_cappones_produccion -f backup_pre_produccion.sql
```
- [ ] Verificar que el SuperUsuario Angel Lucci está presente
- [ ] Actualizar `DATABASE_URL` en `.env.local` de producción

### Paso 5: Desplegar frontend en Vercel
- [ ] Crear cuenta en vercel.com (gratis)
- [ ] Conectar repositorio de GitHub
- [ ] Configurar variables de entorno en Vercel Dashboard
- [ ] Desplegar
- [ ] Verificar que la URL funciona: https://loscappones.vercel.app
- [ ] Configurar dominio personalizado (opcional): https://loscappones.com

### Paso 6: SSL y seguridad
- [ ] Verificar que el sitio usa HTTPS (Vercel lo hace automático)
- [ ] Verificar que las cookies son seguras (secure, httpOnly)
- [ ] Verificar headers de seguridad (HSTS, CSP)

---

## ✅ POST-MIGRACIÓN (Después del despliegue)

### Pruebas en mainnet
- [ ] Registrar 1 socio de prueba (pagar inscripción real)
- [ ] Crear 1 propuesta de prueba
- [ ] Firmar 3 avales
- [ ] Votar con 2 socios (verificar que NO cuesta gas)
- [ ] Cerrar propuesta
- [ ] Verificar que el acta se genera y el hash se registra
- [ ] Verificar que los fondos se transfieren correctamente
- [ ] Verificar que los reportes funcionan

### Monitoreo
- [ ] Configurar alertas de balance bajo en Biconomy
- [ ] Configurar alertas de errores en Vercel
- [ ] Configurar backup automático de PostgreSQL
- [ ] Crear calendario de revisión semanal del Contador

### Capacitación
- [ ] Capacitar al Contralor (carga de socios)
- [ ] Capacitar al Presidente (crear propuestas)
- [ ] Capacitar al Contador (monitoreo, relayer)
- [ ] Capacitar a 3 socios de prueba (votación)
- [ ] Dejar manuales impresos en la oficina de la cooperativa

---

## 💰 COSTOS DE PRODUCCIÓN (Estimados mensuales)

| Concepto | Costo mensual | Nota |
|----------|---------------|------|
| Vercel (hosting) | $0 | Plan gratuito suficiente para 200 usuarios |
| PostgreSQL (Supabase) | $0 | Plan gratuito: 500MB, 500k requests |
| Biconomy (relayer) | ~$5-10 | ~$0.001 por transacción, 5000-10000 votos/mes |
| Polygon gas | ~$2-5 | Despliegues y ejecuciones ocasionales |
| Dominio (opcional) | ~$12/año | loscappones.com |
| **TOTAL** | **~$10-20/mes** | **~$120-240/año** |

---

## 🚨 PLAN DE CONTINGENCIA

### Si algo sale mal durante la migración
1. **No entres en pánico** - Los fondos en testnet no valen dinero real
2. **No despliegues en mainnet si los tests fallan**
3. **Ten el backup de PostgreSQL listo**
4. **Ten la wallet del admin con fondos de sobra**
5. **Contactar al desarrollador** si hay errores de código

### Rollback (volver atrás)
Si es necesario volver a testnet:
1. Cambiar `NEXT_PUBLIC_CHAIN_ID` de vuelta a 80002
2. Redesplegar frontend apuntando a contratos de Amoy
3. La base de datos puede seguir siendo la misma
4. Informar a los socios que es "modo de prueba"

---

## ✅ SIGN-OFF (Aprobación final)

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Presidente | Angel Lucci | _______________ | _______ |
| Vicepresidente | [Pendiente] | _______________ | _______ |
| Secretario | [Pendiente] | _______________ | _______ |
| Contralor | [Pendiente] | _______________ | _______ |
| Contador | [Pendiente] | _______________ | _______ |
| Desarrollador | [Ingeniero] | _______________ | _______ |

**Fecha de go-live oficial:** _______________
