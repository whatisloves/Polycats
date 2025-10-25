#!/bin/bash

echo "🚀 DEPLOYING WORKING RAILWAY MINECRAFT SERVER"
echo "=============================================="

# Set Railway project
RAILWAY_PROJECT="maksimillian/BlockCats"

echo "📦 Using Docker image: wapiozi/blockcats-minecraft:working-railway"
echo "🔧 Railway configuration: railway.toml"
echo ""

echo "🎯 DEPLOYMENT STEPS:"
echo "1. Go to Railway Dashboard: https://railway.app/dashboard"
echo "2. Select your project: $RAILWAY_PROJECT"
echo "3. Go to Minecraft service"
echo "4. Update Docker image to: wapiozi/blockcats-minecraft:working-railway"
echo "5. Set environment variables:"
echo "   - PORT=25565"
echo "   - JAVA_OPTS=-Xmx2G -Xms1G"
echo "6. Click 'Deploy'"
echo "7. Wait for deployment"
echo "8. Connect to: blockcats-minecraft-production.up.railway.app:25565"
echo ""

echo "✅ This version should WORK with Railway's networking!"
echo "🎮 BlockCats server will be ready to play!"
