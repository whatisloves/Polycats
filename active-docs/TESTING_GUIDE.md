# BlockCats - Testing Guide (Battle System)

## System Overview

**What's Running:**
- Minecraft Server (Paper 1.21.10) on `localhost:25565`
- Next.js Backend API on `http://localhost:3000`
- BlockCatsPlugin v1.0.0 (with cat inventory + battle system)

**Current Implementation:**
- ✅ Genesis cat spawning (timer-based)
- ✅ Cat inventory system (max 5 cats)
- ✅ Active cat selection (/choosecat)
- ✅ Buff application (stats → potion effects)
- ⏳ PvP battle system (challenge/accept/end)
- ⏳ Breeding from battles
- ⏳ Cooldown system

---

## Test Flow 1: Genesis Cat Collection

### Step 1: Join Server & Link Wallet
```
1. Open Minecraft Java 1.21.10
2. Multiplayer → Direct Connection
3. Server: localhost
4. Join

In chat:
/linkwallet 0x1234567890123456789012345678901234567890

Expected: "[BlockCats] Wallet linked successfully!"
```

### Step 2: Spawn Genesis Cat
```
Option A - Manual spawn (testing):
/spawncat

Option B - Wait for auto-spawn (1 minute):
Watch chat for: "[BlockCats] A new BlockCat appeared at X, Y, Z! Wallet Required!"
```

### Step 3: Tame the Cat
```
1. Run to coordinates shown in chat
2. Hold raw cod or salmon
3. Right-click cat until hearts appear
4. Taming triggers API call

Expected messages:
"[BlockCats] You collected a new cat: Aibek!"
"[BlockCats] NFT minting... Token ID: 1"
```

### Step 4: Check Your Collection
```
/mycats

Expected output:
§6=== Your BlockCats ===
§71. §eAibek §7(Gen 0) - §aSpeed: 3, Strength: 2, Health: 4, Luck: 1 §7[ACTIVE]
§7Total: 1/5 cats
```

### Step 5: Verify Active Cat Buffs
```
Open inventory (E key)
Check potion effects on right side

Expected effects (based on Genesis stats 1-5):
✓ Speed I (from Speed 3)
✓ Strength I (from Strength 2)
✓ Regeneration I (from Health 4)
✓ Luck I (from Luck 1)
```

---

## Test Flow 2: Cat Inventory Management

### Collect Multiple Cats
```bash
# Spawn and claim 5 genesis cats (max inventory)
/spawncat
# ... tame cat 1

/spawncat
# ... tame cat 2

/spawncat
# ... tame cat 3

/spawncat
# ... tame cat 4

/spawncat
# ... tame cat 5

Expected: All 5 cats stored in inventory
```

### Switch Active Cat
```
/mycats
# Note the name of cat #2

/choosecat Tengri   # Replace with actual cat name

Expected messages:
"[BlockCats] Your previous active cat has disappeared"
"[BlockCats] Your active cat Tengri has appeared!"
"[BlockCats] You chose Tengri as your active cat!"

Verify:
- Previous active cat despawns
- New cat spawns nearby
- Buffs update to match new cat's stats
```

### Test Inventory Full
```
# Try to claim 6th cat when inventory full
/spawncat
# ... tame the cat

Expected message:
"[BlockCats] Your cat inventory is full! (Max 5)"
# Cat taming should be blocked
```

---

## Test Flow 3: PvP Breeding Battles

**⚠️ Requires 2 players for full testing**

### Setup (Both Players)
```
Player 1:
/linkwallet 0x1111111111111111111111111111111111111111
/spawncat
# ... tame cat "Aibek"

Player 2:
/linkwallet 0x2222222222222222222222222222222222222222
/spawncat
# ... tame cat "Tengri"
```

### Challenge Flow
```
Player 1:
/challenge Player2

Expected (Player 2 sees):
"[BlockCats] Player1 challenged you to a breeding battle!"
"[BlockCats] Type /accept Player1 to accept (30s timeout)"

Player 2:
/accept Player1

Expected (Both players see):
"[BlockCats] Battle starting in 5... 4... 3... 2... 1..."
"[BlockCats] FIGHT! Winner gets a bred kitten. Timer: 5 minutes"
# Both players teleported to battle arena
```

### Battle - Win Scenario
```
# Player 1 kills Player 2 (or Player 2 quits)

Expected (Player 1 - Winner):
"[BlockCats] You won! Breeding your cats..."
"[BlockCats] You collected a new cat: Cholpon!"
"[BlockCats] Cholpon (Gen 1) - Speed: 5, Strength: 4, Health: 6, Luck: 3"

Expected (Player 2 - Loser):
"[BlockCats] You lost! Your cat is on 24h cooldown"
# Cat kept, but cannot battle for 24 hours
```

