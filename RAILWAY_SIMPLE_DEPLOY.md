# 🚂 Railway Simple Deployment Guide

Since Railway CLI has changed, here's the simplest approach:

## 🚀 Method 1: Railway Dashboard (Recommended)

### Step 1: Go to Railway Dashboard
1. Visit [railway.app/dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `maximillian/BlockCats` repository

### Step 2: Deploy Backend Service
1. **Service Name**: `blockcats-backend`
2. **Root Directory**: `/` (root)
3. **Build Command**: `docker build -f Dockerfile.railway -t blockcats-backend .`
4. **Start Command**: `npm start`

**Environment Variables:**
```
NODE_ENV=production
PORT=3000
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
DEPLOYER_PRIVATE_KEY=0x7acc9a5d79c4e13f1e6e47362d9de7df50289bb57a72ffb0c7e0b32c16aaaaac
ETHERSCAN_API_KEY=TMSAH6XD1FYN7ENYPAZGAV8WXKZ9W1H23X
CONTRACT_ADDRESS=0xC585c0ee9eDe4f35dbA97513570f9351d2B634E9
```

### Step 3: Deploy Minecraft Service
1. **Service Name**: `blockcats-minecraft`
2. **Root Directory**: `/` (root)
3. **Build Command**: `docker build -f Dockerfile.minecraft.railway -t blockcats-minecraft .`
4. **Start Command**: `java -Xmx2G -Xms1G -jar paper.jar nogui`

**Environment Variables:**
```
JAVA_OPTS=-Xmx2G -Xms1G
SERVER_PORT=25565
API_URL=https://your-backend-url.railway.app
```

## 🚀 Method 2: Direct Docker Hub Integration

### Step 1: Create Backend Service
1. **New Service** → **Deploy from Docker Hub**
2. **Image**: `wapiozi/blockcats-backend:latest`
3. **Set Environment Variables** (same as above)

### Step 2: Create Minecraft Service
1. **New Service** → **Deploy from Docker Hub**
2. **Image**: `wapiozi/blockcats-minecraft:latest`
3. **Set Environment Variables** (same as above)

## 🌐 After Deployment

Your services will be available at:
- **Backend API**: `https://blockcats-backend-production.up.railway.app`
- **Minecraft Server**: `blockcats-minecraft-production.up.railway.app:25565`

## 🎮 Connect to Your Server

1. Open Minecraft 1.21.10
2. Add Server:
   - **Server Name**: BlockCats Railway Server
   - **Server Address**: `blockcats-minecraft-production.up.railway.app:25565`
3. Connect and start playing!

## 🧪 Test Your Deployment

```bash
# Test backend API
curl https://blockcats-backend-production.up.railway.app/api/minecraft/spawn
```

## 🔧 Troubleshooting

### Common Issues:

1. **Build Failures**: Check Docker Hub image availability
2. **Service Not Starting**: Check logs in Railway dashboard
3. **Environment Variables**: Verify all required variables are set
4. **Connection Issues**: Ensure API_URL points to correct backend

### Useful Commands:

```bash
# Check service status
railway status

# View logs
railway logs

# Connect to service
railway shell
```

## 🎯 Next Steps

- **Custom Domain**: Add custom domain in Railway dashboard
- **SSL Certificate**: Railway provides automatic SSL
- **Monitoring**: Set up alerts and monitoring
- **Scaling**: Adjust resource allocation as needed

Your BlockCats server will be live on Railway! 🐱⚔️🚂
