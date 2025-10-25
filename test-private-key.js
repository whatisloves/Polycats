const { ethers } = require('ethers');

// Test the private key format
const privateKey = '0x7acc9a5d79c4e13f1e6e47362d9de7df50289bb57a72ffb0c7e0b32c16aaaaac';

console.log('🔍 Testing private key format...');
console.log('Private key:', privateKey);
console.log('Length:', privateKey.length);
console.log('Expected: 67 (0x + 64 hex chars)');

try {
  // Test if the private key is valid
  const wallet = new ethers.Wallet(privateKey);
  console.log('✅ Private key is valid!');
  console.log('Address:', wallet.address);
} catch (error) {
  console.log('❌ Private key is invalid!');
  console.log('Error:', error.message);
}

// Test with a known good private key for comparison
const testPrivateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
try {
  const testWallet = new ethers.Wallet(testPrivateKey);
  console.log('✅ Test private key works:', testWallet.address);
} catch (error) {
  console.log('❌ Test private key failed:', error.message);
}
