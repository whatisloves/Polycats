import { NextResponse } from 'next/server';
import {
  getCatsByOwner,
  getInventory,
  canCatBattle,
  getCat,
} from '@/lib/storage';

export async function GET(
  request: Request,
  context: { params: Promise<{ wallet: string }> }
) {
  const { wallet } = await context.params;
  const walletLower = wallet.toLowerCase();

  // Get player's cats
  const cats = getCatsByOwner(walletLower);
  const inventory = getInventory(walletLower);

  // Build response with cat details
  const catsWithStatus = cats.map((cat) => {
    const canBattle = canCatBattle(cat.tokenId);
    const isActive = cat.tokenId === inventory.activeCatId;

    return {
      tokenId: cat.tokenId,
      name: cat.name,
      stats: cat.stats,
      generation: cat.generation,
      rarityScore: cat.rarityScore,
      isActive,
      cooldownUntil:
        cat.cooldownUntil > 0 ? new Date(cat.cooldownUntil).toISOString() : null,
      canBattle,
      isGenesis: cat.isGenesis,
      textureUrl: cat.textureUrl,
    };
  });

  return NextResponse.json({
    cats: catsWithStatus,
    activeCatId: inventory.activeCatId,
    count: cats.length,
    maxCount: 5,
  });
}
