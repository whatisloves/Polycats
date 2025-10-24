import { NextRequest, NextResponse } from 'next/server';

// Mock state for player claims and minted cats
const mockClaims = {
  playerClaims: new Map<string, number>(), // wallet -> claims today
  lastResetDate: new Date().toISOString().split('T')[0],
  nextTokenId: 1,
  mintedCats: [] as Array<{
    tokenId: number;
    owner: string;
    catUuid: string;
    mintedAt: string;
    transactionHash: string;
  }>,
  MAX_CLAIMS_PER_PLAYER: 1,
};

function resetIfNewDay() {
  const today = new Date().toISOString().split('T')[0];
  if (mockClaims.lastResetDate !== today) {
    mockClaims.playerClaims.clear();
    mockClaims.lastResetDate = today;
  }
}

function generateFakeTxHash(): string {
  return '0x' + Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

export async function POST(request: NextRequest) {
  // Check API secret
  const secret = request.headers.get('X-Plugin-Secret');
  if (secret !== 'dev-secret-12345') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { wallet, catUuid } = body;

  if (!wallet || !catUuid) {
    return NextResponse.json(
      { success: false, error: 'Missing wallet or catUuid' },
      { status: 400 }
    );
  }

  // Reset if new day
  resetIfNewDay();

  // Check player daily limit
  const playerClaims = mockClaims.playerClaims.get(wallet) || 0;
  if (playerClaims >= mockClaims.MAX_CLAIMS_PER_PLAYER) {
    return NextResponse.json({
      success: false,
      error: 'You already claimed your daily BlockCat!',
    });
  }

  // "Mint" the NFT (mock)
  const tokenId = mockClaims.nextTokenId++;
  const transactionHash = generateFakeTxHash();

  mockClaims.mintedCats.push({
    tokenId,
    owner: wallet,
    catUuid,
    mintedAt: new Date().toISOString(),
    transactionHash,
  });

  // Increment player claims
  mockClaims.playerClaims.set(wallet, playerClaims + 1);

  console.log(`[CLAIM] Player ${wallet} claimed BlockCat #${tokenId}`);
  console.log(`[CLAIM] TX Hash: ${transactionHash}`);

  return NextResponse.json({
    success: true,
    tokenId,
    transactionHash,
  });
}
