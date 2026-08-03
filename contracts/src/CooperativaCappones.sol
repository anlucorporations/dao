// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CooperativaCappones
 * @notice Registro de socios, aportes de capital, roles directivos y elecciones
 * @dev Contrato principal de la cooperativa "Los Cappones"
 */
contract CooperativaCappones {
    // ============ ENUMS ============
    enum Cargo {
        NINGUNO,
        PRESIDENTE,
        VICEPRESIDENTE,
        SECRETARIO,
        CONTRALOR,
        CONTADOR
    }

    // ============ STRUCTS ============
    struct Socio {
        address wallet;
        uint256 balance;
        uint256 fechaRegistro;
        bool activo;
        address walletRecuperacion;
    }

    struct Directivo {
        address wallet;
        Cargo cargo;
        uint256 fechaInicio;
        uint256 fechaFin;
        bool activo;
    }

    struct Postulacion {
        uint256 id;
        address postulante;
        Cargo cargo;
        uint256 fechaInicio;
        uint256 fechaFin;
        uint256 votosFavor;
        uint256 votosContra;
        bool finalizada;
        bool aprobada;
    }

    // ============ STATE VARIABLES ============
    address public owner;
    address public votacionContract;
    uint256 public capitalTotal;
    uint256 public constant PORCENTAJE_MINIMO_DIRECTIVO = 10; // 10%
    uint256 public constant PERIODO_CARGO = 730 days; // 2 años
    uint256 public constant DURACION_VOTACION_POSTULACION = 1 days; // 24h

    mapping(address => Socio) public socios;
    mapping(address => bool) public esSocio;
    address[] public listaSocios;

    mapping(address => Directivo) public directivos;
    mapping(Cargo => address) public cargoOcupado;
    uint256 public directivosActivos;

    Postulacion[] public postulaciones;
    mapping(uint256 => mapping(address => bool)) public haVotadoPostulacion;

    // ============ EVENTS ============
    event SocioRegistrado(address indexed wallet, uint256 fecha);
    event AporteDepositado(address indexed wallet, uint256 monto, uint256 nuevoBalance);
    event CargoAsignado(address indexed wallet, Cargo cargo, uint256 fechaInicio, uint256 fechaFin);
    event CargoRemovido(address indexed wallet, Cargo cargo, uint256 fecha);
    event PostulacionCreada(uint256 indexed id, address postulante, Cargo cargo);
    event VotoPostulacion(uint256 indexed id, address votante, bool favor);
    event PostulacionFinalizada(uint256 indexed id, bool aprobada);
    event WalletRecuperada(address indexed walletAntigua, address indexed walletNueva);
    event VotacionContractActualizado(address indexed nuevoVotacionContract);
    event PagoPropuestaEjecutado(address indexed receptora, uint256 monto);

    // ============ MODIFIERS ============
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el owner");
        _;
    }

    modifier onlySocio() {
        require(esSocio[msg.sender], "No es socio");
        _;
    }

    modifier onlyDirectivo() {
        require(directivos[msg.sender].activo, "No es directivo");
        _;
    }

    modifier onlyVotacion() {
        require(msg.sender == votacionContract, "Solo Votacion");
        _;
    }

    // ============ CONSTRUCTOR ============
    constructor(address _owner) {
        owner = _owner;
    }

    // ============ CONFIGURACIÓN DE TESORERÍA ============
    function setVotacionContract(address _votacionContract) external onlyOwner {
        require(_votacionContract != address(0), "Direccion invalida");
        votacionContract = _votacionContract;
        emit VotacionContractActualizado(_votacionContract);
    }

    function pagarPropuestaInversion(address payable _receptora, uint256 _monto) external onlyVotacion {
        require(address(this).balance >= _monto, "Fondos en tesoreria insuficientes");
        require(_receptora != address(0), "Direccion receptora invalida");

        (bool success, ) = _receptora.call{value: _monto}("");
        require(success, "Transferencia de tesoreria fallida");

        emit PagoPropuestaEjecutado(_receptora, _monto);
    }


    // ============ FUNCIONES DE SOCIOS ============
    function registrarSocio(address _wallet) external onlyOwner {
        require(_wallet != address(0), "Wallet invalida");
        require(!esSocio[_wallet], "Ya es socio");

        socios[_wallet] = Socio({
            wallet: _wallet,
            balance: 0,
            fechaRegistro: block.timestamp,
            activo: true,
            walletRecuperacion: address(0)
        });

        esSocio[_wallet] = true;
        listaSocios.push(_wallet);

        emit SocioRegistrado(_wallet, block.timestamp);
    }

    function asignarDirectivoInicial(address _wallet, Cargo _cargo) external onlyOwner {
        require(esSocio[_wallet], "No es socio");
        require(_cargo != Cargo.NINGUNO, "Cargo invalido");
        require(!directivos[_wallet].activo, "Ya es directivo");
        require(cargoOcupado[_cargo] == address(0), "Cargo ocupado");

        directivos[_wallet] = Directivo({
            wallet: _wallet,
            cargo: _cargo,
            fechaInicio: block.timestamp,
            fechaFin: block.timestamp + PERIODO_CARGO,
            activo: true
        });
        cargoOcupado[_cargo] = _wallet;
        directivosActivos++;

        emit CargoAsignado(_wallet, _cargo, block.timestamp, block.timestamp + PERIODO_CARGO);
    }


    function depositarAporte() external payable onlySocio {
        require(msg.value > 0, "Monto debe ser mayor a 0");

        socios[msg.sender].balance += msg.value;
        capitalTotal += msg.value;

        emit AporteDepositado(msg.sender, msg.value, socios[msg.sender].balance);
    }

    function setWalletRecuperacion(address _walletRespaldo) external onlySocio {
        require(_walletRespaldo != address(0), "Wallet invalida");
        socios[msg.sender].walletRecuperacion = _walletRespaldo;
    }

    function recuperarWallet(address _walletAntigua, address _walletNueva) external onlyOwner {
        require(esSocio[_walletAntigua], "No es socio");
        require(!esSocio[_walletNueva], "Nueva wallet ya registrada");
        require(socios[_walletAntigua].walletRecuperacion == _walletNueva || directivosActivos >= 3, 
            "No autorizado");

        Socio memory socioAntiguo = socios[_walletAntigua];

        socios[_walletNueva] = Socio({
            wallet: _walletNueva,
            balance: socioAntiguo.balance,
            fechaRegistro: socioAntiguo.fechaRegistro,
            activo: true,
            walletRecuperacion: address(0)
        });

        esSocio[_walletNueva] = true;
        esSocio[_walletAntigua] = false;
        delete socios[_walletAntigua];
        listaSocios.push(_walletNueva);

        // Actualizar directivo si aplica
        if (directivos[_walletAntigua].activo) {
            Cargo cargoAnterior = directivos[_walletAntigua].cargo;
            directivos[_walletNueva] = directivos[_walletAntigua];
            directivos[_walletNueva].wallet = _walletNueva;
            cargoOcupado[cargoAnterior] = _walletNueva;
            delete directivos[_walletAntigua];
        }

        emit WalletRecuperada(_walletAntigua, _walletNueva);
    }

    // ============ FUNCIONES DE DIRECTIVOS ============
    function tieneMinimoParaDirectivo(address _wallet) public view returns (bool) {
        if (capitalTotal == 0) return false;
        uint256 porcentaje = (socios[_wallet].balance * 100) / capitalTotal;
        return porcentaje >= PORCENTAJE_MINIMO_DIRECTIVO;
    }

    function postularseACargo(Cargo _cargo) external onlySocio {
        require(_cargo != Cargo.NINGUNO && _cargo != Cargo.PRESIDENTE, "Cargo invalido");
        require(tieneMinimoParaDirectivo(msg.sender), "No tiene 10% del capital");
        require(!directivos[msg.sender].activo, "Ya es directivo");
        require(cargoOcupado[_cargo] == address(0), "Cargo ya ocupado");

        uint256 id = postulaciones.length;
        postulaciones.push(Postulacion({
            id: id,
            postulante: msg.sender,
            cargo: _cargo,
            fechaInicio: block.timestamp,
            fechaFin: block.timestamp + DURACION_VOTACION_POSTULACION,
            votosFavor: 0,
            votosContra: 0,
            finalizada: false,
            aprobada: false
        }));

        emit PostulacionCreada(id, msg.sender, _cargo);
    }

    function votarPostulacion(uint256 _id, bool _favor) external onlySocio {
        require(_id < postulaciones.length, "Postulacion invalida");
        Postulacion storage p = postulaciones[_id];
        require(block.timestamp < p.fechaFin, "Votacion cerrada");
        require(!p.finalizada, "Ya finalizada");
        require(!haVotadoPostulacion[_id][msg.sender], "Ya voto");
        require(p.postulante != msg.sender, "No puede votar por si mismo");

        haVotadoPostulacion[_id][msg.sender] = true;
        if (_favor) {
            p.votosFavor++;
        } else {
            p.votosContra++;
        }

        emit VotoPostulacion(_id, msg.sender, _favor);
    }

    function finalizarPostulacion(uint256 _id) external onlyOwner {
        require(_id < postulaciones.length, "Postulacion invalida");
        Postulacion storage p = postulaciones[_id];
        require(!p.finalizada, "Ya finalizada");
        require(block.timestamp >= p.fechaFin || p.votosFavor + p.votosContra >= listaSocios.length / 2, 
            "Aun no se puede cerrar");

        p.finalizada = true;
        p.aprobada = p.votosFavor > p.votosContra;

        if (p.aprobada && cargoOcupado[p.cargo] == address(0)) {
            directivos[p.postulante] = Directivo({
                wallet: p.postulante,
                cargo: p.cargo,
                fechaInicio: block.timestamp,
                fechaFin: block.timestamp + PERIODO_CARGO,
                activo: true
            });
            cargoOcupado[p.cargo] = p.postulante;
            directivosActivos++;

            emit CargoAsignado(p.postulante, p.cargo, block.timestamp, block.timestamp + PERIODO_CARGO);
        }

        emit PostulacionFinalizada(_id, p.aprobada);
    }

    function removerDirectivo(address _wallet) external onlyOwner {
        require(directivos[_wallet].activo, "No es directivo");

        Cargo cargo = directivos[_wallet].cargo;
        cargoOcupado[cargo] = address(0);
        directivos[_wallet].activo = false;
        directivosActivos--;

        emit CargoRemovido(_wallet, cargo, block.timestamp);
    }

    // ============ VIEW FUNCTIONS ============
    function getListaSocios() external view returns (address[] memory) {
        return listaSocios;
    }

    function esSocioActivo(address _wallet) external view returns (bool) {
        return esSocio[_wallet] && socios[_wallet].activo;
    }

    function getDirectivo(address _wallet) external view returns (Directivo memory) {
        return directivos[_wallet];
    }

    function getPostulaciones() external view returns (Postulacion[] memory) {
        return postulaciones;
    }

    // ============ RECEIVE ============
    receive() external payable {
        if (esSocio[msg.sender]) {
            socios[msg.sender].balance += msg.value;
            capitalTotal += msg.value;
            emit AporteDepositado(msg.sender, msg.value, socios[msg.sender].balance);
        }
    }
}
