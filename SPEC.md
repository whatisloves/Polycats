# BlockCats - Technical Specification

## Project Overview

**BlockCats** is a Web3 gaming project that integrates Minecraft gameplay with blockchain technology. It creates a living, server-controlled collection of unique cats that exist both in-game and as NFTs on the Polygon Amoy testnet.

### Core Innovation

Unlike traditional NFT breeding games, BlockCats prevents economic exploitation by:
- Server-controlled spawning (not player-controlled)
- Global daily spawn limits
- Per-player daily claim limits
- No financial tokenomics (pure collectibles)

---

## 1-Day Hackathon Implementation Plan

**IMPORTANT: This is a 1-day hackathon project.** The following breakdown shows what we will actually build in ~10 hours.

### What We Build (Realistic Scope)

#### 1. Minecraft Server Plugin (Paper/Spigot) - 3-4 hours
```
✅ /linkwallet <address> command
✅ Auto-spawn cats every 30 minutes
✅ Listen for EntityTameEvent
✅ Call backend API when cat is tamed
✅ Broadcast messages to chat
```

#### 2. Backend API (Next.js) - 2-3 hours
```
✅ POST /api/minecraft/claim - Handle taming events
✅ GET /api/spawn/status - Check daily limits
✅ Smart contract integration (mint NFTs)
✅ Simple DNA generation
✅ IPFS upload for metadata
```

#### 3. Smart Contract (Solidity) - 1 hour
```
✅ Simple ERC-721 contract
✅ Store DNA on-chain
✅ Owner-only minting
✅ Deploy to Polygon Amoy
```

#### 4. Frontend (Next.js + RainbowKit) - 2-3 hours
```
✅ Gallery page to view all minted cats
✅ Individual cat detail pages
✅ Wallet connection
✅ Display cat metadata/images
❌ NO claiming interface (happens in-game)
```

### Player Flow (What Players Actually Do)

1. **Join Minecraft Server** - `play.blockcats.xyz`
2. **Link Wallet** - Type `/linkwallet 0xYourAddress` in chat (one time)
3. **Wait for Announcement** - Server broadcasts: *"🐱 BlockCat spawned at X:123 Y:64 Z:456!"*
4. **Run & Tame** - First player to reach the cat and tame it (right-click with fish) wins
5. **Get NFT** - Server confirms: *"You claimed BlockCat #5! View at blockcats.xyz/cat/5"*
6. **View on Website** - Check your NFT on the gallery page

### What We Skip (Post-Hackathon Features)

- ❌ Custom cat textures/skins in Minecraft (use default cats)
- ❌ 3D model generation (too slow, not critical for demo)
- ❌ Complex genetic inheritance algorithms
- ❌ Parent selection (spawn random DNA instead)
- ❌ Multiple cat variants (just one type for MVP)

### Simplified Architecture (1-Day Version)

```
┌────────────────────────────────────────┐
│    Minecraft Server (Paper 1.20.x)    │
│  ┌──────────────────────────────────┐  │
│  │  BlockCatsPlugin.jar             │  │
│  │  - /linkwallet command           │  │
│  │  - Spawn timer (30 min)          │  │
│  │  - EntityTameEvent listener      │  │
│  └────────────┬─────────────────────┘  │
└───────────────┼────────────────────────┘
                │ HTTPS POST
                ▼
┌────────────────────────────────────────┐
│     Next.js Backend (Vercel)           │
│  ┌──────────────────────────────────┐  │
│  │  /api/minecraft/claim            │  │
│  │  - Check daily limits            │  │
│  │  - Generate DNA                  │  │
│  │  - Mint NFT                      │  │
│  │  - Upload metadata to IPFS       │  │
│  └──────┬───────────────┬───────────┘  │
└─────────┼───────────────┼───────────────┘
          │               │
          ▼               ▼
   ┌──────────┐    ┌──────────┐
   │ Polygon  │    │   IPFS   │
   │  Amoy    │    │ (Pinata) │
   └──────────┘    └──────────┘
```

### Technical Stack (Confirmed)

| Component | Technology | Why |
|-----------|-----------|-----|
| **Minecraft** | Paper 1.20.x server | Most popular server software, easy plugin API |
| **Plugin** | Java 17 + Paper API | Standard Minecraft plugin development |
| **Backend** | Next.js 14 + TypeScript | API routes + frontend in one project |
| **Smart Contract** | Solidity 0.8.20 + Hardhat | Industry standard |
| **Blockchain** | Polygon Amoy testnet | Fast, free, easy faucet |
| **NFT Standard** | ERC-721 | Standard NFT format |
| **Web3 Library** | ethers.js v6 | Smart contract interaction |
| **Frontend Web3** | wagmi + RainbowKit | Wallet connection UI |
| **Storage** | IPFS via Pinata | Decentralized metadata storage |
| **Image Gen** | DiceBear API (free) | Simple avatar generation |

---

## Game Mechanics

### 1. Kitten Spawn System

**"Kitten Time" Event Flow:**

1. Server triggers spawn event every `N` minutes (configurable)
2. Server randomly selects 2 adult cats from the existing population
3. Generates unique kitten with procedurally generated texture and DNA
4. Broadcasts server-wide message: *"A new BlockCat was born at coordinates [X, Y, Z]! Be the first to tame it!"*
5. Kitten spawns as a wild (untamed) entity at specified location
6. First player to tame the kitten becomes the NFT owner

**Spawn Conditions:**
- Requires at least 2 adult cats in the world (initial cats are seeded)
- Must not exceed daily global limit
- Spawn timer resets after each successful kitten spawn

### 2. Taming Mechanism

- Kitten spawns as wild/untamed entity
- Player must use Minecraft's standard taming method (fish)
- First player to successfully tame triggers:
  - Wallet ownership assignment
  - NFT minting transaction
  - On-chain metadata recording

