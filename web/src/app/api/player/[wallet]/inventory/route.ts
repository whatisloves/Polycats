import { NextResponse } from 'next/server';
import {
  getCatsByOwner,
  getInventory,
  canCatBattle,
  getCat,
} from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: { wallet: string } }
) {
  const wallet = params.wallet.toLowerCase();

  // Get player's cats
  const cats = getCatsByOwner(wallet);
  const inventory = getInventory(wallet);

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
