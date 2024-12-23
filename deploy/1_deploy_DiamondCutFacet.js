const hre = require("hardhat");

async function main() {
  // Deploy the DiamondCutFacet contract

  const DiamondCutFacet = await hre.ethers.deployContract("DiamondCutFacet");
  await DiamondCutFacet.waitForDeployment();

  console.log('==DiamondCutFacet addr=', DiamondCutFacet.address)
}

// Run the main function and catch any errors
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
