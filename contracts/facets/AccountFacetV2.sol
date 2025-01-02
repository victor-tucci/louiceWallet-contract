// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.21;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import {IEntryPoint} from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {UserOperation} from "@account-abstraction/contracts/interfaces/UserOperation.sol";

import {BaseAccount} from "@account-abstraction/contracts/core/BaseAccount.sol";
import {LibAppStorage, SafeHodlStorage} from "../libraries/LibAppStorage.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";
import {LibLoupe} from "../libraries/LibLoupe.sol";

import {IFacetRegistry} from "../infrastructure/interfaces/IFacetRegistry.sol";

import {IDiamondCut} from "../facets/base/interfaces/IDiamondCut.sol";
import {IDiamondLoupe} from "../facets/base/interfaces/IDiamondLoupe.sol";

import {IERC1271} from "../interfaceMain/ERC/IERC1271.sol";
import {IERC20} from "../interfaceMain/ERC/Tokens/IERC20.sol";

import {IVerificationFacet} from "./interfacesAccount/IVerificationFacet.sol";
import {IAccountFacet} from "./interfacesAccount/IAccountFacet.sol";

/**
 * @title Account Facet
 * @dev Account module contract that provides the account features and initialization of signer
 *      compatible with EIP-1271 & EIP-4337
 * @author victor tucci (@victor-tucci)
 */
