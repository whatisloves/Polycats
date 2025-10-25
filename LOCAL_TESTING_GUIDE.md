# 🎮 BlockCats - Local Testing Guide

## 🚀 **SYSTEM IS NOW RUNNING!**

### ✅ **What's Running**
- **Backend API**: `http://localhost:3000` (Next.js with mock battle system)
- **Minecraft Server**: Running with BlockCats plugin installed
- **Complete PvP Breeding Battle System**: Ready for testing!

---

## 🎯 **Quick Start Testing**

### **Step 1: Connect to Minecraft Server**
```
Server: localhost:25565
```

### **Step 2: Link Wallets (2 Players Required)**
```
Player 1:
/linkwallet 0x1234567890123456789012345678901234567890

Player 2:
/linkwallet 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
```

### **Step 3: Get Genesis Cats**
Wait for cats to spawn (or use `/spawncat` if you're OP):
```
[BlockCats] A new BlockCat appeared at X, Y, Z! Be first to tame it!
```

Both players tame a cat with raw fish.

### **Step 4: Set Active Cats**
```
/choosecat <catname>
```

### **Step 5: Start a Breeding Battle**
```
Player 1: /challenge Player2 breeding
Player 2: /accept
```

### **Step 6: Fight!**
- Fight wherever you are (no arenas)
- 5-minute time limit
- Winner gets a bred cat with better stats
- Loser's cat goes on 24-hour cooldown

---

## 🎮 **Complete Command List**

### **Basic Commands**
- `/linkwallet <address>` - Link your wallet
- `/unlinkwallet` - Unlink wallet
- `/status` - Check your status
- `/help` - Show all commands

### **Collection Management**
- `/mycats` - View your collected cats
- `/choosecat <name>` - Choose active cat (applies buffs!)
- `/deletecat <name>` - Delete a cat
- `/confirmdelete` - Confirm deletion

### **Breeding Battle Commands**
- `/challenge <player> breeding` - Challenge to breeding battle
- `/accept` - Accept a challenge
- `/decline` - Decline a challenge

### **Admin Commands**
- `/spawncat` - Manually spawn a cat (OP only)
- `/bcadmin` - Admin commands

---

## 🧪 **Testing Scenarios**

### **Test 1: Basic Breeding Battle**
1. Both players tame genesis cats
2. Set as active cats
3. Player A challenges Player B
4. Player B accepts
5. Fight until one dies
6. Winner gets bred cat with better stats
7. Loser's cat goes on cooldown

### **Test 2: Buff System**
1. Tame a cat with high stats (Speed 8, Strength 9, etc.)
2. Set as active: `/choosecat <name>`
3. Check your buffs (Speed II, Strength II, etc.)
4. Switch to different cat
5. Buffs should update

### **Test 3: Inventory Management**
1. Collect 5 cats
2. Win a battle
3. New cat should auto-delete weakest cat
4. Check `/mycats` to confirm

### **Test 4: Battle Timeout**
1. Start a battle
2. Wait 5 minutes without fighting
3. Should end in draw (no breeding)

---

## 🔍 **Debugging**

### **Check Backend Logs**
```bash
cd /Users/wapi/hackathon/bishkekjam/web
npm run dev
```

Watch for:
- `✅ Cat claimed (MOCK): [name] (Token X) for [wallet]`
- Battle challenge/accept/result logs

### **Check Minecraft Server Logs**
Look for:
- `Applied buffs to [player] (Speed:X Str:X Def:X...)`
- `Battle death: [loser] killed by [winner]`
- `Battle forfeit: [quitter] quit, [winner] wins`

### **Test API Endpoints**
```bash
# Test spawn
curl -X POST http://localhost:3000/api/minecraft/spawn \
  -H "Content-Type: application/json" \
  -H "X-Plugin-Secret: dev-secret-12345" \
  -d '{}'

# Test claim
curl -X POST http://localhost:3000/api/minecraft/claim \
  -H "Content-Type: application/json" \
  -H "X-Plugin-Secret: dev-secret-12345" \
  -d '{"wallet": "0x1234567890123456789012345678901234567890", "catUuid": "test-cat-123"}'

# Test battle challenge
curl -X POST http://localhost:3000/api/battle/challenge \
  -H "Content-Type: application/json" \
  -H "X-Plugin-Secret: dev-secret-12345" \
  -d '{"challenger": "Player1", "challenged": "Player2", "type": "breeding"}'
```

---

## 🎯 **Expected Results**

### **Genesis Cats**
- Stats: 1-5 range
- Names: Kyrgyz names (Tengri, Ala-Too, Manas, etc.)
- Buffs: Basic buffs based on stats

### **Bred Cats**
- Stats: 75% upward bias from parents
- Generation: Parent max + 1
- Names: More prestigious Kyrgyz names
- Better buffs than parents

### **Battle System**
- Open-world PvP combat
- 5-minute time limit
- Winner gets bred cat
- Loser gets 24-hour cooldown
- Draw = no breeding

---

## 🚨 **Troubleshooting**

### **Backend Not Running**
```bash
cd /Users/wapi/hackathon/bishkekjam/web
npm run dev
```

### **Minecraft Server Not Running**
```bash
cd ~/minecraft-server
java -Xmx2G -Xms1G -jar paper-1.21.jar nogui
```

### **Plugin Not Working**
1. Check server logs for errors
2. Ensure plugin JAR is in `plugins/` folder
3. Restart server

### **API Errors**
1. Check backend logs
2. Ensure `X-Plugin-Secret: dev-secret-12345` header
3. Check wallet address format

---

## 🎉 **What's Working**

✅ **Complete PvP breeding battle system**
✅ **Mock backend with in-memory storage**
✅ **Buff system based on cat stats**
✅ **Inventory management (5-cat limit)**
✅ **Cooldown system (24-hour for losers)**
✅ **Kyrgyz name generation**
✅ **Battle timeout handling**
✅ **Player death/quit detection**
✅ **Cat deletion with confirmation**

---

## 📝 **Notes**

- **All data is mock** (in-memory, resets on restart)
- **No blockchain integration** (perfect for testing)
- **No real NFTs** (mock tokens only)
- **Perfect for rapid iteration** and gameplay testing

**Happy Testing! 🐱⚔️**

The complete Web3 gaming experience is now running locally!
