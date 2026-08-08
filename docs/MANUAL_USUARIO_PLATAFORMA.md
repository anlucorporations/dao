# 👤 Manual de Usuario General — DAO Los Cappones

Este manual instruye a los **Socios Cooperativistas** y **Directivos** en el uso completo de la plataforma web de gobernanza descentralizada.

---

## 1. Acceso a la Plataforma y Conexión

1. Abre tu navegador web e ingresa a la dirección [http://localhost:3000](http://localhost:3000).
2. Asegúrate de tener activa la extensión de **MetaMask** con la red de la cooperativa.
3. Haz clic en el botón **"Conectar MetaMask"** ubicado en el menú superior.
4. Una vez conectada, verás tu dirección pública acortada y tu insignia de rol (`Socio`, `Presidente`, etc.).

---

## 2. Navegación por el Dashboard

El sistema cuenta con un menú de pestañas accesibles en el encabezado:

### 2.1 Pestaña 🏠 Inicio
- Muestra el resumen del capital total disponible en la tesorería de la cooperativa.
- Muestra el rol actual del usuario conectado y la red activa.

### 2.2 Pestaña 📜 Propuestas
- **Crear Propuesta (Directivos):** Completa el título, monto solicitado en ETH, wallet receptora, exposición de motivos y tu código 2FA. Haz clic en *"Registrar Propuesta"*.
- **Firmar Aval (Directivos):** Revisa las propuestas creadas y presiona *"Firmar Aval"* para respaldar su publicación.
- **Votar en Votaciones Gasless (Socios):** Selecciona *"Votar (Gasless)"*. MetaMask te solicitará únicamente una firma digital gratuita (sin cobro de comisiones de gas).

### 2.3 Pestaña 👥 Directorio
- Consulta los miembros activos de la Junta Directiva (Presidenta `anlu`, Vicepresidente, Secretaria, Contralor y Contador).
- Revisa las cédulas y wallets oficiales asignadas a cada cargo.

### 2.4 Pestaña 🛡️ Actas & Reportes
- Consulta el registro inmutable de actas certificadas con su hash Keccak-256 / SHA-256 en la blockchain.

---

## 3. Preguntas Frecuentes y Soporte

- **¿Por qué no pago gas al votar?**  
  La plataforma cuenta con un servicio de **Relayer Gasless** que asume el costo del gas en la blockchain por ti.
- **¿Qué hago si mi transacción falla?**  
  Asegúrate de tener la red local Anvil conectada en MetaMask (Chain ID `31337`).
