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

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed creator,
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

        // Users deposit to DAO to get balance
        vm.prank(alice);
        dao.deposit{value: 50 ether}();

        vm.prank(bob);
        dao.deposit{value: 30 ether}();

        vm.prank(charlie);
        dao.deposit{value: 20 ether}();
    }

    function testDeposit() public {
        address newUser = address(0x999);
        vm.deal(newUser, 10 ether);

        vm.prank(newUser);
        vm.expectEmit(true, false, false, true);
        emit FundsDeposited(newUser, 5 ether);
        dao.deposit{value: 5 ether}();

        assertEq(address(dao).balance, 105 ether);
        assertEq(dao.getUserBalance(newUser), 5 ether);
    }

    function testReceiveEther() public {
        address newUser = address(0x888);
        vm.deal(newUser, 10 ether);

        uint256 initialBalance = address(dao).balance;

        vm.prank(newUser);
        vm.expectEmit(true, false, false, true);
        emit FundsDeposited(newUser, 3 ether);
        (bool success,) = address(dao).call{value: 3 ether}("");
        assertTrue(success);

        assertEq(address(dao).balance, initialBalance + 3 ether);
        assertEq(dao.getUserBalance(newUser), 3 ether);
    }

    function testCreateProposal() public {
        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit ProposalCreated(1, alice, recipient, 10 ether, block.timestamp + VOTING_DURATION, "Test Proposal");

        uint256 proposalId = dao.createProposal(recipient, 10 ether, VOTING_DURATION, "Test Proposal");

        assertEq(proposalId, 1);
        assertEq(dao.proposalCount(), 1);

        (
            uint256 id,
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

    function testCreateProposalFailsWithInsufficientBalance() public {
        address poorUser = address(0x999);
        vm.deal(poorUser, 1 ether);

        // User deposits only 1 ETH (less than 10% of DAO's 100 ETH)
        vm.prank(poorUser);
        dao.deposit{value: 1 ether}();

        vm.prank(poorUser);
        vm.expectRevert("Insufficient balance to create proposal");
        dao.createProposal(recipient, 10 ether, VOTING_DURATION, "Test Proposal");
    }

    function testVoteFor() public {
        vm.prank(alice);
        dao.createProposal(recipient, 10 ether, VOTING_DURATION, "Test Proposal");

        vm.prank(bob);
        vm.expectEmit(true, true, false, true);
        emit Voted(1, bob, DAOVoting.VoteType.FOR);
        dao.vote(1, DAOVoting.VoteType.FOR);

        (,,,,,, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes,) = dao.getProposal(1);
        assertEq(forVotes, 1);
        assertEq(againstVotes, 0);
        assertEq(abstainVotes, 0);
    }

    function testVoteAgainst() public {
        vm.prank(alice);
        dao.createProposal(recipient, 10 ether, VOTING_DURATION, "Test Proposal");

        vm.prank(bob);
        dao.vote(1, DAOVoting.VoteType.AGAINST);

        (,,,,,, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes,) = dao.getProposal(1);
        assertEq(forVotes, 0);
        assertEq(againstVotes, 1);
        assertEq(abstainVotes, 0);
    }

    function testChangeVote() public {
        vm.prank(alice);
        dao.createProposal(recipient, 10 ether, VOTING_DURATION, "Test Proposal");

        vm.startPrank(bob);
        dao.vote(1, DAOVoting.VoteType.FOR);

        (,,,,,, uint256 forVotes1, uint256 againstVotes1,,) = dao.getProposal(1);
        assertEq(forVotes1, 1);
        assertEq(againstVotes1, 0);

        // Change vote
        dao.vote(1, DAOVoting.VoteType.AGAINST);
        vm.stopPrank();

        (,,,,,, uint256 forVotes2, uint256 againstVotes2,,) = dao.getProposal(1);
        assertEq(forVotes2, 0);
        assertEq(againstVotes2, 1);
    }

    function testVoteFailsWithInsufficientBalance() public {
        vm.prank(alice);
        dao.createProposal(recipient, 10 ether, VOTING_DURATION, "Test Proposal");

        address poorUser = address(0x999);
        vm.deal(poorUser, 0.05 ether);

        // User deposits only 0.05 ETH (less than MINIMUM_BALANCE of 0.1 ETH)
        vm.prank(poorUser);
        dao.deposit{value: 0.05 ether}();

        vm.prank(poorUser);
        vm.expectRevert("Insufficient balance to vote");
        dao.vote(1, DAOVoting.VoteType.FOR);
    }

    function testVoteFailsAfterDeadline() public {
        vm.prank(alice);
        dao.createProposal(recipient, 10 ether, VOTING_DURATION, "Test Proposal");

        vm.warp(block.timestamp + VOTING_DURATION + 1);

        vm.prank(bob);
        vm.expectRevert("Voting period ended");
        dao.vote(1, DAOVoting.VoteType.FOR);
    }

    function testExecuteApprovedProposal() public {
        vm.prank(alice);
        dao.createProposal(recipient, 10 ether, VOTING_DURATION, "Test Proposal");

        // Vote in favor
        vm.prank(alice);
        dao.vote(1, DAOVoting.VoteType.FOR);
        vm.prank(bob);
        dao.vote(1, DAOVoting.VoteType.FOR);

        // Fast forward past voting deadline and execution delay
        vm.warp(block.timestamp + VOTING_DURATION + 1 days + 1);

        uint256 recipientBalanceBefore = recipient.balance;

        vm.expectEmit(true, false, false, true);
        emit ProposalExecuted(1, recipient, 10 ether);
        dao.executeProposal(1);

        assertEq(recipient.balance, recipientBalanceBefore + 10 ether);

        (,,,,, bool executed,,,,) = dao.getProposal(1);
        assertTrue(executed);
    }

    function testExecuteFailsWhenNotApproved() public {
        vm.prank(alice);
        dao.createProposal(recipient, 10 ether, VOTING_DURATION, "Test Proposal");

        // Vote against
        vm.prank(alice);
        dao.vote(1, DAOVoting.VoteType.AGAINST);
        vm.prank(bob);
        dao.vote(1, DAOVoting.VoteType.AGAINST);

        vm.warp(block.timestamp + VOTING_DURATION + 1 days + 1);

        vm.expectRevert("Proposal not approved");
        dao.executeProposal(1);
    }

    function testExecuteFailsBeforeDeadline() public {
        vm.prank(alice);
        dao.createProposal(recipient, 10 ether, VOTING_DURATION, "Test Proposal");

        vm.prank(alice);
        dao.vote(1, DAOVoting.VoteType.FOR);

        vm.expectRevert("Voting period not ended");
        dao.executeProposal(1);
    }

    function testExecuteFailsBeforeExecutionDelay() public {
        vm.prank(alice);
        dao.createProposal(recipient, 10 ether, VOTING_DURATION, "Test Proposal");

        vm.prank(alice);
        dao.vote(1, DAOVoting.VoteType.FOR);

        vm.warp(block.timestamp + VOTING_DURATION + 1);

        vm.expectRevert("Execution delay not passed");
        dao.executeProposal(1);
    }

    function testCanExecute() public {
        vm.prank(alice);
        dao.createProposal(recipient, 10 ether, VOTING_DURATION, "Test Proposal");

        assertFalse(dao.canExecute(1));

        vm.prank(alice);
        dao.vote(1, DAOVoting.VoteType.FOR);
        vm.prank(bob);
        dao.vote(1, DAOVoting.VoteType.FOR);

        assertFalse(dao.canExecute(1));

        vm.warp(block.timestamp + VOTING_DURATION + 1 days + 1);

        assertTrue(dao.canExecute(1));
    }

    function testGetBalance() public view {
        assertEq(dao.getBalance(), 100 ether);
    }
}
