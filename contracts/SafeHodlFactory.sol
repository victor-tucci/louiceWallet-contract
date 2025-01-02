// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.21;

import {SafeHodl} from "./SafeHodl.sol";
import {ISafeHodlFactory} from "./interfaceMain/ISafeHodlFactory.sol";

/**
 * @title SafeHodl Factory
 * @dev Contract to easily deploy SafeHodl to a pre-computed address with a single call
 * @author victor tucci (@victor-tucci)
 */
contract SafeHodlFactory is ISafeHodlFactory {
    address public immutable accountFacet; //account logics
    address public immutable entryPoint; 
    address public immutable facetRegistry; // all facets (address+ selectors) for future purpose
    address public immutable defaultFallback; //token calls address + selectors initial implementations

    /**
     * @notice Sets the initialization data for SafeHodl contract initialization
     * @param _accountFacet Account Facet to be used to create SafeHodl
     * @param _entryPoint Entrypoint contract to be used to create SafeHodl. This uses canonical EntryPoint deployed by EF
     * @param _facetRegistry Facet Registry to be used to create SafeHodl
     * @param _defaultFallback Default Fallback Handler to be used to create SafeHodl
     */
    constructor(
        address _accountFacet,
        address _entryPoint,
        address _facetRegistry,
        address _defaultFallback
    ) {
        accountFacet = _accountFacet;
        entryPoint = _entryPoint;
        facetRegistry = _facetRegistry;
        defaultFallback = _defaultFallback;
    }

    /**
     * @notice Creates the SafeHodl with a single call. It creates the SafeHodl contract with the givent verification facet
     * @param _verificationFacet Address of verification facet used for creating the safeHodl account
     * @param _owner Public Key of the owner to initialize safeHodl account
     * @param _salt Salt used for deploying safeHodl with create2
     * @return safeHodl Instance of SafeHodl contract deployed with the given parameters
     */
    function createAccount(
        address _verificationFacet,
        bytes calldata _owner,
        uint256 _salt
    ) external override returns (SafeHodl safeHodl) {
        address addr = getAddress(_verificationFacet, _owner, _salt);
        uint codeSize = addr.code.length;
        if (codeSize > 0) {
            return SafeHodl(payable(addr));
        }
        safeHodl = new SafeHodl{salt: bytes32(_salt)}(
            accountFacet,
            _verificationFacet,
            entryPoint,
            facetRegistry,
            defaultFallback,
            _owner
        );
        emit SafeHodlDeployed(address(safeHodl));
    }

    /**
     * @notice Calculates the address of SafeHodl with the given parameters
     * @param _verificationFacet Address of verification facet used for creating the safeHodl account
     * @param _owner Public Key of the owner to initialize safeHodl account
     * @param _salt Salt used for deploying safeHodl with create2
     * @return safeHodlAddress Precalculated SafeHodl address
     */
    function getAddress(
        address _verificationFacet,
        bytes calldata _owner,
        uint256 _salt
    ) public view override returns (address safeHodlAddress) {
        bytes memory bytecode = getBytecode(
            accountFacet,
            _verificationFacet,
            entryPoint,
            facetRegistry,
            defaultFallback,
            _owner
        );
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                _salt,
                keccak256(bytecode)
            )
        );
        safeHodlAddress = address(uint160(uint256(hash)));
    }

    /**
     * @notice Returns the bytecode of SafeHodl with the given parameter
     * @param _accountFacet Account Facet to be used to create SafeHodl
     * @param _verificationFacet Verification Facet to be used to create SafeHodl
     * @param _entryPoint Entrypoint contract to be used to create SafeHodl. This uses canonical EntryPoint deployed by EF
     * @param _facetRegistry Facet Registry to be used to create SafeHodl
     * @param _defaultFallback Default Fallback Handler to be used to create SafeHodl
     * @param _ownerPublicKey Public Key of owner to be used to initialize SafeHodl ownership
     * @return safeHodlBytecode Bytecode of SafeHodl
     */
    function getBytecode(
        address _accountFacet,
        address _verificationFacet,
        address _entryPoint,
        address _facetRegistry,
        address _defaultFallback,
        bytes calldata _ownerPublicKey
    ) public pure override returns (bytes memory safeHodlBytecode) {
        bytes memory bytecode = type(SafeHodl).creationCode;
        safeHodlBytecode = abi.encodePacked(
            bytecode,
            abi.encode(
                _accountFacet,
                _verificationFacet,
                _entryPoint,
                _facetRegistry,
                _defaultFallback,
                _ownerPublicKey
            )
        );
    }

    /**
     * @notice Returns the creation code of the SafeHodl contract
     * @return creationCode Creation code of SafeHodl
     */
    function getCreationCode()
        public
        pure
        override
        returns (bytes memory creationCode)
    {
        creationCode = type(SafeHodl).creationCode;
    }
}
