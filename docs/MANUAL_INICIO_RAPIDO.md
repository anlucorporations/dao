# 🚀 Guía de Inicio Rápido (Quick Start Guide) — DAO Los Cappones

Esta guía permite poner en funcionamiento la plataforma **DAO Los Cappones** en un entorno local de pruebas en menos de 5 minutos.

---

## 1. Requisitos Previos

Asegúrate de contar con los siguientes programas instalados en tu equipo:

1. **Docker Desktop** (con Docker Engine y Docker Compose habilitados).
2. **Git** y **Node.js** v20+.
3. NAVEGADOR WEB con la extensión **MetaMask** instalada.

---

## 2. Puesta en Marcha con Docker (`Makefile`)

Abre una terminal en la raíz del proyecto y ejecuta:

```bash
make local-up
```

Este comando automatizado realizará las siguientes acciones:
1. Descargará e iniciará la base de datos PostgreSQL (`localhost:5432`).
2. Iniciará el nodo de prueba Anvil Blockchain (`http://localhost:8545`).
3. Compilará y desplegará los Smart Contracts exportando las direcciones a `deployments/local.json`.
4. Poblará la base de datos con los directivos iniciales y el SuperUsuario.
5. Iniciar la aplicación Web Next.js en modo producción ([http://localhost:3000](http://localhost:3000)).

---

## 3. Configuración de MetaMask

### Paso 3.1: Agregar la Red Local Anvil
1. Abre MetaMask y haz clic en el selector de redes (esquina superior izquierda).
2. Selecciona **"Agregar red"** -> **"Agregar una red manualmente"**.
3. Completa con los siguientes datos:
   - **Nombre de la red:** `Anvil Localhost`
   - **Nueva URL RPC:** `http://localhost:8545`
   - **ID de cadena (Chain ID):** `31337`
   - **Símbolo de moneda:** `ETH`

### Paso 3.2: Importar la Cuenta del SuperUsuario (`anlu`)
1. En MetaMask, haz clic en el menú de cuentas -> **"Importar cuenta"**.
2. Introduce la clave privada del SuperUsuario **anlu**:
   ```text
   0x2a871d0798f97d796df285775602922437370edd16347100108392d40b03220a
   ```
3. Haz clic en **Importar**. La cuenta mostrará un balance de 10,000 ETH de prueba.

---

## 4. Acceso y Uso del Dashboard

1. Ingresa a [http://localhost:3000](http://localhost:3000).
2. Haz clic en el botón **"Conectar MetaMask"**.
3. La interfaz reconocerá la wallet de `anlu` y mostrará la insignia de **"SuperUsuario / Presidenta"**.
4. Puedes navegar por las pestañas:
   - 🏠 **Inicio:** Estado general de fondos y red.
   - 📜 **Propuestas:** Formulario para registrar proyectos e interactuar.
   - 👥 **Directorio:** Miembros activos de la Junta Directiva.
   - 🛡️ **Actas & Reportes:** Certificación de hashes SHA-256.

---

## 5. Comandos Útiles de Mantenimiento

- **Ver logs en tiempo real:**
  ```bash
  make local-logs
  ```
- **Detener y limpiar los contenedores:**
  ```bash
  make local-down
  ```
