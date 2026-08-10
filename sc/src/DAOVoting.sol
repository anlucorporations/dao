// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ERC2771Context} from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/**
 * @title DAOVoting
 * @dev Contrato DAO con gestión de membresías de socios (3 ETH), propuestas con votación de mayoría simple,
 * cierre anticipado cuando todos los miembros votan, y segundo periodo de votación (repechaje) en caso de mayoría de abstención.
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
        bool secondPeriod;
        bool rejected;
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
    mapping(uint256 => mapping(address => bool)) public hasVotedSecondPeriod;
    mapping(uint256 => uint256) public secondPeriodVotesCount;
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
    event SecondPeriodStarted(
        uint256 indexed proposalId,
        uint256 newDeadline
    );
    event ProposalRejected(
        uint256 indexed proposalId,
        string reason
    );
    event ProposalExecuted(
        uint256 indexed proposalId,
        address recipient,
        uint256 amount
    );
    event FundsDeposited(address indexed from, uint256 amount);

    address public owner;

    constructor(
        address trustedForwarder,
        uint256 _minimumBalance
    ) ERC2771Context(trustedForwarder) {
        owner = msg.sender;
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
            description: _description,
            secondPeriod: false,
            rejected: false
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
     * @dev Consulta si la votación de una propuesta ya finalizó (por expirar el tiempo O por haber votado el 100% de miembros)
     */
    function isVotingFinished(uint256 _proposalId) public view returns (bool) {
        Proposal memory p = proposals[_proposalId];
        if (block.timestamp >= p.votingDeadline) return true;
        if (memberCount == 0) return false;

        if (!p.secondPeriod) {
            uint256 totalVotes = p.forVotes + p.againstVotes + p.abstainVotes;
            return totalVotes >= memberCount;
        } else {
            return secondPeriodVotesCount[_proposalId] >= memberCount;
        }
    }

    /**
     * @dev Consulta si la abstención es la mayoría de votos emitidos
     */
    function isAbstentionMajority(uint256 _proposalId) public view returns (bool) {
        Proposal memory p = proposals[_proposalId];
        return p.abstainVotes > p.forVotes && p.abstainVotes > p.againstVotes;
    }

    /**
     * @dev Activa un segundo periodo de votación si la abstención fue la mayoría al finalizar el primer periodo
     */
    function enableSecondPeriod(uint256 _proposalId, uint256 _extraDuration) external {
        require(_proposalId > 0 && _proposalId <= proposalCount, "ID de propuesta invalido");
        Proposal storage p = proposals[_proposalId];

        require(!p.executed, "La propuesta ya fue ejecutada");
        require(!p.rejected, "La propuesta ya fue rechazada");
        require(!p.secondPeriod, "El segundo periodo ya fue activado previamente");
        require(isVotingFinished(_proposalId), "El primer periodo de votacion aun no ha finalizado");
        require(isAbstentionMajority(_proposalId), "La abstencion no fue la mayoria en el primer periodo");
        require(_extraDuration > 0, "Duracion invalida");

        p.secondPeriod = true;
        p.votingDeadline = block.timestamp + _extraDuration;
        p.executionDelay = p.votingDeadline + EXECUTION_DELAY;
        secondPeriodVotesCount[_proposalId] = 0;

        emit SecondPeriodStarted(_proposalId, p.votingDeadline);
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
        require(!proposal.executed, "La propuesta ya ha sido ejecutada");
        require(!proposal.rejected, "La propuesta ha sido rechazada definitivamente");
        require(
            !isVotingFinished(_proposalId),
            "El periodo de votacion ha finalizado"
        );

        if (!proposal.secondPeriod) {
            // Periodo 1: Voto único inmutable
            require(
                !hasVoted[_proposalId][sender],
                "Ya has emitido tu voto para esta propuesta"
            );
            hasVoted[_proposalId][sender] = true;
            votes[_proposalId][sender] = _voteType;

            if (_voteType == VoteType.FOR) {
                proposal.forVotes++;
            } else if (_voteType == VoteType.AGAINST) {
                proposal.againstVotes++;
            } else if (_voteType == VoteType.ABSTAIN) {
                proposal.abstainVotes++;
            }
        } else {
            // Periodo 2: Permite actualizar o emitir voto para resolver la abstención
            require(
                !hasVotedSecondPeriod[_proposalId][sender],
                "Ya has emitido tu voto en el segundo periodo"
            );

            if (hasVoted[_proposalId][sender]) {
                // Descuenta el voto emitido en el primer periodo
                VoteType oldVote = votes[_proposalId][sender];
                if (oldVote == VoteType.FOR) proposal.forVotes--;
                else if (oldVote == VoteType.AGAINST) proposal.againstVotes--;
                else if (oldVote == VoteType.ABSTAIN) proposal.abstainVotes--;
            } else {
                hasVoted[_proposalId][sender] = true;
            }

            hasVotedSecondPeriod[_proposalId][sender] = true;
            secondPeriodVotesCount[_proposalId]++;
            votes[_proposalId][sender] = _voteType;

            if (_voteType == VoteType.FOR) {
                proposal.forVotes++;
            } else if (_voteType == VoteType.AGAINST) {
                proposal.againstVotes++;
            } else if (_voteType == VoteType.ABSTAIN) {
                proposal.abstainVotes++;
            }
        }

        emit Voted(_proposalId, sender, _voteType);
    }

    /**
     * @dev Revisa y marca explícitamente si una propuesta fue rechazada definitivamente
     */
    function checkAndMarkRejected(uint256 _proposalId) public returns (bool) {
        require(_proposalId > 0 && _proposalId <= proposalCount, "ID de propuesta invalido");
        Proposal storage p = proposals[_proposalId];
        if (p.executed || p.rejected) return p.rejected;

        if (isVotingFinished(_proposalId)) {
            if (p.secondPeriod && isAbstentionMajority(_proposalId)) {
                p.rejected = true;
                emit ProposalRejected(_proposalId, "Rechazada: mayoria de abstencion en el segundo periodo");
                return true;
            } else if (p.againstVotes >= p.forVotes && !isAbstentionMajority(_proposalId)) {
                p.rejected = true;
                emit ProposalRejected(_proposalId, "Rechazada: los votos en contra superan o igualan a los votos a favor");
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Ejecuta manualmente una propuesta aprobada. Restringido exclusivamente al Owner de la DAO.
     * Si fue aprobada por unanimidad del 100%, puede ejecutarse inmediatamente sin esperar retardo.
     */
    function executeProposal(uint256 _proposalId) external {
        address sender = _msgSender();
        require(
            sender == owner,
            "Solo el Owner de la DAO esta autorizado para ejecutar propuestas manualmente"
        );

        require(
            _proposalId > 0 && _proposalId <= proposalCount,
            "ID de propuesta invalido"
        );

        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "La propuesta ya fue ejecutada");
        require(!proposal.rejected, "La propuesta fue rechazada previamente");
        require(
            isVotingFinished(_proposalId),
            "El periodo de votacion no ha finalizado"
        );

        // Si fue aprobada por unanimidad (100% de socios A FAVOR), el Owner puede ejecutarla sin esperar retardo
        bool isUnanimous = memberCount > 0 && proposal.forVotes == memberCount;
        if (!isUnanimous) {
            require(
                block.timestamp >= proposal.executionDelay,
                "El tiempo de retardo de ejecucion no ha transcurrido"
            );
        }

        // Si la abstención es la mayoría
        if (isAbstentionMajority(_proposalId)) {
            if (proposal.secondPeriod) {
                proposal.rejected = true;
                emit ProposalRejected(_proposalId, "Rechazada por mayoria de abstencion en segundo periodo");
                revert("La propuesta fue rechazada definitivamente por mayoria de abstencion en segundo periodo");
            } else {
                revert("La propuesta requiere activar el segundo periodo de votacion por mayoria de abstencion");
            }
        }

        require(
            proposal.forVotes > proposal.againstVotes,
            "La propuesta no fue aprobada por mayoria simple de votos a favor"
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
            string memory description,
            bool secondPeriod,
            bool rejected
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
            proposal.description,
            proposal.secondPeriod,
            proposal.rejected
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
     * @dev Verifica si la propuesta puede ejecutarse por mayoría simple
     */
    function canExecute(uint256 _proposalId) external view returns (bool) {
        if (_proposalId == 0 || _proposalId > proposalCount) return false;

        Proposal memory proposal = proposals[_proposalId];
        if (proposal.executed || proposal.rejected) return false;
        if (!isVotingFinished(_proposalId)) return false;
        if (block.timestamp < proposal.executionDelay) return false;
        if (totalDeposited < proposal.amount) return false;

        if (isAbstentionMajority(_proposalId)) return false;

        return proposal.forVotes > proposal.againstVotes;
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
