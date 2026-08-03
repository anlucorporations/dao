// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CooperativaCappones.sol";
import "../src/VotacionPropuestas.sol";
import "../src/MinimalForwarder.sol";
import "../src/ActaHashRegistry.sol";

contract DeployLocal is Script {
    function run() external {
        // Usar la Private Key de la cuenta #9 de Anvil (SuperUsuario anlu)
        uint256 deployerPrivateKey = 0x2a871d0798f97d796df285775602922437370edd16347100108392d40b03220a;
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Desplegando contratos en red local (Anvil)...");
        console.log("Deployer (anlu):", deployer);

        vm.startBroadcast(deployerPrivateKey);

        MinimalForwarder forwarder = new MinimalForwarder();
        console.log("Forwarder:", address(forwarder));

        ActaHashRegistry actaRegistry = new ActaHashRegistry();
        console.log("ActaRegistry:", address(actaRegistry));

        CooperativaCappones cooperativa = new CooperativaCappones(deployer);
        console.log("Cooperativa:", address(cooperativa));

        VotacionPropuestas votacion = new VotacionPropuestas(
            address(cooperativa),
            address(forwarder),
            address(actaRegistry)
        );
        console.log("Votacion:", address(votacion));

        actaRegistry.transferOwnership(address(votacion));
        cooperativa.setVotacionContract(address(votacion));

        vm.stopBroadcast();


        console.log("Despliegue completado!");

        // Exportar direcciones a JSON para consumo de la app Web
        string memory jsonStr = string(
            abi.encodePacked(
                "{\n",
                '  "FORWARDER_ADDRESS": "', vm.toString(address(forwarder)), '",\n',
                '  "ACTA_REGISTRY_ADDRESS": "', vm.toString(address(actaRegistry)), '",\n',
                '  "COOPERATIVA_ADDRESS": "', vm.toString(address(cooperativa)), '",\n',
                '  "VOTACION_ADDRESS": "', vm.toString(address(votacion)), '"\n',
                "}"
            )
        );
        vm.writeFile("deployments/local.json", jsonStr);
        console.log("Direcciones exportadas a deployments/local.json");
    }
}

