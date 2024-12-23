// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.21;

import {LibDiamond} from "../../libraries/LibDiamond.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {LibFacetStorage} from "../../libraries/LibFacetStorage.sol";
import {Modifiers} from "../Modifiers.sol";
import {IDiamondCut} from "./interfaces/IDiamondCut.sol";

/**
 * @title DiamondCut Facet
 * @dev Responsible for adding/removing/replace facets in Barz
 * @author David Yongjun Kim (@Powerstream3604)
 */
contract DiamondCutFacet is Modifiers, IDiamondCut {
    address public owner;

    /**
     * @notice This constructor sets the Owner address which is an immutable variable.
     *         Immutable variables do not impact the storage of diamond
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Updates the flag for the interfaceId
     * @param _interfaceId InterfaceID to update the mapping
     * @param _flag Bool value to update the mapping of the given interface ID
     */
    function updateSupportsInterface(
        bytes4 _interfaceId,
        bool _flag
    ) external override {
        LibDiamond.enforceIsSelf();
        LibDiamond.diamondStorage().supportedInterfaces[_interfaceId] = _flag;
        emit SupportsInterfaceUpdated(_interfaceId, _flag);
    }

    /**
     * @notice Add/replace/remove any number of functions and optionally execute
     *         a function with delegatecall when guardians don't exist
     * @param _diamondCut Contains the facet addresses and function selectors
     * @param _init The address of the contract or facet to execute _calldata. It's prohibited in Barz
     */
    function diamondCut(
        FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata
    ) external override {
        _checkFacetCutValidity(_diamondCut);
        if (address(0) != _init) revert DiamondCutFacet__InvalidInitAddress();

        unchecked {
            ++LibFacetStorage.diamondCutStorage().nonce;
        }
        LibDiamond.diamondCut(_diamondCut, address(0), "");
    }

    /**
     * @notice Returns the diamond cut nonce of this wallet
     * @dev This method fetches the nonce from diamond cut storage
     * @return cutNonce Nonce of diamond cut to protect from reply attacks
     */
    function getDiamondCutNonce()
        public
        view
        override
        returns (uint128 cutNonce)
    {
        cutNonce = LibFacetStorage.diamondCutStorage().nonce;
    }
}
