const hre = require("hardhat");

async function main() {

  //Deploy DiamondLoupeFacet
  const DiamondLoupe = await hre.ethers.deployContract('DiamondLoupeFacet')
  const DiamondLoupeFacet = await DiamondLoupe.waitForDeployment();
  console.log('==DiamondLoupeFacet addr=', DiamondLoupeFacet.target);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});