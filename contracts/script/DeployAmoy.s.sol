// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CooperativaCappones.sol";
import "../src/VotacionPropuestas.sol";
import "../src/MinimalForwarder.sol";
import "../src/ActaHashRegistry.sol";

contract DeployAmoy is Script {
    function run() external {
        // Lee la clave privada del admin desde variables de entorno
        uint256 deployerPrivateKey = vm.envUint("ADMIN_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Desplegando contratos desde:", deployer);
        console.log("Red: Polygon Amoy Testnet (Chain ID: 80002)");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Despliega el Forwarder (EIP-2771)
        MinimalForwarder forwarder = new MinimalForwarder();
        console.log("MinimalForwarder desplegado en:", address(forwarder));

        // 2. Despliega el registro de actas
        ActaHashRegistry actaRegistry = new ActaHashRegistry();
        console.log("ActaHashRegistry desplegado en:", address(actaRegistry));

        // 3. Despliega la cooperativa (owner = deployer)
        CooperativaCappones cooperativa = new CooperativaCappones(deployer);
        console.log("CooperativaCappones desplegado en:", address(cooperativa));

        // 4. Despliega el sistema de votacion (con forwarder para meta-tx)
        VotacionPropuestas votacion = new VotacionPropuestas(
            address(cooperativa),
            address(forwarder),
            address(actaRegistry)
        );
        console.log("VotacionPropuestas desplegado en:", address(votacion));

        // 5. Transfiere ownership del registro de actas al contrato de votacion
        actaRegistry.transferOwnership(address(votacion));
        console.log("Ownership de ActaHashRegistry transferido a VotacionPropuestas");

        vm.stopBroadcast();

        // Guarda las direcciones en un archivo JSON para el frontend
        string memory json = string.concat(
            '{
',
            '  "network": "polygon-amoy",
',
            '  "chainId": 80002,
',
            '  "deployer": "', vm.toString(deployer), '",
',
            '  "contracts": {
',
            '    "MinimalForwarder": "', vm.toString(address(forwarder)), '",
',
            '    "ActaHashRegistry": "', vm.toString(address(actaRegistry)), '",
',
            '    "CooperativaCappones": "', vm.toString(address(cooperativa)), '",
',
            '    "VotacionPropuestas": "', vm.toString(address(votacion)), '"
',
            '  }
',
            '}'
        );

        // Escribe el archivo de direcciones
        vm.writeFile("deployments/amoy-latest.json", json);
        console.log("\nDirecciones guardadas en: deployments/amoy-latest.json");
        console.log("\n=== DESPLIEGUE COMPLETADO ===");
    }
}
