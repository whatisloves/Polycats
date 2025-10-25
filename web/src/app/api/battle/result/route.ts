import { NextResponse } from 'next/server';
import {
  getBattle,
  updateBattle,
  getCat,
  getCatsByOwner,
  addCat,
  deleteCat,
  updateCatCooldown,
  getNextTokenId,
} from '@/lib/storage';
import { breedCats, calculateRarityScore } from '@/lib/breeding';
import { generateKyrgyzName } from '@/lib/nameGenerator';

const API_SECRET = process.env.API_SECRET || 'dev-secret-12345';

interface ResultRequest {
  battleId: string;
  winner: string;    // wallet address (null for timeout)
  loser: string;     // wallet address (null for timeout)
  reason: 'death' | 'quit' | 'timeout';
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

  const body: ResultRequest = await request.json();

  // Get battle
  const battle = getBattle(body.battleId);

  if (!battle) {
    return NextResponse.json({
      success: false,
      error: 'Battle not found',
    });
  }

  // Verify battle is in progress
  if (battle.state !== 'IN_PROGRESS') {
    return NextResponse.json({
      success: false,
      error: `Battle is ${battle.state.toLowerCase()}`,
    });
  }

  // Handle timeout (draw - no breeding)
  if (body.reason === 'timeout') {
    updateBattle(body.battleId, {
      state: 'COMPLETED',
      endTime: Date.now(),
      reason: 'timeout',
    });

    return NextResponse.json({
      success: true,
      result: 'draw',
      message: 'Battle timed out - no winner',
    });
  }

  // Validate winner/loser
  if (!body.winner || !body.loser) {
    return NextResponse.json({
      success: false,
      error: 'Winner and loser required for non-timeout result',
    });
  }

  // Get parent cats
  const parent1 = getCat(battle.challengerCatId);
  const parent2 = getCat(battle.challengedCatId);

  if (!parent1 || !parent2) {
    return NextResponse.json({
      success: false,
      error: 'Parent cats not found',
    });
  }

  // Determine winner/loser cats
  const winnerWallet = body.winner.toLowerCase();
  const loserWallet = body.loser.toLowerCase();

  const loserCatId =
    battle.challenger.toLowerCase() === loserWallet
      ? battle.challengerCatId
      : battle.challengedCatId;

  // ===== BREED NEW CAT =====

  // Calculate child stats using breeding algorithm
  const childStats = breedCats(parent1, parent2);
  const childGeneration = Math.max(parent1.generation, parent2.generation) + 1;
  const childRarityScore = calculateRarityScore(childStats);

  // ===== CHECK WINNER'S INVENTORY (5 CAT LIMIT) =====

  const winnerCats = getCatsByOwner(winnerWallet);
  let deletedCatId: number | null = null;

  if (winnerCats.length >= 5) {
    // Find weakest cat and auto-delete
    const sortedCats = [...winnerCats].sort(
      (a, b) => a.rarityScore - b.rarityScore
    );
    const weakestCat = sortedCats[0];

    deletedCatId = weakestCat.tokenId;
    deleteCat(weakestCat.tokenId);

    console.log(
      `Auto-deleted weakest cat: ${weakestCat.name} (score ${weakestCat.rarityScore})`
    );
  }

  // ===== CREATE CHILD CAT =====

  const nextTokenId = getNextTokenId();
  const childName = generateKyrgyzName(childRarityScore, nextTokenId);

  // Generate placeholder DNA string
  const childDNA = `${Math.floor(Math.random() * 11)},${Math.floor(Math.random() * 16)},${childStats.speed},${childStats.luck},${childStats.strength},${childStats.regen},${childStats.defense}`;

  const childCat = addCat({
    owner: winnerWallet,
    name: childName,
    dna: childDNA,
    stats: childStats,
    generation: childGeneration,
    isGenesis: false,
    parent1Id: parent1.tokenId,
    parent2Id: parent2.tokenId,
    rarityScore: childRarityScore,
    cooldownUntil: 0,
    textureUrl: `https://api.dicebear.com/7.x/lorelei/png?seed=${nextTokenId}`,
  });

  // ===== SET LOSER'S CAT ON COOLDOWN (24 HOURS) =====

  const cooldownDuration = 24 * 60 * 60 * 1000; // 24 hours in ms
  const cooldownUntil = Date.now() + cooldownDuration;
  updateCatCooldown(loserCatId, cooldownUntil);

  // ===== UPDATE BATTLE STATUS =====

  updateBattle(body.battleId, {
    state: 'COMPLETED',
    endTime: Date.now(),
    winner: winnerWallet,
    loser: loserWallet,
    reason: body.reason,
    childTokenId: childCat.tokenId,
    deletedCatId,
  });

  // ===== RETURN RESULT =====

  return NextResponse.json({
    success: true,
    result: 'win',
    childTokenId: childCat.tokenId,
    childName: childCat.name,
    childStats: childCat.stats,
    childGeneration: childCat.generation,
    childRarityScore: childCat.rarityScore,
    deletedCatId,
    deletedCatName: deletedCatId
      ? winnerCats.find((c) => c.tokenId === deletedCatId)?.name
      : null,
    loserCatId,
    cooldownUntil: new Date(cooldownUntil).toISOString(),
    message: `${childName} was born! ${
      deletedCatId ? '(Weakest cat auto-deleted)' : ''
    }`,
  });
}
