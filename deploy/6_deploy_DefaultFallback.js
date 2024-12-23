const hre = require("hardhat");

async function main() {
  let diamondCutFacet = process.env.DIAMOND_CUT_FACET
  let accountFacet = process.env.ACCOUNT_FACET
  let tokenReceiverFacet = process.env.TOKEN_RECEIVER_FACET
  let diamondLoupeFacet = process.env.DIAMOND_LOUPE_FACET
  let args = [diamondCutFacet, accountFacet, tokenReceiverFacet, diamondLoupeFacet]
  
  //Deploy DefaultFallbackHandler
  const DefaultFallback = await hre.ethers.deployContract("DefaultFallbackHandler",args);
  const DefaultFallbackHandler = await DefaultFallback.waitForDeployment();
  console.log('==DefaultFallbackHandler addr=', DefaultFallbackHandler.target);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
