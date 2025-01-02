// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.21;

/**
 * @title Facet Storage
 * @dev Storage contract to store each facets variables with diamond storage
 * @author victor tucci (@victor-tucci)
 * @author toretto (@Tore-tto)
 */

struct Secp256r1VerificationStorage {
    uint256[2] q;
}

struct Info {
    bool exists;
    uint128 index;
}

struct StorageConfig {
    address[] addresses;
    mapping(address => Info) info;
}

struct ApprovalConfig {
    bool isApproved;
    uint64 validUntil;
}

struct DiamondCutApprovalConfig {
    mapping(bytes32 => mapping(address => ApprovalConfig)) isDiamondCutApproved;
}

struct DiamondCutStorage {
    mapping(uint8 => DiamondCutApprovalConfig) diamondCutApprovalConfigs;
    uint128 nonce;
}

library LibFacetStorage {
    bytes32 constant R1_STORAGE_POSITION =
        keccak256("v0.safeHodlWallet.diamond.storage.Secp256r1VerificationStorage");
    bytes32 constant DIAMONDCUT_STORAGE_POSITION =
        keccak256("v0.safeHodlWallet.diamond.storage.DiamondCutStorage");

    function r1Storage()
        internal
        pure
        returns (Secp256r1VerificationStorage storage ds)
    {
        bytes32 storagePosition = R1_STORAGE_POSITION;
        assembly {
            ds.slot := storagePosition
        }
    }

    function diamondCutStorage()
        internal
        pure
        returns (DiamondCutStorage storage ds)
    {
        bytes32 storagePosition = DIAMONDCUT_STORAGE_POSITION;
        assembly {
            ds.slot := storagePosition
        }
    }
}
