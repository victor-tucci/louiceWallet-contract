const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const address = await signer.getAddress();
  let diamondCutFacet = process.env.DIAMOND_CUT_FACET
  let accountFacet = process.env.ACCOUNT_FACET
  let tokenReceiverFacet = process.env.TOKEN_RECEIVER_FACET
  let diamondLoupeFacet = process.env.DIAMOND_LOUPE_FACET
  let args = [address, diamondCutFacet, accountFacet, tokenReceiverFacet, diamondLoupeFacet]
  console.log({args});
  
  //Deploy DefaultFallbackHandler
  const DefaultFallback = await hre.ethers.deployContract("DefaultFallbackHandler",args);
  const DefaultFallbackHandler = await DefaultFallback.waitForDeployment();
  console.log('==DefaultFallbackHandler addr=', DefaultFallbackHandler.target);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
