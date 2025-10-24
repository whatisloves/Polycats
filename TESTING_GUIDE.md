# BlockCats - Testing Guide

## ✅ Everything is Running!

**Minecraft Server:**
- Running on `localhost:25565`
- Plugin loaded: BlockCatsPlugin v1.0.0
- Auto-spawning cats every 1 minute
- Already spawned one cat at coordinates `16, 77, -25`

**Next.js Backend:**
- Running on `http://localhost:3000`
- Mock API endpoints active
- Connected to Minecraft plugin

---

## How to Test

### 1. Join Minecraft Server
```
1. Open Minecraft Java 1.21.10
2. Multiplayer → Direct Connection
3. Server: localhost
4. Join
```

### 2. Link Your Wallet
```
In Minecraft chat, type:
/linkwallet 0x1234567890123456789012345678901234567890

You should see:
"[BlockCats] Wallet linked successfully!"
```

### 3. Spawn a Cat (Two Ways)

**Option A: Manual Spawn (for testing)**
```
/spawncat

You should see:
"[BlockCats] Spawned a BlockCat for testing!"
"[BlockCats] A new BlockCat appeared at X, Y, Z!"
```

**Option B: Wait for Auto-Spawn**
```
Cats spawn automatically every 1 minute
Watch chat for announcement
```

### 4. Tame the Cat
```
1. Run to the coordinates shown in chat
2. Hold raw fish (cod/salmon)
3. Right-click the cat until hearts appear
4. Cat is tamed!
```

### 5. See the Mock NFT Mint
```
You should see in chat:
"[BlockCats] You claimed BlockCat #1! NFT is being minted..."
"TX: 0x[fake-transaction-hash]"
```

### 6. Check Backend Logs
```bash
# In terminal:
tail -f ~/cryptojam/nextjs.log

# You should see:
[SPAWN] Spawned cat #1 with DNA: {...}
[CLAIM] Player 0x123... claimed BlockCat #1
[CLAIM] TX Hash: 0x...
```

---

## Available Commands

### In Minecraft:
```
/linkwallet <address>  - Link your wallet (required before claiming)
/spawncat             - Manually spawn a cat for testing
```

### Test Limits:
```
1. Try claiming 2 cats in one day
   → Second claim should fail with "You already claimed your daily BlockCat!"

2. Try spawning 11 cats in one day
   → After 10, should get "Daily limit reached"
```

---

## API Endpoints (for debugging)

```bash
# Check spawn status
curl http://localhost:3000/api/minecraft/spawn \
  -H "X-Plugin-Secret: dev-secret-12345" \
  -X POST

# Response:
{
  "canSpawn": true,
  "dna": "{...}"
}

# Manually trigger claim (simulating plugin)
curl http://localhost:3000/api/minecraft/claim \
  -H "X-Plugin-Secret: dev-secret-12345" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "wallet": "0x1234567890123456789012345678901234567890",
    "catUuid": "test-uuid-123"
  }'

# Response:
{
  "success": true,
  "tokenId": 1,
  "transactionHash": "0x..."
}

# View minted cats (placeholder for now)
curl http://localhost:3000/api/cats
```

---

## Expected Behavior

### ✅ Working:
- Plugin loads on server start
- Auto-spawn every 1 minute
- Manual `/spawncat` command
- Wallet linking `/linkwallet`
- Cat taming triggers API call
- Mock NFT minting with fake tx hash
- Daily limits enforced (10 global, 1 per player)

### ❌ Not Yet Implemented (real blockchain):
- Real smart contract minting
- Actual transaction hash
- NFT metadata on IPFS
- Gallery page showing minted cats
- Real wallet signature verification

---

## Troubleshooting

**"No wallet linked" error:**
```
Make sure you typed: /linkwallet 0x1234567890123456789012345678901234567890
Wallet must start with 0x and be 42 characters
```

**Cat won't spawn:**
```
Check server logs:
tail -f ~/minecraft-server/server-with-plugin.log | grep BlockCats

Check backend logs:
tail -f ~/cryptojam/nextjs.log
```

**API not responding:**
```
Check if Next.js is running:
curl http://localhost:3000/api/cats

If not, restart:
cd ~/cryptojam/web && npm run dev
```

**Plugin not loaded:**
```
Check plugins folder:
ls ~/minecraft-server/plugins/

Restart server:
cd ~/minecraft-server
pkill -f paper.jar
java -Xmx2G -Xms2G -jar paper.jar nogui
```

---

## What to Test Next

1. ✅ **Basic Flow** - Link wallet → spawn → tame → see mock mint
2. ✅ **Daily Limits** - Try claiming 2+ cats same day
3. ✅ **Auto-spawn** - Wait 1 minute, verify cat spawns
4. ⏳ **Real Blockchain** - Deploy actual smart contract
5. ⏳ **IPFS Integration** - Upload real metadata
6. ⏳ **Gallery Page** - Show minted NFTs on website

---

## Current Status

```
✅ Minecraft Plugin - WORKING (mock mode)
✅ Backend API - WORKING (mock data)
✅ Daily Limits - WORKING
✅ Auto-spawn - WORKING (1 min interval)
⏳ Smart Contract - NOT YET DEPLOYED
⏳ Frontend Gallery - NOT YET BUILT
⏳ Real Blockchain - NOT YET INTEGRATED
```

**Next Steps:**
1. Test the full mock flow
2. Deploy real smart contract to Polygon Amoy
3. Replace mock minting with real blockchain calls
4. Build gallery page
5. Add IPFS for cat images

---

**Ready to test! Join the server and try it out! 🐱**
