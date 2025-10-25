# 🚂 Railway Manual Deployment Guide

Since Railway CLI requires interactive authentication, here's the step-by-step process:

## 🔐 Step 1: Login to Railway

```bash
cd /Users/wapi/hackathon/bishkekjam
railway login
```

This will open your browser for authentication. Complete the login process.

## 🚀 Step 2: Run Auto-Deployment

After logging in, run:

```bash
./railway-auto-deploy.sh
```

## 📋 Alternative: Manual Deployment Steps

If you prefer to do it manually:

### 1. Create Railway Project
```bash
railway project new blockcats
```

### 2. Deploy Backend Service
```bash
# Create backend service
railway service new backend

# Set environment variables
railway variables set NODE_ENV=production --service backend
railway variables set PORT=3000 --service backend
railway variables set POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology --service backend
railway variables set DEPLOYER_PRIVATE_KEY=0x7acc9a5d79c4e13f1e6e47362d9de7df50289bb57a72ffb0c7e0b32c16aaaaac --service backend
railway variables set ETHERSCAN_API_KEY=TMSAH6XD1FYN7ENYPAZGAV8WXKZ9W1H23X --service backend
railway variables set CONTRACT_ADDRESS=0xC585c0ee9eDe4f35dbA97513570f9351d2B634E9 --service backend

# Deploy backend
railway up --service backend
```

### 3. Deploy Minecraft Service
```bash
# Create Minecraft service
railway service new minecraft

# Get backend URL first
BACKEND_URL=$(railway domain --service backend)

# Set environment variables
railway variables set JAVA_OPTS=-Xmx2G -Xms1G --service minecraft
railway variables set SERVER_PORT=25565 --service minecraft
railway variables set API_URL=$BACKEND_URL --service minecraft

# Deploy Minecraft
railway up --service minecraft
```

### 4. Get Service URLs
```bash
# Get URLs
railway domain --service backend
railway domain --service minecraft
```

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

# Check service status
railway status
```

## 🔧 Troubleshooting

### Common Issues:

1. **Authentication Required**: Make sure you run `railway login` first
2. **Service Not Starting**: Check logs with `railway logs --service backend`
3. **Environment Variables**: Verify all required variables are set
4. **Docker Hub Images**: Ensure images are publicly available

### Useful Commands:

```bash
# Check service status
railway status

# View logs
railway logs --service backend
railway logs --service minecraft

# Connect to service
railway shell --service backend
```

## 🎯 Next Steps

- **Custom Domain**: Add custom domain in Railway dashboard
- **SSL Certificate**: Railway provides automatic SSL
- **Monitoring**: Set up alerts and monitoring
- **Scaling**: Adjust resource allocation as needed

Your BlockCats server will be live on Railway! 🐱⚔️🚂
