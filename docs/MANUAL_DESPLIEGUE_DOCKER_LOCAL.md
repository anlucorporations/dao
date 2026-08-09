# 🐳 Manual de Despliegue con Docker Local

Guía para compilar y ejecutar el contenedor Docker de la plataforma web DAO de forma local.

---

## 1. Compilación de la Imagen

Desde la carpeta raíz del proyecto `web/`:
```bash
cd web
docker build -t dao-app:latest .
```

---

## 2. Ejecución del Contenedor Local

```bash
docker run -d -p 3000:3000 --name dao-app-container \
  -e NEXT_PUBLIC_DAO_CONTRACT_ADDRESS="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" \
  -e NEXT_PUBLIC_FORWARDER_CONTRACT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3" \
  -e RELAYER_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" \
  -e RPC_URL="http://host.docker.internal:8545" \
  dao-app:latest
```

Verifica ingresando a `http://localhost:3000`.
