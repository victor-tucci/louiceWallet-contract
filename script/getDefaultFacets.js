const { ethers } = require("ethers");
require("dotenv").config();

const DefaultFallbackHandlerABI = require("../artifacts/contracts/infrastructure/DefaultFallbackHandler.sol/DefaultFallbackHandler.json"); // Replace with your actual ABI file

// Alchemy or Infura provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const DefaultFallbackHandlerABIContract = new ethers.Contract(process.env.DEFAULT_FALLBACK_HANDLER, DefaultFallbackHandlerABI.abi, wallet);

const callGetFacets = async () => {
    try {
        const facets = await DefaultFallbackHandlerABIContract.facetAddresses();
        console.log("facets list are:", facets);
    } catch (error) {
        console.error("Error calling loupe:", error);
    }
};

callGetFacets();
