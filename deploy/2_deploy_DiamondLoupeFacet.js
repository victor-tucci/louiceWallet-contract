const hre = require("hardhat");

async function main() {
  // Deploy the DiamondLoupeFacet contract

  const DiamondLoupeFacet = await hre.ethers.deployContract("DiamondLoupeFacet");
  await DiamondLoupeFacet.waitForDeployment();

  console.log('==DiamondLoupeFacet addr=', DiamondLoupeFacet.address)
}

// Run the main function and catch any errors
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
