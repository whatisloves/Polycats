#!/bin/bash

# BlockCats Minecraft Railway CLI Deployment
echo "🎮 Deploying Minecraft server using Railway CLI..."
echo "================================================"

# Go to the minecraft-railway directory
cd /Users/wapi/hackathon/bishkekjam/minecraft-railway

# Try to deploy with a specific service name
echo "🚀 Deploying Minecraft service..."
railway up --service minecraft

# Get the domain
echo "🌐 Getting Minecraft server URL..."
railway domain --service minecraft

echo ""
echo "✅ Minecraft server deployed!"
echo "🎮 Your BlockCats Minecraft server is now live on Railway! 🐱⚔️"
