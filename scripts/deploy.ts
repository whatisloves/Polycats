import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MATIC");

  const BlockCatsNFT = await ethers.getContractFactory("BlockCatsNFT");
  console.log("Deploying BlockCatsNFT...");

  const nft = await BlockCatsNFT.deploy();
  await nft.waitForDeployment();

  const address = await nft.getAddress();

  console.log("\n✅ BlockCatsNFT deployed to:", address);
  console.log("\n📝 Add this to your .env file:");
  console.log(`CONTRACT_ADDRESS=${address}`);

  console.log("\n⏳ Waiting 30 seconds before verification...");
  await new Promise((resolve) => setTimeout(resolve, 30000));

  console.log("\n🔍 Verifying contract on PolygonScan...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("✅ Contract verified!");
  } catch (error: any) {
    if (error.message.includes("already verified")) {
      console.log("✅ Contract already verified!");
    } else {
      console.error("❌ Verification failed:", error.message);
    }
  }

  console.log("\n📊 Contract Info:");
  console.log("Name:", await nft.name());
  console.log("Symbol:", await nft.symbol());
  console.log("Owner:", await nft.owner());
  console.log("Max Daily Mints:", await nft.MAX_DAILY_MINTS());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
