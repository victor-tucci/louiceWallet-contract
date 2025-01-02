const hre = require("hardhat");

async function main() {
  const accountFacet = process.env.ACCOUNT_FACET
  const entrypoint = process.env.ENTRYPOINT
  const facetRegistry = process.env.FACET_REGISTRY
  const defaultFallbackHandler = process.env.DEFAULT_FALLBACK_HANDLER
  const args = [accountFacet,entrypoint,facetRegistry,defaultFallbackHandler];
  console.log({args});

  //Deploy SafeHodlFactory
  const SafeHodl = await hre.ethers.deployContract("SafeHodlFactory", args);
  const SafeHodlFactory = await SafeHodl.waitForDeployment();
  console.log("==SafeHodlFactory addr= : ", SafeHodlFactory.target);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});