contract AccountFacetV2 is IAccountFacet, SafeHodlStorage, BaseAccount {
    using ECDSA for bytes32;

    /**
     * @notice This constructor ensures that this contract can only be used as singleton for Proxy contracts
     */
    constructor() {
        LibAppStorage.enforceAccountInitialize();
    }

    /**
     * @notice Returns the address of EntryPoint contract registered to SafeHodl account
     */
    function entryPoint() public view override returns (IEntryPoint) {
        return s.entryPoint;
    }

    /**
     * @notice Initializes the initial storage of the SafeHodl contract.
     * @dev This method can only be called during the initialization or signature migration.
     *      If the proxy contract was created without initialization, anyone can call initialize.
     *      SafeHodl calls initialize in constructor in an atomic transaction during deployment
     * @param _verificationFacet Facet contract handling the verificationi
     * @param _anEntryPoint Entrypoint contract defined in EIP-4337 handling the flow of UserOp
     * @param _facetRegistry Registry of Facets that hold all facet information
     * @param _defaultFallBackHandler Middleware contract for default facets
     * @param _ownerPublicKey Bytes of owner public key
     */
    function initialize(
        address _verificationFacet,
        address _anEntryPoint,
        address _facetRegistry,
        address _defaultFallBackHandler,
        bytes calldata _ownerPublicKey
    ) public override returns (uint256 initSuccess) {
        LibAppStorage.enforceAccountInitialize();
        s.entryPoint = IEntryPoint(_anEntryPoint);
        s.facetRegistry = IFacetRegistry(_facetRegistry);
        LibDiamond.diamondStorage().defaultFallbackHandler = IDiamondLoupe(
            _defaultFallBackHandler
        );

        _cutDiamondAccountFacet(_verificationFacet);

        bytes memory initCall = abi.encodeWithSignature(
            "initializeSigner(bytes)",
            _ownerPublicKey
        );
        // Every Verification Facet should comply with initializeSigner(bytes)
        // to be compatible with the SafeHodl contract(for initialization)
        (bool success, bytes memory result) = _verificationFacet.delegatecall(
            initCall
        );
        if (!success || uint256(bytes32(result)) != 1) {
            revert AccountFacet__InitializationFailure();
        }

        initSuccess = 1;
        emit AccountInitialized(s.entryPoint, _ownerPublicKey);

    }

    function _cutDiamondAccountFacet(address _verificationFacet) internal {
        IDiamondCut.FacetCut[] memory cut = new IDiamondCut.FacetCut[](1);

        bytes4 ownerVerificationFuncSelector = IVerificationFacet(
            _verificationFacet
        ).validateOwnerSignatureSelector();

        bytes4[] memory verificationFunctionSelectors = new bytes4[](3);
        verificationFunctionSelectors[0] = IERC1271.isValidSignature.selector;
        verificationFunctionSelectors[1] = ownerVerificationFuncSelector;
        verificationFunctionSelectors[2] = IVerificationFacet.owner.selector;
        cut[0] = IDiamondCut.FacetCut({
            facetAddress: _verificationFacet,
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: verificationFunctionSelectors
        });

        LibDiamond.diamondCut(cut, address(0), "");
    }

    // Decode the calldata for `approve` or other token functions
    function decodeApproveFunc(bytes calldata data)
        internal
        pure
        returns (address spender, uint256 amount)
    {
        // Skip the first 4 bytes (function selector) and decode the arguments
        (spender, amount) = abi.decode(data[4:], (address, uint256));
    }

    /**
     * @notice Calls the destination with inputted calldata and value from EntryPoint
     * @dev This method executes the calldata coming from the EntryPoint.
     *      SafeHodl will make a call to this function for majority of typical execution(e.g. Swap, Token Transfer)
     * @param _dest Address of destination where the call will be forwarded to
     * @param _value Amount of native coin the owner is willing to send(e.g. ETH, BNB)
     * @param _func Bytes of calldata to execute in the destination address
     * @param _approveToken ERC20 contract address for execute approve
     * @param _approveFunc Bytes of calldata to execute approve in ERC20
     */
    function execute(address _dest, uint256 _value, bytes calldata _func, address _approveToken, bytes calldata _approveFunc) external {
        _requireFromEntryPoint();
        _call(_dest, _value, _func);
        
        // Check if `_approveToken` is a valid ERC20 token address
        if (_approveToken != address(0)) {
            // Decode `_approveFunc` calldata to extract the token amount
            (, uint256 amount) = decodeApproveFunc(_approveFunc);

            // Check the token balance of the current contract
            uint256 balance = IERC20(_approveToken).balanceOf(address(this));
            require(balance >= amount, "Insufficient token balance");

            // If balance is sufficient, proceed with the call
            _call(_approveToken, 0, _approveFunc);
        }
    }

    /**
     * execute a sequence of transactions
     */
    function executeBatch(address[] calldata _dest, uint256[] calldata _value, bytes[] calldata _func) external {
        _requireFromEntryPoint();
        require(_dest.length == _func.length, "wrong array lengths");
        for (uint256 i = 0; i < _dest.length;) {
            _call(_dest[i], _value[i], _func[i]);
            unchecked {
                    ++i;
            }
        }
    }

    /**
     * @notice Validates the signature field of UserOperation
     * @dev This method validates if the signature of UserOp is indeed valid by delegating the call to Verification Facet
     *      SafeHodl makes a call to the pre-registered Verification Facet address in App Storage
     * @param _userOp UserOperation from owner to be validated
     * @param _userOpHash Hash of UserOperation given from the EntryPoint contract
     */
    function _validateSignature(
        UserOperation calldata _userOp,
        bytes32 _userOpHash
    ) internal override returns (uint256 validationData) {
        // Get Facet with Function Selector
        address facet = LibLoupe.facetAddress(s.validateOwnerSignatureSelector);
        if (facet == address(0))
            revert AccountFacet__NonExistentVerificationFacet();

        // Make function call to VerificationFacet
        bytes memory validateCall = abi.encodeWithSelector(
            s.validateOwnerSignatureSelector,
            _userOp,
            _userOpHash
        );
        (bool success, bytes memory result) = facet.delegatecall(validateCall);
        if (!success) revert AccountFacet__CallNotSuccessful();
        validationData = uint256(bytes32(result));
        if (validationData == 0) emit VerificationSuccess(_userOpHash);
        else emit VerificationFailure(_userOpHash);
    }


    /**
     * @notice Calls the target with the inputted value and calldata
     * @dev This method is the actual function in SafeHodl that makes a call with an arbitrary owner-given data
     * @param _target Address of the destination contract which the call is getting forwarded to
     * @param _value Amount of Native coin the owner is wanting to make in this call
     * @param _data Calldata the owner is forwarding together in the call e.g. Swap/Token Transfer
     */
    function _call(
        address _target,
        uint256 _value,
        bytes memory _data
    ) internal {
        (bool success, bytes memory result) = _target.call{value: _value}(
            _data
        );
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    /**
     * @notice Check current account deposit in the entryPoint.
     */
    function getDeposit() public view returns (uint256) {
        return entryPoint().balanceOf(address(this));
    }


    /**
     * @notice Withdraw value from the account's deposit.
     * @dev Withdraws the deposited funds from the entryPoint to a specified wallet.
     * @param withdrawAddress The address to send the withdrawn funds to.
     * @param amount The amount to withdraw (0 to withdraw the full balance).
     */
    function withdrawDepositTo(address payable withdrawAddress, uint256 amount) external {
        require(withdrawAddress != address(0), "Invalid withdraw address");
        _requireFromEntryPoint();

        uint256 _value = (amount == 0) ? getDeposit() : amount;
        entryPoint().withdrawTo(withdrawAddress, _value);

        emit DepositWithdrawn(withdrawAddress, _value);
    }


}