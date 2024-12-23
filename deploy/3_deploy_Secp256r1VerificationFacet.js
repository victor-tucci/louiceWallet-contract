const hre = require("hardhat");

async function main() {
  //Deploy Secp256r1VerificationFacet
  const Secp256r1Verification = await hre.ethers.deployContract('Secp256r1VerificationFacet');

  const Secp256r1VerificationFacet = await Secp256r1Verification.waitForDeployment();
  console.log("==Secp256r1VerificationFacet addr=", Secp256r1VerificationFacet.target);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

