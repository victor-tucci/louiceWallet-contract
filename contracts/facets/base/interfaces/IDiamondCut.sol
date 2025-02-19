// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.21;

/**
 * @title DiamondCut Facet Interface
 * @dev Interface for DiamondCut Facet responsible for adding/removing/replace facets in SafeHodl
 * @author victor tucci (@victor-tucci)
 */
interface IDiamondCut {
    error DiamondCutFacet__InvalidInitAddress();

    event DiamondCutApproved(FacetCut[] diamondCut);
    event DiamondCutApprovalRevoked(FacetCut[] diamondCut);

    event SupportsInterfaceUpdated(bytes4 interfaceId, bool _lag);

    enum FacetCutAction {
        Add,
        Replace,
        Remove
    }
    // Add=0, Replace=1, Remove=2

    struct FacetCut {
        address facetAddress;
        FacetCutAction action;
        bytes4[] functionSelectors;
    }

    /// @notice Add/replace/remove any number of functions and optionally execute
    ///         a function with delegatecall
    /// @param diamondCut Contains the facet addresses and function selectors
    /// @param init The address of the contract or facet to execute _calldata
    /// @param _calldata A function call, including function selector and arguments
    ///                  _calldata is executed with delegatecall on _init
    function diamondCut(
        FacetCut[] calldata diamondCut,
        address init,
        bytes calldata _calldata
    ) external;

    function updateSupportsInterface(bytes4 interfaceId, bool flag) external;

    function getDiamondCutNonce() external view returns (uint128);
}
