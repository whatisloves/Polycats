#!/bin/bash

# BlockCats Railway Setup Script
echo "🚂 BlockCats Railway Setup"
echo "=========================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

echo "🔐 Railway CLI is ready!"
echo ""
echo "📋 Next steps:"
echo "1. Run: railway login"
echo "2. Complete browser authentication"
echo "3. Run: ./railway-auto-deploy.sh"
echo ""
echo "🚀 Or follow the manual guide: RAILWAY_MANUAL_DEPLOYMENT.md"
echo ""
echo "Your Docker Hub images are ready:"
echo "  - wapiozi/blockcats-backend:latest"
echo "  - wapiozi/blockcats-minecraft:latest"
