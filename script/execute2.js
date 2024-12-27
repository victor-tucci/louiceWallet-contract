const hre = require("hardhat");
const axios = require("axios");
const fs = require('fs');
require("dotenv").config();

async function main() {

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
