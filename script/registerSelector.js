const { ethers } = require("ethers");
require("dotenv").config();

const FacetRegistryABI = require("../artifacts/contracts/infrastructure/interfaces/IFacetRegistry.sol/IFacetRegistry.json"); // Replace with your actual ABI file

// Alchemy or Infura provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const FacetRegistryContract = new ethers.Contract(process.env.FACET_REGISTRY, FacetRegistryABI.abi, wallet);

// Helper function to get function selectors from ABI
function getSelectors(functionSignature) {
    const selectors = [];
    for( const func of functionSignature)
        selectors.push(ethers.id(func).slice(0, 10));
    return selectors;
}
const functionSignature = ["retrieve()", "store(uint256)"]
const functionSelector = getSelectors(functionSignature);

console.log(`Function Selector:` ,functionSelector);

const regoisterFacet = async () => {
    try {

        const tx = await FacetRegistryContract.registerFacetFunctionSelectors("0x1Dd5bE88733Fb38bA0DF277CeD962929665af93d", functionSelector);
        const receipt = await tx.wait();
        console.log("Transaction successful:", receipt);
    } catch (error) {
        console.error("Error sending transaction:", error);
    }
};

const getOwner = async () => {
    try{

        const owner = await diamondCutContract.getDiamondCutNonce();
        console.log("owner",owner);

    } catch(error){
        console.log("error while calling getOwner",error)
    }
}

regoisterFacet();
// getOwner();
