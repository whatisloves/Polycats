# BlockCats - Blockchain Integration Plan

**Status:** Mock Phase Complete → Ready for Smart Contract Integration
**Estimated Time:** 11-16 hours total

---

## 🎯 Current State

### ✅ What's Working (Mock)
- Complete breeding battle system (53 tests passing)
- Minecraft plugin with all commands
- Mock breeding algorithm (deterministic, 75% upward bias)
- Open-world PvP system
- 5-cat inventory with auto-delete
- Buff application system

### ❌ What's Missing
- Smart contract breeding functions
- Real blockchain integration
- IPFS metadata storage
- Database persistence

---

## 📋 Implementation Phases

### **Phase 1: Smart Contract Updates** (4-6 hours)

**Goal:** Add breeding system to deployed contract

**File:** `contracts/BlockCatsNFT.sol`

**Changes Needed:**

```solidity
// 1. Update CatDNA struct
struct CatDNA {
    uint8 variant;
    uint8 collarColor;
    uint8 speed;
    uint8 luck;
    uint8 strength;
    uint8 regen;
    uint8 defense;
    uint8 generation;   // ADD THIS
    bool isGenesis;     // ADD THIS
}

// 2. Add breeding function
function breedCats(
    uint256 parent1Id,
    uint256 parent2Id,
    address winner,
    string memory metadataURI
) external onlyOwner returns (uint256)

// 3. Add cooldown system
mapping(uint256 => uint256) public catCooldowns;
function setCooldown(uint256 tokenId, uint256 duration) external onlyOwner
function canBattle(uint256 tokenId) public view returns (bool)

// 4. Add cat burning
function burnCat(uint256 tokenId) external onlyOwner
```

**Breeding Algorithm (copy from mock):**
```typescript
// From web/src/lib/breeding.ts - EXACT same logic
- Average of parent stats
- Deterministic mutation (5% -1, 20% +0, 40% +1, 35% +2)
- Generational bonus (maxGen / 2)
- Clamp to 1-10 range
```

**Tasks:**
- [ ] Update DNA struct
- [ ] Implement `breedCats()` function
- [ ] Implement `_breedStat()` helper (breeding algorithm)
- [ ] Add cooldown mapping & functions
- [ ] Add `burnCat()` function
- [ ] Add events (CatBred, CooldownSet, CatDied)
- [ ] Write tests for breeding (test/BlockCatsNFT.breeding.test.ts)
- [ ] Deploy updated contract
- [ ] Update contract address in `web/.env.local`

---

### **Phase 2: Backend Infrastructure** (2-3 hours)

**Goal:** Setup Web3, IPFS, and database

**Install Dependencies:**
```bash
cd web
npm install ethers@6.15.0 pinata-web3 @prisma/client prisma
```

**Setup Environment Variables:**

**File:** `web/.env.local`
```env
# Update after redeployment
CONTRACT_ADDRESS=<NEW_CONTRACT_ADDRESS>
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
DEPLOYER_PRIVATE_KEY=0x7acc9a5d79c4e13f1e6e47362d9de7df50289bb57a72ffb0c7e0b32c16aaaaac

# Get from https://pinata.cloud (free tier)
PINATA_JWT=<YOUR_JWT>
PINATA_GATEWAY_URL=<YOUR_GATEWAY>

# Get from https://supabase.com (free tier)
DATABASE_URL=postgresql://user:pass@host:5432/blockcats
```

**Create Files:**

1. **web/src/lib/web3.ts** - ethers.js provider & contract instance
2. **web/src/lib/ipfs.ts** - Pinata upload functions
3. **web/src/lib/generateCatImage.ts** - DiceBear image generation
4. **web/prisma/schema.prisma** - Database schema

**Database Schema:**
```prisma
model Cat {
  tokenId     Int      @unique
  owner       String
  name        String
  dna         String
  stats       Json     // { speed, strength, defense, regen, luck }
  generation  Int
  isGenesis   Boolean
  rarityScore Int
  cooldownUntil DateTime?
  parent1Id   Int?
  parent2Id   Int?
  mintedAt    DateTime @default(now())
}

model PlayerInventory {
  wallet      String @unique
  catIds      Int[]
  activeCatId Int?
}

model Battle {
  battleId        String @unique
  challenger      String
  challenged      String
  challengerCatId Int
  challengedCatId Int
  state           String
  winner          String?
  childTokenId    Int?
  deletedCatId    Int?
  createdAt       DateTime @default(now())
}
```

