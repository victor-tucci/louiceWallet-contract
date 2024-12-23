const hre = require("hardhat");

async function main() {
  // Deploy the Secp256r1VerificationFacet contract
  let accountFacet = process.env.ACCOUNT_FACET
  let entrypoint = process.env.ENTRYPOINT
  let facetRegistry = process.env.FACET_REGISTRY
  let defaultFallbackHandler = process.env.DEFAULT_FALLBACK_HANDLER
  let args = [accountFacet, entrypoint, facetRegistry, defaultFallbackHandler]

  const Secp256r1VerificationFacet = await hre.ethers.deployContract("Secp256r1VerificationFacet", args);
  await Secp256r1VerificationFacet.waitForDeployment();

  console.log('==Secp256r1VerificationFacet addr=', Secp256r1VerificationFacet.address)
}

// Run the main function and catch any errors
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
