import { NextResponse } from 'next/server';
import { getCat, deleteCat, getInventory } from '@/lib/storage';

const API_SECRET = process.env.API_SECRET || 'dev-secret-12345';

interface DeleteRequest {
  ownerWallet: string;
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ tokenId: string }> }
) {
  const { tokenId } = await context.params;
  // Verify API secret
  const secret = request.headers.get('X-Plugin-Secret');
  if (secret !== API_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const tokenIdNum = parseInt(tokenId);
  const body: DeleteRequest = await request.json();

  // Get cat
  const cat = getCat(tokenIdNum);

  if (!cat) {
    return NextResponse.json({
      success: false,
      error: 'Cat not found',
    });
  }

  // Verify ownership
  if (cat.owner.toLowerCase() !== body.ownerWallet.toLowerCase()) {
    return NextResponse.json({
      success: false,
      error: 'Not your cat',
    });
  }

  // Check not active cat
  const inventory = getInventory(body.ownerWallet);
  if (inventory.activeCatId === tokenIdNum) {
    return NextResponse.json({
      success: false,
      error: 'Cannot delete active cat. Switch to another cat first.',
    });
  }

  // Delete cat
  const success = deleteCat(tokenIdNum);

  if (!success) {
    return NextResponse.json({
      success: false,
      error: 'Failed to delete cat',
    });
  }

  return NextResponse.json({
    success: true,
    deletedTokenId: tokenIdNum,
    deletedCatName: cat.name,
    message: `${cat.name} has been deleted`,
  });
}
