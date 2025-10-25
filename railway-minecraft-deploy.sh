#!/bin/bash

# BlockCats Minecraft Railway Deployment Script
echo "🎮 BlockCats Minecraft Railway Deployment"
echo "======================================="

# Go to the minecraft-railway directory
cd /Users/wapi/hackathon/bishkekjam/minecraft-railway

echo "📋 Deploying Minecraft service to Railway..."
echo ""

# Try to deploy the Minecraft service
echo "🚀 Deploying Minecraft service..."
railway up

# Get the domain
echo "🌐 Getting Minecraft server URL..."
MINECRAFT_URL=$(railway domain)
echo "Minecraft URL: $MINECRAFT_URL"

echo ""
echo "✅ MINECRAFT SERVER DEPLOYED!"
echo "============================="
echo "🔗 Backend API: https://blockcats-production.up.railway.app"
echo "🎮 Minecraft Server: $MINECRAFT_URL:25565"
echo ""
echo "📱 Connect to your server:"
echo "   Server Address: $MINECRAFT_URL:25565"
echo "   Server Name: BlockCats Railway Server"
echo ""
echo "🧪 Test your API:"
echo "   curl -X POST https://blockcats-production.up.railway.app/api/minecraft/spawn \\"
echo "     -H 'X-Plugin-Secret: dev-secret-12345' \\"
echo "     -H 'Content-Type: application/json'"
echo ""
echo "🎮 Your BlockCats server is now live on Railway! 🐱⚔️"
