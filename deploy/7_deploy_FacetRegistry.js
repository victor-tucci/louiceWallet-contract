const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const address = await signer.getAddress();
  let args = [address];
  //Deploy FacetRegistry
  const FacetRegistry = await hre.ethers.deployContract('FacetRegistry',args);
  const Facetregistry = await FacetRegistry.waitForDeployment();
  console.log("==FacetRegistry addr= : ", Facetregistry.target);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});


