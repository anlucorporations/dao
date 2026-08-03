#!/bin/sh
set -e

echo "Iniciando nodo Anvil..."
anvil --host 0.0.0.0 --port 8545 &
ANVIL_PID=$!

echo "Esperando que Anvil esté listo..."
sleep 3

echo "Desplegando contratos inteligentes en Anvil..."
forge script script/DeployLocal.s.sol --rpc-url http://localhost:8545 --broadcast

echo "Servicios de Blockchain listos en Anvil."
wait $ANVIL_PID