### 3. Cat Lifecycle

- **Kitten** (0-20 minutes): Can be claimed as NFT if tamed
- **Adult** (20+ minutes): Can be selected as parent for breeding
- Cats persist in-game indefinitely (no death/despawn)

---

## Anti-Abuse Rules

### Rule #1: Server-Controlled Spawning

**Problem Prevented:** Infinite breeding loops and NFT farming

**Implementation:**
- No player-facing "breed" button/command
- Spawning logic exists only in server-side code
- Players cannot manually trigger kitten generation
- Parents are randomly selected by server algorithm

```typescript
// Player CANNOT trigger this
function spawnBlockCat() {
  if (dailyKittenCount >= MAX_KITTENS_PER_DAY) return;

  const parents = selectRandomParents();
  const kitten = generateKitten(parents);
  spawnInWorld(kitten);
  broadcastKittenEvent(kitten);
}
```

### Rule #2: Global Daily Limit

**Problem Prevented:** Server-wide spam and devaluation

**Configuration:**
```typescript
const MAX_KITTENS_PER_DAY = 10;
```

**Implementation:**
- Counter resets at midnight UTC
- After limit reached, no more spawns until next day
- Counter persists across server restarts

**Database Schema:**
```typescript
interface DailySpawnTracker {
  date: string; // YYYY-MM-DD
  spawnCount: number;
  lastSpawnTimestamp: number;
}
```

### Rule #3: Per-Player Daily Claim Limit

**Problem Prevented:** Single player monopolizing all spawns

**Configuration:**
```typescript
const MAX_CLAIMS_PER_PLAYER_PER_DAY = 1;
```

**Implementation:**
```typescript
interface PlayerClaimTracker {
  playerWallet: string;
  date: string;
  claimsToday: number;
}

function onKittenTamed(player: Player, kitten: Cat) {
  const claims = getPlayerClaimsToday(player.wallet);

  if (claims >= MAX_CLAIMS_PER_PLAYER_PER_DAY) {
    // Player can still tame in-game, but no NFT minted
    notifyPlayer(player, "You've already claimed your daily BlockCat NFT!");
    return;
  }

  // Proceed with NFT minting
  mintNFT(player.wallet, kitten);
  incrementPlayerClaims(player.wallet);
}
```

### Rule #4: First-To-Tame Ownership

**Problem Prevented:** Ownership disputes

**Implementation:**
- Kitten spawns with `owner = null`
- First successful tame action sets `owner = player.wallet`
- Immediate on-chain minting (no delays or auctions)
- No ownership transfers after minting (marketplace only)

### Rule #5: Non-Financial NFTs

**Problem Prevented:** Gambling/ponzi mechanics

**Design Principles:**
- NFTs are collectibles, not yield-bearing assets
- No $CAT token
- No staking rewards
- No breeding fees
- No in-game currency generation

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Minecraft Server                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │  BlockCats Plugin (Java/Paper)                     │     │
│  │  - Cat spawning logic                              │     │
│  │  - Taming event handlers                           │     │
│  │  - Player wallet mapping                           │     │
│  └────────────────┬───────────────────────────────────┘     │
└───────────────────┼─────────────────────────────────────────┘
                    │ HTTP/WebSocket
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Backend (API Routes)                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │  /api/cat/mint         - Mint NFT                  │     │
│  │  /api/cat/metadata     - Generate metadata         │     │
│  │  /api/cat/generate3d   - Call Tripo API            │     │
│  │  /api/daily-limits     - Check spawn limits        │     │
│  │  /api/player-claims    - Check player claims       │     │
│  └────────────────┬───────────────────────────────────┘     │
└───────────────────┼─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────────┐
   │ Polygon │ │  IPFS   │ │  Tripo API  │
   │  Amoy   │ │ Pinata  │ │ (Text→3D)   │
   └─────────┘ └─────────┘ └─────────────┘
```

### Tech Stack

#### Frontend
```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript",
  "web3": ["wagmi", "viem", "RainbowKit"],
  "3d": "react-three-fiber / @react-three/drei",
  "ui": "Tailwind CSS + shadcn/ui"
}
```

#### Backend
```json
{
  "runtime": "Next.js API Routes",
  "language": "TypeScript",
  "database": "PostgreSQL / Supabase",
  "cache": "Redis (for daily counters)"
}
```

#### Smart Contracts
```json
{
  "language": "Solidity ^0.8.20",
  "framework": "Hardhat",
  "libraries": [
    "@openzeppelin/contracts (ERC-721)",
    "@nomicfoundation/hardhat-toolbox",
    "ethers.js v6"
  ],
  "network": "Polygon Amoy Testnet",
  "note": "❌ NOT zkSync!"
}
```

#### External Services
- **IPFS**: Pinata or web3.storage
- **3D Generation**: Tripo API (text-to-3D models)
- **RPC Provider**: Alchemy or Infura (Polygon Amoy)

---

## Smart Contract Specification

### BlockCatsNFT.sol (ERC-721)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BlockCatsNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Mapping from tokenId to cat DNA
    mapping(uint256 => string) public catDNA;

    // Mapping from tokenId to birth timestamp
    mapping(uint256 => uint256) public birthTimestamp;

    // Mapping from tokenId to parent IDs
    mapping(uint256 => uint256[2]) public parents;

    event CatMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string dna,
        uint256[2] parents
    );

    constructor() ERC721("BlockCats", "BCAT") Ownable(msg.sender) {}

    function mintCat(
        address to,
        string memory _dna,
        string memory metadataURI,
        uint256[2] memory _parents
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        catDNA[tokenId] = _dna;
        birthTimestamp[tokenId] = block.timestamp;
        parents[tokenId] = _parents;

        emit CatMinted(tokenId, to, _dna, _parents);

        return tokenId;
    }

    function getCatInfo(uint256 tokenId) public view returns (
        string memory dna,
        uint256 birth,
        uint256[2] memory parentIds,
        string memory uri
    ) {
        return (
            catDNA[tokenId],
            birthTimestamp[tokenId],
            parents[tokenId],
            tokenURI(tokenId)
        );
    }

    // Override required by Solidity
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

### Key Contract Features

1. **DNA Storage**: Each cat has immutable DNA string
2. **Lineage Tracking**: Parent IDs stored on-chain
3. **Birth Timestamp**: Used for age calculations
4. **Metadata URI**: Points to IPFS metadata JSON
5. **Owner-Only Minting**: Only backend can mint (security)

---

## Data Models

### Cat DNA Structure

```typescript
interface CatDNA {
  // Visual traits
  primaryColor: string;      // hex color
  secondaryColor: string;    // hex color
  pattern: 'solid' | 'striped' | 'spotted' | 'calico' | 'tuxedo';
  eyeColor: string;          // hex color

