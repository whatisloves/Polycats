import { ethers } from "hardhat";

async function main() {
  // Get contract address from hardhat network (uses .env automatically)
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    console.error("❌ No CONTRACT_ADDRESS found in web/.env.local");
    process.exit(1);
  }

  console.log("🔍 Verifying contract at:", contractAddress);
  console.log("");

  try {
    const BlockCatsNFT = await ethers.getContractFactory("BlockCatsNFT");
    const contract = BlockCatsNFT.attach(contractAddress);

    // Check if contract exists
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      console.error("❌ No contract found at this address");
      console.log("🔄 You need to deploy a new contract");
      process.exit(1);
    }

    // Read contract info
    console.log("✅ Contract found!");
    console.log("");
    console.log("📊 Contract Info:");
    console.log("Name:", await contract.name());
    console.log("Symbol:", await contract.symbol());
    console.log("Owner:", await contract.owner());
    console.log("Max Daily Mints:", await contract.MAX_DAILY_MINTS());
    console.log("Total Supply:", await contract.totalSupply());

    const [mintedToday, maxDaily, remaining] = await contract.getMintStatus();
    console.log("");
    console.log("📈 Mint Status:");
    console.log("Minted Today:", mintedToday.toString());
    console.log("Max Daily:", maxDaily.toString());
    console.log("Remaining:", remaining.toString());

    console.log("");
    console.log("✅ Contract is functional and ready!");
    console.log("");
    console.log("🌐 View on PolygonScan:");
    console.log(`https://amoy.polygonscan.com/address/${contractAddress}`);

  } catch (error: any) {
    console.error("❌ Error verifying contract:", error.message);
    console.log("🔄 You may need to deploy a new contract");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