### Battle - Timeout/Draw Scenario
```
# 5 minutes pass without death

Expected (Both players):
"[BlockCats] Battle timeout! No breeding occurred"
# Both teleported back
# No cooldowns applied
```

### Verify Breeding Results
```
Player 1 (Winner):
/mycats

Expected:
§71. §eAibek §7(Gen 0) - §aSpeed: 3, Strength: 2, Health: 4, Luck: 1 §7[ACTIVE]
§72. §eCholpon §7(Gen 1) - §aSpeed: 5, Strength: 4, Health: 6, Luck: 3
§7Total: 2/5 cats

# Note: Gen 1 cat has better stats than Gen 0 parents
```

### Test Cooldown Block
```
Player 2 (Loser - cat on cooldown):
/challenge Player1

Expected:
"[BlockCats] Your cat is on cooldown! (23h 59m remaining)"
# Challenge blocked
```

---

## Test Flow 4: Stat Progression

### Genesis Cat Stats (Gen 0)
```
Spawn and check stats:
/mycats

Expected range: 1-5 for each stat
Example: Speed 3, Strength 2, Health 4, Luck 1
```

### Bred Cat Stats (Gen 1+)
```
After winning battle:
/mycats

Expected:
- Stats inherited from both parents
- 75% chance of positive mutation (+1 or +2)
- Generational bonus (parent gen / 2)
- Range: 1-10 for each stat

Example:
Parent 1: Speed 3
Parent 2: Speed 4
Average: 3.5 → 3
Mutation: +2 (75% chance)
Result: Speed 5
```

### Check Buff Upgrades
```
/choosecat Cholpon   # Switch to Gen 1 cat

Open inventory, verify buffs:
Speed 5 → Speed I
Strength 4 → Strength I
Health 6 → Regeneration II + Health Boost I (upgraded!)
Luck 3 → Luck I
```

---

## Test Flow 5: Inventory Cap & Auto-Delete

### Fill Inventory with Weak Cats
```
# Collect 5 Genesis cats with low stats
/spawncat && tame
/spawncat && tame
... (repeat until 5/5)

/mycats
# Note total stats of each cat
```

### Win Battle with Full Inventory
```
# Have another player challenge you
# Win the battle

Expected auto-delete behavior:
"[BlockCats] Your inventory is full!"
"[BlockCats] Deleting weakest cat: Boz (Total Stats: 8)"
"[BlockCats] You collected a new cat: Sanjar (Gen 1, Total Stats: 18)"

Verify:
/mycats
# Weakest cat gone
# New bred cat in inventory
# Still 5/5 total
```

---

## Test Flow 6: API Endpoint Testing

### Test Spawn Endpoint
```bash
curl http://localhost:3000/api/minecraft/spawn \
  -H "X-Plugin-Secret: dev-secret-12345" \
  -X POST

# Expected response:
{
  "canSpawn": true,
  "stats": {
    "speed": 3,
    "strength": 2,
    "health": 4,
    "luck": 1
  }
}
```

### Test Claim Endpoint
```bash
curl http://localhost:3000/api/minecraft/claim \
  -H "X-Plugin-Secret: dev-secret-12345" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "wallet": "0x1234567890123456789012345678901234567890",
    "catUuid": "test-uuid-123",
    "stats": {
      "speed": 3,
      "strength": 2,
      "health": 4,
      "luck": 1
    }
  }'

# Expected response:
{
  "success": true,
  "tokenId": 1,
  "name": "Aibek",
  "transactionHash": "0x...",
  "metadata": { ... }
}
```

### Test Battle Challenge Endpoint
```bash
curl http://localhost:3000/api/battle/challenge \
  -H "X-Plugin-Secret: dev-secret-12345" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "challengerWallet": "0x1111111111111111111111111111111111111111",
    "targetWallet": "0x2222222222222222222222222222222222222222",
    "challengerCatId": 1
  }'

# Expected response:
{
  "success": true,
  "battleId": "battle-uuid-123"
}
```

### Test Battle End Endpoint
```bash
curl http://localhost:3000/api/battle/end \
  -H "X-Plugin-Secret: dev-secret-12345" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "battleId": "battle-uuid-123",
    "winnerWallet": "0x1111111111111111111111111111111111111111",
    "loserWallet": "0x2222222222222222222222222222222222222222",
    "isDraw": false
  }'

# Expected response:
{
  "success": true,
  "childTokenId": 3,
  "childName": "Cholpon",
  "childStats": {
    "speed": 5,
    "strength": 4,
    "health": 6,
    "luck": 3
  },
  "transactionHash": "0x...",
  "cooldownSet": true
}
```

---

## Test Flow 7: Daily Limits

