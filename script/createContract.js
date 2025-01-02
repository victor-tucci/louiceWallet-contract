const { ethers } = require("ethers");
require("dotenv").config();

const SafeHodlFactoryABI = require("../artifacts/contracts/SafeHodlFactory.sol/SafeHodlFactory.json"); // Replace with your actual ABI file

// Alchemy or Infura provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const safeHodlFactoryContract = new ethers.Contract(process.env.SAFEHODL_FACTORY, SafeHodlFactoryABI.abi, wallet);

const callCreateAccount = async (verificationFacet, owner, salt) => {
    try {
        const tx = await safeHodlFactoryContract.createAccount(verificationFacet, owner, salt);
        const receipt = await tx.wait();
        console.log("Transaction successful:", receipt);
    } catch (error) {
        console.error("Error sending transaction:", error);
    }
};

// Call with required parameters
const SALT = 21;
// Owenert details
const pubkeyX = "0x3b44499a88d0ea1c5defef4cc45d3b4a27f506cb925aa6f226f14c3939e83d9f";
const pubkeyY = "0xb3b7011cb4c2c367b2b2e1b48e561db345c11ee2572c2c01cbe40c2541ee6cb8";
const prefix = "0x04";
const publicKey = prefix + pubkeyX.slice(2) + pubkeyY.slice(2);
console.log({publicKey});

callCreateAccount(process.env.SECP256R1_VERIFIER, publicKey, SALT);
