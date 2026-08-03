# 📋 PLAN DE PRUEBAS MANUALES
## Fase 5: Pruebas - Cooperativa "Los Cappones"

### Objetivo
Verificar que el sistema funciona correctamente para usuarios reales con poca experiencia técnica.

### Ambiente
- **URL**: http://localhost:3000 (desarrollo) / https://loscappones.vercel.app (producción)
- **Red**: Polygon Amoy Testnet
- **Dispositivos**: Computadora (Chrome, Firefox) + Celular (MetaMask Mobile)

---

## 🧪 CASOS DE PRUEBA MANUALES

### Grupo A: Inscripción y Onboarding (Usuario: Nuevo Socio)

| ID | Caso | Pasos | Resultado Esperado | Estado |
|----|------|-------|-------------------|--------|
| M1 | Instalar MetaMask por primera vez | 1. Entrar a la web<br>2. Click "¿Necesitas ayuda?"<br>3. Seguir tutorial paso a paso | Tutorial claro, sin palabras técnicas | ⬜ |
| M2 | Conectar wallet sin ser socio | 1. Instalar MetaMask<br>2. Crear wallet<br>3. Conectar a la plataforma | Mensaje: "Aún no eres socio. Solicita inscripción al Contralor." | ⬜ |
| M3 | Recibir invitación del Contralor | 1. Contralor carga datos<br>2. Recibir enlace por correo/WhatsApp<br>3. Click en enlace | Página de pago con monto exacto (2% del capital) | ⬜ |
| M4 | Pagar inscripción del 2% | 1. Revisar monto mostrado<br>2. Confirmar en MetaMask<br>3. Esperar confirmación | Mensaje: "¡Bienvenido socio! Tu wallet está vinculada." | ⬜ |
| M5 | Ver dashboard por primera vez | 1. Login con wallet<br>2. Explorar interfaz | Tarjetas grandes, colores claros, letra legible | ⬜ |

### Grupo B: Votación (Usuario: Socio Activo)

| ID | Caso | Pasos | Resultado Esperado | Estado |
|----|------|-------|-------------------|--------|
| M6 | Ver propuestas disponibles | 1. Entrar al dashboard<br>2. Scroll de propuestas | Solo se ven propuestas "Por Discutir" y disponibles | ⬜ |
| M7 | Votar A FAVOR sin pagar gas | 1. Click "A FAVOR"<br>2. MetaMask muestra "Firmar mensaje"<br>3. Confirmar | "Voto registrado" en segundos. NO se pidió dinero. | ⬜ |
| M8 | Votar EN CONTRA | 1. Click "EN CONTRA"<br>2. Firmar mensaje | Voto registrado, contador actualizado | ⬜ |
| M9 | Intentar votar dos veces | 1. Votar una vez<br>2. Intentar votar de nuevo | Botón deshabilitado, mensaje "Ya votaste" | ⬜ |
| M10 | Verificar secreto del voto | 1. Votar<br>2. Revisar si se ve quién votó | NO se ve quién votó, solo totales | ⬜ |
| M11 | Votar desde celular | 1. Abrir en Chrome móvil<br>2. Conectar con WalletConnect | Misma experiencia que en desktop | ⬜ |

### Grupo C: Panel Directivo (Usuario: Presidente/Contralor/Contador)

| ID | Caso | Pasos | Resultado Esperado | Estado |
|----|------|-------|-------------------|--------|
| M12 | Crear propuesta de inversión | 1. Click "Crear Propuesta"<br>2. Llenar formulario<br>3. Ingresar código 2FA | Propuesta creada, estado "Borrador" | ⬜ |
| M13 | Firmar aval con 2FA | 1. Ver propuestas pendientes<br>2. Click "Firmar Aval"<br>3. Ingresar código 2FA | Aval firmado, contador +1 | ⬜ |
| M14 | Publicación automática con 3 avales | 1. Firmar 3 avales<br>2. Esperar | Propuesta pasa a "Por Discutir" automáticamente | ⬜ |
| M15 | Cambiar disponibilidad | 1. Click en toggle<br>2. Confirmar | Propuesta desaparece/aparece del listado público | ⬜ |
| M16 | Ejecutar propuesta aprobada | 1. Esperar cierre de votación<br>2. Click "Ejecutar"<br>3. Confirmar 2FA | Fondos transferidos, estado "Ejecutada" | ⬜ |

### Grupo D: Seguridad y Recuperación

| ID | Caso | Pasos | Resultado Esperado | Estado |
|----|------|-------|-------------------|--------|
| M17 | 2FA incorrecto bloquea acción | 1. Intentar crear propuesta<br>2. Ingresar código erróneo | "Código 2FA inválido", acción bloqueada | ⬜ |
| M18 | Relayer sin fondos (Plan B) | 1. Simular relayer vacío<br>2. Intentar votar | Alerta a junta directiva, opción de votar con gas propio | ⬜ |
| M19 | Recuperar wallet perdida | 1. Click "¿Olvidaste tu wallet?"<br>2. Responder preguntas<br>3. Esperar aprobación 3/5 | Nueva wallet vinculada tras aprobación | ⬜ |
| M20 | Ver acta de votación | 1. Ir a propuesta cerrada<br>2. Click "Ver Acta"<br>3. Descargar PDF | PDF con datos correctos, hash verificable | ⬜ |

### Grupo E: Reportes Financieros

| ID | Caso | Pasos | Resultado Esperado | Estado |
|----|------|-------|-------------------|--------|
| M21 | Ver balance general | 1. Click "Reportes"<br>2. "Balance General" | Capital total, número de socios, propuestas aprobadas | ⬜ |
| M22 | Ver movimientos de fondos | 1. Click "Movimientos" | Lista cronológica de entradas y salidas | ⬜ |
| M23 | Ver listado de socios | 1. Click "Socios" | Nombre, wallet, capital aportado, cargo (si aplica) | ⬜ |

---

## 👥 PERFILES DE USUARIOS DE PRUEBA

| Perfil | Edad | Experiencia Tecnológica | Dispositivo |
|--------|------|------------------------|-------------|
| Abuelo Carlos | 65 | Nunca usó computadora | Celular (hijo le instaló MetaMask) |
| Tía María | 50 | Usa WhatsApp y Facebook | Celular |
| Primo Juan | 35 | Usa banca online | Computadora + Celular |
| Sobrina Ana | 25 | Nativa digital | Celular |
| Tío Pedro | 55 | Usa Excel para contabilidad | Computadora |

---

## 📊 CRITERIOS DE ACEPTACIÓN

- ✅ 100% de los casos críticos (M6-M10, M12-M16) deben pasar
- ✅ 0 errores de seguridad (M17-M20)
- ✅ Usuarios de 60+ años completan flujo sin ayuda en < 5 minutos
- ✅ Tiempo de carga de página < 3 segundos
- ✅ Votación gasless se completa en < 10 segundos

---

## 📝 FORMATO DE REPORTE DE BUG

```
ID: BUG-XXX
Fecha: DD/MM/AAAA
Reportado por: [Nombre]
Dispositivo: [Celular/PC]
Navegador: [Chrome/Firefox/Safari]
Red: [Amoy/Mainnet]

Descripción:
[Qué pasó]

Pasos para reproducir:
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

Resultado esperado:
[Qué debería pasar]

Resultado actual:
[Qué pasó en realidad]

Screenshot: [Adjuntar]
Hash de tx (si aplica): 0x...
```
