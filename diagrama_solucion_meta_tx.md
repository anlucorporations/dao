# Diagrama de Diagnóstico: Error y Solución en Transacciones Sin Gas (EIP-2771)

Este documento explica visualmente la causa del fallo **"Failed to relay transaction"** al crear propuestas sin gas y cómo fue corregido.

---

## ❌ 1. Diagrama del Error Detectado

```mermaid
sequenceDiagram
    autonumber
    participant UI as 🌐 UI (CreateProposal)
    participant MetaTx as 🔑 metaTx.ts
    participant Relay as ⚙️ /api/relay
    participant Forwarder as 📝 MinimalForwarder.sol
    participant DAO as 🏛️ DAOVoting.sol

    UI->>MetaTx: 1. Iniciar creación de propuesta sin gas
    Note over MetaTx: Error 1: chainId enviado como String ("31337")<br/>en el dominio EIP-712
    MetaTx->>UI: 2. Firma EIP-712 con hash de dominio incorrecto
    UI->>Relay: 3. POST /api/relay { request, signature }
    Relay->>Forwarder: 4. execute(request, signature)
    
    Forwarder->>Forwarder: 5. recoverSigner(hash, signature)
    Note over Forwarder: El hash de dominio Solidity no coincide<br/>con el firmado off-chain (Signer incorrecto)
    Forwarder-->>Relay: 6. Revert: "Invalid signature" / "Call failed"
    
    Note over Relay: Error 2: /api/relay retorna error genérico
    Relay-->>UI: 7. HTTP 500 { error: "Failed to relay transaction" }
    Note over UI: Error 3: La UI descarta el mensaje detallado<br/>y solo muestra "Failed to relay transaction"
```

---

## ✅ 2. Diagrama de la Solución Aplicada

```mermaid
sequenceDiagram
    autonumber
    participant UI as 🌐 UI (CreateProposal)
    participant MetaTx as 🔑 metaTx.ts
    participant Relay as ⚙️ /api/relay
    participant Forwarder as 📝 MinimalForwarder.sol
    participant DAO as 🏛️ DAOVoting.sol

    UI->>UI: 1. Validación previa de la propuesta:<br/>Monto <= Total Tesorería DAO
    UI->>MetaTx: 2. Generar datos de propuesta
    Note over MetaTx: Solución 1: chainId enviado como Number (31337)<br/>en el dominio EIP-712
    MetaTx->>UI: 3. Firma EIP-712 con hash exacto
    UI->>Relay: 4. POST /api/relay { request, signature }
    
    Relay->>Forwarder: 5. execute(request, signature)
    Forwarder->>Forwarder: 6. recoverSigner(hash, signature)
    Note over Forwarder: Signer == req.from (Firma 100% Válida)
    
    Forwarder->>DAO: 7. createProposal(_title, _recipient, _amount...)<br/>[_msgSender() = req.from]
    DAO->>DAO: 8. Registra propuesta con éxito
    DAO-->>Forwarder: 9. Exito
    Forwarder-->>Relay: 10. Transacción confirmada
    
    Relay-->>UI: 11. HTTP 200 { success: true, txHash }
    Note over UI: Solución 2: La UI procesa el éxito<br/>o detalla el motivo exacto en español si falla
```

---

## 📌 Resumen del Ajuste Técnico

| Componente | Causa del Problema | Solución Implementada |
| :--- | :--- | :--- |
| **`metaTx.ts`** | `domain.chainId` enviado como `String` en la firma EIP-712 | Convertido a `Number(chainId)` para coincidir exactamente con `block.chainid` en Solidity |
| **`CreateProposal.tsx`** | Intento de enviar propuestas con monto mayor al balance total | Agregada validación previa del saldo de la tesorería antes de firmar |
| **`/api/relay/route.ts`** | Retorno de error genérico sin detalles de la blockchain | Extracción y retorno del mensaje de revert original (`data.message`) |
