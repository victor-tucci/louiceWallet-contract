const { ethers } = require("ethers");
require("dotenv").config();

const DemoABI = require("../demo.json"); // Replace with your actual ABI file

// Alchemy or Infura provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const proxyContract = new ethers.Contract(process.env.PROXY2, DemoABI.abi, wallet);

const callRetrieve = async () => {
    try {
        const retriveData = await proxyContract.retrieve();
        console.log("retriveData is:", retriveData);
    } catch (error) {
        console.error("Error calling retriveData:", error);
    }
};

callRetrieve();
