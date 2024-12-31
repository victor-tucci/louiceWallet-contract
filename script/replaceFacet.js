const { ethers } = require("ethers");
require("dotenv").config();

const DefaultFallbackHandler = require("../artifacts/contracts/infrastructure/DefaultFallbackHandler.sol/DefaultFallbackHandler.json"); // Replace with your actual ABI file

// Alchemy or Infura provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const DefaultFallbackHandlerContract = new ethers.Contract(process.env.DEFAULT_FALLBACK_HANDLER, DefaultFallbackHandler.abi, wallet);
const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 }

// Helper function to get function selectors from ABI
function getSelectors(functionSignature) {
    const selectors = [];
    for( const func of functionSignature)
        selectors.push(ethers.id(func).slice(0, 10));
    return selectors;
}
const functionSignature = ["execute(address,uint256,bytes,address,bytes)"]
const functionSelector = getSelectors(functionSignature);

console.log(`Function Selector:` ,functionSelector);

const replaceFacet = async () => {
    try {

        const cut = [{
            facetAddress: "0x857c55f5eEa76457e918941D2D3E16eb5885Ba60",
            action: FacetCutAction.Replace,
            functionSelectors: functionSelector
        }]
        console.log(cut);
        const tx = await DefaultFallbackHandlerContract.diamondCut(cut, process.env.ZERO_ADDRESS, "0x");
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

replaceFacet();
// getOwner();
