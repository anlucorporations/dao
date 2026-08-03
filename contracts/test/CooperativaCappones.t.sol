// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CooperativaCappones.sol";

contract CooperativaCapponesTest is Test {
    CooperativaCappones public cooperativa;

    address public owner = address(1);
    address public socio1 = address(2);
    address public socio2 = address(3);
    address public socio3 = address(4);
    address public noSocio = address(5);

    function setUp() public {
        vm.startPrank(owner);
        cooperativa = new CooperativaCappones(owner);

        // Registrar socios
        cooperativa.registrarSocio(socio1);
        cooperativa.registrarSocio(socio2);
        cooperativa.registrarSocio(socio3);
        vm.stopPrank();
    }


    // === REGISTRO ===
    function test_RegistrarSocio() public {
        address nuevo = address(6);
        vm.prank(owner);
        cooperativa.registrarSocio(nuevo);
        assertTrue(cooperativa.esSocio(nuevo));
    }

    function test_Revert_RegistrarSocio_Duplicado() public {
        vm.prank(owner);
        vm.expectRevert("Ya es socio");
        cooperativa.registrarSocio(socio1);
    }

    function test_Revert_RegistrarSocio_AddressZero() public {
        vm.prank(owner);
        vm.expectRevert("Wallet invalida");
        cooperativa.registrarSocio(address(0));
    }

    function test_Revert_RegistrarSocio_NoOwner() public {
        vm.prank(noSocio);
        vm.expectRevert("Solo el owner");
        cooperativa.registrarSocio(address(6));
    }

    // === APORTES ===
    function test_DepositarAporte() public {
        vm.deal(socio1, 10 ether);
        vm.prank(socio1);
        cooperativa.depositarAporte{value: 5 ether}();

        (, uint256 balance,,,) = cooperativa.socios(socio1);
        assertEq(balance, 5 ether);
        assertEq(cooperativa.capitalTotal(), 5 ether);
    }

    function test_Revert_DepositarAporte_NoSocio() public {
        vm.deal(noSocio, 1 ether);
        vm.prank(noSocio);
        vm.expectRevert("No es socio");
        cooperativa.depositarAporte{value: 1 ether}();
    }

    function test_Revert_DepositarAporte_Cero() public {
        vm.prank(socio1);
        vm.expectRevert("Monto debe ser mayor a 0");
        cooperativa.depositarAporte{value: 0}();
    }

    function test_MultiplesAportes() public {
        vm.deal(socio1, 10 ether);
        vm.prank(socio1);
        cooperativa.depositarAporte{value: 3 ether}();
        vm.prank(socio1);
        cooperativa.depositarAporte{value: 2 ether}();

        (, uint256 balance,,,) = cooperativa.socios(socio1);
        assertEq(balance, 5 ether);
    }

    // === WALLET RECUPERACIÓN ===
    function test_SetWalletRecuperacion() public {
        vm.prank(socio1);
        cooperativa.setWalletRecuperacion(address(10));
        (,,,, address walletRecuperacion) = cooperativa.socios(socio1);
        assertEq(walletRecuperacion, address(10));
    }

    function test_Revert_SetWalletRecuperacion_AddressZero() public {
        vm.prank(socio1);
        vm.expectRevert("Wallet invalida");
        cooperativa.setWalletRecuperacion(address(0));
    }

    // === POSTULACIONES ===
    function test_TieneMinimoParaDirectivo() public {
        vm.deal(socio1, 10 ether);
        vm.prank(socio1);
        cooperativa.depositarAporte{value: 10 ether}();

        assertTrue(cooperativa.tieneMinimoParaDirectivo(socio1));
    }

    function test_NoTieneMinimoParaDirectivo() public {
        vm.deal(socio2, 20 ether);
        vm.prank(socio2);
        cooperativa.depositarAporte{value: 20 ether}();

        vm.deal(socio1, 1 ether);
        vm.prank(socio1);
        cooperativa.depositarAporte{value: 1 ether}();

        // socio1 tiene 1 de 21 = 4.7%
        assertFalse(cooperativa.tieneMinimoParaDirectivo(socio1));
    }

    function test_PostularseACargo() public {
        // socio1 deposita 10 ETH (100% del capital)
        vm.deal(socio1, 10 ether);
        vm.prank(socio1);
        cooperativa.depositarAporte{value: 10 ether}();

        vm.prank(socio1);
        cooperativa.postularseACargo(CooperativaCappones.Cargo.CONTRALOR);

        CooperativaCappones.Postulacion[] memory posts = cooperativa.getPostulaciones();
        assertEq(posts.length, 1);
        assertEq(posts[0].postulante, socio1);
    }

    function test_Revert_Postularse_SinMinimo() public {
        vm.deal(socio2, 20 ether);
        vm.prank(socio2);
        cooperativa.depositarAporte{value: 20 ether}();

        vm.deal(socio1, 1 ether);
        vm.prank(socio1);
        cooperativa.depositarAporte{value: 1 ether}();

        vm.prank(socio1);
        vm.expectRevert("No tiene 10% del capital");
        cooperativa.postularseACargo(CooperativaCappones.Cargo.CONTRALOR);
    }

    function test_Revert_Postularse_YaDirectivo() public {
        // Setup: hacer a socio1 directivo con aporte valido
        vm.deal(socio1, 10 ether);
        vm.prank(socio1);
        cooperativa.depositarAporte{value: 10 ether}();

        vm.prank(owner);
        cooperativa.asignarDirectivoInicial(socio1, CooperativaCappones.Cargo.CONTRALOR);

        // Intentar postularse de nuevo
        vm.prank(socio1);
        vm.expectRevert("Ya es directivo");
        cooperativa.postularseACargo(CooperativaCappones.Cargo.CONTADOR);
    }

    // === VOTACIÓN POSTULACIONES ===
    function test_VotarPostulacion() public {
        vm.deal(socio1, 10 ether);
        vm.prank(socio1);
        cooperativa.depositarAporte{value: 10 ether}();
        vm.prank(socio1);
        cooperativa.postularseACargo(CooperativaCappones.Cargo.CONTRALOR);

        vm.prank(socio2);
        cooperativa.votarPostulacion(0, true);

        CooperativaCappones.Postulacion[] memory posts = cooperativa.getPostulaciones();
        assertEq(posts[0].votosFavor, 1);
    }

    function test_Revert_VotarPostulacion_Cerrada() public {
        vm.deal(socio1, 10 ether);
        vm.prank(socio1);
        cooperativa.depositarAporte{value: 10 ether}();
        vm.prank(socio1);
        cooperativa.postularseACargo(CooperativaCappones.Cargo.CONTRALOR);

        vm.warp(block.timestamp + 2 days);

        vm.prank(socio2);
        vm.expectRevert("Votacion cerrada");
        cooperativa.votarPostulacion(0, true);
    }

    function test_FinalizarPostulacion_Aprobada() public {
        vm.deal(socio1, 10 ether);
        vm.prank(socio1);
        cooperativa.depositarAporte{value: 10 ether}();
        vm.prank(socio1);
        cooperativa.postularseACargo(CooperativaCappones.Cargo.CONTRALOR);

        vm.prank(socio2);
        cooperativa.votarPostulacion(0, true);
        vm.prank(socio3);
        cooperativa.votarPostulacion(0, true);

        vm.warp(block.timestamp + 2 days);
        vm.prank(owner);
        cooperativa.finalizarPostulacion(0);

        assertTrue(cooperativa.getDirectivo(socio1).activo);
        assertEq(uint(cooperativa.getDirectivo(socio1).cargo), uint(CooperativaCappones.Cargo.CONTRALOR));
    }

    function test_FinalizarPostulacion_Rechazada() public {
        vm.deal(socio1, 10 ether);
        vm.prank(socio1);
        cooperativa.depositarAporte{value: 10 ether}();
        vm.prank(socio1);
        cooperativa.postularseACargo(CooperativaCappones.Cargo.CONTRALOR);

        vm.prank(socio2);
        cooperativa.votarPostulacion(0, false);
        vm.prank(socio3);
        cooperativa.votarPostulacion(0, false);

        vm.warp(block.timestamp + 2 days);
        vm.prank(owner);
        cooperativa.finalizarPostulacion(0);

        assertFalse(cooperativa.getDirectivo(socio1).activo);
    }


    function test_RecuperarWallet() public {
        address nuevaWallet = address(10);
        vm.prank(socio1);
        cooperativa.setWalletRecuperacion(nuevaWallet);

        vm.prank(owner);
        cooperativa.recuperarWallet(socio1, nuevaWallet);

        assertFalse(cooperativa.esSocio(socio1));
        assertTrue(cooperativa.esSocio(nuevaWallet));
    }



    function test_GetListaSocios() public {
        address[] memory socios = cooperativa.getListaSocios();
        assertEq(socios.length, 3);
    }

    function test_EsSocioActivo() public {
        assertTrue(cooperativa.esSocioActivo(socio1));
        assertFalse(cooperativa.esSocioActivo(noSocio));
    }

    function test_ReceiveEther() public {
        vm.deal(socio1, 1 ether);
        vm.prank(socio1);
        (bool success, ) = address(cooperativa).call{value: 1 ether}("");
        assertTrue(success);
        assertEq(cooperativa.capitalTotal(), 1 ether);
    }
}
