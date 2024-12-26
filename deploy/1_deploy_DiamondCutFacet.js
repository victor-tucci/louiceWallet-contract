const hre = require("hardhat");

async function main() {
  //Deploy DiamondCutFacet
  const DiamondCut = await hre.ethers.deployContract('DiamondCutFacet');
  const DiamondCutFacet = await DiamondCut.waitForDeployment();
  console.log("==DiamondCutFacet addr= : ", DiamondCutFacet.target);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});


