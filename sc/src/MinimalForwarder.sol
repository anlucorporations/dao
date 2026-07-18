// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MinimalForwarder
 * @dev A minimal implementation of EIP-712 meta-transactions forwarder
 * This contract allows users to send transactions without paying gas fees
 * by having a relayer execute the transaction on their behalf
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

    bytes32 private constant _TYPEHASH = keccak256(
        "ForwardRequest(address from,address to,uint256 value,uint256 gas,uint256 nonce,bytes data)"
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

    function getTypedDataHash(ForwardRequest memory req) public view returns (bytes32) {
        bytes32 typeHash = _TYPEHASH;
        bytes32 domainSeparator = _DOMAIN_SEPARATOR;
        
        bytes32 dataHash;
        bytes32 structHash;
        bytes32 result;
        assembly {
            let ptr := mload(0x40)
            let dataPtr := add(req, 0xa0) // data is at offset 0xa0 (5 * 32 bytes for previous fields)
            let dataLen := mload(dataPtr)
            let dataOffset := add(dataPtr, 0x20)
            
            // Hash req.data
            dataHash := keccak256(dataOffset, dataLen)
            
            // Encode struct: keccak256(abi.encode(_TYPEHASH, from, to, value, gas, nonce, keccak256(data)))
            mstore(ptr, typeHash)
            mstore(add(ptr, 0x20), mload(req)) // from
            mstore(add(ptr, 0x40), mload(add(req, 0x20))) // to
            mstore(add(ptr, 0x60), mload(add(req, 0x40))) // value
            mstore(add(ptr, 0x80), mload(add(req, 0x60))) // gas
            mstore(add(ptr, 0xa0), mload(add(req, 0x80))) // nonce
            mstore(add(ptr, 0xc0), dataHash)
            structHash := keccak256(ptr, 0xe0)
            
            // Encode final hash: keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash))
            mstore(ptr, 0x1901000000000000000000000000000000000000000000000000000000000000) // "\x19\x01"
            mstore(add(ptr, 0x02), domainSeparator)
            mstore(add(ptr, 0x22), structHash)
            result := keccak256(ptr, 0x42)
            mstore(0x40, add(ptr, 0x60))
        }
        return result;
    }

    function execute(ForwardRequest calldata req, bytes calldata signature) external payable {
        require(req.from != address(0), "Invalid from address");
        require(req.to != address(0), "Invalid to address");
        
        // Permitimos que la cuenta haya hecho otras operaciones, 
        // pero el nonce debe ser igual al nonce actual
        uint256 currentNonce = _nonces[req.from];
        require(req.nonce == currentNonce, "Invalid nonce");
        bytes32 hash = getTypedDataHash(req);
        address signer = recoverSigner(hash, signature);
        require(signer == req.from, "Invalid signature");
        
        _nonces[req.from] = currentNonce + 1;
        
        (bool success, ) = req.to.call{value: req.value}(abi.encodePacked(req.data, req.from));
        require(success, "Call failed");
    }

    /**
     * @dev Recover the signer from a hash and signature
     */
    function recoverSigner(bytes32 hash, bytes calldata signature) internal pure returns (address) {
        require(signature.length == 65, "Invalid signature length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 0x20))
            v := byte(0, calldataload(add(signature.offset, 0x40)))
        }
        
        return ecrecover(hash, v, r, s);
    }
}
