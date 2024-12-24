const hre = require("hardhat");

async function main() {
  const accountFacet = process.env.ACCOUNT_FACET
  const entrypoint = process.env.ENTRYPOINT
  const facetRegistry = process.env.FACET_REGISTRY
  const defaultFallbackHandler = process.env.DEFAULT_FALLBACK_HANDLER
  const args = [accountFacet,entrypoint,facetRegistry,defaultFallbackHandler];

  //Deploy LouiceFactory
  const Louice = await hre.ethers.deployContract("LouiceFactory", args);
  const LouiceFactory = await Louice.waitForDeployment();
  console.log("==LouiceFactory addr= : ", LouiceFactory.target);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});