  // Texture generation seed
  textureSeed: string;       // Used for procedural generation

  // 3D model traits
  bodyShape: 'slim' | 'normal' | 'chubby';
  earShape: 'pointed' | 'rounded' | 'folded';
  tailLength: 'short' | 'medium' | 'long';

  // Genetic inheritance (for future expansion)
  genes: {
    dominant: string[];      // Trait IDs
    recessive: string[];     // Trait IDs
  };
}
```

### NFT Metadata (IPFS)

```json
{
  "name": "BlockCat #123",
  "description": "A unique BlockCat born on the CryptoJam Minecraft server",
  "image": "ipfs://QmXXX.../cat-123.png",
  "animation_url": "ipfs://QmXXX.../cat-123.glb",
  "attributes": [
    {
      "trait_type": "Primary Color",
      "value": "#FF5733"
    },
    {
      "trait_type": "Pattern",
      "value": "Striped"
    },
    {
      "trait_type": "Eye Color",
      "value": "#00FF00"
    },
    {
      "trait_type": "Body Shape",
      "value": "Normal"
    },
    {
      "trait_type": "Generation",
      "value": 3
    },
    {
      "trait_type": "Birth Date",
      "value": "2025-10-24T12:34:56Z"
    }
  ],
  "properties": {
    "dna": "A3F2D9...",
    "parents": [45, 78],
    "tokenId": 123
  }
}
```

### Database Schema

```typescript
// PostgreSQL / Prisma Schema

model Cat {
  id              Int       @id @default(autoincrement())
  tokenId         Int       @unique
  dna             String
  textureUrl      String
  model3dUrl      String?
  parentIds       Int[]
  ownerWallet     String
  birthTimestamp  DateTime  @default(now())
  metadataUri     String
  minecraftUuid   String?   // UUID of in-game entity

  @@index([ownerWallet])
  @@index([birthTimestamp])
}

model DailySpawnCounter {
  id          Int      @id @default(autoincrement())
  date        String   @unique // YYYY-MM-DD
  count       Int      @default(0)
  lastSpawn   DateTime?
}

model PlayerClaim {
  id          Int      @id @default(autoincrement())
  wallet      String
  date        String   // YYYY-MM-DD
  claimCount  Int      @default(0)

  @@unique([wallet, date])
}

model SpawnEvent {
  id          Int      @id @default(autoincrement())
  timestamp   DateTime @default(now())
  kittenId    Int
  parentIds   Int[]
  location    Json     // { x, y, z, world }
  claimedBy   String?
  claimedAt   DateTime?
}
```

---

## API Endpoints (Simplified for 1-Day)

### POST /api/minecraft/spawn

Called by Minecraft plugin when spawn timer triggers.

**Headers:**
```
X-Plugin-Secret: your-api-secret
```

**Request:**
```typescript
// Empty body
{}
```

**Response:**
```typescript
interface SpawnResponse {
  canSpawn: boolean;        // false if daily limit reached
  dna?: string;             // Random DNA if canSpawn=true
  message?: string;         // Error message if canSpawn=false
}
```

**Logic:**
```typescript
const today = new Date().toISOString().split('T')[0];

// Check global daily limit
if (spawnsToday >= MAX_KITTENS_PER_DAY) {
  return { canSpawn: false, message: 'Daily limit reached' };
}

// Generate random DNA
const dna = generateRandomDNA();

// Increment counter
spawnsToday++;

return { canSpawn: true, dna };
```

### POST /api/minecraft/claim

Called by Minecraft plugin when player tames a cat.

**Headers:**
```
X-Plugin-Secret: your-api-secret
```

**Request:**
```typescript
interface ClaimRequest {
  wallet: string;      // Player's linked wallet (0x...)
  catUuid: string;     // Minecraft entity UUID
}
```

**Response:**
```typescript
interface ClaimResponse {
  success: boolean;
  tokenId?: number;         // NFT token ID if successful
  transactionHash?: string; // Blockchain tx hash
  error?: string;           // Error message if failed
}
```

**Logic:**
```typescript
// 1. Check player daily limit
const playerClaims = getPlayerClaimsToday(wallet);
if (playerClaims >= MAX_CLAIMS_PER_PLAYER_PER_DAY) {
  return { success: false, error: 'You already claimed today!' };
}

// 2. Generate cat image (DiceBear)
const imageUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${catUuid}`;

// 3. Create metadata JSON
const metadata = {
  name: `BlockCat #${nextTokenId}`,
  description: 'A BlockCat from CryptoJam',
  image: imageUrl,
  attributes: [/* DNA traits */]
};

// 4. Upload metadata to IPFS
const metadataUri = await uploadToIPFS(metadata);

// 5. Mint NFT on-chain
const tx = await contract.mintCat(wallet, dna, metadataUri, [0, 0]);
await tx.wait();

