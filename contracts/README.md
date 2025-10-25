# BlockCats Smart Contracts

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

3. Get test MATIC from faucet:
   - Visit: https://faucet.polygon.technology/
   - Select Polygon Amoy testnet
   - Enter your wallet address

## Testing

Run the test suite (TDD - tests were written first!):

```bash
npm test
```

Run with gas reporting:
```bash
REPORT_GAS=true npm test
```

Check test coverage:
```bash
npx hardhat coverage
```

## Compilation

Compile contracts and generate TypeScript types:

```bash
npm run compile
```

This generates:
- `artifacts/` - Compiled contracts
- `typechain-types/` - TypeScript types for backend

## Deployment

Deploy to Polygon Amoy testnet:

```bash
npm run deploy:amoy
```

The script will:
1. Deploy the contract
2. Wait 30 seconds
3. Auto-verify on PolygonScan
4. Display the contract address

Save the contract address to your `.env` file.

## Contract Features

### On-Chain Storage
- ✅ Cat DNA (variant, collar color, 5 stats)
- ✅ Name seed (for deterministic generation)
- ✅ Parent IDs
- ✅ Birth timestamp
- ✅ Daily mint limits (auto-reset)

### Off-Chain (Deterministic)
- Name generation (see `scripts/helpers/nameGenerator.ts`)
- Image generation (using seed)
- Metadata creation

## Usage in Backend

```typescript
import { ethers } from "ethers";
import BlockCatsNFT_ABI from "./artifacts/contracts/BlockCatsNFT.sol/BlockCatsNFT.json";

const provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC_URL);
const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

const nft = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  BlockCatsNFT_ABI.abi,
  signer
);

// Mint a cat
const dna = {
  variant: 3,
  collarColor: 14,
  speed: 8,
  luck: 5,
  strength: 7,
  regen: 3,
  defense: 9,
};

const seed = ethers.randomBytes(32);
const tx = await nft.mintCat(
  playerWallet,
  dna,
  seed,
  "ipfs://QmMetadata...",
  [0, 0] // parent IDs
);

await tx.wait();

// Read cat data
const cat = await nft.getCat(tokenId);
console.log("Owner:", cat.owner);
console.log("Rarity Score:", cat.rarityScore);
console.log("DNA:", cat.dna);
```

## Name Generation Example

```typescript
import { generateKyrgyzName, calculatePerks } from "./scripts/helpers/nameGenerator";

const cat = await nft.getCat(tokenId);
const name = generateKyrgyzName(
  cat.seed,
  Number(cat.rarityScore),
  tokenId
);

const perks = calculatePerks({
  speed: cat.dna.speed,
  luck: cat.dna.luck,
  strength: cat.dna.strength,
  regen: cat.dna.regen,
  defense: cat.dna.defense,
});

console.log(name); // "Altynai Runner #5"
console.log(perks); // ["Swift Companion", "Guardian"]
```

## Contract Address

After deployment, your contract will be on Polygon Amoy:
- Network: Polygon Amoy Testnet
- Chain ID: 80002
- Explorer: https://amoy.polygonscan.com/

## Gas Costs (Estimated)

| Operation | Gas | Cost on Amoy |
|-----------|-----|--------------|
| Deploy | ~3M | ~$0.15 |
| Mint Cat | ~200k | ~$0.01 |
| Read Cat | Free | $0 |

## Architecture

```
Blockchain (On-Chain)
├── DNA storage (7 stats + variant/collar)
├── Seed (32 bytes)
├── Daily limits (auto-reset)
└── Parent tracking

Backend (Off-Chain)
├── Name generation (deterministic from seed)
├── Image generation (AI or DiceBear)
├── Metadata creation
└── IPFS upload
```

## Security

- ✅ Only owner (backend) can mint
- ✅ Daily limits enforced on-chain
- ✅ Standard OpenZeppelin contracts
- ✅ Comprehensive test coverage
- ✅ Verified on PolygonScan
