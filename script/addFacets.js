const { ethers } = require("ethers");
require("dotenv").config();

const DiamondCutABI = require("../artifacts/contracts/facets/base/interfaces/IDiamondCut.sol/IDiamondCut.json"); // Replace with your actual ABI file
const demoAbi = require("../demoAbi.json");
// Alchemy or Infura provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const diamondCutContract = new ethers.Contract(process.env.PROXY, DiamondCutABI.abi, wallet);
const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 }

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

const addFacet = async () => {
    try {

        const cut = [{
            facetAddress: '0x1Dd5bE88733Fb38bA0DF277CeD962929665af93d',
            action: FacetCutAction.Add,
            functionSelectors: functionSelector
        }]
        console.log(cut);
        const tx = await diamondCutContract.diamondCut(cut, process.env.ZERO_ADDRESS, "0x");
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

addFacet();
// getOwner();
