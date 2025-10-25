# BlockCats - Implementation TODO List

**Status:** 58% Complete (Smart Contract + Plugin Commands Ready)
**Missing:** Breeding System, PvP Battles, Buff System, Real Blockchain Integration

---

## 🚨 CRITICAL: Replace Mock Data with Real Blockchain Integration

### 1. Fix Spawn Endpoint (Currently Always Approves)
**File:** `web/src/app/api/minecraft/spawn/route.ts`

**Current Issue:**
```typescript
// Always returns true - no real limit checking
return NextResponse.json({
  canSpawn: true,  // ❌ MOCK
  dna: generateRandomDNA(),  // ❌ MOCK
  message: 'Cat spawn approved'
});
```

**Required Changes:**
```typescript
// ✅ REAL IMPLEMENTATION
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
const mintStatus = await contract.getMintStatus();

// Check real daily limit
if (mintStatus.todayCount >= mintStatus.maxDaily) {
  return NextResponse.json({
    canSpawn: false,
    message: 'Daily limit reached (10/10)'
  });
}

// Generate DNA once and return it
const dna = generateRandomDNA();
return NextResponse.json({ canSpawn: true, dna });
```

**Tasks:**
- [ ] Remove hardcoded `canSpawn: true`
- [ ] Call `contract.getMintStatus()` to check daily limits
- [ ] Store generated DNA temporarily (Redis/database) keyed by catUuid
- [ ] Return same DNA in claim endpoint (no regeneration)

---

### 2. Fix Claim Endpoint (Fallback Simulation Mode)
**File:** `web/src/app/api/minecraft/claim/route.ts`

**Current Issue:**
```typescript
// Falls back to MOCK when blockchain fails
catch (error) {
  const tokenId = Math.floor(Math.random() * 1000000);  // ❌ FAKE
  const transactionHash = `0x${Math.random()...}`;      // ❌ FAKE
}
```

**Required Changes:**
```typescript
// ✅ REAL IMPLEMENTATION
try {
  // Use DNA from spawn request (not regenerated)
  const dna = await getDNAFromCache(catUuid);

  // Upload metadata to IPFS first
  const metadataURI = await uploadToIPFS(catMetadata);

  // Mint on blockchain
  const tx = await contract.mintCat(wallet, dna, seed, metadataURI, [0, 0]);
  const receipt = await tx.wait();
  const tokenId = receipt.logs[0].args.tokenId;

  // Store in database
  await db.cats.create({ tokenId, owner: wallet, dna, ... });

  return { success: true, tokenId, transactionHash: receipt.hash };
} catch (error) {
  // ❌ NO FALLBACK - return error instead
  return { success: false, error: error.message };
}
```

**Tasks:**
- [ ] Remove simulation fallback mode
- [ ] Retrieve DNA from spawn request (cache or database)
- [ ] Implement IPFS metadata upload (Pinata integration)
- [ ] Generate cat image via DiceBear API
- [ ] Store successful mints in database
- [ ] Return real transaction hash only
- [ ] Update Minecraft plugin to handle errors properly

---

### 3. Implement Real Cat Gallery API
**File:** `web/src/app/api/cats/route.ts`

**Current Issue:**
```typescript
// Returns empty array always
return NextResponse.json({ cats: [], total: 0 });
```

**Required Changes:**
```typescript
// ✅ REAL IMPLEMENTATION
const { wallet } = await request.json();

// Read from blockchain
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
const balance = await contract.balanceOf(wallet);

const cats = [];
for (let i = 0; i < balance; i++) {
  const tokenId = await contract.tokenOfOwnerByIndex(wallet, i);
  const catData = await contract.getCat(tokenId);
  cats.push({
    tokenId,
    dna: catData.dna,
    stats: {
      speed: catData.dna.speed,
      strength: catData.dna.strength,
      defense: catData.dna.defense,
      regen: catData.dna.regen,
      luck: catData.dna.luck
    },
    rarityScore: catData.rarityScore,
    metadataURI: catData.metadataURI,
    birthTimestamp: catData.birthTimestamp
  });
}

return NextResponse.json({ cats, total: cats.length });
```

**Tasks:**
- [ ] Implement `balanceOf()` and `tokenOfOwnerByIndex()` in smart contract (ERC721Enumerable)
- [ ] Read all NFTs owned by wallet from blockchain
- [ ] Parse DNA struct into readable stats
- [ ] Return real cat data with metadata URIs

---

### 4. Add Database Layer
**Current Issue:** No persistent storage; all data in-memory (YAML files)

**Required Schema (Prisma):**
```prisma
model Cat {
  id            Int      @id @default(autoincrement())
  tokenId       Int      @unique
  owner         String
  name          String
  dna           String
  metadataUri   String

  // Stats (parsed from DNA)
  speed         Int      // 1-10
  strength      Int      // 1-10
  defense       Int      // 1-10
  regen         Int      // 1-10
  luck          Int      // 1-10
  rarityScore   Int      // sum (5-50)

  // Breeding
  generation    Int      // 0 = genesis, 1+ = bred
  isGenesis     Boolean
  parent1Id     Int?
  parent2Id     Int?

  // State
  cooldownUntil DateTime?
  isActive      Boolean  @default(false)
  mintedAt      DateTime @default(now())

  @@index([owner])
}

model PlayerInventory {
  id          Int    @id @default(autoincrement())
  wallet      String @unique
  catIds      Int[]  // max 5
  activeCatId Int?

  @@index([wallet])
}

model Battle {
  id              Int      @id @default(autoincrement())
  battleId        String   @unique
  challenger      String
  challenged      String
  challengerCatId Int
  challengedCatId Int
  state           String   // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
  startTime       DateTime
  endTime         DateTime?
  winner          String?
  loser           String?
  reason          String?  // death, quit, timeout
  childTokenId    Int?
  deletedCatId    Int?
  arenaLocation   Json     // { x, y, z }

  @@index([challenger])
  @@index([challenged])
}

model DailySpawnCounter {
  id    Int    @id @default(autoincrement())
  date  String @unique // YYYY-MM-DD
  count Int    @default(0)
}
```

**Tasks:**
- [ ] Set up Supabase or PostgreSQL database
- [ ] Add Prisma ORM to project
- [ ] Create schema.prisma with above models
- [ ] Run `prisma migrate dev` to create tables
- [ ] Replace in-memory storage in backend APIs

---

## 🎮 MISSING FEATURE: PvP Breeding Battle System

### 5. Add Breeding Algorithm to Smart Contract
**File:** `contracts/BlockCatsNFT.sol`

**Current Issue:** Contract has NO breeding functions

