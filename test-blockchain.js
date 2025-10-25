const { ethers } = require('ethers');
require('dotenv').config();

async function testBlockchainConnection() {
  try {
    console.log('🔍 Testing Blockchain Connection...\n');
    
    // Check environment variables
    console.log('📋 Environment Variables:');
    console.log(`RPC URL: ${process.env.POLYGON_AMOY_RPC_URL}`);
    console.log(`Contract: ${process.env.CONTRACT_ADDRESS}`);
    console.log(`Private Key: ${process.env.DEPLOYER_PRIVATE_KEY ? '✅ Set' : '❌ Missing'}\n`);
    
    if (!process.env.DEPLOYER_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY === 'your_private_key_here') {
      console.log('❌ DEPLOYER_PRIVATE_KEY not configured!');
      console.log('Please set your private key in the .env file');
      return;
    }
    
    // Connect to blockchain
    console.log('🌐 Connecting to Polygon Amoy...');
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC_URL);
    const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    
    // Test connection
    const network = await provider.getNetwork();
    console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Check wallet balance
    const balance = await provider.getBalance(signer.address);
    const balanceEth = ethers.formatEther(balance);
    console.log(`💰 Wallet balance: ${balanceEth} MATIC`);
    
    if (balance === 0n) {
      console.log('⚠️  Warning: Wallet has no MATIC tokens!');
      console.log('You need testnet MATIC to pay for gas fees.');
      console.log('Get testnet MATIC from: https://faucet.polygon.technology/');
    }
    
    // Test contract access
    console.log('\n📄 Testing Contract Access...');
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const code = await provider.getCode(contractAddress);
    
    if (code === '0x') {
      console.log('❌ Contract not found at address!');
    } else {
      console.log('✅ Contract found and accessible');
      console.log(`Contract address: ${contractAddress}`);
    }
    
    console.log('\n🎉 Blockchain connection test complete!');
    
  } catch (error) {
    console.error('❌ Error testing blockchain connection:', error.message);
  }
}

testBlockchainConnection();
