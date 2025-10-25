#!/bin/bash

# BlockCats Docker Hub Deployment Script
echo "🐳 Deploying BlockCats to Docker Hub..."

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

# Build and push backend image
echo "🚀 Building and pushing backend image..."
cd web
docker build -t $DOCKERHUB_USERNAME/blockcats-backend:latest .
docker push $DOCKERHUB_USERNAME/blockcats-backend:latest
cd ..

# Build and push Minecraft image
echo "🎮 Building and pushing Minecraft image..."
cd minecraft-server
docker build -t $DOCKERHUB_USERNAME/blockcats-minecraft:latest .
docker push $DOCKERHUB_USERNAME/blockcats-minecraft:latest
cd ..

# Update docker-compose file with actual username
echo "📝 Updating docker-compose file..."
sed -i.bak "s/your-dockerhub-username/$DOCKERHUB_USERNAME/g" docker-hub-compose.yml

# Create environment file template
echo "⚙️ Creating environment file template..."
cat > .env.dockerhub << EOF
# BlockCats Docker Hub Environment Variables
# Copy this file to .env and fill in your values

# Backend API Configuration
NODE_ENV=production
PORT=3000

# Blockchain Configuration
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
DEPLOYER_PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
CONTRACT_ADDRESS=0xC585c0ee9eDe4f35dbA97513570f9351d2B634E9

# Service URLs (update after deployment)
BACKEND_URL=http://localhost:3000
EOF

echo "✅ Docker Hub deployment complete!"
echo ""
echo "🐳 Images pushed to Docker Hub:"
echo "   - $DOCKERHUB_USERNAME/blockcats-backend:latest"
echo "   - $DOCKERHUB_USERNAME/blockcats-minecraft:latest"
echo ""
echo "🚀 To deploy locally:"
echo "   1. Copy .env.dockerhub to .env"
echo "   2. Fill in your environment variables"
echo "   3. Run: docker-compose -f docker-hub-compose.yml up -d"
echo ""
echo "🌐 To deploy on any server:"
echo "   1. Install Docker and Docker Compose"
echo "   2. Copy docker-hub-compose.yml and .env"
echo "   3. Run: docker-compose -f docker-hub-compose.yml up -d"
echo ""
echo "📱 Your services will be available at:"
echo "   - Backend API: http://localhost:3000"
echo "   - Minecraft Server: localhost:25565"
