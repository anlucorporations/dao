// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CooperativaCappones.sol";
import "../src/VotacionPropuestas.sol";
import "../src/MinimalForwarder.sol";
import "../src/ActaHashRegistry.sol";

contract DeployLocal is Script {
    function run() external {
        // Cuenta #0 de Anvil para financiar y ejecutar la transacción de despliegue
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        address deployer = vm.addr(deployerPrivateKey);
        address anluOwner = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

        console.log("Desplegando contratos en red local (Anvil)...");
        console.log("Deployer:", deployer);
        console.log("SuperUsuario Owner (anlu):", anluOwner);

        vm.startBroadcast();

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
        cooperativa.transferOwnership(anluOwner);

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

