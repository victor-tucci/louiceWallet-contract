const {Web3} = require("web3");
require("dotenv").config();

const web3 = new Web3(process.env.RPC_URL); // Replace with your RPC URL

// Private Key (DO NOT expose this in frontend code)
PRIVATE_KEY=""
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);

const LouiceFactoryABI = require("../artifacts/contracts/LouiceFactory.sol/LouiceFactory.json"); // Replace with your actual ABI file

// Owenert details
const pubkeyX = "0x3b44499a88d0ea1c5defef4cc45d3b4a27f506cb925aa6f226f14c3939e83d9f";
const pubkeyY = "0xb3b7011cb4c2c367b2b2e1b48e561db345c11ee2572c2c01cbe40c2541ee6cb8";
const prefix = "0x04";
const publicKey = prefix + pubkeyX.slice(2) + pubkeyY.slice(2);
// console.log(publicKey);

const SALT = 21;

// Function to get the Louice address from the factory contract
const getAddressFromFactoryContract = async (LouiceFactory) => {
    try {
        const louiceAddress = await LouiceFactory.methods
            .getAddress(process.env.SECP256R1_VERIFIER, publicKey, SALT)
            .call();
        console.log({ louiceAddress });
    } catch (error) {
        console.error("Error in getAddressFromFactoryContract:", error);
    }
};

const callCreateAccount = async (LouiceFactory) => {
    try{
        // Encode the transaction data
        const data = LouiceFactory.methods.createAccount(process.env.SECP256R1_VERIFIER, publicKey, SALT).encodeABI();
        // Get the transaction count (nonce)
        const nonce = await web3.eth.getTransactionCount(account.address);

        // Estimate gas
        const gas = await LouiceFactory.methods
            .createAccount(process.env.SECP256R1_VERIFIER, publicKey, SALT)
            .estimateGas({ from: account.address });

        // Set up the transaction
        const tx = {
            from: account.address,
            to: process.env.LOUICE_FACTORY,
            data,
            gas,
            nonce,
        };
        console.log({tx});

        // Sign the transaction
        const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);

        // Send the transaction
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log("Transaction successful:", receipt.transactionHash);

    } catch (error){
        console.error("Error in callCreateAccount:", error);
    }
}

async function main() {
    const LOUICE_FACTORY_ADDRESS = process.env.LOUICE_FACTORY;

    // Get the contract instance
    const LouiceFactory = new web3.eth.Contract(LouiceFactoryABI.abi, LOUICE_FACTORY_ADDRESS);

    try {
        const accountFacet = await LouiceFactory.methods.accountFacet().call();
        // console.log("Account Facet Address:", accountFacet);

        await getAddressFromFactoryContract(LouiceFactory);
        // await callCreateAccount(LouiceFactory);
    } catch (error) {
        console.error("Error in main function:", error);
    }
}

// Run the main function
main();