// 6. Increment player claims
incrementPlayerClaims(wallet);

return {
  success: true,
  tokenId: nextTokenId,
  transactionHash: tx.hash
};
```

### GET /api/cats

Get all minted cats for the gallery page.

**Response:**
```typescript
interface CatsResponse {
  cats: {
    tokenId: number;
    owner: string;
    image: string;
    name: string;
    mintedAt: string;
  }[];
  total: number;
}
```

**Logic:**
```typescript
// Read from smart contract
const totalSupply = await contract.totalSupply();
const cats = [];

for (let i = 0; i < totalSupply; i++) {
  const owner = await contract.ownerOf(i);
  const uri = await contract.tokenURI(i);
  const metadata = await fetchIPFS(uri);

  cats.push({
    tokenId: i,
    owner,
    image: metadata.image,
    name: metadata.name,
    mintedAt: metadata.properties?.birthDate
  });
}

return { cats, total: totalSupply };
```

### GET /api/cat/[tokenId]

Get individual cat details.

**Response:**
```typescript
interface CatDetails {
  tokenId: number;
  owner: string;
  dna: string;
  image: string;
  metadata: {
    name: string;
    description: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  };
}
```

---

## Minecraft Plugin Integration

### Plugin Architecture (Java/Paper)

```java
// Pseudo-code structure

public class BlockCatsPlugin extends JavaPlugin {

    private SpawnScheduler spawnScheduler;
    private WebhookClient apiClient;

    @Override
    public void onEnable() {
        // Start spawn timer
        spawnScheduler = new SpawnScheduler(this);
        spawnScheduler.start();

        // Listen to taming events
        getServer().getPluginManager()
            .registerEvents(new CatTamingListener(), this);
    }

    class SpawnScheduler {
        public void triggerSpawn() {
            // Check daily limit via API
            SpawnStatus status = apiClient.getSpawnStatus();
            if (status.spawnsToday >= status.maxSpawnsPerDay) {
                return;
            }

            // Select random parents
            List<Cat> adults = getAdultCats();
            Cat[] parents = selectRandomPair(adults);

            // Generate DNA on backend
            CatDNA dna = apiClient.generateDNA(parents);

            // Spawn kitten in-game
            Location spawnLoc = findSafeLocation();
            Cat kitten = spawnCat(spawnLoc, dna);

            // Broadcast event
            broadcastMessage(
                "§6[BlockCats] §eA new kitten was born at " +
                formatLocation(spawnLoc) + "! Be the first to tame it!"
            );

            // Store pending claim
            pendingClaims.put(kitten.getUniqueId(), dna);
        }
    }

    class CatTamingListener implements Listener {
        @EventHandler
        public void onCatTame(EntityTameEvent event) {
            if (!(event.getEntity() instanceof Cat)) return;

            Cat cat = (Cat) event.getEntity();
            Player player = (Player) event.getOwner();

            // Check if this is a BlockCat
            if (!pendingClaims.containsKey(cat.getUniqueId())) {
                return;
            }

            // Get player's linked wallet
            String wallet = playerWallets.get(player.getUniqueId());
            if (wallet == null) {
                player.sendMessage("§cPlease link your wallet first: /linkwallet");
                event.setCancelled(true);
                return;
            }

            // Trigger mint via API
            CatDNA dna = pendingClaims.get(cat.getUniqueId());
            apiClient.mintCat(wallet, dna, cat.getUniqueId());

            player.sendMessage("§a[BlockCats] You claimed this cat! NFT minting...");
        }
    }
}
```

### Commands

- `/linkwallet <address>` - Link Minecraft account to wallet
- `/myblocks` - View your BlockCats collection
- `/blockcats status` - View spawn status
- `/blockcats next` - Time until next spawn

---

## Paper/Spigot Plugin Development Guide

### Setting Up Plugin Project

**Option 1: Maven (Recommended)**

Create `pom.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <groupId>xyz.blockcats</groupId>
    <artifactId>BlockCatsPlugin</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <repositories>
        <repository>
            <id>papermc</id>
            <url>https://repo.papermc.io/repository/maven-public/</url>
        </repository>
    </repositories>

    <dependencies>
        <!-- Paper API -->
        <dependency>
            <groupId>io.papermc.paper</groupId>
            <artifactId>paper-api</artifactId>
            <version>1.20.4-R0.1-SNAPSHOT</version>
            <scope>provided</scope>
        </dependency>

        <!-- OkHttp for HTTP requests -->
        <dependency>
            <groupId>com.squareup.okhttp3</groupId>
            <artifactId>okhttp</artifactId>
            <version>4.12.0</version>
        </dependency>

        <!-- Gson for JSON -->
        <dependency>
            <groupId>com.google.code.gson</groupId>
            <artifactId>gson</artifactId>
            <version>2.10.1</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-shade-plugin</artifactId>
                <version>3.5.0</version>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>shade</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
        <finalName>BlockCatsPlugin</finalName>
    </build>
</project>
```

**Option 2: Gradle**

Create `build.gradle.kts`:
```kotlin
plugins {
    java
    id("com.github.johnrengelman.shadow") version "8.1.1"
}

group = "xyz.blockcats"
version = "1.0.0"

repositories {
    mavenCentral()
    maven("https://repo.papermc.io/repository/maven-public/")
}

dependencies {
    compileOnly("io.papermc.paper:paper-api:1.20.4-R0.1-SNAPSHOT")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.google.code.gson:gson:2.10.1")
}

java {
    toolchain.languageVersion.set(JavaLanguageVersion.of(17))
}
```

### Plugin Manifest (plugin.yml)

Create `src/main/resources/plugin.yml`:
```yaml
name: BlockCatsPlugin
version: 1.0.0
main: xyz.blockcats.BlockCatsPlugin
api-version: 1.20
author: YourName
description: BlockCats NFT integration for Minecraft

