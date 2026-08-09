# 🏗️ Propuesta de Entorno de Desarrollo y Producción GCP + Web3

Especificación técnica del diseño de la infraestructura serverless para aplicaciones Web3 descentralizadas.

---

## Componentes de la Arquitectura

1. **Google Cloud Run**: Alojamiento de la interfaz web en contenedores Docker auto-escalables.
2. **Relayer Service**: API Route integrada en Next.js conectada mediante RPC a nodos de blockchain.
3. **Artifact Registry**: Almacenamiento seguro de imágenes de contenedor Docker.
4. **Blockchain Layer**: Nodos Ethereum / Anvil EIP-2771.
