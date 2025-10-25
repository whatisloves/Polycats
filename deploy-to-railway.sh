#!/bin/bash

# BlockCats Railway Deployment Script
echo "🚂 Deploying BlockCats to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Create new project
echo "📦 Creating Railway project..."
railway project new blockcats

# Deploy backend service
echo "🚀 Deploying backend service..."
cd web
railway service new backend
railway up --service backend
cd ..

# Deploy Minecraft service
echo "🎮 Deploying Minecraft service..."
cd minecraft-server
railway service new minecraft
railway up --service minecraft
cd ..

# Set environment variables
echo "⚙️ Setting environment variables..."
railway variables set NODE_ENV=production --service backend
railway variables set PORT=3000 --service backend
railway variables set POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology --service backend
railway variables set DEPLOYER_PRIVATE_KEY=$DEPLOYER_PRIVATE_KEY --service backend
railway variables set ETHERSCAN_API_KEY=$ETHERSCAN_API_KEY --service backend
railway variables set CONTRACT_ADDRESS=0xC585c0ee9eDe4f35dbA97513570f9351d2B634E9 --service backend

railway variables set JAVA_OPTS=-Xmx2G -Xms1G --service minecraft
railway variables set SERVER_PORT=25565 --service minecraft

# Get service URLs
echo "🌐 Getting service URLs..."
BACKEND_URL=$(railway domain --service backend)
MINECRAFT_URL=$(railway domain --service minecraft)

echo "✅ Deployment complete!"
echo "🔗 Backend API: $BACKEND_URL"
echo "🎮 Minecraft Server: $MINECRAFT_URL:25565"
echo ""
echo "📱 Connect to your server:"
echo "   Server Address: $MINECRAFT_URL:25565"
echo "   Server Name: BlockCats Public Server"
echo ""
echo "🧪 Test your API:"
echo "   curl $BACKEND_URL/api/minecraft/spawn"
