// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MinimalForwarder
 * @notice Implementación EIP-2771 para meta-transacciones
 * @dev Permite a los socios votar firmando mensajes sin pagar gas
 */
contract MinimalForwarder {
    struct ForwardRequest {
        address from;
        address to;
        uint256 value;
        uint256 gas;
        uint256 nonce;
        bytes data;
    }

    bytes32 private constant TYPEHASH = keccak256(
        "ForwardRequest(address from,address to,uint256 value,uint256 gas,uint256 nonce,bytes data)"
    );

    bytes32 private constant EIP712DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );

    bytes32 private DOMAIN_SEPARATOR;
    mapping(address => uint256) private _nonces;

    event MetaTransactionExecuted(address indexed from, address indexed to, bytes4 indexed selector);

    constructor() {
        uint256 chainId;
        assembly {
            chainId := chainid()
        }

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                EIP712DOMAIN_TYPEHASH,
                keccak256(bytes("CooperativaLosCappones")),
                keccak256(bytes("1")),
                chainId,
                address(this)
            )
        );
    }

    function getNonce(address from) external view returns (uint256) {
        return _nonces[from];
    }

    function verify(ForwardRequest calldata req, bytes calldata signature) public view returns (bool) {
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(
                    abi.encode(
                        TYPEHASH,
                        req.from,
                        req.to,
                        req.value,
                        req.gas,
                        req.nonce,
                        keccak256(req.data)
                    )
                )
            )
        );

        address signer = recover(digest, signature);
        return signer == req.from && _nonces[req.from] == req.nonce;
    }

    function execute(ForwardRequest calldata req, bytes calldata signature)
        external
        payable
        returns (bool, bytes memory)
    {
        require(verify(req, signature), "MinimalForwarder: firma invalida");

        _nonces[req.from]++;

        (bool success, bytes memory returndata) = req.to.call{gas: req.gas, value: req.value}(
            abi.encodePacked(req.data, req.from)
        );

        require(success, "MinimalForwarder: ejecucion fallida");

        emit MetaTransactionExecuted(req.from, req.to, bytes4(req.data));

        return (success, returndata);
    }

    function recover(bytes32 digest, bytes memory signature) internal pure returns (address) {
        require(signature.length == 65, "Firma invalida: longitud");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        if (v < 27) v += 27;

        return ecrecover(digest, v, r, s);
    }
}
