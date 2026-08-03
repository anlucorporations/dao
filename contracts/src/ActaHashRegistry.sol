// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ActaHashRegistry
 * @notice Registra hashes SHA-256 de actas PDF en la blockchain
 * @dev Permite certificar la autenticidad de documentos off-chain
 */
contract ActaHashRegistry is Ownable {
    struct Acta {
        bytes32 hash;
        uint256 propuestaId;
        uint256 fechaRegistro;
        bool valida;
    }

    mapping(uint256 => Acta) public actas;
    mapping(bytes32 => bool) public hashUsado;
    uint256 public totalActas;

    event ActaRegistrada(uint256 indexed propuestaId, bytes32 hash, uint256 fecha);

    constructor() Ownable(msg.sender) {}

    function registrarHash(uint256 _propuestaId, bytes32 _hash) external onlyOwner {
        require(_hash != bytes32(0), "Hash invalido");
        require(!hashUsado[_hash], "Hash ya registrado");
        require(actas[_propuestaId].hash == bytes32(0), "Propuesta ya tiene acta");

        actas[_propuestaId] = Acta({
            hash: _hash,
            propuestaId: _propuestaId,
            fechaRegistro: block.timestamp,
            valida: true
        });

        hashUsado[_hash] = true;
        totalActas++;

        emit ActaRegistrada(_propuestaId, _hash, block.timestamp);
    }

    function verificarHash(bytes32 _hash) external view returns (bool, uint256) {
        if (!hashUsado[_hash]) {
            return (false, 0);
        }

        // Buscar la propuesta asociada
        for (uint256 i = 0; i <= totalActas; i++) {
            if (actas[i].hash == _hash) {
                return (true, actas[i].propuestaId);
            }
        }
        return (false, 0);
    }

    function getActa(uint256 _propuestaId) external view returns (Acta memory) {
        return actas[_propuestaId];
    }
}
