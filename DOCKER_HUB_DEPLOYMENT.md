# 🐳 Docker Hub Deployment Guide

This guide will help you deploy the BlockCats project to Docker Hub, making it easy to deploy anywhere with Docker.

## 📋 Prerequisites

1. **Docker Hub Account**: Sign up at [hub.docker.com](https://hub.docker.com)
2. **Docker Desktop**: Install Docker Desktop on your machine
3. **Git Repository**: Your code should be in a Git repository

## 🚀 Quick Deployment

### Step 1: Automated Deployment

Run the deployment script:
```bash
./deploy-to-dockerhub.sh
```

This script will:
- Build both Docker images
- Push them to Docker Hub
- Create environment configuration
- Update docker-compose file

### Step 2: Manual Deployment

If you prefer manual deployment:

1. **Login to Docker Hub**:
   ```bash
   docker login
   ```

2. **Build Backend Image**:
   ```bash
   cd web
   docker build -t your-username/blockcats-backend:latest .
   docker push your-username/blockcats-backend:latest
   cd ..
   ```

3. **Build Minecraft Image**:
   ```bash
   cd minecraft-server
   docker build -t your-username/blockcats-minecraft:latest .
   docker push your-username/blockcats-minecraft:latest
   cd ..
   ```

## 🌐 Deploying Anywhere

### Local Deployment

1. **Copy Environment File**:
   ```bash
   cp .env.dockerhub .env
   ```

2. **Edit Environment Variables**:
   ```bash
   nano .env
   ```
   Fill in your blockchain configuration:
   ```bash
   POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
   DEPLOYER_PRIVATE_KEY=your_private_key_here
   ETHERSCAN_API_KEY=your_etherscan_api_key
   CONTRACT_ADDRESS=0xC585c0ee9eDe4f35dbA97513570f9351d2B634E9
   ```

3. **Start Services**:
   ```bash
   docker-compose -f docker-hub-compose.yml up -d
   ```

### Server Deployment

1. **Install Docker**:
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Clone Repository**:
   ```bash
   git clone https://github.com/your-username/blockcats.git
   cd blockcats
   ```

3. **Configure Environment**:
   ```bash
   cp .env.dockerhub .env
   nano .env  # Edit with your configuration
   ```

4. **Deploy**:
   ```bash
   docker-compose -f docker-hub-compose.yml up -d
   ```

## 🔧 Configuration

### Environment Variables

**Backend Service**:
```bash
NODE_ENV=production
PORT=3000
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
DEPLOYER_PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
CONTRACT_ADDRESS=0xC585c0ee9eDe4f35dbA97513570f9351d2B634E9
```

**Minecraft Service**:
```bash
JAVA_OPTS=-Xmx2G -Xms1G
SERVER_PORT=25565
API_URL=http://backend:3000
```

### Port Configuration

- **Backend API**: Port 3000
- **Minecraft Server**: Port 25565

## 🎮 Accessing Your Server

### Backend API
- **Local**: `http://localhost:3000`
- **Server**: `http://your-server-ip:3000`

### Minecraft Server
- **Local**: `localhost:25565`
- **Server**: `your-server-ip:25565`

## 📱 Connecting to Minecraft

1. **Open Minecraft 1.21.10**
2. **Add Server**:
   - Server Name: `BlockCats Server`
   - Server Address: `your-server-ip:25565`
3. **Connect** and start playing!

## 🔍 Monitoring

### Check Service Status
```bash
docker-compose -f docker-hub-compose.yml ps
```

### View Logs
```bash
# All services
docker-compose -f docker-hub-compose.yml logs

# Backend only
docker-compose -f docker-hub-compose.yml logs backend

# Minecraft only
docker-compose -f docker-hub-compose.yml logs minecraft
```

### Restart Services
```bash
docker-compose -f docker-hub-compose.yml restart
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port Conflicts**:
   ```bash
   # Check what's using the ports
   sudo netstat -tulpn | grep :3000
   sudo netstat -tulpn | grep :25565
   ```

2. **Memory Issues**:
   ```bash
   # Check Docker memory usage
   docker stats
   
   # Increase memory limits in docker-compose.yml
   ```

3. **Network Issues**:
   ```bash
   # Check network connectivity
   docker network ls
   docker network inspect blockcats_blockcats-network
   ```

### Useful Commands

```bash
# Stop all services
docker-compose -f docker-hub-compose.yml down

# Remove all containers and volumes
docker-compose -f docker-hub-compose.yml down -v

# Rebuild and restart
docker-compose -f docker-hub-compose.yml up -d --build

# View resource usage
docker stats

# Clean up unused images
docker system prune -a
```

## 🚀 Production Deployment

### Security Considerations

1. **Firewall Configuration**:
   ```bash
   # Allow only necessary ports
   sudo ufw allow 3000
   sudo ufw allow 25565
   sudo ufw enable
   ```

2. **SSL/HTTPS**:
   - Use a reverse proxy (nginx) for HTTPS
   - Configure SSL certificates
   - Update API URLs accordingly

3. **Environment Security**:
   - Use Docker secrets for sensitive data
   - Don't commit .env files to Git
   - Use environment-specific configurations

### Scaling

1. **Resource Limits**:
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             memory: 1G
             cpus: '0.5'
   ```

2. **Load Balancing**:
   - Use multiple backend instances
   - Configure load balancer
   - Implement health checks

## 📊 Monitoring & Logging

### Health Checks

The services include built-in health checks:
- **Backend**: Checks `/api/minecraft/spawn` endpoint
- **Minecraft**: Checks server port connectivity

### Log Management

```bash
# View real-time logs
docker-compose -f docker-hub-compose.yml logs -f

# Save logs to file
docker-compose -f docker-hub-compose.yml logs > blockcats.log

# Rotate logs
docker-compose -f docker-hub-compose.yml logs --tail=1000 > blockcats-$(date +%Y%m%d).log
```

## 🎯 Next Steps

1. **Custom Domain**: Set up DNS for your server
2. **SSL Certificate**: Configure HTTPS
3. **Monitoring**: Set up monitoring and alerting
4. **Backup**: Implement automated backups
5. **Updates**: Set up automated updates

Your BlockCats server is now ready for deployment anywhere with Docker! 🐱⚔️🐳
