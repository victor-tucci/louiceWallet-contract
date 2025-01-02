const hre = require("hardhat");
const axios = require("axios");
const fs = require('fs');
require("dotenv").config();

const ERC20_contract = "0xF757Dd3123b69795d43cB6b58556b3c6786eAc13"
const PAYMASTER_ADDRESS = "0xDd74396fb58c32247d8E2410e853a73f71053252"; // safeHodlpaymaster

const second_address = "0xA69B64b4663ea5025549E8d7B90f167D6F0610B3"

//new-passkey
const SALT = 21;
const pubkeyX = "0x9f90a728802f31de6927158de26fafdd1354c47514796dd818003ce5604f5375";
const pubkeyY = "0x5f5a18fdc6576aaeec2cd1f4d9056f2f12cbcdd1580a4e894b636b7b020c6d4b";
const prefix = "0x04";
const publicKey = prefix + pubkeyX.slice(2) + pubkeyY.slice(2);

const IERC20_ABI = [
    "function totalSupply() external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    "function transfer(address recipient, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

async function main() {

    const IERC20Interface = new ethers.Interface(IERC20_ABI);

    // Get the EntryPoint contract
    const EPoint = await hre.ethers.getContractAt("IEntryPoint", process.env.ENTRYPOINT);
    
    // Get the SafeHodlFactory contract
    const SafeHodlFactoryContract = await hre.ethers.getContractAt("SafeHodlFactory", process.env.SAFEHODL_FACTORY);

    // Use the function from the AccountFacet
    const AccountFacet = await hre.ethers.getContractFactory("AccountFacet");

    // Use the function from the SafeHodlFactory
    const SafeHodlFactory = await hre.ethers.getContractFactory("SafeHodlFactory");

    // Create Init Code
    var initCode = process.env.SAFEHODL_FACTORY + SafeHodlFactory.interface.encodeFunctionData("createAccount", [
        process.env.SECP256R1_VERIFIER,
        publicKey,
        SALT]).slice(2);  // its for initial account deployment


    //construct data for the token transaction
    const ERC20data = IERC20Interface.encodeFunctionData("transfer", [second_address, 500000000]);
    // console.log({ERC20data});
    var sender;
    try {
        await EPoint.getSenderAddress(initCode);
    }
    catch (Ex) {
        sender = ethers.getAddress("0x" + Ex.data.slice(-40));
    }
    console.log({ sender });

    const codeLength = await hre.ethers.provider.getCode(sender);
    if (codeLength != "0x") {
        initCode = "0x";
    }

    console.log("nounce", await EPoint.getNonce(sender, 0));
    const value = ethers.parseEther('0.003');
    console.log("initcode length:", initCode.length);

    //construct for the approve
    const dummyActualGasNeed = ethers.parseEther('1');
    const dummyTokenApprove = IERC20Interface.encodeFunctionData("approve", [PAYMASTER_ADDRESS, dummyActualGasNeed]);
    console.log({dummyTokenApprove});

    const userOp = {
        sender,
        nonce: "0x" + (await EPoint.getNonce(sender, 0)).toString(16),
        initCode,
        // callData: AccountFacet.interface.encodeFunctionData("execute",[ERC20_contract, 0, ERC20data, "0x0000000000000000000000000000000000000000", "0x"]),
        callData:AccountFacet.interface.encodeFunctionData("execute",[second_address, value, "0x", ERC20_contract, dummyTokenApprove]),
        // callData: AccountFacet.interface.encodeFunctionData("execute", [second_address, value, "0x", "0x0000000000000000000000000000000000000000", "0x"]),
        paymasterAndData: PAYMASTER_ADDRESS + "F756Dd3123b69795d43cB6b58556b3c6786eAc13010000671a219600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000013b5e557e4601a264c654f3f0235ed381fc08b5ffea980e403bc807e27433586b0eb1abe122723125fc4d62ef605943f53a0c87893af3cfd6d33c3924cb0a4328ab0da981c", // we're not using a paymaster, for now
        paymasterAndData: "0x",
        signature: "0x643b8c4c46aaaf54fce00b774621525d0ea6402f8a4d344c2d2fc196b32b26098cbfccc3d902a21f601349d5956c34b02d3845d101edaea23c6080ec0287ea2300000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000002549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97631d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000247b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a22000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000037222c226f726967696e223a22687474703a2f2f6c6f63616c686f73743a35313733222c2263726f73734f726967696e223a66616c73657d000000000000000000", // we're not validating a signature, for now
    }

    const { preVerificationGas, verificationGasLimit, callGasLimit } =
        await ethers.provider.send("eth_estimateUserOperationGas", [
            userOp,
            process.env.ENTRYPOINT,
        ]);

    userOp.preVerificationGas = preVerificationGas;
    userOp.verificationGasLimit = verificationGasLimit;
    userOp.callGasLimit = callGasLimit;


    var { maxFeePerGas } = await ethers.provider.getFeeData();
    userOp.maxFeePerGas = "0x" + maxFeePerGas.toString(16);

    const maxPriorityFeePerGas = await ethers.provider.send(
        "skandha_getGasPrice"
    );
    console.log("skandha gas price:",maxPriorityFeePerGas);
    userOp.maxPriorityFeePerGas = userOp.maxFeePerGas;

    const userOpHash = await EPoint.getUserOpHash(userOp);
    // console.log({userOp});
    console.log({ userOpHash });

    const jsonString = JSON.stringify(userOp, null, 2); // Pretty print with 2 spaces
    const fileName = 'data.json';
    fs.writeFileSync(fileName, jsonString, 'utf8');
    console.log(`JSON file "${fileName}" has been created successfully.`);
    return;
    const userOp2 = {
        sender: "0xE9aBa63E075921C75e38a410df9CBF8A303f218B",
        nonce: "0x0",
        initCode: "0x795b7F055dE5b1652E88EE0A6b84eabA09E7Eff5296601cd00000000000000000000000082bab0ec021a8b1064f70701daf671bacb969798000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000041049f90a728802f31de6927158de26fafdd1354c47514796dd818003ce5604f53755f5a18fdc6576aaeec2cd1f4d9056f2f12cbcdd1580a4e894b636b7b020c6d4b00000000000000000000000000000000000000000000000000000000000000",
        callData: "0x04e745be000000000000000000000000a69b64b4663ea5025549e8d7b90f167d6f0610b3000000000000000000000000000000000000000000000000000aa87bee53800000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        paymasterAndData: "0x",
        signature: "0xb736003ecc416f1acb681bfffa1986c7eb89de58a8d969ebc9214d8f195b915ceb219b379555f9b0250638c94ba5f24bf0a4c0f003f8fa3853a4f8c95f30945400000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000002549960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d97631d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000247b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a22000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000037222c226f726967696e223a22687474703a2f2f6c6f63616c686f73743a35313733222c2263726f73734f726967696e223a66616c73657d000000000000000000",
        preVerificationGas: "0x110a0",
        verificationGasLimit: "0x1280d1",
        callGasLimit: "0xf35a",
        maxFeePerGas: "0x7aef40a0f",
        maxPriorityFeePerGas: "0x7aef40a0f"
      }
    console.log({ userOp2 });

    // Send the user operation to the bundler
    const opHash = await ethers.provider.send("eth_sendUserOperation", [
        userOp2,
        process.env.ENTRYPOINT,
    ]);
    console.log("User Operation Hash:", opHash);

    async function getUserOperationByHash(opHash, delay = 2000) {
        for (let i = 0; true; i++) {
            const result = await ethers.provider.send("skandha_userOperationStatus", [opHash]);
            // console.log("User Operation Hash:", result);
            if (!(result === null) && result.status) {
                if (['Cancelled', 'Reverted'].includes(result.status)) {
                    handleError(`Transaction is ${result.status}. Try again later.`);
                    return;
                }

                if (result.status === 'OnChain') {
                    console.log('Transaction completed successfully.');
                    return result.transaction;
                }
            }

            // Wait for a specified delay before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    try {
        const transactionHash = await getUserOperationByHash(opHash);
        console.log("transaction hash:", transactionHash);
        // const tx = await EPoint.handleOps([userOp], address0)
        // const receipt = await tx.wait();
        // console.log("receipt:", receipt);
    } catch (error) {
        console.error("Error:", error);
    }
}

// Run the main function and catch any errors
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
