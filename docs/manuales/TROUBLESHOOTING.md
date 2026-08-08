# 🔧 GUÍA DE SOLUCIÓN DE PROBLEMAS
## Cooperativa "Los Cappones" - Troubleshooting

---

## 🚨 PROBLEMAS CRÍTICOS

### 1. "Relayer sin fondos" - Los socios no pueden votar

**Síntoma:** Al votar, aparece "Servicio temporalmente indisponible"

**Causa:** El Paymaster de Biconomy se quedó sin MATIC para pagar gas

**Solución:**
1. El Contador va a https://dashboard.biconomy.io
2. Inicia sesión
3. Click en "Add Funds"
4. Transfiere MATIC a la dirección del Paymaster
5. Verifica en el panel que el balance subió

**Plan B (mientras se recarga):**
1. Notificar a la junta directiva (requiere 3 de 5 firmas)
2. Activar modo manual: socios votan pagando su propio gas
3. El sistema reembolsa el gas al final del mes

---

### 2. "Contrato no encontrado" - La app no carga datos

**Síntoma:** Las propuestas no aparecen o aparecen en blanco

**Causa:** Las direcciones de los contratos en `.env.local` son incorrectas

**Solución:**
1. Verificar el archivo `contracts/deployments/amoy-latest.json`
2. Copiar las direcciones correctas a `web/.env.local`
3. Reiniciar el servidor: `cd web && npm run dev`

---

### 3. "Nonce too low" - Transacción fallida

**Síntoma:** Al desplegar o ejecutar, error "nonce too low"

**Causa:** MetaMask tiene el nonce desactualizado

**Solución:**
1. Abrir MetaMask
2. Click en los 3 puntos (⋮) de la cuenta
3. "Configuración" → "Avanzado"
4. Click en "Restablecer cuenta" (Reset account)
5. Volver a intentar

---

## 🛠️ PROBLEMAS COMUNES

### 4. MetaMask no se conecta

**Síntoma:** Click en "Conectar MetaMask" y no pasa nada

**Soluciones:**
- Verificar que MetaMask está instalado
- Recargar la página (F5)
- Verificar que está en la red **Polygon Amoy** (Chain ID: 80002)
- Si no está en Amoy: agregar red manualmente

**Datos de Polygon Amoy:**
- Nombre: Polygon Amoy
- RPC: https://rpc-amoy.polygon.technology
- Chain ID: 80002
- Símbolo: MATIC
- Explorador: https://amoy.polygonscan.com

---

### 5. "No eres socio" pero sí pagué inscripción

**Síntoma:** Wallet conectada pero dice "No eres socio"

**Causas posibles:**
- La wallet conectada es diferente a la que usaste para pagar
- El Contralor aún no confirmó tu inscripción
- Hay un error en la base de datos

**Solución:**
1. Verificar que conectaste la **misma wallet** que usaste para pagar
2. Contactar al Contralor para verificar estado
3. Si el problema persiste, contactar al Contador

---

### 6. Votación no aparece o está cerrada

**Síntoma:** La propuesta dice "Votación cerrada" pero recién la vi

**Causa:** Las propuestas de inversión duran 24h y las administrativas 12h

**Solución:**
- Revisar la fecha de publicación de la propuesta
- Si se cerró por falta de votos, puede reintentarse (máximo 3 veces)
- Si se rechazó después de 3 intentos, no se puede votar más

---

### 7. 2FA no funciona

**Síntoma:** El código de Google Authenticator dice "inválido"

**Causas:**
- El reloj del celular no está sincronizado
- Se escaneó el QR en otro dispositivo
- El código expiró (cada 30 segundos)

**Solución:**
1. Verificar que la hora del celular es correcta
2. Pedir al Contador que regenere el QR
3. Escanear de nuevo con Google Authenticator

---

### 8. PostgreSQL no levanta

**Síntoma:** `make db-up` falla o la app dice "Database connection error"

**Solución:**
```bash
# Verificar que Docker está corriendo
docker ps

# Si no está corriendo, reiniciar Docker Desktop

# Forzar recreación de contenedores
docker-compose down -v
docker-compose up -d

# Verificar logs
docker logs cappones_db
```

---

### 9. "Insufficient funds" al desplegar contratos

**Síntoma:** `make deploy-amoy` falla con "insufficient funds"

**Solución:**
1. Obtener MATIC gratis del faucet: https://faucet.polygon.technology
2. Seleccionar "Amoy Testnet"
3. Pegar la wallet del SuperUsuario
4. Esperar 1 minuto y reintentar

---

### 10. La página se ve mal en celular

**Síntoma:** Botones muy pequeños, texto cortado, scroll horizontal

**Solución:**
- Usar Chrome o Safari actualizado
- No usar navegadores antiguos (Internet Explorer)
- Si persiste, reportar al desarrollador con screenshot

---

## 📞 ESCALACIÓN DE PROBLEMAS

| Nivel | Quién contactar | Tipo de problema |
|-------|----------------|------------------|
| 1 | Contralor | Inscripción, datos de socios |
| 2 | Contador | Técnico, relayer, base de datos |
| 3 | Presidente | Decisiones de gobernanza |
| 4 | Desarrollador | Bugs del código, despliegue |

---

## 📝 FORMATO DE REPORTE DE BUG

Cuando reportes un problema, incluye:

1. **Qué estabas haciendo** cuando ocurrió
2. **Qué esperabas** que pasara
3. **Qué pasó en realidad**
4. **Screenshot** de la pantalla
5. **Dirección de tu wallet** (pública, no la clave privada)
6. **Hash de transacción** (si aplica)
7. **Navegador y dispositivo** (Chrome en PC, Safari en iPhone, etc.)
