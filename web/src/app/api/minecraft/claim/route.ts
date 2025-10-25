import { NextRequest, NextResponse } from 'next/server';
import { addCat, getNextTokenId } from '@/lib/storage';
import { generateRandomStats, calculateRarityScore } from '@/lib/breeding';
import { generateKyrgyzName } from '@/lib/nameGenerator';

const API_SECRET = process.env.API_SECRET || 'dev-secret-12345';

export async function POST(request: NextRequest) {
  try {
    // Check for the plugin secret header
    const secret = request.headers.get('X-Plugin-Secret');

    if (secret !== API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { wallet, catUuid, dna: dnaString } = body;

    if (!wallet || !catUuid) {
      return NextResponse.json({ error: 'Missing wallet or catUuid' }, { status: 400 });
    }

    // Parse DNA string (format: "variant,collarColor,speed,luck,strength,regen,defense")
    const dnaParts = dnaString.split(',').map((s: string) => parseInt(s));
    const [variant, collarColor, speed, luck, strength, regen, defense] = dnaParts;

    const stats = { speed, strength, defense, regen, luck };
    const rarityScore = calculateRarityScore(stats);

    // Generate name
    const nextTokenId = getNextTokenId();
    const catName = generateKyrgyzName(rarityScore, nextTokenId);

    // Add cat to storage (MOCK - in-memory only)
    const cat = addCat({
      owner: wallet.toLowerCase(),
      name: catName,
      dna: dnaString,
      stats,
      generation: 0, // Genesis cats
      isGenesis: true,
      parent1Id: null,
      parent2Id: null,
      rarityScore,
      cooldownUntil: 0,
      textureUrl: `https://api.dicebear.com/7.x/lorelei/png?seed=${nextTokenId}`,
    });

    const response = {
      success: true,
      tokenId: cat.tokenId,
      transactionHash: `0xmock${Date.now().toString(16)}`, // Mock TX hash
      catName: cat.name,
      stats: cat.stats,
      rarityScore: cat.rarityScore,
      error: null
    };

    console.log(`✅ Cat claimed (MOCK): ${cat.name} (Token ${cat.tokenId}) for ${wallet}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Claim API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}