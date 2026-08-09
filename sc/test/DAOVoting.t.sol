// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {DAOVoting} from "../src/DAOVoting.sol";
import {MinimalForwarder} from "../src/MinimalForwarder.sol";

contract DAOVotingTest is Test {
    DAOVoting public dao;
    MinimalForwarder public forwarder;

    address public alice = address(0x1);
    address public bob = address(0x2);
    address public charlie = address(0x3);
    address public recipient = address(0x4);

    uint256 public constant MINIMUM_BALANCE = 0.1 ether;
    uint256 public constant VOTING_DURATION = 7 days;

    event MemberRegistered(address indexed member, uint256 depositAmount);
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed creator,
        string title,
        address recipient,
        uint256 amount,
        uint256 votingDeadline,
        string description
    );
    event Voted(uint256 indexed proposalId, address indexed voter, DAOVoting.VoteType voteType);
    event ProposalExecuted(uint256 indexed proposalId, address recipient, uint256 amount);
    event FundsDeposited(address indexed from, uint256 amount);

    function setUp() public {
        forwarder = new MinimalForwarder();
        dao = new DAOVoting(address(forwarder), MINIMUM_BALANCE);

        // Fund test accounts
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(charlie, 100 ether);

        // Register users as members (3 ETH deposit each) + extra deposits
        vm.prank(alice);
        dao.registerMember{value: 3 ether}();
        vm.prank(alice);
        dao.deposit{value: 47 ether}();

        vm.prank(bob);
        dao.registerMember{value: 3 ether}();
        vm.prank(bob);
        dao.deposit{value: 27 ether}();

        vm.prank(charlie);
        dao.registerMember{value: 3 ether}();
        vm.prank(charlie);
        dao.deposit{value: 17 ether}();
    }

    function testRegisterMemberSuccess() public {
        address newMember = address(0x999);
        vm.deal(newMember, 10 ether);

        vm.prank(newMember);
        vm.expectEmit(true, false, false, true);
        emit MemberRegistered(newMember, 3 ether);
        dao.registerMember{value: 3 ether}();

        assertTrue(dao.isMember(newMember));
        assertTrue(dao.getMemberStatus(newMember));
        assertEq(dao.memberCount(), 4);
    }

    function testRegisterMemberFailsWrongEth() public {
        address newMember = address(0x999);
        vm.deal(newMember, 10 ether);

        vm.prank(newMember);
        vm.expectRevert("Debe depositar exactamente 3 ETH para inscribirse");
        dao.registerMember{value: 2 ether}();
    }

    function testRegisterMemberFailsAlreadyRegistered() public {
        vm.prank(alice);
        vm.expectRevert("El usuario ya esta inscrito como socio de la DAO");
        dao.registerMember{value: 3 ether}();
    }

    function testCreateProposalSuccess() public {
        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit ProposalCreated(1, alice, "Propuesta 1", recipient, 10 ether, block.timestamp + VOTING_DURATION, "Test Proposal");

        uint256 proposalId = dao.createProposal("Propuesta 1", recipient, 10 ether, VOTING_DURATION, "Test Proposal");

        assertEq(proposalId, 1);
        assertEq(dao.proposalCount(), 1);

        (
            uint256 id,
            string memory title,
            address recip,
            uint256 amount,
            uint256 votingDeadline,
            uint256 executionDelay,
            bool executed,
            uint256 forVotes,
            uint256 againstVotes,
            uint256 abstainVotes,
            string memory description
        ) = dao.getProposal(1);

        assertEq(id, 1);
        assertEq(title, "Propuesta 1");
        assertEq(recip, recipient);
        assertEq(amount, 10 ether);
        assertEq(votingDeadline, block.timestamp + VOTING_DURATION);
        assertEq(executionDelay, block.timestamp + VOTING_DURATION + 1 days);
        assertFalse(executed);
        assertEq(forVotes, 0);
        assertEq(againstVotes, 0);
        assertEq(abstainVotes, 0);
        assertEq(description, "Test Proposal");
    }

    function testCreateProposalFailsForNonMember() public {
        address nonMember = address(0x777);
        vm.deal(nonMember, 50 ether);

        vm.prank(nonMember);
        vm.expectRevert("Debe estar inscrito como socio de la DAO para crear una propuesta");
        dao.createProposal("Propuesta 1", recipient, 10 ether, VOTING_DURATION, "Test Proposal");
    }

    function testVoteFailsForNonMember() public {
        vm.prank(alice);
        dao.createProposal("Propuesta 1", recipient, 10 ether, VOTING_DURATION, "Test Proposal");

        address nonMember = address(0x777);
        vm.deal(nonMember, 50 ether);

        vm.prank(nonMember);
        vm.expectRevert("Debe estar inscrito como socio de la DAO para poder votar");
        dao.vote(1, DAOVoting.VoteType.FOR);
    }

    function testVoteFor() public {
        vm.prank(alice);
        dao.createProposal("Propuesta 1", recipient, 10 ether, VOTING_DURATION, "Test Proposal");

        vm.prank(bob);
        vm.expectEmit(true, true, false, true);
        emit Voted(1, bob, DAOVoting.VoteType.FOR);
        dao.vote(1, DAOVoting.VoteType.FOR);

        (,,,,,,, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes,) = dao.getProposal(1);
        assertEq(forVotes, 1);
        assertEq(againstVotes, 0);
        assertEq(abstainVotes, 0);
    }

    function testVoteFailsIfAlreadyVoted() public {
        vm.prank(alice);
        dao.createProposal("Propuesta Voto Unico", recipient, 1 ether, VOTING_DURATION, "Desc");

        vm.prank(bob);
        dao.vote(1, DAOVoting.VoteType.FOR);

        vm.prank(bob);
        vm.expectRevert("Ya has emitido tu voto para esta propuesta");
        dao.vote(1, DAOVoting.VoteType.AGAINST);
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
            "Desc Meta"
        );

        MinimalForwarder.ForwardRequest memory req = MinimalForwarder.ForwardRequest({
            from: user,
            to: address(dao),
            value: 0,
            gas: 2000000,
            nonce: forwarder.getNonce(user),
            accion: "Crear Propuesta DAO",
            detalles: "Titulo: Meta Propuesta",
            data: data
        });

        bytes32 hash = forwarder.getTypedDataHash(req);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, hash);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Execute via forwarder (as relayer)
        address relayer = address(0x999);
        vm.prank(relayer);
        forwarder.execute(req, signature);

        assertEq(dao.proposalCount(), 1);
    }

    function testExecuteApprovedProposal() public {
        vm.prank(alice);
        dao.createProposal("Propuesta 1", recipient, 10 ether, VOTING_DURATION, "Test Proposal");

        vm.prank(alice);
        dao.vote(1, DAOVoting.VoteType.FOR);
        vm.prank(bob);
        dao.vote(1, DAOVoting.VoteType.FOR);

        vm.warp(block.timestamp + VOTING_DURATION + 1 days + 1);

        uint256 recipientBalanceBefore = recipient.balance;

        vm.expectEmit(true, false, false, true);
        emit ProposalExecuted(1, recipient, 10 ether);
        dao.executeProposal(1);

        assertEq(recipient.balance, recipientBalanceBefore + 10 ether);

        (,,,,,, bool executed,,,,) = dao.getProposal(1);
        assertTrue(executed);
    }
}
