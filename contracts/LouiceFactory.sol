// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.21;

import {Louice} from "./Louice.sol";
import {ILouiceFactory} from "./interfaceMain/ILouiceFactory.sol";

/**
 * @title Louice Factory
 * @dev Contract to easily deploy Louice to a pre-computed address with a single call
 * @author victor tucci (@victor-tucci)
 */
contract LouiceFactory is ILouiceFactory {
    address public immutable accountFacet; //account logics
    address public immutable entryPoint; 
    address public immutable facetRegistry; // all facets (address+ selectors) for future purpose
    address public immutable defaultFallback; //token calls address + selectors initial implementations

    /**
     * @notice Sets the initialization data for Louice contract initialization
     * @param _accountFacet Account Facet to be used to create Louice
     * @param _entryPoint Entrypoint contract to be used to create Louice. This uses canonical EntryPoint deployed by EF
     * @param _facetRegistry Facet Registry to be used to create Louice
     * @param _defaultFallback Default Fallback Handler to be used to create Louice
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
     * @notice Creates the Louice with a single call. It creates the Louice contract with the givent verification facet
     * @param _verificationFacet Address of verification facet used for creating the louice account
     * @param _owner Public Key of the owner to initialize louice account
     * @param _salt Salt used for deploying louice with create2
     * @return louice Instance of Louice contract deployed with the given parameters
     */
    function createAccount(
        address _verificationFacet,
        bytes calldata _owner,
        uint256 _salt
    ) external override returns (Louice louice) {
        address addr = getAddress(_verificationFacet, _owner, _salt);
        uint codeSize = addr.code.length;
        if (codeSize > 0) {
            return Louice(payable(addr));
        }
        louice = new Louice{salt: bytes32(_salt)}(
            accountFacet,
            _verificationFacet,
            entryPoint,
            facetRegistry,
            defaultFallback,
            _owner
        );
        emit LouiceDeployed(address(louice));
    }

    /**
     * @notice Calculates the address of Louice with the given parameters
     * @param _verificationFacet Address of verification facet used for creating the louice account
     * @param _owner Public Key of the owner to initialize louice account
     * @param _salt Salt used for deploying louice with create2
     * @return louiceAddress Precalculated Louice address
     */
    function getAddress(
        address _verificationFacet,
        bytes calldata _owner,
        uint256 _salt
    ) public view override returns (address louiceAddress) {
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
        louiceAddress = address(uint160(uint256(hash)));
    }

    /**
     * @notice Returns the bytecode of Louice with the given parameter
     * @param _accountFacet Account Facet to be used to create Louice
     * @param _verificationFacet Verification Facet to be used to create Louice
     * @param _entryPoint Entrypoint contract to be used to create Louice. This uses canonical EntryPoint deployed by EF
     * @param _facetRegistry Facet Registry to be used to create Louice
     * @param _defaultFallback Default Fallback Handler to be used to create Louice
     * @param _ownerPublicKey Public Key of owner to be used to initialize Louice ownership
     * @return louiceBytecode Bytecode of Louice
     */
    function getBytecode(
        address _accountFacet,
        address _verificationFacet,
        address _entryPoint,
        address _facetRegistry,
        address _defaultFallback,
        bytes calldata _ownerPublicKey
    ) public pure override returns (bytes memory louiceBytecode) {
        bytes memory bytecode = type(Louice).creationCode;
        louiceBytecode = abi.encodePacked(
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
     * @notice Returns the creation code of the Louice contract
     * @return creationCode Creation code of Louice
     */
    function getCreationCode()
        public
        pure
        override
        returns (bytes memory creationCode)
    {
        creationCode = type(Louice).creationCode;
    }
}