**Required Implementation:**
```solidity
// Add to BlockCatsNFT.sol after mintCat()

function breedCats(
    uint256 parent1Id,
    uint256 parent2Id,
    address winner,
    string memory metadataURI
) external onlyOwner returns (uint256) {
    require(_ownerOf(parent1Id) != address(0), "Parent 1 doesn't exist");
    require(_ownerOf(parent2Id) != address(0), "Parent 2 doesn't exist");

    CatDNA memory p1 = cats[parent1Id].dna;
    CatDNA memory p2 = cats[parent2Id].dna;

    // Calculate child stats using breeding algorithm
    uint8 childSpeed = _breedStat(parent1Id, parent2Id, p1.speed, p2.speed, 0, p1.generation, p2.generation);
    uint8 childStrength = _breedStat(parent1Id, parent2Id, p1.strength, p2.strength, 1, p1.generation, p2.generation);
    uint8 childDefense = _breedStat(parent1Id, parent2Id, p1.defense, p2.defense, 2, p1.generation, p2.generation);
    uint8 childRegen = _breedStat(parent1Id, parent2Id, p1.regen, p2.regen, 3, p1.generation, p2.generation);
    uint8 childLuck = _breedStat(parent1Id, parent2Id, p1.luck, p2.luck, 4, p1.generation, p2.generation);

    uint8 childGeneration = (p1.generation > p2.generation ? p1.generation : p2.generation) + 1;

    CatDNA memory childDNA = CatDNA({
        variant: p1.variant, // Inherit from parent 1
        collarColor: p2.collarColor, // Inherit from parent 2
        speed: childSpeed,
        strength: childStrength,
        defense: childDefense,
        regen: childRegen,
        luck: childLuck,
        generation: childGeneration,
        isGenesis: false
    });

    uint256 childId = _nextTokenId++;
    _safeMint(winner, childId);
    _setTokenURI(childId, metadataURI);

    cats[childId] = Cat({
        dna: childDNA,
        seed: bytes32(0), // No seed for bred cats
        birthTimestamp: block.timestamp,
        parents: [parent1Id, parent2Id]
    });

    emit CatBred(childId, parent1Id, parent2Id);
    emit CatMinted(childId, winner, false, childGeneration);
    return childId;
}

function _breedStat(
    uint256 parent1Id,
    uint256 parent2Id,
    uint8 parent1Stat,
    uint8 parent2Stat,
    uint8 statIndex,
    uint8 parent1Generation,
    uint8 parent2Generation
) internal pure returns (uint8) {
    // 1. Average of both parents
    uint8 baseValue = (parent1Stat + parent2Stat) / 2;

    // 2. Deterministic mutation based on parent IDs + stat type
    uint256 seed = uint256(keccak256(abi.encode(parent1Id, parent2Id, statIndex)));
    uint256 roll = seed % 100;

    int8 mutation = 0;
    if (roll < 5) mutation = -1;       // 5% chance: -1
    else if (roll < 25) mutation = 0;   // 20% chance: +0
    else if (roll < 65) mutation = 1;   // 40% chance: +1
    else mutation = 2;                  // 35% chance: +2

    // 3. Generational bonus (every 2 generations adds +1)
    uint8 maxGen = parent1Generation > parent2Generation ? parent1Generation : parent2Generation;
    uint8 generationalBonus = maxGen / 2;

    // 4. Calculate final stat
    int16 result = int16(int8(baseValue)) + int16(mutation) + int16(generationalBonus);

    // 5. Clamp to 1-10
    if (result < 1) return 1;
    if (result > 10) return 10;
    return uint8(uint16(result));
}

// Add cooldown functionality
mapping(uint256 => uint256) public catCooldowns;

function setCooldown(uint256 tokenId, uint256 duration) external onlyOwner {
    require(_ownerOf(tokenId) != address(0), "Cat doesn't exist");
    catCooldowns[tokenId] = block.timestamp + duration;
    emit CooldownSet(tokenId, catCooldowns[tokenId]);
}

function canBattle(uint256 tokenId) public view returns (bool) {
    return block.timestamp >= catCooldowns[tokenId];
}

// Add generation tracking to DNA struct
struct CatDNA {
    uint8 variant;
    uint8 collarColor;
    uint8 speed;
    uint8 luck;
    uint8 strength;
    uint8 regen;
    uint8 defense;
    uint8 generation;  // ✅ ADD THIS
    bool isGenesis;    // ✅ ADD THIS
}

event CatBred(uint256 indexed childId, uint256 indexed parent1Id, uint256 indexed parent2Id);
event CooldownSet(uint256 indexed tokenId, uint256 cooldownUntil);
```

**Tasks:**
- [ ] Add `generation` and `isGenesis` fields to `CatDNA` struct
- [ ] Implement `breedCats()` function with breeding algorithm
- [ ] Implement `_breedStat()` helper function
- [ ] Add cooldown mapping and `setCooldown()` function
- [ ] Add `canBattle()` view function
- [ ] Deploy updated contract to testnet
- [ ] Update ABI in backend

---

### 6. Create Backend Battle Endpoints
**New Files:**
- `web/src/app/api/battle/challenge/route.ts`
- `web/src/app/api/battle/accept/route.ts`
- `web/src/app/api/battle/result/route.ts`

**POST /api/battle/challenge**
```typescript
interface ChallengeRequest {
  challenger: string;      // wallet
  challenged: string;      // wallet
  challengerCatId: number; // tokenId
  challengedCatId: number; // tokenId
}

export async function POST(request: Request) {
  const body = await request.json();

  // 1. Verify both cats exist on blockchain
  const contract = new ethers.Contract(...);
  const cat1 = await contract.getCat(body.challengerCatId);
  const cat2 = await contract.getCat(body.challengedCatId);

  // 2. Check ownership
  const owner1 = await contract.ownerOf(body.challengerCatId);
  const owner2 = await contract.ownerOf(body.challengedCatId);

  if (owner1.toLowerCase() !== body.challenger.toLowerCase()) {
    return NextResponse.json({ success: false, error: 'Invalid challenger cat' });
  }
  if (owner2.toLowerCase() !== body.challenged.toLowerCase()) {
    return NextResponse.json({ success: false, error: 'Invalid challenged cat' });
  }

  // 3. Check cooldowns
  const canBattle1 = await contract.canBattle(body.challengerCatId);
  const canBattle2 = await contract.canBattle(body.challengedCatId);

  if (!canBattle1 || !canBattle2) {
    return NextResponse.json({ success: false, error: 'Cat is on cooldown' });
  }

  // 4. Create battle in database
  const battleId = `battle_${Date.now()}`;
  const arenaLocation = { x: 0, y: 100, z: 0 }; // TODO: dynamic arena selection

  await db.battles.create({
    battleId,
    challenger: body.challenger,
    challenged: body.challenged,
    challengerCatId: body.challengerCatId,
    challengedCatId: body.challengedCatId,
    state: 'PENDING',
    startTime: new Date(),
    arenaLocation
  });

  return NextResponse.json({
    success: true,
    battleId,
    arenaLocation,
    expiresAt: new Date(Date.now() + 30000).toISOString() // 30 sec
  });
}
```

