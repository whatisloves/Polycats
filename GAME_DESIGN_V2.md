# BlockCats - Game Design v2.0

## Core Concept

**Competitive cat breeding through PvP skill + genetics**

Cats grant passive combat buffs to their owners. Better stats = stronger buffs = PvP advantage. Players battle each other to breed superior offspring, creating generational dynasties.

---

## Cat Buff System (Core Mechanic)

### Active Cat = Passive Buffs

When a cat is set as "active", it follows the player and grants **permanent buffs based on its stats**:

```
Speed 1-3     → Speed I
Speed 4-6     → Speed I
Speed 7-9     → Speed II
Speed 10      → Speed II + Jump Boost I

Strength 1-3  → No buff
Strength 4-6  → Strength I
Strength 7-9  → Strength II
Strength 10   → Strength II

Defense 1-3   → No buff
Defense 4-6   → Resistance I
Defense 7-9   → Resistance II
Defense 10    → Resistance II + extra hearts

Regen 1-3     → No buff
Regen 4-6     → Regeneration I
Regen 7-9     → Regeneration II
Regen 10      → Regeneration II

Luck 1-3      → No buff
Luck 4-6      → Luck I (better loot)
Luck 7-9      → Luck II
Luck 10       → Luck II + Fortune II
```

**Example:**
```
Genesis Cat: [Speed 3, Strength 4, Defense 2, Regen 5, Luck 3]
→ Owner gets: Speed I + Strength I + Regeneration I

Gen 8 Champion: [Speed 10, Strength 10, Defense 10, Regen 10, Luck 10]
→ Owner gets: ALL max buffs (godmode in PvP)
```

**This makes cats VALUABLE in PvP battles!**

---

## Cat Tiers

### Genesis Cats (Gen 0)

**Source:** Server timer-spawned
**Spawn Rate:** 10 per day (global limit)
**Stats Range:** 1-5 per stat (random)
**Average Stats:** [3, 3, 3, 3, 3] = score 15
**Mortality:** Killable (death = NFT burned)
**Buffs:** Weak (Speed I, maybe one Strength I)
**Purpose:** Entry-level cats, breeding fodder

**Example Genesis:**
```
Name: "Boz Paws #1"
Stats: [3, 4, 2, 5, 3]
Rarity Score: 17
Generation: 0
Buffs: Speed I, Strength I, Regeneration I
```

### Bred Cats (Gen 1+)

**Source:** Won from PvP breeding battles
**Stats Range:** Inherited via breeding algorithm (progressive)
**Generation:** parent_max_gen + 1
**Mortality:** Immortal (invulnerable)
**Buffs:** Strong (multiple tier II buffs)
**Purpose:** Competitive advantage, dynasty building

**Example Gen 4 Bred:**
```
Name: "Altynai Runner #23"
Stats: [7, 8, 7, 8, 7]
Rarity Score: 37
Generation: 4
Buffs: Speed II, Strength II, Resistance II, Regen II, Luck II
```

**Example Gen 8 Champion:**
```
Name: "Ala-Too Thunderborn #42"
Stats: [10, 10, 9, 10, 9]
Rarity Score: 48
Generation: 8
Buffs: ALL max buffs (near godmode)
```

---

## Breeding Algorithm (Deterministic Hash-Based)

### Solidity Implementation

```solidity
function breedStat(
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
    uint256 seed = uint256(keccak256(abi.encode(
        parent1Id,
        parent2Id,
        statIndex
    )));
    uint256 roll = seed % 100;

    int8 mutation = 0;
    if (roll < 5) mutation = -1;       // 5% chance: -1
    else if (roll < 25) mutation = 0;   // 20% chance: +0
    else if (roll < 65) mutation = 1;   // 40% chance: +1
    else mutation = 2;                  // 35% chance: +2

    // 3. Generational bonus (every 2 generations adds +1)
    uint8 maxGen = parent1Generation > parent2Generation
        ? parent1Generation
        : parent2Generation;
    uint8 generationalBonus = maxGen / 2;

    // 4. Calculate final stat
    int16 result = int16(int8(baseValue))
                 + int16(mutation)
                 + int16(generationalBonus);

    // 5. Clamp to 1-10
    if (result < 1) return 1;
    if (result > 10) return 10;
    return uint8(uint16(result));
}

function breedCats(uint256 parent1Id, uint256 parent2Id)
    internal pure returns (uint8[5] memory childStats) {

    CatStats memory p1 = catStats[parent1Id];
    CatStats memory p2 = catStats[parent2Id];

    childStats[0] = breedStat(parent1Id, parent2Id, p1.speed, p2.speed, 0, p1.generation, p2.generation);
    childStats[1] = breedStat(parent1Id, parent2Id, p1.strength, p2.strength, 1, p1.generation, p2.generation);
    childStats[2] = breedStat(parent1Id, parent2Id, p1.defense, p2.defense, 2, p1.generation, p2.generation);
    childStats[3] = breedStat(parent1Id, parent2Id, p1.regen, p2.regen, 3, p1.generation, p2.generation);
    childStats[4] = breedStat(parent1Id, parent2Id, p1.luck, p2.luck, 4, p1.generation, p2.generation);

    return childStats;
}
```

