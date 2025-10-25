// Simple script to generate a new wallet
const { ethers } = require("ethers");

const wallet = ethers.Wallet.createRandom();

console.log("\n🔑 New Wallet Generated:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("Address:", wallet.address);
console.log("Private Key:", wallet.privateKey);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("\n⚠️  KEEP YOUR PRIVATE KEY SECRET!");
console.log("Add this to your .env file:");
console.log(`DEPLOYER_PRIVATE_KEY=${wallet.privateKey}`);
console.log("\n");