**POST /api/battle/accept**
```typescript
interface AcceptRequest {
  battleId: string;
  accepter: string;
}

export async function POST(request: Request) {
  const { battleId, accepter } = await request.json();

  // 1. Get battle from database
  const battle = await db.battles.findUnique({ where: { battleId } });

  if (!battle || battle.state !== 'PENDING') {
    return NextResponse.json({ success: false, error: 'Invalid battle' });
  }

  // 2. Check accepter is the challenged player
  if (battle.challenged.toLowerCase() !== accepter.toLowerCase()) {
    return NextResponse.json({ success: false, error: 'Not your challenge' });
  }

  // 3. Check not expired (30 sec timeout)
  const now = Date.now();
  const created = new Date(battle.startTime).getTime();
  if (now - created > 30000) {
    await db.battles.update({
      where: { battleId },
      data: { state: 'CANCELLED' }
    });
    return NextResponse.json({ success: false, error: 'Challenge expired' });
  }

  // 4. Mark battle as IN_PROGRESS
  await db.battles.update({
    where: { battleId },
    data: { state: 'IN_PROGRESS', startTime: new Date() }
  });

  return NextResponse.json({
    success: true,
    startTime: new Date().toISOString(),
    arena: battle.arenaLocation
  });
}
```

**POST /api/battle/result**
```typescript
interface ResultRequest {
  battleId: string;
  winner: string;
  loser: string;
  reason: 'death' | 'quit' | 'timeout';
}

export async function POST(request: Request) {
  const { battleId, winner, loser, reason } = await request.json();

  // 1. Get battle from database
  const battle = await db.battles.findUnique({ where: { battleId } });

  if (!battle || battle.state !== 'IN_PROGRESS') {
    return NextResponse.json({ success: false, error: 'Invalid battle' });
  }

  // If timeout, no breeding
  if (reason === 'timeout') {
    await db.battles.update({
      where: { battleId },
      data: {
        state: 'COMPLETED',
        endTime: new Date(),
        reason
      }
    });
    return NextResponse.json({ success: true, noBreeding: true });
  }

  // 2. Get parent cats from blockchain
  const contract = new ethers.Contract(...);
  const parent1Id = battle.challengerCatId;
  const parent2Id = battle.challengedCatId;

  const parent1 = await contract.getCat(parent1Id);
  const parent2 = await contract.getCat(parent2Id);

  // 3. Check winner's inventory (5 cat limit)
  const winnerCats = await db.cats.findMany({ where: { owner: winner } });

  const deletedCatId = null;
  if (winnerCats.length >= 5) {
    // Auto-delete weakest cat
    const weakest = winnerCats.sort((a, b) => a.rarityScore - b.rarityScore)[0];
    deletedCatId = weakest.tokenId;

    // Burn genesis cat or mark bred cat as burned
    if (weakest.isGenesis) {
      const signer = new ethers.Wallet(PRIVATE_KEY, provider);
      const contractWithSigner = contract.connect(signer);
      await contractWithSigner.burnCat(weakest.tokenId);
    }

    await db.cats.delete({ where: { tokenId: weakest.tokenId } });
  }

  // 4. Generate child metadata
  const childName = generateKyrgyzName(rarityScore, nextTokenId);
  const childImage = await generateCatImage(childDNA);
  const metadataURI = await uploadMetadataToIPFS({
    name: childName,
    description: `Gen ${childGeneration} BlockCat`,
    image: childImage,
    attributes: [
      { trait_type: 'Speed', value: childStats.speed },
      { trait_type: 'Strength', value: childStats.strength },
      { trait_type: 'Defense', value: childStats.defense },
      { trait_type: 'Regen', value: childStats.regen },
      { trait_type: 'Luck', value: childStats.luck },
      { trait_type: 'Generation', value: childGeneration }
    ]
  });

  // 5. Call contract.breedCats()
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const contractWithSigner = contract.connect(signer);

  const tx = await contractWithSigner.breedCats(
    parent1Id,
    parent2Id,
    winner,
    metadataURI
  );
  const receipt = await tx.wait();
  const childTokenId = receipt.logs.find(log => log.fragment.name === 'CatBred').args.childId;

  // 6. Set loser's cat on cooldown (24 hours)
  const loserCatId = battle.challenger === loser ? parent1Id : parent2Id;
  await contractWithSigner.setCooldown(loserCatId, 86400); // 24h in seconds

  // 7. Store child in database
  const childDNA = await contract.getCat(childTokenId);
  await db.cats.create({
    tokenId: childTokenId,
    owner: winner,
    name: childName,
    dna: encodeDNA(childDNA.dna),
    metadataUri: metadataURI,
    speed: childDNA.dna.speed,
    strength: childDNA.dna.strength,
    defense: childDNA.dna.defense,
    regen: childDNA.dna.regen,
    luck: childDNA.dna.luck,
    rarityScore: childDNA.rarityScore,
    generation: childDNA.dna.generation,
    isGenesis: false,
    parent1Id,
    parent2Id,
    isActive: false,
    mintedAt: new Date()
  });

  // 8. Update battle status
  await db.battles.update({
    where: { battleId },
    data: {
      state: 'COMPLETED',
      endTime: new Date(),
      winner,
      loser,
      reason,
      childTokenId,
      deletedCatId
    }
  });

  return NextResponse.json({
    success: true,
    childTokenId,
    childStats: {
      speed: childDNA.dna.speed,
      strength: childDNA.dna.strength,
      defense: childDNA.dna.defense,
      regen: childDNA.dna.regen,
      luck: childDNA.dna.luck
    },
    childName,
    transactionHash: receipt.hash,
    deletedCatId
  });
}
```

**Tasks:**
- [ ] Create `battle/challenge/route.ts` endpoint
- [ ] Create `battle/accept/route.ts` endpoint
- [ ] Create `battle/result/route.ts` endpoint
- [ ] Implement 5-cat inventory limit logic
- [ ] Implement auto-delete weakest cat logic
- [ ] Implement cooldown setting for loser
- [ ] Add IPFS metadata upload for bred cats
- [ ] Generate Kyrgyz names for bred cats
- [ ] Handle timeout (draw) scenario

---

### 7. Implement Minecraft Battle System
**New Java Files:**
- `managers/BattleManager.java`
- `managers/BuffManager.java`
- `listeners/BattleListener.java`
- `commands/ChallengeCommand.java`
- `commands/AcceptCommand.java`
- `commands/DeclineCommand.java`

