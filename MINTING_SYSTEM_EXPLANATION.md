# 🪙 BlockCats Minting System - Complete Flow

## ✅ **Yes! The server WILL mint cats to specific wallets when players pet them with fish**

The BlockCats system is fully set up to mint NFTs to specific player wallets when they tame cats. Here's exactly how it works:

---

## 🔄 **Complete Minting Flow**

### **1. Player Tames Cat with Fish**
```
Player right-clicks BlockCat with fish
→ CatTamingListener.onCatTame() triggered
→ System checks if player has linked wallet
→ If wallet found: proceed with minting
→ If no wallet: cancel taming, show error
```

### **2. Wallet Validation**
```java
// Check if player has linked wallet
if (!walletManager.hasWallet(player)) {
    // Show error messages and cancel taming
    event.setCancelled(true);
    return;
}

// Get player's linked wallet address
final String wallet = walletManager.getWallet(player);
```

### **3. API Call to Backend**
```java
// Call API to claim and mint NFT (async)
apiClient.claimCat(wallet, catUuid).thenAccept(response -> {
    // Backend handles the actual minting
    // Returns tokenId and transaction hash
});
```

### **4. Backend Minting Process**
```
Backend receives API call with:
- wallet: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
- catUuid: "unique-cat-identifier"

Backend then:
1. Generates cat DNA
2. Creates metadata URI
3. Calls smart contract mintCat() function
4. Mints NFT to specific wallet address
5. Returns tokenId and transaction hash
```

### **5. Smart Contract Minting**
```solidity
function mintCat(
    address to,           // Player's wallet address
    CatDNA memory _dna,   // Generated cat DNA
    bytes32 _seed,        // Name generation seed
    string memory metadataURI,  // IPFS metadata
    uint256[2] memory _parents  // Parent cats
) public onlyOwner returns (uint256) {
    // Mint NFT to specific address
    _safeMint(to, tokenId);
    
    // Store on-chain data
    dna[tokenId] = _dna;
    nameSeed[tokenId] = _seed;
    birthTimestamp[tokenId] = block.timestamp;
    parents[tokenId] = _parents;
    
    return tokenId;
}
```

---

## 🎯 **Key Components**

### **1. Wallet Linking System**
- **Players must link wallet** before they can tame cats
- **Wallet addresses stored** in server database
- **Validation on taming** ensures only linked players can claim

### **2. Taming Event Handler**
```java
@EventHandler
public void onCatTame(EntityTameEvent event) {
    // Check if this is a BlockCat
    if (!spawnManager.isBlockCat(cat)) return;
    
    // Check if player has linked wallet
    if (!walletManager.hasWallet(player)) {
        // Cancel taming, show error
        event.setCancelled(true);
        return;
    }
    
    // Get player's wallet and proceed with minting
    final String wallet = walletManager.getWallet(player);
    apiClient.claimCat(wallet, catUuid);
}
```

### **3. API Integration**
```java
public CompletableFuture<ClaimResponse> claimCat(String wallet, String catUuid) {
    // Send POST request to backend with:
    // - wallet: player's Ethereum address
    // - catUuid: unique cat identifier
    
    // Backend responds with:
    // - success: boolean
    // - tokenId: minted NFT token ID
    // - transactionHash: blockchain transaction
}
```

### **4. Smart Contract Integration**
```solidity
// Backend calls this function to mint NFT
mintCat(
    to,           // Player's wallet address
    _dna,         // Generated cat DNA
    _seed,        // Name generation seed
    metadataURI,  // IPFS metadata
    _parents      // Parent cats
)
```

---

## 🔐 **Security & Validation**

### **Wallet Requirement Enforcement**
- **No wallet = No taming** - System prevents taming without wallet
- **Event cancellation** - `event.setCancelled(true)` stops taming
- **Clear error messages** - Players know exactly what to do

### **Backend Validation**
- **API secret authentication** - Only authorized servers can mint
- **Daily limits** - Maximum 10 cats per day globally
- **Player limits** - One cat per player per day
- **First-to-tame wins** - Only first player gets the NFT

### **Smart Contract Security**
- **Only owner can mint** - Backend has exclusive minting rights
- **Daily limit enforcement** - Contract enforces MAX_DAILY_MINTS
- **On-chain DNA storage** - All traits stored on blockchain
- **Event emission** - All mints logged for transparency

---

## 🎮 **Player Experience**

### **Successful Taming Flow**
```
1. Player links wallet: /linkwallet 0x...
2. BlockCat spawns on server
3. Player tames cat with fish
4. System validates wallet
5. Backend mints NFT to player's wallet
6. Player receives confirmation with token ID
7. Cat added to player's collection
8. Player can view NFT in their wallet
```

### **Error Handling**
```
Player without wallet tries to tame:
→ Taming cancelled
→ Error message: "You need a linked wallet!"
→ Guidance: "Use /linkwallet <address>"

Player with wallet tames cat:
→ NFT minted to their wallet
→ Confirmation: "You claimed BlockCat #123!"
→ Transaction hash provided
→ Cat added to collection
```

---

## 📊 **Data Flow**

### **1. Wallet Linking**
```
Player: /linkwallet 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
→ Server stores: player_uuid -> wallet_address
→ Validation: Ethereum address format
→ Confirmation: "Wallet linked successfully!"
```

### **2. Cat Taming**
```
Player tames BlockCat with fish
→ Server checks: player_uuid -> wallet_address
→ API call: {wallet: "0x...", catUuid: "..."}
→ Backend mints NFT to wallet
→ Response: {success: true, tokenId: 123, txHash: "0x..."}
→ Player gets confirmation
```

### **3. NFT Ownership**
```
NFT minted to: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
→ Player owns NFT in their wallet
→ Can view on OpenSea, etc.
→ Can transfer to other wallets
→ On-chain DNA and metadata
```

---

## 🚀 **Backend Requirements**

### **API Endpoints**
- **`POST /api/minecraft/spawn`** - Check if cat can spawn
- **`POST /api/minecraft/claim`** - Mint NFT to specific wallet

### **Backend Responsibilities**
1. **Validate API requests** with secret authentication
2. **Generate cat DNA** with random traits
3. **Create IPFS metadata** with cat information
4. **Call smart contract** to mint NFT to specific wallet
5. **Return confirmation** with token ID and transaction hash

### **Smart Contract Integration**
- **Contract address**: `0xC585c0ee9eDe4f35dbA97513570f9351d2B634E9`
- **Network**: Polygon Amoy Testnet
- **Function**: `mintCat(address to, ...)`
- **Owner**: Backend wallet (has minting rights)

---

## 🎯 **Summary**

**YES! The server WILL mint cats to specific wallets when players pet them with fish.**

### **How it works:**
1. ✅ **Player links wallet** with `/linkwallet <address>`
2. ✅ **Player tames BlockCat** with fish
3. ✅ **System validates wallet** is linked
4. ✅ **API calls backend** with player's wallet address
5. ✅ **Backend mints NFT** to player's wallet via smart contract
6. ✅ **Player receives confirmation** with token ID and transaction hash
7. ✅ **NFT appears in player's wallet** and can be viewed on OpenSea

### **Security features:**
- ✅ **Wallet requirement enforced** - No taming without wallet
- ✅ **Daily limits** - 10 cats per day globally, 1 per player
- ✅ **First-to-tame wins** - Only first player gets the NFT
- ✅ **On-chain DNA storage** - All traits stored on blockchain
- ✅ **Event logging** - All mints logged for transparency

**The BlockCats minting system is fully functional and ready for players!** 🪙🐱⛓️
