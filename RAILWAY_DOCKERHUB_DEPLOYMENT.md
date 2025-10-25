# 🚂 Railway Deployment with Docker Hub Images

This guide will help you deploy BlockCats to Railway using your Docker Hub images.

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Docker Hub Images**: Already pushed to `wapiozi/blockcats-backend:latest` and `wapiozi/blockcats-minecraft:latest`
3. **GitHub Repository**: Your code should be in a Git repository

## 🚀 Deployment Steps

### Step 1: Deploy Backend API

1. **Go to Railway Dashboard**: [railway.app/dashboard](https://railway.app/dashboard)

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `maximillian/BlockCats` repository

3. **Configure Backend Service**:
   - **Service Name**: `blockcats-backend`
   - **Root Directory**: `/` (root)
   - **Build Command**: `docker build -f Dockerfile.railway -t blockcats-backend .`
   - **Start Command**: `npm start`

4. **Set Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
   DEPLOYER_PRIVATE_KEY=your_private_key_here
   ETHERSCAN_API_KEY=your_etherscan_api_key
   CONTRACT_ADDRESS=0xC585c0ee9eDe4f35dbA97513570f9351d2B634E9
   ```

5. **Deploy**: Click "Deploy" and wait for build to complete

### Step 2: Deploy Minecraft Server

1. **Add New Service**:
   - In the same Railway project
   - Click "New Service"
   - Select "Deploy from GitHub repo"
   - Choose your `maximillian/BlockCats` repository

2. **Configure Minecraft Service**:
   - **Service Name**: `blockcats-minecraft`
   - **Root Directory**: `/` (root)
   - **Build Command**: `docker build -f Dockerfile.minecraft.railway -t blockcats-minecraft .`
   - **Start Command**: `java -Xmx2G -Xms1G -jar paper.jar nogui`

3. **Set Environment Variables**:
   ```
   JAVA_OPTS=-Xmx2G -Xms1G
   SERVER_PORT=25565
   API_URL=https://your-backend-url.railway.app
   ```

4. **Deploy**: Click "Deploy" and wait for build to complete

## 🔧 Alternative: Direct Docker Hub Deployment

If you prefer to use Railway's Docker Hub integration:

### Backend Service
1. **Create New Service**
2. **Select "Deploy from Docker Hub"**
3. **Image**: `wapiozi/blockcats-backend:latest`
4. **Set Environment Variables** (same as above)

### Minecraft Service
1. **Create New Service**
2. **Select "Deploy from Docker Hub"**
3. **Image**: `wapiozi/blockcats-minecraft:latest`
4. **Set Environment Variables** (same as above)

## 🌐 After Deployment

**Your Public URLs:**
- **Backend API**: `https://blockcats-backend-production.up.railway.app`
- **Minecraft Server**: `blockcats-minecraft-production.up.railway.app:25565`

## 📱 Connecting to Your Server

1. **Open Minecraft 1.21.10**
2. **Add Server**:
   - Server Name: `BlockCats Railway Server`
   - Server Address: `blockcats-minecraft-production.up.railway.app:25565`
3. **Connect** and start playing!

## 🎮 Features Available

**PvP Breeding Battle System:**
- `/challenge <player> breeding` - Challenge players
- `/accept` / `/decline` - Handle challenges
- `/deletecat <name>` - Manage collection

**All Commands Work:**
- `/linkwallet <address>` - Link blockchain wallet
- `/mycats` - View collected cats
- `/choosecat <name>` - Choose active cat (with buffs!)
- `/help` - Show all commands

## 🔍 Monitoring

- **Railway Dashboard**: Monitor service health and logs
- **Backend Logs**: Check API requests and responses
- **Minecraft Logs**: Monitor server performance and player activity

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Docker Hub image availability
   - Verify environment variables are set
   - Check Railway build logs

2. **Connection Issues**:
   - Verify both services are running
   - Check that API_URL points to correct backend
   - Ensure ports are properly exposed

3. **Plugin Issues**:
   - Check Minecraft server logs for plugin errors
   - Verify BlockCatsPlugin.jar is included in image
   - Ensure API URL is correctly configured

### Useful Commands:

```bash
# Check service status
railway status

# View logs
railway logs

# Connect to service
railway shell
```

## 🚀 Next Steps

- **Custom Domain**: Add custom domain in Railway settings
- **SSL Certificate**: Railway provides automatic SSL
- **Scaling**: Adjust resource allocation in Railway dashboard
- **Monitoring**: Set up alerts and monitoring

Your BlockCats server is now publicly accessible on Railway! 🐱⚔️🚂
