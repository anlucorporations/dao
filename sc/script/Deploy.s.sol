// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {MinimalForwarder} from "../src/MinimalForwarder.sol";
import {DAOVoting} from "../src/DAOVoting.sol";

contract DeployScript is Script {
    function run() external {
        uint256 minimumBalance = vm.envOr("MINIMUM_BALANCE", uint256(0.1 ether));

        vm.startBroadcast();

        // 1. Deploy MinimalForwarder first
        MinimalForwarder forwarder = new MinimalForwarder();
        console.log("MinimalForwarder deployed at:", address(forwarder));

        // 2. Deploy DAOVoting with forwarder address
        DAOVoting dao = new DAOVoting(address(forwarder), minimumBalance);
        console.log("DAOVoting deployed at:", address(dao));

        // 3. Inscripción automática del Owner / Deployer (3 ETH)
        dao.registerMember{value: 3 ether}();
        console.log("Owner / Deployer inscrito automaticamente como socio (3 ETH)");

        vm.stopBroadcast();

        // Log deployment info
        console.log("\n=== Deployment Summary ===");
        console.log("MinimalForwarder:", address(forwarder));
        console.log("DAOVoting:", address(dao));
        console.log("Minimum Balance:", minimumBalance);
        console.log("Owner Inscrito:", true);
        console.log("==========================\n");
    }
}
