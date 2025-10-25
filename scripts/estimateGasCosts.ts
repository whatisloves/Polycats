import { ethers } from "hardhat";

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("❌ No CONTRACT_ADDRESS found");
    process.exit(1);
  }

  const BlockCatsNFT = await ethers.getContractFactory("BlockCatsNFT");
  const contract = BlockCatsNFT.attach(contractAddress);

  console.log("⛽ Gas Cost Estimates\n");

  // Genesis mint estimate
  try {
    const genesisDNA = {
      variant: 0,
      collarColor: 0,
      speed: 3,
      luck: 4,
      strength: 3,
      regen: 5,
      defense: 2,
      generation: 0,
      isGenesis: true
    };

    const estimateGenesis = await contract.mintCat.estimateGas(
      "0x8A89b98b1D78269da553c8663B9081Aa9A19d209", // recipient
      genesisDNA,
      ethers.encodeBytes32String("test"),
      "",
      [0, 0]
    );

    const gasPriceWei = (await ethers.provider.getFeeData()).gasPrice || BigInt(0);
    const gasPrice = Number(gasPriceWei) / 1e9; // Convert to Gwei

    const costGenesis = estimateGenesis * gasPriceWei;
    console.log("📦 Mint Genesis Cat:");
    console.log(`   Gas: ${estimateGenesis.toString()} units`);
    console.log(`   Price: ${gasPrice.toFixed(2)} Gwei`);
    console.log(`   Cost: ${ethers.formatEther(costGenesis)} MATIC\n`);

  } catch (error: any) {
    console.log("❌ Could not estimate genesis mint:", error.message.split('\n')[0]);
  }

  // Check balance
  const balance = await ethers.provider.getBalance("0x8A89b98b1D78269da553c8663B9081Aa9A19d209");
  console.log("💰 Your Balance:", ethers.formatEther(balance), "MATIC\n");

  console.log("📊 Estimated Costs for Full 2-Player Test:");
  console.log("   • Mint 2 genesis cats: ~0.006 MATIC");
  console.log("   • 1 breeding battle: ~0.005 MATIC");
  console.log("   • Total: ~0.011 MATIC\n");

  const testsYouCanRun = Math.floor(Number(ethers.formatEther(balance)) / 0.011);
  console.log(`✅ You can run ~${testsYouCanRun} complete test scenarios with current balance!\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
