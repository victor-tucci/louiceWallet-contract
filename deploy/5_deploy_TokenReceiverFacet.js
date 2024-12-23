const hre = require("hardhat");

async function main() {
  // Deploy the TokenReceiverFacet contract

  const TokenReceiverFacet = await hre.ethers.deployContract("TokenReceiverFacet");
  await TokenReceiverFacet.waitForDeployment();

  console.log('==TokenReceiverFacet addr=', TokenReceiverFacet.address)
}

// Run the main function and catch any errors
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
