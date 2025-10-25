# 🚂 Railway Deployment Guide

This guide will help you deploy the BlockCats project to Railway, making your Minecraft server and API publicly accessible.

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Have your blockchain configuration ready

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add Docker and Railway configuration"
   git push origin main
   ```

2. **Verify Files**:
   - `web/Dockerfile` ✅
   - `minecraft-server/Dockerfile` ✅
   - `docker-compose.yml` ✅
   - `railway.json` ✅
   - `railway-minecraft.json` ✅

### Step 2: Deploy Backend API

1. **Go to Railway Dashboard**: [railway.app/dashboard](https://railway.app/dashboard)

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Backend Service**:
   - **Service Name**: `blockcats-backend`
   - **Root Directory**: `/web`
   - **Build Command**: `npm run build`
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

### Step 3: Deploy Minecraft Server

1. **Add New Service**:
   - In the same Railway project
   - Click "New Service"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Minecraft Service**:
   - **Service Name**: `blockcats-minecraft`
   - **Root Directory**: `/minecraft-server`
   - **Build Command**: `docker build -t minecraft .`
   - **Start Command**: `java -Xmx2G -Xms1G -jar paper.jar nogui`

3. **Set Environment Variables**:
   ```
   JAVA_OPTS=-Xmx2G -Xms1G
   SERVER_PORT=25565
   ```

4. **Deploy**: Click "Deploy" and wait for build to complete

### Step 4: Configure Networking

1. **Get Backend URL**:
   - Copy the Railway-generated URL for your backend service
   - Example: `https://blockcats-backend-production.up.railway.app`

2. **Update Minecraft Plugin Config**:
   - In Railway dashboard, go to Minecraft service
   - Add environment variable:
   ```
   API_URL=https://your-backend-url.railway.app
   ```

3. **Get Minecraft Server URL**:
   - Copy the Railway-generated URL for your Minecraft service
   - Example: `blockcats-minecraft-production.up.railway.app:25565`

## 🔧 Configuration Files

### Backend Environment Variables
```bash
NODE_ENV=production
PORT=3000
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
DEPLOYER_PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
CONTRACT_ADDRESS=0xC585c0ee9eDe4f35dbA97513570f9351d2B634E9
```

### Minecraft Environment Variables
```bash
JAVA_OPTS=-Xmx2G -Xms1G
SERVER_PORT=25565
API_URL=https://your-backend-url.railway.app
```

## 🌐 Public Access

After deployment, your services will be available at:

- **Backend API**: `https://your-backend-url.railway.app`
- **Minecraft Server**: `your-minecraft-url.railway.app:25565`

## 📱 Connecting to Your Server

1. **Open Minecraft 1.21.10**
2. **Add Server**:
   - Server Name: `BlockCats Public Server`
   - Server Address: `your-minecraft-url.railway.app:25565`
3. **Connect** and start playing!

## 🔍 Monitoring

- **Railway Dashboard**: Monitor service health and logs
- **Backend Logs**: Check API requests and responses
- **Minecraft Logs**: Monitor server performance and player activity

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Dockerfile syntax
   - Verify all files are in correct directories
   - Check Railway build logs

2. **Connection Issues**:
   - Verify environment variables are set
   - Check that both services are running
   - Ensure ports are properly exposed

3. **Plugin Issues**:
   - Verify BlockCatsPlugin.jar is in the plugins directory
   - Check Minecraft server logs for plugin errors
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

## 🎮 Testing Your Deployment

1. **Test Backend API**:
   ```bash
   curl https://your-backend-url.railway.app/api/minecraft/spawn
   ```

2. **Test Minecraft Server**:
   - Connect with Minecraft client
   - Try commands: `/help`, `/linkwallet`, `/status`

3. **Test Full Flow**:
   - Link wallet: `/linkwallet <address>`
   - Wait for cat spawn
   - Tame cat with fish
   - Check collection: `/mycats`

## 🚀 Next Steps

- **Custom Domain**: Add custom domain in Railway settings
- **SSL Certificate**: Railway provides automatic SSL
- **Scaling**: Adjust resource allocation in Railway dashboard
- **Monitoring**: Set up alerts and monitoring

Your BlockCats server is now publicly accessible! 🐱⚔️
