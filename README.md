# BlockCats 🐱⛓️

> A Web3 gaming project that integrates Minecraft gameplay with blockchain technology

BlockCats creates a living, server-controlled collection of unique cats that exist both in-game and as NFTs on the Polygon Amoy testnet.

## 🎮 What is BlockCats?

BlockCats is a Minecraft server where cats spawn automatically, and players race to tame them. Each tamed cat becomes a unique NFT minted to the player's wallet. Unlike typical NFT breeding games, BlockCats prevents economic exploitation through:

- 🎲 **Server-controlled spawning** (not player-controlled)
- 📊 **Global daily spawn limits**
- 👤 **Per-player daily claim limits**
- 🎨 **Pure collectibles** (no financial tokenomics)

## 🚀 Quick Start

### For Players

1. **Join Server**: `play.blockcats.xyz` (when live)
2. **Link Wallet**: `/linkwallet 0xYourAddress`
3. **Wait for Spawn**: Server announces cat locations
4. **Tame & Claim**: First to tame gets the NFT!
5. **View Collection**: Check your cats at [blockcats.xyz](https://blockcats.xyz)

### For Developers

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/blockcats.git
cd blockcats

# Setup web frontend
cd web
npm install
npm run dev

# Setup Minecraft plugin
cd BlockCatsPlugin
mvn clean package
# Copy target/BlockCatsPlugin.jar to server plugins/ folder
```

## 🏗️ Architecture

```
Minecraft Server (Paper)
    ↓ HTTP API
Next.js Backend (Vercel)
    ↓ Web3
Polygon Amoy Testnet + IPFS
    ↓
Gallery Website (Next.js)
```

## 🛠️ Tech Stack

- **Minecraft**: Paper 1.20.x server + Java plugin
- **Smart Contract**: Solidity 0.8.20 + Hardhat
- **Backend**: Next.js 14 + TypeScript
- **Frontend**: Next.js + wagmi + RainbowKit
- **Blockchain**: Polygon Amoy testnet
- **Storage**: IPFS (Pinata)

## 📁 Project Structure

```
cryptojam/
├── SPEC.md              # Complete technical specification
├── web/                 # Next.js frontend + API
│   ├── src/
│   │   ├── app/         # Pages and API routes
│   │   └── ...
│   └── package.json
├── BlockCatsPlugin/     # Minecraft server plugin
│   ├── src/main/java/
│   ├── pom.xml
│   └── ...
└── README.md
```

## 📖 Documentation

- **[SPEC.md](./SPEC.md)** - Complete technical specification
- **[MINECRAFT_SETUP.md](./MINECRAFT_SETUP.md)** - Minecraft server setup guide
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing instructions

## 🎯 Game Mechanics

### Spawn System

- Cats spawn automatically every 30 minutes
- Global limit: 10 cats per day
- Server broadcasts location in chat
- First player to tame wins

### Anti-Abuse Rules

- Per-player limit: 1 cat per day
- No player-controlled breeding
- Server-side spawn control only
- No financial incentives

## 🔐 Smart Contract

**Network**: Polygon Amoy Testnet  
**Contract**: BlockCatsNFT (ERC-721)  
**Address**: `0x...` (to be deployed)

Features:

- Immutable DNA storage
- Lineage tracking (parent IDs)
- Birth timestamps
- IPFS metadata URIs

## 🌐 API Endpoints

- `POST /api/minecraft/spawn` - Check spawn availability
- `POST /api/minecraft/claim` - Mint NFT for tamed cat
- `GET /api/cats` - Get all minted cats
- `GET /api/cat/[id]` - Get individual cat details

## 🤝 Contributing

This is a hackathon project! Contributions welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Built for [Hackathon Name]
- Paper/Spigot community
- Polygon team for Amoy testnet
- OpenZeppelin for contract libraries

## 📞 Contact

- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- Project: [BlockCats](https://github.com/YOUR_USERNAME/blockcats)

---

**⚠️ Note**: This is a testnet project for demonstration purposes. Use at your own risk.
