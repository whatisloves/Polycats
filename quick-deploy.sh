#!/bin/bash

# Quick Docker Hub Deployment Script
echo "🚀 Quick BlockCats Deployment"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Get Docker Hub username
read -p "Enter your Docker Hub username: " DOCKERHUB_USERNAME
if [ -z "$DOCKERHUB_USERNAME" ]; then
    echo "❌ Docker Hub username is required"
    exit 1
fi

# Login to Docker Hub
echo "🔐 Logging into Docker Hub..."
docker login

# Build and push images
echo "🐳 Building and pushing images..."

# Backend
echo "Building backend..."
cd web
docker build -t $DOCKERHUB_USERNAME/blockcats-backend:latest .
docker push $DOCKERHUB_USERNAME/blockcats-backend:latest
cd ..

# Minecraft
echo "Building Minecraft server..."
cd minecraft-server
docker build -t $DOCKERHUB_USERNAME/blockcats-minecraft:latest .
docker push $DOCKERHUB_USERNAME/blockcats-minecraft:latest
cd ..

# Update compose files
echo "📝 Updating configuration files..."
sed -i.bak "s/your-dockerhub-username/$DOCKERHUB_USERNAME/g" docker-hub-compose.yml
sed -i.bak "s/your-dockerhub-username/$DOCKERHUB_USERNAME/g" docker-compose.prod.yml

# Create environment file
echo "⚙️ Creating environment configuration..."
cat > .env << EOF
# BlockCats Environment Variables
NODE_ENV=production
PORT=3000

# Blockchain Configuration
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
DEPLOYER_PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
CONTRACT_ADDRESS=0xC585c0ee9eDe4f35dbA97513570f9351d2B634E9

# Service URLs
BACKEND_URL=http://localhost:3000
EOF

echo "✅ Deployment complete!"
echo ""
echo "🐳 Images pushed to Docker Hub:"
echo "   - $DOCKERHUB_USERNAME/blockcats-backend:latest"
echo "   - $DOCKERHUB_USERNAME/blockcats-minecraft:latest"
echo ""
echo "🚀 To start locally:"
echo "   docker-compose -f docker-hub-compose.yml up -d"
echo ""
echo "🌐 To deploy on server:"
echo "   1. Copy docker-hub-compose.yml and .env to server"
echo "   2. Edit .env with your configuration"
echo "   3. Run: docker-compose -f docker-hub-compose.yml up -d"
echo ""
echo "📱 Access your services:"
echo "   - Backend API: http://localhost:3000"
echo "   - Minecraft Server: localhost:25565"