**BattleManager.java**
```java
public class BattleManager {
    private Map<UUID, Battle> activeBattles = new HashMap<>();
    private Map<UUID, PendingChallenge> pendingChallenges = new HashMap<>();

    public void challengePlayer(Player challenger, Player challenged) {
        // 1. Get active cat IDs
        int challengerCatId = catCollectionManager.getActiveCatId(challenger);
        int challengedCatId = catCollectionManager.getActiveCatId(challenged);

        if (challengerCatId == -1 || challengedCatId == -1) {
            challenger.sendMessage("§cBoth players need an active cat");
            return;
        }

        // 2. Call API to create challenge
        String challengerWallet = walletManager.getWallet(challenger.getUniqueId());
        String challengedWallet = walletManager.getWallet(challenged.getUniqueId());

        apiClient.createBattleChallenge(
            challengerWallet,
            challengedWallet,
            challengerCatId,
            challengedCatId
        ).thenAccept(response -> {
            if (!response.success) {
                challenger.sendMessage("§cChallenge failed: " + response.error);
                return;
            }

            // 3. Store pending challenge
            PendingChallenge challenge = new PendingChallenge(
                challenger.getUniqueId(),
                challenged.getUniqueId(),
                response.battleId,
                response.arenaLocation
            );
            pendingChallenges.put(challenged.getUniqueId(), challenge);

            // 4. Notify players
            String challengerCatName = catCollectionManager.getActiveCatName(challenger);
            String challengedCatName = catCollectionManager.getActiveCatName(challenged);

            challenger.sendMessage("§aChallenge sent to " + challenged.getName());
            challenged.sendMessage(
                "§6" + challenger.getName() + " challenged you to a breeding battle!\n" +
                "§eYour cat: " + challengedCatName + " vs Their cat: " + challengerCatName + "\n" +
                "§a/accept §7or §c/decline §7(30 sec)"
            );

            // 5. Auto-expire after 30 seconds
            Bukkit.getScheduler().runTaskLater(plugin, () -> {
                if (pendingChallenges.containsKey(challenged.getUniqueId())) {
                    pendingChallenges.remove(challenged.getUniqueId());
                    challenger.sendMessage("§cChallenge expired");
                    challenged.sendMessage("§cChallenge expired");
                }
            }, 600L); // 30 sec
        });
    }

    public void acceptChallenge(Player accepter) {
        PendingChallenge challenge = pendingChallenges.remove(accepter.getUniqueId());
        if (challenge == null) {
            accepter.sendMessage("§cNo pending challenge");
            return;
        }

        Player challenger = Bukkit.getPlayer(challenge.challengerId);
        if (challenger == null) {
            accepter.sendMessage("§cChallenger is offline");
            return;
        }

        // Call API to accept
        apiClient.acceptBattleChallenge(challenge.battleId,
            walletManager.getWallet(accepter.getUniqueId())
        ).thenAccept(response -> {
            if (!response.success) {
                accepter.sendMessage("§cFailed to start battle: " + response.error);
                return;
            }

            startBattle(challenger, accepter, challenge);
        });
    }

    private void startBattle(Player p1, Player p2, PendingChallenge challenge) {
        // Teleport to arena
        Location arena = challenge.arenaLocation;
        p1.teleport(arena.clone().add(-5, 0, 0));
        p2.teleport(arena.clone().add(5, 0, 0));

        // Spawn active cats
        Cat cat1 = catCollectionManager.spawnActiveCat(p1);
        Cat cat2 = catCollectionManager.spawnActiveCat(p2);

        // Apply buffs
        buffManager.applyBuffsFromCat(p1, cat1);
        buffManager.applyBuffsFromCat(p2, cat2);

        // Create battle object
        Battle battle = new Battle(p1, p2, cat1, cat2, challenge.battleId);
        activeBattles.put(p1.getUniqueId(), battle);
        activeBattles.put(p2.getUniqueId(), battle);

        // Start 5-minute timer
        battle.startTimer(300);

        // Announce
        Bukkit.broadcastMessage("§6[BlockCats] §e" + p1.getName() + " vs " + p2.getName() + " breeding battle started!");
    }

    public void endBattle(Player winner, Player loser, String reason) {
        Battle battle = activeBattles.get(winner.getUniqueId());
        if (battle == null) return;

        battle.end(winner, loser, reason);
        activeBattles.remove(winner.getUniqueId());
        activeBattles.remove(loser.getUniqueId());

        // Call API with result
        String winnerWallet = walletManager.getWallet(winner.getUniqueId());
        String loserWallet = walletManager.getWallet(loser.getUniqueId());

        apiClient.reportBattleResult(
            battle.battleId,
            winnerWallet,
            loserWallet,
            reason
        ).thenAccept(result -> {
            if (result.success) {
                winner.sendMessage("§aYou won! New cat: " + result.childName);
                winner.sendMessage("§7Stats: " + formatStats(result.childStats));

                if (result.deletedCatId != null) {
                    winner.sendMessage("§e(Auto-deleted weakest cat to make room)");
                }

                loser.sendMessage("§cYou lost. Your cat is on cooldown for 24h");
            }

            // Teleport back
            winner.performCommand("spawn");
            loser.performCommand("spawn");
        });
    }
}

class Battle {
    Player p1, p2;
    Cat cat1, cat2;
    String battleId;
    long startTime;
    BukkitTask timer;

    void startTimer(int seconds) {
        timer = Bukkit.getScheduler().runTaskLater(plugin, () -> {
            // Timeout - draw
            p1.sendMessage("§cBattle timed out - no winner");
            p2.sendMessage("§cBattle timed out - no winner");

            // Report timeout to backend
            apiClient.reportBattleResult(battleId, null, null, "timeout");

            // Teleport back
            p1.performCommand("spawn");
            p2.performCommand("spawn");
        }, seconds * 20L);
    }

    void end(Player winner, Player loser, String reason) {
        if (timer != null) timer.cancel();
    }

    Player getOpponent(Player player) {
        return player.equals(p1) ? p2 : p1;
    }
}
```

