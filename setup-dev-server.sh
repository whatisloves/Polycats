#!/bin/bash

# BlockCats Development Server Setup Script
# This script sets up a complete development environment

set -e

echo "🚀 Setting up BlockCats Development Server..."

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Please install Java 21+ first."
    echo "   macOS: brew install openjdk@21"
    echo "   Ubuntu: sudo apt install openjdk-21-jdk"
    exit 1
fi

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven not found. Please install Maven first."
    echo "   macOS: brew install maven"
    echo "   Ubuntu: sudo apt install maven"
    exit 1
fi

# Build the plugin
echo "📦 Building BlockCats plugin..."
cd BlockCatsPlugin
mvn clean package
cd ..

# Create server directory
SERVER_DIR="$HOME/minecraft-server"
echo "📁 Setting up server directory: $SERVER_DIR"

if [ ! -d "$SERVER_DIR" ]; then
    mkdir -p "$SERVER_DIR"
fi

cd "$SERVER_DIR"

# Download Paper server if not exists
if [ ! -f "paper.jar" ]; then
    echo "⬇️  Downloading Paper server..."
    curl -L -o paper.jar https://api.papermc.io/v2/projects/paper/versions/1.21.10/builds/85/downloads/paper-1.21.10-85.jar
fi

# Accept EULA
echo "eula=true" > eula.txt

# Copy plugin
echo "🔌 Installing BlockCats plugin..."
cp "$(pwd)/../bishkekjam/BlockCatsPlugin/target/BlockCatsPlugin.jar" plugins/

# Copy server configuration
echo "⚙️  Configuring server..."
cp "$(pwd)/../bishkekjam/server.properties.template" server.properties

# Set up environment for web API
echo "🌐 Setting up web API..."
cd "$(pwd)/../bishkekjam/web"

if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Copy environment template
if [ ! -f ".env.local" ]; then
    echo "📝 Setting up environment variables..."
    cp ../.env.example .env.local
    echo "⚠️  Please edit .env.local with your private key and settings"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎮 To start the Minecraft server:"
echo "   cd $SERVER_DIR"
echo "   java -Xmx2G -Xms2G -jar paper.jar nogui"
echo ""
echo "🌐 To start the API server:"
echo "   cd $(pwd)/../bishkekjam/web"
echo "   npm run dev"
echo ""
echo "🔗 Connect to Minecraft: localhost:25565"
echo "📖 Read DEVELOPER_SETUP.md for detailed instructions"
echo ""
echo "Happy coding! 🐱⛓️"
