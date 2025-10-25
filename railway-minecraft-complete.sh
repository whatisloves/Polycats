#!/bin/bash

# BlockCats Minecraft Complete Railway Deployment
echo "🎮 BlockCats Minecraft Complete Deployment"
echo "========================================="

# Go to the minecraft-railway directory
cd /Users/wapi/hackathon/bishkekjam/minecraft-railway

echo "📋 Deploying Minecraft service to Railway..."
echo ""

# Deploy the Minecraft service
echo "🚀 Deploying Minecraft service..."
railway up

# Set environment variables
echo "⚙️  Setting environment variables..."
railway variables --set "JAVA_OPTS=-Xmx2G -Xms1G"
railway variables --set "SERVER_PORT=25565"
railway variables --set "API_URL=https://blockcats-production.up.railway.app"

# Get the domain
echo "🌐 Getting Minecraft server URL..."
MINECRAFT_URL=$(railway domain)
echo "Minecraft URL: $MINECRAFT_URL"

# Test the backend API
echo "🧪 Testing backend API..."
curl -X POST https://blockcats-production.up.railway.app/api/minecraft/spawn \
  -H "X-Plugin-Secret: dev-secret-12345" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "✅ MINECRAFT SERVER DEPLOYED SUCCESSFULLY!"
echo "=========================================="
echo "🔗 Backend API: https://blockcats-production.up.railway.app"
echo "🎮 Minecraft Server: $MINECRAFT_URL:25565"
echo ""
echo "📱 Connect to your server:"
echo "   Server Address: $MINECRAFT_URL:25565"
echo "   Server Name: BlockCats Railway Server"
echo "   Version: Minecraft 1.21.10"
echo ""
echo "🎮 Features Available:"
echo "   - PvP Breeding Battles"
echo "   - Cat Collection System"
echo "   - Blockchain Integration"
echo "   - Real NFT Minting"
echo ""
echo "🎯 Your BlockCats server is now live on Railway! 🐱⚔️"
