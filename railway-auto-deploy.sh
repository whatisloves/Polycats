#!/bin/bash

# BlockCats Railway Auto-Deployment Script
echo "🚂 BlockCats Railway Auto-Deployment"
echo "====================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

echo "🔐 Please login to Railway first:"
echo "   Run: railway login"
echo "   Follow the browser authentication"
echo ""

# Create new Railway project
echo "📦 Creating Railway project..."
railway project new blockcats

# Deploy backend service
echo "🚀 Deploying backend service..."
railway service new backend

# Set backend environment variables
echo "⚙️  Setting backend environment variables..."
railway variables set NODE_ENV=production --service backend
railway variables set PORT=3000 --service backend
railway variables set POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology --service backend
railway variables set DEPLOYER_PRIVATE_KEY=0x7acc9a5d79c4e13f1e6e47362d9de7df50289bb57a72ffb0c7e0b32c16aaaaac --service backend
railway variables set ETHERSCAN_API_KEY=TMSAH6XD1FYN7ENYPAZGAV8WXKZ9W1H23X --service backend
railway variables set CONTRACT_ADDRESS=0xC585c0ee9eDe4f35dbA97513570f9351d2B634E9 --service backend

# Deploy backend
echo "🚀 Deploying backend from Docker Hub..."
railway up --service backend

# Get backend URL
echo "🌐 Getting backend URL..."
BACKEND_URL=$(railway domain --service backend)
echo "Backend URL: $BACKEND_URL"

# Deploy Minecraft service
echo "🎮 Deploying Minecraft service..."
railway service new minecraft

# Set Minecraft environment variables
echo "⚙️  Setting Minecraft environment variables..."
railway variables set JAVA_OPTS=-Xmx2G -Xms1G --service minecraft
railway variables set SERVER_PORT=25565 --service minecraft
railway variables set API_URL=$BACKEND_URL --service minecraft

# Deploy Minecraft
echo "🚀 Deploying Minecraft from Docker Hub..."
railway up --service minecraft

# Get Minecraft URL
echo "🌐 Getting Minecraft URL..."
MINECRAFT_URL=$(railway domain --service minecraft)
echo "Minecraft URL: $MINECRAFT_URL"

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "======================"
echo "🔗 Backend API: $BACKEND_URL"
echo "🎮 Minecraft Server: $MINECRAFT_URL:25565"
echo ""
echo "📱 Connect to your server:"
echo "   Server Address: $MINECRAFT_URL:25565"
echo "   Server Name: BlockCats Railway Server"
echo ""
echo "🧪 Test your API:"
echo "   curl $BACKEND_URL/api/minecraft/spawn"
echo ""
echo "🎮 Your BlockCats server is now live on Railway! 🐱⚔️"
