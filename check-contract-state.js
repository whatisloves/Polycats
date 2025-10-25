const { ethers } = require('ethers');

// Contract ABI for the functions we need
const CONTRACT_ABI = [
  "function totalSupply() view returns (uint256)",
  "function getMintStatus() view returns (bool, uint256, uint256)",
  "function owner() view returns (address)"
];

const CONTRACT_ADDRESS = '0x7EFA2f21583abaD92b0131b8C9FF40994158cbE0';
const RPC_URL = 'https://rpc-amoy.polygon.technology';

async function checkContractState() {
  console.log('🔍 Checking BlockCats Contract State...');
  console.log('=====================================');
  
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    console.log('📝 Contract Address:', CONTRACT_ADDRESS);
    console.log('🌐 Network: Polygon Amoy');
    console.log('');
    
    // Check if contract is deployed
    try {
      const owner = await contract.owner();
      console.log('✅ Contract Owner:', owner);
    } catch (error) {
      console.log('❌ Contract not found or not deployed');
      console.log('Error:', error.message);
      return;
    }
    
    // Check total supply
    try {
      const totalSupply = await contract.totalSupply();
      console.log('📊 Total Supply:', totalSupply.toString());
    } catch (error) {
      console.log('❌ Failed to get total supply:', error.message);
    }
    
    // Check mint status
    try {
      const [canMint, dailyMints, maxDailyMints] = await contract.getMintStatus();
      console.log('🎯 Mint Status:');
      console.log('   - Can Mint:', canMint);
      console.log('   - Daily Mints:', dailyMints.toString());
      console.log('   - Max Daily Mints:', maxDailyMints.toString());
    } catch (error) {
      console.log('❌ Failed to get mint status:', error.message);
    }
    
    console.log('');
    console.log('🔍 Analysis:');
    if (totalSupply && totalSupply.toString() === '0') {
      console.log('   - Contract has no minted cats yet');
    }
    
  } catch (error) {
    console.log('❌ Error checking contract:', error.message);
  }
}

checkContractState();