**BuffManager.java**
```java
public class BuffManager {

    public void applyBuffsFromCat(Player player, Cat cat) {
        // Get cat stats from API
        int catId = catCollectionManager.getCatTokenId(cat);
        CatStats stats = apiClient.getCatStats(catId).join();

        // Remove existing buffs
        for (PotionEffect effect : player.getActivePotionEffects()) {
            player.removePotionEffect(effect.getType());
        }

        // Apply new buffs based on stats
        applySpeedBuff(player, stats.speed);
        applyStrengthBuff(player, stats.strength);
        applyDefenseBuff(player, stats.defense);
        applyRegenBuff(player, stats.regen);
        applyLuckBuff(player, stats.luck);
    }

    private void applySpeedBuff(Player p, int speed) {
        if (speed >= 7) {
            p.addPotionEffect(new PotionEffect(PotionEffectType.SPEED, Integer.MAX_VALUE, 1)); // Speed II
            if (speed == 10) {
                p.addPotionEffect(new PotionEffect(PotionEffectType.JUMP, Integer.MAX_VALUE, 0)); // Jump I
            }
        } else if (speed >= 4) {
            p.addPotionEffect(new PotionEffect(PotionEffectType.SPEED, Integer.MAX_VALUE, 0)); // Speed I
        }
    }

    private void applyStrengthBuff(Player p, int strength) {
        if (strength >= 7) {
            p.addPotionEffect(new PotionEffect(PotionEffectType.INCREASE_DAMAGE, Integer.MAX_VALUE, 1)); // Strength II
        } else if (strength >= 4) {
            p.addPotionEffect(new PotionEffect(PotionEffectType.INCREASE_DAMAGE, Integer.MAX_VALUE, 0)); // Strength I
        }
    }

    private void applyDefenseBuff(Player p, int defense) {
        if (defense >= 7) {
            p.addPotionEffect(new PotionEffect(PotionEffectType.DAMAGE_RESISTANCE, Integer.MAX_VALUE, 1)); // Resistance II
            if (defense == 10) {
                p.setHealthScale(24.0); // 2 extra hearts
            }
        } else if (defense >= 4) {
            p.addPotionEffect(new PotionEffect(PotionEffectType.DAMAGE_RESISTANCE, Integer.MAX_VALUE, 0)); // Resistance I
        }
    }

    private void applyRegenBuff(Player p, int regen) {
        if (regen >= 7) {
            p.addPotionEffect(new PotionEffect(PotionEffectType.REGENERATION, Integer.MAX_VALUE, 1)); // Regen II
        } else if (regen >= 4) {
            p.addPotionEffect(new PotionEffect(PotionEffectType.REGENERATION, Integer.MAX_VALUE, 0)); // Regen I
        }
    }

    private void applyLuckBuff(Player p, int luck) {
        if (luck >= 7) {
            p.addPotionEffect(new PotionEffect(PotionEffectType.LUCK, Integer.MAX_VALUE, 1)); // Luck II
            if (luck == 10) {
                p.addPotionEffect(new PotionEffect(PotionEffectType.FORTUNE, Integer.MAX_VALUE, 1)); // Fortune II (via custom handler)
            }
        } else if (luck >= 4) {
            p.addPotionEffect(new PotionEffect(PotionEffectType.LUCK, Integer.MAX_VALUE, 0)); // Luck I
        }
    }
}
```

**BattleListener.java**
```java
public class BattleListener implements Listener {

    @EventHandler
    public void onPlayerDeath(PlayerDeathEvent event) {
        Player loser = event.getEntity();
        Player killer = loser.getKiller();

        if (killer == null) return;

        Battle battle = battleManager.getActiveBattle(loser);
        if (battle == null) return;

        // End battle with death
        battleManager.endBattle(killer, loser, "death");
    }

    @EventHandler
    public void onPlayerQuit(PlayerQuitEvent event) {
        Player quitter = event.getPlayer();
        Battle battle = battleManager.getActiveBattle(quitter);

        if (battle == null) return;

        Player opponent = battle.getOpponent(quitter);

        // End battle with forfeit
        battleManager.endBattle(opponent, quitter, "quit");
    }
}
```

**Tasks:**
- [ ] Create `BattleManager.java` with challenge/accept/battle logic
- [ ] Create `BuffManager.java` with potion effect application
- [ ] Create `BattleListener.java` to handle death/quit events
- [ ] Create `/challenge <player> breeding` command
- [ ] Create `/accept` command
- [ ] Create `/decline` command
- [ ] Add battle arena location configuration
- [ ] Handle 5-minute battle timer
- [ ] Apply buffs when setting active cat (not just in battles)

---

### 8. Implement Inventory System (5 Cat Limit)
**New Endpoints:**
- `GET /api/player/{wallet}/inventory`
- `POST /api/player/setactive`
- `DELETE /api/cat/{tokenId}`

**GET /api/player/{wallet}/inventory**
```typescript
export async function GET(request: Request, { params }: { params: { wallet: string } }) {
  const { wallet } = params;

  // Query database for player's cats
  const cats = await db.cats.findMany({
    where: { owner: wallet.toLowerCase() },
    orderBy: { rarityScore: 'desc' }
  });

  // Get active cat ID
  const inventory = await db.playerInventory.findUnique({
    where: { wallet: wallet.toLowerCase() }
  });

  // Check cooldowns from blockchain
  const contract = new ethers.Contract(...);

  const catsWithStatus = await Promise.all(cats.map(async (cat) => {
    const canBattle = await contract.canBattle(cat.tokenId);
    const cooldownUntil = await contract.catCooldowns(cat.tokenId);

    return {
      tokenId: cat.tokenId,
      name: cat.name,
      stats: {
        speed: cat.speed,
        strength: cat.strength,
        defense: cat.defense,
        regen: cat.regen,
        luck: cat.luck
      },
      generation: cat.generation,
      rarityScore: cat.rarityScore,
      isActive: cat.tokenId === inventory?.activeCatId,
      cooldownUntil: cooldownUntil > 0 ? new Date(cooldownUntil * 1000).toISOString() : null,
      canBattle,
      isGenesis: cat.isGenesis
    };
  }));

  return NextResponse.json({
    cats: catsWithStatus,
    activeCatId: inventory?.activeCatId || null,
    count: cats.length,
    maxCount: 5
  });
}
```

**POST /api/player/setactive**
```typescript
interface SetActiveRequest {
  playerWallet: string;
  tokenId: number;
}

export async function POST(request: Request) {
  const { playerWallet, tokenId } = await request.json();

  // 1. Verify ownership
  const contract = new ethers.Contract(...);
  const owner = await contract.ownerOf(tokenId);

  if (owner.toLowerCase() !== playerWallet.toLowerCase()) {
    return NextResponse.json({ success: false, error: 'Not your cat' });
  }

  // 2. Get previous active cat
  const inventory = await db.playerInventory.findUnique({
    where: { wallet: playerWallet.toLowerCase() }
  });
  const previousActiveCatId = inventory?.activeCatId || null;

  // 3. Update active cat
  await db.playerInventory.upsert({
    where: { wallet: playerWallet.toLowerCase() },
    create: {
      wallet: playerWallet.toLowerCase(),
      catIds: [tokenId],
      activeCatId: tokenId
    },
    update: {
      activeCatId: tokenId
    }
  });

  // 4. Get new cat data
  const newActiveCat = await db.cats.findUnique({
    where: { tokenId }
  });

  return NextResponse.json({
    success: true,
    previousActiveCatId,
    newActiveCat: {
      tokenId: newActiveCat.tokenId,
      name: newActiveCat.name,
      stats: {
        speed: newActiveCat.speed,
        strength: newActiveCat.strength,
        defense: newActiveCat.defense,
        regen: newActiveCat.regen,
        luck: newActiveCat.luck
      }
    }
  });
}
```

