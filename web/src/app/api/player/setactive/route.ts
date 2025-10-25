import { NextResponse } from 'next/server';
import { getCat, setActiveCat, getInventory } from '@/lib/storage';

const API_SECRET = process.env.API_SECRET || 'dev-secret-12345';

interface SetActiveRequest {
  playerWallet: string;
  tokenId: number;
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

  const body: SetActiveRequest = await request.json();

  // Get cat
  const cat = getCat(body.tokenId);

  if (!cat) {
    return NextResponse.json({
      success: false,
      error: 'Cat not found',
    });
  }

  // Verify ownership
  if (cat.owner.toLowerCase() !== body.playerWallet.toLowerCase()) {
    return NextResponse.json({
      success: false,
      error: 'Not your cat',
    });
  }

  // Get previous active cat ID
  const inventory = getInventory(body.playerWallet);
  const previousActiveCatId = inventory.activeCatId;

  // Set as active
  const success = setActiveCat(body.playerWallet, body.tokenId);

  if (!success) {
    return NextResponse.json({
      success: false,
      error: 'Failed to set active cat',
    });
  }

  return NextResponse.json({
    success: true,
    previousActiveCatId,
    newActiveCat: {
      tokenId: cat.tokenId,
      name: cat.name,
      stats: cat.stats,
      rarityScore: cat.rarityScore,
    },
  });
}