### Key Properties

✅ **Deterministic:** Same parent IDs always produce same child
✅ **Unpredictable:** Players can't predict result without breeding
✅ **Progressive:** 75% weighted toward improvement (40% +1, 35% +2)
✅ **Balanced:** ~8 generations to reach max stats (10/10/10/10/10)
✅ **Strategic:** Choose breeding partners wisely for best offspring

### Stat Progression Example

```
Gen 0 (Genesis):
Parent A: [3, 4, 2, 5, 3] (score 17)
Parent B: [4, 3, 5, 2, 4] (score 18)
→ Child: [4, 5, 4, 5, 5] (score 23, gen 1)

Gen 1 × Gen 1:
Parent A: [4, 5, 4, 5, 5] (score 23)
Parent B: [5, 4, 5, 4, 4] (score 22)
→ Child: [6, 6, 5, 6, 6] (score 29, gen 2, +1 bonus)

Gen 4 × Gen 4:
Parent A: [7, 8, 7, 8, 7] (score 37)
Parent B: [8, 7, 8, 7, 8] (score 38)
→ Child: [9, 9, 9, 9, 9] (score 45, gen 5, +2 bonus)

Gen 8 × Gen 8:
Parent A: [9, 10, 9, 10, 9] (score 47)
Parent B: [10, 9, 10, 9, 10] (score 48)
→ Child: [10, 10, 10, 10, 10] (score 50, gen 9, +4 bonus)
```

**~8 generations to reach perfect cat**

---

## Player Inventory System

### Constraints

- **Max Cats:** 5 per player (hard cap)
- **Active Cat:** 1 (follows player, grants buffs)
- **Stored Cats:** 4 (inactive, no buffs)

### Commands

```
/inventory
  → Shows all 5 cats with stats + rarity scores

/setactive <catname>
  → Switches active cat
  → Previous cat becomes stored
  → New cat teleports to player
  → Buffs update immediately

/deletecat <catname>
  → Permanently deletes cat (burns NFT)
  → Frees inventory slot
  → Confirmation required

/catstats [catname]
  → Shows detailed stats
  → If no name, shows active cat
```

### Auto-Delete on Full Inventory

**When player wins breeding battle with 5/5 cats:**

```
1. Calculate rarity scores of all 5 cats
2. Find cat with lowest score
3. Auto-delete weakest cat (burn NFT)
4. Add new bred cat to inventory
5. Notify player:
   "Deleted [Boz Paws #1] (score 17) to make room for [Altynai Runner #23] (score 37)"
```

**Player can prevent by deleting cat before battle**

---

## PvP Breeding Battle System

### Challenge Flow

```
Player A: /challenge @PlayerB breeding

→ PlayerB receives notification:
  "PlayerA challenged you to a breeding battle!
   Their cat: [Tengri Shadow #5] (score 25)
   Your active cat: [Sary Runner #3] (score 22)
   /accept or /decline (30 sec timeout)"

Player B: /accept

→ Both teleported to battle arena
→ Both active cats teleport with owners
→ 5-minute countdown starts
→ PvP combat begins (swords, bows, armor)
```

### Battle Rules

