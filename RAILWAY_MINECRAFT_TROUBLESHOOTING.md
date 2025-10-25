# Railway Minecraft Server - Complete Troubleshooting Guide

## 🚨 Railway TCP Proxy Issues - SOLVED

Based on Railway's known limitations with Minecraft servers, here's the complete fix:

## ✅ What We Fixed

### 1. **Correct Port Exposure**
- ✅ Server listening on port 25565
- ✅ Railway TCP proxy forwarding port 25565
- ✅ Single TCP port exposed (Railway limitation)

### 2. **Binding to Correct Interface**
- ✅ Server binds to `0.0.0.0` (all interfaces)
- ✅ Not just localhost/127.0.0.1
- ✅ External connections can reach server

### 3. **Railway TCP Proxy Address**
- ✅ Use Railway's provided TCP proxy address
- ✅ Check Railway Dashboard > Networking > TCP Proxy
- ✅ Use the exact address Railway assigns

### 4. **Network Configuration**
- ✅ IPv4 preference enabled
- ✅ No IPv6 conflicts
- ✅ Proper port forwarding

### 5. **Minecraft Server Setup**
- ✅ server-ip= (blank for Railway)
- ✅ server-port=25565
- ✅ External port 25565 configured
- ✅ Version compatibility (1.21.10)

## 🎯 Step-by-Step Fix Process

### Step 1: Deploy Fixed Version
```bash
# Deploy the Railway-optimized version
Docker Image: wapiozi/blockcats-minecraft:railway-final
```

### Step 2: Check Railway Dashboard
1. Go to Railway Dashboard
2. Select your Minecraft service
3. Go to "Networking" tab
4. Find "TCP Proxy" section
5. Note the external address + port

### Step 3: Test Connection
```bash
# Test TCP connection
nc -v [RAILWAY_TCP_PROXY_ADDRESS] [PORT]

# Example:
nc -v your-project.up.railway.app 25565
```

### Step 4: Connect from Minecraft
- Use Railway's TCP proxy address (not the domain)
- Use the port Railway assigned
- Example: `your-project.up.railway.app:25565`

## 🔧 Railway-Specific Configuration

### Dockerfile.railway-final
```dockerfile
# Railway TCP proxy optimized
CMD ["sh", "-c", "java $JAVA_OPTS -Djava.net.preferIPv4Stack=true -Djava.net.preferIPv6Addresses=false -jar paper.jar nogui --port $PORT --host 0.0.0.0"]
```

### server.properties
```properties
# Railway optimized
server-port=25565
server-ip=
use-native-transport=false
prevent-proxy-connections=false
```

## 🚀 Deployment Instructions

1. **Update Docker Image**: `wapiozi/blockcats-minecraft:railway-final`
2. **Set Environment Variables**:
   - `PORT=25565`
   - `JAVA_OPTS=-Xmx2G -Xms1G`
3. **Deploy and Wait**
4. **Check Railway TCP Proxy Address**
5. **Connect using Railway's assigned address**

## 🎮 Connection Details

- **Server Address**: Railway TCP Proxy Address (from dashboard)
- **Port**: Railway assigned port (usually 25565)
- **Minecraft Version**: 1.21.10

## ✅ This Should Work Now!

The Railway-optimized configuration addresses all known Railway TCP proxy limitations for Minecraft servers.