commands:
  linkwallet:
    description: Link your wallet address
    usage: /linkwallet <address>
    permission: blockcats.link
  blockcats:
    description: BlockCats commands
    usage: /blockcats <status|next>
    permission: blockcats.use

permissions:
  blockcats.link:
    description: Allow linking wallet
    default: true
  blockcats.use:
    description: Allow BlockCats commands
    default: true
```

### Configuration File (config.yml)

Create `src/main/resources/config.yml`:
```yaml
# BlockCats Configuration

# Backend API settings
api:
  url: "https://your-app.vercel.app"
  secret: "your-secret-key-here"

# Spawn settings
spawn:
  interval-minutes: 30
  enabled: true

# Messages
messages:
  prefix: "§6[BlockCats]§r"
  spawn: "§eA new BlockCat appeared at {location}! Be first to tame it!"
  claimed: "§aYou claimed BlockCat #{id}! NFT is being minted..."
  already-claimed: "§cYou already claimed your daily BlockCat!"
  link-wallet: "§aWallet linked successfully!"
  no-wallet: "§cPlease link your wallet first: /linkwallet <address>"
```

### Main Plugin Class

Create `src/main/java/xyz/blockcats/BlockCatsPlugin.java`:
```java
package xyz.blockcats;

import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.scheduler.BukkitRunnable;
import xyz.blockcats.commands.LinkWalletCommand;
import xyz.blockcats.commands.BlockCatsCommand;
import xyz.blockcats.listeners.CatTamingListener;
import xyz.blockcats.api.ApiClient;
import xyz.blockcats.managers.WalletManager;
import xyz.blockcats.managers.SpawnManager;

import java.util.logging.Logger;

public class BlockCatsPlugin extends JavaPlugin {

    private static BlockCatsPlugin instance;
    private ApiClient apiClient;
    private WalletManager walletManager;
    private SpawnManager spawnManager;
    private Logger log;

    @Override
    public void onEnable() {
        instance = this;
        log = getLogger();

        // Save default config
        saveDefaultConfig();

        // Initialize managers
        apiClient = new ApiClient(this);
        walletManager = new WalletManager(this);
        spawnManager = new SpawnManager(this);

        // Register commands
        getCommand("linkwallet").setExecutor(new LinkWalletCommand(this));
        getCommand("blockcats").setExecutor(new BlockCatsCommand(this));

        // Register event listeners
        getServer().getPluginManager().registerEvents(
            new CatTamingListener(this), this
        );

        // Start spawn scheduler
        startSpawnScheduler();

        log.info("BlockCats plugin enabled!");
    }

    @Override
    public void onDisable() {
        // Save wallet data
        walletManager.saveWallets();
        log.info("BlockCats plugin disabled!");
    }

    private void startSpawnScheduler() {
        if (!getConfig().getBoolean("spawn.enabled")) {
            return;
        }

        final int intervalMinutes = getConfig().getInt("spawn.interval-minutes");
        final long intervalTicks = intervalMinutes * 60 * 20; // 20 ticks = 1 second

        new BukkitRunnable() {
            @Override
            public void run() {
                spawnManager.trySpawnCat();
            }
        }.runTaskTimer(this, 100L, intervalTicks); // Start after 5 seconds

        log.info("Spawn scheduler started (interval: " + intervalMinutes + " minutes)");
    }

    public static BlockCatsPlugin getInstance() {
        return instance;
    }

    public ApiClient getApiClient() {
        return apiClient;
    }

    public WalletManager getWalletManager() {
        return walletManager;
    }

    public SpawnManager getSpawnManager() {
        return spawnManager;
    }
}
```

### Wallet Manager

Create `src/main/java/xyz/blockcats/managers/WalletManager.java`:
```java
package xyz.blockcats.managers;

import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.configuration.file.YamlConfiguration;
import org.bukkit.entity.Player;
import xyz.blockcats.BlockCatsPlugin;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class WalletManager {

    private final BlockCatsPlugin plugin;
    private final Map<UUID, String> wallets = new HashMap<>();
    private final File walletsFile;
    private FileConfiguration walletsConfig;

    public WalletManager(BlockCatsPlugin plugin) {
        this.plugin = plugin;
        this.walletsFile = new File(plugin.getDataFolder(), "wallets.yml");
        loadWallets();
    }

    private void loadWallets() {
        if (!walletsFile.exists()) {
            plugin.saveResource("wallets.yml", false);
        }

        walletsConfig = YamlConfiguration.loadConfiguration(walletsFile);

        for (String key : walletsConfig.getKeys(false)) {
            UUID uuid = UUID.fromString(key);
            String wallet = walletsConfig.getString(key);
            wallets.put(uuid, wallet);
        }

        plugin.getLogger().info("Loaded " + wallets.size() + " wallet links");
    }

    public void saveWallets() {
        for (Map.Entry<UUID, String> entry : wallets.entrySet()) {
            walletsConfig.set(entry.getKey().toString(), entry.getValue());
        }

        try {
            walletsConfig.save(walletsFile);
        } catch (IOException e) {
            plugin.getLogger().severe("Failed to save wallets: " + e.getMessage());
        }
    }

    public void linkWallet(Player player, String address) {
        wallets.put(player.getUniqueId(), address);
        saveWallets();
    }

    public String getWallet(Player player) {
        return wallets.get(player.getUniqueId());
    }

    public boolean hasWallet(Player player) {
        return wallets.containsKey(player.getUniqueId());
    }
}
```

### API Client

Create `src/main/java/xyz/blockcats/api/ApiClient.java`:
```java
package xyz.blockcats.api;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import okhttp3.*;
import xyz.blockcats.BlockCatsPlugin;

import java.io.IOException;
import java.util.concurrent.CompletableFuture;

