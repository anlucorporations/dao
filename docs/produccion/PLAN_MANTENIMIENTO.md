# 🔧 PLAN DE MANTENIMIENTO Y MONITOREO
## Cooperativa "Los Cappones" - Sistema DAO en Producción

---

## 🎯 OBJETIVO
Garantizar que el sistema funcione 24/7 sin interrupciones y detectar problemas antes de que afecten a los socios.

---

## 📅 RUTINAS DE MANTENIMIENTO

### Diario (el Contador, 10 minutos por la mañana)

**Checklist matutino:**
- [ ] Revisar panel de Biconomy: ¿balance del Paymaster > 5 MATIC?
- [ ] Revisar Vercel: ¿la página carga correctamente?
- [ ] Revisar logs de errores en Vercel Dashboard
- [ ] Revisar grupo de WhatsApp: ¿hay socios con problemas?
- [ ] Verificar que PostgreSQL está corriendo

**Si algo está mal:**
- Balance bajo → Recargar Paymaster
- Página caída → Revisar Vercel, puede ser temporal
- Errores en logs → Investigar y reportar al desarrollador
- Socio con problema → Responder en WhatsApp o llamar

---

### Semanal (viernes, 30 minutos)

**Revisión semanal:**
- [ ] Generar reporte de balance general
- [ ] Contar cuántos votos se hicieron esta semana
- [ ] Verificar que los backups de PostgreSQL se hicieron
- [ ] Revisar si hay propuestas pendientes de ejecución
- [ ] Actualizar hoja de Excel (si se usa paralelo)

**Reporte a la junta directiva:**
- Enviar por correo o WhatsApp:
  - Capital total actual
  - Número de socios activos
  - Propuestas aprobadas esta semana
  - Problemas técnicos (si hubo)

---

### Mensual (primer lunes de cada mes, 1 hora)

**Revisión mensual:**
- [ ] Hacer backup manual de PostgreSQL y guardar en USB/cloud
- [ ] Revisar costos del mes (gas, Biconomy, hosting)
- [ ] Verificar que todos los directivos tienen 2FA activo
- [ ] Revisar si hay socios inactivos (más de 3 meses sin votar)
- [ ] Actualizar manuales si hubo cambios en el sistema
- [ ] Revisar si hay actualizaciones de seguridad (dependencias)

---

### Trimestral (cada 3 meses, 2 horas)

**Revisión trimestral:**
- [ ] Auditoría de seguridad básica (revisar logs de acceso)
- [ ] Verificar que las direcciones de wallet de los socios son correctas
- [ ] Revisar si el período de algún directivo está por vencer
- [ ] Planificar elecciones si corresponde
- [ ] Revisar presupuesto técnico para el próximo trimestre

---

## 📊 MONITOREO AUTOMÁTICO

### Alertas configuradas

| Alerta | Umbral | Acción |
|--------|--------|--------|
| Balance Paymaster < 5 MATIC | 5 MATIC | Email al Contador |
| Balance Paymaster < 1 MATIC | 1 MATIC | Email + SMS a toda la junta |
| Página caída > 5 min | 5 min | Email al Contador |
| Error 500 en API > 10/h | 10 errores | Email al desarrollador |
| Voto fallido > 5/h | 5 fallos | Email al Contador |
| Backup no realizado | 24h después | Email al Contador |

### Herramientas de monitoreo

| Herramienta | Uso | Costo |
|-------------|-----|-------|
| Vercel Analytics | Tráfico, performance | Gratis |
| Vercel Logs | Errores de la app | Gratis |
| Biconomy Dashboard | Balance, transacciones | Gratis |
| Polygonscan | Transacciones en blockchain | Gratis |
| pgAdmin | Estado de PostgreSQL | Gratis |
| UptimeRobot | Alerta si la página cae | Gratis (5 min checks) |

---

## 💾 BACKUPS

### ¿Qué respaldar?

| Datos | Frecuencia | Dónde guardar |
|-------|-----------|---------------|
| Base de datos PostgreSQL | Diario | Servidor local + Google Drive |
| Claves de `.env.local` | Una vez | Caja fuerte física + USB cifrado |
| 12 palabras de MetaMask (admin) | Una vez | Papel en caja fuerte |
| Direcciones de contratos | Una vez | Documento impreso + digital |

