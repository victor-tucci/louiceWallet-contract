const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const address = await signer.getAddress();
  const entrypoint = process.env.ENTRYPOINT
  const args = [entrypoint, address];
  console.log({args});

  //Deploy SafeHodlPaymaster
  const SafeHodlPaymaster = await hre.ethers.deployContract("SafeHodlPaymaster", args);
  const safeHodlPaymaster = await SafeHodlPaymaster.waitForDeployment();
  console.log("==safeHodlPaymaster addr= : ", safeHodlPaymaster.target);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});