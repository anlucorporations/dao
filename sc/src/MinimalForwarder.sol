// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title MinimalForwarder
 * @dev A minimal implementation of EIP-712 meta-transactions forwarder with human-readable parameters for MetaMask signing
 */
contract MinimalForwarder {
    using ECDSA for bytes32;

    struct ForwardRequest {
        address from;
        address to;
        uint256 value;
        uint256 gas;
        uint256 nonce;
        string accion;
        string detalles;
        bytes data;
    }

    bytes32 private constant _TYPEHASH = keccak256(
        "ForwardRequest(address from,address to,uint256 value,uint256 gas,uint256 nonce,string accion,string detalles,bytes data)"
    );
    
    bytes32 private constant _DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );
    
    bytes32 private immutable _DOMAIN_SEPARATOR;
    
    mapping(address => uint256) private _nonces;
    
    constructor() {
        _DOMAIN_SEPARATOR = keccak256(abi.encode(
            _DOMAIN_TYPEHASH,
            keccak256(bytes("MinimalForwarder")),
            keccak256(bytes("1")),
            block.chainid,
            address(this)
        ));
    }
   
    function getNonce(address from) public view returns (uint256) {
        return _nonces[from];
    }

    function verify(ForwardRequest calldata req, bytes calldata signature) public view returns (bool) {
        address signer = getTypedDataHash(req).recover(signature);
        return _nonces[req.from] == req.nonce && signer == req.from;
    }

    function getTypedDataHash(ForwardRequest memory req) public view returns (bytes32) {
        bytes32 structHash = keccak256(abi.encode(
            _TYPEHASH,
            req.from,
            req.to,
            req.value,
            req.gas,
            req.nonce,
            keccak256(bytes(req.accion)),
            keccak256(bytes(req.detalles)),
            keccak256(req.data)
        ));

        return keccak256(abi.encodePacked(
            "\x19\x01",
            _DOMAIN_SEPARATOR,
            structHash
        ));
    }

    function execute(ForwardRequest calldata req, bytes calldata signature) external payable returns (bool, bytes memory) {
        require(req.from != address(0), "Invalid from address");
        require(req.to != address(0), "Invalid to address");
        
        uint256 currentNonce = _nonces[req.from];
        require(req.nonce == currentNonce, "Invalid nonce");

        address signer = getTypedDataHash(req).recover(signature);
        require(signer == req.from, "Invalid signature");
        
        _nonces[req.from] = currentNonce + 1;
        
        (bool success, bytes memory returndata) = req.to.call{value: req.value, gas: req.gas}(
            abi.encodePacked(req.data, req.from)
        );
        
        require(success, "Call failed");
        return (success, returndata);
    }
}