**DELETE /api/cat/{tokenId}**
```typescript
export async function DELETE(request: Request, { params }: { params: { tokenId: string } }) {
  const { ownerWallet } = await request.json();
  const tokenId = parseInt(params.tokenId);

  // 1. Verify ownership
  const cat = await db.cats.findUnique({ where: { tokenId } });
  if (!cat || cat.owner.toLowerCase() !== ownerWallet.toLowerCase()) {
    return NextResponse.json({ success: false, error: 'Not your cat' });
  }

  // 2. Check not active
  const inventory = await db.playerInventory.findUnique({
    where: { wallet: ownerWallet.toLowerCase() }
  });
  if (inventory?.activeCatId === tokenId) {
    return NextResponse.json({ success: false, error: 'Cannot delete active cat' });
  }

  // 3. Burn on blockchain (if genesis)
  const contract = new ethers.Contract(...);
  if (cat.isGenesis) {
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    const contractWithSigner = contract.connect(signer);
    const tx = await contractWithSigner.burnCat(tokenId);
    await tx.wait();
  }

  // 4. Remove from database
  await db.cats.delete({ where: { tokenId } });

  return NextResponse.json({
    success: true,
    transactionHash: cat.isGenesis ? tx.hash : null
  });
}
```

**Update Minecraft Plugin Commands:**

**Update `ChooseCatCommand.java`:**
```java
@Override
public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
    Player player = (Player) sender;
    String wallet = walletManager.getWallet(player.getUniqueId());

    // Call API to set active cat
    apiClient.setActiveCat(wallet, tokenId).thenAccept(response -> {
        if (response.success) {
            // Apply buffs from new cat
            buffManager.applyBuffsFromCat(player, response.newActiveCat);

            // Spawn new cat entity
            catCollectionManager.setActiveCat(player, catName);

            player.sendMessage("§aActive cat: " + catName);
            player.sendMessage("§7Buffs updated!");
        }
    });

    return true;
}
```

**Add `/deletecat <name>` command:**
```java
public class DeleteCatCommand implements CommandExecutor {
    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        Player player = (Player) sender;

        if (args.length == 0) {
            player.sendMessage("§cUsage: /deletecat <catname>");
            return true;
        }

        String catName = String.join(" ", args);
        int tokenId = catCollectionManager.getCatTokenId(player, catName);

        if (tokenId == -1) {
            player.sendMessage("§cCat not found");
            return true;
        }

        // Confirmation
        player.sendMessage("§cAre you sure you want to delete " + catName + "?");
        player.sendMessage("§c/confirmdelete to confirm (30 sec timeout)");

        pendingDeletions.put(player.getUniqueId(), tokenId);

        Bukkit.getScheduler().runTaskLater(plugin, () -> {
            pendingDeletions.remove(player.getUniqueId());
        }, 600L); // 30 sec

        return true;
    }
}

public class ConfirmDeleteCommand implements CommandExecutor {
    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        Player player = (Player) sender;
        Integer tokenId = pendingDeletions.remove(player.getUniqueId());

        if (tokenId == null) {
            player.sendMessage("§cNo pending deletion");
            return true;
        }

        String wallet = walletManager.getWallet(player.getUniqueId());

        apiClient.deleteCat(tokenId, wallet).thenAccept(response -> {
            if (response.success) {
                player.sendMessage("§aCat deleted");
                catCollectionManager.removeCat(player, tokenId);
            } else {
                player.sendMessage("§cFailed to delete: " + response.error);
            }
        });

        return true;
    }
}
```

**Tasks:**
- [ ] Create `GET /api/player/{wallet}/inventory` endpoint
- [ ] Create `POST /api/player/setactive` endpoint
- [ ] Create `DELETE /api/cat/{tokenId}` endpoint
- [ ] Update `/choosecat` to apply buffs when switching
- [ ] Add `/deletecat <name>` command
- [ ] Add `/confirmdelete` command with 30-sec timeout
- [ ] Update `/mycats` to show cooldown timers
- [ ] Show rarity scores in `/mycats` output

---

### 9. Implement Cat Mortality System
**Update Smart Contract:**

```solidity
// Add burn function for genesis cats
function burnCat(uint256 tokenId) external onlyOwner {
    require(cats[tokenId].dna.isGenesis, "Only genesis cats can be burned");
    address owner = _ownerOf(tokenId);
    _burn(tokenId);
    emit CatDied(tokenId, owner, block.timestamp);
}

event CatDied(uint256 indexed tokenId, address indexed owner, uint256 timestamp);
```

**Update Minecraft Plugin:**

**Add to CatCollectionManager.java:**
```java
public void makeGenesisVulnerable(Cat catEntity) {
    // Genesis cats can take damage
    catEntity.setInvulnerable(false);
    catEntity.setHealth(10.0); // 5 hearts
}

public void makeBredInvulnerable(Cat catEntity) {
    // Bred cats are immortal
    catEntity.setInvulnerable(true);
    catEntity.setRemoveWhenFarAway(false);
}
```

**Add listener for cat death:**
```java
public class CatDeathListener implements Listener {

    @EventHandler
    public void onEntityDeath(EntityDeathEvent event) {
        if (!(event.getEntity() instanceof Cat)) return;

        Cat cat = (Cat) event.getEntity();

        // Check if it's a BlockCat
        if (!spawnManager.isBlockCat(cat.getUniqueId())) return;

        // Get owner
        UUID ownerId = cat.getOwner();
        if (ownerId == null) return;

        Player owner = Bukkit.getPlayer(ownerId);
        int tokenId = catCollectionManager.getCatTokenId(owner, cat);

        // Call API to burn NFT
        String wallet = walletManager.getWallet(ownerId);
        apiClient.burnCat(tokenId, wallet).thenAccept(response -> {
            if (response.success) {
                if (owner != null) {
                    owner.sendMessage("§c§lYour cat died and was burned!");
                    owner.sendMessage("§7NFT permanently destroyed");
                }

                // Remove from collection
                catCollectionManager.removeCat(owner, tokenId);

                // Remove buffs if it was active cat
                if (catCollectionManager.isActiveCat(owner, tokenId)) {
                    buffManager.clearBuffs(owner);
                }
            }
        });
    }
}
```

**Add backend endpoint:**

**POST /api/cat/burn**
```typescript
interface BurnRequest {
  tokenId: number;
  ownerWallet: string;
}

export async function POST(request: Request) {
  const { tokenId, ownerWallet } = await request.json();

  // 1. Verify it's genesis
  const cat = await db.cats.findUnique({ where: { tokenId } });
  if (!cat || !cat.isGenesis) {
    return NextResponse.json({ success: false, error: 'Only genesis cats can be burned' });
  }

  // 2. Verify ownership
  if (cat.owner.toLowerCase() !== ownerWallet.toLowerCase()) {
    return NextResponse.json({ success: false, error: 'Not your cat' });
  }

  // 3. Burn on blockchain
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  const tx = await contract.burnCat(tokenId);
  await tx.wait();

  // 4. Remove from database
  await db.cats.delete({ where: { tokenId } });

  return NextResponse.json({
    success: true,
    transactionHash: tx.hash
  });
}
```

