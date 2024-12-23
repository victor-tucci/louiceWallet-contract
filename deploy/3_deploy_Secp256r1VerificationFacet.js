const hre = require("hardhat");

async function main() {
  // Deploy the Secp256r1VerificationFacet contract

  const Secp256r1VerificationFacet = await hre.ethers.deployContract("Secp256r1VerificationFacet");
  await Secp256r1VerificationFacet.waitForDeployment();

  console.log('==Secp256r1VerificationFacet addr=', Secp256r1VerificationFacet.address)
}

// Run the main function and catch any errors
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