public class ApiClient {

    private final BlockCatsPlugin plugin;
    private final OkHttpClient client;
    private final Gson gson;
    private final String apiUrl;
    private final String apiSecret;
    private static final MediaType JSON = MediaType.parse("application/json");

    public ApiClient(BlockCatsPlugin plugin) {
        this.plugin = plugin;
        this.client = new OkHttpClient();
        this.gson = new Gson();
        this.apiUrl = plugin.getConfig().getString("api.url");
        this.apiSecret = plugin.getConfig().getString("api.secret");
    }

    public CompletableFuture<SpawnResponse> requestSpawn() {
        return CompletableFuture.supplyAsync(() -> {
            final String url = apiUrl + "/api/minecraft/spawn";

            final Request request = new Request.Builder()
                .url(url)
                .addHeader("X-Plugin-Secret", apiSecret)
                .post(RequestBody.create("", JSON))
                .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    plugin.getLogger().warning("Spawn request failed: " + response.code());
                    return null;
                }

                final String body = response.body().string();
                return gson.fromJson(body, SpawnResponse.class);

            } catch (IOException e) {
                plugin.getLogger().severe("Spawn request error: " + e.getMessage());
                return null;
            }
        });
    }

    public CompletableFuture<ClaimResponse> claimCat(String wallet, String catUuid) {
        return CompletableFuture.supplyAsync(() -> {
            final String url = apiUrl + "/api/minecraft/claim";

            final JsonObject payload = new JsonObject();
            payload.addProperty("wallet", wallet);
            payload.addProperty("catUuid", catUuid);

            final RequestBody body = RequestBody.create(
                gson.toJson(payload),
                JSON
            );

            final Request request = new Request.Builder()
                .url(url)
                .addHeader("X-Plugin-Secret", apiSecret)
                .post(body)
                .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    plugin.getLogger().warning("Claim request failed: " + response.code());
                    return null;
                }

                final String responseBody = response.body().string();
                return gson.fromJson(responseBody, ClaimResponse.class);

            } catch (IOException e) {
                plugin.getLogger().severe("Claim request error: " + e.getMessage());
                return null;
            }
        });
    }

    // Response classes
    public static class SpawnResponse {
        public boolean canSpawn;
        public String dna;
        public String message;
    }

    public static class ClaimResponse {
        public boolean success;
        public int tokenId;
        public String error;
    }
}
```

### Cat Taming Listener

Create `src/main/java/xyz/blockcats/listeners/CatTamingListener.java`:
```java
package xyz.blockcats.listeners;

import org.bukkit.entity.Cat;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.EntityTameEvent;
import xyz.blockcats.BlockCatsPlugin;
import xyz.blockcats.api.ApiClient;
import xyz.blockcats.managers.SpawnManager;
import xyz.blockcats.managers.WalletManager;

public class CatTamingListener implements Listener {

    private final BlockCatsPlugin plugin;
    private final WalletManager walletManager;
    private final SpawnManager spawnManager;
    private final ApiClient apiClient;

    public CatTamingListener(BlockCatsPlugin plugin) {
        this.plugin = plugin;
        this.walletManager = plugin.getWalletManager();
        this.spawnManager = plugin.getSpawnManager();
        this.apiClient = plugin.getApiClient();
    }

    @EventHandler
    public void onCatTame(EntityTameEvent event) {
        if (!(event.getEntity() instanceof Cat cat)) {
            return;
        }

        if (!(event.getOwner() instanceof Player player)) {
            return;
        }

        // Check if this is a BlockCat
        if (!spawnManager.isBlockCat(cat)) {
            return;
        }

        // Check if player has linked wallet
        if (!walletManager.hasWallet(player)) {
            player.sendMessage(getMessage("no-wallet"));
            event.setCancelled(true);
            return;
        }

        final String wallet = walletManager.getWallet(player);
        final String catUuid = cat.getUniqueId().toString();

        // Remove from pending claims
        spawnManager.removeBlockCat(cat);

        // Call API to claim and mint NFT
        apiClient.claimCat(wallet, catUuid).thenAccept(response -> {
            if (response == null || !response.success) {
                final String error = response != null ? response.error : "API error";
                player.sendMessage("§c" + error);
                return;
            }

            final String message = getMessage("claimed")
                .replace("{id}", String.valueOf(response.tokenId));
            player.sendMessage(message);
        });
    }

    private String getMessage(String key) {
        return plugin.getConfig().getString("messages." + key);
    }
}
```

### Link Wallet Command

Create `src/main/java/xyz/blockcats/commands/LinkWalletCommand.java`:
```java
package xyz.blockcats.commands;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import xyz.blockcats.BlockCatsPlugin;

public class LinkWalletCommand implements CommandExecutor {

    private final BlockCatsPlugin plugin;

    public LinkWalletCommand(BlockCatsPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command,
                            String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("Only players can use this command");
            return true;
        }

        if (args.length != 1) {
            player.sendMessage("§cUsage: /linkwallet <address>");
            return true;
        }

        final String address = args[0];

        // Basic validation
        if (!address.startsWith("0x") || address.length() != 42) {
            player.sendMessage("§cInvalid wallet address");
            return true;
        }

        plugin.getWalletManager().linkWallet(player, address);
        player.sendMessage(plugin.getConfig().getString("messages.link-wallet"));

        return true;
    }
}
```

### Building the Plugin

```bash
# Maven
mvn clean package

# Gradle
./gradlew shadowJar

# Output JAR will be in:
# Maven: target/BlockCatsPlugin.jar
# Gradle: build/libs/BlockCatsPlugin.jar
```

### Installing on Server

1. Download Paper server: https://papermc.io/downloads/paper
2. Start server to generate folders
3. Copy `BlockCatsPlugin.jar` to `plugins/` folder
4. Restart server
5. Edit `plugins/BlockCatsPlugin/config.yml` with your API URL and secret
6. Reload plugin: `/reload confirm`

### Testing Locally

```bash
# Start Paper server
java -Xmx2G -Xms2G -jar paper-1.20.4.jar nogui

