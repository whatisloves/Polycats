# 🔐 BlockCats Wallet Requirement System

## Overview

The BlockCats system enforces that **only players with successfully linked wallets can tame cats with fish**. This ensures that NFTs are only minted to players who have properly connected their wallets.

---

## 🎯 How It Works

### 1. **Wallet Validation on Taming**
When a player attempts to tame a BlockCat with fish:

```java
// Check if player has linked wallet
if (!walletManager.hasWallet(player)) {
    // Prevent taming and show helpful messages
    event.setCancelled(true);
    return;
}
```

### 2. **Visual Indicators**
- **BlockCats have glowing effect** and special name: `⛓️ BlockCat (Wallet Required)`
- **Spawn announcements** include wallet requirement reminder
- **Clear error messages** when attempting to tame without wallet

### 3. **User Experience Flow**

#### **Without Linked Wallet:**
```
Player tries to tame BlockCat with fish
→ System checks wallet status
→ Taming is cancelled
→ Player sees helpful messages:
  [BlockCats] ❌ You need a linked wallet to claim BlockCats!
  [BlockCats] Use /linkwallet <address> to link your wallet
  [BlockCats] Use /help for more information
```

#### **With Linked Wallet:**
```
Player tries to tame BlockCat with fish
→ System checks wallet status
→ Wallet found: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
→ Taming proceeds
→ NFT minting process begins
→ Player receives confirmation
```

---

## 🎮 Player Experience

### **Spawn Announcements**
When a BlockCat spawns, all players see:
```
[BlockCats] 🐱 A new BlockCat appeared at 123, 64, 456! Be first to tame it!
[BlockCats] ⚠️ You need a linked wallet to claim BlockCats! Use /linkwallet <address>
```

### **Visual Cues**
- **BlockCats glow** to show they're special
- **Name tag** shows `⛓️ BlockCat (Wallet Required)`
- **Clear indication** that wallet is needed

### **Error Handling**
If player tries to tame without wallet:
```
[BlockCats] ❌ You need a linked wallet to claim BlockCats!
[BlockCats] Use /linkwallet <address> to link your wallet
[BlockCats] Use /help for more information
```

---

## 🔧 Technical Implementation

### **CatTamingListener.java**
```java
@EventHandler
public void onCatTame(EntityTameEvent event) {
    // Check if this is a BlockCat
    if (!spawnManager.isBlockCat(cat)) {
        return;
    }

    // ENFORCE WALLET REQUIREMENT
    if (!walletManager.hasWallet(player)) {
        // Show helpful error messages
        player.sendMessage("❌ You need a linked wallet!");
        player.sendMessage("Use /linkwallet <address> to link your wallet");
        player.sendMessage("Use /help for more information");
        
        // CANCEL THE TAMING EVENT
        event.setCancelled(true);
        return;
    }

    // Proceed with NFT minting...
}
```

### **SpawnManager.java**
```java
// Visual indicators for BlockCats
cat.setCustomName("§6⛓️ BlockCat §7(Wallet Required)");
cat.setCustomNameVisible(true);
cat.setGlowing(true); // Special glow effect

// Spawn announcements with wallet reminder
Bukkit.broadcastMessage("🐱 A new BlockCat appeared at X, Y, Z!");
Bukkit.broadcastMessage("⚠️ You need a linked wallet to claim BlockCats!");
```

---

## 📋 Configuration Messages

### **config.yml**
```yaml
messages:
  spawn: "§eA new BlockCat appeared at §b{x}, {y}, {z}§e! Be first to tame it!"
  spawn-wallet-reminder: "§7⚠️ You need a linked wallet to claim BlockCats! Use /linkwallet <address>"
  wallet-required: "§cYou need a linked wallet to claim BlockCats!"
  wallet-help: "§7Use /linkwallet <address> to link your wallet"
  wallet-info: "§7Use /help for more information"
```

---

## 🎯 Key Features

### ✅ **Enforced Wallet Requirement**
- **No wallet = No taming** - System prevents taming without wallet
- **Clear error messages** - Players know exactly what to do
- **Helpful guidance** - Commands to link wallet provided

### ✅ **Visual Indicators**
- **Glowing BlockCats** - Easy to spot special cats
- **Clear naming** - `⛓️ BlockCat (Wallet Required)`
- **Spawn reminders** - Wallet requirement announced

### ✅ **User-Friendly Experience**
- **Step-by-step guidance** - Clear instructions for linking wallet
- **Help system integration** - `/help` command available
- **Status checking** - `/status` shows wallet status

### ✅ **Admin Monitoring**
- **Server logs** - Track wallet linking events
- **Player management** - See who has linked wallets
- **Troubleshooting** - Clear error messages for debugging

---

## 🚀 Player Onboarding Flow

### **Step 1: Join Server**
```
Player joins → Sees BlockCat spawn announcement
→ Tries to tame → Gets wallet requirement message
→ Learns they need to link wallet
```

### **Step 2: Link Wallet**
```
Player uses: /linkwallet 0x...
→ Wallet linked successfully
→ Player can now tame BlockCats
```

### **Step 3: Claim BlockCats**
```
BlockCat spawns → Player with wallet tames it
→ NFT minting begins → Player receives confirmation
→ Player can view collection on website
```

---

## 🔒 Security Features

### **Wallet Validation**
- **Regex pattern matching** - Validates Ethereum address format
- **Duplicate prevention** - Can't link same wallet twice
- **Persistent storage** - Wallet links survive server restarts

### **Taming Protection**
- **Event cancellation** - Prevents taming without wallet
- **Clear error handling** - No confusion about requirements
- **Audit logging** - All wallet linking events logged

---

## 📊 Admin Management

### **Monitor Wallet Status**
```bash
/bcadmin players
# Shows all players with linked wallets
```

### **Check Server Status**
```bash
/bcadmin status
# Shows plugin status and configuration
```

### **Manual Testing**
```bash
/bcadmin spawn
# Spawn BlockCat for testing wallet requirement
```

---

## 🎉 Success!

The BlockCats system now **enforces wallet requirements** with:

- ✅ **No taming without wallet** - System prevents unauthorized claims
- ✅ **Clear visual indicators** - Players know what's required
- ✅ **Helpful error messages** - Clear guidance for setup
- ✅ **User-friendly experience** - Easy onboarding process
- ✅ **Admin monitoring** - Full visibility into system status

**Players must have a linked wallet to tame BlockCats with fish!** 🔐🐱⛓️
