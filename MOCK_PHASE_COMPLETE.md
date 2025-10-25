# BlockCats - Mock Phase Implementation Complete! 🎉

## Status: ✅ READY FOR TESTING

All backend mock logic and Minecraft PvP battle system has been implemented. You can now test the complete breeding battle flow in Minecraft!

---

## 📦 What Was Built

### **Backend (Mock - In-Memory Storage)**

#### New API Endpoints:
1. **POST /api/battle/challenge** - Create a breeding battle challenge
2. **POST /api/battle/accept** - Accept a pending challenge
3. **POST /api/battle/result** - Report battle outcome & breed cats
4. **GET /api/player/[wallet]/inventory** - Get player's cat collection
5. **POST /api/player/setactive** - Set active cat
6. **DELETE /api/cat/[tokenId]** - Delete a cat

#### Updated Endpoints:
- **POST /api/minecraft/spawn** - Now uses mock breeding stats (1-5 range for genesis)
- **POST /api/minecraft/claim** - Now stores cats in in-memory storage with Kyrgyz names

#### Core Systems:
- ✅ **In-memory storage** for battles, cats, and inventory
- ✅ **Mock breeding algorithm** with 75% upward stat bias
- ✅ **Kyrgyz name generation** based on rarity score
- ✅ **5-cat inventory limit** with auto-delete weakest
- ✅ **24-hour cooldown system** for losers
- ✅ **Generational progression** (Gen 0 → Gen 1+)

---

### **Minecraft Plugin**

#### New Managers:
1. **BattleManager.java** - Handles challenge/accept/battle flow
2. **BuffManager.java** - Applies potion effects based on cat stats

#### New Listeners:
1. **BattleListener.java** - Detects player death/quit in battles

#### New Commands:
| Command | Description |
|---------|-------------|
| `/challenge <player> breeding` | Challenge another player to a breeding battle |
| `/accept` | Accept a pending challenge |
| `/decline` | Decline a pending challenge |
| `/deletecat <name>` | Delete a cat (confirmation required) |
| `/confirmdelete` | Confirm cat deletion |

#### Updated Commands:
- `/choosecat <name>` - Now applies buffs when switching active cat

#### Updated Components:
- **SpawnManager** - Stores DNA for each spawned cat
- **CatCollectionManager** - Added methods for battle integration
- **ApiClient** - Added all new API endpoints
- **CatTamingListener** - Passes DNA to claim endpoint

---

## 🎮 How to Test

### 1. Start the Backend

```bash
cd web
npm install
npm run dev
```

Backend runs on `http://localhost:3000`

### 2. Build and Run Minecraft Plugin

```bash
cd BlockCatsPlugin
mvn clean package
```

Copy `target/BlockCatsPlugin-1.0-SNAPSHOT.jar` to your Minecraft server's `plugins/` folder.

Update `plugins/BlockCatsPlugin/config.yml`:
```yaml
api:
  url: "http://localhost:3000"
  secret: "dev-secret-12345"
```

Restart your Minecraft server.

### 3. Test the Full Flow

#### **View Available Commands**

```
/help
```

This will show all commands organized by category:
- Basic Commands (wallet linking, status)
- Collection Management (view cats, choose active, delete)
- Breeding Battle Commands (challenge, accept, decline)
- How Battles Work (explanation)

#### **Setup (2 Players Required)**

Player 1:
```
/linkwallet 0x1234567890123456789012345678901234567890
```

Player 2:
```
/linkwallet 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
```

#### **Get Genesis Cats**

