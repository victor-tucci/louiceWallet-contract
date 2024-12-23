const hre = require("hardhat");

async function main() {
  // Deploy the AccountFacet contract

  const AccountFacet = await hre.ethers.deployContract("AccountFacet");
  await AccountFacet.waitForDeployment();

  console.log('==AccountFacet addr=', AccountFacet.address)
}

// Run the main function and catch any errors
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
