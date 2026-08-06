#!/bin/sh

echo "Iniciando nodo Anvil..."
anvil --host 0.0.0.0 --port 8545 --allow-origin "*" --chain-id 31337 --gas-price 1 &
ANVIL_PID=$!

echo "Esperando que Anvil esté listo..."
sleep 5

rm -rf broadcast cache out deployments || true
echo "Desplegando contratos inteligentes en Anvil..."
forge script script/DeployLocal.s.sol --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast --force || true

echo "Servicios de Blockchain listos en Anvil."
wait $ANVIL_PID
