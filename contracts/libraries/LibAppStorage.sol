// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.21;

import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import {IEntryPoint} from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {IFacetRegistry} from "../infrastructure/interfaces/IFacetRegistry.sol";

/*
 * @title App Storage
 * @dev App storage for Barz contract to prevent storage collision
 * @author victor tucci (@victor-tucci)
 */


struct InitializersStorage {
    // NOTE: initialized is a variable to make sure the initialization is only done once.
    uint8 signerInitialized;
    uint8 accountInitialized;
}

struct AppStorage {
    mapping(uint256 => InitializersStorage) initStorage;
    bytes4 validateOwnerSignatureSelector;
    IEntryPoint entryPoint;
    IFacetRegistry facetRegistry;
}

library LibAppStorage {
    error LibAppStorage__AccountAlreadyUninitialized();
    error LibAppStorage__AccountMustBeUninitialized();
    error LibAppStorage__SignerAlreadyUninitialized();
    error LibAppStorage__SignerMustBeUninitialized();

    function appStorage() internal pure returns (AppStorage storage ds) {
        assembly {
            ds.slot := 0
        }
    }

    function getValidateOwnerSignatureSelector()
        internal
        view
        returns (bytes4 selector)
    {
        selector = appStorage().validateOwnerSignatureSelector;
    }

    function setValidateOwnerSignatureSelector(
        bytes4 _validateOwnerSignatureSelector
    ) internal {
        appStorage()
            .validateOwnerSignatureSelector = _validateOwnerSignatureSelector;
    }

    function enforceSignerInitialize() internal {
        AppStorage storage s = appStorage();
        if (0 != s.initStorage[0].signerInitialized) {
            revert LibAppStorage__SignerMustBeUninitialized();
        }
        s.initStorage[0].signerInitialized = 1;
    }

    function enforceAccountInitialize() internal {
        AppStorage storage s = appStorage();
        if (0 != s.initStorage[0].accountInitialized) {
            revert LibAppStorage__AccountMustBeUninitialized();
        }
        s.initStorage[0].accountInitialized = 1;
    }

}

contract BarzStorage {
    AppStorage internal s;
}