**Combat Mechanics:**
- Standard Minecraft PvP
- Active cats follow owners within 5 blocks
- Cats grant buffs continuously
- No external help (team fights)
- Arena locked (can't escape)
- No items from outside allowed

**Win Conditions:**
```
Opponent dies       → You win
Opponent quits game → You win (forfeit)
5 min timer expires → Draw (no winner, no breeding)
```

**Battle Arena:**
```
50×50 enclosed platform
Lava moat around edges
Weapon chests at spawn points
Spectator stands (optional)
```

### Battle Outcomes

**Winner:**
```
1. Gets new bred cat (child of both active cats)
2. Child stats calculated via breeding algorithm
3. Child generation = max(parent_gen) + 1
4. If inventory full (5/5):
   → Weakest cat auto-deleted
   → New cat added
5. Gains XP/reputation points
6. Can battle again immediately
```

**Loser:**
```
1. Keeps active cat (no loss)
2. Cat enters 24-hour cooldown:
   → Can't be used in battles
   → Can still be active for buffs
   → Cooldown timer shown in /inventory
3. Gets small consolation reward (XP, items)
4. Can battle with different cat immediately
```

**Draw (Timeout):**
```
1. No winner declared
2. No breeding occurs
3. Both keep cats (no cooldown)
4. Can retry immediately
5. Refund any entry fees (if implemented)
```

---

## Cat Mortality & Immortality

### Genesis Cats (Killable)

**Death Scenarios:**
```
- Environmental damage (lava, fall, drowning)
- Player kills cat (accident or grief)
- Mob kills cat
- Any Minecraft damage source
```

**On Death:**
```solidity
// Smart contract
emit CatDied(tokenId, owner, timestamp);
_burn(tokenId); // NFT permanently destroyed

// Backend
removeFromInventory(ownerWallet, tokenId);
if (tokenId == activeCatId) {
    clearActiveCat(ownerWallet);
}

// Plugin
notifyPlayer("Your cat [Name] died and was burned!");
```

**Why Killable?**
- Creates risk for low-tier cats
- Encourages players to breed better cats
- Deflationary pressure (scarcity)
- Makes bred cats more valuable

### Bred Cats (Immortal)

```java
// Plugin code
if (!cat.isGenesis()) {
    cat.setInvulnerable(true); // Cannot take damage
    cat.setRemoveWhenFarAway(false); // Never despawns
}
```

**Why Immortal?**
- Protects player investment
- Prevents accidental loss of high-value NFTs
- Encourages long-term breeding strategy
- Rewards PvP skill with permanent assets

---

## Smart Contract Specification

### Contract Structure

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BlockCatsNFT is ERC721URIStorage, Ownable {

    struct CatStats {
        uint8 speed;        // 1-10
        uint8 strength;     // 1-10
        uint8 defense;      // 1-10
        uint8 regen;        // 1-10
        uint8 luck;         // 1-10
        uint8 generation;   // 0 = genesis, 1+ = bred
        bool isGenesis;     // true = killable, false = immortal
        uint256 parent1Id;  // 0 if genesis
        uint256 parent2Id;  // 0 if genesis
        uint256 cooldownUntil; // timestamp (0 = can battle)
    }

    mapping(uint256 => CatStats) public catStats;
    uint256 private _nextTokenId;

    event CatMinted(uint256 indexed tokenId, address indexed owner, bool isGenesis, uint8 generation);
    event CatBred(uint256 indexed childId, uint256 indexed parent1Id, uint256 indexed parent2Id);
    event CatDied(uint256 indexed tokenId, address indexed owner, uint256 timestamp);
    event CooldownSet(uint256 indexed tokenId, uint256 cooldownUntil);

    constructor() ERC721("BlockCats", "BCAT") Ownable(msg.sender) {}

    // Mint genesis cat
    function mintGenesisCat(
        address to,
        string memory metadataURI,
        uint8[5] memory stats // [speed, strength, defense, regen, luck]
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        catStats[tokenId] = CatStats({
            speed: stats[0],
            strength: stats[1],
            defense: stats[2],
            regen: stats[3],
            luck: stats[4],
            generation: 0,
            isGenesis: true,
            parent1Id: 0,
            parent2Id: 0,
            cooldownUntil: 0
        });

        emit CatMinted(tokenId, to, true, 0);
        return tokenId;
    }

    // Breed cats (called by backend after PvP battle)
    function breedCats(
        uint256 parent1Id,
        uint256 parent2Id,
        address winner,
        string memory metadataURI
    ) external onlyOwner returns (uint256) {
        require(_ownerOf(parent1Id) != address(0), "Parent 1 doesn't exist");
        require(_ownerOf(parent2Id) != address(0), "Parent 2 doesn't exist");

        CatStats memory p1 = catStats[parent1Id];
        CatStats memory p2 = catStats[parent2Id];

        // Calculate child stats using breeding algorithm
        uint8[5] memory childStats;
        childStats[0] = breedStat(parent1Id, parent2Id, p1.speed, p2.speed, 0, p1.generation, p2.generation);
        childStats[1] = breedStat(parent1Id, parent2Id, p1.strength, p2.strength, 1, p1.generation, p2.generation);
        childStats[2] = breedStat(parent1Id, parent2Id, p1.defense, p2.defense, 2, p1.generation, p2.generation);
        childStats[3] = breedStat(parent1Id, parent2Id, p1.regen, p2.regen, 3, p1.generation, p2.generation);
        childStats[4] = breedStat(parent1Id, parent2Id, p1.luck, p2.luck, 4, p1.generation, p2.generation);

        uint8 childGeneration = (p1.generation > p2.generation ? p1.generation : p2.generation) + 1;

        uint256 childId = _nextTokenId++;
        _safeMint(winner, childId);
        _setTokenURI(childId, metadataURI);

        catStats[childId] = CatStats({
            speed: childStats[0],
            strength: childStats[1],
            defense: childStats[2],
            regen: childStats[3],
            luck: childStats[4],
            generation: childGeneration,
            isGenesis: false,
            parent1Id: parent1Id,
            parent2Id: parent2Id,
            cooldownUntil: 0
        });

        emit CatBred(childId, parent1Id, parent2Id);
        emit CatMinted(childId, winner, false, childGeneration);
        return childId;
    }

    // Breeding algorithm (EXACT implementation)
    function breedStat(
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

    // Set cooldown (called after losing battle)
    function setCooldown(uint256 tokenId, uint256 duration) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Cat doesn't exist");
        catStats[tokenId].cooldownUntil = block.timestamp + duration;
        emit CooldownSet(tokenId, catStats[tokenId].cooldownUntil);
    }

    // Check if cat can battle
    function canBattle(uint256 tokenId) public view returns (bool) {
        return block.timestamp >= catStats[tokenId].cooldownUntil;
    }

    // Burn cat (genesis cat death)
    function burnCat(uint256 tokenId) external onlyOwner {
        require(catStats[tokenId].isGenesis, "Only genesis cats can be burned");
        address owner = _ownerOf(tokenId);
        _burn(tokenId);
        emit CatDied(tokenId, owner, block.timestamp);
    }

    // Get rarity score
    function getRarityScore(uint256 tokenId) public view returns (uint8) {
        CatStats memory stats = catStats[tokenId];
        return stats.speed + stats.strength + stats.defense + stats.regen + stats.luck;
    }

    // Get cat info
    function getCatInfo(uint256 tokenId) public view returns (CatStats memory) {
        return catStats[tokenId];
    }
}
```

---

## Backend API Endpoints

### Battle System

**POST /api/battle/challenge**
```typescript
Request: {
  challenger: "0x123...",      // challenger wallet
  challenged: "0x456...",      // challenged wallet
  challengerCatId: 1,          // active cat tokenId
  challengedCatId: 2           // active cat tokenId
}

Response: {
  success: boolean,
  battleId: number,
  arenaLocation: { x: number, y: number, z: number },
  expiresAt: string            // timestamp (30 sec to accept)
}

Logic:
1. Verify both cats exist and are owned by correct players
2. Check neither cat is on cooldown
3. Check both players have space (or can auto-delete)
4. Create pending battle in database
5. Return arena spawn coordinates
```

**POST /api/battle/accept**
```typescript
Request: {
  battleId: number,
  accepter: "0x456..."
}

Response: {
  success: boolean,
  startTime: string,
  arena: { x, y, z }
}

Logic:
1. Verify battle is still pending (not expired)
2. Mark battle as IN_PROGRESS
3. Set 5-min timer
4. Return arena coordinates for teleport
```

**POST /api/battle/result**
```typescript
Request: {
  battleId: number,
  winner: "0x123...",
  loser: "0x456...",
  reason: "death" | "quit" | "timeout"
}

Response: {
  success: boolean,
  childTokenId?: number,       // if reason != timeout
  childStats?: {...},
  childName?: string,
  transactionHash?: string,
  deletedCatId?: number        // if winner inventory was full
}

Logic (if not timeout):
1. Get both parent cats from contract
2. Run breeding algorithm for each stat
3. Calculate child generation (max + 1)
4. Generate child DNA + Kyrgyz name
5. Upload metadata to IPFS
6. Call contract.breedCats(parent1Id, parent2Id, winner, metadataURI)
7. Check winner inventory:
   - If 5/5: find weakest cat, burn it, add child
   - Else: just add child
8. Call contract.setCooldown(loserCatId, 24h)
9. Update battle status to COMPLETED
10. Return child info + tx hash
```

### Inventory Management

**GET /api/player/{wallet}/inventory**
```typescript
Response: {
  cats: [
    {
      tokenId: number,
      name: string,
      stats: { speed, strength, defense, regen, luck },
      generation: number,
      rarityScore: number,
      isActive: boolean,
      cooldownUntil: string | null,
      canBattle: boolean,
      isGenesis: boolean
    }
  ],
  activeCatId: number | null,
  count: number,
  maxCount: 5
}

Logic:
1. Query contract for all NFTs owned by wallet
2. Get stats for each from contract.getCatInfo()
3. Check database for which is active
4. Calculate rarity scores
5. Check cooldowns
6. Return full inventory data
```

**POST /api/player/setactive**
```typescript
Request: {
  playerWallet: string,
  tokenId: number
}

Response: {
  success: boolean,
  previousActiveCatId: number | null,
  newActiveCat: { tokenId, name, stats }
}

Logic:
1. Verify ownership of tokenId
2. Update database: activeCat[wallet] = tokenId
3. Return previous and new active cat info
```

**DELETE /api/cat/{tokenId}**
```typescript
Request: {
  ownerWallet: string
}

Response: {
  success: boolean,
  transactionHash: string
}

Logic:
1. Verify ownership
2. Verify not active cat (must switch first)
3. Remove from inventory in database
4. If genesis: call contract.burnCat(tokenId)
5. If bred: just transfer to burn address (or keep immortal)
6. Return tx hash
```

### Genesis Spawning

**POST /api/minecraft/spawn** *(already implemented)*
```typescript
// Keep existing implementation
// Just ensure genesis stats are 1-5 range
```

**POST /api/minecraft/claim** *(update for genesis)*
```typescript
// Modify to mint genesis cats with random 1-5 stats
// Set isGenesis = true
// Set generation = 0
```

---

## Minecraft Plugin Implementation

### New Commands

```java
/challenge @player breeding
  → Initiates PvP breeding challenge
  → Calls POST /api/battle/challenge
  → Shows both cats' stats

/accept
  → Accepts pending challenge
  → Calls POST /api/battle/accept
  → Teleports both to arena

/decline
  → Declines challenge
  → Notifies challenger

/inventory
  → Shows all 5 cats with:
    - Name
    - Stats
    - Rarity score
    - Active status
    - Cooldown (if any)

/setactive <catname>
  → Switches active cat
  → Calls POST /api/player/setactive
  → Removes old buffs
  → Applies new buffs
  → Teleports new cat to player

/deletecat <catname>
  → Confirms deletion
  → Calls DELETE /api/cat/{id}
  → Removes cat from game

/catstats [catname]
  → Shows detailed stats
  → Shows buffs granted
  → Shows generation + lineage
```

### Battle System Manager

```java
public class BattleManager {

    private Map<UUID, Battle> activeBattles = new HashMap<>();
    private Map<UUID, UUID> pendingChallenges = new HashMap<>();

    public void challengePlayer(Player challenger, Player challenged) {
        // 1. Get active cats for both
        int challengerCatId = getActiveCatId(challenger);
        int challengedCatId = getActiveCatId(challenged);

        // 2. Call API to create challenge
        ApiClient.createChallenge(
            challenger.getUniqueId(),
            challenged.getUniqueId(),
            challengerCatId,
            challengedCatId
        ).thenAccept(response -> {
            if (!response.success) {
                challenger.sendMessage("§cChallenge failed: " + response.error);
                return;
            }

            // 3. Store pending challenge
            pendingChallenges.put(challenged.getUniqueId(), challenger.getUniqueId());

            // 4. Notify both players
            String challengerCat = getCatName(challengerCatId);
            String challengedCat = getCatName(challengedCatId);

            challenger.sendMessage("§aChallenge sent to " + challenged.getName());
            challenged.sendMessage(
                "§6" + challenger.getName() + " challenged you to a breeding battle!\n" +
                "§eTheir cat: " + challengerCat + " vs Your cat: " + challengedCat + "\n" +
                "§a/accept §7or §c/decline §7(30 sec)"
            );

            // 5. Auto-cancel after 30 sec
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
        UUID challengerId = pendingChallenges.remove(accepter.getUniqueId());
        if (challengerId == null) {
            accepter.sendMessage("§cNo pending challenge");
            return;
        }

        Player challenger = Bukkit.getPlayer(challengerId);
        if (challenger == null) {
            accepter.sendMessage("§cChallenger is offline");
            return;
        }

        // Start battle
        startBattle(challenger, accepter);
    }

    private void startBattle(Player p1, Player p2) {
        // 1. Call API to start battle
        ApiClient.startBattle(battleId).thenAccept(response -> {
            // 2. Teleport both to arena
            Location arena = response.arenaLocation;
            p1.teleport(arena.clone().add(-5, 0, 0));
            p2.teleport(arena.clone().add(5, 0, 0));

            // 3. Spawn active cats
            Cat cat1 = spawnCatNearPlayer(p1, getActiveCatId(p1));
            Cat cat2 = spawnCatNearPlayer(p2, getActiveCatId(p2));

            // 4. Apply buffs
            applyBuffsFromCat(p1, cat1);
            applyBuffsFromCat(p2, cat2);

            // 5. Create battle object
            Battle battle = new Battle(p1, p2, cat1, cat2);
            activeBattles.put(p1.getUniqueId(), battle);
            activeBattles.put(p2.getUniqueId(), battle);

            // 6. Start 5-min timer
            battle.startTimer(300);

            // 7. Notify
            Bukkit.broadcastMessage("§6[BlockCats] §e" + p1.getName() + " vs " + p2.getName() + " breeding battle started!");
        });
    }

    @EventHandler
    public void onPlayerDeath(PlayerDeathEvent event) {
        Player loser = event.getEntity();
        Battle battle = activeBattles.get(loser.getUniqueId());

        if (battle == null) return;

        Player winner = battle.getOpponent(loser);

        // End battle
        battle.end(winner, loser, "death");
    }

    @EventHandler
    public void onPlayerQuit(PlayerQuitEvent event) {
        Battle battle = activeBattles.get(event.getPlayer().getUniqueId());

        if (battle == null) return;

        Player loser = event.getPlayer();
        Player winner = battle.getOpponent(loser);

        // End battle
        battle.end(winner, loser, "quit");
    }
}

class Battle {
    Player p1, p2;
    Cat cat1, cat2;
    long startTime;
    BukkitTask timer;

    void startTimer(int seconds) {
        timer = Bukkit.getScheduler().runTaskLater(plugin, () -> {
            // Timeout - draw
            end(null, null, "timeout");
        }, seconds * 20L);
    }

    void end(Player winner, Player loser, String reason) {
        timer.cancel();
        activeBattles.remove(p1.getUniqueId());
        activeBattles.remove(p2.getUniqueId());

        if (reason.equals("timeout")) {
            p1.sendMessage("§cBattle timed out - no winner");
            p2.sendMessage("§cBattle timed out - no winner");
            teleportPlayersBack();
            return;
        }

        // Call API with result
        ApiClient.reportBattleResult(battleId, winner.getUniqueId(), loser.getUniqueId(), reason)
            .thenAccept(result -> {
                if (result.success) {
                    winner.sendMessage("§aYou won! New cat: " + result.childName);
                    winner.sendMessage("§7Stats: " + result.childStats);

                    if (result.deletedCatId != null) {
                        winner.sendMessage("§e(Auto-deleted weakest cat to make room)");
                    }

                    loser.sendMessage("§cYou lost. Your cat is on cooldown for 24h");
                }

                teleportPlayersBack();
            });
    }

    Player getOpponent(Player player) {
        return player.equals(p1) ? p2 : p1;
    }
}
```

### Buff Application System

```java
public class BuffManager {

    public void applyBuffsFromCat(Player player, int catId) {
        // Get cat stats from API
        CatStats stats = apiClient.getCatStats(catId).join();

        // Remove existing buffs
        player.getActivePotionEffects().clear();

        // Apply buffs based on stats
        applySpeedBuff(player, stats.speed);
        applyStrengthBuff(player, stats.strength);
        applyDefenseBuff(player, stats.defense);
        applyRegenBuff(player, stats.regen);
        applyLuckBuff(player, stats.luck);
    }

    private void applySpeedBuff(Player p, int speed) {
        if (speed >= 7) {
            p.addPotionEffect(new PotionEffect(PotionEffectType.SPEED, 999999, 1)); // Speed II
            if (speed == 10) {
                p.addPotionEffect(new PotionEffect(PotionEffectType.JUMP, 999999, 0)); // Jump I
            }
        } else if (speed >= 4) {
            p.addPotionEffect(new PotionEffect(PotionEffectType.SPEED, 999999, 0)); // Speed I
        }
    }

    private void applyStrengthBuff(Player p, int strength) {
        if (strength >= 7) {
            p.addPotionEffect(new PotionEffect(PotionEffectType.INCREASE_DAMAGE, 999999, 1)); // Strength II
        } else if (strength >= 4) {
            p.addPotionEffect(new PotionEffect(PotionEffectType.INCREASE_DAMAGE, 999999, 0)); // Strength I
        }
    }

    private void applyDefenseBuff(Player p, int defense) {
        if (defense >= 7) {
            p.addPotionEffect(new PotionEffect(PotionEffectType.DAMAGE_RESISTANCE, 999999, 1)); // Resistance II
            if (defense == 10) {
                p.setHealthScale(24.0); // 2 extra hearts
            }
        } else if (defense >= 4) {
            p.addPotionEffect(new PotionEffect(PotionEffectType.DAMAGE_RESISTANCE, 999999, 0)); // Resistance I
        }
    }

    private void applyRegenBuff(Player p, int regen) {
        if (regen >= 7) {
            p.addPotionEffect(new PotionEffect(PotionEffectType.REGENERATION, 999999, 1)); // Regen II
        } else if (regen >= 4) {
            p.addPotionEffect(new PotionEffect(PotionEffectType.REGENERATION, 999999, 0)); // Regen I
        }
    }

    private void applyLuckBuff(Player p, int luck) {
        if (luck >= 7) {
            p.addPotionEffect(new PotionEffect(PotionEffectType.LUCK, 999999, 1)); // Luck II
        } else if (luck >= 4) {
            p.addPotionEffect(new PotionEffect(PotionEffectType.LUCK, 999999, 0)); // Luck I
        }
    }
}
```

---

## Database Schema

```typescript
model Cat {
  id              Int       @id @default(autoincrement())
  tokenId         Int       @unique
  owner           String
  name            String
  dna             String
  metadataUri     String

  // Stats
  speed           Int       // 1-10
  strength        Int       // 1-10
  defense         Int       // 1-10
  regen           Int       // 1-10
  luck            Int       // 1-10
  rarityScore     Int       // sum of stats (5-50)

  // Breeding
  generation      Int       // 0 = genesis, 1+ = bred
  isGenesis       Boolean
  parent1Id       Int?
  parent2Id       Int?

  // State
  cooldownUntil   DateTime?
  isActive        Boolean   @default(false)
  mintedAt        DateTime  @default(now())

  @@index([owner])
  @@index([rarityScore])
}

model PlayerInventory {
  id            Int      @id @default(autoincrement())
  wallet        String   @unique
  catIds        Int[]    // max 5
  activeCatId   Int?

  @@index([wallet])
}

model Battle {
  id                Int       @id @default(autoincrement())
  battleId          String    @unique
  challenger        String
  challenged        String
  challengerCatId   Int
  challengedCatId   Int

  state             String    // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
  startTime         DateTime
  endTime           DateTime?
  winner            String?
  loser             String?
  reason            String?   // death, quit, timeout

  childTokenId      Int?
  deletedCatId      Int?

  arenaLocation     Json      // { x, y, z }

  @@index([challenger])
  @@index([challenged])
}

model DailySpawnCounter {
  id          Int      @id @default(autoincrement())
  date        String   @unique // YYYY-MM-DD
  count       Int      @default(0)
}
```

---

## Kyrgyz Name Generation

```typescript
const KYRGYZ_NAMES = {
  common: ['Boz', 'Kara', 'Ak', 'Sary', 'Kyzyl'],
  uncommon: ['Tengri', 'Issyk', 'Naryn', 'Asman', 'Bermet'],
  rare: ['Cholpon', 'Altynai', 'Dinara', 'Sanjar', 'Kubat'],
  legendary: ['Ala-Too', 'Manas', 'Kurmanjan', 'Toktogul']
};

const SUFFIXES = [
  'Paws', 'Shadow', 'Runner', 'Flame', 'Hunter',
  'Stripes', 'Eyes', 'Jumper', 'Tail', 'Whiskers'
];

function generateKyrgyzName(rarityScore: number, tokenId: number): string {
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
// Gen 8 (score 48): "Ala-Too Thunderborn #42"
```

**Name Meanings:**
- Tengri = Sky/Heaven
- Ala-Too = Mountains
- Manas = Legendary Kyrgyz hero
- Cholpon = Venus star
- Altynai = Golden moon

---

## Game Economy

### Supply Dynamics

**Genesis Cats (Deflationary):**
```
Daily spawn: 10 cats
Death rate: ~30% die within first week
Net supply: +7 genesis/day
Long-term: Declining genesis population
```

**Bred Cats (Inflationary but Controlled):**
```
Creation: Only via PvP wins
Rate: ~5-10 per day (depends on battles)
Death: 0 (immortal)
Long-term: Growing bred population
```

**Total Supply Projection:**
```
Week 1:   70 genesis + 20 bred = 90 total
Month 1:  200 genesis + 150 bred = 350 total
Year 1:   500 genesis + 2000 bred = 2500 total
```

### Value Drivers

**1. Stats (Primary)**
- Score 15-20: Common ($5-10)
- Score 25-30: Uncommon ($20-50)
- Score 35-40: Rare ($100-200)
- Score 45-50: Legendary ($500-1000+)

**2. Generation**
- Gen 0: Common
- Gen 1-3: Uncommon
- Gen 4-6: Rare
- Gen 8+: Legendary

**3. Lineage**
- Champion bloodlines = premium
- First perfect cat (50 score) = priceless
- Famous battle winners = collectible

**4. Mortality**
- Genesis = risky investment
- Bred = safe investment

**5. Utility**
- Better stats = better PvP performance
- PvP skill + strong cat = more breeding wins
- More wins = more value creation

---

## Implementation Priority (Hackathon)

### Day 1 - Core Systems:
1. ✅ Update smart contract with breeding algorithm
2. ✅ Deploy to Polygon Amoy
3. ✅ Update backend API (battle endpoints)
4. ✅ Update plugin (challenge/battle commands)
5. ✅ Test end-to-end breeding flow

### Nice to Have:
- Battle arena with spectators
- Leaderboard
- Gallery website
- Reputation system

### Skip for Demo:
- Tournament brackets
- Advanced matchmaking
- 3D model generation
- Complex marketplace

---

## Testing Scenarios

### Test 1: Genesis Lifecycle
```
1. Genesis cat spawns
2. Player tames it → NFT minted
3. Stats: [3, 4, 2, 5, 3], score 17
4. Set as active → Gets buffs (Speed I, Strength I, Regen I)
5. Cat dies to lava → NFT burned
6. Player loses buffs
```

### Test 2: First Breeding Win
```
1. Player A: Genesis cat [3, 4, 2, 5, 3]
2. Player B: Genesis cat [4, 3, 5, 2, 4]
3. Player A challenges Player B
4. Player B accepts
5. Both teleport to arena with cats
6. Battle: Player A wins (kills Player B)
7. Backend calculates child stats via algorithm
8. Child: [5, 5, 4, 6, 5], gen 1, score 25
9. Minted to Player A
10. Player B's cat: 24h cooldown
```

### Test 3: Full Inventory Auto-Delete
```
1. Player has 5 cats: scores [15, 18, 22, 28, 35]
2. Wins breeding battle
3. New cat score: 42
4. System auto-deletes cat with score 15
5. New cat added to inventory
6. Player notified
```

### Test 4: Multi-Gen Breeding
```
Gen 0 × Gen 0 → Gen 1 (score ~23-25)
Gen 1 × Gen 1 → Gen 2 (score ~29-32, +1 bonus)
Gen 4 × Gen 4 → Gen 5 (score ~40-43, +2 bonus)
Gen 8 × Gen 8 → Gen 9 (score ~47-50, +4 bonus)
```

---

## Success Metrics

**For Hackathon Demo:**
- ✅ Live PvP battle shown to judges
- ✅ Real breeding with on-chain stats
- ✅ Buffs visibly working in combat
- ✅ Full progression from Gen 0 → Gen 1
- ✅ Kyrgyz cultural integration

**For Long-term:**
- Active battles per day
- Average cat generation
- Highest rarity score achieved
- Number of perfect cats (score 50)
- Battle participation rate

---

**This is BlockCats v2.0: Competitive cat breeding through PvP skill + genetics.** 🇰🇬🐱⚔️