**Tasks:**
- [ ] Install dependencies
- [ ] Sign up for Pinata (https://pinata.cloud)
- [ ] Sign up for Supabase (https://supabase.com)
- [ ] Create `.env.local` with all variables
- [ ] Create `lib/web3.ts`
- [ ] Create `lib/ipfs.ts`
- [ ] Create `lib/generateCatImage.ts`
- [ ] Create `prisma/schema.prisma`
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma migrate dev --name init`

---

### **Phase 3: Backend Integration** (3-4 hours)

**Goal:** Replace mock storage with real blockchain + database

**Key Files to Update:**

#### 1. **web/src/app/api/battle/result/route.ts**

Replace:
```typescript
// ❌ MOCK
const childStats = breedCats(parent1, parent2);
```

With:
```typescript
// ✅ REAL
const tx = await contractWithSigner.breedCats(
  parent1Id,
  parent2Id,
  winner,
  metadataURI
);
const receipt = await tx.wait();
const childTokenId = extractFromEvent(receipt);
const childData = await contract.getCat(childTokenId);
```

**Full Flow:**
1. Get parent cats from blockchain
2. Check winner's inventory (auto-delete if 5/5)
3. Generate child image (DiceBear)
4. Upload image to IPFS
5. Create metadata JSON
6. Upload metadata to IPFS
7. Call `contract.breedCats()` ← blockchain does breeding
8. Extract child stats from contract event
9. Store in database
10. Set loser's cooldown

#### 2. **web/src/app/api/minecraft/claim/route.ts**

Replace:
```typescript
// ❌ MOCK
const tokenId = mockClaims.nextTokenId++;
```

With:
```typescript
// ✅ REAL
const tx = await contractWithSigner.mintCat(
  wallet, dna, seed, metadataURI, [0, 0]
);
const receipt = await tx.wait();
const tokenId = extractTokenId(receipt);
```

#### 3. Replace All Mock Storage

**Before:**
```typescript
import { addCat, getCat } from '@/lib/storage';
```

**After:**
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

**Tasks:**
- [ ] Update `/api/battle/result` with real breeding
- [ ] Update `/api/minecraft/claim` with real minting
- [ ] Update `/api/battle/challenge` to use Prisma
- [ ] Update `/api/battle/accept` to use Prisma
- [ ] Update `/api/player/[wallet]/inventory` to read from blockchain + DB
- [ ] Update `/api/player/setactive` to use Prisma
- [ ] Update `/api/cat/[tokenId]` with burning logic
- [ ] Add IPFS uploads for all mints/breeds
- [ ] Add image generation

---

### **Phase 4: Testing** (2-3 hours)

**Goal:** Verify end-to-end flow works

**Test Scenarios:**

1. **Genesis Cat Minting**
   ```
   Minecraft: /linkwallet → tame cat → claim
   Expected: Real NFT on PolygonScan, stored in DB
   ```

2. **First Breeding Battle**
   ```
   Player A challenges Player B → accept → fight → A wins
   Expected:
   - New NFT minted to Player A
   - Child stats on blockchain match expectations
   - Loser's cat has cooldown
   - Winner's weakest deleted if 5/5
   ```

3. **Cooldown System**
   ```
   Loser tries to battle with same cat
   Expected: "Cat on cooldown" error
   ```

4. **Inventory Limit**
   ```
   Player with 5 cats wins battle
   Expected: Weakest auto-deleted, new cat added
   ```

5. **Cat Deletion**
   ```
   /deletecat → /confirmdelete
   Expected: Cat removed from DB and burned if genesis
   ```

**Tasks:**
- [ ] Test genesis minting end-to-end
- [ ] Test breeding battle flow
- [ ] Test cooldown enforcement
- [ ] Test inventory limits
- [ ] Test cat deletion
- [ ] Verify NFTs on PolygonScan
- [ ] Check metadata on IPFS
- [ ] Test Minecraft plugin commands

---

## 🚨 Critical Notes

### Don't Break Mock Tests
- Keep mock implementation in `lib/storage/` and `lib/breeding.ts`
- Keep 53 tests passing (they test game logic, not blockchain)
- Only update API endpoints to call real contract

### Contract Deployment
- Deploy to Polygon Amoy testnet (same network)
- Save new contract address
- Update `.env.local` immediately
- Keep old contract for reference

### Data Migration
- No migration needed (fresh start with new contract)
- Mock data was for testing only

---

## 📊 Progress Checklist

### Phase 1: Smart Contract ⏳
- [ ] Update CatDNA struct
- [ ] Add breedCats() function
- [ ] Add cooldown system
- [ ] Add burnCat() function
- [ ] Write breeding tests
- [ ] Deploy updated contract
- [ ] Update backend .env

### Phase 2: Infrastructure ⏳
- [ ] Install dependencies
- [ ] Setup Pinata
- [ ] Setup Supabase
- [ ] Create .env.local
- [ ] Create Web3 utilities
- [ ] Create IPFS utilities
- [ ] Setup Prisma schema
- [ ] Run migrations

### Phase 3: Integration ⏳
- [ ] Update battle/result endpoint
- [ ] Update minecraft/claim endpoint
- [ ] Replace all mock storage
- [ ] Add IPFS uploads
- [ ] Add image generation

### Phase 4: Testing ⏳
- [ ] Test genesis minting
- [ ] Test breeding battles
- [ ] Test cooldowns
- [ ] Test inventory limits
- [ ] Verify on PolygonScan

---

## ⏱️ Time Breakdown

| Phase | Tasks | Hours |
|-------|-------|-------|
| Smart Contract | Update + tests + deploy | 4-6 |
| Infrastructure | Setup all services | 2-3 |
| Integration | Update all endpoints | 3-4 |
| Testing | End-to-end validation | 2-3 |
| **TOTAL** | | **11-16** |

---

## 📝 Quick Reference

**Existing Contract (Genesis Only):**
- Address: `0xC585c0ee9eDe4f35dbA97513570f9351d2B634E9`
- Functions: `mintCat()`, `getCat()`, `getMintStatus()`

**New Contract (With Breeding):**
- Will have: `breedCats()`, `setCooldown()`, `canBattle()`, `burnCat()`

**Mock Implementation:**
- Location: `web/src/lib/`
- Keep for reference and tests
- Don't delete - tests depend on it

**Blockchain Integration:**
- Location: `web/src/app/api/`
- Replace mock storage with contract calls
- Add Prisma for caching

---

**Next Step:** Start with Phase 1 (Smart Contract Updates)
