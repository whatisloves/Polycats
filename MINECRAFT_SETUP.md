# Minecraft Server Setup

## Installation

```bash
# 1. Install Java 21
brew install openjdk@21

# 2. Create server folder
mkdir ~/minecraft-server
cd ~/minecraft-server

# 3. Download Paper 1.21.10
curl -L -o paper.jar https://api.papermc.io/v2/projects/paper/versions/1.21.10/builds/85/downloads/paper-1.21.10-85.jar

# 4. Accept EULA
echo "eula=true" > eula.txt

# 5. Start server
java -Xmx2G -Xms2G -jar paper.jar nogui

# Wait for "Done!" message
```

## Connect to Server

1. Open Minecraft Java Edition
2. Multiplayer → Direct Connection
3. Server Address: `localhost`
4. Join

## Starting Server Again

```bash
cd ~/minecraft-server
java -Xmx2G -Xms2G -jar paper.jar nogui
```

## Stop Server

Type `stop` in server console or press `Ctrl+C`

---

**Version:** Paper 1.21.10 (build 85)
**Port:** 25565
**Location:** `~/minecraft-server`
