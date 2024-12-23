const hre = require("hardhat");

async function main() {
  // Deploy the DefaultFallbackHandler contract
  
  let diamondCutFacet = process.env.DIAMOND_CUT_FACET
  let accountFacet = process.env.ACCOUNT_FACET
  let tokenReceiverFacet = process.env.TOKEN_RECEIVER_FACET
  let diamondLoupeFacet = process.env.DIAMOND_LOUPE_FACET
  let args = [diamondCutFacet, accountFacet, tokenReceiverFacet, diamondLoupeFacet]

  const DefaultFallbackHandler = await hre.ethers.deployContract("DefaultFallbackHandler",args);
  await DefaultFallbackHandler.waitForDeployment();

  console.log('==DefaultFallbackHandler addr=', DefaultFallbackHandler.address)
}

// Run the main function and catch any errors
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
