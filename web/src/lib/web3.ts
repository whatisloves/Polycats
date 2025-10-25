import { ethers } from 'ethers';
import BlockCatsABI from './abis/BlockCatsNFT.json';

// Environment variables
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';
const RPC_URL = process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || '';

if (!CONTRACT_ADDRESS) {
  console.warn('⚠️  CONTRACT_ADDRESS not set in .env.local');
}

if (!PRIVATE_KEY) {
  console.warn('⚠️  DEPLOYER_PRIVATE_KEY not set in .env.local');
}

// Read-only provider for querying blockchain
export const provider = new ethers.JsonRpcProvider(RPC_URL);

// Signer for transactions (backend wallet)
export const signer = PRIVATE_KEY
  ? new ethers.Wallet(PRIVATE_KEY, provider)
  : null;

// Contract instances
export const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  BlockCatsABI,
  provider
);

export const contractWithSigner = signer
  ? new ethers.Contract(CONTRACT_ADDRESS, BlockCatsABI, signer)
  : null;

// Helper to parse DNA from contract response
export function parseDNA(dna: any) {
  return {
    variant: Number(dna.variant),
    collarColor: Number(dna.collarColor),
    speed: Number(dna.speed),
    luck: Number(dna.luck),
    strength: Number(dna.strength),
    regen: Number(dna.regen),
    defense: Number(dna.defense),
    generation: Number(dna.generation || 0),
    isGenesis: Boolean(dna.isGenesis),
  };
}

// Helper to encode DNA for contract calls
export function encodeDNA(dna: {
  variant: number;
  collarColor: number;
  speed: number;
  luck: number;
  strength: number;
  regen: number;
  defense: number;
  generation?: number;
  isGenesis?: boolean;
}) {
  return {
    variant: dna.variant,
    collarColor: dna.collarColor,
    speed: dna.speed,
    luck: dna.luck,
    strength: dna.strength,
    regen: dna.regen,
    defense: dna.defense,
    generation: dna.generation !== undefined ? dna.generation : 0,
    isGenesis: dna.isGenesis !== undefined ? dna.isGenesis : true,
  };
}

// Helper to calculate rarity score
export function calculateRarityScoreFromDNA(dna: {
  speed: number;
  strength: number;
  defense: number;
  regen: number;
  luck: number;
}): number {
  return dna.speed + dna.strength + dna.defense + dna.regen + dna.luck;
}

console.log('✅ Web3 utilities initialized');
console.log('📝 Contract:', CONTRACT_ADDRESS);
console.log('🌐 Network: Polygon Amoy');
console.log('💼 Signer:', signer ? signer.address : 'Not configured');
