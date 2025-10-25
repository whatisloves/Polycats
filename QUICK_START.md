# 🚀 BlockCats Quick Start

## For New Developers

### **1. Clone and Setup**
```bash
git clone https://github.com/whatisloves/bishkekjam.git
cd bishkekjam
git checkout feature/cat-collection-system
```

### **2. Run Setup Script**
```bash
./setup-dev-server.sh
```

### **3. Start Everything**
```bash
# Terminal 1: Start Minecraft Server
cd ~/minecraft-server
java -Xmx2G -Xms2G -jar paper.jar nogui

# Terminal 2: Start API Server
cd bishkekjam/web
npm run dev
```

### **4. Connect and Test**
- **Minecraft**: Connect to `localhost:25565`
- **Mode**: Creative (automatically set)
- **Commands**: All BlockCats commands available

## 🎮 **Available Commands**
- `/status` - Check wallet status
- `/linkwallet <address>` - Link your wallet
- `/mycats` - View your cats
- `/help` - Show all commands

## 🐱 **How to Test**
1. Link wallet: `/linkwallet 0xYourAddress`
2. Find glowing BlockCat
3. Right-click with raw fish
4. Watch NFT mint to your wallet!

## 📖 **Full Documentation**
See `DEVELOPER_SETUP.md` for detailed instructions.

---
**Ready to develop!** 🚀
