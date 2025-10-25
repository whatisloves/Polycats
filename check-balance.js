const { ethers } = require('ethers');
require('dotenv').config();

async function checkBalance() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC_URL);
    const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    
    const balance = await provider.getBalance(signer.address);
    const balanceEth = ethers.formatEther(balance);
    
    console.log(`💰 Wallet: ${signer.address}`);
    console.log(`💰 Balance: ${balanceEth} MATIC`);
    
    if (balance > 0n) {
      console.log('✅ You have MATIC tokens! Ready for minting!');
      return true;
    } else {
      console.log('❌ No MATIC tokens. Get some from: https://faucet.polygon.technology/');
      return false;
    }
  } catch (error) {
    console.error('Error checking balance:', error.message);
    return false;
  }
}

checkBalance();
