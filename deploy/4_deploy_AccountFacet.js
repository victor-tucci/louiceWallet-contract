const hre = require("hardhat");

async function main() {
  //Deploy AccountFacet
  const Account = await hre.ethers.deployContract('AccountFacet');
  const AccountFacet = await Account.waitForDeployment();
  console.log('==AccountFacet addr=', AccountFacet.target);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});