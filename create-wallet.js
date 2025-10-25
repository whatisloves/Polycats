const { ethers } = require('ethers');

// Create a new wallet
const wallet = ethers.Wallet.createRandom();

console.log('🔑 New Wallet Created:');
console.log(`Address: ${wallet.address}`);
console.log(`Private Key: ${wallet.privateKey}`);
console.log(`Mnemonic: ${wallet.mnemonic.phrase}`);
console.log('\n⚠️  IMPORTANT: Save this information securely!');
console.log('\n📝 Add this to your .env file:');
console.log(`DEPLOYER_PRIVATE_KEY=${wallet.privateKey}`);
console.log('\n💰 You\'ll need to:');
console.log('1. Add this private key to your .env file');
console.log('2. Get testnet MATIC from: https://faucet.polygon.technology/');
console.log('3. Transfer contract ownership to this wallet (optional)');
