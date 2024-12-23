// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.21;

import {UserOperation} from "@account-abstraction/contracts/interfaces/UserOperation.sol";

/**
 * @title Verification Facet Interface
 * @dev Implements logic for user ops signature verification
 * @author victor tucci (@victor-tucci)
 * @author Ruslan Serebriakov (@rsrbk)
 */
interface IVerificationFacet {
    event SignerInitialized(bytes);

    error VerificationFacet__ValidateOwnerSignatureSelectorNotSet();
    error VerificationFacet__ValidateOwnerSignatureSelectorAlreadySet();
    error VerificationFacet__InitializationFailure();
    error VerificationFacet__InvalidFacetMapping();

    function initializeSigner(bytes memory) external returns (uint256);

    function validateOwnerSignatureSelector() external view returns (bytes4);

    function owner() external view returns (bytes memory);

    function isValidKeyType(bytes calldata) external view returns (bool);

    function validateOwnerSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) external view returns (uint256);
}
