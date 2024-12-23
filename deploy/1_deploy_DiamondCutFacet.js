const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const address = await signer.getAddress();
  let args = [address];

  //Deploy DiamondCutFacet
  const DiamondCut = await hre.ethers.deployContract('DiamondCutFacet',args);
  const DiamondCutFacet = await DiamondCut.waitForDeployment();
  console.log("==DiamondCutFacet addr= : ", DiamondCutFacet.target);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

