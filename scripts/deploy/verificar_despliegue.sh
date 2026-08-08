#!/bin/bash
# ============================================================
# SCRIPT DE VERIFICACIÓN POST-DESPLIEGUE
# Fase 4: Despliegue
# ============================================================

set -e

echo "=== VERIFICACIÓN POST-DESPLIEGUE ==="
echo ""

# Cargar direcciones desde el archivo de despliegue
DEPLOY_FILE="contracts/deployments/amoy-latest.json"

if [ ! -f "$DEPLOY_FILE" ]; then
    echo "ERROR: No se encontró $DEPLOY_FILE"
    echo "Ejecuta 'make deploy-amoy' primero."
    exit 1
fi

FORWARDER=$(cat $DEPLOY_FILE | grep -o '"MinimalForwarder": "[^"]*"' | cut -d'"' -f4)
COOPERATIVA=$(cat $DEPLOY_FILE | grep -o '"CooperativaCappones": "[^"]*"' | cut -d'"' -f4)
VOTACION=$(cat $DEPLOY_FILE | grep -o '"VotacionPropuestas": "[^"]*"' | cut -d'"' -f4)
ACTA=$(cat $DEPLOY_FILE | grep -o '"ActaHashRegistry": "[^"]*"' | cut -d'"' -f4)

echo "Direcciones detectadas:"
echo "  Forwarder:        $FORWARDER"
echo "  Cooperativa:      $COOPERATIVA"
echo "  Votacion:         $VOTACION"
echo "  ActaRegistry:     $ACTA"
echo ""

# Verificar conexión a Polygon Amoy
echo "1. Verificando conexión a Polygon Amoy..."
curl -s -X POST https://rpc-amoy.polygon.technology   -H "Content-Type: application/json"   -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' | grep -q "0x13882" && echo "   ✅ Conexión OK" || echo "   ❌ Error de conexión"

# Verificar que los contratos tienen código
echo ""
echo "2. Verificando que los contratos están desplegados..."
for ADDR in $FORWARDER $COOPERATIVA $VOTACION $ACTA; do
    CODE=$(curl -s -X POST https://rpc-amoy.polygon.technology       -H "Content-Type: application/json"       -d "{"jsonrpc":"2.0","method":"eth_getCode","params":["$ADDR","latest"],"id":1}" | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
    if [ "$CODE" != "0x" ] && [ ${#CODE} -gt 10 ]; then
        echo "   ✅ $ADDR tiene código"
    else
        echo "   ❌ $ADDR NO tiene código (¿falló el despliegue?)"
    fi
done

# Verificar balance del SuperUsuario
echo ""
echo "3. Verificando balance del SuperUsuario..."
BALANCE=$(curl -s -X POST https://rpc-amoy.polygon.technology   -H "Content-Type: application/json"   -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x2d3db17af7a2e9c256c9204ae8881d63ad1df833","latest"],"id":1}' | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
BALANCE_DEC=$(echo "ibase=16; $(echo $BALANCE | sed 's/0x//' | tr 'a-f' 'A-F')" | bc)
BALANCE_MATIC=$(echo "scale=4; $BALANCE_DEC / 1000000000000000000" | bc)
echo "   Balance: $BALANCE_MATIC MATIC"
if (( $(echo "$BALANCE_MATIC > 0.1" | bc -l) )); then
    echo "   ✅ Suficiente para operar"
else
    echo "   ⚠️  Balance bajo. Recarga en el faucet."
fi

echo ""
echo "=== VERIFICACIÓN COMPLETADA ==="
