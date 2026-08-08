# 📙 MANUAL DEL CONTADOR
## Operación del Relayer y Monitoreo

---

## 🎯 Tu función

Como **Contador**, tú eres el **administrador técnico** del sistema. Tu trabajo es:
- Monitorear que el relayer tenga fondos para pagar gas
- Recibir alertas cuando algo falla
- Operar el Plan B si el relayer externo falla
- Generar reportes financieros

---

## ⚡ ¿Qué es el Relayer?

El **relayer** es como un "portero" que paga las comisiones de red para que los socios puedan votar **sin pagar dinero**.

- **Servicio externo:** Biconomy (tú no lo programas, solo lo monitoreas)
- **Fondos:** La cooperativa deposita MATIC en Biconomy para pagar las comisiones
- **Costo:** ~$0.001 por cada voto

---

## 📊 Panel del Relayer

En tu panel especial ves:
- **Balance del Paymaster**: Cuánto MATIC queda
- **Transacciones hoy**: Cuántos votos se procesaron
- **Estado del servicio**: 🟢 Activo / 🔴 Caído
- **Alertas**: Mensajes si algo necesita atención

---

## 🚨 Plan B: Si el relayer falla

### Escenario 1: Biconomy se cae temporalmente
1. Recibirás una **alerta automática** en tu panel
2. La alerta dice: **"Relayer caído - Plan B disponible"**
3. Click en **"Notificar Junta Directiva"**
4. Los 5 directivos reciben la notificación
5. Se requiere **firma de 3 de 5** para activar el Plan B

### Escenario 2: Se activa el Plan B
1. Los socios votan **pagando su propio gas** (MetaMask les pedirá ~$0.01)
2. El sistema registra cuánto gastó cada socio
3. Al final del mes, la cooperativa **reembolsa** el gas gastado
4. Se reactiva Biconomy cuando esté disponible

---

## 💰 Recargar el Paymaster

1. Ve a https://dashboard.biconomy.io
2. Inicia sesión con las credenciales de la cooperativa
3. Ve a tu **Paymaster**
4. Click en **"Add Funds"**
5. Envía MATIC de la wallet de la cooperativa a la dirección mostrada
6. Listo. El relayer vuelve a funcionar.

---

## 📈 Reportes financieros

Genera estos reportes periódicamente:

### 1. Balance General
- Capital total en la cooperativa
- Número de socios activos
- Propuestas aprobadas vs rechazadas

### 2. Movimientos
- Entradas: inscripciones de nuevos socios
- Salidas: propuestas ejecutadas
- Gas gastado por el relayer

### 3. Estado del Sistema
- Contratos desplegados y verificados
- Base de datos funcionando
- Relayer activo

---

## 🔧 Comandos técnicos útiles

```bash
# Verificar estado del relayer
curl http://localhost:3000/api/relay

# Verificar balance de la wallet admin
node -e "const {ethers}=require('ethers'); const p=new ethers.JsonRpcProvider('${RPC_URL}'); p.getBalance('${ADMIN_ADDRESS}').then(b=>console.log(ethers.formatEther(b)+' MATIC'))"

# Backup de la base de datos
docker exec cappones_db pg_dump -U cappones_admin cooperativa_cappones > backup_$(date +%Y%m%d).sql
```

---

## ⚠️ Reglas importantes

- **NUNCA** compartas la clave privada del admin
- **NUNCA** dejes el balance del Paymaster bajo 0.5 MATIC
- **SIEMPRE** haz backup de la base de datos semanalmente
- **ALERTA** inmediatamente si ves transacciones sospechosas

---

## 📞 Contactos de emergencia

- **Soporte Biconomy:** https://docs.biconomy.io
- **Soporte Polygon:** https://support.polygon.technology
- **Desarrollador del sistema:** [contacto del ingeniero]
