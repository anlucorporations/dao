// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ActaHashRegistry.sol";

contract ActaHashRegistryTest is Test {
    ActaHashRegistry public registry;

    address public owner = address(1);
    address public noOwner = address(2);
    bytes32 public testHash = keccak256("acta_de_prueba");

    function setUp() public {
        vm.startPrank(owner);
        registry = new ActaHashRegistry();
        vm.stopPrank();
    }


    function test_RegistrarHash() public {
        vm.prank(owner);
        registry.registrarHash(1, testHash);

        (bytes32 hash,,, bool valida) = registry.actas(1);
        assertEq(hash, testHash);
        assertTrue(valida);
    }

    function test_Revert_RegistrarHash_Duplicado() public {
        vm.prank(owner);
        registry.registrarHash(1, testHash);

        vm.prank(owner);
        vm.expectRevert("Propuesta ya tiene acta");
        registry.registrarHash(1, keccak256("otro"));
    }

    function test_Revert_RegistrarHash_HashCero() public {
        vm.prank(owner);
        vm.expectRevert("Hash invalido");
        registry.registrarHash(1, bytes32(0));
    }

    function test_Revert_RegistrarHash_HashRepetido() public {
        vm.prank(owner);
        registry.registrarHash(1, testHash);

        vm.prank(owner);
        vm.expectRevert("Hash ya registrado");
        registry.registrarHash(2, testHash);
    }

    function test_Revert_RegistrarHash_NoOwner() public {
        vm.prank(noOwner);
        vm.expectRevert();
        registry.registrarHash(1, testHash);
    }

    function test_VerificarHash_Inexistente() public {
        (bool valido, uint256 propuestaId) = registry.verificarHash(keccak256("no_existe"));
        assertFalse(valido);
        assertEq(propuestaId, 0);
    }

    function test_RegistrarHash_Multiples() public {
        vm.prank(owner);
        registry.registrarHash(1, keccak256("acta1"));

        vm.prank(owner);
        registry.registrarHash(2, keccak256("acta2"));

        assertEq(registry.totalActas(), 2);
    }

    event ActaRegistrada(uint256 indexed propuestaId, bytes32 hash, uint256 fecha);

    function test_Evento_ActaRegistrada() public {
        vm.prank(owner);
        vm.expectEmit(true, true, true, true);
        emit ActaRegistrada(1, testHash, block.timestamp);
        registry.registrarHash(1, testHash);
    }
}

