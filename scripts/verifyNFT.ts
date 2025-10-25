import { ethers } from "hardhat";

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const tokenId = 1;

  const BlockCatsNFT = await ethers.getContractFactory("BlockCatsNFT");
  const contract = BlockCatsNFT.attach(contractAddress!);

  console.log("🔍 Verifying NFT #" + tokenId + " on Blockchain\n");

  const [catDna, seed, birth, parentIds, uri, owner, rarityScore] = await contract.getCat(tokenId);

  console.log("✅ NFT EXISTS on blockchain!");
  console.log("   Owner:", owner);
  console.log("   Stats: Speed", catDna.speed, "Strength", catDna.strength, "Defense", catDna.defense);
  console.log("   Generation:", catDna.generation.toString(), catDna.isGenesis ? "(Genesis)" : "(Bred)");
  console.log("   Rarity Score:", rarityScore.toString());
  console.log("\n🌐 View on PolygonScan:");
  console.log("   https://amoy.polygonscan.com/token/" + contractAddress + "?a=" + tokenId);
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
