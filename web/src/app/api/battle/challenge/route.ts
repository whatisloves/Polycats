import { NextResponse } from 'next/server';
import {
  createBattle,
  getCat,
  getActiveCat,
  canCatBattle,
} from '@/lib/storage';

const API_SECRET = process.env.API_SECRET || 'dev-secret-12345';

interface ChallengeRequest {
  challenger: string;      // wallet address
  challenged: string;      // wallet address
  challengerCatId: number; // tokenId
  challengedCatId: number; // tokenId
}

export async function POST(request: Request) {
  // Verify API secret
  const secret = request.headers.get('X-Plugin-Secret');
  if (secret !== API_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body: ChallengeRequest = await request.json();

  // Validate both cats exist
  const cat1 = getCat(body.challengerCatId);
  const cat2 = getCat(body.challengedCatId);

  if (!cat1 || !cat2) {
    return NextResponse.json({
      success: false,
      error: 'One or both cats do not exist',
    });
  }

  // Verify ownership
  if (cat1.owner.toLowerCase() !== body.challenger.toLowerCase()) {
    return NextResponse.json({
      success: false,
      error: 'Challenger does not own the cat',
    });
  }

  if (cat2.owner.toLowerCase() !== body.challenged.toLowerCase()) {
    return NextResponse.json({
      success: false,
      error: 'Challenged player does not own the cat',
    });
  }

  // Check cooldowns
  if (!canCatBattle(body.challengerCatId)) {
    return NextResponse.json({
      success: false,
      error: 'Your cat is on cooldown',
    });
  }

  if (!canCatBattle(body.challengedCatId)) {
    return NextResponse.json({
      success: false,
      error: 'Opponent cat is on cooldown',
    });
  }

  // Create battle
  const battle = createBattle({
    challenger: body.challenger.toLowerCase(),
    challenged: body.challenged.toLowerCase(),
    challengerCatId: body.challengerCatId,
    challengedCatId: body.challengedCatId,
    state: 'PENDING',
  });

  // Return battle info
  return NextResponse.json({
    success: true,
    battleId: battle.battleId,
    challengerCat: {
      tokenId: cat1.tokenId,
      name: cat1.name,
      stats: cat1.stats,
      rarityScore: cat1.rarityScore,
    },
    challengedCat: {
      tokenId: cat2.tokenId,
      name: cat2.name,
      stats: cat2.stats,
      rarityScore: cat2.rarityScore,
    },
    expiresAt: new Date(battle.startTime + 30000).toISOString(), // 30 sec
  });
}
