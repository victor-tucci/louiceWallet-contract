// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.21;

import {Louice} from "../Louice.sol";

/**
 * @title Louice Factory Interface
 * @dev Interface of contract to easily deploy Louice to a pre-computed address with a single call
 * @author victor tucci (@victor-tucci)
 */
interface ILouiceFactory {
    event LouiceDeployed(address);

    function createAccount(
        address verificationFacet,
        bytes calldata owner,
        uint256 salt
    ) external returns (Louice);

    function getAddress(
        address verificationFacet,
        bytes calldata owner,
        uint256 salt
    ) external view returns (address);

    function getBytecode(
        address accountFacet,
        address verificationFacet,
        address entryPoint,
        address facetRegistry,
        address defaultFallback,
        bytes memory ownerPublicKey
    ) external pure returns (bytes memory);

    function getCreationCode() external pure returns (bytes memory);
}
