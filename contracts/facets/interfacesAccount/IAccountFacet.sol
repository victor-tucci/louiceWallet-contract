// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.21;

import {IEntryPoint} from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";

/**
 * @title Account Facet Interface
 * @dev Interface of module contract that provides the account features and init/unitialization of signer
 *      compatible with EIP-1271 & EIP-4337
 * @author victor tucci (@victor-tucci)
 */
interface IAccountFacet {
    event AccountInitialized(
        IEntryPoint indexed entryPoint,
        bytes indexed ownerPublicKey
    );
    // NOTE: Added Below Event
    event VerificationSuccess(bytes32);
    event VerificationFailure(bytes32);
    event DepositWithdrawn(address indexed withdrawAddress, uint256 amount);

    error AccountFacet__InitializationFailure();
    error AccountFacet__NonExistentVerificationFacet();
    error AccountFacet__CallNotSuccessful();

    function initialize(
        address verificationFacet,
        address anEntryPoint,
        address facetRegistry,
        address _defaultFallBack,
        bytes calldata _ownerPublicKey
    ) external returns (uint256);

    function execute(address dest, uint256 value, bytes calldata func, address approveToken, bytes calldata approveFunc) external;

    function executeBatch(
        address[] calldata dest,
        uint256[] calldata value,
        bytes[] calldata func
    ) external;

    function withdrawDepositTo(address payable withdrawAddress, uint256 amount) external;
}
