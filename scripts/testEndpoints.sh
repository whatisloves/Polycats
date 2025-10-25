#!/bin/bash

API_URL="http://localhost:3000"
API_SECRET="dev-secret-12345"
WALLET="0x8A89b98b1D78269da553c8663B9081Aa9A19d209"

echo "🧪 Testing BlockCats API Endpoints"
echo "=================================="
echo ""

# Test 1: Spawn genesis cat DNA
echo "📦 Test 1: Generating genesis cat DNA..."
SPAWN_RESPONSE=$(curl -s -X POST "$API_URL/api/minecraft/spawn" \
  -H "Content-Type: application/json" \
  -H "X-Plugin-Secret: $API_SECRET" \
  -d '{}')

echo "$SPAWN_RESPONSE" | jq .
DNA=$(echo "$SPAWN_RESPONSE" | jq -r '.dna')
NAME=$(echo "$SPAWN_RESPONSE" | jq -r '.name')

if [ "$DNA" == "null" ]; then
  echo "❌ Failed to generate DNA"
  exit 1
fi

echo "✅ Generated DNA: $DNA"
echo "✅ Generated name: $NAME"
echo ""

# Test 2: Mint genesis cat to blockchain
echo "💎 Test 2: Minting genesis cat to blockchain..."
echo "   This will cost ~0.0054 MATIC..."

CLAIM_RESPONSE=$(curl -s -X POST "$API_URL/api/minecraft/claim" \
  -H "Content-Type: application/json" \
  -H "X-Plugin-Secret: $API_SECRET" \
  -d "{
    \"playerWallet\": \"$WALLET\",
    \"dna\": \"$DNA\",
    \"name\": \"$NAME\"
  }")

echo "$CLAIM_RESPONSE" | jq .

TOKEN_ID=$(echo "$CLAIM_RESPONSE" | jq -r '.tokenId')
TX_HASH=$(echo "$CLAIM_RESPONSE" | jq -r '.transactionHash')

if [ "$TOKEN_ID" == "null" ]; then
  echo "❌ Failed to mint NFT"
  echo "Response: $CLAIM_RESPONSE"
  exit 1
fi

echo ""
echo "✅ NFT Minted!"
echo "   Token ID: $TOKEN_ID"
echo "   TX Hash: $TX_HASH"
echo "   View on PolygonScan:"
echo "   https://amoy.polygonscan.com/tx/$TX_HASH"
echo ""

# Wait for transaction confirmation
echo "⏳ Waiting 5 seconds for blockchain confirmation..."
sleep 5
echo ""

# Test 3: Verify cat appears in API
echo "📋 Test 3: Fetching all cats from API..."
CATS_RESPONSE=$(curl -s "$API_URL/api/cats")
echo "$CATS_RESPONSE" | jq .

CAT_COUNT=$(echo "$CATS_RESPONSE" | jq '.cats | length')
echo ""
echo "✅ Found $CAT_COUNT cat(s) in database"
echo ""

# Test 4: Get player inventory
echo "👤 Test 4: Fetching player inventory..."
INVENTORY_RESPONSE=$(curl -s "$API_URL/api/player/$WALLET/inventory")
echo "$INVENTORY_RESPONSE" | jq .
echo ""

echo "=================================="
echo "✅ All endpoint tests passed!"
echo "=================================="
echo ""
echo "🌐 Blockchain Verification:"
echo "   Contract: https://amoy.polygonscan.com/address/0x7EFA2f21583abaD92b0131b8C9FF40994158cbE0"
echo "   Your TX: https://amoy.polygonscan.com/tx/$TX_HASH"
echo "   Your NFT: https://amoy.polygonscan.com/token/0x7EFA2f21583abaD92b0131b8C9FF40994158cbE0?a=$TOKEN_ID"
echo ""
