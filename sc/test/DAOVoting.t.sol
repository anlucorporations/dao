// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {DAOVoting} from "../src/DAOVoting.sol";
import {MinimalForwarder} from "../src/MinimalForwarder.sol";

contract DAOVotingTest is Test {
    DAOVoting public dao;
    MinimalForwarder public forwarder;

    address public owner = address(this);
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public charlie = address(0x3);
    address public recipient = address(0x4);

    uint256 public constant MINIMUM_BALANCE = 0.1 ether;
    uint256 public constant VOTING_DURATION = 7 days;

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed creator,
        string title,
        address recipient,
        uint256 amount,
        uint256 votingDeadline,
        string description
    );
    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        DAOVoting.VoteType voteType
    );
    event ProposalExecuted(
        uint256 indexed proposalId,
        address recipient,
        uint256 amount
    );
    event MemberRegistered(address indexed member, uint256 depositAmount);
    event SecondPeriodStarted(uint256 indexed proposalId, uint256 newDeadline);
    event ProposalRejected(uint256 indexed proposalId, string reason);

    function setUp() public {
        forwarder = new MinimalForwarder();
        dao = new DAOVoting(address(forwarder), MINIMUM_BALANCE);

        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(charlie, 100 ether);

        vm.prank(alice);
        dao.registerMember{value: 3 ether}();

        vm.prank(bob);
        dao.registerMember{value: 3 ether}();
    }

    function testRegisterMemberSuccess() public {
        vm.prank(charlie);
        dao.registerMember{value: 3 ether}();
        assertTrue(dao.isMember(charlie));
        assertEq(dao.memberCount(), 2 + 1);
    }

    function testRegisterMemberFailsWrongEth() public {
        vm.prank(charlie);
        vm.expectRevert("Debe depositar exactamente 3 ETH para inscribirse");
        dao.registerMember{value: 1 ether}();
    }

    function testRegisterMemberFailsAlreadyRegistered() public {
        vm.prank(alice);
        vm.expectRevert("El usuario ya esta inscrito como socio de la DAO");
        dao.registerMember{value: 3 ether}();
    }

    function testCreateProposalSuccess() public {
        vm.prank(alice);
        uint256 proposalId = dao.createProposal(
            "Propuesta 1",
            recipient,
            1 ether,
            VOTING_DURATION,
            "Test Proposal"
        );

        assertEq(proposalId, 1);
        (
            uint256 id,
            string memory title,
            address rec,
            uint256 amount,
            ,
            ,
            bool executed,
            ,
            ,
            ,
            ,
            bool secondPeriod,
            bool rejected
        ) = dao.getProposal(1);

        assertEq(id, 1);
        assertEq(title, "Propuesta 1");
        assertEq(rec, recipient);
        assertEq(amount, 1 ether);
        assertEq(executed, false);
        assertEq(secondPeriod, false);
        assertEq(rejected, false);
    }

    function testCreateProposalFailsForNonMember() public {
        vm.prank(charlie);
        vm.expectRevert("Debe estar inscrito como socio de la DAO para crear una propuesta");
        dao.createProposal("Propuesta Falla", recipient, 1 ether, VOTING_DURATION, "Desc");
    }

    function testCreateProposalFailsInsufficientBalanceThreshold() public {
        address dave = address(0x444);
        vm.deal(dave, 500 ether);
        vm.prank(dave);
        dao.deposit{value: 100 ether}(); // Aumenta el balance total de la DAO a 106 ETH

        // Alice posee 3 ETH (3/106 = 2.83% < 10%), debe fallar al intentar crear la propuesta
        vm.prank(alice);
        vm.expectRevert("El socio debe poseer al menos el 10% del balance total de la DAO para crear propuestas");
        dao.createProposal("Propuesta Umbral Insuficiente", recipient, 1 ether, VOTING_DURATION, "Desc");
    }

    function testVoteFor() public {
        vm.prank(charlie);
        dao.registerMember{value: 3 ether}();

        vm.prank(alice);
        dao.createProposal("Propuesta 1", recipient, 1 ether, VOTING_DURATION, "Test Proposal");

        vm.prank(bob);
        vm.expectEmit(true, true, false, true);
        emit Voted(1, bob, DAOVoting.VoteType.FOR);
        dao.vote(1, DAOVoting.VoteType.FOR);

        (,,,,,,, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes,,,) = dao.getProposal(1);
        assertEq(forVotes, 1);
        assertEq(againstVotes, 0);
        assertEq(abstainVotes, 0);
    }

    function testVoteFailsIfAlreadyVoted() public {
        vm.prank(charlie);
        dao.registerMember{value: 3 ether}();

        vm.prank(alice);
        dao.createProposal("Propuesta Voto Unico", recipient, 1 ether, VOTING_DURATION, "Desc");

        vm.prank(bob);
        dao.vote(1, DAOVoting.VoteType.FOR);

        vm.prank(bob);
        vm.expectRevert("Ya has emitido tu voto para esta propuesta");
        dao.vote(1, DAOVoting.VoteType.AGAINST);
    }

    function testVotingFinishesWhenAllMembersVote() public {
        vm.prank(charlie);
        dao.registerMember{value: 3 ether}();

        vm.prank(alice);
        dao.createProposal("Propuesta Cierre Rapido", recipient, 1 ether, VOTING_DURATION, "Desc");

        // Alice y Bob votan A FAVOR, Charlie vota EN CONTRA
        vm.prank(alice);
        dao.vote(1, DAOVoting.VoteType.FOR);

        assertFalse(dao.isVotingFinished(1));

        vm.prank(bob);
        dao.vote(1, DAOVoting.VoteType.AGAINST);

        assertFalse(dao.isVotingFinished(1));

        vm.prank(charlie);
        dao.vote(1, DAOVoting.VoteType.FOR);

        // Al haber votado los 3 miembros, la votación finaliza
        assertTrue(dao.isVotingFinished(1));

        // Intentar votar de nuevo falla porque finalizó
        vm.prank(alice);
        vm.expectRevert("El periodo de votacion ha finalizado");
        dao.vote(1, DAOVoting.VoteType.AGAINST);
    }

    function testSecondVotingPeriodOnAbstentionMajority() public {
        vm.prank(alice);
        dao.createProposal("Propuesta Abstencion", recipient, 1 ether, VOTING_DURATION, "Desc");

        // Ambos miembros votan abstención
        vm.prank(alice);
        dao.vote(1, DAOVoting.VoteType.ABSTAIN);
        vm.prank(bob);
        dao.vote(1, DAOVoting.VoteType.ABSTAIN);

        assertTrue(dao.isVotingFinished(1));
        assertTrue(dao.isAbstentionMajority(1));
        assertFalse(dao.canExecute(1));

        // Activar el segundo periodo de votación (repechaje)
        dao.enableSecondPeriod(1, 3 days);

        (,,,,,,,,,,, bool secondPeriod,) = dao.getProposal(1);
        assertTrue(secondPeriod);
        assertFalse(dao.isVotingFinished(1));

        // En el 2º periodo Bob cambia su voto a A FAVOR
        vm.prank(bob);
        dao.vote(1, DAOVoting.VoteType.FOR);

        // Alice vota EN CONTRA
        vm.prank(alice);
        dao.vote(1, DAOVoting.VoteType.AGAINST);

        assertTrue(dao.isVotingFinished(1));
    }

    function testProposalRejectedIfAbstentionWinsSecondPeriod() public {
        vm.prank(alice);
        dao.createProposal("Propuesta Rechazada por Abstencion", recipient, 1 ether, VOTING_DURATION, "Desc");

        vm.prank(alice);
        dao.vote(1, DAOVoting.VoteType.ABSTAIN);
        vm.prank(bob);
        dao.vote(1, DAOVoting.VoteType.ABSTAIN);

        dao.enableSecondPeriod(1, 3 days);

        // Votan abstención de nuevo en 2º periodo
        vm.prank(alice);
        dao.vote(1, DAOVoting.VoteType.ABSTAIN);
        vm.prank(bob);
        dao.vote(1, DAOVoting.VoteType.ABSTAIN);

        assertTrue(dao.isVotingFinished(1));
        assertTrue(dao.isAbstentionMajority(1));

        // Al chequear rechazo, debe marcarse como rechazada
        bool rejected = dao.checkAndMarkRejected(1);
        assertTrue(rejected);

        (,,,,,,,,,,,, bool isRejected) = dao.getProposal(1);
        assertTrue(isRejected);
    }

    function testMetaTransactionCreateProposal() public {
        uint256 privateKey = 0xA11CE;
        address user = vm.addr(privateKey);
        vm.deal(user, 10 ether);

        vm.prank(user);
        dao.registerMember{value: 3 ether}();

        bytes memory data = abi.encodeWithSelector(
            dao.createProposal.selector,
            "Meta Propuesta",
            recipient,
            1 ether,
            VOTING_DURATION,
            "Meta Desc"
        );

        MinimalForwarder.ForwardRequest memory req = MinimalForwarder.ForwardRequest({
            from: user,
            to: address(dao),
            value: 0,
            gas: 2000000,
            nonce: forwarder.getNonce(user),
            accion: "Crear Propuesta",
            detalles: "Meta-Tx",
            data: data
        });

        bytes32 digest = forwarder.getTypedDataHash(req);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, digest);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Execute via forwarder (as relayer)
        address relayer = address(0x999);
        vm.prank(relayer);
        forwarder.execute(req, signature);

        assertEq(dao.proposalCount(), 1);
    }

    function testExecuteApprovedProposalUnanimous() public {
        vm.prank(alice);
        dao.createProposal("Propuesta Unanimidad", recipient, 5 ether, VOTING_DURATION, "Test Proposal");

        uint256 recipientBalanceBefore = recipient.balance;

        vm.prank(alice);
        dao.vote(1, DAOVoting.VoteType.FOR);

        vm.prank(bob);
        dao.vote(1, DAOVoting.VoteType.FOR);

        // Intento de ejecución manual por un socio no-owner falla
        vm.prank(alice);
        vm.expectRevert("Solo el Owner de la DAO esta autorizado para ejecutar propuestas manualmente");
        dao.executeProposal(1);

        // El Owner ejecuta manualmente la propuesta aprobada por unanimidad sin esperar retardo de 1 día
        vm.expectEmit(true, false, false, true);
        emit ProposalExecuted(1, recipient, 5 ether);

        vm.prank(owner);
        dao.executeProposal(1);

        assertEq(recipient.balance, recipientBalanceBefore + 5 ether);

        (,,,,,, bool executed,,,,,,) = dao.getProposal(1);
        assertTrue(executed);
    }
}
