const {Web3} = require("web3");
require("dotenv").config();

const web3 = new Web3(process.env.RPC_URL); // Replace with your RPC URL

// Private Key (DO NOT expose this in frontend code)
PRIVATE_KEY="0x" + process.env.PRIVATE_KEY
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);

const SafeHodlFactoryABI = require("../artifacts/contracts/SafeHodlFactory.sol/SafeHodlFactory.json"); // Replace with your actual ABI file

// Owenert details
const pubkeyX = "0xd5e752f42463c4aa42555832eaf4a45d09cf767d435c921515184faaa3d9a0dd";
const pubkeyY = "0xe32013850239e4c135193aab20a35ec054065728413c0af438d8ba471622aa08"
const prefix = "0x04";
const publicKey = prefix + pubkeyX.slice(2) + pubkeyY.slice(2);
// console.log(publicKey);

const SALT = 21;

// Function to get the SafeHodl address from the factory contract
const getAddressFromFactoryContract = async (SafeHodlFactory) => {
    try {
        const safeHodlAddress = await SafeHodlFactory.methods
            .getAddress(process.env.SECP256R1_VERIFIER, publicKey, SALT)
            .call();
        console.log({ safeHodlAddress });
    } catch (error) {
        console.error("Error in getAddressFromFactoryContract:", error);
    }
};

const callCreateAccount = async (SafeHodlFactory) => {
    try{
        // Encode the transaction data
        const data = SafeHodlFactory.methods.createAccount(process.env.SECP256R1_VERIFIER, publicKey, SALT).encodeABI();
        // Get the transaction count (nonce)
        const nonce = await web3.eth.getTransactionCount(account.address);

        // Estimate gas
        const gas = await SafeHodlFactory.methods
            .createAccount(process.env.SECP256R1_VERIFIER, publicKey, SALT)
            .estimateGas({ from: account.address });

        // Set up the transaction
        const tx = {
            from: account.address,
            to: process.env.SAFEHODL_FACTORY,
            data,
            gas,
            nonce,
        };
        console.log({tx});

        // Sign the transaction
        const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATEKEY);

        // Send the transaction
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log("Transaction successful:", receipt.transactionHash);

    } catch (error){
        console.error("Error in callCreateAccount:", error);
    }
}

async function main() {

    // Get the contract instance
    const SafeHodlFactory = new web3.eth.Contract(SafeHodlFactoryABI.abi, process.env.SAFEHODL_FACTORY);

    try {
        const accountFacet = await SafeHodlFactory.methods.accountFacet().call();
        // console.log("Account Facet Address:", accountFacet);

        await getAddressFromFactoryContract(SafeHodlFactory);
        // await callCreateAccount(SafeHodlFactory);
    } catch (error) {
        console.error("Error in main function:", error);
    }
}

// Run the main function
main();