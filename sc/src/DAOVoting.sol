// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ERC2771Context} from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/**
 * @title DAOVoting
 * @dev Contrato DAO con gestión de membresías de socios (3 ETH) y propuestas con votación
 * Soporta votaciones y creación de propuestas con o sin gas mediante EIP-2771 meta-transacciones
 */
contract DAOVoting is ERC2771Context {
    enum VoteType {
        ABSTAIN,
        FOR,
        AGAINST
    }

    struct Proposal {
        uint256 id;
        string title;
        address recipient;
        uint256 amount;
        uint256 votingDeadline;
        uint256 executionDelay;
        bool executed;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        string description;
    }

    uint256 public proposalCount;
    uint256 public minimumBalance;
    uint256 public totalDeposited; // Balance total depositado en la DAO
    uint256 public constant MEMBERSHIP_FEE = 3 ether; // Cuota fija de inscripción: 3 ETH
    uint256 public constant PROPOSAL_CREATION_THRESHOLD = 10; // 10% del balance de la DAO
    uint256 public constant EXECUTION_DELAY = 1 days;

    uint256 public memberCount;
    mapping(address => bool) public isMember; // Registro de billeteras de socios inscritos

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => VoteType)) public votes;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => uint256) public balances; // Balance de cada usuario en el DAO

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
    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        VoteType voteType
    );
    event ProposalExecuted(
        uint256 indexed proposalId,
        address recipient,
        uint256 amount
    );
    event FundsDeposited(address indexed from, uint256 amount);

    constructor(
        address trustedForwarder,
        uint256 _minimumBalance
    ) ERC2771Context(trustedForwarder) {
        minimumBalance = _minimumBalance;
    }

    function name() public pure returns (string memory) {
        return "DAO Voting Token";
    }

    function symbol() public pure returns (string memory) {
        return "DAO";
    }

    function decimals() public pure returns (uint8) {
        return 18;
    }

    /**
     * @dev Registra a un nuevo socio previo depósito de exactamente 3 ETH
     */
    function registerMember() external payable {
        address sender = _msgSender();
        require(!isMember[sender], "El usuario ya esta inscrito como socio de la DAO");
        require(msg.value == MEMBERSHIP_FEE, "Debe depositar exactamente 3 ETH para inscribirse");

        isMember[sender] = true;
        memberCount++;
        balances[sender] += msg.value;
        totalDeposited += msg.value;

        emit MemberRegistered(sender, msg.value);
        emit FundsDeposited(sender, msg.value);
    }

    /**
     * @dev Permite depositar ETH adicional a la tesorería de la DAO
     */
    function deposit() external payable {
        require(msg.value > 0, "Debe enviar ETH");
        address sender = _msgSender();
        balances[sender] += msg.value;
        totalDeposited += msg.value;
        emit FundsDeposited(sender, msg.value);
    }

    /**
     * @dev Función de recepción de ETH
     */
    receive() external payable {
        balances[msg.sender] += msg.value;
        totalDeposited += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }

    /**
     * @dev Fallback function
     */
    fallback() external payable {
        if (msg.value > 0) {
            balances[msg.sender] += msg.value;
            totalDeposited += msg.value;
            emit FundsDeposited(msg.sender, msg.value);
        }
    }

    /**
     * @dev Crea una nueva propuesta. Requiere que el creador esté inscrito como socio activo.
     */
    function createProposal(
        string calldata _title,
        address _recipient,
        uint256 _amount,
        uint256 _votingDuration,
        string calldata _description
    ) external returns (uint256) {
        address sender = _msgSender();

        require(
            isMember[sender],
            "Debe estar inscrito como socio de la DAO para crear una propuesta"
        );
        require(bytes(_title).length > 0, "El titulo de la propuesta no puede estar vacio");
        require(_recipient != address(0), "Direccion de beneficiario invalida");
        require(_amount > 0, "El monto a transferir debe ser mayor a 0");
        require(_amount <= totalDeposited, "Fondos insuficientes en la DAO para esta propuesta");
        require(_votingDuration > 0, "La duracion de la votacion debe ser mayor a 0");

        proposalCount++;
        uint256 proposalId = proposalCount;

        proposals[proposalId] = Proposal({
            id: proposalId,
            title: _title,
            recipient: _recipient,
            amount: _amount,
            votingDeadline: block.timestamp + _votingDuration,
            executionDelay: block.timestamp + _votingDuration + EXECUTION_DELAY,
            executed: false,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            description: _description
        });

        emit ProposalCreated(
            proposalId,
            sender,
            _title,
            _recipient,
            _amount,
            proposals[proposalId].votingDeadline,
            _description
        );

        return proposalId;
    }

    /**
     * @dev Emite un voto sobre una propuesta. Requiere ser socio inscrito de la DAO.
     */
    function vote(uint256 _proposalId, VoteType _voteType) external {
        address sender = _msgSender();

        require(
            isMember[sender],
            "Debe estar inscrito como socio de la DAO para poder votar"
        );
        require(
            _proposalId > 0 && _proposalId <= proposalCount,
            "ID de propuesta invalido"
        );

        Proposal storage proposal = proposals[_proposalId];
        require(
            block.timestamp < proposal.votingDeadline,
            "El periodo de votacion ha finalizado"
        );
        require(!proposal.executed, "La propuesta ya ha sido ejecutada");
        require(
            !hasVoted[_proposalId][sender],
            "Ya has emitido tu voto para esta propuesta"
        );

        // Registrar voto definitivo (no modificable)
        votes[_proposalId][sender] = _voteType;
        hasVoted[_proposalId][sender] = true;

        if (_voteType == VoteType.FOR) {
            proposal.forVotes++;
        } else if (_voteType == VoteType.AGAINST) {
            proposal.againstVotes++;
        } else if (_voteType == VoteType.ABSTAIN) {
            proposal.abstainVotes++;
        }

        emit Voted(_proposalId, sender, _voteType);
    }

    /**
     * @dev Ejecuta una propuesta aprobada cuando expira el plazo y el retardo de seguridad.
     */
    function executeProposal(uint256 _proposalId) external {
        require(
            _proposalId > 0 && _proposalId <= proposalCount,
            "ID de propuesta invalido"
        );

        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "La propuesta ya fue ejecutada");
        require(
            block.timestamp >= proposal.votingDeadline,
            "El periodo de votacion no ha finalizado"
        );
        require(
            block.timestamp >= proposal.executionDelay,
            "El tiempo de retardo de ejecucion no ha transcurrido"
        );
        require(
            proposal.forVotes > proposal.againstVotes,
            "La propuesta no fue aprobada por mayoria de votos a favor"
        );
        require(totalDeposited >= proposal.amount, "Fondos insuficientes en la DAO");

        proposal.executed = true;
        totalDeposited -= proposal.amount;

        (bool success, ) = proposal.recipient.call{value: proposal.amount}("");
        require(success, "Fallo la transferencia de fondos al beneficiario");

        emit ProposalExecuted(_proposalId, proposal.recipient, proposal.amount);
    }

    /**
     * @dev Obtiene los detalles de una propuesta
     */
    function getProposal(
        uint256 _proposalId
    )
        external
        view
        returns (
            uint256 id,
            string memory title,
            address recipient,
            uint256 amount,
            uint256 votingDeadline,
            uint256 executionDelay,
            bool executed,
            uint256 forVotes,
            uint256 againstVotes,
            uint256 abstainVotes,
            string memory description
        )
    {
        require(
            _proposalId > 0 && _proposalId <= proposalCount,
            "ID de propuesta invalido"
        );
        Proposal memory proposal = proposals[_proposalId];
        return (
            proposal.id,
            proposal.title,
            proposal.recipient,
            proposal.amount,
            proposal.votingDeadline,
            proposal.executionDelay,
            proposal.executed,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            proposal.description
        );
    }

    /**
     * @dev Obtiene el voto realizado por un usuario en una propuesta
     */
    function getUserVote(
        uint256 _proposalId,
        address _user
    ) external view returns (VoteType) {
        return votes[_proposalId][_user];
    }

    /**
     * @dev Verifica si la propuesta puede ejecutarse
     */
    function canExecute(uint256 _proposalId) external view returns (bool) {
        if (_proposalId == 0 || _proposalId > proposalCount) return false;

        Proposal memory proposal = proposals[_proposalId];
        return
            !proposal.executed &&
            block.timestamp >= proposal.votingDeadline &&
            block.timestamp >= proposal.executionDelay &&
            proposal.forVotes > proposal.againstVotes &&
            totalDeposited >= proposal.amount;
    }

    /**
     * @dev Consulta el estado de membresía de un usuario
     */
    function getMemberStatus(address _user) external view returns (bool) {
        return isMember[_user];
    }

    function getBalance() external view returns (uint256) {
        return totalDeposited;
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getUserBalance(address _user) external view returns (uint256) {
        return balances[_user];
    }

    function getTotalDeposited() external view returns (uint256) {
        return totalDeposited;
    }

    function _msgSender()
        internal
        view
        virtual
        override(ERC2771Context)
        returns (address)
    {
        return ERC2771Context._msgSender();
    }

    function _msgData()
        internal
        view
        virtual
        override(ERC2771Context)
        returns (bytes calldata)
    {
        return ERC2771Context._msgData();
    }

    function _contextSuffixLength()
        internal
        view
        virtual
        override(ERC2771Context)
        returns (uint256)
    {
        return ERC2771Context._contextSuffixLength();
    }
}