### Test Per-Player Genesis Limit
```
Day 1:
/spawncat && tame   # Cat #1 - Success

/spawncat && tame   # Cat #2 - Should fail

Expected:
"[BlockCats] You already claimed your daily Genesis BlockCat!"
```

### Test Global Genesis Limit
```
# Have 10 different players each claim 1 genesis cat

Player 11:
/spawncat && tame

Expected:
"[BlockCats] Daily genesis spawn limit reached! Try tomorrow"
```

### Test Bred Cats Have No Limit
```
# Win multiple battles in same day

Expected:
✓ Can breed unlimited cats (earned through skill)
✓ Only genesis cats have daily limits
```

---

## Test Flow 8: Buff System Verification

### Test Speed Buffs
```
Collect cats with Speed: 3, 7, 10

/choosecat [Speed3Cat]
Verify: Speed I buff

/choosecat [Speed7Cat]
Verify: Speed II buff

/choosecat [Speed10Cat]
Verify: Speed II + Jump Boost I
```

### Test Strength Buffs
```
Attack a zombie with different cats:

Speed 3 cat active: ~7 damage per hit (base + Strength I)
Speed 7 cat active: ~10 damage per hit (base + Strength II)
Speed 10 cat active: ~10 damage + 20% damage reduction
```

### Test Health Buffs
```
Take damage and observe regeneration:

Health 3 cat: Heal 1❤ every 10 seconds
Health 7 cat: Heal 1❤ every 5 seconds + 2 extra hearts
Health 10 cat: Heal 1❤ every 2.5 seconds + 4 extra hearts
```

---

## Troubleshooting

### Buffs Not Applying
```
Check:
1. Is cat set as active? (/mycats - check [ACTIVE] tag)
2. Check potion effects in inventory (E key)
3. Try re-selecting cat: /choosecat <name>

Debug:
tail -f ~/minecraft-server/server-with-plugin.log | grep "buff"
```

### Battle Not Starting
```
Check:
1. Both players have active cats?
2. Neither cat on cooldown?
3. Both players online?

Debug:
tail -f ~/cryptojam/web/.next/server.log | grep "battle"
```

### Cat Not Spawning
```
Check:
1. Daily limit not reached?
2. Backend API running? (curl http://localhost:3000/api/cats)
3. Plugin secret correct in config.yml?

Debug:
tail -f ~/minecraft-server/server-with-plugin.log | grep "spawn"
```

### Cooldown Not Working
```
Check:
1. Smart contract deployed? (cooldown is on-chain)
2. Backend connected to blockchain?

Debug:
curl http://localhost:3000/api/cat/1
# Check cooldownUntil field
```

---

## Expected Behavior Summary

### ✅ Currently Working (Mock Mode):
- Genesis cat spawning (timer-based)
- Cat inventory system (max 5)
- Active cat selection (/choosecat)
- Cat collection persistence (wallets.yml)
- Buff application (stats → potion effects)
- Kyrgyz name generation

### ⏳ Partially Working (Mock Data):
- Battle challenge/accept flow
- Battle outcome detection (death/quit/timeout)
- Breeding stats calculation
- Cooldown tracking
- Inventory auto-delete

### ❌ Not Yet Implemented (Requires Blockchain):
- Real smart contract calls for breeding
- On-chain cooldown tracking
- NFT minting with real tx hashes
- IPFS metadata storage
- Frontend gallery display

---

## Next Steps for Testing

**Phase 1: Mock Testing (Current)**
1. ✅ Test genesis cat collection
2. ✅ Test cat inventory management
3. ⏳ Test battle flow (2 players needed)
4. ⏳ Test breeding mechanics
5. ⏳ Test cooldown system

**Phase 2: Blockchain Integration**
1. Deploy smart contract to Polygon Amoy
2. Replace mock API with real contract calls
3. Test real NFT minting
4. Test on-chain breeding algorithm
5. Test on-chain cooldowns

**Phase 3: Frontend**
1. Build gallery page
2. Display cat stats and buffs
3. Show breeding lineage
4. Add battle history

---

## Performance Benchmarks

**Expected Values:**
- Genesis spawn: < 2s from command to in-game
- Cat claim/mint: < 5s (mock), < 30s (real blockchain)
- Battle start: < 1s after accept
- Breeding calculation: < 1s
- Buff application: Instant when switching cats

---

## Known Issues

1. **Buff persistence**: Buffs removed on server restart (need to re-select active cat)
2. **Battle arena**: No dedicated arena yet (players fight at current location)
3. **Battle timer**: 5-minute timeout not yet enforced
4. **Auto-delete logic**: Needs testing with full inventory

---

**Ready to test the new battle system! Grab a friend and start breeding! 🐱⚔️**
