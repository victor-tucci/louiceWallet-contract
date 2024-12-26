const { ethers } = require("ethers");
require("dotenv").config();

const DemoABI = require("../demo.json"); // Replace with your actual ABI file

// Alchemy or Infura provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const proxyContract = new ethers.Contract(process.env.PROXY1, DemoABI.abi, wallet);

const callStore = async () => {
    try {
        const tx = await proxyContract.store(42);
        const receipt = await tx.wait();
        console.log("Transaction successful:", receipt);
    } catch (error) {
        console.error("Error calling store:", error);
    }
};

callStore();
