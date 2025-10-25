# 🚀 BlockCats Developer Setup Guide

## Quick Start for New Developers

### 1. **Clone and Checkout Branch**
```bash
git clone https://github.com/whatisloves/bishkekjam.git
cd bishkekjam
git checkout feature/cat-collection-system
```

### 2. **Build the Minecraft Plugin**
```bash
cd BlockCatsPlugin
mvn clean package
```

### 3. **Set Up Minecraft Server**

#### **Option A: Use Existing Server (Recommended)**
```bash
# Copy the built plugin to your server
cp target/BlockCatsPlugin.jar ~/minecraft-server/plugins/
```

#### **Option B: Create New Server**
```bash
# Create server directory
mkdir ~/minecraft-server
cd ~/minecraft-server

# Download Paper server
curl -L -o paper.jar https://api.papermc.io/v2/projects/paper/versions/1.21.10/builds/85/downloads/paper-1.21.10-85.jar

# Accept EULA
echo "eula=true" > eula.txt

# Copy plugin
cp /path/to/bishkekjam/BlockCatsPlugin/target/BlockCatsPlugin.jar plugins/

# Start server
java -Xmx2G -Xms2G -jar paper.jar nogui
```

### 4. **Configure Server for Development**

#### **Enable Creative Mode**
```bash
# Edit server.properties
sed -i 's/gamemode=survival/gamemode=creative/' ~/minecraft-server/server.properties
sed -i 's/force-gamemode=false/force-gamemode=true/' ~/minecraft-server/server.properties
```

#### **Set Server IP (Optional)**
```bash
# Edit server.properties to allow connections
echo "server-ip=" >> ~/minecraft-server/server.properties
```

### 5. **Set Up Backend API**

#### **Install Dependencies**
```bash
cd web
npm install
```

#### **Configure Environment**
```bash
# Copy environment template
cp ../.env.example .env.local

# Edit .env.local with your settings:
# DEPLOYER_PRIVATE_KEY=your_private_key_here
# POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
# CONTRACT_ADDRESS=0xC585c0ee9eDe4f35dbA97513570f9351d2B634E9
```

#### **Start API Server**
```bash
npm run dev
```

### 6. **Test the Setup**

#### **Connect to Minecraft**
- **Server**: `localhost:25565`
- **Mode**: Creative (automatically set)
- **Commands**: All BlockCats commands available

#### **Available Commands**
```
/status - Check your wallet status
/linkwallet <address> - Link your wallet
/unlinkwallet - Unlink your wallet
/mycats - View your collected cats
/choosecat <name> - Choose active cat
/help - Show all commands
```

#### **Test NFT Minting**
1. Link your wallet: `/linkwallet 0xYourAddress`
2. Find a BlockCat (glowing, named "⛓️ BlockCat")
3. Right-click with raw fish to tame
4. Watch the NFT mint to your wallet!

## 🔧 **Troubleshooting**

### **Commands Not Working**
- Make sure the plugin JAR is in `~/minecraft-server/plugins/`
- Restart the server after adding the plugin
- Check server logs for plugin loading errors

### **Creative Mode Not Working**
- Check `server.properties` has `gamemode=creative`
- Restart the server after changing settings
- Use `/gamemode creative` in-game as admin

### **API Not Working**
- Make sure the API server is running (`npm run dev`)
- Check environment variables are set
- Test with: `curl http://localhost:3000/api/test-mint`

### **No Cats Spawning**
- Check server logs for spawn messages
- Verify API connection in logs
- Use `/spawncat` command to manually spawn

## 📁 **File Structure**
```
bishkekjam/
├── BlockCatsPlugin/          # Minecraft plugin source
│   └── target/
│       └── BlockCatsPlugin.jar  # Built plugin
├── web/                     # Next.js API
├── contracts/               # Smart contracts
├── .env.example            # Environment template
└── DEVELOPER_SETUP.md      # This guide
```

## 🎯 **Development Workflow**

### **Making Changes**
1. Edit plugin code in `BlockCatsPlugin/src/`
2. Rebuild: `mvn clean package`
3. Copy to server: `cp target/BlockCatsPlugin.jar ~/minecraft-server/plugins/`
4. Restart server

### **Testing Changes**
1. Connect to server: `localhost:25565`
2. Test commands and features
3. Check server logs for errors
4. Test NFT minting flow

## 🚀 **Ready to Develop!**

Once set up, you'll have:
- ✅ **Minecraft server** with BlockCats plugin
- ✅ **Creative mode** enabled
- ✅ **All commands** working
- ✅ **NFT minting** system ready
- ✅ **API server** running

Happy coding! 🐱⛓️
