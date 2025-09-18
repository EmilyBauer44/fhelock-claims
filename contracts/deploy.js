const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying FHELockClaims contract...");

  // Get the contract factory
  const FHELockClaims = await ethers.getContractFactory("FHELockClaims");

  // Deploy the contract
  const fheLockClaims = await FHELockClaims.deploy(
    "0x1234567890123456789012345678901234567890", // verifier address (replace with actual)
    "0x0987654321098765432109876543210987654321"  // treasury address (replace with actual)
  );

  await fheLockClaims.waitForDeployment();

  const contractAddress = await fheLockClaims.getAddress();
  console.log("FHELockClaims deployed to:", contractAddress);

  // Save the contract address for frontend use
  const fs = require('fs');
  const contractInfo = {
    address: contractAddress,
    network: "sepolia",
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    './src/contracts/contract-info.json',
    JSON.stringify(contractInfo, null, 2)
  );

  console.log("Contract info saved to src/contracts/contract-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
