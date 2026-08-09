# 👤 Manual de Usuario — Plataforma DAO Gasless EIP-2771

Bienvenido a la guía de usuario oficial de la plataforma **DAO con Votación Gasless**.

---

## 1. Conexión de Billetera y Membresía

1. **Acceso a la Web**: Ingresa a la URL de la plataforma (`http://localhost:3000` o la URL de Cloud Run).
2. **Conectar MetaMask**: Haz clic en el botón **"Conectar Wallet"** en la esquina superior derecha.
3. **Muro de Inscripción (3.0 ETH)**:
   - Si tu billetera no está inscrita como socio, verás una pantalla de bienvenida con la opción de unirte.
   - Presiona **"🛡️ Inscribirse como Socio (3.0 ETH)"** y confirma la transacción en MetaMask.
   - Una vez confirmada, recibirás la insignia de **Socio Certificado** y podrás acceder al Dashboard.

---

## 2. Creación de Propuestas

1. Dirígete a la sección **"Crear Propuesta"** en la barra lateral.
2. Ingresa el Título, Beneficiario, Monto solicitado (ETH), Duración y la Justificación del proyecto.
3. Selecciona la modalidad:
   - **⚡ Sin Gas (Recomendado)**: Firmarás un mensaje EIP-712 en MetaMask **sin pagar comisiones**.
   - **⛽ Directo**: Transacción normal pagando comisiones de gas.
4. En MetaMask verás la ventana de firma con los detalles claros del proyecto. Haz clic en **"Firmar"**.

---

## 3. Emisión de Voto en Vivo

1. Ve a la sección **"Centro de Votación"** (`/dashboard/voting`).
2. Haz clic en **"Ver Detalle / Votar"** sobre la propuesta deseada.
3. Selecciona tu voto: **👍 A FAVOR**, **👎 EN CONTRA** o **⚪ ABSTENCIÓN**.
4. Firma la autorización en MetaMask.
5. Al completarse, verás el distintivo **"🔒 Voto Definitivo Registrado"**. Recuerda que cada socio solo puede votar 1 sola vez por propuesta.

---

## 4. Ejecución de Propuestas Aprobadas

Una vez que expira la fecha límite y el periodo de retardo, si los votos a favor superan a los en contra, la propuesta podrá ser ejecutada directamente por cualquier socio o automáticamente por el Daemon de la plataforma para realizar el desembolso de los fondos ETH al beneficiario.
