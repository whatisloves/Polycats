# 🚀 BlockCats Developer Setup Guide

## Quick Start for New Developers

### 1. **Clone and Checkout Branch**

```bash
git clone git@github.com:whatisloves/bishkekjam.git
cd cryptojam
git checkout feature/cat-collection-system
```

### 2. **Build the Minecraft Plugin**

```bash
cd BlockCatsPlugin
mvn clean package -DskipTests
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

# Download Paper server (1.21.1)
curl -L -o paper.jar https://api.papermc.io/v2/projects/paper/versions/1.21.1/builds/119/downloads/paper-1.21.1-119.jar

# Accept EULA
echo "eula=true" > eula.txt

# Create plugins directory
mkdir -p plugins

# Copy plugin
cp /Users/whatisloves/cryptojam/BlockCatsPlugin/target/BlockCatsPlugin.jar plugins/

# Start server (first time will generate world)
java -Xmx2G -Xms2G -jar paper.jar nogui
```

### 4. **Configure Server for Development**

#### **Enable Creative Mode**

```bash
# Edit server.properties (macOS)
sed -i '' 's/gamemode=.*/gamemode=creative/' ~/minecraft-server/server.properties

# Or manually edit server.properties and set:
# gamemode=creative
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
# ETHERSCAN_API_KEY=your_etherscan_api_key
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
/help - Show comprehensive help with all commands
/status - Check your wallet status
/linkwallet <address> - Link your wallet
/unlinkwallet - Unlink your wallet
/mycats - View your collected cats
/choosecat <name> - Choose active cat
/deletecat <name> - Delete a cat from collection
/confirmdelete - Confirm cat deletion
/challenge <player> breeding - Challenge to breeding battle
/accept - Accept pending challenge
/decline - Decline pending challenge
/bcadmin <subcommand> - Admin commands (OP only)
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
- Use `/bcadmin spawn` command to manually spawn (OP only)
- Default spawn interval is 1 minute

## 📁 **File Structure**

```
cryptojam/
├── BlockCatsPlugin/          # Minecraft plugin source
│   ├── src/main/java/       # Java source code
│   ├── src/main/resources/  # Plugin config & plugin.yml
│   └── target/
│       └── BlockCatsPlugin.jar  # Built plugin (3.4MB)
├── web/                     # Next.js API
│   ├── src/app/api/         # API routes
│   └── package.json
├── contracts/               # Smart contracts
│   └── BlockCatsNFT.sol
├── .env.example            # Environment template
├── DEVELOPER_SETUP.md      # This guide
└── GAME_DESIGN_V2.md       # Full game design doc
```

## 🎯 **Development Workflow**

### **Making Changes**

1. Edit plugin code in `BlockCatsPlugin/src/`
2. Rebuild: `cd BlockCatsPlugin && mvn clean package -DskipTests`
3. Copy to server: `cp target/BlockCatsPlugin.jar ~/minecraft-server/plugins/`
4. Restart server: `pkill -f paper.jar && cd ~/minecraft-server && java -Xmx2G -Xms2G -jar paper.jar nogui > /dev/null 2>&1 &`

### **Testing Changes**

1. Connect to server: `localhost:25565`
2. Test commands and features (use `/help` for full list)
3. Check server logs: `tail -f ~/minecraft-server/logs/latest.log`
4. Test NFT minting flow
5. Test breeding battles with another player

## 🚀 **Ready to Develop!**

Once set up, you'll have:

- ✅ **Minecraft server** with BlockCats plugin v1.0.0
- ✅ **Creative mode** enabled by default
- ✅ **All commands** working (12+ commands)
- ✅ **NFT minting** system ready
- ✅ **API server** running on port 3000
- ✅ **Breeding battles** system
- ✅ **Cat collection** management (max 5 cats)
- ✅ **Buff system** based on cat DNA stats

## 🎮 **Key Features**

- **Auto-spawning cats** every 1 minute
- **Comprehensive `/help`** command with all features
- **PvP breeding battles** with 5-minute time limit
- **Cat buffs** that affect combat (Speed, Strength, Resistance, etc.)
- **Collection management** with active cat selection
- **Admin commands** via `/bcadmin`

Happy coding! 🐱⛓️
