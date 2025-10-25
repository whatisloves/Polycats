import { ethers } from "ethers";

async function main() {
  console.log("🔑 Generating Test Wallets for Demo\n");
  console.log("Note: These wallets are for DEMO ONLY!");
  console.log("Server pays for all gas. Players don't need MATIC.\n");
  console.log("=" .repeat(70));

  // Generate 2 test wallets
  for (let i = 1; i <= 2; i++) {
    const wallet = ethers.Wallet.createRandom();

    console.log(`\n👤 Player ${i}:`);
    console.log(`   Address: ${wallet.address}`);
    console.log(`   Private Key: ${wallet.privateKey}`);
    console.log(`   \n   In Minecraft: /linkwallet ${wallet.address}`);
  }

  console.log("\n" + "=".repeat(70));
  console.log("\n⚠️  Important:");
  console.log("   • Players don't need to import these wallets");
  console.log("   • Just copy/paste the ADDRESS in Minecraft");
  console.log("   • Server pays for all transactions");
  console.log("   • NFTs will be sent to these addresses");
  console.log("\n✅ To view NFTs after minting:");
  console.log("   • Go to https://amoy.polygonscan.com/");
  console.log("   • Search for the wallet address");
  console.log("   • Click 'Tokens' tab to see NFTs\n");
}

main().then(() => process.exit(0)).catch(console.error);
