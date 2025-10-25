import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("\n=== Wallet Balance Check ===");
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceInMatic = ethers.formatEther(balance);

  console.log("Balance:", balanceInMatic, "MATIC");
  console.log("Balance (wei):", balance.toString());

  const requiredMatic = 0.15;
  const hasEnough = parseFloat(balanceInMatic) >= requiredMatic;

  console.log("\n=== Deployment Readiness ===");
  console.log("Required balance:", requiredMatic, "MATIC");
  console.log("Current balance:", balanceInMatic, "MATIC");
  console.log("Status:", hasEnough ? "✅ READY TO DEPLOY" : "❌ NEED MORE MATIC");

  if (!hasEnough) {
    const needed = requiredMatic - parseFloat(balanceInMatic);
    console.log("\n⚠️  You need", needed.toFixed(4), "more MATIC");
    console.log("\nGet testnet MATIC from:");
    console.log("- https://faucet.polygon.technology/");
    console.log("- https://www.alchemy.com/faucets/polygon-amoy");
    console.log("\nWallet address to fund:");
    console.log(deployer.address);
  } else {
    console.log("\n✅ You have enough MATIC to deploy!");
    console.log("\nRun deployment with:");
    console.log("npm run deploy:amoy");
  }

  console.log("============================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
