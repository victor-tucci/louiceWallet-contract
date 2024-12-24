const { ethers } = require("ethers");
require("dotenv").config();

const DiamondLoupeABI = require("../artifacts/contracts/facets/base/interfaces/IDiamondLoupe.sol/IDiamondLoupe.json"); // Replace with your actual ABI file

// Alchemy or Infura provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const proxyContract = new ethers.Contract(process.env.PROXY, DiamondLoupeABI.abi, wallet);

const callGetFacets = async () => {
    try {
        const facets = await proxyContract.facets();
        console.log("facets list are:", facets);
    } catch (error) {
        console.error("Error calling loupe:", error);
    }
};

callGetFacets();
