// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CooperativaCappones.sol";
import "../src/VotacionPropuestas.sol";
import "../src/MinimalForwarder.sol";
import "../src/ActaHashRegistry.sol";

contract VotacionPropuestasTest is Test {
    CooperativaCappones public cooperativa;
    VotacionPropuestas public votacion;
    MinimalForwarder public forwarder;
    ActaHashRegistry public actaRegistry;

    address public owner = address(1);
    address public presidente = address(2);
    address public vicepresidente = address(3);
    address public secretario = address(4);
    address public contralor = address(5);
    address public contador = address(6);
    address public socio1 = address(7);
    address public socio2 = address(8);

    function setUp() public {
        // Setup contratos
        vm.startPrank(owner);
        cooperativa = new CooperativaCappones(owner);

        forwarder = new MinimalForwarder();
        actaRegistry = new ActaHashRegistry();

        votacion = new VotacionPropuestas(
            address(cooperativa),
            address(forwarder),
            address(actaRegistry)
        );

        // Transferir ownership del actaRegistry
        actaRegistry.transferOwnership(address(votacion));

        // Registrar socios
        address[] memory socios = new address[](6);
        socios[0] = presidente; socios[1] = vicepresidente;
        socios[2] = secretario; socios[3] = contralor;
        socios[4] = contador; socios[5] = socio1;

        for (uint i = 0; i < socios.length; i++) {
            cooperativa.registrarSocio(socios[i]);
        }
        cooperativa.registrarSocio(socio2);
        vm.stopPrank();

        for (uint i = 0; i < socios.length; i++) {
            vm.deal(socios[i], 10 ether);
            vm.prank(socios[i]);
            cooperativa.depositarAporte{value: 10 ether}();
        }
    }


    function test_CrearPropuesta() public {
        // Hacer presidente directivo primero (simplificado para test)
        _hacerDirectivo(presidente, CooperativaCappones.Cargo.PRESIDENTE);

        vm.prank(presidente);
        uint256 id = votacion.crearPropuesta(
            "Compra de equipos",
            "Comprar 5 computadoras",
            1 ether,
            address(100),
            VotacionPropuestas.TipoPropuesta.INVERSION
        );

        assertEq(id, 0);
        VotacionPropuestas.Propuesta memory p = votacion.getPropuesta(0);
        assertEq(p.nombre, "Compra de equipos");
        assertEq(uint(p.estado), uint(VotacionPropuestas.EstadoPropuesta.BORRADOR));
    }

    function test_Revert_CrearPropuesta_NoDirectivo() public {
        vm.prank(socio2);
        vm.expectRevert("No es directivo");
        votacion.crearPropuesta("X", "Y", 1, address(1), VotacionPropuestas.TipoPropuesta.INVERSION);
    }

    function test_Revert_CrearPropuesta_Vicepresidente() public {
        _hacerDirectivo(vicepresidente, CooperativaCappones.Cargo.VICEPRESIDENTE);

        vm.prank(vicepresidente);
        vm.expectRevert("Sin permiso para crear");
        votacion.crearPropuesta("X", "Y", 1, address(1), VotacionPropuestas.TipoPropuesta.INVERSION);
    }

    function test_FirmarAval() public {
        _hacerDirectivo(presidente, CooperativaCappones.Cargo.PRESIDENTE);
        _hacerDirectivo(contralor, CooperativaCappones.Cargo.CONTRALOR);
        _hacerDirectivo(contador, CooperativaCappones.Cargo.CONTADOR);
        _hacerDirectivo(vicepresidente, CooperativaCappones.Cargo.VICEPRESIDENTE);
        _hacerDirectivo(secretario, CooperativaCappones.Cargo.SECRETARIO);

        vm.prank(presidente);
        votacion.crearPropuesta("Test", "Desc", 1 ether, address(1), VotacionPropuestas.TipoPropuesta.INVERSION);

        vm.prank(presidente);
        votacion.firmarAval(0);

        VotacionPropuestas.Aval memory a = votacion.getAval(0, presidente);
        assertTrue(a.firmado);
    }

    function test_Revert_FirmarAval_YaFirmado() public {
        _hacerDirectivo(presidente, CooperativaCappones.Cargo.PRESIDENTE);
        _hacerDirectivo(contralor, CooperativaCappones.Cargo.CONTRALOR);

        vm.prank(presidente);
        votacion.crearPropuesta("Test", "Desc", 1 ether, address(1), VotacionPropuestas.TipoPropuesta.INVERSION);

        vm.prank(presidente);
        votacion.firmarAval(0);

        vm.prank(presidente);
        vm.expectRevert("Ya firmo");
        votacion.firmarAval(0);
    }

    function test_PublicarPropuesta() public {
        _setupDirectivosYPropuesta();

        VotacionPropuestas.Propuesta memory p = votacion.getPropuesta(0);
        assertEq(uint(p.estado), uint(VotacionPropuestas.EstadoPropuesta.POR_DISCUTIR));
        assertTrue(p.deadline > 0);
    }

    function test_Revert_PublicarPropuesta_SinAvales() public {
        _hacerDirectivo(presidente, CooperativaCappones.Cargo.PRESIDENTE);

        vm.prank(presidente);
        votacion.crearPropuesta("Test", "Desc", 1 ether, address(1), VotacionPropuestas.TipoPropuesta.INVERSION);

        // No firmar avales - intentar votar directamente
        vm.prank(socio1);
        vm.expectRevert("No esta en discusion");
        votacion.votar(0, VotacionPropuestas.TipoVoto.ACEPTADA);
    }

    function test_Votar() public {
        _setupDirectivosYPropuesta();

        vm.prank(socio1);
        votacion.votar(0, VotacionPropuestas.TipoVoto.ACEPTADA);

        VotacionPropuestas.Propuesta memory p = votacion.getPropuesta(0);
        assertEq(p.votosAceptada, 1);
    }

    function test_Revert_Votar_DosVeces() public {
        _setupDirectivosYPropuesta();

        vm.prank(socio1);
        votacion.votar(0, VotacionPropuestas.TipoVoto.ACEPTADA);

        vm.prank(socio1);
        vm.expectRevert("Ya voto");
        votacion.votar(0, VotacionPropuestas.TipoVoto.RECHAZADA);
    }

    function test_Revert_Votar_NoSocio() public {
        _setupDirectivosYPropuesta();

        address noSocio = address(99);
        vm.prank(noSocio);
        vm.expectRevert("No es socio activo");
        votacion.votar(0, VotacionPropuestas.TipoVoto.ACEPTADA);
    }

    function test_Revert_Votar_DespuesDeadline() public {
        _setupDirectivosYPropuesta();

        vm.warp(block.timestamp + 2 days);

        vm.prank(socio1);
        vm.expectRevert("Votacion cerrada");
        votacion.votar(0, VotacionPropuestas.TipoVoto.ACEPTADA);
    }

    function test_CerrarPropuesta_Aprobada() public {
        _setupDirectivosYPropuesta();

        vm.prank(socio1);
        votacion.votar(0, VotacionPropuestas.TipoVoto.ACEPTADA);

        vm.warp(block.timestamp + 2 days);
        votacion.cerrarPropuesta(0);

        VotacionPropuestas.Propuesta memory p = votacion.getPropuesta(0);
        assertEq(uint(p.estado), uint(VotacionPropuestas.EstadoPropuesta.APROBADA));
    }

    function test_CerrarPropuesta_Rechazada() public {
        _setupDirectivosYPropuesta();

        vm.prank(socio1);
        votacion.votar(0, VotacionPropuestas.TipoVoto.RECHAZADA);

        vm.warp(block.timestamp + 2 days);
        votacion.cerrarPropuesta(0);

        VotacionPropuestas.Propuesta memory p = votacion.getPropuesta(0);
        assertEq(uint(p.estado), uint(VotacionPropuestas.EstadoPropuesta.RECHAZADA));
    }

    function test_CerrarPropuesta_SinVotos_Reintento() public {
        _setupDirectivosYPropuesta();

        vm.warp(block.timestamp + 2 days);
        votacion.cerrarPropuesta(0);

        VotacionPropuestas.Propuesta memory p = votacion.getPropuesta(0);
        // Debe reintentar - estado vuelve a POR_DISCUTIR
        assertEq(uint(p.estado), uint(VotacionPropuestas.EstadoPropuesta.POR_DISCUTIR));
        assertEq(p.intentos, 2);
    }

    function test_CerrarPropuesta_SinVotos_RechazadaDespues3() public {
        _setupDirectivosYPropuesta();

        // Intento 1 (intentos pasa a 2)
        vm.warp(block.timestamp + 2 days);
        votacion.cerrarPropuesta(0);

        // Intento 2 (intentos pasa a 3)
        vm.warp(block.timestamp + 4 days);
        votacion.cerrarPropuesta(0);

        // Intento 3 (al ser intentos >= 3, rechaza)
        vm.warp(block.timestamp + 6 days);
        votacion.cerrarPropuesta(0);

        VotacionPropuestas.Propuesta memory p = votacion.getPropuesta(0);
        assertEq(uint(p.estado), uint(VotacionPropuestas.EstadoPropuesta.RECHAZADA));
    }

    function test_ApelarPropuesta() public {
        _setupDirectivosYPropuesta();

        // Crear propuesta administrativa con monto valido
        vm.prank(presidente);
        votacion.crearPropuesta("Admin", "Desc", 1, address(1), VotacionPropuestas.TipoPropuesta.ADMINISTRATIVA);

        // Firmar avales
        vm.prank(presidente); votacion.firmarAval(1);
        vm.prank(contralor); votacion.firmarAval(1);
        vm.prank(contador); votacion.firmarAval(1);

        // Votar a favor
        vm.prank(socio1);
        votacion.votar(1, VotacionPropuestas.TipoVoto.ACEPTADA);

        vm.warp(block.timestamp + 13 hours); // Pasar 12h + 1h
        votacion.cerrarPropuesta(1);


        // Apelar
        vm.prank(presidente);
        votacion.apelarPropuesta(1);

        VotacionPropuestas.Propuesta memory p = votacion.getPropuesta(1);
        assertEq(uint(p.estado), uint(VotacionPropuestas.EstadoPropuesta.APELADA));
    }

    function test_Revert_Apelar_NoAdministrativa() public {
        _setupDirectivosYPropuesta();

        vm.prank(socio1);
        votacion.votar(0, VotacionPropuestas.TipoVoto.ACEPTADA);
        vm.warp(block.timestamp + 2 days);
        votacion.cerrarPropuesta(0);

        vm.prank(presidente);
        vm.expectRevert("Solo administrativas");
        votacion.apelarPropuesta(0);
    }

    function test_EjecutarPropuesta() public {
        _setupDirectivosYPropuesta();

        // Dar fondos al contrato de votacion
        vm.deal(address(votacion), 5 ether);

        vm.prank(socio1);
        votacion.votar(0, VotacionPropuestas.TipoVoto.ACEPTADA);

        vm.warp(block.timestamp + 2 days);
        votacion.cerrarPropuesta(0);

        address receptora = address(1);
        uint256 balanceAntes = receptora.balance;

        vm.prank(presidente);
        votacion.ejecutarPropuesta(0);

        assertEq(receptora.balance - balanceAntes, 1 ether);

        VotacionPropuestas.Propuesta memory p = votacion.getPropuesta(0);
        assertTrue(p.ejecutada);
    }

    function test_Revert_Ejecutar_NoAprobada() public {
        _setupDirectivosYPropuesta();

        vm.prank(socio1);
        votacion.votar(0, VotacionPropuestas.TipoVoto.RECHAZADA);

        vm.warp(block.timestamp + 2 days);
        votacion.cerrarPropuesta(0);

        vm.prank(presidente);
        vm.expectRevert("No aprobada");
        votacion.ejecutarPropuesta(0);
    }

    function test_Revert_Ejecutar_YaEjecutada() public {
        _setupDirectivosYPropuesta();
        vm.deal(address(votacion), 5 ether);

        vm.prank(socio1);
        votacion.votar(0, VotacionPropuestas.TipoVoto.ACEPTADA);

        vm.warp(block.timestamp + 2 days);
        votacion.cerrarPropuesta(0);

        vm.prank(presidente);
        votacion.ejecutarPropuesta(0);

        vm.prank(presidente);
        vm.expectRevert("Ya ejecutada");
        votacion.ejecutarPropuesta(0);
    }


    function test_SetDisponibilidad() public {
        _hacerDirectivo(presidente, CooperativaCappones.Cargo.PRESIDENTE);

        vm.prank(presidente);
        votacion.crearPropuesta("Test", "Desc", 1 ether, address(1), VotacionPropuestas.TipoPropuesta.INVERSION);

        vm.prank(presidente);
        votacion.setDisponibilidad(0, false);

        VotacionPropuestas.Propuesta memory p = votacion.getPropuesta(0);
        assertFalse(p.disponible);
    }

    function test_Revert_SetDisponibilidad_NoDirectivo() public {
        _hacerDirectivo(presidente, CooperativaCappones.Cargo.PRESIDENTE);

        vm.prank(presidente);
        votacion.crearPropuesta("Test", "Desc", 1 ether, address(1), VotacionPropuestas.TipoPropuesta.INVERSION);

        vm.prank(socio2);
        vm.expectRevert("No es directivo");
        votacion.setDisponibilidad(0, false);
    }

    // === HELPERS ===
    function _hacerDirectivo(address _wallet, CooperativaCappones.Cargo _cargo) internal {
        vm.prank(owner);
        cooperativa.asignarDirectivoInicial(_wallet, _cargo);
    }


    function _setupDirectivosYPropuesta() internal {
        _hacerDirectivo(presidente, CooperativaCappones.Cargo.PRESIDENTE);
        _hacerDirectivo(contralor, CooperativaCappones.Cargo.CONTRALOR);
        _hacerDirectivo(contador, CooperativaCappones.Cargo.CONTADOR);
        _hacerDirectivo(vicepresidente, CooperativaCappones.Cargo.VICEPRESIDENTE);
        _hacerDirectivo(secretario, CooperativaCappones.Cargo.SECRETARIO);

        vm.prank(presidente);
        votacion.crearPropuesta("Test", "Desc", 1 ether, address(1), VotacionPropuestas.TipoPropuesta.INVERSION);

        vm.prank(presidente); votacion.firmarAval(0);
        vm.prank(contralor); votacion.firmarAval(0);
        vm.prank(contador); votacion.firmarAval(0);
    }
}
