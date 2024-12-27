// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

library libStorage{
    bytes32 constant STORAGE_FACET = keccak256("v0.storage.diamond");

    struct DiamondStorage{
        string name;
        uint256 number;
    }

    function diamondStorage() internal pure returns(DiamondStorage storage ds){
        bytes32 position = STORAGE_FACET;
        assembly {
            ds.slot:= position
        }
    }
}
/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */
contract Storage {

    /**
     * @dev Store value in variable
     * @param num value to store
     */
    function store(uint256 num) public {
       libStorage.DiamondStorage storage ds = libStorage.diamondStorage();
       ds.number = num;
    }

    /**
     * @dev Return value 
     * @return value of 'number'
     */
    function retrieve() public view returns (uint256){
        return libStorage.diamondStorage().number;
    }
}