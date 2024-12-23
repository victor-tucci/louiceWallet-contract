const hre = require("hardhat");

async function main() {
  //Deploy TokenReceiverFacet
  const TokenReceiver = await hre.ethers.deployContract('TokenReceiverFacet');
  const TokenReceiverFacet = await TokenReceiver.waitForDeployment();
  console.log('==TokenReceiverFacet addr=', TokenReceiverFacet.target);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
