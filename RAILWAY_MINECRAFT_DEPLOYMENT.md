# 🎮 Railway Minecraft Server Deployment

## 🚀 **Step-by-Step Deployment Guide**

### **Step 1: Access Railway Dashboard**
1. Go to [railway.app/dashboard](https://railway.app/dashboard)
2. Find your **"BlockCats"** project
3. Click on the project to open it

### **Step 2: Add Minecraft Service**
1. Click **"Add Service"** button
2. Select **"Deploy from Docker Hub"**
3. Enter the Docker Hub image: `wapiozi/blockcats-minecraft:latest`
4. Click **"Deploy"**

### **Step 3: Configure Service**
1. **Service Name**: `blockcats-minecraft`
2. **Port**: `25565` (Minecraft default port)

### **Step 4: Set Environment Variables**
Click on the service and go to **"Variables"** tab, then add:

```
JAVA_OPTS=-Xmx2G -Xms1G
SERVER_PORT=25565
API_URL=https://blockcats-production.up.railway.app
```

### **Step 5: Deploy**
1. Click **"Deploy"** button
2. Wait for the deployment to complete
3. Check the logs to ensure it's running properly

## 🌐 **After Deployment**

### **Your Server URLs:**
- **Backend API**: `https://blockcats-production.up.railway.app`
- **Minecraft Server**: `blockcats-minecraft-production.up.railway.app:25565`

### **Minecraft Connection Details:**
- **Server Address**: `blockcats-minecraft-production.up.railway.app:25565`
- **Server Name**: BlockCats Railway Server
- **Version**: Minecraft 1.21.10
- **Gamemode**: Creative

## 🧪 **Test Your Deployment**

### **Test Backend API:**
```bash
curl -X POST https://blockcats-production.up.railway.app/api/minecraft/spawn \
  -H "X-Plugin-Secret: dev-secret-12345" \
  -H "Content-Type: application/json"
```

### **Connect to Minecraft:**
1. Open Minecraft 1.21.10
2. Click "Multiplayer"
3. Click "Add Server"
4. **Server Name**: BlockCats Railway Server
5. **Server Address**: `blockcats-minecraft-production.up.railway.app:25565`
6. Click "Done" and "Join Server"

## 🎮 **Features Available**

### **PvP Breeding Battle System:**
- `/challenge <player> breeding` - Challenge players to breeding battles
- `/accept` / `/decline` - Handle battle challenges
- `/deletecat <name>` - Manage your cat collection

### **All Commands Work:**
- `/linkwallet <address>` - Link your blockchain wallet
- `/mycats` - View your collected cats
- `/choosecat <name>` - Choose active cat (with buffs!)
- `/help` - Show all available commands

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Service Not Starting:**
   - Check Railway logs for errors
   - Verify environment variables are set correctly
   - Ensure Docker Hub image is accessible

2. **Connection Issues:**
   - Verify the server port is exposed (25565)
   - Check that API_URL points to correct backend
   - Ensure both services are running

3. **Plugin Issues:**
   - Check Minecraft server logs for plugin errors
   - Verify BlockCatsPlugin.jar is included in the image
   - Ensure API URL is correctly configured

### **Useful Commands:**

```bash
# Check service status
railway status

# View logs
railway logs

# Connect to service
railway shell
```

## 🎯 **Your BlockCats Server is Ready!**

Once deployed, your BlockCats server will be live on Railway with:
- ✅ Backend API for blockchain integration
- ✅ Minecraft server with PvP breeding battles
- ✅ Cat collection and management system
- ✅ Real NFT minting on Polygon Amoy testnet

🐱⚔️🚂 **Welcome to BlockCats on Railway!**
