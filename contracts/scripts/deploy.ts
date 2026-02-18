import { ethers } from "hardhat";

async function main() {
  console.log("Deploying SonicStreamPay...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "S");

  const SonicStreamPay = await ethers.getContractFactory("SonicStreamPay");
  const streamPay = await SonicStreamPay.deploy();

  await streamPay.waitForDeployment();

  const address = await streamPay.getAddress();
  console.log("SonicStreamPay deployed to:", address);

  // Log deployment info for verification
  console.log("\n=== Deployment Summary ===");
  console.log("Contract Address:", address);
  console.log("Deployer:", deployer.address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Block:", await ethers.provider.getBlockNumber());

  console.log("\nTo verify on SonicScan:");
  console.log(`npx hardhat verify --network sonicMainnet ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
