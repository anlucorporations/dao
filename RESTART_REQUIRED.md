# ⚠️ REINICIO REQUERIDO

## Los contratos se han re-deployado

Las direcciones en `.env.local` han sido actualizadas:

```
✅ ANTES (antiguo):
DAO:       0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
Forwarder: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

✅ AHORA (nuevo con totalDeposited):
DAO:       0x3f36fF84958b0473925Afe368Cd25A9c23fA56cF
Forwarder: 0xD87De02c97F1eBd372d001fF5FD280709B0c5454
```

## 🔴 Acción Requerida

Para que Next.js cargue las nuevas direcciones:

### 1. Detener el servidor web
Presiona `Ctrl+C` en la terminal donde corre `npm run dev`

### 2. Reiniciar el servidor
```bash
cd web
npm run dev
```

### 3. Refrescar el navegador
- Abre o refresca http://localhost:3000
- Deberías ver la pantalla de inicio sin errores

## ¿Por qué?

Next.js carga las variables de entorno **solo al iniciar**. Los cambios en `.env.local` no se aplican en caliente, necesitas reiniciar el servidor.

## Verificación

Una vez reiniciado, abre la consola del navegador (F12) y verifica:
- No deberían aparecer errores de "execution reverted"
- La conexión de wallet debería funcionar
- Al depositar debería actualizar los balances

## Datos de MetaMask

Si tienes problemas conectando, usa esta cuenta de Anvil:

```
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

**Red:** Localhost (RPC: http://127.0.0.1:8545, Chain ID: 31337)
