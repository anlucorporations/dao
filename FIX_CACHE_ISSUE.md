# 🔧 Solución: Problema de Caché

## El Problema

El navegador/Next.js está usando código en caché con las direcciones antiguas, aunque `.env.local` tiene las nuevas.

## ✅ Solución Completa

### Paso 1: Detener el Servidor
```bash
# En la terminal donde corre npm run dev:
Ctrl+C
```

### Paso 2: Limpiar Caché de Next.js
```bash
cd web
rm -rf .next
```

### Paso 3: Reiniciar el Servidor
```bash
npm run dev
```

### Paso 4: Hard Refresh en el Navegador

Elige según tu navegador:

**Chrome/Edge:**
- Windows/Linux: `Ctrl + Shift + R` o `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Firefox:**
- Windows/Linux: `Ctrl + Shift + R` o `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Safari:**
- `Cmd + Option + R`

### Paso 5: Limpiar Caché del Navegador (si aún no funciona)

1. Abre DevTools (F12)
2. Click derecho en el botón Refresh
3. Selecciona "Empty Cache and Hard Reload"

### Paso 6: Verificar Direcciones

Abre la consola del navegador (F12) y ejecuta:

```javascript
console.log('DAO:', process.env.NEXT_PUBLIC_DAO_CONTRACT_ADDRESS)
console.log('Forwarder:', process.env.NEXT_PUBLIC_FORWARDER_CONTRACT_ADDRESS)
```

Deberías ver:
```
DAO: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
Forwarder: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
```

## 🎯 Comandos Completos

Ejecuta esto en una terminal:

```bash
# Ir al directorio web
cd /Users/joseviejo/2025/cc/40_dao/newDao/web

# Limpiar .next
rm -rf .next

# Reiniciar servidor
npm run dev
```

Luego en el navegador:
1. Hard refresh: `Cmd + Shift + R` (Mac) o `Ctrl + Shift + R` (Windows/Linux)
2. Si no funciona: DevTools → Network → "Disable cache" ✅
3. Refresh de nuevo

## ⚠️ Si Aún No Funciona

Intenta en modo incógnito/privado:
- Chrome: `Cmd/Ctrl + Shift + N`
- Firefox: `Cmd/Ctrl + Shift + P`

El modo incógnito no tiene caché, así que te confirmará si es un problema de caché.

## 📝 Direcciones Correctas Actuales

```
DAO Contract:     0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
MinimalForwarder: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
```
