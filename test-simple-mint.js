const { ethers } = require('ethers');

// Contract ABI for mintCat function
const CONTRACT_ABI = [
  "function mintCat(address to, CatDNA memory catDNA, bytes32 nameSeed, string memory metadataUri, uint256[2] memory parentIds) external onlyOwner",
  "function totalSupply() view returns (uint256)",
  "function getMintStatus() view returns (bool, uint256, uint256)",
  "function owner() view returns (address)"
];

const CONTRACT_ADDRESS = '0x7EFA2f21583abaD92b0131b8C9FF40994158cbE0';
const RPC_URL = 'https://rpc-amoy.polygon.technology';
const PRIVATE_KEY = '0x7acc9a5d79c4e13f1e6e47362d9de7df50289bb57a72ffb0c7e0b32c16aaaaac';

async function testSimpleMint() {
  console.log('🧪 Testing Simple Mint...');
  console.log('========================');
  
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    
    console.log('📝 Contract Address:', CONTRACT_ADDRESS);
    console.log('💼 Signer Address:', wallet.address);
    console.log('');
    
    // Check current status
    const [canMint, dailyMints, maxDailyMints] = await contract.getMintStatus();
    console.log('📊 Current Status:');
    console.log('   - Can Mint:', canMint);
    console.log('   - Daily Mints:', dailyMints.toString());
    console.log('   - Max Daily Mints:', maxDailyMints.toString());
    console.log('');
    
    if (!canMint) {
      console.log('❌ Cannot mint - daily limit exceeded');
      console.log('   Daily mints:', dailyMints.toString());
      console.log('   Max daily mints:', maxDailyMints.toString());
      return;
    }
    
    // Prepare test DNA
    const testDNA = {
      variant: 1,
      collarColor: 2,
      speed: 5,
      luck: 5,
      strength: 5,
      regen: 5,
      defense: 5,
      generation: 0,
      isGenesis: true
    };
    
    const testWallet = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
    const nameSeed = ethers.randomBytes(32);
    const metadataUri = '';
    const parentIds = [0, 0];
    
    console.log('🎯 Attempting test mint...');
    console.log('   To:', testWallet);
    console.log('   DNA:', testDNA);
    console.log('');
    
    // Try to estimate gas first
    try {
      const gasEstimate = await contract.mintCat.estimateGas(
        testWallet,
        testDNA,
        nameSeed,
        metadataUri,
        parentIds
      );
      console.log('✅ Gas estimate successful:', gasEstimate.toString());
    } catch (error) {
      console.log('❌ Gas estimation failed:');
      console.log('   Error:', error.message);
      console.log('   Code:', error.code);
      console.log('   Data:', error.data);
      return;
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testSimpleMint();