# Join server at localhost:25565
# Test commands:
/linkwallet 0x1234567890123456789012345678901234567890
/blockcats status
```

### Paper Plugin Development in Cursor

**Cursor (VS Code) Setup for Java:**

1. **Install Java Extension Pack**
   ```bash
   # In Cursor, install these extensions:
   - Extension Pack for Java (Microsoft)
   - Maven for Java
   - Debugger for Java
   ```

2. **Open Plugin Project**
   ```bash
   mkdir BlockCatsPlugin
   cd BlockCatsPlugin
   code . # Opens in Cursor
   ```

3. **Create Maven Project Structure**
   ```bash
   mkdir -p src/main/java/xyz/blockcats
   mkdir -p src/main/resources
   ```

4. **Build from Terminal in Cursor**
   ```bash
   # Use Cursor's integrated terminal
   mvn clean package

   # JAR output: target/BlockCatsPlugin.jar
   ```

5. **Java IntelliSense**
   - Cursor will auto-detect `pom.xml` and enable Java features
   - Autocomplete works for Paper API
   - Hover for docs
   - Cmd+Click to jump to definitions

**Quick Commands in Cursor:**
```bash
# Terminal (Cmd+J)
mvn clean package          # Build plugin
java -jar paper.jar nogui  # Start server

# File structure:
BlockCatsPlugin/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/xyz/blockcats/
│   │   │   ├── BlockCatsPlugin.java
│   │   │   ├── commands/
│   │   │   ├── listeners/
│   │   │   ├── managers/
│   │   │   └── api/
│   │   └── resources/
│   │       ├── plugin.yml
│   │       └── config.yml
└── target/
    └── BlockCatsPlugin.jar
```

**Debugging in Cursor:**
```bash
# Start server with debug port
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005 \
     -jar paper.jar nogui

# Then in Cursor: Run → Start Debugging (F5)
# Attach to port 5005
```

**Resources:**
- Paper API Docs: https://jd.papermc.io/paper/1.20/
- Spigot Plugin Tutorial: https://www.spigotmc.org/wiki/spigot-plugin-development/
- Maven in 5 Minutes: https://maven.apache.org/guides/getting-started/maven-in-five-minutes.html

**Useful Libraries:**
- OkHttp Docs: https://square.github.io/okhttp/
- Gson Guide: https://github.com/google/gson/blob/master/UserGuide.md

**Community:**
- Paper Discord: https://discord.gg/papermc
- r/admincraft: https://reddit.com/r/admincraft

---

## Implementation Phases (1-Day Timeline)

### Hour 0-1: Smart Contract + Project Setup

**Smart Contract:**
- [ ] Create Hardhat project: `npx hardhat init`
- [ ] Install dependencies: `npm i @openzeppelin/contracts ethers@6`
- [ ] Write simple ERC-721 contract (BlockCatsNFT.sol)
- [ ] Configure Polygon Amoy in hardhat.config.ts
- [ ] Deploy to Polygon Amoy testnet
- [ ] Verify on PolygonScan
- [ ] Fund deployer wallet with test MATIC from faucet

**Backend Setup:**
- [ ] Create Next.js project: `npx create-next-app@latest`
- [ ] Setup TypeScript config
- [ ] Install web3 dependencies: `npm i ethers@6 viem wagmi`

### Hour 1-3: Backend API + Daily Limits

**API Routes:**
- [ ] `POST /api/minecraft/claim` - Handle cat claims from plugin
- [ ] `GET /api/spawn/status` - Return spawn limits info
- [ ] `POST /api/minecraft/spawn` - Plugin calls when spawning cat

**Core Logic:**
- [ ] Implement in-memory daily counters (Map objects)
- [ ] Create DNA generation function (random traits)
- [ ] Setup ethers.js contract connection
- [ ] Create minting function
- [ ] Setup Pinata API for IPFS uploads
- [ ] Create metadata generator

**Security:**
- [ ] Add API_SECRET authentication for plugin requests
- [ ] Add wallet address validation

### Hour 3-6: Minecraft Plugin (Paper/Spigot)

**Plugin Setup:**
- [ ] Create Maven/Gradle project
- [ ] Add Paper API dependency
- [ ] Create plugin.yml manifest
- [ ] Setup main plugin class

**Core Features:**
```java
- [ ] /linkwallet command implementation
- [ ] Player wallet storage (HashMap or config file)
- [ ] Spawn scheduler (BukkitRunnable every 30 min)
- [ ] EntityTameEvent listener
- [ ] HTTP client for API calls (OkHttp or Java 11 HttpClient)
- [ ] Chat message broadcasting
- [ ] Config file for API URL and secret
```

**Plugin Flow:**
```
1. Timer triggers -> Call /api/minecraft/spawn
2. Backend returns DNA + approval
3. Plugin spawns cat at random safe location
4. Broadcast message to chat
5. Player tames cat -> EntityTameEvent
6. Call /api/minecraft/claim with player wallet
7. Backend mints NFT
8. Send confirmation message to player
```

### Hour 6-8: Frontend (Gallery)

**Setup:**
- [ ] Install RainbowKit: `npm i @rainbow-me/rainbowkit wagmi`
- [ ] Configure wagmi with Polygon Amoy
- [ ] Setup RainbowKit providers

**Pages:**
- [ ] `/` - Homepage with project info
- [ ] `/gallery` - Grid of all minted cats
- [ ] `/cat/[id]` - Individual cat detail page

**Components:**
- [ ] Wallet connect button (RainbowKit)
- [ ] Cat card component (image, traits, owner)
- [ ] Cat detail view with metadata

**Data Fetching:**
- [ ] Read from smart contract (get all tokens)
- [ ] Fetch metadata from IPFS
- [ ] Display cat images (DiceBear URLs)

### Hour 8-9: Integration Testing

**End-to-End Test:**
- [ ] Start local Minecraft server with plugin
- [ ] Link test wallet with `/linkwallet`
- [ ] Wait for auto-spawn or trigger manually
- [ ] Tame cat in-game
- [ ] Verify NFT minted on Polygon Amoy
- [ ] Check NFT appears on frontend gallery
- [ ] Test daily limit (try claiming 2nd cat same day)

**Fix Issues:**
- [ ] Debug any API errors
- [ ] Fix plugin crashes
- [ ] Handle edge cases (no wallet linked, etc.)

### Hour 9-10: Deployment + Demo Prep

**Deployment:**
- [ ] Deploy frontend to Vercel
- [ ] Update plugin config with production API URL
- [ ] Setup public Minecraft server (or use Aternos/Minehut for free)
- [ ] Upload plugin to server
- [ ] Test with fresh wallet

**Demo Materials:**
- [ ] Record 2-minute screen recording showing:
  - Minecraft server announcement
  - Player taming cat
  - NFT appearing in gallery
- [ ] Create simple README with:
  - Project description
  - How to join server
  - Link to gallery website
- [ ] Prepare 5-minute presentation slides

**Pre-Demo Checklist:**
- [ ] Mint 2-3 test cats for gallery screenshots
- [ ] Have test wallets ready
- [ ] Server is running and accessible
- [ ] Frontend shows test NFTs correctly

---

## Configuration Constants

```typescript
// config/constants.ts