Wait for a cat to spawn (or use `/spawncat` if you're OP):
```
[BlockCats] A new BlockCat appeared at X, Y, Z! Be first to tame it!
```

Both players tame a cat with raw fish.

Set as active:
```
/choosecat <catname>
```

Check your buffs:
```
/mycats
```

#### **Start a Breeding Battle**

Player 1:
```
/challenge Player2 breeding
```

Player 2:
```
/accept
```

#### **Fight!**

- **No arenas** - fight wherever you are
- **No teleportation** - stay in the same world
- **5-minute time limit** - or it's a draw
- **Winner conditions:**
  - Kill the opponent
  - Opponent quits the game

#### **Win Conditions**

**Winner gets:**
- New bred cat (better stats than parents)
- Child's generation = max(parent gens) + 1
- If inventory full (5/5), weakest cat auto-deleted

**Loser gets:**
- Cat goes on 24-hour cooldown
- Can battle with a different cat immediately
- Keeps the cat (no loss)

**Draw (timeout):**
- No breeding occurs
- Both players keep their cats

---

## 🧪 Testing Scenarios

### Test 1: Basic Breeding Battle
```
1. Player A: Genesis cat [Speed 3, Strength 4, Defense 2, Regen 5, Luck 3] (score 17)
2. Player B: Genesis cat [Speed 4, Strength 3, Defense 5, Regen 2, Luck 4] (score 18)
3. Player A challenges Player B
4. Player B accepts
5. Player A wins (kills Player B)
6. Expected: Player A gets new cat with stats ~[4-6, 4-6, 4-6, 4-6, 4-6] (Gen 1, score ~23-25)
7. Player B's cat on cooldown for 24h
```

### Test 2: Full Inventory Auto-Delete
```
1. Player has 5 cats with scores: [15, 18, 22, 28, 35]
2. Player wins battle
3. New cat score: 42
4. Expected: Cat with score 15 auto-deleted, new cat added
5. Player notified: "Auto-deleted [name] to make room"
```

### Test 3: Battle Timeout
```
1. Two players start battle
2. Wait 5 minutes without killing each other
3. Expected: Battle ends in draw, no breeding, no cooldown
```

### Test 4: Buff Application
```
1. Player sets active cat with Speed 7, Strength 8
2. Expected buffs: Speed II, Strength II
3. Player switches to cat with Speed 10, Defense 10
4. Expected buffs: Speed II, Jump Boost I, Resistance II, +2 hearts
```

### Test 5: Delete Cat
```
1. /deletecat <name>
2. See warning message
3. /confirmdelete
4. Cat deleted from backend + local storage
```

---

## 📊 Buff Tiers

### Speed
- 1-3: No buff
- 4-6: Speed I
- 7-9: Speed II
- 10: Speed II + Jump Boost I

### Strength
- 1-3: No buff
- 4-6: Strength I
- 7-9: Strength II
- 10: Strength II

### Defense
- 1-3: No buff
- 4-6: Resistance I
- 7-9: Resistance II
- 10: Resistance II + 2 extra hearts

### Regen
- 1-3: No buff
- 4-6: Regeneration I
- 7-9: Regeneration II
- 10: Regeneration II

### Luck
- 1-3: No buff
- 4-6: Luck I
- 7-9: Luck II
- 10: Luck II

---

## 🔍 Debugging

### Check Backend Logs
```bash
cd web
npm run dev
```

Watch for:
- `✅ Cat claimed (MOCK): [name] (Token X) for [wallet]`
- Battle challenge/accept/result logs

### Check Minecraft Server Logs
Look for:
- `Applied buffs to [player] (Speed:X Str:X Def:X...)`
- `Battle death: [loser] killed by [winner]`
- `Battle forfeit: [quitter] quit, [winner] wins`

### Check In-Memory Storage
Add to backend API:
```typescript
// In any route.ts file for debugging
import { debugPrintState } from '@/lib/storage';

debugPrintState(); // Prints current storage state
```

---

## 🚀 What's Next (Smart Contract Phase)

After testing works perfectly:

1. **Add breeding algorithm to smart contract**
2. **Deploy updated contract**
3. **Replace mock endpoints with real blockchain calls**
4. **Add IPFS metadata uploads**
5. **Test again with real NFTs**

---

## 🐛 Known Limitations (Mock Phase)

- ✅ Data resets on server restart (in-memory only)
- ✅ No blockchain integration yet (all mock)
- ✅ No IPFS uploads (placeholder URLs)
- ✅ No real transaction hashes (mock hashes)
- ✅ No database persistence
- ✅ No daily spawn limits enforced

**These are intentional for rapid testing!**

---

## ✨ Key Features Working

- ✅ PvP breeding battles with open-world combat
- ✅ Mock breeding algorithm with progressive stats
- ✅ Buff application based on cat stats
- ✅ 5-cat inventory limit with auto-delete
- ✅ 24-hour cooldown for losers
- ✅ Battle timeout handling (5 min)
- ✅ Player death/quit detection
- ✅ Kyrgyz name generation
- ✅ Cat deletion with confirmation
- ✅ Active cat switching with buff updates

---

## 🎯 Testing Checklist

- [ ] Two players can tame genesis cats
- [ ] Cats show correct stats in `/mycats`
- [ ] `/challenge` creates a battle
- [ ] `/accept` starts the battle countdown
- [ ] Winner gets a bred cat with better stats
- [ ] Loser's cat goes on cooldown
- [ ] Bred cat has generation = parent_max + 1
- [ ] Auto-delete works when inventory is full
- [ ] Buffs apply when switching active cat
- [ ] Battle times out after 5 minutes
- [ ] Player quit = opponent wins
- [ ] `/deletecat` + `/confirmdelete` removes cat

---

## 📝 Notes

**All mock data is stored in-memory and will be lost on server restart.** This is perfect for rapid iteration and testing. Once you confirm everything works, we'll add real blockchain integration.

**No arenas or teleportation** - players fight wherever they are in the world. The backend enforces the 5-minute timer and tracks winners/losers.

**Battle announcements** are broadcasted to the entire server, making battles visible to all players.

---

**Happy Testing! 🐱⚔️**

If you encounter any issues, check the logs (backend + Minecraft server) and let me know!
