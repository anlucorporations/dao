# 🚀 Propuesta de Entorno de Desarrollo y Pruebas Web3 Multi-Proyecto en Google Cloud Platform (GCP)

## 📋 Resumen Ejecutivo

Esta propuesta define la arquitectura estándar de un **Entorno de Desarrollo y Pruebas Unificado en la Nube (GCP Web3 Dev/Test Sandbox)** para **`anlucorporations`**.

El entorno está diseñado para hospedar de manera persistente, centralizada y reutilizable los 4 componentes esenciales de todos tus proyectos Web3:
1. ⚙️ **Foundry / Anvil Network Node**: Nodo blockchain EVM local continuo para despliegue y pruebas de contratos.
2. 💻 **Frontend Layer (Next.js / React)**: Interfaces de usuario accesibles vía HTTPS/IP pública.
3. 🔌 **Backend API Layer**: Servicios de autenticación criptográfica, metatransacciones (EIP-2771 Relayer) y lógica de negocio.
4. 🗄️ **Database Layer (PostgreSQL 16)**: Servidor de base de datos relacional multi-esquema para soportar N proyectos simultáneamente.

---

## 🏛️ Opción 1 (Recomendada): Entorno "GCP Web3 Sandbox VM" (Máxima Eficiencia y Menor Costo)

Un servidor dedicado en **Google Compute Engine** configurado como un **Hub Multi-Proyecto** con Docker Compose y Nginx Proxy Manager.

```mermaid
graph TD
    DEV[Desarrollador / MetaMask] -->|Subdominios / SSL Gratis| NPM[Nginx Proxy Manager :80/443]
    
    subgraph Google Compute Engine VM (e2-standard-4 / 4 vCPUs / 16GB RAM)
        subgraph Core Infraestructura Compartida
            ANVIL[Foundry Anvil Master Node :8545<br>Chain ID 31337]
            PG[(PostgreSQL 16 Shared Server :5432)]
        </div>

        subgraph Proyecto 1: DAO Los Cappones
            WEB1[dao-web :3000]
            DB1[(Database: dao_cappones)]
        end

        subgraph Proyecto 2: Nuevo Proyecto Web3
            WEB2[proyecto2-web :3001]
            DB2[(Database: proyecto2_db)]
        end
    end

    NPM -->|dao.dev.anlu.com| WEB1
    NPM -->|app2.dev.anlu.com| WEB2
    NPM -->|rpc.dev.anlu.com| ANVIL
    WEB1 --> DB1
    WEB2 --> DB2
    WEB1 & WEB2 --> ANVIL
```

### 💡 Características Clave de la Opción 1
- **Nodo Anvil Continuo (`rpc.dev.anlu.com`):** Un solo nodo Anvil corriendo 24/7 en el puerto `8545`. Todos tus proyectos y cuentas de MetaMask se conectan a la misma URL RPC en la nube.
- **PostgreSQL Multi-Database:** Un solo servidor PostgreSQL en el puerto `5432` que administra múltiples bases de datos aisladas (`dao_cappones`, `banca_db`, `nft_db`, etc.).
- **Subdominios con HTTPS Automático:** Usando **Nginx Proxy Manager**, cada nuevo proyecto obtiene un subdominio profesional con certificado SSL gratuito (Let's Encrypt) en 30 segundos.
- **Costo Fijo Predecible:** ~$45 - $55 USD/mes por la instancia completa sin sorpresas en la factura.

---

## ⚡ Opción 2: Entorno Híbrido Serverless (Cloud Run + Cloud SQL + Anvil VM)

Para proyectos que requieren alta escalabilidad independiente por servicio:

- **Frontend & Backend (Next.js / APIs):** Desplegados en **Google Cloud Run** (escalan a 0 instancias cuando no hay tráfico para no consumir créditos).
- **Base de Datos:** Instancia gestionada **Google Cloud SQL for PostgreSQL** (`db-f1-micro` / `db-custom-1-3840`).
- **Nodo Blockchain:** Instancia mínima Compute Engine `micro` ejecutando Foundry Anvil o conexión directa a redes de prueba públicas (Polygon Amoy Testnet).

---

## 🛠️ Especificación Técnica del Entorno Recomendado (Opción 1)

| Componente | Configuración GCP | Función en el Entorno |
|---|---|---|
| **VM Instance** | `Compute Engine e2-standard-4` | 4 vCPUs, 16 GB RAM, 50 GB SSD Disk |
| **Zona GCP** | `us-central1-a` | Baja latencia para América Latina / EE.UU. |
| **OS** | Ubuntu 22.04 LTS | Sistema base con soporte de Docker Engine v24+ |
| **Domain Manager** | Nginx Proxy Manager / Traefik | Enrutamiento SSL (`https://...`) automático |
| **Blockchain Node** | Foundry Anvil (`0.0.0.0:8545`) | Red EVM unificada con 10 cuentas de prueba |
| **Database Server** | PostgreSQL 16 Alpine | Motor DB con volúmenes persistentes |

---

## 📋 Estructura de Trabajo para la Puesta en Marcha

Para habilitar este entorno en tu cuenta de GCP (`anlucorporations@gmail.com`), seguiremos 4 pasos simples:

1. **Aprovisionar la VM Hub en GCP:** Ejecutar el comando `gcloud compute instances create gcp-web3-sandbox`.
2. **Instalar la Infraestructura Base:** Desplegar los contenedores maestro de `PostgreSQL` y `Anvil`.
3. **Configurar Dominio / DNS:** Apuntar tu dominio o IP pública para el acceso seguro por HTTPS.
4. **Desplegar DAO Los Cappones:** Lanzar el primer proyecto oficial dentro de este nuevo sandbox unificado.