### Script de backup automático

```bash
#!/bin/bash
# Guardar como: scripts/backup-diario.sh
# Ejecutar con cron: 0 2 * * * /ruta/backup-diario.sh

FECHA=$(date +%Y%m%d_%H%M%S)
NOMBRE="backup_cappones_${FECHA}.sql"

# Backup de PostgreSQL
docker exec cappones_db pg_dump -U cappones_admin cooperativa_cappones > /backups/${NOMBRE}

# Comprimir
gzip /backups/${NOMBRE}

# Subir a Google Drive (usar rclone)
rclone copy /backups/${NOMBRE}.gdrive:Backups/Cappones/

# Mantener solo últimos 30 días
find /backups -name "backup_cappones_*.sql.gz" -mtime +30 -delete

echo "Backup completado: ${NOMBRE}.gz"
```

---

## 🚨 PROTOCOLO DE EMERGENCIA

### Escenario 1: Se robaron/hackearon la wallet del admin

**Nivel:** CRÍTICO 🔴

**Pasos:**
1. **NO ENTRES EN PÁNICO** - Los fondos de la cooperativa están en el contrato, no en la wallet
2. Cambiar inmediatamente la wallet del admin en el sistema
3. Usar la función `transferOwnership` del contrato (requiere 3 de 5 firmas)
4. Notificar a todos los socios por WhatsApp
5. Contactar al desarrollador para auditoría

### Escenario 2: La base de datos se borró/corrompió

**Nivel:** CRÍTICO 🔴

**Pasos:**
1. **NO usar el sistema** hasta restaurar
2. Buscar el backup más reciente (debería ser de ayer)
3. Restaurar PostgreSQL desde el backup
4. Verificar que los datos están completos
5. Si no hay backup, contactar al desarrollador (datos en blockchain se pueden reconstruir)

### Escenario 3: Biconomy deja de existir

**Nivel:** ALTO 🟡

**Pasos:**
1. Activar Plan B: socios votan pagando su propio gas
2. Buscar relayer alternativo (Gelato, OpenZeppelin Defender)
3. Migrar a nuevo relayer (requiere actualización de contratos)
4. Reembolsar gas a los socios que pagaron durante el Plan B

### Escenario 4: Polygon (la red blockchain) tiene problemas

**Nivel:** MEDIO 🟠

**Pasos:**
1. Esperar - usualmente se resuelve en horas
2. Si dura más de 24h, posponer votaciones
3. Considerar migrar a otra red (complejo, requiere desarrollador)

### Escenario 5: Un socio perdió su MetaMask

**Nivel:** BAJO 🟢

**Pasos:**
1. El socio va a "¿Olvidaste tu wallet?"
2. Responde las 2 preguntas de seguridad
3. El Contralor recibe la solicitud
4. La junta directiva vota (3 de 5) para aprobar la recuperación
5. El socio vincula nueva wallet

---

## 📞 CONTACTOS DE EMERGENCIA

| Rol | Nombre | Teléfono | Responsabilidad |
|-----|--------|----------|-----------------|
| Presidente | Angel Lucci | [Teléfono] | Decisiones de gobernanza |
| Contador | [Pendiente] | [Teléfono] | Problemas técnicos |
| Desarrollador | [Ingeniero] | [Teléfono] | Bugs, código, despliegue |
| Soporte Biconomy | - | docs.biconomy.io | Problemas del relayer |
| Soporte Polygon | - | support.polygon.technology | Problemas de red |

---

## 📋 CHECKLIST DE MANTENIMIENTO MENSUAL

- [ ] Backup de PostgreSQL realizado y verificado
- [ ] Balance del Paymaster > 10 MATIC
- [ ] Ningún error crítico en logs
- [ ] Todos los directivos tienen 2FA activo
- [ ] Manuales actualizados (si hubo cambios)
- [ ] Costos del mes registrados
- [ ] Reporte enviado a la junta directiva
- [ ] Próximas elecciones revisadas (si aplica)
- [ ] Socios inactivos identificados
- [ ] Presupuesto técnico revisado