export const GAME_CONFIG = {
  // Spawn limits
  MAX_KITTENS_PER_DAY: 10,
  MAX_CLAIMS_PER_PLAYER_PER_DAY: 1,

  // Timing
  SPAWN_INTERVAL_MINUTES: 30,
  KITTEN_TO_ADULT_AGE_MINUTES: 20,

  // Initial population
  SEED_CATS_COUNT: 4,

  // Genetics
  MUTATION_RATE: 0.05, // 5% chance of random trait

  // Blockchain
  CHAIN_ID: 80002, // Polygon Amoy
  CONTRACT_ADDRESS: '0x...', // Deployed contract

  // IPFS
  IPFS_GATEWAY: 'https://gateway.pinata.cloud/ipfs/',

  // Minecraft
  MIN_PLAYERS_FOR_SPAWN: 1,
};

export const DNA_TRAITS = {
  primaryColors: [
    '#FF5733', '#33FF57', '#3357FF', '#F0F0F0',
    '#2C2C2C', '#FF69B4', '#FFD700', '#A020F0'
  ],
  patterns: ['solid', 'striped', 'spotted', 'calico', 'tuxedo'],
  bodyShapes: ['slim', 'normal', 'chubby'],
  eyeColors: ['#00FF00', '#0000FF', '#FFD700', '#FF0000'],
};
```

---

## Security Considerations

### 1. Private Key Management

```typescript
// ❌ NEVER commit private keys
// ✅ Use environment variables
const wallet = new ethers.Wallet(process.env.MINTER_PRIVATE_KEY);
```

### 2. API Authentication

```typescript
// Minecraft plugin must authenticate
const API_SECRET = process.env.PLUGIN_API_SECRET;

export async function verifyPluginRequest(req: Request) {
  const authHeader = req.headers.get('X-Plugin-Secret');
  if (authHeader !== API_SECRET) {
    throw new Error('Unauthorized');
  }
}
```

### 3. Rate Limiting

```typescript
// Prevent API spam
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### 4. Input Validation

```typescript
// Validate wallet addresses
import { isAddress } from 'viem';

function validateMintRequest(data: MintRequest) {
  if (!isAddress(data.playerWallet)) {
    throw new Error('Invalid wallet address');
  }
  // ... more validation
}
```

---

## Success Metrics

### For Hackathon Judges

1. **Technical Innovation**:
   - Server-controlled NFT minting (novel approach)
   - Real-time game ↔ blockchain integration
   - Anti-abuse system design

2. **User Experience**:
   - Seamless wallet connection
   - No gas fees for players (backend pays)
   - Instant feedback (in-game + web)

3. **Economic Sustainability**:
   - Provably fair spawn system
   - No infinite inflation
   - Collectible value preservation

4. **Code Quality**:
   - TypeScript throughout
   - Comprehensive error handling
   - Well-documented APIs

---

## Future Expansions (Post-Hackathon)

- **Marketplace**: Allow trading BlockCats
- **Quests**: Complete tasks to trigger special spawns
- **Breeding UI**: Controlled player-initiated breeding with cooldowns
- **Cross-server**: Multiple Minecraft servers, same NFT collection
- **Rarities**: Legendary cats with special abilities
- **Customization**: On-chain accessories and skins

---

## Resources & Links

### Documentation
- **Polygon Amoy**: https://polygon.technology/blog/introducing-the-amoy-testnet-for-polygon-pos
- **Hardhat**: https://hardhat.org/docs
- **wagmi**: https://wagmi.sh/
- **RainbowKit**: https://rainbowkit.com/
- **Tripo API**: https://platform.tripo3d.ai/docs

### Tools
- **Faucet**: https://faucet.polygon.technology/
- **Explorer**: https://amoy.polygonscan.com/
- **IPFS**: https://pinata.cloud/

### Contract Addresses (To be filled after deployment)
```
BlockCatsNFT: 0x...
Deployer: 0x...
Block: ...
```

---

## License

MIT License - Open source for hackathon

---

**End of Specification**

*This document serves as the single source of truth for the BlockCats project implementation during the hackathon.*