**Tasks:**
- [ ] Add `burnCat()` function to smart contract
- [ ] Add `CatDied` event to smart contract
- [ ] Redeploy contract with burn functionality
- [ ] Create `CatDeathListener.java` to handle entity death
- [ ] Make genesis cats vulnerable (`setInvulnerable(false)`)
- [ ] Make bred cats invulnerable (`setInvulnerable(true)`)
- [ ] Create `POST /api/cat/burn` endpoint
- [ ] Clear player buffs when active cat dies

---

### 10. Add IPFS/Pinata Integration
**Install Dependencies:**
```bash
npm install pinata-web3
```

**Create IPFS Utility:**

**File:** `web/src/lib/ipfs.ts`
```typescript
import { PinataSDK } from "pinata-web3";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL!
});

export async function uploadMetadataToIPFS(metadata: {
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: number | string }>;
}) {
  const upload = await pinata.upload.json(metadata);
  const ipfsUrl = `ipfs://${upload.IpfsHash}`;
  return ipfsUrl;
}

export async function uploadImageToIPFS(imageBuffer: Buffer) {
  const file = new File([imageBuffer], "cat.png", { type: "image/png" });
  const upload = await pinata.upload.file(file);
  const ipfsUrl = `ipfs://${upload.IpfsHash}`;
  return ipfsUrl;
}
```

**Create Cat Image Generator:**

**File:** `web/src/lib/generateCatImage.ts`
```typescript
export async function generateCatImage(dna: {
  variant: number;
  collarColor: number;
  speed: number;
  strength: number;
  defense: number;
  regen: number;
  luck: number;
}) {
  // Use DiceBear API to generate unique cat avatar
  const seed = `${dna.variant}-${dna.collarColor}-${dna.speed}-${dna.strength}`;
  const url = `https://api.dicebear.com/7.x/lorelei/png?seed=${seed}&backgroundColor=${getColorHex(dna.collarColor)}`;

  const response = await fetch(url);
  const imageBuffer = Buffer.from(await response.arrayBuffer());

  return imageBuffer;
}

function getColorHex(collarColor: number): string {
  const colors = [
    'ffffff', // White
    'ff9900', // Orange
    'cc00cc', // Magenta
    '6699ff', // Light Blue
    'ffff00', // Yellow
    '00ff00', // Lime
    'ff99cc', // Pink
    '333333', // Gray
    '999999', // Light Gray
    '00ffff', // Cyan
    '9900cc', // Purple
    '0000ff', // Blue
    '663300', // Brown
    '00ff00', // Green
    'ff0000', // Red
    '000000'  // Black
  ];
  return colors[collarColor] || 'ffffff';
}
```

**Update Claim Endpoint:**
```typescript
// In web/src/app/api/minecraft/claim/route.ts

import { uploadMetadataToIPFS, uploadImageToIPFS } from '@/lib/ipfs';
import { generateCatImage } from '@/lib/generateCatImage';

// Generate cat image
const imageBuffer = await generateCatImage(parsedDNA);

// Upload image to IPFS
const imageURI = await uploadImageToIPFS(imageBuffer);

// Create metadata
const metadata = {
  name: catName,
  description: `BlockCat #${tokenId} - Gen ${generation}`,
  image: imageURI,
  attributes: [
    { trait_type: 'Variant', value: parsedDNA.variant },
    { trait_type: 'Collar Color', value: parsedDNA.collarColor },
    { trait_type: 'Speed', value: parsedDNA.speed },
    { trait_type: 'Strength', value: parsedDNA.strength },
    { trait_type: 'Defense', value: parsedDNA.defense },
    { trait_type: 'Regen', value: parsedDNA.regen },
    { trait_type: 'Luck', value: parsedDNA.luck },
    { trait_type: 'Generation', value: generation },
    { trait_type: 'Rarity Score', value: rarityScore }
  ]
};

// Upload metadata to IPFS
const metadataURI = await uploadMetadataToIPFS(metadata);

// NOW mint with real IPFS URI
const tx = await contract.mintCat(wallet, dna, seed, metadataURI, parents);
```

**Environment Variables:**
```env
# .env.local
PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_GATEWAY_URL=your_pinata_gateway_url
```

**Tasks:**
- [ ] Sign up for Pinata account
- [ ] Get Pinata JWT token
- [ ] Add `PINATA_JWT` to `.env.local`
- [ ] Create `lib/ipfs.ts` utility
- [ ] Create `lib/generateCatImage.ts` utility
- [ ] Update claim endpoint to upload image + metadata to IPFS
- [ ] Remove placeholder metadata URIs
- [ ] Test IPFS uploads work before minting

---

### 11. Create Kyrgyz Name Generator
**File:** `web/src/lib/generateKyrgyzName.ts`

```typescript
const KYRGYZ_NAMES = {
  common: ['Boz', 'Kara', 'Ak', 'Sary', 'Kyzyl'],
  uncommon: ['Tengri', 'Issyk', 'Naryn', 'Asman', 'Bermet'],
  rare: ['Cholpon', 'Altynai', 'Dinara', 'Sanjar', 'Kubat'],
  legendary: ['Ala-Too', 'Manas', 'Kurmanjan', 'Toktogul']
};

const SUFFIXES = [
  'Paws', 'Shadow', 'Runner', 'Flame', 'Hunter',
  'Stripes', 'Eyes', 'Jumper', 'Tail', 'Whiskers',
  'Storm', 'Thunder', 'Lightning', 'Frost', 'Blaze'
];

export function generateKyrgyzName(rarityScore: number, tokenId: number): string {
  const tier = rarityScore >= 40 ? 'legendary' :
               rarityScore >= 30 ? 'rare' :
               rarityScore >= 20 ? 'uncommon' : 'common';

  const baseName = KYRGYZ_NAMES[tier][tokenId % KYRGYZ_NAMES[tier].length];
  const suffix = SUFFIXES[tokenId % SUFFIXES.length];

  return `${baseName} ${suffix} #${tokenId}`;
}

