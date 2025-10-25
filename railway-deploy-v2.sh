#!/bin/bash

# BlockCats Railway Deployment Script v2
echo "🚂 BlockCats Railway Deployment v2"
echo "=================================="

# Initialize Railway project
echo "📦 Initializing Railway project..."
railway init

# Create backend service
echo "🚀 Creating backend service..."
railway add

# Set backend environment variables
echo "⚙️  Setting backend environment variables..."
railway variables --set "NODE_ENV=production" --set "PORT=3000" --set "POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology" --set "DEPLOYER_PRIVATE_KEY=0x7acc9a5d79c4e13f1e6e47362d9de7df50289bb57a72ffb0c7e0b32c16aaaaac" --set "ETHERSCAN_API_KEY=TMSAH6XD1FYN7ENYPAZGAV8WXKZ9W1H23X" --set "CONTRACT_ADDRESS=0xC585c0ee9eDe4f35dbA97513570f9351d2B634E9"

# Deploy backend
echo "🚀 Deploying backend..."
railway up

# Get backend URL
echo "🌐 Getting backend URL..."
BACKEND_URL=$(railway domain)
echo "Backend URL: $BACKEND_URL"

# Create Minecraft service
echo "🎮 Creating Minecraft service..."
railway add

# Set Minecraft environment variables
echo "⚙️  Setting Minecraft environment variables..."
railway variables --set "JAVA_OPTS=-Xmx2G -Xms1G" --set "SERVER_PORT=25565" --set "API_URL=$BACKEND_URL"

# Deploy Minecraft
echo "🚀 Deploying Minecraft..."
railway up

# Get Minecraft URL
echo "🌐 Getting Minecraft URL..."
MINECRAFT_URL=$(railway domain)
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
