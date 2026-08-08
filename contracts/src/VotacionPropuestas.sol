// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "./CooperativaCappones.sol";
import "./ActaHashRegistry.sol";

/**
 * @title VotacionPropuestas
 * @notice Crea propuestas, gestiona avales, recibe votos gasless, ejecuta transferencias
 * @dev Usa ERC2771Context para meta-transacciones (votos sin gas)
 */
contract VotacionPropuestas is ERC2771Context {
    // ============ ENUMS ============
    enum TipoPropuesta {
        INVERSION,
        ADMINISTRATIVA
    }

    enum EstadoPropuesta {
        BORRADOR,
        POR_DISCUTIR,
        APROBADA,
        RECHAZADA,
        APELADA,
        EJECUTADA
    }

    enum TipoVoto {
        ACEPTADA,
        RECHAZADA,
        ABSTENCION
    }

    // ============ STRUCTS ============
    struct Propuesta {
        uint256 id;
        string nombre;
        string descripcion;
        uint256 monto;
        address walletReceptora;
        TipoPropuesta tipo;
        EstadoPropuesta estado;
        bool disponible;
        uint256 fechaCreacion;
        uint256 fechaAprobacion;
        uint256 fechaApelacion;
        uint256 deadline;
        uint256 intentos;
        uint256 votosAceptada;
        uint256 votosRechazada;
        uint256 votosAbstencion;
        bool ejecutada;
        address creador;
    }

    struct Aval {
        address directivo;
        bool firmado;
        uint256 fechaFirma;
    }

    // ============ STATE VARIABLES (OPTIMIZED WITH IMMUTABLE) ============
    CooperativaCappones public immutable cooperativa;
    ActaHashRegistry public immutable actaRegistry;

    uint256 public constant DURACION_INVERSION = 1 days;   // 24h
    uint256 public constant DURACION_ADMIN = 12 hours;       // 12h
    uint256 public constant MAX_INTENTOS = 3;
    uint256 public constant AVALES_REQUERIDOS = 3;

    Propuesta[] public propuestas;
    mapping(uint256 => mapping(address => bool)) public haVotado;
    mapping(uint256 => mapping(address => Aval)) public avales;
    mapping(uint256 => uint256) public conteoAvales;

    // BUG-021 FIX: mantener lista de directivos activos directamente en este contrato
    // evita el loop O(n) sobre todos los socios en crearPropuesta
    address[] internal _directivosActivos;
    mapping(address => bool) internal _esDirectivoActivo;

    // ============ EVENTS ============
    event PropuestaCreada(uint256 indexed id, address creador, string nombre);
    event AvalFirmado(uint256 indexed id, address directivo);
    event PropuestaPublicada(uint256 indexed id, uint256 deadline);
    event VotoEmitido(uint256 indexed id, address votante, TipoVoto voto);
    event PropuestaCerrada(uint256 indexed id, EstadoPropuesta estado);
    event PropuestaApelada(uint256 indexed id, uint256 fecha);
    event PropuestaEjecutada(uint256 indexed id, uint256 monto, address receptora);
    event DisponibilidadCambiada(uint256 indexed id, bool disponible);

    // ============ MODIFIERS ============
    modifier onlyCreador(uint256 _id) {
        require(propuestas[_id].creador == _msgSender(), "No es el creador");
        _;
    }

    modifier onlyDirectivo() {
        require(cooperativa.getDirectivo(_msgSender()).activo, "No es directivo");
        _;
    }

    modifier propuestaExiste(uint256 _id) {
        require(_id < propuestas.length, "Propuesta no existe");
        _;
    }

    // ============ CONSTRUCTOR ============
    constructor(
        address _cooperativa,
        address _trustedForwarder,
        address _actaRegistry
    ) ERC2771Context(_trustedForwarder) {
        cooperativa = CooperativaCappones(payable(_cooperativa));
        actaRegistry = ActaHashRegistry(_actaRegistry);
    }

    // ============ ADMINISTRACIÓN DE DIRECTIVOS (BUG-021) ============
    // Estas funciones deben llamarse cada vez que se asigna o remueve un directivo
    // en CooperativaCappones para mantener el array interno sincronizado.
    function registrarDirectivoActivo(address _directivo) external {
        require(msg.sender == cooperativa.owner(), "Solo el owner de la cooperativa");
        require(!_esDirectivoActivo[_directivo], "Ya esta registrado");
        _directivosActivos.push(_directivo);
        _esDirectivoActivo[_directivo] = true;
    }

    function eliminarDirectivoActivo(address _directivo) external {
        require(msg.sender == cooperativa.owner(), "Solo el owner de la cooperativa");
        require(_esDirectivoActivo[_directivo], "No esta registrado");
        _esDirectivoActivo[_directivo] = false;
        for (uint256 i = 0; i < _directivosActivos.length; i++) {
            if (_directivosActivos[i] == _directivo) {
                _directivosActivos[i] = _directivosActivos[_directivosActivos.length - 1];
                _directivosActivos.pop();
                break;
            }
        }
    }

    function getDirectivosActivos() external view returns (address[] memory) {
        return _directivosActivos;
    }

    // ============ CREACIÓN DE PROPUESTAS ============
    function crearPropuesta(
        string memory _nombre,
        string memory _descripcion,
        uint256 _monto,
        address _walletReceptora,
        TipoPropuesta _tipo
    ) external onlyDirectivo returns (uint256) {
        require(bytes(_nombre).length > 0, "Nombre requerido");
        require(_monto > 0, "Monto mayor a 0");
        require(_walletReceptora != address(0), "Wallet invalida");

        // Solo Presidente, Contralor o Contador pueden crear
        CooperativaCappones.Cargo cargo = cooperativa.getDirectivo(_msgSender()).cargo;
        require(
            cargo == CooperativaCappones.Cargo.PRESIDENTE ||
            cargo == CooperativaCappones.Cargo.CONTRALOR ||
            cargo == CooperativaCappones.Cargo.CONTADOR,
            "Sin permiso para crear"
        );

        uint256 id = propuestas.length;
        uint256 duracion = _tipo == TipoPropuesta.INVERSION ? DURACION_INVERSION : DURACION_ADMIN;

        propuestas.push(Propuesta({
            id: id,
            nombre: _nombre,
            descripcion: _descripcion,
            monto: _monto,
            walletReceptora: _walletReceptora,
            tipo: _tipo,
            estado: EstadoPropuesta.BORRADOR,
            disponible: true,
            fechaCreacion: block.timestamp,
            fechaAprobacion: 0,
            fechaApelacion: 0,
            deadline: 0,
            intentos: 0,
            votosAceptada: 0,
            votosRechazada: 0,
            votosAbstencion: 0,
            ejecutada: false,
            creador: _msgSender()
        }));

        // BUG-021 FIX: inicializar avales usando el array interno en lugar de iterar todos los socios
        for (uint i = 0; i < _directivosActivos.length; i++) {
            address dir = _directivosActivos[i];
            if (_esDirectivoActivo[dir]) {
                avales[id][dir] = Aval(dir, false, 0);
            }
        }


        emit PropuestaCreada(id, _msgSender(), _nombre);
        return id;
    }

    // ============ AVALES ============
    function firmarAval(uint256 _id) external onlyDirectivo propuestaExiste(_id) {
        Propuesta storage p = propuestas[_id];
        require(p.estado == EstadoPropuesta.BORRADOR, "No es borrador");
        require(!avales[_id][_msgSender()].firmado, "Ya firmo");

        avales[_id][_msgSender()] = Aval(_msgSender(), true, block.timestamp);
        conteoAvales[_id]++;

        emit AvalFirmado(_id, _msgSender());

        // Si hay 3 avales, publicar automáticamente
        if (conteoAvales[_id] >= AVALES_REQUERIDOS) {
            _publicarPropuesta(_id);
        }
    }

    function _publicarPropuesta(uint256 _id) internal {
        Propuesta storage p = propuestas[_id];
        uint256 duracion = p.tipo == TipoPropuesta.INVERSION ? DURACION_INVERSION : DURACION_ADMIN;

        p.estado = EstadoPropuesta.POR_DISCUTIR;
        p.deadline = block.timestamp + duracion;
        p.intentos++;

        emit PropuestaPublicada(_id, p.deadline);
    }

    // ============ VOTACIÓN ============
    function votar(uint256 _id, TipoVoto _voto) external propuestaExiste(_id) {
        require(cooperativa.esSocioActivo(_msgSender()), "No es socio activo");

        Propuesta storage p = propuestas[_id];
        require(p.estado == EstadoPropuesta.POR_DISCUTIR, "No esta en discusion");
        require(p.disponible, "No disponible");
        require(block.timestamp < p.deadline, "Votacion cerrada");
        require(!haVotado[_id][_msgSender()], "Ya voto");

        haVotado[_id][_msgSender()] = true;

        if (_voto == TipoVoto.ACEPTADA) {
            p.votosAceptada++;
        } else if (_voto == TipoVoto.RECHAZADA) {
            p.votosRechazada++;
        } else {
            p.votosAbstencion++;
        }

        emit VotoEmitido(_id, _msgSender(), _voto);
    }

    // ============ CIERRE DE VOTACIÓN ============
    function cerrarPropuesta(uint256 _id) external propuestaExiste(_id) {
        Propuesta storage p = propuestas[_id];
        require(p.estado == EstadoPropuesta.POR_DISCUTIR, "No esta en discusion");
        require(block.timestamp >= p.deadline, "Aun no cierra");

        uint256 totalVotos = p.votosAceptada + p.votosRechazada + p.votosAbstencion;

        if (totalVotos == 0 || p.votosAbstencion > p.votosAceptada && p.votosAbstencion > p.votosRechazada) {
            // Sin votos o abstencion mayoritaria
            if (p.intentos >= MAX_INTENTOS) {
                p.estado = EstadoPropuesta.RECHAZADA;
                emit PropuestaCerrada(_id, EstadoPropuesta.RECHAZADA);
            } else {
                // Reintentar
                _publicarPropuesta(_id);
            }
        } else if (p.votosAceptada > p.votosRechazada) {
            // Mayoría simple a favor
            p.estado = EstadoPropuesta.APROBADA;
            p.fechaAprobacion = block.timestamp;
            emit PropuestaCerrada(_id, EstadoPropuesta.APROBADA);
        } else {
            // Mayoría en contra
            p.estado = EstadoPropuesta.RECHAZADA;
            emit PropuestaCerrada(_id, EstadoPropuesta.RECHAZADA);
        }
    }

    // ============ APELACIÓN ============
    function apelarPropuesta(uint256 _id) external onlyDirectivo propuestaExiste(_id) {
        Propuesta storage p = propuestas[_id];
        require(p.tipo == TipoPropuesta.ADMINISTRATIVA, "Solo administrativas");
        require(p.estado == EstadoPropuesta.APROBADA, "No esta aprobada");
        require(block.timestamp < p.fechaAprobacion + 1 days, "Plazo de apelacion vencido");

        p.estado = EstadoPropuesta.APELADA;
        p.fechaApelacion = block.timestamp;

        emit PropuestaApelada(_id, block.timestamp);
    }

    // ============ EJECUCIÓN ============
    function ejecutarPropuesta(uint256 _id) external onlyDirectivo propuestaExiste(_id) {
        Propuesta storage p = propuestas[_id];
        require(!p.ejecutada, "Ya ejecutada");
        require(p.estado == EstadoPropuesta.APROBADA, "No aprobada");
        require(p.tipo == TipoPropuesta.INVERSION, "Solo inversiones");

        p.ejecutada = true;
        p.estado = EstadoPropuesta.EJECUTADA;

        if (address(this).balance >= p.monto) {
            (bool success, ) = p.walletReceptora.call{value: p.monto}("");
            require(success, "Transferencia fallida");
        } else {
            // BUG-008 FIX: pagarPropuestaInversion ya tiene require(success) interno
            // si lanza revert, se propaga hacia arriba correctamente
            cooperativa.pagarPropuestaInversion(payable(p.walletReceptora), p.monto);
        }

        emit PropuestaEjecutada(_id, p.monto, p.walletReceptora);
    }


    // ============ DISPONIBILIDAD ============
    function setDisponibilidad(uint256 _id, bool _disponible) external onlyDirectivo propuestaExiste(_id) {
        propuestas[_id].disponible = _disponible;
        emit DisponibilidadCambiada(_id, _disponible);
    }

    // ============ VIEW FUNCTIONS ============
    function getPropuesta(uint256 _id) external view returns (Propuesta memory) {
        return propuestas[_id];
    }

    function getPropuestas() external view returns (Propuesta[] memory) {
        return propuestas;
    }

    function getAval(uint256 _id, address _directivo) external view returns (Aval memory) {
        return avales[_id][_directivo];
    }

    // ============ RECEIVE ============
    receive() external payable {}
}