// Examples:
// Genesis (score 17): "Boz Paws #1"
// Gen 4 (score 35): "Altynai Runner #23"
// Gen 8 (score 48): "Ala-Too Thunder #42"
```

**Use in Claim Endpoint:**
```typescript
const rarityScore = dna.speed + dna.strength + dna.defense + dna.regen + dna.luck;
const catName = generateKyrgyzName(rarityScore, tokenId);
```

**Tasks:**
- [ ] Create `lib/generateKyrgyzName.ts`
- [ ] Use in claim endpoint for genesis cats
- [ ] Use in battle result endpoint for bred cats
- [ ] Add name meanings to metadata description

---

### 12. Frontend Gallery Implementation
**Current Status:** Basic Next.js app, no gallery

**Required Components:**

**File:** `web/src/app/gallery/page.tsx`
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface Cat {
  tokenId: number;
  name: string;
  stats: {
    speed: number;
    strength: number;
    defense: number;
    regen: number;
    luck: number;
  };
  generation: number;
  rarityScore: number;
  isActive: boolean;
  cooldownUntil: string | null;
  canBattle: boolean;
  isGenesis: boolean;
  metadataURI: string;
}

export default function GalleryPage() {
  const { address } = useAccount();
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      loadCats();
    }
  }, [address]);

  const loadCats = async () => {
    setLoading(true);
    const response = await fetch(`/api/player/${address}/inventory`);
    const data = await response.json();
    setCats(data.cats);
    setLoading(false);
  };

  const setActiveCat = async (tokenId: number) => {
    const response = await fetch('/api/player/setactive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerWallet: address, tokenId })
    });
    const data = await response.json();
    if (data.success) {
      loadCats(); // Reload
    }
  };

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Connect Your Wallet</h1>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My BlockCats ({cats.length}/5)</h1>
        <ConnectButton />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : cats.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>No cats yet. Go tame some in Minecraft!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cats.map((cat) => (
            <div key={cat.tokenId} className={`border rounded-lg p-6 ${cat.isActive ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'}`}>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{cat.name}</h2>
                {cat.isActive && <span className="bg-yellow-500 text-white px-2 py-1 rounded text-sm">Active</span>}
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-600">
                  Gen {cat.generation} • {cat.isGenesis ? 'Genesis' : 'Bred'} • Score: {cat.rarityScore}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <StatBar label="Speed" value={cat.stats.speed} />
                <StatBar label="Strength" value={cat.stats.strength} />
                <StatBar label="Defense" value={cat.stats.defense} />
                <StatBar label="Regen" value={cat.stats.regen} />
                <StatBar label="Luck" value={cat.stats.luck} />
              </div>

              {cat.cooldownUntil && (
                <div className="text-red-500 text-sm mb-4">
                  On cooldown until {new Date(cat.cooldownUntil).toLocaleString()}
                </div>
              )}

              {!cat.isActive && (
                <button
                  onClick={() => setActiveCat(cat.tokenId)}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  Set as Active
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}
```

**Install Web3 Dependencies:**
```bash
npm install wagmi viem@2.x @tanstack/react-query
npm install @rainbow-me/rainbowkit
```

**Configure wagmi:**

**File:** `web/src/app/providers.tsx`
```typescript
'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

const config = createConfig({
  chains: [polygonAmoy],
  transports: {
    [polygonAmoy.id]: http()
  }
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

**Update root layout:**

**File:** `web/src/app/layout.tsx`
```typescript
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**Tasks:**
- [ ] Install wagmi, viem, RainbowKit dependencies
- [ ] Create `providers.tsx` with Web3 config
- [ ] Update root layout to wrap app in providers
- [ ] Create `gallery/page.tsx` with cat gallery UI
- [ ] Add stat bars to show cat stats visually
- [ ] Add "Set as Active" button for each cat
- [ ] Show active cat with yellow highlight
- [ ] Display cooldown timers
- [ ] Add delete cat functionality to UI

---

## 📋 SUMMARY: Critical Path to Completion

### Phase 1: Fix Mock Data (HIGH PRIORITY)
1. ✅ Remove fallback simulation in claim endpoint
2. ✅ Fix spawn endpoint to check real daily limits
3. ✅ Implement database layer (Prisma + Supabase)
4. ✅ Add IPFS/Pinata integration
5. ✅ Generate real cat images
6. ✅ Store minted cats in database

**Estimated Time:** 4-6 hours

---

### Phase 2: Breeding System (CORE FEATURE)
1. ✅ Add breeding algorithm to smart contract
2. ✅ Add generation + isGenesis to DNA struct
3. ✅ Add cooldown system to smart contract
4. ✅ Redeploy contract
5. ✅ Create battle endpoints (challenge/accept/result)
6. ✅ Implement Minecraft battle system
7. ✅ Add buff system

**Estimated Time:** 8-10 hours

---

### Phase 3: Inventory & Mortality (IMPORTANT)
1. ✅ Implement 5-cat inventory limit
2. ✅ Auto-delete weakest cat logic
3. ✅ Genesis cat mortality (burn on death)
4. ✅ Bred cat invulnerability
5. ✅ `/deletecat` command

**Estimated Time:** 3-4 hours

---

### Phase 4: Frontend Gallery (NICE TO HAVE)
1. ✅ Install Web3 dependencies
2. ✅ Configure wagmi + RainbowKit
3. ✅ Build gallery page
4. ✅ Add wallet connection
5. ✅ Display cats with stats

**Estimated Time:** 3-4 hours

---

## 🎯 TOTAL TIME TO COMPLETION: 18-24 hours

---

## 🚀 Quick Win: Minimum Viable Product (MVP)

If time is limited, focus on **Phase 1 + Phase 2** only:

### MVP Checklist
- [ ] Fix spawn endpoint (real limits)
- [ ] Fix claim endpoint (no fallback)
- [ ] Add database
- [ ] Add IPFS uploads
- [ ] Add breeding to smart contract
- [ ] Deploy updated contract
- [ ] Create battle endpoints
- [ ] Add Minecraft battle commands
- [ ] Add buff system

**MVP Time: 12-16 hours**

---

## 📝 Testing Plan

### Test 1: Real Blockchain Integration
```
1. Genesis cat spawns in Minecraft
2. Player tames it
3. Backend calls REAL contract.mintCat()
4. IPFS metadata uploaded
5. NFT appears on PolygonScan
6. Player sees cat in /mycats
```

### Test 2: First Breeding Battle
```
1. Two players with genesis cats
2. Player A challenges Player B
3. Both accept and teleport to arena
4. Buffs applied (visible effects)
5. Player A wins (kills Player B)
6. Backend calls contract.breedCats()
7. Child cat minted to Player A
8. Player B's cat on 24h cooldown
9. Child stats higher than parents
```

### Test 3: Inventory Full Auto-Delete
```
1. Player has 5 cats (scores: 15, 18, 22, 28, 35)
2. Player wins breeding battle
3. New cat score: 42
4. Backend auto-deletes cat with score 15
5. New cat added to inventory
6. Player notified
```

### Test 4: Genesis Cat Death
```
1. Player has genesis cat as active
2. Cat dies to lava
3. Backend calls contract.burnCat()
4. NFT burned on blockchain
5. Cat removed from collection
6. Player loses buffs
```

---

## 🔧 Environment Setup Checklist

- [ ] Supabase account created
- [ ] Database tables created (Prisma migrate)
- [ ] Pinata account created
- [ ] `PINATA_JWT` added to `.env.local`
- [ ] `DATABASE_URL` added to `.env.local`
- [ ] Updated contract deployed to Polygon Amoy
- [ ] New contract address in `.env.local`
- [ ] Plugin `config.yml` updated with API URL
- [ ] All dependencies installed (`npm install`)

---

## 📚 Documentation Needs

- [ ] Update README with new features
- [ ] Document battle system commands
- [ ] Document buff tiers and effects
- [ ] Update API documentation
- [ ] Add breeding algorithm explanation
- [ ] Add game mechanics guide

---

**END OF TODO LIST**
