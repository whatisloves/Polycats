# 🎮 BlockCats Server Setup Guide

## Quick Start for Server Administrators

This guide will help you set up a BlockCats server where players can claim NFT cats in Minecraft.

---

## 📋 Prerequisites

- **Minecraft Server**: Paper 1.21+ (recommended)
- **Java**: Version 21 or higher
- **Backend API**: Next.js application (see web/ folder)
- **Blockchain**: Polygon Amoy testnet access

---

## 🚀 Step 1: Download & Install Plugin

### 1.1 Build the Plugin
```bash
cd BlockCatsPlugin
mvn clean package
```

### 1.2 Install on Server
1. Copy `target/BlockCatsPlugin.jar` to your server's `plugins/` folder
2. Start your server to generate configuration files
3. Stop the server

---

## ⚙️ Step 2: Configure the Plugin

### 2.1 Edit Configuration
Edit `plugins/BlockCatsPlugin/config.yml`:

```yaml
# Backend API settings
api:
  url: "https://your-backend.vercel.app"  # Your deployed backend URL
  secret: "your-secure-secret-key-here"   # Random secret for API auth

# Spawn settings
spawn:
  interval-minutes: 30  # How often cats spawn (30 min = normal, 1 min = testing)
  enabled: true

# Messages (customize as needed)
messages:
  prefix: "§6[BlockCats]§r "
  spawn: "§eA new BlockCat appeared at §b{x}, {y}, {z}§e! Be first to tame it!"
  claimed: "§aYou claimed BlockCat #{id}! NFT is being minted..."
  # ... more messages
```

### 2.2 Set Permissions
Add to your permissions plugin (LuckPerms, etc.):
```yaml
# Default permissions (all players)
blockcats.link: true
blockcats.use: true

# Admin permissions (ops only)
blockcats.spawn: true
blockcats.admin: true
```

---

## 🎯 Step 3: Player Commands

### For Players:
- `/linkwallet <address>` - Link wallet to receive NFTs
- `/unlinkwallet` - Unlink current wallet
- `/status` - Check wallet status and info
- `/help` - Show help and commands

### For Admins:
- `/bcadmin reload` - Reload configuration
- `/bcadmin spawn` - Manually spawn a cat
- `/bcadmin status` - Server status
- `/bcadmin players` - List players with wallets
- `/spawncat` - Manual spawn (admin only)

---

## 🔧 Step 4: Backend Setup

### 4.1 Deploy Backend API
```bash
cd web
npm install
npm run build
# Deploy to Vercel, Netlify, or your preferred platform
```

### 4.2 Configure Environment Variables
```bash
# In your backend deployment
CONTRACT_ADDRESS=0x...  # Your deployed contract address
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
DEPLOYER_PRIVATE_KEY=0x...  # Private key for minting
```

### 4.3 Update Plugin Config
Update the `api.url` in your plugin config to point to your deployed backend.

---

## 🧪 Step 5: Testing

### 5.1 Test Commands
1. Start your server
2. Join and test commands:
   ```
   /help
   /linkwallet 0x1234567890123456789012345678901234567890
   /status
   ```

### 5.2 Test Spawning
1. Use admin command: `/bcadmin spawn`
2. Check server logs for spawn messages
3. Look for cat in world with "BlockCat" name

### 5.3 Test Taming
1. Find the spawned cat
2. Right-click with fish to tame
3. Check if NFT minting works (check backend logs)

---

## 📊 Step 6: Server Management

### 6.1 Monitor Activity
- Check `/bcadmin players` to see linked wallets
- Monitor server logs for spawn events
- Watch backend logs for NFT minting

### 6.2 Adjust Settings
- **Spawn Rate**: Change `interval-minutes` in config
- **Daily Limits**: Configured in smart contract (10 cats/day)
- **Player Limits**: 1 cat per player per day

### 6.3 Troubleshooting
- **Plugin not loading**: Check Java version (21+)
- **API errors**: Verify backend URL and secret
- **No spawns**: Check `spawn.enabled: true`
- **Permission errors**: Check permission plugin config

---

## 🎮 Player Experience

### What Players See:
1. **Join server** → Get welcome message
2. **Link wallet** → `/linkwallet 0x...`
3. **Wait for spawn** → Server announces cat location
4. **Race to tame** → First player wins NFT
5. **View collection** → Check https://blockcats.xyz

### Server Announcements:
```
[BlockCats] A new BlockCat appeared at 123, 64, 456! Be first to tame it!
[BlockCats] You claimed BlockCat #5! NFT is being minted...
```

---

## 🔒 Security Notes

### API Security:
- Use strong, random secret keys
- Keep private keys secure
- Monitor for abuse

### Server Security:
- Regular backups of wallet data
- Monitor for duplicate wallets
- Set appropriate permissions

---

## 📈 Performance Tips

### Server Optimization:
- Use Paper server for better performance
- Allocate sufficient RAM (2GB+ recommended)
- Monitor plugin performance

### Spawn Management:
- Adjust spawn intervals based on player count
- Monitor daily limits
- Consider timezone for spawn times

---

## 🆘 Support

### Common Issues:
1. **"Plugin not found"** → Check file in plugins/ folder
2. **"Permission denied"** → Check permission plugin
3. **"API error"** → Verify backend URL and secret
4. **"No spawns"** → Check spawn.enabled setting

### Getting Help:
- Check server logs for errors
- Verify all configuration settings
- Test with admin commands first
- Contact support with specific error messages

---

## 🎉 Success!

Once everything is working:
- Players can link wallets
- Cats spawn automatically
- Taming triggers NFT minting
- Collection viewable on website

**Your BlockCats server is ready for players!** 🐱⛓️
