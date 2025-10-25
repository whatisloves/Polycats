import { ethers } from "hardhat";

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const BlockCatsNFT = await ethers.getContractFactory("BlockCatsNFT");
  const contract = BlockCatsNFT.attach(contractAddress!);

  console.log("📊 Contract State Check\n");
  console.log("Contract:", contractAddress);

  const totalSupply = await contract.totalSupply();
  console.log("Total Supply:", totalSupply.toString());

  const [mintedToday, maxDaily, remaining] = await contract.getMintStatus();
  console.log("Minted Today:", mintedToday.toString());
  console.log("Remaining:", remaining.toString());

  // Try token ID 0
  try {
    const [catDna0] = await contract.getCat(0);
    console.log("\n✅ Token ID 0 exists!");
    console.log("   Stats: Speed", catDna0.speed, "Strength", catDna0.strength);
  } catch (e: any) {
    console.log("\n❌ Token ID 0:", e.message.split('\n')[0]);
  }

  // Try token ID 1
  try {
    const [catDna1] = await contract.getCat(1);
    console.log("\n✅ Token ID 1 exists!");
    console.log("   Stats: Speed", catDna1.speed, "Strength", catDna1.strength);
  } catch (e: any) {
    console.log("❌ Token ID 1:", e.message.split('\n')[0]);
  }
}

main().then(() => process.exit(0)).catch(console.error);
